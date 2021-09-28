const Koa = require('koa')
const app = new Koa()

const resDurationMiddleware = require('./middleware/koa_response_duration')
app.use(resDurationMiddleware)

const resHeaderMiddleware = require('./middleware/koa_response_header')
app.use(resHeaderMiddleware)

const resDataMiddleware = require('./middleware/koa_response_data')
app.use(resDataMiddleware)

app.listen(8081)

const WebSocketService = require('./service/web_socket_service.js')
//开启服务器的监听，监听客户端的连接
//当某一个客户端连接成功之后，就会对这个客户端进行message事件的监听
WebSocketService.listen()