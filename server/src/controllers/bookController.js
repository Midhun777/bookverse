const Favorite = require('../models/Favorite');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');

// @desc    Get book details by ID (from local DB)
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        // Search by googleBookId (which now stores Google ID or OL ID)
        const book = await BookMaster.findOne({ googleBookId: id });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a book to favorites
// @route   POST /api/books/favorites
// @access  Private
const addToFavorites = async (req, res) => {
    try {
        const { googleBookId, title, authors, thumbnail, categories, rating } = req.body;
        console.log(`[FAVORITE] Adding book: ${googleBookId} for user: ${req.user._id}`);

        const existingBook = await Favorite.findOne({ userId: req.user._id, googleBookId });

        if (existingBook) {
            return res.status(400).json({ message: 'Book already in favorites' });
        }

        const favorite = await Favorite.create({
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

        res.status(201).json(favorite);
    } catch (error) {
        console.error(`[FAVORITE ERROR] Add failed:`, error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a book from favorites
// @route   DELETE /api/books/favorites/:googleBookId
// @access  Private
const removeFromFavorites = async (req, res) => {
    try {
        console.log(`[FAVORITE] Removing book: ${req.params.googleBookId} for user: ${req.user._id}`);
        const book = await Favorite.findOneAndDelete({
            userId: req.user._id,
            googleBookId: req.params.googleBookId
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found in favorites' });
        }

        res.json({ message: 'Book removed from favorites' });
    } catch (error) {
        console.error(`[FAVORITE ERROR] Remove failed:`, error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all favorite books
// @route   GET /api/books/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const books = await Favorite.find({ userId: req.user._id }).sort({ savedAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBookById,
    addToFavorites,
    removeFromFavorites,
    getFavorites
};
