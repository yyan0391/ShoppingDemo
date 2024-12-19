<template>
    <div class="home">
        <van-search value="{{ value }}" placeholder="请输入搜索关键词" show-action shape="round" bind:search="onSearch"
            bind:cancel="onCancel" />

        <van-swipe :autoplay="3000" lazy-render>
            <van-swipe-item v-for="image in images" :key="image">
                <img :src="image" class="swipe-image" />
            </van-swipe-item>

        </van-swipe>

        <van-row>
            <HomeColumn />
        </van-row>

        <van-card class="card" v-for="(item, index) in products" :key="item.id" :title="item.title"
            @click="GoDetial(item)" :desc="item.description" :price="item.price" :tag="item.tag" :thumb="item.image">
            <template #tags>
                <van-tag plain type="danger" style="margin-right: 6px;">消费券</van-tag>
                <van-tag plain type="danger">满300减30</van-tag>
            </template>
            <template #footer>
                <div style="display: flex; justify-content: flex-end; align-items: center;">
                    <van-icon name="cart-o" color="#E65100" size="20px"
                        style="border: none; background: transparent; padding: 5px; cursor: pointer;"
                        @click.stop.native=onAddToCart(item) />
                </div>

            </template>
        </van-card>

       


    </div>
</template>

<script>
import HomeColumn from './HomeColumn.vue'
// import product1 from '@/assets/imgs/酒饮.png';
// import product2 from '@/assets/imgs/肉蛋.png';
// import product3 from '@/assets/imgs/零食.png';
import product4 from '@/assets/imgs/IMG_1012.png';
import product5 from '@/assets/imgs/IMG_1013.png';
import product6 from '@/assets/imgs/IMG_1014.png';
import product7 from '@/assets/imgs/IMG_1015.png';
import product8 from '@/assets/imgs/IMG_1016.png';
// import product9 from '@/assets/imgs/蔬菜.png';
// import product10 from '@/assets/imgs/水果.png';
// import product11 from '@/assets/imgs/速冻.png';
import goodsData from '@/assets/goods.json';
import GoodDetail from './GoodDetail.vue';
import { showSuccessToast, showFailToast } from 'vant';

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
            showPopupGoodDetail: false,
            
            products: [],
        }
    },
    computed: {
        cartCounter() {
            return this.$store.state.cartCounter;
        },
        goods() {
            return this.$route.query;
        }
    },
    created() {
        this.products = goodsData.products;
    },
    components: {
        HomeColumn
    },
    methods: {
        onSearch(value) {
            this.$router.push({ path: '/search', query: { keyword: value } })
        },
        onCancel() {
            this.$router.push({ path: '/' })
        },
        GoDetial(item) {
            this.$router.push({
                path: '/GoodDetail',
                query: {
                    items: JSON.stringify(item),
                },
                // state: { item: item }
                // query: {
                //     id: item.id,
                //     title: item.title,
                //     description: item.description,
                //     price: item.price,
                //     quantity: item.quantity,
                //     tag: item.tag,
                //     image: item.image,
                // }
            })
        },
        onAddToCart(item) {
            let isInCart = item.isInCart;
            console.log(this.$store.state.cartGoods);
            if (isInCart) {
                this.$store.commit('addGoods', item.id);
                showSuccessToast('添加购物车成功');
            } else {
                this.$store.commit('addGoodsToCart', item);
                showSuccessToast('添加购物车成功');
            }
        },
    }
}
</script>

<style>
.home {
    width: 100%;
    /* padding: 16px; */
    /* padding-bottom: 5px;
  padding-top: 5px; */
}

.card {
    margin: 5%;
}

.swipe-image {
    width: 100%;
    height: auto;
    object-fit: cover;
    /* 保持图片比例，填充容器 */
}
</style>