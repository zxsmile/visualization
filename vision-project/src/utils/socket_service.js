// 与 ES5 一样，在“类”的内部可以使用get和set关键字，对某个属性设置存值函数和取值函数，拦截该属性的存取行为。
// 如果在一个方法前，加上static关键字，就表示该方法/属性不会被实例继承，而是直接通过类来调用，这就称为“静态方法/属性”,
// static中的this指的是类自己
//单例模式：限制类实例化次数只能一次，一个类只有一个实例，并提供一个访问它的全局访问点。
//         实现方式：使用一个变量存储类实例对象（值初始为 null/undefined ）。进行类实例化时，
//                   判断类实例对象是否存在，存在则返回该实例，不存在则创建类实例后返回。多次调用类生成实例方法，
//                   返回同一个实例对象。
export default class SocketService{
      
static instance = null
static get Instance() {
    if(!this.instance){
        this.instance = new SocketService()
    }
    return this.instance
}

//和服务器连接的socket对象
ws = null

// 存储回调函数
callBackMapping = {}

// 标识是否连接成功
connected = false

// 记录重试的次数
sendRetryCount = 0

// 重新连接尝试的次数
connectRetryCount = 0

connect() {
    if(!window.WebSocket){
        return console.log('您的服务器不支持WebSocket')
    }
    this.ws = new WebSocket('ws://localhost:9998')

    //连接服务器成功事件
    this.ws.onopen = () => {
        console.log('连接服务器成功了')
        this.connected = true
        this.connectRetryCount = 0
    }

    //连接服务器失败事件
    this.ws.onclose = () => {
        console.log('连接服务器失败了')
        this.connected = false
        this.connectRetryCount++
        //连接失败尝试重连，每次重连时间延长
        setTimeout(() => {
            this.connect()
        },500 * this.connectRetryCount)
    }

    //获取从服务器端发送过来的数据
    this.ws.onmessage = msg => {
        console.log('从服务器获取到了数据')
        const recvData = JSON.parse(msg.data)
        if(this.callBackMapping [recvData.socketType]){
            const action = recvData.action
            if(action === 'getData'){
                const realData = JSON.parse(recvData.data)
                this.callBackMapping [recvData.socketType].call(this,realData)
            }else if(action === 'fullScreen'){
                this.callBackMapping [recvData.socketType].call(this,recvData)
            }else if(action === 'themeChange'){
                this.callBackMapping [recvData.socketType].call(this,recvData)
            }
        }
    }

}

// 回调函数的注册
registerCallBack(socketType,callBack) {
   this.callBackMapping[socketType] = callBack
}

// 取消某一个回调函数
 unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
 }

//发送数据的方法
send(data) {
    // 判断此时此刻有没有连接成功
    if(this.connected){
      this.connectRetryCount = 0
      //连接成功才开始发送数据
      this.ws.send(JSON.stringify(data))
    }else{
        //连接失败就延时尝试发送数据，每次延时的时间会延长
        this.connectRetryCount++
        setTimeout(() => {
            this.send(data)
        },500 * this.connectRetryCount)
    }
    
}

}