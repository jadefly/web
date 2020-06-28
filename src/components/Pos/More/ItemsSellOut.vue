<template>
  <Dialog
    name="PosDialog.ItemsSellOut"
    :title="$t('Dict.Btn.ItemSellout')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :fullscreen="true"
    :hotkeys="hotKeySet"
    width="100%"
    submitId="itemsSellOutSubmit"
  >
    <template slot="other-button">
      <button
        type="button"
        class="btn btn-default"
        @click="printSellOut"
      >{{$t('Biz.Pos.More.ISellOutBtn1')}}(F1)</button>
    </template>
    <div class="limitQuantity">
      <div style="position: absolute; height: 100%;z-index:100">
        <div class="limitItem"> <!-- 品项 -->
          <div class="ItemSellOut-msg">
            <ul class="df">
              <li class="ItemSellOut-name borR w214">{{$t('Dict.Item')}}</li>
              <li class="ItemSellOut-type borR">{{$t('Biz.Pos.More.ISellOutLi2')}}</li>
              <li class="ItemSellOut-delete" id="deleteSelloutItem" v-autotest>{{$t('Dict.Btn.DeleteItem')}}</li>
            </ul>
          </div>
          <div class="ItemSellOut-list">
            <ul class="ItemSellOut-list-ul" id="ItemSellOutUl" v-autotest>
              <li
                class="ItemSellOut-list-ul-li df"
                v-for="( items, key) in itemSellOut"
                :key="key"
                :id="'selectSellOut'+items.itemId+items.itemSizeId"
              >
                <div class="ItemSellOut-li-id fw">{{key+1}}</div>
                <div class="ItemSellOut-li-name fw w195 textEllipsis">
                  <span v-show=" items.itemSizeName && items.itemSizeName != '-'">
                    ({{ items.itemSizeName }})
                  </span>{{items.itemName}}
                </div>
                <div class="ItemSellOut-li-type">
                  {{items.type ==0? $t('Biz.Pos.More.ISellOutChildBtn3'):items.type==1?$t('Biz.Pos.ShiftNow'):$t('Biz.Pos.More.ISellOutChildBtn1')}}
                </div>
                <div class="ItemSellOut-li-delete" @click="sellOutDelete(items)"></div>
              </li>
            </ul>
          </div>
          <div class="ItemSellOut-list-pager">
            <span>{{$t('Dict.Altogether')}}{{itemSellOut.length}}{{$t('Dict.Strip')}}，</span>
            <Pager
              pagerId="ItemSellOutUl"
              itemTag="li"
              :showInfo = "true"
              arrowDirection="up-down"
              ref="selectSellOutPager"
            >
            </Pager>
          </div>
        </div>
      </div>
      <div class="module-bill-ItemSellOut">
        <LimitQuantityKind
          ref="limitQuantityKind"
          ulId="SellOut"
          :itemsBigClass="itemsBigClass"
          :itemsSmallClass="itemsSmallClass"
          @bigClassLiOut="bigClassLiOut"
        ></LimitQuantityKind>
        <div class="ItemSellOut-all-items-box">
          <div class="all-items">
            <Paging
              :data="points"
              :itemWidth="160"
              :itemHeight="100"
              :autoActive="false"
              :active.sync="activeItem"
              :activeFindRules="['size_id', 'id']"
              class="all-sellout-items"
              ref="itemSellOutList"
              id="itemSellOutList">
              <div slot-scope="props"
                :id="'itemsSellOut'+props.item.id+props.item.itemSizeId"
                :disabled="props.item.selloutId?true : false"
                class="item"
                :class="{
                  'itemsSellOutbox': props.item.selloutId,
                  'active': activeItem
                    && props.item.id === activeItem.id
                    && props.item.size_id === activeItem.size_id
                }"
                @click="itemsSellOut(props.item, props.index)" >
                <div>
                  <span class="itemId">{{props.item.code}}</span>
                  <span
                    class="itemsSellOut"
                    :id="'span'+props.item.id+props.item.itemSizeId"
                    v-if="props.item.selloutId"
                  >{{$t('Dict.Sellout')}}</span>
                </div>
                <div class="name">
                  <span v-show="props.item.itemSizeName && props.item.itemSizeName != '-'">
                    ({{ props.item.itemSizeName }})
                  </span>{{props.item.name}}
                </div>
                <div class="itemPrice text-right">
                  <span>{{props.item.price}}/{{props.item.unitName}}</span>
                </div>
              </div>
            </Paging>
          </div>
        </div>
        <div class="ItemSellOut-btns-footer">
          <div class="borT">
            <Search
              @search="onSearch"
              ref="searchTextSellOut"
              idName="sellout"
              :resultLength="points.length"
            ></Search>
            <div class="sellout-habit-switch">
              <el-switch
                v-model="selloutHabit"
                active-color="#0babb9"
                inactive-color="#666"
                :active-value="1"
                :inactive-value="0"
                @change="updateSelloutHabit">
              </el-switch>
              <span>{{$t('Biz.Pos.More.ISellOutSpan1')}}</span>
            </div>
            <span> {{$t('Dict.Altogether')}}{{points.length}}{{$t('Dict.Strip')}}，</span>
            <PagingBtn
              ref="itemSelloutPagingBtn"
              :showInfo="true">
            </PagingBtn>
          </div>
        </div>
      </div>
    </div>
    <ItemsSellOutChildDialog
      ref="ItemsSellOutChildDialog"
      @sellOutBtn="sellOutBtn"
    ></ItemsSellOutChildDialog>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { find, cloneDeep } from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Paging from '@/components/Pos/Common/Paging';
import Pager from '@/components/Pos/Common/Pager';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import LimitQuantityKind from './LimitQuantity/LimitQuantityKind';
import Search from './LimitQuantity/LimitSearch';
import ItemsSellOutChildDialog from './ItemsSellOutChildDialog';
import quickSearch from '@/common/js/quicksearch';

export default {
  components: {
    Dialog, Pager, Paging, PagingBtn, LimitQuantityKind, Search, ItemsSellOutChildDialog,
  },
  mixins: [DialogMixin],
  props: {
    sellOutData: {
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
      itemSellOut: [], // 初始化已选估清列表
      itemSellOutMsg: {}, // 暂时存储小弹窗确认/关闭前的估清信息
      itemsBigClass: [], // 所有大类
      itemsSmallClass: [], // 所有小类
      allItems: [], // 所有菜品
      newSelloutIds: [], // 新增的估清品项
      deleteSelloutIds: [], // 删除的已估清品项
      selloutHabit: 0, // 切换是否清空助记符
      activeItem: null, // 选中的品项
    };
  },
  computed: {
    quickSearchText() {
      return quickSearch(`${this.searchText}`.toLowerCase());
    },
    // 菜品快速查找
    points() {
      let filterList = [];
      if (this.allItems) {
        // 输入英文匹配 pinyin, 输入数字匹配code
        const keyFilters = this.quickSearchText;
        filterList = this.allItems.filter((list) => {
          let resultItem;
          for (let i = 0; i < keyFilters.length; i += 1) {
            const key = keyFilters[i];
            if (
              String(list.code).toLowerCase().indexOf(key) !== -1
              || list.pinyin.toLowerCase().indexOf(key) !== -1
              || list.name.toLowerCase().indexOf(key) !== -1) {
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
          this.$refs.itemSellOutList.select('↑');
        },
        '↓': () => {
          this.$refs.itemSellOutList.select('↓');
        },
        '←': () => {
          this.$refs.itemSellOutList.select('←');
        },
        '→': () => {
          this.$refs.itemSellOutList.select('→');
        },
        Enter: () => {
          this.itemsSellOut(this.activeItem);
        },
        BackSpace: () => {
          this.$refs.searchTextSellOut.delWordInBlur();
        },
        F1: () => {
          this.printSellOut();
        },
        ...this.setKeySearchHotKey(),
      };
    },
    ...mapGetters(['posSettings', 'posInfo']),
  },
  methods: {
    itemsSellOut(item) { // 点击品项事件
      if (item.selloutId) {
        this.$confirm(this.$t('Biz.Pos.More.ISellOutMsg1'), this.$t('Dict.Tips')).then(() => {
          const finded = find(this.itemSellOut, {
            itemId: item.id,
            itemSizeId: item.itemSizeId,
          });
          if (finded) {
            this.sellOutDelete(finded);
          }
        }).catch(() => {});
      } else {
        this.disNone = false;
        this.$refs.ItemsSellOutChildDialog.open();
        // item.index = index;
        this.itemSellOutMsg = item;
      }
    },
    bigClassLiOut(isShowItems) { // 选择大类||小类
      this.isAllBig = isShowItems.isAllBig;
      this.selectedBigClass = isShowItems.selectedBigClass;
      this.isAllSmall = isShowItems.isAllSmall;
      this.selectedSmallClass = isShowItems.selectedSmallClass;
      this.$refs.itemSellOutList.refresh();
    },
    onOpen() {
      this.disNone = true;
      this.itemsBigClass = this.sellOutData.itemBigClasses;
      this.itemSellOut = cloneDeep(this.sellOutData.itemSellouts);
      this.itemsSmallClass = this.sellOutData.itemSmallClasses;
      this.selloutHabit = this.sellOutData.selloutHabit.value;
      this.allItems = this.sellOutData.items;
      setTimeout(() => {
        this.$refs.limitQuantityKind.zero();
      }, 500);
      this.newSelloutIds = [];
      this.deleteSelloutIds = [];
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      // 清空搜索框
      setTimeout(() => {
        this.searchText = '';
        this.$refs.searchTextSellOut.searchTextClean();
      });
      this.$nextTick(() => {
        this.$refs.itemSelloutPagingBtn.bind(this.$refs.itemSellOutList); // 右侧品项分页
        this.$refs.itemSellOutList.refresh();
      });
    },
    closeChildDialog() { // 子弹窗关闭事件
      this.disNone = true;
    },
    sellOutBtn(type) { // 选择估清时长的子弹窗中按钮的点击事件 ，只有没估清，或重新估清才会触发弹窗中按钮的点击事件
      const timer = new Date().getTime(); // 获取当前事件戳
      if (!this.selloutHabit) {
        this.searchText = '';
        this.$refs.searchTextSellOut.searchTextClean();
      }
      this.itemSellOut.push({ // 为原始数据添加 ，主要作用是视图显示
        itemName: this.itemSellOutMsg.name,
        itemSizeName: this.itemSellOutMsg.itemSizeName,
        type,
        itemId: this.itemSellOutMsg.id,
        itemSizeId: this.itemSellOutMsg.itemSizeId,
        newSelloutIds: true,
        itemsIndex: this.itemSellOutMsg.index,
        selloutId: true,
      });
      this.newSelloutIds.push({ // 新增估清品项，用来确认调用接口时使用的数据
        itemId: this.itemSellOutMsg.id,
        itemSizeId: this.itemSellOutMsg.itemSizeId,
        type,
        modifyTime: timer,
      });
      // 循环匹配搜索项 点击的对象, 设置相应右侧品项列表相应品项进行估清
      this.allItems.filter((_) => {
        if (this.itemSellOutMsg.itemSizeId) {
          _.id == this.itemSellOutMsg.id && _.itemSizeId == this.itemSellOutMsg.itemSizeId && (() => {
            _.selloutId = true;
            _.newSelloutIds = true;
          })();
        } else {
          _.id == this.itemSellOutMsg.id && (() => {
            _.selloutId = true;
            _.newSelloutIds = true;
          })();
        }
      });
      // 搜索后匹配不正确, 代码删除
      // this.allItems[this.itemSellOutMsg.index].selloutId = true;
      // this.allItems[this.itemSellOutMsg.index].newSelloutIds = true;
      this.disNone = true;
    },
    sellOutDelete(item) { // 点击估清列表中的删除事件
      const i = this.isAllitems(item, this.allItems);
      this.allItems[i].selloutId = false;
      let index = this.inArray(item, this.itemSellOut);
      if (index !== -1) { // 是否是在初始化数据 或 后选择估清的数据 中
        this.itemSellOut.splice(index, 1);
        if (item.newSelloutIds) { // 如果有则是新增估清，直接在新数组中删除
          index = this.inArray(item, this.newSelloutIds);
          this.newSelloutIds.splice(index, 1);
          // this.deleteSelloutIds.push(this.obj(item)); // 解决估清 --> 删除 --> 点击确认，后台估清报表会出现此品项的解估记录
        } else { // 否则，初始化获取的估清菜品，需记录在删除数组中
          this.deleteSelloutIds.push(this.obj(item));
        }
      }
    },
    onClose() { // 关闭弹窗
      this.activeMenu = {};
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
    isSelectSellOut(obj, arr) {
      for (const i in arr) {
        if (arr[i].itemId == obj.id && arr[i].itemSizeId == obj.itemSizeId) {
          return i;
        }
      }
      return -1;
    },
    isAllitems(obj, arr) {
      for (const i in arr) {
        if (arr[i].id == obj.itemId && arr[i].itemSizeId == obj.itemSizeId) {
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
        type: item.itemSelloutType,
        modifyTime: timer,
      };
      return obj;
    },
    onSearch(text) {
      this.searchText = text;
    },
    onSubmit(authData = {}) { // 确认提交事件
      ajax('canyin.pos.itemSellout.itemSellout', {
        contentType: 'paramsEncoded',
        data: {
          newItemSellouts: this.newSelloutIds,
          ids: this.deleteSelloutIds,
          ...authData,
          maxModifyTime: this.sellOutData.maxModifyTime,
        },
      }).then((data) => {
        this.close();
        this.$message({
          message: this.$t('Biz.Pos.More.ISellOutMsg2'),
          type: 'success',
        });
        if (data.msg) { // 线上保存失败返回信息
          this.$message({
            customClass: 'errorMsgCustomClass',
            message: data.msg,
            type: 'error',
          });
        }
      });
    },
    // 设置是否清空助记符
    updateSelloutHabit() {
      ajax('canyin.sys.syshabit.updatehabit', {
        loading: false,
        contentType: 'json',
        data: {
          type: 1,
          value: this.selloutHabit,
        },
      }).then(() => {});
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
      this.$refs.searchTextSellOut.addWordInBlur();
    },
    // 打印估清单
    printSellOut() {
      if (this.sellOutData.itemSellouts.length > 0) {
        ajax('canyin.pos.itemSellout.printselloutbill', {
          contentType: 'URLEncoded',
          data: {
            posId: this.posInfo.id,
          },
        }).then((res) => {
          this.$devices.Printer.print(res.printD);
        });
      } else {
        this.$message({
          message: this.$t('Biz.Pos.More.ISellOutMsg3'),
          type: 'error',
        });
      }
    },
  },
  watch: {
    itemSellOut() {
      setTimeout(() => {
        this.$refs.selectSellOutPager.refresh();
      }, 500);
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
  .itemsSellOutbox{
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
  }
  .fw{
    font-weight: bold;
  }
  //
  .limitItem{
    width: 410px;
    height: 100%;
    position: relative;
    border-right: 1px solid #999;
    box-shadow: darkgrey 9px 2px 13px -4px;
  }
  .ItemSellOut-msg{
    width: 100%;
    height: 50px;
    padding:15px;
    position: absolute;
    top: 0;
    left: 0;
    border-bottom:1px solid #b5b5b5;
  }
  .ItemSellOut-name{
    width: 140px;
    padding-left: 25px;
  }
  .w214{
    width: 214px !important;
  }
  .ItemSellOut-type, .ItemSellOut-li-type{
    width: 110px;
    padding: 0 5px;
  }
  .ItemSellOut-count, .ItemSellOut-li-count{
    width: 74px;
  }
  .ItemSellOut-delete, .ItemSellOut-li-delete{
    width: 50px;
    text-align: center;
  }
  .ItemSellOut-li-delete{
    cursor: pointer;
    background: url('./images/itemsDelete.png') no-repeat;
    background-position: center center;
  }
  .ItemSellOut-li-name{
    width: 115px;
  }
  .w195{
    width: 195px !important;
  }
  .ItemSellOut-li-id{
    width: 25px;
  }
  // 已选估清菜品列表
  .ItemSellOut-list{
    // border-top:1px solid #9d9d9d;
    // border-bottom:1px solid #9d9d9d;
    height: 100%;
    padding-top: 50px;
    padding-bottom: 55px;
    .ItemSellOut-list-ul{
      margin: 0 8px;
      height: 100%;
      overflow-x: hidden;
      overflow-y: scroll !important;
      .ItemSellOut-list-ul-li{
        border-bottom: 1px solid #b5b5b5;
        height: 45px;
        line-height: 45px;
      }
    }
  }
  .ItemSellOut-list-pager{
    position: absolute;
    bottom: 0;
    width: 410px;
    padding: 0 15px;
    border-top: 1px solid #b5b5b5;
    height: 55px;
    padding-top: 10px;
    padding-left: 165px;
    display: flex;
    justify-content: center;
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
  .module-bill-ItemSellOut{
    height: 100%;
    margin-left: 410px;
    position: relative;
    .ItemSellOut-all-items-box{
      padding-top: 100px;
      padding-bottom: 55px;
      height: 100%;
      .all-items{
        height: 100%;
        padding:15px;
        border-top: 1px solid #b5b5b5;
        .all-sellout-items{
          flex-wrap: wrap;
          height: 100%;
          overflow: hidden;
          .active {
            background-color: rgba(0, 0, 0, .1);
          }
          .item {
            float: left;
            width: 150px;
            height: 90px;
            // margin-right: 1.5%;
            margin-right: 10px;
            margin-bottom: 10px;
            border: 1px solid #b5b5b5;
            padding:5px;
            position: relative;
            cursor: pointer;
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
  .ItemSellOut-btns-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 55px;
    background-color: white;
    .sellout-habit-switch {
      float: left;
      margin-top: 18px;
      margin-left: 24px;
    }
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

  .mlr10{
    margin: 0 10px;
  }

.lang-enUS{
  .ItemSellOut-msg{
    font-size: 12px;
    .ItemSellOut-type{
      text-align: center;
      padding: 0;
    }
  }
  .ItemSellOut-list{
    
  }
}
</style>
