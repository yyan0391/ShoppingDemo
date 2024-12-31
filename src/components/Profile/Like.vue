<template>
    <div>
        <van-nav-bar title="收藏夹" left-text="返回" left-arrow @click-left="goBack" class="custom-title"></van-nav-bar>
        <div class="like-content">
            <div v-if="likes.length > 0">
                <van-card-group>
                    <van-card v-for="item in likes" :key="item.id" :title="item.title" :thumb="item.images[0]"
                        :desc="item.description" :price="item.price" :num="item.count" class="card"
                        @click="GoDetail(item)">

                        <template #footer>
                            <van-button type="danger" size="small" @click.stop="removeFromLikes(item)">移除</van-button>
                        </template>
                    </van-card>

                </van-card-group>
            </div>
            <div v-else>
                <van-empty description="您还没有收藏任何商品" />
            </div>
        </div>

    </div>

</template>

<script>
import { collection, getDocs, deleteDoc,doc } from 'firebase/firestore';
import { mapGetters } from 'vuex';
import { db } from '@/firebaseConfig';
import GoodDetail from '../Home/GoodDetail.vue';
import { showConfirmDialog } from 'vant';

export default {
    data() {
        return {
            likes: [],
        };
    },
    methods: {
        goBack() {
            this.$router.go(-1);
        },
        async loadLikes() {
            try {
                const LikeRef = collection(db, 'users', this.userId, 'favorites')
                const querySnapshot = await getDocs(LikeRef);
                this.likes = querySnapshot.docs.map((doc) => ({

                    ...doc.data(),
                }));
                console.log("收藏夹数据:", this.likes);
            } catch (error) {
                console.error("获取收藏夹数据失败:", error);
            }
        },
        removeFromLikes(item) {
            showConfirmDialog({
                title: '确认移除',
                message: '您确定要从收藏夹移除这个商品吗？',
                confirmButtonText: '移除',
                cancelButtonText: '取消',
            }).then(async () => {
                const deleteLikeRef = doc(db, `users/${this.userId}/favorites`, item.productId);
                try {
                    deleteDoc(deleteLikeRef);
                    this.likes = this.likes.filter((like) => like.productId !== item.productId);
                } catch (error) {
                    console.error("删除收藏失败:", error);
                }
                this.loadLikes();
            });

        },
        GoDetail(item) {
            this.$router.push({
                path: "/GoodDetail",
                query: { items: JSON.stringify(item) },
            });
        },
    },
    computed: {
        ...mapGetters("auth", ["username", "uid"]),
        userId() {
            return this.uid;
        },
    },
    mounted() {
        this.loadLikes();
    },
}
</script>
<style>
.like-content {
    margin-top: 50px;
}
</style>