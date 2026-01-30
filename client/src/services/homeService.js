import api from './api';

export const getHomeData = async () => {
    const response = await api.get('/home/books');
    return response.data;
};
