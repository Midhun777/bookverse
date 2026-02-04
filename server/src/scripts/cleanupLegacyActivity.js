const mongoose = require('mongoose');
require('dotenv').config();
const Activity = require('../models/Activity');
const Review = require('../models/Review');
const BookMaster = require('../models/BookMaster');

const cleanupLegacyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for cleanup...');

        // 1. Identify all valid Google IDs in Master
        const validBooks = await BookMaster.find({}, { googleBookId: 1 });
        const validIdSet = new Set(validBooks.map(b => b.googleBookId));

        console.log(`Found ${validIdSet.size} valid books in Master collection.`);

        // 2. Cleanup Activity
        const legacyActivity = await Activity.find({
            googleBookId: { $regex: /^OL/ } // OpenLibrary keys usually start with /works/ or just have OL structure
        });

        // Actually, let's just delete anything NOT in our Master collection to be safe
        const activityCount = await Activity.countDocuments();
        const deletedActivity = await Activity.deleteMany({
            googleBookId: { $nin: Array.from(validIdSet) }
        });

        console.log(`Cleaned up Activities: ${deletedActivity.deletedCount} legacy entries removed.`);

        // 3. Cleanup Reviews
        const deletedReviews = await Review.deleteMany({
            googleBookId: { $nin: Array.from(validIdSet) }
        });

        console.log(`Cleaned up Reviews: ${deletedReviews.deletedCount} legacy entries removed.`);

        console.log('Cleanup complete. Trending and Recent Activity should now be accurate.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanupLegacyData();
