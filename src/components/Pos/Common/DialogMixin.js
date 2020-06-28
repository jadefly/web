import i18n from '@/locales/index';

export default {
  methods: {
    open(data, options = {}) {
      if (data) {
        this.resData = data;
      }
      if (options.submit) {
        this.submit = options.submit;
      }
      if (options.close) {
        if (!this.ownerClose) {
          this.ownerClose = this.onClose;
        }
        this.onClose = () => {
          this.ownerClose();
          options.close();
        };
        // this.onClose = options.close;
      }
      this.$refs.dialog.open();
    },
    close(options) {
      if (this.$refs.dialog) {
        this.$refs.dialog.close(options);
      }
    },
    onClose() {
      this.$emit('closeDialog');
    },
    initHotKey(hotkeys) {
      this.$refs.dialog.setHotKeys(hotkeys);
    },
    submit() {
      // this.$message.error('没有定义submit函数');
      this.$message.error(i18n.t('Biz.Pos.Common.CommTip01'));
    },
    /**
     * 当提交按钮获得焦点后执行回调函数，用来解决数字输入框内按快捷键产生的问题
     * http://192.168.4.84:88/zentao/bug-view-71902.html
     * @param {*} callback 回调函数，提交按钮获得焦点后延迟 100ms 执行此函数
     * 注意：如果自定义了按钮组或不显示，后果自负
     */
    whenSubmitBtnFocus(callback) {
      if (callback && this.$refs.dialog.$refs && this.$refs.dialog.$refs.posDialogSubmitBtn) {
        this.$refs.dialog.$refs.posDialogSubmitBtn.focus();
        setTimeout(() => {
          callback();
        }, 100);
      }
    },
  },
};
