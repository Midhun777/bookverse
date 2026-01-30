import api from './api';

export const getBookReviews = async (googleBookId, sort = 'newest') => {
    const response = await api.get(`/reviews/book/${googleBookId}?sort=${sort}`);
    return response.data;
};

export const addReview = async (reviewData) => {
    const response = await api.post('/reviews/add', reviewData);
    return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/update/${reviewId}`, reviewData);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/reviews/delete/${reviewId}`);
    return response.data;
};
