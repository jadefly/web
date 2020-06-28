<template>
  <div class="kds-container" :class="[col, fixedKeyboard, tablesOrDishes]">
    <div class="screen">
      <slot name="screen"></slot>
    </div>
    <div class="dish-view">
      <slot name="dishView"></slot>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('KDS', ['config']),
    col() {
      const num = this.config.leftCellNum;
      if (num) return `col${num}`;
      return ' ';
    },
    fixedKeyboard() {
      if (this.config.fixedKeyboard) {
        return 'fixedKeyboard';
      }
      return '';
    },
    tablesOrDishes() {
      const route = this.$route.name;
      if (route.indexOf('.dishes') > -1) {
        return 'dishes-page';
      }
      if (route.indexOf('.tables') > -1) {
        return 'tables-page';
      }
      return '';
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@kds-main-dishview-default-width: 450px;
@col1-width: 122px;
@col2-width: 242px;
@col3-width: 372px;
@col4-width: 496px;
@col1-width-fixedKeyboard: 205px;
@col2-width-fixedKeyboard: 322px;
@col3-width-fixedKeyboard: 452px;
@col4-width-fixedKeyboard: 574px;
@right-btn-width: 80px;

.kds-container {
  position: relative;
  height: 100%;
  .screen {
    height: 100%;
    width: calc(100% - @kds-main-dishview-default-width);
    float: left;
  }
  .dish-view {
    width: @kds-main-dishview-default-width;
    height: 100%;
    float: right;
  }
  &.col1 {
    .screen {
      width: @col1-width;
    }
    .dish-view {
      width: calc(100% - @col1-width);
    }
    &.fixedKeyboard.dishes-page {
      .screen {
        width: @col1-width-fixedKeyboard;
      }
      .dish-view {
        width: calc(100% - @col1-width-fixedKeyboard);
      }
    }
  }
  &.col2 {
    .screen {
      width: @col2-width;
    }
    .dish-view {
      width: calc(100% - @col2-width);
    }
    &.fixedKeyboard.dishes-page {
      .screen {
        width: @col2-width-fixedKeyboard;
      }
      .dish-view {
        width: calc(100% - @col2-width-fixedKeyboard);
      }
    }
  }
  &.col3 {
    .screen {
      width: @col3-width;
    }
    .dish-view {
      width: calc(100% - @col3-width);
    }
    &.fixedKeyboard.dishes-page {
      .screen {
        width: @col3-width-fixedKeyboard;
      }
      .dish-view {
        width: calc(100% - @col3-width-fixedKeyboard);
      }
    }
  }
  &.col4 {
    .screen {
      width: @col4-width;
    }
    .dish-view {
      width: calc(100% - @col4-width);
    }
    &.fixedKeyboard.dishes-page {
      .screen {
        width: @col4-width-fixedKeyboard;
      }
      .dish-view {
        width: calc(100% - @col4-width-fixedKeyboard);
      }
    }
  }
}
</style>
