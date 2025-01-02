<template>
    <div class="coupon-content">
        <van-overlay v-model:show="isUploading" z-index="9000">
          <van-loading size="30px" type="spinner" vertical>上传中...</van-loading>
        </van-overlay>
      <!-- 优惠券列表 -->
      <van-nav-bar title="优惠券管理" left-text="返回" left-arrow @click-left="$router.go(-1)" />
  <van-divider>
      </van-divider>
      <van-cell-group inset>
        <van-cell v-for="(coupon, index) in coupons" :key="index" is-link>
          <template #title>
            <div>{{ coupon.name }}</div>
          </template>
          <template #label>
            <div>
              <div>开始时间: {{ formatTimestamp(coupon.startAt) }}</div>
              <div>结束时间: {{ formatTimestamp(coupon.endAt) }}</div>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="edit" @click="editCoupon(index)"size="23" />
            <van-icon name="delete" @click.stop="deleteCoupon(index)" style="margin-left: 10px; color: red;"size="23" />
          </template>
        </van-cell>
      </van-cell-group>
  
      <!-- 添加优惠券按钮 -->
      <van-button type="primary" block @click="addCoupon" class="coupon-add-button">添加优惠券</van-button>
  
      <!-- 优惠券弹窗 -->
      <van-popup v-model:show="showPopup" round position="bottom" style="height: 80%;">
        <van-nav-bar title="优惠券" left-arrow @click-left="showPopup = false" />
        <div style="padding: 20px;">
          <van-field v-model="form.name" label="优惠券名称" placeholder="请输入名称" required />
          <van-field v-model="form.valueDesc" label="优惠金额（¥）" placeholder="例如 10" required />
          <van-field v-model="form.unitDesc" label="单位" placeholder="例如 元" required />
          <van-field v-model="form.originCondition" label="使用条件（¥）" placeholder="满多少可用" required />
  
          <!-- 选择开始时间 -->
          <van-field
            v-model="form.startAtFormatted"
            label="开始时间"
            is-link
            readonly
            placeholder="选择开始时间"
            @click="showStartCalendar = true"
          />
          <van-calendar
            v-model:show="showStartCalendar"
            type="single"
            title="选择开始时间"
            @confirm="onStartConfirm"
            @cancel="showStartCalendar = false"
          />
  
          <!-- 选择结束时间 -->
          <van-field
            v-model="form.endAtFormatted"
            label="结束时间"
            is-link
            readonly
            placeholder="选择结束时间"
            @click="showEndCalendar = true"
          />
          <van-calendar
            v-model:show="showEndCalendar"
            type="single"
            title="选择结束时间"
            @confirm="onEndConfirm"
            @cancel="showEndCalendar = false"
          />
  
          <van-button type="primary" block @click="saveCoupon" >保存</van-button>
        </div>
      </van-popup>
    </div>
  </template>
  
  <script>
  import { collection, addDoc, deleteDoc, getDocs, updateDoc, doc } from "firebase/firestore";
  import { db } from "@/firebaseConfig";
import { showConfirmDialog } from "vant";
  
  export default {
    data() {
      return {
        coupons: [], // 存储所有优惠券
        showPopup: false, // 控制弹窗显示
        showStartCalendar: false, // 控制开始时间选择器弹窗
        showEndCalendar: false, // 控制结束时间选择器弹窗
        form: {
          name: "",
          valueDesc: "",
          unitDesc: "",
          originCondition: 0,
          startAt: null,
          startAtFormatted: "",
          endAt: null,
          endAtFormatted: "",
        },
        editIndex: null, // 当前编辑的优惠券索引
        isUploading: false, // 控制上传中状态
      };
    },
    async created() {
      await this.fetchCoupons();
    },
    methods: {
      async fetchCoupons() {
        const querySnapshot = await getDocs(collection(db, "coupons"));
        this.coupons = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      },
      formatTimestamp(timestamp) {
        if (!timestamp) return "-";
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      },
      addCoupon() {
        this.resetForm();
        this.showPopup = true;
      },
      editCoupon(index) {
        const coupon = this.coupons[index];
        this.form = { ...coupon };
        this.form.startAtFormatted = this.formatTimestamp(coupon.startAt);
        this.form.endAtFormatted = this.formatTimestamp(coupon.endAt);
        this.editIndex = index;
        this.showPopup = true;
      },
      async saveCoupon() {
        if (!this.form.name || !this.form.valueDesc || !this.form.unitDesc) {
          this.$toast("请填写完整信息");
          return;
        }
  
        const coupon = {
          ...this.form,
          startAt: new Date(this.form.startAtFormatted).getTime(),
          endAt: new Date(this.form.endAtFormatted).getTime(),
        };
  
        if (this.editIndex !== null) {
          const couponId = this.coupons[this.editIndex].id;
          await updateDoc(doc(db, "coupons", couponId), coupon);
          this.coupons[this.editIndex] = coupon; // 修改本地数据
        } else {
            this.isUploading = true;
          const docRef = await addDoc(collection(db, "coupons"), coupon);
          coupon.id = docRef.id;
          this.coupons.push(coupon); // 添加新优惠券
          this.isUploading = false;
        }
  
        this.resetForm();
        this.showPopup = false;
        this.editIndex = null;
      },
      async deleteCoupon(index) {
        showConfirmDialog({
          title: "确认删除",
          message: "确定要删除此优惠券吗？",
        }).then(() => {
        const couponId = this.coupons[index].id;
        deleteDoc(doc(db, "coupons", couponId));
        this.coupons.splice(index, 1); // 从本地删除
        this.$toast("优惠券已删除");})
      },
      resetForm() {
        this.form = {
          name: "",
          valueDesc: "",
          unitDesc: "",
          originCondition: 0,
          startAt: null,
          startAtFormatted: "",
          endAt: null,
          endAtFormatted: "",
        };
      },
      onStartConfirm(date) {
        this.form.startAtFormatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;
        this.showStartCalendar = false;
      },
      onEndConfirm(date) {
        this.form.endAtFormatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;
        this.showEndCalendar = false;
      },
    },
  };
  </script>
  
  <style scoped>
.coupon-content {
  background-color: aliceblue; 
  min-height: 100vh;
}

 .coupon-add-button {
  position: fixed !important;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 10px;
  border-top: 1px solid #eee;

 }
  </style>