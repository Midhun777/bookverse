const express = require('express');
const router = express.Router();
const {
    getBookById,
    saveBook,
    unsaveBook,
    getSavedBooks
} = require('../controllers/bookController');
const { protect } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/save', protect, saveBook);
router.delete('/unsave/:googleBookId', protect, unsaveBook);
router.get('/saved', protect, getSavedBooks);

// Public route (Must be last to avoid conflict with 'saved')
router.get('/:id', getBookById);

module.exports = router;
