<template>
    <div>
        <van-nav-bar title="消息通知" left-text="返回" left-arrow @click-left="goBack" class="custom-title"></van-nav-bar>
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
    </div>
</template>

<script>
export default {
    name: 'Notification',
    data() {
        return {
            checked: true,
        };
    },
    methods: {
        goBack() {
            this.$router.go(-1);
        },
    },
};
</script>

<style></style>