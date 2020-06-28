<template>
  <div class="common-tables-list-wrapper">
    <Paging
      v-if="!isMultiSelect"
      :data="points"
      :active.sync="activePoint"
      :itemWidth="123"
      :itemHeight="82"
      class="table-list"
      ref="commonTableList"
      v-autotest
    >
      <div slot-scope="props"
        @click="selectTables(props.item)"
        :class="['table-btn', { active: selectedTable.id === props.item.id || activePoint.id === props.item.id  },
        { vacancy: props.item.state === tableState.VACANCY },
        { opcupy: props.item.state === tableState.OCCUPY },
        { booking: props.item.state === tableState.BOOKING }]"
      >
        <i class="icon icon-duihao2" v-show="props.item.id === selectedTable.id"></i>
        <strong class="name">{{ props.item.name }}</strong>
        <span class="people"><i class="icon icon-user"></i>{{ props.item.user }}</span>
        <span class="time" v-if="props.item.openTimeStr">
          <i class="icon icon-clock"></i>{{ props.item.openTimeStr }}
        </span>
        <span class="time" v-else-if="props.item.reserveDate">
          <i class="icon icon-clock"></i>{{ props.item.reserveDate }}
        </span>
        <span class="money" v-if="props.item.money"> {{ props.item.money }}</span>
      </div>
    </Paging>
    <!-- <ul  :id="teamTablesListId" v-autotest>
      <li v-for="(item, index) in points" :key="index">

      </li>
    </ul> -->
    <ul v-else :id="teamTablesListId" v-autotest class="table-list">
      <li v-for="(item, index) in points" :key="index">
        <div
          @click="multiSelectTables(item)"
          v-show="!item.unShow"
          :class="['table-btn', { active: item.selected === true },
          {vacancy: item.state === tableState.VACANCY },
          { opcupy: item.state === tableState.OCCUPY },
          { booking: item.state === tableState.BOOKING }]"
        >
          <i class="icon icon-duihao2" v-show="item.selected === true"></i>
          <strong class="name">{{ item.name }}</strong>
          <span class="people"><i class="icon icon-user"></i>{{ item.user }}</span>
        </div>
      </li>
    </ul>
    <div class="tables-btns-footer">
      <Search @search="onSearch" ref="search" :searchId="teamTablesListId + 'Search'"></Search>
      <Pager
        v-if="isMultiSelect"
        :showInfo="true"
        :pagerId="teamTablesListId"
        ref="teamListPager"
      ></Pager>
      <PagingBtn
        v-if="!isMultiSelect"
        :showInfo="true"
        arrowDirection="left-right"
        class="common-table-list-pager"
        ref="commonTablesListPager"
      ></PagingBtn>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  cloneDeep,
} from 'lodash';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import Pager from '@/components/Pos/Common/Pager';
import Search from '@/components/Pos/Order/Tables/Search';
import * as tableState from '@/common/dictionary/pos-order-table-state';
import * as tableDictionary from '@/common/dictionary/pos-order-table-dictionary';
import dateFormat from '@/common/js/dateformat';

export default {
  props: {
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
    ordeInfo: {
      type: Array,
      default: () => [],
    },
    teamTablesListId: {
      type: String,
      default: undefined,
    },
  },
  components: {
    Pager, Search, PagingBtn, Paging,
  },
  data() {
    return {
      selectedTable: {},
      searchText: '', // 快速查找内容
      tableState,
      tableDictionary,
      currentAssociatedTableId: '',
      activePoint: null,
    };
  },
  computed: {
    ...mapGetters([
      'posBooking',
    ]),
    points() {
      let filterList = [];
      // 修改客位状态为预订客位 格式化时间
      this.ordeInfo.forEach((table) => {
        const reservePoint = this.posBooking.reservePointMap[table.id];
        if (table.state === tableState.BOOKING) {
          table.state = 1;
        }
        if (this.posBooking && reservePoint && table.state != 2) {
          // 修改客位状态为预订状态
          if (!table.bsId) {
            table.state = tableState.BOOKING;
          }
          // 格式化预定时间
          table.reserveDate = dateFormat('%H:%I', Date.parse(reservePoint.reserveDate));
        }
        if (table[tableDictionary.OPENTIME]) {
          // 格式化开台时间
          table.openTimeStr = dateFormat('%H:%I', Date.parse(table[tableDictionary.OPENTIME]));
        }
      });
      // 客位快速查找
      filterList = this.ordeInfo.filter(list => (
        list.code.indexOf(this.searchText) != -1
          || list.pinyin.indexOf((this.searchText).toUpperCase()) != -1
      )
        && !list.unShow);
      if (filterList.length > 0) {
        this.activePoint = filterList[0];
      }
      return filterList;
    },
  },
  created() {
    this.$von('clearSearch', () => {
      if (this.$refs.search) {
        this.$refs.search.clearSearchText();
      }
    });
  },
  mounted() {
    if (this.$refs.commonTablesListPager) {
      this.$refs.commonTablesListPager.bind(this.$refs.commonTableList);
    }
  },
  methods: {
    selectTableDir(dir) {
      if (this.$refs.commonTableList) {
        this.$refs.commonTableList.select(dir);
      }
    },
    enterHotKeyProccess() {
      if (this.activePoint) {
        this.selectTables(this.activePoint);
      }
    },
    selectTables(item) {
      // 预订客位进行换台进行提示后直接进行换台
      if (item.state === this.tableState.BOOKING) {
        this.$confirm(this.$t('Biz.Order.LongMsg006'), this.$t('Dict.Tips'), {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        }).then(() => {
          this.selectedTable = item;
          this.activePoint = item;
          this.$emit('selectedPointTable', item);
        }).catch(() => {
          console.log('预订客位 取消换台');
        });
      } else {
        // 空闲客位进行换台
        this.selectedTable = item;
        this.activePoint = item;
        this.$emit('selectedPointTable', item);
      }
    },
    multiSelectTables(item) {
      this.$set(item, 'selected', !item.selected);
      this.$emit('multiSelectTables', item);
    },
    clearSelectedTable() {
      this.selectedTable = {};
    },
    // 快速查找文本信息
    onSearch(text) {
      this.searchText = text;
      this.refreshListPager();
    },
    addWordInBlur(key) {
      this.$refs.search.addWordInBlur(key);
    },
    delWordInBlur() {
      this.$refs.search.delWordInBlur();
    },
    refreshListPager() {
      const { teamListPager, commonTableList } = this.$refs;
      if (teamListPager) {
        teamListPager.refresh();
      }
      if (commonTableList) {
        commonTableList.refresh();
      }
    },
  },
};
</script>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.common-tables-list-wrapper {
  position: relative;
  height: 100%;
  background-color: white;

  > .table-list {
    height: 100%;
    .clearfix();
    overflow: hidden;
    > li {
      position: relative;
      float: left;
      .size(17.5%, 82px);
      margin-left: 14px;
      margin-top: 9px;
      .table-btn {
        .size(100%, 100%);
        padding: 6px;
        cursor: pointer;

        &.opcupy {
          border: 1px solid rgb(255, 135, 135);
          background-color: rgb(255, 225, 225);
          &.active {
            background-color: rgba(255, 0, 0, 0.2);
          }
        }

        &.vacancy {
          border: 1px solid #ccc;
          background-color: white;

          &.active {
            background-color: #eee;
          }
        }

        &.booking {
          border: 1px solid #33ffff;
          background-color: #66ffff;

          &.active {
            background-color: #33ffff;
          }
        }

        > i {
          position: absolute;
          top: -8px;
          right: -6px;
          color: rgb(242, 79, 100);
          font-size: 20px;
        }

        > .name {
          display: block;
          font-weight: normal;
          font-size: 16px;
          .text-overflow();
        }

        > .people {
          display: block;
          font-size: 12px;
          line-height: 1;
          color: rgb(153, 153, 153);
        }

        > .time,
        .money {
          font-size: 12px;
        }

        > .time {
          position: absolute;
          left: 0;
          bottom: 0;
          padding-left: 6px;
        }

        > .money {
          position: absolute;
          right: 0;
          bottom: 0;
          padding-right: 6px;
        }
      }
    }
  }
}
</style>


<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.tables-btns-footer {
  position: absolute;
  left: 0;
  bottom: 0;
  .size(100%, 58px);
  background-color: white;
  border-top: 1px solid rgb(181, 181, 181);

  .pos-order-tables-search {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgb(245, 245, 245);
    border: 1px solid rgb(181, 181, 181);
    margin-top: 10px;
    margin-left: 16px;
   input {
     color: #333;
   }
  }

  .pos-pager {
    position: absolute;
    top: 0;
    right: 0;
    margin-top: 10px;
    margin-right: 18px;

    > .pager-btn {
      background-color: white;
    }
  }


}
</style>
