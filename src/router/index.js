// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'; // 1. 引入 createWebHashHistory
import Home from '@/views/Home/index.vue'
import Notebook from '@/views/Notebook/index.vue'

const routes = [
    {
        path: '/',
        name:'Home',
        component:Home
    },
    {
        path: '/notebook',
        name:'Notebook',
        component:Notebook
    }
];

const router = createRouter({
    history: createWebHashHistory(), // 2. 使用 Hash 模式
    routes
});

export default router;
