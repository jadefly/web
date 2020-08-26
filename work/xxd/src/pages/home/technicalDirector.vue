<template>
    <div class="content-div clear">
        <div class="left-con fl">
          <!-- 待处理统计 -->
          <statist :data="statistData"></statist>
           <!-- 项目数据 -->
          <project-div class="mt20" :data="projectData"></project-div>
          <div class="clear">
            <div class="half_box pr10">
              <el-card class="box-card project-data-panel pt20">
                <h1 class="font18 font_bold">等级保护项目统计情况</h1>
                <mixed-chart style="height:425px" :data="mixedData" v-if="chartShow" ></mixed-chart>
              </el-card>
            </div>
            <div class="half_box pr10">
             <city style="height:511px" :data='cityArr' v-if="chartShow"></city>
            </div>
          </div>
          <div class="clear mt20">
            <div class="half_box pr10">
              <el-card class="box-card project-data-panel pt20">
                <h1 class="font18 font_bold">项目行业分布情况</h1>
                <circle-chart style="height:200px" v-if="chartShow" :dataArr="industryList" :dataTitle="dataTitle"></circle-chart>
              </el-card>
            </div>
            <div class="half_box pr10">
              <el-card class="box-card project-data-panel pt20">
                <h1 class="font18 font_bold clear">
                  各年度项目状态分布
                  <el-select class="ri" @change="changeChart" v-model="selectStatus" placeholder="请选择">
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                  </h1>
                <y-bar style="height:183px" v-if="chartShow&&!drawChart" :data="statusData"></y-bar>
              </el-card>
            </div>
          </div>
          <personel from="home"></personel>
        </div>
        <div class="right-con fr">
          <div style="clear: both;"></div>
         <!-- 我的日程 -->
          <schedule-div></schedule-div>
          <!-- 项目流程 -->
            <process-div class="processDiv"></process-div>
        </div>
    </div>
</template>
<script>
import { queryProjectCTO } from '@/api/home'
import { mapState, mapGetters } from 'vuex'

import statist from '@/components/home/statist.vue'
import projectdiv from '@/components/home/project.vue'
import processdiv from '@/components/home/process.vue'
import schedulediv from '@/components/home/schedule.vue'
import circleChart from '@/components/charts/circleChart.vue'
import yBar from '@/components/charts/yBar.vue'
import Personel from '@/components/tasks/personel'
import mixedChart from '@/components/charts/mixedChart.vue'
import city from '@/components/home/city.vue'

/*
import processdiv from '@/components/home/process.vue'

import loopholeList from '@/components/home/loopholeList.vue'
import personalIndicatorsDiv from '@/components/home/personalIndicators.vue' */
export default {
  name: 'home',
  components: {
    'process-div': processdiv,
    'schedule-div': schedulediv,
    'project-div': projectdiv,
    'circle-chart': circleChart,
    'y-bar': yBar,
    'mixed-chart': mixedChart,
    personel: Personel,
    statist,
    city

    /*
    'project-div': projectdiv,
    'loophole-list': loopholeList,
    'personal-indicators-div': personalIndicatorsDiv, */

  },
  props: {},
  data () {
    return {
      userInfor: {
        targetnum: 'xxx',
        completednum: 'xxx'
      },
      projectData: [],
      scheduleData: {},
      statistData: {},
      industryList: [],
      mixedData: {
        pieData: [],
        lineData: [],
        yearLegend: []
      },
      cityArr: [],
      statusData: {
        categoryArr: [],
        dataArr: []
      },
      statusYearArr: [],
      allStatus: {},
      selectStatus: 'total',
      options: [
        { label: '全部', value: 'total' },
        { label: '进行中', value: 'doing' },
        { label: '未开始', value: 'ready' },
        { label: '停止中', value: 'stopped' },
        { label: '已完成', value: 'done' }

      ],
      drawChart: false,
      chartShow: false

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
        year: this.moment().format('YYYY')
      }
      const data = await queryProjectCTO(parmas)
      const result = data.result;
      // 统计组件数据
      this.statistData = {
        title: '合同数据统计',
        data: [{
          icon: 'blue',
          label: '合同总金额',
          num: result.bargainNumInfo.bargainPrice,
          name: 'config',
          params: {}
        },
        {
          icon: 'lightblue',
          label: '合同总数',
          num: result.bargainNumInfo.num,
          name: 'config',
          params: {}
        },
        {
          icon: 'orange',
          label: '未回款的合同',
          num: 0,
          name: 'config',
          params: { }
        }]
      }
      // 行业分布情况数据
      this.industryList = result.bargainTradeNums.map((item) => { return { name: item.itemText, value: item.num } })
      var total = 0;
      for (let i = 0; i < this.industryList.length; i++) {
        total += this.industryList[i].value
      }
      this.dataTitle = '合计\n' + total + '个';
      // 等保统计情况数据
      let twoTotal = 0, threeTotal = 0, fourTotal = 0;
      let twoArr = [], threeArr = [], fourArr = [], yearArr = [];
      let levelArr = result.submissionYearNums;
      levelArr.forEach((element) => {
        twoTotal += element.two;
        threeTotal += element.three;
        fourTotal += element.four;
        yearArr.push(element.startYear)
        twoArr.push(element.two)
        threeArr.push(element.three)
        fourArr.push(element.four)
      });
      this.mixedData.yearLegend = yearArr;
      this.mixedData.pieData = [{ value: twoTotal, name: '二级' },
        { value: threeTotal, name: '三级' },
        { value: fourTotal, name: '四级' }]
      this.mixedData.lineData = [
        {
          name: '二级系统',
          type: 'line',
          data: twoArr,
          smooth: true,
          itemStyle: {
            normal: {
              color: '#8dcf70'
            }
          }
        },
        {
          name: '三级系统',
          type: 'line',
          data: threeArr,
          smooth: true,
          itemStyle: {
            normal: {
              color: '#6e87f2'
            }
          }
        },
        {
          name: '四级系统',
          type: 'line',
          data: fourArr,
          smooth: true,
          itemStyle: {
            normal: {
              color: '#fab63b'
            }
          }
        }
      ]
      // 区域分布情况数据
      this.cityArr = result.bargainCityNums;
      // 各年度状态分布
      let statusArr = result.projectNumMap;
      let totalProject = 0;
      let  totalArr = [], doingArr = [], readyArr = [], stoppedArr = [], doneArr = [];
      statusArr.forEach((element) => {
        this.statusYearArr.push(element.year)
        totalArr.push(element.total)
        doingArr.push(element.doing)
        readyArr.push(element.ready)
        stoppedArr.push(element.stopped)
        doneArr.push(element.done)
        totalProject += element.total
      })
      this.allStatus = {
        total: totalArr,
        doing: doingArr,
        stopped: stoppedArr,
        ready: readyArr,
        done: doingArr
      }
      this.statusData = {
        categoryArr: this.statusYearArr,
        dataArr: this.allStatus.total
      }
      // 项目组件数据
      this.projectData = [{ name: '合同签订总数', value: result.bargainNumInfo.num },
        { name: '合同总金额', value: result.bargainNumInfo.bargainPrice },
        { name: '未回款的合同', value: 0 },
        { name: '未回款的金额', value: 0 },
        { name: '项目总数', value: totalProject }]
      this.chartShow = true
    },
    changeChart() {
      this.statusData = {
        categoryArr: this.statusYearArr,
        dataArr: this.allStatus[this.selectStatus]
      }
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
  .font_bold{font-weight: bold;}
  .pt20{padding-top: 20px;}
</style>
