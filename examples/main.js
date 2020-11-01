import Vue from 'vue'
import App from './App.vue'
import DrawBoard from '../packages/index'
Vue.use(DrawBoard)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
