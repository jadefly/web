<template>
  <Dialog
    name="PosDialog.Crm7SellCard"
    :title="$t('Biz.Crm.SellCard')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :closeByClickModel="false"
    width="1000px"
    height="669px"
    top="5vh">
    <div id="crm7SellCardContainer" class="crm-container"></div>
  </Dialog>
</template>

<script>
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
      sumPayWayMoney: 0,
      pointId: '',
      cardKindId: '',
      deviceReadCardNo: '',
    };
  },
  methods: {
    onOpen() {
      this.initCrmDependencies();
      ajax('canyin.pos.settlement.pay.crmPayWay.crmCardSelling', {
        params: {
          crmVersion: 1,
        },
      }).then((res) => {
        $('#crm7SellCardContainer').html(res.crmHtml);
      }).catch((code, msg) => {
        this.close();
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    onClose() {
      this.cancelReadNo();
      $('#crm7SellCardContainer').empty();
    },

    initCrmDependencies() {
      const KEYCODE = {
        // 65: "a", 66: "b", 67: "c", 68: "d", 69: "e",
        // 70: "f", 71: "g",72: "h", 73: "i", 74: "j",
        // 75: "k", 76: "l", 77: "m", 78: "n",
        // 79: "o", 80: "p", 81: "q", 82: "r", 83: "s",
        // 84: "t", 85: "u", 86: "v", 87: "w", 88: "x",
        // 89: "y", 90: "z",
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
      window.crmGetCardSellCallback = (obj) => {
        this.doPrintCardSelling(obj);
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
    doPrintCardSelling(obj) {
      obj.crmVersion = 1;
      // 可视卡时, 增加参数
      if (this.deviceReadCardNo && this.deviceReadCardNo !== 0) {
        obj.deviceReadCardNo = this.deviceReadCardNo;
      }
      ajax('canyin.pos.settlement.pay.crmPayWay.printcardselling', {
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify(obj),
        },
      }).then((data) => {
        this.printerData(data);
      });
    },
    doPrintCardCharge(obj) {
      obj.crmTsCode = Number(obj.crmTsCode);
      obj.companyId = Number(obj.companyId);
      if (obj.mobile != null && obj.mobile !== '') {
        obj.phone = Number(obj.mobile);
      }
      obj.crmVersion = 1;
      if (obj.tsTypeId != null && obj.tsTypeId != undefined) {
        obj.payWayId = Number(obj.tsTypeId);
      }
      obj.payWayName = obj.tsTypeName;
      // 可视卡时, 增加参数
      if (this.deviceReadCardNo && this.deviceReadCardNo !== 0) {
        obj.deviceReadCardNo = this.deviceReadCardNo;
      }
      ajax('canyin.pos.settlement.pay.crmPayWay.printcardcharge', {
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify(obj),
        },
      }).then((data) => {
        this.printerData(data);
      });
    },
    doGetCardNo(obj) {
      this.$devices.Cardop.read((card) => {
        let fun = '';
        if (card && card.returnCode == 0) {
          if (this.$store.getters.posDevice.readCardOpt.mode == 15
            || this.$store.getters.posDevice.readCardOpt.mode == 9
            || this.$store.getters.posDevice.readCardOpt.mode == 16
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
            msg: '${card.ErrorText}'
          })`;
        }
        eval(fun);
      });
    },
    cancelReadNo() {
      if (this.deviceReadCardNo || this.deviceReadCardNo == 0) {
        if (this.$store.getters.posDevice.readCardOpt.mode === 15) {
          this.$devices.Cardop.cancelOut();
        } else if (this.$store.getters.posDevice.readCardOpt.mode == 9) {
          this.$devices.Cardop.cancel();
        } else if (this.$store.getters.posDevice.readCardOpt.mode == 16) {
          this.$devices.Cardop.cancelOut();
        }
      }
      // if (this.posDevice.readCardOpt.mode === 9) {
      //   this.$devices.Cardop.cancel();
      // }
      // if (this.posDevice.readCardOpt.mode === 15) {
      //   this.$devices.Cardop.cancelOut();
      // }
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
