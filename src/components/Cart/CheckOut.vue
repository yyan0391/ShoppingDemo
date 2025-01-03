<template>
    <div class="checkout">
        <van-nav-bar title="确认订单" left-text="返回" left-arrow class="custom-title" @click-left="onClickLeft">
        </van-nav-bar>

        <van-overlay v-model:show="isPaying" z-index="2000">
            <van-loading size="30px" type="spinner" vertical>支付中...</van-loading>
        </van-overlay>
        <van-divider />
        <div class="address-container">
            <van-cell-group inset class="address-cell">
                <van-cell icon="location-o" value="所有地址" is-link @click="GoToAddress">
                    <template #title>
                        <span style="font-weight: bold;">{{ address ? address.name + ' ' + address.tel : '请选择地址'
                            }}</span>
                    </template>
                    <template #label>
                        <span style="font-weight: bold;">{{ address ? address.address : '' }}</span>
                    </template>
                </van-cell>
            </van-cell-group>

            <van-card-group>
                <van-card v-for="item in cartGoods" :key="item.id" :title="item.title" :thumb="item.images[0]"
                    :desc="item.description" :price="item.price * item.count" :num="item.count" class="card">

                    <template #tags>
                        <van-tag type="default">单价：¥{{ item.price }}</van-tag>
                    </template>
                </van-card>

            </van-card-group>

            <van-cell-group inset>
                <van-cell title="商品总价">
                    <template #value>
                        <span style="font-weight: bold;">¥ {{ amount / 100 }}</span>
                    </template>
                </van-cell>
                <van-cell title="配送服务" is-link :value="selectedValue || '请选择'" @click="show = true"></van-cell>
                <van-action-sheet v-model:show="show" :actions="actions" cancel-text="取消" description="配送方式"
                    close-on-click-action @select="onSelect" />
                <van-cell title="运费（消费满49元包邮*）" :value="postageDisplay">
                </van-cell>
                <van-cell title="优惠券" is-link @click="openCouponPopup">
                    <template #value>
                        {{ chosenCouponIndex !== -1 ? `已选择：${availableCoupons[chosenCouponIndex].name}` : '未选择' }}
                    </template>
                </van-cell>
            </van-cell-group>

            <van-cell-group inset style="margin: 15px; padding: 10px;">
                <van-cell title="支付方式" is-link :value="selectedPay || '请选择支付方式'" @click="showPay = true">
                </van-cell>
            </van-cell-group>

            <!-- 优惠券popup -->
            <van-popup v-model:show="showList" round position="bottom" style="height: 90%; padding-top: 4px;">
                <van-coupon-list 
                :coupons="availableCoupons.map(coupon => ({
                    ...coupon,
                    originCondition: coupon.originCondition * 100,
                    // startAtText: formatTimestamp(coupon.startAt),
                    startAt: coupon.startAt,
                    endAt: coupon.endAt,
                }))" :disabled-coupons="disabledCoupons.map(coupon => ({
                    ...coupon,
                    originCondition: coupon.originCondition * 100,
                    startAt: coupon.startAt,
                    endAt: coupon.endAt,
                }))" :chosen-coupon="chosenCouponIndex" @change="onChange" @exchange="onExchange">
                </van-coupon-list>
            </van-popup>

        </div>


        <footer class="co-footer">
            <van-submit-bar :price="pay()" button-text="去支付" @submit="onClickpay" tip-icon="info-o">
                <template #tip> {{ shippingTip }} </template>
            </van-submit-bar>
        </footer>

        <van-popup v-model:show="showLogin" style="border-radius: 24px;" closeable close-icon="cross"
            close-icon-position="top-right">
            <Login @loginSuccess="handleLoginSuccess" />
        </van-popup>

        <van-popup v-model:show="showPay" position="bottom" :style="{ height: '50%' }" closeable
            @click-overlay="onClickOverlay" @click-close-icon="onClickCloseIcon">
            <div style="height: 100%; overflow-y: auto; margin: 50px 20px;">
                <van-cell-group inset>

                    <van-cell>
                        <template #title>
                            <div class="pay-line">
                                <van-icon name="alipay" size="24px" />
                                <span style="font-weight: bold;">支付宝</span>
                            </div>
                        </template>
                        <template #right-icon>
                            <van-checkbox :checked="selectedPay === '支付宝'" @click="selectPay('支付宝')" />
                        </template>
                    </van-cell>

                    <van-cell>
                        <template #title>
                            <div class="pay-line">
                                <van-icon name="wechat-pay" size="24px" />
                                <span style="font-weight: bold;">微信支付</span>
                            </div>
                        </template>
                        <template #right-icon>
                            <van-checkbox :checked="selectedPay === '微信支付'" @click="selectPay('微信支付')" />
                        </template>
                    </van-cell>

                    <van-cell>
                        <template #title>
                            <div class="pay-line">
                                <van-icon name="card" size="24px" />
                                <span style="font-weight: bold;">银行卡</span>
                            </div>
                        </template>
                        <template #right-icon>
                            <van-checkbox :checked="selectedPay === '银行卡'" @click="selectPay('银行卡')" />
                        </template>
                    </van-cell>

                </van-cell-group>
            </div>
        </van-popup>

    </div>
</template>

<script>
import { showConfirmDialog, showToast } from 'vant';
import { mapGetters } from "vuex";
import Login from "@/components/Login.vue";
import { doc, setDoc, collection, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { toRaw } from "vue";

export default {
    name: "checkout",
    components: {
        Login,
    },
    data() {
        return {
            show: false,
            actions: [
                { name: '顺丰普快' },
                { name: '顺丰特快' },
                { name: '次日达', subname: '购物专供' },
            ],
            coupons: [], // 初始化优惠券
            showList: false,
            chosenCoupon: null,
            chosenCouponIndex: -1,
            showNavbar: true,
            needPostage: true,
            postage: 12,
            postageFinal: 0,
            selectedValue: '',
            showLogin: false,
            showPay: false,
            selectedPay: "",
            isPlacingOrder: false,
            isPaying: false,
            availableCoupons: [],
            disabledCoupons: [],
        };
    },
    computed: {
        ...mapGetters("auth", ["username", "isLogin", "uid"]),

        cartGoods() {
            return this.$store.state.checkGoods;
        },
        address() {
            return this.$store.state.selectedAddress;
        },
        amount() {
            let cartGoods = this.$store.state.checkGoods;
            let result = 0;
            cartGoods.forEach(good => {
                result += good.price * good.count;
            });
            return result * 100;
        },
        postageAmount() {
            return this.amount >= 4900 ? 0 : this.postage * 100;
        },
        shippingTip() {
            if (this.amount >= 4900) {
                return "实际消费满49元免邮费，已包邮";
            } else {
                const remaining = (4900 - this.amount) / 100; // 计算还需消费金额
                return `实际消费满49元免邮费，仍需消费 ¥${remaining.toFixed(2)}`;
            }
        },
        postageDisplay() {
            return `¥ ${(this.postageAmount / 100).toFixed(2)}`;
        },
    },
    methods: {
        pay() {
            let discount = 0;
            if (this.chosenCouponIndex !== -1) {
                discount = this.availableCoupons[this.chosenCouponIndex].valueDesc;
            }

            let total = this.amount - discount * 100;

            total += this.postageAmount;

            return Math.max(total, 0);
        },
        getChosenCouponIndex() {
            if (!this.chosenCoupon || !this.chosenCoupon.id) {
                return -1; // 如果没有选中优惠券，返回 -1
            }

            // 在可用优惠券中查找选中优惠券的索引
            const index = this.availableCoupons.findIndex(
                (coupon) => coupon.id === this.chosenCoupon.id
            );

            this.chosenCouponIndex = index;
        },

        formatTimestamp(timestamp) {
            const date = new Date(timestamp);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}.${month}.${day}`;
        },
        getAvailableCoupons() {
            return this.cartGoods.map((item) => {
                const availableCoupons = [];
                const disabledCoupons = [];


                // 分组优惠券
                this.coupons.forEach((coupon) => {
                    coupon.startAt = Number(coupon.startAt);
                    coupon.endAt = Number(coupon.endAt);
                    if (item.price * item.count >= coupon.originCondition) {
                        availableCoupons.push(coupon);
                    } else {
                        disabledCoupons.push({
                            ...coupon,
                            reason: `需消费满 ${coupon.originCondition} 元`,
                        });
                    }

                });
                return {
                    ...item,
                    availableCoupons,
                    disabledCoupons,
                };
            });
        },

        openCouponPopup() {
            const couponMap = new Map(); // 初始化为 Map 类型

            // 遍历选中商品，提取所有优惠券并去重
            this.cartGoods.forEach((item) => {
                
                if (item.coupons && Array.isArray(item.coupons)) {
                    item.coupons.forEach((coupon) => {
                        if (!couponMap.has(coupon.id)) {
                            couponMap.set(coupon.id, coupon); // 根据 id 去重
                        }
                    });
                }
            });

            // 将 Map 转为数组
            const uniqueCoupons = Array.from(couponMap.values());

            // 筛选可用优惠券和不可用优惠券
            this.availableCoupons = uniqueCoupons.filter(
                (coupon) =>
                    Date.now() >= coupon.startAt &&
                    Date.now() <= coupon.endAt &&
                    (this.amount / 100) >= coupon.originCondition
            );
            
            this.disabledCoupons = uniqueCoupons.filter(
                (coupon) =>
                    Date.now() > coupon.endAt || // 过期
                    Date.now() < coupon.startAt || // 未开始
                    (this.amount / 100) < coupon.originCondition // 总金额不足
            );

            this.availableCoupons.forEach((coupon) => {
                coupon.startAt = Number(coupon.startAt);
                coupon.endAt = Number(coupon.endAt) ;
            });

            this.disabledCoupons.forEach((coupon) => {
                coupon.startAt = Number(coupon.startAt)  ;
                coupon.endAt = Number(coupon.endAt) ;
            });

            console.log(this.availableCoupons);
            console.log(this.disabledCoupons);
            this.showList = true; // 显示优惠券弹窗
        },

        onChange(index) {
            if (index === -1) {
                // 如果用户点击“不选择”，将 chosenCoupon 设置为 -1
                this.chosenCouponIndex = -1;
            } else {
                this.getChosenCouponIndex();

                this.chosenCouponIndex = index;
                console.log(this.chosenCoupon);
            }

            this.showList = false; // 关闭弹窗
        },
        onExchange(code) {
            const newCoupon = {
                id: `new-${Date.now()}`,
                name: `兑换券-${code}`,
                originCondition: 200,
                valueDesc: "20",
                unitDesc: "元",
                startAt: Date.now(),
                endAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 有效期7天
            };
            this.coupons.push(newCoupon);
            this.openCouponPopup();
        },
        selectPay(pay) {
            this.selectedPay = pay; // 设置选中的支付方式
            this.showPay = false; // 关闭弹窗
        },
        onClickLeft() {
            showConfirmDialog({
                title: '确定返回吗？',
                message: '返回后，当前选择将不被保存。',
                confirmButtonText: '返回',
                cancelButtonText: '再想想',
            })
                .then(() => {
                    this.$router.go(-1);
                })
                .catch(() => {
                    // on cancel
                });
        },
        async onClickpay() {
            if (this.address === null) {
                showToast('请选择地址');
                return;
            } else if (this.selectedValue === '') {
                showToast('请选择配送方式');
                return;
            } else if (this.selectedPay === '') {
                showToast('请选择支付方式');
                return;
            } else if (!this.isLogin) {
                showToast('请先登录');
                this.showLogin = true;
                return;
            }

            this.isPaying = true;
            // 防止重复提交
            if (this.isPlacingOrder) return;
            this.isPlacingOrder = true;

            try {
                // 设置订单数据
                const orderData = {
                    createdAt: new Date(),
                    items: this.cartGoods,
                    totalPrice: (this.amount / 100).toFixed(2),
                    discount: this.coupons[this.chosenCoupon]?.value / 100 || 0,
                    shippingFee: this.postageAmount / 100,
                    finalAmount: (this.pay / 100).toFixed(2),
                    address: this.address,
                    paymentMethod: this.selectedPay,
                    shippingMethod: this.selectedValue,
                };
                // 上传订单数据到 Firestore
                const ordersCollection = collection(db, `users/${this.uid}/orders`);
                const newOrderRef = doc(ordersCollection);
                await setDoc(newOrderRef, orderData);

                // 对应商品库存减少
                for (const item of this.cartGoods) {
                    const productRef = doc(db, "products", item.id);

                    await updateDoc(productRef, {
                        quantity: item.quantity - item.count, // 减少库存
                        sold: (item.sold || 0) + item.count, // 增加已售数量
                    });
                }

                const orderId = newOrderRef.id;

                showToast('订单提交成功');
                this.$router.push({
                    path: `/OrderDetail/${orderId}`,
                    query: { orderData: JSON.stringify(orderData) },
                });

            } catch (error) {
                console.error('订单提交失败：', error);
                showToast('订单提交失败，请稍后重试');
            } finally {
                this.isPlacingOrder = false;
                this.isPaying = false;
            }
        },
        GoToAddress() {
            this.$router.push({
                path: '/address',
            });
        },
        onSelect(action) {
            this.selectedValue = action.name;
            this.show = false;
        },
    },

};
</script>

<style>
.checkout {
    background: #eee;
    min-height: 90vh;
    color: #fff;
    margin-bottom: 50px;
}

.address-container {
    margin-top: 30px;
    padding: 10px;

}

.address-cell {
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 10px;
}

.co-footer {
    width: 100%;
    height: 8%;
    position: fixed;
    bottom: 0;
    left: 0;
    border-top: 1px solid #eee;
    background-color: #fff;
    font-size: 0;
    margin-bottom: 30px;

    .van-submit-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 1;
    }
}

.pay-line {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>