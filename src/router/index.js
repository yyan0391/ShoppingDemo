import { createRouter, createWebHistory } from 'vue-router';
import Cart from '@/components/Cart.vue'
import GoodDetail from '@/components/GoodDetail.vue';
import MainPage from '@/components/MainPage.vue'
import Profile from '@/components/Profile.vue'
import Login from '@/components/Login.vue';
import Home from '@/components/Home.vue';
import CheckOut from '@/components/CheckOut.vue';
import Address from '@/components/Address.vue';
import Register from '@/components/Register.vue';



const routes = [
    {
        path: '/',
        component: MainPage,
        meta: { showNavbar: true }, // MainPage 显示 navbar
        children: [
            { path: '', redirect: '/home' },
            { path: 'home', component: Home, meta: { active: 0 } },
            { path: 'cart', component: Cart, meta: { active: 1 } },
            { path: 'profile', component: Profile, meta: { active: 2 } },
        ],
    },
    {
        path: '/GoodDetail',
        component: GoodDetail,
        meta: { showNavbar: false },
        props: true, 
    },
    {
        path: '/CheckOut',
        component: CheckOut,
        meta: { showNavbar: false },
        props: true, 
    },
    {
        path: '/Address',
        component: Address,
        meta: { showNavbar: false },
        props: true, 
    },
    {
        path: '/Login',
        component: Login,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/Register',
        component: Register,
        meta: { showNavbar: false },
        props: true,
    },
    
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router