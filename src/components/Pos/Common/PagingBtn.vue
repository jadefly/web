<template>
  <div class="pos-pager" :class="{vertical: vertical}"  v-if="pagingRef">
    <span v-if="showInfo">
      {{$t('Dict.PageStyle.Sim1', {currentPage: pagingRef.currentPage,totalPage: pagingRef.totalPage})}}
    </span>
    <button type="button" class="pager-btn"
      @click="prev"
      :disabled="pagingRef.currentPage <= 1">
      <i class="icon" :class="arrowDirection == 'up-down' ? 'icon-pager-up' : 'icon-pager-prev'"></i>
    </button>
    <button type="button" class="pager-btn"
      @click="next"
      :disabled="pagingRef.currentPage >= pagingRef.totalPage">
      <i class="icon" :class="arrowDirection == 'up-down' ? 'icon-pager-down' : 'icon-pager-next'"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    paging: {
      type: Object,
      default: null,
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
    // 按钮是否竖着上下排列
    vertical: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      bindPaging: null,
    };
  },
  computed: {
    pagingRef() {
      return this.paging ? this.paging : this.bindPaging;
    },
  },
  methods: {
    prev() {
      this.pagingRef.prev();
    },
    next() {
      this.pagingRef.next();
    },
    bind(paging) {
      this.bindPaging = paging;
    },
  },
}
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
  &.btn-height-48 {
    >button {
      height: 48px;
    }
  }
  &.vertical {
    > button {
      display: block;
      &:first-child {
        margin-bottom: 5px;
      }
    }
  }
}
</style>
