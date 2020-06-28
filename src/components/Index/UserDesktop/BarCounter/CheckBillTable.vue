<template>
  <!-- 盘点/盘点单明细 共用table -->
  <div class="bar-content" ref="ckTable">
    <el-table
      :data="tableData"
      highlight-current-row
      style="width: 100%;"
      height="100%"
      :row-style="isShowRow"
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column
              prop="itemCode"
              :label="$t('Dict.ItemCode')"
              class-name="no-wrap"
              width="100"
              fixed="left"
      ></el-table-column>
      <el-table-column
              prop="itemName"
              :label="$t('Dict.ItemName')"
              class-name="no-wrap"
              width="160"
              fixed="left"
      ></el-table-column>
      <el-table-column
              prop="unitName"
              :label="$t('Dict.UnitName')"
              class-name="no-wrap"
              width="80"
      ></el-table-column>
      <el-table-column
              prop="sizeName"
              :label="$t('Dict.SizeName')"
              class-name="no-wrap"
              width="160"
      ></el-table-column>
      <el-table-column
              prop="origQty"
              :label="$t('Dict.OriginalStock')"
              class-name="no-wrap"
              width="150"
              align="right"
      ></el-table-column>
      <el-table-column
              prop="receiveQty"
              :label="$t('Dict.CollarUse')"
              class-name="no-wrap"
              width="80"
              align="right"
      ></el-table-column>
      <el-table-column
              prop="saleQty"
              :label="$t('Dict.Sale')"
              class-name="no-wrap"
              width="80"
              align="right"
      ></el-table-column>
      <el-table-column
              prop="allotQty"
              :label="$t('Dict.Allocation')"
              class-name="no-wrap"
              width="80"
              align="right"
      ></el-table-column>
      <el-table-column
              prop="lastQty"
              :label="$t('Dict.CurrentInventory')"
              class-name="no-wrap"
              width="150"
              align="right"
      ></el-table-column>
      <el-table-column
              prop="realQty"
              :label="$t('Biz.UserDesktop.QuantityOfFirmOffer')"
              class-name="no-wrap"
              width="190"
              align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-if="isEditAble"
            v-model="scope.row.realQty"
            controls-position="right"
            :min="0"
            :numPrecision="2"
            size="small"
          ></el-input-number>
          <template v-else>{{ scope.row.realQty }}</template>
        </template>
      </el-table-column>
      <el-table-column
              prop="diffQty"
              :label="$t('Biz.UserDesktop.DifferenceNumber')"
              class-name="no-wrap"
              width="160"
              align="right"
      >
        <template slot-scope="scope">
          <span
            :style="{color:dealDiffColor(scope.row.diffQty)}"
          >{{calcDiffQty(scope.$index)}}</span>
        </template>
      </el-table-column>
      <el-table-column
              prop="remark"
              :label="$t('Dict.Remarks')"
              class-name="no-wrap"
              min-width="150"
              align="center"
      >
        <template slot-scope="scope">
          <el-input
                  v-if="isEditAble"
                  v-model="scope.row.remark"
                  :placeholder="$t('Biz.UserDesktop.RelatedInstructions')"
                  size="small"
          ></el-input>
          <template v-else>{{ scope.row.remark }}</template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {each, includes} from 'lodash';

  export default {
  name: 'checkBillTable',
  props: {
    // 盘点table绑定数据
    tableData: {
      type: Array,
      default() {
        return [];
      },
    },
    // 是否可以修改
    isEditAble: {
      type: Boolean,
      default() {
        return true;
      },
    },
    // 是否显示销售、领用、调拨为0的品项
    // 因为盘点全部数据，后台过滤会丢掉盘点数据，因此过滤在前端做
    isShowZero: {
      type: Boolean,
      default() {
        return true;
      },
    },
  },
  methods: {
    // 计算差异数【实盘-现库存】
    calcDiffQty(index) {
      this.tableData[index].diffQty = this.tableData[index].realQty
        - this.tableData[index].lastQty;
      return this.tableData[index].diffQty;
    },
    // 处理差异数的颜色
    dealDiffColor(val) {
      if (Math.sign(val) === 1) {
        return '#43d182';
      }
      if (Math.sign(val) === -1) {
        return '#f5222d';
      }
      return 'initial';
    },
    // 判断是否显示销售、领用、调拨为0的品项
    isShowRow(rowObj) {
      const returnObj = { display: '' };
      if (
        !this.isShowZero
        && rowObj.row.receiveQty === 0
        && rowObj.row.saleQty === 0
        && rowObj.row.allotQty === 0
      ) {
        returnObj.display = 'none';
      }
      return returnObj;
    },
    // 处理合计行
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      // 需要计算合计的列
      const setcolumns = ['origQty', 'receiveQty', 'saleQty', 'allotQty', 'lastQty', 'realQty', 'diffQty'];
      // 遍历table的列
      each(columns, (column, index) => {
        // 将table每一列的值转化成数字类型,data为table的行数据
        const values = data.map(item => Number(item[column.property]));
        if (includes(setcolumns, column.property)) {
          // 求和
          sums[index] = values.reduce((prev, curr) => prev + curr, 0);
        } else if (index === 0) {
          sums[index] = this.$t('Dict.Total');
        } else {
          sums[index] = '';
        }
      });
      return sums;
    },
  },
};
</script>
