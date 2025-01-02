<template>

    <div>
<van-nav-bar title="我的订单" left-arrow @click-left="$router.go(-1)" />

<div class="order-list">
      <van-card
        v-for="(order, index) in orders"
        :key="index"
        :title="'订单编号: ' + order.id"
        :thumb="order.items[0]?.images[0]"
        :desc="'支付方式: ' + order.paymentMethod"
        :price="'总价: ¥' + order.finalAmount"
        class="card"
        @click="goToOrderDetail(order)"
      >
        <template #tags>
          <van-tag type="success">支付成功</van-tag>
        </template>
      </van-card>
    </div>

    </div>

</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default {
  name: "OrderList",
  data() {
    return {
      orders: [],
    };
  },
  async created() {
    await this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        const userUid = this.$store.state.auth.user.uid;
        const ordersCollection = collection(db, `users/${userUid}/orders`);
        const ordersSnapshot = await getDocs(ordersCollection);

        this.orders = ordersSnapshot.docs.map((doc) => ({
          id: doc.id, // 订单 ID
          ...doc.data(),
        }));
      } catch (error) {
        console.error("获取订单列表失败：", error);
      }
    },
    goToOrderDetail(order) {
      this.$router.push({
        path: `/OrderDetail/${order.id}`,
        query: { orderData: JSON.stringify(order) }, // 将订单信息传递到详情页
      });
    },
  },
};

</script>

<style>
</style>