const axios = require('axios');

const booksToFind = [
    'The Great Gatsby',
    'Pride and Prejudice',
    '1984 George Orwell',
    'To Kill a Mockingbird',
    'The Catcher in the Rye'
];

async function findOLIds() {
    for (const title of booksToFind) {
        try {
            // Search API
            const res = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=1`);
            if (res.data.docs && res.data.docs.length > 0) {
                const book = res.data.docs[0];
                // key is usually like "/works/OL12345W"
                console.log(`${title}: ${book.key} (${book.title}) - Cover: ${book.cover_i}`);
            } else {
                console.log(`${title}: NO ID FOUND`);
            }
            // Be nice to the API
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.error(`${title}: Error ${err.message}`);
        }
    }
}

findOLIds();
