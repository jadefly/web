<template>
  <div class="tables-list-wrapper">
    <!--是否是自助餐押金的关联客位开始-->
    <ul :id="teamTablesListId" v-autotest>
      <li v-for="(item, index) in points"
          @click="associatedSelectTables(item, index)"
          class="vacancy"
          v-show="!item.unShow"
          :class="item.checked ? 'active' : ''"
          :key="index">
        <i
          class="icon icon-duihao2"
          v-show="item.checked">
        </i>
        <strong class="name">{{ item.name }}</strong>
        <span class="people">
          <i class="icon icon-user"></i>
          {{ item.user }}
        </span>
      </li>
    </ul>
    <div class="tables-btns-footer">
      <Search @search="onSearch" ref="search" :searchId="teamTablesListId + 'Search'"></Search>
      <Pager :showInfo="true" :pagerId="teamTablesListId" ref="teamListPager"></Pager>
    </div>
  </div>
</template>

<script>
  import Pager from '@/components/Pos/Common/Pager';
  import Search from '@/components/Pos/Order/Tables/Search';
  import { mapGetters } from 'vuex';
  import {
    cloneDeep,
  } from 'lodash';

  export default {
    props: {
      isMultiSelect: {
        type: Boolean,
        default: false,
      },
      ordeInfo: {
        name: String,
        user: String,
        time: Date,
        money: Number,
        selected: Boolean,
        code: String,
      },
      teamTablesListId: {
        type: String,
        default: undefined,
      },
      // 自助押金模块当前押金单信息
      currentBuffetInfo: {
        type: Object,
        default: () => ({}),
      },
    },
    components: { Pager, Search },
    data() {
      return {
        selectedTable: '',
        searchText: '', // 快速查找内容
        currentAssociatedTableId: '',
      };
    },
    computed: {
      ...mapGetters([
        'posBooking',
      ]),
      points() {
        let filterList = [];
        // 客位快速查找 目前仅支持code，后期可能会增加拼音和其他
        filterList = this.ordeInfo.filter(list => {
          const lowerCasePinYin = list.pinyin.toLowerCase();
          const lowerCaseSearchText = this.searchText.toLowerCase();
          return list.code.indexOf(this.searchText) !== -1
            || lowerCasePinYin.indexOf(lowerCaseSearchText) !== -1;
        });
        // 客位快速查找
        filterList = this.ordeInfo.filter(list => (list.code.indexOf(this.searchText) != -1
          || list.pinyin.indexOf((this.searchText).toUpperCase()) != -1));
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
    methods: {
      /**
       *
       * 关联客位的相关方法开始
       *
       * */
      // 客位点击事件
      associatedSelectTables(item) {
        // 点击的是当前的 如果是选中状态，全部清空
        // 如果不是选中状态 判断是否有选中状态的 如果有清空，如果没有直接使选中
        if (item.checked) {
          this.ordeInfo.map(item => item.checked = false);
          this.$emit('selectedPointTable', '');
        } else if (this.ordeInfo.some(item => item.checked)) {
          this.ordeInfo.map(item => item.checked = false);
          item.checked = true;
          this.$emit('selectedPointTable', item);
        } else {
          item.checked = true;
          this.$emit('selectedPointTable', item);
        }
      },
      /**
       *
       * 关联客位的相关方法结束
       *
       * */
      clearSelectedTable() {
        this.selectedTable = '';
      },
      // 快速查找文本信息
      onSearch(text) {
        this.searchText = text;
        // 刷新分页、清空所选客位、所选客位信息
        this.refreshListPager();
        this.clearSelectedTable();
        this.$emit('clearSelectedTableInfo');
      },
      refreshListPager() {
        this.$refs.teamListPager.refresh();
      },
    },
  };
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .tables-list-wrapper {
    position: relative;
    height: 100%;
    background-color: white;

    > ul {
      height: 100%;
      .clearfix();
      overflow: hidden;

      > li {
        position: relative;
        float: left;
        .size(17.5%, 82px);

        margin-left: 14px;
        margin-top: 9px;
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
