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

    const { data: myRecsData } = useQuery({
        queryKey: ['myRecommendations'],
        queryFn: async () => {
            const res = await api.get('/recommendations/my');
            return res.data;
        },
        enabled: !!user,
    });

    const recommendations = myRecsData?.feed || [];

    const { data: globalRecs } = useQuery({
        queryKey: ['globalRecommendations'],
        queryFn: async () => {
            const res = await api.get('/recommendations/global');
            return res.data;
        }
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
        <div className="max-w-4xl mx-auto space-y-20 pb-24 px-4 overflow-hidden">
            {/* Simple Greeting */}
            <header className="space-y-4 pt-12 transition-colors duration-300">
                <h1 className="text-4xl lg:text-5xl font-bold text-ink-900 dark:text-stone-100 serif">Hello, {user?.name.split(' ')[0]}</h1>
                <p className="text-lg text-ink-600 dark:text-stone-400 font-medium italic">Your personal reading journal at a glance.</p>
                <div className="flex flex-wrap gap-4 pt-4">
                    <button onClick={() => scrollTo(readingRef)} className="flex items-center space-x-2 text-sm font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-full border border-teal-100 hover:bg-teal-100 transition-colors dark:bg-teal-900/20 dark:border-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/40">
                        <BookOpen size={16} /> <span>Reading ({readingItems.length})</span>
                    </button>
                    <button onClick={() => scrollTo(toReadRef)} className="flex items-center space-x-2 text-sm font-bold text-ink-600 bg-paper-100 px-4 py-2 rounded-full border border-paper-200 hover:bg-paper-200 transition-colors dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700">
                        <Clock size={16} /> <span>To Read ({toReadItems.length})</span>
                    </button>
                    <button onClick={() => scrollTo(completedRef)} className="flex items-center space-x-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40">
                        <CheckCircle size={16} /> <span>Completed ({completedItems.length})</span>
                    </button>
                </div>
            </header>

            {/* Combined Recommendations Feed */}
            {recommendations.length > 0 && recommendations.map((section, idx) => (
                <section key={idx} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {section.type === 'GLOBAL' ? (
                                <Star size={24} className="text-purple-500 fill-purple-500/10" />
                            ) : (
                                <Sparkles size={24} className="text-amber-500 fill-amber-500/10" />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold serif text-ink-900 dark:text-stone-100">{section.title}</h2>
                                <p className="text-xs text-ink-400 dark:text-stone-500 font-medium italic">{section.description}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-4 px-4">
                        {section.books.map(book => {
                            const isFlat = !!(book.title && (Array.isArray(book.authors) || typeof book.authors === 'string'));
                            const title = isFlat ? book.title : book.volumeInfo?.title;
                            const authors = isFlat ? book.authors : book.volumeInfo?.authors;

                            // High quality thumbnail handling
                            let thumbnail = book.coverImage || book.thumbnail || (isFlat ? null : book.volumeInfo?.imageLinks?.thumbnail);
                            if (thumbnail) {
                                thumbnail = thumbnail.replace('http:', 'https:').replace('zoom=1', 'zoom=2');
                            } else {
                                thumbnail = `https://via.placeholder.com/300x450?text=${encodeURIComponent(title || 'No Cover')}`;
                            }

                            const id = book.googleBookId || book.id || (isFlat ? null : book.id);

                            return (
                                <Link key={id} to={`/book/${id}`} className="min-w-[140px] w-[140px] snap-start group space-y-3">
                                    <div className="aspect-[2/3] rounded-xl overflow-hidden border border-gray-100 dark:border-stone-800 shadow-sm transition-all group-hover:-translate-y-2 group-hover:shadow-xl relative bg-paper-100 dark:bg-stone-800">
                                        <img
                                            src={thumbnail}
                                            alt={title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                const fallbackIdx = (idx + (title?.length || 0)) % 4;
                                                const colors = ['teal', 'indigo', 'amber', 'rose'];
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title || 'B')}&background=${colors[fallbackIdx]}&color=fff&size=512&bold=true`;
                                            }}
                                        />
                                        {book.reasons && book.reasons[0] && (
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6">
                                                <p className="text-[10px] text-white/90 font-bold leading-tight line-clamp-2 uppercase tracking-wider">{book.reasons[0]}</p>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg">
                                                <ChevronRight size={14} className="text-teal-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-stone-100 text-[13px] leading-tight line-clamp-2 serif group-hover:text-teal-600 transition-colors">{title}</h3>
                                        <p className="text-[11px] text-gray-400 dark:text-stone-500 mt-1 truncate">{Array.isArray(authors) ? authors[0] : authors}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            ))}

            {/* Fallback Trending if no specific recs (though we should always have some) */}
            {recommendations.length === 0 && globalRecs && globalRecs.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Star size={24} className="text-purple-500" />
                            <h2 className="text-2xl font-bold serif text-ink-900 dark:text-stone-100">Popular on Bookverse</h2>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                        {globalRecs.map(book => (
                            <Link key={book.googleBookId} to={`/book/${book.googleBookId}`} className="min-w-[140px] w-[140px] snap-start group space-y-2">
                                <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-100 dark:border-stone-800 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md bg-paper-100 dark:bg-stone-800">
                                    <img
                                        src={book.coverImage?.replace('zoom=1', 'zoom=2') || 'https://via.placeholder.com/200x300'}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-stone-100 text-xs truncate serif">{book.title}</h3>
                                <p className="text-[10px] text-gray-400 dark:text-stone-500 truncate">{book.authors?.[0]}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Currently Reading */}
            <section ref={readingRef} className="space-y-10 scroll-mt-32">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-stone-800 pb-4">
                    <h2 className="text-2xl font-bold serif text-ink-900 dark:text-stone-100">Currently Reading</h2>
                    <Link to="/lists" className="text-sm font-semibold text-gray-400 dark:text-stone-500 hover:text-gray-900 dark:hover:text-stone-300 flex items-center gap-1 transition-colors">
                        Manage all lists <ChevronRight size={16} />
                    </Link>
                </div>
                {readingItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {readingItems.map(item => (
                            <ListBookCard key={item._id} item={item} dark={true} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-paper-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-paper-200 dark:border-stone-800">
                        <p className="text-ink-400 dark:text-stone-500 font-medium italic">You're not reading anything at the moment.</p>
                        <Link to="/explore" className="text-teal-600 dark:text-teal-500 font-bold text-sm block mt-4">Browse library</Link>
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
                    <div className="py-20 text-center bg-paper-50 border border-dashed border-paper-200 rounded-2xl">
                        <p className="text-ink-400 font-medium italic">Your reading queue is empty.</p>
                    </div>
                )}
            </section>

            {/* Completed Archive */}
            <section ref={completedRef} className="space-y-10 scroll-mt-32">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-stone-800 pb-4">
                    <h2 className="text-2xl font-bold serif text-ink-900 dark:text-stone-100">Finished</h2>
                    <p className="text-sm font-semibold text-gray-400 dark:text-stone-500 italic">Total of {completedItems.length} books read</p>
                </div>
                {completedItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                        {completedItems.map(item => (
                            <Link key={item._id} to={`/book/${item.googleBookId}`} className="group space-y-3">
                                <div className="aspect-[2/3] rounded-lg overflow-hidden border border-paper-200 dark:border-stone-800 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md bg-paper-100 dark:bg-stone-800">
                                    <ShelfItem googleBookId={item.googleBookId} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">Completed</p>
                                    <p className="text-xs text-ink-400 dark:text-stone-500 mt-1">{new Date(item.completedAt).toLocaleDateString()}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-paper-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-paper-200 dark:border-stone-800">
                        <p className="text-ink-400 dark:text-stone-500 font-medium italic">You haven't added any completed books yet.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

const ShelfItem = ({ googleBookId }) => {
    const { data: bookDetails } = useQuery({
        queryKey: ['book', googleBookId],
        queryFn: () => import('../services/googleBooksService').then(m => m.getBookDetails(googleBookId)),
        staleTime: 1000 * 60 * 60,
    });

    if (!bookDetails) return <div className="w-full h-full bg-gray-50 dark:bg-stone-800 animate-pulse" />;

    const thumbnail = bookDetails.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:').replace('zoom=1', 'zoom=2');
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
