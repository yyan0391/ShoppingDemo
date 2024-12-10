<template>
    <div>
    <van-tabbar v-model="active">
        <van-tabbar-item :icon="this.active == 0 ? 'wap-home' : 'wap-home-o'">首页</van-tabbar-item>
        <van-tabbar-item :icon="this.active == 1 ? 'shopping-cart' : 'shopping-cart-o'">购物车</van-tabbar-item>
        <van-tabbar-item :icon="this.active == 2 ? 'user' : 'user-o'">我的</van-tabbar-item>
        
    </van-tabbar>
    <div class="content">
        <Home v-if="active === 0"></Home>/>
        <Cart v-if="active === 1"></Cart>/>
        <Profile v-if="active === 2"></Profile>/>
    </div>
    </div>
</template>

<script>
import Cart from '@/components/Cart.vue' 
import Profile from '@/components/Profile.vue'
import Home from '@/components/Home.vue'

export default {
    name: 'main',
    components: {
        Cart,
        Profile,
        Home
    },
    data() {
        return {
            active: 0,
        }
    },
    methods: {
        // goToPage(path) {
        //     this.$router.push(path); 
        // },
    },
}
</script>

<style></style>