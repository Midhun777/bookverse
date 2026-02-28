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

        // 1. Setup
        const book = await BookMaster.findOne();
        if (!book) {
            console.error('No books found. Seed first.');
            process.exit(1);
        }

        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'demo@bookverse.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('--- TEST 1: Posting a Clean Review ---');
        const cleanText = 'This is a wonderful and inspiring book!';
        await Review.deleteOne({ userId: loginRes.data._id, googleBookId: book.googleBookId });

        let reviewRes = await axios.post(`${API_URL}/reviews/add`, {
            googleBookId: book.googleBookId,
            rating: 5,
            reviewText: cleanText
        }, config);

        console.log('Review Posted:', reviewRes.data.status);
        if (reviewRes.data.status !== 'approved') throw new Error('Clean review was flagged!');

        console.log('\n--- TEST 2: Posting an Inappropriate Review ---');
        // Delete existing to allow new one
        await Review.deleteOne({ userId: loginRes.data._id, googleBookId: book.googleBookId });

        const dirtyText = 'This book is absolute trash and garbage. I hate it.';
        reviewRes = await axios.post(`${API_URL}/reviews/add`, {
            googleBookId: book.googleBookId,
            rating: 1,
            reviewText: dirtyText
        }, config);

        console.log('Review Posted:', reviewRes.data.status);
        console.log('Moderation Reason:', reviewRes.data.moderationReason);
        if (reviewRes.data.status !== 'flagged') throw new Error('Dirty review was NOT flagged!');

        console.log('\n--- TEST 3: Verifying Filter in getBookReviews ---');
        const listRes = await axios.get(`${API_URL}/reviews/book/${book.googleBookId}`);
        const found = listRes.data.reviews.find(r => r.reviewText === dirtyText);
        if (found) {
            console.error('FAILED: Flagged review appeared in public feed.');
        } else {
            console.log('SUCCESS: Flagged review hidden from public feed.');
        }

        console.log('\n--- TEST 4: Admin Resolution ---');
        const flaggedReview = await Review.findOne({ status: 'flagged' });
        if (flaggedReview) {
            const adminLogin = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@bookverse.com',
                password: 'admin123'
            });
            const adminToken = adminLogin.data.token;
            const adminConfig = { headers: { Authorization: `Bearer ${adminToken}` } };

            const resolveRes = await axios.put(`${API_URL}/admin/reviews/resolve/${flaggedReview._id}`, {
                action: 'approve'
            }, adminConfig);

            console.log('Admin Resolution:', resolveRes.data.message);
            console.log('New Status:', resolveRes.data.review.status);

            // Verify it now appears in feed
            const listRes2 = await axios.get(`${API_URL}/reviews/book/${book.googleBookId}`);
            if (listRes2.data.reviews.find(r => r._id.toString() === flaggedReview._id.toString())) {
                console.log('SUCCESS: Approved review now visible.');
            } else {
                console.error('FAILED: Approved review still hidden.');
            }
        }

        console.log('\nALL TESTS COMPLETED SUCCESSFULLY!');
        process.exit();
    } catch (err) {
        console.error('TEST ERROR:', err.response?.data?.message || err.message);
        process.exit(1);
    }
};

runTest();
