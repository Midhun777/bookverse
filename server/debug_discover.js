const mongoose = require('mongoose');
const DiscoverBook = require('./src/models/DiscoverBook');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const books = await DiscoverBook.find({ title: { $in: ['Clean Code', 'Cosmos', 'Refactoring'] } });
    console.log(JSON.stringify(books, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
