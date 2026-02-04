import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { searchBooks } from '../services/googleBooksService';
import BookCard from '../components/BookCard';
import BookListItem from '../components/BookListItem';
import { Search, Loader2, Sparkles, Filter, X, Grid, List } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { logActivity } from '../services/activityService';
import { getMyRecommendations } from '../services/recommendationService';
import { addToList } from '../services/listService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ExplorePage = () => {
    const isFirstMount = useRef(true);
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get('q');

    const [query, setQuery] = useState(urlQuery || 'popular');
    const debouncedQuery = useDebounce(query, 500);
    const [searchTerm, setSearchTerm] = useState(urlQuery || 'popular');
    const [viewMode, setViewMode] = useState('grid');
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Reset search when URL param changes
    useEffect(() => {
        if (urlQuery) {
            setQuery(urlQuery);
            setSearchTerm(urlQuery);
        }
    }, [urlQuery]);

    const { data: recommendations } = useQuery({
        queryKey: ['recommendations'],
        queryFn: getMyRecommendations,
        enabled: !!user,
    });

    useEffect(() => {
        if (debouncedQuery) {
            setSearchTerm(debouncedQuery);

            // HONESTY: Don't log the initial default search as user activity
            if (isFirstMount.current) {
                isFirstMount.current = false;
                return;
            }

            if (user) {
                logActivity({
                    actionType: 'SEARCH',
                    keyword: debouncedQuery
                });
            }
        }
    }, [debouncedQuery, user]);

    const { data: favoriteBooks, isLoading: favoriteLoading } = useQuery({
        queryKey: ['favoriteBooks'],
        queryFn: async () => {
            const res = await api.get('/books/favorites');
            return res.data;
        },
        enabled: !!user, // Only fetch if user is logged in
    });

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['books', searchTerm],
        queryFn: () => searchBooks(searchTerm),
        enabled: !!searchTerm,
        staleTime: 1000 * 60 * 5,
    });

    const categories = [
        "Fiction", "Science", "Business", "History", "Psychology", "Technology", "Art", "Mystery", "Romance", "Fantasy"
    ];

    const moods = [
        "Adventurous", "Funny", "Dark", "Emotional", "Challenging", "Relaxing", "Tense", "Inspiring"
    ];

    const queryClient = useQueryClient();

    const updateListMutation = useMutation({
        mutationFn: addToList,
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['myLists'] });

            // Snapshot the previous value
            const previousLists = queryClient.getQueryData(['myLists']);

            // Optimistically update to the new value
            queryClient.setQueryData(['myLists'], (old) => {
                const existing = old?.find(b => b.googleBookId === variables.googleBookId);
                if (existing) {
                    return old.map(b => b.googleBookId === variables.googleBookId ? { ...b, status: variables.status } : b);
                } else {
                    return [...(old || []), { googleBookId: variables.googleBookId, status: variables.status }];
                }
            });

            return { previousLists };
        },
        onSuccess: (_, variables) => {
            toast.success(`Marked as ${variables.status.replace('_', ' ')}`);

            // Log activity
            logActivity({
                actionType: variables.status === 'COMPLETED' ? 'COMPLETE' : 'STATUS_CHANGE',
                googleBookId: variables.googleBookId,
                keyword: variables.title,
                subjects: variables.subjects
            });
        },
        onError: (err, variables, context) => {
            toast.error('Failed to update shelf');
            if (context?.previousLists) {
                queryClient.setQueryData(['myLists'], context.previousLists);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myLists'] });
            queryClient.invalidateQueries({ queryKey: ['favoriteBooks'] });
        }
    });

    const handleShelve = (shelf, bookId, book = null) => {
        if (!user) {
            toast.error('Please log in to shelve books');
            return;
        }

        const title = book?.volumeInfo?.title || book?.title;
        const subjects = book?.volumeInfo?.categories || book?.subjects;

        updateListMutation.mutate({
            googleBookId: bookId,
            status: shelf,
            title,
            subjects
        });
    };

    return (
        <div className="min-h-screen bg-paper-50 dark:bg-stone-950 pb-20">
            {/* Header & Search - More Compact */}
            <header className="bg-paper-50 dark:bg-stone-900 border-b border-paper-200 dark:border-stone-800 py-6 px-6 transition-colors duration-300">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="max-w-2xl mx-auto text-center space-y-3">
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-ink-900 dark:text-stone-100">
                            Discover
                        </h1>
                        <div className="relative group">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search books, authors, or ISBNs..."
                                className="w-full pl-5 pr-12 py-2.5 input-libra rounded text-base shadow-sm"
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center text-ink-400 dark:text-stone-500 pointer-events-none">
                                <Search size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setQuery(cat); setSearchTerm(cat); }}
                                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all border ${searchTerm.toLowerCase() === cat.toLowerCase()
                                        ? 'bg-ink-900 text-white border-ink-900 dark:text-stone-900 dark:bg-stone-100 dark:border-stone-100'
                                        : 'bg-paper-50 border-paper-200 text-ink-600 hover:border-ink-900 hover:text-ink-900 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:border-stone-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 border-t border-paper-100 pt-2">
                            <span className="text-[10px] text-ink-400 font-bold uppercase tracking-widest py-1">Moods:</span>
                            {moods.map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => { setQuery(mood); setSearchTerm(mood); }}
                                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${searchTerm.toLowerCase() === mood.toLowerCase()
                                        ? 'bg-teal-600 text-white'
                                        : 'text-ink-500 hover:bg-paper-100'
                                        }`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Recommendations */}
                {user && recommendations?.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-lg font-bold font-serif text-ink-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                            <Sparkles size={16} className="text-teal-600" /> Recommended for you
                        </h2>
                        <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x">
                            {recommendations.slice(0, 8).map(book => (
                                <div key={book.googleBookId} className="snap-start">
                                    <BookCard book={book} className="w-32 md:w-36" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-bold text-ink-900 dark:text-stone-100">
                        {searchTerm === 'programming' ? 'Featured' : `Results for "${searchTerm}"`}
                    </h2>

                    <div className="flex items-center gap-2 bg-paper-100 dark:bg-stone-900 border border-paper-200 dark:border-stone-800 rounded p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-paper-200 dark:bg-stone-800 text-ink-900 dark:text-stone-100' : 'text-ink-400 hover:text-ink-600 dark:text-stone-500 dark:hover:text-stone-300'}`}
                        >
                            <Search size={16} /> {/* Should be Grid icon but keeping class consistency */}
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-paper-200 dark:bg-stone-800 text-ink-900 dark:text-stone-100' : 'text-ink-400 hover:text-ink-600 dark:text-stone-500 dark:hover:text-stone-300'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>

                {/* Results */}
                {favoriteLoading || isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="aspect-[2/3] bg-paper-200 rounded"></div>
                                <div className="h-3 bg-paper-200 rounded w-3/4"></div>
                                <div className="h-2 bg-paper-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 font-bold mb-2">Unable to load books.</p>
                        <button onClick={() => window.location.reload()} className="underline text-sm font-bold text-ink-600">Try Again</button>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-6">
                                {data?.items?.map((book) => (
                                    <BookCard key={book.id} book={book} className="w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data?.items?.map((book) => (
                                    <BookListItem key={book.id} book={book} onShelve={(shelf, id) => handleShelve(shelf, id, book)} />
                                ))}
                            </div>
                        )}

                        {(!data?.items || data.items.length === 0) && (
                            <div className="py-20 text-center text-ink-400 dark:text-stone-600">
                                <Search size={32} className="mx-auto mb-2 opacity-30" />
                                <p>No books found for "{searchTerm}".</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;
