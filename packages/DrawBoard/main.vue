<template>
  <div class="container">
    <div class="drawboard" ref="drawboard">
      <div class="center">
        <div class="topBar">
          <topBar
            :currentStatus="currentStatus"
            @topBarEvent="topBarEvent"
            @configChange="configChange"
            @contrastChange="contrastChange"
            @brightnessChange="brightnessChange"
          ></topBar>
        </div>
        <div class="wrapper">
          <div class="tools">
            <tool @toolSelected="toolSelected"></tool>
          </div>
          <div class="view" ref="view" 
            v-loading="loading"
            element-loading-text="加载中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
          >
            <canvas id="image" ref="image" class="canvas"
              >The browser does not support canvas</canvas
            >
            <canvas
              id="canvas"
              ref="canvas"
              class="canvas"
              @mousedown="canvasMousedown"
              >The browser does not support canvas</canvas
            >
          </div>
        </div>
        <div class="bottomBar">
          <slot name="bottomBar"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  generateImage,
  windowToCanvas,
  canvasToImage,
  imageToCanvas,
  formatPointRange,
  fullScreen,
  exitScreen,
  debounce
} from "./utils/index";
import { status, generateGrid, drawNavigationLine } from "./draw/index";
import figureFactory from "./draw/figureFactory.js";
import topBar from "./components/topBar";
import tool from "./components/tool";
import imageEvent from "./draw/imageEvent.js"
export default {
  name: "drawboard",
  components: {
    topBar,
    tool,
  },
  props:{
    url:{
      type:String,
      required: true
    },
    userOptions:{
      type:Object,
      default:() => {}
    },
    labelDataOrigin:{
      type: Array,
      default:() => []
    },
    loadingData:{
      type: Boolean,
      default:false
    }
  },
  data() {
    return {
      imagePosX: 0,
      imagePosY: 0,
      imageXOffset: 0,
      imageYOffset: 0,
      imageWidth: 0,
      imageHeight: 0,
      imageScale: 0,
      scale: 1,
      degree: 3600,
      viewHeight:0,
      viewWidth:0,
      canvas: null,
      image: null,
      drawboard: null,
      view: null,
      mouseStartPoint: null,
      mouseEndPoint: null,
      lastMouseEndPoint:null,
      currentPoint:null,
      currentTool: "",
      graphics: [],
      resultData: [],
      activeGraphic: null,
      activeIndex: -1,
      pointIndex:-1,
      options: {},
      currentStatus: status.DEFAULT, // DRAWING/MOVING/UPDATING
      observer:null,
      isFullScreen:false,
      loading:false,
      imagePixelData:[] 
    };
  },
  computed: {
    convertParams() {
      return {
        imagePosX: this.imagePosX,
        imagePosY: this.imagePosY,
        viewWidth: this.viewWidth,
        viewHeight: this.viewHeight,
        imageXOffset: this.imageXOffset,
        imageYOffset: this.imageYOffset,
        imageScale: this.imageScale,
        scale: this.scale,
        degree: this.degree
      }
    }
  },
  watch:{
    graphics:{
      handler(){
        debounce(this.sendResultData,100)()
      },
      deep:true,
      immediate: true
    },
    url:{
      handler(){
        if(this.url) {
          this.loading = true
          this.loadImage(this.url)
        }
      },
      immediate: true
    },
    activeIndex: {
      handler(val) {
        if (this.currentStatus === 'UPDATING') {
          this.$emit('activeIndexChange', val)
        }
      },
      immediate: true
    },
    userOptions:{
      handler() {
        this.options = Object.assign(this.options,JSON.parse(JSON.stringify(this.userOptions)))
      },
      deep:true
    },
    labelDataOrigin:{
      handler(newData){
        if (newData.length>0) {
          this.initRenderData(newData)
        }
      },
      immediate: true,
      deep:true
    },
    loadingData:{
      handler(){
        this.loading = this.loadingData
      },
      immediate: true
    }
  },
  mounted() {
    this.initSize();
    this.observerView()
    this.canvas.addEventListener("mousemove", this.drawNavigationLineEvent, false);
    this.listenScroll();
    this.addRightMouseEvent()
  },
  beforeDestroy() {
    this.canvas.removeEventListener("mousemove", this.canvasMousemove, false);
    this.canvas.removeEventListener("mouseup", this.canvasMouseup, false);
    document.removeEventListener("keydown", this.keydownEvent, false);
    this.observer.disconnect()
  },
  methods: {
    listenScroll() {
      const w = this;
      (document.onkeydown = function(e) {
        if (e.keyCode === 17) w.ctrlDown = true
      }),
      (document.onkeyup = function(e) {
        if (e.keyCode === 17) w.ctrlDown = false
      }),
      document.getElementsByClassName('view')[0].addEventListener('mousewheel',(e) => {
        e.preventDefault();
        if(w.ctrlDown) {
          if(e.wheelDeltaY > 0) {  // 放大
            this.topBarEvent("zoomIn")
          } else {  // 缩小
            this.topBarEvent("zoomOut")
          }
        }
      },false); 
    },
    addRightMouseEvent() {
      let view = document.getElementsByClassName('view')[0]
      // Prohibit the right mouse button menu display
      view.oncontextmenu = function(){return false};     
      view.addEventListener(
        'mousedown',
        e => {
          if (e.button === 2) {
            this.currentStatus = status.MOVING;
          }
        },
        false
      )
      view.addEventListener(
        'mouseup',
        e => {
          if (e.button === 2) {
            this.currentStatus = status.DRAWING;
          }
        },
        false
      )
    },
    initSize() {
      this.canvas = this.$refs.canvas;
      this.image = this.$refs.image;
      this.canvasCtx = this.canvas.getContext("2d");
      this.imageCtx = this.image.getContext("2d");
      this.drawboard = this.$refs.drawboard;
      this.view = this.$refs.view;
      this.viewHeight = this.view.offsetHeight;
      this.viewWidth = this.view.offsetWidth;
      this.image.setAttribute("height", this.viewHeight);
      this.image.setAttribute("width", this.viewWidth);
      this.canvas.setAttribute("height", this.viewHeight);
      this.canvas.setAttribute("width", this.viewWidth);
      if (this.url) {
        this.loadImage(this.url)
      }
      if (this.graphics.length>0) {
        if (this.canvasCtx) {
          this.drawBG();
          this.drawGraphics();
          this.readyForNewEvent("draw");
        }
      }
    },
    observerView(){
      this.observer = new ResizeObserver(this.initSize)
      this.observer.observe(this.view)
    },
    sendResultData() {
      this.resultData = [];
        this.graphics.forEach(figure => {
          let tmpFigure = {}
          tmpFigure.type = figure.type
          tmpFigure.points = []
          for (let i = 0; i < figure.points.length; i++) {
            let tempPoint = canvasToImage(
              figure.points[i].x,
              figure.points[i].y,
              this.imagePosX,
              this.imagePosY,
              this.viewWidth,
              this.viewHeight,
              this.imageXOffset,
              this.imageYOffset,
              this.imageScale,
              this.scale,
              this.degree
            );
            tmpFigure.points[i] = {x:Math.round(tempPoint.x),y:Math.round(tempPoint.y)}
          }
          this.resultData.push(tmpFigure);
        })
        this.$emit('updateData',this.resultData)
    },
    getImageInfo(x, y, width, height, scale) {
      this.imagePosX = Math.round(x);
      this.imagePosY = Math.round(y);
      this.imageWidth = width;
      this.imageHeight = height;
      this.imageScale = scale;
      this.loading = false;
      this.imagePixelData = this.imageCtx.getImageData(this.imagePosX,this.imagePosY,this.imageWidth*this.imageScale,this.imageHeight*this.imageScale);
      if (this.labelDataOrigin.length>0) {
        this.initRenderData(this.labelDataOrigin)
      }
      this.readyForNewEvent("draw")
    },
    loadImage(url) {
      if (this.image) {
        generateImage(this.image, this.getImageInfo, url)
      } else {
        this.$nextTick(()=>generateImage(this.image, this.getImageInfo, url))
      }
    },
    initRenderData(data) {
      this.graphics = []
      let initGraphics = JSON.parse(JSON.stringify(data))
      initGraphics.forEach((figure,index)=>{
        let type = figure.type;
        let tmpfigure = figureFactory(type, figure.points[0],figure.options || {});
        tmpfigure.points = []
        figure.points.forEach((point,index)=>{
          tmpfigure.points[index] = imageToCanvas(
            point.x,
            point.y,
            this.imagePosX,
            this.imagePosY,
            this.viewWidth,
            this.viewHeight,
            this.imageXOffset,
            this.imageYOffset,
            this.imageScale,
            this.scale,
            this.degree
          );
        })
        this.graphics.push(tmpfigure)
      })
      this.drawBG();
      this.drawGraphics();
    },
    topBarEvent(eventName) {
      switch (eventName) {
        case "zoomIn":
          this.scale = imageEvent.zoomIn(this.graphics,this.convertParams);
          this.drawBG();
          this.drawGraphics();
          this.updateImage();
          break;
        case "zoomOut":
          this.scale = imageEvent.zoomOut(this.graphics,this.convertParams);
          this.drawBG();
          this.drawGraphics();
          this.updateImage();
          break;
        case "rotateRight":
          this.degree = imageEvent.rotateRight(this.graphics,this.convertParams);
          this.drawBG();
          this.drawGraphics();
          this.updateImage();
          break;
        case "rotateLeft":
          this.degree = imageEvent.rotateLeft(this.graphics,this.convertParams);
          this.drawBG();
          this.drawGraphics();
          this.updateImage();
          break;
        case "move":
          this.readyForNewEvent("move");
          break;
        case "clearAll":
          this.clearAll();
          break;
        case "fullScreen":
          if (this.isFullScreen) {
            exitScreen(this.drawboard)
            this.isFullScreen = false
          }else{
            fullScreen(this.drawboard);
            this.isFullScreen = true
          }
          break;
        default:
          break;
      }
    },
    toolSelected(toolName) {
      this.currentTool = toolName;
      this.readyForNewEvent("draw");
    },
    configChange(config) {
      this.options = JSON.parse(JSON.stringify(config));
      if (this.canvasCtx) {
        this.drawBG();
        this.drawGraphics();
        this.readyForNewEvent("draw");
      }
    },
    clearAll() {
      this.graphics = [];
      this.$emit("clearAllCb")
      this.drawBG();
      this.readyForNewEvent("draw");
    },
    // Initialize the canvas
    drawBG() {
      this.canvasCtx.clearRect(0, 0, this.viewWidth, this.viewHeight);
      if (this.options.grid) {
        generateGrid(this.canvas, "lightGray", 10, 10);
      }
    },
    // draing
    drawGraphics() {
      this.graphics.forEach((graphic, index) => {
        // format point range when the point exceeds the image boundary
        graphic.points.forEach((point,index)=>{
          graphic.points[index] = formatPointRange(
            point,
            imagePosX,
            imagePosY,
            viewWidth,
            viewHeight,
            imageXOffset,
            imageYOffset,
            imageScale,
            scale,
            degree
          );
        })
        // computedCenter
        graphic.computedCenter()
        graphic.draw(this.canvasCtx);
        if (this.activeIndex === index && this.currentStatus === status.UPDATING) {
          graphic.drawPoints(this.canvasCtx);
        }
        if (this.options.guid) {
          drawNavigationLine(this.canvas, this.currentPoint.x, this.currentPoint.y);
        }
      });
    },
    drawNavigationLineEvent(e){
      this.drawBG();
      this.drawGraphics();
      if (this.options.guid) {
        this.currentPoint = windowToCanvas(this.canvas, e.clientX, e.clientY);
        drawNavigationLine(this.canvas, this.currentPoint.x, this.currentPoint.y);
      }
    },
    canvasMousedown(e) {
      if (this.currentStatus === status.DEFAULT) return;
      this.mouseStartPoint = windowToCanvas(
        this.canvas,
        e.clientX,
        e.clientY
      );
      this.lastMouseEndPoint = this.mouseStartPoint;
      this.canvas.addEventListener("mousemove", this.canvasMousemove, false);
      this.canvas.addEventListener("mouseup", this.canvasMouseup, false);
      document.addEventListener("keydown", this.keydownEvent, false);
      // Do not process other logic when right click
      if (e.button === 2) return;
      if (this.currentStatus === status.DRAWING) {
        if (this.activeGraphic == null) {
          for (let i = 0; i < this.graphics.length; i++) {
            // updating 
            if (
              this.graphics[i].isInPath(this.canvasCtx, this.mouseStartPoint) >
              -1
            ) {
              this.canvas.style.cursor = "crosshair";
              this.activeGraphic = this.graphics[i];
              this.activeIndex = i;
              this.currentStatus = status.UPDATING;
              break;
            }
          }
          if (this.currentStatus === status.DRAWING) {
            this.activeGraphic = figureFactory(
              this.currentTool,
              this.mouseStartPoint,
              this.options
            );
            this.graphics.push(this.activeGraphic);
            this.activeIndex = this.graphics.length-1;
            this.canvas.style.cursor = "crosshair";
          }
        } else {
          if (["polygon", "polyline"].includes(this.currentTool)) {
            if (
              this.activeGraphic.triggerEndCondition(
                this.canvasCtx,
                this.mouseStartPoint
              )
            ) {
              this.readyForNewEvent("draw")
              this.drawBG();
              this.drawGraphics();
              this.drawEventDone();
            } else {
              this.activeGraphic.points.push(this.mouseStartPoint);
            }
          }
        }
      }else if(this.currentStatus === status.UPDATING){
        for (let i = 0; i < this.graphics.length; i++) {
          // 选中控制点后拖拽修改图形
          if (
            this.graphics[i].isInPath(this.canvasCtx, this.mouseStartPoint) >
            -1
          ) {
            this.canvas.style.cursor = "crosshair";
            this.activeGraphic = this.graphics[i];
            this.activeIndex = i;
            this.currentStatus = status.UPDATING;
            break;
          }
        }
        this.pointIndex = this.activeGraphic.isInPath(this.canvasCtx,this.mouseStartPoint)
      }
    },
    canvasMousemove(e) {
      this.mouseEndPoint = windowToCanvas(this.canvas, e.clientX, e.clientY);
      if (this.currentStatus === status.MOVING) {
        let translateX =
          this.imageXOffset + (this.mouseEndPoint.x - this.mouseStartPoint.x);
        let translateY =
          this.imageYOffset + (this.mouseEndPoint.y - this.mouseStartPoint.y);
        let tmpConvertParams = JSON.parse(JSON.stringify(this.convertParams))
        let tmpGraphics = imageEvent.formatPointsInImageWhenMove(this.graphics,tmpConvertParams);
        this.image.style.transform = `scale(${this.scale},${this.scale}) translate(${translateX}px,${translateY}px) rotateZ(${this.degree}deg)`;
        tmpConvertParams.imageXOffset = translateX;
        tmpConvertParams.imageYOffset = translateY;
        imageEvent.formatPointsInCanvasWhenMove(tmpGraphics,tmpConvertParams);
        this.drawBG();
        imageEvent.drawTmpGraphics(tmpGraphics,this.canvasCtx)
      } else if(this.currentStatus === status.UPDATING && this.activeGraphic) {
        this.drawBG();
        this.drawGraphics();
        if (this.pointIndex > -1) {
          if (this.pointIndex === 999) {
            this.activeGraphic.move(this.lastMouseEndPoint, this.mouseEndPoint);
            this.lastMouseEndPoint = this.mouseEndPoint
          } else {
            this.activeGraphic.update(this.pointIndex, this.mouseEndPoint);
          }
        }
      }else if (this.currentStatus === status.DRAWING && this.activeGraphic) {
        this.drawBG();
        this.drawGraphics();
        if (["polygon", "polyline"].includes(this.currentTool)) {
          let pointIndex = this.activeGraphic.isInPath(this.canvasCtx,this.mouseEndPoint);
          if (pointIndex === 0) {
            this.focusCicle(this.canvasCtx,this.activeGraphic.points[0],this.options.point_lineWidth,this.options.point_strokeStyle,this.options.point_radis*2)
          }
          this.previewGraphic(this.canvasCtx,this.activeGraphic,this.mouseEndPoint)
        }else if(["rectangle"].includes(this.currentTool)) {
          this.activeGraphic.initFigure(this.mouseStartPoint,this.mouseEndPoint)
        }
      }
    },
    canvasMouseup(e) {
      if (this.currentStatus === status.MOVING) {
        imageEvent.formatPointsInImage(this.graphics,this.convertParams);
        this.imageXOffset += (this.mouseEndPoint.x - this.mouseStartPoint.x);
        this.imageYOffset += (this.mouseEndPoint.y - this.mouseStartPoint.y);
        imageEvent.formatPointsInCanvas(this.graphics,this.convertParams);
        this.drawBG();
        this.drawGraphics();
        this.updateImage();
        this.readyForNewEvent("move")
      } else if(this.currentStatus === status.UPDATING) {
        if (this.activeGraphic) {
          this.drawBG();
          this.drawGraphics();
        }
        this.readyForNewEvent("update")
      }else if (this.currentStatus === status.DRAWING) {
        if (this.activeGraphic) {
          this.drawBG();
          this.drawGraphics();
        }
        if (!(["polygon", "polyline"].includes(this.currentTool))) {
          this.readyForNewEvent();
          this.drawEventDone();
        }
      }
    },
    readyForNewEvent(evevt="draw") {
      this.canvas.style.cursor = "crosshair";
      if (evevt === "draw") {
        this.activeIndex = -1;
        this.activeGraphic = null;
        this.currentStatus = status.DRAWING;
      }else if(evevt === "move") {
        this.activeIndex = -1;
        this.activeGraphic = null;
        this.currentStatus = status.MOVING;
        this.canvas.style.cursor = "move";
      }
      this.canvas.removeEventListener("mousemove", this.canvasMousemove, false);
      this.canvas.removeEventListener("mouseup", this.canvasMouseup, false);
    },
    focusCicle(ctx,point,lineWidth=2,color='#999',radis=10) {
      ctx.save();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        radis,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
      ctx.restore();
    },
    previewGraphic(ctx,graphic,point,fillStyle='hsla(0,100%,50%,.3)') {
      ctx.save();
      ctx.beginPath();
      graphic.points.forEach((p, i) => {
        ctx[i != 0 ? "lineTo" : "moveTo"](p.x, p.y);
      });
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = graphic.path_strokeStyle;
      ctx.lineWidth = graphic.path_lineWidth;
      ctx.stroke();
      ctx.fillStyle = fillStyle;
      if(graphic.type === "polygon") ctx.fill();
      ctx.restore();
    },
    keydownEvent(e) {
      if (e.keyCode == 13) {
        this.readyForNewEvent("draw")  
        this.drawBG();
        this.drawGraphics();
      } else if (e.keyCode == 46) {
        if (this.activeIndex > -1) {
          this.graphics.splice(this.activeIndex, 1);
          this.$emit("deleteFigureCb",this.activeIndex);
          this.readyForNewEvent("draw")
          this.drawBG();
          this.drawGraphics();
        }
      }
    },
    deleteFigure(index) {
      if (index > -1) {
        this.graphics.splice(index, 1);
        this.readyForNewEvent("draw")
        this.drawBG();
        this.drawGraphics();
      }
    },
    selectedFigure(index) {
      if (index > -1) {
        this.activeIndex=index
        this.currentStatus = status.UPDATING
        this.drawBG();
        this.drawGraphics();
      }
    },
    updateImage() {
      this.image.style.transform = `scale(${this.scale},${this.scale}) translate(${this.imageXOffset}px,${this.imageYOffset}px) rotateZ(${this.degree}deg)`;
    },


    drawEventDone() {
      this.$emit('drawEventDone')
    },
    contrastChange(radio) {
      this.changePixelForContrast(radio)
    },
    brightnessChange(radio) {
      this.changePixelForBright(radio)
    },
    changePixelForContrast(radio) {
      if (!this.imageCtx) return;
      let imageData = this.imageCtx.getImageData(this.imagePosX,this.imagePosY,this.imageWidth*this.imageScale,this.imageHeight*this.imageScale);
      
      let data = imageData.data;
      let data0 = this.imagePixelData.data
      // RGB = RGB + (RGB - avg) * Contrast / 255
      let avg_r = 0
      let avg_g = 0
      let avg_b = 0
      for ( var i = 0; i < data0.length; i += 4 ) {
        avg_r += data0[i]
        avg_g += data0[i+1]
        avg_b += data0[i+2]
      }
      avg_r /= (data0.length/4)
      avg_g /= (data0.length/4)
      avg_b /= (data0.length/4)
      for ( var i = 0; i < data.length; i += 4 ) {
        data[i] = data0[i] + (data0[i] - avg_r) * radio / 50
        if (data[i] > 255) {
          data[i] = 255;
        } else if(data[i] < 0) {
          data[i] = 0;
        }
        data[i+1] = data0[i+1] + (data0[i+1] - avg_g) * radio / 50
        if (data[i+1] > 255) {
          data[i+1] = 255;
        } else if (data[i+1] < 0) {
          data[i+1] = 0;
        }
        data[i+2] = data0[i+2] + (data0[i+2] - avg_b) * radio / 50
        if (data[i+2] > 255) {
          data[i+2] = 255;
        } else if (data[i+2] < 0) {
          data[i+2] = 0;
        }
      }
      this.imageCtx.putImageData(imageData,this.imagePosX,this.imagePosY);
    },
    changePixelForBright(radio) {
      if (!this.imageCtx) return;
      let imageData = this.imageCtx.getImageData(this.imagePosX,this.imagePosY,this.imageWidth*this.imageScale,this.imageHeight*this.imageScale);
      let data = imageData.data;
      let data0 = this.imagePixelData.data
      let newRadio = parseInt(radio/50*255)
      for(var i = 0; i < data.length; i += 4 ) {
        if(data0[i]+newRadio>255){
          data[i]=255;
        }else if(data0[i]+newRadio<0){
          data[i]=0;
        }else {
          data[i] = data0[i]+ newRadio;
        }
        if((data0[i+1]+newRadio)>255){
          data[i+1]=255;
        }else if((data0[i+1]+newRadio)<0){
          data[i+1]=0;
        }else {
          data[i+1] = data0[i+1]+ newRadio;
        }
        if((data0[i+2]+newRadio)>255){
          data[i+2]=255;
        }else if((data0[i+2]+newRadio)<0){
          data[i+2]=0;
        }else{
          data[i+2] = data0[i+2] + newRadio;
        }
      }
      this.imageCtx.putImageData(imageData,this.imagePosX,this.imagePosY);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./styles/index.scss";
</style>