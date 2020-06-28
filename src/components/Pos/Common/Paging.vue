<template>
  <ul ref="pagingList" class="paging-ul">
    <li
      v-for="(item, index) in curPageData"
      :key="item.id || index"
      :style="[sizeStyle, itemStyle]"
    >
      <slot :item="item" :index="index"></slot>
    </li>
  </ul>
</template>

<script>
import _ from 'lodash';

export default {
  props: {
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    itemWidth: {
      type: Number,
      default: 0,
    },
    itemHeight: {
      type: Number,
      default: 0,
    },
    // active对象的查找规则，用于该组件的getIndex方法
    // 若传入该prop，则按照该prop数组中的所有key值，对data数据源进行匹配查找
    // 否则按照之前的规则，采用id作为默认的查找条件  183 by L.R
    activeFindRules: {
      type: Array,
      default: null,
    },
    active: {
      type: Object,
      default: null,
    },
    fix: {
      type: Number,
      default: 0,
    },
    autoActive: {
      type: Boolean,
      default: true,
    },
    numList: {
      type: Array,
      default: () => [],
    },
    queryKey: {
      type: String,
      default: 'id',
    },
    itemStyle: Object,
    usePropSize: Boolean,
    itemFloat: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      wrapWidth: 0,
      wrapHeight: 0,
      colNum: 0,
      rowNum: 0,
      pageSize: 0,
      currentPage: 1,
    };
  },
  computed: {
    sizeStyle() {
      if (this.usePropSize) {
        return {
          float: this.itemFloat ? 'left' : 'none',
          width: `${this.itemWidth}px`,
          height: `${this.itemHeight}px`,
        };
      }
      return null;
    },
    fixed() {
      return _.take(this.data, this.fix);
    },
    droped() {
      return _.drop(this.data, this.fix);
    },
    pageData() {
      return _.concat(this.fixed, this.droped.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize));
    },
    curPageData() {
      if (this.numList && this.numList.length) {
        return _.map(this.pageData, (item) => {
          const finded = _.find(this.numList, { id: item[this.queryKey] });
          return _.extend({}, item, {
            _num: finded ? finded.num : 0,
            tagSubmit: finded ? finded.tagSubmit : false,
          });
        });
      }
      this.$emit('getPageData', this.pageData);
      return this.pageData;
    },
    totalPage() {
      return this.droped.length ? (parseInt((this.droped.length - 1) / this.pageSize) + 1) : 1;
    },
  },
  mounted() {
    this.initPager();
    window.addEventListener('resize', _.debounce(() => {
      this.initPager();
      // http://192.168.4.84:88/zentao/bug-view-74721.html
      // 改窗口大小后回到第一个，先暂时屏蔽掉
      // this.updateActive('first');
    }, 500));
  },
  methods: {
    initPager() {
      setTimeout(() => {
        const dom = $(this.$refs.pagingList);
        this.wrapWidth = dom.width();
        this.wrapHeight = dom.height();
        this.colNum = parseInt(this.wrapWidth / this.itemWidth) - this.fix;
        this.rowNum = parseInt(this.wrapHeight / this.itemHeight);
        this.pageSize = (this.colNum + this.fix) * this.rowNum - this.fix;
        this.currentPage = 1;
      }, 100);
    },
    refresh() {
      this.initPager();
    },
    top() {
      this.currentPage = 1;
    },
    prev(callback) {
      if (this.currentPage > 1) {
        if (this.active && this.autoActive) {
          var index = this.getIndex();
        }
        this.currentPage--;
        if (this.active && this.autoActive && !callback) {
          this.updateActive(index);
        }
        if (callback) {
          callback();
        }
      }
    },
    next(callback) {
      if (this.currentPage < this.totalPage) {
        if (this.active && this.autoActive) {
          var index = this.getIndex();
        }
        this.currentPage++;
        if (this.active && this.autoActive && !callback) {
          if (this.pageData[index]) {
            this.updateActive(index);
          } else {
            this.updateActive('last');
          }
        }
        if (callback) {
          callback();
        }
      }
    },
    select(direction) {
      if (this.active) {
        switch (direction) {
          case '↑':
            this.selectUp();
            break;
          case '↓':
            this.selectDown();
            break;
          case '←':
            this.selectLeft();
            break;
          case '→':
            this.selectRight();
            break;
        }
      }
    },
    selectUp() {
      const index = this.getIndex() - this.colNum;
      if (index >= 0) {
        this.updateActive(index);
      } else {
        this.prev(() => {
          this.updateActive(this.pageSize + index);
        });
      }
    },
    selectDown() {
      const index = this.getIndex() + this.colNum;
      if (index < this.pageData.length) {
        this.updateActive(index);
      } else {
        this.next(() => {
          if (this.pageData[index - this.pageSize]) {
            this.updateActive(index - this.pageSize);
          } else {
            this.updateActive('last');
          }
        });
      }
    },
    selectLeft() {
      const index = this.getIndex() - 1;
      if (index >= 0) {
        this.updateActive(index);
      } else {
        this.prev(() => {
          this.updateActive('last');
        });
      }
    },
    selectRight() {
      const index = this.getIndex() + 1;
      if (index < this.pageData.length) {
        this.updateActive(index);
      } else {
        this.next(() => {
          this.updateActive('first');
        });
      }
    },
    getIndex() {
      const rule = { id: this.active.id };
      if (this.activeFindRules) {
        this.activeFindRules.forEach(key => this.active[key] && Object.assign(rule, { [key]: this.active[key] }));
      }
      return _.indexOf(this.pageData, _.find(this.pageData, rule));
    },
    updateActive(index) {
      if (index == 'first') {
        index = 0;
      } else if (index == 'last') {
        index = this.pageData.length - 1;
      }
      if (this.pageData.length) {
        this.$emit('update:active', this.pageData[index]);
        this.$emit('change', this.pageData[index]);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.paging-ul {
  height: 100%;
}
</style>
