const express = require('express');
const router = express.Router();
const { getDiscoverFeed, getBooksByCategory } = require('../controllers/discoverController');

// @route   GET /api/discover/feed
router.get('/feed', getDiscoverFeed);

// @route   GET /api/discover/books
router.get('/books', getBooksByCategory);
// @route   GET /api/discover/free
router.get('/free', require('../controllers/freeBooksController').getFreeBooks);

module.exports = router;
