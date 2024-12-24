<template>
    <div class="login-page">
      <div class="login-container">
        <van-nav-bar title="登录" :border="false" style="margin-bottom: 10px;" />
        
        <van-overlay v-model:show="isLogin" z-index="2000">
            <van-loading color="#1989fa" size="30px" type="spinner" vertical>登录中...</van-loading>
        </van-overlay>

        <van-form @submit="login">
          <!-- 邮箱 -->
          <van-field
            v-model="email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            required
            class="form-field"
          />
          <!-- 密码 -->
          <van-field
            v-model="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :type="showPassword ? 'text' : 'password'"
            type="password"
            required
            class="form-field"
          >
          <template #right-icon>
          <van-icon
            :name="showPassword ? 'eye-o' : 'eye'"
            @click="togglePasswordVisibility"
          />
        </template>
        </van-field>
          <!-- 登录按钮 -->
          <div class="button-container">
            <van-button round block type="primary" native-type="submit">登录</van-button>
          </div>
        </van-form>
  
        

        <van-divider content-position="center" style="margin: 30px;">或</van-divider>
        <van-button
  type="primary"
  round
  block
  @click="loginWithGoogle"
  class="google-login-button"
>
<div class="google-content">
<img src="@/assets/google-logo.svg" alt="Google Logo" class="google-logo" />
  使用 Google 登录
</div>
</van-button>
<!-- 注册提示 -->
<p class="footer-text">
          没有账号？
          <span @click="toRegister" class="link">立即注册</span>
        </p>
      </div>
    </div>
  </template>
  
  <script>
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import { showDialog } from "vant";
import { signInWithPopup } from "firebase/auth";

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      isLogin: false,
    };
  },
  methods: {
    // Google登录方法
    async loginWithGoogle() {
    try {
      // 调用 Firebase 的 Google 登录
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 打印用户信息（可移除）
      console.log("Google 登录成功：", user);

      // 更新 Vuex 用户状态
      this.$store.commit("auth/setUser", {
        uid: user.uid,
        displayName: user.displayName || "用户",
        email: user.email,
        photoURL: user.photoURL, // 用户头像
      });

      // 通知父组件登录成功，关闭 Popup
      this.$emit("loginSuccess");
    } catch (error) {
      console.error("Google 登录失败：", error.message);
      showDialog({ message: "Google 登录失败，请重试。" });
    }
  },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword; // 切换密码显示状态
    },
    async login() {
        this.isLogin = true;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;
        this.$store.commit("auth/setUser", {
          uid: user.uid,
          displayName: user.displayName || "用户",
          email: user.email,
          photoURL: user.photoURL || "https://via.placeholder.com/80",
        });
        console.log("登录成功", userCredential.user);
        this.$emit("loginSuccess");

      } catch (error) {
        console.error("登录失败", error);
        if (error.code === "auth/invalid-credential") {
          showDialog({ message: '密码不正确，请重试。' });
        } else if(error.code === "auth/invalid-email") {
          showDialog({ message: '邮箱不存在，请重试。' });
        } else {
          showDialog({ message: '登录失败，请重试。' });
        }
      } finally {
        this.isLogin = false;
      }
    },
    toRegister() {
        this.$router.push({ path: '/Register' }) // 跳转到注册页面
    },
  },
};
</script>
  
<style scoped>
.login-page {
  height: 100%; /* 占满整个屏幕 */
  display: flex;
  flex-direction: column;
  padding: 30px;
}

.login-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  padding: 20px;
}

.form-field {
  margin-bottom: 20px; /* 增加每一行的间距 */
}

.button-container {
  margin-top: 30px; /* 按钮与表单间距增加 */
}

.footer-text {
  text-align: center;
  margin-top: 20px;
  font-size: 12px; /* 调整文字大小 */
  color: #888;
}

.link {
  color: #409eff;
  font-size: 14px; /* 链接字体稍大 */
  cursor: pointer;
}
.google-login-button {
  /* margin-top: 20px;  */
  background-color: #e7e7e7; /* Google 蓝色 */
  color: #4e4e4e; /* 白色文字 */
  border: none;
  font-weight: bold;
}

.google-content {
  display: flex; /* 内部内容使用 flexbox 布局 */
  align-items: center; /* 图标和文字垂直对齐 */
  gap: 8px; /* 图标和文字的水平间距 */
}

.google-logo {
  width: 20px;
  height: 20px;
}

.van-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>