import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, Trash2, Ban, CheckCircle, TrendingUp, Star, Heart, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
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
            queryClient.invalidateQueries(['users']);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            await api.delete(`/admin/delete-user/${userId}`);
        },
        onSuccess: () => {
            toast.success('User deleted');
            queryClient.invalidateQueries(['users']);
        }
    });

    const deleteReviewMutation = useMutation({
        mutationFn: async (reviewId) => {
            await api.delete(`/reviews/delete/${reviewId}`);
        },
        onSuccess: () => {
            toast.success('Review deleted');
            queryClient.invalidateQueries(['allReviews']);
            queryClient.invalidateQueries(['adminStats']);
        }
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (newData) => {
            await api.put('/admin/settings', newData);
        },
        onSuccess: () => {
            toast.success('Settings updated');
            queryClient.invalidateQueries(['adminSettings']);
        }
    });

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    if (isLoadingUsers || isLoadingStats) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900 serif">Admin Dashboard</h1>
                <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'reviews' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Moderation
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {activeTab === 'stats' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-gray-500 font-medium text-sm">Total Users</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats?.summary?.users || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3 className="text-gray-500 font-medium text-sm">Favorite Books</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats?.summary?.favoriteBooks || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="text-gray-500 font-medium text-sm">Reviews</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats?.summary?.reviews || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">User Registration Growth</h3>
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

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Genre Distribution</h3>
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
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Search Keywords</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.analytics?.topKeywords.map(k => ({ name: k[0], count: k[1] }))}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Most Reviewed Books</h3>
                            <div className="space-y-4">
                                {stats?.analytics?.mostReviewed.map((book, i) => (
                                    <div key={book._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full font-bold text-blue-600 shadow-sm">{i + 1}</span>
                                            <span className="font-medium text-gray-900 truncate max-w-[200px]">{book._id}</span>
                                        </div>
                                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{book.count} Reviews</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Manage Users</h2>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{users?.length} Total</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users?.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden shadow-inner border border-white">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user.name.charAt(0)}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isBanned ? (
                                                <span className="text-red-500 text-sm font-medium flex items-center gap-1"><Ban size={14} /> Banned</span>
                                            ) : (
                                                <span className="text-green-500 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> Active</span>
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Review Moderation</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th className="px-6 py-3">Book</th>
                                    <th className="px-6 py-3">Author</th>
                                    <th className="px-6 py-3">Rating</th>
                                    <th className="px-6 py-3">Review</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allReviews?.map(review => (
                                    <tr key={review._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500 truncate max-w-[100px]">{review.googleBookId}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{review.userId?.name || 'Deleted User'}</p>
                                            <p className="text-xs text-gray-500">{review.userId?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-yellow-500">
                                            <div className="flex">
                                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{review.reviewText}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this review?')) deleteReviewMutation.mutate(review._id)
                                                }}
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!allReviews || allReviews.length === 0) && !isLoadingReviews && (
                            <div className="py-20 text-center text-gray-500">No community reviews found to moderate.</div>
                        )}
                        {isLoadingReviews && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl animate-in fade-in duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <SettingsIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Platform Portal Settings</h2>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => {
                        e.preventDefault();
                        updateSettingsMutation.mutate({
                            featuredCategories: settingsData.featuredCategories.split(',').map(c => c.trim()).filter(c => c),
                            homepageBannerText: settingsData.homepageBannerText
                        });
                    }}>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Featured Categories</label>
                            <p className="text-xs text-gray-400 mb-2">Separated by commas (e.g., Fiction, Self-Help, Science)</p>
                            <input
                                type="text"
                                className="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
                                value={settingsData.featuredCategories}
                                onChange={(e) => setSettingsData({ ...settingsData, featuredCategories: e.target.value })}
                                placeholder="Fiction, Self-Help, Science"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Homepage Banner Text</label>
                            <textarea
                                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition h-32 resize-none"
                                value={settingsData.homepageBannerText}
                                onChange={(e) => setSettingsData({ ...settingsData, homepageBannerText: e.target.value })}
                                placeholder="Welcome to the ultimate book sanctuary..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={updateSettingsMutation.isPending}
                            className="w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition active:translate-y-0 disabled:opacity-50"
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
