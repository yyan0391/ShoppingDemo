<template>
  <div>
    <van-nav-bar title="编辑商品" left-text="返回" left-arrow @click-left="goBack" class="custom-title"></van-nav-bar>

    <!-- 商品列表 -->
    <van-empty v-if="cartGoods.length === 0" description="你还没有添加任何商品">
      <van-button
        round
        type="primary"
        class="bottom-button"
        @click="handleButtonClick"
      >
        添加商品
      </van-button>
    </van-empty>
    <van-row v-else v-for="item in cartGoods" :key="item.id" class="cart-item">
      <van-col span="3">
        <van-checkbox
          :model-value="checkGoods.some((checkItem) => checkItem.id === item.id)"
          @update:model-value="(checked) => onCheckChange(item, checked)"
          class="item-checkbox"
        ></van-checkbox>
      </van-col>
      <van-col span="20">
        <van-swipe-cell>
          <template #right>
            <van-button square text="删除" type="danger" class="delete-button" @click="confirmDelete(item)" />
          </template>
          <van-card :title="item.title" :thumb="item.images[0]" :desc="item.description"
            :price="item.price * item.count">
            <template #tags>
              <van-tag type="warning">单价：¥{{ item.price }}</van-tag>
            </template>
            <template #footer>
              <van-stepper
                v-model="item.count"
                theme="round"
                button-size="22"
                @change="onStepperChange(item)"
              />
            </template>
          </van-card>
        </van-swipe-cell>
      </van-col>
    </van-row>
    
  </div>

</template>

<script>
export default {
  name: "AdminEditGoods",
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    handleButtonClick() {
      this.$router.push({ name: "AdminUploadGoods" });
    },
  },
  data() {
    return {
      cartGoods: [],
      checkGoods: [],
    };
  },
  computed: {
    ...mapState(["cartGoods", "checkGoods", "checkCounter"]),
  },
}
</script>

<style>
</style>