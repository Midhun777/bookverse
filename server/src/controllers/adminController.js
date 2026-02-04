const User = require('../models/User');
const AdminSettings = require('../models/AdminSettings');
const Favorite = require('../models/Favorite');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');
const Review = require('../models/Review');
const ReadingList = require('../models/ReadingList');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ban user
// @route   PUT /api/admin/ban/:userId
// @access  Private/Admin
const banUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/delete-user/:userId
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get App Stats & Analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAppStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const favoriteBooksCount = await Favorite.countDocuments();
        const reviewsCount = await Review.countDocuments();

        // 1. Top Keywords
        const searchActivities = await Activity.find({ actionType: 'SEARCH' });
        const keywordCounts = {};
        searchActivities.forEach(act => {
            if (act.keyword) {
                keywordCounts[act.keyword] = (keywordCounts[act.keyword] || 0) + 1;
            }
        });
        const topKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // 2. Most Reviewed Books
        const reviewStats = await Review.aggregate([
            { $group: { _id: "$googleBookId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 3. Most Liked Books
        const likeStats = await Activity.aggregate([
            { $match: { actionType: 'LIKE' } },
            { $group: { _id: "$googleBookId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Enrich with Book Titles
        // const BookMaster = require('../models/BookMaster'); // Moved to top
        const allBookIds = [...new Set([
            ...reviewStats.map(s => s._id),
            ...likeStats.map(s => s._id)
        ])];

        const books = await BookMaster.find({ googleBookId: { $in: allBookIds } }).select('googleBookId title');
        const bookMap = {};
        books.forEach(b => bookMap[b.googleBookId] = b.title);

        const enrichStats = (stats) => stats.map(s => ({
            _id: bookMap[s._id] || s._id, // Use title if found, else ID
            count: s.count
        }));

        const enrichedReviewStats = enrichStats(reviewStats);
        const enrichedLikeStats = enrichStats(likeStats);

        // 4. User Growth (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const growthStats = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 5. Categorical Distribution
        const categoryStats = await Favorite.aggregate([
            { $unwind: "$categories" },
            {
                $group: {
                    _id: { $toUpper: "$categories" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            summary: {
                users: userCount,
                favoriteBooks: favoriteBooksCount,
                reviews: reviewsCount
            },
            analytics: {
                topKeywords,
                mostReviewed: enrichedReviewStats,
                mostLiked: enrichedLikeStats,
                growth: growthStats,
                categories: categoryStats
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        let settings = await AdminSettings.findOne();

        if (!settings) {
            settings = new AdminSettings();
        }

        if (req.body.featuredCategories) settings.featuredCategories = req.body.featuredCategories;
        if (req.body.homepageBannerText) settings.homepageBannerText = req.body.homepageBannerText;

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Public (or Private)
const getSettings = async (req, res) => {
    try {
        let settings = await AdminSettings.findOne();
        if (!settings) {
            settings = await AdminSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({}).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all books from recommendation dataset
// @route   GET /api/admin/books
// @access  Private/Admin
const getAllSeedBooks = async (req, res) => {
    try {
        const books = await BookMaster.find({}).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    banUser,
    deleteUser,
    updateSettings,
    getAppStats,
    getSettings,
    getAllReviews,
    getAllSeedBooks
};
