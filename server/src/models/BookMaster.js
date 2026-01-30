const mongoose = require('mongoose');

const BookMasterSchema = new mongoose.Schema({
    openLibraryId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    authors: [{
        type: String
    }],
    description: {
        type: String
    },
    subjects: [{
        type: String
    }],
    themes: [{
        type: String // Derived themes like "Habits", "Wealth", "Fantasy"
    }],
    firstPublishYear: {
        type: Number
    },
    pageCount: {
        type: Number
    },
    language: {
        type: String,
        default: 'eng'
    },
    averageRating: {
        type: Number,
        default: 0
    },
    ratingsCount: {
        type: Number,
        default: 0
    },
    popularityScore: {
        type: Number,
        default: 0
    },
    isClassic: {
        type: Boolean,
        default: false
    },
    isTrending: {
        type: Boolean,
        default: false
    },
    isPublicDomain: {
        type: Boolean,
        default: false
    },
    coverImage: {
        type: String
    },
    readUrl: {
        type: String
    },
    source: {
        type: String,
        default: 'open_library'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BookMaster', BookMasterSchema);
