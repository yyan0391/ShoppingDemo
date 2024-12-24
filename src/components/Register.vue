<template>
    <div>
        <van-nav-bar left-arrow @click-left="goBack" :border="false" />


        <van-overlay v-model:show="isRegistering" z-index="2000">
            <van-loading size="30px" type="spinner" vertical>注册中...</van-loading>
        </van-overlay>

        <div class="register-page">
            <van-nav-bar title="注册" :border="false" style="margin-bottom: 20px;" />
            <van-form @submit="register">

                <div class="avatar-uploader">
                    <van-row justify="center">
                        <van-col span="6">
                            <span class="required-star">*</span>
                            <span class="required-text">上传头像</span>
                        </van-col>
                        <van-col span="18">
                            <van-uploader v-model="avatarFile" max-count="1" preview-size="80px"
                                @oversize="handleOversize" :before-read="beforeRead" />
                        </van-col>
                    </van-row>
                </div>
                <!-- 用户名 -->
                <van-field v-model="username" name="username" label="用户名" placeholder="请输入用户名" required
                    class="form-field" :error-message="usernameError" @blur="() => validateUsername(true)"
                    @input="() => validateUsername(false)" />
                <!-- 邮箱 -->
                <van-field v-model="email" name="email" label="邮箱" placeholder="请输入邮箱" required class="form-field"
                    :error-message="emailError" />
                <!-- 密码 -->
                <van-field v-model="password" name="password" label="密码" placeholder="请输入密码"
                    :type="showPassword ? 'text' : 'password'" type="password" required class="form-field"
                    :error-message="passwordError" @blur="() => validatePassword(true)"
                    @input="() => validatePassword(false)">
                    <template #right-icon>
                        <van-icon :name="showPassword ? 'eye-o' : 'eye'" @click="togglePasswordVisibility" />
                    </template>
                </van-field>
                <!-- 确认密码 -->
                <van-field v-model="confirmPassword" name="confirm-password" label="确认密码" placeholder="请再次输入密码"
                    :type="showPasswordCon ? 'text' : 'password'" type="password" required class="form-field"
                    :error-message="confirmPasswordError" @blur="() => validateConfirmPassword(true)"
                    @input="() => validateConfirmPassword(false)">
                    <template #right-icon>
                        <van-icon :name="showPasswordCon ? 'eye-o' : 'eye'"
                            @click="showPasswordCon = !showPasswordCon" />
                    </template>
                </van-field>
                <!-- 注册按钮 -->
                <div class="button-container">
                    <van-button round block type="primary" native-type="submit"
                        style="margin-top: 50px;">注册</van-button>
                </div>
            </van-form>
        </div>
    </div>
</template>
<script>
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { showDialog, showSuccessToast } from 'vant';

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
            isRegistering: false,
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
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

            this.isRegistering = true;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;
                const metadata = {
                    contentType: this.avatarFile[0].type, // 设置 MIME 类型
                };
                // 上传头像
                let avatarUrl = null;
                if (this.avatarFile.length > 0) {
                    const file = this.avatarFile[0].file;
                    const fileRef = ref(storage, `avatars/${user.uid}`);
                    const metadata = {
                        contentType: file.type, // 指定文件类型
                    };

                    console.log("文件准备上传：", file);

                    try {
                        await uploadBytesResumable(fileRef, file, metadata);
                        avatarUrl = await getDownloadURL(fileRef);
                        console.log("文件下载链接：", avatarUrl);

                        // 更新用户信息
                        await updateProfile(user, {
                            displayName: this.username,
                            photoURL: avatarUrl,
                        });

                        // 将头像链接保存到数据库
                        await setDoc(doc(db, "users", user.uid), {
                            uid: user.uid,
                            username: this.username,
                            email: this.email,
                            photoURL: avatarUrl,
                            createdAt: new Date(),
                        });
                    } catch (error) {
                        console.error("文件上传失败：", error);
                    }
                }

                // 更新用户资料
                await updateProfile(user, {
                    displayName: this.username,
                    photoURL: avatarUrl,
                });

                // 保存到 Firestore
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    username: this.username,
                    email: this.email,
                    photoURL: avatarUrl,
                    createdAt: new Date(),
                });

                // 更新 Vuex 中的用户信息
                this.$store.commit("auth/setUser", {
                    uid: user.uid,
                    displayName: this.username,
                    email: this.email,
                    photoURL: avatarUrl,
                });

                // 自动登录用户
                const loginResult = await signInWithEmailAndPassword(auth, this.email, this.password);
                console.log("登录成功:", loginResult.user);

                showSuccessToast("注册成功！已自动登录。");
                this.$router.go(-1);
            } catch (error) {
                if (error.code === "auth/email-already-in-use") {
                    showDialog({ message: "该邮箱已被注册，请使用其他邮箱。" });
                } else {
                    console.error("注册失败:", error);
                    showDialog({ message: "注册失败，请稍后重试。" });
                }
            } finally {
                this.isRegistering = false;
            }
        },
        beforeRead(file) {
            console.log("文件内容：", file);
            const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
            if (!allowedFormats.includes(file.type)) {
                this.$toast("只支持 JPG、PNG 或 GIF 格式的图片");
                return false;
            }
            if (file.size > 2 * 1024 * 1024) {
                this.$toast("文件大小不能超过 2MB");
                return false;
            }
            return true; // 允许上传
        },
        goBack() {
            this.$router.go(-1);
        },
    },
};
</script>

<style scoped>
.register-page {
    height: 100vh;
    /* 占满整个屏幕 */
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    /* align-items: center; */
    padding: 30px;
}

.form-field {
    margin-bottom: 20px;
    /* 增加每一行的间距 */
}

.button-container {
    margin-top: 30px;
    /* 调整按钮与表单之间的间距 */
}

.avatar-uploader {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
}

.required-star {
    color: rgb(237, 3, 3);
    /* 星号颜色 */
    font-size: 15px;
    /* 星号大小 */
    margin-right: 1px;
    /* 星号与文字间距 */
}

.required-text {
    font-size: 14px;
    /* 文字大小 */
    color: #333;
    /* 文字颜色 */
}
.van-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>