const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    googleBookId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        required: true,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['approved', 'flagged', 'pending'],
        default: 'approved'
    },
    moderationReason: {
        type: String,
        default: ''
    },
    isAutoFlagged: {
        type: Boolean,
        default: false
    }
});

// Update the updatedAt field before saving
ReviewSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Review', ReviewSchema);
