<template>
  <div>
    <van-nav-bar title="管理商品" left-text="返回" right-text="全选" @click-right="selectAll" left-arrow @click-left="goBack"
      class="custom-title"></van-nav-bar>
    <van-overlay v-model:show="isDoing" z-index="9000">
      <van-loading color="#1989fa" size="30px" type="spinner" vertical>加载中...</van-loading>
    </van-overlay>
    <div class="admin-edit-content">
      <van-tabs v-model="activeTab" sticky>
        <van-tab :title="`已上架 (${availableProducts.length})`">
          <van-empty v-if="availableProducts.length === 0" description="暂无已上架商品">
            <van-button round type="primary" class="bottom-button" @click="handleButtonClick">
              添加商品
            </van-button>
          </van-empty>
          <van-row v-else v-for="item in availableProducts" :key="item.id" class="cart-item">
            <van-col span="3">
              <van-checkbox v-model="item.checked" class="item-checkbox" @change="onCheckChange"></van-checkbox>
            </van-col>
            <van-col span="20">
              <van-card @click="GoDetail(item)" :title="item.title" :thumb="item.images[0]" :desc="item.description"
                :price="item.price" :num="item.quantity">
                <template #tags>
                  <van-tag type="warning">单价：¥{{ item.price }}</van-tag>
                </template>
              </van-card>
            </van-col>
          </van-row>

          <van-grid column-num="3" class="admin-bottom-buttons" border="false">
            <van-grid-item icon="down" :disabled="selectedItems.length === 0"
              :class="{ disabled: selectedItems.length === 0 }" @click="deleteSelected(false)" text="下架" />
            <van-grid-item icon="edit" :disabled="selectedItems.length !== 1"
              :class="{ disabled: selectedItems.length !== 1 }" @click="updateSelected" text="修改" />
            <van-grid-item icon="coupon-o" :disabled="selectedItems.length === 0"
              :class="{ disabled: selectedItems.length === 0 }" @click="showCoupon = true" text="优惠券权限" />
          </van-grid>

          <van-popup v-model:show="showCoupon" round position="bottom" style="height: 80%;">
            <van-nav-bar title="选择优惠券" left-arrow @click-left="showCoupon = false" />

            <!-- 使用 van-checkbox -->
            <van-checkbox-group v-model="selectedCoupons">
              <van-cell-group inset>
                <van-cell v-for="coupon in coupons" :key="coupon.id" clickable >
                  <template #title>
                    <div>{{ coupon.name }} ({{ coupon.valueDesc }}{{ coupon.unitDesc }})</div>
                    <van-tag type="primary">满 {{ coupon.originCondition }} {{ coupon.unitDesc }}可用</van-tag>
                  </template>
                  <template #label>
                    <div>开始时间：{{ coupon.startAtFormatted }}</div>
                    <div>结束时间：{{ coupon.endAtFormatted }}</div>
                  </template>
                  <template #right-icon>
                    <van-checkbox :name="coupon.id" @click.stop/>
                  </template>
                </van-cell>
              </van-cell-group>
            </van-checkbox-group>
            <van-button type="primary" block @click="assignCoupons">配置</van-button>

          </van-popup>


        </van-tab>
        <van-tab :title="`下架商品 (${unavailableProducts.length})`">
          <van-empty v-if="unavailableProducts.length === 0" description="暂无下架商品">
          </van-empty>
          <van-row v-else v-for="item in unavailableProducts" :key="item.id" class="cart-item">
            <van-col span="3">
              <van-checkbox v-model="item.checked" class="item-checkbox" @change="onCheckChange"></van-checkbox>
            </van-col>
            <van-col span="20">
              <van-card :title="item.title" :thumb="item.images[0]" :desc="item.description" :price="item.price"
                :num="item.quantity">
                <template #tags>
                  <van-tag type="danger">下架商品</van-tag>
                </template>
              </van-card>
            </van-col>
          </van-row>

          <van-grid column-num="2" class="admin-bottom-buttons" border="false">
            <van-grid-item icon="back-top" :disabled="selectedItems.length === 0"
              :class="{ disabled: selectedItems.length === 0 }" @click="deleteSelected(true)" text="上架" />
            <van-grid-item icon="delete" :disabled="selectedItems.length === 0"
              :class="{ disabled: selectedItems.length === 0 }" @click="deleteForever" text="永久删除" />
          </van-grid>



        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/firebaseConfig";
import { showToast } from "vant";
import { ref, deleteObject } from "firebase/storage";
import { showConfirmDialog } from "vant";

export default {
  name: "AdminEditGoods",

  data() {
    return {
      checkGoods: [],
      products: [],
      selectedItems: [],
      isDoing: false,
      activeTab: 0,
      showCoupon: false,
      coupons: [], // 存储所有优惠券
      selectedCoupons: [], // 存储选中的优惠券
    };
  },
  computed: {
    ...mapGetters("auth", ["username", "isLogin"]),
    // 筛选已上架商品
    availableProducts() {
      return this.products.filter((product) => product.isAvailable);
    },
    // 筛选下架商品
    unavailableProducts() {
      return this.products.filter((product) => !product.isAvailable);
    },
  },
  async created() {
    await this.fetchProducts(); // 在页面创建时获取商品数据
    await this.fetchCoupons();
  },
  methods: {
    async fetchCoupons() {
      try {
        const querySnapshot = await getDocs(collection(db, "coupons"));
        this.coupons = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("获取优惠券失败：", error);
      }
    },
    GoDetail(item) {
      console.log(item);
      this.$router.push({
        path: "/GoodDetail",
        query: {
          items: JSON.stringify(item),
        },
      });
    },

    async fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products")); // 从 Firestore 获取商品数据
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id, // 商品 ID
          ...doc.data(), // 商品数据
        }));

        this.products = fetchedProducts.map((product) => ({
          ...product,
          images: product.images && product.images.length ? product.images : ["https://via.placeholder.com/150"], // 确保至少有一张默认图片
        }));
        this.spinner = false;
      } catch (error) {
        console.error("获取商品失败：", error);
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    onCheckChange() {
      this.updateSelectedItems();
    },
    handleButtonClick() {
      this.$router.push({ path: "/AdminUploadGoods" });
    },
    selectAll() {
      const allSelected = this.products.every((product) => product.checked);
      this.products.forEach((product) => (product.checked = !allSelected));
      this.updateSelectedItems();
    },
    updateSelectedItems() {
      this.selectedItems = this.products.filter((product) => product.checked);
    },

    // 下架/上架商品
    async deleteSelected(isAvailable) {
      if (this.selectedItems.length === 0) {
        showToast("请先选择至少一个商品");
        return;
      }
      this.isDoing = true;
      try {
        for (const item of this.selectedItems) {
          // 更新 Firebase 中商品的可用性状态
          const productRef = doc(db, "products", item.id);
          await updateDoc(productRef, { isAvailable });

          // 更新 Firebase 中所有用户购物车 `cart` 集合中的商品状态
          const cartSnapshot = await getDocs(collection(db, "cart"));
          for (const userCart of cartSnapshot.docs) {
            const cartData = userCart.data();
            const updatedItems = cartData.items.map((cartItem) => {
              if (cartItem.id === item.id) {
                return { ...cartItem, isAvailable }; // 更新商品的 `isAvailable`
              }
              return cartItem;
            });
            // 更新用户购物车
            await updateDoc(doc(db, "cart", userCart.id), { items: updatedItems });
          }
        }
        // 更新本地数据
        this.products = this.products.map((product) => {
          if (this.selectedItems.some((item) => item.id === product.id)) {
            product.isAvailable = isAvailable;
          }
          return product;
        });
        this.updateSelectedItems();
        showToast(isAvailable ? "商品已上架" : "商品已下架");
      } catch (error) {
        console.error(isAvailable ? "上架商品失败：" : "下架商品失败：", error);
      } finally {
        this.isDoing = false;
        this.$store.commit("refreshCart");
      }
    },

    // 永久删除商品
    async deleteForever() {
      showConfirmDialog({
        title: "确认删除商品吗？",
        message: "一旦删除商品，将不可回退操作。",
        confirmButtonText: "删除",
        cancelButtonText: "再想想",
      }).then(async () => {
        if (this.selectedItems.length === 0) {
          showToast("请先选择至少一个商品");
          return;
        }
        this.isDoing = true;
        try {
          for (const item of this.selectedItems) {
            // 删除 Firebase Storage 中商品的所有图片
            await this.deleteProductImages(item);

            // 删除 `products` 集合中的商品
            const productRef = doc(db, "products", item.id);
            await deleteDoc(productRef);

            // 删除 Firebase 中所有用户购物车中的对应商品
            const cartSnapshot = await getDocs(collection(db, "cart"));
            for (const userCart of cartSnapshot.docs) {
              const cartData = userCart.data();
              const updatedItems = cartData.items.filter((cartItem) => cartItem.id !== item.id);
              // 更新用户购物车
              await updateDoc(doc(db, "cart", userCart.id), { items: updatedItems });
            }
          }

          // 更新本地数据
          this.products = this.products.filter(
            (product) => !this.selectedItems.some((item) => item.id === product.id)
          );

          this.updateSelectedItems();
          showToast("商品已永久删除");
        } catch (error) {
          console.error("永久删除商品失败：", error);
        } finally {
          this.isDoing = false;
          this.$store.commit("refreshCart");
        }
      })
    },

    assignCoupons() {
      if (this.selectedCoupons.length === 0) {
        showToast("请先选择至少一个优惠券");
        return;
      }

      this.isDoing = true;

      Promise.all(
        this.selectedItems.map(async (item) => {
          const productRef = doc(db, "products", item.id);
          const assignedCoupons = this.selectedCoupons.map((couponId) =>
            this.coupons.find((coupon) => coupon.id === couponId)
          );
          await updateDoc(productRef, { coupons: assignedCoupons });
        })
      )
        .then(() => {
          showToast("优惠券权限配置成功");
          this.showCouponPopup = false;
        })
        .catch((error) => {
          console.error("优惠券权限配置失败：", error);
          showToast("配置失败，请稍后重试");
        })
        .finally(() => {
          this.isDoing = false;
        });
    },

    async deleteProductImages(item) {
      try {
        // 删除商品主图片
        if (item.images && item.images.length > 0) {
          for (let i = 0; i < item.images.length; i++) {
            const imageUrl = item.images[i];
            const fileRef = ref(storage, decodeURIComponent(imageUrl.split("?")[0].split("/o/")[1]));
            try {
              await deleteObject(fileRef);
              console.log(`主图片删除成功: ${imageUrl}`);
            } catch (error) {
              console.error(`删除主图片失败: ${imageUrl}`, error);
            }
          }
        }

        // 删除商品详情图片
        if (item.productDetailImages && item.productDetailImages.length > 0) {
          for (let i = 0; i < item.productDetailImages.length; i++) {
            const detailImageUrl = item.productDetailImages[i];
            const fileRef = ref(storage, decodeURIComponent(detailImageUrl.split("?")[0].split("/o/")[1]));
            try {
              await deleteObject(fileRef);
              console.log(`详情图片删除成功: ${detailImageUrl}`);
            } catch (error) {
              console.error(`删除详情图片失败: ${detailImageUrl}`, error);
            }
          }
        }
      } catch (error) {
        console.error("删除商品图片时发生错误：", error);
      }
    },
    async updateSelected() {
      if (this.selectedItems.length !== 1) {
        showToast("只能选择一个商品进行修改");
        return;
      }
      const selectedItem = this.selectedItems[0];
      this.$router.push({
        path: "/AdminUpdateGoods",
        query: {
          item: JSON.stringify(selectedItem), // 将选中商品数据传递给修改页面
        },
      });
    },


  },
}
</script>

<style>
.admin-bottom-buttons {
  position: fixed !important;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 10;
  padding: 10px 0;
}


.item-checkbox {
  margin-left: 20px;
}

.admin-edit-content {
  padding: 10px;
  margin-top: 35px;
}

.disabled {
  color: #999 !important;
  /* 图标和文字颜色变灰 */
  pointer-events: none;
  /* 禁止点击事件 */
  opacity: 0.6;
  /* 透明度降低 */
}
</style>