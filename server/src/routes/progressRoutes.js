const express = require('express');
const router = express.Router();
const { updateProgress, getProgress } = require('../controllers/progressController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/update', protect, updateProgress);
router.get('/:googleBookId', protect, getProgress);

module.exports = router;
