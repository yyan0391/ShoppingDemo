<template>
    <div>
        <van-nav-bar title="商品详情" left-text="返回" left-arrow @click-left="goBack" class="custom-title"></van-nav-bar>
<div class="goods-photo-row">
        <van-row >
            <van-swipe ref="swipe" :autoplay="3000" class="" >
                <van-swipe-item v-for="image in images" :key="image" class="detail-images">
                    <van-image :src="image" class="product-image"  fit="cover" width="100%"
                    height="100%" />
                </van-swipe-item>     
            </van-swipe>
        </van-row>

        <van-cell size="large" style="background-color: red;">
            <template #title>
                <span style="font-weight: bold;font-size: 16px; color: whitesmoke">¥ </span>
                <span style="font-weight: bold; font-size: 24px; color: whitesmoke;">{{ items.price }}</span>
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
                <span style="font-weight: bold;font-size: 18px;">{{ items.title }}</span>
            </template>
            <template #label>
                <span style="color: #888; font-size: 14px;">{{ items.description }}</span>
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

        <!-- 商品详情图片展示 -->
        <van-divider>商品详情</van-divider>
        <van-row class="detail-images">
            <img v-for="(image, index) in items.productDetailImages" :key="index" :src="image" class="detail-image" />
        </van-row>


        <van-divider class="footer">没有更多了</van-divider>




        <footer class="gd-footer">
            <van-action-bar>
                <van-action-bar-icon icon="service-o" text="客服" color="#ee0a24" />
                <van-action-bar-icon icon="cart-o" :badge="cartCounter" @click="GoToCart">购物车

                </van-action-bar-icon>
                <van-action-bar-icon 
                    :icon="isFavorite ? 'star' : 'star-o'" 
                    :text="isFavorite ? '已收藏' : '收藏'"  
                    color="#ff5000"
                    @click="toggleFavorite" />
                <van-action-bar-button type="warning" @click="addGoodsToCart" text="加入购物车" />
                <van-action-bar-button type="danger" text="立即购买" />
            </van-action-bar>
        </footer>
</div>
    </div>

</template>

<script>
import { showSuccessToast, showFailToast, showToast } from 'vant';
import { nextTick } from 'vue';
import { doc, setDoc, deleteDoc,getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default {
    name: "GoodDetail",
    data() {
        return {
            value: 3,
            items: JSON.parse(this.$route.query.items || '[]'),
            images: [],
            isFavorite: false,
        };
    },
    async created() {
        await this.checkFavorite();
    },
    computed: {
        images() {
            return this.items.images;
        },
        cartCounter() {
            return this.$store.state.cartCounter;
        },
        goods() {
            return this.$route.query;
        }
    },
    mounted() {
        this.refreshSwipe();
    },

    methods: {
        refreshSwipe() {
            nextTick(() => {
                const swipeInstance = this.$refs.swipe;
                if (swipeInstance && swipeInstance.update) {
                    swipeInstance.update(); // 重新计算滑动区域
                }
            });
        },
        goBack() {
            this.$router.go(-1);
        },
        addGoodsToCart() {
            let isInCart = this.items.isInCart;

            if (isInCart) {
                this.$store.commit('addGoodsToCart', this.items.id);
                showSuccessToast('添加购物车成功');
            } else {
                this.$store.commit('addGoodsToCart', this.items);
                showSuccessToast('添加购物车成功');
            }
        },
        updatedNavImg() {
            //解决主页与详情页切换时，菜单栏无法更新获取当前路由的问题
            this.$store.state.cartCounter++;
            this.$store.state.cartCounter--;
        },
        GoToCart() {
            this.$router.push({
                path: '/cart',
            })
        },
        async toggleFavorite() {
            const userId = this.$store.state.auth?.user?.uid;
            if (!userId) {
                showToast("请先登录");
                return;
            }
            const favoriteRef = doc(db, `users/${userId}/favorites`, this.items.id);
            try {
                if (this.isFavorite) {
                    // 取消收藏
                    await deleteDoc(favoriteRef);
                    this.isFavorite = false;
                    showToast("已取消收藏");
                } else {
                    // 添加收藏
                    const favoriteData = {
                        productId: this.items.id,
                        title: this.items.title,
                        description: this.items.description,
                        price: this.items.price,
                        images: this.items.images,
                        productDetailImages: this.items.productDetailImages,
                        createdAt: new Date(),
                    };
                    await setDoc(favoriteRef, favoriteData);
                    this.isFavorite = true;
                    showToast("收藏成功");
                }
            } catch (error) {
                console.error("收藏操作失败：", error);
            }
        },
        async checkFavorite() {
            const userId = this.$store.state.auth?.user?.uid;
            if (!userId) {
                return;
            }

            const favoriteRef = doc(db, `users/${userId}/favorites`, this.items.id);
            const favoriteSnap = await getDoc(favoriteRef);

            if (favoriteSnap.exists()) {
                this.isFavorite = true;
            }
        },


    },

};

</script>
<style>
.gd-footer {
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

.photo-row {
    height: auto;
    width: 100%;
    /* position: relative; */
}

.van-swipe {
    height: 100%;
}

.van-swipe-item {
  width: 100%; 
  height: 100%;
  justify-content: center;
  align-items: center;
}

.product-image {
    width: 100%;
    height: auto;
    object-fit: cover;
    justify-content: center;
}

.cell-content {
    margin: 10px;
    background: #fff;
    padding: 10px;

}

.logistics-icon {
    font-size: 16px;
    line-height: inherit;
}

.detail-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
}

.detail-image {
    width: 100%;
    height: auto;
}

.footer {
    text-align: center;
    color: #999;
    /* 浅灰色文字 */
    font-size: 14px;
    padding: 10px 0;
    margin-top: auto;
    /* 将底部标注固定在页面底部 */
    line-height: 2;
    border-top: 1px solid #e0e0e0;
}

.custom-title {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100%;
}
.goods-photo-row {
    margin-top: 50px;
}
</style>