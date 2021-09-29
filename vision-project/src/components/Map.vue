<template>
  <div class='com-container' @dblclick="revertMap">
     <div class='com-chart' ref='map_ref'>map</div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import axios from 'axios'
import {getProvinceMapInfo} from '../utils/map_utils.js'
export default{
    data() {
      return{
          chartInstance:null,
          allData:null,
          mapData:{}//缓存获取到的省份数据
      }
    },
    computed:{
    ...mapState(['theme'])
    },
    watch:{
        theme() {
            this.chartInstance.dispose()
            this.initChart()
            this.screenAdapter()
            this.updateChart()
        }
    },
    mounted() {
      this.initChart(),
      //this.getData()
      this.$socket.send({
        action:'getData',
        socketType:'mapData',
        chartName:'map',
        value:''
      })
      window.addEventListener('resize',this.screenAdapter)
      this.screenAdapter()
    },
    created() {
      this.$socket.registerCallBack('mapData',this.getData)
    },
    detoryed() {
      window.removeEventListener('resize',this.screenAdapter)
      this.$socket.unRegisterCallBack('mapData')
    },
    methods:{
      async initChart() {
        this.chartInstance = this.$echarts.init(this.$refs.map_ref,this.theme)
        //获取中国地图适量数据，由于map.json文件没在koa2后台，在本地的public目录中，所以不用配置好的this.$axios,直接引入axios
        let ret = await axios.get('http://localhost:8080/static/map/china.json') //eslint-disable-line no-unused-vars
        //注册地图
        this.$echarts.registerMap('china',ret.data)
        const initOption = {
            title:{
                text:'▎商家分布',
                left:20,
                top:20
            },
            geo:{
                type:'map',
                map:'china',
                top:'5%',
                bottom:'5%',
                itemStyle:{
                    areaColor:'#2E72BF',
                    borderColor:'#333'
                },
            },
            legend:{
                left:'5%',
                bottom:'5%',
                orient:'vertical'
            }
        }
        this.chartInstance.setOption(initOption)
        this.chartInstance.on('click',async (arg) => {
             //通过arg.name得到所点击的省份，这个省份是中文，引入插件处理成英文
            const provinceInfo = getProvinceMapInfo(arg.name)
            if(!provinceInfo.key){
                return
            }
            if(!this.mapData[provinceInfo.key]){
                const ret = await axios.get('http://localhost:8080'+provinceInfo.path)
                this.mapData[provinceInfo.key] = ret.data
                this.$echarts.registerMap(provinceInfo.key,ret.data)
            }
            
            const changeOption={
                  geo:{
                      map:provinceInfo.key
                  }
            }
            this.chartInstance.setOption(changeOption)
        })
      },
      async getData(ret) {
        // 获取散点数据
         //const {data:ret} = await this.$axios.get('map')
         this.allData = ret
         this.updateChart()
      },
      updateChart() {
         const seriesArr = this.allData.map(item=>{
             return {
                 type:'effectScatter',
                 //设置涟漪大小
                 rippleEffect:{
                     scale:5,
                     brushType:'stroke'
                 },
                 name:item.name,
                 data:item.children,
                 coordinateSystem:'geo'
             }
         })
         const legendArr = this.allData.map(item=>{
             return item.name
         })
        const dataOption = {
            legend:{
                data:legendArr
            },
            series:seriesArr
        }
        this.chartInstance.setOption(dataOption)
      },
      screenAdapter() {
          let titleFontSize = 0
          if(this.$refs.map_ref){
              titleFontSize = this.$refs.map_ref.offsetWidth/100*3.6
          }
        //const titleFontSize = this.$refs.map_ref.offsetWidth/100*3.6
        const adapterOption = {
            title:{
                textStyle:{
                    fontSize:titleFontSize
                }
            },
            legend:{
                itemWith:titleFontSize/2,
                itemHeight:titleFontSize/2,
                //图例之间的间隔
                itemGap:titleFontSize/2,
                textStyle:{
                    fontSize:titleFontSize/2
                }
            }
        }
        this.chartInstance.setOption(adapterOption)
        this.chartInstance .resize()
      },
      revertMap() {
         const revertOption={  //eslint-disable-line no-unused-vars
              geo:{
                  map:'china'
              }
          }
          this.chartInstance.setOption(revertOption)
      }
    },
    
}
</script>

<style lang="less">

</style>
