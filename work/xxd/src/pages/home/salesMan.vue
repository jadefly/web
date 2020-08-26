<template>
    <div class="content-div">
        <div class="left-con fl">
          <!-- 项目数据 -->
          <project-div :data="projectData"></project-div>
          <!-- 个人指标 -->
          <personal-indicators-div v-if="personalShow" :dataArr='dataArr' :tableData="tableData" :totalNum="totalNum" :hasOrder="true"></personal-indicators-div>
          <!-- 待处理统计 -->
          <statist :data="statistData" class="mt20"></statist>
          <!-- 已提交交接单 -->
          <loophole-list class="mt20" :data="loopholeData"></loophole-list>
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
import { querySalesManagerData } from '@/api/home'
import { mapState, mapGetters } from 'vuex'
import projectdiv from '@/components/home/project.vue'
import schedulediv from '@/components/home/schedule.vue'
import processdiv from '@/components/home/process.vue'
import statist from '@/components/home/statist.vue'
import loopholeList from '@/components/home/loopholeList.vue'
import personalIndicatorsDiv from '@/components/home/personalIndicators.vue'
export default {
  name: 'home',
  components: {
    'project-div': projectdiv,
    'schedule-div': schedulediv,
    'process-div': processdiv,
    'loophole-list': loopholeList,
    'personal-indicators-div': personalIndicatorsDiv,
    statist
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
      loopholeData: [],
      totalNum: '0',
      dataArr: [],
      tableData: [],
      personalShow: false
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
      const data = await querySalesManagerData(parmas)
      const result = data.result;
      this.projectData = [{ name: '我的合同', value: result.firstLine.bargainTotal },
        { name: '项目总数', value: result.firstLine.total },
        { name: '进行中项目数', value: result.firstLine.ongoingNum },
        { name: '停止中项目数', value: result.firstLine.stopNum },
        { name: '已完成项目数', value: result.firstLine.completeNum }]
      this.statistData = {
        title: '待处理交接单',
        data: [{
          icon: 'orange',
          label: '审批中的交接单',
          num: result.projectSubmissionInfoNum2.inApplication,
          name: 'handoverIndex',
          params: { approvalState: '1' }
        },
        {
          icon: 'red',
          label: '被驳回的交接单',
          num: result.projectSubmissionInfoNum2.rejected,
          name: 'handoverIndex',
          params: { approvalState: '-1' }
        },
        {
          icon: 'blue',
          label: '未提交的交接单',
          num: result.projectSubmissionInfoNum2.toSubmit,
          name: 'handoverIndex',
          params: { approvalState: '0' }
        }]
      }
      this.loopholeData = result.projectSubmissionInfoList3
      this.tableData = [
        { quarterly: '第一季度', target: result.moneyBigMap.quarter1.target, complete: result.moneyBigMap.quarter1.finished, orderNum: result.moneyBigMap.quarter1.singular },
        { quarterly: '第二季度', target: result.moneyBigMap.quarter2.target, complete: result.moneyBigMap.quarter2.finished, orderNum: result.moneyBigMap.quarter2.singular },
        { quarterly: '第三季度', target: result.moneyBigMap.quarter3.target, complete: result.moneyBigMap.quarter3.finished, orderNum: result.moneyBigMap.quarter3.singular },
        { quarterly: '第四季度', target: result.moneyBigMap.quarter4.target, complete: result.moneyBigMap.quarter4.finished, orderNum: result.moneyBigMap.quarter4.singular }
      ]
      // 未完成
      let undone = result.yearTarget.unfinished === '-' ? 0 : result.yearTarget.unfinished;
      // 已完成
      let completed = result.yearTarget.finished === '-' ? 0 : result.yearTarget.finished;
      this.totalNum = result.yearTarget.annualTarget === '-' ? '0' : result.yearTarget.annualTarget;
      this.dataArr = [{ value: completed, name: '已完成' }, { name: '未完成', value: undone }];
      this.personalShow = true
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
</style>
