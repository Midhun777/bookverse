import api from './api';

export const logActivity = async (activityData) => {
    try {
        const response = await api.post('/activities/log', activityData);
        return response.data;
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

export const getMyActivities = async () => {
    const response = await api.get('/activities/my');
    return response.data;
};
