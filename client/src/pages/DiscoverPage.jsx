import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { Sparkles, TrendingUp, BookOpen, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DiscoverPage = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['discover-hub'],
        queryFn: async () => {
            const res = await api.get('/recommendations/discover');
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-paper-50 pt-12 text-center">
                <div className="animate-pulse space-y-12 max-w-7xl mx-auto px-6">
                    <div className="h-10 bg-paper-200 w-1/4 rounded mx-auto mb-12"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-14 bg-paper-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-paper-50 flex items-center justify-center text-ink-500">
                <p>Failed to load the Discovery Hub.</p>
            </div>
        );
    }

    const { feed, categories } = data || {};

    return (
        <div className="min-h-screen bg-paper-50 pb-20">
            {/* Minimalist Hero */}
            <header className="pt-20 pb-16 px-6 text-center bg-paper-50 dark:bg-stone-900 border-b border-paper-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <h1 className="text-5xl md:text-7xl font-serif font-black text-ink-900 tracking-tight dark:text-stone-100">
                            Discover <span className="text-teal-600 italic">Potential</span>
                        </h1>
                        <p className="text-xl text-ink-500 font-serif max-w-2xl mx-auto">
                            Explore trending titles, curated classics, and popular subjects across the entire Bookverse.
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* Hub Sections */}
            <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-24">

                {/* Categories Grid */}
                <section>
                    <div className="flex items-center gap-3 mb-10 pb-4 border-b border-paper-100">
                        <TrendingUp size={22} className="text-teal-600" />
                        <h2 className="text-2xl font-serif font-bold text-ink-900">Browse Categories</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categories?.map((cat, idx) => (
                            <Link
                                to={`/explore?q=${cat.name}`}
                                key={idx}
                                className="group p-6 rounded-2xl bg-white border border-paper-200 hover:border-teal-500 hover:shadow-soft transition-all text-center dark:bg-stone-900 dark:border-stone-800"
                            >
                                <span className="text-sm font-bold text-ink-900 group-hover:text-teal-600 block mb-1 uppercase tracking-widest">{cat.name}</span>
                                <span className="text-[10px] text-ink-400 font-bold">{cat.count} BOOKS</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Feed Sections */}
                {feed?.map((section, idx) => (
                    <motion.section
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="flex items-end justify-between mb-10 pb-4 border-b border-paper-100">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-ink-900 tracking-tight">
                                    {section.title}
                                </h2>
                                <p className="text-ink-500 font-medium mt-1">{section.description}</p>
                            </div>
                            <Link to="/explore" className="text-sm font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors group">
                                View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="flex gap-6 overflow-x-auto pb-10 -mx-6 px-6 scrollbar-hide snap-x">
                                {section.books.map((book) => (
                                    <div key={book._id || book.openLibraryId} className="snap-start shrink-0 w-[200px] md:w-[240px]">
                                        <BookCard book={book} className="w-full" />
                                    </div>
                                ))}
                            </div>
                            {/* Desktop Fade */}
                            <div className="absolute top-0 right-0 bottom-10 w-32 bg-gradient-to-l from-paper-50 to-transparent pointer-events-none hidden lg:block dark:from-stone-900" />
                        </div>
                    </motion.section>
                ))}
            </div>

            {/* Personalized CTA */}
            <section className="mx-6 max-w-7xl lg:mx-auto bg-ink-900 rounded-[3rem] p-12 md:p-20 text-white text-center dark:bg-stone-800 relative shadow-2xl overflow-hidden mt-12">
                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <Sparkles size={48} className="mx-auto text-teal-400 animate-pulse" />
                    <h2 className="text-4xl md:text-5xl font-serif font-bold">Ready for something <span className="italic text-teal-400">Personal</span>?</h2>
                    <p className="text-xl text-ink-300 font-serif leading-relaxed">
                        Curate your experience. Our engine learns your preferences to suggest books that matter to you.
                    </p>
                    <Link to="/recommendations" className="inline-block px-12 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-bold text-lg transition-all shadow-xl hover:scale-105 active:scale-95">
                        My Recommendations
                    </Link>
                </div>

                {/* Decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
            </section>
        </div>
    );
};

export default DiscoverPage;

