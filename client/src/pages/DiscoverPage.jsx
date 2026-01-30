import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { Sparkles, TrendingUp, BookOpen, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DiscoverPage = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['discover-feed'],
        queryFn: async () => {
            const res = await api.get('/recommendations/discover');
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 min cache
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-paper-50 pt-12 text-center">
                <div className="animate-pulse space-y-8 max-w-7xl mx-auto px-6">
                    <div className="h-8 bg-paper-200 w-1/3 rounded mb-6"></div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-paper-200 rounded-md"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-paper-50 flex items-center justify-center text-ink-500">
                <p>Failed to load your personalized feed.</p>
            </div>
        );
    }

    const { feed } = data || {};

    return (
        <div className="min-h-screen bg-paper-50 pb-20">
            {/* Hero Section */}
            <header className="bg-white border-b border-paper-200 pt-12 pb-8 px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-4">
                            <Sparkles size={12} /> Personalized For You
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink-900 mb-4 leading-tight">
                            Your Reading Journey
                        </h1>
                        <p className="text-lg text-ink-600 font-serif">
                            Discover books tailored to your unique taste, popular hits, and timeless classics.
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* Feed Sections */}
            <div className="max-w-[1400px] mx-auto space-y-12 px-6">
                {feed?.map((section, idx) => (
                    <motion.section
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-ink-900 flex items-center gap-2">
                                    {section.title}
                                </h2>
                                <p className="text-sm text-ink-500 font-medium mt-1">{section.description}</p>
                            </div>
                            {/* <Link to="#" className="text-sm font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                                View All <ArrowRight size={16} />
                            </Link> */}
                        </div>

                        <div className="relative group">
                            <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide snap-x">
                                {section.books.map((book) => (
                                    <div key={book._id || book.openLibraryId} className="snap-start shrink-0 w-[160px] md:w-[180px]">
                                        <BookCard book={book} className="w-full h-full" />

                                        {/* "Why this book?" Badge/Text could go here if mapped from backend */}
                                        {book.reasons && book.reasons.length > 0 && (
                                            <div className="mt-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                                                    Because you read {book.searchCategory || 'similar books'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Fade effect on right */}
                            <div className="absolute top-0 right-0 bottom-6 w-24 bg-gradient-to-l from-paper-50 to-transparent pointer-events-none md:block hidden" />
                        </div>
                    </motion.section>
                ))}

                {(!feed || feed.length === 0) && (
                    <div className="text-center py-20 text-ink-400">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-serif">Start reading and saving books to see recommendations here!</p>
                        <Link to="/explore" className="btn-primary mt-4 inline-block">Explore Books</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscoverPage;

