const axios = require('axios');

async function testRatings() {
    const API_KEY = 'AIzaSyDd2Z3sTm3uoVe4cR1F5aLxO6Wf94n2kR8';
    const query = 'programming';

    console.log('--- Search Results ---');
    const searchRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${API_KEY}`);
    searchRes.data.items.slice(0, 5).forEach(item => {
        console.log(`${item.volumeInfo.title}: rating=${item.volumeInfo.averageRating}, count=${item.volumeInfo.ratingsCount}`);
    });

    console.log('\n--- Detail Results ---');
    for (const item of searchRes.data.items.slice(0, 5)) {
        const detailRes = await axios.get(`https://www.googleapis.com/books/v1/volumes/${item.id}?key=${API_KEY}`);
        console.log(`${detailRes.data.volumeInfo.title}: rating=${detailRes.data.volumeInfo.averageRating}, count=${detailRes.data.volumeInfo.ratingsCount}`);
    }
}

testRatings();
