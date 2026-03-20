require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity'); 

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        
        const res1 = await Activity.deleteMany({ googleBookId: 'HP93DAAAQBAJ' });
        console.log(`Deleted Subtle Art Activity: ${res1.deletedCount}`);
        
        const books = await BookMaster.find({ 
            googleBookId: { $nin: ['HP93DAAAQBAJ', 'fFCjDQAAQBAJ', 'reY8DwAAQBAJ', 'M22fAwAAQBAJ'] } 
        }).limit(5); // Exclude the ones already visible to make sure the new one is different
        
        if (books.length > 0) {
            const targetBookId = books[0].googleBookId; 
            const acts = Array(20).fill({
                googleBookId: targetBookId,
                actionType: 'VIEW'
            });
            try {
                await Activity.insertMany(acts);
                console.log(`Inserted 20 view activities for ${targetBookId} (${books[0].title})`);
            } catch (e) {
                console.error('Failed to insert activity', e.message);
            }
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
