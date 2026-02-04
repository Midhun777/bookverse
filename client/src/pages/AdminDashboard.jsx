import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, Trash2, Ban, CheckCircle, TrendingUp, Star, Heart, MessageSquare, Settings as SettingsIcon, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = React.useState('stats');

    const { data: users, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data;
        }
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await api.get('/admin/stats');
            return res.data;
        }
    });

    const { data: allReviews, isLoading: isLoadingReviews } = useQuery({
        queryKey: ['allReviews'],
        queryFn: async () => {
            const res = await api.get('/admin/reviews');
            return res.data;
        },
        enabled: activeTab === 'reviews'
    });

    const { data: seedBooks, isLoading: isLoadingSeedBooks } = useQuery({
        queryKey: ['seedBooks'],
        queryFn: async () => {
            const res = await api.get('/admin/books');
            return res.data;
        },
        enabled: activeTab === 'books'
    });

    const [settingsData, setSettingsData] = React.useState({
        featuredCategories: '',
        homepageBannerText: ''
    });

    const { data: settings } = useQuery({
        queryKey: ['adminSettings'],
        queryFn: async () => {
            const res = await api.get('/admin/settings');
            setSettingsData({
                featuredCategories: res.data.featuredCategories?.join(', ') || '',
                homepageBannerText: res.data.homepageBannerText || ''
            });
            return res.data;
        }
    });

    const banMutation = useMutation({
        mutationFn: async (userId) => {
            await api.put(`/admin/ban/${userId}`);
        },
        onSuccess: () => {
            toast.success('User status updated');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            await api.delete(`/admin/delete-user/${userId}`);
        },
        onSuccess: () => {
            toast.success('User deleted');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const deleteReviewMutation = useMutation({
        mutationFn: async (reviewId) => {
            await api.delete(`/reviews/delete/${reviewId}`);
        },
        onSuccess: () => {
            toast.success('Review deleted');
            queryClient.invalidateQueries({ queryKey: ['allReviews'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        }
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (newData) => {
            await api.put('/admin/settings', newData);
        },
        onSuccess: () => {
            toast.success('Settings updated');
            queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
        }
    });

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    if (isLoadingUsers || isLoadingStats) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-ink-900 serif">Admin Dashboard</h1>
                <div className="flex bg-paper-100 p-1 rounded-xl overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'stats' ? 'bg-white dark:bg-stone-800 text-teal-600 shadow-sm' : 'text-ink-600 hover:text-ink-900'}`}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'users' ? 'bg-white dark:bg-stone-800 text-teal-600 shadow-sm' : 'text-ink-600 hover:text-ink-900'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'reviews' ? 'bg-white dark:bg-stone-800 text-teal-600 shadow-sm' : 'text-ink-600 hover:text-ink-900'}`}
                    >
                        Moderation
                    </button>
                    <button
                        onClick={() => setActiveTab('books')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'books' ? 'bg-white dark:bg-stone-800 text-teal-600 shadow-sm' : 'text-ink-600 hover:text-ink-900'}`}
                    >
                        Seed Books
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'settings' ? 'bg-white dark:bg-stone-800 text-teal-600 shadow-sm' : 'text-ink-600 hover:text-ink-900'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {activeTab === 'stats' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card-libra p-6 flex items-center space-x-4">
                            <div className="p-4 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-2xl">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-ink-600 font-medium text-sm">Total Users</h3>
                                <p className="text-2xl font-bold text-ink-900">{stats?.summary?.users || 0}</p>
                            </div>
                        </div>
                        <div className="card-libra p-6 flex items-center space-x-4">
                            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-2xl">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3 className="text-ink-600 font-medium text-sm">Favorite Books</h3>
                                <p className="text-2xl font-bold text-ink-900">{stats?.summary?.favoriteBooks || 0}</p>
                            </div>
                        </div>
                        <div className="card-libra p-6 flex items-center space-x-4">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="text-ink-600 font-medium text-sm">Reviews</h3>
                                <p className="text-2xl font-bold text-ink-900">{stats?.summary?.reviews || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 card-libra p-8">
                            <h3 className="text-xl font-bold text-ink-900 mb-6 font-serif">User Registration Growth</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats?.analytics?.growth}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>


                        <div className="card-libra p-8">
                            <h3 className="text-xl font-bold text-ink-900 mb-6 font-serif">Genre Distribution</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.analytics?.categories}
                                            dataKey="count"
                                            nameKey="_id"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                        >
                                            {stats?.analytics?.categories?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card-libra p-8">
                            <h3 className="text-xl font-bold text-ink-900 mb-6 font-serif">Top Search Keywords</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.analytics?.topKeywords.map(k => ({ name: k[0], count: k[1] }))}>
                                        <XAxis dataKey="name" stroke="currentColor" />
                                        <YAxis stroke="currentColor" />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--paper-100)', color: 'var(--ink-900)', border: 'none' }} />
                                        <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="card-libra p-8">
                            <h3 className="text-xl font-bold text-ink-900 mb-6 font-serif">Most Reviewed Books</h3>
                            <div className="space-y-4">
                                {stats?.analytics?.mostReviewed.map((book, i) => (
                                    <div key={book._id} className="flex items-center justify-between p-4 bg-paper-100 rounded-2xl">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-paper-50 rounded-full font-bold text-teal-600 shadow-sm">{i + 1}</span>
                                            <span className="font-medium text-ink-900 truncate max-w-[200px]">{book._id}</span>
                                        </div>
                                        <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold">{book.count} Reviews</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="card-libra overflow-hidden animate-in fade-in duration-500">
                    <div className="px-6 py-4 border-b border-paper-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-ink-900">Manage Users</h2>
                        <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 px-3 py-1 rounded-full text-xs font-bold">{users?.length} Total</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-paper-100 text-ink-600 text-sm">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-paper-100">
                                {users?.map(user => (
                                    <tr key={user._id} className="hover:bg-paper-50 transition">
                                        <td className="px-6 py-4 font-medium text-ink-900 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 overflow-hidden shadow-inner border border-white dark:border-stone-800">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user.name.charAt(0)}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-ink-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-teal-100 text-teal-600'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isBanned ? (
                                                <span className="text-red-500 text-sm font-medium flex items-center gap-1"><Ban size={14} /> Banned</span>
                                            ) : (
                                                <span className="text-teal-500 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {user.role !== 'ADMIN' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => banMutation.mutate(user._id)}
                                                        className={`p-2 rounded-xl transition ${user.isBanned ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-orange-600 bg-orange-50 hover:bg-orange-100'}`}
                                                        title={user.isBanned ? "Unban User" : "Ban User"}
                                                    >
                                                        {user.isBanned ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Permanently delete this user?')) deleteMutation.mutate(user._id)
                                                        }}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="card-libra overflow-hidden animate-in fade-in duration-500">
                    <div className="px-6 py-4 border-b border-paper-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg">
                                <MessageSquare size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-ink-900">Review Moderation</h2>
                        </div>
                        <span className="bg-red-50 dark:bg-red-900/30 text-red-600 px-3 py-1 rounded-full text-xs font-bold">{allReviews?.length || 0} Total</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-paper-100 text-ink-600 text-sm">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Book</th>
                                    <th className="px-6 py-3 text-center">Rating</th>
                                    <th className="px-6 py-3">Comment</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-paper-100">
                                {allReviews?.map(review => (
                                    <tr key={review._id} className="hover:bg-paper-50 transition align-top">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-ink-900">{review.userId?.name || 'Anonymous User'}</div>
                                            <div className="text-[10px] text-ink-400 font-mono select-all">UID: {review.userId?._id || review.userId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">{review.googleBookId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex text-amber-500 gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-ink-700 dark:text-stone-300 leading-relaxed italic line-clamp-2" title={review.reviewText}>
                                                "{review.reviewText}"
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this review permanently?')) deleteReviewMutation.mutate(review._id)
                                                }}
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                                                title="Delete Review"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!allReviews || allReviews.length === 0) && !isLoadingReviews && (
                            <div className="py-20 text-center text-gray-500 italic">No reviews found for moderation.</div>
                        )}
                        {isLoadingReviews && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>}
                    </div>
                </div>
            )}

            {activeTab === 'books' && (
                <div className="card-libra overflow-hidden animate-in fade-in duration-500">
                    <div className="px-6 py-4 border-b border-paper-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-lg">
                                <BookOpen size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-ink-900">Recommendation Dataset</h2>
                        </div>
                        <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 px-3 py-1 rounded-full text-xs font-bold">{seedBooks?.length || 0} Books</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-paper-100 text-ink-600 text-sm">
                                <tr>
                                    <th className="px-6 py-3">Book Details</th>
                                    <th className="px-6 py-3">Categories</th>
                                    <th className="px-6 py-3 text-center">Score</th>
                                    <th className="px-6 py-3">Language</th>
                                    <th className="px-6 py-3 text-right">Added On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-paper-100">
                                {seedBooks?.map(book => (
                                    <tr key={book._id} className="hover:bg-paper-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-16 rounded-lg overflow-hidden bg-paper-100 flex-shrink-0 shadow-sm border border-paper-200">
                                                    {book.coverImage ? (
                                                        <img src={book.coverImage} className="w-full h-full object-cover" alt={book.title} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-ink-300">
                                                            <BookOpen size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-ink-900 truncate max-w-[250px]">{book.title}</p>
                                                    <p className="text-xs text-ink-500 truncate">{book.authors?.join(', ') || 'Unknown Author'}</p>
                                                    <p className="text-[10px] font-mono text-ink-300 mt-1 uppercase select-all">ID: {book.googleBookId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {book.subjects?.slice(0, 3).map((sub, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-paper-200 text-ink-600 rounded text-[10px] uppercase font-bold">
                                                        {sub}
                                                    </span>
                                                ))}
                                                {book.subjects?.length > 3 && (
                                                    <span className="text-[10px] text-ink-400 font-bold">+{book.subjects.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1 font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                                                <TrendingUp size={14} />
                                                {book.popularityScore}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-ink-600 uppercase bg-paper-100 px-2 py-1 rounded">
                                                {book.language || 'eng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-ink-400">
                                            {new Date(book.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!seedBooks || seedBooks.length === 0) && !isLoadingSeedBooks && (
                            <div className="py-20 text-center text-gray-500">No seeded books found in the dataset.</div>
                        )}
                        {isLoadingSeedBooks && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="card-libra p-8 max-w-2xl animate-in fade-in duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl">
                            <SettingsIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-ink-900">Platform Portal Settings</h2>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => {
                        e.preventDefault();
                        updateSettingsMutation.mutate({
                            featuredCategories: settingsData.featuredCategories.split(',').map(c => c.trim()).filter(c => c),
                            homepageBannerText: settingsData.homepageBannerText
                        });
                    }}>
                        <div>
                            <label className="block text-sm font-bold text-ink-600 mb-2 uppercase tracking-wide">Featured Categories</label>
                            <p className="text-xs text-ink-400 mb-2">Separated by commas (e.g., Fiction, Self-Help, Science)</p>
                            <input
                                type="text"
                                className="w-full px-5 py-3 input-libra rounded-2xl outline-none transition"
                                value={settingsData.featuredCategories}
                                onChange={(e) => setSettingsData({ ...settingsData, featuredCategories: e.target.value })}
                                placeholder="Fiction, Self-Help, Science"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-ink-600 mb-2 uppercase tracking-wide">Homepage Banner Text</label>
                            <textarea
                                className="w-full px-5 py-4 input-libra rounded-2xl outline-none transition h-32 resize-none"
                                value={settingsData.homepageBannerText}
                                onChange={(e) => setSettingsData({ ...settingsData, homepageBannerText: e.target.value })}
                                placeholder="Welcome to the ultimate book sanctuary..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={updateSettingsMutation.isPending}
                            className="btn-primary w-full py-4 rounded-2xl font-bold"
                        >
                            {updateSettingsMutation.isPending ? 'Saving Configuration...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
