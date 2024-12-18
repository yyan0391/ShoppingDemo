import { createRouter, createWebHistory } from 'vue-router';
import Cart from '@/components/Cart.vue'
import GoodDetail from '@/components/GoodDetail.vue';
import MainPage from '@/components/MainPage.vue'
// import Profile from '@/components/Profile.vue'
import Login from '@/components/Login.vue';
// Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'mainpage',
        component: MainPage
    },
    {
        path: '/GoodDetail',
        name: 'GoodDetail',
        component: GoodDetail
    },
    {
        path: '/cart',
        name: 'cart',
        component: Cart
    },
    {
        path: '/login',
        name: 'login',
        component: Login
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router