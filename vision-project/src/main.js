import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/global.less'
import './assets/font/iconfont.css'
//import * as echarts from 'echarts'
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8081/api/'
import SocketService from '@/utils/socket_service.js'
//对服务端进行websocket连接
SocketService.Instance.connect()
//$socket为SocketService实例对象
Vue.prototype.$socket = SocketService.Instance
Vue.config.productionTip = false
Vue.prototype.$echarts = window.echarts
Vue.prototype.$axios = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
