const path = require('path')
const fileUtils = require('../utils/file_utils')
module.exports = async (ctx,next) => {
   let url = ctx.request.url
   let filePath = url.replace('/api','')
   filePath = '../data' + filePath + '.json'
   filePath = path.join(__dirname,filePath)
   try{
    const ret = await fileUtils.getFileJsonDate(filePath)
    ctx.response.body = ret
   }catch(e){
    const errMsg = {
        message:'读取文件失败',
        status:404
    }
    ctx.response.body=JSON.stringify(errMsg)
   }
   await next()
}