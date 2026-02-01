const Activity = require('../models/Activity');
const BookMaster = require('../models/BookMaster');

// @desc    Log a user activity
// @route   POST /api/activities/log
// @access  Private
const logActivity = async (req, res) => {
    try {
        const { actionType, keyword, openLibraryId } = req.body;

        let subjects = [];
        if (openLibraryId) {
            const book = await BookMaster.findOne({ openLibraryId });
            if (book) {
                subjects = book.subjects || [];
            }
        }

        const activity = await Activity.create({
            userId: req.user._id,
            actionType,
            keyword,
            openLibraryId,
            subjects
        });

        res.status(201).json(activity);
    } catch (error) {
        console.error('Log Activity Error:', error);
        res.status(500).json({ message: 'Server error logging activity' });
    }
};

// @desc    Get user activity history
// @route   GET /api/activities/my
// @access  Private
const getMyActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get global activity feed
// @route   GET /api/activities/global
// @access  Public
const getGlobalActivity = async (req, res) => {
    try {
        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('userId', 'name avatar');

        // Enrich with book details if possible (optional, but good for covers)
        // For now, rely on stored keyword as title.
        // If we need covers, we might need to query BookMaster for each googleBookId.
        // Let's do a quick map if needed, or just send raw activities.
        // Frontend LaunchPage mapped: item.bookTitle (we can use keyword).
        // Frontent LaunchPage mapped: item.user.name.
        // Frontend LaunchPage mapped: item.createdAt.
        // Frontend LaunchPage mapped: item.googleBookId.

        // Let's attach book titles/covers if missing?
        // Activity schema has 'keyword' which is usually title.

        const enrichedActivities = await Promise.all(activities.map(async (act) => {
            const actObj = act.toObject();
            if (act.googleBookId) {
                const book = await BookMaster.findOne({ openLibraryId: act.googleBookId });
                if (book) {
                    actObj.bookTitle = book.title;
                    actObj.bookCover = book.coverImage;
                } else {
                    actObj.bookTitle = act.keyword || 'Unknown Book';
                }
            }
            return actObj;
        }));

        res.json(enrichedActivities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    logActivity,
    getMyActivities,
    getGlobalActivity
};
