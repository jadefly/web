<template>
  <div class="pos-pager">
    <span v-if="showInfo && scrollMode == 'data'">
      {{$t('Dict.PageStyle.Sim1', {currentPage: currentPage,totalPage: amountPage})}}
    </span>
    <button type="button" class="pager-btn" @click="prev" :disabled="currentPage <= 1 && scrollMode == 'data'">
      <i class="icon" :class="arrowDirection == 'up-down' ? 'icon-pager-up' : 'icon-pager-prev'"></i>
    </button>
    <button type="button" class="pager-btn" @click="next" :disabled="currentPage >= amountPage && scrollMode == 'data'">
      <i class="icon" :class="arrowDirection == 'up-down' ? 'icon-pager-down' : 'icon-pager-next'"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    scrollMode: {
      type: String,
      default: 'data',
    },
    // 是否显示分页信息，默认不显示
    showInfo: {
      type: Boolean,
      default: false,
    },
    // 箭头方向，默认左右 "left-right"，也可设为 "up-down"
    arrowDirection: {
      type: String,
      default: 'left-right',
    },
    amountPage: { // 总页数
      type: Number,
      default: 0,
    },
    firstPager: { //
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      pager: null,
      currentPage: 1, // 起始页，从1开始
    };
  },
  methods: {
    // 当前页减一 派发数据
    prev() {
      this.currentPage -= 1;
      if (this.currentPage <= 0) {
        this.currentPage = 1;
      }
      this.$emit('prevPager');
    },
    // 当前页加一 派发事件
    next() {
      this.currentPage += 1;
      if (this.currentPage >= this.amountPage) {
        this.currentPage = this.amountPage;
      }
      this.$emit('nextPager');
    },
  },
  watch: {
    firstPager: {
      handler(val) {
        this.currentPage = this.firstPager;
      },
      deep: true,

    },
    amountPage: {
      handler(val) {
        this.currentPage = this.firstPager;
      },
      deep: true,

    },
  },
};
</script>


<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pager-info-color: #999;
@pager-info-font-size: 12px;
@pager-btn-width: 50px;
@pager-btn-bg: @pos-dialog-pager-btn-bg;
@pager-btn-font-size: 20px;
@pager-btn-color: #999a94;

.pos-pager {
  > span {
    color: @pager-info-color;
    font-size: @pager-info-font-size;
  }

  > button {
    .size(@pager-btn-width, @pos-pager-height);
    border-radius: @pos-pager-height / 2;
    background-color: @pager-btn-bg;
    border: 1px solid #b5b5b5;
    color: @pager-btn-color;

    > i {
      font-size: @pager-btn-font-size;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}
</style>
