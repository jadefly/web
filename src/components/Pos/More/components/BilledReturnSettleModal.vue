<template>
  <Dialog
    name="PosDialog.BilledReturnSettleModal"
    :title="$t('Biz.Pos.More.BilledModalBtn4')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    :closeByEsc="closeByEsc"
    width="426px"
    submitId="returnSettleSubmit"
  >
  <div class="content">
    <div class="item-col">
      <div class="item-title">{{$t('Biz.Order.SelectedTableLabel')}}</div>
      <div class="item-content">
        <span class="table-name">{{pointName}}</span>
      </div>
    </div>
    <div class="item-col">
      <div class="item-title">{{$t('Biz.Pos.More.ReturnSettleDiv2')}}</div>
      <div class="item-content" v-autotest>
        <div class="button-item" v-for="item in reasons" :key="item.id">
          <button type="button" @click="changeReason(item)" class="btn reason-bt btn-default"
            :class="{'btn-primary':activeReason && activeReason.id === item.id}"
          >{{item.name}}</button>
        </div>
      </div>
    </div>
  </div>
  </Dialog>

</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    pointName: {},
    tsId: {},
    bsId: {},
    pointId: {},
    scList: {},
    payWay: {},
    modifyTime: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      reasons: [],
      activeReason: null,
      loading: null,
      closeByEsc: true,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    ...mapGetters(['getVuexPointData']),
  },
  methods: {
    ...mapMutations({
      setPosPointData: 'SET_POS_POINT_DATA',
    }),
    changeReason(reason) {
      this.activeReason = reason;
    },
    onOpen() {
      this.activeReason = null;
      ajax('canyin.pos.bill.resettlereasonview').then((data) => {
        this.reasons = data.reasons;
        // 返位结算的原因默认选择
        if (data.isShowCancelReason && data.isShowCancelReason === '1') {
          this.activeReason = this.reasons.find(item => item.id === data.defaultReason);
        }
      });
    },
    // 点击提交
    onSubmit() {
      if (!this.activeReason) {
        this.$message.warning(this.$t('Biz.Pos.More.ReturnSettleMsg1'));
        return;
      }
      // this.operatePringAndSubmit();
      this.goSubmit();
    },
    // 处理返位结算执行时的打印, 和返位结算的执行
    // 2020-04-15 由于后台程序缺陷, 只能先打印, 后执行! 同时返位执行接口有使用权限, 会重复调用(打印不能重复调)
    // 2020-04-21 返位结算补打结账单,完全由后台(赵冰冰再次改动)执行,前台被迫再次改动,注释代码
    // async operatePringAndSubmit() {
    //   // 补打结账单
    //   if (this.resData.isReturnPointPrint) {
    //     const printObj = await this.rePrintBilled();
    //     if (printObj.data.success) {
    //       const printData = printObj.data;
    //       if (printData.printType == 'PRINT_PARALLEL' && printData.printD && this.$devices.Printer) {
    //         this.$log.info(`已结账单打印${ this.bsId }`);
    //         this.$devices.Printer.print(printData.printD);
    //       }
    //     } else if (printObj.result == '-2') {
    //       this.$vemit('posAuthCheck', {
    //         message: printObj.msg,
    //       });
    //     } else {
    //       this.$message.warning(printObj.data.msg);
    //     }
    //   }
    //   this.goSubmit();
    // },
    // 提交处理
    goSubmit(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.goSubmit(code);
      });
      let timer = null;
      // 当前账单如果含有通联刷卡的结算方式(非强制结算),返位时则弹出遮罩层.
      // 因需要刷卡确认,所以接口超时时间设置为70s.
      if (this.payWay.some(item => item.paywayId === '47')) {
        this.loading = this.$loading({
          lock: true,
          text: this.$t('Biz.Pos.More.ReturnSettleText1'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        });
        this.closeByEsc = false;
        timer = setTimeout(() => {
          this.loading.close();
          this.closeByEsc = true;
        }, 70000);
      }
      ajax('canyin.pos.returnpointandsettle.returnpointandsettle', {
        contentType: 'paramsEncoded',
        timeout: 70000,
        data: {
          reasonId: this.activeReason.id,
          tsId: this.tsId,
          bsId: this.bsId,
          pointId: this.pointId,
          modifyTime: Number(this.modifyTime),
          'closedAccount-bill-itemTable-text-num': this.scList.map(({ lastQty }) => lastQty).join(','),
          controlMode: this.$store.state.pos.posBaseInfo.controlMode,
          ...authData,
        },
      }).then((data) => {
        if (data.success && data.result === 1) {
          if (this.loading) {
            this.loading.close();
            this.closeByEsc = true;
            if (timer) {
              clearTimeout(timer);
            }
          }
          this.$message.success(this.$t('Biz.Pos.More.ReturnSettleMsg2'));
          this.close();
          if (this.getVuexPointData.id !== data.data.id) {
            this.setPosPointData(data.data);
          }
          this.$vemit('loadBill', this.pointId);
          setTimeout(() => {
            this.$emit('closeBillRetutnSettle');
          }, 20);
        } else if (data.result === -2) {
          this.$vemit('posAuthCheck', {
            message: data.msg,
          });
        } else {
          this.$message.warning(data.msg);
        }
      });
    },
    // 2020-04-21 返位结算补打结账单,注释代码
    // rePrintBilled() {
    //   return ajax('canyin.pos.printsettle.getsettleprintdata', {
    //     contentType: 'paramsEncoded',
    //     needToken: true,
    //     data: {
    //       bsId: this.bsId,
    //       isReturnPointPrint: this.resData.isReturnPointPrint,
    //       styleType: '1',
    //       make: true,
    //     },
    //   }).then(() => {});
    // },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content{
  background-color: @white;
  padding: 16px 12px;
}

.item-col{
  display: table;
  width: 100%;
  & + &{
    margin-top: 8px;
  }
  >*{
    display: table-cell;
  }
}

.item-title{
  width: 74px;
}
.item-content{
  overflow: hidden;
}

.table-name{
  padding-left: 4px;
}

.button-item{
  display: inline-block;
  width: 33.3%;
  padding: 4px;
  button{
    width: 100%;
  }
}

</style>
