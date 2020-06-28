<template>
  <div class="pos-pager pos-takeout-pager">
    <span>{{$t('Dict.PageStyle.Text1', { length: total, currentPage: currentPager, totalPage: totalPagerNum ? totalPagerNum : 1 })}}</span>
    <button href="javascript:;" class="prev" @click="prev" :disabled="currentPager <= 1"><i class="icon icon-arr-up"></i></button>
    <button href="javasctipt:;" class="next" @click="next" :disabled="currentPager >= totalPagerNum"><i class="icon icon-arr-down"></i></button>
  </div>
</template>

<script>

export default {
  props: {
    total: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
      default: 4,
    },
  },
  data() {
    return {
      currentPager: 1,
    };
  },
  computed: {
    // 判断分页总数
    totalPagerNum() {
      return Math.ceil(this.total / this.limit);
    },
  },
  methods: {
    // 当前页减一 派发数据
    prev() {
      this.currentPager -= 1;
      if (this.currentPager <= 0) {
        this.currentPager = 1;
      }
      this.$emit('getPager', this.currentPager);
    },
    // 当前页加一 派发事件
    next() {
      this.currentPager += 1;
      if (this.currentPager >= this.totalPagerNum) {
        this.currentPager = this.totalPagerNum;
      }
      this.$emit('getPager', this.currentPager);
    },
    // 初始化
    init() {
      this.currentPager = 1;
    },
    // 设置当前页数
    set(pager) {
      this.currentPager = pager;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-takeout-pager {
  > span {
    color: #273844;
    font-size: 12px;
  }
  > button {
    display: inline-block;
    .size(50px, 40px);
    border: none;
    line-height: 40px;
    border-radius: 20px;
    text-align: center;
    margin-left: 6px;
    background-color: #9dc1ca;

    > i.icon {
      font-size: 40px;
      color: #273844;
    }

    &[disabled] {
      cursor: not-allowed;
      background-color: #afd4dd;
      > i.icon {
        font-size: 40px;
        color: #888;
      }
    }
  }
}
</style>
