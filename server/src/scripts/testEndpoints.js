const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const CREDENTIALS = {
    email: 'demo@bookverse.com',
    password: 'password123'
};

const test = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, CREDENTIALS);
        const token = loginRes.data.token;
        console.log('Login successful. Token acquired.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Test Discover Feed
        console.log('\nTesting GET /recommendations/discover...');
        const discoverRes = await axios.get(`${API_URL}/recommendations/discover`, config);
        const feed = discoverRes.data.feed;
        console.log(`Discover Feed received with ${feed.length} sections.`);
        feed.forEach(section => {
            console.log(`- ${section.title}: ${section.books.length} books`);
        });

        // 3. Test Personal Recs
        console.log('\nTesting GET /recommendations/my...');
        const myRes = await axios.get(`${API_URL}/recommendations/my`, config);
        console.log(`Personal Recommendations: ${myRes.data.length} books.`);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
};

test();
