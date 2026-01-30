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
    // Fetch last 100 activities
    const activities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100);

    const profile = {
        themes: {}, // habit: 5, fantasy: 2
        categories: {},
        authors: {},
        keywords: [],
        viewedBooks: new Set(),
        completedBooks: new Set()
    };

    activities.forEach(act => {
        // Track specific books
        if (act.openLibraryId) {
            profile.viewedBooks.add(act.openLibraryId);
            if (act.actionType === 'COMPLETE') {
                profile.completedBooks.add(act.openLibraryId);
            }
        }

        // Keywords
        if (act.keyword) {
            profile.keywords.push(act.keyword.toLowerCase());
        }

        // We need to look up book details for VIEW/LIKE/COMPLETE if not stored in Activity heavily
        // ideally Activity has some metadata, but if not we might need to lazy load.
        // For now, let's assume we rely heavily on the activity metadata (category, authors).

        if (act.category) {
            profile.categories[act.category] = (profile.categories[act.category] || 0) + 1;
        }

        if (act.authors && act.authors.length > 0) {
            act.authors.forEach(auth => {
                profile.authors[auth] = (profile.authors[auth] || 0) + 1;
            });
        }
    });

    // Normalize Keywords (take top 5)
    // (Simplification for now)

    return profile;
};

/**
 * Score a list of candidate books against a user profile.
 */
const scoreBooks = (books, profile) => {
    const scored = books.map(book => {
        let score = 0;
        const reasons = [];

        // 1. Themes (High Value)
        // BookMaster has themes, Profile has derived interests? 
        // We might need to map profile categories to themes or infer.
        if (book.themes && book.themes.length > 0) {
            // Check if user has searched for these themes
            book.themes.forEach(theme => {
                if (profile.keywords.some(k => k.includes(theme.toLowerCase()))) {
                    score += SCORES.THEME_MATCH;
                    reasons.push(`Matches your interest in ${theme}`);
                }
            });
        }

        // 2. Author Match
        if (book.authors) {
            book.authors.forEach(auth => {
                if (profile.authors[auth]) {
                    score += SCORES.AUTHOR_MATCH * profile.authors[auth]; // Multiply by affinity
                    reasons.push(`From ${auth}, an author you've read`);
                }
            });
        }

        // 3. Category Match
        if (book.subjects) {
            book.subjects.forEach(sub => {
                // Fuzzy match
                const match = Object.keys(profile.categories).find(c => sub.includes(c) || c.includes(sub));
                if (match) {
                    score += SCORES.CATEGORY_MATCH;
                    reasons.push(`Because you read ${match}`);
                }
            });
        }

        // 4. Global Signals
        if (book.popularityScore > 100) score += SCORES.POPULARITY;
        if (book.isTrending) score += SCORES.TRENDING;
        if (book.isClassic) score += SCORES.CLASSIC;

        return {
            ...book.toObject(),
            recommendationScore: score,
            reasons: [...new Set(reasons)].slice(0, 3) // dedupe and top 3
        };
    });

    return scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
};

const getRecommendations = async (userId) => {
    const profile = await getUserProfile(userId);

    // 1. Get Candidates (Filter out completed)
    // Fetch top 200 books from Master
    const candidates = await BookMaster.find({
        openLibraryId: { $nin: Array.from(profile.completedBooks) }
    }).limit(200);

    // 2. Score
    const scoredBooks = scoreBooks(candidates, profile);

    return scoredBooks.slice(0, 20); // Return top 20
};

module.exports = {
    getUserProfile,
    scoreBooks,
    getRecommendations
};
