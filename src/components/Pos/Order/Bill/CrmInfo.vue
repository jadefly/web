<template>
  <div class="pos-order-bill-crminfo">
    <div class="u">
      <strong>{{ showMemberInfo.memberName }}</strong>
      <span>{{showMemberInfo.mobile}}</span>
    </div>
    <div class="c">{{ showMemberInfo.cardType }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      crmMemberInfo: {}, // 会员卡信息
    };
  },
  computed: {
    ...mapGetters(['posOrderBill']),
    showMemberInfo() {
      if (this.posOrderBill) {
        // CRM会员卡
        if (this.posOrderBill.crmMemberQueryData && this.posOrderBill.crmMemberQueryData.data) {
          this.crmMemberInfo.memberName = this.posOrderBill.crmMemberQueryData.data.memberName;// 会员姓名
          this.crmMemberInfo.mobile = this.posOrderBill.crmMemberQueryData.data.mobile; // 会员手机号
          this.crmMemberInfo.cardType = this.posOrderBill.crmMemberQueryData.data.cardType; // 会员卡型
        }
        // 冥晨会员卡
        if (this.posOrderBill.mingchenQueryData && this.posOrderBill.mingchenQueryData.data) {
          this.crmMemberInfo.memberName = this.posOrderBill.mingchenQueryData.data.name;// 会员姓名
          this.crmMemberInfo.mobile = this.posOrderBill.mingchenQueryData.data.mobile; // 会员手机号
          this.crmMemberInfo.cardType = this.posOrderBill.mingchenQueryData.data.card_type_desc; // 会员卡型
        }
      }

      return this.crmMemberInfo;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pos-order-bill-crminfo-common-padding: @pos-order-bill-common-padding;

@pos-order-bill-crminfo-user-padding-left: @pos-order-bill-crminfo-common-padding;
@pos-order-bill-crminfo-user-padding-top: 8px;
@pos-order-bill-crminfo-user-name-height: 20px;
@pos-order-bill-crminfo-user-mobile-font-size: 12px;
@pos-order-bill-crminfo-card-offset-right: 14px;
@pos-order-bill-crminfo-card-offset-top: 13px;
@pos-order-bill-crminfo-card-height: 28px;
@pos-order-bill-crminfo-card-border-size: 1px;
@pos-order-bill-crminfo-card-padding-horizontal: @pos-order-bill-crminfo-common-padding;
@pos-order-bill-crminfo-card-font-size: 12px;
@pos-order-bill-crminfo-card-color: #83680d;
@pos-order-bill-crminfo-crown-offset-right: 18px;
@pos-order-bill-crminfo-crown-offset-top: 22px;
@pos-order-bill-crminfo-crown-width: 40px;
@pos-order-bill-crminfo-crown-height: 33px;

.pos-order-bill-crminfo {
  position: absolute;
  left: 0;
  top: @pos-order-bill-info-height;
  .size(100%, @pos-order-bill-crminfo-height);

  > .u {
    position: absolute;
    z-index: 1;
    .square(100%);
    background-image: url(~@/common/images/pos/bill/crminfobg.jpg);
    background-repeat: no-repeat;
    padding-left: @pos-order-bill-crminfo-user-padding-left;
    padding-top: @pos-order-bill-crminfo-user-padding-top;

    > strong,
    > span {
      display: block;
    }

    > strong {
      width: 146px;
      height: @pos-order-bill-crminfo-user-name-height;
      line-height: @pos-order-bill-crminfo-user-name-height;
      overflow: hidden;
      white-space: nowrap;
    }

    > span {
      font-size: @pos-order-bill-crminfo-user-mobile-font-size;
    }
  }

  > .c {
    position: absolute;
    z-index: 2;
    right: @pos-order-bill-crminfo-card-offset-right;
    top: @pos-order-bill-crminfo-card-offset-top;
    max-width: 120px;
    height: @pos-order-bill-crminfo-card-height;
    line-height: @pos-order-bill-crminfo-card-height -
      @pos-order-bill-crminfo-card-border-size * 2;
    padding-left: @pos-order-bill-crminfo-card-padding-horizontal;
    padding-right: @pos-order-bill-crminfo-card-padding-horizontal;
    border: @pos-order-bill-crminfo-card-border-size solid
      @pos-order-bill-crminfo-card-color;
    border-radius: @pos-order-bill-crminfo-card-height / 2;
    font-size: @pos-order-bill-crminfo-card-font-size;
    color: @pos-order-bill-crminfo-card-color;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &:before {
    position: absolute;
    z-index: 0;
    content: "";
    right: @pos-order-bill-crminfo-crown-offset-right;
    top: @pos-order-bill-crminfo-crown-offset-top / -1;
    .size(@pos-order-bill-crminfo-crown-width, @pos-order-bill-crminfo-crown-height);
    background-image: url(~@/common/images/pos/bill/crown.png);
  }
}
</style>
