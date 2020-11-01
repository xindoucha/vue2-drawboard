# vue2-drawboard
## Introduction
This is a drawboard tool based on vue2.x. Through this tool you can use to mark the information you want on a picture and get the corresponding data. In addition, you can also use it as an ordinary drawboard, where you can freely draw graphics on it. The currently supported types are polyline, rectangle, polygon, etc. Can support zoom in, zoom out, rotation, translation and other operations.Besides, you can flexibly configure your drawing information.

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
    <drawboard :url="url" @updateData="updateData"></drawboard>
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
    "points":
    [
      {"x":228,"y":240},
      {"x":287,"y":240},
      {"x":287,"y":286},
      {"x":228,"y":286}
    ]
  },
  {
    "type":"rectangle",
    "points":
      [
        {"x":402,"y":214},
        {"x":438,"y":214},
        {"x":438,"y":249},
        {"x":402,"y":249}
      ]
  }
]
```
### loadingData 
+ Type: Boolean
+ Required: False
+ default: False
> You can control whether to display the image loading animation.

### updateData
+ Type: Function
+ Required: True
> Through this method you can get the labeled data.
## Keywords
Drawboard Vue

