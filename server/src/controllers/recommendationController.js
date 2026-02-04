const Activity = require('../models/Activity');
const BookMaster = require('../models/BookMaster');
const AdminSettings = require('../models/AdminSettings');
const { getRecommendations, getGlobalRecommendations } = require('./recommendationService');

// @desc    Get Discover Hub (Global Trending & Categories)
// @route   GET /api/recommendations/discover
// @access  Public
const getDiscoverFeed = async (req, res) => {
    try {
        // 1. Top Categories from BookMaster (aggregated)
        const aggregatedCategories = await BookMaster.aggregate([
            { $unwind: "$subjects" },
            {
                $group: {
                    _id: "$subjects",
                    count: { $sum: 1 },
                    avgPopularity: { $avg: "$popularityScore" },
                    trendingCount: { $sum: { $cond: ["$isTrending", 1, 0] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 12 }
        ]);

        // 1.5 Fetch Admin Settings
        let settings = await AdminSettings.findOne();
        if (!settings) settings = await AdminSettings.create({});

        // Use featuredCategories from settings if they exist, otherwise use aggregated
        const finalCategories = settings.featuredCategories?.length > 0
            ? settings.featuredCategories.map(name => ({ name }))
            : aggregatedCategories.map(c => ({
                name: c._id,
                count: c.count,
                avgPopularity: c.avgPopularity,
                trendingCount: c.trendingCount
            }));

        // 2. Global Sections
        const popularBooks = await BookMaster.find().sort({ popularityScore: -1 }).limit(15);
        const classics = await BookMaster.find({ isClassic: true }).limit(15);
        const trending = await BookMaster.find({ isTrending: true }).limit(15);

        // Dynamic: Fresh Discoveries (Random selection from the whole library)
        const freshDiscoveries = await BookMaster.aggregate([
            { $sample: { size: 15 } }
        ]);

        // Category Spotlights
        const techSpotlight = await BookMaster.find({ subjects: { $in: ["TECHNOLOGY"] } }).limit(10);
        const selfHelpSpotlight = await BookMaster.find({ subjects: { $in: ["SELF_HELP", "Self-Help"] } }).limit(10);

        const hub = [
            {
                title: "Trending Now",
                description: "What readers are picking up right now",
                books: trending,
                type: 'GLOBAL'
            },
            {
                title: "Fresh Discoveries",
                description: "Randomly selected gems for you to explore",
                books: freshDiscoveries,
                type: 'DYNAMIC'
            },
            {
                title: "Tech Titans",
                description: "Master the world of technology",
                books: techSpotlight,
                type: 'SPOTLIGHT'
            },
            {
                title: "Most Loved Worldwide",
                description: "Top rated books by the community",
                books: popularBooks,
                type: 'GLOBAL'
            },
            {
                title: "Self-Improvement Essentials",
                description: "Optimize your life and mindset",
                books: selfHelpSpotlight,
                type: 'SPOTLIGHT'
            },
            {
                title: "Timeless Classics",
                description: "Masterpieces you must read once",
                books: classics,
                type: 'GLOBAL'
            }
        ];

        res.json({
            categories: finalCategories,
            feed: hub,
            featured: trending[0], // Spotlight the top trending book
            settings
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
        const personalSections = await getRecommendations(userId);

        // Fetch Global Sections for everyone
        const popularBooks = await BookMaster.find().sort({ popularityScore: -1 }).limit(6);
        const classics = await BookMaster.find({ isClassic: true }).limit(6);
        const trending = await BookMaster.find({ isTrending: true }).limit(6);

        const globalSections = [
            {
                title: "Most Loved Worldwide",
                description: "Top rated books by the community",
                books: popularBooks.map(b => ({
                    ...b.toObject(),
                    reasons: ["Highly rated worldwide"]
                })),
                type: 'GLOBAL'
            },
            {
                title: "Trending Now",
                description: "What readers are picking up right now",
                books: trending.map(b => ({
                    ...b.toObject(),
                    reasons: ["Trending on Bookverse"]
                })),
                type: 'GLOBAL'
            },
            {
                title: "Timeless Classics",
                description: "Masterpieces you must read once",
                books: classics.map(b => ({
                    ...b.toObject(),
                    reasons: ["Must-read classic"]
                })),
                type: 'GLOBAL'
            }
        ];

        // Combine: Personal sections first (if any), then global sections
        const feed = [...personalSections, ...globalSections];

        res.json({ feed });
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
