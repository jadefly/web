<template>
  <Dialog
    name="PosDialog.MemberCardPaymentInfo"
    submitId="memberCardPaymentInfo"
    :title="pageTitle"
    :submitText="$t('Dict.Delete')"
    width="380px"
    top="26vh"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :showSubmit=true
    :hotkeys="hotkeys"
    :append-to-body="true">
    <ul class="wrapper">
      <li
        v-show="pageData.memberVerification"
      >{{$t('Biz.Settlement.MemberCard01')}}:<span>{{ pageData.cardNo }}</span>
      </li>
      <!-- <li>会员名称:<span>{{ pageData.name }}</span></li> -->
      <li class="line"></li>
      <li
        v-show="pageData.memberVerification"
        >{{$t('Biz.Settlement.ThisSettlement')}}:<span>&yen;{{ pageData.consumeAllMoney }}</span></li>
      <li
        v-show="pageData.memberVerification"
        >{{$t('Biz.Settlement.StoredValSettlement')}}:<span>&yen;{{ pageData.consumeMoney }}</span></li>
      <li
        v-show="pageData.memberVerification"
        >{{$t('Biz.Settlement.PointSettlement')}}:<span>&yen;{{ pageData.consumeScoreMoney }}</span></li>
      <li
        v-show="pageData.memberVerification"
        >{{$t('Biz.Settlement.BillSettlement')}}:<span>&yen;{{ pageData.consumeTicketMoney }}</span></li>
      <li
        v-show="pageData.memberVerification"
        >{{$t('Biz.Settlement.NumberOfCoupons')}}:<span>{{ pageData.useTicketSize }}</span><em></em>{{$t('Dict.Leaf')}}</li>
      <li
        v-show="!pageData.memberVerification"
        >{{$t('Biz.Settlement.NonMembershipSettle')}}:<span>&yen;{{ pageData.consumeTicketMoney }}</span></li>
      <li
        v-show="!pageData.memberVerification"
        >{{$t('Biz.Settlement.NonMembershipAmount')}}:<span>{{ pageData.notMemberTicketCount }}</span><em></em>{{$t('Dict.Leaf')}}</li>
    </ul>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
// import Pager from '@/components/Pos/Common/Pager'

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      pageData: '',
      pageTitle: '',
    };
  },
  computed: {
    ...mapGetters(['getSettlementPreSettlePayWayList']),
    // 添加快捷键
    hotkeys() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      // 使用VUX数据,填充渲染页面: 后台数据结构问题, 写死[0]取第一条数据
      this.pageData = JSON.parse(this.getSettlementPreSettlePayWayList[0].crm_pay_msg);
      if (this.pageData.memberVerification) {
        this.pageTitle = `${this.$t('Biz.Settlement.MembershipDetail')}`;
      } else {
        this.pageTitle = `${this.$t('Biz.Settlement.NonMembershipDetail')}`;
      }
      // console.log(this.pageData);
    },
    // 提交前执行 询问, 后执行删除支付方式
    onSubmit() {
      this.$confirm(
        `${this.$t('Biz.Settlement.Tip3')}`,
        `${this.$t('Dict.Tips')}`,
        {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        },
      ).then(() => {
        // this.resData-打开模态框时传入的数据, 包含需要执行的回调, 在确认后, 将回调触发执行
        this.resData.callback();
        this.close();
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.wrapper {
  height: 100%;
  padding: 20px;
  background-color: #ffffff;
  font-size: 16px;
  color: #333;
  li {
    padding: 8px 0 8px 42px;

    &:nth-child(3) {
      padding-left: 26px;
    }

    &:nth-child(6),
    &:nth-child(7) {
      padding-left: 58px;
    }
    &:nth-child(8),
    &:nth-child(9) {
      padding-left: 10px;
    }
    > span {
      margin-left: 10px;
    }
    > em {
      display: inline-block;
      width: 9px;
    }
  }
  .line {
    width: 100%;
    margin: 12px 0;
    padding: 0;
    border-top: 1px dashed #999;
  }
}
</style>
