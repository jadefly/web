<template>
  <div class="moreOperations">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect">
      <el-menu-item
        v-for="(item, key) in menuItem"
        :key="key"
        :index="item.index">
        {{item.text}}
      </el-menu-item>
    </el-menu>
    <CopyCard
      v-show="activeIndex == '1'"
      ref="copyCard"
      :rgjCrmInfo="rgjCrmInfo"
      @userCardInfo="userCardInfo"
      @readRGJCardNo="readRGJCardNo"
      @querycardmessage="querycardmessage">
    </CopyCard>
    <noBill
      ref="noBill"
      v-show="activeIndex == '2'"
      :rgjCrmInfo="rgjCrmInfo"
      @userCardInfo="userCardInfo"
      @readRGJCardNo="readRGJCardNo"
      @querycardmessage="querycardmessage">
    </noBill>
  </div>
</template>

<script>
import CopyCard from './copyCard';
import noBill from './noBill';

export default {
  components: { CopyCard, noBill },
  props: {
    rgjCrmInfo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      activeIndex: '1', // 当前选中的菜单栏
      menuItem: [
        {
          text: this.$t('Biz.Pos.Member.CopyCardBtn3'),
          index: '1',
          ref: 'copyCard',
        },
        {
          text: this.$t('Biz.Pos.Member.MoreOptText2'),
          index: '2',
          ref: 'noBill',
        },
      ],
    };
  },
  methods: {
    handleSelect(index) {
      const { ref } = this.menuItem.find(item => item.index === index);
      this.activeIndex = index;
      this.$refs[ref].reset();
      this.$emit('userCardInfo', {});
    },
    userCardInfo(res) {
      this.$emit('userCardInfo', res);
    },
    readRGJCardNo(res) {
      this.$emit('readRGJCardNo', res);
    },
    querycardmessage(res) {
      this.$parent.querycardmessage(res.cardNo, res.msgfun);
    },
  },
};
</script>

<style lang="less" scoped>
.moreOperations{
  .el-menu-demo{
    background: #f7f7f7;
    > li{
      width: 100px;
      text-align: center;
      height: 50px;
      line-height: 50px;
      font-weight: bold;
    }
  }
}
</style>
