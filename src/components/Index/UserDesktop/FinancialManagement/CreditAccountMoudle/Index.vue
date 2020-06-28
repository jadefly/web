<template>
  <SystemContent>
    <div class="system-content-head comission-head" slot="head">
      <h3>{{$t('Dict.LedgerAccount')}}</h3>
      <button class="btn btn-bin" @click="openRecycleBin">{{$t('Dict.recycleBin')}}</button>
    </div>
    <div class="credit-account-warpper">
      <div class="header">
        <button class="btn btn-primary" @click="createAccount">+ {{$t('Dict.NewAccount')}}</button>
        <Search class="search" @onSearch="onSearch"></Search>
      </div>
      <div class="system-table-body" ref="systemTableBody">
        <el-table
          ref="accountTable"
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
            >
              <template slot-scope="scope">
                <div v-if="item.prop === 'isEnable'">
                  <span :class="['status', {'not-use': scope.row.isEnable === false}]">
                    {{ scope.row.isEnable === false ? $t('Dict.Deactivated') : $t('Dict.Enable')}}
                  </span>
                </div>
                <div v-else>
                  {{ scope.row[item.prop] === '' ? '-' : scope.row[item.prop] }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('Dict.Operation')"
              align="center"
              width="260"
              class-name="no-wrap"
            >
              <template slot-scope="scope">
                <el-button size="mini" type="text"
                @click="stopAccount(scope.row)">
                  {{ scope.row.isEnable === false ? $t('Dict.Enable') : $t('Dict.DiscontinueUse') }}
                </el-button>
                <el-button size="mini" type="text"
                           @click="deleteAccount(scope.row)">{{$t('Dict.Delete')}}
                </el-button>
                <el-button size="mini" type="text"
                           @click="modifyAccount(scope.row)">{{$t('Dict.Modify')}}
                </el-button>
                <el-button size="mini" type="text"
                           @click="repayAccount(scope.row)">{{$t('Dict.DebtRepayment')}}
                </el-button>
              </template>
            </el-table-column>
        </el-table>
      </div>
      <div slot="foot" class="footer">
        <Pagination :total="total" :limit="limit" :page="page"
        @handleChangePage="handleChangePage"></Pagination>
      </div>
      <CreateAccountDialog
        ref="accountDialog"
        :accountData="accountData"
        @operateAccountSuccess="getAccountList"
      ></CreateAccountDialog>
    </div>
  </SystemContent>
</template>

<script>
import { debounce } from 'lodash';
import { mapMutations } from 'vuex';
import SystemContent from '@/components/Index/UserDesktop/base/SystemContent';
import tableColumns from './accountTableColumns';
import CreateAccountDialog from './CreateAccountDialog';
import Search from '@/components/Index/UserDesktop/base/Search';
import Pagination from '@/components/Index/UserDesktop/base/Pagination';
import ajax from '@/common/js/ajax';

export default {
  components: {
    SystemContent, Search, Pagination, CreateAccountDialog,
  },
  data() {
    return {
      total: 0,
      limit: 10,
      page: 1,
      tableColumns: tableColumns(),
      debounceFn: null,
      searchText: '',
      tableData: [],
      accountData: {},
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getAccountList();
      vm.setCreditAccount(null);
    });
  },
  beforeRouteLeave(to, from, next) {
    window.removeEventListener('resize', this.debounceFn, false);
    next();
  },
  mounted() {
    this.debounceFn = debounce(() => {
      this.page = 1;
      this.getAccountList();
    }, 500);
    window.addEventListener('resize', this.debounceFn, false);
  },
  computed: {
    start() {
      return (this.page - 1) * this.limit;
    },
  },
  methods: {
    getAccountList() {
      this.limit = Math.floor((this.$refs.systemTableBody.clientHeight - 48) / 53);
      ajax('canyin.desktop.financialManagement.unpaidperson.list', {
        contentType: 'json',
        data: {
          start: this.start,
          limit: this.limit > 0 ? this.limit : 0,
          params: { nameLike: this.searchText },
        },
      }).then((data) => {
        if (data.list.length === 0 && data.total > 0 && this.page > 1) {
          this.page = this.page - 1;
          this.getAccountList();
          return;
        }
        this.tableData = data.list.map((item, index) => ({
          index: this.start + index + 1,
          ...item,
        }));
        this.total = data.total;
        this.isOpenUnpaidBill = data.isOpenUnpaidBill; // 有无挂账还款权限
      });
    },
    deleteAccount(data) {
      const { id, code, name } = data;
      this.$confirm(this.$t('Biz.UserDesktop.UserDesktopMsg193', [name]), this.$t('Dict.Tips')).then(() => {
        ajax('canyin.desktop.financialManagement.unpaidperson.deletes', {
          contentType: 'URLEncoded',
          data: {
            ids: id,
            codes: code,
            names: name,
          },
        }).then((datanow) => {
          if (datanow.success) {
            this.getAccountList();
            this.$message.success(this.$t('Dict.DeleteSuccess'));
          }
        });
      }).catch(() => {

      });
    },
    stopAccount(data) {
      const isEnableStr = data.isEnable === false ? '1' : '0';
      ajax('canyin.desktop.financialManagement.unpaidperson.changeuseunpaid', {
        contentType: 'URLEncoded',
        data: {
          unpaidIdStr: data.id,
          isEnableStr,
        },
      }).then(() => {
        this.getAccountList();
        this.$message.success(this.$t('Dict.OperationSucceeded'));
      });
    },
    createAccount() {
      ajax('canyin.desktop.financialManagement.unpaidperson.loadnew')
        .then((data) => {
          this.accountData = data;
          this.$refs.accountDialog.open();
        });
    },
    modifyAccount(data) {
      ajax('canyin.desktop.financialManagement.unpaidperson.load', {
        contentType: 'URLEncoded',
        data: { id: data.id },
      }).then((datanow) => {
        this.accountData = datanow;
        this.$refs.accountDialog.open();
      });
    },
    repayAccount(data) {
      if (this.isOpenUnpaidBill) {
        const { id, name } = data;
        this.setCreditAccount({ id, name });
        this.$parent.changeActive('creditRepayMoudle');
      } else {
        this.$alert(this.$t('Biz.UserDesktop.UserDesktopMsg070'), this.$t('Dict.Tips'));
      }
    },
    openRecycleBin() {
      this.$router.push({ name: 'accountRecycleBinModule' });
    },
    onSearch(text) {
      this.page = 1;
      this.searchText = text;
      this.getAccountList();
    },
    handleChangePage(page) {
      this.page = page;
      this.getAccountList();
    },
    ...mapMutations({
      setCreditAccount: 'SET_CREDIT_ACCOUNT',
    }),
  },
};
</script>

<style lang="less" scoped>
.comission-head {
  .btn-bin {
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: white;
    border: 1px solid #ccc;
  }
}
.credit-account-warpper {
  position: relative;
  width: 100%;
  height: 100%;
  .header {
    position: relative;
    padding: 12px;
    height: 60px;
    > .search {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }
  .system-table-body {
    height: calc(100% - 100px);
    overflow: hidden;
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

</style>

<style lang="less">
.credit-account-warpper {
  .footer .page-context {
    position: absolute;
    top: 5px;
    right: 12px;
  }
}
</style>
