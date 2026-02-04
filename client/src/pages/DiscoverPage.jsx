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
            <div className="min-h-screen bg-paper-50 dark:bg-stone-950 pt-12 text-center">
                <div className="animate-pulse space-y-12 max-w-7xl mx-auto px-6">
                    <div className="h-10 bg-paper-200 dark:bg-stone-800 w-1/4 rounded mx-auto mb-12"></div>
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
            <div className="min-h-screen bg-paper-50 dark:bg-stone-950 flex items-center justify-center text-ink-500">
                <p>Failed to load the Discovery Hub.</p>
            </div>
        );
    }

    const { feed, categories, featured } = data || {};

    return (
        <div className="min-h-screen bg-paper-50 dark:bg-stone-950 pb-20">
            {/* Immersive Hero with Vibrant Gradient - Truly Compact */}
            <header className="relative pt-8 pb-6 px-6 overflow-hidden bg-gradient-to-br from-teal-900 via-ink-950 to-indigo-950 border-b border-white/5">
                {/* Decorative background effects */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-500/10 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Text Content */}
                        <div className="flex-1 text-center lg:text-left space-y-3">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-0.5 bg-white/5 border border-white/10 rounded-full text-teal-400 text-[8px] font-black uppercase tracking-[0.25em] backdrop-blur-md"
                            >
                                <Sparkles size={10} className="animate-pulse" />
                                Discovery
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl md:text-4xl font-serif font-black text-white tracking-tighter leading-[1]"
                            >
                                Explore the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300 italic pr-2">Bookverse</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-sm md:text-base text-ink-300/70 font-serif max-w-sm leading-relaxed"
                            >
                                Find your next favorite masterpiece from 200+ titles.
                            </motion.p>
                        </div>

                        {/* Featured Spotlight Card - Ultra Compact */}
                        {featured && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ type: "spring", damping: 25, delay: 0.3 }}
                                className="flex-shrink-0 w-full max-w-xs"
                            >
                                <Link to={`/book/${featured.googleBookId}`} className="block group">
                                    <div className="bg-white/[0.04] backdrop-blur-3xl border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/[0.08] transition-all duration-500 shadow-2xl group-hover:border-teal-500/30">
                                        <div className="w-16 md:w-20 aspect-[2/3] rounded overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-700">
                                            <img
                                                src={featured.coverImage?.replace('zoom=1', 'zoom=2')}
                                                alt={featured.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = featured.coverImage?.replace('zoom=2', 'zoom=1');
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-teal-500/10 text-teal-400 rounded-full text-[7px] font-black uppercase tracking-widest border border-teal-500/10">
                                                Spotlight
                                            </div>
                                            <h2 className="text-base md:text-lg font-serif font-bold text-white line-clamp-1 leading-tight tracking-tight">{featured.title}</h2>
                                            <p className="text-ink-400 font-medium text-[10px]">{featured.authors?.[0]}</p>
                                            <div className="pt-0.5">
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white rounded text-[8px] font-black transition-all">
                                                    <TrendingUp size={8} className="text-teal-400" />
                                                    TRENDING
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hub Sections */}
            <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-24">

                {/* Categories Pill Navigation */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <BookOpen size={22} className="text-teal-600" />
                            <h2 className="text-2xl font-serif font-bold text-ink-900 dark:text-stone-100">Browse by Interest</h2>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {categories?.map((cat, idx) => (
                            <Link
                                to={`/explore?q=${cat.name}`}
                                key={idx}
                                className="px-6 py-3 rounded-full bg-white border border-paper-200 hover:border-teal-500 hover:bg-teal-50 text-ink-600 hover:text-teal-700 transition-all font-bold text-xs uppercase tracking-widest dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400"
                            >
                                {cat.name}
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
                        <div className="flex items-end justify-between mb-10 pb-4 border-b border-paper-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-ink-900 dark:text-stone-100 tracking-tight">
                                    {section.title}
                                </h2>
                                <p className="text-ink-500 dark:text-stone-400 font-medium mt-1">{section.description}</p>
                            </div>
                            <Link to={`/explore?q=${section.title.includes('Titan') ? 'Technology' : ''}`} className="text-sm font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors group">
                                View Full Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="flex gap-6 overflow-x-auto pb-10 -mx-6 px-6 scrollbar-hide snap-x">
                                {section.books.map((book) => (
                                    <div key={book.googleBookId || book.openLibraryId || book._id} className="snap-start shrink-0 w-[200px] md:w-[240px]">
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

            {/* Elevated Personalized CTA */}
            <section className="mx-6 max-w-7xl lg:mx-auto bg-gradient-to-br from-ink-900 to-stone-900 rounded-[4rem] p-12 md:p-24 text-white text-center relative shadow-3xl overflow-hidden mt-12 border border-white/5">
                <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                    <div className="inline-block p-4 bg-teal-500/20 rounded-3xl backdrop-blur-xl">
                        <Sparkles size={48} className="text-teal-400 animate-pulse" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-serif font-bold leading-tight">Ready for your <span className="italic text-teal-400">Next Chapter</span>?</h2>
                    <p className="text-xl text-ink-300 font-serif leading-relaxed max-w-2xl mx-auto">
                        Your library is unique. We analyze your reading patterns across 11+ genres to find the books you actually want to read.
                    </p>
                    <Link to="/recommendations" className="inline-flex items-center gap-3 px-14 py-6 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-bold text-xl transition-all shadow-2xl hover:scale-105 active:scale-95">
                        Get Personal Recommendations <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />
            </section>
        </div>
    );
};

export default DiscoverPage;
