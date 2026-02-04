import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { Sparkles, BookOpen, ArrowRight, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const RecommendationsPage = () => {
    const { user } = useAuthStore();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['personal-recommendations'],
        queryFn: async () => {
            const res = await api.get('/recommendations/my');
            return res.data;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });

    if (!user) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-paper-50">
                <div className="p-4 rounded-full bg-paper-100 mb-6">
                    <UserCheck size={48} className="text-ink-300" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-ink-900 mb-4">Personalized Recommendations</h2>
                <p className="text-ink-600 max-w-md mb-8">
                    Log in to see books tailored specifically to your reading taste and history.
                </p>
                <Link to="/login" className="btn-primary px-8">Sign In</Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-paper-50 dark:bg-stone-950 pt-12 text-center">
                <div className="animate-pulse space-y-8 max-w-7xl mx-auto px-6">
                    <div className="h-8 bg-paper-200 dark:bg-stone-800 w-1/4 rounded"></div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-paper-200 dark:bg-stone-800 rounded-md"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const { feed } = data || {};
    const hasData = feed && feed.length > 0;

    return (
        <div className="min-h-screen bg-paper-50 dark:bg-stone-950 pb-20">
            {/* Header */}
            <header className="bg-paper-50 dark:bg-stone-900 border-b border-paper-200 dark:border-stone-800 pt-16 pb-12 px-6 mb-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-4 dark:bg-stone-800 dark:border-stone-700 dark:text-teal-500">
                            <Sparkles size={14} className="animate-pulse" /> Curated for {user?.name}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-ink-900 dark:text-stone-100 mb-6 leading-tight">
                            Recommended <span className="text-teal-600 italic">For You</span>
                        </h1>
                        <p className="text-xl text-ink-600 dark:text-stone-400 font-serif leading-relaxed">
                            Our engine analyzes your library, searches, and reading habits to surface books you'll genuinely love.
                        </p>
                    </motion.div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
                    <Sparkles size={300} className="text-ink-900 dark:text-white" />
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto px-6">
                {!hasData ? (
                    <div className="text-center py-24 bg-white dark:bg-stone-900/50 rounded-3xl border border-dashed border-paper-300">
                        <div className="mb-6 inline-flex p-4 rounded-full bg-paper-50 text-ink-300">
                            <BookOpen size={48} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-ink-900 mb-2">Build Your Profile</h3>
                        <p className="text-ink-500 max-w-sm mx-auto mb-8">
                            We don't have enough data yet to give you great recommendations. Start by saving or search for some books you like!
                        </p>
                        <Link to="/explore" className="btn-primary px-8">Explore Books</Link>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {feed.map((section, idx) => (
                            <motion.section
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15 }}
                            >
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-3xl font-serif font-bold text-ink-900">{section.title}</h2>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${section.type.startsWith('PERSONAL')
                                                ? 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-stone-800 dark:text-teal-400 dark:border-stone-700'
                                                : 'bg-paper-100 text-ink-400 border-paper-200 dark:bg-stone-800 dark:text-stone-500 dark:border-stone-700'
                                                }`}>
                                                {section.type.startsWith('PERSONAL') ? 'Personalized' : 'Discover'}
                                            </span>
                                        </div>
                                        <p className="text-ink-500 font-medium">{section.description}</p>
                                    </div>
                                    <div className="h-0.5 flex-1 bg-paper-100 mx-8 hidden md:block"></div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                                    {section.books.map((book) => (
                                        <div key={book.googleBookId || book.openLibraryId || book._id} className="space-y-3">
                                            <BookCard book={book} className="w-full" />
                                            {book.reasons && book.reasons.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {book.reasons.map((reason, ridx) => (
                                                        <span key={ridx} className="text-[10px] font-bold uppercase tracking-tighter text-teal-600 py-0.5 px-2 bg-teal-50 dark:bg-stone-800 dark:text-teal-400 rounded ring-1 ring-teal-100 dark:ring-stone-700">
                                                            {reason}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationsPage;
