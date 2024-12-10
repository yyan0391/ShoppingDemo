<template>
    <div class="home">
        <van-row>
            <van-search 
        value="{{ value }}" 
        placeholder="请输入搜索关键词" 
        show-action 
        bind:search="onSearch"
        bind:cancel="onCancel" />
        </van-row>
        <van-row>
            <HomeColumn />
        </van-row>
        
    </div>
</template>

<script>
import HomeColumn from './HomeColumn.vue'

export default {
    data() {
        return {
            value: ''
        }
    },
    components: {
        HomeColumn
    },
    methods: {
        onSearch(value) {
            this.$router.push({ path: '/search', query: { keyword: value } })
        },
        onCancel() {
            this.$router.push({ path: '/' })
        }
    }
}
</script>

<style>
.home{
  width: 100%;
  padding-top: 50px;
  /* padding-bottom: 5px;
  padding-top: 5px; */
}
</style>