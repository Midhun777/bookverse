/**
 * Content Moderation Utility
 * Performs basic keyword-based moderation. 
 * Can be expanded to use AI-based moderation in the future.
 */

const BLACKLIST = ['kill', 'death',
    'garbage', 'trash', 'scam', 'fake', 'worst',
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'crap',
    'offensive', 'slur', 'racist', 'nazi', 'violence',
    'terrorism',
    'faggot', 'nigger', 'cunt', 'whore',
    'slut', 'cock', 'ass', 'damn', 'hell', 'motherfucker',
    'retard', 'spastic', 'cripple', 'kill yourself', 'kys',
    'die', 'murder', 'rape', 'explicit', 'porn', 'sex',
    'naked', 'nudity', 'filthy'
];

const moderateContent = (text) => {
    if (!text) return { flagged: false, reason: '' };

    const lowerText = text.toLowerCase();
    const flaggedWords = BLACKLIST.filter(word => lowerText.includes(word));

    if (flaggedWords.length > 0) {
        return {
            flagged: true,
            reason: `Content contains inappropriate language: ${flaggedWords.join(', ')}`
        };
    }

    return {
        flagged: false,
        reason: ''
    };
};

module.exports = {
    moderateContent
};
