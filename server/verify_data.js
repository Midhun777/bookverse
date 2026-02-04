require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const BookMaster = require('./src/models/BookMaster');

const verify = async () => {
    try {
        await connectDB();
        const count = await BookMaster.countDocuments();
        console.log(`Total books in database: ${count}`);

        const books = await BookMaster.find({});
        const categories = {};

        books.forEach(book => {
            // Normalize category name to UPPERCASE for unified grouping
            let cat = book.subjects?.[0] || 'Uncategorized';
            cat = cat.toUpperCase().replace(/ /g, '_');
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(book.title);
        });

        console.log('\n--- CATEGORY BREAKDOWN ---');
        Object.entries(categories).sort((a, b) => b[1].length - a[1].length).forEach(([name, list]) => {
            console.log(`${name.padEnd(20)}: ${list.length} books`);
            console.log(`  Samples: ${list.slice(0, 5).join(', ')}...`);
        });

        console.log('\n--- DATA INTEGRITY CHECK ---');
        const sample = await BookMaster.findOne({ googleBookId: "xYotngEACAAJ" });
        if (sample) {
            console.log(`[OK] Harry Potter Verified`);
            console.log(`     Image: ${sample.coverImage}`);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
