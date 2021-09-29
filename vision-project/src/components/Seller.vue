<template>
  <div class='com-container'>
    <div class='com-chart'  ref = 'seller_ref'></div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default{
  data() {
    return{
      chartInstance:null,
      allDate:null,
      totalPage:0,
      currentPage:1,
      timer:null
    }
  },
  computed:{
    ...mapState(['theme'])
  },
  watch:{
    theme() {
      console.log('主题切换')
      this.chartInstance.dispose()//销毁当前的图表
      this.initChart() //重新以最新的图表主题初始化图表对象
      this.screenAdapter() //完成屏幕适配
      this.updateChart() //更新图表的展示
    }
  },
  mounted() {
   
    this.initChart()
    //this.getData()
    this.$socket.send({
      action:'getData',
      socketType:'sellerData',
      chartName:'seller',
      value:''
    })
    //监听页面窗口
    window.addEventListener('resize',this.screenAdapter)
    //界面加载完主动进行屏幕适配
    this.screenAdapter()
  },
  created() {
    this.$socket.registerCallBack('sellerData',this.getData)
  },
  destoryed() {
    clearInterval(this.timer)
    //页面销毁取消掉监听器
    window.removeEventListener('reaize',this.screenAdapter)
    this.$socket.unRegisterCallBack('sellerData') 
  },
  methods:{
      //初始化echartInstanec对象
      initChart() {
        this.chartInstance = this.$echarts.init(this.$refs.seller_ref,this.theme)
        const initOption = {
          title:{
             text:'▎商家销售统计',
             textStyle:{
                 fontSize:66
             },
             top:10,
             left:20
           },
           grid:{
             top:'20%',
             left:'3%',
             right:'6%',
             bottom:'3%',
             containLabel:true //距离是包含坐标轴上的文字
           },
           xAxis:{
             type:'value'
           },
           yAxis:{
             type:'category',
           },
           tooltip:{
             trigger:'axis',
             axisPointer:{
                 type:'line',
                 z:0,
                 lineStyle:{
                     width:66,
                     color:'#2D3443'
                 }
             }
           },
           series:[{
               type:'bar',
               barWidth:66,
               label:{
                   show:true,
                   position:'right',
                   textStyle:{
                       color:'white'
                   }
               },
               itemStyle:{
                   barBorderRadius:[0,33,33,0],                 //x1,y1,x2,y2
                   color:new this.$echarts.graphic.LinearGradient(0,0,1,0,[
                       {
                           offset:0,
                           color:'#5052EE'
                       },
                       {
                           offset:1,
                           color:'#AB6EE5'
                       }
                   ])
               }
           }]
        }
        this.chartInstance.setOption(initOption)
        this.chartInstance.on('mouseover',() => {
            clearInterval(this.timer)
        })
        this.chartInstance.on('mouseout',() => {
            this.startInterval()
        })
      },

      //获取数据
      async getData(ret) {
        'https://127.0.0.1:8081/api/seller'
         //let {data:ret} = await this.$axios.get('seller')
         this.allData = ret
         this.allData.sort((a,b) => {
             return a.value-b.value
         })
         this.totalPage = Math.ceil(this.allData.length/5)
         this.updateChart()
         this.startInterval()
      },

      //更新图表
      updateChart() {
        let start = (this.currentPage-1)*5
        let end = (this.currentPage)*5
        const showData = this.allData.slice(start,end)
        const sellerNames = showData.map(item=>{
            return item.name
        })
        const sellerValues = showData.map(item=>{
            return item.value
        })
        const dataOption = {
        
           yAxis:{
             data:sellerNames
           },
           series:[
               {data:sellerValues}
           ]
        }
        this.chartInstance.setOption(dataOption)
      },
      startInterval() {
          if(this.timer){
             clearInterval(this.timer)
          }
          this.timer=setInterval(() => {
            this.currentPage++
            this.currentPage=this.currentPage>this.totalPage?1:this.currentPage
            this.updateChart()
          },3000)
      },
      //屏幕适配     
      screenAdapter() {
        let titleSize = 0
        if(this.$refs.seller_ref){
          titleSize = this.$refs.seller_ref.offsetWidth/100*3.6
        }
        //const titleSize = this.$refs.seller_ref.offsetWidth/100*3.6
        const adapterOption = {
          title:{
             textStyle:{
                 fontSize:titleSize 
             },
           },
           tooltip:{
             axisPointer:{
                 lineStyle:{
                     width:titleSize ,
                 }
             }
           },
           series:{
               barWidth:titleSize,
               itemStyle:{
                   barBorderRadius:[0,titleSize/2,titleSize/2,0],                 
               },
               barGap: titleSize*2
           }
        }
        this.chartInstance.setOption(adapterOption)
        //图表大小适配
        this.chartInstance.resize()
      }
      
  }
  }
</script>

<style lang="less">
</style>
