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

    <van-row v-for="item in cartGoods" :key="item.id" class="cart-item">
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
          <van-card :title="item.title" :thumb="item.image" :desc="item.description" :price="item.price * item.count">
            <template #tags>
              <van-tag type="warning">单价：¥{{ item.price }}</van-tag>
            </template>
            <template #footer>
              <van-stepper v-model="item.count" theme="round" button-size="22" @change="onStepperChange(item)" />
            </template>
          </van-card>
        </van-swipe-cell>
      </van-col>
    </van-row>

    <footer class="dp-footer">
      <van-submit-bar :price="totalPrice" :button-disabled="checkCounter === 0" button-text="结算"
        :button-color="checkCounter === 0 ? '#ccc' : '#ff9900'" @submit="onClickCheckOut">
        <van-checkbox
          :model-value="isAllChecked"
          @update:model-value="toggleAllCheck"
        >全选</van-checkbox>
        <template #tip> 已选择 {{ checkCounter }} 件商品 </template>
      </van-submit-bar>
    </footer>
  </div>
</template>

<script>
import { showConfirmDialog, showToast } from 'vant';
import { mapState, mapMutations } from 'vuex';

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
    ...mapState(['cartGoods', 'checkGoods', 'checkCounter']),

    cartGoods() {
      return this.$store.state.cartGoods;
    },

    // 动态计算总价
  totalPrice() {
    return this.checkGoods.reduce((sum, item) => sum + item.price * item.count, 0) * 100;
  },

    // 判断是否全选
  isAllChecked() {
    return (
      this.cartGoods.length > 0 &&
      this.cartGoods.every((item) => this.checkGoods.some((checkItem) => checkItem.id === item.id))
    );
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
    ...mapMutations(['addGoodsToCheck', 'removeGoodsFromCheck', 'deleteGoodsFromCart']),

    // 处理单个商品选中状态变化
    onCheckChange(item) {
  if (this.checkGoods.some((checkItem) => checkItem.id === item.id)) {
    // 如果商品已被选中，则取消选中
    this.$store.commit('removeGoodsFromCheck', item.id);
  } else {
    // 如果商品未被选中，则添加到选中列表
    this.$store.commit('addGoodsToCheck', item);
  }
},

// 数量变化
onStepperChange(item) {
      if (item.count === 0) {
        this.confirmDelete(item);
      }
    },

    toggleAllCheck(checked) {
      if (checked) {
        // 如果当前是部分或全不选，则选中所有商品
        this.cartGoods.forEach((item) => {
          if (!this.checkGoods.some((checkItem) => checkItem.id === item.id)) {
            this.$store.commit('addGoodsToCheck', item);
          }
        });
      } else {
        // 如果当前是全选状态，则取消所有选中
        this.cartGoods.forEach((item) => {
          this.$store.commit('removeGoodsFromCheck', item.id);
        });
      }
    },

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
          this.$store.commit('removeGoodsFromCheck', item.id);
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
      } else {
        showToast('请先选择商品');
      }

    },
  },
};
</script>


<style>
.cart-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  border-radius: 12px;
}

.item-checkbox {
  margin-left: 20px;
}

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

/* .delete-button {
  height: 100%;
  width: 100%;
} */
</style>