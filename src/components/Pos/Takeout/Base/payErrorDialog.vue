<template>
  <Dialog
    name="PosDialog.PayErrorDialog"
    :title="$t('Dict.ErrorMessage')"
    ref="dialog"
    @close="onClose"
    width="800px"
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content">
      <p class="main-msg">{{$t('Biz.Pos.Takeout.TakeoutMsg048')}}<strong>{{$t('Biz.Pos.Takeout.TakeoutMsg003')}}</strong></p>
      <div>
        <h3 class="title">{{$t('Dict.AbnormalReason')}}</h3>
        <p>{{$t('Biz.Pos.Takeout.TakeoutMsg049')}}</p>
      </div>
      <div>
        <h3 class="title">{{$t('Dict.DetailedInformation')}}</h3>
        <ul v-if="result.data">
          <li>{{$t('Dict.OperationFlow01')}}{{ result.data.bsCode }}</li>
          <li>{{$t('Dict.AmountOfBill01')}}{{ result.data.bsMoney }}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg050')}}{{ result.data.tsMoney }}</li>
          <li><strong>{{$t('Biz.Pos.Takeout.TakeoutMsg051')}}{{ result.data.orderMoney }}</strong></li>
        </ul>
      </div>
      <div>
        <h3 class="title">{{$t('Biz.Pos.Takeout.TakeoutMsg052')}}</h3>
        <ul>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg053')}}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg054')}}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg055')}}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg056')}}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg057')}}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg058')}}</li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    result: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onClose();
        },
      };
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-content {
  padding: 12px;

  .main-msg {
    color: red;
    font-size: 18px;
    padding-bottom: 8px;
  }

  > div {
    border-top: 1px solid #ccc;
    padding-top: 8px;
    padding-bottom: 8px;

    .title {
      font-weight: bold;
      font-size: 16px;
    }

  }
}
</style>
