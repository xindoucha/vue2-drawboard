<template>
  <div>
    <drawboard :url="url" @updateData="updateData"></drawboard>
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
  },
  methods:{
    updateData(data) {
      // console.log(data);
    }
  }
}
</script>