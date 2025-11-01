import axios from 'axios';

// 创建一个 axios 实例
const apiClient = axios.create({
    baseURL: 'http://8.138.220.50:3000/api', // 后端 API 基础 URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// 添加请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('authToken');
        if (token) {
            // 如果 token 存在，则添加到请求头中
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 封装认证 API
export const authApi = {
    login: (username, password) => {
        return apiClient.post('/auth/login', { username, password });
    },
    register: (username, password) => {
        return apiClient.post('/auth/register', { username, password });
    },
};

// 封装笔记 API
export const notesApi = {
    getAll: () => apiClient.get('/notes'),
    create: () => apiClient.post('/notes'),
    update: (id, { title, content, lastKnownUpdatedAt }) => {
        return apiClient.put(`/notes/${id}`, { title, content, lastKnownUpdatedAt });
    },
    delete: (id) => apiClient.delete(`/notes/${id}`),
};