<template>
    <div class="ta_left">
        <el-card class="box-card project-data-panel mt20">
            <div class="flex_box">
                <div class="small_box1 pr10 pt20">
                    <h1 class="font18 font_bold">行业业绩分布统计</h1>
                    <circle-chart class="mt20" style="height:240px"  :dataArr="industryList" :dataTitle="dataTitle"></circle-chart>
                </div>
                <div class="large_box pl10 pr10 pt20">
                    <div>
                        <h1 class="font18 font_bold">业绩top10</h1>
                        <y-bar class="mt20" :data="chartData4"></y-bar>
                    </div>
                </div>
                <div class="small_box2 pl10 pt20">
                  <h1 class="font18 font_bold">业绩产品分布</h1>
                  <stack-bar class="mt20" style="height:240px"  ></stack-bar>
              </div>
            </div>
        </el-card>
    </div>
</template>
<script>
import yBar from '@/components/charts/yBar'
import circleChart from '@/components/charts/circleChart'
import stackBar from '@/components/charts/stackBar'
export default {
  components: {
    'y-bar': yBar,
    'circle-chart': circleChart,
    'stack-bar': stackBar
  },
  data() {
    return {
      industryList: [{ 'name': '政府机关', 'value': 10 }, { 'name': '事业单位', 'value': 20 }, { 'name': '企业', 'value': 5 }, { 'name': '个人', 'value': 8 }, { 'name': '国防机构', 'value': 9 }, { 'name': '社会团体', 'value': 0 }, { 'name': '境外机构', 'value': 0 }, { 'name': '其他 ', 'value': 7 }],
      dataTitle: '',
      chartData4: {
        categoryArr: ['客户一', '客户二', '客户三', '客户四', '客户五', '客户六', '客户七', '客户八', '史波特', '胜创科技'],
        dataArr: [300, 450, 670, 203, 255, 188, 156, 255, 188, 156]
      }
    }
  },
  created() {
    var total = 0;
    for (let i = 0; i < this.industryList.length; i++) {
      total += this.industryList[i].value
    }
    this.dataTitle = '合计\n' + total + '个'
  }
}
</script>
<style lang="scss" scoped>
.flex_box{
    display: flex;
}
.half_box{width:50%}
.small_box2{width: 28%;}
.small_box1{width: 30%;}
.large_box{width:42%}
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
