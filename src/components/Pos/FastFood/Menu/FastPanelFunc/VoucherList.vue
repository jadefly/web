<template>
  <Dialog
    name="PosDialog.VoucherList"
    :title="$t('Biz.Coupon.CashCoupon')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="533px"
    submitId="voucherList"
  >
    <div class="pos-dialog-content pos-activity-scheme-wrapper">
      <ul>
        <li v-for="(list, index) in voucherList" :key="index" >
          <button @click="selectBtn(list)" class="planListBtn">{{ list.name }} </button>
        </li>
      </ul>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
// import Pager from '@/components/Pos/Common/Pager';
// import { mapGetters, mapMutations } from 'vuex';

export default {
  components: {
    Dialog,
    // Pager,
  },
  mixins: [DialogMixin],
  data() {
    return {
      // 代金券列表
      voucherList: [],
    };
  },
  computed: {
    // ...mapGetters(['getSelectDiscountPlanData']),
  },
  methods: {
    onOpen() {
      this.voucherList = this.resData ? this.resData.vouchers : [];
    },
    // 选择要执行的券
    selectBtn(item) {
      if (item) {
        this.submit({ paywayInfo: item, billData: this.resData.billData });
        this.close();
      }
    },
  },
};

</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pos-activity-scheme-wrapper {
  height: 286px;
  background-color: #ffffff;
  >ul {
    height: 100%;
    padding: 10px;
    >li {
      width: 118px;
      height: 42px;
      border:1px solid #b5b5b5;
      border-radius: 5px;
      overflow: hidden;
      margin: 5px;
      float: left;
      .planListBtn {
        height: 100%;
        width: 100%;
        overflow: hidden;
        border: none;
        background-color: #ffffff;
      }
      &.active {
        border:1px solid #0babb9;
        color: #0babb9;
      }
    }
  }
}
</style>
