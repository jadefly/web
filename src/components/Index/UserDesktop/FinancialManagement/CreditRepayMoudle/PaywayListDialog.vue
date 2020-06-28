<template>
  <Dialog
    name="PosDialog.PaywayListDialog"
    :title="$t('Dict.SettlementMethod')"
    ref="dialog"
    @submit="onSubmit"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    width="460px"
    height="310px"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    top="26vh"
  >
    <div class="pos-dialog-content">
      <!-- 弹窗内容 -->
      <ul class="payway-list-wrapper" :id="pagerId">
        <li
          v-for="(item, index) in paywayList"
          :key="index"
          @click="selectRepayPayway(item)"
          :class="{'active': item.id === activeItem.id}">
          {{ item.name }}
        </li>
      </ul>
      <div class="payway-pager">
      <Pager
       :showInfo="true"
       :pagerId="pagerId"
       ref="repayPaywayPager"
      >
      </Pager>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { find } from 'lodash';
import Pager from '@/components/Pos/Common/Pager';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import repayPaywayDict from './RepayComps/repayPaywayDictionary';

export default {
  props: {
    paywayList: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: '',
    },
    paywayId: {
      type: String,
      default: '',
    },
    repayValue: {
      type: Number,
      default: 0,
    },
    typeId: {
      type: String,
      default: '',
    },
    bizType: {
      type: Number,
      default: 0,
    },
    crmVersion: {
      type: String,
      default: '',
    },
  },
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      activeItem: {},
      pagerId: '',
      repayPaywayDict, // 支付方式-id匹配参数和执行方法(字典)
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
      this.pagerId = this.name;
      // 回显押金登记方式
      this.activeItem = find(this.paywayList, { id: this.paywayId });
      // 刷新分页
      setTimeout(() => {
        if (this.$refs.repayPaywayPager) {
          this.$refs.repayPaywayPager.refresh();
        }
      }, 20);
    },
    selectRepayPayway(item) {
      this.activeItem = item;
    },
    onSubmit() {
      /**
       * 实现-还挂账,真实支付流程.(非登记假支付).
       * 目前: 会员卡(CRM7),扫码付
       * 依靠字典匹配: 支付方式id匹配执行方法
       * 会员卡(CRM7)支付 {id: '3', openMethod: 'repayMemberCardOpen'},且限定CRM7可执行
       * 扫码付(二码合一)支付 {id: '37', openMethod: 'repayScanCodeOpen',},
       * 非支付触发onSubmit(非doneOfPayment调用): 用于选择并打开支付方式页面后,返回再直接点击本页面onSubmit
       */
      const curPayWay = find(this.repayPaywayDict, { id: this.activeItem.id });
      if (curPayWay
        && (!curPayWay.crmVersion
          || curPayWay.crmVersion === this.crmVersion)
      ) {
        this.$vemit(curPayWay.openMethod, {
          data: this.activeItem, // 所选支付方式参数
          bizType: this.bizType || null, // 还款方式(指定/批量/指定-扫码支付用)
          repayValue: this.repayValue, // 还款金额
          callback: (data) => {
            // 支付页面, 回调传入的 确定执行的方法;参数为执行回调传入的参数(支付方式参数)
            this.$emit('doneOfPayment', data);
          },
        });
      }
      // 使用其他方式(标记)还挂账
      this.$emit('selectPayway', this.activeItem);
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-content {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
}

.payway-list-wrapper {
  position: relative;
  width: 100%;
  height: 200px !important;
  overflow: hidden;
  .clearfix();

  > li {
    float: left;
    .size(100px, 40px);
    line-height: 40px;
    font-size: 14px;
    margin-left: 12px;
    margin-top: 10px;
    overflow: hidden;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    &.active {
      background-color: #039eac;
      border-color: #047d88;
      color: white;
    }
  }
}

.payway-pager {
  width: 97%;
  text-align: right;
  padding-top: 10px;
}
</style>
