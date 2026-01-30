const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actionType: {
        type: String,
        enum: ['SEARCH', 'VIEW', 'LIKE', 'STATUS_CHANGE', 'COMPLETE', 'REVIEW'],
        required: true
    },
    keyword: {
        type: String
    },
    openLibraryId: {
        type: String
    },
    googleBookId: { // JSON field name legacy support
        type: String
    },
    authors: [{
        type: String
    }],
    category: {
        type: String
    },
    rating: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', ActivitySchema);
