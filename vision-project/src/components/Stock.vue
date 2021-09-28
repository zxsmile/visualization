<template>
  <div class='com-container'>
    <div class='com-chart' ref='stock_ref'></div>
  </div> 
</template>

<script>
export default{
    data() {
      return{
          chartInstance:null,
          allData:null,
          currentPage:0,
          timer:null
      }
    },
    mounted() {
      this.initChart()
      this.getData()
      window.addEventListener('resize',this.screenAdapter)
      this.screenAdapter()

    },
    destoryed() {
      window.removeEventListener('resize',this.screenAdapter)
      clearInterval(this.timer)
    },
    methods:{
      initChart() {
          this.chartInstance = this.$echarts.init(this.$refs.stock_ref,'chalk')
          const initOption={
              title:{
                  text:'▎库存和销量分析',
                  top:20,
                  left:20
              }
          }
          this.chartInstance.setOption(initOption)
          this.chartInstance.on('mouseover',() => {
              clearInterval(this.timer)
          })
          this.chartInstance.on('mouseout',() => {
              this.startInterval()
          })
      },
      async getData() {
         const {data:ret} = await this.$axios.get('stock')
         console.log(ret)
         this.allData = ret
         this.updateChart()
         this.startInterval()
      },
      updateChart() {
          const centerArr = [
              ['18%','40%'],
              ['50%','40%'],
              ['82%','40%'],
              ['34%','75%'],
              ['66%','75%']
          ]
          const colorArr = [
             ['#4FF778', '#0BA82C'],
             ['#E5DD45', '#E8B11C'],
             ['#E8821C', '#E55445'],
             ['#5052EE', '#AB6EE5'],
             ['#23E5E5', '#2E72BF']
          ]
          const start = this.currentPage*5
          const end = (this.currentPage+1)*5
          const showData = this.allData.slice(start,end)
          const seriesArr = showData.map((item,index) => {
              return {
                  type:'pie',
                  radius:[110,100],
                  center:centerArr[index],
                  hoverAnimation:false,//关闭鼠标移入时的动画
                  labelLine:{
                      show:false //隐藏指示线
                  },
                  label:{
                      position:'center',
                      color:colorArr[index][0]
                  },
                  data:[
                      {   
                          name:item.name + '\n' + item.sales,
                          value:item.sales,
                          itemStyle:{
                              color:new this.$echarts.graphic.LinearGradient(0,1,0,0,[
                                  {
                                      offset:0,
                                      color:colorArr[index][0]
                                  },
                                  {
                                      offset:1,
                                      color:colorArr[index][1]
                                  }
                              ])
                          }
                      },
                      {
                          value:item.stock,
                          itemStyle:{
                              color:'#333843'
                          }
                      }
                  ]
              }
          })
          const dataOption = {
              series:seriesArr
          }
          this.chartInstance.setOption(dataOption)
      },
      screenAdapter() {
          const titleSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6 //eslint-disable-line no-unused-vars
          const innerRadius = titleSize*2
          const outerRadius = innerRadius*1.125 //eslint-disable-line no-unused-vars
          const adapterOption = {
              title:{
                  textStyle:{
                      fontSize:titleSize
                  }
              },
              series:[
                  {
                      type:'pie',
                      redius:[outerRadius,innerRadius],
                      label:{
                          fontSize:titleSize/2
                      }
                  },
                  {
                      type:'pie',
                      redius:[outerRadius,innerRadius],
                      label:{
                          fontSize:titleSize/2
                      }
                  },
                  {
                      type:'pie',
                      redius:[outerRadius,innerRadius],
                      label:{
                          fontSize:titleSize/2
                      }
                  },
                  {
                      type:'pie',
                      redius:[outerRadius,innerRadius],
                      label:{
                          fontSize:titleSize/2
                      }
                  },
                  {
                      type:'pie',
                      redius:[outerRadius,innerRadius],
                      label:{
                          fontSize:titleSize/2
                      }
                  }
              ]
          }
          this.chartInstance.setOption(adapterOption)
          this.chartInstance.resize()
      },
      startInterval() {
          if(this.timer){
              clearInterval(this.timer)
          }
          this.timer = setInterval(() => {
             this.currentPage++
             const totalPage = Math.ceil(this.allData.length/5)
             if(this.currentPage>totalPage){
                 this.currentPage=0
             }
             this.updateChart()
          },2000)
      }
    }
}
</script>

<style lang="less">
</style>

