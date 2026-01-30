const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true // Stored as plain text per requirement
    },
    role: {
        type: String,
        enum: ['GUEST', 'USER', 'ADMIN'],
        default: 'USER'
    },
    avatar: {
        type: String
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        maxLength: 500
    },
    location: {
        type: String,
        maxLength: 100
    },
    website: {
        type: String
    },
    twitter: {
        type: String
    },
    favoriteGenres: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
