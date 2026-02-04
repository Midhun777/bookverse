const axios = require('axios');
const fs = require('fs');

const books = [
    "Dune Frank Herbert",
    "The Subtle Art of Not Giving a F*ck Mark Manson",
    "Brief Answers to the Big Questions Stephen Hawking",
    "The Psychology of Money Morgan Housel",
    "Rich Dad Poor Dad Robert Kiyosaki",
    "Man's Search for Meaning Viktor Frankl",
    "Sapiens Yuval Noah Harari",
    "The Intelligent Investor Benjamin Graham",
    "Principles: Life and Work Ray Dalio",
    "Atomic Habits James Clear",
    "A Brief History of Time Stephen Hawking",
    "Astrophysics for People in a Hurry Neil deGrasse Tyson"
];

const findIds = async () => {
    const results = [];
    for (const query of books) {
        try {
            const res = await axios.get('https://www.googleapis.com/books/v1/volumes', {
                params: { q: query, maxResults: 1 },
                timeout: 5000
            });
            const item = res.data.items?.[0];
            if (item) {
                results.push({
                    query,
                    id: item.id,
                    title: item.volumeInfo.title,
                    authors: item.volumeInfo.authors,
                    coverImage: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')
                });
                console.log(`[FOUND] "${query}"`);
            } else {
                results.push({ query, error: 'Not found' });
                console.log(`[NOT FOUND] "${query}"`);
            }
        } catch (err) {
            results.push({ query, error: err.message });
            console.error(`[ERROR] "${query}":`, err.message);
        }
    }
    fs.writeFileSync('found_ids.json', JSON.stringify(results, null, 2));
    console.log('Results saved to found_ids.json');
};

findIds();
