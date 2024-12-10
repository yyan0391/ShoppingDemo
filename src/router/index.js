import { createRouter, createWebHistory } from 'vue-router';
import Cart from '@/components/Cart.vue'
import Home from '@/components/Home.vue'
import Main from '@/components/Main.vue'
import Profile from '@/components/Profile.vue'

// Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'main',
        component: Main
    },
    {
        path: '/cart',
        name: 'cart',
        component: Cart
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router