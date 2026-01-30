const express = require('express');
const router = express.Router();
const { getAllUsers, banUser, deleteUser, updateSettings, getAppStats, getSettings, getAllReviews } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/users', protect, authorize('ADMIN'), getAllUsers);
router.put('/ban/:userId', protect, authorize('ADMIN'), banUser);
router.delete('/delete-user/:userId', protect, authorize('ADMIN'), deleteUser);
router.put('/settings', protect, authorize('ADMIN'), updateSettings);
router.get('/stats', protect, authorize('ADMIN'), getAppStats);
router.get('/reviews', protect, authorize('ADMIN'), getAllReviews);
router.get('/settings', getSettings);

module.exports = router;
