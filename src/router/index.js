// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home/index.vue'
import Notebook from '@/views/Notebook/index.vue'
import { createWebHashHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
    {
        path: '/',
        name:'Home',
        component:Home
    },
    {
        path: '/notebook',
        name:'Notebook',
        component:Notebook,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// 全局守卫
router.beforeEach((to, from, next) => {

    const authStore = useAuthStore();

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !authStore.isAuthenticated) {
        // 如果目标路由需要认证，但用户未登录，则重定向到登录页
        next({ name: 'Home' });
    }
    // else if (to.name === 'Home' && authStore.isAuthenticated) {
    //     // 如果用户已登录，但试图访问登录页，则直接跳转到笔记页
    //     next({ name: 'Notebook' });
    // }
    else {
        next();
    }
});
export default router;
