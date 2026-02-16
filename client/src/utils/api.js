import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically add token to headers if it exists
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
                console.log('API Request: Token attached to', config.url);
            } else {
                console.log('API Request: No token found in user object');
            }
        } else {
            console.log('API Request: No user found in localStorage');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
