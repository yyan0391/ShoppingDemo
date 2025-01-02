<template>
    <div style="margin-top: 40px;background-color: beige; min-height: 100vh;">
        <van-nav-bar title="订单详情" left-arrow @click-left="this.$router.push({ path: '/home', })"
            class="custom-title"></van-nav-bar>
        <van-divider />
        <div class="order-content">
            <van-cell-group inset>
            <van-cell>
                <template #title>
                    <van-icon name="location-o" style="margin-right: 8px;" size="18px" />
                    <span style="font-weight: bold;">{{ order?.address.name }} {{ order?.address.address }}</span>
                </template>
                <template #label>
                    <span>{{ order?.address.tel }}</span>
                </template>
            </van-cell>
        </van-cell-group>
        </div>

        <div class="order-content">
            <van-cell-group inset>
                <van-cell title="订单编号">
                    <template #value>{{ orderId }}</template>
                </van-cell>
                <van-cell title="创建时间">
                    <template #value>{{ order?.createdAt.toDate().toLocaleString() }}</template>
                </van-cell>
                <van-cell title="支付方式">
                    <template #value>{{ order?.paymentMethod }}</template>
                </van-cell>
                <van-cell title="配送方式">
                    <template #value>{{ order?.shippingMethod }}</template>
                </van-cell>
            </van-cell-group>
        </div>

        <div class="order-content">

        <div class="order-items">
                <!-- <h4>订单商品</h4> -->
                <van-card v-for="(item, index) in order?.items" :key="index" :title="item.title" :thumb="item.images[0]"
                    :desc="item.description" :price="item.price * item.count" :num="item.count" class="card">
                    <template #tags>
                        <van-tag type="default">单价：¥{{ item.price }}</van-tag>
                    </template>
                </van-card>
            </div>

            <van-cell-group inset>
                <van-cell title="商品总价">
                    <template #value>¥ {{ order?.totalPrice }}</template>
                </van-cell>
                <van-cell title="优惠金额">
                    <template #value>¥ {{ order?.discount }}</template>
                </van-cell>
                <van-cell title="运费">
                    <template #value>¥ {{ order?.shippingFee }}</template>
                </van-cell>
                <van-cell title="合计金额">
                    <template #value style="font-weight: bold; color: red;">¥ {{ order?.finalAmount }}</template>
                </van-cell>
            </van-cell-group>
      

            

            
        </div>
        <van-divider></van-divider>
    </div>
</template>
<script>
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { mapGetters } from "vuex";

export default {
    name: 'OrderDetail',
    props: {
        orderData: {
            type: Object,
            default: null,
        }
    },
    data() {
        return {
            order: this.orderData || null,
            orderId: this.$route.params.orderId || this.orderData?.id || "", // 从路由或传递的 props 获取订单 ID
        };
    },

    async created() {
        if (!this.order && this.orderId) {
            await this.fetchOrderDetail(); // 如果没有传入订单数据，则从 Firestore 加载
        }
    },

    computed: {
        ...mapGetters("auth", ["username", "isLogin", "uid"]),
    },

    methods: {

        async fetchOrderDetail() {
            try {
                const userUid = this.uid;
                const orderDoc = doc(db, `users/${userUid}/orders/${this.orderId}`);
                const orderSnapshot = await getDoc(orderDoc);

                if (orderSnapshot.exists()) {
                    this.order = orderSnapshot.data();
                } else {
                    this.$router.push("/404"); // 如果订单不存在，跳转到 404 页面
                }
            } catch (error) {
                console.error("获取订单详情失败：", error);
                this.$router.push("/error"); // 跳转到错误页面
            }
        },
    },

};

</script>
<style>
.order-content {
    padding-top: 10px;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 20px;
}
</style>