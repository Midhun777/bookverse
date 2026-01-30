const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BookMaster = require('../models/BookMaster');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const clear = async () => {
    await connectDB();
    console.log('Clearing BookMaster...');
    await BookMaster.deleteMany({});
    console.log('Done.');
    process.exit();
};

clear();
