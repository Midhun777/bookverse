const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const resetUser = async () => {
    try {
        await connectDB();
        console.log('Resetting Demo User...');

        const email = 'demo@bookverse.com';
        await User.deleteOne({ email });

        const user = await User.create({
            username: 'demoreader',
            name: 'Demo Reader',
            email: email,
            password: 'password123', // Will be hashed by pre-save hook
            isAdmin: false
        });

        console.log('Demo User Reset: ', user.email);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetUser();
