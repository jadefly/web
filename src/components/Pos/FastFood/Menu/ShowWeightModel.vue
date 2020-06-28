<template>
  <Dialog
    name="PosDialog.ShowWeightModel"
    :title="$t('Dict.Btn.ConfirmWeight')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :showClose="true"
    width="410px"
  >
  <div class="showWeightModel">
    <!-- {{jzInfo}} -->
    <div class="moduleKcWeight_item">
      <div class="fl pt3">{{ $t('Dict.NameLabel') }}</div>
      <div class="moduleKcWeight_itemName fl">{{initData.name}}</div>
    </div>
    <div class="moduleKcWeight_item">
      <div class="fl pt3">{{ $t('Dict.UnitPrice1') }}</div>
      <div class="moduleKcWeight_itemName fl">{{initData.price ? initData.price : '0'}}</div>
    </div>
    <div class="moduleKcWeight_item">
      <div class="fl pt3">{{ $t('Biz.Order.NetWeight') }}</div>
      <div class="moduleKcWeight_itemName fl">{{ jzInfo.weight + weightUtilText}}</div>
    </div>
    <div class="moduleKcWeight_item">
      <div class="fl pt3">{{ $t('Dict.Subtotal1')}}</div>
      <div class="moduleKcWeight_itemName fl">{{jzInfo.total ? jzInfo.total : '0'}}</div>
    </div>
  </div>
  </Dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { multi } from '@/common/js/math';

export default {
  components: { Dialog },
  mixins: [ DialogMixin ],
  props: {
    newWeightData: {
      type: Object,
      default: null
    },
    weightUtilText: String,
  },
  data() {
    return {
      initData: {},
      initWeight: 0,
    }
  },
  computed: {
    ...mapGetters(['setting']),
    jzInfo() {
      let weightData = 0;
      if (this.newWeightData.autoWeighNetValue) {
        weightData = Number(this.newWeightData.autoWeighNetValue).toFixed(this.setting.POSReservedDecimal);
      } else {
        weightData = this.initWeight.toFixed(this.setting.POSReservedDecimal);
      }
      var totalData = multi(weightData,this.initData.price)
      return {
        weight: weightData,
        total: totalData
      }
    }
  },
  methods:{
    onOpen(){
      this.initData = this.resData.dish;
    },
    onSubmit(){
      if(this.jzInfo.weight <= 0 ){
        // "WeightErrorMsg01": "净重大于0的品项才允许称重确认"
        this.$message.error(this.$t('Biz.Order.WeightErrorMsg01'));
        return
      }
      this.submit(this.jzInfo.weight);
      this.close();
    }
  }
}
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


