const Note = require('../models/Note');

// @desc    Add a note
// @route   POST /api/notes/add
// @access  Private
const addNote = async (req, res) => {
    try {
        const { googleBookId, noteText } = req.body;

        if (!noteText) {
            return res.status(400).json({ message: 'Note text is required' });
        }

        const note = await Note.create({
            userId: req.user._id,
            googleBookId,
            noteText
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notes for user
// @route   GET /api/notes/my
// @access  Private
const getMyNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/update/:noteId
// @access  Private
const updateNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        note.noteText = req.body.noteText || note.noteText;
        note.updatedAt = Date.now();

        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/delete/:noteId
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await note.deleteOne();
        res.json({ message: 'Note removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addNote,
    getMyNotes,
    updateNote,
    deleteNote
};
