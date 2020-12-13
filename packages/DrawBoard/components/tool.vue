<template>
  <div class="tool">
    <el-tooltip effect="dark" content="折线" placement="right">
      <i class="el-icon-arrow-down" @click="changeTool('polyline')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="矩形" placement="right">
      <i class="el-icon-news" @click="changeTool('rectangle')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="多边形" placement="right">
      <i class="el-icon-house" @click="changeTool('polygon')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="点" placement="right">
      <i class="el-icon-aim" @click="changeTool('point')"></i>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: "tool",
  data() {
    return {
    };
  },
  methods: {
    changeTool(eventName) {
      this.$emit("toolSelected", eventName);
    },
  },
};
</script>

<style lang="scss" scoped>
.tool {
  width: 30px;
  margin: 0px 5px;
}
[class*=" el-icon-"],
[class^="el-icon-"] {
  box-sizing: border-box;
  height: 30px;
  width: 30px;
  line-height: 30px;
  font-size: 20px;
  padding: 0 5px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.4);
  cursor: pointer;
  &:nth-child(1) {
    margin-top: 5px;
  }
  &:hover {
    border-radius: 3px;
    background-color: rgba(0, 0, 0, 0.4);
  }
}
</style>