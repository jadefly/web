<template>
<!-- title 增加临时品项 -->
  <Dialog
    name="PosDialog.ItemTemp"
    :title="$t('Biz.Order.AddTempItems')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    width="680px"
    height="710px"
    top="4vh"
    :hotkeys="hotKeySet"
    :submitId="'itemTempSubmit_' + testId"
  >
    <div class="pos-dialog-content pos-ordering-itemtemp-wrapper">
      <TableInfo :infoData="infoData"></TableInfo>
      <el-form
        label-width="60px"
        :inline="true"
        :model="formItemTemp"
        :disabled="!createOperAuth"
      >
        <el-form-item :label="$t('Dict.NameLabel')" class="line">
          <el-input
            ref="tempItemName"
            id="tempItemName"
            v-model="formItemTemp.name"
            @focus="selectAllText($event)"
          ></el-input>
          <button
            type="button"
            class="btn btn-default"
            v-hideHandwritingBoard
            :disabled="!createOperAuth"
            :style="{ 'cursor': createOperAuth ? '' : 'not-allowed' }"
            @click="handWriting"
          >
            <i class="icon icon-edit"></i>
            <!-- 手写板 -->
            <span>{{ $t('Dict.WritingPad') }}</span>
          </button>
          <el-checkbox
            v-if="formItemTemp.isSelectWeighItem && showComfirmWeight"
            v-model="formItemTemp.isConfirmWeigh"
            class="margin-left-20"
          >{{ $t('Dict.Btn.ConfirmWeight') }}</el-checkbox>
          <button
            type="button"
            class="btn btn-default btnMarLeft"
            @click="backspace">
            <span>退格</span>
          </button>
        </el-form-item>
        <!-- 单位： -->
        <el-form-item :label="`${$t('Dict.UnitName')}：`">
          <button type="button" class="btn btn-default unit" @click="openUnitDialog" :disabled="!createOperAuth" :style="{cursor:(createOperAuth ? '':'not-allowed')}">
            <span>{{ formItemTemp.unitName }}</span>
          </button>
          <!-- <el-select v-model="formItemTemp.unitId" value-key="unitName">
            <el-option v-for="item in itemUnits" :label="item.name" :key="item.id" :value="item.id"></el-option>
          </el-select> -->
        </el-form-item>
        <!-- 价格： -->
        <el-form-item :label="$t('Dict.Price')">
          <el-input v-model="formItemTemp.stdPrice" v-num-keyboard:bottom id="tempItemStdPrice" v-judge></el-input>
        </el-form-item>
      </el-form>
      <div class="temp-small-type">
        <!-- 所属小类： -->
        <p>{{ $t('Biz.Order.StaySubclass') }}</p>
        <ul id="smallClassTemp">
          <li
            :class="{ 'active' : index === selectedIndex }"
            v-for="(item, index) in itemTempList" :key="item.itemId"
            @click="selectTempItem(item, index)">{{ item.smallClassName }}</li>
        </ul>
        <div class="small-type-footer">
          <Pager :showInfo="true" arrowDirection="up-down" pagerId="smallClassTemp"  ref="smallClassTemp"></Pager>
        </div>
      </div>
      <div class="history-item-temp">
        <!-- 该小类的历史临时品项： -->
        <p>{{ $t('Biz.Order.HistoryTempItems') }}</p>
        <ul id="historyTempItem">
          <li
            v-for="(item, index) in filterHistoryTemp" :key="index"
            @click="selectHistoryTemp(item, index)"
            :class="{'active': index === selectHistoryIndex}">
            <strong>{{ item.name }}</strong>
            <span>{{ item.stdPrice }}/{{ item.unitName }}</span>
          </li>
        </ul>
        <div class="history-temp-footer">
          <Search @search="searchHistoryTemp" ref="historyTempSearch"></Search>
          <Pager :showInfo="true" arrowDirection="up-down" pagerId="historyTempItem" ref="historyTempItem"></Pager>
        </div>
      </div>
    </div>
    <SelectUnit ref="unitDialog" :itemUnits="itemUnits"
    :selectedItem="formItemTemp" @selectUnit="selectUnit"></SelectUnit>
  </Dialog>
</template>

<script>
import {
  each, keys, indexOf, filter, upperCase,
} from 'lodash';
import { Message } from 'element-ui';
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import TableInfo from '@/components/Pos/Order/Tables/TableBtnsFunc/Common/Info';
import Pager from '@/components/Pos/Common/Pager';
import Search from '@/components/Pos/Order/Tables/Search';
import ajax from '@/common/js/ajax';
import SelectUnit from '@/components/Pos/Ordering/Menu/SelectUnit';

export default {
  components: {
    Dialog, TableInfo, Pager, Search, SelectUnit,
  },
  mixins: [DialogMixin],
  props: {
    testId: {
      type: String,
      default: '',
    },
    showComfirmWeight: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      infoData: {}, // 客位信息
      itemTempList: [], // 临时品项列表
      allItemTempHisList: [], // 历史临时品项列表
      itemUnits: [], // 品项单位
      historyTempList: [], // 所包含小类的临时品项列表
      formItemTemp: {
        id: '',
        name: '',
        unitId: '',
        unitName: '',
        stdPrice: '',
        isConfirmWeigh: false,
      },
      selectedIndex: 0,
      selectHistoryIndex: -1,
      searchText: '', // 快速查找内容
      closeHandWriting: false, // 是否启动手写板
      createOperAuth: false, // 新建权限
    };
  },
  computed: {
    ...mapGetters(['posInfo']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    filterHistoryTemp() {
      let filterList = [];
      if (this.historyTempList) {
        filterList = filter(this.historyTempList, (item) => {
          if (!item.pinyin) return false;
          return upperCase(item.pinyin).indexOf(upperCase(this.searchText)) !== -1;
        });
      }
      // if (filterList.length > 0) {
      //   this.handleHasHistoryTemp(filterList[0])
      // }
      return filterList;
    },
  },
  methods: {
    // 初始化数据
    onOpen() {
      this.closeHandWriting = false;
      // 赋值有关临时品项的数据
      const {
        itemTempList, allItemTempHisList, itemUnits, pointData, createOperAuth,
      } = this.resData;
      this.itemTempList = itemTempList;
      this.createOperAuth = createOperAuth;
      this.allItemTempHisList = allItemTempHisList;
      this.itemUnits = itemUnits;
      // 客位信息 传值Info组件
      this.infoData = pointData;
      // 首次进入自动选取品项
      this.selectedIndex = 0;
      this.checkHistoryTempItem(this.itemTempList[0]);
      this.handleNoHistoryTemp(this.itemTempList[0]);
      this.selectHistoryIndex = -1;
      if (this.posInfo.isEnableHandwritingBoard) {
        this.closeHandWriting = true;
        this.$devices.Handwriting.open();
      }
      // 刷新分页
      this.refreshPager();
      this.$log.info(`打开临时品项窗口.pointName:${this.infoData.pointName}`);
    },
    onClose() {
      if (this.closeHandWriting) {
        this.$devices.Handwriting.close();
      }
      this.formItemTemp.isConfirmWeigh = false;
    },
    openUnitDialog() {
      this.$refs.unitDialog.open();
    },
    selectUnit({ id, name }) {
      this.formItemTemp.unitId = id;
      this.formItemTemp.unitName = name;
    },
    // 选择临时品项的所属小类2
    selectTempItem(item, index) {
      // 选择索引添加active
      this.selectedIndex = index;
      // this.selectHistoryIndex = 0
      // 判断所选小类是否存在历史品项并处理
      this.checkHistoryTempItem(item);
      this.$refs.historyTempItem.refresh();
    },
    // 选择该小类的历史临时品项
    selectHistoryTemp(item, index) {
      // 选择索引添加active
      this.selectHistoryIndex = index;
      // 历史临时品项数据渲染
      this.handleHasHistoryTemp(item);
      // 更改称重确认状态
      this.formItemTemp.isConfirmWeigh = item.isConfirmWeigh;
      this.getFocus();
    },
    // 判断所选小类是否存在历史临时品项
    checkHistoryTempItem(item) {
      this.formItemTemp.id = item.itemId;
      // 称重确认多选框切换选中和显示状态
      this.formItemTemp.isSelectWeighItem = item.isSelectWeighItem;
      this.formItemTemp.isConfirmWeigh = false;
      const historyList = this.allItemTempHisList[0];
      const hasHistory = !!(indexOf(keys(historyList), item.itemId) !== -1
        && historyList[item.itemId].length > 0);
      if (hasHistory) {
        // 所选小类有历史临时品项
        this.historyTempList = historyList[item.itemId];
        // this.selectHistoryIndex = 0
        // this.handleHasHistoryTemp(this.historyTempList[0])
        // this.getFocus()
      } else {
        // 所选小类无历史临时品项
        // this.handleNoHistoryTemp(item)
        this.historyTempList = [];
      }
    },
    // 无历史小类时的情况
    handleNoHistoryTemp(item) {
      const _it = this.formItemTemp;
      _it.id = item.itemId;
      _it.name = item.name;
      _it.unitId = this.itemUnits[0].id;
      _it.unitName = this.itemUnits[0].name;
      _it.stdPrice = '';
      // this.historyTempList = []
      this.getFocus();
    },
    // 有历史小类时的情况
    handleHasHistoryTemp(item) {
      const _it = this.formItemTemp;
      const {
        id, name, unitId, unitName, stdPrice,
      } = item;
      _it.id = id;
      _it.name = name;
      _it.unitId = unitId;
      _it.unitName = unitName;
      _it.stdPrice = stdPrice;
    },
    // 格式化临时品项名称
    formatName(name) {
      const reg = /^\[\d+-[^]+\]/g;
      return reg.test(name) ? name.match(reg)[0] : name;
    },
    // 名称获取焦点
    getFocus() {
      this.$nextTick(() => {
        this.$refs.tempItemName.focus();
        this.$refs.tempItemName.select();
      });
    },
    // 全选临时品项名称
    selectAllText(event) {
      event.currentTarget.select();
    },
    // 快速查找历史临时品项
    searchHistoryTemp(text) {
      this.searchText = text;
      this.$refs.historyTempItem.refresh();
    },
    // 提交临时品项
    onSubmit() {
      if (this.formItemTemp.name.trim() === '') {
        // 临时品项名称不能为空
        this.showMessage(this.$t('Biz.Order.TempItemMessage'));
        return;
      }
      if (this.formItemTemp.name.trim().length > 30) {
        // 临时品项名称最多输入30位
        this.showMessage(this.$t('Biz.Order.TempItemMessage01'));
        return;
      }

      if (String(this.formItemTemp.stdPrice).trim() === '') {
        // 请输入临时品项价格
        this.showMessage(this.$t('Biz.Order.TempItemMessage02'));
        return;
      }

      const price = Number(this.formItemTemp.stdPrice);
      // 请输入正确价格
      if (isNaN(price)) {
        this.showMessage(this.$t('Biz.Order.TempItemMessage03'));
        return;
      }

      if (price >= 1000000) {
        // 最大值为999999.99
        this.showMessage(this.$t('Dict.MaximumMessage', [999999.99]));
        return;
      }

      this.formItemTemp.stdPrice = price;

      const {
        id, name, unitId, stdPrice, isConfirmWeigh,
      } = this.formItemTemp;
      ajax('canyin.pos.bill.updateitemtemp', {
        contentType: 'URLEncoded',
        data: {
          id, name, unitId, stdPrice, isConfirmWeigh,
        },
      }).then((data) => {
        if (data.success) {
          this.submit(data.itData);
          this.$log.info(`提交临时品项窗口.id:${data.itData.id},name:${data.itData.name},price:${data.itData.price}`);
        }
        this.close();
      });
    },
    showMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo'), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    handWriting() {
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else {
        this.$devices.Handwriting.open();
        this.getFocus();
      }
    },
    backspace() {
      if (window.getSelection().toString() == this.formItemTemp.name) {
        this.formItemTemp.name = '';
      } else {
        this.formItemTemp.name = this.formItemTemp.name.substr(0, this.formItemTemp.name.length - 1);
      }
    },
    refreshPager() {
      setTimeout(() => {
        if (this.$refs.historyTempItem && this.$refs.smallClassTemp) {
          this.$refs.historyTempItem.refresh();
          this.$refs.smallClassTemp.refresh();
        }
      }, 200);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-ordering-itemtemp-wrapper {
  .square(100%);
  background-color: white;
  padding-top: 58px;

  > form {
    padding-top: 30px;
    padding-left: 14px;

    > .el-form-item.line {
      display: block;
      margin-bottom: 14px;
      .el-input{
        display: inline;
      }
    }

    button.unit {
      width: 120px;
      overflow: hidden;
    }
  }

  .temp-small-type {
    > p {
      padding-left: 14px;
    }
    > ul {
      .size(100%, 100px);
      color: #888;
      padding-left: 14px;
      overflow: hidden;
      .clearfix();

      > li {
        float: left;
        .size(100px, 40px);
        line-height: 40px;
        text-align: center;
        overflow: hidden;
        margin-top: 8px;
        margin-right: 10px;
        border: 1px solid #bbb;
        border-radius: 4px;
        cursor: pointer;

        &.active {
          color: #fff;
          background-color: #0babb9;
          border-color: #0a95a1;
        }
      }
    }

    .small-type-footer {
      padding-bottom: 18px;
      border-bottom: 1px solid #ccc;
    }
  }

  .history-item-temp {
    > p {
      .size(100%, 48px);
      line-height: 48px;
      padding-left: 14px;
    }
    > ul {
      .size(100%, 160px);
      padding-left: 14px;
      overflow: hidden;
      .clearfix();
      > li {
        float: left;
        .size(110px, 45px);
        margin-bottom: 6px;
        padding-left: 8px;
        overflow: hidden;
        margin-right: 10px;
        border: 1px solid #bbb;
        border-radius: 4px;
        cursor: pointer;
        &.active {
          background: #eee;
        }
        > strong {
          display: block;
          font-size: 14px;
          color: rgb(102, 102, 102);
          white-space: nowrap;
          overflow: hidden;
        }
        > span {
          font-size: 12px;
          color: #888;
          overflow: hidden;
        }
      }
    }
    .history-temp-footer {
      width: 65%;
      position: absolute;
      left: 35%;
      bottom: 10px;
    }
  }
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-ordering-itemtemp-wrapper {
  .table-info-wrapper {
    position: absolute;
    top: 55px;
    left: 0;
    z-index: 1;
  }
  .el-form-item {
    .el-form-item__content input {
      .size(120px, 35px);
    }
    &:last-child {
      margin-left: 20px;
    }
    &.line .el-form-item__content input {
      .size(190px ,35px);
    }
    .btnMarLeft {
      margin-left: 6px;
    }
  }
  .pos-pager {
    text-align: right;
    padding-right: 14px;
    span {
      margin-right: 20px;
    }
    button {
      .size(52px, 32px);
      background-color: white;
    }
  }
  .pos-order-tables-search {
    position: relative;
    border: 1px solid #b5b5b5;
    margin-left: 14px;
    background-color: #eee;
    > label {
      color: #999;
    }
    input {
      color: #333;
    }
  }
  .margin-left-20 {
    margin-left: 20px;
  }
}
</style>
