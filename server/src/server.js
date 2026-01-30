require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/lists', require('./routes/listRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/home', require('./routes/homeRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/discover', require('./routes/discoverRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
