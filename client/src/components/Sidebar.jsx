import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    BookOpen,
    Compass,
    LayoutDashboard,
    Heart,
    List,
    Settings,
    LogOut,
    User as UserIcon,
    ShieldCheck,
    StickyNote
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard', auth: true },
        { icon: <Compass size={20} />, label: 'Explore', path: '/explore' },
        { icon: <Heart size={20} />, label: 'Favorites', path: '/favorites', auth: true },
        { icon: <List size={20} />, label: 'My Lists', path: '/lists', auth: true },
        { icon: <StickyNote size={20} />, label: 'Notes', path: '/notes', auth: true },
    ];

    const adminItems = [
        { icon: <ShieldCheck size={20} />, label: 'Admin Hub', path: '/admin/dashboard' },
    ];

    return (
        <aside className="w-72 bg-[#0A0A0B]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col sticky top-0 h-screen z-50">
            {/* Logo */}
            <div className="p-8">
                <Link to="/" className="flex items-center space-x-3 text-teal-500 font-bold text-2xl group">
                    <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/20 group-hover:rotate-6 transition-transform">
                        <BookOpen size={24} />
                    </div>
                    <span className="font-display tracking-tight text-white">BOOKVERSE</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Navigation</p>
                {navItems.map((item) => (
                    (!item.auth || user) && (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    )
                ))}

                {user?.role === 'ADMIN' && (
                    <>
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-10 mb-4">Management</p>
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-6 border-t border-white/5 space-y-4">
                {user ? (
                    <>
                        <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-white/5 transition group">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-500 border border-teal-500/20">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-xl" alt="" /> : <UserIcon size={20} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-white/40 font-medium truncate uppercase tracking-widest">{user.role}</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 p-3 rounded-2xl text-red-400 hover:bg-red-400/10 transition font-bold text-sm"
                        >
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </>
                ) : (
                    <div className="space-y-3">
                        <Link to="/login" className="flex items-center justify-center w-full py-3 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition">
                            Log In
                        </Link>
                        <Link to="/register" className="flex items-center justify-center w-full py-3 rounded-2xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-500 transition shadow-lg shadow-teal-600/20">
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
