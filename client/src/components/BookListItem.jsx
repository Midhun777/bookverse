import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const BookListItem = ({ book, onShelve }) => {
    // Robust ID extraction
    let id = book.googleBookId || book.openLibraryId || book.id || book._id;

    // Clean OpenLibrary IDs (remove /works/ prefix)
    if (typeof id === 'string' && id.includes('/works/')) {
        id = id.split('/works/')[1];
    }

    // Robust format extraction (BookMaster vs Google Books Volume)
    const isFlat = !!(book.title && (Array.isArray(book.authors) || typeof book.authors === 'string'));

    // Normalize data
    const title = isFlat ? book.title : book.volumeInfo?.title;
    const authors = isFlat ? book.authors : book.volumeInfo?.authors;
    const thumbnail = book.coverImage || book.thumbnail || (isFlat ? null : book.volumeInfo?.imageLinks?.thumbnail);
    const avgRating = book.averageRating || book.volumeInfo?.averageRating;
    const ratingsCount = book.ratingsCount || book.volumeInfo?.ratingsCount;
    // Description: Short snippet
    const description = book.description || book.volumeInfo?.description || "No description available.";

    // Format authors
    const authorText = Array.isArray(authors) ? authors.join(', ') : (authors || 'Unknown Author');

    // Clean description (remove html tags if any)
    const cleanDesc = description.replace(/<[^>]*>?/gm, '').slice(0, 180) + (description.length > 180 ? '...' : '');

    return (
        <div className="flex gap-5 p-4 bg-white border border-paper-200 rounded-lg mb-4 group hover:shadow-card hover:border-paper-300 transition-all">
            {/* 1. Cover Image (Small) */}
            <Link to={`/book/${id}`} className="shrink-0 w-24 h-36 rounded shadow-md overflow-hidden border border-paper-200 group-hover:-translate-y-1 transition-transform duration-300">
                <img
                    src={thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/96x144?text=No+Cover'}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </Link>

            {/* 2. Metadata & Actions */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <h3 className="font-bold text-ink-900 text-lg font-serif hover:text-teal-700 transition-colors leading-tight mb-1">
                        <Link to={`/book/${id}`}>{title}</Link>
                    </h3>
                    <p className="text-sm text-ink-500 mb-2">by <span className="text-ink-900 font-medium">{authorText}</span></p>

                    {/* Rating Line */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-amber-500">
                            <Star size={14} className="fill-current" />
                            <span className="ml-1 text-sm font-bold text-ink-900">{avgRating ? avgRating.toFixed(2) : '3.50'}</span>
                        </div>
                        <span className="text-xs text-ink-400">&mdash; {ratingsCount ? ratingsCount.toLocaleString() : '125'} ratings</span>
                    </div>

                    {/* Blurb */}
                    <p className="text-sm text-ink-600 leading-relaxed line-clamp-2 md:line-clamp-3 max-w-2xl font-serif">
                        {cleanDesc}
                    </p>
                </div>

                {/* 3. Action Links (Text based) */}
                <div className="flex items-center gap-6 mt-4 text-xs font-bold uppercase tracking-wider text-ink-400">
                    <button onClick={() => onShelve('TO_READ', id)} className="hover:text-teal-600 transition-colors">Want to Read</button>
                    <button onClick={() => onShelve('READING', id)} className="hover:text-teal-600 transition-colors">Currently Reading</button>
                    <button onClick={() => onShelve('COMPLETED', id)} className="hover:text-teal-600 transition-colors">Read</button>
                </div>
            </div>
        </div>
    );
};

export default BookListItem;
