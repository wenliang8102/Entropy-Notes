// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home/index.vue'
import Notebook from '@/views/Notebook/index.vue'
import { createWebHashHistory } from 'vue-router';

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
    history: createWebHashHistory(),
    routes
});

export default router;
