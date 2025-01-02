<template>
    <div>
      <van-nav-bar left-arrow @click-left="goBack" :border="false" title="修改信息" />
  
      <van-overlay v-model:show="isUpdating" z-index="2000">
        <van-loading size="30px" type="spinner" vertical>更新中...</van-loading>
      </van-overlay>
  
      <div class="edit-info-page">
        <van-form @submit="updateInfo">
          <div class="avatar-uploader">
            <van-row justify="center">
              <van-col span="6">
                
                <span class="required-text">修改头像</span>
              </van-col>
              <van-col span="18">
                <van-uploader v-model="avatarFile" max-count="1" preview-size="80px"
                  @oversize="handleOversize" :before-read="beforeRead" />
              </van-col>
            </van-row>
          </div>
  
          <!-- 用户名 -->
          <van-field v-model="username" name="username" label="用户名" placeholder="请输入用户名"
            class="form-field" :error-message="usernameError" @blur="() => validateUsername(true)"
            @input="() => validateUsername(false)" />
  
          <!-- 邮箱 (不可修改) -->
          <van-field v-model="email" name="email" label="邮箱" placeholder="邮箱不可修改" disabled class="form-field" />
  
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
        usernameError: "",
        avatarFile: [],
        showPassword: false,
        showPasswordCon: false,
        isUpdating: false,
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
      // togglePasswordVisibility() {
      //   this.showPassword = !this.showPassword;
      // },
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
        this.usernameError = "";
        return true;
      },

      async updateInfo() {
        // if (
        //   !(await this.validateUsername(true)) ||
        //   !this.validatePassword(true) ||
        //   !this.validateConfirmPassword(true)
        // ) {
        //   return;
        // }
  
        this.isUpdating = true;
  
        try {
          const user = auth.currentUser;
  
          // 上传头像
          let avatarUrl = user.photoURL;
          if (this.avatarFile.length > 0) {
            const file = this.avatarFile[0].file;
            const fileRef = ref(storage, `avatars/${user.uid}`);
            const metadata = { contentType: file.type };
            await uploadBytesResumable(fileRef, file, metadata);
            avatarUrl = await getDownloadURL(fileRef);
          }
  
          // 更新用户资料
          await updateProfile(user, {
            displayName: this.username,
            photoURL: avatarUrl,
          });
  
          // 更新 Firestore 中的用户数据
          await updateDoc(doc(db, "users", user.uid), {
            username: this.username,
            photoURL: avatarUrl,
          });
  
          // 更新 Vuex
          this.$store.commit("auth/setUser", {
            uid: user.uid,
            displayName: this.username,
            email: this.email,
            photoURL: avatarUrl,
          });
  
          showSuccessToast("信息修改成功！");
          this.$router.go(-1);
        } catch (error) {
          console.error("信息修改失败:", error);
          showDialog({ message: "信息修改失败，请稍后重试。" });
        } finally {
          this.isUpdating = false;
        }
      },
      beforeRead(file) {
        const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedFormats.includes(file.type)) {
          this.$toast("只支持 JPG、PNG 或 GIF 格式的图片");
          return false;
        }
        if (file.size > 2 * 1024 * 1024) {
          this.$toast("文件大小不能超过 2MB");
          return false;
        }
        return true;
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