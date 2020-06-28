<template>
<!--  "RepurchasePlan": "换购方案" -->
  <Dialog
    name="PosDialog.Transfer"
    :title="$t('Biz.Order.RepurchasePlan')"
    ref="dialog"
    :top="redemTop"
    bottom="0px"
    @close="onClose"
    @open="onOpen"
    @submit="tranferSubmit"
    :showSubmit="true"
    width="1000px"
    height="670px"
    :hotkeys="hotKeySet"
    submitId="singleItemTransferSubmit"
  >
  <div class="item-transfer">
    <!-- 左侧方案列表 -->
    <div class="redemption-left">
      <ul id="redemption-dis-list">
        <li
          v-for="item of exchangeList"
          :key="item.exchangeId"
          :class="{
            'active': item.exchangeId === selectPlanId
          }"
          @click="handleChangePlan(item)"
        >
          <span class="multiLineText">{{item.exchangeName}}</span>
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
        {{exchangeList.length ? redemText : ''}}
      </div>
      <div class="current-point">
        <div class="current-point-content">
          <!-- "OptionalItems": "可选品项" -->
            <div class="redemption-dis-item-head ">{{ $t('Biz.Order.OptionalItems') }}</div>
            <div class="current-point-content-info">
              <span class="cheader-item-order"></span>
              <span class="cheader-item-name">{{ $t('Dict.Item') }}</span>
              <span class="cheader-item-number">{{ $t('Dict.UnitName') }}</span>
              <!-- "PromotionalPrice": "促销价格", -->
              <span class="cheader-item-price" v-show="exchangeType === 0 || exchangeType === 2">{{ $t('Biz.Order.PromotionalPrice') }}</span>
              <span class="cheader-item-transfer">{{ $t('Biz.Order.Optional') }}</span>
            </div>
            <ul class="current-point-content-list" id="currentPointListId">
              <li v-for="list in letfGroupData" :key="list.exchangeGroupId">
                <ul>
                  <li>{{ list.groupName }}{{ list.groupMaxExchangeNum ? `(最大限量 ${list.groupMaxExchangeNum})` : '' }}</li>
                  <li v-for="(item, index) in leftGroupItems[list.exchangeGroupId]" :key="index">
                    <span class="clist-item-order">{{ index + 1 }}</span>
                    <span class="clist-item-name multiLineText">{{ item.itemName}}</span>
                    <span class="clist-item-number">{{ item.itemUnitName }}</span>
                    <span class="clist-item-price" v-show="exchangeType === 0 || exchangeType === 2">
                      <span class="disPrice">{{item.disPrice }}</span>
                      <del class="itemPrice">{{item.itemPrice }}</del>
                    </span>
                    <span class="clist-item-transfer" @click="handleItemTransfer(item, index)" :id="'singleItemTransferConfirm' + index" v-autotest>
                      <img src="~@/common/images/pos/singleItemTransfer/to.png" alt="">
                    </span>
                  </li>
                </ul>
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
            <span class="theader-item-price" v-show="exchangeType === 0 || exchangeType === 2">{{ $t('Dict.Subtotal') }}</span>
            <span class="theader-item-repeal">{{ $t('Dict.Cancel') }}</span>
          </div>
          <ul class="transfer-point-content-list" id="transferPointListId">
            <li v-for="list in rightGroupData" :key="list.exchangeGroupId">
              <ul>
                <li>{{ list.groupName }}{{ list.groupMaxExchangeNum ? `(最大限量 ${list.groupMaxExchangeNum})` : '' }}</li>
                <li v-for="(item , index) in rightGroupItems[list.exchangeGroupId]" :key="index">
                  <span class="tlist-item-order">{{ index + 1}}</span>
                  <span class="tlist-item-name multiLineText">
                    {{ item.itemName }}
                  </span>
                  <span class="tlist-item-number">
                    <el-input-number
                      size="small"
                      v-model="item.qty"
                      v-num-keyboard:left
                      :min="1"
                      :max="item.maxExchangeNum"
                      v-autotest
                      @change="inputChange(item)"
                      v-judge>
                    </el-input-number>
                  </span>
                  <span class="tlist-item-price" v-show="exchangeType === 0 || exchangeType === 2">{{ item.disPrice * item.qty}}</span>
                  <span class="tlist-item-repeal" @click="handleRevokeTransfer(item,index)">
                    <img src="~@/common/images/pos/singleItemTransfer/back.png" alt=""/>
                  </span>
                </li>
              </ul>
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
import { xorBy, debounce, uniqueId } from 'lodash';
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
      selectPlanId: null,
      exchangeList: [],
      filterCurrentItems: [], // 品项数据
      exchangeGroups: [], // 组数据
      transferItems: [], // 右侧已选的换购品项
      leftGroupItems: {}, // 左侧组品项数据
      letfGroupData: [], // 左侧组数据
      rightGroupItems: {}, // 右侧侧组品项数据
      rightGroupData: [], // 右侧组数据
      exchangeType: null, // 0 - 单品换购 1 - 组和换购 2 - 混合换购
      exchangePrice: null,
      conditionPrice: null,
      exchangeMode: 0, // 按账单金额还是按加单数量 0 -金额 1 -数量
      isSubmitClose: false, // 是否是确认按钮关闭的
      transMap: new Map(),
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.tranferSubmit();
        },
      };
    },
    redemText() {
      if (this.exchangeType === 0) {
        // return `消费金额满【${this.conditionPrice}】元，以下换购品项任选`;
        if (this.exchangeMode === 1) {
          return this.$t('Biz.Order.RepurchasePlanTip05', [this.conditionPrice]);
        }
        return this.$t('Biz.Order.RepurchasePlanTip03', [this.conditionPrice]);
      }
      // return `消费金额满【${this.conditionPrice}】元，加【${this.exchangePrice}】元，以下换购品项任选【${this.exchangeKindQty}】种`;
      if (this.exchangeMode === 1) {
        return this.$t('Biz.Order.RepurchasePlanTip06', [this.conditionPrice, this.exchangePrice]);
      }
      return this.$t('Biz.Order.RepurchasePlanTip04', [this.conditionPrice, this.exchangePrice]);
    },
    ...mapGetters([
      'posInfo',
    ]),
  },
  watch: {
    transferItems(data) {
      this.transformateData(data);
    },
  },
  methods: {
    transformateData(data) {
      console.log(data);
      const lists = data.length ? xorBy(this.filterCurrentItems, data, 'itemSizeGroupId') : this.filterCurrentItems;
      console.log(lists);
      this.leftGroupItems = this.groupByFn({}, lists, 'exchangeGroupId');
      this.letfGroupData = this.exchangeGroups.filter(list => this.leftGroupItems[list.exchangeGroupId]);
      this.rightGroupItems = this.groupByFn({}, data, 'exchangeGroupId');
      this.rightGroupData = this.exchangeGroups.filter(list => this.rightGroupItems[list.exchangeGroupId]);
    },
    // 组数据合成
    groupByFn(obj = {}, arr, keyName) {
      arr.forEach((list) => {
        const key = list[keyName];
        if (obj[key]) {
          obj[key].push(list);
        } else {
          // eslint-disable-next-line no-param-reassign
          obj[key] = [list];
        }
      });
      return obj;
    },
    // input数据变化事件
    inputChange(item) {
      // this.$forceUpdate();
      let { qty } = item;
      if (`${qty}`.indexOf('.') !== -1) {
        qty = +`${qty}`.split('.')[0];
        setTimeout(() => {
          this.$set(item, 'qty', qty);
        }, 0);
      }
    },
    onOpen() {
      this.isSubmitClose = false;
      const boxHeight = document.documentElement.clientHeight;
      const boxH = (boxHeight - 670) / 2;
      this.redemTop = boxH > 0 ? `${boxH}px` : `${0}px`;
      this.initData();
      this.refresh = debounce(this.refresh, 200);
      setTimeout(() => {
        this.$refs.rightPager.refresh();
        this.$refs.leftPager.refresh();
        this.$refs.redemList.refresh();
      }, 200);
    },
    // 初始化数据
    initData() {
      const {
        redeItems, // 加单已添加过的换购品项
        exchangeList, // 接口换购数据
        exchangeIndex, // 当前table标签位置
      } = this.resData;
      this.exchangeList = exchangeList;
      // 如存在换购方案数据进行回显处理
      if (exchangeList.length) {
        const {
          exchangeItem,
          exchangeId,
          exchangeType,
          conditionPrice,
          exchangePrice,
          exchangeMode,
          exchangeGroups,
        } = exchangeList[exchangeIndex];
        this.filterCurrentItems = exchangeItem; // ,换购的数据
        // eslint-disable-next-line prefer-destructuring
        this.exchangeGroups = exchangeGroups; // 组的数据
        this.selectPlanId = exchangeId; // 换购的id
        this.exchangeType = exchangeType; // 类型
        this.conditionPrice = conditionPrice; // 满多少（按金额就是金额否则是数量）
        this.exchangePrice = exchangePrice; // 加多少钱
        this.exchangeMode = exchangeMode; // 模式
        // 找到对应的换购的品项
        this.transferItems = redeItems.map((item) => {
          // scId 这个证明是入库的
          let { itemSizeGroupId } = item;
          if (!itemSizeGroupId) {
            itemSizeGroupId = `${item.id}_${item.sizeId}`;
          }
          const redeItem = this.filterCurrentItems.find(backItem => backItem.itemSizeGroupId === itemSizeGroupId);
          if (redeItem) {
            this.$set(redeItem, 'qty', item.num);
            this.$set(redeItem, 'exchangeId', this.selectPlanId);
            this.$set(redeItem, 'exchangeType', this.exchangeType);
          }
          return {
            ...redeItem,
            qty: item.num,
            exchangeId,
            exchangeType,
          };
        });
      }
    },
    refresh() {
      this.$refs.rightPager.refresh();
      this.$refs.leftPager.refresh();
    },
    handleChangePlan(item) {
      // 缓存下
      if (this.selectPlanId) {
        this.transMap.set(this.selectPlanId, this.transferItems);
      }
      // 找到当前的时候有存在
      this.transferItems = this.transMap.has(item.exchangeId) ? this.transMap.get(item.exchangeId) : [];
      this.selectPlanId = item.exchangeId;
      this.exchangeType = item.exchangeType;
      this.exchangeKindQty = item.exchangeKindQty;
      this.exchangePrice = item.exchangePrice;
      this.conditionPrice = item.conditionPrice;
      this.filterCurrentItems = item.exchangeItem;
      this.exchangeGroups = item.exchangeGroups;
      this.exchangeMode = item.exchangeMode;
      // 如果是按金额话每次切换清空
      if (this.exchangeMode === 0) {
        // 如果一开始没有数据 手动输出下初始化数据
        if (!this.transferItems.length) {
          this.transformateData([]);
        }
      }
      this.refresh();
    },
    handleItemTransfer(item) {
      // 填加默认数据
      let qty = item.defaultExchangeNum; // 默认添加默认数量
      // 找到对应的组 如果存在计算下组内所有数据数量的和
      if (this.rightGroupItems[item.exchangeGroupId]) {
        //  kscIdArr: reduce(list, (arr, n) => [...arr, n.kscId], []),
        const { groupMaxExchangeNum } = this.rightGroupData.filter(list => list.exchangeGroupId === item.exchangeGroupId)[0];
        const slectedtotal = this.rightGroupItems[item.exchangeGroupId].reduce((prev, curr) => add(prev, curr.qty), 0);
        if (+slectedtotal === +groupMaxExchangeNum) {
          return;
        }
        if (add(slectedtotal, qty) > groupMaxExchangeNum) {
          qty = multi(groupMaxExchangeNum, slectedtotal);
        }
      }
      this.transferItems.push({ ...item, qty });
      this.refresh();
    },
    handleRevokeTransfer(item) {
      const len = this.transferItems.length;
      let deleteIndex = 0;
      for (let i = 0; i < len; i += 1) {
        if (
          this.transferItems[i].itemSizeGroupId === item.itemSizeGroupId
          && this.transferItems[i].exchangeGroupId === item.exchangeGroupId
        ) {
          deleteIndex = i;
        }
      }
      this.transferItems.splice(deleteIndex, 1);
      this.refresh();
    },
    onClose() {
      this.transMap.clear();
      const { data } = this.resData;
      this.transferItems = [];
      this.filterCurrentItems = [];
      if (`${this.posInfo.controlMode}` === '3') {
        if (data) { // 点击更多中的换购，操作完之后，不触发这个方法
          this.$vemit('handleRedemptionClose');
        }
      } else if (!this.isSubmitClose) {
        this.submit([]);
      }
    },
    // 获取 elId 用绑定单品换购和换购品项的关系
    getElId(item) {
      // 为3时是快餐，无需增加serveWayId
      const idAttrs = `${this.posInfo.controlMode}` === '3' ? [
        item.lid,
        item.id,
        item.sizeId,
        item.discFlg,
        item.reasonId ? item.reasonId : '',
      ] : [
        item.lid,
        item.id,
        item.sizeId,
        item.discFlg,
        item.reasonId ? item.reasonId : '',
        item.serveWayId || '',
      ];
      return idAttrs.join('.');
    },
    // 确认事件
    async tranferSubmit() {
      let { transferItems } = this;
      // 没有数据直接返回
      if (!this.transferItems.length) {
        return;
      }
      // 判断组内品项数量的和 是否已超出了 组的最大限量
      if (this.rightGroupData.some((list) => {
        const groupSlectedTotal = this.rightGroupItems[list.exchangeGroupId].reduce((prve, curr) => add(prve, curr.qty), 0);
        if (groupSlectedTotal > list.groupMaxExchangeNum) {
          this.$message.error(`${list.groupName}组最大限量为${list.groupMaxExchangeNum}`);
          return true;
        }
        return false;
      })) {
        return;
      }
      // 组和
      // exchangeType 如果为组合 后者是混合的模式并且已选择的组大于1按组合处理 所以请求接口
      //  exchangeMode: 0, // 按账单金额还是按加单数量 0 -金额 1 -数量
      if (this.exchangeType === 1
          || (this.exchangeType === 2 && this.rightGroupData.length > 1)
      ) {
        const data = await ajax('canyin.pos.settlement.getItemswithexchange',
          {
            contentType: 'paramsEncoded',
            data: {
              exchangePrice: this.exchangePrice, // 如果是按 金额就是金额， 按数量就是数量
              items: this.transferItems,
              exchangeMode: this.exchangeMode,
              exchangeType: this.exchangeType,
            },
          });
        transferItems = data.exchangeItems;
      }
      const { activeItem } = this.resData;
      // activeItem这个代表了单品数量模式 满足条件的菜品
      let bindId = null;
      if (activeItem) {
        bindId = this.getElId(activeItem);
        activeItem.mBindId = bindId;
      }
      const submitItems = this.dataTransformate(transferItems, bindId);
      this.submit(submitItems, activeItem || null);
      this.isSubmitClose = true;
      this.close();
    },
    // 数据转化方法
    dataTransformate(data, bindId) {
      return data.map((item) => {
        const {
          itemId,
          sizeId,
          qty,
          itemSizeGroupId,
          price,
          itemName,
        } = item;
        const lid = uniqueId();
        const newItem = {
          itemId,
          sizeId,
          itemSizeGroupId,
          num: qty,
          exchangeId: this.selectPlanId,
          exchangeType: this.exchangeType,
          exchangeMode: this.exchangeMode,
          price: (price || price === 0) ? price : item.disPrice,
          promotePrice: (price || price === 0) ? price : item.disPrice,
          discFlg: 4,
          priceType: 3,
          defaultPriceType: 3,
          oldDisFlg: 4,
          promoteLimit: 0,
          itemType: 1,
          itemName,
          lid,
        };
        if (bindId) {
          this.$set(newItem, 'bindId', bindId);
          this.$set(newItem, 'busiType', 2);
        }
        return newItem;
      });
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
            > ul {
              > li {
                border-bottom: 1px solid #b5b5b5;
                display: flex;
                align-items: center;
                padding: 5px 0;
                text-align: center;
                &:nth-child(1) {
                  background-color: #eeeeee;
                  font-weight: bold;
                  border-left: 5px solid #cdcdcd;
                  padding-left: 6px;
                  border-bottom: none;
                }
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
          >li {
            >ul {
              > li {
                border-bottom: 1px solid #b5b5b5;
                display: flex;
                padding: 5px 0;
                text-align: center;
                align-items: center;
                &:nth-child(1) {
                  background-color: #eeeeee;
                  font-weight: bold;
                  border-left: 5px solid #cdcdcd;
                  padding-left: 6px;
                  border-bottom: none;
                }
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
