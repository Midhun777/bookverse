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
        genres: {}, // weighted counts
        keywords: new Set(),
        excludeIds: new Set()
    };

    if (activities.length === 0) return null;

    activities.forEach(act => {
        if (act.googleBookId && (act.actionType === 'SAVE' || act.actionType === 'COMPLETE')) {
            profile.excludeIds.add(act.googleBookId);
        }

        if (act.keyword) {
            profile.keywords.add(act.keyword.toLowerCase());
        }

        if (act.subjects && act.subjects.length > 0) {
            const weight = act.actionType === 'COMPLETE' ? 3 : (act.actionType === 'SAVE' ? 2 : 1);
            act.subjects.forEach(sub => {
                profile.genres[sub] = (profile.genres[sub] || 0) + weight;
            });
        }
    });

    return profile;
};

/**
 * Score a list of candidate books against specific criteria.
 */
const scoreBooks = (books, profile, filterGenre = null) => {
    const scored = books.map(book => {
        let personalScore = 0;
        let globalScore = 0;
        const reasons = [];

        // 1. Genre/Subject Match
        if (book.subjects && book.subjects.length > 0) {
            if (filterGenre && book.subjects.includes(filterGenre)) {
                personalScore += SCORES.CATEGORY_MATCH * 2;
                reasons.push(`Top pick in ${filterGenre}`);
            } else {
                let match = false;
                book.subjects.forEach(sub => {
                    if (profile.genres[sub]) {
                        personalScore += SCORES.CATEGORY_MATCH;
                        match = true;
                    }
                });
                if (match) reasons.push("Matches your interests");
            }
        }

        // 2. Keyword Overlap
        if (profile.keywords.size > 0) {
            const titleWords = book.title.toLowerCase().split(' ');
            let kwMatch = false;
            profile.keywords.forEach(kw => {
                if (titleWords.includes(kw)) {
                    personalScore += SCORES.KEYWORD_MATCH;
                    kwMatch = true;
                }
            });
            if (kwMatch) reasons.push("Relates to your searches");
        }

        // 3. Global Stats
        if (book.popularityScore > 50) globalScore += SCORES.POPULARITY;
        if (book.isTrending) globalScore += SCORES.TRENDING;

        return {
            ...book.toObject(),
            personalScore,
            globalScore,
            totalScore: personalScore + globalScore,
            reasons: [...new Set(reasons)].slice(0, 1)
        };
    });

    return scored
        .filter(b => b.personalScore > 0)
        .sort((a, b) => b.totalScore - a.totalScore);
};

const getRecommendations = async (userId) => {
    const profile = await getUserProfile(userId);
    if (!profile) return [];

    const sections = [];
    const excludeIds = Array.from(profile.excludeIds);

    // 1. Identify Top Genres
    const sortedGenres = Object.entries(profile.genres)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(g => g[0]);

    // 2. Build sections for TOP 2 genres
    const seenTitles = new Set();
    const topActivities = await Activity.find({ userId, actionType: 'SEARCH' })
        .sort({ createdAt: -1 })
        .limit(5);

    for (const genre of sortedGenres.slice(0, 2)) {
        // [FIX] Minimum weight threshold to avoid noise from single accidental searches
        const weight = profile.genres[genre] || 0;
        if (weight < 3) continue;

        const books = await BookMaster.find({
            subjects: genre,
            googleBookId: { $nin: excludeIds }
        }).limit(10);

        const uniqueBooks = [];
        for (const b of books) {
            if (!seenTitles.has(b.title.toLowerCase())) {
                uniqueBooks.push(b);
                seenTitles.add(b.title.toLowerCase());
                if (uniqueBooks.length >= 6) break;
            }
        }

        if (uniqueBooks.length > 0) {
            // Find the specific keyword that triggered this genre
            const matchingActivity = topActivities.find(act =>
                act.subjects && act.subjects.includes(genre)
            );

            const sectionTitle = matchingActivity
                ? `Because you searched for "${matchingActivity.keyword}"`
                : `Based on your interest in ${genre}`;

            sections.push({
                title: sectionTitle,
                description: `Curated ${genre.toLowerCase()} books chosen for you.`,
                books: uniqueBooks.map(b => ({
                    ...b.toObject(),
                    reasons: [matchingActivity ? `Matches your search for "${matchingActivity.keyword}"` : `Top pick in ${genre}`]
                })),
                type: 'PERSONAL_GENRE'
            });
            // Update excludeIds to avoid duplication between sections
            uniqueBooks.forEach(b => excludeIds.push(b.googleBookId));
        }
    }

    // 3. "Recommended for You" Mixed section
    const generalCandidates = await BookMaster.find({
        googleBookId: { $nin: excludeIds }
    }).limit(100);

    const personalPicks = scoreBooks(generalCandidates, profile).slice(0, 6);
    if (personalPicks.length > 0) {
        sections.push({
            title: "Picks for your Profile",
            description: "Books we think you'll love based on your overall activity.",
            books: personalPicks,
            type: 'PERSONAL_MIXED'
        });
    }

    return sections;
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
