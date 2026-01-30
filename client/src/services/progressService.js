import api from './api';

export const updateProgress = async (progressData) => {
    const response = await api.post('/progress/update', progressData);
    return response.data;
};

export const getProgress = async (googleBookId) => {
    try {
        const response = await api.get(`/progress/${googleBookId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};
