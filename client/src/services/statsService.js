import api from './api';

export const updateReadingSession = async (sessionData) => {
    const response = await api.post('/stats/session', sessionData);
    return response.data;
};

export const getPublicProfile = async (username) => {
    const response = await api.get(`/stats/profile/${username}`);
    return response.data;
};
