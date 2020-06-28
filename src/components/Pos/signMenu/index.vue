<template>
    <Dialog
    name="PosDialog.SignMenu"
    :title="$t('Dict.StandardDish')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="false"
    :fullscreen="true"
    width="100%"
    submitId="itemsSellOutSubmit"
  >
    <div class="limitQuantity">
      <div class="module-bill-ItemSellOut">
        <signMenuFilter
          ulId="signMenuFilter"
          ref="limitQuantityKind"
          :itemsBigClass="itemsBigClass"
          :itemsSmallClass="itemsSmallClass"
          @bigClassLiOut="bigClassLiOut"
        >
        </signMenuFilter>
        <div class="ItemSellOut-all-items-box">
          <div class="all-items">
            <Paging
              :data="points"
              :active.sync="newAddItem"
              :itemWidth="160"
              :itemHeight="92"
              ref="signMenuList"
              id="signMenuallItemsUl"
              @getPageData="getPageData"
            >
              <li
                slot-scope="props"
                :class="{'signItemActive':signItemActive === props.item.id+props.item.itemSizeId}"
                :id="'signMenuitemsSellOut'+props.item.id+props.item.itemSizeId"
                @click="itemsSellOut(props.item)"
              >
                <div>
                  <span class="itemId">{{props.item.code}}</span>
                </div>
                <div class="name">
                  <span v-show="props.item.itemSizeName && props.item.itemSizeName != '-'">
                    ({{ props.item.itemSizeName }})
                  </span>
                  {{props.item.name}}
                </div>
                <div class="itemPrice text-right">
                  <span> {{props.item.price}}/{{props.item.unitName}}</span>
                </div>
              </li>
            </Paging>
          </div>
          <div class="signText">
            <span>{{$t('Biz.Pos.SignMenu.SignMenuMsg001')}}</span>
            <span class="signMenuName">{{signItemActiveName ? signItemActiveName:$t('Biz.Pos.SignMenu.SignMenuMsg002')}}</span>
          </div>
        </div>
        <div class="ItemSellOut-btns-footer">
          <div class="borT searchBox">
            <Search
              @search="onSearch"
              ref="searchTextSellOut"
              :resultLength="points.length"
            ></Search>
            <span>{{ $t('Dict.PageStyle.Sim3', [points.length]) }}，</span>
            <PagingBtn
              ref="signMenuListBtn"
              :showInfo="true"
            ></PagingBtn>
          </div>
        </div>
      </div>
    </div>
    <template slot="other-button">
      <button
        type="primary"
        class="btn btn-primary"
        @click="changeNum"
      >{{ $t('Biz.Order.ModifyItemNum') }}
      </button>
    </template>
    <ChangeNum :appendToBody="true" from="signMenu"
      ref="refChangeNum"></ChangeNum>
  </Dialog>
</template>

<script>
import { cloneDeep } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import Search from '@/components/Pos/Order/Tables/Search';
import signMenuFilter from '@/components/Pos/More/LimitQuantity/LimitQuantityKind';
import quickSearch from '@/common/js/quicksearch';
import { mapGetters } from 'vuex';
// 数量
const ChangeNum = () => import('@/components/Pos/Business_commons/ChangeNum');

export default {
  components: {
    Dialog, Search, signMenuFilter, Paging, PagingBtn,
    ChangeNum,
  },
  mixins: [DialogMixin],
  data() {
    return {
      searchText: '', // 搜索文本
      isAllBig: true, // 是否选中全部大类
      selectedBigClass: '', // 选中大类的id
      isAllSmall: true, // 是否选中全部小类
      selectedSmallClass: '', // 选中小类的id
      itemsBigClass: [], // 所有大类
      itemsSmallClass: [], // 所有小类
      allItems: [], // 所有菜品
      signItemActive: '',
      signItemActiveName: '',
      newAddItem: null,
    };
  },
  computed: {
    ...mapGetters(['getVuexItemLimitsMap']),
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
          return ((!keyFilters.length || resultItem)
            && (this.isAllBig || list.bigClassId === this.selectedBigClass)
            && (this.isAllSmall || list.smallClassId === this.selectedSmallClass));
        });
        return filterList;
      }
      return [];
    },
    ...mapGetters(['posItemBigClasses', 'posItemSmallClasses', 'posItems', 'getVuexPosMode']),
  },
  methods: {
    startSignMenu(params) {
      this.$log.info(`标菜开始写入菜品卡`);
      this.$log.info(`标菜写入的参数${JSON.stringify(params)}`);
      this.$devices.ETag.write(
        params,
        (data) => {
          const str = data['ETag.WriteETagRet'];
          if (str) {
            this.$message({
              type: 'success',
              customClass: 'ftBig18',
              message: str,
            });
          }
        },
      );
    },
    endSignMenu() {
      this.$log.info(`标菜结束`);
      this.$devices.ETag.endWrite();
    },
    setNum(num = 1) { // 设置数量
      let list = [];
      let tempItem = cloneDeep(this.newAddItem); // 匹配的品项
      tempItem.num = num; // 品项中数量添加
      let limitItem = this.getVuexItemLimitsMap[`${tempItem.itemId}`];
      if (tempItem.maxAddQty > 99) tempItem.maxAddQty = 99; // 易盘标签数量范围为00-99
      if (limitItem) { // 限量中存在-添加属性
        this.$set(tempItem, 'isLimit', true);
        this.$set(tempItem, 'limitTotal', limitItem.maxLimit);
      }
      list.push(tempItem);
      return new Promise((resolve) => {
        this.$refs.refChangeNum.open({
          list, // 数组
          numTotal: num,
        }, {
          submit: (val) => {
            resolve(val);
          },
          close: () => resolve(num),
        });
      });
    },
    async changeNum() { // 易盘标签增加数量显示
      if (!this.newAddItem) return;
      let ItemCnt = await this.setNum();
      this.itemsSellOut(this.newAddItem, ItemCnt);
    },
    async itemsSellOut(item, ItemCnt = 1) { // 点击品项事件
      if (!item.aidCode || !item.aidCode.length) {
        this.$message.error(this.$t('Biz.Pos.SignMenu.SignMenuMsg003'));
      } else if (item.aidCode.length > 6) {
        this.$message.error(this.$t('Biz.Pos.SignMenu.SignMenuMsg004'));
      } else {
        this.signItemActive = item.id + item.itemSizeId;
        this.signItemActiveName = item.name;
        this.newAddItem = item;
        this.startSignMenu({ ItemID: item.aidCode, ItemCnt });
      }
    },
    bigClassLiOut(isShowItems) { // 选择大类||小类
      this.isAllBig = isShowItems.isAllBig;
      this.selectedBigClass = isShowItems.selectedBigClass;
      this.isAllSmall = isShowItems.isAllSmall;
      this.selectedSmallClass = isShowItems.selectedSmallClass;
    },
    onOpen() {
      this.itemsBigClass = this.posItemBigClasses;
      this.itemsSmallClass = this.posItemSmallClasses;
      // 过滤掉套餐 电子秤
      this.allItems = this.posItems.filter((item) => {
        const {
          isPackage, isWeighed, isConfirmWeigh,
        } = item;
        if (this.getVuexPosMode === '3') {
          return (!isPackage && !isWeighed && !isConfirmWeigh);
        }
        return (!isPackage && !isWeighed);
      });
      this.$nextTick(() => {
        this.$refs.limitQuantityKind.zero();
        setTimeout(() => {
          this.$refs.signMenuListBtn.bind(this.$refs.signMenuList);
          if (this.$refs.signMenuList) {
            this.$refs.signMenuList.refresh();
          }
        }, 200);
      });
    },
    getPageData(data) {
      const findItem = data.find(item => item.id + item.itemSizeId === this.signItemActive);
      if (!findItem) {
        this.signItemActiveName = '';
        this.newAddItem = null;
        this.signItemActive = '';
      } else {
        this.signItemActiveName = findItem.name;
      }
    },
    onClose() { // 关闭弹窗
      this.signItemActiveName = '';
      this.signItemActive = '';
      this.endSignMenu();
      // 清空搜索框
      this.$vemit('clearSearch');
      this.close();
    },
    onSearch(text) {
      this.searchText = text;
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
    width: 370px;
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
    width: 74px;
  }
  .ItemSellOut-count, .ItemSellOut-li-count{
    width: 74px;
  }
  .ItemSellOut-delete, .ItemSellOut-li-delete{
    width: 50px;
  }
  // .ItemSellOut-li-delete{
  //   cursor: pointer;
  //   background: url('./images/itemsDelete.png') no-repeat;
  //   background-position: center center;
  // }
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
    position: relative;
    .ItemSellOut-all-items-box{
      padding-top: 100px;
      padding-bottom: 110px;
      height: 100%;
      .signText{
        text-align: center;
        font-size:18px;
        .signMenuName{
          color:red;
        }
      }
      .all-items{
        height: 100%;
        padding:15px;
        padding-right: 5px;
        padding-bottom: 5px;
        border-top: 1px solid #b5b5b5;
        ul{
          flex-wrap: wrap;
          height: 100%;
          overflow: hidden;
          li{
            // width: 17.7%;
            width: 150px;
            margin-right: 10px;
            margin-bottom: 10px;
            height: 82px;
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
        top: 20px;
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
  .signItemActive{
    background-color:#0babb9;
    color:#fff;
  }
</style>
<style lang="less">
.el-message.ftBig18 { font-size: 18px;
  .el-message__content { font-size: 18px; }
}
  .searchBox{
      .pos-order-tables-search-wrap{
        .pos-order-tables-search{
          background-color: #f5f5f5;
          margin-top:10px;
          margin-left:16px;
          border:1px solid #b5b5b5;
        }
      }
    }
</style>
