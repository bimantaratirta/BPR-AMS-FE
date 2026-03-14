import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: BASE_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 — clear token and redirect to root
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_info');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL as string;

export function getAssetUrl(path: string | null | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    return `${S3_BASE_URL}${path}`;
}

export default api;
