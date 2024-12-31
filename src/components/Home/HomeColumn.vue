<template>
    <header class="home-header">
      <div class="tap-menu" sticky>
        <!-- Vant 的 Tabs -->
        <van-tabs v-model="goodsType" active="{{ active }}" @change="onTabChange">
          <van-tab title="ALL" name="ALL"></van-tab>
          <van-tab title="MUSIC" name="MUSIC"></van-tab>
          <van-tab title="PHOTO" name="PHOTO"></van-tab>
          <van-tab title="CONCERT" name="CONCERT"></van-tab>
          <van-tab title="LIVING" name="LIVING"></van-tab>
          <van-tab title="STATIONARY" name="STATIONARY"></van-tab>
          <van-tab title="FASHION" name="FASHION"></van-tab>
        </van-tabs>
      </div>
    </header>
  </template>
  
  <script>
  export default {
    name: "home-header",
    props: {
      products: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        goodsType: "ALL",
      };
    },
    methods: {
      onTabChange(tab) {
        this.goodsType = tab.name;
        this.$emit("filterChanged", tab);
      },
    },
  };
  </script>
  
  <style>
  
  .home-header {
    left: 0;
    top: 0;
    width: 100%;
    background-color: #fff;
    z-index: 999;
  }
  </style>
  