const Activity = require('../models/Activity');
const BookMaster = require('../models/BookMaster');
const { getRecommendations } = require('./recommendationService');

// @desc    Get Discover Feed (Main Personal Feed)
// @route   GET /api/recommendations/discover
// @access  Private
const getDiscoverFeed = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Personal Recommendations
        const personalRecs = await getRecommendations(userId);

        // 2. Global / Popular
        const popularBooks = await BookMaster.find().sort({ popularityScore: -1 }).limit(10);

        // 3. Classics
        const classics = await BookMaster.find({ isClassic: true }).limit(10);

        // 4. Trending
        const trending = await BookMaster.find({ isTrending: true }).limit(10);

        // 5. Short Reads (example of another section)
        const shortReads = await BookMaster.find({ pageCount: { $lt: 200, $gt: 0 } }).limit(10);

        // Determine if recommendations are actually personalized
        const isPersonalized = personalRecs.length > 0 && personalRecs[0].reasons && personalRecs[0].reasons.length > 0;

        const feed = [
            {
                title: isPersonalized ? "Recommended for You" : "Start Your Journey",
                description: isPersonalized ? "Based on your reading history" : "Top picks to get you started",
                books: personalRecs
            },
            {
                title: "Most Loved Worldwide",
                description: "Top rated books by the community",
                books: popularBooks
            },
            {
                title: "Trending Right Now",
                description: "Books everyone is talking about",
                books: trending
            },
            {
                title: "Timeless Classics",
                description: "Masterpieces you must read",
                books: classics
            },
            {
                title: "Quick Reads",
                description: "Perfect for a busy weekend",
                books: shortReads
            }
        ].filter(section => section.books.length > 0);

        res.json({ feed });

    } catch (error) {
        console.error('Discover Feed Error:', error);
        res.status(500).json({ message: 'Server error generating feed' });
    }
};

// @desc    Get top personal recommendations
// @route   GET /api/recommendations/my
// @access  Private
const getMyRecommendations = async (req, res) => {
    try {
        const recs = await getRecommendations(req.user._id);
        res.json(recs);
    } catch (error) {
        console.error('Personal Recs Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get global trending/popular
// @route   GET /api/recommendations/global
// @access  Public
const getGlobalRecommendations = async (req, res) => {
    try {
        const global = await BookMaster.find().sort({ popularityScore: -1 }).limit(20);
        res.json(global);
    } catch (error) {
        console.error('Global Recs Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDiscoverFeed,
    getMyRecommendations,
    getGlobalRecommendations
};
