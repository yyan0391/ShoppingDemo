<script>
export default {
  components: {
    
  }
}
</script>

<template>
  <div id="app">
    <router-view to="/" />
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
</style>
