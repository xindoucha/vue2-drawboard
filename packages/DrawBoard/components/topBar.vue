<template>
  <div class="bar">
    <el-tooltip effect="dark" content="放大" placement="bottom" class="icon">
      <i class="el-icon-zoom-in" @click="changeEvent('zoomIn')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="缩小" placement="bottom">
      <i class="el-icon-zoom-out" @click="changeEvent('zoomOut')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="向右旋转" placement="bottom">
      <i class="el-icon-refresh-right" @click="changeEvent('rotateRight')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="向左旋转" placement="bottom">
      <i class="el-icon-refresh-left" @click="changeEvent('rotateLeft')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="移动" placement="bottom">
      <i class="el-icon-rank" @click="changeEvent('move')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="全屏" placement="bottom">
      <i class="el-icon-full-screen" @click="changeEvent('fullScreen')"></i>
    </el-tooltip>
    <el-tooltip effect="dark" content="清空画布" placement="bottom">
      <el-popconfirm
        confirmButtonText="确定"
        cancelButtonText="取消"
        icon="el-icon-info"
        iconColor="red"
        @onConfirm="changeEvent('clearAll')"
        title="确定清空画布吗？"
      >
        <i class="el-icon-delete" slot="reference"></i>
      </el-popconfirm>
    </el-tooltip>
    <el-tooltip effect="dark" content="设置" placement="bottom">
      <i class="el-icon-setting" @click="configDialogVisiable = true"></i>
    </el-tooltip>
    <div class="text-container">
      <div class="text">对比度: </div>
      <el-slider v-model="contrast" :format-tooltip="formatTooltip" :debounce="20"></el-slider>
    </div>
    <div class="text-container">
      <div class="text">亮度: </div>
      <el-slider v-model="brightness" :format-tooltip="formatTooltip" :debounce="20"></el-slider>
    </div>
    <div class="status">
      当前状态：{{this.currentStatus}}
    </div>
    
    <el-dialog
      title="画布设置"
      :close-on-click-modal="false"
      :visible.sync="configDialogVisiable"
      width="400px"
      :show-close = "false"
    >
      <el-form label-position="left" label-width="100px" size="mini" :model="config">
        <el-form-item label="线框颜色：">
          <el-color-picker v-model="config.path_strokeStyle" size="mini"></el-color-picker>
        </el-form-item>
        <el-form-item label="控制圈颜色：">
          <el-color-picker v-model="config.point_strokeStyle" size="mini"></el-color-picker>
        </el-form-item>
        <el-form-item label="线框宽度：">
          <el-input-number size="mini" v-model="config.path_lineWidth"></el-input-number>
        </el-form-item>
        <el-form-item label="控制圈宽度：">
          <el-input-number size="mini" v-model="config.point_lineWidth"></el-input-number>
        </el-form-item>
        <el-form-item label="控制圈半径：">
          <el-input-number size="mini" v-model="config.point_radis"></el-input-number>
        </el-form-item>
        <el-form-item label="背景格：">
          <el-switch
            v-model="config.grid"
            active-color="#66a6ff"
            inactive-color="#999"
          ></el-switch>
        </el-form-item>
        <el-form-item label="导航线：">
          <el-switch v-model="config.guid" active-color="#66a6ff" inactive-color="#999"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="configDialogVisiable = false">取 消</el-button>
        <el-button size="small" type="primary" @click="configDialogVisiable = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "topbar",
  props:{
    currentStatus: String
  },
  data() {
    return {
      configDialogVisiable: false,
      contrast:50, // 对比度
      brightness:50, // 亮度
      // 绘图参数
      config: {
        path_lineWidth: 1,
        path_strokeStyle: "#f00",
        point_lineWidth: 1,
        point_strokeStyle: "#999",
        point_radis:5,
        grid: false,
        guid: true
      }
    };
  },
  watch:{
    config: {
      handler() {
        this.$emit('configChange',this.config)
      },
      immediate:true,
      deep:true
    },
    contrast: {
      handler() {
        this.$emit('contrastChange',Math.floor(this.contrast-50))
      },
      immediate:true
    },
    brightness: {
      handler() {
        this.$emit('brightnessChange',Math.floor(this.brightness-50))
      },
      immediate:true
    }
  },
  methods: {
    changeEvent(eventName) {
      this.$emit("topBarEvent", eventName);
    },
    formatTooltip(val) {
      return parseInt(val - 50);
    }
  },
};
</script>

<style lang="scss" scoped>
.bar {
  height: 30px;
  margin: 5px 0px;
}
.icon {
  height: 30px;
  width: 30px;
}
[class*=" el-icon-"],
[class^="el-icon-"] {
  box-sizing: border-box;
  height: 30px;
  width: 30px;
  line-height: 30px;
  font-size: 20px;
  padding: 0 5px;
  cursor: pointer;
  &:nth-child(1) {
    margin-left: 5px;
  }
  &:hover {
    border-radius: 3px;
    background-color: rgba(0, 0, 0, 0.4);
  }
}
.el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
  margin-bottom: 2px;
}
.status{
  float:right;
  margin-top: 8px;
  width: 160px;
  font-size: 14px;
}
</style>

<style scoped>
.text-container{
  display:inline-block;
  vertical-align: middle;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  margin-bottom: 10px;
  vertical-align: middle;
  padding: 0 4px;
}
.text{
  display:inline-block;
  margin-right: 8px;
}
>>>.el-slider{
  height: 22px;
  display:inline-block;
  width: 60px;
}
>>>.el-slider__runway{
  margin:15px 0;
  background-color: #000;
}
>>>.el-slider__bar{
  background-color: #E4E7ED;
}
>>>.el-slider__button{
  width:12px;
  height: 12px;
  border: 1px solid #000;
}
</style>