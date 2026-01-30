const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Activity = require('../models/Activity');
const SavedBook = require('../models/SavedBook');
const ReadingList = require('../models/ReadingList');
const ReadingProgress = require('../models/ReadingProgress');
const Review = require('../models/Review');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const users = [
    {
        name: 'Arjun Menon',
        email: 'arjun@example.com',
        username: 'arjunm',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=arjun',
        bio: 'Software engineer from Kochi. I love reading technical thrillers and Malayalam literature.',
        location: 'Kochi, Kerala',
        favoriteGenres: ['Thriller', 'Technology', 'Malayalam Literature'],
        twitter: '@arjuncodes'
    },
    {
        name: 'Lakshmi Nair',
        email: 'lakshmi@example.com',
        username: 'lakshmin',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=lakshmi',
        bio: 'History teacher based in Trivandrum. Fascinated by ancient civilizations and classic novels.',
        location: 'Thiruvananthapuram, Kerala',
        favoriteGenres: ['History', 'Classics', 'Historical Fiction'],
        website: 'https://lakshmireads.com'
    },
    {
        name: 'Rahul Pillai',
        email: 'rahul@example.com',
        username: 'rahulp',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=rahul',
        bio: 'Food blogger and avid reader. I enjoy cookbooks and travelogues.',
        location: 'Calicut, Kerala',
        favoriteGenres: ['Cooking', 'Travel', 'Food']
    },
    {
        name: 'Anjali Thomas',
        email: 'anjali@example.com',
        username: 'anjalit',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=anjali',
        bio: 'Student at TKM. Love fantasy novels and getting lost in magical worlds.',
        location: 'Kollam, Kerala',
        favoriteGenres: ['Fantasy', 'Young Adult', 'Magic'],
        twitter: '@anjali_dreamer'
    },
    {
        name: 'Fahad K.',
        email: 'fahad@example.com',
        username: 'fahadk',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=fahad',
        bio: 'Filmmaker and scriptwriter. Always looking for inspiration in dramatic stories.',
        location: 'Alappuzha, Kerala',
        favoriteGenres: ['Drama', 'Cinema', 'Biography']
    }
];

const books = [
    { id: '/works/OL468431W', title: 'The Great Gatsby', category: 'Fiction', authors: ['F. Scott Fitzgerald'], thumbnail: 'https://covers.openlibrary.org/b/id/10590366-M.jpg' },
    { id: '/works/OL66554W', title: 'Pride and Prejudice', category: 'Classic', authors: ['Jane Austen'], thumbnail: 'https://covers.openlibrary.org/b/id/14348537-M.jpg' },
    { id: '/works/OL1168083W', title: '1984', category: 'Fiction', authors: ['George Orwell'], thumbnail: 'https://covers.openlibrary.org/b/id/9267242-M.jpg' },
    { id: '/works/OL3140822W', title: 'To Kill a Mockingbird', category: 'Classic', authors: ['Harper Lee'], thumbnail: 'https://covers.openlibrary.org/b/id/14351077-M.jpg' },
    { id: '/works/OL3335245W', title: 'The Catcher in the Rye', category: 'Fiction', authors: ['J.D. Salinger'], thumbnail: 'https://covers.openlibrary.org/b/id/9273490-M.jpg' }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear existing data (except Admin)
        await User.deleteMany({ email: { $ne: 'admin@bookverse.com' } });
        await Activity.deleteMany({});
        await Review.deleteMany({});
        await SavedBook.deleteMany({});
        await ReadingList.deleteMany({});
        await ReadingProgress.deleteMany({});

        console.log('Cleared existing data...');

        // Create Users
        const createdUsers = await User.insertMany(users);
        console.log(`Created ${createdUsers.length} users...`);

        // Create Activities & Reviews
        for (const user of createdUsers) {
            for (const book of books) {
                // Randomly View
                if (Math.random() > 0.3) {
                    await Activity.create({
                        userId: user._id,
                        actionType: 'VIEW',
                        googleBookId: book.id,
                        keyword: book.title,
                        category: book.category
                    });
                }

                // Randomly Like (and Save)
                if (Math.random() > 0.6) {
                    await Activity.create({
                        userId: user._id,
                        actionType: 'LIKE',
                        googleBookId: book.id,
                        keyword: book.title,
                        category: book.category
                    });

                    // Add to Saved Books (Favorites)
                    await SavedBook.create({
                        userId: user._id,
                        googleBookId: book.id,
                        title: book.title,
                        authors: book.authors,
                        thumbnail: book.thumbnail,
                        categories: [book.category],
                        rating: 4.5
                    });
                }

                // Reading List Status
                const statusRoll = Math.random();
                if (statusRoll > 0.5) {
                    let status = 'TO_READ';
                    if (statusRoll > 0.8) status = 'COMPLETED';
                    else if (statusRoll > 0.65) status = 'READING';

                    const readingListEntry = await ReadingList.create({
                        userId: user._id,
                        googleBookId: book.id,
                        status: status,
                        progressPercent: status === 'COMPLETED' ? 100 : (status === 'READING' ? Math.floor(Math.random() * 90) : 0),
                        startedAt: status !== 'TO_READ' ? new Date() : null,
                        completedAt: status === 'COMPLETED' ? new Date() : null
                    });

                    // Add Progress if Reading
                    if (status === 'READING') {
                        await ReadingProgress.create({
                            userId: user._id,
                            googleBookId: book.id,
                            currentPage: Math.floor(Math.random() * 200),
                            totalPages: 300,
                            lastReadAt: new Date()
                        });
                    }
                }

                // Randomly Review
                if (Math.random() > 0.7) {
                    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
                    await Review.create({
                        userId: user._id,
                        googleBookId: book.id,
                        rating: rating,
                        reviewText: `This book was absolutely amazing! I gave it ${rating} stars.`
                    });
                }
            }
        }

        console.log('Seeding complete!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
