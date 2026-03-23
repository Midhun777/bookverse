const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { getRecommendations } = require('../controllers/recommendationService');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const verifyFlow = async () => {
    try {
        await connectDB();
        console.log('--- VERIFYING RECOMMENDATION FLOW ---');

        const testUser = await User.findOne();
        if (!testUser) {
            console.error('No users found in database.');
            process.exit(1);
        }

        console.log(`User: ${testUser.username || testUser.name} (${testUser._id})`);

        const Favorite = require('../models/Favorite');
        const ReadingList = require('../models/ReadingList');
        const BookMaster = require('../models/BookMaster');

        // 1. Clear previous data for this user for clean test
        await Activity.deleteMany({ userId: testUser._id });
        await Favorite.deleteMany({ userId: testUser._id });
        await ReadingList.deleteMany({ userId: testUser._id });

        // 2. Fetch a couple of varied books from BookMaster
        const books = await BookMaster.find({ subjects: { $exists: true, $not: { $size: 0 } } }).limit(2);
        
        if (books.length >= 2) {
            console.log(`\nSimulating Favorite: "${books[0].title}" (Subject: ${books[0].subjects[0]})`);
            await Favorite.create({
                userId: testUser._id,
                googleBookId: books[0].googleBookId,
                title: books[0].title
            });

            console.log(`Simulating Read: "${books[1].title}" (Subject: ${books[1].subjects[0]})`);
            await ReadingList.create({
                userId: testUser._id,
                googleBookId: books[1].googleBookId,
                status: 'COMPLETED'
            });
        }

        // 3. Get Recommendations
        console.log('\nFetching recommendations...');
        const sections = await getRecommendations(testUser._id);

        console.log(`\nFound ${sections.length} personal sections.`);
        sections.forEach((s, i) => {
            console.log(`\nSection ${i + 1}: "${s.title}"`);
            console.log(` Type: ${s.type}`);
            console.log(` Description: ${s.description}`);
            if (s.books && s.books.length > 0) {
                console.log(` First Book: ${s.books[0]?.title}`);
                console.log(` Reason: ${s.books[0]?.reasons[0]}`);
            } else {
                console.log(` No books in this section!`);
            }
        });

        const hasFavoriteSection = sections.some(s => s.type === 'PERSONAL_FAVORITE');
        const hasReadSection = sections.some(s => s.type === 'PERSONAL_READ');
        
        if (hasFavoriteSection && hasReadSection) {
            console.log('\n✅ SUCCESS: Both Favorite and Read sections generated!');
        } else {
            console.log('\n❌ FAILURE: Missing expected sections.');
            console.log(`Favorite section: ${hasFavoriteSection}, Read section: ${hasReadSection}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
};

verifyFlow();
