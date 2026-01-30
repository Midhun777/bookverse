import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Trash2, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
    const queryClient = useQueryClient();

    const { data: books, isLoading, isError } = useQuery({
        queryKey: ['savedBooks'],
        queryFn: async () => {
            const res = await api.get('/books/saved');
            return res.data;
        }
    });

    const unsaveMutation = useMutation({
        mutationFn: async (googleBookId) => {
            await api.delete(`/books/unsave/${googleBookId}`);
        },
        onSuccess: () => {
            toast.success('Removed from favorites');
            queryClient.invalidateQueries(['savedBooks']);
        },
        onError: (err) => {
            toast.error('Failed to remove book');
        }
    });

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>

            {books?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {books.map(book => (
                        <div key={book._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                            <Link to={`/book/${book.googleBookId}`} className="block relative aspect-[2/3] bg-gray-100 overflow-hidden">
                                <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover transition transform group-hover:scale-105" />
                                {book.rating && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-md">
                                        <Star size={12} className="fill-current mr-1" />
                                        {book.rating}
                                    </div>
                                )}
                            </Link>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 truncate mb-1">
                                    <Link to={`/book/${book.googleBookId}`} className="hover:text-blue-600 transition">{book.title}</Link>
                                </h3>
                                <p className="text-sm text-gray-500 truncate mb-3">{book.authors?.join(', ')}</p>
                                <button
                                    onClick={() => unsaveMutation.mutate(book.googleBookId)}
                                    className="w-full flex items-center justify-center space-x-2 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition"
                                >
                                    <Trash2 size={16} /> <span>Remove</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl mb-4">No favorite books yet.</p>
                    <Link to="/explore" className="text-blue-600 hover:underline">Find books to save</Link>
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
