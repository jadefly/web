<template>
  <Dialog
		name="PosDialog.FastMembershipCardCrm6"
		:title="$t('Dict.MemberCard')"
		ref="dialog"
		@close="onClose"
		@open="onOpen"
		:append-to-body="true"
    :closeByClickModel="false"
    :showClose="false"
		width="1000px"
		height="669px"
		top="5vh"
	>
    <template slot="other-button">
      <button  type="button" class="btn btn-default" @click="doCancel">{{$t('Dict.Close')}}(Esc)</button>
    </template>
    <div
      ref="fastCrm6PayWayContainer"
      class="crm-container"
    ></div>
  </Dialog>
</template>

<script>
import { delay } from 'lodash';
import { mapActions } from 'vuex';
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
      payWayId: '',
      pointId: '',
      cardKindId: '',
      deviceReadCardNo: null,
      orderCodeMode: null, // 获取当前牌号模式(非后台设置牌号)
      orderCode: null, // 牌号
      readCardFlg: false, // 是否进行读卡,用于crm优惠的取消
      consumeTrueMoney: null, // 需要支付的金额
      posId: null, // 当前posId
      saleTypeId: null, // 当前销售类型
    };
  },
  methods: {
    onOpen() {
      this.bsId = this.resData.bsId;
      this.payWayId = this.resData.payWayId;
      this.pointId = this.resData.pointId;
      this.orderCodeMode = this.resData.orderCodeMode;
      this.orderCode = this.resData.orderCode;
      this.posId = this.resData.posId;
      this.saleTypeId = this.resData.saleTypeId;
      this.initCrmDependencies();
      this.deviceReadCardNo = '';
      this.cardKindId = '';
      delay(() => {
        $(this.$refs.fastCrm6PayWayContainer).html(this.resData.crmHtml);
      }, 500);
    },

    initCrmDependencies() {
      const KEYCODE = {
        // 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g",72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n",
        // 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z",
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
          this.$hotKey.set('PosDialog.FastMembershipCardCrm6', hotkeyConfig);
        },
        pauseEvent: () => {},
        resumeEvent: () => {},
      };
      window.crmGetConsumeInfoCallback = (obj) => {
        ajax('canyin.pos.settlement.pay.crmPayWay.doGetConsumeInfo', {
          contentType: 'URLEncoded',
          data: {
            pointId: this.pointId,
            actualPay: 0, // 已付金额(由于快餐会员卡快速结算混合结算时只能先选会员卡，所以已付金额永远为0)
          },
        }).then((data) => {
          eval(`${obj.callback}({
                billRealMoney: ${data.finalPrice},
                itemList: ${data.itemList},
                consumeTrueMoney: ${data.consumeTrueMoney},
                cardNoLst: ${data.cardNoLst},
                mobile: ${data.mobile}
            })`);
        });
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
    },
    /**
     * @函数说明 一卡通支付的计算优惠价格
     * @修改历史
     * 2018-07-11 于宝龙 创建了该函数
     */
    doCalc(obj) {
      // me.uilog.info('一卡通读卡|卡号：' + obj.cardNo + '|卡类型：' + obj.cardKindId+ '|营业流水：' + me.bsId);
      // me.uilog.submit();
      this.cardKindId = obj.cardKindId;

      const { deviceReadCardNo } = this;
      if (deviceReadCardNo !== '' && deviceReadCardNo !== obj.cardNo) {
        this.deviceReadCardNo = ''; // 清空读卡记录
      }
      const me = this;
      $.ajax({
        url: `${process.env.API_PATH}/canyin/pos/settlement/pay/crmpayway/calcv2`,
        async: false,
        type: 'POST',
        data: {
          bsId: this.bsId,
          cardNo: obj.cardNo,
          isMemberprice: +obj.isMemberPriceFlag === 1,
          pointId: this.pointId,
          actualPay: 0, // 已付金额(由于快餐会员卡快速结算混合结算时只能先选会员卡，所以已付金额永远为0)
          cardKindId: this.cardKindId,
          crmFlg: 0,
          teamBsIds: null,
          orderCodeMode: this.orderCodeMode,
		      orderCode: this.orderCode,
        },
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        success(data) {
          if (data.code === '1') {
            if (data.data.msg) {
              me.$message.error(data.data.msg);
            }
            // this.readCardFlg = true;
            me.consumeTrueMoney = data.data.data.consumeTrueMoney;
            // 更新隐藏域，缓存会员价优惠总额
            // 此处有疑问暂时注释掉
            if (data.data.data.isMemberprice) {
              me.readCardFlg = true;
            }
            eval(`${obj.callback}({
                billRealMoney: ${data.data.data.finalPrice},
                itemList: ${data.data.data.itemList},
                consumeTrueMoney: ${data.data.data.consumeTrueMoney},
                itemClassList: ${data.data.data.itemClassList}
            })`);
          } else {
            me.$message.error(data.msg ? data.msg : this.$t('Dict.SystemError'));
          }
        },
        error() {
          me.$message.error(this.$t('Dict.SystemError'));
        },
      });
      // ajax("canyin.pos.settlement.pay.crmPayWay.calc", {
      //   contentType: "URLEncoded",
      //   data: {
      //     bsId: this.bsId,
      //     cardNo: obj.cardNo,
      //     isMemberprice: obj.isMemberPriceFlag == 1 ? true : false,
      //     pointId: this.pointId,
      //     actualPay: 0,//已付金额(由于快餐会员卡快速结算混合结算时只能先选会员卡，所以已付金额永远为0)
      //     cardKindId: this.cardKindId,
      //     crmFlg: 0,
      //     teamBsIds: null,
      //     orderCodeMode : this.orderCodeMode,
		  //     orderCode: this.orderCode
      //   }
      // }).then(data => {
      //   if (data.data.msg) {
      //     this.$message.error(data.data.msg);
      //   }

      //   // this.readCardFlg = true;
      //   this.consumeTrueMoney = data.data.consumeTrueMoney;
      //   // 更新隐藏域，缓存会员价优惠总额
      //   // 此处有疑问暂时注释掉
      //   if (data.data.isMemberprice) {
      //       this.readCardFlg = true ;
      //   }
      //   eval(`${obj.callback}({
      //       billRealMoney: ${data.data.finalPrice},
      //       itemList: ${data.data.itemList},
      //       consumeTrueMoney: ${data.data.consumeTrueMoney},
      //       itemClassList: ${data.data.itemClassList}
      //   })`);
      // });
    },
    /**
     * @函数说明 一卡通支付的结算
     * @修改历史
     * 2018-07-13 于宝龙 创建了该函数
     */
    doSettle(obj) {
      // console.log('结算', obj);
      // var me = this;
      // me.uilog.info(
      //   "一卡通提交支付|卡号：" +obj.preConsumeData.cardNo +"|总额：" +obj.preConsumeData.consumeAllMoney +
      //     "|-金额：" + obj.preConsumeData.consumeMoney + "|-积分：" +obj.preConsumeData.consumeScore +
      //     "|营业流水：" + me.bsId
      // );

      // 先禁用，执行完结算后台再启用
      const { consumeBtn } = obj;
      consumeBtn.disabled = true;

      const pwCrmObj = obj.preConsumeData;

      // 字段改名对应
      const { isMemberPriceFlag } = pwCrmObj;
      pwCrmObj.isIntegral = pwCrmObj.isIntegralFlag === 1;
      delete pwCrmObj.isIntegralFlag;
      pwCrmObj.isMemberprice = pwCrmObj.isMemberPriceFlag === 1;
      delete pwCrmObj.isMemberPriceFlag;

      const { perUseMoney } = pwCrmObj;
      const consumeTotal = pwCrmObj.consumeAllMoney;
      if (this.consumeTrueMoney == null) {
        this.$message.error(this.$t('Biz.Settlement.Error87'));
        consumeBtn.disabled = false;
        return false;
      }

      // 调用上层的Settlement.js
      // var $settlementModule = this.settlementModule;
      // var paramsObj = $settlementModule.getCrmPaywayParams(consumeTotal,pwCrmObj);

      // 修改实收金额
      // paramsObj.pay_money = perUseMoney;
      // paramsObj.take_money = consumeTotal;

      const data = {};
      // data.params = JSON.stringify(paramsObj);
      data.cardNo = pwCrmObj.cardNo;
      data.password = pwCrmObj.password;
      data.peruseMoney = pwCrmObj.perUseMoney;
      data.consumeScore = pwCrmObj.consumeScore;
      data.consumeMoney = pwCrmObj.consumeMoney;
      data.consumeIntegralMoney = pwCrmObj.consumeIntegralMoney;
      data.isMemberprice = pwCrmObj.isMemberprice;
      data.isIntegral = pwCrmObj.isIntegral;
      data.useTicketList = JSON.stringify(pwCrmObj.useTicketList);
      data.consumeAllMoney = consumeTotal;
      data.cardKindTypeId = this.cardKindId;
      data.crmFlg = 0;
      data.useNoMemTicketList = pwCrmObj.useNoMemTicketList;
      data.consumeNoMemTicketMoney = pwCrmObj.consumeNoMemTicketMoney;
      data.consumeScoreMoney = pwCrmObj.consumeScore;
      data.consumeTicketMoney = consumeTotal - pwCrmObj.consumeScore - pwCrmObj.consumeMoney;

      const {deviceReadCardNo} = this;
      if (deviceReadCardNo !== undefined && deviceReadCardNo !== '') {
        data.deviceReadCardNo = 1;
      } else {
        data.deviceReadCardNo = 0;
      }
      this.crm6SettleTask({ data: data, consumeTotal: consumeTotal, consumeBtn: consumeBtn });
      // this.close()
    },
    /**
     * @函数说明 Crm6结算逻辑
     * @修改历史
     *  2018-11-06 张亚强 创建了该函数
     */
    crm6SettleTask(data) {
      let url = 'canyin.pos.settlement.fastsettle';
      let isCrmMixPay = false;
      if (this.consumeTrueMoney != data.consumeTotal) { // 判断支付金额和应付金额是否一致,如果不一致,则进行crm和其他结算方式混付
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
        if (res.result == '1') {
          if (!isCrmMixPay) {
            // 打印
            this.$vemit('fastPanelPrint', res.data);
            // me.claerBillAndRefresh(currentPointId);
            // 支付完 ，付款回显
            // BillBsModule.Payshowarea(me.consumeTrueMoney,"0.00");
            // BillBsModule.printLeaveTable(me.bizPrintLeaveTableParamsList);
            // 易盘数据计算进行初始化
            // BillBsModule.endpayEasyData();
            this.$message.success(this.$t('Dict.SuccessfulSettlement'));
            const { pointId } = this;
            localStorage.setItem(`${pointId}Remark`, '');
            localStorage.setItem(`${pointId}buttonRemarks`, null);
            this.$vemit('fastClearEmptyBill');
          } else { // 混合结算
            const resCrmData = res.data.crmdata;
            const crmData = {
              name: this.$t('Dict.MemberCard'),
              price: resCrmData.consumeAllMoney,
              crmId: 'crm6',
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
            // 已经使用打折或优惠重新刷新账单
            this.$vemit('fastLoadBillBus');
            // 恢复智能餐盘的可加可删品项功能
            // BillBsModule.iseasyadditem = true;
            this.$message.warning(this.$t('Biz.Order.DoPayErrorMsg01'));
            // 添加crm相关禁点按钮
            this.$vemit('crmSetDisablebtnBus');
          }
          // // 关闭弹窗及提示
          // me.uilog.submit();
          // 执行完成后启用结算按钮
          // data.consumeBtn是crm6SettleTask方法的参数
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
     * 2018-07-11 于宝龙 创建了该函数
     */
    doCancel() {
      // var me = this;
      // me.uilog.info("取消一卡通打折|营业流水：" + me.bsId);
      // me.uilog.submit();
      this.close();
      if (this.readCardFlg === false) {
        return false;
      }
      const params = {
        bsId: this.bsId,
        cardKindId: this.cardKindId,
        pointId: this.pointId,
        crmFlg: 1,
      };
      ajax('canyin.pos.settlement.pay.crmPayWay.cancel', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.success) {
          this.cancelReadNo();
          // 不再使用 // 恢复默认销售类型
          //  this.$vemit("refreshSaleTypeBus")
        } else {
          this.$message.error(res.msg);
        }
        this.close();
      });
    },
    // 设备类型 RD_VCP2001D荣大可视卡  出卡
    cancelReadNo() {
      const {deviceReadCardNo} = this;
      if (deviceReadCardNo !== undefined && deviceReadCardNo !== '') {
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
    doPrintCardCharge(obj) {
      obj.crmTsCode = Number(obj.crmTsCode);
      obj.companyId = Number(obj.companyId);
      if (obj.mobile != null && obj.mobile !== '') {
        obj.phone = Number(obj.mobile);
      }
      obj.crmVersion = 0;

      ajax('canyin.pos.settlement.pay.crmPayWay.printcardcharge', {
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify(obj),
        },
      }).then((res) => {
        if (res.result == 1) {
          if (res.printType == 'PRINT_PARALLEL') { // 并口
            if (res.printD) {
              // 执行打印
              this.$devices.Printer.print(res.printD);
            }
          } else if (res.printType == 'PRINT_SERIAL') { // 串口
           this.$message.success(this.$t('Biz.Settlement.Success11'));
          }
          if (res.msg) {
            this.$message.success(res.msg);
          }
        } else if (res.result == 0) {
          this.$message.error(res.msg);
        }
      });
    },
    doGetCardNo(obj) {
      this.$devices.Cardop.read((card) => {
        let fun = '';
        if (card && card.returnCode == 0) {
          if (
						this.$store.getters.posDevice.readCardOpt.mode == 9
						|| this.$store.getters.posDevice.readCardOpt.mode == 15
						|| this.$store.getters.posDevice.readCardOpt.mode == 16
					) {
            this.deviceReadCardNo = card.CardNo;
          }
          fun = `${obj.callback}({
            cardNo: '${card.CardNo}',
            errorCode: '200',
            errorMsg: '${this.$t('Biz.Pos.More.Crm7SellMsg1')}'
          })`;
        } else {
          fun = `${obj.callback}({
            cardNo: '',
            errorCode: '500',
            errorMsg: '${this.$t('Biz.Order.ReadCardErrorMsg')}'
          })`;
        }
        eval(fun);
      });
    },
    onClose() {
      this.deviceReadCardNo = '';
      $(this.$refs.fastCrm6PayWayContainer).empty();
    },
    ...mapActions([
      'setSelectCrmData',
    ]),
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
