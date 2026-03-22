import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookDetails } from '../services/googleBooksService';
import { useAuthStore } from '../store/authStore';
import {
    Loader2, Heart, BookOpen, Clock, CheckCircle, Star, Send, Trash2, ChevronLeft, Calendar, Book, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getBookReviews, addReview, deleteReview } from '../services/reviewService';
import { getMyLists, addToList } from '../services/listService';
import { logActivity } from '../services/activityService';
import ReviewList from '../components/ReviewList';
import ReadingProgressModal from '../components/ReadingProgressModal';
import { updateProgress, getProgress } from '../services/progressService';
import { getFavoriteBooks, favoriteBook, unfavoriteBook } from '../services/bookService';
const BookDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [isListOpen, setIsListOpen] = useState(false);

    const { data: book, isLoading, isError } = useQuery({
        queryKey: ['book', id],
        queryFn: () => getBookDetails(id),
    });

    // Fetch existing progress
    const { data: progressData } = useQuery({
        queryKey: ['progress', id],
        queryFn: () => getProgress(id),
        enabled: !!user && !!id
    });

    useEffect(() => {
        if (book && user) {
            logActivity({
                actionType: 'VIEW',
                googleBookId: id,
                bookTitle: book.volumeInfo.title,
                bookAuthor: book.volumeInfo.authors?.[0],
                bookCover: book.volumeInfo.imageLinks?.thumbnail,
                subjects: book.volumeInfo.categories
            });
        }
    }, [book, id, user]);

    const [reviewSort] = useState('newest');
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

    const { data: reviewsData, refetch: refetchReviews } = useQuery({
        queryKey: ['reviews', id, reviewSort],
        queryFn: () => getBookReviews(id, reviewSort),
    });

    const { data: myLists } = useQuery({
        queryKey: ['myLists'],
        queryFn: getMyLists,
        enabled: !!user,
    });

    const savedStatus = myLists?.find(b => b.googleBookId === id)?.status;

    // Favorite Logic
    const { data: favoriteBooks } = useQuery({
        queryKey: ['favoriteBooks'],
        queryFn: getFavoriteBooks,
        enabled: !!user,
        staleTime: 1000 * 60 * 5 // 5 mins
    });

    const isFavorited = favoriteBooks?.some(b => b.googleBookId === id);

    const toggleFavoriteMutation = useMutation({
        mutationFn: async () => {
            if (!user) {
                toast.error('Please login to favorite books');
                throw new Error('Unauthorized');
            }

            if (isFavorited) {
                await unfavoriteBook(id);
                return 'unfavorited';
            } else {
                const thumbnail = book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/300x450?text=No+Cover';
                await favoriteBook({
                    googleBookId: id,
                    title: book.volumeInfo?.title || 'Unknown Title',
                    authors: Array.isArray(book.volumeInfo?.authors) ? book.volumeInfo.authors : [book.volumeInfo?.authors || 'Unknown'],
                    thumbnail: thumbnail,
                    categories: Array.isArray(book.volumeInfo?.categories) ? book.volumeInfo.categories : [],
                    rating: book.averageRating || book.volumeInfo?.averageRating
                });
                return 'favorited';
            }
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['favoriteBooks'] });
            const previousFavorites = queryClient.getQueryData(['favoriteBooks']);
            queryClient.setQueryData(['favoriteBooks'], (old) => {
                if (isFavorited) {
                    return old?.filter(b => b.googleBookId !== id);
                } else {
                    const thumbnail = book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/300x450?text=No+Cover';
                    return [...(old || []), {
                        googleBookId: id,
                        title: book.volumeInfo?.title,
                        thumbnail: thumbnail,
                        authors: Array.isArray(book.volumeInfo?.authors) ? book.volumeInfo.authors : [book.volumeInfo?.authors]
                    }];
                }
            });
            return { previousFavorites };
        },
        onSuccess: (action) => {
            toast.success(action === 'favorited' ? 'Added to favorites' : 'Removed from favorites');
            if (action === 'favorited') {
                const thumbnail = book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/300x450?text=No+Cover';
                logActivity({
                    actionType: 'SAVE',
                    googleBookId: id,
                    bookTitle: book.volumeInfo?.title,
                    bookAuthor: Array.isArray(book.volumeInfo?.authors) ? book.volumeInfo.authors[0] : (book.volumeInfo?.authors || 'Unknown'),
                    bookCover: thumbnail,
                    keyword: book.volumeInfo?.title,
                    subjects: Array.isArray(book.volumeInfo?.categories) ? book.volumeInfo.categories : [book.volumeInfo?.categories].filter(Boolean)
                });
            }
        },
        onError: (err, variables, context) => {
            if (err.message !== 'Unauthorized') {
                toast.error(err.response?.data?.message || 'Failed to update favorites');
                if (context?.previousFavorites) {
                    queryClient.setQueryData(['favoriteBooks'], context.previousFavorites);
                }
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteBooks'] });
        }
    });

    const updateListMutation = useMutation({
        mutationFn: async (newStatus) => {
            await addToList({
                googleBookId: id,
                status: newStatus
            });
        },
        onMutate: async (newStatus) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['myLists'] });

            // Snapshot the previous value
            const previousLists = queryClient.getQueryData(['myLists']);

            // Optimistically update to the new value
            queryClient.setQueryData(['myLists'], (old) => {
                const existing = old?.find(b => b.googleBookId === id);
                if (existing) {
                    return old.map(b => b.googleBookId === id ? { ...b, status: newStatus } : b);
                } else {
                    return [...(old || []), { googleBookId: id, status: newStatus }];
                }
            });

            return { previousLists };
        },
        onSuccess: (_, newStatus) => {
            toast.success(`Moved to ${newStatus.replace('_', ' ')}`);

            // Log activity
            logActivity({
                actionType: newStatus === 'COMPLETED' ? 'COMPLETE' : 'STATUS_CHANGE',
                googleBookId: id,
                bookTitle: book?.volumeInfo?.title,
                bookAuthor: book?.volumeInfo?.authors?.[0],
                bookCover: book?.volumeInfo?.imageLinks?.thumbnail,
                keyword: book?.volumeInfo?.title,
                subjects: book?.volumeInfo?.categories
            });
        },
        onError: (err, variables, context) => {
            toast.error(err.response?.data?.message || 'Failed to update shelf');
            if (context?.previousLists) {
                queryClient.setQueryData(['myLists'], context.previousLists);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myLists'] });
            queryClient.invalidateQueries({ queryKey: ['favoriteBooks'] });
        }
    });

    const addReviewMutation = useMutation({
        mutationFn: addReview,
        onSuccess: () => {
            toast.success('Review posted');
            refetchReviews();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to post review');
        }
    });

    const deleteReviewMutation = useMutation({
        mutationFn: deleteReview,
        onSuccess: () => {
            toast.success('Review deleted');
            refetchReviews();
        }
    });

    const handleShelve = (shelf) => {
        updateListMutation.mutate(shelf);
        setIsListOpen(false);
    };

    const handleProgressUpdate = async (page, totalPages) => {
        try {
            await updateProgress({
                googleBookId: id,
                currentPage: page,
                totalPages: totalPages
            });
            toast.success('Progress updated!');
            queryClient.invalidateQueries({ queryKey: ['progress', id] });
            queryClient.invalidateQueries({ queryKey: ['book', id] });
            queryClient.invalidateQueries({ queryKey: ['favoriteBooks'] }); // Invalidate favoriteBooks to reflect status change
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update progress');
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-teal-600 w-10 h-10" /></div>;
    if (isError || !book) return <div className="text-center py-40 text-ink-400 dark:text-stone-500 font-serif">Book details not found.</div>;

    const volumeInfo = book.volumeInfo;
    const thumbnail = volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/300x450?text=No+Cover';

    return (
        <div className="min-h-screen bg-paper-50 dark:bg-stone-950 pb-20">
            <div className="max-w-6xl mx-auto px-6 pt-8">
                {/* Back Link */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-500 dark:text-stone-500 hover:text-ink-900 dark:hover:text-stone-200 mb-6 transition-colors group text-sm font-bold uppercase tracking-wider">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="grid md:grid-cols-12 gap-10">
                    {/* LEFT: Cover & Actions */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-6">
                        <div className="relative rounded md:rounded shadow-lg border border-paper-200 dark:border-stone-800 overflow-hidden bg-paper-100 dark:bg-stone-800">
                            <img
                                src={thumbnail.replace('zoom=1', 'zoom=3')}
                                alt={volumeInfo.title}
                                className="w-full h-auto object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Cover';
                                }}
                            />
                        </div>

                        {user ? (
                            <div className="space-y-4">
                                {/* Action Buttons */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsListOpen(!isListOpen)}
                                        className="w-full py-2 btn-primary flex items-center justify-center gap-2 text-sm font-bold shadow-sm"
                                    >
                                        <span className="flex-1 text-center pl-6">
                                            {savedStatus === 'TO_READ' && 'Want to Read'}
                                            {savedStatus === 'READING' && 'Currently Reading'}
                                            {savedStatus === 'COMPLETED' && 'Read'}
                                            {!savedStatus && 'Add to List'}
                                        </span>
                                        <div className="w-px h-6 bg-white/20"></div>
                                        <ChevronDown size={16} className={`transition-transform px-2 box-content ${isListOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isListOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsListOpen(false)} />
                                            <div className="absolute top-full left-0 w-full mt-1 bg-paper-50 border border-paper-200 shadow-xl rounded-md overflow-hidden z-50 dark:bg-stone-900 dark:border-stone-800">
                                                <button onClick={() => handleShelve('TO_READ')} className="w-full text-left px-4 py-2 hover:bg-paper-100 text-sm text-ink-900 flex items-center gap-2 dark:hover:bg-stone-800 dark:text-stone-300">
                                                    <Clock size={14} className="text-teal-600" /> Want to Read
                                                </button>
                                                <button onClick={() => handleShelve('READING')} className="w-full text-left px-4 py-2 hover:bg-paper-100 text-sm text-ink-900 flex items-center gap-2 dark:hover:bg-stone-800 dark:text-stone-300">
                                                    <BookOpen size={14} className="text-amber-500" /> Currently Reading
                                                </button>
                                                <button onClick={() => handleShelve('COMPLETED')} className="w-full text-left px-4 py-2 hover:bg-paper-100 text-sm text-ink-900 flex items-center gap-2 dark:hover:bg-stone-800 dark:text-stone-300">
                                                    <CheckCircle size={14} className="text-green-600" /> Read
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {savedStatus === 'READING' && (
                                    <button
                                        onClick={() => setIsProgressModalOpen(true)}
                                        className="w-full py-2 border border-teal-600 text-teal-700 bg-paper-50 font-bold text-sm hover:bg-teal-50 transition-colors rounded dark:bg-stone-900 dark:text-teal-500 dark:hover:bg-stone-800"
                                    >
                                        Update Progress
                                    </button>
                                )}

                                {/* Read Free Button */}
                                {(book.isFree || book.accessInfo?.embeddable || book.accessInfo?.webReaderLink) && (
                                    <button
                                        onClick={() => {
                                            if (book.isFree && book.readLink) {
                                                navigate(`/read/${id}`, { state: { readLink: book.readLink, isFree: true, title: book.volumeInfo.title } });
                                            } else if (book.accessInfo?.embeddable) {
                                                navigate(`/read/${id}`, { state: { bookData: book, title: book.volumeInfo.title } });
                                            } else if (book.accessInfo?.webReaderLink) {
                                                window.open(book.accessInfo.webReaderLink, '_blank');
                                            }
                                        }}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors rounded shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <BookOpen size={16} /> Look Inside / Read
                                    </button>
                                )}

                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Link to="/login" className="block w-full text-center py-2 btn-primary font-bold text-sm">
                                    Sign in to Shelve
                                </Link>

                                {/* Read Free Button for Unauthenticated Users */}
                                {(book.isFree || book.accessInfo?.embeddable || book.accessInfo?.webReaderLink) && (
                                    <button
                                        onClick={() => {
                                            if (book.isFree && book.readLink) {
                                                navigate(`/read/${id}`, { state: { readLink: book.readLink, isFree: true, title: book.volumeInfo.title } });
                                            } else if (book.accessInfo?.embeddable) {
                                                navigate(`/read/${id}`, { state: { bookData: book, title: book.volumeInfo.title } });
                                            } else if (book.accessInfo?.webReaderLink) {
                                                window.open(book.accessInfo.webReaderLink, '_blank');
                                            }
                                        }}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors rounded shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <BookOpen size={16} /> Look Inside / Read
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Metadata & Content */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-8">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink-900 dark:text-stone-100 leading-tight mb-2">{volumeInfo.title}</h1>
                                <p className="text-xl text-ink-600 dark:text-stone-400 font-serif">
                                    by <span className="text-ink-900 dark:text-stone-200 font-bold hover:underline cursor-pointer">{volumeInfo.authors?.join(', ')}</span>
                                </p>
                            </div>
                            {user && (
                                <button
                                    onClick={() => toggleFavoriteMutation.mutate()}
                                    className={`p-3 rounded-full flex-shrink-0 border transition-all ${isFavorited ? 'border-red-200 bg-red-50 text-red-500 dark:bg-red-900/20 dark:border-red-900' : 'border-paper-200 bg-white text-ink-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:bg-stone-900 dark:border-stone-800 dark:hover:bg-red-900/20 dark:hover:border-red-900'}`}
                                    title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    <Heart size={24} fill={isFavorited ? "currentColor" : "none"} className={isFavorited ? "scale-110 transition-transform" : "transition-transform"} />
                                </button>
                            )}
                        </div>

                        {/* Description */}
                        <div className="prose prose-stone dark:prose-invert prose-sm max-w-none text-ink-800 dark:text-stone-300 leading-relaxed font-sans">
                            <div dangerouslySetInnerHTML={{ __html: volumeInfo.description || '<p>No description available.</p>' }} />
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-paper-200 dark:border-stone-800">
                            <div>
                                <p className="text-xs text-ink-500 dark:text-stone-500 uppercase font-bold tracking-wider">Pages</p>
                                <p className="text-ink-900 dark:text-stone-200 font-medium">{volumeInfo.pageCount || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-ink-500 dark:text-stone-500 uppercase font-bold tracking-wider">Format</p>
                                <p className="text-ink-900 dark:text-stone-200 font-medium">Digital / Print</p>
                            </div>
                            <div>
                                <p className="text-xs text-ink-500 dark:text-stone-500 uppercase font-bold tracking-wider">Published</p>
                                <p className="text-ink-900 dark:text-stone-200 font-medium">{volumeInfo.publishedDate?.substring(0, 4)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-ink-500 dark:text-stone-500 uppercase font-bold tracking-wider">ISBN</p>
                                <p className="text-ink-900 dark:text-stone-200 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{volumeInfo.industryIdentifiers?.[0]?.identifier || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                            {volumeInfo.categories?.map(cat => (
                                <Link key={cat} to={`/explore?category=${cat}`} className="text-xs font-bold text-teal-700 hover:underline bg-teal-50 dark:bg-teal-900/20 dark:text-teal-500 px-2 py-1 rounded">
                                    {cat}
                                </Link>
                            ))}
                        </div>

                        {/* Reviews Section */}
                        <div className="pt-8">
                            <ReviewList
                                reviews={reviewsData?.reviews || []}
                                user={user}
                                onAddReview={({ rating, reviewText }) => addReviewMutation.mutate({ googleBookId: id, rating, reviewText })}
                                onDeleteReview={(reviewId) => deleteReviewMutation.mutate(reviewId)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ReadingProgressModal
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                book={{
                    googleBookId: id,
                    title: volumeInfo.title,
                    authors: volumeInfo.authors,
                    coverImage: thumbnail,
                    pageCount: volumeInfo.pageCount,
                    currentPage: progressData?.currentPage || 0
                }}
                onUpdate={handleProgressUpdate}
            />
        </div >
    );
};

export default BookDetailsPage;
