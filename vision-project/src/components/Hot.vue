<template>
  <div class='com-container'>
    <div class='com-chart' ref='hot_ref'></div>
    <span class='iconfont arr-left' @click='toLeft' :style ='catStyle'>&#xe6eb;</span>
    <span class='iconfont arr-right' @click='toRight' :style ='catStyle'>&#xe6ee;</span>
    <span class= 'cat-title' :style ='catStyle'>{{catName}}</span>
  </div> 
</template>

<script>
export default{
    data() {
      return{
          chartInstance:null,
          allData:null,
          currentIndex:0,
          titleSize:0
      }
    },
    computed:{
       catName() {
           if(!this.allData){
               return ''
           }else{
               return this.allData[this.currentIndex].name
           }
       },
       catStyle() {
           return {
               fontSize:this.titleSize+'px'
               }
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
    },
    methods:{
      initChart() {
          this.chartInstance = this.$echarts.init(this.$refs.hot_ref,'chalk')
          const initOption={
              title:{
                text:'▎热销商品销量占比',
                left:20,
                top:20 
              },
              legend:{
                top:'10%',
                icon:'circle'
              },
              series:[
                  {
                      type:'pie',
                      label:{
                          show:false
                      },
                      emphasis:{
                         label:{
                             show:true
                         },
                         labelLine:{
                             show:false
                         }
                      }
                  }
              ]
          }
          this.chartInstance.setOption(initOption)
      },
      async getData() {
         const {data:ret} = await this.$axios.get('hot')
         console.log(ret)
         this.allData = ret
         this.updateChart()
      },
      updateChart() {
          const legendData = this.allData[this.currentIndex].children.map(item=>{
              return item.name
          })
          const seriesData = this.allData[this.currentIndex].children.map(item=>{
              return {
                      name:item.name,
                      value:item.value,
                      children:item.children
                    }
          })
          const dataOption = {
              legend:{
                data:legendData
              },
              series:[
                  {
                      data:seriesData
                  }
              ],
              tooltip:{
                  show:true,
                  formatter:(arg) => {
                      let thirdCatrgory = arg.data.children
                      //计算百分比
                      let total = 0
                      thirdCatrgory.forEach(item => {
                          total += item.value
                      })   
                      let retStr = ''
                      thirdCatrgory.forEach(item => {
                          retStr += `${item.name}:${parseInt(item.value/total*100)+'%'}<br/>`
                      })
                      return retStr
                  }
              }
          }
          this.chartInstance.setOption(dataOption)
      },
      screenAdapter() {
          this.titleSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6 //eslint-disable-line no-unused-vars
          const adapterOption = {
              title:{
                  textStyle:{
                      fontSize:this.titleSize
                  }
              },
              legend:{
                  itemWidth:this.titleSize/2,
                  itemHeight:this.titleSize/2,
                  itemGap:this.titleSize/2,
                  textStyle:{
                      fontSize:this.titleSize/2
                  }
              },
              series:[
                  {
                      radius:this.titleSize*4.5,
                      center:['50%','50%']
                  }
              ]
          }
          this.chartInstance.setOption(adapterOption)
          this.chartInstance.resize()
      },
      toLeft() {
          this.currentIndex--
          if(this.currentIndex<0){
              this.currentIndex = this.allData.length-1
          }
          this.updateChart()
      },
      toRight() {
          this.currentIndex++
          if(this.currentIndex>this.allData.length-1){
              this.currentIndex = 0
          }
           this.updateChart()
      }
    }
}
</script>

<style lang="less">
   .arr-left{
       position:absolute;
       left:10%;
       top:50%;
       transform:translateY(-50%);
       cursor:pointer;
       color:white;
   }
   .arr-right{
       position:absolute;
       right:10%;
       top:50%;
       transform:translateY(-50%);
       cursor:pointer;
       color: white;
   }
   .cat-title{
       position:absolute;
       right: 20%;
       bottom:20px;
       color: white;
   }
</style>

