const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const booksToFind = [
    'The Great Gatsby',
    'Pride and Prejudice',
    '1984 George Orwell',
    'To Kill a Mockingbird',
    'The Catcher in the Rye'
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function findIds() {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    console.log('Using API Key:', apiKey ? 'YES' : 'NO');

    for (const title of booksToFind) {
        try {
            await sleep(1000); // 1s delay
            const res = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1&key=${apiKey}`);
            if (res.data.items && res.data.items.length > 0) {
                const book = res.data.items[0];
                console.log(`${title}: ${book.id} (${book.volumeInfo.title})`);
            } else {
                console.log(`${title}: NO ID FOUND`);
            }
        } catch (err) {
            console.error(`${title}: Error ${err.response ? err.response.status : err.message}`);
        }
    }
}

findIds();
