//计算服务器消耗时长的中间件
module.exports= async (ctx,next) => {
   //记录开始时间
   let start = Date.now()
   //让内部中间件得到执行
   await next()
   //记录结束时间
   let end = Date.now()
   let duration = end - start
   //设置响应头，X-Response-Time
   ctx.set('X-Response-Time',duration+'ms')
}