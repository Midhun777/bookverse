require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const connectDB = require('../config/db');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');
const User = require('../models/User');

// --- Configuration ---
const SEED_USER_EMAIL = 'demo@bookverse.com';
const TARGET_BOOK_COUNT = 100;

// Popular books to search and add (Manual Curation to ensure quality)
const POPULAR_BOOKS = [
    // Self-Improvement
    { title: 'Atomic Habits', author: 'James Clear', themes: ['Habits', 'Productivity', 'Self-Improvement'] },
    { title: 'The Power of Habit', author: 'Charles Duhigg', themes: ['Habits', 'Psychology'] },
    { title: 'Deep Work', author: 'Cal Newport', themes: ['Productivity', 'Focus', 'Career'] },
    { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', themes: ['Leadership', 'Self-Improvement'] },
    { title: 'Think and Grow Rich', author: 'Napoleon Hill', themes: ['Wealth', 'Mindset'] },
    { title: 'Ikigai', author: 'Hector Garcia', themes: ['Happiness', 'Philosophy'] },
    { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', themes: ['Communication', 'Relationships'] },
    { title: 'Mindset', author: 'Carol Dweck', themes: ['Psychology', 'Growth'] },
    { title: 'Can\'t Hurt Me', author: 'David Goggins', themes: ['Motivation', 'Resilience'] },
    { title: 'Essentialism', author: 'Greg McKeown', themes: ['Productivity', 'Minimalism'] },

    // Finance
    { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', themes: ['Money', 'Finance', 'Wealth'] },
    { title: 'The Psychology of Money', author: 'Morgan Housel', themes: ['Money', 'Psychology'] },
    { title: 'The Intelligent Investor', author: 'Benjamin Graham', themes: ['Investing', 'Finance'] },
    { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', themes: ['Money', 'Personal Finance'] },
    { title: 'Money: Master the Game', author: 'Tony Robbins', themes: ['Wealth', 'Investing'] },
    { title: 'Zero to One', author: 'Peter Thiel', themes: ['Business', 'Startups'] },

    // Fiction / Fantasy
    { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', themes: ['Fantasy', 'Magic', 'Friendship'] },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', themes: ['Fantasy', 'Adventure'] },
    { title: 'The Alchemist', author: 'Paulo Coelho', themes: ['Adventure', 'Philosophy', 'Destiny'] },
    { title: '1984', author: 'George Orwell', themes: ['Dystopian', 'Politics', 'Classic'] },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', themes: ['Classic', 'Justice', 'Historical'] },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', themes: ['Classic', 'Romance', 'Tragedy'] },
    { title: 'Pride and Prejudice', author: 'Jane Austen', themes: ['Classic', 'Romance', 'Public Domain'] },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', themes: ['Classic', 'Coming of Age'] },
    { title: 'The Kite Runner', author: 'Khaled Hosseini', themes: ['Historical', 'Drama'] },
    { title: 'Life of Pi', author: 'Yann Martel', themes: ['Adventure', 'Philosophy'] },

    // Knowledge & History
    { title: 'Sapiens', author: 'Yuval Noah Harari', themes: ['History', 'Anthropology'] },
    { title: 'Homo Deus', author: 'Yuval Noah Harari', themes: ['Future', 'Philosophy'] },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', themes: ['Psychology', 'Science'] },
    { title: 'A Short History of Nearly Everything', author: 'Bill Bryson', themes: ['Science', 'History'] },
    { title: 'Cosmos', author: 'Carl Sagan', themes: ['Science', 'Space'] },

    // Thriller / Mystery
    { title: 'The Silent Patient', author: 'Alex Michaelides', themes: ['Thriller', 'Mystery'] },
    { title: 'Gone Girl', author: 'Gillian Flynn', themes: ['Thriller', 'Suspense'] },
    { title: 'The Da Vinci Code', author: 'Dan Brown', themes: ['Mystery', 'Adventure'] },
    { title: 'Sherlock Holmes', author: 'Arthur Conan Doyle', themes: ['Mystery', 'Classic', 'Public Domain'] }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchBookFromGoogle = async (title, author) => {
    try {
        console.log(`Fetching: ${title} by ${author}...`);
        const query = `intitle:${title} inauthor:${author}`;
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes`, {
            params: { q: query, maxResults: 1 },
            timeout: 10000
        });

        if (response.data.items && response.data.items.length > 0) {
            return response.data.items[0];
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${title}: ${error.message}`);
        return null;
    }
};

const normalizeAndSaveBook = async (googleData, manualThemes) => {
    if (!googleData) return null;

    const { id, volumeInfo } = googleData;
    const {
        title,
        authors,
        description,
        categories,
        averageRating,
        ratingsCount,
        publishedDate,
        pageCount,
        imageLinks
    } = volumeInfo;
    const publishedYear = publishedDate ? parseInt(publishedDate.split('-')[0]) : null;

    const book = await BookMaster.findOneAndUpdate(
        { googleBookId: id },
        {
            googleBookId: id,
            title: title,
            authors: authors || ['Unknown'],
            description: description || `A fascinating book about ${manualThemes?.[0] || 'various topics'}.`,
            subjects: categories || [],
            themes: manualThemes || [],
            firstPublishYear: publishedYear,
            pageCount: pageCount || 0,
            averageRating: averageRating || 0,
            ratingsCount: ratingsCount || 0,
            coverImage: imageLinks?.thumbnail?.replace('http:', 'https:') || null,
            popularityScore: (ratingsCount || 0) + (averageRating || 0) * 10,
            isClassic: publishedYear && publishedYear < 1980,
            isTrending: ratingsCount > 1000,
            isPublicDomain: publishedYear && publishedYear < 1928,
            source: 'google_books'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return book;
};

const seed = async () => {
    await connectDB();

    console.log('--- 1. Seeding BookMaster ---');

    // 1. Seed Books
    const seededBooks = [];
    for (const bookInfo of POPULAR_BOOKS) {
        const googleData = await fetchBookFromGoogle(bookInfo.title, bookInfo.author);
        if (googleData) {
            const savedBook = await normalizeAndSaveBook(googleData, bookInfo.themes);
            if (savedBook) seededBooks.push(savedBook);
        }
        await sleep(500); // Be rate limit friendly
    }

    console.log(`Seeded ${seededBooks.length} books.`);

    // 2. Seed Demo User
    console.log('--- 2. Seeding Demo User ---');
    let user = await User.findOne({ email: SEED_USER_EMAIL });
    if (!user) {
        user = await User.create({
            username: 'demoreader',
            name: 'Demo Reader',
            email: SEED_USER_EMAIL,
            password: 'password123',
            isAdmin: false
        });
        console.log('Created Demo User.');
    } else {
        console.log('Demo User exists.');
    }

    // 3. Seed User Activity
    console.log('--- 3. Seeding Activity ---');
    await Activity.deleteMany({ userId: user._id }); // Clear old demo activity

    const activityLog = [];

    // Helper to log
    const log = (action, book, extra = {}) => {
        activityLog.push({
            userId: user._id,
            actionType: action,
            googleBookId: book.googleBookId,
            authors: book.authors,
            category: book.subjects?.[0] || 'General',
            ...extra
        });
    };

    // A. Completed (Habits & Finance)
    const habitsBooks = seededBooks.filter(b => b.themes.includes('Habits'));
    if (habitsBooks.length > 0) log('COMPLETE', habitsBooks[0], { rating: 5 });

    const financeBooks = seededBooks.filter(b => b.themes.includes('Money'));
    if (financeBooks.length > 0) log('COMPLETE', financeBooks[0], { rating: 4 });

    // B. Likes (Fiction)
    const fantasyBooks = seededBooks.filter(b => b.themes.includes('Fantasy'));
    fantasyBooks.slice(0, 3).forEach(b => log('SAVE', b));

    // C. Views (Recent exploration)
    const recentViews = seededBooks.slice(0, 5);
    recentViews.forEach(b => log('VIEW', b));

    // D. Searches
    activityLog.push({ userId: user._id, actionType: 'SEARCH', keyword: 'habits' });
    activityLog.push({ userId: user._id, actionType: 'SEARCH', keyword: 'wealth building' });
    activityLog.push({ userId: user._id, actionType: 'SEARCH', keyword: 'epic fantasy' });

    await Activity.insertMany(activityLog);
    console.log(`Seeded ${activityLog.length} activities.`);

    console.log('--- DONE ---');
    process.exit();
};

seed();
