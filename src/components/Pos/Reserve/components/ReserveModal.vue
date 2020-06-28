<template>
  <Dialog
    name="PosDialog.ReserveModal"
    :title="$t('Biz.Reserve.OrderExecutionStatus')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="400px"
    top="200px"
  >
    <ul class="box">
        <li class="item" v-html="$t('Biz.Reserve.ReserveMsg016',[buffetCount])"></li>
        <li class="item" v-html="$t('Biz.Reserve.ReserveMsg017',[successCount])"></li>
        <li class="item" v-html="$t('Biz.Reserve.ReserveMsg018',[errorCount])"></li>
    </ul>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      buffetCount: 0, // 总单数
      successCount: 0, // 成功单数
      errorCount: 0, // 失败单数VB
    };
  },
  methods: {
    onOpen() {
    },
    onClose() {
      this.close();
      this.buffetCount = 0;
      this.successCount = 0;
      this.errorCount = 0;
    },
  },
};
</script>

<style lang="less" scoped>
    @import "~@/common/less/variables.less";
    @import "~@/common/less/mixins.less";
    .box {
        padding: 0 20px 20px 20px;
        .item {
            margin-top: 16px;
            &:first-child > span {
                margin-left: 34px;
            }
            > span {
                margin-left: 20px;
            }
        }
    }
</style>
