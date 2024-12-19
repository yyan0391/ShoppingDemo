<script>
export default {
  components: {
    
  }
}
</script>

<template>
  <div id="app">
    <transition
      name="fade"
      mode="out-in" 
    >
    <router-view to="/" />
  </transition>
    

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
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
