<template>
  <Dialog
      name="PosDialog.PayWayMinChenMembershipCard"
      :title="$t('Biz.Settlement.PayWayMinChenMembershipCard')"
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
             <span class="sart">*</span><span>{{$t('Biz.Settlement.MemberActivityCode')}}</span></span>
          <input
            class="w200 inputStyle"
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
            <div class="name textCenter">{{hyUserInfo.name}}</div>
            <div class="phone textCenter">
              {{ hyUserInfo.mobile ?
                 hyUserInfo.mobile.substr(0, 3) + '****' + hyUserInfo.mobile.substr(7) :
                 ''
              }}
            </div>
            <!-- <div class="cardNum textCenter colorGold">
              NO.{{hyUserInfo.cardNo}}
            </div> -->
            <div class="flex">
              <span>{{$t('Biz.Settlement.CardBalance')}}</span>
              <span>{{hyUserInfo.cardBala ? hyUserInfo.cardBala + '' : '0'}}</span>
            </div>
            <div class="flex">
              <span>{{ $t('Dict.IntegralLabel') }}</span>
              <span>{{hyUserInfo.points}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { isNaN } from 'lodash';

export default {
  components: {
    Dialog,
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
      bsId: '', // 营业流水Id
      pointId: '', // 客位Id
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
      this.bsId = this.resData.bsId;
      this.pointId = this.resData.pointId;
      this.isHYInfo = false;
      this.payMoney = this.amountToBePaid;
      this.hyUserInfo = {};
      this.verifyThrough = false;
      this.waitPayMoney = this.amountToBePaid;
    },
    readCard() {
      if (this.accountNum === '') {
        this.$message.error(`${this.$t('Biz.Settlement.Error6')}`);
      } else {
        this.querycardmessage();
      }
    },
    querycardmessage() {
      // const reg = /^[0-9]+$/;
      // if (!reg.test(this.accountNum)) {
      //   this.$message.error('请输入正确的会员动态码');
      //   return;
      // }
      ajax('canyin.pos.settlement.pay.crmPayWay.mingchenquerymember', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.accountNum, // 卡号
          pointId: this.pointId, // 客位Id
        },
      }).then((res) => {
        if (res.result === 1) {
          this.hyUserInfo = res.data;
          this.verifyThrough = true;
          this.isHYInfo = true;
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
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
      if (this.payMoney > this.hyUserInfo.cardBala) {
        this.$message.error(`${this.$t('Biz.Settlement.Error10')}`);
        return;
      }
      this.xrjSettle();
    },
    xrjSettle() { // 结算
      const params = {
        payMoney: Number(this.payMoney).toFixed(2), // 支付金额
        cardNo: this.accountNum, // 卡号
        bsId: this.bsId, // 营业流水号
        pointId: this.pointId, // 客位id
      };
      ajax('canyin.pos.settlement.pay.crmPayWay.mingchensettle', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.result === 1) {
          this.close();
          this.$message.success(`${this.$t('Biz.Settlement.writtenOffOk')}`);
          // 刷新流水账单
          this.$emit('refreshBill', '1');
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    onClose() {
      // 清空会员动态码
      this.accountNum = '';
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
        if (n1.toString().substr(i + 1).length > 3 && !isNaN(Number(n1))) {
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
        .line-through {
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
      .phone {
        margin-bottom: 70px;
      }
      .cardNum{
        padding: 5px 0;
        font-size: 16px;
        margin-top: 20px;
      }
      .colorGold {
        color: #F1D16F;
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
