<template>
  <Dialog
    name="PosDialog.RepayMemberCardCrm7"
    :append-to-body="true"
    :showSubmit="false"
    :hotkeys="hotkeys"
    :title="allTitle"
    @submit="onSubmit"
    @close="onClose"
    @open="onOpen"
    ref="dialog"
    width="840px"
    height="560px"
  >
    <div class="warp userDesk-repayMemberCardCrm7">
      <!-- 左侧操作区 -->
      <div class="left-box">
        <p class="lineHeight">
          <span>{{$t('Biz.UserDesktop.UserDesktopMsg077')}}</span>
          <span class="highlightTxt">{{ repayValue }}</span>
        </p>
        <div class="lineHeight">
          <div class="cardAndTelInput-box">
            <em class="redTxt">*</em>
            <em class="smallWideningTxt">{{$t('Biz.Crm.CardTelNum')}}</em>
            <input
                    class="inputModel"
                    type="text"
                    :placeholder="$t('Biz.UserDesktop.UserDesktopMsg079')"
                    v-model="inputNumberModel">
            <div class="drop-box"
              v-if="JSON.stringify(cardInfo) != '{}' && cardInfo.cardCount !== 1">
              <!-- cardInfo.cardCount-卡张数.多卡时显示,用于切换不同卡 -->
              <el-dropdown
                trigger="click"
                placement="bottom-start"
                @command="turnCardDrop">
                <span class="el-dropdown-link"
                  @click="loadMultiCardList(cardInfo.memberId)"
                >{{$t('Dict.Switch')}}<i class="el-icon-caret-bottom el-icon--right"></i></span>
                <el-dropdown-menu
                  class="drop-box-border"
                  slot="dropdown">
                  <el-dropdown-item
                    v-for="(item, index) of MultiCard"
                    :command="index"
                    :key="index"
                    :divided="index != 0"
                    >
                    <p class="drop-box-item aLineTxt">
                      {{$t('Dict.CardNumberLabel')}}<span>{{ item.cardNo }}</span>
                    </p>
                    <p class="drop-box-item aLineTxt">
                      <span>{{$t('Dict.BalanceLabel')}}{{ item.balanceMoney }}</span>
                      <span>{{$t('Dict.IntegralLabel')}}{{ item.balanceScore }}</span>
                    </p>
                    <p class="drop-box-item aLineTxt">
                      <span>{{$t('Dict.IntegralLabel')}}{{ item.cardTypeName }}</span>
                      <span>{{$t('Dict.State1')}}{{ item.statusName }}</span>
                    </p>
                    </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <button
                    class="btnRight btn btn-primary"
                    @click="readCard">{{$t('Dict.CardReading')}}<em class="smallTxt">(Enter)</em></button>
          </div>
        </div>
        <div v-if="showCardInfoSwitch">
          <p class="use_self_money">
            <el-checkbox v-model="checked">{{$t('Biz.UserDesktop.PrincipleOnly')}}</el-checkbox>
          </p>
          <p class="lineHeight">
            <span class="wideningTxt">{{$t('Dict.StoredValue')}}</span>
            <input
              class="inputModel inputLongModel"
              type="text"
              @input="paymentLogic(balance, 'money')"
              v-model="balance">
          </p>
          <p class="cardScore-box lineHeight">
            <span class="wideningTxt">{{$t('Dict.IntegralLabel')}}</span>
            <input
              class="inputModel inputLongModel"
              type="text"
              :disabled="JSON.stringify(cardInfo) != '{}' && cardInfo.isScoreMoney !== 1"
              @input="paymentLogic(integral, 'num')"
              v-model="integral">
              <!-- cardInfo.isScoreMoney-是否支持积分消费 -->
            <span
              class="score-tips"
              v-show="cardInfo.isScoreMoney === 1"
            >{{$t('Dict.Deduction')}}<em>{{ realScore }}</em>{{$t('Dict.Integral')}}</span>
          </p>
        </div>
        <div
          class="submitBox lineHeight"
          v-if="showCardInfoSwitch">
          <button
            class="wideningBtn btn btn-primary"
            @click="onSubmit"
          >{{$t('Dict.Sure')}}&nbsp;&nbsp;<em class="smallTxt">(PgDn)</em></button>
        </div>
      </div>
      <!-- 右侧显示区 -->
      <div class="right-box">
        <div class="right-content">
          <template>
            <!-- 初始显示内容 -->
            <div
              class="content-noInfo"
              v-if="!showCardInfoSwitch">
              <div class="headImage-noInfo"></div>
              <p class="txt-noInfo">{{$t('Dict.PleaseSwipeYourCard')}}</p>
            </div>
            <!-- 读卡后显示内容 -->
            <div
              class="content-cardInfo"
              v-else>
              <div class="userInfo-box">
                <div class="userInfo-headImg"></div>
                <ul class="userInfo-detail">
                  <li class="line aLineTxt">
                    <span>{{ cardInfo.memberName }}</span>
                    <span>123123123123123</span>
                  </li>
                  <li class="line aLineTxt">
                    <span>{{ cardInfo.sex }}</span>
                    <span>|&nbsp;{{ cardInfo.birthday | birthdayFilter }}&nbsp;({{$t('Dict.SolarCalendar')}})</span>
                  </li>
                  <li class="line aLineTxt">{{$t('Dict.Inviter')}}{{ cardInfo.byInviteMemberName }}</li>
                  <li class="line aLineTxt">{{$t('Dict.MInvitationCode')}}{{ cardInfo.myInviteCode }}</li>
                </ul>
              </div>
              <div class="cardInfo-type">
                <div class="vipLogo"></div>
                <div class="cardType-info">
                  <p class="cardLine">
                    <span>{{$t('Dict.CardType1')}}</span>
                    <span class="cardType">{{ cardInfo.cardType }}</span>
                  </p>
                  <p class="cardLine cardType-number">{{ cardInfo.number }}</p>
                  <p class="cardLine">
                    <span>{{$t('Dict.TermOfValidityLabel')}}</span>
                    {{ cardInfo.validateEndTime
                    ? cardInfo.validateEndTime : $t('Dict.PermanentValidity') }}
                  </p>
                </div>
              </div>
              <ul class="cardInfo-detail">
                <li class="line">
                  <span class="title">{{$t('Dict.CarBalance')}}</span>
                  <span class="detail">{{ cardInfo.cardBalance }}</span>
                </li>
                <li class="line">
                  <span class="title">{{$t('Dict.IntegralLabel')}}</span>
                  <span class="detail">{{ cardInfo.cardScore }}</span>
                </li>
                <li class="line">
                  <span class="title">{{$t('Dict.MyElectronicTicket')}}</span>
                  <span class="detail">{{ cardInfo.couponCount }}</span>
                </li>
                <li class="line">
                  <span class="title">{{$t('Dict.CumulativeRecharge')}}</span>
                  <span class="detail">{{ cardInfo.cumulativeAmount }}</span>
                </li>
                <li class="line">
                  <span class="title">{{$t('Dict.CumulativeConsumption')}}</span>
                  <span class="detail">{{ cardInfo.consumeAmount }}</span>
                </li>
                <li class="line">
                  <span class="title">{{$t('Dict.AccumulatedPoints')}}</span>
                  <span class="detail">{{ cardInfo.scoreAmount }}</span>
                </li>
                <li class="line">
                  <span class="title">{{$t('Dict.LastConsumptionTime')}}</span>
                  <span class="detail">{{ cardInfo.lastConsumeTime }}</span>
                </li>
                <li class="line">
                  <span class="title">{{$t('Dict.LastPlaceOfConsumption')}}</span>
                  <span class="detail">{{ cardInfo.lastConsumeShop }}</span>
                </li>
                <li class="line flex">
                  <span class="title">{{$t('Dict.CardStore')}}</span>
                  <span class="detail">{{ cardInfo.saleShop}}</span>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
    <CrmPaymentBeforeCheck
      ref="crmPaymentBeforeCheck"
      @submitDone="submitDone"></CrmPaymentBeforeCheck>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { isEmpty } from 'lodash';
import { MessageBox } from 'element-ui';
import ajax from '@/common/js/ajax';
// import * as MathUtil from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { add, multi, sub } from '@/common/js/math';
// import KeyBoard from '@/components/Pos/Common/KeyBoard'
// import numberformat from '@/common/js/numberformat'
// import PageMixin from '@/common/util/PaginationMixin';

// 支付校验(密码或短信验证码)
const CrmPaymentBeforeCheck = (resolve) => {
  import('./CrmPaymentBeforeCheck').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    Dialog,
    CrmPaymentBeforeCheck,
  },
  mixins: [DialogMixin],
  data() {
    return {
      allTitle: null,
      titleTxt: this.$t('Dict.StillCheckingAccounts'),
      // 待还款金额
      repayValue: 0,
      // 输入(或读取)的号码(手机号或卡号)
      inputNumberModel: null,
      // 卡余额
      balance: null,
      // 积分
      integral: null,
      // 多卡列表
      MultiCard: [
        // {id: '123', name: '猪猪肉肉'},
        // {id: '1234', name: '吃吃喝喝'},
      ],
      // 右侧显示内容开关
      showCardInfoSwitch: false,
      cardInfo: {
        // accountTypeId: '4',
        // birthday: '1985-04-17 00:00:00',
        // byInviteMemberName: '',
        // cardBalance: 8913.45,
        // cardCanUse: '1',
        // cardCount: 2,
        // cardScore: 111707,
        // cardStatus: '已售卡',
        // cardType: '餐饮7打折卡勿动',
        // code: -1,
        // consumeAmount: 152553.44,
        // couponCount: 34,
        // crmVersion: 1,
        // cumulativeAmount: 128018.02,
        // hasPasswdStatus: '1',
        // isCrmDay: false,
        // isHaveMemberPriceItem: true,
        // isHaveNcupMemPlan: false,
        // isSingle: false,
        // lastConsumeShop: 'crm7武雷雷',
        // lastConsumeTime: '2019-08-14 09:57:00',
        // memberId: '1038643766',
        // memberName: 'ly',
        // mobile: '13821185330',
        // msg: '查询CRM消费规则失败。原因:查询CRM消费规则失败:pos没有绑定crm终端',
        // myInviteCode: 'JS4XG6',
        // number: '15202',
        // saleShop: '马芳艳测试门店',
        // scoreAmount: 119193,
        // sex: '1',
        // totalConsumeTimes: 682,
        // validateBeginTime: '2018-12-13',
        // validateEndTime: '',
        // validateType: '1',
      },
      checked: false, // 仅适用本金还款
    };
  },
  computed: {
    ...mapGetters([
      'deskPageBaseInfo',
    ]),
    // 实际扣除积分数
    realScore() {
      // 最大值校验规则
      if (multi(this.integral, this.cardInfo.scoreMoneyScale) > this.cardInfo.cardScore) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg081'));
        return this.cardInfo.cardScore;
      }
      return multi(this.integral, this.cardInfo.scoreMoneyScale);
    },
    // 添加快捷键
    hotkeys() {
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
  methods: {
    onOpen() {
      // console.log(this.resData);
      this.allTitle = this.resData.data.name
        ? this.resData.data.name + this.titleTxt
        : this.titleTxt;
      this.repayValue = this.resData.repayValue;
    },
    cleanParams() {
      // 参数重置
      this.showCardInfoSwitch = false;
      this.allTitle = '';
      this.inputNumberModel = null;
      this.integral = null;
      this.balance = null;
      this.cardInfo = {};
      this.checked = false;
    },
    onClose() {
      this.cleanParams();
    },
    // 读卡
    readCard() {
      if (this.inputNumberModel) {
        this.loadCrmMemeberInfo(this.inputNumberModel);
      } else {
        const rgjCrmInfo = this.deskPageBaseInfo.readCardOpt || {};
        this.$devices.Cardop.readRGJ((card) => {
          if (+card.returnCode === 0) {
            // this.refundForm.controlCardNo = card.CardNo;
            this.loadCrmMemeberInfo(card.CardNo);
          } else {
            this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg082'));
          }
        }, rgjCrmInfo);
      }
    },
    // 多卡时切换
    turnCardDrop(command) {
      this.inputNumberModel = this.MultiCard[command].cardNo;
      this.loadCrmMemeberInfo(this.inputNumberModel);
    },
    // 储值和积分逻辑规则处理
    paymentLogic(val, type) {
      // cardInfo.isScoreMoney-是否支持积分消费.不支持,则不再执行储值积分联动,只校验储值
      if (!isEmpty(this.cardInfo) && this.cardInfo.isScoreMoney !== 1) {
        // 输入校验
        if (!this.isValid(val, 'money')) {
          this.balance = '';
          return;
        }
        return;
      }
      // 输入金额
      if (type === 'money') {
        // 输入校验
        if (!this.isValid(val, 'money')) {
          this.balance = '';
          return;
        }
        this.integral = parseInt(sub(this.repayValue, this.balance), 10);
      } else {
      // 输入积分
        // 输入校验
        if (!this.isValid(val, 'num')) {
          this.integral = '';
          return;
        }
        this.balance = sub(this.repayValue, this.integral);
      }
    },
    // 输入值校验
    isValid(val, type) {
      // const vaildNum = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/g;
      // const vaild = /^[1-9]\d*$/g;
      const validFloat = /^[0-9]+(.[0-9]{1,2})?$/g;
      if (type === 'money') {
        // 金额-小数位数校验
        if (!validFloat.test(String(+val))) {
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg083'));
          return false;
        }
        // 最大值校验规则1
        if (val > this.cardInfo.cardBalance) {
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg084'));
          return false;
        }
        // 最大值校验规则2
        if (val > this.repayValue) {
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg085'));
          return false;
        }
      }
      if (type === 'num') {
        // 积分-数值小数位校验
        // eslint-disable-next-line no-bitwise
        if (~val.indexOf('.')) {
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg086'));
          return false;
        }
        // 最大值校验规则1
        if (multi(val, this.cardInfo.scoreMoneyScale) > this.cardInfo.cardScore) {
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg081'));
          return false;
        }
        // 最大值校验规则2
        if (val > this.repayValue) {
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg088'));
          return false;
        }
      }
      // 非法数值校验
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(val)) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg089'));
        return false;
      }
      return true;
    },
    // 查询卡信息接口
    loadCrmMemeberInfo(cardNo) {
      ajax('canyin.pos.settlement.pay.crmPayWay.querycrmmemberandrule', {
        params: {
          cardNo,
        },
      }).then((res) => {
        if (res.success) {
          if (res.data.code === 1) {
            this.cardInfo = {};
            this.integral = null;
            this.balance = null;
            this.cardInfo = res.data;
            this.showCardInfoSwitch = true;
          } else {
            this.$message.error(res.data.msg);
            this.cleanParams();
          }
        } else {
          this.$message.error(res.msg);
          this.cleanParams();
        }
      });
    },
    // 多个卡列表查询
    loadMultiCardList(memberId) {
      // 先还原 输入的储值和积分
      this.integral = null;
      this.balance = null;
      // 请求卡列表
      ajax('canyin.pos.settlement.pay.crmPayWay.getmemberallcards', {
        params: {
          memberId,
        },
      }).then((res) => {
        if (res.success) {
          if (res.data.code === 1) {
            this.MultiCard = res.data.cardList;
          } else {
            this.$message.error(res.data.msg);
            this.cleanParams();
          }
        } else {
          this.$message.error(res.msg);
          this.cleanParams();
        }
      });
    },
    // 提交
    onSubmit() {
      if (add(this.balance, this.integral) !== this.repayValue) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg090'));
        return;
      }
      // 最大值校验规则1
      if (this.balance > this.cardInfo.cardBalance) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg084'));
        return;
      }
      // 最大值校验规则2
      if (this.integral > this.repayValue) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg088'));
        return;
      }
      // 最大值校验规则3: 自动填入的积分钱数, 大于折算扣除的积分时
      if (this.cardInfo.isScoreMoney === 1
        && multi(this.integral, this.cardInfo.scoreMoneyScale) > this.cardInfo.cardScore
      ) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg081'));
        return;
      }
      // 支付前校验,hasPasswdStatus-使用短信验证码('1')
      if (this.cardInfo.hasMobilePasswdStatus === '1') {
        // crm7短信验证功能未完成,功能不支持, 代码注释
        // this.$refs.crmPaymentBeforeCheck.open({
        //   type: 'sms',
        //   memberId: this.cardInfo.memberId,
        // });

        // 183-临时使用代码
        MessageBox.alert(this.$t('Biz.UserDesktop.UserDesktopMsg094'));
        return;
      }
      // 支付前校验,hasPasswdStatus-使用密码('1')
      if (this.cardInfo.hasPasswdStatus === '1') {
        this.$refs.crmPaymentBeforeCheck.open({
          type: 'pwd',
          memberId: this.cardInfo.memberId,
        });
        return;
      }
      // 无验证码,无密码直接调用
      this.submitDone();
    },
    // 支付流程-完成
    submitDone(pwd) {
      // pwd-密码
      let score = this.realScore || 0;
      // 不支持积分消费时
      if (this.cardInfo.isScoreMoney !== 1) {
        score = 0;
      }
      // 传入的回调, 为支付并完成挂账的执行方法, 传入支付方式参数.完成挂账
      this.resData.callback({
        cardNo: this.cardInfo.number, // 卡号(非input输入值)
        cardAllMoney: this.repayValue, // 待支付金额
        consumeMoney: this.balance, // 储值支付
        consumeScore: score, // 实际积分扣除支付(页面值计算了积分抵扣规则的)
        password: pwd || '', // 密码
        isPrincipleOnly: this.checked ? 1 : 0, // 是否仅适用本金还款 1是0否
      });
      this.close();
    },

    // 临时: 不验卡打开密码或验证码窗口
    // tmp() {
    //   this.$refs.crmPaymentBeforeCheck.open({
    //     type: 'pwd',
    //     memberId: this.cardInfo.memberId,
    //   });
    // },
  },
  filters: {
    // 会员卡信息-生日过滤
    birthdayFilter(data) {
      if (data) {
        return data.split(' ')[0];
      }
      return '';
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

//主要信息的字体颜色
@main-font-color: #0babb9;

.aLineTxt{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.warp {
  width: 100%;
  height: 100%;

  .highlightTxt {
    color: @main-font-color;
    font-size: 18px;
  }

  .smallTxt {
    font-size: 12px;
  }

  .inputModel {
    width: 228px;
    height: 36px;
    padding: 0 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
    color: #333;
    font-size: 15px;
    font-weight: normal;
    &::-webkit-input-placeholder {
      color: #999;
    }
  }

  .inputLongModel {
    width: 332px;
  }
}

.left-box {
  width: 60%;
  height: 100%;
  float: left;
  padding: 30px 20px;
  background-color: #fff;
  font-weight: bold;
  font-size: 16px;
  color: #666;

  em {
    font-style: normal;
  }

  .use_self_money {
    padding-left: 130px;
  }

  .lineHeight {
    padding: 16px 0;
  }

  .redTxt {
    color: #f56c6c;
  }

  .btnRight {
    float: right;
    font-size: 16px;
  }

  .smallWideningTxt {
    margin-right: 11px;
  }

  .wideningTxt {
    display: inline-block;
    padding-left: 67px;
    padding-right: 11px;
  }
}

.cardAndTelInput-box {
  position: relative;
  .drop-box {
    position: absolute;
    right: 110px;
    top: 6px;
  }
}

// .drop-box-border {
//   border-bottom: 1px solid #ddd;
// }

.drop-box-item {
  line-height: 1.34;

  .subItem {
    display: inline-block;
    width: 40%;

  }
}

.cardScore-box {
  position: relative;
  .score-tips {
    position: absolute;
    right: 10px;
    bottom: 0;
    top: 0;
    height: 20px;
    margin: auto;
    font-size: 14px;
    color: #999;

    em {
      font-style: normal;
      color: #f56c6c;
    }
  }
}

.submitBox {
  margin-top: 40px;
  text-align: center;

  .wideningBtn {
    width: 120px;
    font-size: 16px;
  }
}

.right-box {
  width: 40%;
  height: 100%;
  float: right;

  .right-content {
    width: 100%;
    height: 100%;
    background-color: #f5f4f3;
    background-image: url('~@/components/Pos/Member/images/vip_bg.png');
    background-repeat: no-repeat;
    background-size: 100%;
    &::before {
      content: '';
      display: table;
    }
  }
}

.content-noInfo {
  width: 90%;
  height: 82%;
  background: #fff;
  margin: 70px auto 0;
  border-radius: 10px;
}

.headImage-noInfo {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  position: relative;
  top: -50px;
  border-radius: 50%;
  background-color: #0babb9;
  background-image: url('~@/components/Pos/Member/images/ic_head.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 92%;
}

.txt-noInfo {
  text-align: center;
  font-size: 18px;
  color: #999;
}

.content-cardInfo {
  width: 90%;
  height: 95%;
  margin: 12px auto;
  background-color: #f5f4f3;
  background-image: url('~@/components/Pos/Member/images/bg.png');
  background-repeat: no-repeat;
  background-position: 0 -565%;
  background-size: 100%;
}

.userInfo-box {
  width: 100%;
  height: 22.5%;

  &::before {
    content: '';
    display: table;
  }

  .userInfo-headImg {
    display: inline-block;
    width: 60px;
    height: 60px;
    margin: 22px 10px 0 20px;
    background-image: url('~@/components/Pos/Member/images/ic_head.png');
    background-repeat: no-repeat;
    background-size: contain;
  }
  .userInfo-detail {
    display: inline-block;
    vertical-align: top;
    padding: 8px 0;
    width: 62%;

    .line {
      padding: 2px 0;
      font-size: 13px;
      color: #fff;
    }
  }
}

.cardInfo-type {
  width: 87%;
  height: 20.2%;
  margin: auto;
  position: relative;
  border-radius: 10px;
  background-image: url('~@/components/Pos/Member/images/pic_vipcard.png');
  background-repeat: no-repeat;
  background-size: 100% 102%;

  .vipLogo {
    width: 90px;
    height: 56px;
    bottom: 0;
    left: 4px;
    z-index: 100;
    position: absolute;
    background-image: url('~@/components/Pos/Member/images/pic_vip.png');
    background-repeat: no-repeat;
    background-size: 100%;
  }

  .cardType-info {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 500;
    position: absolute;
    padding: 8px 12px;
    color: #666;
    font-size: 13px;
    font-weight: bold;

    .cardLine {
      white-space: nowrap;
      overflow: hidden;
    }
    .cardType {
      color: #cf9236;
    }

    .cardType-number {
      text-align: center;
      padding: 8px;
      font-size: 20px;
      color: #333;
    }
  }
}

.cardInfo-detail {
  width: 87%;
  margin: 14px auto;

  .line {
    padding: 4px 0;
    font-size: 13px;
    color: #666;
  }
  .flex {
    display: flex;
    justify-content: space-between;
    > span {
      display: inline-block;
      &.right {
        flex: 1;
        text-align: right;
      }
    }
  }
  .title {
    display: inline-block;
    width: 49%;
    text-align: left;
  }
  .detail {
    display: inline-block;
    width: 49%;
    text-align: right
  }
}

</style>

<style lang="less">
.userDesk-repayMemberCardCrm7 .el-dropdown-menu__item--divided {
  margin-top: 0;
  padding-bottom: 6px;
  // border-top: 1px solid #ebeef5;
  &:first-of-type(.el-dropdown-menu__item--divided) {
    border-top: none;
  }
}
</style>style
