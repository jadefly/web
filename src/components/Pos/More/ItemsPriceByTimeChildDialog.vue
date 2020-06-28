<template>
  <Dialog
    name="PosDialog.ItemsPriceByTimeChildDialog"
    :title="$t('Biz.Pos.More.IPByTimeChildTitle1')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    :showSubmit="true"
    @submit="onSubmit"
    :hotkeys="hotKeySet"
    width="520px"
    top="240px"
    height="330px"
    :submitId="type + 'ItemsPriceByTimeChildDialog'"
  >
  <div class="itemsPriceByTimeDialog">
    <div class="pull-left itemsPrice-selected">
      <form action="" v-keyboard:keyboard>
        <div class="name textEllipsis">{{$t('Biz.Pos.More.IPByTimeChildDiv1')}}<span v-show="sizeName && sizeName != '-'">({{ sizeName }})</span>{{itemsName}}</div>
        <div class="count">
          <span>{{$t('Biz.Pos.More.IPByTimeTitle101')}}</span>
          <button type="button" class="count-delete" @click="sitemsCount = !isNaN(+sitemsCount) ? sub(sitemsCount, 1) : 0" :disabled="sitemsCount==0">-</button>
          <input type="text" ref="input" v-model="sitemsCount"
          @input="handleInput" class="count-input" style="width:50px"
          @click="pettyCashClick" maxlength="14" v-judge v-autotest>
          <button type="button" class="count-add" @click="sitemsCount = !isNaN(+sitemsCount) ? add(sitemsCount, 1) : 0">+</button>
        </div>
      </form>
    </div>
    <div class="pull-right">
      <KeyBoard ref="keyboard"></KeyBoard>
    </div>
  </div>
  </Dialog>
</template>

<script>

import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import { add, sub } from '@/common/js/math';

export default {
  props: ['type'],
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      sitemsCount: 0, // 限制数量，默认为1
      itemsName: '', // 选中品项
      sizeName: '', // 选中品项的规格名称
      add,
      sub,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.itemsName = this.resData.itemName;
      this.sizeName = this.resData.itemSizeName;
      this.sitemsCount = this.resData.timePrice ? this.resData.timePrice : this.resData.stdPrice
    },
    onSubmit() {
      if (this.sitemsCount == '' || this.sitemsCount == 0) {
        this.$message({
          message: this.$t('Biz.Pos.More.IPByTimeChildMsg1'),
          type: 'error',
        });
        return;
      }
      this.$emit('submitChildDialog', Number(this.sitemsCount));
      this.close();
    },
    // 检测输入事件
    handleInput(e) {
      this.sitemsCount = e.target.value.replace(/[^\d|/.]/g, '');
    },
    pettyCashClick() { // 限制数量输入框点击输入焦点
      this.$refs.input.select();
    },
    changeNum(num) {
      this.$nextTick(() => {
        this.sitemsCount = num;
      });
    },
  },
  watch: {
    sitemsCount(value) {
      // 空字符串转换我零
      if (value === '') {
        this.sitemsCount = 0;
      }
      // 多小数点情况处理
      if (value.toString().indexOf('.') != -1) {
        const arr = value.toString().split('.');
        if (arr.length > 2) {
          this.sitemsCount = parseFloat(value);
        }
      }
    },
  },
};

</script>


<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .btns{
    width: 100px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #b5b5b5;
    border-radius: 5px;
  }
  .active{
    background: #0babb9 !important;
    color: #fff;
  }
  .itemsPriceByTimeDialog{
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
    .itemsPrice-selected{
      .name{
        width: 270px;
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
  .pull-right{
    width: 186px;
    height: 248px;
    overflow: hidden;
  }

</style>
