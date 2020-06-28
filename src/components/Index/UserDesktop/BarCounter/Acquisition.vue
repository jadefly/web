<template>
  <Dialog
          name="BarCounter.Acquisition"
          :title="$t('Biz.UserDesktop.RequisitionList')"
          ref="dialog"
          width="900px"
          height="600px"
          :hotkeys="hotKeySet"
          :showSubmit="!acquisition || !acquisition.isTakeStock"
          @open="onOpen"
          @onClose="onClose"
          @submit="saveAcquisition"
  >
    <template slot="other-button" v-if="acquisition">
      <button
        type="button"
        class="btn btn-default bar-dialog-top-button"
        @click="exportItem"
      >{{$t('Dict.Export')}}
      </button>
      <button
        type="button"
        class="btn btn-default bar-dialog-top-button"
        @click="printItem"
      >{{$t('Dict.Printing')}}</button>
    </template>
    <div class="bar-dialog-wrap">
      <div class="bar-dialog-head">
        <ul class="bar-dialog-info" v-if="acquisition">
          <li>
            <strong>{{$t('Biz.UserDesktop.RequisitionNo')}}</strong>
            <span>{{ acquisition.code }}</span>
          </li>
          <li>
            <strong>{{$t('Biz.UserDesktop.LeadTime')}}</strong>
            <span>{{ acquisition.modifyTime | tDateFormat }}</span>
          </li>
          <li>
            <strong>{{$t('Biz.UserDesktop.Leader')}}</strong>
            <span>{{ acquisition.modifierName }}</span>
          </li>
        </ul>
        <Search
                class="pull-right search"
                ref="acquisitionSearch"
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
          <el-table-column :label="$t('Biz.UserDesktop.NumberOfRecipients')" width="200" align="center">
            <template slot-scope="scope">
              <template v-if="acquisition && acquisition.isTakeStock">
                {{ scope.row.receiveQty }}
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
        <label for="barAcquisitionRemark">{{$t('Dict.Remarkss')}}</label>
        <p v-if="acquisition && acquisition.isTakeStock">{{ acquisition.remark }}</p>
        <el-input
          type="textarea"
          id="barAcquisitionRemark"
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
extend, filter, includes, map
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
      acquisition: null,
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
          if (!this.acquisition || !this.acquisition.isTakeStock) {
            this.saveAcquisition();
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
      this.$refs.acquisitionSearch.clearSearchText();
      const { bmsReceive, itemList } = this.resData;
      if (bmsReceive) {
        this.acquisition = bmsReceive;
        this.remark = bmsReceive.remark;
      } else {
        this.acquisition = null;
        this.remark = '';
      }
      this.itemList = map(itemList, item => extend({}, item, {
        num: item.receiveQty,
      }));
    },
    onClose() {
      this.searchText = '';
      this.$refs.acquisitionSearch.clearSearchText();
      this.remark = '';
    },
    saveAcquisition() {
      const itemDetail = JSON.stringify(map(this.itemList, item => ({
        itemId: item.itemId,
        sizeId: item.sizeId,
        receiveQty: item.num,
      })));
      const { remark, acquisition } = this;
      ajax(`canyin.desktop.bizbmsreceive.${acquisition ? 'update' : 'insert'}`, {
        contentType: 'json',
        data: acquisition ? {
          id: acquisition.id,
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
      if (row.num !== row.receiveQty) {
        return 'change-row';
      }
      return '';
    },
    getExportUrl() {
      const { id } = this.acquisition;
      const { HTTP_CONTEXTPATH } = this.deskPageBaseInfo;
      return `${HTTP_CONTEXTPATH}/canyin/desktop/bizbmsreceive/export?receiveId=${id}`;
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
