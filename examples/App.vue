<template>
  <div>
    <drawboard :url="url"></drawboard>
  </div>
</template>

<script>
export default {
  name:'example',
  data(){
    return {
      url:"https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg",
      labelDataOrigin:[],
      loadingData:false
    }
  }
}
</script>