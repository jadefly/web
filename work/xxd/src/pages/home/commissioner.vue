<template>
    <div class="content-div">
        <div class="left-con fl">
          <!-- 项目数据 -->
          <project-div :data="projectData"></project-div>
          <div class="clearBox">
            <div class="half_box pr10">
              <system-chart v-if="finishedFlag" :data="dbcpSysNumArr"></system-chart>
            </div>
            <div class="half_box pl10">
              <other-service :data="otherQuarter"></other-service>
            </div>
          </div>
          <project-list class="mt20" :type="'esintProject'" :data="esintProjectSysData"></project-list>
          <project-assistant class="mt20" :data="projectAssistantData"></project-assistant>
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
import { queryProjectAssistantIndex } from '@/api/home'
import { mapState, mapGetters } from 'vuex'
import projectdiv from '@/components/home/project.vue'
import schedulediv from '@/components/home/schedule.vue'
import processdiv from '@/components/home/process.vue'
import projectList from '@/components/home/projectList.vue'
import projectAssistant from '@/components/home/projectAssistant.vue'
import otherService from '@/components/home/otherService.vue'
import systemChart from '@/components/home/systemChart.vue'
export default {
  name: 'home',
  components: {
    'project-div': projectdiv,
    'schedule-div': schedulediv,
    'process-div': processdiv,
    'project-list': projectList,
    'other-service': otherService,
    'system-chart': systemChart,
    'project-assistant': projectAssistant
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
      processData: {},
      projectAssistantData: [],
      esintProjectSysData: [],
      otherQuarter: [
        { 'quarter': '一', 'self': 0, 'other': 0 },
        { 'quarter': '二', 'self': 0, 'other': 0 },
        { 'quarter': '三', 'self': 0, 'other': 0 },
        { 'quarter': '四', 'self': 0, 'other': 0 }
      ],
      dbcpSysNumArr: [],
      finishedFlag: false

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
        year: this.moment().format('YYYY'),
        userId: this.userAndRoleInfo.id
      }
      const data = await queryProjectAssistantIndex(parmas)
      let projectData = data.result.projectNumMap
      this.projectData = [{ name: '项目总数', value: projectData.total },
        { name: '进行中项目数', value: projectData.doing },
        { name: '待启动项目数', value: projectData.ready },
        { name: '停止中项目数', value: projectData.stopped },
        { name: '已完成项目数', value: projectData.done }]
      this.projectAssistantData = data.result.projectAssistant
      let otherQuarterArr = data.result.otherQuarterNum
      for (let i = 0; i < otherQuarterArr.length; i++) {
        if (otherQuarterArr[i].typeName === '安全服务') {
          this.otherQuarter[otherQuarterArr[i].quarter - 1].self = otherQuarterArr[i].num
        } else if (otherQuarterArr[i].typeName === '第三方服务') {
          this.otherQuarter[otherQuarterArr[i].quarter - 1].other = otherQuarterArr[i].num
        }
      }
      this.dbcpSysNumArr = data.result.dbcpSysNum
      this.finishedFlag = true
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
