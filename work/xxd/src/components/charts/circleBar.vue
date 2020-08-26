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
import 'echarts/lib/chart/pie'
export default {
  name: 'cicle',
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
  watch: {
    dataArr: function(newvalue, oldvalue) {
      console.log('newvalue', newvalue)
      this.options= {
        legend: {
          orient: 'vertical',
          x: "left",
          y:"center",
          icon:"circle",
          data:newvalue,
          formatter:function(name) {
            return name
          },
          textStyle:{color: 'auto'},
        },
        title: {
          show: true,
          text: this.dataTitle,
          x: '55%',
          y: "center",
          textAlign:"center",
          textStyle:{
            fontSize: 12,
            color: '#666'
          }
        },
        series: [
          {
            type: 'pie',
            center:['55%', "50%"],
            radius: ['80%', '95%'],
            hoverAnimation:false,
            data: newvalue,
            itemStyle: {
              normal: {
                color: function(params) {
                  //自定义颜色
                  var colorList = ["#5084ff","#f9ae26"];
                  return colorList[params.dataIndex]
                },
                labelLine:{
                  length:0
                },
                label:{
                  formatter:function(params) {
                    return params.data.name+" "+params.data.value
                    console.log(params)
                  },
                }
              }
            }
          },
          {
            type: 'pie',
            radius: ['63%', '78%'],
            center: ['55%', '50%'],
            hoverAnimation: false,
            data: newvalue,
            itemStyle: {
              normal: {
                color: function(params) {
                  var colorList = ['#bed1ff', "#fddfa9"];
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
          },
          {
            type: 'pie',
            radius: ['46%', '61%'],
            center: ['55%', '50%'],
            hoverAnimation: false,
            data: newvalue,
            itemStyle: {
              normal: {
                color: function(params) {
                  var colorList = ["#eff4ff","#fef7ea"];
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
  },
  data () {
    return {
      options: {
          legend: {
              orient: 'vertical',
              x: "left",
              y:"center",
              icon:"circle",
              data:this.dataArr,
              formatter:function(name){
                return name
              },
              textStyle:{color: 'auto'},
          },
          title: {
            show: true,
            text: this.dataTitle,
            x: '55%',
            y: "center",
            textAlign:"center",
            textStyle:{
                fontSize: 12,
                color: '#666'
            }  
          },
          series: [
              {
                  type: 'pie',
                  center:["55%","50%"],
                  radius: ['80%', '95%'],
                  hoverAnimation:false,
                  data: this.dataArr,
                  itemStyle: {
                      normal:{
                          color:function(params) {
                          //自定义颜色
                          var colorList = ["#5084ff","#f9ae26"];
                              return colorList[params.dataIndex]
                            },
                          labelLine:{
                            length:0
                          },
                          label:{
                            formatter:function(params){
                              return params.data.name+" "+params.data.value
                              console.log(params)
                            },
                          }
                      }
                  }
              },
               {
                  type: 'pie',
                  radius: ['63%', '78%'],
                  center:["55%","50%"],
                  hoverAnimation:false,
                  data: this.dataArr,
                  itemStyle: {
                      normal:{
                        color:function(params) {
                        var colorList = ["#bed1ff","#fddfa9"];
                            return colorList[params.dataIndex]
                        },
                        label : {
                          show : false
                        },
                        labelLine : {
                            show : false
                        }
                      },
                  },
               },
              {
                  type: 'pie',
                  radius: ['46%', '61%'],
                  center:["55%","50%"],
                  hoverAnimation:false,
                  data: this.dataArr,
                  itemStyle: {
                      normal:{
                        color:function(params) {
                        var colorList = ["#eff4ff","#fef7ea"];
                            return colorList[params.dataIndex]
                        },
                        label : {
                          show : false
                        },
                        labelLine : {
                            show : false
                        }
                      },
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
