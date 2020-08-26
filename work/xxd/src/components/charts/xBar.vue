<template>
    <chart class="mt20" :options="options"
            auto-resize
            style='width: 100%;height:200px'>
    </chart>
</template>
<script>
import ECharts from 'vue-echarts/components/ECharts.vue'
import echarts from 'echarts'
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
    data: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      options: {
        calculable: true,
        grid: {
          x: 60,
          y: 0,
          y2: 0
        },
        xAxis: [
          {
            type: 'value',
            show: false
          }
        ],
        yAxis: [
          {
            type: 'category',
            data: this.data.categoryArr,
            axisLabel: {
              show: true,
              textStyle: {
                color: '#868686'
              }
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            }
          }
        ],
        series: [
          {
            type: 'bar',
            data: this.data.dataArr,
            barWidth: '10',
            itemStyle: {
              normal: {
                barBorderRadius: [10, 10, 10, 10],
                label: {
                  show: true, // 开启显示
                  position: 'right',
                  textStyle: { // 数值样式
                    color: '#a0a0a0',
                    fontSize: 12
                  }
                },
                color: new echarts.graphic.LinearGradient(
                  0, 0, 1, 0,
                  [
                    { offset: 0, color: '#4c8ced' },
                    { offset: 1, color: '#56baf9' }
                  ]
                )
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
