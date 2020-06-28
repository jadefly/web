<template>
  <div class="comission-wrapper">
    <SystemContent>
      <div class="system-content-head comission-head" slot="head">
        <h3>{{$t('Biz.UserDesktop.Royaltylist')}}</h3>
        <button class="btn btn-bin" @click="openRecycleBin">{{$t('Dict.recycleBin')}}</button>
      </div>
      <div class="content-wrapper">
        <div class="operation">
          <button class="btn btn-primary" @click="createComissionTable">+
            {{$t('Biz.UserDesktop.AddCommissionTable')}}
          </button>
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
              :min-width="item.minwidth"
              align="center"
              class-name="no-wrap"
            >
              <template slot-scope="scope">
                {{ scope.row[item.prop] === null ? '-' : scope.row[item.prop] }}
              </template>
            </el-table-column>
            <el-table-column v-if="tableColumns && tableColumns.length > 0" :label="$t('Dict.Operation')" align="center" fixed='right' width='120'>
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  class="highlight"
                  @click="checkCommissionTable(scope.row)"
                >{{ $t('Dict.See') }}</el-button>
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
import Pagination from '@/components/Index/UserDesktop/base/Pagination';
import tableColumns from './commissionTableColumns';

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
      searchValue: null,
      tableData: [],
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.page = 1;
      vm.getCommissionTable();
    });
  },
  computed: {
    start() {
      return (this.page - 1) * this.limit;
    },
  },
  methods: {
    getCommissionTable() {
      this.limit = Math.floor((this.$refs.systemTableBody.clientHeight - 48) / 53);
      ajax('canyin.desktop.financialManagement.pushmoneytable.list', {
        contentType: 'URLEncoded',
        data: {
          start: this.start,
          limit: this.limit > 0 ? this.limit : 0,
          searchValue: this.searchValue,
        },
      }).then((data) => {
        if (data.datalist.length === 0 && data.total > 0 && this.page > 1) {
          this.page = this.page - 1;
          this.getCommissionTable();
          return;
        }
        this.tableData = data.datalist.map((item, index) => ({
          ...item,
          index: this.start + index + 1,
          beginTime: this.formatDate(item.beginTime),
          createTime: this.formatDate(item.createTime),
          endTime: this.formatDate(item.endTime),
        }));
        this.total = data.total;
      });
    },
    createComissionTable() {
      this.$router.push({
        name: 'createCommissionTableMoudle',
        query: { isCreate: true },
      });
    },
    checkCommissionTable(item) {
      const { id } = item;
      this.$router.push({
        name: 'createCommissionTableMoudle',
        query: {
          isCreate: false,
          id,
        },
      });
    },
    openRecycleBin() {
      this.$router.push({ name: 'recycleBinModule' });
    },
    handleChangePage(page) {
      this.page = page;
      this.getCommissionTable();
    },
    onSearch(text) {
      this.page = 1;
      this.searchValue = text;
      this.getCommissionTable();
    },
    deleteCommissionTable(data) {
      const { id, code, name } = data;
      this.$confirm(this.$t('Biz.UserDesktop.UserDesktopMsg193', [name]), this.$t('Dict.Tips')).then(() => {
        ajax('canyin.desktop.financialManagement.pushmoneytable.deletes', {
          contentType: 'URLEncoded',
          data: {
            ids: id,
            codes: code,
            names: name,
          },
        }).then(() => {
          this.getCommissionTable();
          this.$message.success(this.$t('Dict.DeleteSuccess'));
        });
      }).catch(() => {

      });
    },
    formatDate(time) {
      if (time) {
        return dateFormat('%Y-%M-%D %H:%I:%S', Date.parse(time));
      }
      return '';
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
