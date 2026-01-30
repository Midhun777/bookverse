const Activity = require('../models/Activity');
const SavedBook = require('../models/SavedBook');
const Review = require('../models/Review');
const axios = require('axios');

// Helper to fetch OpenLibrary Data
const fetchBookData = async (bookId) => {
    try {
        // Use Search API for rich metadata (authors, covers, ratings) in one go
        // bookId expected to be "/works/OL..."
        // If not starting with /works/, assume it is (or handle /books/)
        // Actually, just search by key.
        const query = `key:${bookId}`;
        const response = await axios.get(`https://openlibrary.org/search.json`, {
            params: {
                q: query,
                limit: 1
            }
        });
        return response.data.docs ? response.data.docs[0] : null;
    } catch (error) {
        console.error(`Error fetching OpenLibrary data for ${bookId}:`, error.message);
        return null;
    }
};

// Helper to format book for Discover API
const formatBook = (olData, internalStats = null, badges = []) => {
    if (!olData) return null;

    // keys in OL Search API doc
    const { key, title, author_name, cover_i, subject, ratings_average, ratings_count } = olData;

    // Fallback logic for ratings
    let avgRating = internalStats ? internalStats.average : (ratings_average || null);
    let count = internalStats ? internalStats.count : (ratings_count || 0);

    // Normalize
    avgRating = avgRating ? parseFloat(avgRating) : null;
    count = parseInt(count);

    return {
        googleBookId: key, // Using OL Key as ID
        title: title,
        authors: author_name || ['Unknown Author'],
        thumbnail: cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg` : 'https://via.placeholder.com/128x192?text=No+Cover',
        categories: subject ? subject.slice(0, 5) : [],
        averageRating: avgRating,
        ratingsCount: count,
        ratingSource: internalStats ? 'BOOKVERSE' : (avgRating ? 'OPENLIBRARY' : 'NONE'),
        isFreeToRead: true, // OpenLibrary is generally open/lending
        badges: badges,
        description: olData.first_sentence ? olData.first_sentence[0] : 'No description available.' // Search API doesn't allow full descriptions easily
    };
};

const getDiscoverData = async (req, res) => {
    try {
        // 1. Top Categories (Aggregation based on user activity)
        const categoryStats = await Activity.aggregate([
            { $match: { category: { $ne: null } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 12 }
        ]);
        const topCategories = categoryStats.map(c => ({
            name: c._id,
            count: c.count,
            icon: 'Book' // Placeholder for frontend icon mapping
        }));

        // 2. Top Rated Books (Internal stats first)
        const topRatedInternal = await Review.aggregate([
            { $group: { _id: '$googleBookId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
            { $match: { average: { $gte: 4.2 }, count: { $gte: 1 } } },
            { $sort: { average: -1, count: -1 } },
            { $limit: 10 }
        ]);

        const topRatedDetails = await Promise.all(
            topRatedInternal.map(async (stat) => {
                const data = await fetchBookData(stat._id);
                return formatBook(data, { average: stat.average.toFixed(1), count: stat.count }, ['TOP RATED']);
            })
        );

        // 3. Must Read Books (Curated Classics)
        // Using OL Keys found
        const mustReadIds = ['/works/OL468431W', '/works/OL66554W', '/works/OL1168083W', '/works/OL3140822W', '/works/OL3335245W'];
        const mustReadDetails = await Promise.all(
            mustReadIds.map(async (id) => {
                const data = await fetchBookData(id);
                if (!data) return null;
                return formatBook(data, null, ['MUST READ', 'CLASSIC']);
            })
        );

        // 4. Trending Books (Activity in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendingStats = await Activity.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            { $group: { _id: '$googleBookId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const trendingBooks = await Promise.all(
            trendingStats.map(async (stat) => {
                const data = await fetchBookData(stat._id);
                return formatBook(data, null, ['TRENDING']);
            })
        );

        // 5. Free/Popular Books (OpenLibrary Trending)
        // Using Subject Search for 'fiction' + high rating
        const freeRes = await axios.get(`https://openlibrary.org/search.json`, {
            params: {
                q: 'subject:fiction',
                sort: 'rating',
                limit: 10
            }
        });
        const freeBooks = (freeRes.data.docs || []).map(item => formatBook(item, null, ['POPULAR']));

        res.json({
            topCategories,
            topRatedBooks: topRatedDetails.filter(b => b),
            mustReadBooks: mustReadDetails.filter(b => b),
            trendingBooks: trendingBooks.filter(b => b),
            freeBooks
        });

    } catch (error) {
        console.error('Discover API Error:', error.message);
        res.status(500).json({ message: 'Error aggregating discovery content' });
    }
};

module.exports = {
    getDiscoverData
};
