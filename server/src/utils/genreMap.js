/**
 * Keyword-to-Genre Map
 * Used to detect user intent from search queries.
 */
const KEYWORD_GENRE_MAP = {
    // FINANCE
    'money': 'FINANCE',
    'finance': 'FINANCE',
    'investment': 'FINANCE',
    'rich': 'FINANCE',
    'wealth': 'FINANCE',
    'business': 'FINANCE',
    'stocks': 'FINANCE',
    'trading': 'FINANCE',
    'bitcoin': 'FINANCE',
    'economy': 'FINANCE',

    // LOVE / ROMANCE
    'love': 'LOVE',
    'romance': 'LOVE',
    'relationship': 'LOVE',
    'heart': 'LOVE',
    'dating': 'LOVE',
    'marriage': 'LOVE',
    'passion': 'LOVE',
    'soulmate': 'LOVE',
    'crush': 'LOVE',

    // SELF-HELP
    'habits': 'SELF_HELP',
    'motivation': 'SELF_HELP',
    'self improvement': 'SELF_HELP',
    'personal growth': 'SELF_HELP',
    'productivity': 'SELF_HELP',
    'psychology': 'SELF_HELP',
    'happiness': 'SELF_HELP',
    'mindfulness': 'SELF_HELP',
    'confidence': 'SELF_HELP',
    'focus': 'SELF_HELP',

    // FANTASY
    'magic': 'FANTASY',
    'wizard': 'FANTASY',
    'fantasy': 'FANTASY',
    'dragon': 'FANTASY',
    'sword': 'FANTASY',
    'mythical': 'FANTASY',
    'quest': 'FANTASY',
    'witch': 'FANTASY',
    'kingdom': 'FANTASY',
    'orc': 'FANTASY',

    // MYSTERY / THRILLER
    'mystery': 'MYSTERY',
    'thriller': 'MYSTERY',
    'crime': 'MYSTERY',
    'detective': 'MYSTERY',
    'suspense': 'MYSTERY',
    'murder': 'MYSTERY',
    'noir': 'MYSTERY',
    'spy': 'MYSTERY',
    'investigation': 'MYSTERY',
    'clue': 'MYSTERY',

    // SCIENCE
    'science': 'SCIENCE',
    'physics': 'SCIENCE',
    'biology': 'SCIENCE',
    'cosmos': 'SCIENCE',
    'nature': 'SCIENCE',
    'evolution': 'SCIENCE',
    'space': 'SCIENCE',
    'astronomy': 'SCIENCE',
    'universe': 'SCIENCE',
    'dna': 'SCIENCE',

    // HISTORY
    'history': 'HISTORY',
    'war': 'HISTORY',
    'biography': 'HISTORY',
    'historical': 'HISTORY',
    'empire': 'HISTORY',
    'civilization': 'HISTORY',
    'ancient': 'HISTORY',
    'revolution': 'HISTORY',
    'monarchy': 'HISTORY',

    // TECHNOLOGY
    'coding': 'TECHNOLOGY',
    'programming': 'TECHNOLOGY',
    'software': 'TECHNOLOGY',
    'tech': 'TECHNOLOGY',
    'computer': 'TECHNOLOGY',
    'ai': 'TECHNOLOGY',
    'web development': 'TECHNOLOGY',
    'python': 'TECHNOLOGY',
    'javascript': 'TECHNOLOGY',
    'algorithm': 'TECHNOLOGY'
};

/**
 * Detects genre from a search keyword.
 * @param {string} keyword 
 * @returns {string|null}
 */
const detectGenre = (keyword) => {
    if (!keyword) return null;
    const lowerKeyword = keyword.toLowerCase().trim();

    // Exact match
    if (KEYWORD_GENRE_MAP[lowerKeyword]) {
        return KEYWORD_GENRE_MAP[lowerKeyword];
    }

    // Partial match (contains)
    for (const [key, genre] of Object.entries(KEYWORD_GENRE_MAP)) {
        if (lowerKeyword.includes(key)) {
            return genre;
        }
    }

    return null;
};

module.exports = {
    KEYWORD_GENRE_MAP,
    detectGenre
};
