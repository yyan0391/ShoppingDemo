<template>
    <header class="home-header">
      <div class="tap-menu" sticky>
        <!-- Vant 的 Tabs -->
        <van-tabs v-model="goodsType" active="{{ active }}">
          <van-tab title="全部" name="全部"></van-tab>
          <van-tab title="水果" name="水果"></van-tab>
          <van-tab title="蔬菜" name="蔬菜"></van-tab>
          <van-tab title="肉蛋" name="肉蛋"></van-tab>
          <van-tab title="速冻" name="速冻"></van-tab>
          <van-tab title="酒饮" name="酒饮"></van-tab>
          <van-tab title="乳品" name="乳品"></van-tab>
          <van-tab title="零食" name="零食"></van-tab>
          <van-tab title="熟食" name="熟食"></van-tab>
        </van-tabs>
      </div>
    </header>
  </template>
  
  <script>
  export default {
    name: "home-header",
    data() {
      return {
        kindToType: {
          全部: 0,
          水果: 1,
          蔬菜: 2,
          肉蛋: 3,
          速冻: 4,
          酒饮: 5,
          乳品: 6,
          零食: 7,
          熟食: 8,
        },
        goodsType: "全部",
      };
    },
    watch: {
      goodsType(newType) {
        this.$store.state.GoodsCurrentSelKind = this.kindToType[newType];
      },
    },
  };
  </script>
  
  <style>
  
  .home-header {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    background-color: #fff;
    z-index: 999;
  
    .top-text {
        padding: 10px 0;
        line-height: 1.5;
    }
  
    .tap-menu {
      /* 添加必要的样式 */
      padding: 0 10px;
    }
  }
  </style>
  