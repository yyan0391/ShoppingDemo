<template>
    <div>
      <van-nav-bar left-arrow @click-left="goBack" :border="false" title="修改密码" />
  
      <van-overlay v-model:show="isUpdating" z-index="2000">
        <van-loading size="30px" type="spinner" vertical>更新中...</van-loading>
      </van-overlay>
  
      <div class="edit-info-page">
        <van-form @submit="updateInfo">
          <!-- 密码 -->
          <van-field v-model="password" name="password" label="新密码" placeholder="请输入新密码"
            :type="showPassword ? 'text' : 'password'" type="password" class="form-field"
            :error-message="passwordError" @blur="() => validatePassword(true)"
            @input="() => validatePassword(false)">
            <template #right-icon>
              <van-icon :name="showPassword ? 'eye-o' : 'eye'" @click="togglePasswordVisibility" />
            </template>
          </van-field>
  
          <!-- 确认密码 -->
          <van-field v-model="confirmPassword" name="confirm-password" label="确认新密码" placeholder="请再次输入新密码"
            :type="showPasswordCon ? 'text' : 'password'" type="password" class="form-field"
            :error-message="confirmPasswordError" @blur="() => validateConfirmPassword(true)"
            @input="() => validateConfirmPassword(false)">
            <template #right-icon>
              <van-icon :name="showPasswordCon ? 'eye-o' : 'eye'"
                @click="showPasswordCon = !showPasswordCon" />
            </template>
          </van-field>
  
          <!-- 修改按钮 -->
          <div class="button-container">
            <van-button round block type="primary" native-type="submit" style="margin-top: 50px;">修改</van-button>
          </div>
        </van-form>
      </div>
    </div>
  </template>
  
  <script>
  import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
  import { doc, updateDoc } from "firebase/firestore";
  import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
  import { auth, db, storage } from "../../firebaseConfig";
  import { showDialog, showSuccessToast } from "vant";
  
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
        avatarFile: [],
        showPassword: false,
        showPasswordCon: false,
        isUpdating: false,
        // currentPassword: "", 
      };
    },
    created() {
      const user = auth.currentUser;
      if (user) {
        this.username = user.displayName || "";
        this.email = user.email || "";
        // this.currentPassword = ""; 
      }
    },
    methods: {
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
      },

      validatePassword(isFinalCheck) {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPattern.test(this.password)) {
          this.passwordError = isFinalCheck
            ? "密码至少包含8个字符，包括大小写字母和数字"
            : "";
          return false;
        }
        // if (this.password === this.currentPassword) {
        //   this.passwordError = isFinalCheck ? "新密码不能与当前密码相同" : "";
        //   return false;
        // }
        this.passwordError = "";
        return true;
      },
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
      async updateInfo() {
        if (
        //   !(await this.validateUsername(true)) ||
          !this.validatePassword(true) ||
          !this.validateConfirmPassword(true)
        ) {
          return;
        }
  
        this.isUpdating = true;
  
        try {
          const user = auth.currentUser;
  
          // 更新密码
          const credential = EmailAuthProvider.credential(user.email, this.currentPassword);
        //   await reauthenticateWithCredential(user, credential);
          await updatePassword(user, this.password);
  
          showSuccessToast("密码修改成功！");
          this.$router.push("/Profile");
        } catch (error) {
          console.error("密码修改失败:", error);
          showDialog({ message: "密码修改失败，请稍后重试。" });
        } finally {
          this.isUpdating = false;
        }
      },
      goBack() {
        this.$router.go(-1);
      },
    },
  };
  </script>
  
  <style scoped>
  .edit-info-page {
    height: 100vh;
    padding: 30px;
  }
  .form-field {
    margin-bottom: 20px;
  }
  .button-container {
    margin-top: 30px;
  }
  .avatar-uploader {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
  }
  .required-star {
    color: rgb(237, 3, 3);
    font-size: 15px;
    margin-right: 1px;
  }
  .required-text {
    font-size: 14px;
    color: #333;
  }
  .van-overlay {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>