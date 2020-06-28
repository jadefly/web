<template>
  <ScreenView class="tables-screen-view">
    <FilterGroup class="tables-filter-group" slot="filter">
      <FilterItem
        v-model="activeArea"
        default-text="全部区域"
        :list="areaList"
      ></FilterItem>
    </FilterGroup>
    <Paging
      slot="list"
      ref="tablesScreen"
      class="pos-order-menu-list-ul"
      :itemWidth="120"
      :itemHeight="72"
      :data="listView"
      :usePropSize="true"
      :itemStyle="{
        'position': 'relative',
        'padding': '4px 3px',
      }"
    >
      <ScreenItem
        slot-scope="{ item }"
        :item="item"
        :class="{'active': active === item.key}"
        @click.native="cancelOrder(item)"
      ></ScreenItem>
    </Paging>
    <div slot="footer" class="footer">
      <PagingBtn
        ref="pagingBtn"
        class="pager"
        arrowDirection="up-down"
        :showInfo="true"
        :paging="$refs.tablesScreen">
      </PagingBtn>
      <Search :defaultKeyBoardPage="5" ref="search" class="search" @search="filterList"></Search>
    </div>
  </ScreenView>
</template>

<script>
import {
  map, groupBy, first, each, find, filter, mapValues, size, concat, sortBy, includes,
} from 'lodash';
import { mapGetters, mapMutations } from 'vuex';
import ajax from '@/common/js/ajax';
import { add } from '@/common/js/math';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import Search from '@/components/Pos/Order/Tables/Search';
import quickSearch from '@/common/js/quicksearch';
import ScreenView from '../ScreenView/Index';
import ScreenItem from '../ScreenView/Item';
import FilterGroup from '../Filter/FilterGroup';
import FilterItem from '../Filter/Item';

export default {
  components: {
    ScreenView, FilterGroup, ScreenItem, Paging, PagingBtn, FilterItem, Search,
  },
  data() {
    return {
      active: '',
      activeArea: '',
      searchText: '',
    };
  },
  computed: {
    ...mapGetters('KDS', ['config', 'dishes', 'areas', 'time', 'existingTables']),
    list() {
      return mapValues(groupBy(this.dishes, (dish) => {
        const { pointAreaId: id, bsId, pointId } = dish;
        if (id === '9' || id === '10') {
          return [id, bsId];
        }
        return pointId;
      }), (list, key) => {
        const {
          pointPinyin, pointAreaId, peopleQty,
        } = first(list);
        const name = this.getName(first(list));
        const code = this.getCode(first(list));
        let ssType = false;
        let prepare = false;
        let hasten = false;
        let lastQty = 0;
        let coUnknowQty = 0;
        const kscIds = [];
        const stateArr = [];
        each(list, (item) => {
          kscIds.push(item.kscId);
          stateArr.push({
            callUpTimeTimeStamp: item.callUpTimeTimeStamp,
            createTimeForTimeStamp: item.createTimeForTimeStamp,
            firstHastenTimeStamp: item.firstHastenTimeStamp,
            standardTime: item.standardTime,
            warnTime: item.warnTime,
          });
          if (ssType === false && item.ssType === 2) {
            ssType = true;
          }
          if (
            prepare === false
            && (
              item.kitchenFlg === 0
              || item.kitchenFlg === 9
            )
          ) {
            prepare = true;
          }
          if (hasten === false && item.hastenFlg === 1) {
            hasten = true;
          }
          lastQty = add(lastQty, item.lastQty);
          coUnknowQty = add(coUnknowQty, item.coUnknowQty);
        });
        return {
          key,
          kscIds,
          name,
          pointAreaId,
          ssType,
          prepare,
          hasten,
          lastQty,
          coUnknowQty,
          code,
          pinyin: pointPinyin,
          stateArr,
          peopleQty,
        };
      });
    },
    listSize() {
      return size(this.list);
    },
    quickSearchArray() {
      return quickSearch(this.searchText.toLowerCase());
    },
    filtered() {
      let list;
      if (this.config.tablesFixed) {
        list = this.fixedTables;
      } else {
        ({ list } = this);
      }
      if (this.activeArea !== '') {
        return filter(list, item => item.pointAreaId === this.activeArea);
      }
      return list;
    },
    searchFilter() {
      if (this.searchText === '') {
        return this.filtered;
      }
      return filter(this.filtered, item => !!find(this.quickSearchArray, key => (
        includes(item.code.toLowerCase(), key)
        || includes(item.name.toLowerCase(), key)
        || includes(item.pinyin.toLowerCase(), key)
      )));
    },
    stated() {
      return map(this.searchFilter, (dishes) => {
        let timeout = false;
        let warn = false;
        let callUpTime = null;
        let createTime = null;
        let firstHastenTime = null;
        each(dishes.stateArr, (item) => {
          const {
            callUpTimeTimeStamp,
            createTimeForTimeStamp,
            firstHastenTimeStamp,
            standardTime,
            warnTime,
          } = item;
          if (dishes.kitchenFlg !== 0 && dishes.kitchenFlg !== 9) {
            const timer = this.time - createTimeForTimeStamp;
            if (!timeout && standardTime && timer > standardTime * 60 * 1000) {
              timeout = true;
            }
            if (!timeout && !warn && warnTime && timer > warnTime * 60 * 1000) {
              warn = true;
            }
          }
          if (!this.config.dishesFixed) {
            if (!callUpTime || callUpTimeTimeStamp < callUpTime) {
              callUpTime = callUpTimeTimeStamp;
            }
            if (createTime === null || createTimeForTimeStamp < createTime) {
              createTime = createTimeForTimeStamp;
            }
            if (!firstHastenTime || firstHastenTimeStamp < firstHastenTime) {
              firstHastenTime = firstHastenTimeStamp;
            }
          }
        });
        return {
          ...dishes,
          timeout,
          warn,
          callUpTime,
          createTime,
          firstHastenTime,
        };
      });
    },
    fixedTables() {
      const fixedTables = map(this.existingTables, (table) => {
        const {
          areaId, code, id, name, pinyin,
        } = table;
        let fromList = {
          lastQty: 0,
          coUnknowQty: 0,
        };
        if (this.list[id]) {
          fromList = this.list[id];
        }
        return {
          key: id,
          name,
          pointAreaId: areaId,
          code,
          pinyin,
          ...fromList,
        };
      });
      const unFixedTables = filter(this.list, table => table.pointAreaId === '9' || table.pointAreaId === '10');
      if (unFixedTables.length) {
        return concat(fixedTables, unFixedTables);
      }
      return fixedTables;
    },
    mapSortHandler() {
      const sortHandlerList = [];
      each(this.config.stateOrderList, (code) => {
        if (code === '001') {
          sortHandlerList.push(({ hasten }) => !hasten);
          sortHandlerList.push(({ firstHastenTime }) => firstHastenTime);
        }
        if (code === '002') {
          sortHandlerList.push(({ timeout }) => !timeout);
        }
        if (code === '003') {
          sortHandlerList.push(({ warn }) => !warn);
        }
        if (code === '004') {
          // Todo: 这个后台还没做，前台也不做了，等着吧
        }
        if (code === '005') {
          sortHandlerList.push(({ ssType }) => !ssType);
        }
      });
      sortHandlerList.push(({ callUpTime, createTime }) => (!callUpTime ? `1.${createTime}` : `0.${callUpTime}`));
      return sortHandlerList;
    },
    listView() {
      if (this.config.tablesFixed) {
        return this.stated;
      }
      return sortBy(this.stated, this.mapSortHandler);
    },
    areaList() {
      let list;
      if (this.config.tablesFixed) {
        list = this.fixedTables;
      } else {
        ({ list } = this);
      }
      return map(groupBy(list, 'pointAreaId'), (dishes, id) => {
        let lastQty = 0;
        let coUnknowQty = 0;
        each(dishes, (item) => {
          lastQty = add(lastQty, item.lastQty);
          coUnknowQty = add(coUnknowQty, item.coUnknowQty);
        });
        let name = '';
        if (id === '9') {
          name = '快餐';
        } else if (id === '10') {
          name = '外卖';
        } else {
          const finded = find(this.areas, { id });
          if (finded) {
            ({ name } = finded);
          } else {
            name = '未知区域';
          }
        }
        return {
          id,
          name,
          num: add(lastQty, coUnknowQty),
        };
      });
    },
  },
  activated() {
    this.$refs.tablesScreen.refresh();
    this.changeActive(this.active);
  },
  mounted() {
    this.checkActive();
    this.$vonce('clearSearchText', () => {
      this.$refs.search.clearSearchText();
    });
    this.$refs.pagingBtn.bind(this.$refs.tablesScreen);
  },
  watch: {
    list() {
      if (this.active) {
        const finded = this.list[this.active];
        if (finded) {
          this.setScreenAction(finded.kscIds);
        } else {
          this.activeFirst();
        }
      } else {
        this.checkActive();
      }
    },
    active(key) {
      this.changeActive(key);
    },
    activeArea() {
      this.$refs.tablesScreen.top();
      this.searchText = '';
      this.activeFirst();
    },
  },
  methods: {
    ...mapMutations('KDS', {
      setScreenAction: 'SET_SCREEN_ACTION',
    }),
    // 选中状态下再次点击执行退菜
    cancelOrder(item) {
      if (this.active !== item.key && add(item.lastQty, item.coUnknowQty) !== 0) {
        this.active = item.key;
        return;
      }
      const kcKscIdList = [];
      if (!item.kscIds || item.kscIds.length === 0) return;
      item.kscIds.forEach((key) => {
        if (this.dishes[key].coUnknowQty > 0) {
          kcKscIdList.push(key);
        }
      });
      if (kcKscIdList.length === 0) return;
      ajax('canyin.kitchen.kitchencancelorder.updatewhenknowcancelorder', {
        contentType: 'json',
        data: { kcKscIdList },
      }).then(() => {
        // 把对应菜品coUnknowQty清零，当lastQty为0时删除这个道菜
        kcKscIdList.forEach((id) => {
          const obj = this.dishes[id];
          obj.coUnknowQty = 0;
          if (obj.lastQty === 0) {
            delete this.dishes[id];
          }
        });
      });
    },
    activeFirst() {
      if (this.config.tablesFixed || this.listSize === 0) {
        this.active = '';
      } else {
        const one = first(this.listView);
        this.active = one ? one.key : '';
      }
    },
    checkActive() {
      if (this.listSize && this.active === '') {
        this.activeFirst();
      }
    },
    changeActive(key) {
      let kscIds = [];
      if (key) {
        const finded = this.list[key];
        if (finded) {
          ({ kscIds } = finded);
        }
      }
      this.setScreenAction(kscIds);
    },
    getName(data) {
      let str = '';
      if (!data) return str;
      if (data.pointAreaId === '9') {
        str = `${this.getSaleTypeText(data.saleTypeId)}：${data.orderCode}`;
      } else if (data.pointAreaId === '10') {
        str = `${data.deFromName}：${data.sn}`;
      } else {
        str = data.pointName;
      }
      return str;
    },
    getCode(data) {
      let str = '';
      if (!data) return str;
      const {
        pointAreaId, pointCode, orderCode, sn,
      } = data;
      if (pointAreaId === '9') {
        str = `${orderCode}`;
      } else if (pointAreaId === '10') {
        str = `${sn}`;
      } else {
        str = pointCode;
      }
      return str;
    },
    getSaleTypeText(type) {
      if (type === 3) {
        return '外卖';
      }
      if (type === 2) {
        return '外带';
      }
      return '牌号';
    },
    filterHandler(smallItem) {
      if (this.activeBigClass === '') {
        return true;
      }
      const finded = find(this.smallClasses, { id: smallItem.id });
      return finded.pid === this.activeBigClass;
    },
    filterList(text) {
      this.searchText = text;
      this.$refs.tablesScreen.top();
      this.activeFirst();
    },
    inputSearchText(key) {
      if (key === 'BackSpace') {
        this.$refs.search.delWordInBlur();
      } else {
        this.$refs.search.addWordInBlur(key);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.tables-screen-view {
  .kds-screen {
    height: 100%;
    background-color: #FFFEFF;
  }

  .pos-order-menu-list-ul {
    width: 100%;
    height: 100%;
    margin-left: 2px / -2;
    margin-right: 2px / -2;
    transition: transform .2s;
  }

  .list {
    height: 500px;
  }

  .footer {
    padding: 6px;
    height: 60px;
    border-top: 1px solid #C0C0C0;

    .pager {
      float: left;
      margin: 0;
    }

    .search {
      float: right;
    }
  }
}
</style>
<style lang="less">
  .tables-screen-view {
    .top {
      padding-right: 0 !important;
    }
    .pos-order-tables-search {
      border: 1px solid #C0C0C0 !important;
      background-color: #F1F1F1 !important;
    }
  }
</style>
