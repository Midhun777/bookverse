import React, { useState } from 'react';
import ReviewItem from './ReviewItem';
import { Star, Send } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const ReviewList = ({ reviews, user, onAddReview, onDeleteReview }) => {
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);

    const handleSubmit = () => {
        if (reviewText.trim() && rating > 0) {
            onAddReview({ rating, reviewText });
            setReviewText('');
            setRating(0);
        }
    };

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-paper-200 pb-4 mb-8">
                <h3 className="text-xl font-bold font-serif text-ink-900">
                    Community Reviews
                    <span className="ml-2 text-sm font-sans font-normal text-ink-500 bg-paper-100 px-2 py-0.5 rounded-full">
                        {reviews.length}
                    </span>
                </h3>
            </div>

            {/* Input Area */}
            {user && (
                <div className="mb-10 flex gap-4 bg-paper-50 p-6 rounded-xl border border-paper-100">
                    <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold border border-teal-200">
                            {user.name?.charAt(0)}
                        </div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <textarea
                            className="w-full bg-white border border-paper-200 rounded-lg p-3 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 min-h-[100px] shadow-sm resize-none"
                            placeholder="Share your thoughts on this book..."
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-ink-400 uppercase tracking-wider mr-2">Your Rating:</span>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setRating(s)}
                                        className={`transition-all hover:scale-110 ${s <= rating ? "text-amber-400" : "text-paper-300 hover:text-amber-200"}`}
                                    >
                                        <Star size={20} fill="currentColor" />
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!rating || !reviewText.trim()}
                                className="px-5 py-2 btn-primary text-xs font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send size={14} /> Post Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map(rev => (
                        <ReviewItem
                            key={rev._id}
                            review={rev}
                            currentUser={user}
                            onDelete={onDeleteReview}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 bg-paper-50 rounded-lg border border-dashed border-paper-200">
                        <p className="text-ink-500 italic font-serif">No reviews yet.</p>
                        <p className="text-xs text-ink-400 mt-1">Be the first to share your opinion!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;
