import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/global.less'
//import * as echarts from 'echarts'
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8081/api/'

Vue.config.productionTip = false
Vue.prototype.$echarts = window.echarts
Vue.prototype.$axios = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
