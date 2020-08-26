<template>
    <div class="content-div">
        <div class="left-con fl">
          <!-- 项目数据 -->
          <project-div :data="projectData"></project-div>
          <!-- 待指派和已指派交接单
          <assign-div :data="assignData"></assign-div> -->
          <!-- 指派工单 -->
          <work-order :data="workOrderData"></work-order >
          <!-- 人员工作安排 -->
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
import { queryProjectSecurityServiceHeadMan } from '@/api/home'
import { mapState, mapGetters } from 'vuex'
import projectdiv from '@/components/home/project.vue'
import schedulediv from '@/components/home/schedule.vue'
import processdiv from '@/components/home/process.vue'
import workOrder from '@/components/home/workOrder.vue'
import Personel from '@/components/tasks/personel'
export default {
  name: 'home',
  components: {
    'project-div': projectdiv,
    'schedule-div': schedulediv,
    'process-div': processdiv,
    'personel': Personel,
    'work-order': workOrder
  },
  props: {},
  data () {
    return {
      userInfor: {
        targetnum: 'xxx',
        completednum: 'xxx'
      },
      contractData: {
      },
      projectData: [],
      scheduleData: {},
      processData: {},
      workOrderData: []
    }
  },
  watch: {

  },
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    }),
    ...mapGetters(['getListParams', 'getRoleCode'])
  },
  mounted () {
    this.selectRoleIndex()
    this.getIndexData()
  },
  methods: {
    async getIndexData() {
      let parmas = {
        year: this.moment().format('YYYY'),
        userId: this.userAndRoleInfo.id
      }
      const data = await queryProjectSecurityServiceHeadMan(parmas)
      let projectData = data.result.projectNumMap
      this.projectData = [ { name: '项目总数', value: projectData.total },
        { name: '进行中项目数', value: projectData.doing },
        { name: '待启动项目数', value: projectData.ready },
        { name: '停止中项目数', value: projectData.stopped },
        { name: '已完成项目数', value: projectData.done }]
      this.workOrderData = data.result.needPaiSubmission || []
    },
    selectRoleIndex() {
      let roles = this.$store.getters.getRole
      if (roles == '总经理') {
        console.log(33)
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
</style>
