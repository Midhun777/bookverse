import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Target, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getFavoriteBooks } from '../services/bookService';
import { getMyLists } from '../services/listService';

const HomeSidebar = () => {
    const { user } = useAuthStore();

    const { data: favoriteBooks } = useQuery({
        queryKey: ['favoriteBooks'],
        queryFn: getFavoriteBooks,
        enabled: !!user
    });

    const { data: myLists } = useQuery({
        queryKey: ['myLists'],
        queryFn: getMyLists,
        enabled: !!user
    });

    // Derive "Currently Reading" from lists
    const currentRead = useMemo(() => {
        if (!myLists) return null;
        // Find a book with status READING
        const readingItem = myLists.find(item => item.status === 'READING');
        if (!readingItem) return null;

        // Find details in savedBooks (or we might need to fetch if list item doesn't have full details)
        // List item usually has googleBookId.
        // Let's try to match with savedBooks to get cover/title if list item is sparse.
        // Assuming list item has some info or we use savedBooks to find it.
        // Actually myLists items usually have googleBookId.
        // Let's find the favorite book.
        return favoriteBooks?.find(b => b.googleBookId === readingItem.googleBookId);
    }, [myLists, favoriteBooks]);

    // Derive Challenge Progress (Completed this year)
    const challengeProgress = useMemo(() => {
        if (!myLists) return 0;
        const currentYear = new Date().getFullYear();
        return myLists.filter(item =>
            item.status === 'COMPLETED' &&
            new Date(item.updatedAt || Date.now()).getFullYear() === currentYear
        ).length;
    }, [myLists]);

    if (!user) {
        return (
            <div className="space-y-6">
                <div className="card-libra p-6 text-center">
                    <h3 className="font-bold font-serif text-ink-900 text-lg mb-2">New here?</h3>
                    <p className="text-sm text-ink-600 mb-4">Create a free account to discover what your friends are reading.</p>
                    <Link to="/register" className="btn-primary block w-full text-center mb-2">Create Account</Link>
                    <p className="text-xs text-ink-400">Already a member? <Link to="/login" className="text-teal-600 hover:underline">Sign in</Link></p>
                </div>
            </div>
        );
    }

    return (
        <aside className="space-y-6">
            {/* 1. Currently Reading (Real) */}
            {currentRead ? (
                <div className="card-libra p-4">
                    <h3 className="font-bold text-ink-900 text-sm border-b border-paper-200 pb-2 mb-3 uppercase tracking-wider">
                        Currently Reading
                    </h3>

                    <div className="flex gap-3">
                        <div className="w-16 h-24 bg-paper-200 shrink-0 rounded shadow-sm border border-paper-200 overflow-hidden">
                            <img src={currentRead.thumbnail || "https://via.placeholder.com/64x96?text=No+Cover"} alt={currentRead.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Link to={`/book/${currentRead.googleBookId}`} className="font-bold text-sm text-ink-900 hover:underline truncate block">{currentRead.title}</Link>
                            <p className="text-xs text-ink-600 mb-2">{currentRead.authors?.[0]}</p>

                            <div className="space-y-1">
                                <div className="w-full bg-paper-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: '0%' }}></div> {/* TODO: Add progress page logic */}
                                </div>
                                <div className="flex justify-between text-[10px] text-ink-400 font-medium">
                                    <span>Track Progress &rarr;</span>
                                </div>
                            </div>

                            <Link to="/dashboard" className="text-[10px] font-bold text-teal-600 hover:underline mt-2 block">
                                Update Progress
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card-libra p-4 border-dashed">
                    <h3 className="font-bold text-ink-900 text-sm mb-2">No active read</h3>
                    <p className="text-xs text-ink-500 mb-3">Start a book to track your progress here.</p>
                    <Link to="/discover" className="btn-outline w-full text-center text-xs py-1.5">Find a Book</Link>
                </div>
            )}

            {/* 2. Reading Challenge (Dynamic) */}
            <div className="card-libra p-4">
                <h3 className="font-bold text-ink-900 text-sm border-b border-paper-200 pb-2 mb-3 uppercase tracking-wider">
                    {new Date().getFullYear()} Challenge
                </h3>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-paper-200 flex items-center justify-center relative shrink-0">
                        <span className="text-xs font-bold text-ink-900">{challengeProgress}</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-ink-900">You have read {challengeProgress} book{challengeProgress !== 1 && 's'}!</p>
                        <p className="text-xs text-ink-600">Keep going to reach your goal.</p>
                        <Link to="/challenges" className="text-xs text-teal-600 font-bold hover:underline mt-1 block">View Challenge</Link>
                    </div>
                </div>
            </div>

            <div className="text-xs text-ink-400 text-center px-4">
                <p>&copy; 2026 Bookverse</p>
                <div className="flex justify-center gap-2 mt-1">
                    <a href="#" className="hover:text-ink-600">About</a>
                    <a href="#" className="hover:text-ink-600">Blog</a>
                    <a href="#" className="hover:text-ink-600">Terms</a>
                </div>
            </div>
        </aside>
    );
};

export default HomeSidebar;
