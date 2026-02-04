const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Review = require('../models/Review');
const BookMaster = require('../models/BookMaster');

const seedReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get some users to attribute reviews to
        const users = await User.find({ role: 'USER' }).limit(5);
        if (users.length === 0) {
            console.error('No regular users found to attribute reviews to. Please seed users first.');
            process.exit(1);
        }

        // 2. Clear existing reviews (optional, but good for testing)
        // await Review.deleteMany({});
        // console.log('Cleared existing reviews');

        // 3. Get target books for seeding
        const books = await BookMaster.find({}).limit(10);
        if (books.length === 0) {
            console.error('No books found in BookMaster to review.');
            process.exit(1);
        }

        const reviewTexts = [
            "An absolute masterpiece! I couldn't put it down.",
            "Really enjoyed the world-building, though the middle part was a bit slow.",
            "A must-read for any fan of the genre. Five stars!",
            "Intriguing concepts, but the characters felt a little flat to me.",
            "This book changed how I think about the subject. Highly recommend.",
            "Well written, but maybe not for everyone. Quite dense.",
            "I've read this three times now and I find something new every time.",
            "A bit overrated in my opinion, but still a solid read.",
            "Fantastic prose and an unforgettable ending.",
            "Could have been shorter, but the message is powerful."
        ];

        console.log('Seeding reviews...');

        for (const book of books) {
            // Seed a random number of reviews for each book (between 1 and 6)
            const numReviews = Math.floor(Math.random() * 6) + 1;

            for (let i = 0; i < numReviews; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomText = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
                const randomRating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars

                await Review.create({
                    userId: randomUser._id,
                    googleBookId: book.googleBookId,
                    rating: randomRating,
                    reviewText: randomText,
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)) // Random date in last 30 days
                });
            }
            console.log(`- Seeded ${numReviews} reviews for "${book.title}"`);
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedReviews();
