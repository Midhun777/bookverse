const Favorite = require('../models/Favorite');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');

// @desc    Get book details by ID (from local DB or Gutenberg)
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if it's a Gutenberg book
        if (id.startsWith('gutenberg_')) {
            const gutenbergId = id.replace('gutenberg_', '');
            const response = await fetch(`https://gutendex.com/books/${gutenbergId}`);

            if (!response.ok) {
                return res.status(response.status).json({ message: 'Gutenberg book not found' });
            }

            const book = await response.json();
            const readLink = book.formats['text/html'] || book.formats['application/epub+zip'] || null;

            return res.json({
                googleBookId: id,
                isFree: true,
                source: 'gutenberg',
                readLink: readLink,
                volumeInfo: {
                    title: book.title,
                    authors: book.authors.map(a => a.name),
                    description: `A public domain book from Project Gutenberg. Subjects: ${book.subjects.join(', ')}`,
                    imageLinks: {
                        thumbnail: book.formats['image/jpeg'] || 'https://via.placeholder.com/300x450?text=Free+Book'
                    },
                    categories: book.bookshelves,
                    pageCount: 100, // Gutenberg doesn't provide page counts
                    averageRating: 0
                }
            });
        }

        // Search by googleBookId (which now stores Google ID or OL ID)
        const book = await BookMaster.findOne({ googleBookId: id });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        console.error("getBookById Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a book to favorites
// @route   POST /api/books/favorites
// @access  Private
const addToFavorites = async (req, res) => {
    try {
        const { googleBookId, title, authors, thumbnail, categories, rating } = req.body;
        console.log(`[FAVORITE] Adding book: ${googleBookId} for user: ${req.user._id}`);

        const existingBook = await Favorite.findOne({ userId: req.user._id, googleBookId });

        if (existingBook) {
            return res.status(400).json({ message: 'Book already in favorites' });
        }

        const favorite = await Favorite.create({
            userId: req.user._id,
            googleBookId,
            title,
            authors,
            thumbnail,
            categories,
            rating
        });

        // Log 'LIKE' activity
        await Activity.create({
            userId: req.user._id,
            actionType: 'LIKE',
            googleBookId,
            keyword: title, // Use title as keyword context
            category: categories ? categories[0] : null
        });

        res.status(201).json(favorite);
    } catch (error) {
        console.error(`[FAVORITE ERROR] Add failed:`, error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a book from favorites
// @route   DELETE /api/books/favorites/:googleBookId
// @access  Private
const removeFromFavorites = async (req, res) => {
    try {
        console.log(`[FAVORITE] Removing book: ${req.params.googleBookId} for user: ${req.user._id}`);
        const book = await Favorite.findOneAndDelete({
            userId: req.user._id,
            googleBookId: req.params.googleBookId
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found in favorites' });
        }

        res.json({ message: 'Book removed from favorites' });
    } catch (error) {
        console.error(`[FAVORITE ERROR] Remove failed:`, error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search books in local DB
// @route   GET /api/books/search
// @access  Public
const searchBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        const searchRegex = new RegExp(q, 'i');
        const books = await BookMaster.find({
            $or: [
                { title: searchRegex },
                { authors: searchRegex },
                { subjects: searchRegex }
            ]
        }).limit(20);

        // Map to Google Books-like structure for frontend compatibility
        const formattedBooks = books.map(book => ({
            id: book.googleBookId || book.openLibraryId,
            volumeInfo: {
                title: book.title,
                authors: book.authors,
                description: book.description,
                imageLinks: {
                    thumbnail: book.coverImage
                },
                categories: book.subjects,
                averageRating: book.popularityScore / 20 // Mocking some rating
            }
        }));

        res.json(formattedBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all favorite books
// @route   GET /api/books/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const books = await Favorite.find({ userId: req.user._id }).sort({ savedAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get free books from Gutendex API
// @route   GET /api/books/free
// @access  Public
const getFreeBooks = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const search = req.query.search || '';

        // Build url based on query
        let url = `https://gutendex.com/books/?page=${page}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Gutendex API returned ${response.status}`);
        }

        const data = await response.json();

        // Map to a format consistent with our frontend
        const formattedBooks = data.results.map(book => {
            // Find HTML or EPUB formats to use for reading
            const readLink = book.formats['text/html'] || book.formats['application/epub+zip'] || null;

            return {
                id: `gutenberg_${book.id}`,
                isFree: true,
                readLink: readLink, // Provide a direct link if we have one
                volumeInfo: {
                    title: book.title,
                    authors: book.authors.map(a => a.name),
                    description: `A public domain book from Project Gutenberg. Subjects: ${book.subjects.join(', ')}`,
                    imageLinks: {
                        thumbnail: book.formats['image/jpeg'] || 'https://via.placeholder.com/96x144?text=Free+Book'
                    },
                    categories: book.bookshelves,
                    averageRating: 0,
                    pageCount: 100, // Unknown
                }
            };
        });

        res.json({
            count: data.count,
            next: data.next ? true : false,
            previous: data.previous ? true : false,
            results: formattedBooks
        });
    } catch (error) {
        console.error("Free Books API Error:", error);
        res.status(500).json({ message: 'Failed to fetch free books: ' + error.message });
    }
};

module.exports = {
    getBookById,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    searchBooks,
    getFreeBooks
};
