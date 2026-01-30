import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Users, UserMinus, UserCheck, Loader2 } from 'lucide-react';
import api from '../services/api'; // Direct API call for now to save time, or create friendService

// Placeholder service functions (move to friendService.js later)
const getFriends = async () => {
    // const res = await api.get('/friends');
    // return res.data;
    // Mocking for UI dev if backend doesn't exist yet
    return [
        { _id: '1', name: 'Sarah J.', username: 'sarahj', avatar: null, mutuals: 3 },
        { _id: '2', name: 'Mike Ross', username: 'miker', avatar: null, mutuals: 1 },
    ];
};

const searchUsers = async (query) => {
    // const res = await api.get(`/users/search?q=${query}`);
    // return res.data;
    return [];
};

const FriendsPage = () => {
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search'

    const { data: friends, isLoading } = useQuery({
        queryKey: ['friends'],
        queryFn: getFriends,
        enabled: !!user
    });

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-ink-900 mb-4">Community</h1>

                {/* Tabs */}
                <div className="flex border-b border-paper-200">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'friends' ? 'border-teal-600 text-teal-700' : 'border-transparent text-ink-400 hover:text-ink-600'}`}
                    >
                        Your Friends
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'search' ? 'border-teal-600 text-teal-700' : 'border-transparent text-ink-400 hover:text-ink-600'}`}
                    >
                        Find People
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'requests' ? 'border-teal-600 text-teal-700' : 'border-transparent text-ink-400 hover:text-ink-600'}`}
                    >
                        Requests
                    </button>
                </div>
            </header>

            {activeTab === 'search' && (
                <div className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 input-libra text-lg"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={20} />
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-teal-600" /></div>
                ) : activeTab === 'friends' ? (
                    friends?.length > 0 ? (
                        friends.map(friend => (
                            <div key={friend._id} className="card-libra p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-paper-200 flex items-center justify-center text-ink-500 font-bold text-lg">
                                        {friend.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-ink-900">{friend.name}</h3>
                                        <p className="text-sm text-ink-500">@{friend.username}</p>
                                    </div>
                                </div>
                                <button className="btn-outline text-xs px-4 py-2">View Profile</button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-ink-400 bg-paper-50 rounded-lg border border-dashed border-paper-200">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>You haven't added any friends yet.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-20 text-ink-400">
                        <p>Feature coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsPage;
