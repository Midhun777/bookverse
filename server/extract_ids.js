const mongoose = require('mongoose');
const BookMaster = require('./src/models/BookMaster');
const dotenv = require('dotenv');
dotenv.config();

const extractIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const books = await BookMaster.find({}, 'title googleBookId');
        const mapping = {};
        books.forEach(b => {
            mapping[b.title] = b.googleBookId;
        });
        console.log(JSON.stringify(mapping, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

extractIds();
