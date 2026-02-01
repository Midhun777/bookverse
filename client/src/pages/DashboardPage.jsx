import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Clock, CheckCircle, Loader2, Sparkles, ChevronRight, Star } from 'lucide-react';
import ListBookCard from '../components/ListBookCard';

const DashboardPage = () => {
    const { user } = useAuthStore();
    const readingRef = useRef(null);
    const toReadRef = useRef(null);
    const completedRef = useRef(null);

    const { data: favoriteBooks, isLoading: favoriteLoading } = useQuery({
        queryKey: ['favoriteBooks'],
        queryFn: async () => {
            const res = await api.get('/books/favorites');
            return res.data;
        }
    });

    const { data: myLists, isLoading: lisLoading } = useQuery({
        queryKey: ['myLists'],
        queryFn: async () => {
            const res = await api.get('/lists/my');
            return res.data;
        }
    });

    const readingItems = myLists?.filter(l => l.status === 'READING') || [];
    const toReadItems = myLists?.filter(l => l.status === 'TO_READ') || [];
    const completedItems = myLists?.filter(l => l.status === 'COMPLETED') || [];

    const { data: myRecs } = useQuery({
        queryKey: ['myRecommendations'],
        queryFn: import('../services/recommendationService').then(m => m.getMyRecommendations),
        enabled: !!user,
    });

    const { data: globalRecs } = useQuery({
        queryKey: ['globalRecommendations'],
        queryFn: import('../services/recommendationService').then(m => m.getGlobalRecommendations),
    });

    const scrollTo = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (favoriteLoading || lisLoading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400 w-10 h-10" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-24 pb-20">
            {/* Simple Greeting */}
            <header className="space-y-4 pt-12">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 serif">Hello, {user?.name.split(' ')[0]}</h1>
                <p className="text-lg text-gray-500 font-medium italic">Your personal reading journal at a glance.</p>
                <div className="flex flex-wrap gap-4 pt-4">
                    <button onClick={() => scrollTo(readingRef)} className="flex items-center space-x-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
                        <BookOpen size={16} /> <span>Reading ({readingItems.length})</span>
                    </button>
                    <button onClick={() => scrollTo(toReadRef)} className="flex items-center space-x-2 text-sm font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors">
                        <Clock size={16} /> <span>To Read ({toReadItems.length})</span>
                    </button>
                    <button onClick={() => scrollTo(completedRef)} className="flex items-center space-x-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 hover:bg-green-100 transition-colors">
                        <CheckCircle size={16} /> <span>Completed ({completedItems.length})</span>
                    </button>
                </div>
            </header>

            {/* Personalized Recommendations */}
            {myRecs && myRecs.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Sparkles size={20} className="text-yellow-500" />
                            <h2 className="text-2xl font-bold serif">Recommended for You</h2>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                        {myRecs.map(book => (
                            <Link key={book.id} to={`/book/${book.id}`} className="min-w-[140px] w-[140px] snap-start group space-y-2">
                                <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-100 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md relative">
                                    <img src={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')} alt={book.volumeInfo.title} className="w-full h-full object-cover" />
                                    {book.reasons && book.reasons[0] && (
                                        <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm p-2">
                                            <p className="text-[9px] text-white font-medium leading-tight line-clamp-2">{book.reasons[0]}</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xs truncate serif">{book.volumeInfo.title}</h3>
                                    <p className="text-[10px] text-gray-400 truncate">{book.volumeInfo.authors?.[0]}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Global Trending */}
            {globalRecs && globalRecs.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Star size={20} className="text-purple-500" />
                            <h2 className="text-2xl font-bold serif">Trending on Bookverse</h2>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                        {globalRecs.map(book => (
                            <Link key={book.id} to={`/book/${book.id}`} className="min-w-[140px] w-[140px] snap-start group space-y-2">
                                <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-100 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md">
                                    <img src={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')} alt={book.volumeInfo.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xs truncate serif">{book.volumeInfo.title}</h3>
                                    <p className="text-[10px] text-gray-400 truncate">{book.volumeInfo.authors?.[0]}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Currently Reading */}
            <section ref={readingRef} className="space-y-10 scroll-mt-32">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold serif">Currently Reading</h2>
                    <Link to="/lists" className="text-sm font-semibold text-gray-400 hover:text-gray-900 flex items-center gap-1 transition-colors">
                        Manage all lists <ChevronRight size={16} />
                    </Link>
                </div>
                {readingItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {readingItems.map(item => (
                            <ListBookCard key={item._id} item={item} dark={false} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium italic">You're not reading anything at the moment.</p>
                        <Link to="/explore" className="text-blue-600 font-bold text-sm block mt-4">Browse library</Link>
                    </div>
                )}
            </section>

            {/* To Read List - Simple Grid */}
            <section ref={toReadRef} className="space-y-10 scroll-mt-32">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold serif">Ready to dive in</h2>
                    <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">{toReadItems.length} Books</span>
                </div>
                {toReadItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {toReadItems.map(item => (
                            <ListBookCard key={item._id} item={item} small dark={false} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white border border-dashed border-gray-100 rounded-2xl">
                        <p className="text-gray-400 font-medium italic">Your reading queue is empty.</p>
                    </div>
                )}
            </section>

            {/* Completed Archive */}
            <section ref={completedRef} className="space-y-10 scroll-mt-32">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold serif">Finished</h2>
                    <p className="text-sm font-semibold text-gray-400 italic">Total of {completedItems.length} books read</p>
                </div>
                {completedItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                        {completedItems.map(item => (
                            <Link key={item._id} to={`/book/${item.googleBookId}`} className="group space-y-3">
                                <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-100 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md">
                                    <ShelfItem googleBookId={item.googleBookId} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Completed</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(item.completedAt).toLocaleDateString()}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium italic">You haven't added any completed books yet.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

const ShelfItem = ({ googleBookId }) => {
    const { data: bookDetails } = useQuery({
        queryKey: ['book', googleBookId],
        queryFn: () => import('../services/openLibraryService').then(m => m.getBookDetails(googleBookId)),
        staleTime: 1000 * 60 * 60,
    });

    if (!bookDetails) return <div className="w-full h-full bg-gray-50 animate-pulse" />;

    const thumbnail = bookDetails.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:');
    const rating = bookDetails.volumeInfo.averageRating;

    return (
        <div className="relative w-full h-full">
            <img src={thumbnail} alt={bookDetails.volumeInfo.title} className="w-full h-full object-cover" />
            {rating && (
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                    <Star size={8} className="text-yellow-400 fill-current" />
                    <span>{rating}</span>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
