const express = require('express');
const router = express.Router();
const { updateReadingSession, getPublicProfile } = require('../controllers/statsController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/session', protect, updateReadingSession);
router.get('/profile/:username', getPublicProfile);

module.exports = router;
