<template>
  <chart :options="options"
         auto-resize
         style='width: 100%;height:100%;'>
  </chart>
</template>
<script>
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/chart/line'
export default {
  name: 'lineBar',
  components: {
    chart: ECharts
  },
  props: {
    data: {
      
    }
  },
  data () {
    return {
      options: { 
        backgroundColor: '#fff', 
        tooltip: {              //设置tip提示
            trigger: 'axis'
        },        
        legend: {               //设置区分（哪条线属于什么）
            x: 'right',
            y: 'top',
            data:['上一周期','本周期']
        },
        color: ['#6490f9', '#4dd7be'],       //设置区分（每条线是什么颜色，和 legend 一一对应）
        xAxis: {                //设置x轴
            type: 'category',
            boundaryGap: true,     //坐标轴两边不留白
            data: ['api0', 'api1', 'api2', 'api3', 'api4', 'api5', 'api6', 'api7', 'api8',],
            name: '',           //X轴 name
            nameTextStyle: {        //坐标轴名称的文字样式
                color: '#FA6F53',
                fontSize: 16,
                padding: [0, 0, 0, 20]
            },
            axisLine: {//坐标轴
                lineStyle:{
                    opacity: 0.01,//设置透明度就可以控制显示不显示
                },
            },
            splitLine: {//网格线
                show: false,//网格线
                lineStyle:{
                    color: '#fff',
                },
            },
            axisTick: {//刻度线
                show: false,//去掉刻度线
            },
        },
        yAxis: {
            name: '系统备案曲线',
            min:0, // 设置y轴刻度的最小值
            max:600,  // 设置y轴刻度的最大值
            splitNumber:3,  // 设置y轴刻度间隔个数
            nameTextStyle: {
                color: '#666',
                fontSize: 16,
                padding: [0, 0, 10, 0]
            },
            axisTick: {//刻度线
                show: false,//去掉刻度线
            },
            axisLine: {//坐标轴线
                lineStyle:{
                    opacity: 0,//透明度为0 
                },
            },
            splitLine: {//网格线
                show: false,//网格线
                lineStyle:{
                    color: '#fff',
                },
            },
            type: 'value'
        },
        series: [
          {
            name: '上一周期',
            data:  [220, 232, 201, 234, 290, 230, 220, 510, 306],
            type: 'line',               // 类型为折线图
            lineStyle: {                // 线条样式 => 必须使用normal属性
                normal: {
                    color: '#6490f9',
                }
            },
            // 设置小圆点消失
            // 注意：设置symbol: 'none'以后，拐点不存在了，设置拐点上显示数值无效
            symbol: 'none',
            // 设置折线弧度，取值：0-1之间
            smooth: 0.5
          },
          {
            name: '本周期',
            data: [120, 200, 150, 580, 70, 110, 430, 360, 240],
            type: 'line',
            lineStyle: {
                normal: {
                    color: '#4dd7be',
                }
            },
            // 设置小圆点消失
            // 注意：设置symbol: 'none'以后，拐点不存在了，设置拐点上显示数值无效
            symbol: 'none',
            // 设置折线弧度，取值：0-1之间
            smooth: 0.5
          }
        ]
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
</style>
