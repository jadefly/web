
<template>
  <Dialog
      name="PosDialog.PayWayRGJcrm"
      :title="$t('Biz.Settlement.PayWayRGJcrm')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :showSubmit="true"
      :hotkeys="ration"
      :append-to-body="true"
      width="730px"
    >
    <div class="payWayRGJcrm">
      <!-- 左：金额 -->
      <div class="payWayRGJcrm-pay">
        <div class="mb25 waitPayMoney">
          <span class="inlineBlock">{{$t('Biz.Settlement.AmountToPaid01')}}</span>
          <span class="line-through">
            <span class="money">{{waitPayMoney}}</span>
          </span>
        </div>
        <div class="mb25">
          <span class="inlineBlock">
             <span class="sart">*</span><span>{{$t('Biz.Crm.CardTelNum')}}</span></span>
          <input
            class="inputStyle"
            v-model="accountNum"
            @input="checkcardNumFun"
          />
          <el-button type="primary" @click="readCard">{{$t('Dict.CardReading')}}(Enter)</el-button>
        </div>
        <div class="mb25" v-if="verifyThrough">
          <span class="inlineBlock textRight w110">
          <span class="sart">*</span><span>{{$t('Biz.Settlement.PaymentAmount')}}</span></span>
          <input class="w300 inputStyle" v-model="payMoney" ref="inputValue"/>
        </div>
      </div>
      <div class="payWayRGJcrm-info">
        <!-- 白色背景 -->
        <div class="infoBox">
          <!-- header -->
          <img src="../images/vip_head_1.png" >
          <div v-if="!isHYInfo" class="tip" >{{$t('Biz.Settlement.ShowAfterEnter')}}</div>
          <div v-if="isHYInfo" class="userInfoStyle">
            <!-- xinxi -->
            <div class="name textCenter">{{hyUserInfo.memberProfileName}}</div>
            <div class="phone textCenter">
              {{ hyUserInfo.mobile ?
                 hyUserInfo.mobile.substr(0, 3) + '****' + hyUserInfo.mobile.substr(7) :
                 ''
              }}
            </div>
            <div class="cardNum textCenter">
              NO.{{hyUserInfo.hardCardNumber}}
            </div>
            <div class="flex">
              <span>{{$t('Dict.CardType1')}}</span>
              <span>{{hyUserInfo.memberCardTypeName}}</span>
            </div>
            <div class="flex">
              <span>{{$t('Biz.Settlement.CardBalance')}}</span>
              <span>{{hyUserInfo.value? hyUserInfo.value + '' : '0'}}</span>
            </div>
            <div class="flex">
              <span>{{$t('Dict.IntegralLabel')}}</span>
              <span>0</span>
            </div>
            <div class="flex">
              <span>{{$t('Biz.Settlement.OpenCardShop01')}}</span>
              <span>{{hyUserInfo.storeName}}</span>
            </div>
            <div class="time">
              <div class="textLeft">{{$t('Dict.TermOfValidityLabel')}}</div>
              <div class="textRight">{{hyUserInfo.beginDate}}{{$t('Dict.To')}}{{hyUserInfo.endDate}}</div>
            </div>
            <div class="remark">
              <div class="textLeft">{{$t('Biz.Pos.Member.OpenCardSpan9')}}</div>
              <div class="textRight">{{ hyUserInfo.remarks }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SelectCardNum ref="selectCardNum"></SelectCardNum>
    <PayWayRGJcrmYZModel ref="payWayRGJcrmYZModel"></PayWayRGJcrmYZModel>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { isNaN } from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import SelectCardNum from '@/components/Pos/Member/components/selectCardNum';
import PayWayRGJcrmYZModel from './PayWayRGJcrmYZModel';

export default {
  components: {
    Dialog,
    SelectCardNum,
    PayWayRGJcrmYZModel,
  },
  mixins: [DialogMixin],
  props: {
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
  },
  data() {
    return {
      hyUserInfo: {}, // 已选择卡的信息
      accountNum: '', // 手机号/卡号
      payMoney: '', // 支付金额
      waitPayMoney: 0, // 等待支付
      verifyThrough: false, // 验证账号
      isHYInfo: false,
      pattern: new RegExp("[\-\+\"`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"),
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
    // 添加快捷键
    ration() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        Enter: () => {
          this.readCard();
        },
      };
    },
  },
  watch: {
    payMoney: {
      handler(newV) {
        const n1 = Number(newV);
        const n2 = Number(this.waitPayMoney);
        this.watchPayMoney(n1, n2);
      },
      // deep: true
    },
  },
  methods: {
    onOpen() {
      this.isHYInfo = false;
      this.accountNum = '';
      this.payMoney = this.amountToBePaid;
      this.hyUserInfo = {};
      this.verifyThrough = false;
      this.waitPayMoney = this.amountToBePaid;
    },
    readCard() {
      if (this.accountNum === '') {
        ajax('canyin.pos.settlement.pay.glorybutlerpayway.readcard', {
          contentType: 'URLEncoded',
        }).then((res) => {
          if (+res.code === 0) {
            const info = JSON.parse(res.data);
            const rgjCrmInfo = {
              mode: info[0].deviceId,
              comport: info[0].devicePort,
              comrate: info[0].deviceRate,
            };
            this.$devices.Cardop.readRGJ((card) => {
              if (+card.returnCode === 0) {
                this.querycardmessage(card.CardNo);
              } else {
                this.$message.error(`${this.$t('Biz.Crm.CrmTip04')}`);
              }
            }, rgjCrmInfo);
          } else {
            this.$message.error(res.message);
          }
        });
      } else {
        this.querycardmessage();
      }
    },
    querycardmessage(cardNo) {
      // if(this.accountNum.match(/^\s*$/)){
      const reg = /^[a-zA-Z0-9]+$/;
      if (!cardNo && !reg.test(this.accountNum)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error24')}`);
        return;
      }
      const code = cardNo || (this.accountNum ? this.accountNum.toUpperCase() : null);
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.querycardmessage', {
        contentType: 'URLEncoded',
        data: {
          keyword: code,
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          if (res.data.length !== 0) { // 判断一下，规避因是会员，但是名下无卡，弹出网络异常提示框
            const bool = Object.prototype.toString.call(res.data) === '[object Array]';
            if (bool) { // 如果返回的data是数组
              if (res.data.length > 1) {
                // 如果多条卡数据，弹出卡号选择弹窗
                this.$refs.selectCardNum.open({ cardList: res.data }, {
                  submit: (data) => {
                    this.hyUserInfoFun(data, cardNo);
                  },
                });
              } else {
                // 只返回一张卡时：
                this.hyUserInfoFun(res.data[0], cardNo);
              }
            } else { // 如果不是数组，通过卡号查询，返回的是大对象
              this.hyUserInfoFun(res.data, cardNo);
            }
          } else {
            this.$message.error(this.$t('Biz.Pos.Member.IndexMsg03'));
          }
        } else {
          this.$message.error(res.message);
        }
      });
    },
    onSubmit() {
      if (!this.verifyThrough) { return; }
      const n1 = Number(this.payMoney);
      const n2 = Number(this.waitPayMoney);
      if (!this.watchPayMoney(n1, n2)) {
        return;
      }
      if (this.payMoney > this.hyUserInfo.value) {
        this.$message.error(`${this.$t('Biz.Settlement.Error10')}`);
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
        amount: Number(this.payMoney).toFixed(2), // 支付金额
        hardCardNumber: this.hyUserInfo.hardCardNumber, // 实体卡号
        cardNumber: this.hyUserInfo.cardNumber, // 卡号
        bsId: this.resData.bsid, // 营业流水号
        pointId: this.resData.pointid, // 客位id
        mobile: this.hyUserInfo.mobile, // 手机号
        cardTypeId: this.hyUserInfo.memberCardTypeId, // 卡类型id
        cardTypeName: this.hyUserInfo.memberCardTypeName, // 卡型名称
        validatePasswordType: res.validatePasswordType, // 验证方式
        verifyPassword: res.verifyPassword, // 密码 或 短信验证码
        isInvoice: 0, // 是否已开发票（荣管家结算写死0）
        isCredit: 0, // 是否是会员还挂账（荣管家结算写死0）
        isNoConsumption: 0, // 是否是无消费扣款 （荣管家结算写死0）
      };
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.settle', {
        contentType: 'URLEncoded',
        data: {
          settleParams: JSON.stringify(params),
        },
      }).then((resData) => {
        const resobj = JSON.parse(resData);
        if (+resobj.code === 0) {
          this.$message.success(resobj.message);
          if (this.$refs.payWayRGJcrmYZModel) {
            this.$refs.payWayRGJcrmYZModel.close();
          }
          this.close();
          // 刷新流水账单
          this.$emit('refreshBill', '1');
        } else {
          this.$message.error(resobj.message);
        }
      });
    },
    watchPayMoney(n1, n2) {
      if (isNaN(n1)) {
        this.payMoney = n2;
        this.$message.warning(`${this.$t('Biz.Settlement.Warning23')}`);
        return false;
      }
      if (n1 > n2) {
        this.payMoney = n2;
        this.$message.warning(`${this.$t('Biz.Settlement.Warning26')}`);
        return false;
      }
      if (n1.toString().indexOf('.') !== -1 && n1 !== 0) {
        const i = n1.toString().indexOf('.');
        if (n1.toString().substr(i + 1).length > 2 && !isNaN(Number(n1))) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning27')}`);
          this.payMoney = n1.toString().substr(0, i + 3);
          return false;
        }
      }
      if (n1 === '') {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning23')}`);
        return false;
      }
      return true;
    },
    hyUserInfoFun(res) {
      const modifyRes = res;
      this.accountNum = res.hardCardNumber;
      this.verifyThrough = true;
      this.payMoney = this.waitPayMoney;
      if (JSON.stringify(res) === '{}') { return; }
      this.isHYInfo = true;
      modifyRes.beginDate = res.beginDate ? res.beginDate.substr(0, 10) : '';
      modifyRes.endDate = res.endDate ? res.endDate.substr(0, 10) : '';
      this.hyUserInfo = res;
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
  .payWayRGJcrm{
    position: relative;
    height: 390px;
    padding-right: 224px;
    background: #f7f7f7;
    .payWayRGJcrm-pay{
      width: 100%;
      height: 100%;
      background: #fff;
      padding-left: 20px;
      padding-top: 20px;
      .waitPayMoney{
        font-size: 18px;
        font-weight: bold;
        .line-through{
          color: #ffffff;
          text-decoration: line-through;
        }
        .money{
          color: #0babb9;
        }
      }
    }
    .payWayRGJcrm-info{
      position: absolute;
      top: 0;
      right: 0;
      width: 224px;
      height: 100%;
      background: url('../images/vip_bg.png') no-repeat;
      padding: 10px;
      padding-top: 50px;
      .infoBox{
        height: 100%;
        background: #fff;
        border-radius: 10px;
        position: relative;
        padding-top: 30px;
      }
      img{
        position: absolute;
        top: -30px;
        left: 73px;
      }
      .tip{
        text-align: center;
        color: #999;
        padding-top: 20px;
      }
    }
    .userInfoStyle{
      padding: 10px;
      padding-top: 0;
      .name, .phone, .cardNum{
        font-weight: bold;
      }
      .cardNum{
        padding: 5px 0;
        font-size: 16px;
      }
      .flex{
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
      }
      .time{
        margin-top: 10px;
      }
      .remark {
        height: 80px;
        line-height: 20px;
        overflow: hidden;

        .textRight {
          display: -webkit-box;
          word-break: break-all;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }
      }
    }
    .keyboard{
      margin: auto;
    }
    .sart{
      color: #F56C6C;
    }
    .w110{
      width: 110px;
    }
    .w200{
      width: 200px;
    }
    .w300{
      width: 300px;
    }
    .mb25{
      margin-bottom: 25px;
    }
    .inlineBlock{
      display: inline-block;
    }
    .textRight{
      text-align: right;
    }
    .textCenter{
      text-align: center;
    }
    .inputStyle{
      -webkit-appearance: none;
      background-color: #fff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      color: #606266;
      display: inline-block;
      font-size: inherit;
      height: 40px;
      line-height: 40px;
      outline: none;
      padding: 0 15px;
      -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    .inputStyle:focus{
      border-color: #0096a4;
    }
  }
</style>
