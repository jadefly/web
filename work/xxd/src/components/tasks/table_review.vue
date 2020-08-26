<!-- 规范性复核，项目助理 -->

<template>
  <el-table stripe
            ref="multipleTable"
            :data="tableData"
            style="width:100%"
            tooltip-effect="dark"
            @select-all="onSelectAll"
            @selection-change="selectItem"
            v-if="tableData">
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
    <!-- <el-table-column prop="assignDeliveryManagerName"
                      fit="false"
                      label="安服经理"
                      min-width="">
        <template slot-scope="scope">
          {{scope.row.assignDeliveryManagerName || '-'}}
        </template>
    </el-table-column>
    <el-table-column prop="assignDeliveryManagerName"
                      fit="false"
                      label="安服组长"
                      min-width="">
        <template slot-scope="scope">
          {{scope.row.serviceManName || '-'}}
        </template>
    </el-table-column> -->
    <el-table-column prop="projectManagerName"
                      label="项目经理"
                      fit="false"
                      min-width=""
                      key='9'>
        <template slot-scope="scope">
          {{scope.row.projectManagerName || '-'}}
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
  </el-table>
</template>

<script>
export default {
  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    selectItem(rows) {
      console.log(rows)
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
        this.$emit('onMultipleSelection', newRows)
      } else {
        this.$emit('onMultipleSelection', rows)
      }
    },
    onSelectAll() {
      this.$refs.multipleTable.clearSelection();
    },
  }
}
</script>
