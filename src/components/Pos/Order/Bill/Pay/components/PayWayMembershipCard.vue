<template>
  <Dialog
    name="PosDialog.PayWayMembershipCard"
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
      ref="crm6PayWayContainer"
      class="crm-container"
    ></div>
  </Dialog>
</template>

<script>
import $ from 'jquery';
import { delay } from 'lodash';
import { mapGetters } from 'vuex';
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
      teamBsIds: '', // 团队流水,
    };
  },
  computed: {
    ...mapGetters([
      'getVuexPosMode', // 快餐的当前账单的数据
      'posOrderBill', // 当前pos的一些相关设置
      'getFastFoodBillData',
      'posDevice',
    ]),
  },
  methods: {
    onOpen() {
      this.bsId = this.resData.bsId;
      this.actualPay = this.resData.actualPay;
      const billData = this.getVuexPosMode === '3'
        ? this.getFastFoodBillData
        : this.posOrderBill;
      this.pointId = billData.bsData.pointId;
      this.teamBsIds = this.resData.teamBsIds;
      this.initCrmDependencies();
      this.deviceReadCardNo = '';
      this.cardKindId = '';
      delay(() => {
        $(this.$refs.crm6PayWayContainer).html(this.resData.crmHtml);
      }, 500);
    },

    initCrmDependencies() {
      const KEYCODE = {
        // 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g",
        // 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n",
        // 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u",
        // 86: "v", 87: "w", 88: ///"x", 89: "y", 90: "z",
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
            cardNoLst: ${data.cardNoLst},
            mobile: ${data.mobile}
          })`);
        });
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
    },
    /**
     * @函数说明 一卡通支付的计算优惠价格
     * @修改历史
     * 2018-07-11 于宝龙 创建了该函数
     */
    async doCalc(obj) {
      // me.uilog.info('一卡通读卡|卡号：' + obj.cardNo + '|卡类型：' + obj.cardKindId+ '|营业流水：' + me.bsId);
      // me.uilog.submit();

      const actualPayMoney = Number(this.actualPay);

      this.cardKindId = obj.cardKindId;
      const { deviceReadCardNo } = this;
      if (deviceReadCardNo !== '' && deviceReadCardNo !== obj.cardNo) {
        this.deviceReadCardNo = ''; // 清空读卡记录
      }
      const data = await ajax('canyin.pos.settlement.pay.crmPayWay.calc', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId,
          cardNo: obj.cardNo,
          isMemberprice: +obj.isMemberPriceFlag === 1,
          pointId: this.pointId,
          actualPay: actualPayMoney,
          cardKindId: this.cardKindId,
          crmFlg: 0,
          teamBsIds: this.teamBsIds,
          discTypeParams: '',
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
        itemClassList: ${data.data.itemClassList}
      })`);
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
      // const { isMemberPriceFlag } = pwCrmObj;
      pwCrmObj.isIntegral = pwCrmObj.isIntegralFlag === 1;
      delete pwCrmObj.isIntegralFlag;
      pwCrmObj.isMemberprice = pwCrmObj.isMemberPriceFlag === 1;
      delete pwCrmObj.isMemberPriceFlag;
      // const { perUseMoney } = pwCrmObj;

      const consumeTotal = pwCrmObj.consumeAllMoney;

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

      const { deviceReadCardNo } = this;
      if (deviceReadCardNo !== undefined && deviceReadCardNo !== '') {
        data.deviceReadCardNo = 1;
      } else {
        data.deviceReadCardNo = 0;
      }

      this.$emit('crmSettle', { data, crmPayData: { takeMoney: consumeTotal } });

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
        crmFlg: 0,
        teamBsIds: '',
        discTypeParams: '',
        deviceReadCardNo: this.deviceReadCardNo,
      };
      this.$emit('cancelCrmSettle', data);

      this.close();
    },
    doPrintCardCharge(obj) {
      const modifyObj = obj;
      modifyObj.crmTsCode = Number(modifyObj.crmTsCode);
      modifyObj.companyId = Number(modifyObj.companyId);
      if (modifyObj.mobile !== null && modifyObj.mobile !== '') {
        modifyObj.phone = Number(modifyObj.mobile);
      }
      modifyObj.crmVersion = 0;
      ajax('canyin.pos.settlement.pay.crmPayWay.printcardcharge', {
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify(modifyObj),
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
            +this.posDevice.readCardOpt.mode === 15
            || +this.posDevice.readCardOpt.mode === 9
            || +this.posDevice.readCardOpt.mode === 16
          ) {
            this.deviceReadCardNo = card.CardNo;
          }
          fun = `${obj.callback}({
            cardNo: '${card.CardNo}',
            errorCode: '200',
            errorMsg: '${this.$t('Biz.Settlement.Success38')}'
          })`;
        } else {
          fun = `${obj.callback}({
            cardNo: '',
            errorCode: '500',
            errorMsg: '${this.$t('Biz.Settlement.Error5')}'
          })`;
        }
        eval(fun);
      });
    },
    onClose() {
      this.teamBsIds = '';
      this.deviceReadCardNo = '';
      $(this.$refs.crm6PayWayContainer).empty();
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
