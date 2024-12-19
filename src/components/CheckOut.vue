<template>
    <div class="checkout">
        <van-nav-bar title="我的购物车" left-text="返回" left-arrow class="custom-title" @click-left="onClickLeft">
        </van-nav-bar>
<van-row>
        <Divider content="收货地址" />  

<van-cell-group inset class="address-cell">
    <van-cell :title="address ? address : '选择地址'" icon="location-o"  value="新建" is-link
            @click="GoToAddress" >
        </van-cell>
</van-cell-group>
        
</van-row>
        <van-card-group>
            <van-card v-for="item in cartGoods" :key="item.id" :title="item.title" :thumb="item.image"
                :desc="item.description" :price="item.price * item.count" :num="item.count" class="card">
            </van-card>

        </van-card-group>


        <van-cell-group inset>
            <van-cell title="商品原价">
                <template #value>
                    <span style="font-weight: bold;">¥ {{ amount/100 }}</span>
                </template>
            </van-cell>
            <van-cell title="配送服务" is-link value="次日达"></van-cell>
            <van-cell title="运费" :value="postageDisplay">
            </van-cell>
            <van-coupon-cell :coupons="coupons" :chosen-coupon="chosenCoupon" @click="showList = true" />
        </van-cell-group>
        <van-popup v-model:show="showList" round position="bottom" style="height: 90%; padding-top: 4px;">
            <van-coupon-list :coupons="coupons" :chosen-coupon="chosenCoupon" :disabled-coupons="disabledCoupons"
                @change="onChange" @exchange="onExchange" />
        </van-popup>




        <footer class="co-footer">
            <van-submit-bar :price="pay" button-text="去支付" @submit="onClickpay">
                <template #tip> {{ shippingTip }} </template>
            </van-submit-bar>
        </footer>



    </div>
</template>

<script>
import { Divider } from 'vant';
import { ref } from 'vue';
export default {
    data() {
        return {
            showNavbar: true,
            needPostage: true,
            postage: 12,
            postageFinal: 0,
        }
    },
    setup() {
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
        };
    },
    name: 'CheckOut',
    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },
        onClickpay() {
            this.$router.push({
                path: '/pay',
            })
        },
        GoToAddress() {
            this.$router.push({
                path: '/address',
            })
        },
    },
    
    computed: {
        cartGoods() {
            return this.$store.state.cartGoods;
        },
        address() {
            return this.$store.state.address;
        },
        //商品总价
        amount() {
            let cartGoods = this.$store.state.cartGoods;
            let result = 0;
            cartGoods.forEach(good => {
                result += good.price * good.count;
            })
            return result * 100;
        },
        counter() {
            let that = this;
            let cartGoods = this.$store.state.cartGoods;
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
            return "实际消费满49元包邮，已包邮";
        } else {
            const remaining = (4900 - this.amount) / 100; // 计算还需消费金额
            return `实际消费满49元包邮，仍需消费 ¥${remaining.toFixed(2)}`;
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
    /* 确保背景图片覆盖整个页面 */
    /* margin: 0; */
    /* 清除默认外边距 */
    /* padding: 0; */
    /* 清除默认内边距 */
    min-height: 90vh;
    color: #fff;
}

.address-cell {
    /* border-radius: 12px; */
    margin-top: 8px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    /* 可选：添加阴影效果 */
    /* overflow: hidden; */
    /* 避免内容超出圆角范围 */
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
</style>