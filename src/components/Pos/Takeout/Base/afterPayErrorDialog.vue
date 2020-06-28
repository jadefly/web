<template>
  <Dialog
    name="PosDialog.AfterPayErrorDialog"
    :title="$t('Dict.ErrorMessage')"
    ref="dialog"
    @close="onClose"
    width="800px"
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content">
      <p class="main-msg">{{$t('Biz.Pos.Takeout.TakeoutMsg002')}}<strong>{{$t('Biz.Pos.Takeout.TakeoutMsg003')}}</strong></p>
      <div>
        <h3 class="title">{{$t('Dict.AbnormalReason')}}</h3>
        <p>{{$t('Biz.Pos.ErrorReasonStr')}}</p>
      </div>
      <div>
        <h3 class="title">{{$t('Dict.DetailedInformation')}}</h3>
        <ul v-if="result.data">
          <li>{{$t('Dict.OperationFlow01')}}{{ result.data.bsCode }}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg005')}}{{ result.data.bsMoney }}</li>
          <li><strong>{{$t('Biz.Pos.Takeout.TakeoutMsg006')}}{{ result.data.orderMoney }}</strong></li>
        </ul>
      </div>
      <div>
        <h3 class="title">{{$t('Biz.Pos.Tip02')}}</h3>
        <ul>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg008')}}</li>
          <li>  {{$t('Biz.Pos.Takeout.TakeoutMsg009')}}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg010')}}</li>
          <li>  {{$t('Biz.Pos.Takeout.TakeoutMsg011')}}</li>
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
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onClose();
        },
      };
    },
  },
  props: {
    result: {
      type: Object,
      default: () => {},
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
