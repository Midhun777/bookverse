import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const ReadBookPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Sometimes we pass the read link directly via state to avoid an extra lookup
    const initialLink = location.state?.readLink;
    const isFree = location.state?.isFree;

    // We'll use a basic iframe viewer for now.
    // Derived state directly from props/query. No need for useEffect state sync.
    let viewerUrl = initialLink || '';

    // If we didn't get a link, we need to fetch the book details
    const { data: book, isLoading } = useQuery({
        queryKey: ['book', id],
        queryFn: async () => {
            const res = await api.get(`/books/${id}`);
            return res.data;
        },
        enabled: !initialLink, // Only fetch if we don't already have the link
    });

    if (!viewerUrl && book) {
        if (book.isFree && book.readLink) {
            viewerUrl = book.readLink;
        } else if (book.volumeInfo?.accessInfo?.webReaderLink) {
            viewerUrl = book.volumeInfo.accessInfo.webReaderLink;
        } else {
            // Fallback or handle Google Viewer API
            viewerUrl = `https://books.google.com/books?id=${book.googleBookId || id.replace('gutenberg_', '')}&printsec=frontcover&output=embed`;
        }
    }

    return (
        <div className="min-h-screen bg-paper-50 dark:bg-stone-950 flex flex-col">
            {/* Header Toolbar */}
            <div className="bg-paper-100 dark:bg-stone-900 border-b border-paper-200 dark:border-stone-800 p-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-paper-200 dark:hover:bg-stone-800 rounded-full transition-colors text-ink-600 dark:text-stone-300"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold font-serif text-ink-900 dark:text-stone-100 line-clamp-1">
                            {book?.volumeInfo?.title || location.state?.title || 'Book Viewer'}
                        </h1>
                        <p className="text-xs text-ink-500 dark:text-stone-400">
                            {isFree ? 'Free Public Domain Book' : 'Preview'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 hover:bg-paper-200 dark:hover:bg-stone-800 rounded-lg text-ink-600 dark:text-stone-300 transition-colors flex items-center gap-2 text-sm"
                        title="Reload Viewer"
                    >
                        <RefreshCw size={16} />
                        <span className="hidden sm:inline">Reload</span>
                    </button>
                    {viewerUrl && (
                        <a
                            href={viewerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-paper-200 dark:hover:bg-stone-800 rounded-lg text-ink-600 dark:text-stone-300 transition-colors flex items-center gap-2 text-sm"
                            title="Open in new tab"
                        >
                            <ExternalLink size={16} />
                            <span className="hidden sm:inline">Open Original</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Viewer Content Area */}
            <div className="flex-1 bg-white dark:bg-stone-950 relative">
                {(isLoading && !initialLink) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
                        <p className="text-ink-500 dark:text-stone-400 font-medium animate-pulse">Loading Book Viewer...</p>
                    </div>
                ) : viewerUrl ? (
                    <iframe
                        src={viewerUrl}
                        className="w-full h-[calc(100vh-73px)] border-none"
                        title="Book Viewer"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        onError={(e) => console.error("Iframe load error", e)}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-full mb-4">
                            <BookOpen size={48} />
                        </div>
                        <h2 className="text-xl font-bold font-serif text-ink-900 dark:text-stone-100 mb-2">Internal Viewer Unavailable</h2>
                        <p className="text-ink-600 dark:text-stone-400 mb-6 max-w-md">
                            We couldn't load the embedded viewer for this book. Some publishers restrict embedded previews, or the link may be invalid.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => navigate(-1)} className="btn-outline px-6">Go Back</button>
                            {/* Fallback to external lookup if we don't have a direct reader link */}
                            <a href={`https://books.google.com/books?id=${id.replace('gutenberg_', '')}`} target="_blank" rel="noopener noreferrer" className="btn-primary px-6">Try External Search</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadBookPage;
