<template>
  <!-- $t-改点菜员 -->
  <Dialog
    name="PosDialog.ChangeWaiter"
    :title="$t('Dict.Btn.ChangeWaiter')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    width="480px"
  >

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

    };
  },
  methods: {
    onOpen() {

    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

</style>
