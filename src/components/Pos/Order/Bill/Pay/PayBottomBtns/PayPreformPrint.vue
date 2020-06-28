<template>
  <Dialog
    name="PosDialog.PayPreformPrint"
    :title="$t('Dict.Btn.PayPreformPrint')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    :showSubmit="true"
    @submit="submit"
    width="720px"
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
    return {};
  },
  computed: {
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
