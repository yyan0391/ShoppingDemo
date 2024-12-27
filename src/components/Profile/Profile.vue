<template>
  <div class="profile">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="个人中心">
      <!-- 右上角通知按钮 -->
      <template #right>
        <van-icon name="chat-o" badge="9" @click="handleNotification" style="font-size: 22px;" />
        <!-- <van-icon name="bell-o" @click="handleNotification" /> -->
      </template>
    </van-nav-bar>

    <!-- 头像和用户名 -->
    <div class="profile-header" @click="checkLogin">
      <van-image round width="80px" height="80px" :src="userAvatar" />
      <p class="username">{{ username }}</p>

      <van-button @click="goEditInfo" size="small" round class="edit-button">
        修改个人信息
      </van-button>
    </div>


    <van-popup v-model:show="showLogin" style="border-radius: 24px; width: 350px; height: 550px;" closeable
      close-icon="cross" close-icon-position="top-right">
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


      <div v-if="userRole === 'admin'">
        <van-divider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">
          管理员功能
        </van-divider>
      <van-cell-group  inset
        style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 10px; margin-top: 20px;">
        <van-cell title="上传商品" is-link @click="handleAdminUploadGoods">
          <template #icon>
            <van-icon name="gift-o" class="cell-icon" />
          </template>
        </van-cell>
        <van-cell title="编辑商品" is-link @click="handleAdminEditGoods">
          <template #icon>
            <van-icon name="edit" class="cell-icon" />
          </template>
        </van-cell>
        <van-cell title="优惠券设置" is-link @click="handleAdminCoupon">
          <template #icon>
            <van-icon name="coupon-o" class="cell-icon" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>


      <!-- <van-dialog v-model:show="showDialog" title="提示" show-cancel-button>
      请先登录。
    </van-dialog> -->
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import Login from "@/components/Login.vue";
import { auth } from "@/firebaseConfig";
import { mapGetters } from "vuex";
import { showSuccessToast, showFailToast, showDialog } from 'vant';
export default {
  name: "profile",
  components: { Login },
  data() {
    return {
      avatarLoading: true, // 头像加载状态
      defaultAvatar: "https://via.placeholder.com/80?text=未登录", // 默认头像
      showLogin: false, // 控制弹窗显示
    };
  },
  computed: {
    // ...mapState("auth", ["user"]),
    ...mapGetters("auth", ["username", "isLogin",]),
    userAvatar() {
      return this.isLogin && this.$store.state.auth.user.photoURL
        ? this.$store.state.auth.user.photoURL
        : this.defaultAvatar;
    },
    userRole() {
      const authState = this.$store.state.auth; // 获取 auth 状态
      console.log("authState:", authState);
      return authState && authState.role ? authState.role : "user"; // 默认角色为 user
    },
  },

  methods: {
    onAvatarLoad() {
      this.avatarLoading = false; // 图片加载成功后隐藏 loading
    },
    // 检查登录状态
    checkLogin() {
      if (!this.isLogin) {
        this.showLogin = true; // 未登录，弹出提示框
      } else {
        console.log("已登录，点击无效");
      }
    },
    // 处理通知
    handleNotification() {
      if (!this.isLogin) {
        this.showLogin = true;
      } else {
        // 登录后处理通知
        this.$router.push({ path: "Notification" });
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
        this.$router.push({ path: "/Address" });
      }
    },
    // 设置
    handleSetting() {
      if (!this.isLogin) {
        this.showDialog = true;
        showFailToast('请先登录');
      } else {
        this.$router.push({ path: "/Settings" });
      }
    },
    handleLoginSuccess(user) {
      this.showLogin = false;
      console.log("头像 URL:", this.userAvatar);
      // this.$store.commit("auth/setUser", user);
      showSuccessToast('登录成功');
    },
    goEditInfo() {
      if (!this.isLogin) {
        this.showDialog = true;
        showFailToast('请先登录');
      } else {
        this.$router.push({ path: "/EditInfo" });
      }
    },
    handleAdminUploadGoods() {
      this.$router.push({ path: "/AdminUploadGoods" });
    },
    handleAdminEditGoods() {
      this.$router.push({ path: "/AdminEditGoods" });
    },
    handleAdminCoupon() {
      this.$router.push({ path: "/AdminCoupon" });
    },
    handleAbout() {
      showDialog({
        title: '欢迎来到【RIIZE-B】！',
        message: `
      <p>我们是一个专注于RIIZE周边产品的购物平台，为所有喜爱RIIZE的粉丝提供最全面、最独特的商品。<br>无论您是新加入的粉丝还是多年忠实的支持者，这里都是您表达热爱和收藏心仪周边的最佳选择。</p>
    `,
    allowHtml: true,
      })

      
    },
    handleContact() {
      showDialog({
        title: '联系我们',
        message: `
      <p><strong style="font-size: 16px;">官方 X: </strong><br>https://x.com/riize_official</p>
      <p><strong style="font-size: 16px;">官方 Instragram: </strong><br>https://www.instagram.com/riize_official/</p>
    `,
    allowHtml: true,
    messageAlign: 'left',
      })
    },
    handleHelp() {
      this.$router.push({ path: "/Help" });
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
  position: relative;
  /* 关键：为子元素的绝对定位提供参考 */
  display: flex;
  align-items: center;
  /* 垂直居中对齐 */
  text-align: center;
  margin-bottom: 1px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.edit-button {
  position: absolute;
  /* 绝对定位 */
  right: 16px;
  /* 距离右边 16px */
  bottom: 16px;
  /* 距离底部 16px */
  font-size: 12px;
  /* 调整按钮文字大小 */
  padding: 4px 8px;
  /* 调整按钮内边距 */
}

.username {
  margin-left: 16px;
  flex: 1;
  /* 占据剩余空间 */
  text-align: left;
  /* 左对齐 */
  font-size: 16px;
  color: #333;
}

.profile-content {
  /* text-align: center; */
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #f9ecec, #fdddd4);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 100vh;
}



/* 整个块的样式 */
.section {
  background: #fff;
  /* 背景为白色 */
  border-radius: 12px;
  /* 圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  /* 阴影效果 */
  margin: 16px;
  padding: 10px;
  /* 内边距 */
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
  font-size: 20px;
  /* 图标大小 */
  color: #cc3131;
  /* 图标颜色 */
  margin-right: 8px;
  /* 图标与文字的间距 */
}
</style>
