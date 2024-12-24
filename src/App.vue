<script>
export default {
  components: {
    
  }
}
</script>

<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition
        name="fade"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>

#app {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  position: relative;
  font-weight: normal;
  padding-bottom: 50px; /* 给导航栏留出空间 */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
