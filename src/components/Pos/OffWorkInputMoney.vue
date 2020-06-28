<template>
  <Dialog
    name="PosDialog.OffWorkInputMoney"
    :title="$t('Biz.Pos.OffWorkInputTitle1')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    width="740px"
    height="604px"
    :hotkeys="hotKeySet"
    id="posDialogOffWorkInputMoney"
    submitId="submitOffWorkInputMoney"
  >
    <div class="pos-dialog-content">
      <div class="offwork-inputmonery-wrapper" v-if="data">
        <ul class="offwork-info">
          <li><strong>{{$t('Dict.FlowingWater01')}}</strong><span>{{ data.code }}</span></li>
          <li>
            <strong>{{$t('Biz.Pos.OffWorkInputLi2')}}</strong>
            <span>{{ data.operatorName }}</span>
          </li>
          <li><strong>{{$t('Biz.BizComm.POSnum')}}</strong><span>{{ data.posName }}</span></li>
          <li><strong>{{$t('Dict.ReserveFund01')}}</strong><span>{{ data.pettyCash }}</span></li>
          <li><strong>{{$t('Dict.CheckInTime01')}}</strong><span>{{ data.openTime }}</span></li>
          <li><strong>{{$t('Dict.SigningTime01')}}</strong><span>{{ data.closeTime }}</span></li>
        </ul>
        <div class="payway-list-wrapper">
          <ul class="payway-title">
            <li class="w-23">{{$t('Dict.SettlementMethod')}}</li>
            <li class="w-20" v-if="data.isShowIncomeMoney === '1'">{{$t('Dict.SystemAmount')}}</li>
            <li class="w-30">{{$t('Dict.RecordAmount')}}</li>
            <li class="w-24" v-if="data.isShowIncomeMoney === '1'" >{{$t('Dict.Difference')}}</li>
          </ul>
          <ul id="offworkPayWayList" v-if="payWayDetails" class="offwork-payway-list">
            <li v-for="item in payWayDetails" v-if="item.isShowPayway">
              <span class="w-23 no-break">{{ item.payWayName }}</span>
              <span class="w-20" v-if="data.isShowIncomeMoney === '1'"> {{ item.incomeMoney == 0 ? item.notIncomeMoney : item.incomeMoney }}</span>
              <span class="w-30">
                <input type="text" v-model="item.inputMoney" @focus="selectAllText(item, $event)" v-judge v-num-keyboard:top>
              </span>
              <span v-if="data.isShowIncomeMoney === '1'" class="w-24" :class="+item.differenceAmount !== 0 ? 'red' : ''">{{item.differenceAmount}}</span>
            </li>
          </ul>
        </div>
        <div class="offwork-remark">
          <label for="offworkRemark">{{$t('Dict.Remarkss')}}</label>
          <input type="text" id="offworkRemark" v-model="remark" @focus="showAndroidInput('remark')">
        </div>
        <div class="offwork-pager">
          <Pager
            pagerId="offworkPayWayList"
            ref="offWorkInputMoneyPager"
            arrowDirection="up-down"
            :showInfo="true"
          ></Pager>
        </div>
      </div>
    </div>
     <AndroidInput ref="AndroidInput"></AndroidInput>
  </Dialog>
</template>

<script>
import {
  cloneDeep, extend, map, each,
} from 'lodash';
import { mapGetters } from 'vuex';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import { sub } from '@/common/js/math';

export default {
  components: { Dialog, Pager, AndroidInput },
  mixins: [DialogMixin, AndroidInputMixin],
  data() {
    return {
      data: null,
      remark: '',
      currentPayWayId: null,
      payWayDetails: [],
      show: true, // 测试代码
    };
  },
  computed: {
    ...mapGetters(['getVuexPosMode']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  watch: {
    payWayDetails: {
      deep: true,
      handler(val) {
        if (Array.isArray(val) && val.length > 0) {
          for (let i = 0; i < val.length; i += 1) {
            if (this.currentPayWayId === val[i].payWayId) {
              if (val[i].incomeMoney === 0) {
                val[i].differenceAmount = sub(val[i].notIncomeMoney, val[i].inputMoney);
              } else {
                val[i].differenceAmount = sub(val[i].incomeMoney, val[i].inputMoney);
              }
            }
          }
        }
      },
    },
  },
  methods: {
    onOpen() {
      this.data = this.resData;
      const tmpArr = cloneDeep(this.resData.payWayDetails);
      if (this.data.isShowIncomeMoney === '1') {
        map(tmpArr, (item) => {
          extend(item, {
            inputMoney: String(item.incomeMoney) === '0'
              ? String(item.notIncomeMoney)
              : String(item.incomeMoney),
            differenceAmount: 0,
          });
        });
      } else {
        map(tmpArr, (item) => {
          extend(item, {
            inputMoney: '',
            differenceAmount: 0,
          });
        });
      }
      this.payWayDetails = tmpArr;
      // 清备注 刷分页
      setTimeout(() => {
        this.remark = '';
        this.$refs.offWorkInputMoneyPager.refresh();
      }, 200);
    },
    // 全选临时品项名称
    selectAllText(item, event) {
      this.currentPayWayId = item.payWayId;
      event.currentTarget.select();
    },
    // 提交
    onSubmit() {
      const paywayList = [];
      if (this.payWayDetails.length) {
        each(this.payWayDetails, (e) => {
          paywayList.push({
            payWayId: e.payWayId,
            inputMoney: e.inputMoney,
            differenceAmount: e.differenceAmount,
          });
        });
      }
      this.submit(paywayList, this.remark);
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.offwork-inputmonery-wrapper {
  position: relative;
  height: 100%;
  padding-top: 100px;
  padding-bottom: 60px;
  background-color: white;
}

.offwork-info {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 18px;
  background-color: #ddd;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  > li {
    float: left;
    width: 50%;
    padding-left: 10px;
    padding-right: 10px;
    line-height: 22px;
    font-size: 14px;

    > strong {
      font-weight: normal;
    }
  }
}

.payway-list-wrapper {
  height: 100%;
  padding: 10px 20px;
  .payway-title {
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    color: white;
    background-color: #7bcad6;
    .clearfix();
    > li {
      float: left;
      padding-left: 6px;
      text-align: center;
      &.w-20 {
        width: 20%;
      }
      .no-break {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .red {
        color: red;
      }
      &.w-24 {
        width: 24%;
      }
      &.w-23 {
        display: inline-block;
        width: 23%;
      }
      &.w-30 {
        width: 30%;
      }
      &.text-center {
        text-align: center;
      }
      &.text-right {
        text-align: right;
      }
    }
  }
  .offwork-payway-list {
    height: 360px !important;
    overflow: hidden;
    > li {
      display: flex;
      align-items: center;
      height: 52px;
      line-height: 52px;
      padding-left: 4px;
      border-bottom: 1px solid #ccc;
      > span {
        text-align: center;
      }
      .w-20 {
        display: inline-block;
        width: 20%;
      }
      .w-23 {
        display: inline-block;
        width: 23%;
      }
      .w-30 {
        display: inline-block;
        width: 30%;
      }
      .no-break {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .red {
        color: red;
      }
      .w-24 {
        display: inline-block;
        width: 24%;
      }
      .w-36 {
        display: inline-block;
        width: 36%;
      }
      input {
        .size(136px, 36px);
        padding-left: 6px;
        margin-left: 4px;
        border: 1px solid #ccc;
        border-radius: 4px;
        &:focus {
          border-color: #0babb9;
        }
      }
    }
  }
}

.offwork-remark {
  position: absolute;
  bottom: 0;
  left: 0;
  padding-bottom: 12px;
  padding-left: 20px;

  > label {
    height: 36px;
    line-height: 36px;
    font-weight: normal;
  }

  > input {
    .size(250px, 36px);
    padding-left: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    &:focus {
      border-color: #0babb9;
    }
  }
}

.offwork-pager {
  position: absolute;
  bottom: 0;
  right: 0;
  padding-bottom: 16px;
  padding-right: 20px;
}
</style>
