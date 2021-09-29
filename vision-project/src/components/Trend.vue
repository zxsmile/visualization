<template>
  <div class='com-container'>
    <div class='title' :style = comStyle>
      <span>{{'▎'+showTitle}}</span>
      <span class='iconfont title-icon' :style = 'comStyle' @click='showSelect=!showSelect'>&#xe6eb;</span>
      <div class='select-con' v-show='showSelect' :style='marginStyle'>
        <div class='select-item' v-for='item in selectTypes' :key=item.key @click='handleSelect(item.key)'>{{item.text}}</div>
      </div>
    </div>
    <div class='com-chart'  ref='trend_ref'></div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {getThemeValue} from '@/utils/theme_utils.js'
export default{
    data() {
      return{
          chartInstance:null,
          allData:null,
          showSelect:false,
          SelectType:'map',
          titleSize:0
      }
    },
    watch:{
        theme() {
            this.chartInstance.dispose()
            this.initChart()
            this.screenAdapter()
            this.updateChart()
        }
    },
    computed:{
      ...mapState(['theme']),
      selectTypes() {
          if(!this.allData){
              return []
          }else{
              return this.allData.type.filter(item=>{
                  return item.key!==this.SelectType
              })
          }
      },
      showTitle() {
          if(!this.allData){
              return ''
          }else{
              return this.allData[this.SelectType].title
          }
      },
      //计算标题样式大小（随屏幕变化）
      comStyle() {
          return {
              fontSize:this.titleSize+'px',
              color:getThemeValue(this.theme).titleColor,
              }
      },
      marginStyle() {
          return {
              marginLeft:this.titleSize-8+'px'
          }
      }
    },
    mounted() {
      this.initChart()
      //this.getData()
      //发送数据给服务端
      this.$socket.send({
          action:'getData',
          socketType:'trendData',
          chartName:'trend',
          value:''
      })
      window.addEventListener('resize',this.screenAdapter)
      this.screenAdapter()
    },
    created(){
      this.$socket.registerCallBack('trendData',this.getData)
    },
    destoryed(){
      window.removeEventListener('resize',this.screenAdapter)
      this.$socket.unRegisterCallBack('trendData')
    },
    methods:{
      initChart() {
         this.chartInstance = this.$echarts.init(this.$refs.trend_ref,this.theme)
         const initOption = {
             grid:{
                left:'3%',
                top:'35%',
                right:'4%',
                bottom:'1%',
                containLabel:true
             },
             xAxis:{
                 type:'category',
                 boundaryGap:false
             },
             yAxis:{
                 type:'value'
             },
             tooltip:{
                 trigger:'axis'
             },
             legend:{
                 left:20,
                 top:'15%',
                 icon:'circle'
             }
         }
         this.chartInstance.setOption(initOption)
      },
     async getData(ret) {
         //const {data:ret} = await this.$axios.get('trend')
         this.allData = ret
         this.updateChart()
      },
      updateChart() {
           // 半透明的颜色值
            const colorArr1 = [
                'rgba(11, 168, 44, 0.5)',
                'rgba(44, 110, 255, 0.5)',
                'rgba(22, 242, 217, 0.5)',
                'rgba(254, 33, 30, 0.5)',
                'rgba(250, 105, 0, 0.5)'
            ]
            // 全透明的颜色值
            const colorArr2 = [
                'rgba(11, 168, 44, 0)',
                'rgba(44, 110, 255, 0)',
                'rgba(22, 242, 217, 0)',
                'rgba(254, 33, 30, 0)',
                'rgba(250, 105, 0, 0)'
            ]
          //x轴数据
          const timeArr = this.allData.common.month
          //y轴数剧，series下的数据
          const valueArr = this.allData[this.SelectType].data
          const seriesArr = valueArr.map((item,index)=>{
              return {
                 type:'line',
                 name:item.name,
                 data:item.data,
                 stack:'map',
                 areaStyle: {
                     color:new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                         {
                             offset:0,
                             color:colorArr1[index]
                         },
                         {
                             offset:1,
                             color:colorArr2[index]
                         }
                     ])
                 }
              }
          })
          const legendArr = valueArr.map(item=>{
              return item.name
          })
          const dataOption = {
              xAxis:{
                  data:timeArr
              },
              series:seriesArr,
              legend:{
                  data:legendArr
              }
          }
          this.chartInstance.setOption(dataOption)
      },
      screenAdapter() {
        if(this.$refs.trend_ref){
            this.titleSize = this.$refs.trend_ref.offsetWidth/100*3.6
        }
        
        const adapterOption={
            legend:{
                itemWidth:this.titleSize,
                itemHeight:this.titleSize,
                itemGap:this.titleSize,
                textStyle:{
                    fontSize:this.titleSize/2
                }
            }
        }
        this.chartInstance.setOption(adapterOption)
        this.chartInstance.resize()
      },
      handleSelect(currentType) {
           this.SelectType = currentType
           this.updateChart()
           this.showSelect=false
      }
    }
    
}
</script>

<style lang="less">
.title{
  position:absolute;
  z-index:1;
  color:white;
  left:20px;
  top:20px;
  .title-icon{
    margin-left:10px;
    cursor:pointer;  
  }
  .select-con{
    background-color: #222733;
  }
}

</style>
