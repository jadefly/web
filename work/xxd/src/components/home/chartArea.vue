<template>
    <div class="ta_left">
        <el-card class="box-card project-data-panel">
            <div class="flex_box">
                <div class="half_box pr10 pt20">
                    <h1 class="font18 font_bold">业绩管理</h1>
                    <p class="font18 mt20"><span class="font5084ff">累计欠款 <span class="font_bold">356,354</span></span>
                    <span class="font666">/ 已开票未回款 <span class="font_bold">6,354</span></span>
                    </p>
                    <x-bar :data="chartData1"></x-bar>
                </div>
                <div class="half_box pl10 pt20">
                    <h1 class="font18 font_bold">各年度业绩统计情况</h1>
                    <line-chart :data="lineData" class="mt20"></line-chart>
                </div>
            </div>
        </el-card>
    </div>
</template>
<script>
import xBar from '@/components/charts/xBar'
import lineChart from '@/components/charts/lineChart'
export default {
  components: {
    'x-bar': xBar,
    'line-chart': lineChart
  },
  data() {
    return {
      chartData1: {
        categoryArr: ['2015年', '2016年', '2017年', '2018年', '2019年'],
        dataArr: [40000, 30000, 80898, 61876, 101898]
      },
      dataTitle: '',
      lineData: [
        { year: '2015', data: [210, 180, 399, 20] },
        { year: '2016', data: [420, 380, 202, 220] },
        { year: '2017', data: [690, 610, 705, 590] },
        { year: '2018', data: [610, 832, 599, 845] },
        { year: '2019', data: [810, 1150, 980, 1100] }
      ]

    }
  }
}
</script>
<style lang="scss" scoped>
.flex_box{
    display: flex;
}
.half_box{width:50%}
.small_box{width: 34%;}
.large_box{width:66%}
.pr10{padding-right: 10px;}
.pl10{padding-left: 10px;}
.font18{font-size: 18px;}
.ta_left{text-align-last: left;}
.font_bold{font-weight: bold;}
.font5084ff{color:#5084ff}
.font666{color:#666}
.mt20{margin-top: 20px;}
.pt20{padding-top: 20px;}
</style>
