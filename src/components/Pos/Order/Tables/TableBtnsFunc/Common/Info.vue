<template>
  <div class="table-info-wrapper">
    <div v-if="infoData.isPkg">
      <span>
        {{ infoData.pkgName }}
      </span>
    </div>
    <div v-else>
      <span class="current-table">{{getVuexPosMode == '3'? $t('Dict.OrderCode'):$t('Biz.Order.CurrentSeats')}}</span>
      <strong>{{getVuexPosMode == '3' ? infoData.orderCode : infoData.pointName}}</strong>
      <span class="order-time">{{$t('Dict.OpeningTime')}}</span>
      <strong>{{infoData.openTime}}</strong>
      <span class="diner-amount">{{$t('Biz.Order.DinerPersonNumLabel')}}</span>
      <strong>{{infoData.peopleQty}}</strong>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    infoData: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapGetters([
      'getVuexPosMode',
    ]),
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.table-info-wrapper {
  .size(100%, 58px);
  line-height: 58px;
  padding-left: 18px;
  padding-right: 18px;
  font-size: 14px;
  box-shadow: 0px 0px 10px 0px inset rgba(0, 0, 0, 0.2);
  background-color: #eee;
  > strong {
    font-weight: normal;
  }

  .order-time, .diner-amount {
    padding-left: 20px;
  }
}

</style>
