import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
});

// Request interceptor - Add Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle unauthorized
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            console.log("Login first");
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;