<template>
  <div>
    <el-table stripe
        ref="multipleTable"
        :data="tableData"
        style="width:100%"
        @select-all="onSelectAll"
        @selection-change="selectItem"
        
        tooltip-effect="dark">
      <el-table-column type="selection"
          align="center"
          width="30">
      </el-table-column>
      <el-table-column prop="numcode"
          label="序号"
          fit="false"
          min-width="4%"
          align="center"
          key='1'>
          <template slot-scope="scope">
              {{scope.$index+1}}
          </template>
      </el-table-column>
      <el-table-column prop="projectName"
          label="交接单名称"
          fit="false"
          align="center"
          min-width="10%"
          key='2'>
          <template slot-scope="scope">
            <a @click="details(scope.row.id)" type="text">{{scope.row.projectName || '-'}}</a>
          </template>
      </el-table-column>
      <el-table-column prop="bargainNo"
          label="合同编号"
          fit="false"
          align="center"
          min-width="10%"
          key='3'>
          <template slot-scope="scope">
            {{scope.row.bargainNo || '-'}}
          </template>
      </el-table-column>
      <el-table-column prop="bargainName"
          label="合同名称"
          :show-overflow-tooltip='true'
          align="center"
          fit="false"
          min-width="10%"
          key='4'>
          <template slot-scope="scope">
            {{scope.row.bargainName || '-'}}
          </template>
      </el-table-column>
      <el-table-column prop="bargainPrice"
          fit="false"
          label="合同金额"
          align="center"
          min-width="7%"
          key='5'>
          <template slot-scope="scope">
            {{scope.row.bargainPrice || '-'}}
          </template>
      </el-table-column>
      <el-table-column prop="customerName"
          label="客户名称"
          min-width="7%"
          fit="false"
          align="center"
          key='7'>
          <template slot-scope="scope">
            {{scope.row.customerName || '-'}}
          </template>
      </el-table-column>
      <el-table-column prop="isBindingBargain"
          label="审批类型"
          min-width="7%"
          align="center"
          fit="false"
          key='8'
          v-if='this.userAndRoleInfo.roleCode === "sales_director" || this.userAndRoleInfo.roleCode === "technical_director"'>
          <template slot-scope="scope">
              <template v-if="scope.row.isBindingBargain == true">有合同</template>
              <template v-if="scope.row.isBindingBargain == false">无合同</template>
          </template>
      </el-table-column>
      <el-table-column prop="headOfSales"
          fit="false"
          label="销售负责人"
          align="center"
          v-if="this.userAndRoleInfo.roleCode !== 'sales_man'"
          min-width="7%"
          key='9'>
          <template slot-scope="scope">
            {{scope.row.headOfSales || '-'}}
          </template>
      </el-table-column>
      <el-table-column prop="assignDeliveryManagerName"
          fit="false"
          label="安服经理"
          min-width="7%"
          align="center"
          key='10'
          v-if='this.userAndRoleInfo.roleCode === "sales_man"'>
          <template slot-scope="scope">
            {{scope.row.assignDeliveryManagerName || '-'}}
          </template>
      </el-table-column>
      <el-table-column prop="serviceManName "
          fit="false"
          label="安服组长"
          min-width="7%"
          align="center"
          key='11'
          v-if='this.userAndRoleInfo.roleCode === "sales_man"'>
          <template slot-scope="scope">
            {{scope.row.serviceManName || '-'}}
          </template>
      </el-table-column>
      <template>
          <el-table-column prop="approvalState,bpmStatu,id"
              fit="false"
              label="审批状态"
              align="center"
              min-width="12%"
              key='12'>
              <template slot-scope="scope">
                      <!-- （0：待提交; 1：审批中; 2：已通过; -1：退回;3:待审批） -->
                      <template v-if="scope.row.approvalState == 0">待提交</template>
                      <template v-if="scope.row.approvalState == 1">审批中</template>
                      <template v-if="scope.row.approvalState == 2">已通过</template>
                      <template v-if="scope.row.approvalState == -1">退回</template>
                      <template v-if="scope.row.approvalState == 3">待审批</template>
              </template>
          </el-table-column>
      </template>
      <el-table-column prop="createTime"
          label="创建时间"
          fit="false"
          align="center"
          min-width="12%"
          sortable
          key='13'>
          <template slot-scope="scope">
              {{scope.row.createTime | formatDate}}
          </template>
      </el-table-column>
      <!-- <el-table-column
          fixed="right"
          label="审批"
          width="100"
          key='14'
          v-if='this.userAndRoleInfo.roleCode === "general_manager" ||this.userAndRoleInfo.roleCode === "sales_director" || this.userAndRoleInfo.roleCode === "technical_director"'>
          <template slot-scope="scope">
              <el-button @click="approval(scope.row.id)" type="text" size="small">审批</el-button>
          </template>
      </el-table-column> -->
    </el-table>
    <!-- <div class="footer">
        <span class="total">
            共{{userTotal}}条，{{formInline.pageSize}}条/页
        </span>
        <el-pagination @current-change="userHandleCurrentChange"
            :small="true"
            :current-page.sync="formInline.pageNo"
            :page-size="formInline.pageSize"
            layout="prev, pager, next, jumper"
            :total="userTotal">
        </el-pagination>
    </div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'approvalList',
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
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    })
  },
  methods: {
    // 交接单审批
    approval (id) {
      this.$router.push({ path: '/approval', query: { id } })
    },
    // 查看交接单详情
    details(id) {
      console.log('查看交接单详情', this.fromName)
      this.$router.push({ path: '/approvalDetails', query: { id, fromName: this.$route.name } })
    },
    selectItem(rows) {
      // console.log('click-checkbox', rows)
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
    }
  }
}
</script>

