<template>
  <Dialog
          name="BarCounter.Transfer"
          :title="$t('Biz.UserDesktop.DrawingAndDrawingList')"
          ref="dialog"
          width="900px"
          height="600px"
          :hotkeys="hotKeySet"
          :showSubmit="!transfer || !transfer.isTakeStock"
          @open="onOpen"
          @submit="saveTransfer"
  >
    <template slot="other-button" v-if="transfer">
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
        <ul class="bar-dialog-info" v-if="transfer">
          <li>
            <strong>{{$t('Biz.UserDesktop.RequisitionNo')}}</strong>
            <span>{{ transfer.code }}</span>
          </li>
          <li>
            <strong>{{$t('Biz.UserDesktop.LeadTime')}}</strong>
            <span>{{ transfer.modifyTime | tDateFormat }}</span>
          </li>
          <li>
            <strong>{{$t('Biz.UserDesktop.Leader')}}</strong>
            <span>{{ transfer.modifierName }}</span>
          </li>
        </ul>
        <Search
                class="pull-right search"
                ref="transferSearch"
                @onSearch="onSearch"
                :placeholder="$t('Biz.UserDesktop.UserDesktopMsg001')"
        ></Search>
      </div>
      <div class="bar-dialog-content">
        <el-table
          :data="items"
          :row-class-name="tableRowClassName"
          height="100%"
          style="width: 100%;"
          class="bar-dialog-table"
        >
            <el-table-column prop="itemName" :label="$t('Dict.ItemName')"></el-table-column>
            <el-table-column prop="unitName" :label="$t('Dict.UnitName')"></el-table-column>
            <el-table-column prop="sizeName" :label="$t('Dict.SizeName')"></el-table-column>
            <el-table-column prop="bmsNum" :label="$t('Biz.Order.ExistingNumTabel')"
                             align="right"></el-table-column>
            <el-table-column :label="$t('Biz.UserDesktop.AllocationQuantity')" width="200" align="center">
            <template slot-scope="scope">
              <template v-if="transfer && transfer.isTakeStock">
                {{ scope.row.allotQty }}
              </template>
              <el-input-number
                v-model="scope.row.num"
                controls-position="right"
                :min="0"
                :max="1000"
                :numPrecision="2"
                v-else
              ></el-input-number>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="bar-dialog-foot">
          <label for="barTransferRemark">{{$t('Dict.Remarkss')}}</label>
        <p v-if="transfer && transfer.isTakeStock">{{ transfer.remark }}</p>
        <el-input
          type="textarea"
          id="barTransferRemark"
          v-model="remark"
          :rows="2"
          resize="none"
          v-else
        ></el-input>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  extend, filter, includes, map,
} from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Search from '@/components/Index/UserDesktop/base/Search';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog, Search },
  mixins: [DialogMixin, dateFormatMixin],
  data() {
    return {
      transfer: null,
      itemList: [],
      remark: '',
      searchText: '',
    };
  },
  computed: {
    ...mapGetters(['deskPageBaseInfo']),
    hotKeySet() {
      return {
        PgDn: () => {
          if (!this.transfer || !this.transfer.isTakeStock) {
            this.saveTransfer();
          }
        },
      };
    },
    items() {
      if (this.searchText === '') {
        return this.itemList;
      }
      return filter(this.itemList, (data) => {
        const t = this.searchText.toLowerCase();
        const name = data.itemName.toLowerCase();
        const code = data.itemCode.toLowerCase();
        const pinyin = data.pinyin.toLowerCase();
        return includes(name, t)
          || includes(code, t)
          || includes(pinyin, t);
      });
    },
  },
  methods: {
    onSearch(value) {
      this.searchText = value;
    },
    onOpen() {
      this.searchText = '';
      this.$refs.transferSearch.clearSearchText();
      const { bmsAllot, itemList } = this.resData;
      if (bmsAllot) {
        this.transfer = bmsAllot;
        this.remark = bmsAllot.remark;
      } else {
        this.transfer = null;
        this.remark = '';
      }
      this.itemList = map(itemList, item => extend({}, item, {
        num: item.allotQty,
      }));
    },
    onClose() {
      this.searchText = '';
      this.$refs.transferSearch.clearSearchText();
      this.remark = '';
    },
    saveTransfer() {
      const itemDetail = JSON.stringify(map(this.itemList, item => ({
        itemId: item.itemId,
        sizeId: item.sizeId,
        allotQty: item.num,
      })));
      const { remark, transfer } = this;
      ajax(`canyin.desktop.bizbmsallot.${transfer ? 'update' : 'insert'}`, {
        contentType: 'json',
        data: transfer ? {
          id: transfer.id,
          itemDetail,
          remark,
        } : {
          itemDetail,
          remark,
        },
      }).then(() => {
        this.submit();
        this.close();
      });
    },
    tableRowClassName({ row }) {
      if (row.num !== row.allotQty) {
        return 'change-row';
      }
      return '';
    },
    getExportUrl() {
      const { id } = this.transfer;
      const { HTTP_CONTEXTPATH } = this.deskPageBaseInfo;
      return `${HTTP_CONTEXTPATH}/canyin/desktop/bizbmsallot/export?allotId=${id}`;
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
