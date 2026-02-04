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

        const testUser = await User.findOne({ username: 'anoop' });
        if (!testUser) {
            console.error('Test user "anoop" not found. Please create or use another user.');
            process.exit(1);
        }

        console.log(`User: ${testUser.username} (${testUser._id})`);

        // 1. Clear previous activities for clean test
        await Activity.deleteMany({ userId: testUser._id });

        // 2. Simulate search for "money"
        console.log('Simulating search for "money"...');
        const { detectGenre } = require('../utils/genreMap');
        const genre = detectGenre('money');

        await Activity.create({
            userId: testUser._id,
            actionType: 'SEARCH',
            keyword: 'money',
            subjects: [genre]
        });
        console.log(`Search logged with genre: ${genre}`);

        // 3. Get Recommendations
        console.log('Fetching recommendations...');
        const sections = await getRecommendations(testUser._id);

        console.log(`Found ${sections.length} personal sections.`);
        sections.forEach((s, i) => {
            console.log(`Section ${i + 1}: "${s.title}"`);
            console.log(` Description: ${s.description}`);
            console.log(` First Book: ${s.books[0]?.title}`);
            console.log(` Reason: ${s.books[0]?.reasons[0]}`);
            console.log(' ---');
        });

        const hasFinanceSection = sections.some(s => s.title.includes('money') || s.title.includes('FINANCE'));
        if (hasFinanceSection) {
            console.log('✅ SUCCESS: Finance section found based on search!');
        } else {
            console.log('❌ FAILURE: Finance section not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
};

verifyFlow();
