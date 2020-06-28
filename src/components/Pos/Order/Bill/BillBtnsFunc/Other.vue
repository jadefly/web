<template>
  <Dialog
    name="PosDialog.Other"
    :title="$t('Dict.Other')"
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
