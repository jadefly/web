<template>
  <div class="bill-info">
    <div class="line">
      <span class="name">{{$t('Dict.AvailableCredit')}}</span>
      <br>
      <span>{{ accountInfo.availableSum }}</span>
    </div>
    <div class="line add">=</div>
    <div class="line">
      <span class="name">{{$t('Dict.Credits')}}</span>
      <br>
      <span>{{ accountInfo.unpaidSum }}</span>
    </div>
    <div class="line equal">+</div>
    <div class="line">
      <span class="name">{{$t('Dict.AccountBalance')}}</span>
      <br>
      <span class="remain-sum">
        {{
          (accountInfo.remainingSum
            ? accountInfo.remainingSum
            : accountInfo.remainMoney) || 0
        }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    accountInfo: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style lang="less" scoped>
  .bill-info {
    display: inline-block;
    vertical-align: top;
    > .line {
      display: inline-block;
      text-align: center;
      vertical-align: middle;
      height: 40px;
      margin-left: 4px;
      > .name {
        color: #999;
      }
      > .remain-sum {
        color: red;
      }
      &.add,
      &.equal {
        line-height: 40px;
      }
    }
  }
</style>
