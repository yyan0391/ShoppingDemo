<template>
  <div class="cart-background">
    <van-nav-bar title="我的购物车" @click-left="goBack" class="fix-custom-title">
    </van-nav-bar>
    <div class="cart-content">
      <van-search v-model="searchQuery" placeholder="请输入购物车搜索关键词" show-action shape="round" @search="onSearch"
        @cancel="onCancel" background="#e9e6de" />

      <van-divider content-position="center"
        :style="{ color: '', borderColor: 'grey', padding: '0 16px', fontWeight: 'bold' }">
        购物车商品
      </van-divider>

      <!-- 空购物车提示 -->
      <van-empty v-if="!isLogin || availableSearchResults.length === 0" description="你还没有添加任何商品哦~">
        <van-button round type="primary" class="bottom-button" @click="handleButtonClick">
          {{ isLogin ? "挑选商品" : "未登录，点击登录" }}
        </van-button>
      </van-empty>

      <!-- 商品列表 -->
      <van-row v-else v-for="item in availableSearchResults" :key="item.id" class="cart-item">
        <van-col span="3">
          <van-checkbox :model-value="checkGoods.some((checkItem) => checkItem.id === item.id)"
            @update:model-value="(checked) => onCheckChange(item, checked)" class="custom-checkbox"
            checked-color="#ff5000"></van-checkbox>
        </van-col>
        <van-col span="20">
          <van-swipe-cell>
            <template #right>
              <van-button square text="删除" type="danger" class="delete-button" @click="confirmDelete(item)" />
            </template>
            <van-card @click="GoDetail(item)" :title="item.title" :thumb="item.images[0]" :desc="item.description"
              :price="item.price * item.count">
              <template #tags>
                <van-tag type="warning">单价：¥{{ item.price }}</van-tag>
              </template>
              <template #footer>
                <van-stepper v-model="item.count" theme="round" button-size="22" @change="onStepperChange(item)" @click.stop />
              </template>
            </van-card>
          </van-swipe-cell>
        </van-col>
      </van-row>

      <van-overlay v-model:show="isDoning" z-index="2000">
        <van-loading color="#1989fa" size="30px" type="spinner" vertical>加载中...</van-loading>
      </van-overlay>

      <van-popup v-model:show="showLogin" style="border-radius: 24px;" closeable close-icon="cross"
        close-icon-position="top-right">
        <Login @loginSuccess="handleLoginSuccess" />
      </van-popup>

      <div class="cart">
        <!-- 分隔线 -->
        <van-divider v-if="unavailableGoods.length > 0"
          :style="{ color: 'white', borderColor: 'white', padding: '0 16px', fontWeight: 'bold' }">已下架商品</van-divider>

        <!-- 下架商品列表 -->
        <div v-if="unavailableGoods.length > 0">
          <van-row v-for="item in unavailableGoods" :key="item.id" class="cart-item cart-item-disabled">
            <van-col span="24">
              <van-card :title="item.title" :thumb="item.images[0]" :desc="item.description"
                :price="item.price * item.count" is-link>
                <template #tags>
                  <van-tag type="danger">已下架</van-tag>
                </template>
              </van-card>
            </van-col>
          </van-row>
        </div>
      </div>

    </div>

    <!-- 底部提交栏 -->
    <footer class="dp-footer">
      <van-submit-bar :price="totalPrice" :button-disabled="checkCounter === 0" button-text="结算"
        :button-color="checkCounter === 0 ? '#ccc' : '#ff9900'" @submit="onClickCheckOut">
        <van-checkbox :model-value="isAllChecked" @update:model-value="toggleAllCheck">全选</van-checkbox>
        <template #tip> 已选择 {{ checkCounter }} 件商品 </template>
      </van-submit-bar>
    </footer>
  </div>
</template>


<script>
import { showConfirmDialog, showToast } from "vant";
import { mapState, mapMutations, mapGetters } from "vuex";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Login from "@/components/Login.vue";

export default {
  name: "cart",
  data() {
    return {
      isDoning: false,
      showLogin: false,
      searchQuery: "",
    };
  },
  components: {
    Login,
  },

  computed: {
    ...mapState(["cartGoods", "checkGoods", "checkCounter"]),
    ...mapGetters("auth", ["uid", "isLogin"]),
    totalPrice() {
      return this.checkGoods.reduce((sum, item) => sum + item.price * item.count, 0) * 100;
    },
    isAllChecked() {
      return (
        this.cartGoods.length > 0 &&
        this.cartGoods.every((item) => this.checkGoods.some((checkItem) => checkItem.id === item.id))
      );
    },

    // 搜索结果ƒ
    availableSearchResults() {
      if (!this.searchQuery) {
        return this.availableGoods;
      }
      const query = this.searchQuery.toLowerCase();
      return this.availableGoods.filter((item) =>
        item.title.toLowerCase().includes(query)
      );
    },

    // 上架商品
    availableGoods() {

      return this.cartGoods.filter((item) => item.isAvailable);
    },
    // 下架商品
    unavailableGoods() {
      return this.cartGoods.filter((item) => !item.isAvailable);
    },
  },
  methods: {
    ...mapMutations([
      "addGoodsToCheck",
      "removeGoodsFromCheck",
      "deleteGoodsFromCart",
      "updateGoodsQuantity",
      "refreshCartGoods",
    ]),
    GoDetail(item) {
      this.$router.push({
        path: "/GoodDetail",
        query: { items: JSON.stringify(item) },
      });
    },
    onCheckChange(item, checked) {
      if (checked) {
        this.addGoodsToCheck(item);
      } else {
        this.removeGoodsFromCheck(item.id);
      }
    },
    async onStepperChange(item) {
      if (item.count === 0) {
        this.confirmDelete(item);
      } else {

        await this.updateGoodsQuantity({ itemId: item.id, count: item.count });
      }
    },
    toggleAllCheck(checked) {
      if (checked) {
        this.cartGoods.forEach((item) => {
          if (!this.checkGoods.some((checkItem) => checkItem.id === item.id)) {
            this.addGoodsToCheck(item);
          }
        });
      } else {
        this.cartGoods.forEach((item) => {
          this.removeGoodsFromCheck(item.id);
        });
      }
    },
    async confirmDelete(item) {
      showConfirmDialog({
        title: "确认删除商品吗？",
        message: "一旦删除商品，将不可回退操作。",
        confirmButtonText: "删除",
        cancelButtonText: "再想想",
      })
        .then(async () => {

          const cartRef = doc(db, "cart", this.uid);

          const updatedItems = this.cartGoods.filter((cartItem) => cartItem.id !== item.id);

          this.isDoning = true;
          try {
            await updateDoc(cartRef, { items: updatedItems });
            this.deleteGoodsFromCart(item.id);
            this.$store.commit("refreshCart");
          } catch (error) {
            console.log(error)
          } finally {
            this.isDoning = false;
          }
        })
        .catch(() => {
          // 用户取消操作
        }).finally(() => {
          this.isDoning = false;
        });
    },
    onClickCheckOut() {
      if (this.checkCounter === 0) {
        showToast("请先选择商品");
      } else {
        this.$router.push({
          path: "/CheckOut",
          query: { selectedItems: JSON.stringify(this.checkGoods) },
        });
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    CartManage() {
      this.$router.push({ path: "/CartManage" });
    },
    handleButtonClick() {
      if (this.isLogin) {
        this.$router.push({ path: "/Home" });
      } else {
        this.showLogin = true;
      }

    },
    handleLoginSuccess(user) {
      this.showLogin = false;
    },


  },
};
</script>


<style>
.cart-background {
  background-color: #e9e6de;
  height: 100%;
  width: 100%;
  overflow: auto;
  min-height: 100vh;
}

.cart {
  padding: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  border-radius: 12px;
}

.custom-checkbox {
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

.cart-item-disabled {
  opacity: 0.5;
  pointer-events: none;
  /* 禁止交互 */
}

.cart-content {
  padding-bottom: 100px;
  padding-top: 50px;
}

.fix-custom-title {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
}
</style>