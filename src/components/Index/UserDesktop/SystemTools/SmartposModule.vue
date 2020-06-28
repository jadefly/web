<template>
  <SystemContent>
    <div class="system-content-head smart-head" slot="head">
      <h3>{{$t('Biz.UserDesktop.SystemTools.STIndexLabel4')}}</h3>
      <p class="pull-right">{{$t('Biz.UserDesktop.SystemTools.SmartposP1')}}</p>
    </div>
    <div class="system-table-body" ref="systemTableBody">
      <el-table :data="tableData" highlight-current-row style="width: 100%">
        <el-table-column
          v-for="(item,index) of tableColumns"
          :key="index"
          :label="item.label"
          :width="item.width"
          :align="item.prop === 'btn' ? 'center' : 'left'"
        >
          <template slot-scope="scope">
            <div v-if="item.prop === 'state'" class="more-text">
              <span :class="['system-status', {'system-van-status-bg': !!scope.row.state}]"></span>
              <span class="middle">{{!!scope.row.state ? `${$t('Biz.UserDesktop.SystemTools.POSUnbindMsg1')}` : `${$t('Dict.FreeState')}`}}</span>
            </div>
            <div v-else-if="item.prop === 'btn'" class="more-text">
              <el-button type="text" size="mini" @click="handleUnBind(scope)">{{$t('Biz.UserDesktop.SystemTools.POSUnbindButton2')}}</el-button>
            </div>
            <div v-else class="more-text">{{scope.row[item.prop]}}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="foot">
      <Pagination :total="total" :limit="limit" @handleChangePage="handleChangePage" :page="page"></Pagination>
    </div>
  </SystemContent>
</template>

<script>
import { debounce } from 'lodash';
import Pagination from '../base/Pagination';
import SystemContent from '../base/SystemContent';
import ajax from '@/common/js/ajax';
import tableColumns from './smartposTableColum';

export default {
  data() {
    return {
      // 移动银台Pos table每列名称
      tableColumns,
      // 移动银台pos table settings
      total: 0,
      limit: 10,
      page: 1,
      tableData: [],
      keyword: '',
      debounceFn: null,
    };
  },
  components: {
    Pagination,
    SystemContent,
  },
  mounted() {
    this.$nextTick(() => {
      this.getSmartPosList();
    });
    this.debounceFn = debounce(() => {
      this.page = 1;
      this.keyword = '';
      this.getSmartPosList();
    }, 500);
    window.addEventListener('resize', this.debounceFn, false);
  },
  computed: {
    keybordParams() {
      return {};
    }
  },
  beforeRouteLeave(to, from, next) {
    window.removeEventListener('resize', this.debounceFn, false);
    next();
  },
  methods: {
    getSmartPosList() {
      this.limit = Math.floor(
        (this.$refs.systemTableBody.clientHeight - 32) / 65
      );
      ajax('canyin.desktop.systemtools.bizmobilesnacklock', {
        params: {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          searchKey: this.keyword,
        },
      }).then((data) => {
        this.total = data.total;
        this.tableData = data.root.map((item, index) => {
          return {
            index: (this.page - 1) * this.limit + index + 1,
            ...item,
          };
        });
      });
    },
    handleUnBind(scope) {
      const { row } = scope;
      if (!row.devid) {
        this.$message.error(`POS${row.code}-${row.name}${this.$t('Biz.UserDesktop.SystemTools.SmartposMsg3')}`);
        return;
      }
      const text = this.$t('Biz.UserDesktop.SystemTools.POSUnbindMsg4', [row.code, row.name, row.devcode]);
      this.$confirm(text, {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        showCancelButton: true, // 是否显示取消按钮
        type: 'warning',
        showClose: true, // 是否显示关闭按钮
        closeOnClickModal: true, // 点击遮罩是否关闭
        closeOnPressEscape: true, // esc是否关闭
      }).then(() => {
        this.handleUnBindRequest(row);
      });
    },
    handleUnBindRequest(row) {
      ajax('canyin.desktop.systemtools.smartunbind', {
        contentType: 'URLEncoded',
        data: {
          posIds: row.id,
        },
      }).then((data) => {
        if (data) {
          this.$message.success(this.$t('Biz.UserDesktop.SystemTools.POSUnbindMsg7'));
          this.getSmartPosList();
        }
      });
    },
    handleChangePage(page) {
      this.page = page;
      this.getSmartPosList();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.smart-head {
  h3{
    display: inline;
  }
  .pull-right{
    color: #f5222d;
    line-height: 56px;
    padding-right: 24px;
  }
}
.system-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .system-unbind {
    color: #5584ff;
    background-color: #fff;
    border: 1px solid #5584ff;
    border-radius: 4px;
    padding: 4px 15px;
  }
  .system-status {
    background-color: #56d68f;
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .system-van-status-bg {
    background-color: #f5222d !important;
  }
  .keyword-input {
    width: 380px;
  }
  .system-table-body {
    height: 100%;
  }
  .middle {
    vertical-align: middle;
  }
  .more-text {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
