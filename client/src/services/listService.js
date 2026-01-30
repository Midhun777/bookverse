import api from './api';

export const getMyLists = async () => {
    const response = await api.get('/lists/my');
    return response.data;
};

export const addToList = async ({ googleBookId, status }) => {
    const response = await api.post('/lists/add', { googleBookId, status });
    return response.data;
};

export const updateStatus = async ({ googleBookId, status, progressPercent }) => {
    const response = await api.put('/lists/update-status', { googleBookId, status, progressPercent });
    return response.data;
};

export const removeFromList = async (googleBookId) => {
    const response = await api.delete(`/lists/remove/${googleBookId}`);
    return response.data;
};
