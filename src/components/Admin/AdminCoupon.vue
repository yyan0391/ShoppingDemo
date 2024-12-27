<template>
  <div>
    <van-nav-bar title="优惠券管理" @click-left="goBack" left-arrow left-text="返回" class="custom-title">
      <template #right>
        <span @click="goEditInfo">编辑</span>
      </template>
    </van-nav-bar>
  </div>
</template>

<script>
export default {
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    goEditInfo() {
      this.$router.push({ path: '/editInfo' });
    }
  }
}

</script>

<style> </style>