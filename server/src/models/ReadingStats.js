const mongoose = require('mongoose');

const ReadingStatsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    googleBookId: {
        type: String,
        required: true
    },
    totalReadingMinutes: {
        type: Number,
        default: 0
    },
    sessionsCount: {
        type: Number,
        default: 0
    },
    lastReadAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ReadingStats', ReadingStatsSchema);
