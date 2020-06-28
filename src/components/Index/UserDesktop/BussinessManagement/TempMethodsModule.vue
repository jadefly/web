<template>
    <SystemContent :title="$t('Biz.BizComm.TempMethod')">
    <div class="system-table-body" ref="systemTableBody" style="height: 100%">
      <el-table
        ref="systemTableBody"
        :data="tableData"
        highlight-current-row
        style="width: 100%">
          <el-table-column v-for="item of tableColumns"
            :key="item.id"
            :label="item.label"
            :width="item.width"
            :prop="item.prop"
            align="center"
            class-name="no-wrap"
          >
          </el-table-column>
          <el-table-column :label="$t('Dict.Operation')" align="center">
            <el-button type="text" size="mini" slot-scope="scope"
                       @click="deleteTempMethod({items: [scope.row]})" :key="scope.row.id">{{$t('Dict.Delete')}}
            </el-button>
          </el-table-column>
      </el-table>
    </div>
    <div slot="foot">
      <el-button type="danger" size="medium" class="user-desktop-clearall"
                 @click="deleteAll">{{$t('Dict.EmptyAll')}}
      </el-button>
      <Search ref="tempMethodssSearch" :unSearchMode="true"
      @search="onSearch" class="user-desktop-search"></Search>
      <Pagination :total="total" :limit="limit" :page="page"
      @handleChangePage="handleChangePage"></Pagination>
    </div>
  </SystemContent>
</template>

<script>
    import {debounce} from 'lodash';
    import Pagination from '../base/Pagination';
    import SystemContent from '../base/SystemContent';
    import Search from '@/components/Pos/Order/Tables/Search';
    import ajax from '@/common/js/ajax';
    import tableColumns from './tempMethodsTableColumns';
    import dateFormat from '@/common/js/dateformat';

    export default {
  name: 'TempItemsModule',
  data() {
    return {
      total: 0,
      limit: 10,
      page: 1,
      searchParams: '',
      tableColumns,
      debounceFn: null,
      tableData: [],
    };
  },
  components: {
    Pagination,
    SystemContent,
    Search,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getTempMethodsList();
    });
  },
  beforeRouteLeave(to, from, next) {
    window.removeEventListener('resize', this.debounceFn, false);
    next();
  },
  mounted() {
    this.debounceFn = debounce(() => {
      this.page = 1;
      this.getTempMethodsList();
    }, 500);
    window.addEventListener('resize', this.debounceFn, false);
  },
  methods: {
    getTempMethodsList() {
      this.limit = Math.floor((this.$refs.systemTableBody.clientHeight - 32) / 65);
      ajax('canyin.desktop.businessManagement.tempmethodlist', {
        contentType: 'URLEncoded',
        data: {
          pageNo: this.page,
          pageSize: this.limit,
          searchParams: this.searchParams,
        },
      }).then((data) => {
        if (data.list.length === 0 && data.total > 0 && this.page > 1) {
          this.page = this.page - 1;
          this.getTempMethodsList();
          return;
        }
        this.total = data.total;
        this.tableData = data.list.map((item, index) => ({
          index: (this.page - 1) * this.limit + index + 1,
          createDate: dateFormat('%Y-%M-%D %H:%I:%S', item.createTimeLong),
          ...item,
        }));
      });
    },
    deleteAll() {
        this.$confirm(this.$t('Biz.UserDesktop.ConfirmEmptyAll'), this.$t('Dict.Tips')).then(() => {
        this.deleteTempMethod({ isDeleteAll: true });
      }).catch(() => {});
    },
    deleteTempMethod({ isDeleteAll, items } = { isDeleteAll: false, items: [] }) {
      ajax('canyin.desktop.businessManagement.deletemethodlist', {
        contentType: 'URLEncoded',
        data: this.createDeleteParams(isDeleteAll, items),
      }).then((data) => {
        this.getTempMethodsList();
          this.$message.success(data.msg ? data.msg : this.$t('Dict.DeleteSuccess'));
      });
    },
    createDeleteParams(isDeleteAll, items) {
      if (isDeleteAll) {
        return {
          isDeleteAll: true,
        };
      }
      return {
        params: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          createShopId: item.createShopId,
        }))),
      };
    },
    handleChangePage(page) {
      this.page = page;
      this.getTempMethodsList();
    },
    onSearch(value) {
      this.searchParams = value.toUpperCase();
      this.getTempMethodsList();
    },
  },
  watch: {
    searchParams: debounce(function () {
      this.getTempMethodsList();
    }, 500),
  },
};
</script>

<style lang="less">
  .el-table .no-wrap .cell {
    white-space: nowrap;
  }
</style>
