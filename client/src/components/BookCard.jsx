import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavoriteBooks, favoriteBook, unfavoriteBook } from '../services/bookService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { logActivity } from '../services/activityService';

const BookCard = ({ book, className = "w-32 md:w-40" }) => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // Robust ID extraction
    let id = book.googleBookId || book.openLibraryId || book.id || book._id;
    if (typeof id === 'string' && id.includes('/works/')) {
        id = id.split('/works/')[1];
    }

    // Normalize data
    const isFlat = !!book.title;
    const title = isFlat ? book.title : book.volumeInfo?.title;
    const authors = isFlat ? (book.authors || []) : book.volumeInfo?.authors;
    let thumbnail = book.coverImage || book.thumbnail || (isFlat ? null : book.volumeInfo?.imageLinks?.thumbnail);

    // Force HTTPS and prefer higher resolution if it's a Google Books URL
    if (thumbnail && typeof thumbnail === 'string') {
        thumbnail = thumbnail.replace('http:', 'https:');
        if (thumbnail.includes('googleusercontent.com') || thumbnail.includes('books.google.com')) {
            thumbnail = thumbnail.replace('zoom=1', 'zoom=2').replace('zoom=5', 'zoom=2');
        }
    }

    const avgRating = book.averageRating || book.volumeInfo?.averageRating;
    const categories = book.subjects || book.categories || book.volumeInfo?.categories;

    // Check if saved
    const { data: favoriteBooks } = useQuery({
        queryKey: ['favoriteBooks'],
        queryFn: getFavoriteBooks,
        enabled: !!user,
        staleTime: 1000 * 60 * 5 // 5 mins
    });

    const isFavorited = favoriteBooks?.some(b => b.googleBookId === id);

    const toggleFavoriteMutation = useMutation({
        mutationFn: async (e) => {
            if (!user) {
                toast.error('Please login to favorite books');
                throw new Error('Unauthorized');
            }

            if (isFavorited) {
                await unfavoriteBook(id);
                return 'unfavorited';
            } else {
                await favoriteBook({
                    googleBookId: id,
                    title: title || 'Unknown Title',
                    authors: Array.isArray(authors) ? authors : [authors || 'Unknown'],
                    thumbnail: thumbnail,
                    categories: Array.isArray(categories) ? categories : [],
                    rating: avgRating
                });
                return 'favorited';
            }
        },
        onMutate: async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['favoriteBooks'] });

            // Snapshot the previous value
            const previousFavorites = queryClient.getQueryData(['favoriteBooks']);

            // Optimistically update to the new value
            queryClient.setQueryData(['favoriteBooks'], (old) => {
                if (isFavorited) {
                    return old?.filter(b => b.googleBookId !== id);
                } else {
                    return [...(old || []), {
                        googleBookId: id,
                        title,
                        thumbnail,
                        authors: Array.isArray(authors) ? authors : [authors]
                    }];
                }
            });

            return { previousFavorites };
        },
        onSuccess: (action) => {
            toast.success(action === 'favorited' ? 'Added to favorites' : 'Removed from favorites');

            if (action === 'favorited') {
                logActivity({
                    actionType: 'SAVE',
                    googleBookId: id,
                    bookTitle: title,
                    bookAuthor: authorText,
                    bookCover: thumbnail,
                    keyword: title,
                    subjects: Array.isArray(categories) ? categories : [categories].filter(Boolean)
                });
            }
        },
        onError: (err, variables, context) => {
            if (err.message !== 'Unauthorized') {
                toast.error(err.response?.data?.message || 'Failed to update favorites');
                // Rollback
                if (context?.previousFavorites) {
                    queryClient.setQueryData(['favoriteBooks'], context.previousFavorites);
                }
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteBooks'] });
        }
    });

    // Author text
    const authorText = Array.isArray(authors) ? authors[0] : (authors || 'Unknown');

    return (
        <Link to={`/book/${id}`} className={`block group shrink-0 ${className} relative`}>
            <div className="relative aspect-[2/3] rounded overflow-hidden mb-2 shadow-card border border-paper-200 dark:border-stone-800 group-hover:shadow-soft group-hover:-translate-y-1 transition-all duration-300 bg-paper-100 dark:bg-stone-800">
                {/* Image */}
                <img
                    src={thumbnail?.replace('http:', 'https:') || `https://ui-avatars.com/api/?name=${encodeURIComponent(title || 'B')}&background=0D9488&color=fff&size=512&bold=true`}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        const colors = ['0D9488', '0891B2', '4F46E5', '7C3AED', 'DB2777', '2563EB'];
                        const fallbackIdx = Math.abs(id?.charCodeAt(0) || 0) % colors.length;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title || 'B')}&background=${colors[fallbackIdx]}&color=fff&size=512&bold=true`;
                    }}
                />

                {/* Overlays */}
                <div className="absolute inset-x-0 top-0 p-2 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {/* Rating Badge */}
                    {avgRating ? (
                        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                            <Star size={10} className="text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-bold text-ink-900 dark:text-stone-100">{avgRating.toFixed(1)}</span>
                        </div>
                    ) : <div />}

                    {/* Heart Button */}
                    <button
                        onClick={(e) => toggleFavoriteMutation.mutate(e)}
                        className={`p-1.5 rounded-full shadow-sm transition-transform hover:scale-110 ${isFavorited ? 'bg-white dark:bg-stone-800 text-red-500 opacity-100' : 'bg-white/90 dark:bg-stone-900/90 text-slate-400 hover:text-red-500'}`}
                    >
                        <Heart size={14} fill={isFavorited ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Always show heart if saved, even without hover, maybe? 
                    Let's stick to hover for cleanliness, OR if isSaved is true, show it always?
                    Let's make it visible on hover OR if saved.
                */}
                {/* Always show heart if saved, even without hover (but slightly different style) */}
                {isFavorited && (
                    <div className="absolute top-2 right-2 z-10 group-hover:hidden">
                        <div className="p-1.5 bg-white dark:bg-stone-800 rounded-full shadow-sm text-red-500">
                            <Heart size={14} fill="currentColor" />
                        </div>
                    </div>
                )}
            </div>

            {/* Metadata */}
            <div className="pr-1">
                <h3 className="font-bold text-ink-900 dark:text-stone-100 text-sm leading-tight line-clamp-2 mb-0.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors font-serif">
                    {title}
                </h3>
                <p className="text-xs text-ink-500 dark:text-stone-400 line-clamp-1">{authorText}</p>
            </div>
        </Link>
    );
};

export default BookCard;
