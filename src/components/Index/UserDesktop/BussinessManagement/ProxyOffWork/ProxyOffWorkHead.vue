<template>
    <div class="system-content-head offwork-head">
        <h3>{{$t('Biz.UserDesktop.AgencyTieUp')}}</h3>
      <div class="offwork-head-body">
        <el-switch
          v-model="showHistory"
          active-color="#0babb9"
          inactive-color="#b5b5b5">
        </el-switch>
          <span>{{$t('Biz.UserDesktop.UserDesktopMsg016')}}</span>
      </div>
    </div>
</template>

<script>

export default {
  name: 'ProxyOffWork',
  props: {
    checkList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      showHistory: false,
    };
  },
  watch: {
    showHistory(data) {
      this.$emit('handleChangeHistoryOffWork', data);
    },
  },
};
</script>
<style lang="less" scoped>
  .offwork-head{
    display: flex;
    align-items: center;
    justify-content: space-between;
    h3 {
        padding-left: 24px;
        line-height: 56px;
        font-size: 18px;
    }
    .offwork-head-body{
      display: flex;
      align-items: center;
      padding-right: 24px;
      .top-button{
        min-width: 85px;
        margin-left: 20px;
      }
    }
  }
</style>
