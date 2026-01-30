const mongoose = require('mongoose');

const ReadingProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    googleBookId: {
        type: String,
        required: true
    },
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        default: 1
    },
    lastReadAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ReadingProgress', ReadingProgressSchema);
