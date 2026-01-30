const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BookMaster = require('../models/BookMaster');
const User = require('../models/User');
const Review = require('../models/Review');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        await connectDB();

        // 1. Get a book ID from BookMaster
        const book = await BookMaster.findOne();
        if (!book) {
            console.error('No books found in DB. Seed first.');
            process.exit(1);
        }
        console.log(`Found Book: ${book.title} (ID: ${book.openLibraryId})`);

        // 2. Login
        const { data } = await axios.post(`${API_URL}/auth/login`, {
            email: 'demo@bookverse.com',
            password: 'password123'
        });
        const user = data;
        const token = data.token;
        console.log(`Logged in as: ${user.name}`);

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 3. Test GET /api/books/:id
        try {
            const bookDetails = await axios.get(`${API_URL}/books/${book.openLibraryId}`);
            console.log(`GET /api/books/${book.openLibraryId}: SUCCESS`);
            if (bookDetails.data.title !== book.title) throw new Error('Title mismatch');
        } catch (err) {
            console.error('GET Book Details FAILED:', err.message);
        }

        // 4. Test POST /api/reviews/add
        // Cleanup existing review first to allow new one
        await Review.deleteOne({ userId: user._id, googleBookId: book.openLibraryId });

        try {
            const reviewRes = await axios.post(`${API_URL}/reviews/add`, {
                googleBookId: book.openLibraryId,
                rating: 5,
                reviewText: 'Automated test review - Cover fix confirmed!'
            }, config);
            console.log(`POST /api/reviews/add: SUCCESS - Review ID: ${reviewRes.data._id}`);
        } catch (err) {
            console.error('POST Review FAILED:', err.response?.data?.message || err.message);
        }

        process.exit();
    } catch (err) {
        console.error('TEST ERROR:', err.message);
        process.exit(1);
    }
};

runTest();
