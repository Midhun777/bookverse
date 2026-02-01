import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Target, Calendar, BookOpen, Edit2, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import ChallengeBookCard from '../components/ChallengeBookCard';
import { getMyLists } from '../services/listService';
import { getPublicProfile } from '../services/statsService';
import toast from 'react-hot-toast';

const ChallengesPage = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [goal, setGoal] = useState(30); // Default, ideally fetched from user preferences
    const [isEditing, setIsEditing] = useState(false);

    const { data: myLists, isLoading: listLoading } = useQuery({
        queryKey: ['myLists'],
        queryFn: getMyLists,
        enabled: !!user
    });

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['myProfile', user?.username],
        queryFn: () => getPublicProfile(user?.username),
        enabled: !!user?.username,
    });

    // Filter books read in 2026
    const currentYear = new Date().getFullYear();
    const readBooks = myLists?.filter(b =>
        b.status === 'COMPLETED' &&
        new Date(b.completedAt || b.updatedAt).getFullYear() === currentYear
    ) || [];
    const progress = readBooks.length;
    const percentage = Math.min(Math.round((progress / goal) * 100), 100);

    // Status message
    const getStatusMessage = () => {
        if (percentage >= 100) return "Incredible! You've crushed your goal!";
        if (percentage >= 50) return "Halfway there! Keep up the momentum.";
        if (percentage >= 10) return "Great start! You're on your way.";
        return "Start your journey today!";
    };

    const handleUpdateGoal = (e) => {
        e.preventDefault();
        setIsEditing(false);
        toast.success(`Goal updated to ${goal} books!`);
        // Here we would call an API to save the user's goal
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    <Trophy size={14} /> 2026 Reading Challenge
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink-900 mb-4">
                    Your Reading Journey
                </h1>
                <p className="text-ink-500 text-lg font-serif">
                    Challenge yourself to read more this year. Track your progress and celebrate every page turned.
                </p>
            </div>

            {/* Main Stats Card */}
            <div className="card-libra p-8 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2">
                                <Target className="text-teal-600" />
                                2026 Goal
                            </h2>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-ink-400 hover:text-teal-600 flex items-center gap-1">
                                    <Edit2 size={12} /> Edit Goal
                                </button>
                            ) : (
                                <form onSubmit={handleUpdateGoal} className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={goal}
                                        onChange={(e) => setGoal(Number(e.target.value))}
                                        className="w-16 input-libra py-0.5 px-2 text-sm"
                                        min="1"
                                    />
                                    <button type="submit" className="text-xs font-bold text-teal-600">Save</button>
                                </form>
                            )}
                        </div>

                        <div className="text-6xl font-serif font-bold text-ink-900 mb-2">
                            {progress} <span className="text-2xl text-ink-400 font-sans font-normal">/ {goal}</span>
                        </div>
                        <p className="text-ink-600 font-medium mb-6">{getStatusMessage()}</p>

                        <div className="h-4 bg-paper-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-1000 ease-out relative"
                                style={{ width: `${percentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-bold text-ink-400 uppercase tracking-wider">
                            <span>0%</span>
                            <span>{percentage}% Complete</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-paper-50 p-6 rounded-xl border border-paper-100 text-center">
                            <BookOpen size={24} className="mx-auto text-amber-500 mb-2" />
                            <div className="text-2xl font-bold text-ink-900">
                                {profile?.totalPagesRead > 1000 ? `${(profile.totalPagesRead / 1000).toFixed(1)}k` : profile?.totalPagesRead || 0}
                            </div>
                            <div className="text-xs text-ink-400 font-bold uppercase tracking-wider">Pages Read</div>
                        </div>
                        <div className="bg-paper-50 p-6 rounded-xl border border-paper-100 text-center">
                            <TrendingUp size={24} className="mx-auto text-green-500 mb-2" />
                            <div className="text-2xl font-bold text-ink-900">{profile?.avgPagesPerDay || 0}</div>
                            <div className="text-xs text-ink-400 font-bold uppercase tracking-wider">Avg Pages/Day</div>
                        </div>
                        <div className="bg-paper-50 p-6 rounded-xl border border-paper-100 text-center">
                            <Calendar size={24} className="mx-auto text-purple-500 mb-2" />
                            <div className="text-2xl font-bold text-ink-900">{profile?.currentStreak || 0}</div>
                            <div className="text-xs text-ink-400 font-bold uppercase tracking-wider">Current Streak</div>
                        </div>
                        <div className="bg-paper-50 p-6 rounded-xl border border-paper-100 text-center">
                            <CheckCircle size={24} className="mx-auto text-blue-500 mb-2" />
                            <div className="text-2xl font-bold text-ink-900">
                                {profile?.aheadOfSchedule > 0 ? `+${profile.aheadOfSchedule}` : profile?.aheadOfSchedule || 0}
                            </div>
                            <div className="text-xs text-ink-400 font-bold uppercase tracking-wider">
                                {profile?.aheadOfSchedule >= 0 ? 'Ahead of Sched' : 'Behind Sched'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Books List */}
            <div>
                <h3 className="text-2xl font-bold font-serif text-ink-900 mb-6 flex items-center gap-3">
                    Books Read in 2026
                    <span className="text-sm font-sans font-normal text-ink-500 bg-paper-200 px-2 py-0.5 rounded-full">{readBooks.length}</span>
                </h3>

                {listLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="aspect-[2/3] bg-paper-200 rounded"></div>
                                <div className="h-3 bg-paper-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : readBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                        {readBooks.map(book => (
                            <ChallengeBookCard key={book.googleBookId} googleBookId={book.googleBookId} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-paper-50 rounded-xl border border-dashed border-paper-200">
                        <BookOpen size={48} className="mx-auto text-ink-300 mb-4" />
                        <h3 className="text-lg font-bold text-ink-600 mb-2">No books completed yet</h3>
                        <p className="text-ink-400 mb-6">Mark a book as "Read" to see it appear here.</p>
                        <Link to="/explore" className="btn-primary px-6 py-2">Find Your First Read</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengesPage;
