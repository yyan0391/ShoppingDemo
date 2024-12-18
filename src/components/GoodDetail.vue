<template>
    <div>
        <van-nav-bar title="商品详情" left-text="返回" @click-left="goBack" class="custom-title"></van-nav-bar>
        <van-row>
            <img :src="goods.image" alt="商品图片" class="product-image" />
        </van-row>



        <van-cell size="large" style="background-color: red;">
            <template #title>
                <span style="font-weight: bold;font-size: 16px; color: whitesmoke">¥ </span>
                <span style="font-weight: bold; font-size: 24px; color: whitesmoke;">{{ goods.price }}</span>
            </template>
            <template #value>
                <span style="color: whitesmoke;">已售 1万+</span>
            </template>
            <template #label>
                <van-tag plain type="danger" size="medium" style="margin-right: 6px; font-weight: bold;">消费券</van-tag>
                <van-tag plain type="danger" size="medium" style="font-weight: bold;">满300减30</van-tag>
            </template>
        </van-cell>

        <van-cell style="margin: 10px 10px;" :border="false">
            <template #title>
                <span style="font-weight: bold;font-size: 18px;">{{ goods.title }}</span>
            </template>
            <template #label>
                <span style="color: #888; font-size: 14px;">{{ goods.description }}</span>
                <div style="margin-top: 8px;">
                    <van-rate v-model="value" :size="15" color="#ffd21e" void-icon="star" void-color="#eee" />
                    <span style="margin-left: 8px;">{{ value }}.0</span>
                </div>

            </template>
        </van-cell>


        <van-cell icon="logistics" :border="false" value="修改地址" is-link>
            <template #title>
                <span style="font-weight: bold;font-size: 14px; margin-left: 6px; color:green">48小时内发货</span>
            </template>
            <template #label>
                <span style="color: #888; font-size: 14px;margin-left: 6px;">配送方式：免运费</span>
            </template>
        </van-cell>
        <van-cell icon="like-o" :border="false">
            <template #title>
                <span style="font-size: 14px; margin-left: 6px;">100%正品保证｜假一赔四｜7天无理由退换货</span>
            </template>
        </van-cell>




        <footer class="dp-footer">
            <van-action-bar>
                <van-action-bar-icon icon="chat-o" text="客服" color="#ee0a24" />
                <van-action-bar-icon icon="cart-o" :badge="cartCounter" >购物车
                    <!-- <template #badge>
                        <span v-show="cartCounter > 0">{{ cartCounter }}</span>
                    </template> -->
                </van-action-bar-icon>
                <van-action-bar-icon icon="star" text="收藏" color="#ff5000" />
                <van-action-bar-button type="warning" @click="addGoodsToCart" text="加入购物车" />
                <van-action-bar-button type="danger" text="立即购买" />
            </van-action-bar>
        </footer>

    </div>

</template>

<script>

export default {
    name: "GoodDetail",
    data() {
        return {
            value: 3,
            // id: this.$route.params.id,
            // title: this.$route.params.title,
            // description: this.$route.params.description,
            // price: this.$route.params.price,
            // quantity: this.$route.params.quantity,
            // tag: this.$route.params.tag,
            // image: this.$route.params.image,
        };
    },
    computed: {
        cartCounter() {
            return this.$store.state.cartCounter;
        },
        goods() {
            return this.$route.query;
        }
    },

    methods: {
        goBack() {
            this.$router.go(-1);
        },
        addGoodsToCart() {
            let isInCart = this.goods.isInCart;
            
            if (isInCart) {
                this.$store.commit('addGoods', this.goods.id);
                console.log(this.$store.state.cartCounter);
            } else {
                this.$store.commit('addGoodsToCart', this.goods);
            }
        },
        updatedNavImg() {
            //解决主页与详情页切换时，菜单栏无法更新获取当前路由的问题
            this.$store.state.cartCounter++;
            this.$store.state.cartCounter--;
        },

    },

};

</script>
<style>
.dp-footer {
    width: 100%;
    height: 8%;
    position: fixed;
    bottom: 0;
    left: 0;
    border-top: 1px solid #eee;
    background-color: #fff;
    font-size: 0;

    .van-action-bar {
        position: absolute;
        /* 让 van-action-bar 定位在 footer 的顶部 */
        top: 0;
        /* 靠近 footer 的顶部 */
        left: 0;
        width: 100%;
        /* 占满 footer 的宽度 */
        z-index: 1;
        /* 确保它显示在其他内容上方 */
    }
}

.product-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
}

.cell-content {
    margin: 10px;
    background: #fff;
    /* border-radius: 8px; */
    padding: 10px;

}

.logistics-icon {
    font-size: 16px;
    line-height: inherit;
}
</style>