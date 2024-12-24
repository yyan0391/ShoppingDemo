<template>
    <div>
        <van-nav-bar left-arrow @click-left="goBack" :border="false" />
    
    <div class="register-page">
    <van-nav-bar title="注册"  :border="false" style="margin-bottom: 20px;"/>
      <van-form @submit="register">
        <!-- 用户名 -->
        <van-field
          v-model="username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          required
          class="form-field"
          :error-message="usernameError"
          @blur="() => validateUsername(true)"
        @input="() => validateUsername(false)"
        />
        <!-- 邮箱 -->
        <van-field
          v-model="email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          required
          class="form-field"
          :error-message="emailError"
        />
        <!-- 密码 -->
        <van-field
          v-model="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          type="password"
          required
          class="form-field"
          :error-message="passwordError"
          @blur="() => validatePassword(true)"
        @input="() => validatePassword(false)"
        />
        <!-- 确认密码 -->
        <van-field
          v-model="confirmPassword"
          name="confirm-password"
          label="确认密码"
          placeholder="请再次输入密码"
          type="password"
          required
          class="form-field"
          :error-message="confirmPasswordError"
          @blur="() => validateConfirmPassword(true)"
        @input="() => validateConfirmPassword(false)"
        />
        <!-- 注册按钮 -->
        <div class="button-container">
          <van-button round block type="primary" native-type="submit" style="margin-top: 50px;">注册</van-button>
        </div>
      </van-form>
    </div>
</div>
  </template>

<script>
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDocs, query, where, collection } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { showDialog } from 'vant';
import { getFirestore } from "firebase/firestore";
export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      usernameError: "",
      passwordError: "",
      confirmPasswordError: "",
    };
  },
  methods: {
    // 实时校验和失焦校验用户名
    async validateUsername(isFinalCheck) {
      this.username = this.username.trim();
      if (!this.username) {
        this.usernameError = isFinalCheck ? "用户名不能为空" : "";
        return false;
      }
      if (this.username.length < 3 || this.username.length > 20) {
        this.usernameError = isFinalCheck ? "用户名长度必须在3到20个字符之间" : "";
        return false;
      }
      const usernamePattern = /^[a-zA-Z0-9._]+$/;
      if (!usernamePattern.test(this.username)) {
        this.usernameError = isFinalCheck ? "用户名只能包含字母、数字、下划线和点" : "";
        return false;
      }
      if (isFinalCheck) {
        // 检查用户名是否已被占用
        const usernameTaken = await this.isUsernameTaken(this.username);
        this.usernameError = usernameTaken ? "用户名已被使用，请换一个" : "";
        return !usernameTaken;
      }
      this.usernameError = "";
      return true;
    },
    async isUsernameTaken(username) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    },

    // 实时校验和失焦校验密码
    validatePassword(isFinalCheck) {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordPattern.test(this.password)) {
        this.passwordError = isFinalCheck
          ? "密码至少包含8个字符，包括大小写字母和数字"
          : "";
        return false;
      }
      this.passwordError = "";
      return true;
    },

    // 实时校验和失焦校验确认密码
    validateConfirmPassword(isFinalCheck) {
      if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = isFinalCheck
          ? "两次输入的密码不一致"
          : "";
        return false;
      }
      this.confirmPasswordError = "";
      return true;
    },

    async register() {
      if (
        !(await this.validateUsername(true)) ||
        !this.validatePassword(true) ||
        !this.validateConfirmPassword(true)
      ) {
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: this.username });

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          username: this.username,
          email: this.email,
          createdAt: new Date(),
        });

        alert("注册成功！请检查您的邮箱进行验证。");
        this.$router.go(-1);
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          showDialog({ message: '该邮箱已被注册，请尝试登录或使用其他邮箱再次注册。' });
        } else {
          showDialog({ message: '注册失败，请稍后重试。' });
        }
      }
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.register-page {
  height: 100vh; /* 占满整个屏幕 */
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  /* align-items: center; */
  padding: 30px;
}

.form-field {
  margin-bottom: 20px; /* 增加每一行的间距 */
}

.button-container {
  margin-top: 30px; /* 调整按钮与表单之间的间距 */
}
</style>