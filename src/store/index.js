import { createStore } from 'vuex';
import auth from "./modules/auth";
import { doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export default createStore({
  state() {
    return {
      isLogin: false,
      userAvatar: '',
      addresses: [], 
      cartGoods: [], // 购物车中的商品
      cartCounter: 0, // 购物车物品总数
      GoodsCurrentSelKind: 0, // 表示显示全部分类商品
      checkGoods: [], // 已选中商品
      checkCounter: 0, // 已选中商品数量
      selectedAddress: null, // 选中的地址
    };
  },
  mutations: {
    async refreshCart(state) {
      const userId = state.auth?.user?.uid;
      if (!userId) {
        console.error("未登录，无法加载购物车");
        return;
      }
  
      const cartRef = doc(db, "cart", userId);
      const docSnap = await getDoc(cartRef);
  
      if (docSnap.exists()) {
        state.cartGoods = docSnap.data().items;
        state.cartCounter = state.cartGoods.reduce((sum, item) => sum + item.count, 0);
      } else {
        state.cartGoods = [];
        state.cartCounter = 0;
      }
    },
    // 添加商品到购物车
    async addGoodsToCart(state, item) {
      const userId = state.auth?.user?.uid;
      if (!userId) {
        console.error("未登录，无法添加商品到购物车");
        return;
      }

      const cartRef = doc(db, "cart", userId);
      const docSnap = await getDoc(cartRef);

      const newItem = { ...item, count: 1 };
      if (docSnap.exists()) {
        // 更新购物车商品
        const cartData = docSnap.data();
        const existingItem = cartData.items.find((cartItem) => cartItem.id === item.id);

        if (existingItem) {
          existingItem.count += 1;
        } else {
          cartData.items.push(newItem);
        }
        await updateDoc(cartRef, { items: cartData.items });
        state.cartGoods = cartData.items;
      } else {
        // 创建新的购物车
        const newCart = { uid: userId, items: [newItem] };
        await setDoc(cartRef, newCart);
        state.cartGoods = newCart.items;
      }

      state.cartCounter = state.cartGoods.reduce((sum, cartItem) => sum + cartItem.count, 0);
    },

    setSelectedAddress(state, address) {
      state.selectedAddress = address;
    },

    // 添加商品到选中列表
    addGoodsToCheck(state, item) {
      item.isInCheck = true;
      state.checkGoods.push(item);
      state.checkCounter++;
    },

    // 从选中列表移除商品
    removeGoodsFromCheck(state, itemId) {
      const index = state.checkGoods.findIndex((checkItem) => checkItem.id === itemId);
      if (index !== -1) {
        state.checkCounter -= state.checkGoods[index].count;
        state.checkGoods.splice(index, 1);
      }
    },

    // 从购物车中删除商品
    async deleteGoodsFromCart(state, itemId) {
      const userId = state.auth?.user?.uid;
      if (!userId) {
        console.error("未登录，无法删除购物车商品");
        return;
      }

      const cartRef = doc(db, "cart", userId);
      const docSnap = await getDoc(cartRef);

      if (docSnap.exists()) {
        const cartData = docSnap.data();
        cartData.items = cartData.items.filter((cartItem) => cartItem.id !== itemId);
        await updateDoc(cartRef, { items: cartData.items });

        state.cartGoods = cartData.items;
        state.cartCounter = state.cartGoods.reduce((sum, cartItem) => sum + cartItem.count, 0);
      }

      // 从选中列表中删除
      this.commit('removeGoodsFromCheck', itemId);
    },

    // 更新商品数量
    async updateGoodsQuantity(state, { itemId, count }) {
      const userId = state.auth?.user?.uid;
      if (!userId) {
        console.error("未登录，无法更新商品数量");
        return;
      }

      const cartRef = doc(db, "cart", userId);
      const index = state.cartGoods.findIndex((item) => item.id === itemId);

      if (index !== -1) {
        state.cartGoods[index].count = count;
        await setDoc(cartRef, { items: state.cartGoods });

        state.cartCounter = state.cartGoods.reduce((sum, item) => sum + item.count, 0);
      }
    },

    // 初始化购物车
    async initializeCart(state) {
      const userId = state.auth?.user?.uid;
      if (!userId) {
        console.error("未登录，无法加载购物车");
        return;
      }

      const cartRef = doc(db, "cart", userId);
      const docSnap = await getDoc(cartRef);

      if (docSnap.exists()) {
        state.cartGoods = docSnap.data().items;
        state.cartCounter = state.cartGoods.reduce((sum, item) => sum + item.count, 0);
      } else {
        state.cartGoods = [];
        state.cartCounter = 0;
      }
    },

    // 其他状态更新方法
    addGoods(state, itemId) {
      const item = state.cartGoods.find((item) => item.id === itemId);
      if (item) {
        item.count++;
        state.cartCounter++;
      }
    },

    addChecks(state, itemId) {
      const item = state.checkGoods.find((item) => item.id === itemId);
      if (item) {
        item.count++;
        state.checkCounter++;
      }
    },

    reduceGoods(state, itemId) {
      const item = state.cartGoods.find((item) => item.id === itemId);
      if (item && item.count > 0) {
        item.count--;
        state.cartCounter--;
      }
    },

    changeCurrentSelKind(state, kind) {
      state.GoodsCurrentSelKind = kind;
    },

    login(state, username) {
      state.username = username;
      state.isLogin = true;
    },

    logout(state) {
      state.isLogin = false;
      state.username = null;
      state.cartGoods = []; // 清空购物车
      state.cartCounter = 0; // 重置购物车物品总数
      state.checkGoods = []; // 清空选中商品
      state.checkCounter = 0; // 重置选中商品数量
      console.log('已退出登录'+state.cartCounter);
    },
  },
  modules: {
    auth,
  },
});