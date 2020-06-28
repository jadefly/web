<template>
  <SystemContent :title="$t('Dict.TerminalIP')">
    <div class="posiplogin-content" ref="systemTableBody">
      <el-table
        highlight-current-row
        :data="ipList"
        style="width: 100%"
      >
        <el-table-column
          prop="loginIp"
          label="IP"
        ></el-table-column>
        <el-table-column
          prop="point"
          :label="$t('Biz.UserDesktop.SystemTools.PosIpLoginLabel1')"
        ></el-table-column>
        <el-table-column :label="$t('Dict.Operation')">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="kickout(scope.row.loginIp)">
              {{$t('Biz.UserDesktop.SystemTools.PosIpLoginButton1')}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="foot">
      <Pagination
        :total="total"
        :limit="limit"
        @handleChangePage="handleChangePage"
        :page="page"
      ></Pagination>
    </div>
  </SystemContent>
</template>

<script>
import { debounce } from 'lodash';
import SystemContent from '../base/SystemContent';
import Pagination from '../base/Pagination';
import ajax from '@/common/js/ajax';

export default {
  components: {
    SystemContent,
    Pagination,
  },
  data() {
    return {
      total: 0,
      limit: 10,
      page: 1,
      ipList: [],
      debounceFn: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.getIpList();
    });
    this.debounceFn = debounce(() => {
      this.page = 1;
      this.keyword = '';
      this.getIpList();
    }, 500);
    window.addEventListener('resize', this.debounceFn, false);
  },
  methods: {
    getIpList() {
      this.limit = Math.floor(this.$refs.systemTableBody.clientHeight / 65);
      ajax('canyin.sys.ip.getloginiplist', {
        params: {
          pageSize: this.limit,
          pageNum: this.page,
        },
      }).then((data) => {
        this.total = data.total;
        this.ipList = data.root;
      });
    },
    handleChangePage(page) {
      this.page = page;
      this.getIpList();
    },
    kickout(ip) {
      ajax('canyin.sys.ip.kickout', {
        params: { ip },
      }).then(() => {
        this.$message.success(this.$t('Dict.OperationSucceeded'));
        this.getIpList();
      });
    },
  },
  destroyed() {
    window.removeEventListener('resize', this.debounceFn, false);
  },
};
</script>

<style scoped>
.posiplogin-content {
  height: 100%;
}
</style>
