import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BookOpen } from 'lucide-react';

const ReadingProgressModal = ({ isOpen, onClose, book, onUpdate }) => {
    const [currentPage, setCurrentPage] = useState(book?.currentPage || 0);
    const totalPages = book?.pageCount || book?.volumeInfo?.pageCount || 100; // Default or fetched

    // Calculate percentage
    const percentage = Math.round((currentPage / totalPages) * 100);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(currentPage);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-ink-900/20 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-paper-50 dark:bg-stone-900 rounded-xl shadow-2xl p-6 z-50 border border-paper-200 dark:border-stone-800"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-serif text-ink-900 dark:text-stone-100 flex items-center gap-2">
                                <BookOpen size={20} className="text-teal-600" />
                                Update Progress
                            </h3>
                            <button onClick={onClose} className="text-ink-400 hover:text-ink-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6 flex gap-4 items-start">
                            <div className="w-16 h-24 bg-paper-100 dark:bg-stone-800 rounded border border-paper-200 dark:border-stone-700 shrink-0 overflow-hidden shadow-sm">
                                <img
                                    src={book?.coverImage || book?.thumbnail || 'https://via.placeholder.com/96x144?text=No+Cover'}
                                    alt={book?.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-ink-900 dark:text-stone-200 line-clamp-1">{book?.title || 'Unknown Title'}</h4>
                                <p className="text-sm text-ink-500 dark:text-stone-400 mb-2">{book?.authors?.join(', ') || 'Unknown Author'}</p>
                                <div className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400 px-2 py-0.5 rounded-full inline-block">
                                    Currently Reading
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <div className="flex justify-between text-sm font-bold text-ink-600 dark:text-stone-400 mb-2">
                                    <span>Page {currentPage}</span>
                                    <span>{totalPages} pages ({percentage}%)</span>
                                </div>
                                <div className="relative h-2 w-full bg-paper-200 dark:bg-stone-800 rounded-lg group">
                                    <input
                                        type="range"
                                        min="0"
                                        max={totalPages}
                                        value={currentPage}
                                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div
                                        className="absolute top-0 left-0 h-full bg-teal-600 rounded-lg transition-all duration-200"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-teal-600 rounded-full shadow-md transition-all duration-200 pointer-events-none"
                                        style={{ left: `calc(${percentage}% - 8px)` }}
                                    />
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-ink-400 dark:text-stone-500 uppercase tracking-widest mb-1">
                                            Current Page
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={totalPages}
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                                            className="w-full input-libra py-2 px-3 text-sm focus:ring-teal-500"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-ink-400 dark:text-stone-500 uppercase tracking-widest mb-1">
                                            Total Pages
                                        </label>
                                        <input
                                            type="number"
                                            value={totalPages}
                                            disabled
                                            className="w-full input-libra py-2 px-3 text-sm bg-paper-100/50 dark:bg-stone-800/50 text-ink-400 dark:text-stone-500 border-dashed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-paper-200 dark:border-stone-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-bold text-ink-500 dark:text-stone-400 hover:bg-paper-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-8 py-2 flex items-center gap-2 transform active:scale-95 transition-all"
                                >
                                    <Save size={16} /> Update
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReadingProgressModal;
