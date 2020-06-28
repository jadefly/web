<template>
<!-- EmergencyGuide": "应急指南" -->
  <Dialog
    name="Pos.Guide"
    :title="$t('Biz.Order.EmergencyGuide')"
    ref="dialog"
    width="800px"
    height="630px"
  >
    <div class="pos-dialog-content">
      <iframe
        frameborder="0"
        name="guide"
        class="pos-guide-iframe"
        :src="src"
      ></iframe>
    </div>
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
      src: `${process.env.API_PATH}/platform/login/login/emergencyinfo`,
    };
  },
  created() {
    window.closeGuide = () => {
      this.close();
    };
  },
};
</script>

<style lang="less" scoped>
.pos-guide-iframe {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
