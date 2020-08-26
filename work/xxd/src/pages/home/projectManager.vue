<template>
    <div class="content-div">
        <div class="left-con fl">
          <!-- 项目数据 -->
          <project-div :data="projectData"></project-div>
          <!-- 个人指标   -->
          <personal-indicators-div :dataArr='dataArr' :tableData="tableData" :totalNum="totalNum"></personal-indicators-div>
          <!-- 本周工作 -->
          <el-card class="box-card workThisWeek">
            <div slot="header" class="clearfix">
                <span class="title">本周工作</span>
            </div>
            <div class="text item content90">
                    <el-table
                      :data="workThisWeekData"
                      style="width: 100%">
                      <el-table-column
                          label="序号"
                          align="center"
                          width="50">
                          <template slot-scope="scope">
                            {{scope.$index+1}}
                          </template>
                      </el-table-column>
                      <el-table-column
                          prop="workDate"
                          label="工作时间"
                          align="center"
                          width="180">
                          <template slot-scope="scope">
                            <span>{{scope.row.workDate}}</span>&nbsp;
                            <span>{{moment(scope.row.workDate).format('dddd')}}</span>
                          </template>
                      </el-table-column>
                      <el-table-column
                          prop="workForenoonContext"
                          :show-overflow-tooltip="true"
                          align="center"
                          label="上午工作内容">
                          <template slot-scope="scope">
                            <span>{{scope.row.projectName}}----{{scope.row.workForenoon}}</span>
                          </template>
                      </el-table-column>
                      <el-table-column
                          prop="workAfternoonContext"
                          align="center"
                          :show-overflow-tooltip="true"
                          label="下午工作内容">
                          <template slot-scope="scope">
                            <span>{{scope.row.projectName}}----{{scope.row.workAfternoon}}</span>
                          </template>
                      </el-table-column>
                  </el-table>
            </div>
          </el-card>
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
import { queryPMIndex } from '@/api/home'
import { mapState, mapGetters } from 'vuex'
import projectdiv from '@/components/home/project.vue'
import schedulediv from '@/components/home/schedule.vue'
import processdiv from '@/components/home/process.vue'
import personalIndicatorsDiv from '@/components/home/personalIndicators.vue'
export default {
  name: 'home',
  components: {
    'project-div': projectdiv,
    'schedule-div': schedulediv,
    'process-div': processdiv,
    'personal-indicators-div': personalIndicatorsDiv
  },
  props: {},
  data () {
    return {
      userInfor: {
        targetnum: '0',
        completednum: '0'
      },
      contractData: {
      },
      projectData: [],
      personalIndicatorsDiv: {},
      tableData: [],
      dataArr: [{ value: 0, name: '已完成' }, { name: '未完成', value: 0 }],
      totalNum: '0',
      workThisWeekData: []
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
  created () {
  },
  mounted () {
    this.getIndexData()
    this.selectRoleIndex()
  },
  methods: {
    getIndexData() {
      let parmas = {
        year: this.moment().format('YYYY')
        // ,userId: this.userAndRoleInfo.id
      }
      queryPMIndex(parmas).then((data) => {
        this.personalIndicatorsData = data
        console.log(data)
        this.tableData = [
          { quarterly: '第一季度', target: data.result.esintUserTarget.firstQuarterTarget, complete: data.result.esintUserTarget.firstQuarterTargetComplete },
          { quarterly: '第二季度', target: data.result.esintUserTarget.secondQuarterTarget, complete: data.result.esintUserTarget.secondQuarterTargetComplete },
          { quarterly: '第三季度', target: data.result.esintUserTarget.thirdQuarterTarget, complete: data.result.esintUserTarget.thirdQuarterTargetComplete },
          { quarterly: '第四季度', target: data.result.esintUserTarget.fourthQuarterTarget, complete: data.result.esintUserTarget.fourthQuarterTargetComplete }
        ]
        // 未完成
        let undone = data.result.esintUserTarget.yearTarget - data.result.esintUserTarget.yearTargetComplete
        // 已完成
        let completed = data.result.esintUserTarget.yearTargetComplete || 0
        // 总额
        this.totalNum = data.result.esintUserTarget.yearTarget || '0'
        this.dataArr = [{ value: completed, name: '已完成' }, { name: '未完成', value: undone }]
        console.log(this.dataArr, 'dataArr')
        let projectData = data.result.projectNumMap
        this.projectData = [ { name: '项目总数', value: projectData.total },
          { name: '进行中项目数', value: projectData.doing },
          { name: '待启动项目数', value: projectData.ready },
          { name: '停止中项目数', value: projectData.stopped },
          { name: '已完成项目数', value: projectData.done }]
        this.assignData = data.result
        this.workThisWeekData = data.result.esintProjectWorkerScheduling
      })
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
<style lang="scss">
  .schedule .el-input__inner{
    margin: 10px 0 10px 30px;
    width: 50%;
    height: 30px !important;
    border-radius: 20px !important;
  }
  .content-div{
    .el-card__body {
       padding-top: 0 !important;
    }
  }
</style>
<style lang="scss" scoped>
  .content-div{
    width: 97%;
    margin: auto;
    margin-top: 25px;
    .workThisWeek{
      margin: 20px 0 40px 0;
    }
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
