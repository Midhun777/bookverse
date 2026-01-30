const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

const testGlobalActivity = async () => {
    try {
        console.log('Testing Global Activity Feed...');
        const res = await axios.get(`${API_URL}/activities/global`);
        console.log(`Global Activities Found: ${res.data.length}`);
        if (res.data.length > 0) {
            console.log('First Activity:', res.data[0]);
        }
    } catch (error) {
        console.error('FAILED:', error.message);
        if (error.response) console.error(error.response.data);
    }
};

testGlobalActivity();
