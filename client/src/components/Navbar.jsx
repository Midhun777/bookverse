import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Search, Menu, X, User, LogOut, List, LayoutDashboard, ExternalLink, Compass, Loader2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { searchBooks } from '../services/openLibraryService';
import { useDebounce } from '../hooks/useDebounce';
import { useThemeStore } from '../store/themeStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchFocused(false);
        }
    };

    // Instant Search Query
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ['instantSearch', debouncedSearchQuery],
        queryFn: () => searchBooks(debouncedSearchQuery),
        enabled: debouncedSearchQuery.length > 2,
        staleTime: 1000 * 60,
    });

    // Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { path: '/', label: 'Home', auth: true },
        { path: '/discover', label: 'Discover', auth: false },
        { path: '/recommendations', label: 'Recommendations', auth: true },
        { path: '/my-books', label: 'My Books', auth: true },
        { path: '/explore', label: 'Browse', auth: false },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-paper-200 transition-colors duration-300 dark:bg-stone-900 dark:border-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12">
                <div className="flex items-center justify-between h-full gap-8">

                    {/* Left: Logo & Nav */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-1 bg-teal-600 rounded text-white">
                                <BookOpen size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold font-serif text-ink-900 tracking-tight">Bookverse</span>
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

                    {/* Center: Search Bar */}
                    <div className="flex-1 max-w-md hidden md:block relativeRef" ref={searchRef}>
                        <form onSubmit={handleSearch} className="relative group">
                            <input
                                type="text"
                                placeholder="Search books, authors, ISBNs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                className="w-full bg-paper-100 border border-paper-200 rounded-full py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all placeholder-ink-400"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-teal-600">
                                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            </button>
                        </form>

                        {/* Instant Search Dropdown */}
                        <AnimatePresence>
                            {isSearchFocused && searchQuery.length > 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-paper-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
                                >
                                    {isSearching ? (
                                        <div className="p-4 text-center text-xs text-ink-400">Searching...</div>
                                    ) : searchResults?.items?.length > 0 ? (
                                        <ul>
                                            {searchResults.items.slice(0, 5).map(book => {
                                                let id = book.googleBookId || book.openLibraryId || book.id || book._id;
                                                if (typeof id === 'string' && id.includes('/works/')) {
                                                    id = id.split('/works/')[1];
                                                }
                                                // Check flattened props
                                                const title = book.title || book.volumeInfo?.title;
                                                const authors = book.authors || book.volumeInfo?.authors;
                                                const authorText = Array.isArray(authors) ? authors[0] : (authors || 'Unknown');
                                                const year = book.firstPublishYear || book.volumeInfo?.publishedDate?.substring(0, 4);
                                                const thumbnail = book.coverImage || book.thumbnail || book.volumeInfo?.imageLinks?.thumbnail;

                                                return (
                                                    <li key={id}>
                                                        <Link
                                                            to={`/book/${id}`}
                                                            onClick={() => setIsSearchFocused(false)}
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-paper-50 transition-colors border-b border-paper-100 last:border-0"
                                                        >
                                                            <div className="w-8 h-12 bg-paper-200 shrink-0 overflow-hidden rounded shadow-sm">
                                                                {thumbnail && <img src={thumbnail.replace('http:', 'https:')} className="w-full h-full object-cover" alt="" />}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-sm font-bold text-ink-900 truncate font-serif">{title}</p>
                                                                <p className="text-xs text-ink-500 truncate">{authorText} {year && `· ${year}`}</p>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                            <li className="p-2 text-center bg-paper-50 border-t border-paper-200">
                                                <button onClick={handleSearch} className="text-xs font-bold text-teal-700 hover:underline">
                                                    View all results for "{searchQuery}"
                                                </button>
                                            </li>
                                        </ul>
                                    ) : (
                                        <div className="p-6 text-center text-ink-400 text-sm">
                                            No books found for "{searchQuery}"
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                    className="flex items-center gap-2 hover:bg-paper-100 rounded-full p-1 pr-3 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-paper-200 overflow-hidden border border-paper-300">
                                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <User size={16} className="m-auto text-ink-400" />}
                                    </div>
                                    <span className="text-sm font-bold text-ink-900">{user.name.split(' ')[0]}</span>
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
                                                <div className="px-4 py-2 border-b border-paper-100 mb-2 dark:border-stone-800">
                                                    <p className="font-bold text-ink-900 text-sm dark:text-stone-100">{user.name}</p>
                                                    <p className="text-xs text-ink-400 dark:text-stone-500">@{user.username}</p>
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
                                <Link to="/login" className="text-sm font-bold text-ink-600 hover:text-teal-600">Log In</Link>
                                <Link to="/register" className="btn-primary text-sm py-1.5 px-4 rounded-full">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-ink-600">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-b border-paper-200 px-4 py-4 space-y-4">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full input-libra py-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                    {navLinks.map(link => (!link.auth || user) && (
                        <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="block py-2 text-ink-600 font-medium border-b border-paper-100">
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
