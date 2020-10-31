<template>
  <div id="app">
    <demo></demo>
  </div>
</template>

<script>
import demo from './demo/index.vue'

export default {
  name: 'App',
  components: {
    demo
  }
}
</script>

<style lang="scss">
body{
  margin: 0;
  padding: 0;
}
</style>
