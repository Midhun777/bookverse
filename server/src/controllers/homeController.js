const Review = require('../models/Review');
const Activity = require('../models/Activity');
const AdminSettings = require('../models/AdminSettings');
const BookMaster = require('../models/BookMaster');

/**
 * Standardize book object for Home API (Local BookMaster version)
 */
const formatBook = (book, internalStats = null) => {
    if (!book) return null;

    return {
        googleBookId: book.googleBookId,
        title: book.title,
        authors: book.authors || ['Unknown Author'],
        thumbnail: book.coverImage || 'https://via.placeholder.com/128x192?text=No+Cover',
        categories: book.subjects ? book.subjects.slice(0, 5) : [],
        averageRating: book.averageRating || (book.popularityScore / 20),
        ratingsCount: book.ratingsCount || 0,
        popularityScore: book.popularityScore,
        isTrending: book.isTrending,
        internalReviewsCount: internalStats ? internalStats.count : 0,
        description: book.description || ''
    };
};

const getHomeBooks = async (req, res) => {
    try {
        // 1. Aggregation: Find IDs for Trending, Top Rated, and Recent Activity

        // Trending: Top 10 by View/Search activity (only considering those that exist in BookMaster)
        const trendingIds = await Activity.aggregate([
            { $match: { actionType: { $in: ['VIEW', 'SEARCH'] } } },
            { $group: { _id: '$googleBookId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]);

        // Top Rated: Internal average >= 4.0
        const topRatedStats = await Review.aggregate([
            { $group: { _id: '$googleBookId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
            { $match: { average: { $gte: 4.0 } } },
            { $sort: { average: -1, count: -1 } },
            { $limit: 10 }
        ]);

        // Recently Reviewed
        const recentlyReviewedResults = await Review.find()
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);

        const uniqueRecentIds = [...new Set(recentlyReviewedResults.map(r => r.googleBookId))].slice(0, 6);

        // 2. Data Fetching: Retrieve metadata from BookMaster
        const allTargetIds = [
            ...trendingIds.map(t => t._id),
            ...topRatedStats.map(tr => tr._id),
            ...uniqueRecentIds
        ].filter(id => id);

        const booksFromMaster = await BookMaster.find({
            googleBookId: { $in: [...new Set(allTargetIds)] }
        });

        // Create a map for quick metadata lookup
        const masterMap = {};
        booksFromMaster.forEach(b => masterMap[b.googleBookId] = b);

        // Internal reviews map
        const internalStatsMap = {};
        const allInternalStats = await Review.aggregate([
            { $group: { _id: '$googleBookId', average: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        allInternalStats.forEach(s => internalStatsMap[s._id] = { average: s.average.toFixed(1), count: s.count });

        // 3. Section Building

        // Trending Books (Sorted by activity, filtered by existence in Master)
        const trending = trendingIds
            .map(t => formatBook(masterMap[t._id], internalStatsMap[t._id]))
            .filter(b => b)
            .slice(0, 10);

        // If trending is empty (e.g., first run or legacy IDs), fall back to isTrending flag
        if (trending.length < 4) {
            const fallbackTrending = await BookMaster.find({ isTrending: true }).limit(8);
            fallbackTrending.forEach(b => {
                if (!trending.find(ex => ex.googleBookId === b.googleBookId)) {
                    trending.push(formatBook(b, internalStatsMap[b.googleBookId]));
                }
            });
        }

        // Top Rated
        const topRated = topRatedStats
            .map(tr => formatBook(masterMap[tr._id], internalStatsMap[tr._id]))
            .filter(b => b);

        // Recently Reviewed (with reviewer info)
        const recentlyReviewed = uniqueRecentIds
            .map(id => {
                const book = formatBook(masterMap[id], internalStatsMap[id]);
                if (book) {
                    const review = recentlyReviewedResults.find(r => r.googleBookId === id);
                    book.latestReview = {
                        text: review.reviewText,
                        user: review.userId?.name || 'Anonymous',
                        userAvatar: review.userId?.avatar,
                        rating: review.rating
                    };
                }
                return book;
            })
            .filter(b => b);

        // 4. "Featured Classics" (Replacing Free to Read OpenLibrary Search)
        const freeToRead = await BookMaster.find({
            $or: [{ isClassic: true }, { isPublicDomain: true }]
        })
            .sort({ popularityScore: -1 })
            .limit(10)
            .then(books => books.map(b => formatBook(b, internalStatsMap[b.googleBookId])));

        // 5. Admin Settings
        let settings = await AdminSettings.findOne();
        if (!settings) {
            settings = await AdminSettings.create({});
        }

        res.json({
            trending: trending.slice(0, 10),
            topRated,
            recentlyReviewed,
            freeToRead,
            settings
        });

    } catch (error) {
        console.error('Home API Error:', error.message);
        res.status(500).json({ message: 'Error aggregating home content' });
    }
};

module.exports = {
    getHomeBooks
};
