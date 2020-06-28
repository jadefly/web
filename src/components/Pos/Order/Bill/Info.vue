<template>
  <div class="pos-order-bill-info" v-if="posOrderBill != null">
    <div class="p">
      <div id="mdifyAddBill" class="i" @click="mdifyAddBill">
        <span>{{ pointName[0] }}</span>
        <strong>{{pointName[1].substr(pointName[1].indexOf('-')+1) }}</strong>
      </div>
    </div>
    <div class="d">
      <h2>{{ bsData.code }}</h2>
      <ul>
        <li><i class="time"></i><span>{{ bsData.openTime.slice(11,16) }}</span></li>
        <li><i class="people"></i><span>{{ bsData.peopleQty }}</span></li>
        <li><i class="operator"></i><span>{{ bsData.waiterName }}</span></li>
        <li><i class="pos"></i><span>{{ bsData.posName }}</span></li>
      </ul>
      <p
        v-if="bsData.remark"
        class="p-remark"
        :class="{ 'highlight': highlightBSRemark }"
      ><i class="remark"></i><span>{{ bsData.remark }}</span></p>
    </div>
    <ModifyAddBill ref="modifyAddBill"></ModifyAddBill>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import { MessageBox } from 'element-ui';
const ModifyAddBill = () => import('../Tables/AddBill.vue'); // 更改为与开台使用一个组件
// const ModifyAddBill = () => import('../Tables/ModifyAddBill.vue');

export default {
  components: { ModifyAddBill },
  computed: {
    pointName() {
      let pointName = [];
      pointName = this.posOrderBill.bsData.pointName.split('.');
      return pointName;
    },
    bsData() {
      return this.posOrderBill.bsData;
    },
    highlightBSRemark() {
      return this.config.highlightBSRemark;
    },
    ...mapGetters([
      'posOrderBill',
      'getVuexPointData',
      'config',
    ]),
  },
  methods: {
    mdifyAddBill() {
      ajax('canyin.pos.updateBill.updateBillView', {
        params: {
          pointId: this.getVuexPointData.id ? this.getVuexPointData.id : this.getVuexPointData.data.pointId,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (res.code) {
          let data = res.data;
          if (data.pointName.indexOf('-') !== -1) {
            data.pointName = data.pointName.substr(data.pointName.indexOf('-') + 1);
          }
          this.$refs.modifyAddBill.open({ table: this.getVuexPointData, data, from: 1 }); // from:0开台,1修改开台
        }
      }).catch((code, msg) => {
        // this.close();
        MessageBox.alert(msg, this.$t('Dict.WrongInfo'));
      });
      // this.$refs.modifyAddBill.open({ table: this.getVuexPointData });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pos-order-bill-info-common-padding: @pos-order-bill-common-padding;

@pos-order-bill-title-width: 82px;
@pos-order-bill-title-offset: @pos-order-bill-info-common-padding;
@pos-order-bill-title-color: #f44e66;
@pos-order-bill-title-padding: 2px;
@pos-order-bill-title-top-space: 12px;
@pos-order-bill-title-type-font-size: 12px;
@pos-order-bill-title-type-height: 20px;
@pos-order-bill-title-name-height: 28px;

@pos-order-bill-data-offset: @pos-order-bill-info-common-padding;
@pos-order-bill-data-title-height: 24px;
@pos-order-bill-data-title-font-size: 12px;
@pos-order-bill-data-title-text-color: #000;
@pos-order-bill-data-list-height: 20px;
@pos-order-bill-data-list-icon-size: 16px;
@pos-order-bill-data-list-space: 10px;
@pos-order-bill-data-list-font-size: 12px;

.pos-order-bill-info {
  position: absolute;
  left: 0;
  top: 0;
  .size(100%, @pos-order-bill-info-height);
  padding-left: @pos-order-bill-title-width + @pos-order-bill-title-offset * 2;

  > .p {
    position: absolute;
    left: @pos-order-bill-title-offset;
    top: 8px;
    .square(@pos-order-bill-title-width);
    border: 1px solid @pos-order-bill-title-color;
    padding: @pos-order-bill-title-padding;
    text-align: center;

    > .i {
      .square(100%);
      border: 1px dotted @pos-order-bill-title-color;
      padding-top: @pos-order-bill-title-top-space;
      overflow: hidden;

      > strong,
      > span {
        display: block;
        color: @pos-order-bill-title-color;
      }

      > span {
        font-size: @pos-order-bill-title-type-font-size;
        height: @pos-order-bill-title-type-height;
        line-height: @pos-order-bill-title-type-height;
        .text-overflow();
      }

      > strong {
        height: @pos-order-bill-title-name-height;
        line-height: @pos-order-bill-title-name-height;
      }
    }
  }

  > .d {
    padding-top: 5px;

    > h2 {
      height: @pos-order-bill-data-title-height;
      line-height: @pos-order-bill-data-title-height;
      font-size: @pos-order-bill-data-title-font-size;
      color: @pos-order-bill-data-title-text-color;
      .text-overflow();
    }

    > ul {
      .clearfix();

      > li {
        position: relative;
        float: left;
        .size(50%, @pos-order-bill-data-list-height);
        line-height: @pos-order-bill-data-list-height;
        padding-left: @pos-order-bill-data-list-icon-size;
        padding-right: @pos-order-bill-data-list-space;
        .text-overflow();
        font-size: @pos-order-bill-data-list-font-size;

        > i {
          position: absolute;
          left: 0;
          top: 0;
          width: @pos-order-bill-data-list-icon-size;
          height: @pos-order-bill-data-list-height;
          background-repeat: no-repeat;
          background-position: 0 50%;

          &.time {
            background-image: url(~@/common/images/pos/bill/time.png);
          }

          &.people {
            background-image: url(~@/common/images/pos/bill/people.png);
          }

          &.operator {
            background-image: url(~@/common/images/pos/bill/operator.png);
          }

          &.pos {
            background-image: url(~@/common/images/pos/bill/pos.png);
          }

          &.remark {
            background-image: url(~@/common/images/pos/bill/remark.png);
          }
        }
      }
    }
    .p-remark {
      position: relative;
      height: 20px;
      line-height: 20px;
      padding-left: 16px;
      padding-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      color: #f00;

      > .remark {
        position: absolute;
        left: 0;
        top: 0;
        width: @pos-order-bill-data-list-icon-size;
        height: @pos-order-bill-data-list-height;
        background-repeat: no-repeat;
        background-position: 0 50%;
        background-image: url(~@/common/images/pos/bill/remark.png);
      }

      &.highlight {
        font-size: 14px;
        color: #f00;
        font-weight: bold;
      }
    }
  }
}
</style>
