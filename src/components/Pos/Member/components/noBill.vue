<template>
  <div class="copyCard">
    <div class="inlineBlock textLeft">
      <!-- 卡号/手机号 -->
      <div class="mb35">
        <span class="inlineBlock textRight w120">
            <span class="sart">*</span>
            <span>{{$t('Biz.Crm.CardTelNum')}}</span>
        </span>
        <input
            class="w300 inputStyle"
            v-model="accountNum"
            @input="chackAccountNum"
            onkeyup="value=value.replace(/[^\a-\z\A-\Z0-9]/g,'')"
        />
        <el-button type="primary" @click="readCard">{{$t('Dict.CardReading')}}(Enter)</el-button>
      </div>
      <div>
        <!-- 还挂账 -->
          <div class="mb35">
              <span class="inlineBlock textRight w120">
                  <span class="sart">*</span>
                  <span>{{$t('Biz.Pos.Member.NoBillSpan2')}}</span>
              </span>
              <el-radio v-model="isRepayment" label="1" >是</el-radio>
              <el-radio v-model="isRepayment" label="0" >否</el-radio>
          </div>
         <!-- 已开发票 -->
          <div class="mb35">
             <span class="inlineBlock textRight w120">
                  <span class="sart">*</span>
                  <span>{{$t('Biz.Settlement.Invoiced')}}</span>
              </span>
              <el-radio v-model="isInvoice" label="1" >是</el-radio>
              <el-radio v-model="isInvoice" label="0" >否</el-radio>
          </div>
        <!-- 消费金额 -->
          <div class="mb35">
            <span class="inlineBlock textRight w120">
                <span class="sart">*</span>
                <span>{{$t('Biz.Booking.ConsumeMoney')}}</span>
            </span>
            <input class="w300 inputStyle" v-model="rechargeMoney" @input="checkMoney" />
            <el-button
              type="primary"
              :disabled="!verifyThrough"
              @click="onSubmit">
            {{$t('Dict.Confirm')}}
            </el-button>
          </div>
          <!-- 备注 -->
          <div class="mb35">
            <span class="inlineBlock textRight w120">{{$t('Dict.Remarkss')}}</span>
            <el-input
             type="textarea"
             class="w300 verticalAlignTop"
             :autosize="{ minRows:3, maxRows: 3}"
             resize="none"
             :placeholder="$t('Biz.Pos.Member.NoBillPh1')"
             v-model="remarks"
             :maxlength="50">
            </el-input>
          </div>
        </div>
      </div>
    <SelectCardNum ref="selectCardNum"></SelectCardNum>
    <PayWayRGJcrmYZModel ref="payWayRGJcrmYZModel"></PayWayRGJcrmYZModel>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import SelectCardNum from './selectCardNum';
import PayWayRGJcrmYZModel from '@/components/Pos/Order/Bill/Pay/components/PayWayRGJcrmYZModel';

export default {
  components: { SelectCardNum, PayWayRGJcrmYZModel },
  props: {
    rgjCrmInfo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isRepayment: '0',
      isInvoice: '0',
      remarks: '',
      rechargeMoney: '',
      accountNum: '', // 卡号手机号
      verifyThrough: false, // 是否读卡
      hyUserInfo: null, // 已选的卡信息
      pattern: new RegExp("[\\-\\+\"`~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"),
    };
  },
  mounted() {
    this.hotKey();
  },
  methods: {
    hotKey() {
      this.$hotKey.set('Pos.noBill', {
        // 读卡
        Enter: () => {
          this.readCard();
        },
      });
    },
    checkMoney() {
      let rs = '';
      this.rechargeMoney = this.rechargeMoney.replace(/[\u4e00-\u9fa5|a-z|A-Z]/g, '');
      for (let i = 0; i < this.rechargeMoney.length; i += 1) {
        rs += this.rechargeMoney.substr(i, 1).replace(this.pattern, '');
      }
      const index = rs.indexOf('.');
      if (index > -1) {
        const rsArr = rs.split('.');
        rs = `${rsArr[0]}.${rsArr[1].substring(0, 2)}`;
      }
      this.rechargeMoney = rs;
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
    reset() {
      this.isRepayment = '0';
      this.rechargeMoney = '';
      this.accountNum = '';
      this.isInvoice = '0';
      this.remarks = '';
    },
    cardmessage(cardNo) {
      const reg = /^[a-zA-Z0-9]+$/;
      if (!cardNo && (this.strIsEmpty(this.accountNum) || !reg.test(this.accountNum))) {
        this.$message.error(this.$t('Biz.Pos.Member.CopyCardMsg1'));
        return;
      }
      this.$emit('userCardInfo', {});
      const code = cardNo || (this.accountNum ? this.accountNum.toUpperCase() : null);
      this.$emit('querycardmessage', {
        cardNo: code,
        msgfun: (res) => {
          if (+res.id === 1) {
            this.hyUserInfoFun(res.data, cardNo);
          } else if (+res.id === 2) {
            this.$refs.selectCardNum.open({ cardList: res.data }, {
              submit: (data) => {
                this.hyUserInfoFun(data, cardNo);
              },
            });
          }
        },
      });
    },
    onSubmit() {
      if (!this.verifyThrough) { return; }
      const n1 = Number(this.rechargeMoney);
      const n2 = Number(this.waitPayMoney);
      if (!this.watchPayMoney(n1, n2)) {
        return;
      }
      if (this.rechargeMoney > this.hyUserInfo.value) {
        this.$message.error(this.$t('Biz.Pos.Member.NoBillMsg2'));
        return;
      }
      // 点击结算--弹出验证框
      const type = this.hyUserInfo.passwordType;
      // const cardTypeId = this.hyUserInfo.memberCardTypeId;
      if (type === 'U') { // 无需验证或匿名卡
        this.xrjSettle({
          validatePasswordType: 'U',
          verifyPassword: null,
        });
      } else {
        this.$refs.payWayRGJcrmYZModel.open({
          type: this.hyUserInfo.passwordType,
          userInfo: this.hyUserInfo,
        },
        {
          submit: (data) => {
            this.xrjSettle(data);
          },
        });
      }
    },
    xrjSettle(res) { // 结算
      const params = {
        memberId: this.hyUserInfo.memberProfileId, // 会员id
        amount: Number(this.rechargeMoney).toFixed(2), // 支付金额
        hardCardNumber: this.hyUserInfo.hardCardNumber, // 实体卡号
        cardNumber: this.hyUserInfo.cardNumber, // 卡号
        bsId: '', // 营业流水号
        pointId: '', // 客位id
        isInvoice: this.isInvoice, // 是否已开发票
        remark: this.remarks, // 备注
        isCredit: this.isRepayment, // 是否是会员还挂账
        isNoConsumption: 1, // 是否是无消费扣款，由于目前就是无消费付款，暂时写死
        mobile: this.hyUserInfo.mobile, // 手机号
        cardTypeId: this.hyUserInfo.memberCardTypeId, // 卡类型id
        cardTypeName: this.hyUserInfo.memberCardTypeName, // 卡型名称
        validatePasswordType: res.validatePasswordType, // 验证方式
        verifyPassword: res.verifyPassword, // 密码 或 短信验证码
      };
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.settle', {
        contentType: 'URLEncoded',
        data: {
          settleParams: JSON.stringify(params),
        },
      }).then((resData) => {
        const resobj = JSON.parse(resData);
        if (+resobj.code === 0) {
          this.$refs.payWayRGJcrmYZModel.close();
          this.$message.success(this.$t('Biz.Pos.Member.NoBillMsg3'));
          this.reset();
          this.$emit('userCardInfo', {});
        } else {
          this.$message.error(resobj.message);
        }
      });
    },
    watchPayMoney(n1, n2) {
      if (n1 <= 0) {
        this.$message.warning(this.$t('Biz.Pos.Member.NoBillMsg4'));
        return false;
      }
      if (Number.isNaN(n1)) {
        this.$message.warning(this.$t('Biz.Pos.Member.NoBillMsg4'));
        return false;
      }
      if (n1 > n2) {
        this.$message.warning(this.$t('Biz.Pos.Member.NoBillMsg5'));
        return false;
      }
      if (n1.toString().indexOf('.') !== -1 && n1 !== 0) {
        const i = n1.toString().indexOf('.');
        if (n1.toString().substr(i + 1).length > 3 && !Number.isNaN(Number(n1))) {
          this.$message.warning(this.$t('Biz.Settlement.Warning27'));
          this.rechargeMoney = n1.toString().substr(0, i + 3);
          return false;
        }
      }
      return true;
    },
    hyUserInfoFun(res) {
      this.verifyThrough = true;
      this.hyUserInfo = res;
      this.waitPayMoney = Number(res.value);
      // 向父元素传递卡信息
      this.$emit('userCardInfo', res);
      this.accountNum = res.hardCardNumber;
    },
    chackAccountNum() {
      this.accountNum = this.checkcardNumFun(this.accountNum);
    },
    checkcardNumFun(data) {
      let res = data;
      let rs = '';
      let num = '';
      res = res.replace(/[\u4e00-\u9fa5]/g, '');
      for (let i = 0; i < res.length; i += 1) {
        rs += res.substr(i, 1).replace(this.pattern, '');
      }
      num = rs.toUpperCase();
      return num;
    },
    strIsEmpty(str) {
      return str == null || !str || typeof str === 'undefined' || str === '' || str.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .copyCard{
    padding-top: 25px;
    text-align: center;
    button{
      width: 115px;
    }
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
    margin-bottom: 20px;
  }
</style>
