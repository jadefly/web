<template>
  <el-table stripe
        ref="multipleTable"
        :data="tableData"
        style="width:100%"
        tooltip-effect="dark"
        @select-all="onSelectAll"
        @selection-change="selectItem">
    <el-table-column align="center"
      type="selection"
      width="40">
    </el-table-column>
    <el-table-column prop="numcode"
        label="序号"
        fit="false"
        min-width="4%"
        align="center"
        header-align="center"
        key='1'>
        <template slot-scope="scope">
            {{scope.$index+1}}
        </template>
    </el-table-column>
    <el-table-column prop="projectName"
        label="交接单名称"
        :show-overflow-tooltip='true'
        fit="false"
        min-width="10"
        key='2'>
        <template slot-scope="scope">
          <a @click="details(scope.row.id)" type="text">{{scope.row.projectName ||'-'}}</a>
        </template>
    </el-table-column>
    <el-table-column prop="bargainNo"
        label="合同编号"
        :show-overflow-tooltip='true'
        fit="false"
        min-width="10%"
        key='4'>
        <template slot-scope="scope">
                  {{scope.row.bargainNo || '-'}}
        </template>
    </el-table-column>
    <el-table-column prop="bargainName"
        label="合同名称"
        :show-overflow-tooltip='true'
        fit="false"
        min-width="10%"
        key='5'>
        <template slot-scope="scope">
                  {{scope.row.bargainName || '-'}}
        </template>
    </el-table-column>
    <!-- 安服组长,安服经理不显示 -->
    <!-- <el-table-column prop="bargainPrice"
        fit="false"
        label="合同金额"
        min-width="7%"
        key='6'>
        <template slot-scope="scope">
                  {{scope.row.bargainPrice || '-'}}
        </template>
    </el-table-column> -->
    <el-table-column prop="customerName"
        label="客户名称"
        :show-overflow-tooltip='true'
        min-width="10"
        fit="false"
        key='3'>
        <template slot-scope="scope">
                  {{scope.row.customerName || '-'}}
        </template>
    </el-table-column>
    <el-table-column prop="expectedStartTime"
        fit="false"
        label="启动时间"
        min-width="7%"
        key='7'>
        <template slot-scope="scope">
                  {{scope.row.expectedStartTime || '-'}}
        </template>
    </el-table-column>
    <el-table-column prop="expectedEndTime"
        fit="false"
        label="结束时间"
        min-width="7%"
        key='8'>
        <template slot-scope="scope">
                  {{scope.row.expectedEndTime || '-'}}
        </template>
    </el-table-column>

    <el-table-column prop="disCompliance"
        fit="false"
        label="合规"
        min-width="7%"
        key='10'>
            <template slot-scope="scope">
                    <template v-if="scope.row.disCompliance == true">是</template>
                    <template v-if="scope.row.disCompliance == false">否</template>
            </template>
    </el-table-column>
    <el-table-column prop="complianceImplementation"
        fit="false"
        label="合规实施额"
        min-width="10%"
        key='14'>
        <template slot-scope="scope">
                  {{scope.row.complianceImplementation || '-'}}
        </template>
    </el-table-column>
    <el-table-column prop="disSecurityService"
        fit="false"
        label="安全服务"
        min-width="7%"
        key='11'>
            <template slot-scope="scope">
                    <template v-if="scope.row.disSecurityService == true">是</template>
                    <template v-if="scope.row.disSecurityService == false">否</template>
            </template>
    </el-table-column>
    <el-table-column prop="securityImplementation"
        fit="false"
        label="安服实施额"
        min-width="10%"
        key='15'>
        <template slot-scope="scope">
                  {{scope.row.securityImplementation || '-'}}
        </template>
    </el-table-column>

    <el-table-column prop="disThirdServe"
        fit="false"
        label="第三方服务"
        min-width="7%"
        key='12'>
            <template slot-scope="scope">
                    <template v-if="scope.row.disThirdServe == true">是</template>
                    <template v-if="scope.row.disThirdServe == false">否</template>
            </template>
    </el-table-column>
    <el-table-column prop="tripartiteImplementation"
        fit="false"
        label="第三方服务实施额"
        min-width="12%"
        key='16'>
        <template slot-scope="scope">
                  {{scope.row.tripartiteImplementation || '-'}}
        </template>
    </el-table-column>

    <el-table-column prop="disSelfProduct"
        fit="false"
        label="自有产品"
        min-width="7%"
        key='13'>
            <template slot-scope="scope">
                    <template v-if="scope.row.disSelfProduct == true">是</template>
                    <template v-if="scope.row.disSelfProduct == false">否</template>
            </template>
    </el-table-column>
    <el-table-column prop="haveImplementation"
        fit="false"
        label="自有产品实施额"
        min-width="10%"
        key='17'>
        <template slot-scope="scope">
                  {{scope.row.haveImplementation || '-'}}
        </template>
    </el-table-column>
    
    <el-table-column prop="headOfSales"
        fit="false"
        label="销售负责人"
        min-width="7%"
        key='9'>
        <template slot-scope="scope">
                  {{scope.row.headOfSales || '-'}}
        </template>
    </el-table-column>
    <el-table-column prop="serviceManName"
        fit="false"
        label="安服组长"
        min-width="7%"
        key='18'>
        <template slot-scope="scope">
                  {{scope.row.serviceManName || '-'}}
        </template>
    </el-table-column>
    <!-- <el-table-column
        fixed="right"
        label="操作"
        width="100"
        key='19'
        v-if='this.userAndRoleInfo.roleCode === "delivery_manager"'>
        <template slot-scope="scope">
            <el-button @click="Assign(scope.row.id)" type="text" size="small">指派</el-button>
        </template>
    </el-table-column>
    <el-table-column
        fixed="right"
        label="操作"
        width="100"
        key='19'
        v-if='this.userAndRoleInfo.roleCode === "service_man"'>
        <template slot-scope="scope">
            <el-button @click="management(scope.row.id)" type="text" size="small">工单管理</el-button>
        </template>
    </el-table-column> -->
  </el-table>
</template>

<script>
import approvalPage from './approvalProject.vue'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'approvalList',
  components: {
    approvalPage
  },
  props: {
    tableData: {
      type: Array,
      default: []
    },
    userTotal: {
      type: Number,
      default: 0
    },
    formInline: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    }),
    ...mapGetters(['getRoleCode'])
  },
  mounted () {

  },
  methods: {
    selectItem(rows) {
      console.log('-----------click-checkbox', rows)
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
        this.$emit('multiple-selection', newRows)
      } else {
        this.$emit('multiple-selection', rows)
      }
    },
    onSelectAll() {
      this.$refs.multipleTable.clearSelection();
    },
    // 查看交接单详情
    details(id) {
      this.$router.push({ path: '/approvalDetails', query: { id, fromName: this.$route.name } })
    },
    // 指派
    Assign(id) {
      console.log('指派')
      this.$router.push({ path: '/toAssign', query: { id, fromName: this.$route.name } })
    },
    // 工单管理
    management(id) {
      console.log('工单管理')
      this.$router.push({ name: 'workOrderList', query: { id, fromName: this.$route.name } })
    }
  },
}
</script>

