const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const BookMaster = require('../models/BookMaster');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

// Import genre data
const financeBooks = require('./data_finance');
const loveBooks = require('./data_love');
const selfHelpBooks = require('./data_self_help');
const fantasyBooks = require('./data_fantasy');
const mysteryBooks = require('./data_mystery');
const scienceBooks = require('./data_science');
const historyBooks = require('./data_history');
const technologyBooks = require('./data_technology');

const ALL_BOOKS = [
    ...financeBooks,
    ...loveBooks,
    ...selfHelpBooks,
    ...fantasyBooks,
    ...mysteryBooks,
    ...scienceBooks,
    ...historyBooks,
    ...technologyBooks
];

const seedBooks = async () => {
    try {
        await connectDB();
        console.log('--- BOOKVERSE DATA SEEDING START ---');

        console.log('Clearing existing books (BookMaster)...');
        await BookMaster.deleteMany({});

        try {
            console.log('Dropping legacy indexes...');
            await BookMaster.collection.dropIndex('openLibraryId_1');
        } catch (e) {
            console.log('Legacy index openLibraryId_1 not found, skipping.');
        }

        console.log('Cleared successfully.');

        console.log(`Seeding ${ALL_BOOKS.length} curated books...`);

        let successCount = 0;
        for (const book of ALL_BOOKS) {
            try {
                // Ensure unique IDs and standard source
                await BookMaster.create({
                    ...book,
                    source: 'google_books'
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to seed: ${book.title}`, err.message);
            }
        }

        console.log(`--- SEEDING COMPLETE ---`);
        console.log(`Successfully seeded: ${successCount}/${ALL_BOOKS.length}`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding Process Error:', error);
        process.exit(1);
    }
};

seedBooks();
