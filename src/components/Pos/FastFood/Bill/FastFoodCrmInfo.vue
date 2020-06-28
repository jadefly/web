<template>
  <div class="pos-order-bill-crminfo">
    <p class="vip">VIP</p>
    <div class="u">
      <strong>{{ memberInfo.memberName }}</strong>
      <span>{{ memberInfo.mobile }}</span>
    </div>
    <div class="c">{{ memberInfo.cardType }}</div>
  </div>
</template>

<script>
export default {
  // 根据组件绑定, 传入的数据, 响应显示
  model: {
    prop: 'memberInfo',
    event: 'cancel'
  },
  props: {
    memberInfo: ''
  }
}
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pos-order-bill-crminfo-common-padding: @pos-order-bill-common-padding;
@pos-order-bill-crminfo-user-padding-left: @pos-order-bill-crminfo-common-padding;
@pos-order-bill-crminfo-user-padding-top: 8px;
@pos-order-bill-crminfo-user-name-height: 20px;
@pos-order-bill-crminfo-user-mobile-font-size: 12px;
@pos-order-bill-crminfo-card-offset-right: 22px;
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
  top: 0;
  .size(100%, @pos-order-bill-crminfo-height);

  > .vip {
    position: absolute;
    top: 36px;
    right: -4px;
    width: 40px;
    z-index: 299;
    transform: rotate(25deg);
    color: #f0d062;
    font-size: 16px;
    font-weight: bold;
  }

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
      width: 110px;
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
    // right: @pos-order-bill-crminfo-card-offset-right;
    right: 50px;
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
    width: 46px;
    height: 44px;
    position: absolute;
    z-index: 99;
    content: "";
    right: 0;
    top: 10px;
    background-size: 60px 50px;
    background-image: url(~@/common/images/pos/bill/crown.png);
  }
}
</style>
