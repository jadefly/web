<template>
  <ScreenView class="dishes-screen-view">
    <FilterGroup slot="filter">
      <FilterItem
        v-if="!onlyShowSmallClass"
        v-model="activeBigClass"
        default-text="全部大类"
        direction="left"
        :list="bigClassList"
      ></FilterItem>
      <FilterItem
        v-model="activeSmallClass"
        default-text="全部小类"
        direction="right"
        :list="smallClassList"
        :filter-method="filterHandler"
      ></FilterItem>
    </FilterGroup>
    <Paging
      slot="list"
      ref="dishesScreen"
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
        @click.native="clickItem(item)"
      ></ScreenItem>
    </Paging>
    <RightBtn
      slot="right-btn"
      @filterList="clickBtn">
    </RightBtn>
    <div slot="footer" class="footer">
      <PagingBtn
        class="pager"
        :showInfo="true"
        ref="pagingBtn">
      </PagingBtn>
      <Search
        ref="search"
        class="search"
        :fixFull="true"
        :defaultKeyBoardPage="11"
        @search="filterList">
      </Search>
    </div>
  </ScreenView>
</template>

<script>
import {
  map, groupBy, first, each, find, reduce, filter, mapValues, size, sortBy, includes,
} from 'lodash';
import { mapGetters, mapMutations } from 'vuex';
import { add } from '@/common/js/math';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import Search from '@/components/Pos/Order/Tables/Search';
import quickSearch from '@/common/js/quicksearch';
import ScreenView from '../ScreenView/Index';
import ScreenItem from '../ScreenView/Item';
import FilterGroup from '../Filter/FilterGroup';
import FilterItem from '../Filter/Item';
import RightBtn from './RightBtn';

export default {
  components: {
    ScreenView, FilterGroup, ScreenItem, Paging, PagingBtn, FilterItem, RightBtn, Search,
  },
  data() {
    return {
      active: '',
      activeBigClass: '',
      activeSmallClass: '',
      searchText: '',
      hadInit: false,
    };
  },
  computed: {
    ...mapGetters('KDS', ['config', 'dishes', 'bigClasses', 'smallClasses', 'time', 'existingDishes']),
    list() {
      return mapValues(groupBy(this.dishes, (dish) => {
        const {
          itemId, sizeId, pkgFlg, tempItemName,
        } = dish;
        const tmpName = tempItemName || '';
        if (this.config.dishesFixed) {
          return [itemId, sizeId];
        }
        return [itemId, sizeId, pkgFlg, tmpName];
      }), (list, key) => {
        const {
          itemCode, itemName, sizeId, sizeName, pkgFlg,
          tempItemName, smallClassId, bigClassId, itemPinyin,
        } = first(list);
        const name = this.getName(itemName, sizeId, sizeName, tempItemName);
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
          smallClassId,
          bigClassId,
          pkgFlg,
          ssType,
          prepare,
          hasten,
          lastQty,
          coUnknowQty,
          code: itemCode,
          pinyin: itemPinyin,
          stateArr,
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
      if (this.config.dishesFixed) {
        list = this.fixedDishes;
      } else {
        ({ list } = this);
      }
      if (this.activeSmallClass !== '' || this.activeBigClass !== '') {
        return filter(list, (item) => {
          if (this.activeSmallClass !== '') {
            return item.smallClassId === this.activeSmallClass;
          }
          return item.bigClassId === this.activeBigClass;
        });
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
            const timer = this.time - callUpTimeTimeStamp;
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
    fixedDishes() {
      return map(this.existingDishes, (dish) => {
        const {
          itemId,
          sizeId,
          itemName,
          sizeName,
          smallClassId,
          bigClassId,
          itemCode,
          itemPinyin,
        } = dish;
        const key = `${itemId},${sizeId}`;
        const name = this.getName(itemName, sizeId, sizeName);
        let fromList = {
          lastQty: 0,
          coUnknowQty: 0,
        };
        if (this.list[key]) {
          fromList = this.list[key];
        }
        return {
          key,
          name,
          smallClassId,
          bigClassId,
          pkgFlg: 0,
          code: itemCode,
          pinyin: itemPinyin,
          ...fromList,
        };
      });
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
      if (this.config.dishesFixed) {
        return this.stated;
      }
      return sortBy(this.stated, this.mapSortHandler);
    },
    bigClassList() {
      const smallClassList = map(this.smallClassList, (item) => {
        const finded = find(this.smallClasses, { id: item.id });
        return {
          id: finded.pid,
          num: item.num,
        };
      });
      return map(groupBy(smallClassList, 'id'), (list, id) => ({
        id,
        name: find(this.bigClasses, { id }).name,
        num: reduce(list, (sum, n) => add(sum, n.num), 0),
      }));
    },
    smallClassList() {
      let list;
      if (this.config.dishesFixed) {
        list = this.fixedDishes;
      } else {
        ({ list } = this);
      }
      return map(groupBy(list, 'smallClassId'), (dishes, id) => {
        const finded = find(this.smallClasses, { id });
        let lastQty = 0;
        let coUnknowQty = 0;
        each(dishes, (item) => {
          lastQty = add(lastQty, item.lastQty);
          coUnknowQty = add(coUnknowQty, item.coUnknowQty);
        });
        return {
          id,
          name: finded.name,
          num: add(lastQty, coUnknowQty),
        };
      });
    },
    onlyShowSmallClass() {
      return this.config.onlyShowSmallClass || false;
    },
  },
  activated() {
    this.$refs.dishesScreen.refresh();
    this.changeActive(this.active);
  },
  mounted() {
    this.checkActive();
    this.$vonce('clearSearchText', () => {
      this.$refs.search.clearSearchText();
    });
    // 快捷键 Ctrl + 左右 翻页
    this.$von('turnPageLR', (key) => {
      if (key === 'left') {
        this.$refs.dishesScreen.prev();
      } else if (key === 'right') {
        this.$refs.dishesScreen.next();
      }
    });
    this.$refs.pagingBtn.bind(this.$refs.dishesScreen);
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
    activeBigClass() {
      this.activeSmallClass = '';
      this.$refs.dishesScreen.top();
      this.searchText = '';
      this.activeFirst();
    },
    activeSmallClass() {
      this.$refs.dishesScreen.top();
      this.searchText = '';
      this.activeFirst();
    },
    stated() {
      if (!this.hadInit) {
        this.initPage();
        this.hadInit = true;
      }
    },
  },
  methods: {
    ...mapMutations('KDS', {
      setScreenAction: 'SET_SCREEN_ACTION',
    }),
    initPage() {
      this.$refs.dishesScreen.refresh();
    },
    activeFirst() {
      if (this.config.dishesFixed || this.listSize === 0) {
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
    getName(itemName, sizeId, sizeName, tempItemName) {
      if (tempItemName) {
        return tempItemName;
      }
      if (sizeId !== '-1') {
        return `(${sizeName})${itemName}`;
      }
      return itemName;
    },
    filterHandler(smallItem) {
      if (this.activeBigClass === '') {
        return true;
      }
      const finded = find(this.smallClasses, { id: smallItem.id });
      return finded.pid === this.activeBigClass;
    },
    filterList(text) {
      // TODO 分页这个搞
      this.searchText = text;
      this.$refs.dishesScreen.top();
      this.activeFirst();
    },
    clickBtn(key) {
      this.$refs.search.addWordInBlur(key, true);
    },
    inputSearchText(key) {
      if (key === 'BackSpace') {
        this.$refs.search.delWordInBlur();
      } else {
        this.$refs.search.addWordInBlur(key);
      }
    },
    // 点击菜品
    clickItem(item) {
      // 置灰菜品不可点击
      if (add(item.lastQty, item.coUnknowQty) !== 0) {
        this.active = item.key;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.dishes-screen-view {
  .kds-screen {
    height: 100%;
    background-color: #FFFEFF;
  }
  .footer {
    padding: 6px;
    height: 50px;
    border-top: 1px solid #516686;

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
  .dishes-screen-view {
    .pos-order-tables-search {
      background-color: #1a3153 !important;
      color: #9ca7b7;
      input{
        color: #ffffff !important;
      }
      i{
        color: #9ca7b7;
      }
    }
    /*修改分页按钮样式*/
    .footer{
      .pos-pager{
        >span{
          color: #ffffff;
        }
        .pager-btn:disabled{
          background: #9ca7b7;
          i{
            color: #2a4163;
          }
        }
        .pager-btn{
          background: #749ddc;
          i{
            color: #ffffff;
          }
        }
      }
    }
  }
</style>
