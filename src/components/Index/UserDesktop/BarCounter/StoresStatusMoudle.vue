<template>
  <div class="bar-page">
    <SystemContent>
      <div class="system-content-head store-head" slot="head">
        <h3>{{$t('Dict.InventoryStatus')}}</h3>
        <button
          type="button"
          class="btn btn-default bar-dialog-top-button btn-print"
          @click="printItem"
        >{{$t('Dict.Printing')}}</button>
        <button
          type="button"
          class="btn btn-default bar-dialog-top-button"
          @click="exportItem"
        >{{$t('Dict.Export')}}</button>
      </div>
      <div class="bar-wrap">
        <div class="bar-header">
          <el-checkbox v-model="checked" @change="handleChange">{{$t('Biz.UserDesktop.UserDesktopMsg010')}}</el-checkbox>
          <Search
                  class="pull-right search"
                  @onSearch="onSearch"
                  :placeholder="$t('Biz.UserDesktop.UserDesktopMsg011')"
          ></Search>
        </div>
        <div class="bar-content" ref="storeStaTable">
          <el-table :data="tableData" highlight-current-row style="width: 100%;" show-summary
            :summary-method="getSummaries">
            <el-table-column
                    prop="itemCode"
                    class-name="no-wrap"
                    :label="$t('Dict.ItemCode')"
                    min-width="100"
            ></el-table-column>
            <el-table-column
                    prop="itemName"
                    class-name="no-wrap"
                    :label="$t('Dict.SizeName')"
                    min-width="200"
            ></el-table-column>
            <el-table-column
                    prop="unitName"
                    class-name="no-wrap"
                    :label="$t('Dict.UnitName')"
            ></el-table-column>
            <el-table-column
                    prop="sizeName"
                    class-name="no-wrap"
                    :label="$t('Dict.SizeName')"
                    min-width="150"
            ></el-table-column>
            <el-table-column
                    prop="origQty"
                    class-name="no-wrap"
                    :label="$t('Dict.OriginalStock')"
                    align="right"
                    min-width="150"
            ></el-table-column>
            <el-table-column
                    prop="receiveQty"
                    class-name="no-wrap"
                    :label="$t('Dict.CollarUse')"
                    align="right"
            ></el-table-column>
            <el-table-column
                    prop="saleQty"
                    class-name="no-wrap"
                    :label="$t('Dict.Sale')"
                    align="right"
            ></el-table-column>
            <el-table-column
                    prop="allotQty"
                    class-name="no-wrap"
                    :label="$t('Dict.Allocation')"
                    align="right"
            ></el-table-column>
            <el-table-column
                    prop="lastQty"
                    class-name="no-wrap"
                    :label="$t('Dict.CurrentInventory')"
                    align="right"
                    min-width="150"
            ></el-table-column>
          </el-table>
        </div>
        <div class="bar-footer">
          <p>{{$t('Biz.UserDesktop.UserDesktopMsg007')}}</p>
          <Pagination
            :total="total"
            :limit="limit"
            :page="page"
            @handleChangePage="handleChangePage"
            class="pull-right"
          ></Pagination>
        </div>
      </div>
    </SystemContent>
  </div>
</template>

<script>
  import {each, includes} from 'lodash';
  import {mapGetters} from 'vuex';
  import SystemContent from '../base/SystemContent';
  import Search from '@/components/Index/UserDesktop/base/Search';
  import Pagination from '@/components/Index/UserDesktop/base/Pagination';
  import ajax from '@/common/js/ajax';

  export default {
  components: {
    SystemContent,
    Search,
    Pagination,
  },
  data() {
    return {
      checked: true, // 是否显示销售、领用、调拨为0的品项
      total: 0, // 库存状况数据总条数
      limit: 10, // 每页显示的最大条数
      page: 1, // 当前页面号
      tableData: [], // 库存状况table绑定数据
      searchParams: '', // 查询参数
    };
  },
  computed: {
    ...mapGetters(['deskPageBaseInfo']),
  },
  mounted() {
    this.resetTableData();
  },
  methods: {
    // 重置查询
    resetTableData() {
      this.page = 1;
      this.searchParams = '';
      this.calcPageSize();
      this.getList();
    },
    // 获取每页显示最大数据条数
    calcPageSize() {
      this.limit = this.getPageSize(this.$refs.storeStaTable.offsetHeight);
    },
    // 计算每页显示最大数据条数
    getPageSize(height) {
      const re = parseInt((height - 48) / 53, 0);
      if (re > 1) {
        return re;
      }
      return 1;
    },
    // 查询库存状况列表
    getList() {
      ajax('canyin.desktop.bizbmscondition.list', {
        contentType: 'URLEncoded',
        data: {
          page: this.page,
          limit: this.limit,
          isShowZero: this.checked,
          searchValue: this.searchParams,
        },
      }).then((data) => {
        this.total = data.total;
        this.tableData = data.datalist;
      });
    },
    // 搜索框查询
    onSearch(val) {
      this.page = 1;
      this.searchParams = val;
      this.getList();
    },
    // 是否显示销售、领用、调拨为0的品项
    handleChange() {
      this.page = 1;
      this.getList();
    },
    // 分页查询
    handleChangePage(page) {
      this.page = page;
      this.getList();
    },
    // 处理合计行
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      // 需要计算合计的列
      const setcolumns = ['lastQty', 'allotQty', 'saleQty', 'receiveQty', 'origQty'];
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
    getExportUrl() {
      const { HTTP_CONTEXTPATH } = this.deskPageBaseInfo;
      return `${HTTP_CONTEXTPATH}/canyin/desktop/bizbmscondition/export`;
    },
    printItem() {
      const url = this.getExportUrl();
      this.$devices.XLSPrint.print(url);
    },
    exportItem() {
      window.open(this.getExportUrl());
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@bar-header-height: 40px;
@bar-footer-height: 30px;

.store-head {
  h3 {
    display: inline;
  }
  button {
    float: right;
    height: 44px;
    margin: 6px 4px;
  }
  button.btn-print {
    margin-right: 20px;
  }
}
.bar-footer p {
  color: #888;
  font-size: 16px;
  line-height: 40px;
  display: inline;
}
</style>
