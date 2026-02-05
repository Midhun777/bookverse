const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const SEED_USER_EMAIL = 'demo@bookverse.com';

// Manual cover URL mappings for books where Google Books API doesn't provide covers
const MANUAL_COVERS = {
    'Atomic Habits': 'https://m.media-amazon.com/images/I/91bYsX41DVL.jpg',
    'The Power of Habit': 'https://m.media-amazon.com/images/I/41Dq74XitGL.jpg',
    'Deep Work': 'https://m.media-amazon.com/images/I/719f-zWvH9L.jpg',
    'The 7 Habits of Highly Effective People': 'https://m.media-amazon.com/images/I/71Y97C-OelL.jpg',
    'Think and Grow Rich': 'https://m.media-amazon.com/images/I/71UoQDj2SML.jpg',
    'Ikigai': 'https://m.media-amazon.com/images/I/81l3rZK4n9L.jpg',
    'How to Win Friends and Influence People': 'https://m.media-amazon.com/images/I/71vBS3mR5UL.jpg',
    'Mindset': 'https://m.media-amazon.com/images/I/61mNn9mR-CL.jpg',
    'Can\'t Hurt Me': 'https://m.media-amazon.com/images/I/81S8AioP9FL.jpg',
    'Essentialism': 'https://m.media-amazon.com/images/I/719F6Y+U6CL.jpg',
    'The Subtle Art of Not Giving a F*ck': 'https://m.media-amazon.com/images/I/71QK7uPaG-L.jpg',

    'Rich Dad Poor Dad': 'https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg',
    'The Psychology of Money': 'https://m.media-amazon.com/images/I/71g2ednj0JL.jpg',
    'The Intelligent Investor': 'https://m.media-amazon.com/images/I/919uW69j7iL.jpg',
    'I Will Teach You to Be Rich': 'https://m.media-amazon.com/images/I/81S6U6+6o1L.jpg',
    'Money: Master the Game': 'https://m.media-amazon.com/images/I/71XoWJpM6zL.jpg',
    'Zero to One': 'https://m.media-amazon.com/images/I/71mU3mXf9cL.jpg',

    'Harry Potter and the Sorcerer\'s Stone': 'https://m.media-amazon.com/images/I/91SQBAYzSXL.jpg',
    'The Hobbit': 'https://m.media-amazon.com/images/I/91b0C2YNSWL.jpg',
    'The Alchemist': 'https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg',
    '1984': 'https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg',
    'To Kill a Mockingbird': 'https://m.media-amazon.com/images/I/81gepf1eMqL.jpg',
    'The Great Gatsby': 'https://m.media-amazon.com/images/I/719L05BfDUL.jpg',
    'Pride and Prejudice': 'https://m.media-amazon.com/images/I/918CqE9uAFL.jpg',
    'The Catcher in the Rye': 'https://m.media-amazon.com/images/I/81Oth93W-vL.jpg',
    'The Kite Runner': 'https://m.media-amazon.com/images/I/91r4u2S5S6L.jpg',
    'Life of Pi': 'https://m.media-amazon.com/images/I/81Z1R0W62sL.jpg',

    'Sapiens': 'https://m.media-amazon.com/images/I/713jIoMO3UL.jpg',
    'Homo Deus': 'https://m.media-amazon.com/images/I/81M2O1hCidL.jpg',
    'Thinking, Fast and Slow': 'https://m.media-amazon.com/images/I/71f6vNo6K+L.jpg',
    'A Short History of Nearly Everything': 'https://m.media-amazon.com/images/I/91i+kC57-8L.jpg',
    'Cosmos': 'https://m.media-amazon.com/images/I/917S+96mUPL.jpg',

    'The Silent Patient': 'https://m.media-amazon.com/images/I/81vjr-o6qOL.jpg',
    'Gone Girl': 'https://m.media-amazon.com/images/I/81AXYF-mBCL.jpg',
    'The Da Vinci Code': 'https://m.media-amazon.com/images/I/918Mv8T9C5L.jpg',
    'Sherlock Holmes': 'https://m.media-amazon.com/images/I/81mD3fR5kFL.jpg',

    // Tech Titans
    'Clean Code': 'https://m.media-amazon.com/images/I/41xShme7hOf.jpg',
    'The Pragmatic Programmer': 'https://m.media-amazon.com/images/I/41as+49f9mL.jpg',
    'The Phoenix Project': 'https://m.media-amazon.com/images/I/81Oth93W-vL.jpg',
    'Refactoring': 'https://m.media-amazon.com/images/I/81U5P-eGvIS.jpg',
    'Design Patterns': 'https://m.media-amazon.com/images/I/81gtxoA1DeL.jpg',
    'Code: The Hidden Language': 'https://m.media-amazon.com/images/I/8166Dq9467L.jpg'
};

const POPULAR_BOOKS = [
    // Tech Titans
    { title: 'Clean Code', author: 'Robert C. Martin', themes: ['Programming', 'Software'], category: 'TECHNOLOGY' },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', themes: ['Programming', 'Career'], category: 'TECHNOLOGY' },
    { title: 'The Phoenix Project', author: 'Gene Kim', themes: ['DevOps', 'Management'], category: 'TECHNOLOGY' },
    { title: 'Refactoring', author: 'Martin Fowler', themes: ['Programming', 'Software'], category: 'TECHNOLOGY' },
    { title: 'Design Patterns', author: 'Erich Gamma', themes: ['Software', 'Architecture'], category: 'TECHNOLOGY' },
    { title: 'Code: The Hidden Language', author: 'Charles Petzold', themes: ['Hardware', 'Fundamentals'], category: 'TECHNOLOGY' },

    // Self-Improvement
    { title: 'Atomic Habits', author: 'James Clear', themes: ['Habits', 'Productivity'], category: 'SELF_HELP' },
    { title: 'The Power of Habit', author: 'Charles Duhigg', themes: ['Habits', 'Psychology'], category: 'SELF_HELP' },
    { title: 'Deep Work', author: 'Cal Newport', themes: ['Productivity', 'Focus'], category: 'SELF_HELP' },
    { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', themes: ['Leadership'], category: 'SELF_HELP' },
    { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', themes: ['Mindset', 'Philosophy'], category: 'SELF_HELP' },
    { title: 'Think and Grow Rich', author: 'Napoleon Hill', themes: ['Wealth', 'Mindset'], category: 'Finance' },
    { title: 'Ikigai', author: 'Hector Garcia', themes: ['Happiness', 'Philosophy'], category: 'SELF_HELP' },
    { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', themes: ['Communication'], category: 'SELF_HELP' },
    { title: 'Mindset', author: 'Carol Dweck', themes: ['Psychology', 'Growth'], category: 'SELF_HELP' },
    { title: 'Can\'t Hurt Me', author: 'David Goggins', themes: ['Motivation', 'Resilience'], category: 'Biography' },
    { title: 'Essentialism', author: 'Greg McKeown', themes: ['Productivity', 'Minimalism'], category: 'SELF_HELP' },

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
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&langRestrict=en`;

        const res = await axios.get(url);
        if (res.data.items && res.data.items.length > 0) {
            // Try to find an item with imageLinks
            for (const item of res.data.items) {
                if (item.volumeInfo.imageLinks) {
                    return item;
                }
            }
            // If no item has imageLinks, return the first one anyway
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

    // Extract cover image - PRIORITIZE manual covers from Amazon
    let cover = MANUAL_COVERS[bookInfo.title];
    if (cover) {
        console.log(`  → Using manual cover for: ${bookInfo.title}`);
    } else if (info.imageLinks) {
        // Priority: extraLarge > large > medium > thumbnail > smallThumbnail
        cover = info.imageLinks.extraLarge ||
            info.imageLinks.large ||
            info.imageLinks.medium ||
            info.imageLinks.thumbnail ||
            info.imageLinks.smallThumbnail;

        if (cover) {
            // Force HTTPS and remove edge curl effect
            cover = cover.replace('http:', 'https:').replace('&edge=curl', '');
            // Upgrade to zoom=2 for better quality if it's a Google Books image
            if (cover.includes('books.google.com') || cover.includes('googleusercontent.com')) {
                cover = cover.replace('zoom=1', 'zoom=2').replace('zoom=0', 'zoom=2');
            }
        }
    }

    const bookData = {
        googleBookId: id,
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
        { googleBookId: id },
        bookData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return book;
};

const seed = async () => {
    try {
        await connectDB();

        console.log('--- 1. Seeding BookMaster (Google + Manual Covers) ---');
        const seededBooks = [];
        for (const bookInfo of POPULAR_BOOKS) {
            const data = await fetchFromGoogle(bookInfo.title, bookInfo.author);
            if (data) {
                const saved = await normalizeAndSave(data, bookInfo);
                seededBooks.push(saved);
            }
            await sleep(500);
        }
        console.log(`\nSeeded ${seededBooks.length} books.`);
        console.log(`Books with covers: ${seededBooks.filter(b => b.coverImage).length}`);
        console.log(`Books without covers: ${seededBooks.filter(b => !b.coverImage).length}`);

        // 2. Demo User Activity
        console.log('\n--- 2. Seeding Activity ---');
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
                googleBookId: book.googleBookId,
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
