<template>
  <div class="pos-pager">
    <span v-if="showInfo && scrollMode == 'data'">
      {{$t('Dict.PageStyle.Sim1', {currentPage: pagerState.current,totalPage: pagerState.total})}}
    </span>
    <button type="button" class="pager-btn" @click="prev"
    :disabled="pagerState.current <= 1 && scrollMode == 'data'">
      <i class="iconfont-kds" :class="arrowDirection == 'up-down' ? 'icon-icon-copy' : 'icon-pager-prev'"></i>
    </button>
    <button type="button" class="pager-btn" @click="next"
    :disabled="pagerState.current >= pagerState.total && scrollMode == 'data'"
      ><i class="iconfont-kds" :class="arrowDirection == 'up-down' ? 'icon-icon' : 'icon-pager-next'"></i>
    </button>
  </div>
</template>

<script>
import Pager from '@/common/js/pager';
import { delay } from 'lodash';

export default {
  props: {
    scrollMode: {
      type: String,
      default: 'data',
    },
    // 分页区域ID
    pagerId: {
      type: String,
      default: 'fenyePagerId',
    },
    // 分页项的标签或选择器，默认<li></li>
    itemTag: {
      type: String,
      default: '> li',
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
    // 是否开启动画分页，默认不开启
    animate: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      pager: null,
      pagerState: {
        current: 1,
        total: 1,
      },
    };
  },
  mounted() {
    delay(() => {
      this.$nextTick(() => {
        this.pager = new Pager(document.getElementById(this.pagerId), this.itemTag, {
          scrollMode: this.scrollMode,
          animate: this.animate,
        });
        this.pagerState = this.pager.state();
      });
    }, 20);
  },
  methods: {
    refresh(isDebug) {
      delay(() => {
        this.pager.refreshState(isDebug, true, document.getElementById(this.pagerId));
        this.pagerState = this.pager.state();
      }, 20);
    },
    pushRefresh(isDebug) {
      delay(() => {
        this.pager.refreshState(isDebug, false, document.getElementById(this.pagerId));
      }, 20);
    },
    prev() {
      if (this.scrollMode === 'data' && this.pagerState.current > 1) {
        // 修正eslint报错 by L.R
        this.pagerState.current -= 1;
        this.pager.to(this.pagerState.current);
      }
      if (this.scrollMode === 'simple') {
        this.pager.prev();
      }
    },
    next() {
      if (this.scrollMode === 'data' && this.pagerState.current < this.pagerState.total) {
        // 修正eslint报错 by L.R
        this.pagerState.current += 1;
        this.pager.to(this.pagerState.current);
      }
      if (this.scrollMode === 'simple') {
        this.pager.next();
      }
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
  margin-top: 0;
  margin-bottom: 0;

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
