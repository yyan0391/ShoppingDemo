<template>
  <div>
    <van-nav-bar title="我的购物车" @click-left="goBack" class="custom-title">
      <template #right>
        <span @click="CartManage">管理</span>
      </template>
    </van-nav-bar>
    <van-empty v-if="cartGoods.length === 0" description="你还没有添加任何商品哦~">
      <van-button round type="primary" class="bottom-button" @click="GotoHome">挑选商品</van-button>
    </van-empty>

    <van-swipe-cell v-for="item in cartGoods" :key="item.id">

      <template #left>
        <van-button square text="删除" type="danger" class="delete-button" @click="confirmDelete(item)" />
      </template>

      <van-card :title="item.title" :thumb="item.image" :desc="item.description" :price="item.price * item.count">
        <template #footer>
          <van-stepper v-model="item.count" theme="round" button-size="22" />
        </template>
      </van-card>

    </van-swipe-cell>


    <footer class="dp-footer">
      <van-submit-bar 
        :price="amount" 
        :button-disabled="amount === 0" 
        button-text="结算" 
        :button-color="amount === 0 ? '#ccc' : '#ff9900'"
        @submit="onClickCheckOut">
        <van-checkbox v-model="checked">全选</van-checkbox>
        <template #tip> Some tips, <span @click="onClickCheck">全选</span> </template>
      </van-submit-bar>
    </footer>

  </div>
</template>

<script>
import { showConfirmDialog, showToast} from 'vant';

export default {
  name: 'cart',
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
      return result * 100;
    },
    counter() {
      let that = this;
      let cartGoods = this.$store.state.cartGoods;
      let result = 0;
      cartGoods.some(good => {
        if (good.id === that.id) {
          result = good.count;
        }
      });
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
    GotoHome() {
      this.$router.push({
        path: '/Home',
      })
    },
    confirmDelete(item) {
      showConfirmDialog({
        title: '确认删除商品吗？',
        message:
          '一旦删除商品，将不可回退操作。',
        confirmButtonText: '删除',
        cancelButtonText: '再想想',
      })
        .then(() => {
          this.dialogVisible = false;
          this.$store.commit('deleteGoodsFromCart', item.id);
        })
        .catch(() => {
          // on cancel
        });

    },
    onClickCheckOut() {
      if (this.amount > 0) {
        this.$router.push({
        path: '/CheckOut',
      })
      }else {
        showToast('请先选择商品');
      }
      
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
  /* margin-bottom: 65px; */
  border-top: 1px solid #eee;
  background-color: #fff;
  font-size: 0;

  .van-submit-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }
}

.delete-button {
  height: 100%;
  width: 100%;
}
</style>