import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '../services/statsService';
import toast from 'react-hot-toast';
import {
    User, Settings, BarChart2, Activity, Book, ExternalLink, Loader2, Camera, Shield, Award, Star, CheckCircle, Cpu, Zap, Trophy, Flame
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, PieChart, Pie, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric and underscore only'),
    email: z.string().email('Invalid email address'),
    password: z.string().optional().or(z.literal('')),
    avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const ProfilePage = () => {
    const { user, login } = useAuthStore();
    const [activeTab, setActiveTab] = useState('portfolio');

    const { data: profile, isLoading } = useQuery({
        queryKey: ['myProfile', user?.username],
        queryFn: () => getPublicProfile(user?.username),
        enabled: !!user?.username,
    });

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: user?.name,
            username: user?.username || '',
            email: user?.email,
            avatar: user?.avatar || '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const payload = { ...data };
            if (!payload.password) delete payload.password;

            const response = await api.put('/users/me', payload);
            login(response.data, response.data.token);
            toast.success('Your profile has been updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-teal-600 w-10 h-10" /></div>;

    // Libra Palette for Charts
    const COLORS = ['#0d9488', '#f59e0b', '#57534e', '#a8a29e', '#f5f5f4'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-paper-200 rounded shadow-lg text-xs">
                    <p className="font-bold text-ink-900 mb-1">{label}</p>
                    <p className="text-teal-700 font-bold">{`${payload[0].value} units`}</p>
                </div>
            );
        }
        return null;
    };

    const genreData = profile?.genreDistribution?.length > 0 ? profile.genreDistribution : [
        { name: 'Fiction', value: 40 },
        { name: 'Science', value: 30 },
        { name: 'History', value: 30 },
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
        <div className="min-h-screen bg-paper-50 pb-20 pt-10">
            <div className="max-w-6xl mx-auto px-6 space-y-8">

                {/* Header Section */}
                <div className="card-libra p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group shrink-0">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-white border border-paper-300 shadow-sm">
                            <div className="w-full h-full rounded-full bg-paper-100 flex items-center justify-center overflow-hidden">
                                {user?.avatar ?
                                    <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                    : <span className="text-4xl font-serif font-bold text-ink-400">{user?.name[0]}</span>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink-900 mb-1">{user?.name}</h1>
                            <p className="text-ink-500 font-medium">@{user?.username || 'reader'} · <span className="text-teal-600 font-bold">Level {Math.floor((profile?.totalBooksRead || 0) / 5) + 1} Curator</span></p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 rounded bg-teal-50 border border-teal-100 text-xs font-bold text-teal-700 flex items-center gap-1.5">
                                <Shield size={12} fill="currentColor" /> Verified
                            </span>
                            <Link to={`/users/${user?.username}`} className="px-3 py-1 rounded bg-white border border-paper-200 text-xs font-bold text-ink-600 hover:bg-paper-50 transition-colors flex items-center gap-1.5">
                                <ExternalLink size={12} /> Public Profile
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-8 border-l border-paper-200 pl-8 hidden md:flex">
                        <div className="text-center">
                            <p className="text-3xl font-serif font-bold text-ink-900">{profile?.totalBooksRead || 0}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mt-1">Books Read</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-serif font-bold text-ink-900">{Math.floor((profile?.totalReadingTime || 0) / 60)}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mt-1">Hours</p>
                        </div>
                    </div>
                </div>

                {/* Tabbed Navigation */}
                <div className="flex justify-center md:justify-start border-b border-paper-200">
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'portfolio' ? 'border-teal-600 text-teal-700' : 'border-transparent text-ink-400 hover:text-ink-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <BarChart2 size={16} /> Reading Stats
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'settings' ? 'border-teal-600 text-teal-700' : 'border-transparent text-ink-400 hover:text-ink-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Settings size={16} /> Settings
                        </div>
                    </button>
                </div>

                {/* Content Area */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'portfolio' ? (
                        <div className="grid lg:grid-cols-12 gap-8">
                            {/* Main Stats Column */}
                            <div className="lg:col-span-8 space-y-8">
                                {/* Reading Goal Progress */}
                                <div className="card-libra p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-serif font-bold text-lg text-ink-900 flex items-center gap-2">
                                            <Trophy size={20} className="text-amber-500" /> 2025 Reading Challenge
                                        </h3>
                                        <span className="text-sm font-bold text-ink-500">
                                            {profile?.totalBooksRead || 0} / 50 Books
                                        </span>
                                    </div>
                                    <div className="w-full h-4 bg-paper-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                                            style={{ width: `${Math.min(((profile?.totalBooksRead || 0) / 50) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-ink-400 mt-2 text-right italic">You're on track!</p>
                                </div>

                                {/* Activity Chart */}
                                <div className="card-libra p-8">
                                    <h3 className="font-serif font-bold text-lg text-ink-900 mb-6 flex items-center gap-2">
                                        <Activity size={20} className="text-teal-600" /> Reading Activity
                                    </h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={weeklyActivity}>
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} dy={10} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f4' }} />
                                                <Bar dataKey="minutes" fill="#0d9488" radius={[4, 4, 4, 4]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Stats */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Genre Pie Chart */}
                                <div className="card-libra p-8">
                                    <h3 className="font-serif font-bold text-lg text-ink-900 mb-4 flex items-center gap-2">
                                        <Book size={20} className="text-teal-600" /> Top Genres
                                    </h3>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={genreData}
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {genreData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                                        {genreData.slice(0, 4).map((genre, index) => (
                                            <div key={genre.name} className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-xs font-bold text-ink-600">{genre.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Streak */}
                                <div className="card-libra p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                        <Flame size={24} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-ink-400 tracking-wider">Current Streak</p>
                                        <p className="text-2xl font-serif font-bold text-ink-900">12 Days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto">
                            <div className="card-libra p-8 md:p-10">
                                <div className="mb-8 border-b border-paper-200 pb-4">
                                    <h3 className="text-xl font-bold font-serif text-ink-900">Profile Settings</h3>
                                    <p className="text-ink-500 text-sm">Update your personal information and preferences.</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Display Name</label>
                                        <input
                                            {...register('name')}
                                            type="text"
                                            className="input-libra w-full"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Handle</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-bold">@</span>
                                            <input
                                                {...register('username')}
                                                type="text"
                                                className="input-libra w-full pl-8"
                                            />
                                        </div>
                                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Email Address</label>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            className="input-libra w-full"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Avatar URL</label>
                                        <input
                                            {...register('avatar')}
                                            type="text"
                                            placeholder="https://..."
                                            className="input-libra w-full"
                                        />
                                        {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar.message}</p>}
                                    </div>

                                    <div className="pt-6 border-t border-paper-200">
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Change Password</label>
                                        <input
                                            {...register('password')}
                                            type="password"
                                            placeholder="New password (leave blank to keep current)"
                                            className="input-libra w-full"
                                        />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary py-3 text-sm font-bold"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
