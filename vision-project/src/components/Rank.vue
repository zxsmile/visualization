<template>
  <div class='com-container'>
    <div class='com-chart'  ref = 'rank_ref'></div>
  </div>
</template>

<script>
export default{
  data() {
    return{
      chartInstance:null,
      allData:null,
      startValue:0,
      endValue:9,
      timer:null
    }
  },
  mounted() {
    this.initChart()
    //this.getData()
    this.$socket.send({
      action:'getData',
      socketType:'rankData',
      chartName:'rank',
      value:''
    })
    //监听页面窗口
    window.addEventListener('resize',this.screenAdapter)
    //界面加载完主动进行屏幕适配
    this.screenAdapter()
 },
 created() {
    this.$socket.registerCallBack('rankData',this.getData)
  },
  destoryed() {
    //页面销毁取消掉监听器
    window.removeEventListener('reaize',this.screenAdapter)
    clearInterval(this.timer)
    this.$socket.unRegisterCallBack('rankData') 
  },
  methods:{
      //初始化echartInstanec对象
      initChart() {
        this.chartInstance = this.$echarts.init(this.$refs.rank_ref,'chalk')
        const initOption = {
            title:{
                text:'▎地区销售统计',
                top:20,
                left:20
            },
            grid:{
               top:'40%',
               left:'5%',
               right:'5%',
               bottom:'5%',
               containLabel:true
            },
            tooltip:{
                show:true
            },
            xAxis:{
                type:'category'
            },
            yAxis:{
                type:'value'
            },
            series:[
                {
                    type:'bar'
                }
            ]
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
         //let {data:ret} = await this.$axios.get('rank')
         this.allData = ret
         this.allData.sort((a,b) => {
            return b.value-a.value
        })
         console.log(ret)
         this.updateChart()
         this.startInterval()
      },

      //更新图表
      updateChart() {
        const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
        const nameArr = this.allData.map(item => {
            return item.name
        })
        const valueArr = this.allData.map(item => {
            return item.value
        })
        const dataOption = {
            xAxis:{
                data:nameArr
            },
            dataZoom:{
                show:false,
                startValue:this.startValue,
                endValue:this.endValue
            },
            series:[
                {
                    data:valueArr,
                    itemStyle:{
                        color:arg => {
                            let targetColorArr = null
                            if(arg.value>300){
                               targetColorArr = colorArr[0]
                            }else if(arg.value>200){
                               targetColorArr = colorArr[1]
                            }else{
                               targetColorArr = colorArr[2]
                            }
                            return new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                                    {
                                        offset:0,
                                        color:targetColorArr[0]
                                    
                                    },
                                    {
                                        offset:1,
                                        color:targetColorArr[1]
                                    }
                                ])
                        }
                    }
                }
            ]
        }
        this.chartInstance.setOption(dataOption)
      },
      //屏幕适配     
      screenAdapter() {
        let titleSize = 0
        if(this.$refs.rank_ref){
            titleSize = this.$refs.rank_ref.offsetWidth/100*3.6
        }
        //const titleSize = this.$refs.rank_ref.offsetWidth/100*3.6
        const adapterOption = {
            title:{
                textStyle:{
                    fontSize:titleSize
                }
            },
            series:[
                {
                barWidth:titleSize,
                itemStyle:{
                    barBorderRadius:[titleSize/2,titleSize/2,0,0]
                }
                }
            ]
        }
        this.chartInstance.setOption(adapterOption)
        //图表大小适配
        this.chartInstance.resize()
      },

      startInterval() {
          if(this.timer){
              clearInterval(this.timer)
          }
          this.timer = setInterval(() => {
              this.startValue++
              this.endValue++
              if(this.endValue>this.allData.length-1){
                  this.startValue=0
                  this.endValue=9
              }
              this.updateChart()
          },2000);
      }
      
  }
  }
</script>

<style lang="less">
</style>
