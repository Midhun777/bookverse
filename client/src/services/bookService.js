import api from './api';

export const saveBook = async (bookData) => {
    const response = await api.post('/books/save', bookData);
    return response.data;
};

export const unsaveBook = async (googleBookId) => {
    const response = await api.delete(`/books/unsave/${googleBookId}`);
    return response.data;
};

export const getSavedBooks = async () => {
    const response = await api.get('/books/saved');
    return response.data;
};

