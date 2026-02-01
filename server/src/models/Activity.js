const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actionType: {
        type: String,
        enum: ['SEARCH', 'VIEW', 'SAVE', 'STATUS_CHANGE', 'COMPLETE'],
        required: true
    },
    openLibraryId: {
        type: String
    },
    keyword: {
        type: String
    },
    subjects: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', ActivitySchema);
