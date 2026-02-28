const Review = require('../models/Review');
const User = require('../models/User');
const { moderateContent } = require('../utils/moderationUtils');

// @desc    Add a new review
// @route   POST /api/reviews/add
// @access  Private
const addReview = async (req, res) => {
    try {
        const { googleBookId, rating, reviewText } = req.body;

        // Check if user already reviewed this book
        const existingReview = await Review.findOne({ userId: req.user._id, googleBookId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this book' });
        }

        // Automatic Moderation
        const moderation = moderateContent(reviewText);

        const review = await Review.create({
            userId: req.user._id,
            googleBookId,
            rating,
            reviewText,
            status: moderation.flagged ? 'flagged' : 'approved',
            moderationReason: moderation.reason,
            isAutoFlagged: moderation.flagged
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('ADD REVIEW ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Get reviews for a specific book
// @route   GET /api/reviews/book/:googleBookId
// @access  Public
const getBookReviews = async (req, res) => {
    try {
        const { googleBookId } = req.params;
        const { sort } = req.query;

        let sortBy = { createdAt: -1 }; // newest
        if (sort === 'highest') sortBy = { rating: -1 };
        if (sort === 'lowest') sortBy = { rating: 1 };

        const reviews = await Review.find({
            googleBookId,
            status: { $ne: 'flagged' } // Filter out flagged reviews
        })
            .populate('userId', 'name avatar')
            .sort(sortBy);

        // Calculate average rating
        const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        res.json({
            reviews,
            averageRating,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('GET REVIEWS ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/update/:reviewId
// @access  Private
const updateReview = async (req, res) => {
    try {
        const { rating, reviewText } = req.body;
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user is the owner
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this review' });
        }

        review.rating = rating || review.rating;

        if (reviewText && reviewText !== review.reviewText) {
            review.reviewText = reviewText;
            // Re-verify moderation if text changed
            const moderation = moderateContent(reviewText);
            review.status = moderation.flagged ? 'flagged' : 'approved';
            review.moderationReason = moderation.reason;
            review.isAutoFlagged = moderation.flagged;
        }

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error) {
        console.error('UPDATE REVIEW ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/delete/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user is owner or admin
        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(req.params.reviewId);
        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error('DELETE REVIEW ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

module.exports = {
    addReview,
    getBookReviews,
    updateReview,
    deleteReview
};
