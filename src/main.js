import Vue from 'vue'
import App from './App.vue'
import 'element-ui/lib/theme-chalk/index.css';
import { Button, Loading, Icon, Tooltip, Popconfirm, Dialog, Switch } from 'element-ui';
Vue.config.productionTip = false

Vue.use(Button)
Vue.use(Icon)
Vue.use(Tooltip)
Vue.use(Popconfirm)
Vue.use(Dialog)
Vue.use(Switch)

Vue.use(Loading.directive);

new Vue({
  render: h => h(App),
}).$mount('#app')
