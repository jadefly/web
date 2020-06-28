<template>
  <Dialog
    name="PosDialog.BilledTourGuideFee"
    :title="$t('Biz.Pos.More.TourGuideTitle1')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    width="426px"
    submitId="BilledTourGuideFeeSubmit"
    top="16vh"
  >
    <div class="content">
      <form action="javascript:;">
        <div class="form-group">
          <label>{{$t('Biz.Pos.More.TourGuideLabel1')}}</label>
          <input v-judge type="text" class="form-control" v-model="tourGuideMoney" ref="tourGuideMoneyInput">
        </div>
      </form>
      <div class="introduction">
        <span>{{$t('Biz.Pos.More.TourGuideSpan1')}}</span>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    tsData: {
      type: Object,
    },
  },
  data() {
    return {
      tourGuideMoney: 0,
    };
  },
  methods: {
    onOpen() {
      this.tourGuideMoney = 0;
      this.$nextTick(() => {
        this.$refs.tourGuideMoneyInput.focus();
      });
    },
    onSubmit() {
      if (!this.tourGuideMoney || this.tourGuideMoney == '') {
        this.$message.error(this.$t('Biz.Pos.More.TourGuideMsg1'));
        return;
      }
      if (this.tourGuideMoney <= 0) {
        this.$message.error(this.$t('Biz.Pos.More.TourGuideMsg2'));
        return;
      }
      if (!this.isInvalidNumber(this.tourGuideMoney)) {
        this.$message.error(this.$t('Biz.Pos.More.TourGuideMsg3'));
        return;
      }
      if (parseFloat(this.tsData.incomeTotal) < parseFloat(this.tourGuideMoney)) {
        this.$message.error(`${this.$t('Biz.Pos.More.TourGuideMsg4')}${this.tsData.incomeTotal}`);
        return;
      }
      this.submitTourGuideFee();
    },
    submitTourGuideFee(authCode = {}) {
      this.$vonce('authCode', (code) => {
        this.submitTourGuideFee(code);
      });
      ajax('canyin.pos.tourguidescommission.dotourguidescommission', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          commissionMoney: parseFloat(this.tourGuideMoney),
          tsId: this.tsData.tsId,
          bsId: this.tsData.bsId,
          ...authCode,
        },
      }).then((data) => {
        this.close();
        this.$message.success(data.msg);
        this.$emit('getBillInfoByTsId', this.tsData.tsId);
      });
    },
    isInvalidNumber(number) {
      const reg = /(^[0-9]{1,6}$)|(^[0-9]{1,6}[\.]{1}[0-9]{1,2}$)/;
      return reg.test(number);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content{
  background-color: @white;
  padding: 24px 48px 48px 48px;

  .form-group {
    position: relative;
    padding-left: 120px;
    > label {
      position: absolute;
      left: 0;
      top: 0;
      .size(120px, 40px);
      line-height: 40px;
      margin-bottom: 0;
      font-weight: normal;
      .text-overflow();
    }

    > input {
      width: 100%;
      height: 40px;

      &:focus {
        border-color: @brand-primary;
        .box-shadow(inset 0 1px 5px #aff9ff);
      }
    }
  }
  .introduction {
    padding-top: 36px;
    color: #666;
  }
}

</style>
