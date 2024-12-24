<template>
    <div class="address">
        <van-nav-bar title="我的地址" left-text="返回" left-arrow right-text="管理地址" @click-left="goBack"
            @click-right="addressMan" class="custom-title"></van-nav-bar>

        <van-address-list v-model="chosenAddressId" :list="addressList" :switchable="true" @edit="showEdit = true;this.address = { ...addressList };"
            @add="onAdd" @select="onSelect" default-tag-text="默认地址">

            <template #bottom>
                <van-button round block type="primary" @click="onAdd">新增地址</van-button>
            </template>
        </van-address-list>

        <van-popup v-model:show="showEdit" round position="bottom"
            style="height: 80%; padding-top: 4px; background-color:aliceblue;">
            <van-nav-bar title="修改地址" style="background-color: aliceblue;">
                <template #left>
                    <span class="button-text" @click="this.showEdit = false">取消</span>
                </template>
            </van-nav-bar>
            <van-address-edit 
                :area-list="areaList"
                v-model:address-info="addressList"
                show-set-default 
                show-delete 
                @save="onSave"
                @cancel="onCancel" 
                @delete="onDelete" 
                :area-columns-placeholder="['请选择省', '请选择市', '请选择区']" 
            />
        </van-popup>

    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex'; // 引入 useStore
import { useRouter } from 'vue-router';

export default {
    name: 'Address',
    data() {
        return {
            showEdit: false,
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
        // chosenAddressId() {
        //   return this.$store.state.address.find((item) => item.isDefault)?.id || null;
        // },
        addressList() {
            return this.$store.state.address.map((item) => ({
                id: item.id,
                name: item.name,
                tel: item.tel,
                city: item.city,
                province: item.province,
                county: item.county,
                address: `${item.province} ${item.city} ${item.county} ${item.address}`,
                isDefault: item.isDefault,
            }));
        },
        disabledList() {
            return ['3'];
        },
    },
    methods: {
        goBack() {
            this.$router.go(-1);
        },
        toAddAddressPage() {
            this.$router.push({
                path: '/Profile/AddAddressPage'
            })
        },
        addressMan() {
            // 管理地址
        },
    }
}
</script>
<style>
.address {
    height: 100%;
    min-height: 100vh;
    background-color: #efefef;
}
</style>