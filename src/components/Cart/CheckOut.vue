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
                <van-coupon-cell :coupons="coupons" :chosen-coupon="chosenCoupon" @click="showList = true" />
            </van-cell-group>

            <van-cell-group inset style="margin: 15px; padding: 10px;">
                <van-cell title="支付方式" is-link :value="selectedPay || '请选择支付方式'" @click="showPay = true">
                </van-cell>
            </van-cell-group>
            <van-popup v-model:show="showList" round position="bottom" style="height: 90%; padding-top: 4px;">
                <van-coupon-list :coupons="coupons" :chosen-coupon="chosenCoupon" :disabled-coupons="disabledCoupons"
                    @change="onChange" @exchange="onExchange" />
            </van-popup>

        </div>


        <footer class="co-footer">
            <van-submit-bar :price="pay" button-text="去支付" @submit="onClickpay" tip-icon="info-o">
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
import { Divider } from 'vant';
import { ref } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import { mapGetters } from "vuex";
import Login from "@/components/Login.vue";
import { doc, setDoc, collection ,updateDoc} from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default {
    name: "checkout",
    components: {
        Login,
    },
    setup() {
        const show = ref(false);
        const actions = [
            { name: '顺丰普快' },
            { name: '顺丰特快' },
            { name: '次日达', subname: '购物专供' },
        ];

        const coupon = {
            available: 1,
            originCondition: 0,
            reason: '未满500元，不可用',
            value: 150,
            name: '消费券',
            startAt: 1489104000,
            endAt: 1514592000,
            valueDesc: '1.5',
            unitDesc: '元',
        };
        const coupon2 = {
            available: 0, // 不可用优惠券
            originCondition: 20000,
            reason: '该优惠券已过期',
            value: 5000,
            name: '满200减50',
            startAt: 1489104000,
            endAt: 1514592000,
            valueDesc: '50',
            unitDesc: '元',
        };

        const coupon3 = {
            available: 1,
            originCondition: 0, // 无门槛使用
            reason: '',
            value: 2000,
            name: '无门槛优惠券',
            startAt: 1489104000,
            endAt: 1514592000,
            valueDesc: '20',
            unitDesc: '元',
        };


        const coupons = ref([coupon, coupon2, coupon3]);
        const showList = ref(false);
        const chosenCoupon = ref(-1);

        const onChange = (index) => {
            showList.value = false;
            chosenCoupon.value = index;
        };
        const onExchange = (code) => {
            coupons.value.push(coupon);
        };

        return {
            coupons,
            showList,
            onChange,
            onExchange,
            chosenCoupon,
            disabledCoupons: [coupon],
            show,
            actions,
        };
    },
    data() {
        return {
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

        }
    },
    name: 'CheckOut',
    methods: {
        selectPay(pay) {
            this.selectedPay = pay; // 设置选中的支付方式
            this.showPay = false; // 关闭弹窗
        },
        onClickLeft() {
            showConfirmDialog({
                title: '确定返回吗？',
                message:
                    '返回后，当前选择将不被保存。',
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
                showToast('请选择支付方式')
                return;
            } else if (this.isLogin === false) {
                showToast('请先登录');
                this.showLogin = true;

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
                // 上传订单数据到Firestore
                const ordersCollection = collection(db, `users/${this.uid}/orders`);
                const neworderRef = doc(ordersCollection);
                await setDoc(neworderRef, orderData);

                // 对应商品库存减少
                for (const item of this.cartGoods) {
                    const productRef = doc(db, "products", item.id);

                    await updateDoc(productRef, {
                        quantity: item.quantity - item.count, // 减少库存
                        sold: (item.sold || 0) + item.count,  // 增加已售数量
                    });
                }


                const orderId = neworderRef.id;

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
            })
        },
        onSelect(action) {
            this.selectedValue = action.name;
            this.show = false;
        },
    },

    computed: {

        // ...mapState("auth", ["user"]),
        ...mapGetters("auth", ["username", "isLogin", "uid"]),

        cartGoods() {
            return this.$store.state.checkGoods;
        },
        address() {
            return this.$store.state.selectedAddress;
        },
        //商品总价
        amount() {
            let cartGoods = this.$store.state.checkGoods;
            let result = 0;
            cartGoods.forEach(good => {
                result += good.price * good.count;
            })
            return result * 100;
        },
        counter() {
            let that = this;
            let cartGoods = this.$store.state.checkGoods;
            let result = 0;
            cartGoods.some(good => {
                if (good.id === that.id) {
                    result = good.count;
                }
            });
            return result;
        },
        postageAmount() {
            // 如果总金额 >= 49 元，则运费为 0；否则运费为 12 元（以分为单位）
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

        // 合计支付金额
        pay() {
            // 获取当前选中优惠券金额
            let discount = 0;
            if (this.chosenCoupon !== -1) {
                discount = this.coupons[this.chosenCoupon].value; // 获取选中优惠券的 value
            }

            // 计算优惠后的总金额
            let total = this.amount - discount;

            // 判断是否需要运费
            total += this.postageAmount;

            // 最小值为 0，防止出现负数
            return Math.max(total, 0);
        },
        postageDisplay() {
            // 运费金额格式化为 "元"
            return `¥ ${(this.postageAmount / 100).toFixed(2)}`;
        },
    },
}

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
    /* border-radius: 12px; */
    /* width: 100%; */
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card {
    background-color: #ffffff;
    /* 设置背景颜色 */
    border-radius: 12px;
    /* 可选：添加圆角 */
    padding: 10px;
    /* 可选：调整内边距 */
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
        /* 让 van-action-bar 定位在 footer 的顶部 */
        top: 0;
        /* 靠近 footer 的顶部 */
        left: 0;
        width: 100%;
        /* 占满 footer 的宽度 */
        z-index: 1;
        /* 确保它显示在其他内容上方 */
    }
}

.pay-line {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>