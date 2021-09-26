const fs = require('fs')

module.exports.getFileJsonDate = (filePath) => {

     return new Promise((reslove,reject) => {
         fs.readFile(filePath,'utf-8',(err,data)=>{
             if(err){
                 reject(err)
             }else{
                 reslove(data)
             }
         })
     })
    
}