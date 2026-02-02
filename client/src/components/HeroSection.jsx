import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Sparkles } from 'lucide-react';

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

            <div className="relative px-8 py-16 md:py-24 flex flex-col items-center text-center max-w-4xl mx-auto">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm border border-white/10">
                    Welcome to Bookverse
                </span>

                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                    Your Personal Library, <br />
                    <span className="text-teal-200">Reimagined.</span>
                </h1>

                <p className="text-lg md:text-xl text-teal-50 mb-10 max-w-2xl leading-relaxed">
                    Discover millions of books, track your reading progress, and join a community of book lovers.
                </p>

                {/* Search Container */}
                <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    <div className="relative flex items-center bg-white dark:bg-stone-900 rounded-full p-2 shadow-2xl border border-white/20">
                        <div className="pl-4 text-ink-400">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title, author, or genre..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-ink-900 dark:text-white px-4 py-3 text-lg placeholder:text-ink-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95"
                        >
                            Search
                        </button>
                    </div>

                    {/* Quick Tags */}
                    <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                        <span className="text-teal-100/80">Try searching:</span>
                        {['Fiction', 'Sci-Fi', 'Classic', 'Mystery'].map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                    setSearchQuery(tag);
                                    navigate(`/discover?q=${tag}`);
                                }}
                                className="text-white hover:text-teal-200 underline underline-offset-4 decoration-teal-400/50 transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HeroSection;
