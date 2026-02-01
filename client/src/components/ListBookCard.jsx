import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Trash2, Star, Calendar } from 'lucide-react';
import { getBookDetails } from "../services/openLibraryService";
import toast from 'react-hot-toast';

const ListBookCard = ({ item, showRemove = true }) => {
    const queryClient = useQueryClient();

    const { data: bookDetails, isLoading } = useQuery({
        queryKey: ['book', item.googleBookId],
        queryFn: () => getBookDetails(item.googleBookId),
        staleTime: 1000 * 60 * 60,
    });

    const removeMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/lists/remove/${item.googleBookId}`);
        },
        onSuccess: () => {
            toast.success('Removed from shelf');
            queryClient.invalidateQueries(['myLists']);
        },
        onError: () => toast.error('Action failed')
    });

    if (isLoading) return <div className="h-16 bg-paper-100 rounded animate-pulse my-2"></div>;
    if (!bookDetails) return null;

    const { title, authors, imageLinks, averageRating, ratingsCount } = bookDetails.volumeInfo;
    const thumbnail = imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/90x140';

    return (
        <div className="flex items-center gap-4 py-3 border-b border-paper-200 hover:bg-paper-50 transition-colors group">
            {/* 1. Cover */}
            <Link to={`/book/${item.googleBookId}`} className="shrink-0 w-12 h-16 shadow-card border border-paper-200">
                <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            </Link>

            {/* 2. Title & Author (Main Col) */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5">
                    <Link to={`/book/${item.googleBookId}`} className="font-bold text-ink-900 hover:underline leading-tight block">
                        {title}
                    </Link>
                    <p className="text-sm text-ink-600">by {authors?.join(', ')}</p>
                </div>

                {/* 3. Rating */}
                <div className="md:col-span-3 hidden md:flex items-center gap-1">
                    <div className="flex text-amber-500 text-xs">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.round(averageRating || 0) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <span className="text-xs text-ink-400">({ratingsCount || 0})</span>
                </div>

                {/* 4. Date Added / Empty Slot */}
                <div className="md:col-span-3 hidden md:flex items-center gap-2 text-xs text-ink-400">
                    <Calendar size={14} />
                    <span>{new Date(item.updatedAt || Date.now()).toLocaleDateString()}</span>
                </div>

                {/* 5. Actions */}
                <div className="md:col-span-1 flex justify-end">
                    {showRemove && (
                        <button
                            onClick={() => removeMutation.mutate()}
                            className="p-2 text-ink-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove from shelf"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListBookCard;
