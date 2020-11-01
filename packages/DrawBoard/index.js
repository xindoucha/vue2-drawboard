import Vue from 'vue'
import { Button, Loading, Icon, Tooltip, Popconfirm, Dialog, Switch } from 'element-ui';


Vue.use(Button)
Vue.use(Icon)
Vue.use(Tooltip)
Vue.use(Popconfirm)
Vue.use(Dialog)
Vue.use(Switch)

Vue.use(Loading.directive);
// 导入组件，组件必须声明 name
import DrawBoard from './main.vue'

// 为组件添加 install 方法，用于按需引入
DrawBoard.install = function (Vue) {
    Vue.component(DrawBoard.name, DrawBoard)
}

export default DrawBoard