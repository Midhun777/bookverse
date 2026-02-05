const DiscoverBook = require('../models/DiscoverBook');
const AdminSettings = require('../models/AdminSettings');

// @desc    Get Static Discover Feed
// @route   GET /api/discover/feed
// @access  Public
const getDiscoverFeed = async (req, res) => {
    try {
        const sections = [
            { category: 'TECH', title: 'Tech Titans', description: 'Master the world of technology' },
            { category: 'FINANCE', title: 'Money & Wealth', description: 'Optimize your financial future' },
            { category: 'SELF_HELP', title: 'Self-Improvement Essentials', description: 'Optimize your life and mindset' },
            { category: 'POPULAR', title: 'Most Loved Worldwide', description: 'Top rated books by the community' },
            { category: 'CLASSICS', title: 'Timeless Classics', description: 'Masterpieces you must read once' },
            { category: 'SCIENCE', title: 'Scientific Explorations', description: 'Understand the universe around you' },
            { category: 'FANTASY', title: 'Fantasy Worlds', description: 'Escape into realms of magic and adventure' },
            { category: 'ROMANCE', title: 'Romantic Tales', description: 'Love and passion in every page' }
        ];

        const feed = await Promise.all(sections.map(async (section) => {
            const books = await DiscoverBook.find({ category: section.category }).limit(10);
            return {
                title: section.title,
                description: section.description,
                category: section.category,
                books: books
            };
        }));

        // Fetch categories for the pill navigation
        const categories = sections.map(s => ({ name: s.title, key: s.category }));

        // Spotlight (featured) book - just pick one from POPULAR or the first book
        const spotlight = await DiscoverBook.findOne({ category: 'POPULAR' }) || await DiscoverBook.findOne();

        // Admin Settings for banner text, etc.
        let settings = await AdminSettings.findOne() || await AdminSettings.create({});

        res.json({
            categories,
            feed,
            featured: spotlight,
            settings
        });
    } catch (error) {
        console.error('Discover Static Feed Error:', error);
        res.status(500).json({ message: 'Server error generating static hub' });
    }
};

// @desc    Get Books by Category
// @route   GET /api/discover/books
// @access  Public
const getBooksByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const books = await DiscoverBook.find({ category: category.toUpperCase() });
        res.json(books);
    } catch (error) {
        console.error('Get books by category error:', error);
        res.status(500).json({ message: 'Server error fetching books' });
    }
};

module.exports = {
    getDiscoverFeed,
    getBooksByCategory
};
