<template>
  <!-- 国际化：称重确认 -->
  <Dialog
    name="PosDialog.ShowWeightModel"
    :title="$t('Dict.Btn.ConfirmWeight')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    appendToBody
    :showSubmit="true"
    :showClose="true"
    width="410px"
  >
  <div class="showWeightModel">
    <!-- {{jzInfo}} -->
    <!-- 国际化：名称：，单价：，净重：，小计：，{0}元 -->
    <div class="moduleKcWeight_item">
      <div class="fl pt3">{{$t('Dict.NameLabel')}}</div>
      <div class="moduleKcWeight_itemName fl">{{initData.name}}</div>
    </div>
    <div class="moduleKcWeight_item">
      <div class="fl pt3">{{$t('Dict.UnitPrice1')}}</div>
      <div class="moduleKcWeight_itemName fl">{{initData.price? initData.price : 0}}</div>
    </div>
    <div class="moduleKcWeight_item">
      <div class="fl pt3">{{$t('Biz.Order.NetWeight')}}</div>
      <div class="moduleKcWeight_itemName fl">{{ jzInfo.weight + weightUtilText }}</div>
    </div>
    <div class="moduleKcWeight_item">
      <div class="fl pt3">{{$t('Dict.Subtotal1')}}</div>
      <div class="moduleKcWeight_itemName fl">{{jzInfo.total ? jzInfo.total : 0}}</div>
    </div>
  </div>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { mapGetters } from 'vuex';
import { multi } from '@/common/js/math';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    weightUtilText: String,
  },
  data() {
    return {
      initData: {},
      initWeight: 0,
    };
  },
  computed: {
    ...mapGetters(['posFastFood', 'newWeightData', 'setting']),
    jzInfo() {
      let weightData = 0;
      if (this.newWeightData.autoWeighNetValue) {
        weightData = Number(this.newWeightData.autoWeighNetValue).toFixed(this.setting.POSReservedDecimal);
      } else {
        weightData = this.initWeight.toFixed(this.setting.POSReservedDecimal);
      }
      const totalData = multi(weightData, this.initData.price);
      return {
        weight: weightData,
        total: totalData,
      };
    },
  },
  methods: {
    onOpen() {
      this.initData = this.resData.dish;
    },
    onSubmit() {
      if (this.jzInfo.weight <= 0) {
        this.$message.error(this.$t('Biz.Order.WeightErrorMsg01'));
        return;
      }
      this.submit(this.jzInfo.weight);
      this.close();
    },
  },
};
</script>
<style lang="less" scoped>
  .showWeightModel{
    height: 200px;
    background: #fff;
    padding: 30px 40px;
    .moduleKcWeight_item{
      height: 33px;
    }
    .pt3 {
      padding-top: 3px;
    }
    .fl {
      float: left;
    }
    .moduleKcWeight_itemName{
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      width: 280px;
    }
  }
</style>
