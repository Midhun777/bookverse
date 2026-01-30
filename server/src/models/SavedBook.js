const mongoose = require('mongoose');

const SavedBookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    googleBookId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    authors: [String],
    thumbnail: String,
    categories: [String],
    rating: Number,
    savedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SavedBook', SavedBookSchema);
