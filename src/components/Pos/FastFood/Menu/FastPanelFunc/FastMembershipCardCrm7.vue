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
        type="button"
        class="btn btn-primary"
        @click="cancelDisc"
        :disabled="isEnableCancelDisc">{{$t('Biz.Settlement.CancelMemberDiscount')}}</button>
      <button
        type="button"
        class="btn
        btn-default"
        @click="doCancel"
      >{{ $t('Dict.Close') }}(Esc)</button>
    </template>
    <div
      ref="fastCrm7PayWayContainer"
      class="crm-container"
    ></div>
  </Dialog>
</template>

<script>
import $ from 'jquery';
import { mapActions } from 'vuex';
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
      pointId: '',
      cardKindId: '',
      deviceReadCardNo: null,
      isEnableCancelDisc: true,
      isCancelDisc: 1, // 是否进行取消优惠
      crmReadCardParams: {}, // CRM7读卡参数
      isHaveCrmMemberDiscAuth: 0, // 是否有取消会员折扣权限
      orderCodeMode: null, // 获取当前牌号模式(非后台设置牌号)
      orderCode: null, // 牌号
      posId: null, // 当前posId
      saleTypeId: null, // 当前销售类型
      consumeTrueMoney: null, // 需要支付的金额
      crmTsCode: '', // crm流水号
      readCardFlg: false, // 是否进行读卡,用于crm优惠的取消
    };
  },
  computed: {
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
      this.bsId = this.resData.bsId;
      this.pointId = this.resData.pointId;
      this.orderCodeMode = this.resData.orderCodeMode;
      this.orderCode = this.resData.orderCode;
      this.posId = this.resData.posId;
      this.saleTypeId = this.resData.saleTypeId;
      this.initCrmDependencies();
      this.isHaveCrmMemberDiscAuth = this.resData.isHaveCrmMemberDiscAuth;
      this.isEnableCancelDisc = true;
      this.crmReadCardParams = null;
      this.isCancelDisc = 1;
      this.deviceReadCardNo = '';
      this.cardKindId = '';
      // 先渲染页面
      $(this.$refs.fastCrm7PayWayContainer).html(this.resData.crmHtml);
      // 在延迟进行焦点获取, 原方法连DOM渲染都延迟了~~~~
      setTimeout(() => {
        $(this.$refs.fastCrm7PayWayContainer).find('input#cardNo').get(0).dispatchEvent(new Event('focus'));
      }, 500);
    },
    initCrmDependencies() {
      const KEYCODE = {
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
          this.$hotKey.set('PosDialog.PayWayMembershipCardCrm7', hotkeyConfig);
        },
        pauseEvent: () => {},
        resumeEvent: () => {},
      };
      // 读实体卡
      window.crmGetCardNoCallback = (obj) => {
        this.doGetCardNo(obj);
      };
      // 读卡的回调
      window.crmGetCardCallback = (obj) => {
        this.doCalc(obj);
      };
      // 结算的回调
      window.crmPreConsumeCallback = (obj) => {
        this.doSettle(obj);
      };
      // CRM充值成功的回调
      window.crmGetCardChargeCallback = (obj) => {
        this.doPrintCardCharge(obj);
      };
      // 非会员卡券执行的回调
      window.crmGetConsumeInfoCallback = (obj) => {
        ajax('canyin.pos.settlement.pay.crmPayWay.doGetConsumeInfo', {
          contentType: 'URLEncoded',
          data: {
            pointId: this.pointId,
            actualPay: 0, // 已付金额(由于快餐会员卡快速结算混合结算时只能先选会员卡，所以已付金额永远为0)
          },
        }).then((data) => {
          // eslint-disable-next-line no-eval
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
          // 当不读卡结算时consumeTrueMoney为空,页面回调 直接使用传来应收
          this.consumeTrueMoney = data.consumeTrueMoney;
        });
      };
      // 請求回去當前客位的會員信息
      window.getCardNoFromReserveOrder = (obj) => {
        const { showMemberNoMessage } = this.resData;
        eval(`${obj.callback}(showMemberNoMessage)`);
      };
    },
    /**
     * @函数说明 一卡通支付的计算优惠价格
     * @修改历史
     *   2018-07-11 于宝龙 创建了该函数
     */
    doCalc(obj) {
      // me.uilog.info('一卡通读卡|卡号：' + obj.cardNo + '|卡类型：' + obj.cardKindId+ '|营业流水：' + me.bsId);
      // me.uilog.submit();
      this.crmReadCardParams = obj;
      this.cardKindId = obj.cardTypeId;

      const { deviceReadCardNo } = this;
      // eslint-disable-next-line eqeqeq
      if (deviceReadCardNo != '' && deviceReadCardNo != obj.cardNo) {
        this.deviceReadCardNo = ''; // 清空读卡记录
      }
      const params = {
        bsId: this.bsId,
        cardNo: obj.cardNo,
        isMemberprice: +this.isCancelDisc === 1,
        pointId: this.pointId,
        actualPay: 0, // 已付金额(由于快餐会员卡快速结算混合结算时只能先选会员卡，所以已付金额永远为0)
        cardKindId: this.cardKindId,
        crmFlg: 1,
        teamBsIds: null,
        isDiscount: this.isCancelDisc,
        orderCodeMode: this.orderCodeMode,
        orderCode: this.orderCode,
      };

      ajax('canyin.pos.settlement.pay.crmPayWay.calc', {
        contentType: 'URLEncoded',
        data: params,
      }).then((data) => {
        if (data.data.msg) {
          this.$message.error(data.data.msg);
        }
        // eslint-disable-next-line no-eval
        eval(`${obj.callback}({
          billRealMoney: ${data.data.finalPrice},
          itemList: ${data.data.itemList},
          itemClassList: ${data.data.itemClassList},
          cardShouldPay: ${data.data.consumeTrueMoney},
          hasOtherReduction: ${data.data.hasOtherReduction},
          maLingType: ${data.data.maLingType},
          maLingLocation: ${data.data.maLingLocation}
        })`);
        this.consumeTrueMoney = data.data.consumeTrueMoney;
        if (data.data.isMemberprice) {
          this.readCardFlg = true;
        }
        // eslint-disable-next-line eqeqeq
        if (this.isCancelDisc == 0) {
          // me.settlementModule.cancelMemberDisc()
          this.crmReadCardParams = null;
          this.isEnableCancelDisc = true;
          this.isCancelDisc = 1; // 还原
        } else {
          this.isEnableCancelDisc = false;
        }
      });
    },
    /**
     * @函数说明 一卡通支付的结算
     * @修改历史
     *    2018-07-13 于宝龙 创建了该函数
     */
    doSettle(obj) {
      // var me = this;
      // me.uilog.info(
      //   '一卡通提交支付|卡号：' +obj.preConsumeData.cardNo +'|总额：' +obj.preConsumeData.consumeAllMoney +
      //     '|-金额：' + obj.preConsumeData.consumeMoney + '|-积分：' +obj.preConsumeData.consumeScore +
      //     '|营业流水：' + me.bsId
      // );

      // 先禁用，执行完结算后台再启用
      const consumeBtn = obj.preConsumeBtn;
      consumeBtn.disabled = true;
      const pwCrmObj = obj.preConsumeData;
      const consumeTotal = pwCrmObj.cardAllMoney;
      if (this.consumeTrueMoney == null) {
        this.$message.error(this.$t('Biz.Settlement.Error87'));
        consumeBtn.disabled = false;
        return false;
      }

      // 调用上层的Settlement.js
      // var $settlementModule = this.settlementModule;
      // var paramsObj = $settlementModule.getCrmPaywayParams(data.,pwCrmObj);

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
      // data.couponCodes = pwCrmObj.couponCodes;
      // data.couponCodesStr = JSON.stringify(pwCrmObj.couponCodes);
      data.consumeAllMoney = pwCrmObj.cardAllMoney;
      data.cardKindTypeId = this.cardKindId;
      data.memberId = pwCrmObj.memberId;
      data.readCardValue = pwCrmObj.readCardValue;
      data.crmFlg = 1;
      data.useTicketList = JSON.stringify(pwCrmObj.couponCodes);
      // eslint-disable-next-line prefer-destructuring
      const isMobileIn = pwCrmObj.isMobileIn; // 是否是手机号读卡
      // eslint-disable-next-line prefer-destructuring
      const verifyingCode = pwCrmObj.verifyingCode; // 是否有验证码
      // eslint-disable-next-line eqeqeq
      if (isMobileIn != undefined) {
        data.isMobileIn = isMobileIn;
      }
      // eslint-disable-next-line eqeqeq
      if (verifyingCode != undefined) {
        data.verifyingCode = verifyingCode;
      }

      // eslint-disable-next-line prefer-destructuring
      const couponUsedJson = pwCrmObj.couponUsedJson;
      // eslint-disable-next-line eqeqeq
      if (couponUsedJson != undefined) {
        data.couponUsed = couponUsedJson;
      }

      // eslint-disable-next-line prefer-destructuring
      const deviceReadCardNo = this.deviceReadCardNo;
      // eslint-disable-next-line eqeqeq
      if (deviceReadCardNo != undefined && deviceReadCardNo != '') {
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

      // Crm流水号
      this.crmTsCode = pwCrmObj.crmTsCode;
      this.crm7SettleTask({
        data,
        consumeTotal,
        consumeBtn,
      });
      return true;
    },

    /**
     * @函数说明 Crm7结算逻辑
     * @修改历史
     *    2018-11-08 张亚强 创建了该函数
     */
    crm7SettleTask(data) {
      let url = 'canyin.pos.settlement.fastsettle';
      let isCrmMixPay = false;
      if (+this.consumeTrueMoney !== +data.consumeTotal) {
        // 判断支付金额和应付金额是否一致,如果不一致,则进行crm和其他结算方式混付
        url = 'canyin.pos.settlement.crmmixsettle';
        isCrmMixPay = true;
      }

      const params = {
        posId: this.posId,
        point_id: this.pointId,
        bsId: this.bsId,
        controlMode: '3', // 3代表快餐
        isLog: false,
        orderCode: this.orderCode,
        saleTypeId: this.saleTypeId,
        bizTsPwCrmParams: JSON.stringify(data.data),
        orderCodeMode: this.orderCodeMode,
      };
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        if (`${res.result}` === '1') {
          if (!isCrmMixPay) {
            // 打印
            this.$vemit('fastPanelPrint', res.data);
            // 支付完 ，付款回显
            // BillBsModule.Payshowarea(me.consumeTrueMoney,'0.00');
            // 易盘数据计算进行初始
            // BillBsModule.endpayEasyData();
            // BillBsModule.printLeaveTable(me.bizPrintLeaveTableParamsList);
            this.$message.success(this.$t('Dict.SuccessfulSettlement'));
            this.$vemit('fastClearEmptyBill');
            // eslint-disable-next-line prefer-destructuring
            const pointId = this.pointId;
            localStorage.setItem(`${pointId}Remark`, '');
            localStorage.setItem(`${pointId}buttonRemarks`, null);
          } else {
            const resCrmData = res.data.crmdata;
            const crmData = {
              name: this.$t('Dict.MemberCard'),
              price: resCrmData.consumeAllMoney,
              crmId: 'crm7',
              disBgc: '#e7bf58', // 写死色值, [0]固定为折扣, [1]固定为优惠, [2]固定为混合结算
              cardInfo: {
                cardNo: resCrmData.cardNo,
                consumeMoney: resCrmData.consumeMoney,
                consumeScore: resCrmData.consumeScore,
                consumeTicketMoney: resCrmData.consumeTicketMoney,
                cardKindTypeId: resCrmData.cardKindTypeId,
                deviceReadCardNo: resCrmData.deviceReadCardNo,
              },
            };
            // 会员卡数据
            this.setSelectCrmData({ list: crmData });
            // BillBsModule.getCrmpalyMoney(data);
            // //恢复智能餐盘的可加可删品项功能
            // BillBsModule.iseasyadditem = true;
            this.$message.warning(this.$t('Biz.Settlement.Error46'));
            // 已经使用打折或优惠重新刷新账单
            this.$vemit('fastLoadBillBus');
            // this.$vemit('fastClearEmptyBill');
            // 添加crm相关禁点按钮
            this.$vemit('crmSetDisablebtnBus');
          }
          // 执行完成后启用结算按钮
          // data.consumeBtn是crm6SettleTask方法的参数
          // eslint-disable-next-line no-param-reassign
          data.consumeBtn.disabled = false;
          // 关闭窗口
          this.close();
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    /**
     * @函数说明 还原会员价优惠
     * @修改历史
     *    2018-07-11 于宝龙 创建了该函数
     */
    doCancel() {
      // var me = this;
      // me.uilog.info('取消一卡通打折|营业流水：' + me.bsId);
      // me.uilog.submit();
      this.close();
      // eslint-disable-next-line eqeqeq
      if (this.readCardFlg == false) {
        return false;
      }

      // eslint-disable-next-line eqeqeq
      if (this.cardKindId == undefined || this.cardKindId == null) {
        return false;
      }
      const params = {
        bsId: this.bsId,
        cardKindId: this.cardKindId,
        pointId: this.pointId,
        crmFlg: 1,
        teamBsIds: null,
        crmTsCode: this.crmTsCode,
      };
      ajax('canyin.pos.settlement.pay.crmPayWay.fastsettlecancel', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.success) {
          this.cancelReadNo();
          // 不在使用 // 恢复默认销售类型
          // this.$vemit('refreshSaleTypeBus');
        } else {
          this.$message.error(res.msg);
        }
        this.close();
      });
      return true;
    },
    doPrintCardCharge(obj) {
      // eslint-disable-next-line no-param-reassign
      obj.crmTsCode = Number(obj.crmTsCode);
      // eslint-disable-next-line no-param-reassign
      obj.companyId = Number(obj.companyId);
      // eslint-disable-next-line eqeqeq
      if (obj.mobile != null && obj.mobile != '') {
        // eslint-disable-next-line no-param-reassign
        obj.phone = Number(obj.mobile);
      }
      // eslint-disable-next-line no-param-reassign
      obj.crmVersion = 1;
      if (obj.tsTypeId != null && obj.tsTypeId != undefined) {
        obj.payWayId = Number(obj.tsTypeId);
      }
      obj.payWayName = obj.tsTypeName;
      ajax('canyin.pos.settlement.pay.crmPayWay.printcardcharge', {
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify(obj),
        },
      }).then((res) => {
        if (+res.result === 1) {
          if (`${res.printType}` === 'PRINT_PARALLEL') {
            // 并口
            // 执行打印
            this.$devices.Printer.print(res.printD);
          } else if (`${res.printType}` === 'PRINT_SERIAL') {
            // 串口
            this.$message.success(this.$t('Biz.Settlement.Success11'));
          }
          if (res.msg) {
            this.$message.success(res.msg);
          }
        } else if (+res.result === 0) {
          this.$message.error(res.msg);
        }
      });
    },
    doGetCardNo(obj) {
      this.$devices.Cardop.read((card) => {
        let fun = '';
        // eslint-disable-next-line eqeqeq
        if (card && card.returnCode == 0) {
          if (
            +this.$store.getters.posDevice.readCardOpt.mode === 9
            || +this.$store.getters.posDevice.readCardOpt.mode === 15
            || +this.$store.getters.posDevice.readCardOpt.mode === 16
          ) {
            this.deviceReadCardNo = card.CardNo;
          }
          fun = `${obj.callback}({
            cardNo: '${card.CardNo}',
            code: '200',
            msg: '${this.$t('Biz.Pos.More.Crm7SellMsg1')}'
          })`;
        } else {
          fun = `${obj.callback}({
            cardNo: '',
            code: '500',
            msg: '${this.$t('Biz.Order.ReadCardErrorMsg')}'
          })`;
        }
        // eslint-disable-next-line no-eval
        eval(fun);
      });
    },
    /**
     * 设备类型 RD_VCP2001D荣大可视卡  出卡
     *    2018-11-08 张亚强 创建了该函数
     */
    cancelReadNo() {
      const { deviceReadCardNo } = this;
      // eslint-disable-next-line eqeqeq
      if (deviceReadCardNo != undefined && deviceReadCardNo != '') {
        if (this.$store.getters.posDevice.readCardOpt.mode === 9) {
          this.$devices.Cardop.cancel();
        }
        if (this.$store.getters.posDevice.readCardOpt.mode === 15) {
          this.$devices.Cardop.cancelOut();
        }
        if (this.$store.getters.posDevice.readCardOpt.mode === 16) {
          this.$devices.Cardop.cancelOut();
        }
      }
    },
    onClose() {
      this.isEnableCancelDisc = true;
      this.crmReadCardParams = null;
      this.isCancelDisc = 1;
      this.isHaveCrmMemberDiscAuth = 0;
      this.deviceReadCardNo = '';
      // eslint-disable-next-line no-undef
      $(this.$refs.fastCrm7PayWayContainer).empty();
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
      // eslint-disable-next-line eqeqeq
      if (me.crmReadCardParams != null && me.crmReadCardParams.cardNo != undefined) {
        me.isCancelDisc = 0;
        // eslint-disable-next-line vars-on-top
        const ele = document.querySelector('[ng-controller=webposCtrl]');
        // eslint-disable-next-line no-undef
        angular.element(ele).scope().readCardMember({
          code: 200,
          cardNo: me.crmReadCardParams.cardNo,
        });
        // eslint-disable-next-line no-undef
        angular.element(ele).scope().noAllowRead = false;
      }
    },
    ...mapActions(['setSelectCrmData']),
  },
};
</script>

<style lang='less' scoped>
@import '~@/common/less/variables.less';
@import '~@/common/less/mixins.less';

.crm-container {
  height: 100%;
  background-color: #f7f7f7;
}
</style>
