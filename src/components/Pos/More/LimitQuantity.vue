<template>
  <Dialog
    name="PosDialog.LimitQuantity"
    :title="$t('Dict.Limit')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :fullscreen="true"
    :hotkeys="hotKeySet"
    width="100%"
    submitId="limitQuantitySubmit"
  >
    <template slot="other-button">
      <button
        type="button"
        id="promotion-limit-show"
        class="btn btn-default top-button topButton"
        v-autotest
        @click="showPromotionLimit"
      >查看促销限量</button>
    </template>
    <div class="limitQuantity">
      <div style="position: absolute; height: 100%;z-index:100">
        <div class="limitItem"> <!-- 品项 -->
          <div class="ItemLimit-msg">
            <ul class="df">
              <li class="ItemLimit-name borR">{{$t('Dict.Item')}}</li>
              <li class="ItemLimit-type borR pl10">{{$t('Biz.Pos.More.LimitQTh2')}}</li>
              <li class="ItemLimit-count borR pl10">{{$t('Biz.Pos.More.LimitQTh3')}}</li>
              <li class="ItemLimit-count borR pl10">{{$t('Biz.Pos.More.LimitQTh5')}}</li>
              <li class="ItemLimit-count borR pl10">{{$t('Biz.Pos.More.LimitQTh4')}}</li>
              <li
                class="ItemLimit-delete pl10"
                id="deleteLimitQuantityItem"
                v-autotest
              >{{$t('Dict.Btn.DeleteItem')}}</li>
            </ul>
          </div>
          <div class="ItemLimit-list">
            <ul class="ItemLimit-list-ul" id="ItemLimitUl">
              <li
                class="ItemLimit-list-ul-li df"
                v-for="(items, key) in itemLimitList"
                :key="key"
                :class="{ 'disabled': items.isKvs }"
                @click="changeLimitNum(items)"
              >
                <div class="ItemLimit-li-id fw">{{ key+1 }}</div>
                <div class="ItemLimit-li-name fw textEllipsis">
                  <span
                    v-show="items.sizeName && items.sizeName !== '-'"
                  >({{ items.sizeName }})</span>{{ items.itemName }}
                </div>
                <div class="ItemLimit-li-type pl10 center">
                  {{ items.type == 1
                      ? $t('Biz.Pos.ShiftNow')
                      : items.type==2
                        ? $t('Biz.Pos.More.ISellOutChildBtn1')
                        : $t('Biz.Pos.More.ISellOutChildBtn3')
                  }}
                </div>
                <div class="ItemLimit-li-count pl10 center">
                  {{ items.isAutoRestore ? '√' : '' }}
                </div>
                <div class="ItemLimit-li-count pl10 center">
                  {{ items.limitQuantity }}
                </div>
                <div class="ItemLimit-li-count pl10 center">
                  {{ items.restQuantity }}
                </div>
                <div
                  class="ItemLimit-li-delete pl10 center"
                  @click.stop.prevent="limitDelete(items)"
                ></div>
              </li>
            </ul>
          </div>
          <div class="ItemLimit-list-pager">
            <button
              type="button"
              class="btn btn-default async-btn"
              @click="asyncData"
            >{{$t('Biz.Pos.More.ISellOutBtn2')}}</button>
            <span>{{$t('Dict.Altogether')}}{{itemLimitList.length}}{{$t('Dict.Strip')}}，</span>
            <Pager
              pagerId="ItemLimitUl"
              itemTag="li"
              :showInfo = "true"
              arrowDirection="up-down"
              ref="selectLimitPager"
            >
            </Pager>
          </div>
        </div>
      </div>
      <div class="module-bill-ItemLimit">
        <LimitQuantityKind
          ulId="Limit"
          ref="limitQuantityKind"
          :itemsBigClass="itemsBigClass"
          :itemsSmallClass="itemsSmallClass"
          @bigClassLi="bigClassLi"
        ></LimitQuantityKind>
        <div class="ItemLimit-all-items-box">
          <div class="all-items">
            <Paging
              :data="points"
              :itemWidth="160"
              :itemHeight="100"
              :autoActive="false"
              :active.sync="activeItem"
              :activeFindRules="['size_id', 'id']"
              class="all-limit-items"
              ref="itemLimitList"
              id="itemLimitList">
              <div slot-scope="props"
                :id="'itemsLimit' + props.item.id + props.item.sizeId"
                :disabled="props.item.selloutId?true : false"
                class="item"
                :class="{
                  'itemsLimitOutbox': props.item.selloutId,
                  'active': activeItem
                            && props.item.id === activeItem.id
                            && props.item.size_id === activeItem.size_id,
                  'disabled': props.item.isKvs,
                }"
                @click="itemsLimit(props.item)">
                <div>
                  <span class="itemId">{{props.item.code}}</span>
                  <span
                    class="limitTip"
                    :id="'span' + props.item.id+props.item.sizeId"
                    v-if="props.item.selloutId"
                  >{{ $t('Dict.LimitNum', [parseFloat(props.item.restQuantity)]) }}</span>
                </div>
                <div class="name">
                  <span v-show="props.item.size_name && props.item.size_name != '-'">
                    ({{ props.item.size_name }})
                  </span>{{props.item.name}}</div>
                <div class="itemPrice text-right">
                  <span>{{props.item.price}}/{{props.item.unitName}}</span>
                </div>
              </div>
            </Paging>
          </div>
        </div>
        <div class="ItemLimit-btns-footer">
          <div class="borT">
            <Search
              @search="onSearch"
              ref="searchTextLimit"
              :resultLength="points.length"
            ></Search>
            <span>{{$t('Dict.Altogether')}}{{points.length}}{{$t('Dict.Strip')}}，</span>
            <PagingBtn
              ref="itemLimitPagingBtn"
              :showInfo="true">
            </PagingBtn>
          </div>
        </div>
      </div>
    </div>
    <LimitQuantityChildDialog
      ref="LimitQuantityChildDialog"
      @sellOutBtn="sellOutBtn"
      @submitChildDialog="submitChildDialog"
      type="set"
      :source="source"
    ></LimitQuantityChildDialog>
    <LimitQuantityChildDialog
      ref="changeLimitQuantityChildDialog"
      @sellOutBtn="sellOutBtn"
      @submitChildDialog="changeSubmitChildDialog"
      @cancelLimit="cancelLimit"
      type="change"
      :source="source"
    ></LimitQuantityChildDialog>
    <PromotionLimit
      ref="promotionLimit"
    ></PromotionLimit>
  </Dialog>
</template>

<script>
import { MessageBox } from 'element-ui';
import { mapGetters, mapMutations } from 'vuex';
import { find } from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Paging from '@/components/Pos/Common/Paging';
import Pager from '@/components/Pos/Common/Pager';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import quickSearch from '@/common/js/quicksearch';
import LimitQuantityKind from './LimitQuantity/LimitQuantityKind';
import Search from './LimitQuantity/LimitSearch';
import LimitQuantityChildDialog from './LimitQuantityChildDialog';
import PromotionLimit from './PromotionLimit';

export default {
  components: {
    Dialog,
    Pager,
    Paging,
    PagingBtn,
    LimitQuantityKind,
    Search,
    LimitQuantityChildDialog,
    PromotionLimit,
  },
  mixins: [DialogMixin],
  props: {
    limitData: {
      type: Object,
      default: () => {},
    },
    source: {
      type: String,
      default: '', // kds为厨房过来
    },
  },
  data() {
    return {
      searchText: '', // 搜索文本
      isSelect: 2, // 默认选中时间为：当前
      sitemsCount: 0, // 可售数量
      sitemsCountLimit: 0, // 限售數量
      disNone: true,
      itemsName: '', // 暂存选中菜名，供小弹窗使用
      /** ********** */
      isAllBig: true, // 是否选中全部大类，是：全部小类name全部展示，否：展示对应大类下的小类name
      selectedBigClass: '', // 选中大类的id
      isAllSmall: true, // 是否选中全部小类，是：全部小类品项全部展示，否：展示对应大类下的小类下的品项
      selectedSmallClass: '', // 选中小类的id
      itemLimitList: [], // 已选限量列表
      itemsBigClass: [], // 所有大类
      itemsSmallClass: [], // 所有小类
      allItems: [], // 所有菜品
      itemLimitListMsg: {}, // 暂时存储小弹窗确认/关闭前的估清信息
      changeItemLimit: {}, // 暂存限量的信息
      newSelloutIds: [], // 新增的估清品项
      deleteSelloutIds: [], // 删除的已估清品项
      activeItem: null, // 选中的品项
      isAsyncData: false, // 是否同步限量到线上
      bDown_submit: false,
    };
  },
  computed: {
    quickSearchText() {
      return quickSearch((`${this.searchText}`).toLowerCase());
    },
    // 菜品快速查找
    points() {
      let filterList = [];
      if (this.allItems) {
        filterList = this.allItems.filter((list) => {
          // 输入英文匹配 pinyin, 输入数字匹配code
          const keyFilters = this.quickSearchText;
          let resultItem;
          for (let i = 0; i < keyFilters.length; i += 1) {
            const key = keyFilters[i];
            if (
              String(list.code).toLowerCase().indexOf(key) !== -1
              || list.pinyin.toLowerCase().indexOf(key) !== -1
              || list.name.toLowerCase().indexOf(key) !== -1
            ) {
              resultItem = true;
            }
          }
          return (!keyFilters.length || resultItem)
           && (this.isAllBig || list.itemBigClassId === this.selectedBigClass)
           && (this.isAllSmall || list.itemSmallClassId === this.selectedSmallClass);
        });
        // 按照eslint规则，此处只能这么写，否则报错╮(╯▽╰)╭ 183-2051 by L.R
        if (filterList.length > 0) [this.activeItem] = filterList;
        return filterList;
      }
      return [];
    },
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        '↑': () => {
          this.$refs.itemLimitList.select('↑');
        },
        '↓': () => {
          this.$refs.itemLimitList.select('↓');
        },
        '←': () => {
          this.$refs.itemLimitList.select('←');
        },
        '→': () => {
          this.$refs.itemLimitList.select('→');
        },
        Enter: () => {
          this.itemsLimit(this.activeItem);
        },
        BackSpace: () => {
          this.$refs.searchTextLimit.delWordInBlur();
        },
        ...this.setKeySearchHotKey(),
      };
    },
    ...mapGetters(['posSettings']),
  },
  methods: {
    ...mapMutations('fastFood', ['setIsLimitOrSellout']),
    // 查看促销限量展示界面
    showPromotionLimit() {
      ajax('canyin.pos.itemLimit.promoteLimit', {
        params: {},
      }).then((data) => {
        this.$refs.promotionLimit.open(data);
      });
    },
    // 同步线上数据
    asyncData() {
      if (this.isAsyncData) {
        return;
      }
      this.isAsyncData = true;
      this.onSubmit();
    },
    itemsLimit(item) { // 唤起限量规格弹窗
      this.isSelect = 2;
      this.sitemsCount = 0; // 恢复默认
      this.sitemsCountLimit = 0;
      if (item.selloutId) { // 只单纯判断是否估清，已估清，删除对应估清品项
        const finded = find(this.itemLimitList, {
          itemId: item.id,
          sizeId: item.itemSizeId,
        });
        if (finded) {
          this.changeLimitNum(finded);
        }
      } else { // 没有估清，弹窗，选择时长
        this.itemsName = item.name;
        this.disNone = false;
        // item.index = index;
        this.itemLimitListMsg = item;
        this.$refs.LimitQuantityChildDialog.open(item);
      }
    },
    bigClassLi(isShowItems) { // 大类小类，全部
      this.isAllBig = isShowItems.isAllBig;
      this.selectedBigClass = isShowItems.selectedBigClass;
      this.isAllSmall = isShowItems.isAllSmall;
      this.selectedSmallClass = isShowItems.selectedSmallClass;
      // this.$refs.filterPager.refresh();
      this.$refs.itemLimitList.refresh();
    },
    changeLimitNum(item) {
      this.changeItemLimit = item;
      this.$refs.changeLimitQuantityChildDialog.open({
        name: item.itemName,
        size_name: item.sizeName,
        restQuantity: item.restQuantity,
        limitQuantity: item.limitQuantity,
        isSelect: item.type,
        isAutoRestore: item.isAutoRestore,
        isTakeoutLimit: item.isTakeoutLimit, // 外卖限量上下架开关
        autoLowerQuantity: item.autoLowerQuantity,
        autoUpperQuantity: item.autoUpperQuantity,
        takeawayPlatformIdList: item.takeawayPlatformIdList,
      });
    },
    onOpen() { // 打开弹窗事件
      console.info('qqqqqq', this.limitData)
      this.isAsyncData = false;
      this.disNone = true;
      this.itemsBigClass = this.limitData.itemBigClasses;
      this.itemLimitList = this.limitData.itemLimits;
      this.itemsSmallClass = this.limitData.itemSmallClasses;
      this.allItems = this.limitData.items;
      this.allItems = this.forListTwo(this.itemLimitList, this.allItems);
      setTimeout(() => {
        this.$refs.limitQuantityKind.zero();
        this.$refs.itemLimitList.refresh();
      }, 500);
      this.newSelloutIds = [];
      this.deleteSelloutIds = [];
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      // 清空搜索框
      setTimeout(() => {
        this.$refs.searchTextLimit.searchTextClean();
      }, 0);
      this.$nextTick(() => {
        this.$refs.itemLimitPagingBtn.bind(this.$refs.itemLimitList); // 右侧品项分页
        this.$refs.itemLimitList.refresh();
      });
    },
    // 对应把右侧的菜单的限制数也补上
    forListTwo(itemList, items) {
      itemList.forEach((list) => {
        for (let i = 0; i < items.length; i += 1) {
          // 判断条件一个想到 id和sizeId
          if (list.itemId === items[i].id && list.sizeId === items[i].size_id) {
            items[i].limitQuantity = list.limitQuantity;
            items[i].restQuantity = list.restQuantity;
            items[i].salesQuantity = list.salesQuantity;
          }
          items[i].isAutoRestore = false;
        }
      });
      return items;
    },
    limitDelete(item) {
      // $("#itemsSellOut"+item.itemId+item.itemSizeId).removeClass('itemsSellOutbox');
      // $("#span"+item.itemId+item.itemSizeId).addClass('disNone');
      if (!item.isKvs) {
        const i = this.isAllItem(item, this.allItems);
        this.allItems[i].selloutId = false;
        const index = this.inArray(item, this.itemLimitList);
        if (index !== -1) { // 是否是在初始化数据 或 后选择估清的数据 中
          this.itemLimitList.splice(index, 1);
          if (item.newSelloutIds) { // 如果有则是新增估清，直接在新数组中删除
            const key = this.inArray(item, this.newSelloutIds);
            this.newSelloutIds.splice(key, 1);
          } else { // 否则，初始化获取的估清菜品，需记录在删除数组中
            this.deleteSelloutIds.push(this.obj(item));
          }
        }
      }
    },
    closeChildDialog() { // 子弹窗关闭事件
      this.isSelect = 2; // 恢复默认
      this.sitemsCount = 0;
      this.sitemsCountLimit = 0;
      this.disNone = true;
    },
    sellOutBtn(type) {
      this.isSelect = type;
    },
    changeSubmitChildDialog(subLimitData) {
      const { itemId, sizeId } = this.changeItemLimit;
      const item = this.itemLimitList.find(i => i.itemId === itemId && i.sizeId === sizeId);
      let limitItem = this.newSelloutIds.find(i => i.itemId === itemId && i.sizeId === sizeId);
      // console.log('tijiao', subLimitData);

      item.restQuantity = subLimitData.restQuantity;
      item.limitQuantity = subLimitData.limitQuantity;
      item.type = subLimitData.type;
      this.$set(item, 'isAutoRestore', subLimitData.isAutoRestore);
      this.$set(item, 'isTakeoutLimit', subLimitData.isTakeoutLimit);
      this.$set(item, 'takeawayPlatformIdList', subLimitData.takeawayPlatformIdList);
      this.$set(item, 'autoUpperQuantity', subLimitData.autoUpperQuantity);
      this.$set(item, 'autoLowerQuantity', subLimitData.autoLowerQuantity);
      if (limitItem) {
        // limitItem.restQuantity = subLimitData.sitemsCount;
        // limitItem.limitQuantity = subLimitData.sitemsCountLimit;
        limitItem = { ...limitItem, ...subLimitData };
      } else {
        this.newSelloutIds.push({
          itemId: item.itemId,
          sizeId: item.sizeId,
          salesQuantity: item.salesQuantity,
          isPackage: item.isPackage,
          ...subLimitData,
        });
      }
    },
    // 取消当前菜品的限量
    cancelLimit() {
      this.limitDelete(this.changeItemLimit);
    },
    // submitChildDialog({ sitemsCount, sitemsCountLimit, isAutoRestore }) { // 子弹窗确认事件
    submitChildDialog(subLimitData) { // 子弹窗确认事件
      // console.log('tijiao-新', subLimitData);
      this.sitemsCount = subLimitData.restQuantity; // 设置的可售数量
      this.sitemsCountLimit = subLimitData.limitQuantity; // 設置的限售數量
      // 清空助记符
      this.searchText = '';
      this.$refs.searchTextLimit.searchTextClean();
      this.itemLimitList.push({ // 为原始数据添加 ，主要作用是视图显示
        ...subLimitData,
        itemName: this.itemLimitListMsg.name,
        type: this.isSelect,
        itemId: this.itemLimitListMsg.id,
        sizeId: this.itemLimitListMsg.size_id,
        sizeName: this.itemLimitListMsg.size_name,
        newSelloutIds: true,
        itemsIndex: this.itemLimitListMsg.index,
        selloutId: true,
        isPackage: this.itemLimitListMsg.isPackage,
      });
      this.newSelloutIds.push({ // 新增估清品项，用来确认调用接口时使用的数据
        ...subLimitData,
        itemId: this.itemLimitListMsg.id,
        sizeId: this.itemLimitListMsg.size_id,
        type: this.isSelect,
        salesQuantity: 0,
        isPackage: this.itemLimitListMsg.isPackage,
      });
      // 循环匹配 原品项数组中相应对象限量标识
      this.allItems.filter((_) => {
        if (this.itemLimitListMsg.size_id) {
          _.id == this.itemLimitListMsg.id && _.size_id == this.itemLimitListMsg.size_id && (() => {
            _.selloutId = true;
            _.newSelloutIds = true;
            _.limitQuantity = this.sitemsCountLimit;
            _.restQuantity = this.sitemsCount;
          })();
        } else {
          _.id == this.itemLimitListMsg.id && (() => {
            _.selloutId = true;
            _.newSelloutIds = true;
            _.limitQuantity = this.sitemsCountLimit;
            _.restQuantity = this.sitemsCount;
          })();
        }
      });
      this.disNone = true;
    },
    isSelectSellOut(obj, arr) {
      for (const i in arr) {
        if (arr[i].itemId == obj.id && arr[i].sizeId == obj.size_id) {
          return i;
        }
      }
      return -1;
    },
    inArray(obj, arr) {
      for (const i in arr) {
        if (arr[i].itemId == obj.itemId && arr[i].sizeId == obj.sizeId) {
          return i;
        }
      }
      return -1;
    },
    isAllItem(obj, arr) {
      for (const i in arr) {
        if (arr[i].id == obj.itemId && arr[i].size_id == obj.sizeId) {
          return i;
        }
      }
      return -1;
    },
    obj(item) { // 向接口传数据的模板
      const obj = {
        itemId: item.itemId,
        sizeId: item.sizeId,
        type: item.type,
        limitQuantity: item.limitQuantity,
        restQuantity: item.restQuantity,
        salesQuantity: item.salesQuantity, // 已售数量
        isPackage: item.isPackage,
      };
      return obj;
    },
    onSearch(text) {
      this.searchText = text;
    },
    onSubmit(authData = {}) { // 确认提交事件
      if (this.bDown_submit) return;
      this.bDown_submit = true;
      ajax('canyin.pos.itemLimit.itemLimit', {
        contentType: 'paramsEncoded',
        data: {
          newItemLimits: this.newSelloutIds,
          ids: this.deleteSelloutIds,
          ...authData,
          isFullUpload: this.isAsyncData ? 1 : 0,
          maxModifyTime: this.limitData.maxModifyTime,
        },
      }).then(() => {
        this.bDown_submit = false;
        this.$message({
          message: this.isAsyncData ? this.$t('Biz.Pos.More.LimitQChildMsg3') : this.$t('Biz.Pos.More.LimitQChildMsg4'),
          type: 'success',
        });
        // 避免已经限量的数据再限量就冲突,同步线上后也要关闭窗口
        // if (!this.isAsyncData) {
        this.close();
        // }
        setTimeout(() => {
          this.isAsyncData = false;
          this.setIsLimitOrSellout(true);
        }, 100);
      }).catch((msgcode, msg) => {
        this.bDown_submit = false;
        this.isAsyncData = false;
        MessageBox.alert(msg, '提示');
      });
    },
    // 获取搜索框用的快捷键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          this.inputKey(item);
        };
      });
      return keysObj;
    },
    inputKey() {
      this.$refs.searchTextLimit.addWordInBlur();
    },
  },
  watch: {
    itemLimitList() {
      setTimeout(() => {
        this.$refs.selectLimitPager.refresh();
      }, 500);
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .center{
    text-align: center;
  }
  .textEllipsis{
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }
  .itemsLimitOutbox{
    background: #f5f5f5;
    color: #ddd;
  }
  .bc0{
    background: rgba(0, 0, 0, 0.5);
  }
  .disNone{
    display: none;
  }
  .pl10{
    padding-left: 10px;
  }
  .limitQuantity{
    width: 100%;
    height: 100%;
    background: @body-bg;
    position: relative;
  }
  .borR{
    border-right: 1px solid #ddd;
  }
  .df{
    display: flex;
    align-items: center;
  }
  .fw{
    font-weight: bold;
  }
  //
  .limitItem{
    width: 520px;
    height: 100%;
    position: relative;
    border-right: 1px solid #999;
    box-shadow: darkgrey 9px 2px 13px -4px;
  }
  .ItemLimit-msg{
    width: 100%;
    height: 50px;
    padding:15px;
    position: absolute;
    top: 0;
    left: 0;
    border-bottom:1px solid #b5b5b5;
  }
  .ItemLimit-name{
    width: 140px;
    padding-left: 25px;
  }
  .w214{
    width: 214px !important;
  }
  .ItemLimit-type, .ItemLimit-li-type{
    width: 74px;
  }
  .ItemLimit-count, .ItemLimit-li-count{
    width: 74px;
    overflow: hidden;
  }
  .ItemLimit-delete, .ItemLimit-li-delete{
    width: 50px;
  }
  .ItemLimit-li-delete{
    cursor: pointer;
    background: url('./images/itemsDelete.png') no-repeat;
    background-position: center center;
    min-height: 50px;
  }
  .ItemLimit-li-name{
    width: 115px;
  }
  .w195{
    width: 195px !important;
  }
  .ItemLimit-li-id{
    width: 25px;
  }
  // 已选限量菜品列表
  .ItemLimit-list{
    // border-top:1px solid #9d9d9d;
    // border-bottom:1px solid #9d9d9d;
    height: 100%;
    padding-top: 50px;
    padding-bottom: 55px;
    .ItemLimit-list-ul{
      margin: 0 8px;
      height: 100%;
      overflow-x: hidden;
      overflow-y: scroll !important;
      .ItemLimit-list-ul-li{
        border-bottom: 1px solid #b5b5b5;
        height: 45px;
        // line-height: 45px;
        &.disabled {
          background-color: #c8c8c8;
        }
      }
    }
  }
  .ItemLimit-list-pager{
    position: absolute;
    bottom: 0;
    width: 520px;
    padding: 0 15px;
    border-top: 1px solid #b5b5b5;
    height: 55px;
    padding-top: 10px;
    display: flex;
    justify-content: flex-end;
    >span{
      display: inline-block;
      padding-top: 9.2px;
      color: #999;
      font-size: 12px;
    }
    .pos-pager{
      text-align: right;
    }
  }

  //
  .limitTip, .itemsSellOut{
    display: inline-block;
    font-size: 13px;
    padding: 0 5px;
    border-radius: 30px;
    color: @white;
  }
  .limitTip{ //限量标记
    background: @pos-flag-promotion-color;
  }
  .itemsSellOut{ //估清标记
    background: #cccccc;
  }
  .module-bill-ItemLimit{
    height: 100%;
    margin-left: 520px;
    position: relative;
    .ItemLimit-all-items-box{
      padding-top: 100px;
      padding-bottom: 55px;
      height: 100%;
      .all-items{
        height: 100%;
        padding:15px;
        border-top: 1px solid #b5b5b5;
        .all-limit-items{
          flex-wrap: wrap;
          height: 100%;
          overflow: hidden;
          .active {
            background-color: rgba(0, 0, 0, .1);
          }
          .item{
            &.disabled {
              background-color: #c8c8c8;
              color: #fff;
              > .name {
                color: #fff;
              }
            }
            width: 146px;
            height: 90px;
            margin-right: 10px;
            margin-bottom: 10px;
            border: 1px solid #b5b5b5;
            padding:5px;
            position: relative;
            cursor: pointer;
            float: left;
            .itemId{
              color: #ddd;
            }
            .name{
              color: #000;
              height: 36px;
              line-height: 1.3;
              overflow : hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .itemPrice{
              position: absolute;
              bottom: 0;
              right: 5px;
              font-size: 12px;
            }
          }
          // li:nth-child(5n+5) {
          //   margin-right: 0;
          // }
        }
      }
    }
  }
  // 底部搜索+翻页组件
  .ItemLimit-btns-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 55px;
    background-color: white;
    .borT{
      border-top: 1px solid #b5b5b5;
      margin:0 15px;
      height: 100%;
      >span{
        display: inline-block;
        position: absolute;
        top: 21px;
        right: 170px;
        font-size: 12px;
        color: #999;
      }
    }
    .pos-pager{
      position: absolute;
      top: 0;
      right: 0;
      margin-top: 10px;
      margin-right: 18px;
    }
  }
  //
  .mlr10{
    margin: 0 10px;
  }
  .async-btn {
    position: absolute;
    left: 36px;
  }

.lang-enUS{
  .ItemLimit-msg{
    font-size:12px;
    line-height: 1.1;
    padding: 5px 15px;
  }
  .ItemLimit-list{
    line-height: 1.1;
    .ItemLimit-li-type, .ItemLimit-li-name{
      font-size:12px;
    }
  }

}

</style>
