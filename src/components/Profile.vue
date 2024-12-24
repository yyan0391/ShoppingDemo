<template>
  <div class="profile">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="个人中心">
      <!-- 右上角通知按钮 -->
      <template #right>
        <van-icon name="chat-o" badge="9" @click="handleNotification" style="font-size: 22px;"/>
        <!-- <van-icon name="bell-o" @click="handleNotification" /> -->
      </template>
    </van-nav-bar>

    <!-- 头像和用户名 -->
    <div class="profile-header" @click="checkLogin">
      <van-image
        round
        width="80px"
        height="80px"
        :src="isLogin ? userAvatar : defaultAvatar"
      />
      <!-- <p class="username">{{ isLogin ? username : '未登录，立即登录' }}</p> -->
      <p class="username">{{ username }}</p>
    </div>


    <van-popup v-model:show="showLogin"  style="border-radius: 24px;" closeable close-icon="cross" close-icon-position="top-right">
      <Login @loginSuccess="handleLoginSuccess" />
    </van-popup>

    <div class="profile-content">
    <div class="section">
    <!-- 快捷功能区域 -->
    <van-row class="profile-row">
      <van-col span="8" @click="handleOrder">
        <van-icon name="orders-o" />
        <p>我的订单</p>
      </van-col>
      <van-col span="8" @click="handleFavorite">
        <van-icon name="star-o" />
        <p>我的收藏</p>
      </van-col>
      <van-col span="8" @click="handleAddress">
        <van-icon name="location-o" />
        <p>我的地址</p>
      </van-col>
    </van-row>

    <van-row class="profile-row">
      <van-col span="8" @click="handleCoupon">
        <van-icon name="coupon-o" />
        <p>优惠券</p>
      </van-col>
      <van-col span="8" @click="handleWallet">
        <van-icon name="balance-o" />
        <p>钱包</p>
      </van-col>
      <van-col span="8" @click="handleHistory">
        <van-icon name="clock-o" />
        <p>浏览历史</p>
      </van-col>
    </van-row>
    </div>

    <!-- 设置 -->
    <van-cell-group inset style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 10px;">
    <van-cell title="设置" is-link @click="handleSetting">
      <template #icon>
        <van-icon name="setting-o" class="cell-icon" />
      </template>
    </van-cell>
    <van-cell title="关于" is-link @click="handleAbout">
      <template #icon>
        <van-icon name="info-o" class="cell-icon" />
      </template>
    </van-cell>
    <van-cell title="联系我们" is-link @click="handleContact">
      <template #icon>
        <van-icon name="phone-o" class="cell-icon" />
      </template>
    </van-cell>
    <van-cell title="帮助" is-link @click="handleHelp">
      <template #icon>
        <van-icon name="question-o" class="cell-icon" />
      </template>
    </van-cell>
  </van-cell-group>
    

    <!-- 登录提示弹窗 -->
    <van-dialog v-model:show="showDialog" title="提示" show-cancel-button>
      请先登录。
    </van-dialog>
  </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import Login from "@/components/Login.vue";
import { auth } from "@/firebaseConfig";
import { mapGetters } from "vuex";
import { showSuccessToast, showFailToast } from 'vant';
export default {
  name: "profile",
  components: { Login },
  data() {
    return {
      // username: "", // 用户名
      userAvatar: "https://via.placeholder.com/80", // 用户头像
      defaultAvatar: "https://via.placeholder.com/80?text=未登录", // 默认头像
      showLogin: false, // 控制弹窗显示
    };
  },
  computed: {
    isLogin() {
      return !!auth.currentUser; // 判断是否已登录
    },
    // username() {
    //   return auth.currentUser ? auth.currentUser.displayName : "";
    // },
    ...mapGetters("auth", ["username"]),
    // username() {
    //   return this.user?.displayName || "未登录";
    // },
  },
  mounted() {
    // 监听用户登录状态变化
    // auth.onAuthStateChanged((user) => {
    //   if (user) {
    //     // this.userAvatar = user.photoURL || this.defaultAvatar;
    //     this.username = user.displayName;
    //   } else {
    //     this.userAvatar = this.defaultAvatar;
    //     this.username = "";
    //   }
    // });
  },
  methods: {
    // 检查登录状态
    checkLogin() {
      if (!this.isLogin) {
        this.showLogin = true; // 未登录，弹出提示框
      } else {
        // 登录后跳转到个人信息页面
        // this.$router.push({ path: "/Profile/Edit" });
      }
    },
    // 处理通知
    handleNotification() {
      if (!this.isLogin) {
        this.showDialog = true;
      } else {
        // 登录后处理通知
        this.$router.push({ path: "/Profile/Notifications" });
      }
    },
    // 我的订单
    handleOrder() {
      if (!this.isLogin) {
        this.showDialog = true;
      } else {
        this.$router.push({ path: "/Profile/Orders" });
      }
    },
    // 我的收藏
    handleFavorite() {
      if (!this.isLogin) {
        this.showDialog = true;
      } else {
        this.$router.push({ path: "/Profile/Favorites" });
      }
    },
    // 我的地址
    handleAddress() {
      if (!this.isLogin) {
        this.showDialog = true;
      } else {
        this.$router.push({ path: "/Profile/Address" });
      }
    },
    // 设置
    handleSetting() {
      if (!this.isLogin) {
        this.showDialog = true;
      } else {
        this.$router.push({ path: "/Profile/Settings" });
      }
    },
    handleLoginSuccess() {
      this.showLogin = false;
      showSuccessToast('登录成功');
      // this.user = user; 
    // this.$nextTick(() => {
    //   // 确保数据更新后触发渲染
    //   this.showPopup = false;
    // });
    },
  }
    
};
</script>

<style scoped>
.profile {
  background-color: #f5f5f5;
  min-height: 100vh;
}
.profile-header {
  display: flex;
  text-align: center;
  margin-bottom: 1px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
}

.profile-content {
  /* text-align: center; */
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #feadb0, #fdddd4);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 100vh;
}

.username {
  margin-left: 24px;
  font-size: 16px;
  color: #666;
}

/* 整个块的样式 */
.section {
  background: #fff; /* 背景为白色 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  margin: 16px;
  padding: 10px; /* 内边距 */
}

.profile-header p {
  margin-top: 10px;
  font-size: 16px;
  color: #333;
}
.profile-row {
  text-align: center;
  margin: 15px 0;
}
.profile-row p {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
}
.cell-icon {
  font-size: 20px; /* 图标大小 */
  color: #cc3131; /* 图标颜色 */
  margin-right: 8px; /* 图标与文字的间距 */
}

</style>
