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
import 'echarts/lib/component/title'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/pie'
export default {
  name: 'circleChart',
  components: {
    chart: ECharts
  },
  props: {
    dataArr: {
      required: true,
      type: Array
    },
    dataTitle: {
      required: true,
      type: String
    }
  },

  data () {
    return {
      options: {
        legend: {
          orient: 'vertical',
          x: '70%',
          y: 'center',
          itemHeight: 9,
          itemWidth: 9,
          data: this.dataArr,
          formatter: function(name) {
            return name
          },
          textStyle: { color: 'auto' }
        },
        grid: {
          x: 0,
          x2: 0,
          y: 0,
          y2: 0
        },
        title: {
          show: true,
          text: this.dataTitle,
          x: '29%',
          y: 'center',
          textAlign: 'center',
          textStyle: {
            fontSize: 12,
            color: '#666'
          }
        },
        series: [
          {
            type: 'pie',
            center: ['30%', '50%'],
            radius: ['48%', '60%'],
            hoverAnimation: false,
            data: this.dataArr,
            itemStyle: {
              normal: {
                color: function(params) {
                  // 自定义颜色
                  var colorList = ['#4c6bf0', '#6492fd', '#7baefb', '#71c4f8', '#9d9bfa', '#aa90f3', '#8f7bf2', '#785ff4'];
                  return colorList[params.dataIndex]
                },
                labelLine: {
                  show: false,
                  length: 0
                },
                label: {
                  show: false,
                  formatter: function(params) {
                    return params.data.name + '\n' + params.data.value
                  }
                }
              },
              emphasis: {
                labelLine: {
                  show: true
                },
                label: {
                  show: true,
                  formatter: function(params) {
                    return params.data.name + '\n' + params.data.value
                  }
                }
              }
            }
          },
          {
            type: 'pie',
            radius: ['42%', '48%'],
            center: ['30%', '50%'],
            hoverAnimation: false,
            data: this.dataArr,
            itemStyle: {
              normal: {
                color: function(params) {
                  var colorList = ['#9daef7', '#aac3fe', '#b5d1fd', '#b1dffb', '#c9c8fc', '#cfc0f8', '#c2b7f8', '#b5a7f9'];
                  return colorList[params.dataIndex]
                },
                label: {
                  show: false
                },
                labelLine: {
                  show: false
                }
              }
            }
          }
        ]
      }
    }
  }
}
</script>
<style lang="scss">
</style>
