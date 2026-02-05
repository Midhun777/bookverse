const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DiscoverBook = require('../models/DiscoverBook');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const DISCOVER_DATA = [
    // TECH - Tech Titans
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "TECH",
        description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
        coverUrl: "https://covers.openlibrary.org/b/id/12534571-L.jpg",
        publishedYear: 2008,
        rating: 4.4,
        isFree: false
    },
    {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt, David Thomas",
        category: "TECH",
        description: "Your journey to mastery. One of the most significant books in software development.",
        coverUrl: "https://covers.openlibrary.org/b/id/10134447-L.jpg",
        publishedYear: 1999,
        rating: 4.3,
        isFree: false
    },
    {
        title: "The Phoenix Project",
        author: "Gene Kim, Kevin Behr",
        category: "TECH",
        description: "A Novel about IT, DevOps, and Helping Your Business Win.",
        coverUrl: "https://covers.openlibrary.org/b/id/8440794-L.jpg",
        publishedYear: 2013,
        rating: 4.2,
        isFree: false
    },
    {
        title: "Code: The Hidden Language",
        author: "Charles Petzold",
        category: "TECH",
        description: "An amazing journey into the history of how computers work at the lowest level.",
        coverUrl: "https://covers.openlibrary.org/b/id/10257007-L.jpg",
        publishedYear: 1999,
        rating: 4.4,
        isFree: false
    },
    {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        category: "TECH",
        description: "The definitive guide to algorithms and data structures.",
        coverUrl: "https://covers.openlibrary.org/b/id/12836262-L.jpg",
        publishedYear: 1990,
        rating: 4.3,
        isFree: false
    },
    {
        title: "Refactoring",
        author: "Martin Fowler",
        category: "TECH",
        description: "Improving the Design of Existing Code. A must-have for every serious developer.",
        coverUrl: "https://covers.openlibrary.org/b/id/12693998-L.jpg",
        publishedYear: 1999,
        rating: 4.2,
        isFree: false
    },
    {
        title: "Design Patterns",
        author: "Erich Gamma, Richard Helm",
        category: "TECH",
        description: "Elements of Reusable Object-Oriented Software.",
        coverUrl: "https://covers.openlibrary.org/b/id/10185975-L.jpg",
        publishedYear: 1994,
        rating: 4.1,
        isFree: false
    },

    // FINANCE - Money & Wealth
    {
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        category: "FINANCE",
        description: "What the rich teach their kids about money that the poor and middle class do not!",
        coverUrl: "https://covers.openlibrary.org/b/id/12668582-L.jpg",
        publishedYear: 1997,
        rating: 4.1,
        isFree: false
    },
    {
        title: "The Intelligent Investor",
        author: "Benjamin Graham",
        category: "FINANCE",
        description: "The classic text on value investing. Widely considered the stock market bible.",
        coverUrl: "https://covers.openlibrary.org/b/id/12674313-L.jpg",
        publishedYear: 1949,
        rating: 4.2,
        isFree: false
    },
    {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        category: "FINANCE",
        description: "Timeless lessons on wealth, greed, and happiness.",
        coverUrl: "https://covers.openlibrary.org/b/id/11187425-L.jpg",
        publishedYear: 2020,
        rating: 4.4,
        isFree: false
    },
    {
        title: "The Little Book of Common Sense Investing",
        author: "John C. Bogle",
        category: "FINANCE",
        description: "The only way to guarantee your fair share of stock market returns.",
        coverUrl: "https://covers.openlibrary.org/b/id/12613136-L.jpg",
        publishedYear: 2007,
        rating: 4.3,
        isFree: false
    },
    {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        category: "FINANCE",
        description: "The most famous of all teachers of success spent a fortune and the better part of a lifetime of effort.",
        coverUrl: "https://covers.openlibrary.org/b/id/12674258-L.jpg",
        publishedYear: 1937,
        rating: 4.2,
        isFree: false
    },

    // SELF_HELP - Self-Improvement Essentials
    {
        title: "Atomic Habits",
        author: "James Clear",
        category: "SELF_HELP",
        description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
        coverUrl: "https://covers.openlibrary.org/b/id/12535794-L.jpg", // Verified Atomic Habits
        publishedYear: 2018,
        rating: 4.4,
        isFree: false
    },
    {
        title: "Deep Work",
        author: "Cal Newport",
        category: "SELF_HELP",
        description: "Rules for Focused Success in a Distracted World.",
        coverUrl: "https://covers.openlibrary.org/b/id/12534515-L.jpg",
        publishedYear: 2016,
        rating: 4.2,
        isFree: false
    },
    {
        title: "Man's Search for Meaning",
        author: "Viktor E. Frankl",
        category: "SELF_HELP",
        description: "Psychiatrist Viktor Frankl's memoir of life in Nazi death camps.",
        coverUrl: "https://covers.openlibrary.org/b/id/12534533-L.jpg",
        publishedYear: 1946,
        rating: 4.4,
        isFree: false
    },
    {
        title: "Ikigai",
        author: "Hector Garcia",
        category: "SELF_HELP",
        description: "The Japanese Secret to a Long and Happy Life.",
        coverUrl: "https://covers.openlibrary.org/b/id/12534551-L.jpg",
        publishedYear: 2016,
        rating: 4.1,
        isFree: false
    },

    // SCIENCE - Scientific Explorations
    {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        category: "SCIENCE",
        description: "A Brief History of Humankind.",
        coverUrl: "https://covers.openlibrary.org/b/id/12534569-L.jpg",
        publishedYear: 2011,
        rating: 4.4,
        isFree: false
    },
    {
        title: "Cosmos",
        author: "Carl Sagan",
        category: "SCIENCE",
        description: "The cosmos is all that is or ever was or ever will be.",
        coverUrl: "https://covers.openlibrary.org/b/id/12534587-L.jpg",
        publishedYear: 1980,
        rating: 4.4,
        isFree: false
    },
    {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "SCIENCE",
        description: "Was there a beginning of time? Could time run backwards?",
        coverUrl: "https://covers.openlibrary.org/b/id/12534605-L.jpg",
        publishedYear: 1988,
        rating: 4.2,
        isFree: false
    },

    // POPULAR - Most Loved Worldwide
    {
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "POPULAR",
        description: "An Andalusian shepherd boy named Santiago travels from his homeland in Spain to the Egyptian desert.",
        coverUrl: "https://covers.openlibrary.org/b/id/12668595-L.jpg",
        publishedYear: 1988,
        rating: 3.9,
        isFree: false
    },
    {
        title: "The Da Vinci Code",
        author: "Dan Brown",
        category: "POPULAR",
        description: "While in Paris, Harvard symbologist Robert Langdon is awakened by a phone call.",
        coverUrl: "https://covers.openlibrary.org/b/id/12668612-L.jpg",
        publishedYear: 2003,
        rating: 3.9,
        isFree: false
    },
    {
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        category: "POPULAR",
        description: "Harry Potter has no idea how famous he is. That's because he's being raised by his miserable aunt and uncle.",
        coverUrl: "https://covers.openlibrary.org/b/id/10521270-L.jpg",
        publishedYear: 1997,
        rating: 4.5,
        isFree: false
    }
];

const seedDiscoverBooks = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB...');

        await DiscoverBook.deleteMany({});
        console.log('Cleared existing Discover books.');

        const result = await DiscoverBook.insertMany(DISCOVER_DATA);
        console.log(`Successfully seeded ${result.length} Discover books.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding Discover books:', error);
        process.exit(1);
    }
};

seedDiscoverBooks();
