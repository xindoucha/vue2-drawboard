<template>
  <div>
    <draw-board :url="url"></draw-board>
  </div>
</template>

<script>
import DrawBoard from '../DrawBoard/index.vue';
export default {
  name:'demo',
  components: {
    DrawBoard
  },
  data(){
    return {
      url:"http://47.110.145.166:8087/task184/0716_2/Xnip2020-07-17_08-56-37.jpg",
      labelDataOrigin:[],
      loadingData:false
    }
  }
}
</script>