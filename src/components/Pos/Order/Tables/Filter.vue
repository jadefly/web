<template>
  <div class="pos-order-tables-filter">
    <div class="pos-order-tables-filter-item">
      <ul>
        <li
          v-for="item in computedStates"
          :key="item.state"
          v-if="Number(item.count) || item.state === tableState.OCCUPY|| item.state === tableState.VACANCY || item.state === 0"
        >
          <button type="button" :class="{ 'active': item.state === activeState.state }" @click="activeState = item">
            <template v-if="item.state === 0">
              {{$t('Dict.All') + tables.length }}
            </template>
            <template v-if="item.state === tableState.VACANCY">
              <i class="vacancy"></i>
              {{ item.name}} {{ item.count }}
            </template>
            <template v-if="item.state === tableState.OCCUPY">
              <i class="occupy"></i>
              {{ item.name}} {{ item.count }}
            </template>
            <template v-if="item.state === tableState.BOOKING">
              <i class="booking"></i>
              {{ item.name}} {{ item.count }}
            </template>
            <template v-if="item.state === tableState.CHECK_BILL">
              <i class="check-bill"></i>
              {{ item.name}} {{ item.count }}
            </template>
            <template v-if="item.state === tableState.PRE_PAY">
              <i class="pre-pay"></i>
              {{ item.name}} {{ item.count }}
            </template>
            <template v-if="item.state === tableState.LOCK">
              <i class="lock"></i>
              {{ item.name}} {{ item.count }}
            </template>
            <!--清扫-->
            <template v-if="item.state === tableState.CLEAR">
              <i class="clear"></i>
              {{ item.name}} {{ item.count }}
            </template>
          </button>
        </li>
      </ul>
    </div>
    <div class="pos-order-tables-filter-item have-pager">
      <Paging
        :data="areas"
        :active.sync="activeArea"
        :itemWidth="100"
        :itemHeight="36"
        :fix="1"
        :autoActive="false"
        id="areasFilterList"
        ref="areasFilterList"
      >
        <button
          type="button"
          slot-scope="props"
          :class="{ 'active': props.item.id === activeArea.id }"
          @click="activeArea = props.item"
        >{{ props.item.name }}</button>
      </Paging>
      <PagingBtn
        class="btn-height-48"
        ref="areasFilterPager"
        :showInfo="false"
      ></PagingBtn>
    </div>
  </div>
</template>

<script>
import * as tableState from '@/common/dictionary/pos-order-table-state';
import {
  map,
  extend,
  countBy,
  concat,
  first,
} from 'lodash';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import { mapGetters } from 'vuex';

export default {
  components: { Paging, PagingBtn },
  props: {
    // 客位列表数据
    tables: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      aaa: 'aaa',
      // 客位状态数据词典
      tableState,
      // 客位列表
      states: [],
      activeArea: { id: '' },
      activeState: { state: 0 },
    };
  },
  created() {
    this.states = map([
      {
        name: this.$t('Dict.All'),
        state: 0,
      }, {
        name: this.$t('Dict.FreeState'),
        state: this.tableState.VACANCY,
      }, {
        name: this.$t('Dict.OccupySate'),
        state: this.tableState.OCCUPY,
      }, {
        name: this.$t('Dict.BookSate'),
        state: this.tableState.BOOKING,
      }, {
        name: this.$t('Dict.CheckBillSate'),
        state: this.tableState.CHECK_BILL,
      }, {
        name: this.$t('Dict.PrepayState'),
        state: this.tableState.PRE_PAY,
      }, {
        name: this.$t('Dict.LockState'),
        state: this.tableState.LOCK,
      }, {
        name: this.$t('Dict.ClearState'),
        state: this.tableState.CLEAR,
      },
    ], item => extend({
      count: 0,
      active: false,
      default: false,
    }, item));
    // 监听清空筛选
    // this.$von('resetOrderFilterArea', () => {
    //   this.choiceAllFilters();
    // });
    this.$von('refreshTableFlterPager', () => {
      if (this.$refs.areasFilterList) {
        this.$refs.areasFilterList.refresh();
      }
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.areasFilterPager.bind(this.$refs.areasFilterList);
    });
  },
  computed: {
    ...mapGetters(['posAreas']),
    // 区域列表
    areas() {
      return concat({
        id: '',
        name: this.$t('Dict.AllArea'),
      }, this.posAreas);
    },
    // 当前选中的区域
    countByStates() {
      return countBy(this.tables, 'state');
    },
    // 动态计算下客位状态的显示和数量
    computedStates() {
      const res = map(this.states, item => extend({}, item, {
        count: this.countByStates[item.state],
      }))
      return res;
    },
  },
  methods: {
    choiceAllFilters() {
      this.activeState = first(this.states);
      this.activeArea = first(this.areas);
    },
  },
  watch: {
    // 监听选中的区域列表
    activeArea(value) {
      // 传出 changeAreas 事件
      this.$emit('changeAreas', value.id);
    },
    // 监听选中的状态列表
    activeState(value) {
      this.$emit('changeStates', value.state);
    },
  },
};
</script>


<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// Component Pos/Order/Tables/Filter

//== padding vertical
@pos-order-tables-filter-padding-vertical: 4px;

.pos-order-tables-filter {
  position: absolute;
  top: 0;
  left: 0;
  .size(100%, @pos-order-tables-filter-height);
  padding-bottom: @pos-order-tables-filter-padding-vertical;
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

//== filter item

//** height
@pos-order-tables-filter-item-height: 48px;
//** margin vertical
@pos-order-tables-filter-item-margin-vertical: 6px;
//** background color
@pos-order-tables-filter-item-bg: rgba(237, 254, 255, 0.5);

//== filter button

//** background color for active state
@pos-order-tables-filter-btn-active-bg: rgb(255, 255, 255);
//** width
@pos-order-tables-filter-btn-width: 100px;
//** text color
@pos-order-tables-filter-btn-text-color: #273844;

//** filter button icon

//**** size
@pos-order-tables-filter-btn-icon-size: 12px;
//**** background color
@pos-order-tables-filter-btn-icon-bg: #51b063;
//**** background color for vacancy state
@pos-order-tables-filter-btn-icon-vacancy-bg: @pos-order-tables-filter-btn-icon-bg;
//**** box-shadow for vacancy state
@pos-order-tables-filter-btn-icon-vacancy-box-shadow: 1px 2px 3px
  rgba(88, 92, 145, 0.6);

//== filter pager

//** width
@pos-order-tables-filter-pager-width: 132px;

//== filter pager

//** pager button

//**** width
@pos-order-tables-filter-pager-btn-width: 60px;
//**** height
@pos-order-tables-filter-pager-btn-height: 36px;
//**** background color
@pos-order-tables-filter-pager-btn-bg: rgba(237, 254, 255, 0.5);

//** font size
@pos-order-tables-filter-pager-font-size: 25px;
//** font color for disabled state
@pos-order-tables-filter-pager-font-disabled-color: #999;

.pos-order-tables-filter-item > .pager > .pager-btn {
  .size(@pos-order-tables-filter-pager-btn-width, @pos-order-tables-filter-pager-btn-height);
  border-radius: @pos-order-tables-filter-pager-btn-height / 2;
  border: none;
  background-color: @pos-order-tables-filter-pager-btn-bg;
  color: #273844;

  > .icon {
    font-size: @pos-order-tables-filter-pager-font-size;
  }

  &[disabled] {
    color: @btn-disabled-color;
    cursor: not-allowed;
  }
}

.pos-order-tables-filter-item {
  position: relative;
  height: @pos-order-tables-filter-item-height;
  margin-top: @pos-order-tables-filter-item-margin-vertical;
  padding-left: 0;

  > ul {
    height: @pos-order-tables-filter-item-height;
    background-color: @pos-order-tables-filter-item-bg;
    border-radius: @pos-order-tables-filter-item-height / 2;
    overflow: hidden;

    > li {
      float: left;
      .size(@pos-order-tables-filter-btn-width, @pos-order-tables-filter-item-height);

      > button {
        .size(@pos-order-tables-filter-btn-width, @pos-order-tables-filter-item-height);
        line-height: @pos-order-tables-filter-item-height;
        text-align: center;
        color: @pos-order-tables-filter-btn-text-color;
        border-radius: @pos-order-tables-filter-item-height / 2;
        cursor: pointer;
        border: none;
        background: none;

        > i {
          display: inline-block;
          .square(@pos-order-tables-filter-btn-icon-size);
          vertical-align: middle;
          background-color: @pos-order-tables-filter-btn-icon-bg;

          &.vacancy {
            background-color: @pos-order-tables-filter-btn-icon-vacancy-bg;
          }

          &.occupy {
            background-color: @pos-order-table-state-occupy-color;
          }

          &.booking {
            background-color: @pos-order-table-state-booking-color;
          }

          &.check-bill {
            background-color: @pos-order-table-state-check-bill-color;
          }

          &.pre-pay {
            background-color: @pos-order-table-state-pre-pay-color;
          }

          &.lock {
            background-color: @pos-order-table-state-lock-color;
          }
          &.clear {
            background-color: @pos-order-table-state-clear-color;
          }
        }

        &.active {
          background-color: @pos-order-tables-filter-btn-active-bg;
          color: #0babb9;
          font-weight: bold;
        }
      }
    }
  }

  &.have-pager {
    padding-right: @pos-order-tables-filter-pager-width;
  }

  > .pos-pager {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
