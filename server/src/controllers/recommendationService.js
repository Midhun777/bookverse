const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');

// Weights
const SCORES = {
    CATEGORY_MATCH: 6,
    THEME_MATCH: 5,
    KEYWORD_MATCH: 4,
    AUTHOR_MATCH: 3,
    POPULARITY: 2,
    TRENDING: 2,
    CLASSIC: 1
};

/**
 * Build a profile of user interests based on recent activity.
 */
const getUserProfile = async (userId) => {
    const activities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100);

    const profile = {
        subjects: {}, // 'fiction': 5, 'mystery': 2
        themes: {},
        keywords: new Set(),
        viewedBooks: new Set(),
        completedBooks: new Set(),
        savedBooks: new Set()
    };

    if (activities.length === 0) return null;

    activities.forEach(act => {
        if (act.openLibraryId) {
            profile.viewedBooks.add(act.openLibraryId);
            if (act.actionType === 'COMPLETE') profile.completedBooks.add(act.openLibraryId);
            if (act.actionType === 'SAVE') profile.savedBooks.add(act.openLibraryId);
        }

        if (act.keyword) {
            profile.keywords.add(act.keyword.toLowerCase());
        }

        if (act.subjects && act.subjects.length > 0) {
            act.subjects.forEach(sub => {
                profile.subjects[sub] = (profile.subjects[sub] || 0) + 1;
            });
        }
    });

    return profile;
};

/**
 * Score a list of candidate books against a user profile using REAL DATA.
 */
const scoreBooks = (books, profile) => {
    if (!profile) return [];

    const scored = books.map(book => {
        let personalScore = 0;
        let globalScore = 0;
        const reasons = [];

        // 1. Subject Match (+6)
        if (book.subjects && book.subjects.length > 0) {
            let subjectMatch = false;
            book.subjects.forEach(sub => {
                if (profile.subjects[sub]) {
                    personalScore += SCORES.CATEGORY_MATCH;
                    subjectMatch = true;
                }
            });
            if (subjectMatch) reasons.push("Matches your preferred subjects");
        }

        // 2. Theme Match (+5)
        if (book.themes && book.themes.length > 0) {
            let themeMatch = false;
            book.themes.forEach(theme => {
                if (profile.keywords.has(theme.toLowerCase())) {
                    personalScore += SCORES.THEME_MATCH;
                    themeMatch = true;
                }
            });
            if (themeMatch) reasons.push("Aligns with your explored themes");
        }

        // 3. Keyword Overlap (+4)
        if (profile.keywords.size > 0) {
            let keywordMatch = false;
            const titleWords = book.title.toLowerCase().split(' ');
            profile.keywords.forEach(kw => {
                if (titleWords.includes(kw)) {
                    personalScore += SCORES.KEYWORD_MATCH;
                    keywordMatch = true;
                }
            });
            if (keywordMatch) reasons.push("Matches your recent searches");
        }

        // 4. Popularity (+2 Boost)
        if (book.popularityScore > 50) {
            globalScore += SCORES.POPULARITY;
            reasons.push("Highly rated worldwide");
        }

        // 5. Trending (+2 Boost)
        if (book.isTrending) {
            globalScore += SCORES.TRENDING;
            reasons.push("Trending now");
        }

        return {
            ...book.toObject(),
            personalScore,
            globalScore,
            totalScore: personalScore + globalScore,
            reasons: [...new Set(reasons)].slice(0, 2)
        };
    });

    // HONESTY: Only show in "Picks for You" if there is an actual personal connection
    return scored
        .filter(b => b.personalScore > 0)
        .sort((a, b) => b.totalScore - a.totalScore);
};

const getRecommendations = async (userId) => {
    const profile = await getUserProfile(userId);
    if (!profile) return []; // Return empty if no activity

    // Get Candidates (Filter out already completed)
    const candidates = await BookMaster.find({
        openLibraryId: { $nin: Array.from(profile.completedBooks) }
    }).limit(200);

    const scoredBooks = scoreBooks(candidates, profile);
    return scoredBooks.slice(0, 15);
};

const getGlobalRecommendations = async () => {
    return await BookMaster.find()
        .sort({ popularityScore: -1, ratingsCount: -1 })
        .limit(20);
};

module.exports = {
    getUserProfile,
    scoreBooks,
    getRecommendations,
    getGlobalRecommendations
};
