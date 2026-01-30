const express = require('express');
const router = express.Router();
const {
    addReview,
    getBookReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

// Public route to get reviews for a book
router.get('/book/:googleBookId', getBookReviews);

// Protected routes
router.post('/add', protect, addReview);
router.put('/update/:reviewId', protect, updateReview);
router.delete('/delete/:reviewId', protect, deleteReview);

module.exports = router;
