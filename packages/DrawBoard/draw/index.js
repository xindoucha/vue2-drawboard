export let status = {
  DRAWING:'DRAWING',
  MOVING:'MOVING',
  UPDATING:'UPDATING',
  DEFAULT:'DEFAULT'
}

export let supportedGraphics = {
  RECTANGLE:'rectangle',
  POLYLINE:'polyline',
  POLYGON:'polygon'
}


/**
 * drawing grid.
 */
export function generateGrid(canvas, color, stepx, stepy) {
  let ctx = canvas.getContext("2d");
  if (!ctx) {
    console.log('canvas is not exist');
    return;
  }
  ctx.save();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = color;

  for (var i = stepx + 0.5; i < canvas.width; i += stepx) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  for (var i = stepy + 0.5; i < canvas.height; i += stepy) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
  ctx.restore();
}


/**
 * draw the Navigation Line.
 * @param {*} canvas 
 * @param {*} x 
 * @param {*} y 
 */
export function drawNavigationLine(canvas, x, y) {
  let ctx = canvas.getContext("2d");
  if (!ctx) {
    console.log('canvas is not exist');
    return;
  }
  ctx.save();
  ctx.strokeStyle = "#2af598";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, 0);
  ctx.lineTo(x + 0.5, canvas.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, y + 0.5);
  ctx.lineTo(canvas.width, y + 0.5);
  ctx.stroke();
  ctx.restore();
}