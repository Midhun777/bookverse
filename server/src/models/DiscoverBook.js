const mongoose = require('mongoose');

const DiscoverBookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['TECH', 'FINANCE', 'SELF_HELP', 'FANTASY', 'ROMANCE', 'CLASSICS', 'SCIENCE', 'POPULAR'],
        index: true
    },
    description: {
        type: String,
        trim: true
    },
    coverUrl: {
        type: String,
        required: true
    },
    publishedYear: {
        type: Number
    },
    language: {
        type: String,
        default: 'English'
    },
    rating: {
        type: Number,
        default: 0
    },
    isFree: {
        type: Boolean,
        default: false
    },
    readLink: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DiscoverBook', DiscoverBookSchema);
