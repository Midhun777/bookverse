import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '../services/statsService';
import { Loader2, Book, Clock, Star, Award, Calendar, CheckCircle, Activity, Bookmark } from 'lucide-react';
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

    const COLORS = ['#111827', '#4B5563', '#9CA3AF', '#D1D5DB', '#E5E7EB'];

    const genreData = profile.genreDistribution?.length > 0 ? profile.genreDistribution : [
        { name: 'Literature', value: 45 },
        { name: 'Science', value: 25 },
        { name: 'Arts', value: 15 },
        { name: 'History', value: 15 },
    ];

    const weeklyActivity = [
        { day: 'Mon', minutes: 45 },
        { day: 'Tue', minutes: 30 },
        { day: 'Wed', minutes: 60 },
        { day: 'Thu', minutes: 20 },
        { day: 'Fri', minutes: 50 },
        { day: 'Sat', minutes: 90 },
        { day: 'Sun', minutes: 30 },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-24 pb-32 animate-page">
            {/* Simple Profile Header */}
            <div className="text-center space-y-8 py-12 border-b border-gray-100">
                <div className="w-40 h-40 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 text-6xl font-bold border border-gray-100 shadow-sm mx-auto overflow-hidden">
                    {profile.user.avatar ? <img src={profile.user.avatar} className="w-full h-full object-cover" alt="" /> : profile.user.name[0]}
                </div>
                <div className="space-y-3">
                    <h1 className="text-5xl font-bold text-gray-900 serif">{profile.user.name}</h1>
                    <p className="text-xl text-gray-400 font-medium italic serif">Dedicated Reader</p>
                    <div className="flex justify-center gap-3 pt-4">
                        {profile.user.role === 'ADMIN' && <span className="px-5 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">Admin</span>}
                        <span className="px-5 py-1.5 bg-white text-gray-500 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-widest">Member since {new Date(profile.user.createdAt).getFullYear()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto pt-8">
                    <div className="space-y-1">
                        <p className="text-4xl font-bold text-gray-900 serif">{profile.totalBooksRead}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Books Read</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold text-gray-900 serif">{Math.floor(profile.totalReadingTime / 60)}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Hours Logged</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-20">
                    {/* Insights Grid */}
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Weekly Activity */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-gray-900 serif flex items-center gap-3 border-b border-gray-50 pb-4">
                                <Activity size={20} className="text-gray-400" /> Activity
                            </h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyActivity}>
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                        <Tooltip
                                            cursor={{ fill: '#F9FAFB' }}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                                        />
                                        <Bar dataKey="minutes" fill="#111827" radius={[4, 4, 4, 4]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Interests */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-gray-900 serif flex items-center gap-3 border-b border-gray-50 pb-4">
                                <Book size={20} className="text-gray-400" /> Interests
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="h-32 w-32 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={genreData}
                                                innerRadius={40}
                                                outerRadius={55}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {genreData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    {genreData.slice(0, 4).map((genre, index) => (
                                        <div key={genre.name} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{genre.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Collection */}
                    <section className="space-y-12">
                        <div className="flex items-end justify-between border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900 serif uppercase tracking-tight">Archived Works</h2>
                            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest italic">Completed collection</p>
                        </div>

                        {profile.completedBooks.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-12 px-2">
                                {profile.completedBooks.map((item) => (
                                    <div key={item._id} className="group cursor-pointer space-y-4" onClick={() => navigate(`/book/${item.googleBookId}`)}>
                                        <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-50 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md h-full">
                                            <PublicShelfItem googleBookId={item.googleBookId} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-gray-900 transition-colors">Fragment Index</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-gray-50 rounded-3xl">
                                <p className="text-lg text-gray-300 font-medium italic serif">The collection remains unpopulated.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar: Philosophical Stats */}
                <div className="lg:col-span-4 space-y-16">
                    <div className="bg-gray-50 rounded-3xl p-10 space-y-8 border border-gray-100">
                        <Award size={40} className="text-gray-900" />
                        <div className="space-y-4">
                            <h4 className="text-2xl font-bold serif tracking-tight">Reading Legacy</h4>
                            <p className="text-gray-500 font-medium italic text-base leading-relaxed">Total existence dedicated to the exploration of literary landscapes.</p>
                        </div>
                        <div className="pt-6 border-t border-gray-200">
                            <p className="text-5xl font-bold text-gray-900 serif tracking-tighter">{profile.totalReadingTime}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2">Cumulative Minutes Spent</p>
                        </div>
                    </div>

                    <div className="space-y-10 px-4">
                        <h3 className="text-lg font-bold text-gray-900 serif uppercase tracking-tight border-b border-gray-50 pb-4">Personal Awards</h3>
                        <div className="space-y-8">
                            {[
                                { icon: <Star size={20} fill="currentColor" />, label: 'Nexus Critic', sub: '10+ Shared Reflections' },
                                { icon: <Activity size={20} />, label: 'Deep Sync', sub: '500+ Hours in Flow' },
                                { icon: <Bookmark size={20} />, label: 'Collector', sub: '50+ Saved Fragments' }
                            ].map((medal, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 shadow-sm">
                                        {medal.icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-base">{medal.label}</p>
                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1 italic">{medal.sub}</p>
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

const PublicShelfItem = ({ googleBookId }) => {
    const { data: bookDetails } = useQuery({
        queryKey: ['book', googleBookId],
        queryFn: () => import('../services/openLibraryService').then(m => m.getBookDetails(googleBookId)),
        staleTime: 1000 * 60 * 60,
    });

    if (!bookDetails) return <div className="w-full h-full bg-gray-50 animate-pulse" />;

    const thumbnail = bookDetails.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:');
    return <img src={thumbnail} alt={bookDetails.volumeInfo.title} className="w-full h-full object-cover" />;
};

export default PublicProfilePage;
