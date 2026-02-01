import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHomeData } from '../services/homeService';
import BookCard from '../components/BookCard';
import HomeSidebar from '../components/HomeSidebar';
import { useAuthStore } from '../store/authStore';
import { TrendingUp, MessageSquare, Star, User } from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
    const { user } = useAuthStore();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['homeBooks'],
        queryFn: getHomeData,
        staleTime: 1000 * 60 * 5,
    });

    // Fetch real Global Activity Feed
    const { data: activities, isLoading: activityLoading } = useQuery({
        queryKey: ['globalActivity'],
        queryFn: async () => {
            const res = await api.get('/activity/global'); // Ensure this endpoint exists or mock empty for now
            return res.data;
        },
        retry: false
    });

    if (isLoading) return (
        <div className="grid grid-cols-12 gap-8 animate-pulse">
            <div className="col-span-3 h-64 bg-paper-200 rounded"></div>
            <div className="col-span-6 h-96 bg-paper-200 rounded"></div>
            <div className="col-span-3 h-64 bg-paper-200 rounded"></div>
        </div>
    );

    const feedItems = activities || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Personal Stats / Navigation */}
            <aside className="hidden lg:block lg:col-span-3">
                <HomeSidebar />
            </aside>

            {/* Center Column: News Feed */}
            <main className="lg:col-span-6 space-y-6">

                <h2 className="font-bold text-ink-900 border-b border-paper-200 pb-2 mb-4 uppercase tracking-wider text-sm flex items-center justify-between">
                    <span>Global Activity</span>
                </h2>

                {!user && (
                    <div className="card-libra p-8 text-center bg-teal-50 border-teal-100 mb-6">
                        <h1 className="font-serif font-bold text-2xl text-ink-900 mb-2">Welcome to Bookverse</h1>
                        <p className="text-ink-600 mb-6">Discover your next favorite book and track your reading journey.</p>
                        <div className="flex justify-center gap-4">
                            <Link to="/register" className="btn-primary">Sign Up via Email</Link>
                            <Link to="/login" className="btn-outline">Log In</Link>
                        </div>
                    </div>
                )}

                {feedItems.length > 0 ? (
                    feedItems.map(item => (
                        <div key={item._id} className="card-libra p-5">
                            <div className="flex gap-4">
                                <div className="shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-paper-200 flex items-center justify-center">
                                        <User size={18} className="text-ink-400" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-ink-900">
                                        <span className="font-bold">{item.user?.name || 'User'}</span> {item.actionType === 'REVIEW' ? 'reviewed' : 'rated'}
                                        <Link to={`/book/${item.googleBookId}`} className="font-bold text-teal-700 hover:underline ml-1">
                                            {item.bookTitle}
                                        </Link>
                                    </p>
                                    <p className="text-xs text-ink-400 mb-3">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-ink-400 bg-paper-50 rounded border border-dashed border-paper-200">
                        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No recent activity. Be the first to start reading!</p>
                    </div>
                )}
            </main>

            {/* Right Column: Recommendations */}
            <aside className="hidden xl:block xl:col-span-3 space-y-6">

                <div className="card-libra p-4">
                    <h3 className="font-bold text-ink-900 text-sm border-b border-paper-200 pb-2 mb-3 uppercase tracking-wider">
                        Trending this Week
                    </h3>
                    <div className="space-y-4">
                        {data?.trending?.slice(0, 3).map(book => (
                            <div key={book.googleBookId || book._id} className="flex gap-3">
                                <Link to={`/book/${book.googleBookId || book._id}`} className="w-12 h-16 bg-paper-200 shrink-0 border border-paper-100 shadow-sm">
                                    <img src={book.coverImage || book.thumbnail} alt="" className="w-full h-full object-cover" />
                                </Link>
                                <div>
                                    <Link to={`/book/${book.googleBookId || book._id}`} className="font-bold text-sm text-ink-900 hover:underline line-clamp-2 leading-tight">
                                        {book.title}
                                    </Link>
                                    <p className="text-xs text-ink-500 mt-1 line-clamp-1">{book.authors?.[0]}</p>
                                    <button className="text-[10px] uppercase font-bold text-teal-600 hover:underline mt-1 bg-teal-50 px-2 py-0.5 rounded">Want to Read</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>



                <div className="flex flex-wrap gap-2 text-xs text-ink-400">
                    <a href="#" className="hover:text-teal-600">© 2026 Bookverse</a>
                    <span>·</span>
                    <a href="#" className="hover:text-teal-600">About</a>
                    <span>·</span>
                    <a href="#" className="hover:text-teal-600">Privacy</a>
                    <span>·</span>
                    <a href="#" className="hover:text-teal-600">Mobile</a>
                </div>
            </aside>

        </div>
    );
};

export default LandingPage;
