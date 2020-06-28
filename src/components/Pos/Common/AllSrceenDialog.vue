<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :width="width"
    :show-close="showClose"
    :custom-class="customClass"
    :before-close="handleClose"
    :append-to-body="appendToBody"
    :close-on-click-modal ="closeByClickModal"
    :close-on-press-escape="closeByEsc"
    :top="top"
    @open="onOpen"
    @close="onClose"
  >
    <div slot="title" class="pos-srceen-header">
      <slot name="title">
        <h3 class="pos-srceen-title">{{ title }}</h3>
        <div class="pos-srceen-control">
          <div class="team" v-if="headerTitle != ''">
            <el-checkbox
              v-model="checked1"
              class="fcf"
              @change="teamSettleChange">{{ headerTitle }}</el-checkbox>
          </div>
          <!-- $t-关闭 -->
          <button
            type="button"
            class="btn btn-default"
            @click="close">{{ $t('Dict.Close') }}(Esc)</button>
            <!-- $t-确认 -->
          <button
            v-if="showSubmit"
            type="button"
            :id="submitId"
            class="btn btn-primary" @click="submit">{{ $t('Dict.Confirm') }}(PgDn)</button>
        </div>
      </slot>
    </div>
    <slot>{{ message }}</slot>
  </el-dialog>
</template>

<script>
// import ajax from '@/common/js/ajax';
import { mapGetters, mapMutations } from 'vuex';

export default {
  props: {
    invoicesOpened: {
      type: Number,
      default: 0,
    },
    settlementRemarkInfo: {
      type: String,
      default: '',
    },
    submitClose: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '100%',
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
    showClose: {
      type: Boolean,
      default: false,
    },
    showSubmit: {
      type: Boolean,
      default: false,
    },
    customClass: {
      type: String,
      default: 'pos-srceen',
    },
    height: {
      type: String,
      default: '',
    },
    top: {
      type: String,
      default: '0vh',
    },
    appendToBody: {
      type: Boolean,
      default: false,
    },
    closeByClickModal: {
      type: Boolean,
      default: false,
    },
    beforeClose: {
      type: Function,
      default: null,
    },
    hotkeys: {},
    headerTitle: { // 弹窗头部
      type: String,
      default: '',
    },
    // 业务类型
    businessType: {
      type: Number,
      default: null,
    },
    submitId: {
      type: String,
      default: null,
    },
    closeByEsc: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      dialogVisible: this.isShow,
      parentModule: null,
      form: {
        name: '',
        type: [],
      },
      checked1: true,
    };
  },
  watch: {
    height() {
      // eslint-disable-next-line eqeqeq
      if (this.height != '') {
        this.$el.getElementsByClassName('el-dialog')[0].style.height = this.height;
      }
    },
    dialogVisible(data) {
      this.setDialog(data);
    },
  },
  computed: {
    ...mapGetters([
      'posInfo',
    ]),
  },
  methods: {
    ...mapMutations({
      setDialog: 'SET_DIALOG',
    }),
    open() {
      this.dialogVisible = true;
      this.checked1 = true;
      this.$emit('teamSettleChange', this.checked1, true);
    },
    close(options) {
      if (this.beforeClose) {
        this.beforeClose(() => {
          this.dialogVisible = false;
          this.checked1 = true;
        }, options);
      } else {
        this.dialogVisible = false;
        this.checked1 = true;
      }
    },
    submit() {
      this.$emit('submit');
    },
    onOpen() {
      const hotKey = this.hotkeys ? this.hotkeys : {};
      this.$hotKey.set(this.name, hotKey);
      this.$emit('open');
    },
    // onClose 有冲突, 本Dialog基础组件只在结算业务使用. 结算关闭 部分业务,执行直接调用close()关闭, onClose被Esc调用
    onClose() {
      this.$hotKey.removeCurrentModule(this.name);
      console.log('结算OnClose');
      this.$emit('close');
    },
    setHotKeys(hotkeys) {
      this.$hotKey.set(this.name, hotkeys);
    },
    // 点击弹框外部空白, 触发模态框询问阻拦是否关闭(防误点关闭),beforeClosingPrompt为开关判定是否执行关闭前阻拦
    handleClose(done) {
      if (this.beforeClose) {
        this.beforeClose(done);
      } else {
        done();
      }
    },
    teamSettleChange(value) {
      this.checked1 = value;
      this.$emit('teamSettleChange', value);
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
.pos-srceen-header{
  background: #374347 !important;
}
.pos-srceen {
  background-color: #e4e4e4;
  padding-top: 55px;
  min-width: 50%;
  max-width: 100%;
  height: 100%;
  margin-bottom: 0;
  background: #0d3758;
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

.pos-srceen-header {
  position: relative;
  height: 55px;
  background-color: @white;
  border-bottom: none !important;
  color: #fff;
}

.pos-srceen-title {
  border-left: 4px solid #0babb9;
  float: left;
  padding-left: 12px;
  margin-top: 19px;
  margin-left: 14px;
  font-size: 16px;
  font-weight: bold;
}

.pos-srceen-control {
  position: absolute;
  right: 12px;
  top: 5px;

  > .btn {
    height: 44px;
  }
}

.pos-srceen-content {
  height: 100%;
}
.team{
  display: inline-block;
  margin-right: 35px;
}
.fcf{
  color: #fff;
}
</style>
