import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Menu, X, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/login');
    };
    const navLinks = [
        { path: '/', label: 'Home', auth: true },
        { path: '/discover', label: 'Discover', auth: false },
        { path: '/recommendations', label: 'Recommendations', auth: true },
        { path: '/favorites', label: 'Favorites', auth: true },
        { path: '/my-books', label: 'My Books', auth: true },
        { path: '/explore', label: 'Browse', auth: false },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-paper-200 transition-colors duration-300 dark:bg-stone-900 dark:border-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12">
                <div className="flex items-center justify-between h-full">

                    {/* Left: Logo & Nav */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-1 bg-teal-600 rounded text-white">
                                <BookOpen size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold font-serif text-ink-900 dark:text-stone-100 tracking-tight">Bookverse</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center space-x-6">
                            {navLinks.map(link => (!link.auth || user) && (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) => `text-sm font-medium transition-colors border-b-2 py-5 ${isActive ? 'text-ink-900 border-teal-600 dark:text-stone-100' : 'text-ink-600 border-transparent hover:text-teal-600 dark:text-stone-400 dark:hover:text-teal-500'}`}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Right: User Menu & Theme Toggle */}
                    <div className="hidden lg:flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-paper-100 transition-colors text-ink-600 dark:text-stone-400 dark:hover:bg-stone-800"
                            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`flex items-center gap-3 rounded-full p-1.5 pr-4 transition-all border ${user.role === 'ADMIN' ? 'bg-teal-50/80 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800' : 'hover:bg-paper-100 dark:hover:bg-stone-800 border-transparent'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full bg-paper-200 dark:bg-stone-800 overflow-hidden border transition-all ${user.role === 'ADMIN' ? 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'border-paper-300 dark:border-stone-700'}`}>
                                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <User size={20} strokeWidth={2.5} className="text-ink-400 dark:text-stone-500" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-ink-900 dark:text-stone-100">{user.name.split(' ')[0]}</span>
                                        {user.role === 'ADMIN' && (
                                            <span className="px-1.5 py-0.5 bg-teal-600 text-white text-[9px] font-black rounded uppercase tracking-widest shadow-sm">Admin</span>
                                        )}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full right-0 mt-2 w-56 bg-white border border-paper-200 rounded shadow-card z-20 py-2 dark:bg-stone-900 dark:border-stone-800"
                                            >
                                                <div className="px-4 py-2 border-b border-paper-100 mb-2 dark:border-stone-800 flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-ink-900 text-sm dark:text-stone-100">{user.name}</p>
                                                        <p className="text-xs text-ink-400 dark:text-stone-500">@{user.username}</p>
                                                    </div>
                                                    {user.role === 'ADMIN' && (
                                                        <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-400 text-[8px] font-black rounded uppercase tracking-wider border border-teal-200 dark:border-teal-800">Admin</span>
                                                    )}
                                                </div>

                                                <Link to="/profile" className="block px-4 py-2 text-sm text-ink-600 hover:bg-paper-50 hover:text-teal-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-teal-500">Profile</Link>
                                                {user.role === 'ADMIN' && (
                                                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-ink-600 hover:bg-paper-50 hover:text-teal-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-teal-500">Admin Dashboard</Link>
                                                )}
                                                <div className="border-t border-paper-100 my-2 dark:border-stone-800" />
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-ink-600 hover:bg-paper-50 hover:text-teal-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-teal-500">Sign Out</button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-bold text-ink-600 hover:text-teal-600 dark:text-stone-400 dark:hover:text-teal-500">Log In</Link>
                                <Link to="/register" className="btn-primary text-sm py-1.5 px-4 rounded-full">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-ink-600 dark:text-stone-400">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white dark:bg-stone-900 border-b border-paper-200 dark:border-stone-800 px-4 py-4 space-y-4">
                    {navLinks.map(link => (!link.auth || user) && (
                        <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="block py-2 text-ink-600 font-medium border-b border-paper-100 dark:text-stone-400 dark:border-stone-800">
                            {link.label}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <Link to="/profile" onClick={() => setIsOpen(false)} className="block py-2 text-ink-600 font-medium">Profile</Link>
                            <button onClick={handleLogout} className="block w-full text-left py-2 text-ink-600 font-medium">Sign Out</button>
                        </>
                    ) : (
                        <div className="flex gap-4 pt-2">
                            <Link to="/login" className="flex-1 btn-ghost text-center text-sm border border-paper-200">Log In</Link>
                            <Link to="/register" className="flex-1 btn-primary text-center text-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
