const ReadingProgress = require('../models/ReadingProgress');

// @desc    Update reading progress for a book
// @route   POST /api/progress/update
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const { googleBookId, currentPage, totalPages } = req.body;

        let progress = await ReadingProgress.findOne({ userId: req.user._id, googleBookId });

        if (progress) {
            progress.currentPage = currentPage;
            if (totalPages) progress.totalPages = totalPages;
            progress.lastReadAt = Date.now();
            await progress.save();
        } else {
            progress = await ReadingProgress.create({
                userId: req.user._id,
                googleBookId,
                currentPage,
                totalPages: totalPages || 1,
                lastReadAt: Date.now()
            });
        }

        res.json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reading progress for a book
// @route   GET /api/progress/:googleBookId
// @access  Private
const getProgress = async (req, res) => {
    try {
        const progress = await ReadingProgress.findOne({
            userId: req.user._id,
            googleBookId: req.params.googleBookId
        });

        if (!progress) {
            return res.status(404).json({ message: 'No progress found' });
        }

        res.json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    updateProgress,
    getProgress
};
