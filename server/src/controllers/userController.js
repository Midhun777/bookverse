const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.username = req.body.username || user.username;
            user.avatar = req.body.avatar || user.avatar;
            if (req.body.password) {
                user.password = req.body.password; // Plain text
            }

            const updatedUser = await user.save();

            const generateToken = (id) => {
                return jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: '30d'
                });
            };

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMe,
    updateUserProfile
};
