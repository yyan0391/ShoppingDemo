<template>
    <div>
    <van-tabbar v-if="showNavbar" v-model="active">
        <van-tabbar-item :icon="this.active == 0 ? 'wap-home' : 'wap-home-o'" to="/home">首页</van-tabbar-item>
        <van-tabbar-item :icon="this.active == 1 ? 'shopping-cart' : 'shopping-cart-o'" :badge="cartCounter" to="/cart">
            购物车</van-tabbar-item>
        <van-tabbar-item :icon="this.active == 2 ? 'user' : 'user-o'" to="/profile">我的</van-tabbar-item>
        
    </van-tabbar>

    <div class="content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import Cart from '@/components/Cart/Cart.vue' 
import Profile from '@/components/Profile/Profile.vue'
import { mapState, mapMutations, mapGetters } from "vuex";


export default {
    name: 'mainpage',
    computed: {
        ...mapGetters("auth", ["uid", "isLogin"]),
        cartCounter() {  
            if (this.isLogin){
                console.log('购物车数量：'+this.$store.state.cartCounter);
                return this.$store.state.cartCounter;
            } else {
                return 0;
            }
            
        },
    },
    components: {
        Cart,
        Profile,
    },
    data() {
        return {
            active: 0,
            showNavbar: true,
        }
    },
    watch: {
        $route(to) {
            // 根据路由元信息动态控制 navbar 的显示
            this.showNavbar = to.meta.showNavbar !== false;
            if (to.meta.active !== undefined) {
                this.active = to.meta.active;
            }
        },
    },
    methods: {
        // goToPage(path) {
        //     this.$router.push(path); 
        // },
        cartImgOn() {
            console.log(this.$store.state.cartCounter);
        },
        
    },
    mounted() {
        // 初始化 navbar 的显示状态
        this.showNavbar = this.$route.meta.showNavbar !== false;
        if (this.$route.meta.active !== undefined) {
            this.active = this.$route.meta.active;
        }
    },
    
}
</script>

<style></style>