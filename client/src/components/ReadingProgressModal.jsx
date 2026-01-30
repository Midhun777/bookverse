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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 z-50 border border-paper-200"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-serif text-ink-900 flex items-center gap-2">
                                <BookOpen size={20} className="text-teal-600" />
                                Update Progress
                            </h3>
                            <button onClick={onClose} className="text-ink-400 hover:text-ink-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6 flex gap-4 items-start">
                            <div className="w-16 h-24 bg-paper-100 rounded border border-paper-200 shrink-0 overflow-hidden shadow-sm">
                                <img
                                    src={book?.coverImage || book?.thumbnail || 'https://via.placeholder.com/96x144'}
                                    alt={book?.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-ink-900 line-clamp-1">{book?.title || 'Unknown Title'}</h4>
                                <p className="text-sm text-ink-500 mb-2">{book?.authors?.join(', ') || 'Unknown Author'}</p>
                                <div className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full inline-block">
                                    Currently Reading
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <div className="flex justify-between text-sm font-bold text-ink-600 mb-2">
                                    <span>Page {currentPage}</span>
                                    <span>{totalPages} pages ({percentage}%)</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                                    className="w-full h-2 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                />
                                <div className="mt-4 flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1">
                                            Current Page
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={totalPages}
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                                            className="w-full input-libra py-2"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-1">
                                            Total Pages
                                        </label>
                                        <input
                                            type="number"
                                            value={totalPages}
                                            disabled
                                            className="w-full input-libra py-2 bg-paper-50 text-ink-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-paper-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-bold text-ink-500 hover:bg-paper-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6 py-2 flex items-center gap-2"
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
