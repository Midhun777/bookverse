const express = require('express');
const router = express.Router();
const {
    getBookById,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    searchBooks
} = require('../controllers/bookController');
const { protect } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/favorites', protect, addToFavorites);
router.delete('/favorites/:googleBookId', protect, removeFromFavorites);
router.get('/favorites', protect, getFavorites);

// Public routes
router.get('/search', searchBooks);
router.get('/:id', getBookById);

module.exports = router;
