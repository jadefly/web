<template>
  <Dialog
          name="BarCounter.NewCheck"
          :title="$t('Dict.Inventory')"
          ref="dialog"
          width="900px"
          height="600px"
          :hotkeys="hotKeySet"
          :showSubmit="true"
          :submitText="$t('Dict.Preservation')"
          @open="onOpen"
          @submit="onSubmit"
  >
    <template slot="other-button">
      <button
        type="button"
        class="btn btn-default bar-dialog-top-button"
        @click="exportItem"
      >{{$t('Dict.Export')}}</button>
      <button
        type="button"
        class="btn btn-default bar-dialog-top-button"
        @click="printItem"
      >{{$t('Dict.Printing')}}</button>
    </template>
    <div class="bar-dialog-wrap">
      <div class="bar-dialog-head">
        <ul class="bar-dialog-info">
          <li>
            <el-checkbox v-model="checked">{{$t('Biz.UserDesktop.UserDesktopMsg010')}}</el-checkbox>
          </li>
        </ul>
        <Search
                class="pull-right search"
                @onSearch="onSearch"
                :placeholder="$t('Biz.UserDesktop.UserDesktopMsg011')"
                ref="ckSearch"
          ></Search>
      </div>
      <div class="bar-dialog-content">
        <!-- 盘点品项Table -->
        <checkBillTable :tableData="tableListData" :isShowZero="checked"></checkBillTable>
      </div>
      <div class="bar-dialog-foot ck-dialog-footer">
        <ul class="bar-dialog-info">
          <li>
            <p v-if="beginTime">{{$t('Biz.UserDesktop.InventoryPeriod')}}{{
              beginTime | tDateFormat
                }} {{$t('Dict.To')}} {{
              endTime | dateFormat
            }}</p>
          </li>
          <li class="pull-right">
            <span>{{$t('Biz.UserDesktop.UserDesktopMsg007')}}</span>
            <span>{{$t('Biz.UserDesktop.UserDesktopMsg008')}}</span>
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { each, filter, includes } from 'lodash';
import checkBillTable from './CheckBillTable';
import Search from '@/components/Index/UserDesktop/base/Search';
import ajax from '@/common/js/ajax';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: {
    checkBillTable,
    Search,
    Dialog,
  },
  mixins: [dateFormatMixin, DialogMixin],
  data() {
    return {
      tableData: [], // 盘点Table绑定数据
      searchParams: '', // 查询参数
      checked: true, // 控制“显示销售、领用、调拨为0的品项”CheckBox勾选状态
      beginTime: '', // 盘点时间段-开始时间
      endTime: '', // 盘点时间段-结束时间
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.setHotKey();
    });
  },
  computed: {
    ...mapGetters(['deskPageBaseInfo']),
    // 根据品项名称、代码过滤品项，为保证品项全部盘点，过滤在前端做
    tableListData() {
      if (this.searchParams === '') {
        return this.tableData;
      }
      return filter(this.tableData, (data) => {
        const t = this.searchParams.toLowerCase();
        const name = data.itemName.toLowerCase();
        const code = data.itemCode.toLowerCase();
        return includes(name, t)
          || includes(code, t);
      });
    },
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    // 对话框打开
    onOpen() {
      this.resetData();
    },
    // 重置数据
    resetData() {
      this.checked = true;
      this.searchParams = '';
      this.$refs.ckSearch.clearSearchText();
      this.getTableData();
    },
    // 获取盘点数据
    getTableData() {
      ajax('canyin.desktop.bizbmsmakestock.findstocktakingtime').then((data) => {
        const { stocktakingTime } = data;
        this.beginTime = stocktakingTime || '';
        this.endTime = stocktakingTime ? new Date() : '';
      });
      ajax('canyin.desktop.bizbmsmakestock.list').then((data) => {
        this.tableData = data;
      });
    },
    // 保存盘点之前校验
    validateTableData() {
      let status = true;
      each(this.tableData, (item) => {
        if (item.diffQty !== 0 && !item.remark) {
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg012'));
          status = false;
          return false;
        }
        return true;
      });
      return status;
    },
    // 输入品项名称、拼音查询盘点Table
    onSearch(val) {
      this.searchParams = val;
    },
    // 保存盘点数据
    onSubmit() {
      if (this.tableData.length) {
        if (this.validateTableData()) {
          ajax('canyin.desktop.bizbmsmakestock.update', {
            contentType: 'URLEncoded',
            data: {
              makeStockDetail: JSON.stringify(this.tableData),
            },
          }).then((data) => {
            if (data.success) {
              this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg013'));
              this.submit();
              this.close();
            } else {
              this.$message.error(data.msg);
            }
          });
        }
      } else {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg004')
);
      }
    },
    getExportUrl() {
      const { HTTP_CONTEXTPATH } = this.deskPageBaseInfo;
      return `${HTTP_CONTEXTPATH}/canyin/desktop/bizbmsmakestock/export`;
    },
    printItem() {
      if (this.tableData.length) {
        const url = this.getExportUrl();
        this.$devices.XLSPrint.print(url);
      }
    },
    exportItem() {
      if (this.tableData.length) {
        window.open(this.getExportUrl());
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ck-dialog-footer {
  padding-left: 15px;
  > ul {
    width: 100%;
    color: #888;
    font-size: 14px;
  }
}
</style>
