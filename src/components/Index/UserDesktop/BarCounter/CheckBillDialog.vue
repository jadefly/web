<template>
  <Dialog
          name="BarCounter.CheckBillDetails"
          :title="$t('Biz.UserDesktop.InventorySheetDetails')"
          ref="dialog"
          width="900px"
          height="600px"
          :hotkeys="hotKeySet"
          :showSubmit="false"
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
            <strong>{{$t('Biz.UserDesktop.InventoryDocumentNo')}}</strong>
            <span>{{makeStockData.code}}</span>
          </li>
          <li>
            <strong>{{$t('Biz.UserDesktop.StocktakingPerson')}}</strong>
            <span>{{makeStockData.makeStockEmpName}}</span>
          </li>
        </ul>
          <Search class="pull-right search" @onSearch="onSearch"
                  :placeholder="$t('Biz.UserDesktop.UserDesktopMsg005')"></Search>
      </div>
      <div class="bar-dialog-content">
        <!-- 盘点单详细信息Table，isEditAble设置为false只能查看，不能修改 -->
        <checkBillTable :tableData="tableData" :isEditAble="false"></checkBillTable>
      </div>
      <div class="bar-dialog-foot ckbill-dialog-footer">
        <ul class="bar-dialog-info">
          <li>
            <strong>{{$t('Biz.UserDesktop.InventoryPeriod')}}</strong>
            <span>
              {{
                makeStockData.origMakeStockTime | tDateFormat
              }} ~~ {{
                makeStockData.makeStockTime | tDateFormat
              }}</span>
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import {mapGetters} from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import checkBillTable from './CheckBillTable';
import Search from '@/components/Index/UserDesktop/base/Search';
import dateFormatMixin from '@/common/js/dateFormatMixin';

export default {
  components: { Dialog, checkBillTable, Search },
  mixins: [DialogMixin, dateFormatMixin],
  props: {
    // 盘点单明细table绑定数据
    tableData: {
      type: Array,
      default() {
        return [];
      },
    },
    // 盘点单整单数据
    makeStockData: {
      type: Object,
      default() {
        return {};
      },
    },
    // 查询盘点单详细信息
    CheckBillDetails: {
      type: Function,
    },
  },
  computed: {
    ...mapGetters(['deskPageBaseInfo']),
    hotKeySet() {
      return {
        PgDn: () => {},
      };
    },
  },
  methods: {
    // 搜索框查询盘点单详情
    onSearch(val) {
      this.CheckBillDetails(this.makeStockData, val);
    },
    getExportUrl() {
      const { id } = this.makeStockData;
      const { HTTP_CONTEXTPATH } = this.deskPageBaseInfo;
      return `${HTTP_CONTEXTPATH}/canyin/desktop/bizbmsstockdetail/export?makeStockId=${id}`;
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
.ckbill-dialog-footer {
  padding-left: 15px;
  > ul {
    color: #888;
    font-size: 14px;
  }
}
</style>
