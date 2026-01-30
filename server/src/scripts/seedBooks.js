const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const SEED_USER_EMAIL = 'demo@bookverse.com';

const POPULAR_BOOKS = [
    // Self-Improvement
    { title: 'Atomic Habits', author: 'James Clear', themes: ['Habits', 'Productivity'], category: 'Self-Help' },
    { title: 'The Power of Habit', author: 'Charles Duhigg', themes: ['Habits', 'Psychology'], category: 'Psychology' },
    { title: 'Deep Work', author: 'Cal Newport', themes: ['Productivity', 'Focus'], category: 'Business' },
    { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', themes: ['Leadership'], category: 'Self-Help' },
    { title: 'Think and Grow Rich', author: 'Napoleon Hill', themes: ['Wealth', 'Mindset'], category: 'Finance' },
    { title: 'Ikigai', author: 'Hector Garcia', themes: ['Happiness', 'Philosophy'], category: 'Self-Help' },
    { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', themes: ['Communication'], category: 'Self-Help' },
    { title: 'Mindset', author: 'Carol Dweck', themes: ['Psychology', 'Growth'], category: 'Psychology' },
    { title: 'Can\'t Hurt Me', author: 'David Goggins', themes: ['Motivation', 'Resilience'], category: 'Biography' },
    { title: 'Essentialism', author: 'Greg McKeown', themes: ['Productivity', 'Minimalism'], category: 'Self-Help' },

    // Finance
    { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', themes: ['Money', 'Finance'], category: 'Finance' },
    { title: 'The Psychology of Money', author: 'Morgan Housel', themes: ['Money', 'Psychology'], category: 'Finance' },
    { title: 'The Intelligent Investor', author: 'Benjamin Graham', themes: ['Investing'], category: 'Finance' },
    { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', themes: ['Money'], category: 'Finance' },
    { title: 'Money: Master the Game', author: 'Tony Robbins', themes: ['Wealth'], category: 'Finance' },
    { title: 'Zero to One', author: 'Peter Thiel', themes: ['Business', 'Startups'], category: 'Business' },

    // Fiction / Fantasy
    { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', themes: ['Fantasy', 'Magic'], category: 'Fantasy' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', themes: ['Fantasy', 'Adventure'], category: 'Fantasy' },
    { title: 'The Alchemist', author: 'Paulo Coelho', themes: ['Adventure', 'Philosophy'], category: 'Fiction' },
    { title: '1984', author: 'George Orwell', themes: ['Dystopian', 'Politics'], category: 'Fiction' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', themes: ['Classic', 'Justice'], category: 'Fiction' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', themes: ['Classic', 'Romance'], category: 'Fiction' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', themes: ['Classic', 'Romance'], category: 'Fiction' },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', themes: ['Classic', 'Coming of Age'], category: 'Fiction' },
    { title: 'The Kite Runner', author: 'Khaled Hosseini', themes: ['Historical', 'Drama'], category: 'Fiction' },
    { title: 'Life of Pi', author: 'Yann Martel', themes: ['Adventure', 'Philosophy'], category: 'Fiction' },

    // Knowledge & History
    { title: 'Sapiens', author: 'Yuval Noah Harari', themes: ['History', 'Anthropology'], category: 'History' },
    { title: 'Homo Deus', author: 'Yuval Noah Harari', themes: ['Future', 'Philosophy'], category: 'History' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', themes: ['Psychology', 'Science'], category: 'Psychology' },
    { title: 'A Short History of Nearly Everything', author: 'Bill Bryson', themes: ['Science', 'History'], category: 'Science' },
    { title: 'Cosmos', author: 'Carl Sagan', themes: ['Science', 'Space'], category: 'Science' },

    // Thriller / Mystery
    { title: 'The Silent Patient', author: 'Alex Michaelides', themes: ['Thriller', 'Mystery'], category: 'Thriller' },
    { title: 'Gone Girl', author: 'Gillian Flynn', themes: ['Thriller', 'Suspense'], category: 'Thriller' },
    { title: 'The Da Vinci Code', author: 'Dan Brown', themes: ['Mystery', 'Adventure'], category: 'Thriller' },
    { title: 'Sherlock Holmes', author: 'Arthur Conan Doyle', themes: ['Mystery', 'Classic'], category: 'Mystery' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchFromGoogle = async (title, author) => {
    try {
        console.log(`Fetching: ${title}...`);
        const query = `intitle:${title}+inauthor:${author}`;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&langRestrict=en`;

        const res = await axios.get(url);
        if (res.data.items && res.data.items.length > 0) {
            return res.data.items[0];
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${title}:`, error.message);
        return null;
    }
};

const normalizeAndSave = async (googleData, bookInfo) => {
    if (!googleData) return null;

    const info = googleData.volumeInfo;
    const id = googleData.id;

    // Use high-res image if available (not usually in list response, but try)
    let cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    if (cover) {
        cover = cover.replace('http:', 'https:').replace('&edge=curl', '');
    }

    const bookData = {
        openLibraryId: id, // Using Google ID as unique key
        title: info.title,
        authors: info.authors || ['Unknown'],
        description: info.description || 'No description available.',
        subjects: info.categories || [bookInfo.category],
        themes: bookInfo.themes,
        firstPublishYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : 0,
        pageCount: info.pageCount || 0,
        averageRating: info.averageRating || 0,
        ratingsCount: info.ratingsCount || 0,
        coverImage: cover,
        popularityScore: (info.ratingsCount || 0) + (info.averageRating || 0) * 10,
        isClassic: (info.publishedDate && parseInt(info.publishedDate.substring(0, 4)) < 1980),
        isTrending: (info.ratingsCount > 1000),
        source: 'google'
    };

    const book = await BookMaster.findOneAndUpdate(
        { openLibraryId: id },
        bookData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return book;
};

const seed = async () => {
    try {
        await connectDB();

        console.log('--- 1. Seeding BookMaster (Google) ---');
        const seededBooks = [];
        for (const bookInfo of POPULAR_BOOKS) {
            const data = await fetchFromGoogle(bookInfo.title, bookInfo.author);
            if (data) {
                const saved = await normalizeAndSave(data, bookInfo);
                seededBooks.push(saved);
            }
            await sleep(500);
        }
        console.log(`Seeded ${seededBooks.length} books.`);

        // 2. Demo User Activity
        console.log('--- 2. Seeding Activity ---');
        let user = await User.findOne({ email: SEED_USER_EMAIL });
        if (!user) {
            user = await User.create({
                username: 'demoreader',
                name: 'Demo Reader',
                email: SEED_USER_EMAIL,
                password: 'password123',
                isAdmin: false
            });
        }

        await Activity.deleteMany({ userId: user._id });
        const logs = [];

        const log = (action, book) => {
            logs.push({
                userId: user._id,
                actionType: action,
                openLibraryId: book.openLibraryId,
                googleBookId: book.openLibraryId,
                authors: book.authors,
                category: book.subjects?.[0] || 'General'
            });
        };

        // Add some random activities
        if (seededBooks.length > 5) {
            log('COMPLETE', seededBooks[0]);
            log('LIKE', seededBooks[1]);
            log('VIEW', seededBooks[2]);
            log('VIEW', seededBooks[3]);
        }

        await Activity.insertMany(logs);
        console.log('Activity Seeded.');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
