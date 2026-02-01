const Activity = require('../models/Activity');
const BookMaster = require('../models/BookMaster');
const { getRecommendations, getGlobalRecommendations } = require('./recommendationService');

// @desc    Get Discover Hub (Global Trending & Categories)
// @route   GET /api/recommendations/discover
// @access  Public
const getDiscoverFeed = async (req, res) => {
    try {
        // 1. Top Categories from BookMaster (aggregated)
        const categories = await BookMaster.aggregate([
            { $unwind: "$subjects" },
            { $group: { _id: "$subjects", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 12 }
        ]);

        // 2. Global Sections
        const popularBooks = await BookMaster.find().sort({ popularityScore: -1 }).limit(10);
        const classics = await BookMaster.find({ isClassic: true }).limit(10);
        const trending = await BookMaster.find({ isTrending: true }).limit(10);

        const hub = [
            {
                title: "Most Loved Worldwide",
                description: "Top rated books by the community",
                books: popularBooks,
                type: 'GLOBAL'
            },
            {
                title: "Trending Now",
                description: "What readers are picking up right now",
                books: trending,
                type: 'GLOBAL'
            },
            {
                title: "Timeless Classics",
                description: "Masterpieces you must read once",
                books: classics,
                type: 'GLOBAL'
            }
        ];

        res.json({
            categories: categories.map(c => ({ name: c._id, count: c.count })),
            feed: hub
        });

    } catch (error) {
        console.error('Discover Hub Error:', error);
        res.status(500).json({ message: 'Server error generating hub' });
    }
};

// @desc    Get Personal Recommendation Feed
// @route   GET /api/recommendations/my
// @access  Private
const getMyRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const personalRecs = await getRecommendations(userId);

        const sections = [];

        if (personalRecs.length > 0) {
            sections.push({
                title: "Picks for You",
                description: "Tailored to your unique reading profile",
                books: personalRecs.slice(0, 10),
                type: 'PERSONAL'
            });

            // Based on saves
            const savedActivity = await Activity.findOne({ userId, actionType: 'SAVE' });
            if (savedActivity && personalRecs.length > 10) {
                sections.push({
                    title: "Because You Saved...",
                    description: "More like the books in your collection",
                    books: personalRecs.slice(10, 20),
                    type: 'PERSONAL'
                });
            }
        }

        res.json({ feed: sections });
    } catch (error) {
        console.error('Personal Recs Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get global trending/popular
// @route   GET /api/recommendations/global
// @access  Public
const getGlobalRecommendationsController = async (req, res) => {
    try {
        const global = await getGlobalRecommendations();
        res.json(global);
    } catch (error) {
        console.error('Global Recs Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDiscoverFeed,
    getMyRecommendations,
    getGlobalRecommendations: getGlobalRecommendationsController
};
