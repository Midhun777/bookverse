const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const ReadingStats = require('../models/ReadingStats');
const ReadingSession = require('../models/ReadingSession');
const ReadingList = require('../models/ReadingList');

const seedActivity = async (username) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username });
        if (!user) {
            console.error(`User ${username} not found`);
            process.exit(1);
        }

        console.log(`Seeding activity for user: ${user.name} (@${username})`);

        // 1. Clear existing test data (optional, but good for clean slate)
        await ReadingStats.deleteMany({ userId: user._id });
        await ReadingSession.deleteMany({ userId: user._id });

        // 2. Create some Reading Stats for top books
        const testBooks = [
            { id: '38O0DwAAQBAJ', title: 'Project Hail Mary', minutes: 450 },
            { id: 'L1n0DwAAQBAJ', title: 'The Psychology of Money', minutes: 300 },
            { id: 'zyTCAlS7f8QC', title: 'The Great Gatsby', minutes: 120 }
        ];

        for (const book of testBooks) {
            await ReadingStats.create({
                userId: user._id,
                googleBookId: book.id,
                totalReadingMinutes: book.minutes,
                sessionsCount: Math.ceil(book.minutes / 30),
                lastReadAt: new Date()
            });
        }

        // 3. Create Daily Sessions for the last 7 days
        const days = 7;
        const now = new Date();
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);

            // Random minutes between 20 and 60
            const dailyMinutes = 20 + Math.floor(Math.random() * 40);

            await ReadingSession.create({
                userId: user._id,
                googleBookId: testBooks[i % testBooks.length].id,
                durationMinutes: dailyMinutes,
                timestamp: date
            });
            console.log(`- Seeded ${dailyMinutes}m for ${date.toDateString()}`);
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

const targetUsername = process.argv[2] || 'cva';
seedActivity(targetUsername);
