<template>
     <div class='wrap'>
       <!-- 暂无信息 -->
       {{ txt }}
     </div>
</template>

<script>
import i18n from '@/locales/index';

export default {
  data() {
    return {
      txt: i18n.t('Dict.NoInfo'),
      // txt: '暂无信息',
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.wrap {
  width:100%;
  line-height: 300px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

</style>
