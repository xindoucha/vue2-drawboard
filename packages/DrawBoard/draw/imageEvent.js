/*image event */
import {canvasToImage,imageToCanvas} from '../utils/index.js'
import figureFactory from "./figureFactory.js";

// 把点从canvas上映射到图片上
// Convert the point coordinates from the canvas to the the image.
function formatPointsInImage(graphics,options) {
  graphics.forEach(figure => {
    for (let i = 0; i < figure.points.length; i++) {
      figure.points[i] = canvasToImage(
        figure.points[i].x,
        figure.points[i].y,
        options.imagePosX,
        options.imagePosY,
        options.viewWidth,
        options.viewHeight,
        options.imageXOffset,
        options.imageYOffset,
        options.imageScale,
        options.scale,
        options.degree
      );
    }
  });
}

// Convert the point coordinates from the image to the the canvas.
function formatPointsInCanvas(graphics,options) {
  graphics.forEach(figure => {
    for (let i = 0; i < figure.points.length; i++) {
      figure.points[i] = imageToCanvas(
        figure.points[i].x,
        figure.points[i].y,
        options.imagePosX,
        options.imagePosY,
        options.viewWidth,
        options.viewHeight,
        options.imageXOffset,
        options.imageYOffset,
        options.imageScale,
        options.scale,
        options.degree
      );
    }
  });
}
// 把点从canvas上映射到图片上--移动时
function formatPointsInImageWhenMove(graphics,options) {
  let tmpGraphics = [];
  graphics.forEach(figure => {
    let figureCopy = figureFactory(figure.type, { x: figure.x, y: figure.y },figure.options);
    for (let i = 0; i < figure.points.length; i++) {
      figureCopy.points[i] = canvasToImage(
        figure.points[i].x,
        figure.points[i].y,
        options.imagePosX,
        options.imagePosY,
        options.viewWidth,
        options.viewHeight,
        options.imageXOffset,
        options.imageYOffset,
        options.imageScale,
        options.scale,
        options.degree
      );
    }
    tmpGraphics.push(figureCopy);
  });
  return tmpGraphics;
}

function formatPointsInCanvasWhenMove(graphics,options) {
  graphics.forEach(figure => {
    for (let i = 0; i < figure.points.length; i++) {
      figure.points[i] = imageToCanvas(
        figure.points[i].x,
        figure.points[i].y,
        options.imagePosX,
        options.imagePosY,
        options.viewWidth,
        options.viewHeight,
        options.imageXOffset,
        options.imageYOffset,
        options.imageScale,
        options.scale,
        options.degree
      );
    }
  });
}

let imageEvent = {};
imageEvent.zoomIn = function(graphics,convertParams) {
  formatPointsInImage(graphics,convertParams);
  let scale = convertParams.scale * 1.1;
  convertParams.scale = scale
  formatPointsInCanvas(graphics,convertParams);
  return scale;
}

imageEvent.zoomOut = function (graphics,convertParams) {
  formatPointsInImage(graphics,convertParams);
  let scale = convertParams.scale * 0.9;
  convertParams.scale = scale
  formatPointsInCanvas(graphics,convertParams);
  return scale;
}

imageEvent.rotateRight = function (graphics,convertParams) {
  formatPointsInImage(graphics,convertParams);
  let degree = convertParams.degree + 90;
  convertParams.degree = degree
  formatPointsInCanvas(graphics,convertParams);
  return degree;
}

imageEvent.rotateLeft = function (graphics,convertParams) {
  formatPointsInImage(graphics,convertParams);
  let degree = convertParams.degree - 90;
  convertParams.degree = degree
  formatPointsInCanvas(graphics,convertParams);
  return degree;
}
imageEvent.formatPointsInImage = formatPointsInImage
imageEvent.formatPointsInCanvas = formatPointsInCanvas
imageEvent.formatPointsInImageWhenMove = formatPointsInImageWhenMove
imageEvent.formatPointsInCanvasWhenMove = formatPointsInCanvasWhenMove

imageEvent.drawTmpGraphics = function(graphics,ctx) {
  graphics.forEach((graphic) => {
    graphic.draw(ctx);
  });
}
/*

getImageInfo(x, y, width, height, scale) {
  this.posX = Math.round(x);
  this.posY = Math.round(y);
  this.imageWidth = width;
  this.imageHeight = height;
  this.imageScale = scale;
},
showPosition(e) {
  this.currentPoint = windowToCanvas(this.canvas, e.clientX, e.clientY);
  let { x, y } = windowToCanvas(this.canvas, e.clientX, e.clientY);
  let resObj = canvasToImage(
    x,
    y,
    this.posX,
    this.posY,
    this.canvasWidth,
    this.canvasHeight,
    this.imageXOffset,
    this.imageYOffset,
    this.imageScale,
    this.scale,
    this.degree
  );
  this.cursorPosX = resObj.x;
  this.cursorPosY = resObj.y;
  this.afterPoint = imageToCanvas(
    this.cursorPosX,
    this.cursorPosY,
    this.posX,
    this.posY,
    this.canvasWidth,
    this.canvasHeight,
    this.imageXOffset,
    this.imageYOffset,
    this.imageScale,
    this.scale,
    this.degree
  );
},
updateImage() {
  this.image.style.transform = `scale(${this.scale},${this.scale}) translate(${this.imageXOffset}px,${this.imageYOffset}px) rotateZ(${this.degree}deg)`;
}
*/

export default imageEvent;