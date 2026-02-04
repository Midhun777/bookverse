import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHomeData } from '../services/homeService';
import BookCard from '../components/BookCard';
import HomeSidebar from '../components/HomeSidebar';
import HeroSection from '../components/HeroSection';
import { useAuthStore } from '../store/authStore';
import { TrendingUp, MessageSquare, Star, User, Bookmark, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { getMyActivities } from '../services/activityService';
import { getMyLists } from '../services/listService';

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
            const res = await api.get('/activity/global');
            return res.data;
        },
        retry: false
    });

    // Personalized Multi-Data fetching
    const { data: myActivities } = useQuery({
        queryKey: ['myActivity'],
        queryFn: getMyActivities,
        enabled: !!user,
        staleTime: 1000 * 60 * 2
    });

    const { data: myLists } = useQuery({
        queryKey: ['myLists'],
        queryFn: getMyLists,
        enabled: !!user,
        staleTime: 1000 * 60 * 5
    });

    // Filtered lists
    const readingBooks = myLists?.filter(item => item.status === 'READING') || [];
    const toReadBooks = myLists?.filter(item => item.status === 'TO_READ') || [];
    const recentSearches = Array.from(new Set(myActivities?.filter(act => act.actionType === 'SEARCH').map(act => act.keyword))).slice(0, 8);

    // Deduplicate recently viewed by googleBookId
    const seenViewed = new Set();
    const recentlyViewed = (myActivities?.filter(act => act.actionType === 'VIEW') || []).filter(act => {
        if (!act.googleBookId || seenViewed.has(act.googleBookId)) return false;
        seenViewed.add(act.googleBookId);
        return true;
    }).slice(0, 4);

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
            <main className="lg:col-span-9 space-y-12">

                {/* Hero Section */}
                <HeroSection settings={data?.settings} />

                {/* Featured Collections */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-serif font-bold text-ink-900">Featured Collections</h2>
                        <Link to="/explore" className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 text-sm">
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Award Winning Fiction', q: 'Award Winners', desc: 'Bestsellers and award winners from 2024.', color: 'from-amber-400 to-orange-500', icon: Star },
                            { title: 'New & Noteworthy', q: 'New Releases', desc: 'The most anticipated releases of the month.', color: 'from-blue-400 to-indigo-500', icon: TrendingUp },
                            { title: 'Community Favorites', q: 'Top Rated', desc: 'Books that our readers just couldn\'t put down.', color: 'from-teal-400 to-emerald-500', icon: Bookmark },
                        ].map((col, idx) => (
                            <Link to={`/explore?q=${col.q}`} key={idx} className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${col.color} text-white shadow-lg group cursor-pointer hover:scale-[1.02] transition-transform`}>
                                <div className="relative z-10">
                                    <col.icon size={24} className="mb-3 opacity-80" />
                                    <h3 className="text-xl font-bold mb-1">{col.title}</h3>
                                    <p className="text-sm text-white/80">{col.desc}</p>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                    <col.icon size={80} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                        {/* Trending Section */}
                        <section>
                            <h2 className="text-2xl font-serif font-bold text-ink-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="text-teal-600" size={24} />
                                Trending Books
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {data?.trending?.slice(0, 4).map(book => (
                                    <BookCard key={book.googleBookId || book._id} book={book} />
                                ))}
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section>
                            <h2 className="text-2xl font-serif font-bold text-ink-900 border-b border-paper-200 pb-2 mb-6 uppercase tracking-wider text-sm flex items-center justify-between">
                                <span>Recent Activity</span>
                            </h2>
                            <div className="space-y-4">
                                {feedItems.length > 0 ? (
                                    feedItems.slice(0, 5).map(item => (
                                        <div key={item._id} className="card-libra p-5 card-libra-hover">
                                            <div className="flex gap-4">
                                                <div className="shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-paper-200 dark:bg-stone-800 flex items-center justify-center border border-paper-200 dark:border-stone-700">
                                                        <User size={22} strokeWidth={2.5} className="text-ink-400 dark:text-stone-500" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-ink-900">
                                                        <span className="font-bold">{item.user?.name || 'User'}</span> {item.actionType === 'REVIEW' ? 'reviewed' : 'rated'}
                                                        <Link to={`/book/${item.googleBookId}`} className="font-bold text-teal-700 hover:underline ml-1">
                                                            {item.bookTitle}
                                                        </Link>
                                                    </p>
                                                    <p className="text-xs text-ink-400 mb-1">{new Date(item.createdAt).toLocaleDateString()}</p>
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
                            </div>
                        </section>
                    </div>

                    {/* Right Column within main */}
                    <aside className="xl:col-span-4 space-y-8">
                        {/* Weekly Recommendation Card */}
                        <div className="card-libra p-6 bg-paper-50 border-teal-100 overflow-hidden relative">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
                            <h3 className="font-bold text-ink-900 text-sm border-b border-paper-200 pb-2 mb-4 uppercase tracking-wider">
                                Weekly Pick
                            </h3>
                            {data?.trending?.[4] && (
                                <div className="space-y-4 relative z-10">
                                    <div className="flex gap-4">
                                        <Link to={`/book/${data.trending[4].googleBookId || data.trending[4]._id}`} className="w-20 h-28 bg-paper-200 shrink-0 border border-paper-100 shadow-md rounded-md overflow-hidden group">
                                            <img src={data.trending[4].coverImage || data.trending[4].thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </Link>
                                        <div className="flex-1">
                                            <Link to={`/book/${data.trending[4].googleBookId || data.trending[4]._id}`} className="font-bold text-ink-900 hover:underline line-clamp-2 leading-tight">
                                                {data.trending[4].title}
                                            </Link>
                                            <p className="text-xs text-ink-500 mt-1 line-clamp-1">{data.trending[4].authors?.[0]}</p>
                                            <div className="flex items-center gap-1 mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < 4 ? "fill-amber-400 text-amber-400" : "text-paper-200"} />
                                                ))}
                                                <span className="text-[10px] text-ink-400 ml-1">4.0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-ink-600 line-clamp-3 italic">"A masterful blend of storytelling and profound insights. A must-read for anyone looking to expand their horizons."</p>
                                    <Link to={`/book/${data.trending[4].googleBookId || data.trending[4]._id}`} className="btn-primary w-full text-center text-xs py-2">Read Now</Link>
                                </div>
                            )}
                        </div>

                        {/* Popular Genres Chip List */}
                        <div className="card-libra p-5">
                            <h3 className="font-bold text-ink-900 text-sm border-b border-paper-200 pb-2 mb-4 uppercase tracking-wider">
                                Popular Genres
                            </h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {(data?.settings?.featuredCategories?.length > 0 ? data.settings.featuredCategories : ['Fiction', 'Non-Fiction', 'Science', 'Mystery', 'Fantasy', 'Romance', 'Historical', 'Biography', 'Thrillers', 'Philosophy']).map(genre => (
                                    <Link key={genre} to={`/explore?q=${genre}`} className="px-3 py-1.5 rounded-full bg-paper-100 text-ink-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-transparent transition-all font-medium">
                                        {genre}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-ink-400 px-2">
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

                {/* --- Bottom Personalized Sections --- */}
                {user && (
                    <div className="space-y-16 pt-16 border-t border-paper-200 dark:border-stone-800">
                        {/* 1. Recent Searches */}
                        {recentSearches.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold text-ink-400 dark:text-stone-500 uppercase tracking-widest mb-4">Your Recent Searches</h3>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((term, i) => (
                                        <Link
                                            key={i}
                                            to={`/explore?q=${encodeURIComponent(term)}`}
                                            className="px-4 py-2 bg-paper-100 dark:bg-stone-900 border border-paper-200 dark:border-stone-800 rounded-full text-sm text-ink-700 dark:text-stone-300 hover:border-teal-500 hover:text-teal-600 transition-all font-medium"
                                        >
                                            {term}
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* 2. Jump Back In (Currently Reading) */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-serif font-bold text-ink-900 dark:text-stone-100 italic">Jump Back In</h2>
                                    <Link to="/my-books" className="text-xs font-bold text-teal-600 hover:underline px-2 py-1">View Shelf</Link>
                                </div>
                                <div className="space-y-4">
                                    {readingBooks.length > 0 ? (
                                        readingBooks.slice(0, 3).map(item => (
                                            <Link key={item._id} to={`/book/${item.googleBookId}`} className="flex items-center gap-4 bg-white dark:bg-stone-900 p-3 rounded-xl border border-paper-200 dark:border-stone-800 hover:border-teal-300 dark:hover:border-teal-900 transition-all group shadow-sm hover:shadow-md">
                                                <div className="w-12 h-16 bg-paper-100 dark:bg-stone-800 rounded overflow-hidden flex-shrink-0 shadow-sm">
                                                    <PublicShelfItem googleBookId={item.googleBookId} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-ink-900 dark:text-stone-100 text-sm truncate group-hover:text-teal-600 transition-colors">{item.bookTitle || 'Loading...'}</h4>
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <div className="w-full max-w-[100px] bg-paper-200 dark:bg-stone-800 h-1 rounded-full mr-2">
                                                            <div className="bg-teal-600 h-1 rounded-full" style={{ width: `${item.progressPercent || 0}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-ink-400 dark:text-stone-500">{item.progressPercent || 0}%</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-ink-300 dark:text-stone-700 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center bg-paper-50 dark:bg-stone-900/50 rounded-xl border-2 border-dashed border-paper-100 dark:border-stone-800">
                                            <p className="text-xs text-ink-400 dark:text-stone-500 italic">No active reads at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* 3. On Your Wishlist (To Read) */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-serif font-bold text-ink-900 dark:text-stone-100 italic">Up Next</h2>
                                    <Link to="/my-books" className="text-xs font-bold text-teal-600 hover:underline px-2 py-1">View All</Link>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {toReadBooks.length > 0 ? (
                                        toReadBooks.slice(0, 3).map(item => (
                                            <Link key={item._id} to={`/book/${item.googleBookId}`} className="group relative aspect-[2/3] rounded-lg overflow-hidden border border-paper-200 dark:border-stone-800 bg-paper-100 dark:bg-stone-900 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                                <PublicShelfItem googleBookId={item.googleBookId} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                    <p className="text-[9px] font-bold text-white uppercase tracking-tighter line-clamp-1">{item.bookTitle}</p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        [1, 2, 3].map(i => (
                                            <div key={i} className="aspect-[2/3] rounded-lg bg-paper-50 dark:bg-stone-900/30 border-2 border-dashed border-paper-100 dark:border-stone-800 flex items-center justify-center">
                                                <Bookmark size={16} className="text-ink-200 dark:text-stone-800" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* 4. Recently Viewed */}
                        {recentlyViewed.length > 0 && (
                            <section>
                                <h2 className="text-xl font-serif font-bold text-ink-900 dark:text-stone-100 mb-8 border-b border-paper-100 dark:border-stone-800 pb-2">Recently Viewed</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-6">
                                    {recentlyViewed.map(act => (
                                        <BookCard key={act._id} book={{
                                            googleBookId: act.googleBookId,
                                            title: act.bookTitle,
                                            authors: act.bookAuthor ? [act.bookAuthor] : [],
                                            coverImage: act.bookCover
                                        }} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>


        </div>
    );
};

const PublicShelfItem = ({ googleBookId }) => {
    const { data: bookDetails } = useQuery({
        queryKey: ['book', googleBookId],
        queryFn: () => import('../services/googleBooksService').then(m => m.getBookDetails(googleBookId)),
        staleTime: 1000 * 60 * 60,
    });

    if (!bookDetails) return <div className="w-full h-full bg-paper-100 dark:bg-stone-900 animate-pulse" />;

    const thumbnail = bookDetails.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:').replace('zoom=1', 'zoom=2');
    return (
        <img
            src={thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(bookDetails.volumeInfo.title || 'B')}&background=0D9488&color=fff&size=512&bold=true`}
            alt={bookDetails.volumeInfo.title}
            className="w-full h-full object-cover"
            onError={(e) => {
                e.target.onerror = null;
                const colors = ['0D9488', '0891B2', '4F46E5', '7C3AED', 'DB2777', '2563EB'];
                const fallbackIdx = Math.abs(googleBookId?.charCodeAt(0) || 0) % colors.length;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bookDetails.volumeInfo.title || 'B')}&background=${colors[fallbackIdx]}&color=fff&size=512&bold=true`;
            }}
        />
    );
};

export default LandingPage;
