<template>
  <div class="other-info" ref="otherInfo">
    <div class="content">
      <div class="header">
        <span>{{$t('Dict.OperationFlow01')}} {{ bsCode }}</span>
        <span>{{$t('Dict.SettlementFlow01')}}{{ tsCode }}</span>
      </div>
      <div class="body">
        <div class="open-table">
          <span>{{$t('Biz.UserDesktop.SearchPrint.OtherInfoSpan3')}}</span>
          <el-switch
            disabled
            v-model="isBookOpenFlg ">
          </el-switch>
        </div>
        <div class="continued-order">
          <span>{{$t('Biz.Order.ContinueOrder')}}</span>
          <el-switch
            disabled
            v-model="continueBill">
          </el-switch>
        </div>
        <div class="back-sign">
          <span>{{$t('Biz.UserDesktop.SearchPrint.OtherInfoSpan5')}}</span>
          <el-switch
            disabled
            v-model="isCoFlg">
          </el-switch>
        </div>
        <div class="back-settle">
          <span>{{$t('Biz.UserDesktop.SearchPrint.OtherInfoSpan6')}}</span>
          <el-switch
            disabled
            v-model="returnPointFlg">
          </el-switch>
        </div>
        <div class="pay-change">
          <span>{{$t('Biz.UserDesktop.SearchPrint.OtherInfoSpan7')}}</span>
          <el-switch
            disabled
            v-model="paymentFlg">
          </el-switch>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      tsCode: '',
      bsCode: '',
      returnPointFlg: false,
      continueBill: false,
      isBookOpenFlg: false,
      paymentFlg: false,
      isCoFlg: false,
    };
  },
  props: {
    otherData: {},
  },
  watch: {
    otherData(val) {
      const {
        tsCode, bsCode, returnPointFlg, continueBill, isBookOpenFlg, paymentFlg, isCoFlg,
      } = val;
      this.tsCode = tsCode;
      this.bsCode = bsCode;
      this.returnPointFlg = returnPointFlg;
      this.continueBill = continueBill;
      this.isBookOpenFlg = isBookOpenFlg;
      this.paymentFlg = paymentFlg;
      this.isCoFlg = isCoFlg;
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .other-info {
    .content {
      padding: 15px;
      .header {
        display: flex;
        > span {
          flex: 1;
        }
      }
      .body {
        > div {
          margin-top: 30px;
          display: flex;
          > span {
            min-width: 100px;
          }
        }
      }
    }
  }
  .lang-enUS{
    .other-info {
      .content {
        .body {
          > div {
            > span {
              min-width: 160px;
            }
          }
        }
      }
    }
  }
</style>
