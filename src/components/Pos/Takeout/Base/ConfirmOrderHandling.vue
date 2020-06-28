<template>
  <Dialog
    name="PosDialog.ConfirmOrderHandling"
    :title="$t('Dict.Tips')"
    ref="dialog"
    width="425px"
    top="28vh"
    :showClose="false"
  >
    <div class="pos-dialog-content confirm-order-wrapper">
      <!-- 弹窗内容 -->
      <div class="tip">
        <i class="icon icon-tishi"></i>
        <span>{{$t('Biz.Pos.Takeout.TakeoutMsg016')}}</span>
      </div>
      <div  class="handling">
        <button class="btn" @click="close();$emit('normalConfirmOrder')">{{$t('Dict.NormalOrder')}}</button>
        <button class="btn" @click="close();$emit('confirmNotPrintOrder')">{{$t('Biz.Pos.Takeout.TakeoutMsg017')}}</button>
        <button class="btn" @click="close()">{{$t('Biz.Pos.Takeout.TakeoutMsg018')}}</button>
      </div>
      <div class="state">
        <span>{{$t('Dict.ExplainLabel')}}</span>
        <ol>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg019')}}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg020')}}</li>
          <li>{{$t('Biz.Pos.Takeout.TakeoutMsg021')}}</li>
        </ol>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.confirm-order-wrapper {
  position: relative;
  .square(100%);
  padding: 16px;
  background-color: white;
  .tip {
    padding-bottom: 32px;
    .icon-tishi {
      font-size: 24px;
      color: #f0b017;
    }
  }
  .handling {
    padding-bottom: 24px;
    border-bottom: 1px dashed #606266;
    > button {
      margin-left: 8px;
      background-color: #0babb9;
      color: white;
      padding: 6px 24px;
      &:hover {
        background-color: #06bdce;
      }
    }
  }
  .state {
    padding-top: 12px;
    color: #606266;
    font-size: 12px;
  }
}
</style>
