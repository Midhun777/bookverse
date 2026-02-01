import api from './api';

export const favoriteBook = async (bookData) => {
    const response = await api.post('/books/favorites', bookData);
    return response.data;
};

export const unfavoriteBook = async (googleBookId) => {
    const response = await api.delete(`/books/favorites/${googleBookId}`);
    return response.data;
};

export const getFavoriteBooks = async () => {
    const response = await api.get('/books/favorites');
    return response.data;
};

