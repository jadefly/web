<template>
  <Dialog
    name="PosDialog.PayWayMembershipCardCrm7"
    :title="$t('Dict.MemberCard')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showClose="false"
    :hotkeys="PayWayMembershipCardCrm7"
    :append-to-body="true"
    :closeByClickModel="false"
    width="1000px"
    height="669px"
    top="5vh"
  >
  <template slot="other-button">
    <button
      v-if="isHaveCrmMemberDiscAuth == 1 ? true : false"
      type="button" class="btn btn-primary"
      @click="cancelDisc"
      :disabled="isEnableCancelDisc"
    >{{$t('Biz.Settlement.CancelMemberDiscount')}}</button>
    <button
      type="button"
      class="btn btn-default"
      @click="doCancel">
      {{$t('Dict.Close')}}(Esc)
    </button>
  </template>
  <div
    ref="crm7PayWayContainer"
    class="crm-container"
  ></div>
  </Dialog>
</template>

<script>
import $ from 'jquery';
import { mapGetters } from 'vuex';
import { delay } from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PrinterMixin from '@/common/util/PrinterMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin, PrinterMixin],
  data() {
    return {
      bsId: '',
      payWayId: null,
      actualPay: 0,
      pointId: '',
      cardKindId: '',
      deviceReadCardNo: null,
      isEnableCancelDisc: true,
      isCancelDisc: 1, // 是否进行取消优惠
      crmReadCardParams: {}, // CRM7读卡参数
      isHaveCrmMemberDiscAuth: 0, // 是否有取消会员折扣权限
      teamBsIds: '', // 团队流水
    };
  },
  computed: {
    ...mapGetters([
      'getVuexPosMode', // 快餐的当前账单的数据
      'posOrderBill', // 当前pos的一些相关设置
      'getFastFoodBillData',
      'posDevice',
    ]),
    // 添加快捷键
    PayWayMembershipCardCrm7() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      // 請求回去當前客位的會員信息
      this.bsId = this.resData.bsId;
      this.actualPay = this.resData.actualPay;
      const billData = this.getVuexPosMode === '3'
        ? this.getFastFoodBillData
        : this.posOrderBill;
      this.pointId = billData.bsData.pointId;
      this.teamBsIds = this.resData.teamBsIds;
      this.initCrmDependencies();
      this.isHaveCrmMemberDiscAuth = this.resData.isHaveCrmMemberDiscAuth;
      this.isEnableCancelDisc = true;
      this.crmReadCardParams = null;
      this.isCancelDisc = 1;
      this.deviceReadCardNo = '';
      this.cardKindId = '';
      // 先渲染页面
      $(this.$refs.crm7PayWayContainer).html(this.resData.crmHtml);
      // 在延迟进行焦点获取, 原方法连DOM渲染都延迟了~~~~
      setTimeout(() => {
        $(this.$refs.crm7PayWayContainer).find('input#cardNo').get(0).dispatchEvent(new Event('focus'));
      }, 500);
    },

    initCrmDependencies() {
      const KEYCODE = {
        // 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f",71: "g",
        // 72: "h", 73: "i", 74: "j", 75: "k", 76: "l",77: "m", 78: "n",
        // 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t",
        // 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z",
        65: 'A',
        66: 'B',
        67: 'C',
        68: 'D',
        69: 'E',
        70: 'F',
        71: 'G',
        72: 'H',
        73: 'I',
        74: 'J',
        75: 'K',
        76: 'L',
        77: 'M',
        78: 'N',
        79: 'O',
        80: 'P',
        81: 'Q',
        82: 'R',
        83: 'S',
        84: 'T',
        85: 'U',
        86: 'V',
        87: 'W',
        88: 'X',
        89: 'K',
        90: 'Z',
        // 主键盘数字键
        48: '0',
        49: '1',
        50: '2',
        51: '3',
        52: '4',
        53: '5',
        54: '6',
        55: '7',
        56: '8',
        57: '9',
        // 小键盘数字键
        96: '0',
        97: '1',
        98: '2',
        99: '3',
        100: '4',
        101: '5',
        102: '6',
        103: '7',
        104: '8',
        105: '9',
        // 功能键
        16: 'Shift',
        17: 'Ctrl',
        18: 'Alt',
        // 主键盘其他
        8: 'BackSpace',
        9: 'Tab',
        13: 'Enter',
        27: 'Esc',
        32: 'Space',
        33: 'PgUp',
        34: 'PgDn',
        35: 'End',
        36: 'Home',
        45: 'Insert',
        187: '+',
        189: '-',
        188: ',',
        190: '.',
        191: '/',
        219: '{',
        220: '|',
        221: '}',
        // 小键盘其他
        108: 'Enter',
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111: '/',
        // F功能键
        112: 'F1',
        113: 'F2',
        114: 'F3',
        115: 'F4',
        116: 'F5',
        117: 'F6',
        118: 'F7',
        119: 'F8',
        120: 'F9',
        121: 'F10',
        122: 'F11',
        123: 'F12',
      };
      window.EventManager = {
        keydown: (config) => {
          const hotkeyConfig = {};
          hotkeyConfig[KEYCODE[config.keyCode]] = config.handler;
          this.$hotKey.set('PosDialog.PayWayMembershipCard', hotkeyConfig);
        },
        pauseEvent: () => {},
        resumeEvent: () => {},
      };
      // 读卡的回调
      window.crmGetCardCallback = (obj) => {
        this.doCalc(obj);
      };
      // 结算的回调
      window.crmPreConsumeCallback = (obj) => {
        this.doSettle(obj);
      };
      // 读实体卡
      window.crmGetCardNoCallback = (obj) => {
        this.doGetCardNo(obj);
      };
      // CRM充值成功的回调
      window.crmGetCardChargeCallback = (obj) => {
        this.doPrintCardCharge(obj);
      };
      // 请求回去当前客位的会员信息
      window.getCardNoFromReserveOrder = (obj) => {
        // eslint-disable-next-line no-unused-vars
        const { showMemberNoMessage } = this.resData;
        // eslint-disable-next-line no-eval
        eval(`${obj.callback}(showMemberNoMessage)`);
      };
      //
      window.crmGetConsumeInfoCallback = (obj) => {
        ajax('canyin.pos.settlement.pay.crmPayWay.doGetConsumeInfo', {
          contentType: 'URLEncoded',
          data: {
            pointId: this.pointId,
            actualPay: this.actualPay,
          },
        }).then((data) => {
          eval(`${obj.callback}({
            billRealMoney: ${data.finalPrice},
            itemList: ${data.itemList},
            consumeTrueMoney: ${data.consumeTrueMoney},
            itemClassList: ${data.itemClassList},
            cardShouldPay: ${data.consumeTrueMoney},
            hasOtherReduction: ${data.hasOtherReduction},
            maLingType: ${data.maLingType},
            maLingLocation: ${data.maLingLocation}
          })`);
        });
      };
    },
    /**
     * @函数说明 一卡通支付的计算优惠价格
     * @修改历史
     * 2018-07-11 于宝龙 创建了该函数
     */
    async doCalc(obj) {
      // me.uilog.info('一卡通读卡|卡号：' + obj.cardNo + '|卡类型：' + obj.cardKindId+ '|营业流水：' + me.bsId);
      // me.uilog.submit();
      this.crmReadCardParams = obj;
      const actualPayMoney = Number(this.actualPay);
      this.cardKindId = obj.cardTypeId;
      const { deviceReadCardNo } = this;
      if (deviceReadCardNo !== '' && deviceReadCardNo !== obj.cardNo) {
        this.deviceReadCardNo = ''; // 清空读卡记录
      }
      const data = await ajax('canyin.pos.settlement.pay.crmPayWay.calc', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId,
          cardNo: obj.cardNo,
          isMemberprice: this.isCancelDisc === 1,
          pointId: this.pointId,
          actualPay: actualPayMoney,
          cardKindId: this.cardKindId,
          crmFlg: 1,
          teamBsIds: this.teamBsIds,
          discTypeParams: '',
          isDiscount: this.isCancelDisc,
        },
      });
      if (data.data.code === -106) {
        this.$confirm('会员优惠导致已付金额大于应收金额，<span style="color: #f00;">已自动取消会员优惠</span>，若想使用优惠，请将会员卡作为首选结算方式，是否继续结算？', '提示', {
          dangerouslyUseHTMLString: true,
          showClose: false,
        }).then(() => {}).catch(() => {
          this.close();
        });
      } else if (data.msg) {
        this.$message.error(data.msg);
      }
      // eslint-disable-next-line no-eval
      eval(`${obj.callback}({
        billRealMoney: ${data.data.finalPrice},
        itemList: ${data.data.itemList},
        consumeTrueMoney: ${data.data.consumeTrueMoney},
        itemClassList: ${data.data.itemClassList},
        cardShouldPay: ${data.data.consumeTrueMoney},
        hasOtherReduction: ${data.data.hasOtherReduction},
        maLingType: ${data.data.maLingType},
        maLingLocation: ${data.data.maLingLocation}
      })`);
      if (this.isCancelDisc == 0) {
        this.crmReadCardParams = null;
        this.isEnableCancelDisc = true;
        this.isCancelDisc = 1; // 还原
      } else {
        this.isEnableCancelDisc = false;
      }
    },
    /**
     * @函数说明 一卡通支付的结算
     * @修改历史
     * 2018-07-13 于宝龙 创建了该函数
     */
    doSettle(obj) {
      // var me = this;
      // me.uilog.info(
      //   "一卡通提交支付|卡号：" +obj.preConsumeData.cardNo +"|总额：" +obj.preConsumeData.consumeAllMoney +
      //     "|-金额：" + obj.preConsumeData.consumeMoney + "|-积分：" +obj.preConsumeData.consumeScore +
      //     "|营业流水：" + me.bsId
      // );
      // 先禁用，执行完结算后台再启用
      const consumeBtn = obj.preConsumeBtn;
      consumeBtn.disabled = true;
      const pwCrmObj = obj.preConsumeData;
      const consumeTotal = pwCrmObj.cardAllMoney;
      // 调用上层的Settlement.js
      // var $settlementModule = this.settlementModule;
      // var paramsObj = $settlementModule.getCrmPaywayParams(consumeTotal,pwCrmObj);
      // 修改实收金额
      // paramsObj.pay_money = perUseMoney;
      // paramsObj.take_money = consumeTotal;
      const data = {};
      // data.params = JSON.stringify(paramsObj);
      data.crmTsCode = pwCrmObj.crmTsCode;
      data.cardNo = pwCrmObj.cardNo;
      data.password = pwCrmObj.password;
      data.peruseMoney = pwCrmObj.billRealMoney;
      data.consumeScore = pwCrmObj.consumeScore;
      data.consumeScoreMoney = pwCrmObj.scoreConverMoney;
      data.consumeMoney = pwCrmObj.consumeMoney;
      data.consumeTicketMoney = Number(pwCrmObj.allVoucherAmount);
      data.voucherConverMoney = Number(pwCrmObj.voucherConverMoney);
      data.couponType = pwCrmObj.couponType;
      data.couponCodesStr = JSON.stringify(pwCrmObj.couponCodes);
      data.consumeAllMoney = pwCrmObj.cardAllMoney;
      data.cardKindTypeId = this.cardKindId;
      data.memberId = pwCrmObj.memberId;
      data.readCardValue = pwCrmObj.readCardValue;
      data.crmFlg = 1;
      data.useTicketList = JSON.stringify(pwCrmObj.couponCodes);
      const { isMobileIn } = pwCrmObj; // 是否是手机号读卡
      const { verifyingCode } = pwCrmObj; // 是否有验证码
      if (isMobileIn !== undefined) {
        data.isMobileIn = isMobileIn;
      }
      if (verifyingCode !== undefined) {
        data.verifyingCode = verifyingCode;
      }

      const { couponUsedJson } = pwCrmObj;
      if (couponUsedJson !== undefined) {
        data.couponUsed = couponUsedJson;
      }

      const { deviceReadCardNo } = this;
      if (deviceReadCardNo !== undefined && deviceReadCardNo !== '') {
        data.deviceReadCardNo = 1;
      } else {
        data.deviceReadCardNo = 0;
      }
      // 非会员是true，会员false或者不传
      data.memberVerification = !pwCrmObj.isNotVip;
      // 匹配兑换码对应券的券类型，不匹配不允许核销（1代金券 2 折扣券 3 品项券）
      data.couponTypes = JSON.stringify(pwCrmObj.couponTypes);
      // 兑换码数组
      data.exchangeCodes = JSON.stringify(pwCrmObj.exchangeCodes);

      // 非会员是true，会员false或者不传
      data.memberVerification = !pwCrmObj.isNotVip;
      // 匹配兑换码对应券的券类型，不匹配不允许核销（1代金券 2 折扣券 3 品项券）
      data.couponTypes = JSON.stringify(pwCrmObj.couponTypes);
      // 兑换码数组
      data.exchangeCodes = JSON.stringify(pwCrmObj.exchangeCodes);

      this.$emit('crmSettle', {
        data,
        crmPayData: { takeMoney: consumeTotal },
      });

      consumeBtn.disabled = false;

      this.close();
    },
    /**
     * @函数说明 还原会员价优惠
     * @修改历史
     * 2018-07-11 于宝龙 创建了该函数
     */
    doCancel() {
      // var me = this;
      // me.uilog.info("取消一卡通打折|营业流水：" + me.bsId);
      // me.uilog.submit();
      const data = {
        bsId: this.bsId,
        cardKindId: this.cardKindId,
        pointId: this.pointId,
        crmFlg: 1,
        teamBsIds: this.teamBsIds,
        discTypeParams: '',
        deviceReadCardNo: this.deviceReadCardNo,
        crmReadCardParams: this.crmReadCardParams,
      };
      this.$emit('cancelCrmSettle', data);
      this.close();
    },
    doPrintCardCharge(obj) {
      const modifyData = obj;
      modifyData.crmTsCode = Number(obj.crmTsCode);
      modifyData.companyId = Number(obj.companyId);
      if (modifyData.mobile !== null && modifyData.mobile !== '') {
        modifyData.phone = Number(obj.mobile);
      }
      modifyData.crmVersion = 1;
      if (modifyData.tsTypeId !== null && modifyData.tsTypeId !== undefined) {
        modifyData.payWayId = Number(obj.tsTypeId);
      }
      modifyData.payWayName = modifyData.tsTypeName;
      const { deviceReadCardNo } = this;
      if (deviceReadCardNo !== undefined && deviceReadCardNo !== '') {
        modifyData.deviceReadCardNo = 1;
      } else {
        modifyData.deviceReadCardNo = 0;
      }
      ajax('canyin.pos.settlement.pay.crmPayWay.printcardcharge', {
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify(modifyData),
        },
      }).then((res) => {
        if (res.result === 1) {
          if (res.printType === 'PRINT_PARALLEL') { // 并口
            if (res.printD) {
              // 执行打印
              this.$devices.Printer.print(res.printD);
            }
          } else if (res.printType === 'PRINT_SERIAL') { // 串口
            this.$message.success(`${this.$t('Biz.Settlement.Success11')}`);
          }
          if (res.msg) {
            this.$message.success(res.msg);
          }
        } else if (res.result === 0) {
          this.$message.error(res.msg);
        }
      });
    },
    doGetCardNo(obj) {
      this.$devices.Cardop.read((card) => {
        let fun = '';
        if (card && card.returnCode === 0) {
          if (
            +this.posDevice.readCardOpt.mode === 9
            || +this.posDevice.readCardOpt.mode === 15
            || +this.posDevice.readCardOpt.mode === 16
          ) {
            this.deviceReadCardNo = card.CardNo;
          }
          fun = `${obj.callback}({
            cardNo: '${card.CardNo}',
            code: '200',
            msg: '${this.$t('Biz.Settlement.Success38')}'
          })`;
        } else {
          fun = `${obj.callback}({
            cardNo: '',
            code: '500',
            msg: '${this.$t('Biz.Settlement.Error5')}'
          })`;
        }
        eval(fun);
      });
    },
    onClose() {
      this.isEnableCancelDisc = true;
      this.crmReadCardParams = null;
      this.isCancelDisc = 1;
      this.isHaveCrmMemberDiscAuth = 0;
      this.teamBsIds = '';
      this.deviceReadCardNo = '';
      $(this.$refs.crm7PayWayContainer).empty();
    },
    cancelDisc() {
      const data = {
        bsId: this.bsId,
        cardKindId: this.cardKindId,
        pointId: this.pointId,
        crmFlg: 1,
        teamBsIds: '',
        discTypeParams: '',
        deviceReadCardNo: this.deviceReadCardNo,
        cardNo: this.crmReadCardParams.cardNo,
        flg: 1,
      };
      this.$emit('cancelCrmSettle', data);
    },
    // 刷新下crm7会员卡界面
    crm7HtmlRefresh() {
      const me = this;
      if (me.crmReadCardParams != null && me.crmReadCardParams.cardNo !== undefined) {
        me.isCancelDisc = 0;
        const ele = document.querySelector('[ng-controller=webposCtrl]');
        angular.element(ele).scope().readCardMember({ code: 200, cardNo: me.crmReadCardParams.cardNo });
        angular.element(ele).scope().noAllowRead = false;
      }
    },

  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.crm-container {
  height: 100%;
  background-color: #f7f7f7;
}
</style>
