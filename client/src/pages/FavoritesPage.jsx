import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, Heart, Sparkles, ArrowLeft } from 'lucide-react';
import ListBookCard from '../components/ListBookCard';
import { getFavoriteBooks } from '../services/bookService';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
    const { data: favoriteBooks, isLoading } = useQuery({
        queryKey: ['favoriteBooks'],
        queryFn: getFavoriteBooks,
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-teal-600 w-12 h-12" />
            <p className="text-ink-400 font-medium animate-pulse">Curating your favorites...</p>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 relative"
            >
                <Link to="/dashboard" className="inline-flex items-center text-sm font-bold text-ink-400 hover:text-teal-600 transition-colors mb-6 group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
                                <Heart size={32} className="text-rose-500 fill-rose-500" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold font-serif text-ink-900 dark:text-stone-100 tracking-tight">My Favorites</h1>
                        </div>
                        <p className="text-lg text-ink-600 dark:text-stone-400 font-medium max-w-2xl leading-relaxed">
                            A curated collection of the stories and knowledge that moved you most.
                        </p>
                    </div>

                    {favoriteBooks?.length > 0 && (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-paper-100 dark:bg-stone-900 rounded-full border border-paper-200 dark:border-stone-800">
                            <Sparkles size={16} className="text-amber-500" />
                            <span className="text-sm font-bold text-ink-900 dark:text-stone-100">{favoriteBooks.length} Treasures Saved</span>
                        </div>
                    )}
                </div>
            </motion.header>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {favoriteBooks && favoriteBooks.length > 0 ? (
                    <div className="space-y-6">
                        {/* Elegant List Header */}
                        <div className="hidden md:grid grid-cols-12 gap-8 px-6 py-4 bg-paper-50 dark:bg-stone-900/50 rounded-2xl border border-paper-100 dark:border-stone-800 text-[10px] font-black uppercase tracking-[0.2em] text-ink-400 dark:text-stone-500">
                            <div className="col-span-6">Book Information</div>
                            <div className="col-span-3">Rating</div>
                            <div className="col-span-3">Added to Favorites</div>
                        </div>

                        <div className="divide-y divide-paper-100 dark:divide-stone-800/50 bg-white dark:bg-stone-950 rounded-3xl border border-paper-200 dark:border-stone-800 overflow-hidden shadow-sm">
                            {favoriteBooks.map(book => (
                                <motion.div
                                    key={book._id}
                                    variants={itemVariants}
                                    className="px-6 hover:bg-paper-50/50 dark:hover:bg-stone-900/20 transition-colors"
                                >
                                    <ListBookCard item={{ ...book, googleBookId: book.googleBookId }} showRemove={false} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center bg-paper-50/50 dark:bg-stone-900/20 rounded-[3rem] border-2 border-dashed border-paper-200 dark:border-stone-800 p-8"
                    >
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-10 animate-pulse"></div>
                            <div className="relative w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-300">
                                <Heart size={48} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold font-serif text-ink-900 dark:text-stone-100 mb-3">Your shelf is waiting for its first spark.</h2>
                        <p className="text-ink-600 dark:text-stone-400 max-w-sm mb-8 font-medium">
                            Every great collection starts with a single heartbeat. Find a book that speaks to you and mark it as a favorite.
                        </p>
                        <Link to="/explore" className="group relative px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-teal-600/20 flex items-center gap-2 overflow-hidden">
                            <span className="relative z-10">Discover your next favorite</span>
                            <Sparkles size={18} className="relative z-10 group-hover:rotate-12 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                    </motion.div>
                )}
            </motion.main>
        </div>
    );
};

export default FavoritesPage;
