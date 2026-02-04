import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to add Token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // If unauthorized or forbidden (banned), clear store and redirect to login
            useAuthStore.getState().logout();

            // If it's a 403, we might want to preserve the error message
            const message = error.response.data.message || 'Access denied';

            if (window.location.pathname !== '/login') {
                // Store ban message temporarily in session storage to show on login page
                if (error.response.status === 403) {
                    sessionStorage.setItem('auth_error', message);
                }
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
