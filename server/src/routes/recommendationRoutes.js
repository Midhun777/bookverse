const express = require('express');
const router = express.Router();
const { getMyRecommendations, getGlobalRecommendations, getDiscoverFeed } = require('../controllers/recommendationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/discover', getDiscoverFeed);
router.get('/my', protect, getMyRecommendations);
router.get('/global', getGlobalRecommendations);

module.exports = router;
