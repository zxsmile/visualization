const path = require('path')
const fileUtils = require('../utils/file_utils.js') //读取文件
//安装并引入ws包
const WebSocket = require('ws')
//创建websocket实例对象，绑定端口
const wss = new WebSocket.Server({
    port:9998
})

module.exports.listen = () => {
     //对客户端的连接事件进行监听
    //client：代表的是客户端的连接socket对象
    wss.on('connection',client => {
        console.log('有客户端连接了')
        //msg:由客户端发给服务端的数据
        client.on('message',async msg => {
            console.log('客户端发送数据给服务端了：'+msg)
            let payload = JSON.parse(msg)
            let action = payload.action
            if(action==='getData'){
                let filePath = '../data/'+ payload.chartName+'.json'
                filePath = path.join(__dirname,filePath)
                let ret = await fileUtils.getFileJsonDate(filePath)
                payload.data = ret
                client.send(JSON.stringify(payload))
            }else{
                //原封不动的将所接收到的数据发送给每一个处于连接状态的客户端
                //wss.clients 所以连接的客户端，是一个数组
                wss.clients.forEach(client => {
                    client.send(JSON.stringify(payload))
                })
            }
        })
    })
}
