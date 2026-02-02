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
        openLibraryId: "OL21640039W",
        title: "The Psychology of Money",
        authors: ["Morgan Housel"],
        subjects: ["Finance", "Personal Finance", "Money", "Psychology"],
        description: "Timeless lessons on wealth, greed, and happiness.",
        coverImage: "https://covers.openlibrary.org/b/id/10582294-L.jpg",
        popularityScore: 92,
        isTrending: true
    },
    {
        openLibraryId: "OL273184W",
        title: "The Intelligent Investor",
        authors: ["Benjamin Graham"],
        subjects: ["Finance", "Investment", "Money", "Business"],
        description: "The definitive book on value investing.",
        coverImage: "https://covers.openlibrary.org/b/id/9028886-L.jpg",
        popularityScore: 88,
        isTrending: true
    },
    {
        openLibraryId: "OL15570083W",
        title: "Rich Dad Poor Dad",
        authors: ["Robert T. Kiyosaki"],
        subjects: ["Finance", "Money", "Personal Finance", "Wealth"],
        description: "What the rich teach their kids about money that the poor and middle class do not!",
        coverImage: "https://covers.openlibrary.org/b/id/14801279-L.jpg",
        popularityScore: 95,
        isTrending: true
    },

    // --- PRODUCTIVITY / SELF-HELP ---
    {
        openLibraryId: "OL17930368W",
        title: "Atomic Habits",
        authors: ["James Clear"],
        subjects: ["Productivity", "Self-Help", "Habits", "Psychology"],
        description: "An easy & proven way to build good habits & break bad ones.",
        coverImage: "https://covers.openlibrary.org/b/id/15165583-L.jpg",
        popularityScore: 98,
        isTrending: true
    },
    {
        openLibraryId: "OL17713267W",
        title: "Deep Work",
        authors: ["Cal Newport"],
        subjects: ["Productivity", "Focus", "Self-Help", "Business"],
        description: "Rules for focused success in a distracted world.",
        coverImage: "https://covers.openlibrary.org/b/id/8272535-L.jpg",
        popularityScore: 85,
        isTrending: false
    },
    {
        openLibraryId: "OL26848149M",
        title: "The Subtle Art of Not Giving a F*ck",
        authors: ["Mark Manson"],
        subjects: ["Self-Help", "Psychology", "Happiness", "Productivity"],
        description: "A counterintuitive approach to living a good life.",
        coverImage: "https://covers.openlibrary.org/b/id/8292850-L.jpg",
        popularityScore: 90,
        isTrending: true
    },

    // --- HISTORY / SCIENCE ---
    {
        openLibraryId: "OL28227306M",
        title: "Sapiens: A Brief History of Humankind",
        authors: ["Yuval Noah Harari"],
        subjects: ["History", "Evolution", "Science", "Anthropology"],
        description: "The history of our species, from ancient humans to the present day.",
        coverImage: "https://covers.openlibrary.org/b/id/15094106-L.jpg",
        popularityScore: 96,
        isTrending: true
    },
    {
        openLibraryId: "OL25270150M",
        title: "Thinking, Fast and Slow",
        authors: ["Daniel Kahneman"],
        subjects: ["Psychology", "Science", "Economics", "Decision Making"],
        description: "A deep dive into the two systems that drive the way we think.",
        coverImage: "https://covers.openlibrary.org/b/id/7992922-L.jpg",
        popularityScore: 91,
        isTrending: false
    },

    // --- CLASSICS / PHILOSOPHY ---
    {
        openLibraryId: "OL24227393M",
        title: "Meditations",
        authors: ["Marcus Aurelius"],
        subjects: ["Philosophy", "Stoicism", "Classics", "Self-Help"],
        description: "The personal reflections of the Roman Emperor on living a virtuous life.",
        coverImage: "https://covers.openlibrary.org/b/id/11181286-L.jpg",
        popularityScore: 82,
        isTrending: false,
        isClassic: true
    },
    {
        openLibraryId: "OL19056463M",
        title: "The Great Gatsby",
        authors: ["F. Scott Fitzgerald"],
        subjects: ["Classics", "Fiction", "Literature", "History"],
        description: "A tragic story of obsession and the American Dream.",
        coverImage: "https://covers.openlibrary.org/b/id/905696-L.jpg",
        popularityScore: 85,
        isTrending: false,
        isClassic: true
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
