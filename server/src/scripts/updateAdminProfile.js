const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const admin = await User.findOne({ role: 'ADMIN' });
        if (!admin) {
            console.log('No admin found to update. Please run seedAdmin.js first.');
            process.exit();
        }

        admin.name = 'Project Libra';
        admin.avatar = 'https://ui-avatars.com/api/?name=Libra&background=0D9488&color=fff&size=512&bold=true';
        admin.bio = 'Chief Librarian & System Architect. Overseeing the ultimate digital library experience.';
        admin.location = 'The Verse';

        await admin.save();
        console.log('Admin profile updated to "Project Libra" aesthetic!');
        process.exit();
    } catch (error) {
        console.error('Error updating admin:', error);
        process.exit(1);
    }
};

updateAdmin();
