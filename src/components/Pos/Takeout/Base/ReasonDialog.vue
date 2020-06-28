<template>
  <Dialog
    name="OldPosDialog.ReasonDialog"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="360px"
    :hotkeys="hotKeySet"
  >
    <div slot="title" class="pos-dialog-header">
      <h3 class="pos-dialog-title">{{$t('Dict.ReasonsForCancellation')}}</h3>
      <!-- Dialog组件自定义表头样式 -->
      <div class="pos-dialog-control">
        <button type="button" class="btn-default btn-close" @click="close">×<span></span></button>
      </div>
    </div>
    <div class="pos-dialog-content">
      <!-- 原因列表 -->
      <el-radio-group v-model="reason" class="cancel-reason-wrapper" @change="seclectCancelReason">
        <el-radio v-for="item in cancelReasons" :label="item.name" :key="item.id" class="cancel-reason-item">{{ item.name }}</el-radio>
        <el-radio label="otherReason" class="cancel-reason-item">{{$t('Dict.Other')}}</el-radio>
      </el-radio-group>
      <!-- 自定义输入文本框 -->
      <div class="other-reason-wrapper" v-show="reason=='otherReason'">
        <p>{{$t('Biz.Pos.Takeout.TakeoutMsg059')}}</p>
        <el-input
        type="textarea"
        :maxlength="80"
        :rows="3"
        @focus="showAndroidInput('otherReason')"
        v-model="otherReason"
        class="other-reason-content"
        ></el-input>
      </div>
      <!-- 确认取消按钮 -->
      <div class="confirm-cancel">
        <button type="button" class="btn btn-adopt btn-submit" @click="submit">{{$t('Dict.Confirm')}}</button>
      </div>
    </div>
    <AndroidInput ref="AndroidInput"></AndroidInput>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import ajax from '@/common/js/ajax';
import { ERR_OK } from '@/common/api/takeoutConfig.js';

export default {
  components: { Dialog, AndroidInput },
  mixins: [DialogMixin, AndroidInputMixin],
  props: {
    dinerRefundReason: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      reason: '',
      otherReason: '',
      cancelReasons: null,
      takeOutOrderCancelInputReason: null,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          // 暂时不需要
        },
      };
    },
  },
  created() {
    this.getCancelReason();
  },
  methods: {
    onOpen() {
      // 部分退存在原因 默认其他
      this.partRefundSelectOther();
    },
    // 获取退单列表数据
    getCancelReason() {
      ajax('canyin.takeout.takeoutview.querycancelreason').then((res) => {
        if (res.data.code === ERR_OK && res.data.data) {
          const { data } = res.data;
          this.cancelReasons = data.cancelReasons;
          this.takeOutOrderCancelInputReason = data.takeOutOrderCancelInputReason;
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
    // 默认其他
    partRefundSelectOther() {
      if (this.dinerRefundReason) {
        this.reason = 'otherReason';
        this.otherReason = this.dinerRefundReason;
      }
    },
    // 清空其他中的输入文本
    seclectCancelReason(reason) {
      if (reason === 'otherReason') {
        this.otherReason = '';
      }
    },
    // 确认按钮 派发事件传值
    submit() {
      // 判断退单原因是否为必输
      if (this.takeOutOrderCancelInputReason === true
      && (!this.reason || (this.reason === 'otherReason' && !this.otherReason.trim()))) {
        this.$message.error(this.$t('Biz.Pos.Takeout.TakeoutMsg060'));
      } else {
        // 自定义原因输入
        if (this.reason === 'otherReason') {
          // 字符校验 长度为200
          if (this.otherReason.trim().length >= 200) {
            this.$message.error(this.$t('Biz.Pos.Takeout.TakeoutMsg061'));
            return;
          }
          this.$emit('getReason', this.otherReason);
        } else {
          // 派发选择的退单原因
          this.$emit('getReason', this.reason);
        }
        // 关闭退单原因按钮
        this.close();
      }
    },
    // 关闭按钮 清空理由
    close() {
      this.$refs.dialog.close();
      this.reason = '';
      this.otherReason = '';
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-header {
  font-size: 16px;
  color: rgb(102, 102, 102);
  font-weight: bold;
  line-height: 1.2;
}

.pos-dialog-control {
  .btn-close {
    .square(40px);
    border: none;
    font-size: 18px;
    color: rgb(102, 102, 102);
    &:hover, &:active, &:focus {
      background-color: white;
      color: #333;
    }
  }
}

.pos-dialog-content {
  max-height: 500px;
  overflow: scroll;
  position: relative;
  background-color: white;
  padding-bottom: 24px;

  .cancel-reason-wrapper {
    position: relative;
    padding-top: 24px;
    padding-left: 18px;
    .cancel-reason-item {
      display: block;
      margin-left: 0;
      line-height: 1.6;
      color: #333;
    }
  }
  .other-reason-wrapper {
    width: 288px;
    margin: 0 auto;
    .other-reason-content {
      width: 100%;
      height: 100%;
    }
  }
  .confirm-cancel {
    .size(288px, 40px);
    margin: 24px auto 0 auto;
    > button {
      width: 100%;
      background: #e54040;
      color: white;
    }
  }
}

</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.cancel-reason-wrapper {
  .el-radio__input.is-checked .el-radio__inner {
    border-color: #e54040;
    background: #e54040;
  }

  .el-radio__input.is-checked + .el-radio__label {
    color: #333;
  }
}

</style>
