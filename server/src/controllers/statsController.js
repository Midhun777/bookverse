const ReadingStats = require('../models/ReadingStats');
const User = require('../models/User');
const ReadingList = require('../models/ReadingList');

// @desc    Update reading session time
// @route   POST /api/stats/session
// @access  Private
const updateReadingSession = async (req, res) => {
    try {
        const { googleBookId, durationMinutes } = req.body;

        let stats = await ReadingStats.findOne({ userId: req.user._id, googleBookId });

        if (stats) {
            stats.totalReadingMinutes += durationMinutes;
            stats.sessionsCount += 1;
            stats.lastReadAt = Date.now();
            await stats.save();
        } else {
            stats = await ReadingStats.create({
                userId: req.user._id,
                googleBookId,
                totalReadingMinutes: durationMinutes,
                sessionsCount: 1,
                lastReadAt: Date.now()
            });
        }

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get public profile stats
// @route   GET /api/users/profile/:username
// @access  Public
const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stats = await ReadingStats.find({ userId: user._id });
        const completedBooks = await ReadingList.find({ userId: user._id, status: 'COMPLETED' });

        const totalReadingTime = stats.reduce((acc, item) => acc + item.totalReadingMinutes, 0);
        const totalBooksRead = completedBooks.length;

        // Mock genres for now (would typically come from book details)
        const favoriteGenres = ['Fiction', 'Science', 'History'];

        res.json({
            user,
            totalReadingTime,
            totalBooksRead,
            favoriteGenres,
            completedBooks,
            timeline: completedBooks.map(b => ({ bookId: b.googleBookId, date: b.completedAt }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    updateReadingSession,
    getPublicProfile
};
