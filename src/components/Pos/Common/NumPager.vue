<template>
  <nav>
    <ul class="pageation">
      <li :class="{'disabled': current == 1}" @click="pagechange(current - 1)"><i class="icon" :class="arrowDirection == 'up-down' ? 'icon-pager-up' : 'icon-pager-prev'"></i></li>
      <li :class="{'disabled': current == page}"
      @click="pagechange(current + 1)"><i class="icon"
      :class="arrowDirection == 'up-down' ? 'icon-pager-down' : 'icon-pager-next'"></i></li>
    </ul>
  </nav>
</template>
<script>
export default {
  data() {
    return {
      current: this.currentPage
    }
  },
  props: {
    // 箭头方向，默认左右 "left-right"，也可设为 "up-down"
    arrowDirection: {
      type: String,
      default: 'left-right'
    },
    total: {// 数据总条数
      type: Number,
      default: 0
    },
    displayCount: {// 每页显示条数
      type: Number,
      default: 0
    },
    currentPage: {// 当前页码
      type: Number,
      default: 1
    }
  },
  computed: {
    page() { // 总页数
      return Math.ceil(this.total / this.displayCount);
    },
  },
  methods: {
    pagechange(idx) {
      if (this.current != idx && idx > 0 && idx < this.page + 1) {
        this.current = idx;
        this.$emit('pagechange', this.current);
      }
    },
    init() {
      this.current = 1;
    }
  }
}
</script>

<style lang="less" scoped>
  .pageation {
    height: 34px;
    >li {
      width: 48px;
      height: 100%;
      float: left;
      text-align: center;
      margin: 0px 4px;
      font-size: 24px;
      line-height: 26px;
      border-radius: 20px;
      box-shadow: 10px;
      border: 1px solid #b5b5b5;
      cursor: pointer;
      &.disabled {
        pointer-events: none;
        cursor: default;
        opacity: 0.6;
      }
    }
  }
</style>
