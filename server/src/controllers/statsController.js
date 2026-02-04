const ReadingStats = require('../models/ReadingStats');
const ReadingSession = require('../models/ReadingSession');
const User = require('../models/User');
const ReadingList = require('../models/ReadingList');
const BookMaster = require('../models/BookMaster');
const Review = require('../models/Review');
const Note = require('../models/Note');

// @desc    Update reading session time
// @route   POST /api/stats/session
// @access  Private
const updateReadingSession = async (req, res) => {
    try {
        const { googleBookId, durationMinutes } = req.body;

        let stats = await ReadingStats.findOne({ userId: req.user._id, googleBookId });

        if (stats) {
            stats.totalReadingMinutes += durationMinutes;
            stats.sessionsCount += 1;
            stats.lastReadAt = Date.now();
            await stats.save();
        } else {
            stats = await ReadingStats.create({
                userId: req.user._id,
                googleBookId,
                totalReadingMinutes: durationMinutes,
                sessionsCount: 1,
                lastReadAt: Date.now()
            });
        }

        // Add to ReadingSession for granular tracking
        await ReadingSession.create({
            userId: req.user._id,
            googleBookId,
            durationMinutes,
            timestamp: Date.now()
        });

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get public profile stats
// @route   GET /api/users/profile/:username
// @access  Public
const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stats = await ReadingStats.find({ userId: user._id });
        const completedBooks = await ReadingList.find({ userId: user._id, status: 'COMPLETED' });
        const reviewCount = await Review.countDocuments({ userId: user._id });
        const notesCount = await Note.countDocuments({ userId: user._id });
        const savedCount = await ReadingList.countDocuments({ userId: user._id, status: { $in: ['TO_READ', 'READING'] } });

        const totalReadingTime = stats.reduce((acc, item) => acc + item.totalReadingMinutes, 0);
        const totalBooksRead = completedBooks.length;

        // Fetch book details for completed books to get page counts
        const googleBookIds = completedBooks.map(b => b.googleBookId);
        const books = await BookMaster.find({ googleBookId: { $in: googleBookIds } });
        const bookMap = {};
        books.forEach(b => bookMap[b.googleBookId] = b);

        const totalPagesRead = completedBooks.reduce((acc, b) => acc + (bookMap[b.googleBookId]?.pageCount || 0), 0);

        // Fetch ALL reading sessions to calculate streak and daily average
        const allSessions = await ReadingSession.find({ userId: user._id }).sort({ timestamp: -1 });

        // Calculate Streak
        let currentStreak = 0;
        if (allSessions.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let lastDate = new Date(allSessions[0].timestamp);
            lastDate.setHours(0, 0, 0, 0);

            // If last session was today or yesterday, streak is potentially active
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                currentStreak = 1;
                let checkDate = lastDate;

                for (let i = 1; i < allSessions.length; i++) {
                    const sessionDate = new Date(allSessions[i].timestamp);
                    sessionDate.setHours(0, 0, 0, 0);

                    const dayDiff = Math.floor((checkDate - sessionDate) / (1000 * 60 * 60 * 24));

                    if (dayDiff === 1) {
                        currentStreak++;
                        checkDate = sessionDate;
                    } else if (dayDiff > 1) {
                        break;
                    }
                }
            }
        }

        // Daily Average (Total Pages / Days since first session)
        let avgPagesPerDay = 0;
        if (allSessions.length > 0) {
            const firstSessionDate = new Date(allSessions[allSessions.length - 1].timestamp);
            const today = new Date();
            const totalDays = Math.max(Math.floor((today - firstSessionDate) / (1000 * 60 * 60 * 24)), 1);
            avgPagesPerDay = Math.round(totalPagesRead / totalDays);
        }

        // Ahead / Behind Schedule
        // Assume annual goal of 30 for now (can be user settings later)
        const annualGoal = 30;
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const expectedBooksRead = (dayOfYear / 365) * annualGoal;
        const aheadOfSchedule = Math.round(totalBooksRead - expectedBooksRead);

        // Fetch last 7 days of reading sessions for chart
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentSessions = allSessions.filter(s => s.timestamp >= sevenDaysAgo);

        // Aggregate by day
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyActivityMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            weeklyActivityMap[dayNames[d.getDay()]] = 0;
        }

        recentSessions.forEach(session => {
            const dayName = dayNames[new Date(session.timestamp).getDay()];
            if (weeklyActivityMap[dayName] !== undefined) {
                weeklyActivityMap[dayName] += session.durationMinutes;
            }
        });

        const weeklyActivity = Object.entries(weeklyActivityMap).map(([day, minutes]) => ({
            day,
            minutes
        })).reverse();

        // Favorite Genres enrichment (based on books read)
        const genreCounts = {};
        books.forEach(b => {
            const subjects = Array.isArray(b.subjects) ? b.subjects : (b.genre ? [b.genre] : []);
            subjects.forEach(s => {
                genreCounts[s] = (genreCounts[s] || 0) + 1;
            });
        });

        const genreDistribution = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));

        const favoriteGenres = genreDistribution.slice(0, 3).map(g => g.name);

        if (favoriteGenres.length === 0) {
            favoriteGenres.push('Fiction', 'Science', 'History');
        }

        res.json({
            user,
            totalReadingTime,
            totalBooksRead,
            totalPagesRead,
            avgPagesPerDay,
            currentStreak,
            aheadOfSchedule,
            favoriteGenres,
            genreDistribution,
            weeklyActivity,
            completedBooks,
            reviewCount,
            notesCount,
            savedCount,
            timeline: completedBooks.map(b => ({ bookId: b.googleBookId, date: b.completedAt }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    updateReadingSession,
    getPublicProfile
};
