<template>
    <chart class="mt20" :options="options" style="width:100%;height:100%">
    </chart>
</template>
<script>
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/pie'

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
        tooltip: {
          trigger: 'axis'
        },
        calculable: true,
        legend: {
          data: ['二级系统', '三级系统', '四级系统'],
          // icon:"line",
          orient: 'vertical',
          x: '70%',
          y: '20%'
        },
        grid: {
          x: 60,
          y: 180

        },
        xAxis: [
          {
            type: 'category',
            splitLine: { show: false },
            data: this.data.yearLegend,
            axisTick: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#999'
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            position: 'left',
            axisLine: {
              show: false
            },
            axisLabel: {
              textStyle: {
                color: '#999'
              }
            },
            axisTick: {
              lineStyle: {
                color: '#999'
              }
            }

          }
        ],
        series: [
          this.data.lineData[0],
          this.data.lineData[1],
          this.data.lineData[2],
          {
            name: '等级保护项目统计',
            type: 'pie',
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            center: ['40%', '20%'],
            position: 'center',
            radius: [0, '30%'],
            itemStyle: {
              normal: {
                labelLine: {
                  length: 20
                },
                color: function(params) {
                  // 自定义颜色
                  var colorList = ['#8dcf70', '#6e87f2', '#fab63b'];
                  return colorList[params.dataIndex]
                }
              }
            },
            data: this.data.pieData
          }
        ]
      }

    }
  }
}
</script>
<style lang="scss" scoped>

</style>
