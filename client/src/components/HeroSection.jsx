import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl mb-12">
            {/* Background Gradient & Pattern */}
            <div className="absolute inset-0 bg-gradient-bookverse opacity-90"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

            {/* Floating Elements for Visual Interest */}
            <div className="absolute top-10 right-10 animate-float opacity-20 hidden md:block">
                <BookOpen size={120} className="text-white" />
            </div>
            <div className="absolute -bottom-10 -left-10 animate-float opacity-20 hidden md:block" style={{ animationDelay: '1.5s' }}>
                <Sparkles size={160} className="text-white" />
            </div>

            <div className="relative px-8 py-6 md:py-10 flex flex-col items-center text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] mb-3 backdrop-blur-md border border-white/10"
                >
                    Welcome to Bookverse
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-4xl font-serif font-black text-white mb-3 leading-tight tracking-tight"
                >
                    Your Personal Library, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-200 italic">Reimagined.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm md:text-base text-teal-50/70 mb-6 max-w-lg leading-snug"
                >
                    Discover millions of books and track your progress.
                </motion.p>

                {/* Search Container */}
                <form onSubmit={handleSearch} className="w-full max-w-lg relative group">
                    <div className="absolute inset-0 bg-teal-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 rounded-full"></div>
                    <div className="relative flex items-center bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-xl p-1 shadow-2xl border border-white/20">
                        <div className="pl-3 text-teal-600/50">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title, author, or genre..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-ink-900 dark:text-white px-2 py-1.5 text-sm placeholder:text-ink-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95 text-xs"
                        >
                            Search
                        </button>
                    </div>

                    {/* Quick Tags */}
                    <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-black">
                        <span className="text-teal-200/20 uppercase tracking-[0.2em]">Quick Search:</span>
                        {['Fiction', 'Sci-Fi', 'Mystery', 'History'].map((tag) => (
                            <Link
                                key={tag}
                                to={`/explore?q=${encodeURIComponent(tag)}`}
                                className="text-white/40 hover:text-teal-300 transition-all uppercase tracking-[0.15em] border-b border-white/10 hover:border-teal-400/50 pb-0.5 hover:-translate-y-0.5"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HeroSection;
