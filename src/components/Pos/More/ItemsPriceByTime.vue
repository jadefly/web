<template>
    <Dialog
    name="PosDialog.ItemsPriceByTime"
    :title="$t('Biz.Pos.MoreModuleSpan8')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :fullscreen="true"
    :hotkeys="hotKeySet"
    width="100%"
    submitId="itemsPriceByTimeSubmit"
  >
    <div class="priceByTime">
      <div style="position: absolute; height: 100%;z-index:100">
        <div class="limitItem"> <!-- 品项 -->
          <div class="PriceByTime-msg">
            <ul class="df">
              <li class="PriceByTime-name borR w114">{{$t('Dict.Item')}}</li>
              <li class="PriceByTime-type borR pl10" :title="$t('Biz.Pos.More.IPByTimeLi2')">{{$t('Biz.Pos.More.IPByTimeLi2')}}</li>
              <li class="PriceByTime-type borR pl10" :title="$t('Biz.Pos.More.IPByTimeTitle1')">{{$t('Biz.Pos.More.IPByTimeTitle1')}}</li>
              <li class="PriceByTime-delete pl10" id="deleteTimePriceItem" v-autotest>{{$t('Dict.Btn.DeleteItem')}}</li>
            </ul>
          </div>
          <div class="PriceByTime-list">
            <ul class="PriceByTime-list-ul" id="ItemTimePriceUl" v-autotest>
              <li class="PriceByTime-list-ul-li df" v-for="( items, key) in priceByTimeList" :key="key" @click="openPriceDialog(items)">
                <div class="PriceByTime-li-id fw">{{key+1}}</div>
                <div class="PriceByTime-li-name fw w120 textEllipsis">
                  <span v-show=" items.itemSizeName && items.itemSizeName != '-'">
                    ({{ items.itemSizeName }})
                  </span>
                  {{items.itemName}}
                </div>
                <div class="PriceByTime-li-type pl10">
                  {{ items.stdPrice }}
                </div>
                <div class="PriceByTime-li-type pl10">
                  {{ items.timePrice }}
                </div>
                <div class="PriceByTime-li-delete pl10" @click.stop.prevent="priceTimeDelete(items)"></div>
              </li>
            </ul>
          </div>
          <div class="PriceByTime-list-pager">
            <span>{{$t('Dict.Altogether')}}{{priceByTimeList.length}}{{$t('Dict.Strip')}}，</span>
            <Pager
              pagerId="ItemTimePriceUl"
              itemTag="li"
              :showInfo = "true"
              arrowDirection="up-down"
              ref="selectTimePricePager"
            >
            </Pager>
          </div>
        </div>
      </div>
      <div class="module-bill-PriceByTime">
        <LimitQuantityKind ref="limitQuantityKind" ulId="TimePrice"
          :itemsBigClass="itemsBigClass" :itemsSmallClass="itemsSmallClass"
          @bigClassLiOut="bigClassLiOut">
        </LimitQuantityKind>
        <div class="PriceByTime-all-items-box">
          <div class="all-items">
            <ul id="allpriceItemsUl">
              <li v-for="(item, index) in points"
              :key="index" v-show=" (isAllBig || item.bigClassId==selectedBigClass) && (isAllSmall||item.smallClassId==selectedSmallClass)"
              :disabled="item.isSelected?true : false"
              :class="{'itemsSetPricebox':item.isSelected}" @click="itemsSetPrice(item, index)" >
                <div>
                  <span class="itemId">{{item.itemCode}}</span>
                  <span class="itemsSetPrice" v-if="item.isSelected">{{$t('Biz.Pos.More.IPByTimeTitle1')}}</span>
                </div>
                <div class="name"><span v-show="item.itemSizeName && item.itemSizeName != '-'">({{ item.itemSizeName }})</span>{{item.itemName}}</div>
                <div class="itemPrice text-right">
                  <span>{{item.stdPrice}}/{{item.unitName}}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="PriceByTime-btns-footer">
          <div class="borT">
            <Search @search="onSearch" ref="searchTextSetPrice" idName="setPrice"></Search>
            <span>{{$t('Dict.Altogether')}}{{allItems.length}}{{$t('Dict.Strip')}}，</span>
            <Pager pagerId="allpriceItemsUl" :showInfo="true" class="" arrowDirection="up-down"  ref="filterPager"></Pager>
          </div>
        </div>
      </div>
    </div>
  <ItemsPriceByTimeChildDialog ref="ItemsPriceByTimeChildDialog" @submitChildDialog="submitChildDialog" type="set"></ItemsPriceByTimeChildDialog>
  <ItemsPriceByTimeChildDialog ref="changeItemsPriceByTimeChildDialog" @submitChildDialog="changeSubmitChildDialog" type="set"></ItemsPriceByTimeChildDialog>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import LimitQuantityKind from './LimitQuantity/LimitQuantityKind';
import Search from './LimitQuantity/LimitSearch';
import ItemsPriceByTimeChildDialog from './ItemsPriceByTimeChildDialog';
import quickSearch from '@/common/js/quicksearch';

export default {
  components: {
    Dialog, Pager, LimitQuantityKind, Search, ItemsPriceByTimeChildDialog,
  },
  mixins: [DialogMixin],
  props: {
    priceByTimeData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      searchText: '', // 搜索文本
      disNone: true, // 隐藏DOM
      isAllBig: true, // 是否选中全部大类
      selectedBigClass: '', // 选中大类的id
      isAllSmall: true, // 是否选中全部小类
      selectedSmallClass: '', // 选中小类的id
      priceByTimeList: [], // 初始化已选时价列表
      ItitemSetPriceMsg: {}, // 暂时存储小弹窗确认/关闭前的时价信息
      changeItemPrice: {}, // 暂存时价的信息
      itemsBigClass: [], // 所有大类
      itemsSmallClass: [], // 所有小类
      allItems: [], // 所有菜品
      newSetTimePriceIds: [], // 新增的时价品项
      deleteSetTimePriceIds: [], // 删除的已时价品项
    };
  },
  computed: {
    // 菜品快速查找
    points() {
      let filterList = [];
      if (this.allItems) {
        filterList = this.allItems.filter((list) => {
          // 输入英文匹配 pinyin, 输入数字匹配code
          const keyFilters = quickSearch((`${this.searchText}`).toLowerCase());
          let resultItem;
          for (let i = 0; i < keyFilters.length; i++) {
            const key = keyFilters[i];
            if (String(list.itemCode).toLowerCase().indexOf(key) != -1 || list.pinyin.toLowerCase().indexOf(key) != -1 || list.itemName.toLowerCase().indexOf(key) != -1) {
              resultItem = true;
            }
          }
          return !keyFilters.length || resultItem;
        });
      }
      return filterList;
    },
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    ...mapGetters(['posSettings']),
  },
  methods: {
    itemsSetPrice(item, index) { // 点击品项事件
      if (!item.isSelected) { // 没有时价，弹窗，选择时长
        this.disNone = false;
        item.index = index;
        this.ItitemSetPriceMsg = item;
        this.$refs.ItemsPriceByTimeChildDialog.open(item);
      }
    },
    bigClassLiOut(isShowItems) { // 选择大类||小类
      this.isAllBig = isShowItems.isAllBig;
      this.selectedBigClass = isShowItems.selectedBigClass;
      this.isAllSmall = isShowItems.isAllSmall;
      this.selectedSmallClass = isShowItems.selectedSmallClass;
      this.$refs.filterPager.refresh();
    },
    onOpen() {
      const _this = this;
      this.disNone = true;
      this.itemsBigClass = this.priceByTimeData.itemBigClass;
      this.priceByTimeList = this.priceByTimeData.itemTimePriceList;
      this.itemsSmallClass = this.priceByTimeData.itemSmallClass;
      this.allItems = this.priceByTimeData.itemBrandList;
      setTimeout(() => {
        _this.$refs.limitQuantityKind.zero();
        _this.$refs.filterPager.refresh();
      }, 500);
      this.newSetTimePriceIds = [];
      this.deleteSetTimePriceIds = [];
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      // 清空搜索框
      setTimeout(() => {
        this.searchText = '';
        this.$refs.searchTextSetPrice.searchTextClean();
      });
    },
    closeChildDialog() { // 子弹窗关闭事件
      this.disNone = true;
    },
    openPriceDialog(item) {
      this.changeItemPrice = item;
      this.$refs.changeItemsPriceByTimeChildDialog.open(item);
    },
    changeSubmitChildDialog(price) {
      const item = this.priceByTimeList.find(item => item.itemId === this.changeItemPrice.itemId);
      const priceItem = this.newSetTimePriceIds.find(item => item.itemId === this.changeItemPrice.itemId);
      item.timePrice = price;
      if (priceItem) {
        priceItem.timePrice = price;
      } else {
        // 如果删除数据里存在就去除删除里的数据 deleteSetTimePriceIds
        this.deleteSetTimePriceIds = this.deleteSetTimePriceIds.filter(it => `${it.itemId}|${it.itemSizeId}` !== `${item.itemId}|${item.itemSizeId}`);
        this.newSetTimePriceIds.push({
          itemId: item.itemId,
          itemSizeId: item.itemSizeId,
          timePrice: price,
        });
      }
    },
    submitChildDialog(price) { // 选择时价时长的子弹窗中按钮的点击事件 ，只有没时价，或重新时价才会触发弹窗中按钮的点击事件
      const timer = new Date().getTime(); // 获取当前事件戳
      this.priceByTimeList.push({ // 为原始数据添加 ，主要作用是视图显示
        itemName: this.ItitemSetPriceMsg.itemName,
        itemSizeName: this.ItitemSetPriceMsg.itemSizeName,
        itemId: this.ItitemSetPriceMsg.itemId,
        itemSizeId: this.ItitemSetPriceMsg.itemSizeId,
        newSetTimePriceIds: true,
        itemsIndex: this.ItitemSetPriceMsg.index,
        isSelected: true,
        stdPrice: this.ItitemSetPriceMsg.stdPrice,
        timePrice: price,
      });
      this.deleteSetTimePriceIds = this.deleteSetTimePriceIds.filter(it => `${it.itemId}|${it.itemSizeId}` !== `${this.ItitemSetPriceMsg.itemId}|${this.ItitemSetPriceMsg.itemSizeId}`);
      this.newSetTimePriceIds.push({ // 新增时价品项，用来确认调用接口时使用的数据
        itemId: this.ItitemSetPriceMsg.itemId,
        itemSizeId: this.ItitemSetPriceMsg.itemSizeId,
        timePrice: price,
        modifyTime: timer,
      });
      // 循环匹配搜索项 点击的对象, 设置相应右侧品项列表相应品项进行时价
      this.allItems.filter((_) => {
        if (this.ItitemSetPriceMsg.itemSizeId) {
          _.itemId == this.ItitemSetPriceMsg.itemId && _.itemSizeId == this.ItitemSetPriceMsg.itemSizeId && (() => {
            _.isSelected = true;
            _.newSetTimePriceIds = true;
          })();
        } else {
          _.itemId == this.ItitemSetPriceMsg.itemId && (() => {
            _.isSelected = true;
            _.newSetTimePriceIds = true;
          })();
        }
      });
      // 搜索后匹配不正确, 代码删除
      // this.allItems[this.ItitemSetPriceMsg.index].isSelected = true;
      // this.allItems[this.ItitemSetPriceMsg.index].newSetTimePriceIds = true;
      this.disNone = true;
    },
    priceTimeDelete(item) { // 点击时价列表中的删除事件
      const i = this.isAllitems(item, this.allItems);
      this.allItems[i].isSelected = false;
      let index = this.inArray(item, this.priceByTimeList);
      if (index !== -1) { // 是否是在初始化数据 或 后选择时价的数据 中
        this.priceByTimeList.splice(index, 1);
        if (item.newSetTimePriceIds) { // 如果有则是新增时价，直接在新数组中删除
          index = this.inArray(item, this.newSetTimePriceIds);
          this.newSetTimePriceIds.splice(index, 1);
          this.deleteSetTimePriceIds.push(this.obj(item));
        } else { // 否则，初始化获取的时价菜品，需记录在删除数组中
          this.deleteSetTimePriceIds.push(this.obj(item));
        }
      }
    },
    onClose() { // 关闭弹窗
      this.close();
    },
    inArray(obj, arr) {
      for (const i in arr) {
        if (arr[i].itemId == obj.itemId && arr[i].itemSizeId == obj.itemSizeId) {
          return i;
        }
      }
      return -1;
    },
    isSelectTimePrice(obj, arr) {
      for (const i in arr) {
        if (arr[i].itemId == obj.itemId && arr[i].itemSizeId == obj.itemSizeId) {
          return i;
        }
      }
      return -1;
    },
    isAllitems(obj, arr) {
      for (const i in arr) {
        if (arr[i].itemId == obj.itemId && arr[i].itemSizeId == obj.itemSizeId) {
          return i;
        }
      }
      return -1;
    },
    obj(item) { // 向接口传数据的模板
      const timer = new Date().getTime();
      const obj = {
        itemId: item.itemId,
        itemSizeId: item.itemSizeId,
        modifyTime: timer,
      };
      return obj;
    },
    onSearch(text) {
      this.searchText = text;
    },
    onSubmit(authData = {}) { // 确认提交事件
      const deleteItemListParams = this.deleteSetTimePriceIds.map(item => item.itemId + '|' + item.itemSizeId);
      ajax('canyin.pos.itemtimeprice.saveitemtimepricelist', {
        contentType: 'json',
        data: {
          modifyItemList: this.newSetTimePriceIds,
          deleteItemList: deleteItemListParams,
          ...authData,
        },
      }).then((data) => {
        this.close();
        this.$message({
          message: this.$t('Biz.Pos.More.IPByTimeMsg1'),
          type: 'success',
        });
      })
    },
  },
  watch: {
    priceByTimeList() {
      this.$nextTick(() => {
        this.$refs.selectTimePricePager.refresh();
      });
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .textEllipsis{
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .itemsSetPricebox{
    background: #f5f5f5;
    color: #ddd;
  }
  .bc0{
    background: rgba(0, 0, 0, 0.5);
  }
  .disNone{
    display: none !important;
  }
  .pl10{
    padding-left: 10px;
  }
  .priceByTime{
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
    width: 370px;
    height: 100%;
    position: relative;
    border-right: 1px solid #999;
    box-shadow: darkgrey 9px 2px 13px -4px;
  }
  .PriceByTime-msg{
    width: 100%;
    height: 50px;
    padding:15px;
    position: absolute;
    top: 0;
    left: 0;
    border-bottom:1px solid #b5b5b5;
  }
  .PriceByTime-name{
    width: 140px;
    padding-left: 25px;
  }
  .w214{
    width: 114px !important;
  }
  .PriceByTime-type, .PriceByTime-li-type{
    width: 74px;
    .text-overflow();
  }
  .PriceByTime-count, .PriceByTime-li-count{
    width: 74px;
    .text-overflow();
  }
  .PriceByTime-delete, .PriceByTime-li-delete{
    width: 50px;
  }
  .PriceByTime-li-delete{
    cursor: pointer;
    background: url('./images/itemsDelete.png') no-repeat;
    background-position: center center;
    min-height: 50px;
  }
  .PriceByTime-li-name{
    width: 115px;
  }
  .w120{
    width: 120px !important;
  }
  .PriceByTime-li-id{
    width: 25px;
  }
  // 已选时价菜品列表
  .PriceByTime-list{
    // border-top:1px solid #9d9d9d;
    // border-bottom:1px solid #9d9d9d;
    height: 100%;
    padding-top: 50px;
    padding-bottom: 55px;
    .PriceByTime-list-ul{
      margin: 0 8px;
      height: 100%;
      overflow-x: hidden;
      overflow-y: scroll !important;
      .PriceByTime-list-ul-li{
        border-bottom: 1px solid #b5b5b5;
        height: 45px;
        line-height: 45px;
      }
    }
  }
  .PriceByTime-list-pager{
    position: absolute;
    bottom: 0;
    width: 370px;
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
  .limitTip, .itemsSetPrice{
    display: inline-block;
    font-size: 13px;
    padding: 0 5px;
    border-radius: 30px;
    color: @white;
  }
  .limitTip{ //限量标记
    background: @pos-flag-promotion-color;
  }
  .itemsSetPrice{ //时价标记
    background: #cccccc;
  }
  .module-bill-PriceByTime{
    height: 100%;
    margin-left: 370px;
    position: relative;
    .PriceByTime-all-items-box{
      padding-top: 100px;
      padding-bottom: 55px;
      height: 100%;
      .all-items{
        height: 100%;
        padding:15px;
        border-top: 1px solid #b5b5b5;
        ul{
          flex-wrap: wrap;
          height: 100%;
          overflow: hidden;
          li{
            width: 17.7%;
            margin-right: 1.5%;
            margin-bottom: 10px;
            height: 85px;
            border: 1px solid #b5b5b5;
            padding:5px;
            position: relative;
            cursor: pointer;
            float: left;
            .itemId{
              color: #ddd;
            }
            .name{
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
  .PriceByTime-btns-footer {
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
    height: 36px;
    float: left;
    margin-right: 30px;
  }


.lang-enUS{
  .PriceByTime-msg li{
    font-size: 12px;
  }
}

</style>
