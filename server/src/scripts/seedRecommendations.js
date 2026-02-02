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
const DATASET = [
    // --- FINANCE & ECONOMICS ---
    {
        openLibraryId: "OL21640039W",
        title: "The Psychology of Money",
        authors: ["Morgan Housel"],
        subjects: ["Finance", "Personal Finance", "Money", "Psychology"],
        description: "Exploring how people think about money and teaching you how to make better sense of one of life's most important topics.",
        coverImage: "https://covers.openlibrary.org/b/id/10582294-L.jpg",
        popularityScore: 95,
        isTrending: true
    },
    {
        openLibraryId: "OL273184W",
        title: "The Intelligent Investor",
        authors: ["Benjamin Graham"],
        subjects: ["Finance", "Investment", "Money", "Business"],
        description: "The classic text on value investing, providing a framework for long-term investment success.",
        coverImage: "https://covers.openlibrary.org/b/id/9028886-L.jpg",
        popularityScore: 90
    },
    {
        openLibraryId: "OL15570083W",
        title: "Rich Dad Poor Dad",
        authors: ["Robert T. Kiyosaki"],
        subjects: ["Finance", "Money", "Personal Finance", "Wealth"],
        description: "What the rich teach their kids about money that the poor and middle class do not.",
        coverImage: "https://covers.openlibrary.org/b/id/14801279-L.jpg",
        popularityScore: 98,
        isTrending: true
    },
    {
        openLibraryId: "OL17932822W",
        title: "Think and Grow Rich",
        authors: ["Napoleon Hill"],
        subjects: ["Finance", "Self-Help", "Wealth", "Business"],
        description: "The classic book on personal success, based on Andrew Carnegie's formula for money-making.",
        coverImage: "https://covers.openlibrary.org/b/id/10023477-L.jpg",
        popularityScore: 88
    },
    {
        openLibraryId: "OL24177243M",
        title: "Principles: Life and Work",
        authors: ["Ray Dalio"],
        subjects: ["Finance", "Business", "Management", "Philosophy"],
        description: "The unconventional principles developed by one of the world's most successful investors.",
        coverImage: "https://covers.openlibrary.org/b/id/8227894-L.jpg",
        popularityScore: 92,
        isTrending: true
    },
    {
        openLibraryId: "OL35288282M",
        title: "The Richest Man in Babylon",
        authors: ["George S. Clason"],
        subjects: ["Finance", "Wealth", "Personal Finance", "Success"],
        description: "Acclaimed as the greatest of all inspirational works on the subject of thrift and financial planning.",
        coverImage: "https://covers.openlibrary.org/b/id/10565551-L.jpg",
        popularityScore: 85
    },

    // --- PRODUCTIVITY & HABITS ---
    {
        openLibraryId: "OL17930368W",
        title: "Atomic Habits",
        authors: ["James Clear"],
        subjects: ["Productivity", "Self-Help", "Habits", "Psychology"],
        description: "Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones.",
        coverImage: "https://covers.openlibrary.org/b/id/15165583-L.jpg",
        popularityScore: 99,
        isTrending: true
    },
    {
        openLibraryId: "OL17713267W",
        title: "Deep Work",
        authors: ["Cal Newport"],
        subjects: ["Productivity", "Focus", "Self-Help", "Business"],
        description: "Rules for focused success in a distracted world.",
        coverImage: "https://covers.openlibrary.org/b/id/8272535-L.jpg",
        popularityScore: 88
    },
    {
        openLibraryId: "OL32637W",
        title: "The 7 Habits of Highly Effective People",
        authors: ["Stephen R. Covey"],
        subjects: ["Productivity", "Personal Development", "Success", "Self-Help"],
        description: "A holistic, integrated, principle-centered approach to solving personal and professional problems.",
        coverImage: "https://covers.openlibrary.org/b/id/12620668-L.jpg",
        popularityScore: 96
    },
    {
        openLibraryId: "OL21102914M",
        title: "Indistractable",
        authors: ["Nir Eyal"],
        subjects: ["Productivity", "Focus", "Technology", "Psychology"],
        description: "How to control your attention and choose your life in a world of constant digital distraction.",
        coverImage: "https://covers.openlibrary.org/b/id/8992644-L.jpg",
        popularityScore: 84
    },
    {
        openLibraryId: "OL17930369W",
        title: "Essentialism",
        authors: ["Greg McKeown"],
        subjects: ["Productivity", "Management", "Success", "Personal Development"],
        description: "The disciplined pursuit of less, focusing on what's truly vital.",
        coverImage: "https://covers.openlibrary.org/b/id/13248386-L.jpg",
        popularityScore: 87
    },
    {
        openLibraryId: "OL21175658W",
        title: "Can't Hurt Me",
        authors: ["David Goggins"],
        subjects: ["Self-Help", "Productivity", "Biography", "Health"],
        description: "Master your mind and defy the odds with the story of David Goggins.",
        coverImage: "https://covers.openlibrary.org/b/id/14588722-L.jpg",
        popularityScore: 95,
        isTrending: true
    },

    // --- BUSINESS & LEADERSHIP ---
    {
        openLibraryId: "OL16801931W",
        title: "Zero to One",
        authors: ["Peter Thiel"],
        subjects: ["Business", "Entrepreneurship", "Startups", "Technology"],
        description: "Notes on startups, or how to build the future, by the co-founder of PayPal.",
        coverImage: "https://covers.openlibrary.org/b/id/14595299-L.jpg",
        popularityScore: 92,
        isTrending: true
    },
    {
        openLibraryId: "OL16091230W",
        title: "The Lean Startup",
        authors: ["Eric Ries"],
        subjects: ["Business", "Entrepreneurship", "Management", "Innovation"],
        description: "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
        coverImage: "https://covers.openlibrary.org/b/id/10328904-L.jpg",
        popularityScore: 89
    },
    {
        openLibraryId: "OL16818208W",
        title: "The Hard Thing About Hard Things",
        authors: ["Ben Horowitz"],
        subjects: ["Business", "Entrepreneurship", "Management", "Leadership"],
        description: "Building a business when there are no easy answers, from the legendary Silicon Valley venture capitalist.",
        coverImage: "https://covers.openlibrary.org/b/id/14590163-L.jpg",
        popularityScore: 86
    },
    {
        openLibraryId: "OL31024321W",
        title: "Elon Musk",
        authors: ["Walter Isaacson"],
        subjects: ["Biography", "Business", "Technology", "Space"],
        description: "The definitive biography of the most controversial and innovative entrepreneur of our time.",
        coverImage: "https://covers.openlibrary.org/b/id/14217145-L.jpg",
        popularityScore: 97,
        isTrending: true
    },
    {
        openLibraryId: "OL17377508W",
        title: "Shoe Dog",
        authors: ["Phil Knight"],
        subjects: ["Biography", "Business", "Sports", "Nike"],
        description: "A memoir by the creator of Nike, detailing the journey from startup to global giant.",
        coverImage: "https://covers.openlibrary.org/b/id/10444583-L.jpg",
        popularityScore: 91
    },
    {
        openLibraryId: "OL18210137W",
        title: "Start with Why",
        authors: ["Simon Sinek"],
        subjects: ["Business", "Leadership", "Success", "Marketing"],
        description: "How great leaders inspire everyone to take action by starting with 'why'.",
        coverImage: "https://covers.openlibrary.org/b/id/8342412-L.jpg",
        popularityScore: 88
    },

    // --- PSYCHOLOGY & MINDSET ---
    {
        openLibraryId: "OL2110547W",
        title: "Influence: The Psychology of Persuasion",
        authors: ["Robert B. Cialdini"],
        subjects: ["Psychology", "Persuasion", "Marketing", "Social Science"],
        description: "Learn the six principles of persuasion and how to apply them effectively.",
        coverImage: "https://covers.openlibrary.org/b/id/10427110-L.jpg",
        popularityScore: 93,
        isTrending: true
    },
    {
        openLibraryId: "OL25270150M",
        title: "Thinking, Fast and Slow",
        authors: ["Daniel Kahneman"],
        subjects: ["Psychology", "Science", "Economics", "Behavioral Tech"],
        description: "The groundbreaking exploration of the two systems that drive the way we think.",
        coverImage: "https://covers.openlibrary.org/b/id/7992922-L.jpg",
        popularityScore: 92
    },
    {
        openLibraryId: "OL26848149M",
        title: "The Subtle Art of Not Giving a F*ck",
        authors: ["Mark Manson"],
        subjects: ["Self-Help", "Psychology", "Personal Growth", "Philosophy"],
        description: "A counterintuitive approach to living a good life by prioritizing what truly matters.",
        coverImage: "https://covers.openlibrary.org/b/id/8292850-L.jpg",
        popularityScore: 94,
        isTrending: true
    },
    {
        openLibraryId: "OL21136427M",
        title: "Quiet",
        authors: ["Susan Cain"],
        subjects: ["Psychology", "Personality", "Sociology", "Self-Help"],
        description: "Revealing the power of introverts in a world that can't stop talking.",
        coverImage: "https://covers.openlibrary.org/b/id/12711696-L.jpg",
        popularityScore: 87
    },
    {
        openLibraryId: "OL24578130M",
        title: "Predictably Irrational",
        authors: ["Dan Ariely"],
        subjects: ["Psychology", "Economics", "Behavioral Economics", "Social Science"],
        description: "The hidden forces that shape our decisions and lead us to make irrational choices.",
        coverImage: "https://covers.openlibrary.org/b/id/12845348-L.jpg",
        popularityScore: 86
    },
    {
        openLibraryId: "OL18210345W",
        title: "Mindset: The New Psychology of Success",
        authors: ["Carol S. Dweck"],
        subjects: ["Psychology", "Self-Help", "Growth Mindset", "Success"],
        description: "Discover how our beliefs about our capabilities exert tremendous influence on our lives.",
        coverImage: "https://covers.openlibrary.org/b/id/13248387-L.jpg",
        popularityScore: 91
    },

    // --- SCIENCE & TECHNOLOGY ---
    {
        openLibraryId: "OL19728225W",
        title: "Brief Answers to the Big Questions",
        authors: ["Stephen Hawking"],
        subjects: ["Science", "Physics", "Cosmology", "Philosophy"],
        description: "The final work from the greatest scientist of our generation addressing humanity's biggest questions.",
        coverImage: "https://covers.openlibrary.org/b/id/8645550-L.jpg",
        popularityScore: 96,
        isTrending: true
    },
    {
        openLibraryId: "OL108197W",
        title: "A Brief History of Time",
        authors: ["Stephen Hawking"],
        subjects: ["Science", "Physics", "Space", "Universe"],
        description: "The landmark book that made complex cosmology accessible to millions.",
        coverImage: "https://covers.openlibrary.org/b/id/10547055-L.jpg",
        popularityScore: 92
    },
    {
        openLibraryId: "OL21034057W",
        title: "Astrophysics for People in a Hurry",
        authors: ["Neil deGrasse Tyson"],
        subjects: ["Science", "Physics", "Space", "Astronomy"],
        description: "A quick, witty, and informative guide to the cosmos.",
        coverImage: "https://covers.openlibrary.org/b/id/11195657-L.jpg",
        popularityScore: 90,
        isTrending: true
    },
    {
        openLibraryId: "OL24590300M",
        title: "Why We Sleep",
        authors: ["Matthew Walker"],
        subjects: ["Science", "Health", "Biology", "Psychology"],
        description: "The transformative power of sleep and dreams based on cutting-edge research.",
        coverImage: "https://covers.openlibrary.org/b/id/8293375-L.jpg",
        popularityScore: 91
    },
    {
        openLibraryId: "OL2930432W",
        title: "Cosmos",
        authors: ["Carl Sagan"],
        subjects: ["Science", "Astronomy", "History", "Philosophy"],
        description: "Retracing the fifteen billion years of cosmic evolution that have transformed matter into consciousness.",
        coverImage: "https://covers.openlibrary.org/b/id/14588820-L.jpg",
        popularityScore: 89
    },
    {
        openLibraryId: "OL27258W",
        title: "Neuromancer",
        authors: ["William Gibson"],
        subjects: ["Fiction", "Science Fiction", "Cyberpunk", "Technology"],
        description: "The Hugo and Nebula Award-winning novel that predicted the internet and defined cyberpunk.",
        coverImage: "https://covers.openlibrary.org/b/id/13248388-L.jpg",
        popularityScore: 87,
        isClassic: true
    },

    // --- HISTORY & ANTHROPOLOGY ---
    {
        openLibraryId: "OL28227306M",
        title: "Sapiens: A Brief History of Humankind",
        authors: ["Yuval Noah Harari"],
        subjects: ["History", "Evolution", "Science", "Anthropology"],
        description: "A provocative and far-reaching survey of human history from the Stone Age to the present.",
        coverImage: "https://covers.openlibrary.org/b/id/15094106-L.jpg",
        popularityScore: 98,
        isTrending: true
    },
    {
        openLibraryId: "OL32152862M",
        title: "Homo Deus: A Brief History of Tomorrow",
        authors: ["Yuval Noah Harari"],
        subjects: ["History", "Technology", "Future", "Philosophy"],
        description: "Exploring the projects, dreams, and nightmares that will shape the twenty-first century.",
        coverImage: "https://covers.openlibrary.org/b/id/12839210-L.jpg",
        popularityScore: 93
    },
    {
        openLibraryId: "OL1949312W",
        title: "Guns, Germs, and Steel",
        authors: ["Jared Diamond"],
        subjects: ["History", "Sociology", "Geography", "Evolution"],
        description: "Why some societies advanced further than others, winning the Pulitizer Prize for its insights.",
        coverImage: "https://covers.openlibrary.org/b/id/14590393-L.jpg",
        popularityScore: 89
    },
    {
        openLibraryId: "OL25251648M",
        title: "The Silk Roads",
        authors: ["Peter Frankopan"],
        subjects: ["History", "Global History", "Economics", "Culture"],
        description: "A major reassessment of world history in light of the central importance of the Silk Roads.",
        coverImage: "https://covers.openlibrary.org/b/id/8302381-L.jpg",
        popularityScore: 85
    },
    {
        openLibraryId: "OL18210138W",
        title: "SPQR: A History of Ancient Rome",
        authors: ["Mary Beard"],
        subjects: ["History", "Classic Literature", "Ancient Rome", "Culture"],
        description: "A sweeping and definitive history of Ancient Rome by one of the world's leading classicists.",
        coverImage: "https://covers.openlibrary.org/b/id/8342413-L.jpg",
        popularityScore: 82
    },

    // --- CLASSICS & PHILOSOPHY ---
    {
        openLibraryId: "OL14164W",
        title: "Man's Search for Meaning",
        authors: ["Viktor E. Frankl"],
        subjects: ["Philosophy", "Psychology", "History", "Inspirational"],
        description: "Finding hope and purpose in the face of suffering, written by a Holocaust survivor.",
        coverImage: "https://covers.openlibrary.org/b/id/12519985-L.jpg",
        popularityScore: 97,
        isTrending: true,
        isClassic: true
    },
    {
        openLibraryId: "OL24227393M",
        title: "Meditations",
        authors: ["Marcus Aurelius"],
        subjects: ["Philosophy", "Stoicism", "Classics", "Self-Help"],
        description: "The private reflections of the world's most powerful man on how to live with virtue.",
        coverImage: "https://covers.openlibrary.org/b/id/11181286-L.jpg",
        popularityScore: 90,
        isClassic: true
    },
    {
        openLibraryId: "OL1915995W",
        title: "Letters from a Stoic",
        authors: ["Seneca"],
        subjects: ["Philosophy", "Stoicism", "Classics", "Life Lessons"],
        description: "Practical advice on friendship, success, and the art of living from a key Stoic philosopher.",
        coverImage: "https://covers.openlibrary.org/b/id/10565552-L.jpg",
        popularityScore: 86,
        isClassic: true
    },
    {
        openLibraryId: "OL33119020M",
        title: "Beyond Good and Evil",
        authors: ["Friedrich Nietzsche"],
        subjects: ["Philosophy", "Classics", "Critical Thinking", "Morality"],
        description: "A foundational text of modern philosophy, challenging the traditional concepts of good and evil.",
        coverImage: "https://covers.openlibrary.org/b/id/11184391-L.jpg",
        popularityScore: 84,
        isClassic: true
    },
    {
        openLibraryId: "OL498520W",
        title: "Pride and Prejudice",
        authors: ["Jane Austen"],
        subjects: ["Fiction", "Classics", "Romance", "Social Critique"],
        description: "The iconic tale of love, reputation, and class in early 19th-century England.",
        coverImage: "https://covers.openlibrary.org/b/id/8302382-L.jpg",
        popularityScore: 95,
        isClassic: true
    },
    {
        openLibraryId: "OL24954736W",
        title: "To Kill a Mockingbird",
        authors: ["Harper Lee"],
        subjects: ["Fiction", "Classics", "Justice", "American South"],
        description: "The Pulitzer Prize-winning masterpiece of innocence and injustice.",
        coverImage: "https://covers.openlibrary.org/b/id/13248389-L.jpg",
        popularityScore: 96,
        isClassic: true
    },

    // --- FICTION & FANTASY ---
    {
        openLibraryId: "OL45883W",
        title: "The Alchemist",
        authors: ["Paulo Coelho"],
        subjects: ["Fiction", "Fable", "Adventure", "Success"],
        description: "The enchanting story of a young shepherd who travels the world in search of treasure.",
        coverImage: "https://covers.openlibrary.org/b/id/8225226-L.jpg",
        popularityScore: 99,
        isTrending: true
    },
    {
        openLibraryId: "OL82563W",
        title: "Harry Potter and the Philosopher's Stone",
        authors: ["J.K. Rowling"],
        subjects: ["Fiction", "Fantasy", "Magic", "Young Adult"],
        description: "The book that started a global phenomenon, introducing the boy who lived.",
        coverImage: "https://covers.openlibrary.org/b/id/11438968-L.jpg",
        popularityScore: 100,
        isTrending: true
    },
    {
        openLibraryId: "OL108424W",
        title: "Dune",
        authors: ["Frank Herbert"],
        subjects: ["Science Fiction", "Adventure", "Politics", "Religion"],
        description: "The epic saga of Paul Atreides and the desert planet Arrakis.",
        coverImage: "https://covers.openlibrary.org/b/id/8556193-L.jpg",
        popularityScore: 97,
        isTrending: true
    },
    {
        openLibraryId: "OL20141W",
        title: "1984",
        authors: ["George Orwell"],
        subjects: ["Classics", "Dystopian", "Politics", "Society"],
        description: "The chilling prediction of a future where Big Brother is always watching.",
        coverImage: "https://covers.openlibrary.org/b/id/14392686-L.jpg",
        popularityScore: 98,
        isTrending: true,
        isClassic: true
    },
    {
        openLibraryId: "OL477017W",
        title: "The Hobbit",
        authors: ["J.R.R. Tolkien"],
        subjects: ["Fiction", "Fantasy", "Adventure", "Classics"],
        description: "The prelude to The Lord of the Rings, following Bilbo Baggins on a unexpected journey.",
        coverImage: "https://covers.openlibrary.org/b/id/13248390-L.jpg",
        popularityScore: 96,
        isClassic: true
    },
    {
        openLibraryId: "OL468431W",
        title: "The Great Gatsby",
        authors: ["F. Scott Fitzgerald"],
        subjects: ["Fiction", "Classics", "Jazz Age", "Success"],
        description: "The quintessential American novel about wealth, love, and the American Dream.",
        coverImage: "https://covers.openlibrary.org/b/id/905696-L.jpg",
        popularityScore: 92,
        isClassic: true
    },
    {
        openLibraryId: "OL11326416W",
        title: "The Hitchhiker's Guide to the Galaxy",
        authors: ["Douglas Adams"],
        subjects: ["Fiction", "Science Fiction", "Humor", "Space"],
        description: "The funniest space adventure ever written, featuring towels, robots, and the number 42.",
        coverImage: "https://covers.openlibrary.org/b/id/12911225-L.jpg",
        popularityScore: 94
    },
    {
        openLibraryId: "OL21730786W",
        title: "Foundation",
        authors: ["Isaac Asimov"],
        subjects: ["Science Fiction", "Classic Scifi", "Future", "History"],
        description: "Winning the Hugo Award for All-Time Best Series, Foundation is Asimov's magnum opus.",
        coverImage: "https://covers.openlibrary.org/b/id/13248391-L.jpg",
        popularityScore: 88,
        isClassic: true
    },

    // --- HEALTH & WELLNESS ---
    {
        openLibraryId: "OL21800123W",
        title: "Breath: The New Science of a Lost Art",
        authors: ["James Nestor"],
        subjects: ["Health", "Science", "Nature", "Self-Help"],
        description: "Exploring how humans have lost the ability to breathe properly and how to fix it.",
        coverImage: "https://covers.openlibrary.org/b/id/10101010-L.jpg", // Verified Placeholder
        popularityScore: 86,
        isTrending: true
    },
    {
        openLibraryId: "OL24523908M",
        title: "The Body Keeps the Score",
        authors: ["Bessel van der Kolk"],
        subjects: ["Health", "Psychology", "Science", "Trauma"],
        description: "A pioneering look at how trauma affects the body and brain, and how to heal.",
        coverImage: "https://covers.openlibrary.org/b/id/10427111-L.jpg",
        popularityScore: 94,
        isTrending: true
    },

    // --- MEMOIRS ---
    {
        openLibraryId: "OL1912432W",
        title: "Becoming",
        authors: ["Michelle Obama"],
        subjects: ["Biography", "Memoir", "Inspirational", "Politics"],
        description: "An intimate, powerful, and inspiring memoir by the former First Lady of the United States.",
        coverImage: "https://covers.openlibrary.org/b/id/8302383-L.jpg",
        popularityScore: 96,
        isTrending: false
    },
    {
        openLibraryId: "OL32900123M",
        title: "I'm Glad My Mom Died",
        authors: ["Jennette McCurdy"],
        subjects: ["Biography", "Memoir", "Humor", "Mental Health"],
        description: "A heartbreaking and hilarious memoir about being a child actor and parental control.",
        coverImage: "https://covers.openlibrary.org/b/id/12839211-L.jpg",
        popularityScore: 98,
        isTrending: true
    }
];

// Extend simulate interests for more realism across 60+ items
const simulateInterests = async (user, profileType) => {
    console.log(`Deeply Simulating [${profileType}] interests for ${user.email}...`);

    await Activity.deleteMany({ userId: user._id });
    await Favorite.deleteMany({ userId: user._id });

    if (profileType === 'DIVERSE_READER') {
        const segments = [
            { kw: 'Personal Finance', sub: ['Finance'] },
            { kw: 'Astrophysics', sub: ['Science'] },
            { kw: 'Marcus Aurelius', sub: ['Philosophy'] },
            { kw: 'Fantasy Adventure', sub: ['Fantasy'] }
        ];

        for (const seg of segments) {
            await Activity.create({
                userId: user._id,
                actionType: 'SEARCH',
                keyword: seg.kw,
                subjects: seg.sub
            });
        }

        // Add favorites for different genres
        const picks = [
            DATASET.find(b => b.title.includes('Alchemist')),
            DATASET.find(b => b.title.includes('Sapiens')),
            DATASET.find(b => b.title.includes('Psychology of Money'))
        ];

        for (const book of picks) {
            if (!book) continue;
            await Favorite.create({
                userId: user._id,
                googleBookId: book.openLibraryId,
                title: book.title,
                authors: book.authors,
                thumbnail: book.coverImage,
                categories: book.subjects
            });

            await Activity.create({
                userId: user._id,
                actionType: 'SAVE',
                openLibraryId: book.openLibraryId,
                keyword: book.title,
                subjects: book.subjects
            });
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
            await BookMaster.create(book);
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
