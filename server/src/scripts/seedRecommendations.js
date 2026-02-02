const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

/**
 * THE DATASET: Curated books across distinct genres
 * This provides the "Real Data" for the recommendation engine.
 */
const DATASET = [
    // --- FINANCE / MONEY ---
    {
        openLibraryId: "OL2621W",
        title: "Rich Dad Poor Dad",
        authors: ["Robert T. Kiyosaki"],
        subjects: ["Finance", "Money", "Personal Finance", "Wealth"],
        description: "A book about financial literacy and wealth building.",
        coverImage: "https://covers.openlibrary.org/b/id/12911224-L.jpg",
        popularityScore: 95,
        isTrending: true
    },
    {
        openLibraryId: "OL19732159W",
        title: "The Psychology of Money",
        authors: ["Morgan Housel"],
        subjects: ["Finance", "Psychology", "Money"],
        description: "Lessons on wealth, greed, and happiness.",
        coverImage: "https://covers.openlibrary.org/b/id/10543202-L.jpg",
        popularityScore: 92,
        isTrending: true
    },
    {
        openLibraryId: "OL270119W",
        title: "The Intelligent Investor",
        authors: ["Benjamin Graham"],
        subjects: ["Finance", "Investing", "Stock Market"],
        description: "The definitive book on value investing.",
        coverImage: "https://covers.openlibrary.org/b/id/12046890-L.jpg",
        popularityScore: 88,
        isClassic: true
    },

    // --- SELF-HELP / PRODUCTIVITY ---
    {
        openLibraryId: "OL19553W",
        title: "Atomic Habits",
        authors: ["James Clear"],
        subjects: ["Self-Improvement", "Habits", "Productivity"],
        description: "Tiny changes, remarkable results.",
        coverImage: "https://covers.openlibrary.org/b/id/12864380-L.jpg",
        popularityScore: 98,
        isTrending: true
    },
    {
        openLibraryId: "OL16314811W",
        title: "Deep Work",
        authors: ["Cal Newport"],
        subjects: ["Productivity", "Focus", "Business"],
        description: "Rules for focused success in a distracted world.",
        coverImage: "https://covers.openlibrary.org/b/id/12675661-L.jpg",
        popularityScore: 85,
        isTrending: false
    },
    {
        openLibraryId: "OL1952136W",
        title: "The 7 Habits of Highly Effective People",
        authors: ["Stephen R. Covey"],
        subjects: ["Self-Improvement", "Leadership", "Productivity"],
        description: "Powerful lessons in personal change.",
        coverImage: "https://covers.openlibrary.org/b/id/12574972-L.jpg",
        popularityScore: 90,
        isClassic: true
    },

    // --- PSYCHOLOGY / SCIENCE ---
    {
        openLibraryId: "OL16157303W",
        title: "Thinking, Fast and Slow",
        authors: ["Daniel Kahneman"],
        subjects: ["Psychology", "Decision Making", "Science"],
        description: "A masterpiece on how the human mind works.",
        coverImage: "https://covers.openlibrary.org/b/id/12711739-L.jpg",
        popularityScore: 89,
        isTrending: false
    },
    {
        openLibraryId: "OL25367621W",
        title: "Sapiens",
        authors: ["Yuval Noah Harari"],
        subjects: ["History", "Science", "Anthropology"],
        description: "A brief history of humankind.",
        coverImage: "https://covers.openlibrary.org/b/id/12411545-L.jpg",
        popularityScore: 94,
        isTrending: true
    },

    // --- FANTASY / ADVENTURE ---
    {
        openLibraryId: "OL23919W",
        title: "The Hobbit",
        authors: ["J.R.R. Tolkien"],
        subjects: ["Fantasy", "Adventure", "Fiction"],
        description: "In a hole in the ground there lived a hobbit.",
        coverImage: "https://covers.openlibrary.org/b/id/12662055-L.jpg",
        popularityScore: 96,
        isClassic: true
    },
    {
        openLibraryId: "OL82501W",
        title: "Harry Potter and the Sorcerer's Stone",
        authors: ["J.K. Rowling"],
        subjects: ["Fantasy", "Magic", "Young Adult"],
        description: "The boy who lived.",
        coverImage: "https://covers.openlibrary.org/b/id/10521270-L.jpg",
        popularityScore: 99,
        isTrending: true
    }
];

/**
 * THE LOGIC: Simulate User Profiles
 */
const simulateInterests = async (user, profileType) => {
    console.log(`Simulating [${profileType}] interests for ${user.email}...`);

    // Clear old activities to make the logic clean
    await Activity.deleteMany({ userId: user._id });
    await Favorite.deleteMany({ userId: user._id });

    if (profileType === 'FINANCE_ENTHUSIAST') {
        // Logic: Search for Finance, Like Finance books
        await Activity.create({
            userId: user._id,
            actionType: 'SEARCH',
            keyword: 'Finance',
            subjects: ['Finance']
        });

        // Favorite "Rich Dad Poor Dad"
        const book = DATASET.find(b => b.title.includes('Rich Dad'));
        await Favorite.create({
            userId: user._id,
            googleBookId: book.openLibraryId,
            title: book.title,
            authors: book.authors,
            thumbnail: book.coverImage,
            subjects: book.subjects
        });

        await Activity.create({
            userId: user._id,
            actionType: 'SAVE',
            openLibraryId: book.openLibraryId,
            keyword: book.title,
            subjects: book.subjects
        });
    }

    if (profileType === 'PRODUCTIVITY_GURU') {
        // Logic: Complete "Atomic Habits", Search Productivity
        const book = DATASET.find(b => b.title.includes('Atomic Habits'));
        await Activity.create({
            userId: user._id,
            actionType: 'COMPLETE',
            openLibraryId: book.openLibraryId,
            keyword: book.title,
            subjects: book.subjects
        });

        await Activity.create({
            userId: user._id,
            actionType: 'SEARCH',
            keyword: 'productivity hacks',
            subjects: ['Productivity', 'Self-Help']
        });
    }
};

const runSeeder = async () => {
    try {
        await connectDB();
        console.log('--- SEEDING START ---');

        // 1. Seed Books
        console.log('Seeding dataset books with covers...');
        for (const book of DATASET) {
            await BookMaster.findOneAndUpdate(
                { openLibraryId: book.openLibraryId },
                book,
                { upsert: true, new: true }
            );
        }

        // 2. Setup Test User (Robust check for existing username/email)
        let testUser = await User.findOne({
            $or: [{ email: 'anoop@bookverse.com' }, { username: 'anoop' }]
        });

        if (!testUser) {
            console.log('Creating new test user...');
            testUser = await User.create({
                username: 'anoop',
                name: 'Anoop Test',
                email: 'anoop@bookverse.com',
                password: 'password123'
            });
        } else {
            console.log(`Using existing user: ${testUser.username}`);
        }

        // 3. Apply Interest Simulation Logic
        // Choose a profile to test: FINANCE_ENTHUSIAST or PRODUCTIVITY_GURU
        await simulateInterests(testUser, 'FINANCE_ENTHUSIAST');

        console.log('--- SEEDING COMPLETE ---');
        console.log('Run the server and check the Recommendations page.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
};

runSeeder();
