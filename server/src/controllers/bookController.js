const SavedBook = require('../models/SavedBook');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');

// @desc    Get book details by ID (from local DB)
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        // Search by openLibraryId (which now stores Google ID or OL ID)
        const book = await BookMaster.findOne({ openLibraryId: id });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save a book
// @route   POST /api/books/save
// @access  Private
const saveBook = async (req, res) => {
    try {
        const { googleBookId, title, authors, thumbnail, categories, rating } = req.body;

        const existingBook = await SavedBook.findOne({ userId: req.user._id, googleBookId });

        if (existingBook) {
            return res.status(400).json({ message: 'Book already saved' });
        }

        const savedBook = await SavedBook.create({
            userId: req.user._id,
            googleBookId,
            title,
            authors,
            thumbnail,
            categories,
            rating
        });

        // Log 'LIKE' activity
        await Activity.create({
            userId: req.user._id,
            actionType: 'LIKE',
            googleBookId,
            keyword: title, // Use title as keyword context
            category: categories ? categories[0] : null
        });

        res.status(201).json(savedBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unsave a book
// @route   DELETE /api/books/unsave/:googleBookId
// @access  Private
const unsaveBook = async (req, res) => {
    try {
        const book = await SavedBook.findOneAndDelete({
            userId: req.user._id,
            googleBookId: req.params.googleBookId
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all saved books
// @route   GET /api/books/saved
// @access  Private
const getSavedBooks = async (req, res) => {
    try {
        const books = await SavedBook.find({ userId: req.user._id }).sort({ savedAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBookById,
    saveBook,
    unsaveBook,
    getSavedBooks
};
