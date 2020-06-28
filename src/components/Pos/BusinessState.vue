<template>
<!-- $t-营业状态 -->
  <Dialog
    name="PosDialog.BusinessState"
    :title="$t('Biz.Pos.BizState')"
    ref="dialog"
    @close="onClose"
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content">
      <div class="business-state-tabs">
        <ul class="business-state-tabs-nav">
          <!-- $t-当前营业日, 当前市别 -->
          <li :class="{active: currentTab == 1}" @click="tab(1)">{{ $t('Biz.Pos.BizDayNow') }}</li>
          <li :class="{active: currentTab == 2}" @click="tab(2)">{{ $t('Biz.Pos.ShiftNow') }}</li>
        </ul>
        <div class="business-state-tabs-content">
          <table class="table business-state-table" v-show="currentTab == 1">
            <!-- $t-开台数(桌), 就餐人数(人), 账单金额(元) -->
            <thead>
              <tr>
                <th></th>
                <th v-if="isShowBillSerial">{{ $t('Biz.Pos.TableNum') }}</th>
                <th v-if="isShowBillSerial">{{ $t('Biz.Pos.PersonNum') }}</th>
                <th v-if="isShowTotalMoney">{{ $t('Biz.Pos.AmountOfBill') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="danger">
                <!-- <td>未结算</td> -->
                <td>{{ $t('Biz.Order.Unsettled') }}</td>
                <td v-if="isShowBillSerial"><strong>{{ posFootInfo.currentBusinessDay.unsettle }}</strong></td>
                <td v-if="isShowBillSerial"><strong>{{ posFootInfo.currentBusinessDay.unsettledPeople }}</strong></td>
                <td v-if="isShowTotalMoney"><strong>{{ posFootInfo.currentBusinessDay.notSettlementMoney }}</strong></td>
              </tr>
              <tr>
                <!-- <td>已结算</td> -->
                <td>{{ $t('Biz.Order.Settled') }}</td>
                <td v-if="isShowBillSerial"><strong>{{ posFootInfo.currentBusinessDay.settled }}</strong></td>
                <td v-if="isShowBillSerial"><strong>{{ posFootInfo.currentBusinessDay.settledPeople }}</strong></td>
                <td v-if="isShowTotalMoney"><strong>{{ posFootInfo.currentBusinessDay.settlementMoney }}</strong></td>
              </tr>
            </tbody>
          </table>
          <table class="table business-state-table" v-show="currentTab == 2">
            <!-- $t-开台数(桌), 就餐人数(人), 账单金额(元) -->
            <thead>
              <tr>
                <th></th>
                <th v-if="isShowBillSerial">{{ $t('Biz.Pos.TableNum') }}</th>
                <th v-if="isShowBillSerial">{{ $t('Biz.Pos.PersonNum') }}</th>
                <th v-if="isShowTotalMoney">{{ $t('Biz.Pos.AmountOfBill') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="danger">
                <!-- <td>未结算</td> -->
                <td>{{ $t('Biz.Order.Unsettled') }}</td>
                <td v-if="isShowBillSerial"><strong>{{ posFootInfo.currentShift.unsettle }}</strong></td>
                <td v-if="isShowBillSerial"><strong>{{ posFootInfo.currentShift.unsettledPeople }}</strong></td>
                <td v-if="isShowTotalMoney"><strong>{{ posFootInfo.currentShift.notSettlementMoney }}</strong></td>
              </tr>
              <tr>
                <!-- <td>已结算</td> -->
                <td>{{ $t('Biz.Order.Settled') }}</td>
                <td v-if="isShowBillSerial"><strong>{{ posFootInfo.currentShift.settled}}</strong></td>
                <td v-if="isShowBillSerial"><strong>{{ posFootInfo.currentShift.settledPeople }}</strong></td>
                <td v-if="isShowTotalMoney"><strong>{{ posFootInfo.currentShift.settlementMoney }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { mapGetters } from 'vuex';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      currentTab: 1,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onClose();
        },
      };
    },
    isShowTotalMoney() { // 是否显示开台信息
      return this.posInfo.isShowTotalMoney;
    },
    isShowBillSerial() { // 是否显示已结金额和未结金额
      return this.posInfo.isShowBillSerial;
    },
    ...mapGetters(['posInfo', 'posFootInfo']),
  },
  methods: {
    tab(to) {
      this.currentTab = to;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-content {
  padding: 12px;
}

.business-state-tabs {
  background-color: @white;
}

.business-state-tabs-nav {
  height: 45px;
  border-bottom: 1px solid #e4e4e4;
  text-align: center;

  > li {
    position: relative;
    display: inline-block;
    height: 45px;
    line-height: 45px;
    padding-left: 30px;
    padding-right: 30px;
    cursor: pointer;

    &.active {
      color: #0097a4;
      font-size: 16px;
      font-weight: bold;

      &:after {
        position: absolute;
        content: "";
        width: 100%;
        height: 2px;
        background-color: #0097a4;
        left: 0;
        bottom: 1px;
      }
    }
  }
}

.business-state-tabs-content {
  padding: 22px 32px 48px;
}

.business-state-table {
  margin-bottom: 0;

  > thead > tr > th,
  > tbody > tr > td {
    text-align: right;
  }

  > tbody > tr > td:first-child {
    text-align: left;
  }

  > thead > tr > th {
    background-color: #eff8ff;
    font-weight: normal;
    border-bottom: 1px solid #e4e4e4;
  }

  > tbody > tr > td {
    height: 48px;
    line-height: 48px;
    padding-top: 0;
    padding-bottom: 0;
    border-top: none;
    border-bottom: 1px solid #e4e4e4;

    > strong {
      font-weight: normal;
    }
  }

  > tbody > tr.danger > td {
    background-color: #ffebed;

    > strong {
      font-weight: bold;
      color: #f24f64;
    }
  }
}
</style>
