const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BookMaster = require('../models/BookMaster');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const checkStats = async () => {
    try {
        await connectDB();
        const stats = await BookMaster.aggregate([
            { $unwind: '$subjects' },
            { $group: { _id: '$subjects', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        console.log('Book Count per Genre:');
        console.table(stats);

        const total = await BookMaster.countDocuments();
        console.log(`Total Unique Books: ${total}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkStats();
