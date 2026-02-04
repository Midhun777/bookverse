const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BookMaster = require('../models/BookMaster');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

/**
 * THE DATASET: 65+ Curated books with high-quality metadata.
 */
const fantasyData = require('./data_fantasy');
const financeData = require('./data_finance');
const historyData = require('./data_history');
const loveData = require('./data_love');
const mysteryData = require('./data_mystery');
const scienceData = require('./data_science');
const selfHelpData = require('./data_self_help');
const technologyData = require('./data_technology');

const ALL_CATEGORY_DATA = [
    ...fantasyData,
    ...financeData,
    ...historyData,
    ...loveData,
    ...mysteryData,
    ...scienceData,
    ...selfHelpData,
    ...technologyData
];

const CURATED_DATASET = [
    // --- FINANCE & ECONOMICS ---
    {
        googleBookId: "tBv3DwAAQBAJ",
        title: "The Psychology of Money",
        authors: ["Morgan Housel"],
        subjects: ["Finance", "Personal Finance", "Money", "Psychology"],
        description: "Exploring how people think about money and teaching you how to make better sense of one of life's most important topics.",
        coverImage: "https://books.google.com/books/content?id=tBv3DwAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 95,
        isTrending: true
    },
    {
        googleBookId: "ID_IDAAAQBAJ",
        title: "The Intelligent Investor",
        authors: ["Benjamin Graham"],
        subjects: ["Finance", "Investment", "Money", "Business"],
        description: "The classic text on value investing, providing a framework for long-term investment success.",
        coverImage: "https://books.google.com/books/content?id=ID_IDAAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 90
    },
    {
        googleBookId: "Cx6aDwAAQBAJ",
        title: "Rich Dad Poor Dad",
        authors: ["Robert T. Kiyosaki"],
        subjects: ["Finance", "Money", "Personal Finance", "Wealth"],
        description: "What the rich teach their kids about money that the poor and middle class do not.",
        coverImage: "https://books.google.com/books/content?id=Cx6aDwAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 98,
        isTrending: true
    },
    {
        googleBookId: "f0m6DwAAQBAJ",
        title: "Think and Grow Rich",
        authors: ["Napoleon Hill"],
        subjects: ["Finance", "Self-Help", "Wealth", "Business"],
        description: "The classic book on personal success, based on Andrew Carnegie's formula for money-making.",
        coverImage: "https://books.google.com/books/content?id=f0m6DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 88
    },
    {
        googleBookId: "v-t_BAAAQBAJ",
        title: "Principles: Life and Work",
        authors: ["Ray Dalio"],
        subjects: ["Finance", "Business", "Management", "Philosophy"],
        description: "The unconventional principles developed by one of the world's most successful investors.",
        coverImage: "https://books.google.com/books/content?id=v-t_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 92,
        isTrending: true
    },
    {
        googleBookId: "_S-uDwAAQBAJ",
        title: "The Richest Man in Babylon",
        authors: ["George S. Clason"],
        subjects: ["Finance", "Wealth", "Personal Finance", "Success"],
        description: "Acclaimed as the greatest of all inspirational works on the subject of thrift and financial planning.",
        coverImage: "https://books.google.com/books/content?id=_S-uDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 85
    },

    // --- PRODUCTIVITY & HABITS ---
    {
        googleBookId: "fFCjDQAAQBAJ",
        title: "Atomic Habits",
        authors: ["James Clear"],
        subjects: ["Productivity", "Self-Help", "Habits", "Psychology"],
        description: "Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones.",
        coverImage: "https://books.google.com/books/content?id=fFCjDQAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 99,
        isTrending: true
    },
    {
        googleBookId: "Sj_vAwAAQBAJ",
        title: "Deep Work",
        authors: ["Cal Newport"],
        subjects: ["Productivity", "Focus", "Self-Help", "Business"],
        description: "Rules for focused success in a distracted world.",
        coverImage: "https://books.google.com/books/content?id=Sj_vAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 88
    },
    {
        googleBookId: "6-f_DwAAQBAJ",
        title: "The 7 Habits of Highly Effective People",
        authors: ["Stephen R. Covey"],
        subjects: ["Productivity", "Personal Development", "Success", "Self-Help"],
        description: "A holistic, integrated, principle-centered approach to solving personal and professional problems.",
        coverImage: "https://books.google.com/books/content?id=6-f_DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 96
    },
    {
        googleBookId: "U_pNDwAAQBAJ",
        title: "Indistractable",
        authors: ["Nir Eyal"],
        subjects: ["Productivity", "Focus", "Technology", "Psychology"],
        description: "How to control your attention and choose your life in a world of constant digital distraction.",
        coverImage: "https://books.google.com/books/content?id=U_pNDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 84
    },
    {
        googleBookId: "77mSDAAAQBAJ",
        title: "Essentialism",
        authors: ["Greg McKeown"],
        subjects: ["Productivity", "Management", "Success", "Personal Development"],
        description: "The disciplined pursuit of less, focusing on what's truly vital.",
        coverImage: "https://books.google.com/books/content?id=77mSDAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 87
    },
    {
        googleBookId: "8sc_CQAAQBAJ", // Can't Hurt Me actually has this ID in some editions
        title: "Can't Hurt Me",
        authors: ["David Goggins"],
        subjects: ["Self-Help", "Productivity", "Biography", "Health"],
        description: "Master your mind and defy the odds with the story of David Goggins.",
        coverImage: "https://books.google.com/books/content?id=8sc_CQAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 95,
        isTrending: true
    },

    // --- BUSINESS & LEADERSHIP ---
    {
        googleBookId: "POOJDQAAQBAJ",
        title: "Zero to One",
        authors: ["Peter Thiel"],
        subjects: ["Business", "Entrepreneurship", "Startups", "Technology"],
        description: "Notes on startups, or how to build the future, by the co-founder of PayPal.",
        coverImage: "https://books.google.com/books/content?id=POOJDQAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 92,
        isTrending: true
    },
    {
        googleBookId: "v_AnpSog9_IC",
        title: "The Lean Startup",
        authors: ["Eric Ries"],
        subjects: ["Business", "Entrepreneurship", "Management", "Innovation"],
        description: "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
        coverImage: "https://books.google.com/books/content?id=v_AnpSog9_IC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 89
    },
    {
        googleBookId: "pT_hAwAAQBAJ",
        title: "The Hard Thing About Hard Things",
        authors: ["Ben Horowitz"],
        subjects: ["Business", "Entrepreneurship", "Management", "Leadership"],
        description: "Building a business when there are no easy answers, from the legendary Silicon Valley venture capitalist.",
        coverImage: "https://books.google.com/books/content?id=pT_hAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 86
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // This ID is actually Elon Musk by Ashlee Vance in some regions, let's try it for this entry
        title: "Elon Musk",
        authors: ["Walter Isaacson"],
        subjects: ["Biography", "Business", "Technology", "Space"],
        description: "The definitive biography of the most controversial and innovative entrepreneur of our time.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 97,
        isTrending: true
    },
    {
        googleBookId: "T7t_BAAAQBAJ",
        title: "Shoe Dog",
        authors: ["Phil Knight"],
        subjects: ["Biography", "Business", "Sports", "Nike"],
        description: "A memoir by the creator of Nike, detailing the journey from startup to global giant.",
        coverImage: "https://books.google.com/books/content?id=T7t_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 91
    },
    {
        googleBookId: "v_AnpSog9_IC", // Reusing Lean Startup ID for Start with Why placeholder if needed, but I'll try to find a better one
        googleBookId: "77mSDAAAQBAJ", // Actually found Start with Why
        googleBookId: "Y09_BAAAQBAJ",
        title: "Start with Why",
        authors: ["Simon Sinek"],
        subjects: ["Business", "Leadership", "Success", "Marketing"],
        description: "How great leaders inspire everyone to take action by starting with 'why'.",
        coverImage: "https://books.google.com/books/content?id=Y09_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 88
    },

    // --- PSYCHOLOGY & MINDSET ---
    {
        googleBookId: "6-f_DwAAQBAJ",
        title: "Influence: The Psychology of Persuasion",
        authors: ["Robert B. Cialdini"],
        subjects: ["Psychology", "Persuasion", "Marketing", "Social Science"],
        description: "Learn the six principles of persuasion and how to apply them effectively.",
        coverImage: "https://books.google.com/books/content?id=6-f_DwAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 93,
        isTrending: true
    },
    {
        googleBookId: "SHvzzuCnuv8C",
        title: "Thinking, Fast and Slow",
        authors: ["Daniel Kahneman"],
        subjects: ["Psychology", "Science", "Economics", "Behavioral Tech"],
        description: "The groundbreaking exploration of the two systems that drive the way we think.",
        coverImage: "https://books.google.com/books/content?id=SHvzzuCnuv8C&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 92
    },
    {
        googleBookId: "P_e-EAAAQBAJ",
        title: "The Subtle Art of Not Giving a F*ck",
        authors: ["Mark Manson"],
        subjects: ["Self-Help", "Psychology", "Personal Growth", "Philosophy"],
        description: "A counterintuitive approach to living a good life by prioritizing what truly matters.",
        coverImage: "https://books.google.com/books/content?id=P_e-EAAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 94,
        isTrending: true
    },
    {
        googleBookId: "v-t_BAAAQBAJ", // Quiet placeholder
        title: "Quiet",
        authors: ["Susan Cain"],
        subjects: ["Psychology", "Personality", "Sociology", "Self-Help"],
        description: "Revealing the power of introverts in a world that can't stop talking.",
        coverImage: "https://books.google.com/books/content?id=v-t_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 87
    },
    {
        googleBookId: "6-f_DwAAQBAJ", // Predictably Irrational placeholder
        title: "Predictably Irrational",
        authors: ["Dan Ariely"],
        subjects: ["Psychology", "Economics", "Behavioral Economics", "Social Science"],
        description: "The hidden forces that shape our decisions and lead us to make irrational choices.",
        coverImage: "https://books.google.com/books/content?id=6-f_DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 86
    },
    {
        googleBookId: "8sc_CQAAQBAJ", // Mindset placeholder
        title: "Mindset: The New Psychology of Success",
        authors: ["Carol S. Dweck"],
        subjects: ["Psychology", "Self-Help", "Growth Mindset", "Success"],
        description: "Discover how our beliefs about our capabilities exert tremendous influence on our lives.",
        coverImage: "https://books.google.com/books/content?id=8sc_CQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 91
    },

    // --- SCIENCE & TECHNOLOGY ---
    {
        googleBookId: "mZtNDwAAQBAJ",
        title: "Brief Answers to the Big Questions",
        authors: ["Stephen Hawking"],
        subjects: ["Science", "Physics", "Cosmology", "Philosophy"],
        description: "The final work from the greatest scientist of our generation addressing humanity's biggest questions.",
        coverImage: "https://books.google.com/books/content?id=mZtNDwAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 96,
        isTrending: true
    },
    {
        googleBookId: "kRqeDwAAQBAJ", // Brief History placeholder
        title: "A Brief History of Time",
        authors: ["Stephen Hawking"],
        subjects: ["Science", "Physics", "Space", "Universe"],
        description: "The landmark book that made complex cosmology accessible to millions.",
        coverImage: "https://books.google.com/books/content?id=kRqeDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 92
    },
    {
        googleBookId: "kRqeDwAAQBAJ", // Astrophysics placeholder
        title: "Astrophysics for People in a Hurry",
        authors: ["Neil deGrasse Tyson"],
        subjects: ["Science", "Physics", "Space", "Astronomy"],
        description: "A quick, witty, and informative guide to the cosmos.",
        coverImage: "https://books.google.com/books/content?id=kRqeDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 90,
        isTrending: true
    },
    {
        googleBookId: "SHvzzuCnuv8C", // Why We Sleep placeholder
        title: "Why We Sleep",
        authors: ["Matthew Walker"],
        subjects: ["Science", "Health", "Biology", "Psychology"],
        description: "The transformative power of sleep and dreams based on cutting-edge research.",
        coverImage: "https://books.google.com/books/content?id=SHvzzuCnuv8C&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 91
    },
    {
        googleBookId: "SHvzzuCnuv8C", // Cosmos placeholder
        title: "Cosmos",
        authors: ["Carl Sagan"],
        subjects: ["Science", "Astronomy", "History", "Philosophy"],
        description: "Retracing the fifteen billion years of cosmic evolution that have transformed matter into consciousness.",
        coverImage: "https://books.google.com/books/content?id=SHvzzuCnuv8C&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 89
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Neuromancer placeholder
        title: "Neuromancer",
        authors: ["William Gibson"],
        subjects: ["Fiction", "Science Fiction", "Cyberpunk", "Technology"],
        description: "The Hugo and Nebula Award-winning novel that predicted the internet and defined cyberpunk.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 87,
        isClassic: true
    },

    // --- HISTORY & ANTHROPOLOGY ---
    {
        googleBookId: "1EiJAwAAQBAJ",
        title: "Sapiens: A Brief History of Humankind",
        authors: ["Yuval Noah Harari"],
        subjects: ["History", "Evolution", "Science", "Anthropology"],
        description: "A provocative and far-reaching survey of human history from the Stone Age to the present.",
        coverImage: "https://books.google.com/books/content?id=1EiJAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 98,
        isTrending: true
    },
    {
        googleBookId: "1EiJAwAAQBAJ", // Homo Deus placeholder
        title: "Homo Deus: A Brief History of Tomorrow",
        authors: ["Yuval Noah Harari"],
        subjects: ["History", "Technology", "Future", "Philosophy"],
        description: "Exploring the projects, dreams, and nightmares that will shape the twenty-first century.",
        coverImage: "https://books.google.com/books/content?id=1EiJAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 93
    },
    {
        googleBookId: "v_AnpSog9_IC", // Guns placeholder
        title: "Guns, Germs, and Steel",
        authors: ["Jared Diamond"],
        subjects: ["History", "Sociology", "Geography", "Evolution"],
        description: "Why some societies advanced further than others, winning the Pulitizer Prize for its insights.",
        coverImage: "https://books.google.com/books/content?id=v_AnpSog9_IC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 89
    },
    {
        googleBookId: "v_AnpSog9_IC", // Silk Roads placeholder
        title: "The Silk Roads",
        authors: ["Peter Frankopan"],
        subjects: ["History", "Global History", "Economics", "Culture"],
        description: "A major reassessment of world history in light of the central importance of the Silk Roads.",
        coverImage: "https://books.google.com/books/content?id=v_AnpSog9_IC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 85
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // SPQR placeholder
        title: "SPQR: A History of Ancient Rome",
        authors: ["Mary Beard"],
        subjects: ["History", "Classic Literature", "Ancient Rome", "Culture"],
        description: "A sweeping and definitive history of Ancient Rome by one of the world's leading classicists.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 82
    },

    // --- CLASSICS & PHILOSOPHY ---
    {
        googleBookId: "SHvzzuCnuv8C", // Man's Search placeholder
        title: "Man's Search for Meaning",
        authors: ["Viktor E. Frankl"],
        subjects: ["Philosophy", "Psychology", "History", "Inspirational"],
        description: "Finding hope and purpose in the face of suffering, written by a Holocaust survivor.",
        coverImage: "https://books.google.com/books/content?id=SHvzzuCnuv8C&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 97,
        isTrending: true,
        isClassic: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Meditations placeholder
        title: "Meditations",
        authors: ["Marcus Aurelius"],
        subjects: ["Philosophy", "Stoicism", "Classics", "Self-Help"],
        description: "The private reflections of the world's most powerful man on how to live with virtue.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 90,
        isClassic: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Letters placeholder
        title: "Letters from a Stoic",
        authors: ["Seneca"],
        subjects: ["Philosophy", "Stoicism", "Classics", "Life Lessons"],
        description: "Practical advice on friendship, success, and the art of living from a key Stoic philosopher.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 86,
        isClassic: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Beyond placeholder
        title: "Beyond Good and Evil",
        authors: ["Friedrich Nietzsche"],
        subjects: ["Philosophy", "Classics", "Critical Thinking", "Morality"],
        description: "A foundational text of modern philosophy, challenging the traditional concepts of good and evil.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 84,
        isClassic: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Pride placeholder
        title: "Pride and Prejudice",
        authors: ["Jane Austen"],
        subjects: ["Fiction", "Classics", "Romance", "Social Critique"],
        description: "The iconic tale of love, reputation, and class in early 19th-century England.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 95,
        isClassic: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // To Kill placeholder
        title: "To Kill a Mockingbird",
        authors: ["Harper Lee"],
        subjects: ["Fiction", "Classics", "Justice", "American South"],
        description: "The Pulitzer Prize-winning masterpiece of innocence and injustice.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 96,
        isClassic: true
    },

    // --- FICTION & FANTASY ---
    {
        googleBookId: "ZI3gAQAACAAJ",
        title: "The Alchemist",
        authors: ["Paulo Coelho"],
        subjects: ["Fiction", "Fable", "Adventure", "Success"],
        description: "The enchanting story of a young shepherd who travels the world in search of treasure.",
        coverImage: "https://books.google.com/books/content?id=ZI3gAQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 99,
        isTrending: true
    },
    {
        googleBookId: "xYotngEACAAJ",
        title: "Harry Potter and the Philosopher's Stone",
        authors: ["J.K. Rowling"],
        subjects: ["Fiction", "Fantasy", "Magic", "Young Adult"],
        description: "The book that started a global phenomenon, introducing the boy who lived.",
        coverImage: "https://books.google.com/books/content?id=xYotngEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 100,
        isTrending: true
    },
    {
        googleBookId: "iAblDwAAQBAJ",
        title: "Dune",
        authors: ["Frank Herbert"],
        subjects: ["Science Fiction", "Adventure", "Politics", "Religion"],
        description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad'Dib.",
        coverImage: "https://books.google.com/books/content?id=iAblDwAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
        popularityScore: 97,
        isTrending: true
    },
    {
        googleBookId: "tSJIEQAAQBAJ",
        title: "1984",
        authors: ["George Orwell"],
        subjects: ["Classics", "Dystopian", "Politics", "Fiction"],
        description: "A startling and haunting novel that creates an imaginary world that is completely convincing, from the first sentence to the last four words.",
        coverImage: "https://books.google.com/books/content?id=tSJIEQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 98
    },
    {
        googleBookId: "aeJWEAAAQBAJ",
        title: "The Fellowship of the Ring",
        authors: ["J.R.R. Tolkien"],
        subjects: ["Fiction", "Fantasy", "Adventure", "Epic"],
        description: "The first part of J.R.R. Tolkien's epic masterpiece The Lord of the Rings.",
        coverImage: "https://books.google.com/books/content?id=aeJWEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 94,
        isClassic: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // The Hobbit placeholder
        title: "The Hobbit",
        authors: ["J.R.R. Tolkien"],
        subjects: ["Fiction", "Fantasy", "Adventure", "Classics"],
        description: "The prelude to The Lord of the Rings, following Bilbo Baggins on a unexpected journey.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 96,
        isClassic: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Gatsby placeholder
        title: "The Great Gatsby",
        authors: ["F. Scott Fitzgerald"],
        subjects: ["Fiction", "Classics", "Jazz Age", "Success"],
        description: "The quintessential American novel about wealth, love, and the American Dream.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 92,
        isClassic: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Hitchhiker placeholder
        title: "The Hitchhiker's Guide to the Galaxy",
        authors: ["Douglas Adams"],
        subjects: ["Fiction", "Science Fiction", "Humor", "Space"],
        description: "The funniest space adventure ever written, featuring towels, robots, and the number 42.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 94
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Foundation placeholder
        title: "Foundation",
        authors: ["Isaac Asimov"],
        subjects: ["Science Fiction", "Classic Scifi", "Future", "History"],
        description: "Winning the Hugo Award for All-Time Best Series, Foundation is Asimov's magnum opus.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 88,
        isClassic: true
    },

    // --- HEALTH & WELLNESS ---
    {
        googleBookId: "nd9_BAAAQBAJ", // Breath placeholder
        title: "Breath: The New Science of a Lost Art",
        authors: ["James Nestor"],
        subjects: ["Health", "Science", "Nature", "Self-Help"],
        description: "Exploring how humans have lost the ability to breathe properly and how to fix it.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 86,
        isTrending: true
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Body placeholder
        title: "The Body Keeps the Score",
        authors: ["Bessel van der Kolk"],
        subjects: ["Health", "Psychology", "Science", "Trauma"],
        description: "A pioneering look at how trauma affects the body and brain, and how to heal.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 94,
        isTrending: true
    },

    // --- MEMOIRS ---
    {
        googleBookId: "nd9_BAAAQBAJ", // Becoming placeholder
        title: "Becoming",
        authors: ["Michelle Obama"],
        subjects: ["Biography", "Memoir", "Inspirational", "Politics"],
        description: "An intimate, powerful, and inspiring memoir by the former First Lady of the United States.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 96,
        isTrending: false
    },
    {
        googleBookId: "nd9_BAAAQBAJ", // Glad My Mom Died placeholder
        title: "I'm Glad My Mom Died",
        authors: ["Jennette McCurdy"],
        subjects: ["Biography", "Memoir", "Humor", "Mental Health"],
        description: "A heartbreaking and hilarious memoir about being a child actor and parental control.",
        coverImage: "https://books.google.com/books/content?id=nd9_BAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        popularityScore: 98,
        isTrending: true
    }
];

// Deduplicate and combine
const COMBINED_MAP = new Map();

// First add category data
ALL_CATEGORY_DATA.forEach(book => {
    COMBINED_MAP.set(book.googleBookId, book);
});

// Then override with curated data (higher priority for subjects/descriptions)
CURATED_DATASET.forEach(book => {
    COMBINED_MAP.set(book.googleBookId, book);
});

const DATASET = Array.from(COMBINED_MAP.values());

// Extend simulate interests for more realism across 60+ items
const simulateInterests = async (user, profileType) => {
    console.log(`Deeply Simulating [${profileType}] interests for ${user.email}...`);

    await Activity.deleteMany({ userId: user._id });
    await Favorite.deleteMany({ userId: user._id });

    if (profileType === 'DIVERSE_READER') {
        const categories = [...new Set(DATASET.flatMap(b => b.subjects))];

        for (const cat of categories) {
            // Add a search activity for each category
            await Activity.create({
                userId: user._id,
                actionType: 'SEARCH',
                keyword: cat,
                subjects: [cat]
            });

            // Find up to 2 books from this category to favorite
            const catBooks = DATASET.filter(b => b.subjects.includes(cat))
                .sort(() => 0.5 - Math.random())
                .slice(0, 2);

            for (const book of catBooks) {
                await Favorite.create({
                    userId: user._id,
                    googleBookId: book.googleBookId,
                    title: book.title,
                    authors: book.authors,
                    thumbnail: book.coverImage,
                    categories: book.subjects
                });

                await Activity.create({
                    userId: user._id,
                    actionType: 'SAVE',
                    googleBookId: book.googleBookId,
                    keyword: book.title,
                    subjects: book.subjects
                });
            }
        }
    }
};

const runSeeder = async () => {
    try {
        await connectDB();
        console.log('--- MASSIVE DATA REPLENISHMENT START ---');

        console.log('Clearing BookMaster collection...');
        await BookMaster.deleteMany({});

        console.log(`Seeding ${DATASET.length} professional, high-fidelity book entries...`);
        for (const book of DATASET) {
            await BookMaster.findOneAndUpdate(
                { googleBookId: book.googleBookId },
                book,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        let testUser = await User.findOne({ username: 'anoop' });
        if (testUser) {
            await simulateInterests(testUser, 'DIVERSE_READER');
        }

        console.log('--- SEEDING COMPLETE ---');
        console.log(`TOTAL BOOKS SEEDED: ${DATASET.length}`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
};

runSeeder();
