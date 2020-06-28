<template>
  <div class="recharge">
    <div class="inlineBlock textLeft">
      <!-- 卡号/手机号 -->
      <div class="mb35">
        <span class="inlineBlock textRight w120">
          <span class="sart">*</span>
          <span>{{$t('Biz.Crm.CardTelNum')}}</span>
        </span>
        <input class="w300 inputStyle" v-model="accountNum" @input="checkcardNumFun" />
        <el-button type="primary" @click="readCard">{{$t('Dict.CardReading')}}(Enter)</el-button>
      </div>
      <!-- 充值金额 -->
      <div class="mb35">
        <span class="inlineBlock textRight w120">
          <span class="sart">*</span>
          <span>{{$t('Biz.Pos.Member.RechargeSpan2')}}</span>
        </span>
        <input class="w300 inputStyle" v-model="rechargeMoney" @input="checkMoney" :maxlength="7"/>
        <el-button type="primary" :disabled="!verifyThrough" @click="clickMoneyBtn">{{$t('Dict.Confirm')}}</el-button>
      </div>
      <!-- 赠送金额 & 充值总额 -->
      <div class="mb35">
        <span class="inlineBlock textRight w120">{{$t('Biz.Pos.Member.RechargeSpan3')}}</span>
        <span>{{giveMoney}}</span>
      </div>
      <div class="mb35">
        <span class="inlineBlock textRight w120">{{$t('Biz.Pos.Member.RechargeSpan4')}}</span>
        <span>{{rechargeTotalMoney}}</span>
      </div>
      <!-- 充值规则 -->
      <div class="mb35">
        <span class="inlineBlock textRight w120">{{$t('Biz.Pos.Member.RechargeSpan5')}}</span>
        <div class="w450 rechargeRuleStyle inlineBlock verticalAlignTop lineFeed">
          {{rechargeRule ? rechargeRule : `${$t('Biz.Settlement.Invoiced')}`}}
        </div>
      </div>
      <!-- 支付类型 -->
      <div class="mb35">
        <span class="inlineBlock textRight w120">
          <span class="sart">*</span>
          <span>{{$t('Dict.PaymentMethod01')}}</span>
        </span>
        <el-select v-model="selectPayWayId" @change="selectPayWayFun">
          <el-option
            v-for="(item, index) in payWayList"
            :key="index"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="mb35">
          <span class="inlineBlock textRight w100"><span class="sart">*</span>{{$t('Biz.Settlement.Invoiced')}}</span>
          <el-radio v-model="isInvoice" label="1">{{$t('Dict.TrueVal')}}</el-radio>
          <el-radio v-model="isInvoice" label="0">{{$t('Dict.FalseVal')}}</el-radio>
        </div>
      <!-- 按钮 -->
      <div class="textCenter mt50">
        <el-button @click="reset">{{$t('Biz.Crm.Reset')}}</el-button>
        <el-button
          type="primary"
          :disabled="!verifyThrough || !isCheckMoney"
          @click="rechargeConfirm"
        >
          {{$t('Dict.Confirm')}}
        </el-button>
      </div>
    </div>
    <SelectCardNum ref="selectCardNum"></SelectCardNum>
  </div>
</template>

<script>
import SelectCardNum from './selectCardNum';
import ajax from '@/common/js/ajax';

export default {
  components: { SelectCardNum },
  props: {
    cardNum: {
      default: '',
    },
    rule2: {
      default: '',
    },
  },
  data() {
    return {
      isInvoice: '0',
      accountNum: '', // 卡号/手机号 -- 账号
      rechargeMoney: '', // 充值金额
      giveMoney: '0', // 赠送金额
      rechargeTotalMoney: '0', // 充值总额
      rechargeRule: '', // 充值规则
      selectPayWayId: '', // 已选择的支付类型id
      selectPayWayInfo: '', // 已选支付类型的信息
      payWayList: [], // 支付类型
      verifyThrough: false, // 验证账号是否通过
      selectCardInfo: '', // 已选卡号的卡信息
      isCheckMoney: false, // 金额是否及进行优惠验证
      pattern: new RegExp("[\\-\\+\"`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"),
      rechargeLock: false,
    };
  },
  created() {
    if (this.cardNum) {
      this.accountNum = this.cardNum;
      this.readCard();
    }
    if (this.rule2) {
      this.rechargeRule = this.rule2;
    }
    // 获取支付方式
    ajax('canyin.pos.settlement.pay.glorybutlerpayway.payways', {
      contentType: 'paramsEncoded',
    }).then((res) => {
      const payWay = res;
      this.payWayList = [];
      payWay.forEach((itemData) => {
        const item = itemData;
        const { id } = item;
        // 支付宝31，微信30，人民币1，支票6，银行卡2
        if (+id === 1 || +id === 2
           || +id === 2230100000000000010
           || +id === 2230100000000000005
           || +id === 6 || +id === 30 || +id === 31) {
          item.id = (item.id).toString();
          this.payWayList.push(item);
        }
      });
    });
  },
  mounted() {
    this.hotKey();
  },
  methods: {
    hotKey() {
      this.$hotKey.set('Pos.Member', {
        // 读卡
        Enter: () => {
          this.readCard();
        },
      });
    },
    readCard() {
      if (this.accountNum === '') {
        this.$emit('readRGJCardNo', (res) => {
          if (res) { // 读卡器成功读到卡
            this.cardmessage(res.CardNo);
          }
        });
      } else {
        this.cardmessage();
      }
    },
    cardmessage(cardNo) {
      const reg = /^[a-zA-Z0-9]+$/;
      if (!cardNo && (this.strIsEmpty(this.accountNum) || !reg.test(this.accountNum))) {
        this.$message.error(this.$t('Biz.Pos.Member.RechargeMsg1'));
        return;
      }
      this.$emit('userCardInfo', {});
      const code = cardNo || (this.accountNum ? this.accountNum.toUpperCase() : null);
      this.$parent.querycardmessage(code, (res) => {
        if (+res.id === 1) {
          this.hyUserInfoFun(res.data, cardNo);
        } else if (+res.id === 2) {
          this.$refs.selectCardNum.open({ cardList: res.data }, {
            submit: (data) => {
              this.hyUserInfoFun(data, cardNo);
            },
          });
        }
      });
    },
    checkMoney() {
      let rs = '';
      this.rechargeMoney = this.rechargeMoney.replace(/[\u4e00-\u9fa5|a-z|A-Z]/g, '');
      for (let i = 0; i < this.rechargeMoney.length; i += 1) {
        rs += this.rechargeMoney.substr(i, 1).replace(this.pattern, '');
      }
      this.rechargeMoney = rs;
    },
    hyUserInfoFun(res) {
      this.verifyThrough = true;
      this.selectCardInfo = res;
      this.rechargeRule = res.cardRuleMessage ? res.cardRuleMessage.replace(/\\n/g, ' \r\n ') : '';
      // 向父元素传递卡信息
      this.$emit('userCardInfo', res);
      this.accountNum = res.hardCardNumber;
    },
    clickMoneyBtn() { // 获取赠送金额
      const reg = /^[1-9]\d*$/;
      const money = Number(this.rechargeMoney);
      if (!reg.test(money) || money > 9999999) {
        this.$message.error(this.$t('Biz.Pos.Member.RechargeMsg2'));
        return;
      }
      // 调取接口获得赠送金额
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.getprincipalamount', {
        contentType: 'URLEncoded',
        data: {
          amount: Number(this.rechargeMoney).toFixed(0),
          storeCode: this.selectCardInfo.storeId, // 开卡门店的id
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          this.isCheckMoney = true;
          this.giveMoney = res.data.giveAmount;
          this.rechargeTotalMoney = Number(this.giveMoney) + Number(this.rechargeMoney);
        } else {
          this.$message.error(res.message);
        }
      });
    },
    rechargeConfirm() { // 充值确认按钮
      if (!this.checkBeforeSubmit()) { return; }
      // 调取充值接口
      if (!this.rechargeLock) {
        this.rechargeLock = true;
        const params = {
          hardCardNumber: this.selectCardInfo.hardCardNumber, // 卡号
          amount: Number(this.rechargeMoney).toFixed(0), // 充值本金
          paywayId: this.selectPayWayInfo.id, // 支付方式的id
          creditValueMethodId: this.selectPayWayInfo.name, // 支付方式的名称
          memberId: this.selectCardInfo.memberProfileId, // 会员id
          remark: null, // 备注
          expiryDate: '', //  截止时间
          cardTypeId: this.selectCardInfo.memberCardTypeId, // 卡类型
          cardTypeName: this.selectCardInfo.memberCardTypeName, // 卡类型名称
          presentAmount: this.giveMoney, // 赠送金额
          totalAmount: this.rechargeTotalMoney, // 充值总金额
          mobile: this.selectCardInfo.mobile, // 手机号
          memberName: this.selectCardInfo.name, // 会员名称
          isInvoice: this.isInvoice, // 是否开发票
        };
        ajax('canyin.pos.settlement.pay.glorybutlerpayway.recharge', {
          contentType: 'URLEncoded',
          data: {
            rechargeParams: JSON.stringify(params),
          },
        }).then((resData) => {
          const res = JSON.parse(resData);
          if (+res.code === 0) {
            this.reset();
            this.$message.success(res.message);
          } else {
            this.$message.error(res.message);
          }
          this.rechargeLock = false;
        }).catch((errCode, msg) => {
          this.$alert(msg, this.$t('Biz.Pos.Member.RechargeMsg3'));
          this.rechargeLock = false;
        });
      }
    },
    checkBeforeSubmit() {
      if (this.strIsEmpty(this.accountNum)) {
        this.$message.error(this.$t('Biz.Pos.Member.RechargeMsg4'));
        return false;
      }
      const reg = /^[1-9]\d*$/;
      if (!reg.test(Number(this.rechargeMoney))) {
        this.$message.error(this.$t('Biz.Pos.Member.RechargeMsg5'));
        return false;
      }
      if (!this.selectPayWayId) {
        this.$message.error(this.$t('Biz.Pos.Member.RechargeMsg6'));
        return false;
      }
      return true;
    },
    strIsEmpty(str) {
      return str == null || !str || typeof str === 'undefined' || str === '' || str.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    },
    reset() {
      this.accountNum = '';
      this.rechargeMoney = '';
      this.giveMoney = 0;
      this.rechargeTotalMoney = 0;
      this.selectPayWayId = '';
      this.verifyThrough = false;
      this.isCheckMoney = false;
      this.isInvoice = '0';
      this.$emit('userCardInfo', {});
    },
    selectPayWayFun(res) {
      this.payWayList.forEach((item) => {
        if (+item.id === +res) {
          this.selectPayWayInfo = item;
        }
      });
    },
    checkcardNumFun() {
      let rs = '';
      this.accountNum = this.accountNum.replace(/[\u4e00-\u9fa5]/g, '');
      for (let i = 0; i < this.accountNum.length; i += 1) {
        rs += this.accountNum.substr(i, 1).replace(this.pattern, '');
      }
      this.accountNum = rs;
      this.accountNum = this.accountNum.toUpperCase();
    },
  },
};
</script>


<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .recharge{
    padding-top: 25px;
    text-align: center;
    .w120{
      width: 120px;
    }
    .mt50{
      margin-top: 50px;
    }
    .lineFeed {
      white-space: pre-wrap;
    }
  }
  .rechargeRuleStyle{
    max-height: 175px;
    overflow: auto;
    line-height: 25px;
  }
  .mb35{
    margin-bottom: 35px;
  }
</style>
