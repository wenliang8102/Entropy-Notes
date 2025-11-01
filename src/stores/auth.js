import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '@/services/api';
import { useNotesStore } from './notes'; // 引入 notes store

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();

    // State: 从 localStorage 初始化 token
    const token = ref(localStorage.getItem('authToken') || null);
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const authError = ref(null); // 用于存储登录/注册错误信息

    // Computed: 判断用户是否已登录
    const isAuthenticated = computed(() => !!token.value);

    // Actions
    async function login(username, password) {
        authError.value = null;
        try {
            const response = await authApi.login(username, password);
            if (response.data.token) {
                // 登录成功
                setAuthData(response.data.token);
                router.push('/notebook'); // 跳转到笔记页面
            } else {
                // 后端返回了非预期的数据结构
                throw new Error(response.data.message || '登录失败，响应格式不正确');
            }
        } catch (error) {
            authError.value = error.response?.data?.message || error.message || '登录时发生未知错误';
            console.error('Login failed:', authError.value);
        }
    }

    async function register(username, password) {
        authError.value = null;
        try {
            const response = await authApi.register(username, password);
            // 注册成功后可以提示用户去登录
            alert(response.data.message || '注册成功！请现在登录。');
            return true; // 返回成功状态
        } catch (error) {
            authError.value = error.response?.data?.message || error.message || '注册时发生未知错误';
            console.error('Registration failed:', authError.value);
            return false; // 返回失败状态
        }
    }

    function logout() {
        // 清理笔记数据
        const notesStore = useNotesStore();
        notesStore.clearNotes();

        // 清理认证数据
        token.value = null;
        user.value = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // 跳转到登录页
        router.push('/');
    }

    // 辅助函数：设置认证数据
    function setAuthData(newToken) {
        token.value = newToken;
        localStorage.setItem('authToken', newToken);

        // 从 JWT 中解析用户信息 (可选，但很有用)
        try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            user.value = payload.user;
            localStorage.setItem('user', JSON.stringify(payload.user));
        } catch(e) {
            console.error("Could not decode token:", e);
            user.value = null;
            localStorage.removeItem('user');
        }
    }

    return { token, user, isAuthenticated, authError, login, register, logout };
});