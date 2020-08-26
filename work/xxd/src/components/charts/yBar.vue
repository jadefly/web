<template>
<div>
    <chart v-if="show" class="mt20" :options="options"
            auto-resize
            style='width: 100%;height:100%'>
    </chart>
</div>
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
      show: false,
      options: {
        calculable: true,
        grid: {
          x: 40,
          y: 30,
          y2: 20
        },
        yAxis: [
          {
            type: 'value',
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
              show: true,
              lineStyle: {
                color: '#868686'
              }
            },
            splitLine: {
              show: false
            }
          }
        ],
        xAxis: [
          {
            type: 'category',
            axisLabel: {
              interval: 0
            },
            axisLine: {
              lineStyle: {
                color: '#868686'
              }
            },
            data: []
          }
        ],
        series: [
          {
            name: '2012年',
            type: 'bar',
            data: [],
            barWidth: '10',
            itemStyle: {
              normal: {
                barBorderRadius: [10, 10, 10, 10],
                label: {
                  show: true, // 开启显示
                  position: 'top',
                  textStyle: { // 数值样式
                    color: '#818486',
                    fontSize: 12
                  }
                },
                color: new echarts.graphic.LinearGradient(
                  0, 1, 0, 0,
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
  },
  methods: {
    setOptions() {
      this.options.xAxis[0].data = this.data.categoryArr
      this.options.series[0].data = this.data.dataArr
    }
  },
  created() {
    this.setOptions()
    this.show = true;
  },
  watch: {
    data: {
      immediate: true,
      handler (val) {
        this.setOptions()
      }
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
