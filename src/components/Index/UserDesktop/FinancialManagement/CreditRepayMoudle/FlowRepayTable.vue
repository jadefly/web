<template>
  <el-table
    ref="flowTable"
    class="flow-table"
    :data="flowRepayData"
    height="96%"
    highlight-current-row
    style="width: 800px"
    @row-click="handleRowClick"
    @selection-change="$emit('handleSelectionChange', $event)">
      <!-- 多选模式 -->
      <el-table-column
        v-if="mode === 'select'"
        type="selection"
        width="55">
      </el-table-column>
      <!-- 单选模式 -->
      <el-table-column
        v-if="mode === 'radio'"
        width="55">
        <template slot-scope="scope">
          <el-radio
            class="radio"
            v-model="radio"
            :label="scope.row.code">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column v-for="item of tableColumns"
        :key="item.prop"
        :label="item.label"
        :width="item.width"
        :prop="item.prop"
        align="center"
        class-name="no-wrap"
      >
        <template slot-scope="scope">
          {{ scope.row[item.prop] === null ? '-' : scope.row[item.prop] }}
        </template>
      </el-table-column>
  </el-table>
</template>

<script>
import tableColumns from './flowRpayTableColumns';

export default {
  props: {
    mode: {
      type: String,
      default: 'noSelect',
    },
    flowRepayData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tableData: [],
      tableColumns: tableColumns(),
      radio: 1,
    };
  },
  methods: {
    handleRowClick(row) {
      if (this.mode === 'select') {
        this.$refs.flowTable.toggleRowSelection(row);
      }
      if (this.mode === 'radio') {
        this.radio = row.code;
        this.$emit('handleSelectionChange', row);
      }
    },
    clean() {
      this.tableData = [];
      this.radio = 1;
    },
  },
};
</script>

<style lang="less" scoped>
.flow-table {
  overflow: scroll;
}
</style>
