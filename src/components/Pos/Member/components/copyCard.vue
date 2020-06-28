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
         onkeyup="value=value.replace(/[^\a-\z\A-\Z0-9]/g,'')"/>
        <el-button type="primary" @click="readCard">{{$t('Dict.CardReading')}}(Enter)</el-button>
      </div>
      <!-- 短信验证 -->
      <div class="mb35">
        <span class="inlineBlock textRight w120">
          <span class="sart">*</span>
          <span>{{$t('Biz.Pos.Member.CopyCardSpan201')}}</span>
        </span>
        <input class="w300 inputStyle" v-model="validationMsg" @input="checkValidation" />
        <el-button
          type="primary"
          :disabled="!isSendMsg || !verifyThrough"
          @click="sendvalidatesms"
        >
          {{mBtnTip}}
        </el-button>
      </div>
      <!-- 输入新外卡号 -->
      <div class="mb35">
        <span class="inlineBlock textRight w120">
          <span class="sart">*</span>
          <span>{{$t('Biz.Pos.Member.CopyCardSpan301')}}</span>
        </span>
        <input class="w300 inputStyle"
         v-model="newCardNo"
         @input="chackNewCardNo"
         onkeyup="value=value.replace(/[^\a-\z\A-\Z0-9]/g,'')"/>
      </div>
    </div>
    <!-- 按钮 -->
    <div class="textCenter mt50">
      <el-button @click="reset">{{$t('Biz.Crm.Reset')}}</el-button>
      <el-button type="primary" :disabled="!verifyThrough" @click="clickCopyCard">{{$t('Biz.Pos.Member.CopyCardBtn3')}}</el-button>
    </div>
    <SelectCardNum ref="selectCardNum"></SelectCardNum>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui';
import ajax from '@/common/js/ajax';
import SelectCardNum from './selectCardNum';

export default {
  components: { SelectCardNum },
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
      accountNum: '', // 卡号手机号
      validationMsg: '', // 短信验证码
      newCardNo: '', // 新外卡号
      verifyThrough: false, // 是否读卡
      selectCardInfo: {}, // 已选的卡信息
      mBtnTip: this.$t('Biz.Settlement.SendVerificationCode'), // 按钮文字
      isSendMsg: true, // 是否可以发送短信验证
      pattern: new RegExp("[\\-\\+\"`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"),
    };
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
      this.cardmessage();
      // 补卡不支持读卡器读卡功能
      // if (this.accountNum === ''){
      //   var _this = this;
      //   this.$emit('readRGJCardNo', function(res){
      //     if(res){  // 读卡器成功读到卡
      //       _this.cardmessage(res.CardNo)
      //     }
      //   });
      // }else{
      //   this.cardmessage()
      // }
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
    hyUserInfoFun(res) {
      this.verifyThrough = true;
      this.selectCardInfo = res;
      // 向父元素传递卡信息
      this.$emit('userCardInfo', res);
      this.accountNum = res.hardCardNumber;
    },
    chackAccountNum() {
      this.accountNum = this.checkcardNumFun(this.accountNum);
    },
    chackNewCardNo() {
      this.newCardNo = this.checkcardNumFun(this.newCardNo);
    },
    checkcardNumFun(resData) {
      let res = resData;
      let rs = '';
      let num = '';
      res = res.replace(/[\u4e00-\u9fa5]/g, '');
      for (let i = 0; i < res.length; i += 1) {
        rs += res.substr(i, 1).replace(this.pattern, '');
      }
      num = rs.toUpperCase();
      return num;
    },
    checkValidation() {
      let rs = '';
      this.validationMsg = this.validationMsg.replace(/[\u4e00-\u9fa5|a-z|A-Z]/g, '');
      for (let i = 0; i < this.validationMsg.length; i += 1) {
        rs += this.validationMsg.substr(i, 1).replace(this.pattern, '');
      }
      this.validationMsg = rs;
    },
    sendvalidatesms() { // 发送验证码
      this.isSendMsg = false;
      this.sendTimer();
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.sendvalidatesms', {
        contentType: 'URLEncoded',
        data: {
          mobile: this.selectCardInfo.mobile,
          validateCode: 'verifyChargeCardNumber',
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          // 源代码这里就没有任何逻辑处理，做个标记
        } else {
          this.$message.error(res.message);
        }
      });
    },
    sendTimer() {
      let time = 60;
      this.interSend = setInterval(() => {
        if (time === 0) {
          clearInterval(this.interSend);
          this.isSendMsg = true;
          this.mBtnTip = this.$t('Biz.Settlement.SendVerificationCode');
        } else {
          this.mBtnTip = `(${time})${this.$t('Dict.Second')}`;
        }
        time -= 1;
      }, 1000);
    },
    strIsEmpty(str) {
      return str == null || !str || typeof str === 'undefined' || str === '' || str.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    },
    clickCopyCard() { // 补卡
      // 校验
      if (!this.checkBeforeSubmit()) { return; }
      // 请求补卡接口
      const params = {
        hardCardNumber: this.selectCardInfo.hardCardNumber, // 会员外卡号
        newHardCardNumber: this.newCardNo, // 新卡号
        verifyPasswordType: 'M', // 身份验证方式
        verifyPassword: this.validationMsg, // 身份验证码
        mobile: this.selectCardInfo.mobile, // 验证的手机号
        password: null, // 新卡密码
        passwordType: this.selectCardInfo.passwordType, // 新卡密码类型
        storeCode: this.selectCardInfo.storeId, // 开卡门店id
      };
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.suppleCard', {
        contentType: 'URLEncoded',
        data: {
          suppleCardParams: JSON.stringify(params),
        },
      }).then((res) => {
        if (+res.code === 0) {
          this.$message.success(res.message);
          this.wirteCard(res.data);
        } else {
          this.$message.error(res.message);
        }
      });
    },
    wirteCard(data) {
      const cardno = {
        uid: data,
        psw: 'FFFFFF',
        comport: this.rgjCrmInfo.comport,
        comrate: this.rgjCrmInfo.comrate,
      };
      this.$devices.Cardop.writeNewCardRGJ((card) => {
        MessageBox.alert(card.MsgText, this.$t('Dict.Tips'));
      }, cardno);
    },
    checkBeforeSubmit() {
      const reg = /^[a-zA-Z0-9]+$/;
      if (this.strIsEmpty(this.accountNum) || !reg.test(this.accountNum)) {
        this.$message.error(this.$t('Biz.Pos.Member.CopyCardMsg1'));
        return false;
      }
      if (this.strIsEmpty(this.validationMsg)) {
        this.$message.error(this.$t('Biz.Settlement.EnterVerificationCode'));
        return false;
      }
      if (this.strIsEmpty(this.newCardNo) || !reg.test(this.newCardNo)) {
        this.$message.error(this.$t('Biz.Pos.Member.CopyCardMsg3'));
        return false;
      }
      return true;
    },
    reset() { // 重置
      this.accountNum = '';
      this.validationMsg = '';
      this.newCardNo = '';
      this.verifyThrough = false;
      this.selectCardInfo = {};
      this.mBtnTip = this.$t('Biz.Settlement.SendVerificationCode');
      this.isSendMsg = true;
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
    margin-bottom: 35px;
  }
</style>
