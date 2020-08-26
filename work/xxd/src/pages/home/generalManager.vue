<template>
    <div class="content-div">
      <div class="clear">
        <div class="left-con fl">
          <!-- 合同数据 -->
          <contract :data="contractData"></contract>
          <!-- 项目数据 -->
          <project-div :data="projectData"></project-div>
        </div>
        <div class="right-con fr">
          <div style="clear: both;"></div>
         <!-- 我的日程 -->
          <schedule-div></schedule-div>
        </div>
      </div>
      <div>
        <el-tabs type="border-card" class="borderCard"  @tab-click="showChart">
          <el-tab-pane class="tabPane project-data-panel" label="销售管理">
            <sale-manage></sale-manage>
          </el-tab-pane>
          <el-tab-pane class="tabPane" label="业绩管理">
            <div class="flex_box" v-if="chartShow[0]">
              <div class="half_box">
                <h1 class="font18 font_bold">行业业绩分布</h1>
                <circle-chart style="height:240px;width:100%"  :dataArr="industryList" :dataTitle='dataTitle'></circle-chart>
              </div>
              <div class="half_box">
                <h1 class="font18 font_bold">业绩产品线分布</h1>
                <stack-bar style="height:220px;width:100%" ></stack-bar>

              </div>
              <div class="half_box">
                <h1 class="font18 font_bold">年度欠费情况</h1>
                <p class="font18 mt20"><span class="font5084ff">累计欠款 <span class="font_bold">356,354</span></span>
                    <span class="font666">/ 已开票未回款 <span class="font_bold">6,354</span></span>
                </p>
                <x-bar :data="arrearsData"></x-bar>
              </div>
              <div class="half_box">
                <h1 class="font18 font_bold">各年度业绩统计情况</h1>
                <line-chart :data="lineData"></line-chart>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane class="tabPane project-data-panel" label="项目管理">
            <template v-if="chartShow[1]">
              <div class="flex_box">
                <div class="half_box">
                  <h1 class="font18 font_bold">等级保护项目统计情况管理</h1>
                  <line-chart :data="lineData" ></line-chart>
                </div>
                <div class="half_box">
                  <h1 class="font18 font_bold">年度各项目状态分布</h1>
                  <y-bar :data="stateDate"></y-bar>
                </div>
              </div>
              <div>
                <h1 class="font18 font_bold">各年度项目实施能力</h1>
                <line-chart :data="lineData" ></line-chart>
              </div>
            </template>

          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
</template>
<script>
import { queryProjectGeneralManger } from '@/api/home'
import { mapState, mapGetters } from 'vuex'
import projectdiv from '@/components/home/project.vue'
import schedulediv from '@/components/home/schedule.vue'
import contract from '@/components/home/contract.vue'
import saleManage from '@/components/home/saleManage.vue'
import circleChart from '@/components/charts/circleChart.vue'
import stackBar from '@/components/charts/stackBar.vue'
import xBar from '@/components/charts/xBar'
import yBar from '@/components/charts/yBar'
import lineChart from '@/components/charts/lineChart'
export default {
  name: 'home',
  components: {
    'project-div': projectdiv,
    'schedule-div': schedulediv,
    'sale-manage': saleManage,
    'circle-chart': circleChart,
    'stack-bar': stackBar,
    'x-bar': xBar,
    'y-bar': yBar,
    'line-chart': lineChart,
    contract
  },
  props: {},
  data () {
    return {
      userInfor: {
        targetnum: 'xxx',
        completednum: 'xxx'
      },
      projectData: [],
      contractData: {
        'sumProductClassPrice': 0,
        'dbcp': 0,
        'aqrj': 0,
        'qtaq': 0,
        'wgaq': 0,
        'qtje': 0,
        'aqfw': 0,
        'bargainPrice': 0
      },
      industryList: [],
      dataTitle: '',
      arrearsData: {},
      lineData: [],
      stateDate: {},
      chartShow: [false, false]
    }
  },
  watch: {

  },
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    }),
    ...mapGetters(['getListParams', 'getRoleCode'])
  },
  mounted () {
    this.getIndexData()
  },
  methods: {
    async getIndexData() {
      let parmas = {
        userNum: this.userAndRoleInfo.id
      }
      const data = await queryProjectGeneralManger(parmas)
      const result = data.result;

      let contractArr = result.bargainYearClassPrice
      contractArr.forEach((element) => {
        for (let x in this.contractData) {
          this.contractData[x] += element[x]
        }
      });
      // this.contractData = result.bargainYearClassPrice

      this.projectData = [{ name: '项目总数', value: result.projectNumMap.total },
        { name: '进行中项目数', value: result.projectNumMap.doing },
        { name: '待启动项目数', value: result.projectNumMap.ready },
        { name: '停止中项目数', value: result.projectNumMap.stopped },
        { name: '已完成项目数', value: result.projectNumMap.done }];
      this.industryList = [{ 'name': '政府机关', 'value': 10 }, { 'name': '事业单位', 'value': 20 }, { 'name': '企业', 'value': 5 }, { 'name': '个人', 'value': 8 }, { 'name': '国防机构', 'value': 9 }, { 'name': '社会团体', 'value': 0 }, { 'name': '境外机构', 'value': 0 }, { 'name': '其他 ', 'value': 7 }];
      var total = 0;
      for (let i = 0; i < this.industryList.length; i++) {
        total += this.industryList[i].value
      }
      this.dataTitle = '合计\n' + total + '个';
      this.arrearsData = {
        categoryArr: ['2015年', '2016年', '2017年', '2018年', '2019年'],
        dataArr: [40000, 30000, 80898, 61876, 101898]
      }
      this.lineData = [
        { year: '2015', data: [210, 180, 399, 20] },
        { year: '2016', data: [420, 380, 202, 220] },
        { year: '2017', data: [690, 610, 705, 590] },
        { year: '2018', data: [610, 832, 599, 845] },
        { year: '2019', data: [810, 1150, 980, 1100] }
      ]
      this.stateDate = {
        categoryArr: ['2015年', '2016年', '2017年', '2018年', '2019年'],
        dataArr: [300, 450, 670, 203, 255]
      }
    },

    showChart(tab, event) {
      switch (tab.index) {
        case '1':
          this.chartShow = [true, false]
          break;
        case '2':
          this.chartShow = [false, true]
          break;
        default:
          this.chartShow = [false, false]
          break
      }
      console.log(this.chartShow)
    }
  }
}
</script>
<style>
  .schedule .el-input__inner{
    margin: 10px 0 10px 30px;
    width: 50%;
    height: 30px !important;
    border-radius: 20px !important;
  }
</style>
<style scoped>
  .content-div{
    width: 97%;
    margin: auto;
    margin-top: 25px;
  }
  .left-con{
    width: 70%;
  }
  .right-con{
    width: 28%;
  }
  .processDiv{
    margin-top: 20px;
  }
  .clearBox::after{
    content: "";
    display: block;
    width: 0;
    height: 0;
    clear: both;
  }
  .mt20{margin-top: 20px;}
  .half_box{width: 50%;float: left;box-sizing: border-box;}
  .pl10{padding-left: 10px;}
  .pr10{padding-right: 10px;}
  .font18{font-size: 18px;}
  .ta_left{text-align-last: left;}
  .font_bold{font-weight: bold;}
  .font5084ff{color:#5084ff}
  .font666{color:#666}
</style>
