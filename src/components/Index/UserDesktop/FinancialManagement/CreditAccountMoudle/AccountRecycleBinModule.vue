<template>
  <div class="comission-wrapper">
    <SystemContent>
      <div class="system-content-head comission-head" slot="head">
        <h3>{{$t('Dict.recycleBin')}}</h3>
        <button class="btn btn-bin" @click="openCreditAccountTable">{{$t('Dict.LedgerAccount')}}</button>
      </div>
      <div class="content-wrapper">
        <div class="operation">
          <button class="btn btn-primary" @click="refreshBin">{{$t('Dict.Btn.Refresh')}}</button>
          <Search class="search" @onSearch="onSearch" :placeholder="$t('Dict.Search')"></Search>
        </div>
        <div class="system-table-body" ref="systemTableBody">
          <el-table
            :data="tableData"
            highlight-current-row
            style="width: 100%">
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
                  <div v-if="item.prop === 'isEnable'">
                    <span :class="['status', {'not-use': scope.row.isEnable === false}]">
                      {{ scope.row.isEnable === false ? $t('Dict.Deactivated') : $t('Dict.Enable')}}
                    </span>
                  </div>
                  <div v-else>
                    {{ scope.row[item.prop] === null || scope.row[item.prop] === '' ? '-' : scope.row[item.prop] }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('Dict.Operation')"
                align="center"
                class-name="no-wrap"
                width="150"
                fixed="right">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" class="restore-btn"
                  @click="restoreAccountTable(scope.row)">{{$t('Dict.Reduction')}}</el-button>
                  <el-button size="mini" type="text" class="delete-btn"
                  @click="deleteAccountTable(scope.row)">{{$t('Dict.Delete')}}</el-button>
                </template>
              </el-table-column>
          </el-table>
        </div>
        <div slot="foot" class="footer">
          <Pagination :total="total" :limit="pageSize" :page="pageNum"
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
import tableColumns from './accountTableColumns';
import Pagination from '@/components/Index/UserDesktop/base/Pagination';

export default {
  components: {
    SystemContent, Search, Pagination,
  },
  data() {
    return {
      // 分页查询参数
      total: 0,
      pageNum: 0,
      pageSize: 0,
      // 回收站列表绑定数据
      tableData: [],
      tableColumns: tableColumns(),
      // 查询框数据
      content: null,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.pageNum = 1;
      vm.getRecycleList();
    });
  },
  methods: {
    // 刷新
    refreshBin() {
      this.getRecycleList();
    },
    // 搜索
    onSearch(text) {
      this.pageNum = 1;
      this.content = text;
      this.getRecycleList();
    },
    // 查询回收站列表数据
    getRecycleList() {
      this.pageSize = Math.floor((this.$refs.systemTableBody.clientHeight - 48) / 53);
      ajax('canyin.desktop.financialManagement.unpaidperson.recyclelist', {
        contentType: 'URLEncoded',
        data: {
          pageNum: this.pageNum,
          pageSize: this.pageSize > 0 ? this.pageSize : 0,
          content: this.content,
        },
      }).then((data) => {
        const { list } = data;
        if (list.length === 0 && this.total > 0 && this.pageNum > 1) {
          this.pageNum = this.pageNum - 1;
          this.getRecycleList();
          return;
        }
        this.tableData = list.map((item, index) => ({
          ...item,
          index: ((this.pageNum - 1) * this.pageSize) + index + 1,
        }));
        this.total = data.total;
      });
    },
    // 处理分页
    handleChangePage(page) {
      this.pageNum = page;
      this.getRecycleList();
    },
    // 返回挂账账户
    openCreditAccountTable() {
      this.$router.push({ name: 'creditAccountMoudle' });
    },
    // 还原
    restoreAccountTable(item) {
      ajax('canyin.desktop.financialManagement.unpaidperson.recyclerevert', {
        contentType: 'URLEncoded',
        data: {
          ids: item.id,
          codes: item.code,
          names: item.name,
        },
      }).then(() => {
        this.getRecycleList();
        this.$message.success(this.$t('Dict.RestoreSuccess'));
      });
    },
    // 删除
    deleteAccountTable(item) {
      this.$confirm(this.$t('Biz.UserDesktop.UserDesktopMsg194', [item.name]), this.$t('Dict.Tips')).then(() => {
        ajax('canyin.desktop.financialManagement.unpaidperson.recycledelete', {
          contentType: 'URLEncoded',
          data: {
            ids: item.id,
            codes: item.code,
            names: item.name,
          },
        }).then(() => {
          this.getRecycleList();
          this.$message.success(this.$t('Dict.DeleteSuccess'));
        });
      }).catch(() => {

      });
    },
  },
};
</script>

<style lang="less" scoped>
.comission-wrapper{
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
      .status::before {
        content: '';
        background-color: #56d68f;
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .not-use::before {
        background-color: #f5222d;
      }
    }
    .footer {
      height: 40px;
      position: relative;
    }
  }
}
</style>
