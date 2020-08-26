<template>
    <chart class="mt20" :options="options"
            auto-resize
            style='width: 100%;height:240px'>
    </chart>
</template>
<script>
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/chart/line'

export default {
  components: {
    chart: ECharts
  },
  props: {

    data: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
      options: {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          // data:['2015','2016','2017','2018','2019'],
          formatter: function(params) {
            console.log(params)
            return params
          },
          x: 'left'
        },
        grid: {
          x: 50,
          y: 40,
          y2: 20
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['第一季度', '第二季度', '第三季度', '第四季度']
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: this.data[0].year,
            type: 'line',
            smooth: false,
            data: this.data[0].data,
            itemStyle: {
              normal: {
                color: '#8f7bf2',
                lineStyle: {
                  color: '#8f7bf2'
                }
              }
            }
          },
          {
            name: this.data[1].year,
            type: 'line',
            smooth: false,
            data: this.data[1].data,
            itemStyle: {
              normal: {
                color: '#f56c6c',
                lineStyle: {
                  color: '#f56c6c'
                }
              }
            }
          },
          {
            name: this.data[2].year,
            type: 'line',
            smooth: false,
            data: this.data[2].data,
            itemStyle: {
              normal: {
                color: '#f9ae26',
                lineStyle: {
                  color: '#f9ae26'
                }
              }
            }
          },
          {
            name: this.data[3].year,
            type: 'line',
            smooth: false,
            data: this.data[3].data,
            itemStyle: {
              normal: {
                color: '#83cb62',
                lineStyle: {
                  color: '#83cb62'
                }
              }
            }
          },
          {
            name: this.data[4].year,
            type: 'line',
            smooth: false,
            data: this.data[4].data,
            itemStyle: {
              normal: {
                color: '#5a8bff',
                lineStyle: {
                  color: '#5a8bff'
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
<style lang="scss" scoped>

</style>
