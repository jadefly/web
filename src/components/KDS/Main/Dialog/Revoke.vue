<template>
  <Dialog
    name="KDS.Revoke"
    :title="$t('Biz.KDS.RevokeDish')"
    ref="dialog"
    class="kds-dialog"
    width="600px"
    height="600px"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :submit-text="$t('Dict.Confirm')"
  >
    <div class="kds-revoke-wrap">
      <div class="kds-revoke-filter">
        <div class="kds-revoke-filter-btns">
          <button type="button" class="btn btn-default" @click="toggleFilter">
            <i class="icon icon-filter"></i>
            <span>{{$t('Biz.KDS.Filter')}}</span>
            <i class="icon icon-arr-down"></i>
          </button>
          <p v-if="activeFilter && activeFilter.length">
            <span>{{ activeFilter.join(',') }}</span>
            <button
              type="button"
              class="btn btn-default btn-revoke-filter-reset"
              @click="selectAllClasses"
            >{{ $t('Biz.Crm.Reset') }}</button>
          </p>
        </div>
        <div
          id="kdsRevokeFilterWrap"
          class="kds-revoke-filter-wrap"
          v-show="showFilter"
        >
          <div class="kds-revoke-filter-item">
            <div class="kds-revoke-filter-area">
              <button
                tpe="button"
                class="btn btn-default all"
                :class="{ 'btn-primary': activeBigClass === null }"
                @click="selectAllClasses"
              >{{$t('Dict.AllBigclass')}}</button>
              <Paging
                ref="bigClasses"
                class="kds-revoke-filter-list clearfix"
                :data="bigClasses"
                :itemWidth="123"
                :itemHeight="34"
              >
                <button
                  type="button"
                  class="btn btn-default"
                  slot-scope="props"
                  :class="{
                    'btn-primary': activeBigClass === props.item.id
                  }"
                  @click="selectBigClass(props.item.id)"
                >{{ props.item.name }}</button>
              </Paging>
            </div>
            <PagingBtn
              class="kds-revoke-pager"
              ref="bigClassesPaging"
            ></PagingBtn>
          </div>
          <div class="kds-revoke-filter-item">
            <div class="kds-revoke-filter-area">
              <button
                tpe="button"
                class="btn btn-default all"
                :class="{ 'btn-primary': activeSmallClass === null }"
                @click="activeSmallClass = null"
              >{{this.$t('Dict.AllSubclass')}}</button>
              <Paging
                ref="smallClasses"
                class="kds-revoke-filter-list clearfix"
                :data="filtedSmallClasses"
                :itemWidth="123"
                :itemHeight="34"
              >
                <button
                  type="button"
                  class="btn btn-default"
                  slot-scope="props"
                  :class="{
                    'btn-primary': activeSmallClass === props.item.id
                  }"
                  @click="activeSmallClass = props.item.id"
                >
                  {{ props.item.name }}
                </button>
              </Paging>
            </div>
            <PagingBtn
              class="kds-revoke-pager"
              ref="smallClassesPaging"
            ></PagingBtn>
            <div class="kds-revoke-pager"></div>
          </div>
          <div class="kds-revoke-filter-submit">
            <button
              type="button"
              class="btn btn-default btn-revoke-filter-reset"
              @click="selectAllClasses"
            >{{ $t('Biz.Crm.Reset') }}</button>
            <button type="button" class="btn btn-primary" @click="closeFilter">{{$t('Dict.Sure')}}</button>
          </div>
        </div>
      </div>
      <Paging
        class="kds-revoke-list"
        ref="kdsRevokeList"
        :data="list"
        :itemWidth="567"
        :itemHeight="79"
      >
        <div
          slot-scope="props"
          class="item"
          :class="{ 'checked': props.item.$checked }"
          @click="checkItem(props.item)"
        >
          <div class="c"></div>
          <div class="m">
            <div class="t">
              <div class="a">
                <h4>{{
                  props.item.itemName.length > 14
                    ? props.item.itemName.substring(0, 14) + '...'
                    : props.item.itemName
                }}{{
                  props.item.sizeId !== '-1'
                    ? '（' + props.item.sizeName + '）'
                    : ''
                  }}<i v-if="props.item.pkgFlg" class="icon-combo">{{$t('Dict.Package')}}</i></h4>
              </div>
            </div>
            <div class="b">
              <div class="l">
                <div class="n">
                  <ul v-if="props.item._methods && props.item._methods.length">
                    <li v-for="i in props.item._methods" :key="i">
                      {{ i }}
                    </li>
                    <li v-if="props.item._moreMethods" class="more">...</li>
                  </ul>
                </div>
                <div class="e">
                  {{ props.item._source }}: {{ props.item.$name }}
                  | {{$t('Biz.KDS.DishTime')}}：{{
                    props.item.createTimeForTimeStamp | dateFormat('%H:%I:%S')
                  }}</div>
              </div>
              <div v-if="props.item.remark" class="o remark-text">
                {{
                  props.item.remark.length > 23
                    ? props.item.remark.substring(0, 23) + '...'
                    : props.item.remark
                }}
              </div>
            </div>
          </div>
          <div class="i">
            <div class="r">
              <h4><i class="num">{{ props.item._num }}</i>{{ props.item.unitName }}</h4>
              <p>{{ props.item._time }}</p>
            </div>
          </div>
        </div>
      </Paging>
      <div class="kds-revoke-control">
        <Search
          ref="kdsRevokeSearch"
          class="pull-left"
          @search="onSearch"
          :resultLength="list.length"
        ></Search>
        <PagingBtn class="pull-right" :paging="$refs.kdsRevokeList"></PagingBtn>
      </div>
    </div>
  </Dialog>
</template>

<script>
import $ from 'jquery';
import { mapGetters, mapState } from 'vuex';
import {
  groupBy,
  each,
  map,
  extend,
  reduce,
  take,
  find,
  compact,
  filter,
  includes,
  without,
} from 'lodash';
import { add } from '@/common/js/math';
import ajax from '@/common/js/ajax';
import { excluded } from '@/common/js/dom';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import quickSearch from '@/common/js/quicksearch';
import dateFormat from '@/common/js/dateformat';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import Search from '@/components/Pos/More/LimitQuantity/LimitSearch';

export default {
  components: {
    Dialog, Paging, PagingBtn, Search,
  },
  mixins: [DialogMixin, dateFormatMixin],
  data() {
    return {
      itemBigClasseList: [],
      itemSmallClasseList: [],
      kitchenItemHisInfoList: [],
      showFilter: false,
      searchText: '',
      activeSmallClass: null,
      activeBigClass: null,
      checked: [],
    };
  },
  mounted() {
    $(window).click((event) => {
      excluded(event.target, '#kdsRevokeFilterWrap', this.closeFilter);
    });
  },
  computed: {
    ...mapState('order', ['currentMode']),
    ...mapGetters('KDS', ['mode']),
    groupCollection() {
      if (this.kitchenItemHisInfoList.length) {
        let attach = '';
        if (this.mode === '0') {
          attach = 'cookFinishTimeForTimeStamp';
        }
        if (this.mode === '1') {
          attach = 'serveFinishTimeForTimeStamp';
        }
        const grouped = groupBy(this.kitchenItemHisInfoList, item => [
          item.scId,
          attach ? item[attach] : '',
        ]);
        return map(grouped, (items, key) => {
          const num = reduce(items, (sum, n) => add(sum, n.lastQty), 0);
          const kscIdArr = reduce(items, (arr, n) => [...arr, n.kscId], []);
          const { methodText } = items[0];
          const methods = methodText ? methodText.split('|') : [];
          const { source, name } = this.getRegionInfo(items[0]);
          const checked = includes(this.checked, key);
          let time = null;
          if (this.mode === '0') {
            time = items[0].cookFinishTimeForTimeStamp;
          }
          if (this.mode === '1') {
            time = items[0].serveFinishTimeForTimeStamp;
          }
          return extend({}, items[0], {
            $key: key,
            _num: num,
            _kscIdArr: kscIdArr,
            _methods: take(methods, 3),
            _moreMethods: methods.length > 3,
            _source: source,
            $name: name,
            _time: time ? dateFormat('%H:%I:%S', time) : '',
            $checked: checked,
          });
        });
      }
      return [];
    },
    smallClasses() {
      const grouped = groupBy(this.groupCollection, 'smallClassId');
      return compact(map(
        grouped,
        (items, key) => find(this.itemSmallClasseList, { id: key }),
      ));
    },
    filtedSmallClasses() {
      if (this.activeBigClass) {
        return filter(this.smallClasses, item => item.pid === this.activeBigClass);
      }
      return this.smallClasses;
    },
    bigClasses() {
      const grouped = groupBy(this.smallClasses, 'pid');
      return compact(map(
        grouped,
        (items, key) => find(this.itemBigClasseList, { id: key }),
      ));
    },
    activeFilter() {
      const big = find(this.itemBigClasseList, { id: this.activeBigClass });
      const small = find(this.itemSmallClasseList, { id: this.activeSmallClass });
      return compact([
        big ? big.name : null,
        small ? small.name : null,
      ]);
    },
    list() {
      return filter(this.groupCollection, item => (
        this.checkClassFilter(item)
        && this.checkSearchText(item)
      ));
    },
    quickSearchText() {
      return quickSearch((`${this.searchText}`).toLowerCase());
    },
  },
  methods: {
    onOpen() {
      this.itemBigClasseList = this.resData.itemBigClasseList;
      this.itemSmallClasseList = this.resData.itemSmallClasseList;
      this.kitchenItemHisInfoList = this.resData.kitchenItemHisInfoList;
      this.checked = [];
    },
    onSearch(searchText) {
      this.$refs.kdsRevokeList.top();
      this.searchText = searchText;
      this.checked = [];
    },
    onClose() {
      this.kitchenItemHisInfoList = [];
      this.checked = [];
    },
    onSubmit() {
      const kcKscIdList = [];
      each(this.checked, (key) => {
        const finded = find(this.groupCollection, { $key: key });
        if (finded) {
          const { _kscIdArr } = finded;
          each(_kscIdArr, (kckscId) => {
            kcKscIdList.push(kckscId);
          });
        }
      });
      let url = '';
      console.info(this.mode)
      if (this.mode === '0') {
        url = 'canyin.kitchen.kitchenhis.updatewhencancelcook';
      } else if (this.mode === '1') {
        url = 'canyin.kitchen.kitchenhis.updatewhencancelserve';
      }
      ajax(url, {
        contentType: 'json',
        data: { kcKscIdList },
      }).then(() => {
        this.close();
      });
    },
    getRegionInfo(item) {
      let source = '';
      let name = '';
      if (item.pointAreaId === '9') {
        source = this.$t('Dict.OrderCode');
        name = item.orderCode ? item.orderCode : this.$t('Biz.KDS.NoInput');
      } else if (item.pointAreaId === '10') {
        source = item.deFromName;
        name = item.sn;
      } else {
        source = this.$t('Dict.Seat');
        name = item.pointName;
      }
      return { source, name };
    },
    checkItem(item) {
      if (item.$checked) {
        this.checked = without(this.checked, item.$key);
      } else {
        this.checked.push(item.$key);
      }
    },
    selectAllClasses() {
      this.activeSmallClass = null;
      this.$refs.bigClasses.top();
      this.activeBigClass = null;
      this.$refs.smallClasses.top();
    },
    selectBigClass(id) {
      this.activeSmallClass = null;
      this.$refs.smallClasses.top();
      this.activeBigClass = id;
    },
    checkClassFilter(item) {
      if (this.activeSmallClass) {
        return item.smallClassId === this.activeSmallClass;
      }
      if (this.activeBigClass) {
        return find(this.filtedSmallClasses, { id: item.smallClassId });
      }
      return true;
    },
    checkSearchText(item) {
      if (this.quickSearchText && this.quickSearchText.length) {
        let re = false;
        each(this.quickSearchText, (key) => {
          if (
            item.itemName.toLowerCase().indexOf(key) !== -1
            || item.itemPinyin.toLowerCase().indexOf(key) !== -1
            || item.$name.toLowerCase().indexOf(key) !== -1
          ) {
            re = true;
          }
        });
        return re;
      }
      return true;
    },
    openFilter() {
      setTimeout(() => {
        this.showFilter = true;
        this.$refs.bigClassesPaging.bind(this.$refs.bigClasses);
        this.$refs.smallClassesPaging.bind(this.$refs.smallClasses);
        this.$refs.bigClasses.refresh();
        this.$refs.smallClasses.refresh();
      }, 100);
    },
    closeFilter() {
      this.showFilter = false;
    },
    toggleFilter() {
      if (this.showFilter) {
        this.closeFilter();
      } else {
        this.openFilter();
      }
    },
  },
  watch: {
    activeFilter() {
      this.$refs.kdsRevokeSearch.clearSearchText();
      this.$refs.kdsRevokeList.top();
      this.checked = [];
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@base-border-color: #c8c8c8;

.kds-revoke {
  &-wrap {
    height: 100%;
    padding: 60px 15px 55px;
    position: relative;
    background-color: #fff;
  }
  &-control {
    position: absolute;
    bottom: 10px;
    left: 0;
    width: 100%;
    height: 36px;
    padding: 0 15px;
  }
  &-filter {
    position: absolute;
    top: 15px;
    left: 0;
    width: 100%;
    height: 44px;
    padding: 0 15px;
    border-bottom: 1px solid @base-border-color;

    &-btns {
      position: relative;
      height: 34px;
      padding-left: 110px;

      > button.btn {
        position: absolute;
        left: 0;
        top: 0;
        width: 100px;
        height: 34px;
        border: 1px solid #4281CA;
        color: #4281CA;

        .icon-filter {
          font-size: 12px;
        }
      }

      > p {
        position: relative;
        padding-right: 55px;
        margin-bottom: 0;
        text-align: right;

        span {
          font-weight: bold;
          display: block;
          height: 34px;
          line-height: 34px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;
        }

        .btn {
          position: absolute;
          right: 0;
          top: 0;
        }
      }
    }

    &-wrap {
      position: absolute;
      z-index: 10;
      left: 0;
      top: 37px;
      width: 477px;
      border: 1px solid #d8d8d8;
      border-radius: 5px;
      padding: 10px 20px;
      background-color: #fff;
    }

    &-item {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e5e5;
    }

    &-area {
      position: relative;
      padding-left: 70px;

      > button.all {
        position: absolute;
        left: 0;
        top: 0;
        width: 62px;
        height: 72px;
        white-space: normal;
      }
    }

    &-list {
      margin-left: -4px;
      margin-right: -4px;
      height: 76px;
      overflow: hidden;

      button {
        display: block;
        width: 100%;
        height: 34px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &-submit button {
      width: 100px;
    }
  }
  &-list {
    height: 100%;
    .item {
      cursor: pointer;
      position: relative;
      height: auto;
      border: 1px solid @base-border-color;
      border-radius: 5px;
      margin: 5px 3px 0 0;
      background-color: #fff;
      color: #666;
      padding: 0 100px 0 42px;
      > .c {
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        width: 42px;
        height: 100%;
        &:after {
          font-family: 'iconfont';
          font-size: 24px;
          line-height: 24px;
          color: #09aa91;
          position: absolute;
          content: '';
          display: block;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid @base-border-color;
          background-color: #fff;
          left: 50%;
          top: 50%;
          margin-left: -12px;
          margin-top: -12px;
        }
      }

      > .i {
        position: absolute;
        right: 10px;
        top: 0;
        width: 90px;
        text-align: right;
        font-size: 12px;
        height: 100%;
        padding: 10px 0;
        > .r {
          width: 100%;
          height: 100%;
          > h4 {
            font-size: 14px;
            font-weight: bold;
            color: #3871c4;
            text-align: center;
            height: 28px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            > i {
              font-style: normal;
              font-size: 26px;
              padding-right: 2px;
            }
          }
          > p {
            display: block;
            text-align: center;
            width: 100%;
            position: absolute;
            bottom: 6px;
            right: 0;
            margin-bottom: 0;
          }
        }
      }
      > .m {
        height: 100%;
        padding: 2px 0;
        > .b {
          overflow: hidden;
          margin-bottom: 2px;
          > .l, > .o {
            float: left;
          }
          > .l {
            width: 55%;
            > .e {
              font-size: 12px;
              height: 22px;
              line-height: 22px;
              white-space: nowrap;
              .point {
                font-weight: bold;
                font-size: 15px;
                color: #3871c4;
                vertical-align: middle;
              }

              i {
                font-size: 12px;
                margin-left: 3px;
                margin-right: 3px;
                color: #3871c4;
              }
            }
            > .n {
              height: 22px;
              overflow: hidden;
              ul {
                /*margin-left: 10px;*/
                padding-top: 0;
                > li {
                  display: inline-block;
                  height: 20px;
                  line-height: 18px;
                  margin: 1px 0;
                  font-size: 12px;
                  background-color: #fff;
                  color: #565656;
                  border: 1px solid #ddd;
                  padding: 0 6px;
                  border-radius: 0;
                }
              }
            }
          }
          > .o {
            width: 45%;
            border-left: 1px solid @base-border-color;
            height: 44px;
            overflow: hidden;
            padding-left: 8px;
            padding-right: 8px;
            word-break: break-all;
            line-height: 15px;
            font-size: 12px;
          }
        }
        > .t {
          height: auto;
          overflow: hidden;
          h4 {
            line-height: 22px;
            overflow: hidden;
            font-size: 14px;
            color: #3871c4;
            font-weight: bold;
            height: 22px;
          }
          .icon-combo {
            display: inline-block;
            background-color: #24af6e;
            color: #fff;
            font-size: 12px;
            height: 18px;
            line-height: 18px;
            vertical-align: super;
            margin: 0 0 0 5px;
            padding: 0 8px;
            border-radius: 10px;
            font-style: normal;
          }
        }
        > .e {
          line-height: 16px;
          font-size: 12px;
          .remark-text {
            width: 166px;
            display: inline-block;
            overflow: hidden;
            vertical-align: middle;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
      &.checked {
        > .c {
          &:after {
            content: '\e80f';
            border: none;
            background-color: transparent;
          }
        }
      }
    }
  }
  &-pager {
    text-align: right;
  }
}
</style>

<style lang="less">
.kds-revoke-filter-list li {
  float: left;
  width: 123px;
  padding-left: 4px;
  padding-right: 4px;
  margin-bottom: 4px;
}
</style>
