import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, BookOpen, Search, Filter } from 'lucide-react';
import ListBookCard from '../components/ListBookCard';

const MyListsPage = () => {
    const [activeTab, setActiveTab] = useState('TO_READ');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: listItems, isLoading } = useQuery({
        queryKey: ['myLists'],
        queryFn: async () => {
            const res = await api.get('/lists/my');
            return res.data;
        }
    });

    const filteredItems = listItems?.filter(item => {
        const matchesTab = item.status === activeTab;
        // Basic search filtering would require book details which are fetched in child.
        // For now, we filter by simple properties if available or relying on client-side fetch in v2.
        // Assuming we rely on the List items for now. Since `ListBookCard` fetches details, 
        // true search filtering is hard here without specific backend support or prop drilling.
        // We act as if we show all for the tab.
        return matchesTab;
    }) || [];

    const tabs = [
        { id: 'READING', label: 'Currently Reading', count: listItems?.filter(i => i.status === 'READING').length },
        { id: 'TO_READ', label: 'Want to Read', count: listItems?.filter(i => i.status === 'TO_READ').length },
        { id: 'COMPLETED', label: 'Read', count: listItems?.filter(i => i.status === 'COMPLETED').length },
    ];

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600 w-10 h-10" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">

            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 space-y-6">
                <div className="card-libra p-0 overflow-hidden">
                    <div className="p-4 border-b border-paper-200 bg-paper-50">
                        <h2 className="font-bold text-ink-900 font-serif">Bookshelves</h2>
                    </div>
                    <div className="flex flex-col">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-between px-4 py-3 text-sm font-medium border-l-4 transition-colors ${activeTab === tab.id
                                    ? 'border-teal-600 bg-white text-teal-700'
                                    : 'border-transparent text-ink-600 hover:bg-paper-50 hover:text-ink-900'
                                    }`}
                            >
                                <span>{tab.label}</span>
                                <span className="text-xs bg-paper-200 px-2 py-0.5 rounded-full text-ink-600">{tab.count || 0}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card-libra p-4">
                    <h3 className="font-bold text-ink-900 text-sm mb-2">Reading Stats</h3>
                    {(() => {
                        const currentYear = new Date().getFullYear();
                        const completedThisYear = listItems?.filter(i =>
                            i.status === 'COMPLETED' &&
                            // Check updated date or created date? Ideally completed date. 
                            // Assuming `updatedAt` is close enough to completion time for now.
                            new Date(i.updatedAt || Date.now()).getFullYear() === currentYear
                        ).length || 0;
                        const goal = 30; // Hardcoded goal for now, or fetch from user settings later
                        const percentage = Math.min((completedThisYear / goal) * 100, 100);

                        return (
                            <>
                                <div className="h-2 bg-paper-200 rounded-full overflow-hidden mb-1">
                                    <div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <p className="text-xs text-ink-500">{completedThisYear} of {goal} books read ({currentYear} Challenge)</p>
                            </>
                        );
                    })()}
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold font-serif text-ink-900">My Books</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search within shelf..."
                            className="input-libra py-1.5 px-3 pl-9 text-sm w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    </div>
                </div>

                {/* Table Header */}
                <div className="bg-paper-100 border border-paper-200 rounded-t-lg px-4 py-2 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-bold text-ink-500 uppercase tracking-wider">
                    <div className="md:col-span-6">Cover / Title</div>
                    <div className="md:col-span-3 hidden md:block">Avg Rating</div>
                    <div className="md:col-span-3 hidden md:block">Date Added</div>
                </div>

                <div className="bg-white border-x border-b border-paper-200 rounded-b-lg divide-y divide-paper-100 min-h-[400px]">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div key={item._id} className="px-4">
                                <ListBookCard item={item} />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-ink-400">
                            <BookOpen size={48} className="mb-4 opacity-50" />
                            <p className="mb-4">No books on this shelf yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyListsPage;
