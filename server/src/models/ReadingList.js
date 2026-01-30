const mongoose = require('mongoose');

const ReadingListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    googleBookId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['TO_READ', 'READING', 'COMPLETED'],
        default: 'TO_READ'
    },
    progressPercent: {
        type: Number,
        default: 0
    },
    startedAt: Date,
    completedAt: Date,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ReadingList', ReadingListSchema);
