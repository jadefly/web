<template>
<!-- "ManualUnlocking": "手动解锁" -->
  <Dialog
    name="PosDialog.UnPayLock"
    :title="$t('Biz.Order.ManualUnlocking')"
    ref="dialog"
    appendToBody
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="hotKey"
    :showSubmit="true"
    :showClose="true"
    width="410px"
    top="27vh"
  >
  <div class="unpaylock">
    <div class="msg">
        {{msg}}
    </div>
    <!-- "MUnlockWarnMsg": "如果进行解锁操作，可能导致结算异常！" -->
    <div class="warning">
      {{ $t('Biz.Order.MUnlockWarnMsg') }}
    </div>
  </div>
  </Dialog>
</template>
<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      msg: '',
      pointId: '',
    };
  },
  computed: {
    hotKey() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.msg = this.resData.msg;
      this.pointId = this.resData.pointId;
    },
    onSubmit(authCode = {}) {
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      ajax('canyin.pos.settlement.settleunlock', {
        params: {
          pointId: this.pointId,
          ...authCode,
        },
      }).then((res) => {
        if (res.success) {
          // "MUnlockSuccessMsg": "客位手工解锁成功"
          this.$message.success(this.$t('Biz.Order.MUnlockSuccessMsg'));
          this.close();
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
  .unpaylock{
    background: #fff;
    padding: 0 20px;
    height: 240px;
    .msg{
      padding: 20px 0;
      font-size: 16px;
      color: #000;
      font-weight: 600;
    }
    .warning{
      color: red;
      font-size: 16px;
      font-weight: 600;
    }
  }
</style>
