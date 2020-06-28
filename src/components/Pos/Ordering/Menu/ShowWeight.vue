<template>
  <div class="kcWeight">
    <!-- 国际化：净重：，皮重：，去皮，清零 -->
    <div class="value bg">
      <div class="value-jz">
        {{$t('Biz.Order.NetWeight')}}
        <span class="fc0">
          {{newWeightData.autoWeighNetValue ? newWeightData.autoWeighNetValue : initData.toFixed(this.setting.POSReservedDecimal)}}
        </span>
        <span>{{weightUtilText}}</span>
      </div>
      <div class="value-pz">
        {{$t('Biz.Order.Tare')}}
        <span class="fc0">
          {{newWeightData.autoWeighTareValue ? newWeightData.autoWeighTareValue : initData.toFixed(this.setting.POSReservedDecimal)}}
        </span>
        <span>{{weightUtilText}}</span>
      </div>
    </div>
    <div class="btns-qp bg btns" @click="decorticate">{{$t('Biz.Order.RemovePeel')}}</div>
    <div class="btns-ql bg btns" @click="reset">{{$t('Biz.Order.ZeroClearing')}}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    weightUtilText: String,
  },
  data() {
    return {
      initData: 0,
    };
  },
  computed: {
    ...mapGetters(['posDevice', 'newWeightData', 'setting']),
  },
  methods: {
    decorticate() {
      if (!this.checkBtns()) { return; }
      this.$devices.Scale.setTare((data) => {
        if (+data.returnCode === -1) {
          this.$message.error(this.$t('Biz.Order.PeelingFailure01', [data.returnText]));
        } else {
          this.$message.success(this.$t('Biz.Order.PeelingSuccess'));
        }
        this.$vemit('orderStartAutoWeight');
      });
    },
    reset() {
      if (!this.checkBtns()) { return; }
      this.$devices.Scale.setZero((data) => {
        if (+data.returnCode === -1) {
          this.$message.error(this.$t('Biz.Order.ZeroFailed0', [data.returnText]));
        } else {
          this.$message.success(this.$t('Biz.Order.ZeroSuccess'));
        }
        this.$vemit('orderStartAutoWeight');
      });
    },
    checkBtns() {
      if (!this.posDevice.isSupportNewWeight) {
        this.$message.error(this.$t('Biz.Order.WeightErrorMsg'));
        return false;
      }
      return true;
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .kcWeight{
    position: absolute;
    top: 116px;
    left: 0;
    width: 100%;
    height: 48px;
    font-size: 16px;
  }
  .bg{
    background: #C5DFE5;
    height: 100%;
  }
  .value{
    float: left;
    width: 59%;
    color: #999;
    .value-jz{
      float: left;
      width: 50%;
      height: 30px;
      border-right: 1px solid #9BBDC5;
      margin: 10px 0;
      text-align: center;
    }
    .value-pz{
      float: left;
      width: 50%;
      height: 100%;
      text-align: center;
      padding-top: 10px;
    }
    .fc0{
      color: #273844;
      font-size: 20px;
    }
  }
  .btns{
    float: left;
    text-align: center;
    padding-top: 15px;
    cursor: pointer;
  }
  .btns-qp{
    width: 19.5%;
    margin: 0 0.5%;
  }
  .btns-ql{
    width: 19.5%;
  }
</style>
