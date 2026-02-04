const Activity = require('../models/Activity');
const BookMaster = require('../models/BookMaster');
const { detectGenre } = require('../utils/genreMap');

// @desc    Log a user activity
// @route   POST /api/activities/log
// @access  Private
const logActivity = async (req, res) => {
    try {
        const {
            actionType,
            keyword,
            googleBookId: gId,
            openLibraryId: oId,
            subjects: bodySubjects,
            bookTitle: bTitle,
            bookAuthor: bAuthor,
            bookCover: bCover
        } = req.body;

        const googleBookId = gId || oId;
        let subjects = bodySubjects || [];
        let bookTitle = bTitle;
        let bookAuthor = bAuthor;
        let bookCover = bCover;

        // If it's a SEARCH, try to detect genre from keyword
        if (actionType === 'SEARCH' && keyword) {
            const detectedGenre = detectGenre(keyword);
            if (detectedGenre) {
                subjects = [detectedGenre];
            }
        }

        // Try to enrich from BookMaster if metadata is missing
        if (googleBookId && (!bookTitle || !bookCover)) {
            const cleanId = googleBookId.includes('/works/') ? googleBookId.split('/works/')[1] : googleBookId;
            const book = await BookMaster.findOne({ googleBookId: cleanId });
            if (book) {
                if (!subjects.length) subjects = book.subjects || [];
                if (!bookTitle) bookTitle = book.title;
                if (!bookAuthor) bookAuthor = book.authors?.[0];
                if (!bookCover) bookCover = book.coverImage;
            }
        }

        const activity = await Activity.create({
            userId: req.user._id,
            actionType,
            keyword,
            googleBookId,
            bookTitle,
            bookAuthor,
            bookCover,
            subjects
        });

        res.status(201).json(activity);
    } catch (error) {
        console.error('Log Activity Error:', error);
        res.status(500).json({ message: 'Server error logging activity' });
    }
};

const enrichActivities = async (activities) => {
    return await Promise.all(activities.map(async (act) => {
        const actObj = act.toObject();
        if (act.googleBookId && (!actObj.bookTitle || !actObj.bookCover)) {
            const book = await BookMaster.findOne({ googleBookId: act.googleBookId });
            if (book) {
                actObj.bookTitle = actObj.bookTitle || book.title;
                actObj.bookCover = actObj.bookCover || book.coverImage;
                actObj.bookAuthor = actObj.bookAuthor || book.authors?.[0];
            }
        }
        // Fallbacks
        if (!actObj.bookTitle) actObj.bookTitle = act.keyword || 'Unknown Book';
        return actObj;
    }));
};

// @desc    Get user activity history
// @route   GET /api/activities/my
// @access  Private
const getMyActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        const enriched = await enrichActivities(activities);
        res.json(enriched);
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

        const enriched = await enrichActivities(activities);
        res.json(enriched);
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
