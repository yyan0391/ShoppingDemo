<template>
  <div class="setting">
    <van-nav-bar title="设置" left-text="返回" left-arrow @click-left="goBack" class="custom-title"></van-nav-bar>
    <van-divider :style="{ color: '#0c0c0c', borderColor: '#0c0c0c', padding: '0 16px' }">
      账号设置
    </van-divider>
    <van-cell-group inset>
      <van-cell title="个人信息" is-link />
      <van-cell title="支付设置" arrow />
    </van-cell-group>

    <van-divider :style="{ color: '#0c0c0c', borderColor: '#0c0c0c', padding: '0 16px' }">
      消息通知
    </van-divider>

    <van-cell-group inset>
      <van-cell center title="允许通知">
        <template #right-icon>
          <van-switch v-model="checked" />
        </template>
        <template #label>
          <span style="color: #1989fa">开启后，App 未打开也能收到系统消息通知</span>
        </template>
      </van-cell>

      <van-cell center title="震动">
        <template #right-icon>
          <van-switch v-model="checked" />
        </template>
      </van-cell>

      <van-cell center title="声音">
        <template #right-icon>
          <van-switch v-model="checked" />
        </template>
      </van-cell>

    </van-cell-group>

    <van-divider :style="{ color: '#0c0c0c', borderColor: '#0c0c0c', padding: '0 16px' }">
      通用
    </van-divider>

    <van-cell-group inset>
      <van-cell title="深色模式" is-link value="跟随系统" />
      <van-cell title="清除缓存" arrow>
        <template #label>
          <span style="color: #1989fa">包括图片、数据等</span>
        </template>
      </van-cell>
    </van-cell-group>
    <van-divider />

    <van-row style="margin: 20px;">
      <van-button round block type="danger" @click="handleLogout">
        退出登录
      </van-button>
    </van-row>

  </div>
</template>


<script>
import { showConfirmDialog,showSuccessToast, showFailToast } from 'vant';
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default {
  name: 'Settings',
  data() {
    return {
      checked: true,
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    async handleLogout() {
      try {
        const confirm = await showConfirmDialog({
          title: "确认退出登录",
          message: "确定要退出登录吗？",
        });
        if (confirm) {
          // 调用 Firebase 的退出登录方法
          await signOut(auth);
          this.$store.commit("auth/clearUser"); // 清除 Vuex 用户状态
          showSuccessToast("退出登录成功");
          this.$router.push({ path: "/Profile" }); // 跳转到 Profile 页面
        }
      } catch (error) {
        if (error !== undefined) {
          // 捕获取消退出时的错误
          console.log("用户取消退出登录");
        } else {
          console.error("退出登录失败:", error);
          showFailToast("退出登录失败，请重试");
        }
      }
    },
  },
};


</script>

<style>
.setting {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>