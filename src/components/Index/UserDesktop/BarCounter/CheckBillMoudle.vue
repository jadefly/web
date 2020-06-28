<template>
  <div class="bar-page">
    <SystemContent>
      <!-- 标题 -->
      <div class="system-content-head check-head" slot="head">
        <h3>{{$t('Biz.UserDesktop.CheckList')}}</h3>
      </div>
      <!-- 盘点单 -->
      <div class="bar-wrap">
        <div class="bar-header">
          <!-- 新建盘点 -->
          <button type="button" class="pull-left btn btn-primary" @click="createCheck">+ {{$t('Dict.NewlyBuild')}}</button>
          <!-- 盘点单search查询框 -->
            <Search class="pull-right search" @onSearch="onSearch"
                    :placeholder="$t('Biz.UserDesktop.UserDesktopMsg003')"></Search>
        </div>
        <div class="bar-content" ref="ckBillTable">
          <!-- 盘点单Table -->
          <el-table :data="tableData" highlight-current-row style="width: 100%;">
            <el-table-column
              v-for="(item ,index) in tableSettings"
              :key="index"
              :prop="item.prop"
              :label="item.label"
              :class-name="item.className"
              :min-width="item.minWidth"
              :fixed="item.fixed"
              :width="item.width"
              :align="item.align"
            >
              <template slot-scope="scope">
                <!-- 单据编号处理成可点击的格式 -->
                <el-button
                  type="text"
                  size="mini"
                  v-if="item.prop=='op'"
                  @click="CheckBillDetails(scope.row)"
                >{{$t('Dict.See')}}</el-button>
                <!-- 盘点时间格式处理 -->
                <div
                  v-else-if="item.prop=='makeStockTime'"
                >{{scope.row.makeStockTime.replace('T',' ').split('.')[0]}}</div>
                <!-- colomn -->
                <div v-else>{{scope.row[item.prop]}}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="bar-footer">
          <p class="pull-left ">
            <span>{{$t('Biz.UserDesktop.UserDesktopMsg007')}}</span>
            <span>{{$t('Biz.UserDesktop.UserDesktopMsg008')}}</span>
          </p>
          <div style="clear: both"></div>
          <!-- 分页 -->
          <Pagination
            :total="total"
            :limit="limit"
            :page="page"
            @handleChangePage="handleChangePage"
          ></Pagination>
        </div>
      </div>
    </SystemContent>
    <!-- 盘点dialog -->
    <CheckMoudleDialog ref="ckDialog"></CheckMoudleDialog>
    <!-- 盘点单详情dialog -->
    <CheckBillDialog
      ref="CheckBillDialog"
      :CheckBillDetails="CheckBillDetails"
      :tableData="billDetailTableData"
      :makeStockData="makeStockData"
    ></CheckBillDialog>
  </div>
</template>

<script>
import Search from '@/components/Index/UserDesktop/base/Search';
import Pagination from '@/components/Index/UserDesktop/base/Pagination';
import ajax from '@/common/js/ajax';
import SystemContent from '../base/SystemContent';
import CheckMoudleDialog from './CheckMoudleDialog';
import CheckBillDialog from './CheckBillDialog';

export default {
  components: {
    Search,
    SystemContent,
    Pagination,
    CheckBillDialog,
    CheckMoudleDialog,
  },
  data() {
    return {
      // 分页参数
      total: 0,
      limit: 10,
      page: 1,
      // 盘点单table数据
      tableData: [],
      // search 查询数据
      searchParams: '',
      // 盘点单table配置
      tableSettings: [{
        prop: 'code',
        label: this.$t('Biz.UserDesktop.DocumentNumber'),
        className: 'no-wrap',
        minWidth: '180',
      }, {
        prop: 'origQty',
        label: this.$t('Dict.OriginalStock'),
        className: 'no-wrap',
        width: '150',
        align: 'right',
      }, {
        prop: 'receiveQty',
        label: this.$t('Dict.CollarUse'),
        className: 'no-wrap',
        width: '100',
        align: 'right',
      }, {
        prop: 'saleQty',
        label: this.$t('Dict.Sale'),
        className: 'no-wrap',
        width: '100',
        align: 'right',
      }, {
        prop: 'allotQty',
        label: this.$t('Dict.Allocation'),
        className: 'no-wrap',
        width: '100',
        align: 'right',
      }, {
        prop: 'lastQty',
        label: this.$t('Dict.CurrentInventory'),
        className: 'no-wrap',
        width: '150',
        align: 'right',
      }, {
        prop: 'realQty',
        label: this.$t('Biz.UserDesktop.QuantityOfFirmOffer'),
        className: 'no-wrap',
        width: '220',
        align: 'right',
      }, {
        prop: 'diffQty',
        label: this.$t('Biz.UserDesktop.DifferenceNumber'),
        className: 'no-wrap',
        width: '160',
        align: 'right',
      }, {
        prop: 'makeStockEmpName',
        label: this.$t('Biz.UserDesktop.StocktakingPerson'),
        className: 'no-wrap',
        minWidth: '180',
      }, {
        prop: 'makeStockTime',
        label: this.$t('Biz.UserDesktop.InventoryTime'),
        className: 'no-wrap',
        minWidth: '180',
      }, {
        prop: 'op',
        label: this.$t('Dict.Operation'),
        className: 'no-wrap',
        minWidth: '100',
        align: 'center',
        fixed: 'right',
      }],
      // 盘点单明细table绑定数据
      billDetailTableData: [],
      // 选中的盘点单的数据
      makeStockData: {},
    };
  },
  mounted() {
    this.resetTableData();
  },
  methods: {
    // 重置盘点单
    resetTableData() {
      this.page = 1;
      this.searchParams = '';
      this.$nextTick(() => {
        this.calcPageSize();
        this.getTableData();
      });
    },
    // 获取每页显示最大数据条数
    calcPageSize() {
      this.limit = this.getPageSize(this.$refs.ckBillTable.offsetHeight);
    },
    // 计算每页显示最大数据条数
    getPageSize(height) {
      const re = parseInt((height - 48) / 53, 0);
      if (re > 1) {
        return re;
      }
      return 1;
    },
    // 查询盘点单数据
    getTableData() {
      ajax('canyin.desktop.bizbmsstock.list', {
        contentType: 'URLEncoded',
        data: {
          page: this.page,
          limit: this.limit,
          searchValue: this.searchParams,
        },
      }).then((data) => {
        this.total = data.total;
        this.tableData = data.datalist;
      });
    },
    // 分页查询
    handleChangePage(val) {
      this.page = val;
      this.getTableData();
    },
    // search查询框查询处理
    onSearch(val) {
      this.page = 1;
      this.searchParams = val;
      this.getTableData();
    },
    // 查看盘点单详细信息
    CheckBillDetails(rowObj, searchVal) {
      ajax('canyin.desktop.bizbmsstockdetail.list', {
        contentType: 'URLEncoded',
        data: {
          makeStockId: rowObj.id,
          searchValue: searchVal,
        },
      }).then((data) => {
        this.makeStockData = rowObj;
        this.billDetailTableData = data;
        this.$refs.CheckBillDialog.open();
      });
    },
    // 盘点
    createCheck() {
      this.$refs.ckDialog.open(null, {
        submit: () => {
          this.resetTableData();
        },
      });
    },
  },
};
</script>

<style lang="less" scoped>
.check-head {
  > h3 {
    float: left;
  }
}

.bar-footer > p {
  color: #888;
  line-height: 40px;
  font-size: 16px;
  width: 650px;
  > span {
    margin-right: 20px;
  }
}
</style>
