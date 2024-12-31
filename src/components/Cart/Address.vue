<template>
    <div class="address">
        <van-nav-bar title="我的地址" left-text="返回" left-arrow @click-left="goBack" class="custom-title"></van-nav-bar>
        <van-overlay v-model:show="isLoading" z-index="2000">
            <van-loading size="30px" type="spinner" color="#1989fa" />
        </van-overlay>

        <div class="address-list">
        

        <van-empty v-if="addressList.length === 0" description="暂无收货地址" />
        <van-address-list v-model="chosenAddressId" :list="addressList" :switchable="true" @edit="onEdit"
            @add="this.showAdd = true" @select="onSelect" default-tag-text="默认地址">
        </van-address-list>

        <!-- 编辑地址弹窗 -->
        <van-popup v-model:show="showEdit" round position="bottom"
            style="height: 80%; padding-top: 4px; background-color:aliceblue;">
            <van-nav-bar title="修改地址" style="background-color: aliceblue;">
                <template #left>
                    <span class="button-text" @click="this.showEdit = false">取消</span>
                </template>
            </van-nav-bar>
            <van-address-edit :area-list="areaList" :address-info="address" show-set-default show-delete
                @save="onSaveEdit" @cancel="onCancel" @delete="onDelete"
                :area-columns-placeholder="['请选择省', '请选择市', '请选择区']" />
        </van-popup>

        <!-- 新增地址弹窗 -->
        <van-popup v-model:show="showAdd" round position="bottom"
            style="height: 80%; padding-top: 4px; background-color:aliceblue;">
            <van-overlay v-model:show="isLoadingAdd" z-index="2000">
                <van-loading size="30px" type="spinner" color="#1989fa" />
            </van-overlay>
            <van-nav-bar title="新增地址" style="background-color: aliceblue;">
                <template #left>
                    <span class="button-text" @click="this.showAdd = false">取消</span>
                </template>
            </van-nav-bar>
            <van-address-edit :area-list="areaList" show-set-default @save="onAdd" @cancel="onCancel"
                :area-columns-placeholder="['请选择省', '请选择市', '请选择区']" />
        </van-popup>
        </div>


    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex'; // 引入 useStore
import { useRouter } from 'vue-router';
import { showConfirmDialog } from 'vant';
import { mapGetters } from "vuex";

import {
    doc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export default {
    name: 'Address',
    data() {
        return {
            showEdit: false,
            showAdd: false,
            isLoading: false,
            isLoadingAdd: false,
            address: {
                id: null,
                name: '',
                tel: '',
                province: '',
                city: '',
                county: '',
                address: '',
                isDefault: false, // 是否为默认地址
            },
            addressList: [],

            areaList: {
                province_list: {
                    110000: '北京市',
                    120000: '天津市',
                    440000: '广东省',
                    310000: '上海市',
                },
                city_list: {
                    110100: '北京市',
                    120100: '天津市',
                    440100: '广州市',
                    310100: '上海市',
                },
                county_list: {
                    110101: '东城区',
                    110102: '西城区',
                    110105: '朝阳区',
                    110106: '丰台区',
                    110107: '石景山区',
                    110108: '海淀区',
                    110109: '门头沟区',
                    110111: '房山区',
                    110112: '通州区',
                    110113: '顺义区',
                    110114: '昌平区',
                    110115: '大兴区',
                    110116: '怀柔区',
                    110117: '平谷区',
                    110118: '密云区',
                    110119: '延庆区',
                    440103: '荔湾区',
                    440104: '越秀区',
                    440105: '海珠区',
                    440106: '天河区',
                    440111: '白云区',
                    440112: '黄埔区',
                    440113: '番禺区',
                    440114: '花都区',
                    440115: '南沙区',
                    440117: '从化区',
                    440118: '增城区',
                    310101: '黄浦区',
                    310104: '徐汇区',
                    310105: '长宁区',
                    310106: '静安区',
                    310107: '普陀区',
                    310109: '虹口区',
                    310110: '杨浦区',
                    310112: '闵行区',
                    310113: '宝山区',
                    310114: '嘉定区',
                    310115: '浦东新区',
                    310116: '金山区',
                    310117: '松江区',
                    310118: '青浦区',
                    310120: '奉贤区',
                    310151: '崇明区',
                },
            },
            chosenAddressId: null,
        };
    },
    setup() {
        const onAdd = () => showToast('Add');
        const onEdit = () => showToast('Edit');
        const store = useStore(); // 获取 Vuex store 实例
        const router = useRouter(); // 获取 Vue Router 实例
        const chosenAddressId = ref(null);
        // 点击地址时设置选中地址并跳转到上一个页面
        const onSelect = (address) => {
            console.log('选中的地址：', address);
            store.commit('setSelectedAddress', address); // 保存选中地址到 Vuex
            router.go(-1); // 跳转到上一个页面
        };

        return {
            chosenAddressId,
            onAdd,
            onEdit,
            onSelect,
        };
    },
    computed: {
        ...mapGetters("auth", ["username", "uid"]),
        userId() {
            return this.uid;
        },

    },
    methods: {
        // 加载地址列表
        async loadAddresses() {
            this.isLoading = true;
            try {
                const addressesRef = collection(db, 'users', this.userId, 'addresses');
                const querySnapshot = await getDocs(addressesRef);
                this.addressList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                this.isLoading = false;
            } catch (error) {
                console.error('加载地址失败:', error);
            }
        },

        async onAdd(newAddress) {
            this.isLoadingAdd = true;
            try {
                const addressesRef = collection(db, 'users', this.userId, 'addresses');

                // 如果是默认地址，清除其他默认地址
                if (newAddress.isDefault) {
                    await this.clearDefaultAddress();
                }

                const docRef = await addDoc(addressesRef, {
                    ...newAddress,
                    country: '中国', // 默认国家
                    address: `${newAddress.country} ${newAddress.province} ${newAddress.city} ${newAddress.county} ${newAddress.addressDetail}`,
                });
                await updateDoc(docRef, { id: docRef.id });
                this.loadAddresses();
                this.isLoadingAdd = false;
                this.showAdd = false;

            } catch (error) {
                console.error('新增地址失败:', error);
            }
        },

        // 修改地址
        async onSaveEdit(updatedAddress) {
            this.isLoadingAdd = true;
            try {
                const addressRef = doc(db, 'users', this.userId, 'addresses', updatedAddress.id);

                // 如果是默认地址，清除其他默认状态
                if (updatedAddress.isDefault) {
                    await this.clearDefaultAddress();
                }

                await updateDoc(addressRef, updatedAddress);
                this.loadAddresses();
                this.isLoadingAdd = false;
                this.showEdit = false;
            } catch (error) {
                console.error('修改地址失败:', error);
            }
        },
        // 删除地址
        async onDelete() {
            try {
                const confirmed = await showConfirmDialog({
                    title: '删除地址',
                    message: '确定要删除此地址吗？',
                    confirmButtonText: '删除',
                    cancelButtonText: '再想想',
                });

                if (confirmed) {
                    this.isLoadingAdd = true;
                    console.log('删除地址:', this.address);

                    // 引用 Firestore 文档
                    const addressRef = doc(db, 'users', this.userId, 'addresses', this.address.id);

                    // 删除地址文档
                    await deleteDoc(addressRef);

                    // 重新加载地址列表
                    await this.loadAddresses();

                    // 隐藏编辑界面
                    this.showEdit = false;
                }
            } catch (error) {
                // 捕获错误
                console.error('删除地址失败:', error);
            } finally {
                // 确保加载状态被关闭
                this.isLoadingAdd = false;
            }
        },

        async clearDefaultAddress() {
            try {
                const addressesRef = collection(db, 'users', this.userId, 'addresses');
                const querySnapshot = await getDocs(addressesRef);
                querySnapshot.forEach(async (doc) => {
                    if (doc.data().isDefault) {
                        await updateDoc(doc.ref, { isDefault: false });
                    }
                });
            } catch (error) {
                console.error('清除默认地址失败:', error);
            }
        },

        goBack() {
            this.$router.go(-1);
        },
        toAddAddressPage() {
            this.$router.push({
                path: '/Profile/AddAddressPage'
            })
        },
        onEdit(address) {
            this.address = { ...address };
            this.showEdit = true;
        },

    },
    mounted() {
        this.loadAddresses();
    },
}
</script>
<style>
.address {
    height: 100%;
    min-height: 100vh;
    background-color: #efefef;
}

.address-list {
    margin-top: 40px;
}
.van-overlay {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>