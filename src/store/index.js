
import { createStore } from 'vuex';
import auth from "./modules/auth";

export default createStore({
  state() {
    return {
    // username: '', // 用户
    isLogin: false,
    userAvatar: '',
    address:[
      {
        id: 1,
        name: '王小明',
        tel: 13568978546,
        province: '广东省',
        city: '广州市',
        county: '天河区',
        address: '花城大道111号',
        isDefault: true,
      },
      {
        id: 2,
        name: '李小丽',
        tel: 13568911546,
        province: '北京市',
        city: '北京市',
        county: '朝阳区',
        address: '朝阳北路111号',
        isDefault: false,
      },
      {
        id: 3,
        name: '张小佳',
        tel: 13568911546,
        province: '上海市',
        city: '上海市',
        county: '浦东新区',
        address: '朝阳北路111号',
        isDefault: false,
      },
    ],
    cartGoods: [], // 添加到购物车中的商品
    cartCounter: 0, // 购物车物品总数
    GoodsCurrentSelKind: 0, // 表示显示全部分类商品
    checkGoods: [],
    checkCounter: 0,
    selectedAddress: null, // 选中的地址
}
  },
  mutations: {
    addGoodsToCart (state, item) {
      item.isInCart = true;
      item.count++;
      state.cartGoods.push(item);
      state.cartCounter++;
    },
    setSelectedAddress(state, address) {
      state.selectedAddress = address; // 更新选中的地址
    },

    addGoodsToCheck (state, item) {
      item.isInCheck = true;
      state.checkGoods.push(item);
      state.checkCounter++;
    },
    // 从选中列表移除商品
  removeGoodsFromCheck(state, itemId) {
    const index = state.checkGoods.findIndex((checkItem) => checkItem.id === itemId);
    if (index !== -1) {
      state.checkCounter -= state.checkGoods[index].count; // 更新选中商品数量
      state.checkGoods.splice(index, 1);
    }
  },
    deleteGoodsFromCart(state, itemId) {
      state.cartCounter--;
      state.cartGoods.some((val, index, Goods) => {
        if (val.id === itemId) {
          val.isInCart = false;
          val.count--;
          Goods.splice(index, 1);
          return true;
        }
      })
      state.checkCounter--;
      state.checkGoods.some((val, index, Goods) => {
        if (val.id === itemId) {
          val.isInCheck = false;
          val.count--;
          Goods.splice(index, 1);
          return true;
        }
      })
    },
    addGoods(state, itemId){
      state.cartCounter++;
      state.cartGoods.some(val => {
        if (val.id === itemId) {
          val.count++
          return true;
        }
      })
    },
    addChecks(state, itemId){
      state.checkCounter++;
      state.checkGoods.some(val => {
        if (val.id === itemId) {
          val.count++
          return true;
        }
      })
    },
    reduceGoods(state, itemId){
      state.cartCounter--;
      state.cartGoods.some(val => {
        if (val.id === itemId) {
          val.count--;
          return true;
        }
      })
    },
    changeCurrentSelKind(state, kind){
      state.GoodsCurrentSelKind = kind;
    },
    login(state, username){
      state.username = username;
      state.isLogin = true;
    },
    logout(state){
      state.isLogin = false;
    },
    addNewAddress(state, newAdd){
      state.address.push(newAdd);
    },
    modifyAddress(state, item){
      state.address[item.index] = item.value;
    },
    deleteAddress(state, index){
      state.address.splice(index, 1);
    }
  },
  modules: {
    auth,
  },
});
