const ReadingList = require('../models/ReadingList');

// @desc    Add book to reading list or update if exists
// @route   POST /api/lists/add
// @access  Private
const addToReaderList = async (req, res) => {
    try {
        const { googleBookId, status } = req.body;

        if (!['TO_READ', 'READING', 'COMPLETED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        let listItem = await ReadingList.findOne({ userId: req.user._id, googleBookId });

        if (listItem) {
            listItem.status = status;
            listItem.updatedAt = Date.now();
            if (status === 'READING' && !listItem.startedAt) listItem.startedAt = Date.now();
            if (status === 'COMPLETED') listItem.completedAt = Date.now();

            await listItem.save();
            return res.json(listItem);
        }

        listItem = await ReadingList.create({
            userId: req.user._id,
            googleBookId,
            status,
            startedAt: status === 'READING' ? Date.now() : null,
            completedAt: status === 'COMPLETED' ? Date.now() : null
        });

        res.status(201).json(listItem);
    } catch (error) {
        console.error('ADD TO LIST ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Update reading status
// @route   PUT /api/lists/update-status
// @access  Private
const updateStatus = async (req, res) => {
    try {
        const { googleBookId, status, progressPercent } = req.body;

        if (!['TO_READ', 'READING', 'COMPLETED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const listItem = await ReadingList.findOne({ userId: req.user._id, googleBookId });

        if (!listItem) {
            return res.status(404).json({ message: 'Book not in your list' });
        }

        listItem.status = status;
        if (progressPercent !== undefined) listItem.progressPercent = progressPercent;
        listItem.updatedAt = Date.now();

        if (status === 'READING' && !listItem.startedAt) listItem.startedAt = Date.now();
        if (status === 'COMPLETED' && !listItem.completedAt) listItem.completedAt = Date.now();

        await listItem.save();
        res.json(listItem);
    } catch (error) {
        console.error('UPDATE STATUS ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Get my reading lists
// @route   GET /api/lists/my
// @access  Private
const getMyLists = async (req, res) => {
    try {
        const lists = await ReadingList.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        const BookMaster = require('../models/BookMaster');

        const enrichedLists = await Promise.all(lists.map(async (item) => {
            const itemObj = item.toObject();
            const book = await BookMaster.findOne({ googleBookId: item.googleBookId });
            if (book) {
                itemObj.bookTitle = book.title;
                itemObj.bookCover = book.coverImage;
            }
            return itemObj;
        }));

        res.json(enrichedLists);
    } catch (error) {
        console.error('GET MY LISTS ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Remove from list
// @route   DELETE /api/lists/remove/:googleBookId
// @access  Private
const removeFromList = async (req, res) => {
    try {
        const item = await ReadingList.findOneAndDelete({
            userId: req.user._id,
            googleBookId: req.params.googleBookId
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found in list' });
        }

        res.json({ message: 'Removed from reading list' });
    } catch (error) {
        console.error('REMOVE FROM LIST ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

module.exports = {
    addToReaderList,
    updateStatus,
    getMyLists,
    removeFromList
};
