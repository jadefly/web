<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :width="width"
    :show-close="showCloseX"
    :custom-class="customClass"
    :before-close="handleClose"
    :append-to-body="appendToBody"
    :top="top"
    @opened="onOpen"
    @close="onClose"
    :fullscreen="fullscreen"
    :close-on-click-modal="closeByClickModal"
    :close-on-press-escape="closeByEsc"
  >
    <div slot="title" class="pos-dialog-header">
      <slot name="title">
        <h3 class="pos-dialog-title" v-html="title"></h3>
        <slot name="other-function-button"></slot>
        <div class="pos-dialog-control">
          <button
            :id="closeId"
            type="button"
            class="btn btn-default"
            v-if="showClose"
            @click="close"
          >{{ closeText }}(Esc)</button>
          <slot name="other-button"></slot>
          <button
            v-if="showSubmit"
            type="button"
            :disabled="disableSubmitBtn"
            class="btn btn-primary"
            @click="submit"
            :id="submitId"
            ref="posDialogSubmitBtn"
            v-autotest
          >{{submitText}}(PgDn)</button>
        </div>
      </slot>
    </div>
    <slot>{{ message }}</slot>
  </el-dialog>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  props: {
    width: {
      type: String,
      default: '60%',
    },
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      // default: '提示',
      default() {
        return this.$t('Dict.Tips');
      },
    },
    message: String,
    isShow: {
      type: Boolean,
      default: false,
    },
    disableSubmitBtn: { // 挂账短信验证页面 控制按钮是否可点击
      type: Boolean,
      default: false,
    },
    showCloseX: {
      type: Boolean,
      default: false,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    showSubmit: {
      type: Boolean,
      default: false,
    },
    customClass: {
      type: String,
      default: 'pos-dialog',
    },
    height: {
      type: String,
      default: '',
    },
    maxHeight: {
      type: String,
      default: '',
    },
    top: {
      type: String,
      default: '10vh',
    },
    bottom: {
      type: String,
    },
    appendToBody: {
      type: Boolean,
      default: false,
    },
    beforeClosingPrompt: {
      type: Boolean,
      default: false,
    },
    closingMsg: {
      type: String,
      default: '',
    },
    hotkeys: {
      // type: Object,
      // default: ''
    },
    fullscreen: { // 是否全屏
      type: Boolean,
      default: false,
    },
    submitText: {
      type: String,
      // default: '确认',
      default() {
        return this.$t('Dict.Confirm');
      },
    },
    closeText: {
      type: String,
      // default: '关闭',
      default() {
        return this.$t('Dict.Close');
      },
    },
    closeByClickModal: {
      type: Boolean,
      default: false,
    },
    closeByEsc: {
      type: Boolean,
      default: true,
    },
    submitId: {
      type: String,
      default: null,
    },
    closeId: {
      type: String,
      default: null,
    },
    // 付款码需要传
    isPaymentCode: {
      type: Boolean,
      default: false,
    },
    // 关闭之前是否需要处理的事件
    beforeClose: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      dialogVisible: this.isShow,
      parentModule: null,
    };
  },
  watch: {
    dialogVisible(data) {
      // 保存此状态是为了易盘加减品项做的处理，对其他地方没有影响
      setTimeout(() => {
        this.setDialog(data);
        this.$log.info(`每次打开弹窗的名字----${this.title}`);
      }, 0);
    },
  },
  created() {
    // this.isClose && this.handleClose()
  },
  mounted() {
    // eslint-disable-next-line eqeqeq
    if (this.height != '') {
      this.$el.getElementsByClassName('el-dialog')[0].style.height = this.height;
      if (this.maxHeight !== '') {
        this.$el.getElementsByClassName('el-dialog')[0].style.maxHeight = this.maxHeight;
      }
    }
    if (this.bottom && this.bottom !== '') {
      this.$el.getElementsByClassName('el-dialog')[0].style.marginBottom = this.bottom;
    }
  },
  methods: {
    ...mapMutations({
      setDialog: 'SET_DIALOG',
    }),
    open() {
      /* *
       * 作者：王宇
       * 加这个延迟的原因是当两个弹框快速且换的时候快捷键消除不了最后一个弹框的
       * */
      setTimeout(() => {
        this.dialogVisible = true;
      }, 0);
    },
    close(options) {
      if (this.beforeClose) {
        this.beforeClose(() => {
          this.dialogVisible = false;
        }, options);
      } else {
        this.dialogVisible = false;
      }
    },
    submit() {
      // console.log('Dialog:submit');
      this.$emit('submit');
    },
    onOpen() {
      const tmpHotKey = this.hotkeys ? this.hotkeys : {};
      this.$hotKey.set(this.name, tmpHotKey);
      this.$emit('open');
    },
    onClose() {
      this.submiting = false;
      this.$hotKey.removeCurrentModule(this.name);
      this.$emit('close');
    },
    setHotKeys(hotkeys) {
      this.$hotKey.set(this.name, hotkeys);
    },
    // 点击弹框外部空白, 触发模态框询问阻拦是否关闭(防误点关闭),beforeClosingPrompt为开关判定是否执行关闭前阻拦
    handleClose(done) {
      if (this.beforeClose) {
        this.beforeClose(done);
      }
      // esLint校正 修改代码
      // else {
      if (!this.isPaymentCode) {
        // eslint-disable-next-line no-unused-expressions
        this.beforeClosingPrompt
          ? this.$confirm(this.closingMsg).then(() => {
            done();
          }).catch(() => {})
          : done();
      } else {
        this.$emit('handleBeforeClose', done);
      }
      // }
    },
  },
};

</script>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

body {
  padding-right: 0 !important;
}

.pos-dialog {
  background-color: #e4e4e4;
  padding-top: 55px;
  /* 这个属性 暂时发现没啥用,会导致dialog显示宽度不能被手动设置小于50%,
   * 暂时删除该属性,如有问题, 恢复.
  */
  // min-width: 50%;
  max-width: 100%;

  > .el-dialog__header,
  > .el-dialog__body {
    padding: 0;
  }

  > .el-dialog__header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  > .el-dialog__body {
    height: 100%;
    overflow: auto;
    color: inherit;
  }

  @media screen and (min-width: @screen-sm-min) {
    min-width: auto;
    max-width: auto;
    margin-left: auto;
    margin-right: auto;
  }
}
.moudel-center{
  background-color: #e4e4e4;
  padding-top: 55px;
  min-width: 50%;
  max-width: 100%;

  > .el-dialog__header,
  > .el-dialog__body {
    padding: 0;
  }

  > .el-dialog__header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  > .el-dialog__body {
    height: 100%;
    overflow: auto;
    color: inherit;
  }

  @media screen and (min-width: @screen-sm-min) {
    min-width: auto;
    max-width: auto;
    margin-left: auto;
    margin-right: auto;
  }
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.pos-dialog-header {
  position: relative;
  height: 55px;
  background-color: @white;
  border-bottom: 1px solid #c2c2c2;
}

.pos-dialog-title {
  border-left: 4px solid #0babb9;
  float: left;
  padding-left: 12px;
  margin-top: 19px;
  margin-left: 14px;
  font-size: 16px;
  font-weight: bold;
}

.pos-dialog-control {
  position: absolute;
  right: 12px;
  top: 5px;

  > .btn {
    height: 44px;
  }
}

.pos-dialog-content {
  height: 100%;
}

.lang-enUS {
  .pos-dialog-title{
    font-size: 12px;
    padding-left: 5px;
  }
  .pos-dialog-control{
    .btn{
      font-size:12px;
      padding: 0 4px;
    }
  }
}
</style>
