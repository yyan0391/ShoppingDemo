<template>
    <div class="home">
        <van-nav-bar title="RIIZE" class="home-title"></van-nav-bar>
        <div class="home-search">
            <van-search v-model="searchQuery" placeholder="请输入搜索关键词" show-action shape="round" @search="onSearch"
                @cancel="onCancel" />

            <van-swipe :autoplay="3000" lazy-render>
                <van-swipe-item v-for="image in images" :key="image">
                    <img :src="image" class="swipe-image" />
                </van-swipe-item>

            </van-swipe>

            <van-row>
                <HomeColumn :products="products" @filterChanged="onFilterChanged" />
            </van-row>

            <van-loading type="spinner" v-if="spinner" color="#1890ff" style="text-align: center; display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 50px;" vertical>加载中...</van-loading>

            <van-card class="card" v-for="(item, index) in filteredProducts" :key="index" :title="item.title"
                @click="GoDetail(item)" :desc="item.description" :price="item.price" :tag="item.tag"
                :thumb="item.images[0]">
                <!-- <template #tags>
                    <van-tag plain type="danger" style="margin-right: 6px;">消费券</van-tag>
                    <van-tag plain type="danger">满300减30</van-tag>
                </template> -->
                <template #tags>
                    <van-tag v-for="coupon in item.coupons" :key="coupon" plain type="danger">{{ coupon.name }}</van-tag>
                </template>
                <template #footer>
                    <div style="display: flex; justify-content: flex-end; align-items: center;">
                        <van-icon name="cart-o" color="#E65100" size="20px"
                            style="border: none; background: transparent; padding: 5px; cursor: pointer;"
                            @click.stop="onAddToCart(item)" />
                    </div>
                </template>
            </van-card>

            <van-popup v-model="showLogin" style="border-radius: 24px;" closeable close-icon="cross"
                close-icon-position="top-right">
                <Login @loginSuccess="handleLoginSuccess" />
            </van-popup>
        </div>
    </div>

</template>

<script>
import HomeColumn from './HomeColumn.vue'
import product4 from '@/assets/imgs/IMG_1012.png';
import product5 from '@/assets/imgs/IMG_1013.png';
import product6 from '@/assets/imgs/IMG_1014.png';
import product7 from '@/assets/imgs/IMG_1015.png';
import product8 from '@/assets/imgs/IMG_1016.png';
import product9 from '@/assets/imgs/乳品.png';
import { showSuccessToast, showFailToast } from 'vant';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Login from "@/components/Login.vue";
import { mapGetters } from "vuex";

export default {
    name: 'home',
    data() {
        return {
            value: '',
            images: [
                product4,
                product5,
                product6,
                product7,
                product8,
            ],
            searchQuery: '',
            showPopupGoodDetail: false,
            spinner: false,
            products: [],
            showLogin: false,
            filteredProducts: [],
            currentFilter: "ALL",
        }
    },
    computed: {
        ...mapGetters("auth", ["username", "isLogin"]),
        cartCounter() {
            return this.$store.state.cartCounter;
        },
        // 动态筛选商品
        // filteredProducts() {
        //     if (!this.searchQuery) {
        //         return this.products;
        //     }
        //     const query = this.searchQuery.toLowerCase();
        //     return this.products.filter(
        //         (product) =>
        //             product.title.toLowerCase().includes(query) ||
        //             product.description.toLowerCase().includes(query)
        //     );
        // },
    },
    async created() {
        await this.fetchProducts(); // 在页面创建时获取商品数据
        this.applyFilters(); // 初始化时应用筛选条件
    },
    components: {
        HomeColumn,
        Login,
    },
    methods: {
        onFilterChanged(filter) {
            this.currentFilter = filter;
            this.applyFilters();
        },
        applyFilters() {
            this.filteredProducts = this.products.filter((product) => {
                const matchesCategory =
                    this.currentFilter === "ALL" || product.category === this.currentFilter;
                const matchesSearch =
                    !this.searchQuery ||
                    product.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    product.description.toLowerCase().includes(this.searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            });
        },
        async fetchProducts() {
            try {
                const querySnapshot = await getDocs(collection(db, "products")); // 从 Firestore 获取商品数据
                const fetchedProducts = querySnapshot.docs.map((doc) => ({
                    id: doc.id, // 商品 ID
                    ...doc.data(), // 商品数据
                }));
                this.products = fetchedProducts
                    .filter((product) => product.isAvailable)
                    .map((product) => ({
                        ...product,
                        images: product.images && product.images.length ? product.images : ["https://via.placeholder.com/150"], // 确保至少有一张默认图片
                    }));
                this.spinner = false;
            } catch (error) {
                console.error("获取商品失败：", error);
            }
        },

        onSearch(value) {
            this.searchQuery = value;
            this.applyFilters();
        },
        onCancel() {
            this.searchQuery = '';
            this.applyFilters();
        },
        GoDetail(item) {
            this.$router.push({
                path: '/GoodDetail',
                query: {
                    items: JSON.stringify(item),
                },
            })
        },
        onAddToCart(item) {
            if (this.isLogin === false) {
                this.showLogin = true;
                return;
            } else {
                let isInCart = item.isInCart;

                if (isInCart) {
                    this.$store.commit('addGoods', item.id);
                    showSuccessToast('添加购物车成功');
                } else {
                    this.$store.commit('addGoodsToCart', item);
                    showSuccessToast('添加购物车成功');
                }
            }

        },
        handleLoginSuccess(user) {
            this.showLogin = false;
        },
    },
    mounted() {
        this.spinner = true;
    }
}
</script>

<style>
.home {
    width: 100%;
}

.home-title {
    position: fixed !important;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;

}

.home-search {
    margin-top: 50px;
}

.card {
    margin: 5%;
}

.swipe-image {
    width: 100%;
    height: auto;
    object-fit: cover;
}
</style>