<template>
    <div class="login-page">
      <div class="login-container">
        <van-nav-bar title="登录" :border="false" style="margin-bottom: 10px;" />
  
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
import { auth } from "../firebaseConfig";
import { showDialog } from "vant";

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword; // 切换密码显示状态
    },
    async login() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;
        this.$store.commit("auth/setUser", {
          uid: user.uid,
          displayName: user.displayName || "用户",
          email: user.email,
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
</style>