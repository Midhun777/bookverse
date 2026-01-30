import React from 'react';
import { Star, Trash2, ThumbsUp } from 'lucide-react';

const ReviewItem = ({ review, currentUser, onDelete }) => {
    return (
        <div className="flex gap-4 p-4 rounded-lg hover:bg-paper-50 transition-colors group">
            {/* Avatar */}
            <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center overflow-hidden">
                    {review.userId.avatar ? (
                        <img src={review.userId.avatar} alt={review.userId.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-ink-500 font-serif">{review.userId.name.charAt(0)}</span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink-900 font-serif">
                        {review.userId.name}
                        {review.userId.username && <span className="font-normal text-ink-400 text-xs ml-1">@{review.userId.username}</span>}
                    </p>
                    <span className="text-xs text-ink-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                    <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                fill={i < review.rating ? "currentColor" : "none"}
                                className={i < review.rating ? "text-amber-500" : "text-paper-300"}
                            />
                        ))}
                    </div>
                </div>

                <div className="text-sm text-ink-800 leading-relaxed max-w-2xl">
                    {review.reviewText}
                </div>

                {/* Actions (Like/Delete) */}
                <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-1 text-xs font-bold text-ink-400 hover:text-teal-600 transition-colors">
                        <ThumbsUp size={12} /> Like
                    </button>
                    {(currentUser?._id === review.userId._id || currentUser?.role === 'ADMIN') && (
                        <button
                            onClick={() => onDelete(review._id)}
                            className="flex items-center gap-1 text-xs font-bold text-ink-400 hover:text-red-600 transition-colors"
                        >
                            <Trash2 size={12} /> Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewItem;
