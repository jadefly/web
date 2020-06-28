<template>
  <Dialog
    name="PosDialog.BilledChargebackModal"
    :title="$t('Dict.Chargeback')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    width="688px"
    class="billed-chargeback-modal"
  >
  <div class="basic-info">
    <span>{{tsData.pointName}}</span>
    <span>{{$t('Dict.OpeningTime')}}{{openTimeStr}}</span>
    <span>{{$t('Dict.NumberOfPeople01')}}{{billData.bsData.peopleQty}}</span>
  </div>
  <div class="content">
    <div class="menu-area">
      <div class="menu-list">
        <div class="table-head">
          <table>
            <tr>
              <th class="item-col">{{$t('Dict.Item')}}</th>
              <th class="count-col">{{$t('Biz.Order.ExistingNumTabel')}}</th>
              <th class="remark-col">{{$t('Dict.Remarks')}}</th>
              <th class="redfcount-col">{{$t('Dict.ChargebackNum')}}</th>
              <th class="redf-col">{{$t('Dict.Chargeback')}}</th>
            </tr>
          </table>
        </div>
        <div class="table-body">
          <table>
            <tr v-for="(item, index) in showItemList" v-bind:key="index">
              <td class="item-col">
                <div class="item-info">
                  <div class="item-content">
                    <p>{{item.name}}</p>
                  </div>
                </div>
              </td>
              <td class="count-col">{{item.lastQty}}{{item.unitName}}</td>
              <td class="remark-col">
                <span v-if="item.discFlg === 1" class="tip-mark">{{$t('Dict.Gift')}}</span>
                <span v-else-if="item.discFlg === 2" class="tip-mark">{{$t('Dict.Discount')}}</span>
                <span v-else-if="item.discFlg === 3" class="tip-mark">{{$t('Dict.Buy')}}</span>
              </td>
              <td class="redfcount-col">
                <div class="refcount-btn" :class="{'disabled':item.chargebackCount<1}"
                @click="subItemCount(item)">-</div>
                <el-input-number class="number" size="medium" v-num-keyboard:left
                :max="item.lastQty" :min="0"
                :controls="false" v-model="item.chargebackCount" v-judge></el-input-number>
                <div class="refcount-btn" :class="{'disabled':item.chargebackCount>=item.lastQty}"
                  @click="addItemCount(item)">+</div>
              </td>
              <td class="redf-col" @click.stop="changeItemActive(item.key)">
                <img v-show="item.active" src="@/common/images/sl-msg/chargeback_active.png">
                <img v-show="!item.active" src="@/common/images/sl-msg/chargeback.png">
              </td>
            </tr>
          </table>
          <div class="no-item" v-if="itemList.length === 0">
            <p>{{$t('Biz.Pos.More.ChargebackModalP1')}}</p>
          </div>
        </div>
      </div>
      <div class="page-area">
        <div class="pos-pager pos-takeout-pager">
          <button href="javascript:;" class="prev" @click="upPage">
            <i class="el-icon-arrow-up"></i>
          </button>
          <button href="javasctipt:;" class="next" @click="downPage(itemList)">
            <i class="el-icon-arrow-down"></i>
          </button>
          <span class="page-info">{{
            $t('Dict.PageStyle.Text1', {
              length: itemList.length,
              currentPage,
              totalPage: pageCount(itemList),
            })
          }}</span>
        </div>
        <div class="check-item">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
          @click.native="selectAll">{{$t('Dict.SelectAll')}}</el-checkbox>
        </div>
        <div class="check-item">
          <el-checkbox v-model="isPrint">{{$t('Dict.Btn.SkipKitchenList')}}</el-checkbox>
        </div>
      </div>
    </div>
    <div class="reason-area">
      <p class="title">{{$t('Biz.Pos.More.ChargebackModalP2')}}</p>
      <div class="btn-area" ref="reasonContent">
        <button type="button" v-for="item in reasons" :key="item.id"
          @click="changeReason(item)" class="btn reason-bt btn-default"
          :class="{'btn-primary':activeReason && activeReason.id === item.id}"
        >{{item.name}}</button>
      </div>
      <div class="pos-pager pos-takeout-pager">
        <button href="javascript:;" class="prev" @click="upReasonPage">
          <i class="el-icon-arrow-up"></i>
        </button>
        <button href="javasctipt:;" class="next" @click="downReasonPage">
          <i class="el-icon-arrow-down"></i>
        </button>
      </div>
    </div>
  </div>
  <BilledChargeBackConfirm
    ref="confirm"
    @submit="submitChargeback"
  ></BilledChargeBackConfirm>
  </Dialog>
</template>

<script>
import { add, multi } from '@/common/js/math';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';
import BilledChargeBackConfirm from './BilledChargeBackConfirm';

// 数字不足两位，在前面补0
function addZero(num) {
  const str = `${num}`;
  if (str.length === 1) return `0${str}`;
  return str;
}

// 外层传递的菜品列表转换成自己需要的
function formatToChargebackScList(item, key) {
  item.key = key;
  item.active = false;
  item.chargebackCount = 0;
  return item;
}

// 需要提交的数据
let submitData = null;

export default {
  components: { Dialog, BilledChargeBackConfirm },
  mixins: [DialogMixin, PageMixin],
  props: {
    billData: {},
    tsData: {},
    defaultReason: null,
  },
  data() {
    return {
      itemList: JSON.parse(JSON.stringify(this.billData.scList.map(formatToChargebackScList))),
      checkAll: false,
      isPrint: false,
      activeReason: null,
      isIndeterminate: false,
      reasons: [],
      prePageSize: 7,
    };
  },
  computed: {
    // 最终显示的品项列表
    showItemList() {
      return this.pagination(this.currentPage, this.prePageSize, this.itemList);
    },
    // 开台时间
    openTimeStr() {
      const date = new Date(this.billData.bsData.openTime);
      const hour = addZero(date.getHours());
      const min = addZero(date.getMinutes());
      return `${hour}:${min}`;
    },
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  watch: {
    // 当props变化时，更新菜品列表副本
    'billData.scList': function (list) {
      this.itemList = JSON.parse(JSON.stringify(list.map(formatToChargebackScList)));
    },
    // 全选
    checkAll(val) {
      this.checkAll = val;
      // // let list = this.itemList.map(item => {return item.active})
      // let list ;
      // if (val) {

      // } else {

      // }
      // this.$set(this.itemList, list);
      this.isIndeterminate = false;
    },
  },
  methods: {
    // 点击全选按钮
    selectAll() {
      let list;
      if (!this.checkAll) {
        list = this.itemList.map((item) => { item.active = true; });
      } else {
        list = this.itemList.map((item) => { item.active = false; });
      }
      this.$set(this.itemList, list);
    },
    onOpen() {
      // 每次打开初始化数据让每条都不是选中状态
      this.itemList = this.itemList.map((value) => {
        value.active = false;
        return value;
      });
      this.activeReason = null;
      this.checkAll = false;
      this.isPrint = false;
      this.isIndeterminate = false;
      ajax('canyin.pos.bill.abandonbillreason').then((data) => {
        this.reasons = data.reasons;
        if (this.defaultReason) {
          this.activeReason = this.defaultReason;
        }
      });
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
    },
    // 原因向上翻页
    upReasonPage() {
      const { scrollTop } = this.$refs.reasonContent;
      this.$refs.reasonContent.scrollTop = (scrollTop - 100) < 0 ? 0 : (scrollTop - 100);
    },
    // 原因向下翻页
    downReasonPage() {
      const { scrollTop } = this.$refs.reasonContent;
      const maxTop = this.$refs.reasonContent.scrollHeight - this.$refs.reasonContent.clientHeight;
      this.$refs.reasonContent.scrollTop = (scrollTop + 100) > maxTop ? maxTop : (scrollTop + 100);
    },
    // 减退单数量
    subItemCount(item) {
      let count = item.chargebackCount;
      if (--count < 0) return;
      item.chargebackCount = count;
    },
    // 加退单数量
    addItemCount(item) {
      let count = item.chargebackCount;
      if (count >= item.lastQty) return;
      if (++count > item.lastQty) count = item.lastQty;
      item.chargebackCount = count;
    },
    // 点击提交
    onSubmit(authData = {}) {
      if (!this.activeReason) {
        this.$message.warning(this.$t('Biz.Pos.More.ChargebackModalMsg1'));
        return;
      }
      const reason = {
        ...this.activeReason,
        reasonId: this.activeReason.id,
      };
      let checkedCount = 0;
      const items = [];
      let exitBillMoney = 0;
      this.itemList.forEach((item) => {
        if (!item.active) return;
        const qty = Number(item.chargebackCount);
        if (isNaN(qty) || qty <= 0) return;
        checkedCount++;
        items.push({
          reason,
          scId: item.scId,
          itemId: item.itemId,
          itemSizeId: item.itemSizeId,
          pkgFlg: item.pkgFlg,
          qty,
          itemType: item.itemType,
          tempItemName: item.tempItemName,
          discFlg: item.discFlg,
          methodText: item.methodText || null,
          unitId: item.unitId,
          isChangePrice: item.isChangePrice,
          serveWayId: item.serveWayId,
          rzFreeId: item.rzFreeId || null,
          isBuffet: item.isBuffet,
          itemName: item.name,
          unitName: item.unitName,
        });
        let scale = null; // 折扣判断 如果不是数字 显示100%
        scale = (Math.round(item.discScale * 10000) / 100).toFixed(0);
        if (isNaN(scale)) {
          scale = 100;
        }
        scale = parseFloat(scale);
        if (!item.rzFreeId || item.rzFreeId == 'undefined' || item.rzFreeId == 'null') {
          // 有做法金额时肯定要全退
          // exitBillMoney += item.lastPrice * (scale / 100) * item.chargebackCount +item.lastMakeFee * (scale / 100);add(item.lastPrice * (scale / 100), makeFeePrice), item.chargebackCount
          // 菜的所有做法的总额
          let makeFeePrice = 0;
          if (item.lastMakeFee) {
            item.methodList.forEach((list) => {
              makeFeePrice += multi(list.vprice, list.qty);
            });
          }
          exitBillMoney += add(item.lastPrice * (scale / 100) * item.chargebackCount, makeFeePrice * (scale / 100) * item.chargebackCount);
        }
      });
      if (checkedCount === 0) {
        this.$message.warning(this.$t('Biz.Pos.More.ChargebackModalMsg2'));
        return;
      }
      let fastSettleFlg;
      const { controlMode } = this.$store.state.pos.posBaseInfo;
      if (controlMode === '3') { // 快餐模式
        fastSettleFlg = true;
      } else if (controlMode === '1') { // 收银
        fastSettleFlg = false;
      }

      submitData = {
        isAfterBizCheck: false,
        pointId: this.billData.bsData.pointId,
        bsId: this.tsData.bsId,
        items,
        exitBillMoney,
        posId: this.tsData.posId,
        fastSettleFlg,
        unCancelBillPrint: this.isPrint,
        ...authData,
      };
      this.$refs.confirm.open();
    },
    // 提交退单请求
    submitChargeback() {
      ajax('canyin.pos.closedaccountexitbill.doexitbill', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: submitData,
      })
        .then((data) => {
          if (!data.success) {
            this.$message.warning(data.msg);
            return;
          }
          this.$message.success(data.msg);
          this.close();
          this.$emit('chargeback-success');

          const printData = data;
          if (printData.printType === 'PRINT_PARALLEL' && printData.printD && this.$devices.Printer) {
            this.$devices.Printer.print(printData.printD);
          }
        });
    },
    // 修改原因
    changeReason(reason) {
      this.activeReason = reason;
    },
    // 改变条目是否勾选
    changeItemActive(index) {
      const item = this.itemList[index];
      item.active = !item.active;
      this.$set(this.itemList, index, item);
      const checkedCount = this.itemList.reduce((total, { active }) => {
        if (active) total++;
        return total;
      }, 0);
      this.checkAll = checkedCount === this.itemList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.itemList.length;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.basic-info{
  font-size: 14px;
  color: #333333;
  line-height: 3.6;
  padding-left: 16px;
  span{
    padding-right: 16px;
  }
}

.content{
  background-color: @white;
  display: table;
  width: 100%;
  >* {
    display: table-cell;
    vertical-align: top;
  }
}

.menu-area{
  width: 526px;
  padding: 8px 16px;
  border-right: 1px solid #b5b5b5;
}

// 中间table
.menu-list{
  table{
    width: 100%;
  }
  th,td{
    padding-left: 6px;
    font-weight: normal;
  }
  .table-head{
    padding: 4px 0;
    background-color: #7bcad6;
    color: @white;
    th {
      font-size: 12px;
      line-height: 1.1;
    }
    th+th{
      border-left: 1px solid @white;
    }
  }
  .table-body{
    margin-top: 6px;
    color: @gray-dark;
    height: 406px;
    table{
      table-layout: fixed;
    }
    td{
      font-size: 12px;
      line-height: 1.5;
      padding: 8px 0 8px 0;
    }
    tr{
      border-bottom: 1px solid #7bcad6;
      counter-increment: itemindex;
      vertical-align: middle;
      color: #333333;
    }
  }

  .item-col{
    width: 32.5%;
    .item-content{
      display: inline-block;
      vertical-align: middle;
    }
    p{
      // width: 100%;
      width: 12rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-info::before{
      display: inline-block;
      content: counter(itemindex);
      vertical-align: middle;
      font-weight: bold;
      padding-right: 12px;
    }
  }
  .count-col{
    width: 13.5%;
  }
  .remark-col{
    width: 9%;
    .tip-mark{
      background-color: #f34f64;
      color: #ffffff;
      padding: 0 2px;
    }
  }
  .redfcount-col{
    width: 32.5%;
    >*{
      display: inline-block;
      border: 1px solid #999999;
      border-radius: 4px;
      line-height: 35px;
      text-align: center;
      vertical-align: middle;
    }
    .refcount-btn{
      width: 35px;
      font-size: 20px;
      cursor: pointer;
    }
    .number{
      width: 52px;
    }
    .disabled{
      border-color: #cccccc;
      color: #cccccc;
      cursor: not-allowed;
    }
  }
}

// 箭头按钮
.pos-takeout-pager {
  float: left;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-right: 8px;
    background-color: white;

    > i {
      color : #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}
// 分页区域
.page-area{
  overflow: hidden;
  border-top: 1px solid #9a9a9a;
  padding: 10px 0 2px;
  .page-info{
    font-size: 12px;
  }
  .check-item{
    float: right;
    border: 1px solid #ddd;
    background-color: #f1f6f8;
    padding: 4px 8px 0;
    margin-left: 8px;
  }
}

// 选择原因区域
.reason-area{
  font-size: 14px;
  line-height: 48px;
  padding: 0 30px;
  .title{
    text-indent: -1em;
  }
  .btn-area{
    height: 384px;
    overflow: hidden;
  }
  .reason-bt{
    width: 100%;
    display: block;
    margin-bottom: 8px;
  }
  .pos-takeout-pager {
    > button {
      width: 40px;
    }
  }
}
</style>
<style lang="less">
.billed-chargeback-modal{
  .redfcount-col input.el-input__inner{
    padding-right: 4px;
    padding-left: 4px;
    text-align: center;
  }
}
</style>
