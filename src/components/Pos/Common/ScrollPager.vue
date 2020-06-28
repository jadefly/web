<template>
  <div class="scroll-pager">
    <slot></slot>
  </div>
</template>

<script>
import ScrollPager from '@/common/js/scrollpager';
import { delay } from 'lodash';

export default {
  props: {
    scrollMode: {
      type: String,
      default: 'data',
    },
  },
  data() {
    return {
      pager: null,
      pagerState: {
        current: 1,
        total: 1,
      }
    }
  },
  mounted() {
    delay(() => {
      this.pager = new ScrollPager(this.$slots.default[0].elm, '> ' + this.$slots.default[0].children[0].tag)
      this.pagerState = this.pager.state();
    }, 20);
  },
  methods: {
    refresh(isDebug) {
      delay(() => {
        this.pager.refreshState(isDebug);
        this.pagerState = this.pager.state();
      }, 20)
    },
    prev() {
      if (this.scrollMode === 'data' && this.pagerState.current > 1) {
        this.pagerState.current -= 1;
        this.pager.to(this.pagerState.current);
        // this.pager.to(--this.pagerState.current);
      }
      if (this.scrollMode === 'simple') {
        this.pager.prev();
      }
    },
    next() {
      if (this.scrollMode === 'data' && this.pagerState.current < this.pagerState.total) {
        this.pagerState.current += 1;
        this.pager.to(this.pagerState.current);
        // this.pager.to(++this.pagerState.current);
      }
      if (this.scrollMode === 'simple') {
        this.pager.next();
      }
    }
  }
}
</script>


<style lang="less" scoped>
.scroll-pager {
  height: 100%;
  overflow: hidden;
}
</style>