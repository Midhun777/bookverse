import axios from 'axios';
import api from './api';

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export const getBookDetails = async (bookId) => {
    try {
        // 1. Try fetching from Local Backend (BookMaster) first for consistency
        try {
            const localRes = await api.get(`/books/${bookId}`);
            if (localRes.data) {
                const book = localRes.data;
                return {
                    id: book.googleBookId || book.openLibraryId,
                    volumeInfo: {
                        title: book.title,
                        authors: book.authors || ['Unknown Author'],
                        description: book.description,
                        imageLinks: {
                            thumbnail: book.coverImage?.replace('http:', 'https:')
                        },
                        categories: book.subjects || [],
                        averageRating: book.averageRating,
                        ratingsCount: book.ratingsCount,
                        publishedDate: book.firstPublishYear?.toString(),
                        pageCount: book.pageCount
                    },
                    accessInfo: {
                        embeddable: false
                    }
                };
            }
        } catch (localErr) {
            if (localErr.response && localErr.response.status !== 404) {
                console.error('Local DB Error:', localErr);
            }
        }

        // 2. Fallback to Google Books API
        const response = await axios.get(`${GOOGLE_BOOKS_BASE_URL}/${bookId}${API_KEY ? `?key=${API_KEY}` : ''}`);
        const data = response.data;

        // Force HTTPS in Google Response too
        if (data.volumeInfo?.imageLinks) {
            Object.keys(data.volumeInfo.imageLinks).forEach(key => {
                data.volumeInfo.imageLinks[key] = data.volumeInfo.imageLinks[key].replace('http:', 'https:');
            });
        }

        return data;

    } catch (error) {
        console.error('Google Books Service Error:', error);
        throw error;
    }
};

export const searchBooks = async (query) => {
    try {
        // Detect if query is a category match from Browse page
        const categories = ["Fiction", "Science", "Business", "History", "Psychology", "Technology", "Art", "Mystery", "Romance", "Fantasy"];
        let finalQuery = query;
        if (categories.some(cat => cat.toLowerCase() === query.toLowerCase())) {
            finalQuery = `subject:${query}`;
        }

        // 1. Fetch from Google Books
        const googlePromise = axios.get(GOOGLE_BOOKS_BASE_URL, {
            params: {
                q: finalQuery,
                maxResults: 20,
                key: API_KEY
            }
        });

        // 2. Fetch from Local Database
        const localPromise = api.get(`/books/search?q=${query}`);

        // Wait for both (but don't fail if one fails)
        const [googleRes, localRes] = await Promise.allSettled([googlePromise, localPromise]);

        let combinedItems = [];

        // Handle Google Results
        if (googleRes.status === 'fulfilled' && googleRes.value.data.items) {
            combinedItems = [...googleRes.value.data.items];
        } else if (googleRes.status === 'rejected') {
            const status = googleRes.reason?.response?.status;
            if (status === 429) {
                console.warn('Google Books API rate limit reached (429).');
                // We'll rely on local results only
            } else {
                console.error('Google Books Search Error:', googleRes.reason?.message);
            }
        }

        // Handle Local Results
        if (localRes.status === 'fulfilled' && localRes.value.data) {
            const localItems = localRes.value.data;
            // Merge and deduplicate by ID
            localItems.forEach(localBook => {
                const exists = combinedItems.find(gBook => gBook.id === localBook.id);
                if (!exists) {
                    combinedItems.unshift(localBook); // Put local/curated books at the top
                }
            });
        }

        return {
            items: combinedItems,
            isLimited: googleRes.status === 'rejected' && googleRes.reason?.response?.status === 429
        };

    } catch (error) {
        console.error('Unified Search Error:', error);
        return { items: [] };
    }
};
