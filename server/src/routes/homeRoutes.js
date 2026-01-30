const express = require('express');
const router = express.Router();
const { getHomeBooks } = require('../controllers/homeController');

router.get('/books', getHomeBooks);

module.exports = router;
