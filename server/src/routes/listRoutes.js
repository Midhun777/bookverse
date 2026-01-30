const express = require('express');
const router = express.Router();
const { addToReaderList, updateStatus, getMyLists, removeFromList } = require('../controllers/listController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/add', protect, addToReaderList);
router.put('/update-status', protect, updateStatus);
router.get('/my', protect, getMyLists);
router.delete('/remove/:googleBookId', protect, removeFromList);

module.exports = router;
