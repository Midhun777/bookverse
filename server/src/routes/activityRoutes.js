const express = require('express');
const router = express.Router();
const { logActivity, getMyActivities, getGlobalActivity } = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/global', getGlobalActivity); // Public feed
router.post('/log', protect, logActivity);
router.get('/my', protect, getMyActivities);

module.exports = router;
