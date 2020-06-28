<template>
  <div class="bar-page">
    <SystemContent :title="$t('Biz.UserDesktop.DrawingAndDrawingList')">
      <div class="bar-wrap">
        <div class="bar-header">
          <button
            type="button"
            class="pull-left btn btn-primary"
            @click="transfer()"
          >+ {{$t('Dict.NewlyBuild')}}
          </button>
          <Search class="pull-right search" @onSearch="onSearch"
                  :placeholder="$t('Biz.UserDesktop.UserDesktopMsg003')"></Search>
        </div>
        <div class="bar-content" ref="barContent">
          <el-table
            :data="tableData"
            highlight-current-row
            style="width: 100%;"
          >
            <el-table-column
                    prop="code"
                    :label="$t('Biz.UserDesktop.DocumentNumber')"
                    class-name="no-wrap"
                    width="160"
            ></el-table-column>
            <el-table-column
                    :label="$t('Biz.UserDesktop.InventoryStatus01')"
                    width="160"
                    class-name="no-wrap"
            >
              <template slot-scope="scope">
                <i class="circ" :class="'circ-' + scope.row.isTakeStock"></i>
                {{ scope.row.isTakeStock ? $t('Biz.UserDesktop.Stocktaking'): $t('Biz.UserDesktop.NoInventory')}}
              </template>
            </el-table-column>
            <el-table-column
                    prop="modifierName"
                    :label="$t('Dict.Operator')"
                    class-name="no-wrap"
                    width="100"
            ></el-table-column>
            <el-table-column
                    :label="$t('Dict.OperationTime')"
                    class-name="no-wrap"
                    width="160"
            >
              <template slot-scope="scope">
                {{ scope.row.modifyTime | tDateFormat }}
              </template>
            </el-table-column>
            <el-table-column
                    prop="remark"
                    :label="$t('Dict.Remarks')"
                    class-name="no-wrap"
                    width="100"
            ></el-table-column>
            <el-table-column
                    prop="detail"
                    :label="$t('Dict.DetailedList')"
                    class-name="no-wrap"
            ></el-table-column>
            <el-table-column
                    :label="$t('Dict.Operation')"
                    class-name="no-wrap"
                    fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="mini"
                  @click="transfer(scope.row.id)"
                >
                  {{ scope.row.isTakeStock ? $t('Dict.See') : $t('Dict.Modify') }}
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  @click="deleteItem(scope.row)"
                >{{$t('Dict.Delete')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="bar-footer">
          <Pagination
            :total="total"
            :limit="limit"
            :page="page"
            @handleChangePage="handleChangePage"
          ></Pagination>
        </div>
      </div>
    </SystemContent>
    <Transfer ref="transfer"></Transfer>
  </div>
</template>

<script>
  import SystemContent from '../base/SystemContent';
  import Search from '@/components/Index/UserDesktop/base/Search';
  import Pagination from '@/components/Index/UserDesktop/base/Pagination';
  import Transfer from './Transfer';
  import dateFormatMixin from '@/common/js/dateFormatMixin';
  import ajax from '@/common/js/ajax';

  export default {
  components: {
    SystemContent,
    Search,
    Pagination,
    Transfer,
  },
  mixins: [dateFormatMixin],
  data() {
    return {
      total: 0,
      limit: 10,
      page: 1,
      tableData: [],
      searchParams: '',
    };
  },
  mounted() {
    this.resetData();
  },
  methods: {
    // 重置数据
    resetData() {
      this.page = 1;
      this.searchParams = '';
      this.$nextTick(() => {
        this.calcPageSize();
        this.getTableData();
      });
    },
    // 根据高度获取每页显示多少条数据
    getPageSize(height) {
      const re = parseInt((height - 48) / 53, 0);
      if (re > 1) {
        return re;
      }
      return 1;
    },
    // 计算分页数据
    calcPageSize() {
      this.limit = this.getPageSize(this.$refs.barContent.offsetHeight);
    },
    // 获取表格数据
    getTableData() {
      ajax('canyin.desktop.bizbmsallot.list', {
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
    handleChangePage(page) {
      this.page = page;
      this.getTableData();
    },
    // 重新获取表格数据
    reloadData() {
      this.page = 1;
      this.searchParams = '';
      this.getTableData();
    },
    // 新建领用单
    transfer(allotId) {
      ajax('canyin.desktop.bizbmsallot.loaditemlist', {
        contentType: 'URLEncoded',
        data: { allotId },
      }).then((resData) => {
        if (resData.itemList && resData.itemList.length) {
          this.$refs.transfer.open(resData, {
            submit: () => {
              this.reloadData();
            },
          });
        } else {
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg004'));
        }
      });
    },
    // 搜索事件
    onSearch(value) {
      this.searchParams = value;
      this.page = 1;
      this.getTableData();
    },
    // 删除一个品项
    deleteItem(item) {
      const {
        id: ids,
        code: codes,
      } = item;
      ajax('canyin.desktop.bizbmsallot.deleteitem', {
        contentType: 'URLEncoded',
        data: { ids, codes, names: '' },
      }).then(() => {
        this.reloadData();
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.circ {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  vertical-align: middle;

  &-1 {
    background-color: #43d182;
  }

  &-0 {
    background-color: #f5222d;
  }
}
</style>
