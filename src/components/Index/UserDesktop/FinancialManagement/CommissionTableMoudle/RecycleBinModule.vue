<template>
  <div class="comission-wrapper">
    <SystemContent>
      <div class="system-content-head comission-head" slot="head">
        <h3>{{$t('Dict.recycleBin')}}</h3>
        <button class="btn btn-bin" @click="openCommissonTable">{{
          $t('Biz.UserDesktop.Royaltylist')
        }}</button>
      </div>
      <div class="content-wrapper">
        <div class="operation">
          <button class="btn btn-primary" @click="refreshBin">{{$t('Dict.Btn.Refresh')}}</button>
          <Search
            class="search"
            @onSearch="onSearch"
            :placeholder="$t('Biz.UserDesktop.UserDesktopMsg053')"
          ></Search>
        </div>
        <div class="system-table-body" ref="systemTableBody">
          <el-table
            :data="tableData"
            highlight-current-row
            style="width: 100%"
            border
          >
            <el-table-column v-for="item of tableColumns"
              :key="item.prop"
              :label="item.label"
              :width="item.width"
              :prop="item.prop"
              align="center"
              class-name="no-wrap"
              :min-width="item.minwidth"
            >
              <template slot-scope="scope">
                {{ scope.row[item.prop] === null ? '-' : scope.row[item.prop] }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('Dict.Operation')"
              align="center"
              class-name="no-wrap"
              width="120"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  class="restore-btn"
                  @click="restoreCommissionTable(scope.row)"
                >{{ $t('Dict.Reduction') }}</el-button>
                <el-button
                  size="mini"
                  type="text"
                  class="delete-btn"
                  @click="deleteCommissionTable(scope.row)"
                >{{ $t('Dict.Delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div slot="foot" class="footer">
          <Pagination :total="total" :limit="limit" :page="page"
          @handleChangePage="handleChangePage"></Pagination>
        </div>
      </div>
    </SystemContent>
  </div>
</template>

<script>
import SystemContent from '@/components/Index/UserDesktop/base/SystemContent';
import ajax from '@/common/js/ajax';
import Search from '@/components/Index/UserDesktop/base/Search';
import dateFormat from '@/common/js/dateformat';
import tableColumns from './commissionTableColumns';
import Pagination from '@/components/Index/UserDesktop/base/Pagination';

export default {
  components: {
    SystemContent, Search, Pagination,
  },
  data() {
    return {
      total: 0,
      limit: 10,
      page: 1,
      tableColumns: tableColumns(),
      searchValue: '',
      tableData: [],
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.page = 1;
      vm.getRecycleList();
    });
  },
  computed: {
    start() {
      return (this.page - 1) * this.limit;
    },
  },
  methods: {
    getRecycleList() {
      this.limit = Math.floor((this.$refs.systemTableBody.clientHeight - 48) / 53);
      ajax('canyin.desktop.financialManagement.pushmoneytable.recyclelist', {
        contentType: 'URLEncoded',
        data: {
          start: this.start,
          limit: this.limit > 0 ? this.limit : 0,
          searchValue: this.searchValue,
        },
      }).then((data) => {
        const list = data.root;
        if (list.length === 0 && this.total > 0 && this.page > 1) {
          this.page = this.page - 1;
          this.getRecycleList();
          return;
        }
        this.tableData = list.map((item, index) => ({
          ...item,
          index: this.start + index + 1,
          beginTime: this.formatDate(item.beginTime),
          createTime: this.formatDate(item.createTime),
          endTime: this.formatDate(item.endTime),
        }));
        this.total = data.total;
      });
    },
    refreshBin() {
      this.getRecycleList();
    },
    openCommissonTable() {
      this.$router.push({ name: 'commissionTableMoudle' });
    },
    handleChangePage(page) {
      this.page = page;
      this.getRecycleList();
    },
    onSearch(text) {
      this.page = 1;
      this.searchValue = text;
      this.getRecycleList();
    },
    restoreCommissionTable(data) {
      const { id, code, name } = data;
      ajax('canyin.desktop.financialManagement.pushmoneytable.recyclerevert', {
        contentType: 'URLEncoded',
        data: {
          ids: id,
          codes: code,
          names: name,
        },
      }).then(() => {
        this.getRecycleList();
        this.$message.success(this.$t('Dict.RestoreSuccess'));
      });
    },
    deleteCommissionTable(data) {
      const { id, code, name } = data;
      this.$confirm(this.$t('Biz.UserDesktop.UserDesktopMsg194', [name]), this.$t('Dict.Tips')).then(() => {
        ajax('canyin.desktop.financialManagement.pushmoneytable.recycledelete', {
          contentType: 'URLEncoded',
          data: {
            ids: id,
            codes: code,
            names: name,
          },
        }).then(() => {
          this.getRecycleList();
          this.$message.success(this.$t('Dict.DeleteSuccess'));
        });
      }).catch(() => {

      });
    },
    formatDate(time) {
      return dateFormat('%Y-%M-%D %H:%I:%S', Date.parse(time));
    },
  },
};
</script>

<style lang="less" scoped>
.comission-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  .comission-head {
    .btn-bin {
      position: absolute;
      top: 12px;
      right: 12px;
      background-color: white;
      border: 1px solid #ccc;
    }
  }
  .content-wrapper{
    height:100%;
    .operation {
      position: relative;
      margin-bottom: 5px;
      .search {
        position: absolute;
        top: 0;
        right: 12px;
      }
    }
    .system-table-body {
      height: calc(100% - 79px);
      overflow: hidden;
      div.highlight {
        color: #0096a4;
        cursor: pointer;
      }
      .restore-btn {
        color: #0096a4;
      }
      .delete-btn {
        color: red;
      }
    }
    .footer {
      height: 40px;
      position: relative;
    }
  }
}
</style>
