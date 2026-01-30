import api from './api';

export const getMyRecommendations = async () => {
    const response = await api.get('/recommendations/my');
    return response.data;
};

export const getGlobalRecommendations = async () => {
    const response = await api.get('/recommendations/global');
    return response.data;
};
