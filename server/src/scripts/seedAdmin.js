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
            name: 'Admin User',
            email: 'admin@bookverse.com',
            username: 'admin',
            password: 'admin123', // Admin credentials
            role: 'ADMIN'
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
