const express = require('express');
const router = express.Router();
const {
    getBookById,
    addToFavorites,
    removeFromFavorites,
    getFavorites
} = require('../controllers/bookController');
const { protect } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/favorites', protect, addToFavorites);
router.delete('/favorites/:googleBookId', protect, removeFromFavorites);
router.get('/favorites', protect, getFavorites);

// Public route (Must be last to avoid conflict with 'favorites' if it was parameterized, though here it's static)
router.get('/:id', getBookById);

module.exports = router;
