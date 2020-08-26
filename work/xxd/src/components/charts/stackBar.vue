<template>
    <chart class="mt20" :options="options"
            auto-resize
            style='width: 100%;height:200px'>
    </chart>
</template>
<script>
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/bar'

export default {
  components: {
    chart: ECharts
  },
  props: {

    /*  data:{
            required:true,
            type:Object
        } */
  },
  data() {
    return {
      options: {
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ['等保测评', '安全服务', '外购安全服务', '其他安全服务', '安全软件'],
          x: 0,
          itemHeight: 9,
          itemWidth: 9
        },
        grid: {
          x: 40,
          x2: 0,
          y: 40,
          y2: 20
        },
        calculable: true,
        yAxis: [
          {
            type: 'category',
            data: ['2015', '2016', '2017', '2018', '2019'],
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            }
          }
        ],
        xAxis: [
          {
            type: 'value',
            show: false
          }
        ],
        series: [
          {
            name: '等保测评',
            barWidth: '14',
            type: 'bar',
            stack: '产品线',
            data: [85, 83, 70, 59, 75],
            itemStyle: {
              normal: {
                label: {
                  show: true, // 开启显示
                  // position: 'center',
                  textStyle: { // 数值样式
                    color: '#fff',
                    fontSize: 12
                  }
                },
                color: '#5a8bff'
              }
            }
          },
          {
            name: '安全服务',
            type: 'bar',
            stack: '产品线',
            data: [3, 13, 10, 5, 10],
            itemStyle: {
              normal: {
                label: {
                  show: true, // 开启显示
                  // position: 'center',
                  textStyle: { // 数值样式
                    color: '#fff',
                    fontSize: 12
                  }
                },
                color: '#67a2fa'
              }
            }
          },
          {
            name: '外购安全服务',
            type: 'bar',
            stack: '产品线',
            data: [2, 6, 10, 5, 5],
            itemStyle: {
              normal: {
                label: {
                  show: true, // 开启显示
                  // position: 'center',
                  textStyle: { // 数值样式
                    color: '#fff',
                    fontSize: 12
                  }
                },
                color: '#71c4f8'
              }
            }
          },
          {
            name: '其他安全服务',
            type: 'bar',
            stack: '产品线',
            data: [2, 0, 10, 5, 5],
            itemStyle: {
              normal: {
                label: {
                  show: true, // 开启显示
                  // position: 'center',
                  textStyle: { // 数值样式
                    color: '#fff',
                    fontSize: 12
                  }
                },
                color: '#9d9bfa'
              }
            }
          },
          {
            name: '安全软件',
            type: 'bar',
            stack: '产品线',
            data: [40, 0, 9, 11, 8],
            itemStyle: {
              normal: {
                label: {
                  show: true, // 开启显示
                  // position: 'center',
                  textStyle: { // 数值样式
                    color: '#fff',
                    fontSize: 12
                  }
                },
                color: '#a78cf3'
              }
            }
          }
        ]
      }

    }
  }
}
</script>
<style lang="scss" scoped>

</style>
