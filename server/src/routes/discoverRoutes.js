const express = require('express');
const router = express.Router();
const discoverController = require('../controllers/discoverController');

router.get('/', discoverController.getDiscoverData);

module.exports = router;
