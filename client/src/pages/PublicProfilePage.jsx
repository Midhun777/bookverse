import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '../services/statsService';
import { Loader2, Book, Clock, Star, Award, Calendar, CheckCircle, Activity, Bookmark, User } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

const PublicProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['publicProfile', username],
        queryFn: () => getPublicProfile(username),
        enabled: !!username,
    });

    if (isLoading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-gray-300 w-10 h-10" /></div>;
    if (isError) return <div className="text-center py-40 text-red-500 font-bold serif">Archive entry not found.</div>;

    const COLORS = [
        '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'
    ];

    const genreData = profile.genreDistribution || [];

    const weeklyActivity = profile.weeklyActivity || [];

    return (
        <div className="max-w-4xl mx-auto space-y-24 pb-32 animate-page">
            {/* Simple Profile Header */}
            <div className="text-center space-y-8 py-12 border-b border-paper-200 dark:border-stone-800">
                <div className="w-40 h-40 rounded-full bg-paper-50 dark:bg-stone-900 flex items-center justify-center border border-paper-200 dark:border-stone-800 shadow-sm mx-auto overflow-hidden">
                    {profile.user.avatar ? <img src={profile.user.avatar} className="w-full h-full object-cover" alt="" /> : <User size={80} strokeWidth={1.5} className="text-ink-400 dark:text-stone-500" />}
                </div>
                <div className="space-y-3">
                    <h1 className="text-5xl font-bold text-ink-900 dark:text-stone-100 serif">{profile.user.name}</h1>
                    <p className="text-xl text-ink-400 dark:text-stone-500 font-medium italic serif">Member of Bookverse</p>
                    <div className="flex justify-center gap-3 pt-4">
                        {profile.user.role === 'ADMIN' && <span className="px-5 py-1.5 bg-ink-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-[10px] font-bold uppercase tracking-widest">Admin</span>}
                        <span className="px-5 py-1.5 bg-white dark:bg-stone-900 text-ink-500 dark:text-stone-400 border border-paper-200 dark:border-stone-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Member since {new Date(profile.user.createdAt).getFullYear()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto pt-8">
                    <div className="space-y-1">
                        <p className="text-4xl font-bold text-ink-900 dark:text-stone-100 serif">{profile.totalBooksRead}</p>
                        <p className="text-[10px] text-ink-400 dark:text-stone-500 font-black uppercase tracking-widest">Books Read</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold text-ink-900 dark:text-stone-100 serif">{Math.floor(profile.totalReadingTime / 60)}</p>
                        <p className="text-[10px] text-ink-400 dark:text-stone-500 font-black uppercase tracking-widest">Hours Logged</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-20">
                    {/* Insights Grid */}
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Weekly Activity */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-ink-900 dark:text-stone-100 serif flex items-center gap-3 border-b border-paper-50 dark:border-stone-800 pb-4">
                                <Activity size={20} className="text-ink-400 dark:text-stone-500" /> Activity
                            </h3>
                            {weeklyActivity.length > 0 && weeklyActivity.some(d => d.minutes > 0) ? (
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyActivity}>
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a8a29e' }} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', backgroundColor: '#fafaf9', color: '#1c1917' }}
                                                itemStyle={{ color: '#0d9488' }}
                                            />
                                            <Bar dataKey="minutes" fill="#1c1917" radius={[4, 4, 4, 4]} className="fill-ink-900 dark:fill-stone-200" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 opacity-30">
                                    <Activity size={32} strokeWidth={1} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No recent activity</p>
                                </div>
                            )}
                        </div>

                        {/* Interests */}
                        <div className="space-y-8 bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-paper-100 dark:border-stone-800 shadow-sm min-h-[400px] flex flex-col">
                            <h3 className="text-xl font-bold text-ink-900 dark:text-stone-100 serif">
                                Genre Distribution
                            </h3>
                            {genreData.length > 0 ? (
                                <div className="flex flex-col items-center gap-8 flex-1 justify-center">
                                    <div className="h-48 w-48 shrink-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={genreData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {genreData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#ffffff' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 w-full">
                                        {genreData.map((genre, index) => (
                                            <div key={genre.name} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-[10px] font-black text-ink-600 dark:text-stone-400 uppercase tracking-widest truncate" style={{ color: COLORS[index % COLORS.length] }}>
                                                    {genre.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 opacity-30">
                                    <Book size={48} strokeWidth={1} />
                                    <p className="text-xs font-bold uppercase tracking-widest">No genres found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Personal Collection */}
                    <section className="space-y-12">
                        <h2 className="text-2xl font-bold text-ink-900 dark:text-stone-100 serif uppercase tracking-tight">Completed Collection</h2>

                        {profile.completedBooks.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-12 px-2">
                                {profile.completedBooks.map((item) => (
                                    <div key={item._id} className="group cursor-pointer space-y-4" onClick={() => navigate(`/book/${item.googleBookId}`)}>
                                        <div className="aspect-[2/3] rounded-lg overflow-hidden border border-paper-100 dark:border-stone-800 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md h-full">
                                            <PublicShelfItem googleBookId={item.googleBookId} showTitle />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-paper-100 dark:border-stone-800 rounded-3xl">
                                <p className="text-lg text-ink-300 dark:text-stone-600 font-medium italic serif">The collection remains unpopulated.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar: Philosophical Stats */}
                <div className="lg:col-span-4 space-y-16">
                    <div className="bg-paper-50 dark:bg-stone-900 rounded-3xl p-10 space-y-8 border border-paper-100 dark:border-stone-800">
                        <Award size={40} className="text-ink-900 dark:text-stone-100" />
                        <div className="space-y-4">
                            <h4 className="text-2xl font-bold serif tracking-tight text-ink-900 dark:text-stone-100">Reading Legacy</h4>
                            <p className="text-ink-500 dark:text-stone-400 font-medium italic text-base leading-relaxed">Total existence dedicated to the exploration of literary landscapes.</p>
                        </div>
                        <div className="pt-6 border-t border-paper-200 dark:border-stone-800">
                            <p className="text-5xl font-bold text-ink-900 dark:text-stone-100 serif tracking-tighter">{profile.totalReadingTime}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-ink-400 dark:text-stone-500 mt-2">Cumulative Minutes Spent</p>
                        </div>
                    </div>

                    <div className="space-y-10 px-4">
                        <h3 className="text-lg font-bold text-ink-900 dark:text-stone-100 serif uppercase tracking-tight border-b border-paper-50 dark:border-stone-800 pb-4">Personal Awards</h3>
                        <div className="space-y-8">
                            {[
                                {
                                    icon: <Star size={20} fill={profile.reviewCount >= 10 ? "currentColor" : "none"} />,
                                    label: 'Nexus Critic',
                                    sub: `${profile.reviewCount || 0}/10 Shared Reflections`,
                                    active: profile.reviewCount >= 10
                                },
                                {
                                    icon: <Activity size={20} />,
                                    label: 'Deep Sync',
                                    sub: `${Math.floor(profile.totalReadingTime / 60)}/500 Hours in Flow`,
                                    active: (profile.totalReadingTime / 60) >= 500
                                },
                                {
                                    icon: <Bookmark size={20} />,
                                    label: 'Collector',
                                    sub: `${(profile.notesCount || 0) + (profile.savedCount || 0)}/50 Saved Fragments`,
                                    active: (profile.notesCount + profile.savedCount) >= 50
                                }
                            ].map((medal, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm ${medal.active
                                        ? "bg-ink-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-md"
                                        : "bg-white dark:bg-stone-800 border-paper-100 dark:border-stone-700 text-ink-300 dark:text-stone-600 grayscale"
                                        }`}>
                                        {medal.icon}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-base ${medal.active ? "text-ink-900 dark:text-stone-100" : "text-ink-400 dark:text-stone-500"}`}>{medal.label}</p>
                                        <p className="text-[10px] font-bold text-ink-300 dark:text-stone-500 uppercase tracking-widest mt-1 italic">{medal.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PublicShelfItem = ({ googleBookId, showTitle }) => {
    const { data: bookDetails } = useQuery({
        queryKey: ['book', googleBookId],
        queryFn: () => import('../services/googleBooksService').then(m => m.getBookDetails(googleBookId)),
        staleTime: 1000 * 60 * 60,
    });

    if (!bookDetails) return <div className="w-full h-full bg-paper-50 dark:bg-stone-900 animate-pulse" />;

    const thumbnail = bookDetails.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:');
    const title = bookDetails.volumeInfo.title;

    return (
        <div className="relative w-full h-full flex flex-col">
            <img src={thumbnail} alt={title} className="w-full h-64 object-cover" />
            {showTitle && (
                <div className="p-2 flex-1 flex flex-col justify-center bg-white dark:bg-stone-900">
                    <p className="text-[10px] font-bold text-ink-900 dark:text-stone-100 line-clamp-2 leading-tight uppercase tracking-wider">{title}</p>
                </div>
            )}
        </div>
    );
};

export default PublicProfilePage;
