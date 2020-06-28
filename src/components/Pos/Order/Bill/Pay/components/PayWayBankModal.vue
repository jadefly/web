<template>
  <Dialog
    name="PosDialog.PayWayBankModal"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayBankModal"
    :append-to-body="true"
    :showSubmit="true"
    width="618px"
    submitId="payWayBankSubmit"
  >
  <div class="content payway-check-modal">
    <div class="form" v-keyboard:keyboard="{ autoSelect: true }">
      <div class="money-item">
        <label class="item-title">{{$t('Biz.Settlement.PaymentAmount')}}</label>
        <div class="item-content">
          <el-input
            v-line
            v-judge
            id="bankMoneyInput"
            class="text-right"
            v-model="money"
            :disabled="isBuffet"
            size="medium"
            :placeholder="$t('Dict.PleaseEnterPayAmount')"
          >
          </el-input>
        </div>
      </div>
      <div class="money-item">
        <label class="item-title">{{$t('Dict.CardNumberLabel')}}</label>
        <div class="item-content"
          ref="cardno">
          <el-input
            class="text-right"
            v-model="cardno"
            maxlength="20"
            size="medium"
            :placeholder="$t('Biz.Settlement.EnterBankCardNumber')"
            v-judge
            v-autotest>
          </el-input>
        </div>
      </div>
      <div class="cardtype-item">
        <label class="item-title">{{$t('Dict.CardType1')}}</label>
        <div class="cardtype-list">
          <div class="btn-item"
            v-for="item in showBanks"
            :key="item.id">
            <button
              v-autotest
              type="button"
              class="btn btn-default"
              :class="{'btn-primary':currentBank && currentBank.id === item.id}"
              @click="changeBank(item)">{{item.name}}</button>
          </div>
        </div>
        <div class="pos-pager"
          v-show="bankcards.length > prePageSize">
          <div class="pos-takeout-pager">
            <span class="page-info">{{
              $t('Dict.PageStyle.Text1', {
                length: bankcards.length,
                currentPage,
                totalPage: pageCount(bankcards),
              })
            }}</span>
            <button href="javascript:;" class="prev" @click="upPage">
              <i class="el-icon-arrow-up"></i>
            </button>
            <button href="javasctipt:;" class="next" @click="downPage(bankcards)">
              <i class="el-icon-arrow-down"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="remark-item"
        v-if="!isBuffet">
        <label class="item-title">{{$t('Dict.Remarkss')}}</label>
        <div>
          <el-input
            v-autotest
            type="textarea"
            :maxlength="80"
            v-model="remark"
            @focus="showAndroidInput('remark')"
            :autosize="{ minRows: 2, maxRows: 4}"
            :placeholder="$t('Dict.EnterSomething')">
          </el-input>
        </div>
      </div>
    </div>
    <div class="info-keybord">
      <div class="money-info">
        <span class="title">{{$t('Biz.Settlement.AmountToPaid01')}}</span>
        <span class="line-through">
          <span class="money">{{amountToBePaid | keepTwo}}</span>
        </span>
      </div>
      <div class="keybord-content">
        <KeyBoard
          class="keybord"
          ref="keyboard"
          :isBuffet="isBuffet"></KeyBoard>
      </div>
    </div>
  </div>
  <AndroidInput ref="AndroidInput"></AndroidInput>
  </Dialog>
</template>

<script>
import { isNaN } from 'lodash';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';

import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';

export default {
  components: { Dialog, KeyBoard, AndroidInput },
  mixins: [DialogMixin, PageMixin, AndroidInputMixin],
  props: {
    bsData: {
      type: Object,
      default: () => ({}),
    },
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
    // 自助押金的结算支付方式公用了此组件，根据传参来执行结算逻辑还是自助押金逻辑，
    // 目前影响是备注是否显示，支付金额可否编辑，提交时执行对应模块逻辑
    isBuffet: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      payWayInfo: {
        name: '',
      },
      bankcards: [],
      currentBank: { id: null, name: '' },
      prePageSize: 6,
      money: 0,
      cardno: '',
      remark: '',
      isWithdrawCashEnable: '',
    };
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },
  computed: {
    // 添加快捷键
    PayWayBankModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    showBanks() {
      return this.pagination(this.currentPage, this.prePageSize, this.bankcards);
    },
  },
  created() {
    this.$von('closePayWayBankModal', () => {
      this.close();
    });
  },
  methods: {
    // 打开时获取银行卡信息
    onOpen() {
      this.payWayInfo = this.resData.payWay;
      this.isWithdrawCashEnable = this.resData.isWithdrawCashEnable;
      this.currentBank = { id: null, name: '' };
      this.currentPage = 1;
      this.money = this.amountToBePaid;
      this.cardno = '';
      this.remark = '';
      if (this.isBuffet) { // 由登记押金页面进来的话 自动选中第二行input
        this.$nextTick(() => {
          this.$refs.cardno.children[0].children[0].focus();
        });
      } else if (this.$refs.keyboard) { // 输入框 全选中 输入内容
        this.$refs.keyboard.reSelect();
      }
      ajax('canyin.pos.settlement.pay.bankcardtypepayway', {
        params: {
          paywayid: this.payWayInfo.id,
          bsid: this.bsData.id,
        },
      }).then((data) => {
        data.banks.unshift({ id: null, name: this.$t('Dict.Null') });
        this.bankcards = data.banks;
      });
    },
    onClose() {
      this.$emit('clearActivePayWayTypeIndex'); // 清空登记押金页面选中的支付方式
    },
    // 更改银行卡
    changeBank(bank) {
      this.currentBank = bank;
    },
    // 点击提交
    onSubmit() {
      if (this.isBuffet) {
        this.buffetDepositSubmit();
      } else {
        this.settleSubmit();
      }
    },
    // 自助押金模块的提交
    async buffetDepositSubmit() {
      // if (this.cardno === '') {
      //   this.$message.warning('请输入卡号');
      //   return;
      // }
      if (this.cardno !== '' && !/^\d*$/.test(this.cardno)) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning14')}`);
        return;
      }
      if (!this.currentBank) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning15')}`);
        return;
      }
      // 请求登记押金页面接口
      const result = await this.submit({ cardNo: `${this.cardno}`, typeId: this.currentBank.id });
      if (result) {
        this.close();
        this.$nextTick(() => {
          this.$emit('closeRegisterDeposit', true); // 关闭登记押金页面
        });
      }
    },
    // 结算模块的提交
    settleSubmit() {
      if (isNaN(Number(this.money))) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning16')}`);
        return;
      }
      const { isWithdrawCashEnable } = this;
      if (isWithdrawCashEnable === undefined || isWithdrawCashEnable === 0) {
        if (Number(this.money) > Number(this.amountToBePaid)) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning17')}`);
          return;
        }
      }
      if (Number(this.money) <= 0) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning18')}`);
        return;
      }
      // if (this.cardno === '') {
      //   this.$message.warning('请输入卡号');
      //   return;
      // }
      if (this.cardno !== '' && !/^\d*$/.test(this.cardno)) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning14')}`);
        return;
      }

      this.$emit('add-pay-way', {
        name: this.payWayInfo.name,
        payway_id: this.payWayInfo.id,
        payway_type_id: this.payWayInfo.payway_type_id
          ? this.payWayInfo.payway_type_id
          : this.payWayInfo.paywayTypeId,
        take_money: Number(this.money),
        is_confirm_delete: this.payWayInfo.isconfirmdelete,
        use_alone: this.payWayInfo.is_use_alone,
        isolpayway: this.payWayInfo.isolpayway,
        dis_name: this.currentBank.name === '' ? null : this.currentBank.name,
        card_no: this.cardno,
        remark: this.remark,
        type_id: this.currentBank.id,
      });
      this.isWithdrawCashEnable = '';
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content{
  display: table;
  width: 100%;
  >*{
    display: table-cell;
    vertical-align: top;
  }
}
.form{
  width: 356px;
  background-color: @white;
  padding: 16px;
  border-right: 1px solid #ddd;
}
.money-item{
  margin-bottom: 16px;
  display: table;
  width: 100%;
  >*{
    display: table-cell;
  }
}
.item-title{
  font-size: 14px;
  color: #333;
  font-weight: normal;
  width: 72px;
}
.cardtype-item{
  margin-bottom: 4px;
}
.cardtype-list{
  margin: 0 -6px;
  height: 92px;
  .btn-item{
    padding: 6px;
    display: inline-block;
    width: 33.3%;
  }
  button{
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.info-keybord{
  background-color: #f5f5f5;
}
.money-info{
  line-height: 60px;
  border-bottom: 1px dashed #b5b5b5;
  padding: 0 16px;
  font-weight: bold;
  font-size: 14px;

  .title{
    color: #333;
  }
  .line-through {
    float: right;
    color: #ffffff;
    text-decoration: line-through;
  }
  .money{
    color: #0babb9;
  }
}
.keybord-content{
  padding: 20px 0;
  .keybord{
    text-align: center;
    margin: 0 auto;
  }
}

.pos-pager{
  position: relative;
  height: 50px;
}

// 箭头按钮
.pos-takeout-pager {
  position: absolute;
  right: 0;
  bottom: 12px;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
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
</style>
<style lang="less">
.payway-check-modal{
  .text-right{
    .el-input__inner{
      text-align: right;
    }
  }
}
</style>
