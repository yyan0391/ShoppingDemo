<template>
  <div>
    <van-nav-bar title="我的购物车" @click-left="goBack" class="custom-title">
      <template #right>
        <span @click="CartManage">管理</span>
      </template>
    </van-nav-bar>
    <van-cell-group inset>
      <van-cell v-for="item in cartGoods" clickable :key="item" :title="item.title">
        <template #left-icon>
          <van-checkbox :name="item" :ref="el => checkboxRefs[index] = el" @click.stop />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- <van-checkbox-group v-model="checked">
      <van-cell-group inset>
        <van-cell v-for="item in cartGoods" clickable :key="item" :title="item.title" @click="toggle(index)">
          <template #left-icon>
            <van-checkbox :name="item" :ref="el => checkboxRefs[index] = el" @click.stop />
          </template>
        </van-cell>
      </van-cell-group>
    </van-checkbox-group> -->

    <footer class="dp-footer">
      <van-submit-bar :price="3050" button-text="结算" @submit="onSubmit">
        <van-checkbox v-model="checked">全选</van-checkbox>
        <template #tip> Some tips, <span @click="onClickLink">全选</span> </template>
      </van-submit-bar>
    </footer>

  </div>
</template>

<script>
export default {
  setup() {
    const onSubmit = () => showToast('Submit');
    const onClickLink = () => showToast('Click Link');
    return {
      onSubmit,
      onClickLink,
    };

  },
  computed: {
    cartGoods() {
      return this.$store.state.cartGoods;
    },
    //商品总价
    amount() {
      let cartGoods = this.$store.state.cartGoods;
      let result = 0;
      cartGoods.forEach(good => {
        result += good.price * good.count;
      })
      return result;
    },
    //合计
    pay() {
      let result = this.amount - this.redPacket;
      if (result >= 49) {
        this.needPostage = false;
      } else {
        this.needPostage = true;
      }
      if (this.needPostage) {
        result += this.postage;
      }
      return result;
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    CartManage() {
      this.$router.push({
        path: '/CartManage',
      })
    },
  },
};
</script>


<style>
.dp-footer {
  width: 100%;
  height: 15%;
  position: fixed;
  bottom: 0;
  left: 0;
  border-top: 1px solid #eee;
  background-color: #fff;
  font-size: 0;

  .van-submit-bar {
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
</style>