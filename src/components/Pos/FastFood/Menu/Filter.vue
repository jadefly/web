<template>
  <div class="pos-order-menu-filter" :class="{'box_only_smallclass_oneLine': isSmallClassOneLine}">
    <div
      class="filter-item pos-order-tables-filter-item"
      v-if="!isOnlyShowSmallClass && !isShowCustomClass"
    >
      <Paging
        :data="bigClasses"
        :active.sync="activeBigClass"
        :itemWidth="100"
        :itemHeight="36"
        :fix="1"
        :autoActive="false"
        id="bigClassesList"
        ref="bigClassesList"
      >
        <button
          type="button"
          slot-scope="props"
          :class="{ 'active': props.item.id === activeBigClass.id }"
          @click="choiceBigClass(props.item)"
        >{{ props.item.name }}</button>
      </Paging>
      <PagingBtn
        class="btn-height-48"
        ref="bigClassesFilterPager"
        :showInfo="false"
      ></PagingBtn>
    </div>
    <div
      class="filter-item pos-order-tables-filter-item"
      :class="{
        'only-small': isOnlyShowSmallClass
      }"
      v-if="!isShowCustomClass"
    >
      <Paging
        :data="smallClasses"
        :active.sync="activeSmallClass"
        :itemWidth="100"
        :itemHeight="36"
        :fix="1"
        :autoActive="false"
        id="smallClassesList"
        ref="smallClassesList"
      >
        <button
          type="button"
          slot-scope="props"
          :class="{ 'active': props.item.id === activeSmallClass.id }"
          @click="activeSmallClass = props.item"
        >{{ props.item.name }}</button>
      </Paging>
      <PagingBtn
        class="btn-height-48"
        ref="smallClassesFilterPager"
        :showInfo="false"
      ></PagingBtn>
    </div>
    <div class="filter-item pos-order-tables-filter-item only-small" v-show="isShowCustomClass">
      <Paging
        :data="customClasses"
        :active.sync="activeCustomClass"
        :itemWidth="100"
        :itemHeight="36"
        :fix="1"
        :autoActive="false"
        id="customClassesList"
        ref="customClassesList"
      >
        <button
          type="button"
          slot-scope="props"
          :class="{ 'active': props.item.id === activeCustomClass.id }"
          @click="activeCustomClass = props.item"
        >{{ props.item.name }}</button>
      </Paging>
      <PagingBtn
        ref="customClassesFilterPager"
        :showInfo="false"
      ></PagingBtn>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import {
  filter,
  concat,
  first,
} from 'lodash';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';

export default {
  components: { Paging, PagingBtn },
  data() {
    return {
      // 大类类型
      bigClassType: 1,
      // 小类类型
      smallClassType: 2,
      // bigClassTye
      customClassType: 3,
      // 选中的大类 ID
      activeBigClass: { id: '' },
      // 选中的小类 ID
      activeSmallClass: { id: '' },
      // 选中的自定义分类
      activeCustomClass: { id: '' },
    };
  },
  created() {
    this.$von('clearClassFilter', () => {
      if (this.isShowCustomClass) {
        this.choiceAllCustomClass();
      } else if (this.isOnlyShowSmallClass) {
        this.choiceAllSmallClass();
      } else {
        this.choiceAllBigClass();
      }
    });
    this.$von('fastMenuFilterPagerRefresh', () => {
      if (this.posItemCustomClasses && this.posItemCustomClasses.length) {
        this.$refs.customClassesList.refresh();
      } else {
        this.$refs.smallClassesList.refresh();
        if (!this.isOnlyShowSmallClass) {
          this.$refs.bigClassesList.refresh();
        }
      }
    });
  },
  mounted() {
    // 深拷贝小类以便筛选过滤
    this.$nextTick(() => {
      if (this.posItemCustomClasses && this.posItemCustomClasses.length) {
        this.$refs.customClassesFilterPager.bind(this.$refs.customClassesList);
      } else {
        this.$refs.smallClassesFilterPager.bind(this.$refs.smallClassesList);
        if (!this.isOnlyShowSmallClass) {
          this.$refs.bigClassesFilterPager.bind(this.$refs.bigClassesList);
        }
      }
    });
  },
  computed: {
    ...mapGetters([
      'posItemBigClasses',
      'posItemSmallClasses',
      'posSettings',
      'posItemCustomClasses',
    ]),
    isSmallClassOneLine() {
      return this.posSettings.isOnlyShowSmallClass && this.posSettings.isSingleLineDisplayForSmallClassAndCustomClass;
    },
    // 判断是否存在自定义分类
    isShowCustomClass() {
      return this.posItemCustomClasses && this.posItemCustomClasses.length;
    },
    // 判断是否只显示小类
    isOnlyShowSmallClass() {
      return this.posSettings.isOnlyShowSmallClass;
    },
    // 大类的数据整理
    bigClasses() {
      return concat({
        id: '',
        name: this.$t('Dict.AllBigclass'),
      }, this.posItemBigClasses);
    },
    // 小类的数据整理
    smallClasses() {
      const finded = this.activeBigClass.id === ''
        ? this.posItemSmallClasses
        : filter(this.posItemSmallClasses, {
          pid: this.activeBigClass.id,
        });
      return concat({
        id: '',
        name: this.$t('Dict.AllSubclass'),
      }, finded);
    },
    // 自定义类的数据整理
    customClasses() {
      return concat({
        id: '',
        name: this.$t('Dict.AllGrouped'),
      }, this.posItemCustomClasses);
    },
  },
  methods: {
    // 选择一个大类
    choiceBigClass(item) {
      this.activeBigClass = item;
      this.choiceAllSmallClass();
    },
    // 选择全部大类
    choiceAllBigClass() {
      this.$refs.bigClassesList.refresh();
      this.activeBigClass = first(this.bigClasses);
      this.choiceAllSmallClass();
    },
    // 选择全部小类
    choiceAllSmallClass() {
      this.$refs.smallClassesList.refresh();
      this.activeSmallClass = first(this.smallClasses);
    },
    // 选择全部分组--自定义类别
    choiceAllCustomClass() {
      this.$refs.customClassesList.refresh();
      this.activeCustomClass = first(this.customClasses);
    },
  },
  watch: {
    // 监听选中大类列表
    activeBigClass(value) {
      // 传出 changesBigClasses 事件
      this.$emit('changeBigClasses', value.id);
    },
    // 监听选中的小类列表
    activeSmallClass(value) {
      // 传出 changeSmallClasses 事件
      this.$emit('changeSmallClasses', value.id);
    },
    isShowCustomClass(data) {
      if (data) {
        this.$refs.customClassesList.refresh();
        this.$refs.customClassesFilterPager.bind(this.$refs.customClassesList);
      }
    },
    isOnlyShowSmallClass(data) {
      if (data) {
        this.$refs.smallClassesList.refresh();
      }
    },
    // 监听选中的小类列表
    activeCustomClass(value) {
      // 传出 changeSmallClasses 事件
      this.$emit('changeCustomClasses', value.id);
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@pos-order-menu-filter-padding-vertical: 4px;
//** height
@pos-order-menu-filter-item-height: 48px;
//** margin vertical
@pos-order-menu-filter-item-margin-vertical: 6px;
//** background color
@pos-order-menu-filter-item-bg: rgba(237, 254, 255, 0.5);
//== filter button
//** background color for active state
@pos-order-btn-filter-btn-active-bg: white;
//** width
@pos-order-menu-filter-btn-width: 100px;
//** small width
@pos-order-menu-filter-small-btn-width: 52px;
//** text color
@pos-order-menu-filter-btn-text-color: #273844;

//== filter pager
//** width
@pos-order-menu-filter-pager-width: 132px;
//** small width
@pos-order-menu-filter-small-pager-width: 82px;

.choice-all {
  position: absolute;
  top: 0;
  left: 0;
  .size(@pos-order-menu-filter-btn-width, @pos-order-menu-filter-item-height);
  background-color: @pos-order-menu-filter-item-bg;
  border-radius: @pos-order-menu-filter-item-height / 2 0 0
    @pos-order-menu-filter-item-height / 2;

  > button {
    .size(@pos-order-menu-filter-btn-width, @pos-order-menu-filter-item-height);
    color: @pos-order-menu-filter-btn-text-color;
    background: none;
    border-radius: @pos-order-menu-filter-item-height / 2;
    border: none;

    &.active {
      color: #0babb9;
      font-weight: bold;
      background-color: @pos-order-btn-filter-btn-active-bg;
    }
  }
}

.pos-order-menu-filter {
  position: absolute;
  top: 0;
  left: 0;
  .size(100%, @pos-order-menu-filter-height);
  padding-bottom: @pos-order-menu-filter-padding-vertical;

  .filter-item.only-small > .pos-pager > .pager-btn {
    height: 34px;

    &:first-child {
      margin-bottom: 2px;
    }
  }

  .filter-item {
    position: relative;
    height: @pos-order-menu-filter-item-height;
    margin-top: @pos-order-menu-filter-item-margin-vertical;
    padding-left: 0;
    padding-right: @pos-order-menu-filter-pager-width;

    &.only-small {
      height: @pos-order-menu-filter-item-height * 2;
      padding-left: 0;
      padding-right: @pos-order-menu-filter-small-pager-width;

      .choice-all,
      .choice-all > button {
        .size(@pos-order-menu-filter-small-btn-width, @pos-order-menu-filter-item-height * 2);
      }

      > .pos-pager {
        width: @pos-order-menu-filter-small-pager-width;
        padding-left: 12px;
      }
    }

    > ul {
      height: 100%;
      background-color: @pos-order-menu-filter-item-bg;
      border-radius: @pos-order-menu-filter-item-height / 2;
      overflow: hidden;

      > li {
        float: left;
        .size(@pos-order-menu-filter-btn-width, @pos-order-menu-filter-item-height);

        > button {
          display: block;
          float: left;
          .size(@pos-order-menu-filter-btn-width, @pos-order-menu-filter-item-height);
          line-height: @pos-order-menu-filter-item-height;
          text-align: center;
          color: @pos-order-menu-filter-btn-text-color;
          border-radius: @pos-order-menu-filter-item-height / 2;
          background: none;
          border: none;
          cursor: pointer;
          overflow: hidden;

          &.active {
            color: #0babb9;
            font-weight: bold;
            background-color: @pos-order-btn-filter-btn-active-bg;
          }
        }
      }
    }

    > .pos-pager {
      position: absolute;
      right: 0;
      top: 0;
    }
  }

  &.box_only_smallclass_oneLine {
    height: 58px;
    .filter-item {
      height: @pos-order-menu-filter-item-height;
      padding-right: 118px;
      > .pos-pager {
        width: 118px;
      }
    }
  }
  
}
</style>
