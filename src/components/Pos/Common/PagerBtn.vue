<template>
  <div class="pos-pager" v-if="pager">
    <span v-if="showInfo && scrollMode == 'data'">
      {{$t('Dict.PageStyle.Sim1', {currentPage: pager.pagerState.current,totalPage: pager.pagerState.total})}}
    </span>
    <button type="button" class="pager-btn"
      @click="prev"
      :disabled="pager.pagerState.current <= 1 && scrollMode == 'data'">
      <i class="icon" :class="arrowDirection == 'up-down' ? 'icon-pager-up' : 'icon-pager-prev'"></i>
    </button>
    <button type="button" class="pager-btn"
      @click="next" :disabled="pager.pagerState.current >= pager.pagerState.total && scrollMode == 'data'">
      <i class="icon" :class="arrowDirection == 'up-down' ? 'icon-pager-down' : 'icon-pager-next'"></i>
    </button>
  </div>
</template>

<script>
import { delay } from 'lodash';

export default {
  props: {
    pager: {
      type: Object,
      default: null
    },
    // 是否显示分页信息，默认不显示
    showInfo: {
      type: Boolean,
      default: false
    },
    // 箭头方向，默认左右 "left-right"，也可设为 "up-down"
    arrowDirection: {
      type: String,
      default: 'left-right',
    }
  },
  data() {
    return {
      scrollMode: 'data',
    }
  },
  methods: {
    prev() {
      this.pager.prev();
    },
    next() {
      this.pager.next();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pager-info-color: #273844;
@pager-info-font-size: 12px;
@pager-btn-width: 50px;
@pager-btn-bg: @pos-dialog-pager-btn-bg;
@pager-btn-font-size: 20px;
@pager-btn-color: #273844;

.pos-pager {
  > span {
    color: @pager-info-color;
    font-size: @pager-info-font-size;
  }

  > button {
    .size(@pager-btn-width, @pos-pager-height);
    border-radius: @pos-pager-height/2;
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
