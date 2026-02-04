const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const adminExists = await User.findOne({ role: 'ADMIN' });
        if (adminExists) {
            console.log('Admin already exists:', adminExists.email);
            process.exit();
        }

        const admin = new User({
            name: 'Project Libra',
            email: 'admin@bookverse.com',
            username: 'admin',
            password: 'admin123',
            role: 'ADMIN',
            avatar: 'https://ui-avatars.com/api/?name=Libra&background=0D9488&color=fff&size=512&bold=true',
            bio: 'Chief Librarian & System Architect. Overseeing the ultimate digital library experience.',
            location: 'The Verse'
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@bookverse.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
