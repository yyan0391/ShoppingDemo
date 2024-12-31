import { createRouter, createWebHistory } from 'vue-router';
import Cart from '@/components/Cart/Cart.vue'
import GoodDetail from '@/components/Home/GoodDetail.vue';
import MainPage from '@/components/MainPage.vue'
import Profile from '@/components/Profile/Profile.vue'
import Login from '@/components/Login.vue';
import Home from '@/components/Home/Home.vue';
import CheckOut from '@/components/Cart/CheckOut.vue';
import Address from '@/components/Cart/Address.vue';
import Register from '@/components/Register.vue';
import Settings from '@/components/Profile/Settings.vue';
import Notification from '@/components/Profile/Notification.vue';
import EditInfo from '@/components/Admin/EditInfo.vue';
import AdminUploadGoods from '@/components/Admin/AdminUploadGoods.vue';
import AdminEditGoods from '@/components/Admin/AdminEditGoods.vue';
import AdminCoupon from '@/components/Admin/AdminCoupon.vue';
import AdminUpdateGoods from '@/components/Admin/AdminUpdateGoods.vue';
import Like from '@/components/Profile/Like.vue';
import ChangePW from '@/components/Admin/ChangePW.vue';



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
    {
        path: '/Settings',
        component: Settings,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/Notification',
        component: Notification,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/EditInfo',
        component: EditInfo,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/AdminUploadGoods',
        component: AdminUploadGoods,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/AdminEditGoods',
        component: AdminEditGoods,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/AdminCoupon',
        component: AdminCoupon,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/AdminUpdateGoods',
        component: AdminUpdateGoods,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/Like',
        component: Like,
        meta: { showNavbar: false },
        props: true,
    },
    {
        path: '/ChangePW',
        component: ChangePW,
        meta: { showNavbar: false },
        props: true,
    },
    
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router