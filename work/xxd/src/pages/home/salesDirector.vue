<template>
    <div class="content-div">
      <div class="clear">
        <div class="left-con fl">
          <!-- 项目数据 -->
          <project-div :data="projectData"></project-div>
          <!-- 待处理统计 -->
          <statist :data="statistData"></statist>
          <!-- 销售管理 -->
          <el-card class="box-card project-data-panel mt20 no-pt">
            <div slot="header" class="clearfix">
              <span class="title">销售管理</span>
            </div>
            <div class="text item clear">
              <sale-manage></sale-manage>
            </div>
            </el-card>
          <!-- 图表 -->
          <chart-area class="mt20"></chart-area>
        </div>
        <div class="right-con fr">
          <div style="clear: both;"></div>
         <!-- 我的日程 -->
          <schedule-div></schedule-div>
          <!-- 项目流程 -->
            <process-div class="processDiv"></process-div>
        </div>
      </div>
      <chart-area-bottom class="mt20"></chart-area-bottom>
    </div>
</template>
<script>
import { querySalesDirectorData } from '@/api/home'
import { mapState, mapGetters } from 'vuex'
import projectdiv from '@/components/home/project.vue'
import schedulediv from '@/components/home/schedule.vue'
import processdiv from '@/components/home/process.vue'
import statist from '@/components/home/statist.vue'
import saleManage from '@/components/home/saleManage.vue'
import chartArea from '@/components/home/chartArea.vue'
import chartAreaBottom from '@/components/home/chartAreaBottom.vue'
export default {
  name: 'home',
  components: {
    'project-div': projectdiv,
    'schedule-div': schedulediv,
    'process-div': processdiv,
    statist,
    'sale-manage': saleManage,
    'chart-area': chartArea,
    'chart-area-bottom': chartAreaBottom
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
      statistData: {}
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
      const data = await querySalesDirectorData(parmas)
      const result = data.result;
      this.projectData = [{ name: '合同签订数', value: result.bargainNumInfo.num },
        { name: '合同总金额', value: result.bargainNumInfo.bargainPrice },
        { name: '未回款的合同', value: 0 },
        { name: '未回款的金额', value: 0 },
        { name: '项目总数', value: result.projectTotalNum.num }]
      // this.projectData = data.result.projectInfoNum1
      this.statistData = {
        title: '待处理',
        data: [{
          icon: 'orange',
          label: '待审批交接单',
          num: result.pSubmissionNum,
          name: 'handoverApproval',
          params: {}
        },
        {
          icon: 'red',
          label: '出问题项目',
          num: result.projectNum,
          name: '',
          params: {}
        },
        {
          icon: 'blue',
          label: '含附加服务的项目',
          num: result.projectAddtionalNum,
          name: '',
          params: {}
        }]
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
<style scoped lang="scss">
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
