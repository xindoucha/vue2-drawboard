# vue2-drawboard
## Introduction
This is a drawboard tool based on vue2.x and canvas. Through this tool you can mark the information you want on a picture and get the corresponding data. In addition, you can also use it as an ordinary drawboard, where you can freely draw graphics on it. The currently supported types are polyline, rectangle, polygon, point, etc. Can support zoom in, zoom out, rotation, translation and other operations.Besides, you can flexibly configure your drawing information.

## Installation
```sh
npm install vue2-drawboard -S
```

## Usage
```js
import DrawBoard from 'vue2-drawboard'
import 'vue2-drawboard/lib/drawboard.css'
 
Vue.use(DrawBoard);
```

## Example
```vue
<template>
  <div id="app">
    <drawboard :url="url" @updateData="updateData" @drawEventDone="drawEventDone"></drawboard>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      url:'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
    }
  },
  methods:{
    updateData(data){
      console.log(data);
    },
    drawEventDone() {
      console.log("well done!");
    }
  }
}
</script>
```

## Options
### url
+ Type: String
+ Required: True
>The URL of the image to be edited.
### labelDataOrigin
+ Type: Array
+ Required: False
>Render graphics based on input data.The format of the data is as follows
```json
[
  {
    "type":"rectangle",
    "points":[
      {"x":228,"y":240},
      {"x":287,"y":240},
      {"x":287,"y":286},
      {"x":228,"y":286}
    ],
    "options":{
      "path_lineWidth":"4",
      "path_strokeStyle":"#f00",
      "point_radis":"5", // Judge whether to select the point when clicking
      "point_lineWidth":"2",
      "point_strokeStyle":"#999" // The color of the point when selected
    }
  },
  {
    "type":"rectangle",
    "points":[
      {"x":402,"y":214},
      {"x":438,"y":214},
      {"x":438,"y":249},
      {"x":402,"y":249}
    ],
    "options":{
      "path_lineWidth":"4",
      "path_strokeStyle":"#f00",
      "point_radis":"5", // Judge whether to select the point when clicking
      "point_lineWidth":"2",
      "point_strokeStyle":"#999" // The color of the point when selected
    }
  }
]
```
### userOptions
+ Type: Object
+ Required: False
+ default: {}
> You can configure the drawing parameters by this variable.The parameter form is the same as the options in labelDataOrigin above.

### loadingData 
+ Type: Boolean
+ Required: False
+ default: False
> You can control whether to display the image loading animation.

### updateData
+ Type: Function
+ Required: True
> Through this method you can get the labeled data.

### drawEventDone
+ Type: Function
+ Required: False
> Through this method you can do what you want when finish drawing.

### deleteFigureCb
+ Type: Function
+ Required: False
> This is a callback function after deleting an item, and parameter is the index value of the deleted item

### clearAllCb
+ Type: Function
+ Required: False
> This is a callback function after clear the drawboard.

### activeIndexChange
+ Type: Function
+ Required: False
> This is a callback function after changing active index.


### hot key
|hot key|Feature|
|:----|:----|
|ctrl+scroll|zoomIn/zoomOut|
|Right click|move|


## Keywords
Drawboard canvas Vue2.x Data-labeling

