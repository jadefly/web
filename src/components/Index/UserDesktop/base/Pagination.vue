<template>
  <div class="page-context">
    <p class="page-total">{{$t('Dict.PageStyle.Sim3', [total])}}</p>
    <template v-if="defaultPage">
        <button
          class="btn-arrow"
          :disabled="pageNum <= 1"
          @click="firstPage"
        >
          <i class="el-icon-d-arrow-left"></i>
        </button>
        <button
          class="btn-arrow"
          :disabled="pageNum <= 1"
          @click="upPage"
        >
          <i class="el-icon-arrow-left"></i>
        </button>
        <p class="page-input-box">
          <input
            readonly
            type="number"
            v-model="pageNum"
            class="page-input">
          / {{pageCount}}
        </p>
        <button
          class="btn-arrow"
          :disabled="pageNum >= pageCount"
          @click="downPage"
        >
          <i class="el-icon-arrow-right"></i>
        </button>
        <button
          class="btn-arrow"
          :disabled="pageNum >= pageCount"
          @click="lastPage"
          >
          <i class="el-icon-d-arrow-right"></i>
        </button>
    </template>
    <template v-else>
      <span class="page-text">{{
        $t('Dict.PageStyle.Sim1', {
          currentPage: pageNum,
          totalPage: pageCount,
        })
      }}</span>
      <button
        type="button"
        class="pager-btn"
        @click="upPage"
        :disabled="pageNum <= 1">
        <i
          class="icon"
          :class="arrowDirection == 'up-down' ? 'icon-pager-up' : 'icon-pager-prev'">
        </i>
      </button>
      <button
        type="button"
        class="pager-btn"
        @click="downPage"
        :disabled="pageNum >= pageCount">
        <i
          class="icon"
          :class="arrowDirection == 'up-down' ? 'icon-pager-down' : 'icon-pager-next'">
        </i>
      </button>
    </template>
  </div>
</template>

<script>
export default {
  name: 'pagination',
  props: {
    defaultPage: {
      type: Boolean,
      default() {
        return true;
      },
    },
    arrowDirection: {
      type: String,
      default: 'up-down',
    },
    total: {
      type: Number,
      default() {
        return 0;
      },
    },
    limit: {
      type: Number,
      default() {
        return 0;
      },
    },
    page: {
      type: Number,
      default() {
        return 1;
      },
    },
  },
  data() {
    return {
      pageNum: this.page,
    };
  },
  computed: {
    pageCount() {
      return this.total > 0 ? Math.ceil(this.total / this.limit) : 1;
    },
  },
  watch: {
    page(data) {
      this.pageNum = data;
    },
  },
  methods: {
    downPage() {
      this.pageNum += 1;
      if (this.pageNum >= this.pageCount) {
        this.pageNum = this.pageCount;
      }
      this.$emit('handleChangePage', this.pageNum);
    },
    upPage() {
      this.pageNum -= 1;
      if (this.pageNum <= 0) {
        this.pageNum = 1;
      }
      this.$emit('handleChangePage', this.pageNum);
    },
    firstPage() {
      this.pageNum = 1;
      this.$emit('handleChangePage', this.pageNum);
    },
    lastPage() {
      this.pageNum = this.pageCount;
      this.$emit('handleChangePage', this.pageNum);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}
input[type="number"] {
    -moz-appearance: textfield;
}
@pager-info-color: #273844;
@pager-info-font-size: 14px;
@pager-btn-width: 50px;
@pager-btn-bg: @pos-dialog-pager-btn-bg;
@pager-btn-font-size: 20px;
@pager-btn-color: #273844;

.page-context {
  position: absolute;
  right: 8px;
  top: 5px;
  .page-total {
    display: inline-block;
  }
  .btn-arrow {
    width: 30px;
    height: 30px;
    background: #fff;
    border: 2px solid #ececec;
    &:disabled {
      cursor: not-allowed;
      background: #f2f2f2;
      color: #b8b8b8;
    }
  }
  .page-input-box {
    display: inline-block;
    vertical-align: bottom;
    .page-input {
      width: 42px;
      height: 30px;
      border-radius: 4px;
      background-color: #fff;
      border: 2px solid #ececec;
      color: #3e71f7;
      text-align: center;
    }
  }
  .page-text {
    color: @pager-info-color;
    font-size: @pager-info-font-size;
  }
  .pager-btn {
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
