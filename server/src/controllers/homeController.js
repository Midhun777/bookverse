const Review = require('../models/Review');
const Activity = require('../models/Activity');
const axios = require('axios');
const cache = require('../utils/cache');

// Helper to fetch OpenLibrary Data
const fetchBookDetails = async (bookId) => {
    try {
        const cacheKey = `book_details_${bookId}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        let query = `key:${bookId}`;
        const response = await axios.get(`https://openlibrary.org/search.json`, {
            params: {
                q: query,
                limit: 1
            }
        });
        const data = response.data.docs ? response.data.docs[0] : null;

        if (data) {
            cache.set(cacheKey, data);
        }

        return data;

    } catch (error) {
        console.error(`Error fetching OpenLibrary details for ${bookId}:`, error.message);
        return null;
    }
};

// Standardize book object for Home API (OpenLibrary version)
const formatBook = (olData, internalStats = null) => {
    if (!olData) return null;

    // OpenLibrary fields
    const { key, title, author_name, cover_i, subject, ratings_average, ratings_count, first_publish_year } = olData;

    // Attempt to parse ratings
    const avgRating = ratings_average ? parseFloat(ratings_average) : null;
    const count = ratings_count ? parseInt(ratings_count) : 0;

    return {
        googleBookId: key, // Keeping field name for frontend compatibility
        title: title,
        authors: author_name || ['Unknown Author'],
        thumbnail: cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg` : 'https://via.placeholder.com/128x192?text=No+Cover',
        categories: subject ? subject.slice(0, 5) : [],
        averageRating: avgRating,
        ratingsCount: count,
        ratingSource: avgRating ? 'OPENLIBRARY' : 'NONE',
        internalReviewsCount: internalStats ? internalStats.count : 0,
        isFreeToRead: first_publish_year < 1928, // Rough approximation for public domain
        description: `Published in ${first_publish_year || 'Unknown'}` // OL Search doesn't return full description usually
    };
};

const getHomeBooks = async (req, res) => {
    try {
        // 1. Trending Books (Top 10 most viewed/searched)
        // Group by googleBookId (which are now OL keys in the DB)
        const trendingIds = await Activity.aggregate([
            { $match: { actionType: { $in: ['VIEW', 'SEARCH'] } } },
            { $group: { _id: '$googleBookId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 2. Top Rated Books (Internal Reviews average >= 4.0)
        const topRatedStats = await Review.aggregate([
            { $group: { _id: '$googleBookId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
            { $match: { average: { $gte: 4.0 } } },
            { $sort: { average: -1, count: -1 } },
            { $limit: 10 }
        ]);

        // 3. Recently Reviewed
        const recentlyReviewedResults = await Review.find()
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);

        const uniqueRecentIds = [...new Set(recentlyReviewedResults.map(r => r.googleBookId))].slice(0, 6);

        // Fetch details for all identified books
        const allIds = [
            ...trendingIds.map(t => t._id),
            ...topRatedStats.map(tr => tr._id),
            ...uniqueRecentIds
        ].filter(id => id); // Remove null/undefined

        const uniqueAllIds = [...new Set(allIds)];
        const detailsMap = {};

        // Parallel fetch
        // Note: OL Search API might rate limit if we spam individual ID requests.
        // Ideally we'd use a bulk fetch if possible, but OL doesn't have a simple "ids=a,b,c" search endpoint.
        // We will fetch individually for now.
        await Promise.all(uniqueAllIds.map(async (id) => {
            if (!id) return;
            const data = await fetchBookDetails(id);
            if (data) detailsMap[id] = data;
        }));

        // Internal reviews map for quick lookup
        const internalStatsMap = {};
        const allInternalStats = await Review.aggregate([
            { $group: { _id: '$googleBookId', average: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        allInternalStats.forEach(s => internalStatsMap[s._id] = { average: s.average.toFixed(1), count: s.count });

        // Build Sections
        const trending = trendingIds
            .map(t => formatBook(detailsMap[t._id], internalStatsMap[t._id]))
            .filter(b => b);

        const topRated = topRatedStats
            .map(tr => formatBook(detailsMap[tr._id], internalStatsMap[tr._id]))
            .filter(b => b);

        const recentlyReviewed = uniqueRecentIds
            .map(id => {
                const book = formatBook(detailsMap[id], internalStatsMap[id]);
                if (book) {
                    const review = recentlyReviewedResults.find(r => r.googleBookId === id);
                    book.latestReview = {
                        text: review.reviewText,
                        user: review.userId?.name,
                        rating: review.rating
                    };
                }
                return book;
            })
            .filter(b => b);

        // 4. Free to Read / Popular on OpenLibrary
        // Use a generic search for highly rated fiction
        let freeToReadData;
        const freeToReadCacheKey = 'home_free_books_fiction';
        const cachedFreeBooks = cache.get(freeToReadCacheKey);

        if (cachedFreeBooks) {
            freeToReadData = cachedFreeBooks;
        } else {
            const freeSearchResponse = await axios.get(`https://openlibrary.org/search.json`, {
                params: {
                    q: 'subject:fiction',
                    sort: 'rating',
                    limit: 10
                }
            });
            freeToReadData = freeSearchResponse.data.docs || [];
            cache.set(freeToReadCacheKey, freeToReadData, 3600 * 24); // Cache for 24h
        }

        const freeToRead = freeToReadData
            .map(item => formatBook(item, internalStatsMap[item.key]))
            .filter(b => b);

        res.json({
            trending,
            topRated,
            recentlyReviewed,
            freeToRead
        });

    } catch (error) {
        console.error('Home API Error:', error.message);
        res.status(500).json({ message: 'Error aggregating home content' });
    }
};

module.exports = {
    getHomeBooks
};
