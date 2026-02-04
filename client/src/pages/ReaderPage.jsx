import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBookDetails } from '../services/googleBooksService';
import { getProgress, updateProgress } from '../services/progressService';
import { updateReadingSession } from '../services/statsService';
import { ChevronLeft, ChevronRight, Settings, Moon, Sun, Type, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ReaderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [fontSize, setFontSize] = useState(18);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [sessionStartTime] = useState(Date.now());

    const { data: book, isLoading } = useQuery({
        queryKey: ['book', id],
        queryFn: () => getBookDetails(id),
    });

    const { data: progress } = useQuery({
        queryKey: ['progress', id],
        queryFn: () => getProgress(id),
        enabled: !!id,
    });

    useEffect(() => {
        if (progress) {
            setCurrentPage(progress.currentPage);
        }
    }, [progress]);

    // Update progress when page changes
    const progressMutation = useMutation({
        mutationFn: (page) => updateProgress({ googleBookId: id, currentPage: page }),
    });

    // Log reading session on unmount
    useEffect(() => {
        return () => {
            const sessionEnd = Date.now();
            const durationMinutes = Math.round((sessionEnd - sessionStartTime) / 60000);
            if (durationMinutes > 0) {
                updateReadingSession({ googleBookId: id, durationMinutes });
            }
        };
    }, [id, sessionStartTime]);

    const handlePageChange = (newPage) => {
        if (newPage < 1) return;
        setCurrentPage(newPage);
        progressMutation.mutate(newPage);
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    const volumeInfo = book?.volumeInfo;

    // Load Google Books Embedded Viewer
    useEffect(() => {
        if (!book) return;

        const initViewer = () => {
            console.log("Initializing Google Books Viewer for:", id);
            try {
                if (!window.google?.books) {
                    throw new Error("Google Books API not found on window");
                }
                const viewer = new window.google.books.DefaultViewer(document.getElementById('viewerCanvas'));
                viewer.load(id, (success) => {
                    if (!success) {
                        console.warn("Book not embeddable:", id);
                        toast.error("This book cannot be previewed online.");
                    }
                });
            } catch (err) {
                console.error("Viewer Init Error:", err);
            }
        };

        const tryLoad = () => {
            if (window.google?.books) {
                window.google.books.load();
                window.google.books.setOnLoadCallback(initViewer);
                return true;
            }
            return false;
        };

        if (!tryLoad()) {
            const interval = setInterval(() => {
                if (tryLoad()) clearInterval(interval);
            }, 500);
            return () => clearInterval(interval);
        }
    }, [book, id]);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-300`}>
            {/* Header */}
            <header className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} bg-inherit z-10`}>
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-current">
                        <X size={24} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="font-bold truncate max-w-[200px] md:max-w-md">{volumeInfo?.title || 'Loading...'}</h1>
                        <p className="text-xs opacity-60 italic">{volumeInfo?.authors?.join(', ') || ''}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                        title={isDarkMode ? "Light Mode" : "Dark Mode"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition"
                    >
                        Exit
                    </button>
                </div>
            </header>

            {/* Reader Area */}
            <main className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-950">
                <div id="viewerCanvas" className="w-full h-full">
                    {/* Google Books Viewer will mount here */}
                </div>

                {/* Overlay for loading state */}
                {(isLoading || !window.google?.books) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-gray-900 z-10">
                        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                        <p className="text-sm font-medium opacity-60">Opening digital archive...</p>
                    </div>
                )}
            </main>
        </div>
    );
};


export default ReaderPage;
