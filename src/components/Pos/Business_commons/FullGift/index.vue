<template>
<!--  "RepurchasePlan": "换购方案" -->
  <Dialog
    name="PosDialog.FullGift"
    :title="$t('Dict.Btn.FullGift')"
    ref="dialog"
    :top="redemTop"
    bottom="0px"
    @close="onClose"
    @open="onOpen"
    @submit="fullGiftSubmit"
    :showSubmit="true"
    width="1000px"
    height="670px"
    :hotkeys="hotKeySet"
    :submitId="`${type}fullGiftId`"
  >
  <div class="item-transfer">
    <!-- 左侧方案列表 -->
    <div class="redemption-left">
      <ul id="redemption-dis-list">
        <li
          v-for="(item, index) of fullGiftList"
          :key="item.fullGiftId"
          :class="{
            'active': tableActiveIndex === index
          }"
          @click="handleChangePlan(index)"
        >
          <span class="multiLineText">{{ item.fullGiftName }}</span>
        </li>
      </ul>
      <div class="current-point-footer-pager">
        <Pager
        pagerId="redemption-dis-list"
        itemTag="li"
        :showInfo = "true"
        ref="redemList"
        scrollMode="simple"
        arrowDirection="up-down"></pager>
      </div>
    </div>
    <div class="redem-wrap">
      <div class="redem-title-text">
        {{fullGiftList.length ? redemText : ''}}
      </div>
      <div class="current-point">
        <div class="current-point-content">
          <!-- "OptionalItems": "可选品项" -->
            <div class="redemption-dis-item-head ">{{ $t('Biz.Order.OptionalItems') }}</div>
            <div class="current-point-content-info">
              <span class="cheader-item-order"></span>
              <span class="cheader-item-name">{{ $t('Dict.Item') }}</span>
              <span class="cheader-item-number">{{ $t('Dict.UnitName') }}</span>
              <span class="cheader-item-transfer">{{ $t('Dict.Btn.FullGift') }}</span>
            </div>
            <ul class="current-point-content-list" id="currentPointListId">
              <li v-for="(item , index) in optionalList" :key="index">
                <span class="clist-item-order">{{ index + 1 }}</span>
                <span class="clist-item-name multiLineText">{{ item.itemName}}</span>
                <span class="clist-item-number">{{ item.itemUnitName }}</span>
                <span class="clist-item-transfer" @click="handleItemTransfer(item, index)" :id="'optionalList' + index" v-autotest>
                  <img src="~@/common/images/pos/singleItemTransfer/to.png" alt="">
                </span>
              </li>
            </ul>
        </div>
          <div class="current-point-footer">
            <div class="current-point-footer-pager">
              <Pager
              pagerId="currentPointListId"
              itemTag="li"
              :showInfo = "true"
              ref="leftPager"
              scrollMode="simple"
              arrowDirection="up-down"></pager>
            </div>
          </div>
      </div>
      <div class="transfer-point">
        <div class="transfer-point-content">
          <!-- "SelectedItems": "已选品项" -->
          <div class="redemption-dis-item-head">{{ $t('Biz.Order.SelectedItems') }}</div>
          <div class="transfer-point-content-info">
            <span class="theader-item-order"></span>
            <span class="theader-item-name">{{ $t('Dict.Item') }}</span>
            <span class="theader-item-number">{{ $t('Dict.Amount')}}</span>
            <span class="theader-item-repeal">{{ $t('Dict.Cancel') }}</span>
          </div>
          <ul class="transfer-point-content-list" id="transferPointListId">
            <li v-for="(item , index) in selectedList" :key="index">
              <span class="tlist-item-order">{{ index + 1}}</span>
              <span class="tlist-item-name multiLineText">
                {{ item.itemName }}
              </span>
              <span class="tlist-item-number">
                <el-input-number
                  size="small"
                  v-model="item.qty"
                  v-num-keyboard:left
                  v-autotest
                  :min="0"
                  @change="inputNum($event, index)"
                  v-judge>
                </el-input-number>
              </span>
              <span class="tlist-item-repeal" @click="handleRevokeTransfer(item,index)">
                <img src="~@/common/images/pos/singleItemTransfer/back.png" alt=""/>
              </span>
            </li>
          </ul>
        </div>
        <div class="transfer-point-footer">
          <div class="transfer-point-footer-pager">
            <Pager
            pagerId="transferPointListId"
            itemTag="li"
            scrollMode="simple"
            :showInfo = "true"
            arrowDirection="up-down"
            ref="rightPager"
            ></pager>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import { cloneDeep, debounce } from 'lodash';
import {
  mapGetters,
} from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';
import {
  multi, div, add, round,
} from '@/common/js/math';

export default {
  components: {
    Dialog, Pager,
  },
  mixins: [DialogMixin],
  data() {
    return {
      redemHeight: '0px',
      redemTop: '0px',
      fullGiftList: [], // 满赠全部数据
      tableActiveIndex: 0, // 选中换购方案的下标
      selectedList: [], // 已选择的品项数据
      optionalList: [], // 可选品项的数据
      reasonId: '21', // 满赠的原因目前是写死的系统初始化的一个满赠原因
      isDoSubmit: false, // 是否执行确定
    };
  },
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.fullGiftSubmit();
        },
      };
    },
    redemText() {
      const {
        conditionPrice, fullGiftQty, fullGiftMode, fullGiftRule,
      } = this.fullGiftList[this.tableActiveIndex];
      // fullGiftMode 0加单金额 1 数量 方式 fullGiftRule类型 0单品- 1组和
      const tipName = `Biz.Order.FullGiftTip${fullGiftMode}${fullGiftRule}`;
      return this.$t(tipName, [Number(conditionPrice), Number(fullGiftQty)]);
    },
    ...mapGetters([
      'posInfo',
    ]),
  },
  methods: {
    inputNum(ev, index) {
      const toArr = `${ev}`.split('.');
      if (toArr[1] && toArr[1].length > 3) {
        const integerVal = toArr[0];
        const decimalVal = toArr[1].slice(0, 3);
        // 小数最多设置后三位
        this.$message.warning(this.$t('Biz.BizComm.BizCommTip10'));
        setTimeout(() => {
          this.$set(this.selectedList[index], 'qty', Number(`${integerVal}.${decimalVal}`));
        });
      }
    },
    onOpen() {
      const boxHeight = document.documentElement.clientHeight;
      const boxH = (boxHeight - 670) / 2;
      this.redemTop = boxH > 0 ? `${boxH}px` : `${0}px`;
      this.refresh = debounce(this.refresh, 200);
      this.openInitData();
      setTimeout(() => {
        this.$refs.rightPager.refresh();
        this.$refs.leftPager.refresh();
        this.$refs.redemList.refresh();
      }, 200);
    },
    // 打开初始化数据
    openInitData() {
      const {
        addFullGiftList, // 已添加的满赠品项
        fullGiftList, // 所有满赠方案数据
        tableActiveIndex, // 当前所在的满赠方案的下标
        isComeSettle,
      } = this.resData;
      this.fullGiftList = fullGiftList;
      if (fullGiftList.length) {
        this.tableActiveIndex = tableActiveIndex;
        if (!addFullGiftList.length) {
          this.optionalList = cloneDeep(fullGiftList[tableActiveIndex].fullGiftItem);
        } else {
          // 对已添加加单的进行匹配回显 fullGiftList[tableActiveIndex].fullGiftItem addFullGiftList
          for (let index = 0; index < fullGiftList[tableActiveIndex].fullGiftItem.length; index += 1) {
            const element = fullGiftList[tableActiveIndex].fullGiftItem[index];
            const findItem = addFullGiftList.find(item => `${element.itemId}_${element.sizeId}` === `${item.id}_${item.sizeId}`);
            // 如果找到就添加
            if (findItem) {
              this.selectedList.push({
                ...element,
                qty: findItem.num,
                fullGiftId: fullGiftList[tableActiveIndex].fullGiftId, // 满赠方案的id
                fullGiftMode: fullGiftList[tableActiveIndex].fullGiftMode, // 满赠方案的模式 0：按金额，1：按数量
              });
            } else {
              this.optionalList.push(element);
            }
          }
        }
      }
    },
    // 关闭弹框 初始化数据
    closeInitData() {
      // 清空已选择的品项数据
      this.selectedList = [];
      this.fullGiftList = [];
      this.optionalList = [];
      this.tableActiveIndex = 0;
      this.isComeSettle = false;
    },
    refresh() {
      this.$refs.rightPager.refresh();
      this.$refs.leftPager.refresh();
    },
    handleChangePlan(index) {
      this.tableActiveIndex = index;
      this.optionalList = cloneDeep(this.fullGiftList[index].fullGiftItem);
      this.selectedList = [];
      this.refresh();
    },
    handleItemTransfer(item, index) {
      // 判断单品还是组合 useType 0 - 单品满赠 1 - 组合
      const useType = this.fullGiftList[this.tableActiveIndex].fullGiftRule;
      console.log(this.fullGiftList[this.tableActiveIndex].fullGiftRule);
      if (useType === 0 && this.selectedList.length) {
        return;
      }
      this.optionalList.splice(index, 1);
      // 目前默认添加为1
      const { fullGiftId, fullGiftMode } = this.fullGiftList[this.tableActiveIndex];
      this.selectedList.push({
        ...item,
        qty: 1,
        fullGiftId,
        fullGiftMode,
      });
      this.refresh();
    },
    handleRevokeTransfer(item, index) {
      const lists = this.fullGiftList[this.tableActiveIndex].fullGiftItem;
      this.optionalList.push(...lists.filter(list => (item.itemId === list.itemId && item.sizeId === list.sizeId)));
      this.selectedList.splice(index, 1);
      this.refresh();
    },
    onClose() {
      this.closeInitData();
      // isDoSubmit true -确定的关闭, 否则是关闭按钮的关闭
      if (!this.isDoSubmit) {
        if (`${this.posInfo.controlMode}` === '3') {
          if (this.resData.isComeSettle) {
            this.$vemit('handleRedemptionClose', true);
          }
        } else {
          this.submit([]);
        }
      }
      this.isDoSubmit = false;
    },
    // 确认事件
    fullGiftSubmit() {
      // 计算下 当前选中的菜数量和是否满足允许赠送的条件
      if (this.selectedList.length === 0) {
        return this.$message.error(this.$t('Biz.Order.FullGiftError02'));
      }
      const { fullGiftQty } = this.fullGiftList[this.tableActiveIndex];
      let nowTotal = 0;
      let isGo = true;
      for (let i = 0; i < this.selectedList.length; i += 1) {
        const element = this.selectedList[i];
        if (+element.qty === 0) {
          this.$message.error(this.$t('Biz.Order.FullGiftError03'));
          isGo = false;
          break;
        }
        nowTotal = add(nowTotal, element.qty);
      }
      if (!isGo) {
        return isGo;
      }
      if (nowTotal !== fullGiftQty) {
        return this.$message.error(this.$t('Biz.Order.FullGiftError01', [fullGiftQty]));
      }
      // eslint-disable-next-line no-unreachable
      const submitParams = this.selectedList.map(list => ({
        ...list,
        discFlg: 1,
        reasonId: this.reasonId,
        num: list.qty,
        defaultPriceType: 1,
        itemType: 1,
      }));
      this.isDoSubmit = true;
      this.submit(submitParams);
      this.close();
      return true;
    },

  },
};
</script>

<style scoped>
  .multiLineText{
    display: -webkit-box !important;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
</style>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.item-transfer::after {
  content: "";
  display: block;
  clear: both;
}
.item-transfer {
  background-color: #fff;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  position: relative;
  .redem-wrap{
    display: flex;
    padding: 6px;
    background-color: #e4e4e4;
    width: calc(100% - 200px);
    height: 100%;
    .redem-title-text{
      position: absolute;
      left: 208px;
      top: 0;
      width: calc(100% - 222px);
      font-size: 16px;
      color: #333333;
      height: 53px;
      line-height: 53px;
    }
    > .current-point {
        flex:1;
        margin-top: 53px;
        height: calc(100% - 53px);
        background: #fff;
        border-right: 1px solid #b5b5b5;
        // padding-top: 53px;
        // width: 451px;
        // float: left;
        box-shadow: 8px 0px 8px 0px #d8d8d8;
      > .current-point-content {
          height: calc(100% - 54px);
          padding: 4px 14px 0px 14px;

        > .current-point-content-info {
            height: 24px;
            background-color: #7bcad6;
            display: flex;
            align-items: center;
            text-align: center;
          > span {
              font-size: 13px;
              color: #fff;
              display: block;
              position: relative;
              border-left: 1px solid #fff;
              &:nth-child(2) {
                border: none;
                text-align: left;
              }
          }

          > .cheader-item-order {
            flex: 0.3;
          }
          > .cheader-item-name {
            flex: 1;
          }
          > .cheader-item-number {
            flex: 1;
          }
          > .cheader-item-price {
            flex: 1.5;

          }
          > .cheader-item-transfer{
            flex: 0.5;
          }
        }

        > .current-point-content-list {
          height: calc(100% - 24px - 57px);
          border-bottom: 1px solid #b5b5b5;
          overflow-x: hidden;
          > li {
            border-bottom: 1px solid #b5b5b5;
            display: flex;
            align-items: center;
            padding: 5px 0;
            text-align: center;
            > span {
              max-height: 41px;
              vertical-align: middle;
              font-size: 14px;
              font-weight: 600;
              overflow: hidden;
              display: inline-block;
              word-break: break-all;
              position: relative;
              &:nth-child(2) {
                text-align: left;
              }
            }
            > .clist-item-order{
              flex: 0.3;
            }
            > .clist-item-name{
              flex: 1;
            }
            > .clist-item-number{
              flex: 1;
            }
            > .clist-item-price{
              flex: 1.5;
              > .discPrice{
                font-size: 14px;
                color: #333333;
                display: block;
                font-weight: normal;
              }
              > .itemPrice{
                font-size: 12px;
                color: #bebebe;
                display: block;
                font-weight: normal;
              }
            }
            > .clist-item-transfer{
                cursor: pointer;
                flex: 0.5;
            > img {
                width: 28px;
                height: 28px;

            }
            }
          }
        }
      }
      .current-point-footer::after{
        content: "";
        display: block;
        clear: both;
      }
      > .current-point-footer {
        height: 54px;
        padding: 10px 16px;
        > .current-point-footer-pager{
          float: right;
        }
      }
    }
      > .transfer-point {
      // margin-left: 451px;
        flex:1;
        margin-top: 53px;
        background: #fff;
      > .transfer-point-content {
        height: calc(100% - 54px);
        padding: 4px 14px 0px 14px;

        > .transfer-point-content-info {
          height: 24px;
          background-color: #7bcad6;
          display: flex;
          align-items: center;
          text-align: center;
          > span {
            font-size: 13px;
            color: #fff;
            display: block;
            position: relative;
            border-left: 1px solid #fff;
            &:nth-child(2) {
              border: none;
              text-align: left;
            }
          }

          > .theader-item-order {
            flex: 0.3;
          }
          > .theader-item-name {
            flex: 1;
          }
          > .theader-item-number {
            flex: 1.7;
          }
          > .theader-item-price {
            flex: 0.7;
          }
          > .theader-item-repeal {
            flex: 0.5;
          }
        }

        > .transfer-point-content-list {
          height: calc(100% - 24px - 57px);
          border-bottom: 1px solid #b5b5b5;
          overflow-x: hidden;

          > li {
            border-bottom: 1px solid #b5b5b5;
            display: flex;
            padding: 5px 0;
            text-align: center;
            align-items: center;
            > span {
              max-height: 41px;
              vertical-align: middle;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
              overflow: hidden;
              word-break: break-all;
              &:nth-child(2) {
                text-align: left;
              }
            }

            > .tlist-item-order{
                flex: 0.3;
            }
            > .tlist-item-name{
                flex: 1;
            }
            > .tlist-item-number{
              flex: 1.7;
            }
            > .tlist-item-price{
              flex: 0.7;
              > .discPrice{
                font-size: 14px;
                color: #333333;
                display: block;
                font-weight: normal;
              }
            }
            > .tlist-item-repeal{
              flex: 0.5;
              cursor: pointer;
              > img {
              width: 28px;
              height: 28px;
            }
            }
          }
        }
      }
      > .transfer-point-footer {
        height: 54px;
        height: 54px;
        padding: 10px 16px;
        text-align: right;
      }
    }
  }
  > .redemption-left{
    width: 200px;
    box-shadow: 8px 0px 8px 0px #d8d8d8;
    height: calc(100% - 54px);
    > .current-point-footer-pager{
      padding-top: 10px;
      text-align: right;
      padding-right: 16px;
    }
    > ul {
      height: 100%;
      border-bottom: 1px solid #b5b5b5;
      overflow-y: auto;
      > li {
        height: 52px;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 15px;
        font-size: 15px;
      }
      > li.active {
        color: #09adb7;
        font-weight: 600;
        background: #def1f7;
      }
    }
  }

}
.redemption-dis-item-head{
  height: 52px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #b5b5b5;
  margin-bottom: 5px;
}
</style>
