<template>
  <div class='screen-container' :style = 'containerStyle'>
     <header class='screen-header'>
         <div>
             <img :src='headerSrc' alt=''/>
         </div>
         <span class='logo'>
             <img :src='logoSrc' alt=''/>
         </span>
         <span class='title' :style = 'containerStyle'>电商平台实时监控系统</span>
         <div class='title-right'>
             <img :src='themeSrc' @click='handleChangeTheme' class='qiehuan'/>
             <span class='datetime'>{{str}}</span>
             <!-- ////2049-01-01 00:00:00 -->
         </div>
     </header>
     <div class='screen-body'>
         <section class='screen-left'>
             <div id="left-top" :class="[fullScreenStatus.trend ? 'fullscreen':''] ">
          <!-- 销量趋势图表 -->
          <Trend ref="trend"></Trend>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click = "changeSize('trend')" :class="['iconfont',fullScreenStatus.trend ?'icon-compress-alt': 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="left-bottom" :class="[fullScreenStatus.seller ? 'fullscreen':'' ]">
          <!-- 商家销售金额图表 -->
          <Seller ref="seller"></Seller>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click = "changeSize('seller')" :class="['iconfont',fullScreenStatus.seller ?'icon-compress-alt': 'icon-expand-alt']"></span>
          </div>
        </div>
         </section>
         <section class='screen-middle'>
             <div id="middle-top" :class="[fullScreenStatus.map ? 'fullscreen':'' ]">
          <!-- 商家分布图表 -->
          <Map ref="map"></Map>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click = "changeSize('map')" :class="['iconfont',fullScreenStatus.map ?'icon-compress-alt': 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="middle-bottom" :class=" [fullScreenStatus.rank ? 'fullscreen':''] ">
          <!-- 地区销量排行图表 -->
          <Rank ref="rank"></Rank>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click = "changeSize('rank')" :class="['iconfont',fullScreenStatus.rank ?'icon-compress-alt': 'icon-expand-alt']"></span>
          </div>
        </div>
         </section>
         <section class='screen-right'>
            <div id="right-top" :class=" [fullScreenStatus.hot ? 'fullscreen':''] ">
                <!-- 热销商品占比图表 -->
                <Hot ref="hot"></Hot>
                <div class="resize">
                    <!-- icon-compress-alt -->
                    <span @click = "changeSize('hot')" :class="['iconfont',fullScreenStatus.hot ?'icon-compress-alt': 'icon-expand-alt']"></span>
                </div>
            </div>
            <div id="right-bottom" :class=" [fullScreenStatus.stock ? 'fullscreen':''] ">
                <!-- 库存销量分析图表 -->
                <Stock ref="stock"></Stock>
                <div class="resize">
                    <!-- icon-compress-alt -->
                    <span @click = "changeSize('stock')" :class="['iconfont',fullScreenStatus.stock ?'icon-compress-alt': 'icon-expand-alt']"></span>
                </div>
        </div>
         </section>
     </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {getThemeValue} from '@/utils/theme_utils.js'
import Hot from '@/components/Hot.vue'
import Map from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Seller from '@/components/Seller.vue'
import Stock from '@/components/Stock.vue'
import Trend from '@/components/Trend.vue'

export default{
    data() {
      return{
          fullScreenStatus:{
              trend:false,
              map:false,
              hot:false,
              rank:false,
              stock:false,
              seller:false,
              
          },
          date:null,
          str:''
      }
    },
    computed:{
        ...mapState(['theme']),
        logoSrc() {
            return '/static/img/'+getThemeValue(this.theme).logoSrc
        },
        headerSrc() {
            return '/static/img/'+getThemeValue(this.theme).headerBorderSrc
        },
        themeSrc() {
            return '/static/img/'+getThemeValue(this.theme).themeSrc
        },
        containerStyle() {
            return {
                backgroundColor:getThemeValue(this.theme).backgroundColor,
                color:getThemeValue(this.theme).titleColor
            }
        },
    },
     watch:{
          date() {
            let year = this.date.getFullYear(); 
            let month = this.date.getMonth()>9?this.date.getMonth():'0'+this.date.getMonth();
            let day = this.date.getDate()>9?this.date.getDate():'0'+this.date.getDate();
            let hours = this.date.getHours()>9?this.date.getHours():'0'+this.date.getHours();
            let minutes = this.date.getMinutes()>9?this.date.getMinutes():'0'+this.date.getMinutes(); 
            let seconds = this.date.getSeconds()>9?this.date.getSeconds():'0'+this.date.getSeconds(); 
            this.str = `${year}-${month}-${day}  ${hours}:${minutes}:${seconds}`
            
          }
     },
    created() {
        this.getDate()
      this.$socket.registerCallBack('fullScreen',this.recvData)
      this.$socket.registerCallBack('themeChange',this.recvThemeChange)
    },
    destoryed() {
      this.$socket.unRegisterCallBack('fullScreen')
      this.$socket.unRegisterCallBack('themeChange')
    },
    methods:{
        changeSize(chartName) {
        //   this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName]
        //   //调用对应图表的screenAdapter方法，进行屏幕适配
        //   this.$nextTick(() => {
        //       this.$refs[chartName].screenAdapter()
        //   })
        
        //将数据发送给服务器
         const targetValue = !this.fullScreenStatus[chartName]
         this.$socket.send({
             action:'fullScreen',
             socketType:'fullScreen',
             chartName:chartName,
             value:targetValue
         })
         
          
        },

        //接收到全屏数据后的处理
        recvData(data) {
          // 取出是哪一个图表需要进行切换
          const chartName = data.chartName
          // 取出切换成什么状态
          const targetValue = data.value
          this.fullScreenStatus[chartName] = targetValue
          this.$nextTick(() => {
              this.$refs[chartName].screenAdapter()
          })
        },
        handleChangeTheme() {
            //this.$store.commit('changeTheme')
            this.$socket.send({
             action:'themeChange',
             socketType:'themeChange',
             chartName:'',
             value:''
         })
        },
        recvThemeChange() {
            this.$store.commit('changeTheme')
        },
        getDate() {
            //let date = new Date()
          setInterval(() => {
                this.date = new Date()
            },1000)
        },
    },
    components: {
        Hot,
        Map,
        Rank,
        Seller,
        Stock,
        Trend
    }
}
</script>

<style lang="less">
// 全屏样式的定义
.fullscreen {
  position: fixed!important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}

.screen-container{
    width:100%;
    height:100%;
    padding: 0 20px;
    background-color:#161522;
    color: #fff;
    box-sizing: border-box;
}
.screen-header{
  width: 100%;
  height:45px;
  font-size: 20px;
  position: relative;
  > div {
      img {
        width: 100%;
      }
    }
  .title {
    position: absolute;
    left: 50%;
    top: 35%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position:absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 60%;
    transform: translateY(-80%);
    img {
      height: 28px;
      width: 128px;
    }
  }
}

.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 0px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      height: 50%;
      position: relative;
    }
    #left-bottom {
      height: 38%;
      margin-top: 10px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 50%;
      position: relative;
      margin-top:5px;
    }
    #middle-bottom {
      margin-top: 20px;
      width: 100%;
      height: 35%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 50%;
      position: relative;
    }
    #right-bottom {
      height: 38%;
      margin-top: 10px;
      position: relative;
    }
  }
}
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>

