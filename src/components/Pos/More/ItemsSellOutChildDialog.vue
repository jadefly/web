<template>
  <Dialog
    name="PosDialog.ItemsSellOutChildDialog"
    :title="$t('Biz.Pos.More.ISellOutLi2')"
    ref="dialog"
    @close="onClose"
    :append-to-body="true"
    width="465px"
    top="30vh"
  >
  <div class="itemsLimitDialog">
    <div>
      <div style="font-size: 16px;font-weight: bold; margin-bottom: 20px;">{{$t('Biz.Pos.More.ISellOutChildDiv')}}</div>
      <div id="selloutTiming" class="selloutTiming" v-autotest>
        <button type="button" class="btns" @click="sellOutBtn('2')">{{$t('Biz.Pos.More.ISellOutChildBtn1')}}</button>
        <button type="button" class="btns mlr10" @click="sellOutBtn('1')">{{$t('Biz.Pos.ShiftNow')}}</button>
        <button type="button" class="btns" @click="sellOutBtn('0')">{{$t('Biz.Pos.More.ISellOutChildBtn3')}}</button>
      </div>
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
  methods: {
    sellOutBtn(type) {
      this.$emit('sellOutBtn', type);
      this.close();
    },
  },
};

</script>


<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .itemsLimitDialog {
    width: 100%;
    height: 100%;
    background: @white;
    padding:20px;
    overflow: hidden;
    .keyboard-static {
      width: 186px !important;
    }
    .keyboard.keyboard-static.keyboard-bordered{
      .keyboard-control{
        display: none !important;
      }
    }
    .itemsLimit-selected{
      .name{
        height: 50px;
      }
      .type{
        height: 80px;
      }
      .count{
        .count-add, .count-delete, .count-input{
          border-radius: 5px;
        }
        .count-delete, .count-add{
          width: 40px;
          height: 40px;
          background: none;
          border: 1px solid #b5b5b5;
        }
        .count-input{
          width: 50px;height: 40px;
          background: none;
          border: 1px solid #b5b5b5;
          text-align: center;

        }
      }
    }
  }
  .selloutTiming {
    display: flex;
  }
  .btns{
    min-width: 100px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #b5b5b5;
    border-radius: 5px;
    margin-right: 8px;
  }
  .btns:hover{
    background: #0babb9 !important;
    color: #fff;
  }
</style>
