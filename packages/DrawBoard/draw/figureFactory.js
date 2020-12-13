const config = {
  PATH_LINEWIDTH:1,
  PATH_STROKESTYLE:"#f00",
  POINT_LINEWIDTH:2,
  POINT_STROKESTYLE:"#999",
  POINT_RADIS:5
}

class Graph {
  constructor(point,options={}){
    this.x = Math.round(point.x)
    this.y = Math.round(point.y)
    this.points = []
    this.points.push(point)
    this.options = options
    this.path_lineWidth = options.path_lineWidth || config.PATH_LINEWIDTH
    this.path_strokeStyle = options.path_strokeStyle || config.PATH_STROKESTYLE
    this.point_radis = options.point_radis|| config.POINT_RADIS
    this.point_lineWidth = options.point_lineWidth || config.POINT_LINEWIDTH
    this.point_strokeStyle = options.point_strokeStyle || config.POINT_STROKESTYLE
  }
  computedCenter() {
    let x_sum = 0,y_sum = 0;
    this.points.forEach(p => {
      x_sum += p.x;
      y_sum += p.y;
    });
    this.x = Math.round(x_sum / this.points.length);
    this.y = Math.round(y_sum / this.points.length);
  }
  move(startPoint,endPoint) {
    let x1 = endPoint.x - startPoint.x;
    let y1 = endPoint.y - startPoint.y;
    this.points = this.points.map(item => {
      return {
        x: item.x + x1,
        y: item.y + y1,
      }
    })
    this.computedCenter()
  }
  update(i,point){
    this.points[i] = point
    this.computedCenter()
  }
  createPath(ctx) {
    ctx.beginPath();
    ctx.lineWidth = this.path_lineWidth;
    ctx.strokeStyle = this.path_strokeStyle;
    this.points.forEach((p, i) => {
      ctx[i == 0 ? "moveTo" : "lineTo"](p.x, p.y);
    });
    ctx.closePath();
  }
  isInPath(ctx, point) {
    // in the point
    for (let i = 0; i < this.points.length; i++) {
      ctx.beginPath();
      ctx.arc(this.points[i].x, this.points[i].y, this.point_radis, 0, Math.PI * 2, false);
      if (ctx.isPointInPath(point.x, point.y)) {
        return i;
      }
    }
    // in the figure
    this.createPath(ctx);
    if (ctx.isPointInPath(point.x, point.y)) {
      return 999;
    }
    return -1;
  }
  // Draw a circle for each point
  // drawPoints(ctx) {
  //   ctx.save();
  //   ctx.lineWidth = this.point_lineWidth;
  //   ctx.strokeStyle = this.point_strokeStyle;
  //   this.points.forEach(p => {
  //     ctx.beginPath();
  //     ctx.arc(p.x, p.y, this.point_radis, 0, Math.PI * 2, false);
  //     ctx.stroke();
  //   });
  //   ctx.restore();
  // }
  // Draw a cube for each point
  drawPoints(ctx) {
    ctx.save();
    ctx.lineWidth = this.point_lineWidth;
    ctx.strokeStyle = this.point_strokeStyle;
    ctx.fillStyle = this.point_strokeStyle;
    this.points.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x - this.point_radis, p.y - this.point_radis);
      ctx.lineTo(p.x - this.point_radis, p.y + this.point_radis);
      ctx.lineTo(p.x + this.point_radis, p.y + this.point_radis);
      ctx.lineTo(p.x + this.point_radis, p.y - this.point_radis);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }
  draw(ctx) {
    ctx.save();
    this.createPath(ctx);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Polyline
 */
class Polyline extends Graph {
  constructor(point,options) {
    super(point,options);
    this.type = "polyline";
  }
  // overwrite the function because it does not need to close the path
  createPath(ctx) {
    ctx.beginPath();
    ctx.lineWidth = this.path_lineWidth;
    ctx.strokeStyle = this.path_strokeStyle;
    this.points.forEach((p, i) => {
      ctx[i == 0 ? "moveTo" : "lineTo"](p.x, p.y);
    });
  }
  // it is not a closed figure, it cant be in the figure
  isInPath(ctx, point) {
    // 是否在某一个点中
    for (let i = 0; i < this.points.length; i++) {
      ctx.beginPath();
      ctx.arc(this.points[i].x, this.points[i].y, this.point_radis, 0, Math.PI * 2, false);
      if (ctx.isPointInPath(point.x, point.y)) {
        return i;
      }
    }
  }
  triggerEndCondition(ctx, point) {
    if (this.points.length > 1 && (this.isInPath(ctx,point) === 0)) {
      return true;
    } else {
      return false;
    }
  }
}


/**
 * Polygon
 */
class Polygon extends Graph {
  constructor(point,options) {
    super(point,options);
    this.type = "polygon";
  }
  triggerEndCondition(ctx, point) {
    if (this.points.length > 1 && (this.isInPath(ctx,point) === 0)) {
      return true;
    } else {
      return false;
    }
  }
}


/**
 * Rectangle
 */
class Rectangle extends Graph {
  constructor(point,options) {
    super(point,options);
    this.points = [point, point, point, point];
    this.type = "rectangle";
  }
  initFigure(startPoint, endPoint) {
    let x1 = Math.round(startPoint.x),
      y1 = Math.round(startPoint.y),
      x2 = Math.round(endPoint.x),
      y2 = Math.round(endPoint.y);
    this.points[0] = {
      x: x1,
      y: y1
    };
    this.points[1] = {
      x: x2,
      y: y1
    };
    this.points[2] = {
      x: x2,
      y: y2
    };
    this.points[3] = {
      x: x1,
      y: y2
    };
    this.x = Math.round((x1 + x2) / 2);
    this.y = Math.round((y1 + y2) / 2);
  }
  update(i,point){
    this.points[i] = point;
      if (i==0){
        this.points[1].y = point.y
        this.points[3].x = point.x
      }else if(i==1){
        this.points[2].x = point.x
        this.points[0].y = point.y
      }else if(i==2){
        this.points[3].y = point.y
        this.points[1].x = point.x
      }else {
        this.points[0].x = point.x
        this.points[2].y = point.y
      }
      this.computedCenter()
  }
}

/**
 * Point
 */
class Point extends Graph {
  constructor(point,options) {
    super(point,options);
    this.points = [point];
    this.type = "point";
  }
  createPath(ctx) {
    ctx.beginPath();
    ctx.lineWidth = this.path_lineWidth;
    ctx.fillStyle = this.path_strokeStyle;
    ctx.strokeStyle = this.path_strokeStyle;
    ctx.arc(this.points[0].x,this.points[0].y,3,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * factory function for creating graph 
 **/
export default function figureFactory(type, point, options) {
  switch (type) {
    case "rectangle":
      return new Rectangle(point,options);
    case "polygon":
      return new Polygon(point,options);
    case "polyline":
      return new Polyline(point,options);
    case "point":
      return new Point(point,options);
    default:
      return new Rectangle(point,options);
  }
}