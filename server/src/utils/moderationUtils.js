/**
 * Content Moderation Utility
 * Performs basic keyword-based moderation. 
 * Can be expanded to use AI-based moderation in the future.
 */

const BLACKLIST = [
    // Violence and self-harm
    'kill', 'death', 'die', 'murder', 'violence', 'terrorism', 'kill yourself', 'kys', 'suicide', 'self-harm', 'cut yourself', 'slit your', 'hang yourself', 'strangle', 'assassinate', 'massacre', 'slaughter',
    // Spam and Scam
    'garbage', 'trash', 'scam', 'fake', 'worst', 'spam', 'clickbait', 'phishing', 'pyramid scheme', 'get rich quick', 'ponzi', 'fraud', 'fraudulent', 'counterfeit',
    // Profanity
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'crap', 'bullshit', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'cock', 'ass', 'damn', 'hell', 'motherfucker', 'fucker', 'fucking', 'shitty', 'assholes', 'bitches', 'bastards', 'dickhead', 'twat', 'wanker', 'prick', 'bollocks', 'bugger', 'choad', 'cum', 'cumshot', 'douche', 'douchebag', 'dyke', 'fag', 'faggot', 'knob', 'minge', 'muppet', 'pansy', 'pecker', 'schlong', 'skank', 'snatch', 'tits', 'titties', 'tosser', 'turd', 'vag', 'vagina', 'wank','fucked','bitch','ass','fuckoff', 'fuckyou','fucker','fuckers','fucking'
    // General Negativity & Insults
    ,'idiot', 'stupid', 'moron', 'dumbass', 'jerk', 'loser', 'scumbag', 'idiots', 'imbecile', 'numbskull', 'nitwit', 'halfwit', 'jackass', 'bonehead', 'fatass', 'ugly', 'disgusting', 'repulsive', 'pathetic', 'worthless',
    // Hate speech, Racism & Slurs
    'offensive', 'slur', 'racist', 'nazi', 'faggot', 'nigger', 'nigga', 'retard', 'spastic', 'cripple', 'kike', 'chink', 'spic', 'wetback', 'gook', 'towelhead', 'raghead', 'zipperhead', 'tranny', 'shemale', 'homo', 'lesbo', 'queer',
    // Severe Offenses & Adult Content
    'rape', 'pedophile', 'groomer', 'explicit', 'porn', 'sex', 'naked', 'nudity', 'filthy', 'incest', 'bestiality', 'necrophilia', 'rapist', 'molester', 'molest', 'child abuse'
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
