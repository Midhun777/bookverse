const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');
const Favorite = require('../models/Favorite');
const ReadingList = require('../models/ReadingList');

// Score weights
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
 * Build a profile of user interests based on search + like activity.
 * Used as a fallback / "Picks for your Profile" section.
 */
const getUserProfile = async (userId) => {
    const activities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100);

    const profile = {
        genres: {},
        keywords: new Set(),
        excludeIds: new Set()
    };

    if (activities.length === 0) return null;

    activities.forEach(act => {
        if (act.googleBookId && (act.actionType === 'SAVE' || act.actionType === 'COMPLETE' || act.actionType === 'LIKE')) {
            profile.excludeIds.add(act.googleBookId);
        }

        if (act.keyword) {
            profile.keywords.add(act.keyword.toLowerCase());
        }

        if (act.subjects && act.subjects.length > 0) {
            const weight = act.actionType === 'COMPLETE' ? 3 : (act.actionType === 'LIKE' ? 2 : (act.actionType === 'SAVE' ? 2 : 1));
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
const scoreBooks = (books, profile) => {
    const scored = books.map(book => {
        // Convert mongoose doc to plain object if needed
        const bookObj = book.toObject ? book.toObject() : book;
        let personalScore = 0;
        let globalScore = 0;
        const reasons = [];

        // 1. Genre/Subject Match
        if (bookObj.subjects && bookObj.subjects.length > 0) {
            let match = false;
            bookObj.subjects.forEach(sub => {
                if (profile.genres[sub]) {
                    personalScore += SCORES.CATEGORY_MATCH * (profile.genres[sub] || 1);
                    match = true;
                }
            });
            if (match) reasons.push("Matches your interests");
        }

        // 2. Keyword Overlap with book title
        if (profile.keywords.size > 0) {
            const titleWords = bookObj.title.toLowerCase().split(/\s+/);
            let kwMatch = false;
            profile.keywords.forEach(kw => {
                if (titleWords.some(w => w.includes(kw))) {
                    personalScore += SCORES.KEYWORD_MATCH;
                    kwMatch = true;
                }
            });
            if (kwMatch) reasons.push("Relates to your searches");
        }

        // 3. Global Stats
        if (bookObj.popularityScore > 50) globalScore += SCORES.POPULARITY;
        if (bookObj.isTrending) globalScore += SCORES.TRENDING;

        return {
            ...bookObj,
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

/**
 * Fetch similar books on a given subject, excluding already-seen books.
 * Returns up to `limit` unique books.
 */
const fetchSimilarBooks = async (subject, excludeIds, seenTitles, limit = 8) => {
    const candidates = await BookMaster.find({
        subjects: subject,
        googleBookId: { $nin: Array.from(excludeIds) }
    })
        .sort({ popularityScore: -1 })
        .limit(limit * 3);

    const unique = [];
    for (const b of candidates) {
        if (!seenTitles.has(b.title.toLowerCase())) {
            unique.push(b);
            seenTitles.add(b.title.toLowerCase());
            excludeIds.add(b.googleBookId);
            if (unique.length >= limit) break;
        }
    }
    return unique;
};

/**
 * SHORTCUT: Detect the last search keyword that preceded a like/favorite.
 * Returns an array of { keyword, subject } pairs inferred from search→like sequences.
 */
const getSearchToLikeSignals = async (userId) => {
    // Fetch last 50 activity events, sorted by time
    const activities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

    const signals = [];
    const seenKeywords = new Set();

    // Walk through activities in reverse (most recent first).
    // If we see a LIKE/FAVORITE, look back for a SEARCH within the next 5 events.
    let i = 0;
    while (i < activities.length) {
        const act = activities[i];

        if (act.actionType === 'LIKE' || act.actionType === 'SAVE') {
            // Look for a recent SEARCH that preceded this like (within next 5 steps)
            const window = activities.slice(i + 1, i + 6);
            const matchingSearch = window.find(a => a.actionType === 'SEARCH' && a.keyword && a.subjects?.length > 0);

            if (matchingSearch && !seenKeywords.has(matchingSearch.keyword.toLowerCase())) {
                seenKeywords.add(matchingSearch.keyword.toLowerCase());
                signals.push({
                    keyword: matchingSearch.keyword,
                    subjects: matchingSearch.subjects,
                    likedBookId: act.googleBookId
                });
            }
        }
        i++;
    }

    return signals.slice(0, 3); // At most 3 search→like shortcut sections
};

/**
 * Main recommendation engine.
 */
const getRecommendations = async (userId) => {
    const sections = [];
    const excludeIds = new Set();
    const seenTitles = new Set();

    // ─────────────────────────────────────────────────
    // STEP 1: Fetch user's Favorites & Reading List
    // ─────────────────────────────────────────────────
    const favorites = await Favorite.find({ userId }).sort({ savedAt: -1 }).limit(10);
    favorites.forEach(f => excludeIds.add(f.googleBookId));

    const readBooks = await ReadingList.find({
        userId,
        status: { $in: ['READING', 'COMPLETED'] }
    }).sort({ updatedAt: -1 }).limit(15);
    readBooks.forEach(r => excludeIds.add(r.googleBookId));

    // ─────────────────────────────────────────────────
    // STEP 2: Activity-based profile (for fallback sections)
    // ─────────────────────────────────────────────────
    const profile = await getUserProfile(userId);
    if (profile && profile.excludeIds) {
        profile.excludeIds.forEach(id => excludeIds.add(id));
    }

    // ─────────────────────────────────────────────────
    // STEP 3: Build sections from Favorites
    // ─────────────────────────────────────────────────
    if (favorites.length > 0) {
        const favBookIds = favorites.map(f => f.googleBookId);
        const masterFavBooks = await BookMaster.find({ googleBookId: { $in: favBookIds } });
        const masterFavMap = {};
        masterFavBooks.forEach(b => (masterFavMap[b.googleBookId] = b));

        let favSections = 0;
        for (const fav of favorites) {
            if (favSections >= 2) break;
            const master = masterFavMap[fav.googleBookId];
            if (!master || !master.subjects || master.subjects.length === 0) continue;

            const mainSubject = master.subjects[0];
            const similar = await fetchSimilarBooks(mainSubject, excludeIds, seenTitles, 8);

            if (similar.length > 0) {
                sections.push({
                    title: `Because you favorited "${master.title}"`,
                    description: `Similar ${mainSubject} books you'll love.`,
                    books: similar.map(b => ({
                        ...b.toObject(),
                        reasons: [`Similar to ${master.title}`]
                    })),
                    type: 'PERSONAL_FAVORITE'
                });
                favSections++;
            }
        }
    }

    // ─────────────────────────────────────────────────
    // STEP 4: Build sections from Read / Currently Reading books
    // ─────────────────────────────────────────────────
    if (readBooks.length > 0) {
        const readBookIds = readBooks.map(r => r.googleBookId);
        const masterReadBooks = await BookMaster.find({ googleBookId: { $in: readBookIds } });
        const masterReadMap = {};
        masterReadBooks.forEach(b => (masterReadMap[b.googleBookId] = b));

        let readSections = 0;
        for (const read of readBooks) {
            if (readSections >= 3) break; // up from 2 → 3 individual sections
            const master = masterReadMap[read.googleBookId];
            if (!master || !master.subjects || master.subjects.length === 0) continue;

            const mainSubject = master.subjects[0];
            const similar = await fetchSimilarBooks(mainSubject, excludeIds, seenTitles, 8);

            if (similar.length > 0) {
                const verb = read.status === 'COMPLETED' ? 'read' : 'reading';
                sections.push({
                    title: `Because you ${verb} "${master.title}"`,
                    description: `Explore more captivating ${mainSubject} titles.`,
                    books: similar.map(b => ({
                        ...b.toObject(),
                        reasons: [`Similar to ${master.title}`]
                    })),
                    type: 'PERSONAL_READ'
                });
                readSections++;
            }
        }

        // ── NEW: aggregate section from ALL read genres ──────────────────
        // Collect every unique genre from the user's entire reading history
        const allReadGenres = [];
        const seenGenres = new Set();
        masterReadBooks.forEach(b => {
            b.subjects.forEach(s => {
                if (!seenGenres.has(s)) {
                    seenGenres.add(s);
                    allReadGenres.push(s);
                }
            });
        });

        if (allReadGenres.length > 0) {
            // Fetch books from any of the read genres, not seen yet
            const nextReadCandidates = await BookMaster.find({
                subjects: { $in: allReadGenres },
                googleBookId: { $nin: Array.from(excludeIds) }
            })
                .sort({ popularityScore: -1 })
                .limit(60);

            const nextReadBooks = [];
            for (const b of nextReadCandidates) {
                if (!seenTitles.has(b.title.toLowerCase())) {
                    nextReadBooks.push(b);
                    seenTitles.add(b.title.toLowerCase());
                    excludeIds.add(b.googleBookId);
                    if (nextReadBooks.length >= 10) break;
                }
            }

            if (nextReadBooks.length > 0) {
                sections.push({
                    title: 'What to Read Next',
                    description: 'Handpicked based on all the genres you have read.',
                    books: nextReadBooks.map(b => ({
                        ...b.toObject(),
                        reasons: ['Based on your reading history']
                    })),
                    type: 'PERSONAL_READ_NEXT'
                });
            }
        }
    }

    // ─────────────────────────────────────────────────
    // STEP 5: SHORTCUT — Search → Like signals
    // If a user searched for something, then liked/saved a book shortly after,
    // we infer they liked that genre from the search context.
    // ─────────────────────────────────────────────────
    const searchLikeSignals = await getSearchToLikeSignals(userId);

    for (const signal of searchLikeSignals) {
        for (const subject of signal.subjects.slice(0, 1)) { // use top subject
            const similar = await fetchSimilarBooks(subject, excludeIds, seenTitles, 8);

            if (similar.length > 0) {
                sections.push({
                    title: `Because you liked "${subject}" books`,
                    description: `More books in the ${subject} genre you favorited.`,
                    books: similar.map(b => ({
                        ...b.toObject(),
                        reasons: [`Matches your favorite genre: ${subject}`]
                    })),
                    type: 'PERSONAL_SEARCH_LIKE'
                });
            }
        }
    }

    // ─────────────────────────────────────────────────
    // STEP 6: Fallback — If we have < 2 personal sections, use activity genres
    // ─────────────────────────────────────────────────
    if (sections.length < 2 && profile && Object.keys(profile.genres).length > 0) {
        const sortedGenres = Object.entries(profile.genres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(g => g[0]);

        const topSearches = await Activity.find({ userId, actionType: 'SEARCH' })
            .sort({ createdAt: -1 })
            .limit(5);

        for (const genre of sortedGenres) {
            if (sections.length >= 5) break;
            const similar = await fetchSimilarBooks(genre, excludeIds, seenTitles, 8);

            if (similar.length > 0) {
                const matchingSearch = topSearches.find(a => a.subjects && a.subjects.includes(genre));
                const sectionTitle = matchingSearch
                    ? `Because you searched for "${matchingSearch.keyword}"`
                    : `Based on your interest in ${genre}`;

                sections.push({
                    title: sectionTitle,
                    description: `Curated ${genre} books chosen for you.`,
                    books: similar.map(b => ({
                        ...b.toObject(),
                        reasons: [matchingSearch ? `Matches your search for "${matchingSearch.keyword}"` : `Top pick in ${genre}`]
                    })),
                    type: 'PERSONAL_GENRE'
                });
            }
        }
    }

    // ─────────────────────────────────────────────────
    // STEP 7: "Picks for your Profile" — broad interest-based mix
    // ─────────────────────────────────────────────────
    if (profile) {
        const topGenres = Object.keys(profile.genres);
        let query = { googleBookId: { $nin: Array.from(excludeIds) } };
        if (topGenres.length > 0) {
            query.subjects = { $in: topGenres };
        }

        let generalCandidates = await BookMaster.find(query)
            .sort({ popularityScore: -1 })
            .limit(150);

        // Broaden if not enough matches
        if (generalCandidates.length < 20) {
            const moreCandidates = await BookMaster.aggregate([
                { $match: { googleBookId: { $nin: [...excludeIds, ...generalCandidates.map(c => c.googleBookId)] } } },
                { $sample: { size: 100 } }
            ]);
            generalCandidates = [...generalCandidates, ...moreCandidates];
        }

        let personalPicks = scoreBooks(generalCandidates, profile).slice(0, 12);

        // If scoring filtered everything out (no genre match), force-include popular books
        if (personalPicks.length === 0 && generalCandidates.length > 0) {
            personalPicks = generalCandidates.slice(0, 8).map(b => {
                const obj = b.toObject ? b.toObject() : b;
                return { ...obj, reasons: ['Recommended for your profile'] };
            });
        }

        if (personalPicks.length > 0) {
            sections.push({
                title: 'Picks for your Profile',
                description: "Books we think you'll love based on your overall activity.",
                books: personalPicks,
                type: 'PERSONAL_MIXED'
            });
        }
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
