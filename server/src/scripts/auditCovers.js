const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BookMaster = require('../models/BookMaster');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const checkCovers = async () => {
    try {
        await connectDB();
        const books = await BookMaster.find({});
        console.log(`Total Books: ${books.length}`);

        const missing = books.filter(b => !b.coverImage || b.coverImage.includes('placeholder'));
        console.log(`Books missing cover or using placeholder: ${missing.length}`);

        if (missing.length > 0) {
            console.log('Sample missing covers:');
            missing.slice(0, 10).forEach(m => console.log(`- ${m.title} (${m.googleBookId})`));
        }

        const httpCovers = books.filter(b => b.coverImage && b.coverImage.startsWith('http:'));
        console.log(`Books with insecure HTTP covers: ${httpCovers.length}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkCovers();
