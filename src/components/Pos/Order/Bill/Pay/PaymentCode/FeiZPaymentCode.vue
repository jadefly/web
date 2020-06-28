<template>
<!-- $t-菲滋支付 -->
  <Dialog
    name="PosDialog.FeiZPaymentCode"
    title="菲滋支付"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="700px"
    height="590px"
    :hotkeys="hotKey"
    :closeByEsc="true"
    :showSubmit="false"
    :append-to-body="true"
  >
    <div
      slot="title"
      class="pos-dialog-header">
      <h3 class="pos-dialog-title">菲滋支付</h3>
    </div>
    <div class="content">
      <iframe
        class="feiz-page"
        :src="urlParams">
      </iframe>
    </div>
  </Dialog>
</template>

<script>
import $ from 'jquery';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      urlParams: '',
    };
  },
  computed: {
    // 添加快捷键
    hotKey() {
      return {
        // 隐藏功能
        F6: () => {
          console.log(this.resData);
        },
      };
    },
  },
  created() {
    // 监听快餐关闭结算窗口事件
    this.$von('closeSettleDialog', () => {
      this.$log.info('中餐菲滋支付窗口被调用关闭');
      this.urlParams = '';
      this.close();
    });
    this.$von('fastfoodCloseSettleDialog', () => {
      this.$log.info('快餐菲滋支付窗口被调用关闭');
      this.urlParams = '';
      this.close();
    });
    this.$von('closeFeiZPayDialog', () => {
      this.$log.info('取消菲滋支付窗口被调用关闭');
      this.$emit('clearOnlinePayWay');
      this.urlParams = '';
      this.close();
    });
  },
  methods: {
    onOpen() {
      this.urlParams = `${ this.resData.url
        }?origTotal=${ this.resData.origTotal
        }&bsId=${ this.resData.bsId
        }&shopId=${this.resData.shopId
        }&ip=${ this.resData.ip }`
    },
  },
};
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}
.content {
  height: 535px;
}
.feiz-page {
  width: 700px;
  height: 535px;
  border: none;
}
</style>
