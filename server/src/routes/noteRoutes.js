const express = require('express');
const router = express.Router();
const { addNote, getMyNotes, updateNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/add', protect, addNote);
router.get('/my', protect, getMyNotes);
router.put('/update/:noteId', protect, updateNote);
router.delete('/delete/:noteId', protect, deleteNote);

module.exports = router;
