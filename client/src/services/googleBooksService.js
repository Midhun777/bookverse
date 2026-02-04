import axios from 'axios';
import api from './api';

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

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
        const response = await axios.get(`${GOOGLE_BOOKS_BASE_URL}/${bookId}`);
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
        const response = await axios.get(GOOGLE_BOOKS_BASE_URL, {
            params: {
                q: query,
                maxResults: 20
            }
        });

        return { items: response.data.items || [] };

    } catch (error) {
        console.error('Search Error:', error);
        return { items: [] };
    }
};
