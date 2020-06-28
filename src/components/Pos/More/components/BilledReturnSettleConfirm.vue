<template>
  <Dialog
    name="PosDialog.BilledReturnSettleConfirm"
    :title="$t('Dict.Tips')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    width="400px"
    submitId="returnSettleTip"
  >
  <div class="content">
    <i class="el-icon-question"></i>
    <p class="tip-text" v-html="message"></p>
  </div>
  </Dialog>
</template>

<script>
import _ from 'lodash';

import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

let submitCallback = null;

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
  },
  data() {
    return {
      message: '',
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
  },
  watch: {
  },
  methods: {
    onOpen() {
    },
    showConfirm(message, callback) {
      this.message = message;
      this.open();
      submitCallback = callback;
    },
    // 点击提交
    onSubmit() {
      this.$emit('submit');
      this.close();
      submitCallback && submitCallback();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content{
  background-color: @white;
  padding: 24px 20px;
}

.el-icon-question,.tip-text{
  display: inline-block;
}
.el-icon-question{
  color: #ffba00;
  font-size: 64px;
  margin-right: 12px;
  vertical-align: top;
}

.tip-text{
  font-size: 14px;
  color: #333333;
  width: 70%;
}
.seat-name{
  color: #0babb9;
}
</style>
