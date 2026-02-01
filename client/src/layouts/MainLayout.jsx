import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useThemeStore } from '../store/themeStore';

const MainLayout = () => {
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className={`min-h-screen relative bg-paper-50 text-ink-900 font-sans transition-colors duration-300 dark:bg-stone-950 dark:text-stone-100`}>
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 min-h-[80vh]">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-paper-200 py-12 mt-auto dark:bg-stone-900 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-ink-600 gap-6 dark:text-stone-400">
                    <p>&copy; {new Date().getFullYear()} Bookverse. Ideally organized.</p>
                    <div className="flex space-x-8 font-medium">
                        <a href="#" className="hover:text-teal-600 transition-colors">About</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Help</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
