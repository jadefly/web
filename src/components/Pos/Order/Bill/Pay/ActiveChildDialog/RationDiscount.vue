<template>
  <!-- $t-定额优惠方案，新增可选择部分品项 -->
  <Dialog
      name="PosDialog.rationDiscount"
      :title="rationDiscount.name"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :showSubmit="true"
      :append-to-body="true"
      :hotkeys="rationDiscountHotkey"
      width="680px"
      height="550px"
      :submitId="'rationDiscount' + rationDiscount.id"
    >
    <div class="discountBox df">
      <!-- 左侧:品项列表 -->
      <div class="discount-middle">
        <div class="discount-middle-title">
          <!-- <div class="pull-left">{{$t('Biz.Settlement.ActiveItems')}}</div> -->
          <div class="content-title">
            <!-- $t-序号,品项,现有数量,小计 -->
            <span class="head-item-checkedbox"></span>
            <span class="head-item-order">{{ $t('Dict.SerialNumber') }}</span>
            <span class="head-item-name">{{ $t('Dict.Item') }}</span>
            <span class="head-item-number">{{ $t('Biz.Order.ExistingNumTabel') }}</span>
            <span class="head-item-number">{{ $t('Dict.Subtotal') }}</span>
          </div>
        </div>
        <div class="middleItemsBox">
          <ul class="discount-middle-items" id="discountMiddleItems">
            <li
              v-for="(item, index) in canDiscountItemList"
              @click="selectItem(item)"
              :key="index">
              <span class="list-item-checkedbox">
                <i class="icon icon-duihao isChecked" v-show="item.isChecked == true"></i><i class="isNoChecked" v-show="item.isChecked == false"></i>
              </span>
              <span class="list-item-order">{{ index + 1 }}</span>
              <span class="list-item-name textOverflow">
                <!-- {{ item.mergeScId ? '['+$t('Dict.Mixing')+']' : '' }}
                <span v-show="item.itemSizeName">({{ item.itemSizeName }})</span> -->
                {{ item.item_name }}
              </span>
              <span class="list-item-number">{{ item.last_qty }}</span>
              <span class="list-item-number">￥{{ item.sale_price }}</span>
            </li>
          </ul>
        </div>
        <div class="discountPager">
          <div class="selectAllBtn">
            <el-checkbox
              v-model="selectAll"
              @change="handleCheckAllChange"
              v-autotest>{{ $t('Dict.SelectAll') }}</el-checkbox>
          </div>
          <div class="pagerBox">
            <span>{{$t('Dict.Altogether')}}{{ canDiscountItemList.length }}{{$t('Dict.Strip')}}，</span>
            <Pager
              pagerId="discountMiddleItems"
              ref="pager"
              arrowDirection="up-down"
              :showInfo="true">
            </Pager>
          </div>
        </div>
      </div>
      <!-- 右侧:固定键盘 -->
      <div class="info-keybord">
        <div class="money-info">
          <p>
            <span>{{$t('Biz.Settlement.UpperLimit')}}</span>
            <span class="showMoney">{{ rationDiscount.disPriceLimit | keepTwo }}</span>
          </p>
          <p class="input-box">
            <span class="input-txt">{{$t('Dict.PreferentialAmountLabel')}}</span>
            <el-input
              id="rationDiscountInput"
              class="input-content"
              v-model="amountOfDiscount"
              size="medium"
              :placeholder="$t('Dict.PleaseEnterPayAmount')"
              v-judge
              v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }">
            </el-input>
          </p>
        </div>
        <div class="keybord-content">
          <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>

import ajax from '@/common/js/ajax';
import { find } from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import { multi, add } from '@/common/js/math';
import Pager from '@/components/Pos/Common/Pager';
import Dialog from '@/components/Pos/Common/Dialog';
import numberformat from '@/common/js/numberformat';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog, Pager, KeyBoard },
  mixins: [ DialogMixin ],
  props: {
    bsId: {
      type: String,
      default: '',
    },
    pointId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      discount: {
        name: '',
        tip: '',
        startTime: '',
        endTime: '',
        itemMsg: '',
      },
      canDiscountItemList: [], // 能打折品项
      rationDiscount: {}, // 优惠信息
      amountOfDiscount: 0, // 输入的优惠金额
      baseBs: {}, // 流水数据
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 0, // 是否是团队账单
      selectAll: false,
    };
  },
  computed: {
    ...mapGetters([
      'posBaseInfo',
    ]),
    // 添加快捷键
    rationDiscountHotkey() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.zero();
      // console.log(this.resData);
      const { data } = this.resData ? this.resData : '';
      // 优惠相关信息
      this.rationDiscount = data.discountPlan;
      this.canDiscountItemList = data.canDiscountItemList ? data.canDiscountItemList : []; // 被打折品项
      // 打开时,数据中无checkFlg,认定为初始打开且执行全部选中
      const first = find(this.canDiscountItemList, 'checkFlg');
      if (!first) {
        this.canDiscountItemList.forEach((item) => {
          this.$set(item, 'isChecked', true);
          this.selectAll = true;
        });
      } else {
        this.canDiscountItemList.forEach((item) => {
          if (item.checkFlg) {
            this.$set(item, 'isChecked', true);
          } else {
            this.$set(item, 'isChecked', false);
          }
        });
         this.selectAll = false;
      }

      this.amountOfDiscount = data.discountPlan.discTotalMoney
        ? data.discountPlan.discTotalMoney 
        : 0;

      this.baseBs = this.resData.baseBs;
      this.isTeamSettlementFlg = this.resData.isTeamSettlementFlg;
      this.isTeamBill = this.resData.isTeamBill;

      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      // 自动选中input内容
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    zero() { // 清空数据缓存
      this.amountOfDiscount = 0;
      this.canDiscountItemList = [];
      this.rationDiscount = {};
    },
    onClose() {
      this.close();
      this.zero();
    },
    selectItem(item) {
      const { isChecked } = item;
      if (isChecked) {
        this.$set(item, 'isChecked', false);
      } else {
        this.$set(item, 'isChecked', true);
      }
      const findIdNoChecked = this.canDiscountItemList.filter(_ => !_.isChecked);
      if (findIdNoChecked.length === 0) {
        this.selectAll = true;
      } else {
        this.selectAll = false;
      }
    },
    handleCheckAllChange(value) {
      this.canDiscountItemList.forEach((item) => {
        this.$set(item, 'isChecked', value);
      });
    },
    onSubmit(authData = {}) {
      if (this.amountOfDiscount > this.rationDiscount.disPriceLimit) {
        this.$message.error(`${this.$t('Biz.Settlement.Error2')}`);
        return false;
      }
      if (+this.amountOfDiscount <= 0) {
        this.$message.error(`${this.$t('Biz.Settlement.Error3')}`);
        return false;
      }
      if (!Number.isFinite(+this.amountOfDiscount)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error4')}`);
        return false;
      }
      if (!find(this.canDiscountItemList, ['isChecked', true])) {
        this.$message.error(`${this.$t('Biz.Settlement.Error84')}`);
        return false;
      }
      // 如果勾选项存在小计价格为0, 阻拦
      if (find(this.canDiscountItemList, {'isChecked': true, 'sale_price': 0})) {
        this.$message.error(`${this.$t('Biz.Settlement.Error85')}`);
        return false;
      }
      // 如果勾选项的(小计合计x 数量) < 输入优惠金额, 阻拦
      let sum = 0;
      this.canDiscountItemList.filter(item => item.isChecked).forEach((item) => {
        sum += multi(item.sale_price, item.last_qty);
      });
      if (sum < this.amountOfDiscount) {
        this.$message.error(`${this.$t('Biz.Settlement.Error86')}`);
        return false;
      }
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        disctype: this.resData.discTypeId,
        planid: this.resData.discountId,
        disPriceLimit: this.amountOfDiscount,
        controlMode: this.posBaseInfo.controlMode,
        items: [],
        ...authData,
      };
      // 匹配列表所有品项,添加checkFlg为选择相应值
      this.canDiscountItemList.forEach((item) => {
        params.items.push({
          'scId': item.id,
          'checkFlg': item.isChecked,
        });
      });
      // 代码注释不用
      // 如果是修改的话
      // if (this.resData.data.optType === 1) {
      //   params.type = 1;
      // }
      let url = 'canyin.pos.settlement.scale';
      // 判断团队
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
        params.teamPointIds = this.baseBs.teamPointIds;
        params.teamBsIds = this.baseBs.teamBsIds;
        url = 'canyin.pos.settlement.teamscale';
      }
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success) {
          // 上传优惠类型到vuex
          this.setDiscTypeCache(params);
          this.submit();
          this.$message.success(`${this.$t('Biz.Settlement.Success3')}`);
          this.close();
          this.zero();
        } else {
          this.$message({
            message: data.msg,
            type: 'warning',
          });
        }
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
      return '';
    },
    // 上传优惠类型到Vuex
    setDiscTypeCache(data) {
      this.setSettleDiscType({ list: data });
    },
    ...mapActions([
      'setSettleDiscType',
    ]),
  },
  filters: {
    keepTwo(val) {
      if (isNaN(Number(val))) return val;
      return numberformat(val);
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .p15{
    padding:15px;
  }
  .mb15{
    margin-bottom: 15px;
  }
  .df{
    display: flex;
  }
  .fc9{
    color: #999;
  }
  .discountBox{
    width: 100%;
    height: 100%;
  }
  .discount-left{
    width: 285px;
    height: 100%;
    .discount-left-title{
      font-size: 16px;
      font-weight: bold;
    }
    .discount-left-tip{
      color: #999;
      margin-bottom: 20px;
    }
  }
  .discount-border-right{
    border-right: none !important;
  }
  .discount-middle{
    width: 65%;
    background: #fff;
    border-right: 1px solid #999;
    position: relative;

    .discount-middle-title{
      height: 40px;
      padding: 0 15px;
      position: absolute;
      width: 100%;
    }

    .middleItemsBox{
      padding-top:40px;
      padding-bottom: 50px;
      height: 100%;
      overflow: hidden;
    }

    .content-title {
      border-bottom: 1px solid #ccc;
      padding: 11px 0;
      font-size: 12px;
      color: #666;
    }

    .content-title,
    .middleItemsBox {
      span {
        vertical-align: middle;
        text-align: center;
        display: inline-block;
      }
      .head-item-checkedbox,
      .list-item-checkedbox {
        width: 8%;
      }
      .head-item-order,
      .list-item-order {
        width: 14%;
      }
      .head-item-name,
      .list-item-name {
        width: 33%;
      }
      .head-item-number,
      .list-item-number {
        width: 20%;
      }
      .list-item-checkedbox {
        cursor: pointer;

        .isChecked {
          width: 14px;
          height: 14px;
          background-color: #0096a4;
          color: #fff;
          padding: 1px;
          font-weight: 100;
          border-radius: 2px;
          font-size: 12px;
        }
        .isNoChecked {
          width: 14px;
          height: 15px;
          display: inline-block;
          vertical-align: middle;
          border: 1px solid #dcdfe6;
          border-radius: 2px;
          &:hover {
            border: 1px solid #0096a4;
          }
        }
      }
    }

    .discount-middle-items{
      padding: 0 15px;
      height: 385px !important;
      overflow: hidden;

      li{
        height: 45px;
        padding: 14px 0;
        border-bottom: 1px solid #ccc;
      }
    }
  }
  .discountPager{
    height: 50px;
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-right: 15px;
    text-align: right;
    
    .selectAllBtn {
      float: left;
      width: 65px;
      height: 30px;
      margin: 3px 0 3px 14px;
      border: 1px solid #ddd;
      text-align: center;
      line-height: 30px;
      background-color: #f1f6f8;
    }
    .pagerBox {
      float: right;
    }

    span{
      color: #999;
      font-size: 12px;
    }
    .pos-pager{
      display: inline-block;
    }
  }
  .textOverflow{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info-keybord{
    width: 50%;
    // background-color: #f5f5f5;

    .money-info{
      line-height: 30px;
      border-bottom: 1px dashed #b5b5b5;
      margin-bottom: 40px;
      padding: 12px 16px;
      font-weight: bold;
      font-size: 14px;

      .showMoney {
        float: right;
        color: #0babb9;
      }

      .input-box {
        margin-top: 16px;

        &:after {
          visibility: hidden;
          clear: both;
          display: block;
          height: 0;
          content: " ";
        }
      }

      .input-txt {
        float: left;
      }
    }
  }

.keybord-content .keybord {
  margin: auto;
}
.input-content {
  width:140px;
  float: right;
  text-align: right;
}
.lang-enUS{
  .discount-middle .content-title .head-item-number{
    width: 21%;
  }
  .discount-middle .content-title .head-item-order{
    width: 12%;
  }
}
</style>
