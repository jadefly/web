<template>
  <Dialog
    name="PosDialog.BilledAbandonBillReason"
    :title="$t('Biz.Pos.More.AbandonReasonTitle1')"
    ref="dialog"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    width="460px"
    height="310px"
    top="26vh"
    :hotkeys="BilledAbandonBillReasonHotKey"
  >
    <div class="pos-dialog-content">
      <div class="abandon-bill-wrapper">
        <ul id="abandonReasonList" v-if="reasonList.length">
          <li v-for="item in reasonList" :key="item.id" @click="selectAbandonReason(item)"
          :class="{'active': item.id === activeReason.id}">{{ item.name }}</li>
        </ul>
        <div class="abandon-reason-pager">
          <Pager ref="abandonReasonPager" :showInfo="true" pagerId="abandonReasonList"></Pager>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      reasonList: [],
      activeReason: null,
    };
  },
  computed: {
    BilledAbandonBillReasonHotKey() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      ajax('canyin.pos.bill.abandonbillreason').then((data) => {
        this.reasonList = data.reasons;
        this.activeReason = data.reasons[0];
      });
    },
    selectAbandonReason(reason) {
      this.activeReason = reason;
    },
    onSubmit() {
      this.submit(this.activeReason);
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

.abandon-bill-wrapper > ul {
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

.abandon-reason-pager {
  width: 97%;
  text-align: right;
  padding-top: 10px;
}
</style>
