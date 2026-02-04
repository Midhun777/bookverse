import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, BookOpen, Search, Filter } from 'lucide-react';
import ListBookCard from '../components/ListBookCard';

const MyListsPage = () => {
    const [activeTab, setActiveTab] = useState('TO_READ');


    const { data: listItems, isLoading: listLoading } = useQuery({
        queryKey: ['myLists'],
        queryFn: async () => {
            const res = await api.get('/lists/my');
            return res.data;
        }
    });

    const isLoading = listLoading;

    const filteredItems = listItems?.filter(item => item.status === activeTab) || [];

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
                <div className="card-libra p-0 overflow-hidden dark:bg-stone-900 dark:border-stone-800">
                    <div className="p-4 border-b border-paper-200 dark:border-stone-800 bg-paper-50 dark:bg-stone-900">
                        <h2 className="font-bold text-ink-900 dark:text-stone-100 font-serif">Bookshelves</h2>
                    </div>
                    <div className="flex flex-col">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-between px-4 py-3 text-sm font-medium border-l-4 transition-colors ${activeTab === tab.id
                                    ? 'border-teal-600 bg-paper-100 text-teal-700 dark:bg-stone-800 dark:text-teal-500'
                                    : 'border-transparent text-ink-600 hover:bg-paper-50 hover:text-ink-900'
                                    }`}
                            >
                                <span>{tab.label}</span>
                                <span className="text-xs bg-paper-200 dark:bg-stone-800 px-2 py-0.5 rounded-full text-ink-600 dark:text-stone-400">{tab.count || 0}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card-libra p-4 dark:bg-stone-900 dark:border-stone-800">
                    <h3 className="font-bold text-ink-900 dark:text-stone-100 text-sm mb-2">Reading Stats</h3>
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
                                <div className="h-2 bg-paper-200 dark:bg-stone-800 rounded-full overflow-hidden mb-1">
                                    <div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <p className="text-xs text-ink-500 dark:text-stone-500">{completedThisYear} of {goal} books read ({currentYear} Challenge)</p>
                            </>
                        );
                    })()}
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold font-serif text-ink-900 dark:text-stone-100">My Books</h1>


                </div>

                {/* Table Header */}
                <div className="bg-paper-100 dark:bg-stone-900 border border-paper-200 dark:border-stone-800 rounded-t-lg px-4 py-2 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-bold text-ink-500 dark:text-stone-500 uppercase tracking-wider">
                    <div className="md:col-span-6">Cover / Title</div>
                    <div className="md:col-span-3 hidden md:block">Avg Rating</div>
                    <div className="md:col-span-3 hidden md:block">Date Added</div>
                </div>

                <div className="bg-paper-50 dark:bg-stone-950 border-x border-b border-paper-200 dark:border-stone-800 rounded-b-lg divide-y divide-paper-100 dark:divide-stone-800 min-h-[400px]">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div key={item._id} className="px-4">
                                <ListBookCard item={item} showRemove={true} />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-ink-400 dark:text-stone-600">
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
