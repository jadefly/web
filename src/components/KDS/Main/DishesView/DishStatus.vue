<template>
  <div class="mark-wrap">
    <div v-if="dish.platState" class="ready">备</div>
    <div v-if="dish.discFlg" class="gift">赠</div>
    <div v-if="dish.hastenFlg" class="hurry">催</div>
    <div v-if="dish.prepare" class="back">退</div>
    <div v-if="dish.ssType" class="add">加</div>
    <!--<i v-if="dish.pkgFlg">套</i>-->
    <!--<i v-if="dish.hastenFlg">催</i>-->
    <!--<i v-if="dish.prepare">背</i>-->
    <!--<i v-if="dish.discFlg">赠</i>-->
    <!--<i v-if="dish.ssType">加</i>-->
    <!--<i v-if="dish.platState">平台接单</i>-->
    <!--<img v-if="!dish.hastenFlg" src="@/components/KDS/images/mark_hurry.png"/>-->
    <!--<img v-if="dish.prepare" src="@/components/KDS/images/mark_back.png"/>-->
    <!--<img v-if="dish.discFlg" src="@/components/KDS/images/mark_gift.png"/>-->
    <!--<img v-if="dish.ssType" src="@/components/KDS/images/mark_add.png"/>-->
    <!--<img v-if="dish.platState" src="@/components/KDS/images/mark_ready.png"/>-->
  </div>
</template>

<script>

export default {
  props: ['dish'],
};
</script>
<style lang="less" scoped>
  .mark-wrap {
    display: flex;
    > div {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 2px;
      width: 18px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      border-radius: 4px;
      font-size: 12px;
      color: #ffffff;
    }
  }
</style>
