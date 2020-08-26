<template>
  <div class="content-pages">
    <div class="content-breadcrumb">
      <myBreadcrumb :breadcrumbData="breadcrumbData"></myBreadcrumb>
    </div>
    <!-- 项目经理无金额计算 安排入场时间  进度调整 日程安排无金额计算-->
    <section class="amountBox" v-if="getRoleCode!=='project_manager'">
      <ul>
        <li>总金额
          <p class="num">{{ amountDataTotal }}</p>
        </li>
        <li v-for="(item, i) in amountData" :key="item.projectTypeName + i">
          <p>{{ item.projectTypeName }}</p>
          <p class="num">{{ item.sumImplementationAmount }}</p>
        </li>
      </ul>
    </section>
    <div class="content-container">
      <el-form :inline="true"
               :model="userForms"
               class="demo-form-inline"
               ref="userForms"
               label-width="100px">
          <div class="content-container-top">
            <el-row>
              <el-col :md="8" :lg="8" :xl="8">
                <h3 class="fl">项目管理</h3>
                <template>
                  <el-button type="primary"
                        v-if="$route.name === 'AssignPersonnel'"
                        @click="distribution"
                        :disabled="multipleSelection.length != 1
                                  || !multipleSelection[0].projectEstimateStartTime" size="mini" round>分配组员</el-button>

                  <el-button type="primary"
                        v-if="type == '10' && getRoleCode !== 'project_manager' && getRoleCode !== 'commissioner' && getRoleCode!=='delivery_manager'"
                        :disabled="multipleSelection.length != 1"
                        @click="ProgressView" size="mini" round>进度查看</el-button>
                  <!--projectManager 1：项目经理 0：普通成员 -->
                  <el-button type="primary"
                        v-if="this.type=='1'"
                        @click="setEnterTime" size="mini"
                        :disabled="multipleSelection.length != 1
                                  || multipleSelection[0].projectManager==='0'" round>安排入场时间</el-button>
                        <!-- 分配组员(memberName)之后才可执行日程安排, 是自己的项目才可以操作projectManager -->
                  <el-button type="primary"
                        v-if="this.type=='0'"
                        @click="toSchedulePage" size="mini"
                        :disabled="(multipleSelection.length != 1
                                  || !multipleSelection[0].memberName
                                  || multipleSelection[0].projectManager==='0')" round>日程安排</el-button>
                  <el-button type="primary"
                        v-if="this.type=='2' && (getRoleCode==='project_manager' || getRoleCode==='service_man')"
                        @click="toProgressPage"
                        :disabled="multipleSelection.length != 1
                                || multipleSelection[0].projectManager==='0'
                                || !multipleSelection[0].projectEstimateStartTime"
                        size="mini" round>进度调整</el-button>
                  <el-button type="primary"
                        v-if="$route.name === 'Review' && getRoleCode==='commissioner'"
                        @click="toProgressConfirmPage"
                        :disabled="multipleSelection.length != 1" size="mini" round>规范性复核</el-button>
                  <!-- <el-button v-else @click="lookAt(scope.row.id)" type="button" size="mini">查看</el-button> -->
                </template>
              </el-col>
              <el-col :md="16" :lg="16" :xl="16" class="top-form-input">
                <el-form-item prop="condition" v-show="!searchShow">
                  <el-input size="mini"
                            placeholder="请输入关键字"
                            v-model="userForms.condition">
                    <i slot="suffix"
                      class="el-input__icon el-icon-search"
                      @click="systemSearch"></i>
                  </el-input>
                </el-form-item>
                <span class="iconArrow"
                      :class="searchShow?'el-icon-arrow-up':'el-icon-arrow-down'"
                      @click="openAdvancedSearch">{{ searchShow?'收起':'展开' }}高级搜索</span>
              </el-col>
            </el-row>
            <!-- 高级搜索 -->
            <searchBox :searchShow="searchShow"
                      :userForms="userForms"
                      @resetForm="resetForm"
                      @systemSearch="systemSearch"></searchBox>
          </div>
      </el-form>

      <template>
        <!-- 安服经理-查看列表 -->
        <TableDeliveryManager v-if="getRoleCode === 'delivery_manager'"
                  @onMultipleSelection="onMultipleSelection"
                  :tableData="tableData"></TableDeliveryManager>
        <!-- 安排入场时间，项目经理/组员,安服组长 -->
        <TableEnterTime v-else-if="$route.name === 'enterTime'"
                  @onMultipleSelection="onMultipleSelection"
                  :tableData="tableData"></TableEnterTime>
        
        <!-- 分配组员，安服组长 -->
        <TableAssignPersonnel v-else-if="$route.name === 'AssignPersonnel'"
                  @onMultipleSelection="onMultipleSelection"
                  :tableData="tableData"></TableAssignPersonnel>

        <!-- 规范性复核，项目助理 -->
        <TableReview v-else-if="$route.name === 'Review'"
                  @onMultipleSelection="onMultipleSelection"
                  :tableData="tableData"></TableReview>

        <el-table v-else
                  stripe
                  ref="multipleTable"
                  :data="tableData"
                  style="width:100%"
                  @select-all="onSelectAll"
                  @selection-change="selectItem"
                  tooltip-effect="dark">
          <el-table-column
            type="selection"
            width="30">
          </el-table-column>
          <el-table-column prop="numcode" align="center"
                            label="序号"
                            fit="false"
                            min-width="30">
            <template slot-scope="scope">
              {{scope.$index+1}}
            </template>
          </el-table-column>
          <el-table-column prop="bargainNo"
                            label="合同编号"
                            fit="false"
                            min-width="">
            <template slot-scope="scope">
              {{scope.row.bargainNo || '-'}}
            </template>
          </el-table-column>
          <el-table-column prop="bargainName"
                            label="合同名称"
                            fit="false"
                            min-width="">
            <template slot-scope="scope">
              {{scope.row.bargainName || '-'}}
            </template>
          </el-table-column>
          <el-table-column prop="projectName"
                            label="项目名称"
                            fit="false"
                            min-width="">
          </el-table-column>
          <el-table-column prop="implementationAmount"
                            label="实施金额"
                            min-width=""
                            fit="false">
          </el-table-column>
          <el-table-column prop="projectTypeName"
                            label="项目主类型"
                            fit="false"
                            min-width="">
          </el-table-column>
          <el-table-column prop="subType"
                            label="项目子类型"
                            fit="false"
                            min-width="">
          </el-table-column>
          <!-- <el-table-column prop="stagnateStateExplainSubclass"
                            label="异常状态"
                            fit="false"
                            min-width="">
          </el-table-column> -->
          <el-table-column prop="projectState"
                            label="项目状态"
                            fit="false"
                            min-width="">
          </el-table-column>
          <el-table-column prop="progress"
                            label="项目进度"
                            fit="false"
                            min-width="">
            <template slot-scope="scope">
                {{ scope.row.progress + '%'}}
              </template>
          </el-table-column>
          <el-table-column prop="scheduleType"
                          label="需要复核"
                          fit="false"
                          min-width="">
            <template slot-scope="scope">
              {{scope.row.scheduleType==='1'?"是":"否"}}
            </template>
          </el-table-column>
          <el-table-column prop="projectStartTime"
                            fit="false"
                            label="开始时间"
                            min-width="">
          </el-table-column>
          <el-table-column prop="projectCompleteTime"
                            fit="false"
                            label="结束时间"
                            min-width="">
          </el-table-column>
          <el-table-column prop="projectEstimateStartTime"
                            fit="false"
                            label="入场时间"
                            min-width="">
              <template slot-scope="scope">
                {{scope.row.projectEstimateStartTime || '-'}}
              </template>
          </el-table-column>
          <!-- 进度管理不显示 安服经理和安服组长-->
          <el-table-column prop="assignDeliveryManagerName"
                            fit="false"
                            label="安服经理"
                            v-if="$route.name!=='Progress'"
                            min-width="">
              <template slot-scope="scope">
                {{scope.row.assignDeliveryManagerName || '-'}}
              </template>
          </el-table-column>
          <el-table-column prop="assignDeliveryManagerName"
                            fit="false"
                            label="安服组长"
                            v-if="$route.name!=='Progress'"
                            min-width="">
              <template slot-scope="scope">
                {{scope.row.serviceManName || '-'}}
              </template>
          </el-table-column>
          <el-table-column prop="memberName"
                            fit="false"
                            label="项目成员"
                            min-width="">
              <template slot-scope="scope">
                {{scope.row.memberName || '-'}}
              </template>
          </el-table-column>
          <el-table-column prop="projectManagerName"
                            label="项目经理"
                            fit="false"
                            min-width=""
                            key='9'>
              <template slot-scope="scope">
                {{scope.row.projectManagerName || '-'}}
              </template>
          </el-table-column>
        </el-table>
        <div class="footer">
          <span class="total">
            共{{userTotal}}条，{{userForms.pageSize}}条/页
          </span>
          <el-pagination @current-change="userHandleCurrentChange"
                          :small="true"
                          :current-page.sync="userForms.pageNo"
                          :page-size="userForms.pageSize"
                          layout="prev, pager, next, jumper"
                          :total="userTotal">
          </el-pagination>
        </div>
      </template>
    </div>
    <el-dialog title="分配组员"
        :visible.sync="distributionDialogVisible"
        :before-close="distributionHandleClose">
        <div class="distributionTransfer">
          <el-transfer
          style="text-align: left; display: inline-block" 
          v-model="distributionValue" 
          :data="distributionData"
          :titles="['待分配组员', '已选组员']"></el-transfer>
        </div>
        <span slot="footer"
            class="dialog-footer">
            <el-button type="primary" @click="distributionSubmit">分配</el-button>
            <el-button
                @click="distributionHandleClose">取消</el-button>
        </span>
    </el-dialog>

    <!-- 确认入场时间 -->
    <el-dialog title="确认入场时间"
        :visible.sync="confirmTimeShow">
        <div class="popCon txtC">
          入场时间：
          <el-date-picker class="txtW"
            v-model="enterTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </div>
        <span slot="footer"
            class="dialog-footer">
            <el-button type="primary" @click="confirmTimeFn">分配</el-button>
            <el-button @click="confirmTimeShow = false">取消</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import { getTopList, queryStaffData, distributionStaff } from '@/api/tasks'
import { mapState, mapGetters } from 'vuex'
import { post } from '@/plugins/http'
import searchBox from '@/components/tasks/search'
import TableDeliveryManager from '@/components/tasks/table_delivery_manager'
import TableEnterTime from '@/components/tasks/table_enterTime'
import TableAssignPersonnel from '@/components/tasks/table_assignPersonnel'
import TableReview from '@/components/tasks/table_review'
export default {
  name: 'tasks',
  props: {},
  components: {
    searchBox,
    TableDeliveryManager,
    TableEnterTime,
    TableAssignPersonnel,
    TableReview
  },
  data () {
    return {
      pathName: '',
      breadcrumbData: [
        { path: '/', name: 'home', title: '首页' },
        { path: '/tasks/taskList', name: 'taskList', title: '项目管理' },
        { title: '' }
      ],
      type: '',
      searchShow: false,
      userTotal: 0,
      userForms: {
        projectName: '', // 项目名称
        projectState: '', // 项目状态（项目状态(0：未实施 300101：启动过程 300102：规划过程 300103：执行过程 300104：监管过程 300105：收尾过， 1 完成）
        contractNo: '', // 合同编号
        contractName: '', // 合同名称
        estimateStartTime: '', // 入场时间段（开始）
        estimateEndTime: '', // 入场时间段（结束）
        projectManagerName: '', // 项目经理
        projectType: '', // 项目类型
        explainSubclass: '', // 异常状态异常状态子项（正常；重新实施；增加实施；变更实施）
        startMoney: '', // 起始金额
        endMoney: '', // 结束金额
        isEstimateTime: '', // 是否分配入场时间 1有 0没有
        pageNo: 1, // 分页页数
        pageSize: 10, // 每页条数
        isAdmissionTime: '', // 项目经理-入场时间传参为1
        serviceManIsProjectManager: '', // 1 为项目经理 0 为非项目经理
        condition: '', // 关键字搜索
        isApproval: '' // 是否需要审批
      },
      amountData: [], // 金额数据
      tableData: [],
      tableList: [],
      checkList: [],
      uncheckList: [],
      distributionDialogVisible: false, // 分配组员
      projectId: '', // 当前项目ID
      StaffData: [], // 所有员工信息
      distributionValue: [], // 已选组员列表
      distributionData: [], // 分配组员列表

      state: '',

      oldArr: [], // 选中的初始数据
      newArr: [], // 选中的new数据
      confirmTimeShow: false, // 入场时间弹框显示隐藏
      enterTime: '',
      multipleSelection: [], // 选中行数据
      rowIndex: 0 // 选中行索引
    }
  },
  computed: {
    ...mapState({
    }),
    ...mapGetters(['getRoleCode']),
    amountDataTotal() {
      return this.amountData.reduce((t, cur) => t + cur.sumImplementationAmount, 0)
    }
  },
  watch: {
    '$route': {
      handler(to, from) {
        // this.type = to.query.type
        this.nameTypeUpdate()
        console.log('watch-$route', this.type, to)
        this.getUserTableData()
      },
      immediate: true,
      deep: true // 深度监听
    }
  },
  mounted () {
    if (this.$route.params.isApproval === '1') {
      this.userForms.isApproval = '1';
    }
  },
  methods: {
    nameTypeUpdate() { // report
      if (this.$route.name === 'Schedule') {
        this.pathName = '日程安排'
        this.type = '0';
      } else if (this.$route.name === 'enterTime') {
        this.pathName = '安排入场时间'
        this.type = '1';
      } else if (this.$route.name === 'Progress') {
        this.pathName = '项目进度管理'
        this.type = '2';
      } else if (this.$route.name === 'AssignPersonnel') {
        this.pathName = '分配组员'
        this.type = '3';
      } else if (this.$route.name === 'Review') {
        this.pathName = '规范性复核'
        this.type = '4';
      } else if (this.$route.name === 'report') {
        this.pathName = '测评项目报备'
        this.type = '5';
      } else if (this.$route.name === 'taskList' || this.$route.name === 'taskIndex') {
        this.pathName = '项目管理列表'
        this.type = '10';
      }
      if (this.$route.name === 'taskIndex') { // 只有一级
        this.breadcrumbData.splice(1, 1)
      } else {
        this.breadcrumbData[1].path = this.$route.path
      }
      this.breadcrumbData[this.breadcrumbData.length - 1].title = this.pathName
    },
    // 详情
    projectDetail () {
      this.$router.push({ name: 'projectDetail' })
    },
    // 填充表格数据
    async getUserTableData () {
      if (this.type === '1') {
        this.userForms.isAdmissionTime = '1';
      } else {
        this.userForms.isAdmissionTime = '';
      }
      if (this.getRoleCode === 'service_man' && this.type === '10') {
        this.userForms.serviceManIsProjectManager = '0';
      } else {
        this.userForms.serviceManIsProjectManager = '1';
      }
      let topList = await getTopList(this.userForms)
      console.log('list:', topList)
      if (topList.success) {
        this.tableData = topList.result.page.records
        this.userTotal = topList.result.page.total
        this.amountData = topList.result.sumImplementationAmount || []
      }
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.userForms.estimateStartTime = ''
      this.userForms.estimateEndTime = ''
    },
    // 搜索
    systemSearch () {
      console.log('搜索', this.userForms)
      // 关键字筛选时页码重置，防止报错
      this.userForms.pageNum = 1
      this.getUserTableData()
    },
    userHandleCurrentChange (val) {
      this.getUserTableData()
    },
    filterTag (value, row) {
      return row.type === value
    },
    renderHeader (h, { column }) {
      return h('div', [
        h('span', column.label),
        h('i', { class: 'icon-table_shaixuan', style: 'margin-left:5px;' })
      ])
    },
    // this.$forceUpdate() // 强制刷新
    // 进度条百分比颜色
    customColorMethod (percentage) {
      if (percentage <= 45) {
        return '#409eff'
      } else {
        return '#e6a23c'
      }
    },
    selectItem(rows) {
      console.log(rows)
      let tmp = []
      if (rows.length > 1) {
        const newRows = rows.filter((it, index) => {
          if (index === rows.length - 1) {
            this.$refs.multipleTable.toggleRowSelection(it, true);
            return true;
          } else {
            this.$refs.multipleTable.toggleRowSelection(it, false);
            return false
          }
        });
        tmp = newRows;
      } else {
        tmp = rows;
      }
      this.onMultipleSelection(tmp)
    },
    onSelectAll() {
      this.$refs.multipleTable.clearSelection();
    },
    onMultipleSelection(val) {
      console.log('onMultipleSelection', val)
      this.multipleSelection = val
      this.tableData.forEach((item, index) => {
        this.multipleSelection.forEach((value) => {
          if (item.id === value.id) {
            this.rowIndex = index
          }
        })
      })
    },
    // 分配组员
    async distribution() {
      this.distributionDialogVisible = true
      this.projectId = this.multipleSelection[0].id
      this.distributionValue = [] // 已选组员列表
      this.distributionData = [] // 组员列表
      const data = await queryStaffData({ projectId: this.multipleSelection[0].id })
      this.StaffData = data.data.result.chargehand
      this.StaffData.forEach((element, index) => {
        this.distributionData.push({
          key: element.id,
          label: element.realname
        })
        if (element.key == '1') {
          this.distributionValue.push(element.id)
        }
      });
      this.oldArr = this.StaffData.filter((el) => el.key === '1')
      console.log(111, data, this.StaffData)
    },
    // 安排入场时间
    setEnterTime(id, index) {
      console.log('安排入场时间', id, index)
      this.confirmTimeShow = true
    },
    confirmTimeFn() {
      post('/esintProject/editEstimate', {
        projectId: this.multipleSelection[0].id, projectEstimateStartTime: this.enterTime
      }).then((res) => {
        this.tableData[this.rowIndex].projectEstimateStartTime = this.enterTime
        this.confirmTimeShow = false // 关闭弹框
      })
    },
    // 日程安排
    toSchedulePage() {
      console.log('去日程安排', this.multipleSelection[0])
      this.$router.push({ path: '/personnelSchedule', query: { id: this.multipleSelection[0].id } })
    },
    // 进度调整
    toProgressPage() {
      console.log('进度调整', this.multipleSelection[0])
      this.$router.push({ path: '/ProgressAdjustment', query: { id: this.multipleSelection[0].id } })
    },
    // 进度调整确认
    toProgressConfirmPage() {
      this.$router.push({ path: '/ProgressConfirm', query: { id: this.multipleSelection[0].id, fromName: this.$route.name } })
    },
    //  进度查看
    ProgressView() {
      this.$router.push({ path: '/ProgressConfirm', query: { id: this.multipleSelection[0].id, fromName: this.$route.name } })
    },
    // 查看
    lookAt(id) {
      console.log('查看', id)
    },
    distributionHandleClose() {
      this.distributionDialogVisible = false
      this.projectId = ''
      this.StaffData = []
      this.oldArr = []
      this.newArr = []
      this.distributionValue = []// 已选组员列表
      this.distributionData = [] // 组员列表
    },
    async distributionSubmit() {
      this.distributionDialogVisible = false
      let projectMemberIdList = []
      let projectMemberNameList = []
      let delProjectMemberIdList = []
      let delProjectMemberNameList = []
      let newIds = this.distributionValue.filter((item) => {
        let tmp = this.oldArr.find((el) => el.id === item)
        console.log(222, tmp)
        if (!tmp) return true
        return false
      })
      let delItem = this.oldArr.filter((item) => {
        let tmp = this.distributionValue.find((el) => item.id === el)
        if (!tmp) return true
        return false
      })
      this.StaffData.forEach((item) => {
        newIds.forEach((element) => {
          if ( item.id == element ) {
            projectMemberIdList.push(item.id)
            projectMemberNameList.push(item.realname)
          }
        })
      })
      delItem.forEach((item) => {
        delProjectMemberIdList.push(item.id)
        delProjectMemberNameList.push(item.realname)
      })
      let params = {
        projectMemberId: projectMemberIdList.toString(),
        projectMemberName: projectMemberNameList.toString(),
        delProjectMemberId: delProjectMemberIdList.toString(),
        delProjectMemberName: delProjectMemberNameList.toString(),
        projectId: this.projectId
      }
      const data = await distributionStaff(params)
      this.getUserTableData()
    },
    // 展开高级搜索
    openAdvancedSearch() {
      this.userForms.condition = ''
      this.searchShow = !this.searchShow
    }
  }
}
</script>
<style scoped lang="scss">
.cp {
  cursor: pointer;
}
.cell > div,
.is-sortable > .cell {
  margin-top: 5px;
}
.el-table th div {
  line-height: 23px !important;
}
.el-table__column-filter-trigger {
  visibility: hidden !important;
}
.distributionTransfer{
  text-align: center;
}

.content-pages{
  width:100%;
  

  .popCon {
    min-height: 100px;
    .txtW { width: 200px;}
  }
}

</style>
