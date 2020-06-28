<template>
  <Dialog
    name="PosDialog.NegativeSettlement"
    :title="$t('Biz.Pos.MoreModuleSpan14')"
    ref="dialog"
    top="auto"
    width="1024px"
    height="100%"
    maxHeight="768px"
    @open="onOpen"
    @close="onClose"
    :hotkeys="hotKeySet"
    customClass="moudel-center"
  >
    <div class="negativeSetement-container wrap" id="ngtSettlemetnWrap">
      <!-- 左侧 -->
      <div class="ngtSet-bill-box big-box">
        <div class="bill-header">
          {{ $t('Dict.OperationFlow01') }}{{ bsData.code || ''}}
        </div>
        <div class="bill-main-content">
          <ul id="ngtSettlementBill">
            <li
              v-for="(item, index) in selectedItems"
              :key="item.itemId+'_'+index"
              :class="{active: index === activeBillItem.billIndex}"
              :ref="'billREF'+item.itemId+'_'+index"
              @click="activeBill(item, index)"
            >
              <em>{{ index+1 }}</em>
              <div class="item-main" :class="{isPackge: item.isPackage || item.pkgList}">
                <p>
                  <strong>
                    {{ item.itemName || item.name }}
                  </strong>
                  <span v-if="item.discFlg === 3">
                    {{ $t('Dict.Change') }}
                  </span>
                </p>
                <p>
                  <span>
                    {{`${$t('Dict.UnitPrice1')}${item.price}`}}
                  </span>
                  <span>
                    {{item.qty}}{{item.unitName}}
                  </span>
                  <span>
                    {{$t('Dict.Subtotal1')}}{{numRound(item)}}
                  </span>
                </p>
              </div>
              <ul v-if="item.isPackage || item.pkgList" class="pkgList">
                <li
                  v-for="(list, index) in item.pkgList"
                  :key="item.itemId+list.id+index"
                >
                <p class="pkgItemContent">
                  <i class="icon icon-dian1"></i>
                  <span>
                    {{
                      list.itemType === 2
                      ? '['+$t('Dict.Temporary')+']' + list.name
                      : list.name
                    }}
                  </span>
                  <span>{{ list.num }}{{ list.unitName }}</span>
                </p>
                <p
                  class="pkgListMethod"
                  v-show="list.methodList && list.methodList.length">
                    <span
                      class="pkg-warp">
                      {{
                        $t('Dict.Notes01')
                      }}
                      <template
                        v-for="(method, index) in list.methodList"
                        >
                        {{ index === 0 ? method.name : ` | ${method.name}` }}
                        {{
                          method.price
                            ? (method.qty && method.qty !=1)
                              ? '(+ ' + method.price + 'X' + method.qty + ')'
                              : '(+ ' + method.price + ')'
                            : ''
                        }}
                      </template>
                    </span>
                </p>
                </li>
              </ul>
            </li>
          </ul>
          <div class="bill-pager">
            <span class="bill-num" v-show="billMainData.billAllNum">
              {{ $t('Biz.Order.AllCopies', [billMainData.billAllNum]) }}
            </span>
            <Pager
              pagerId="ngtSettlementBill"
              scrollMode="simple"
              arrowDirection="up-down"
              ref="ngtBillPager"
            ></Pager>
          </div>
        </div>
        <div class="bill-total-content">
          <div>
            <span>{{$t('Dict.Receivable')}}：</span>
            <span>{{ billMainData.billTotal }}</span>
          </div>
          <div>
            <span>{{ $t('Dict.NetReceipts') }}：</span>
            <span>{{ billMainData.billTotal }}</span>
          </div>
        </div>
      </div>
      <!--中间操作功能按钮-->
      <div class="action-btn big-box">
        <ul :class="{ disable: !selectedItems.length }">
          <li
            v-for="(btn, index) in actionBtnData"
            @click="actionBtnClick(btn.methodName)"
            :id="btn.id"
            :key="index"
          >
            {{btn.btnName}}
          </li>
        </ul>
      </div>
      <!-- 右侧 -->
      <div class="ngtSet-menus-box" :class="{oneLineShow: paywayList.length <= 5 }">
          <!-- 类别的数据列表 -->
          <div class="items-class" id="ngtSetItemsClass">
            <div
              class="all-small-class"
              :class="{active: activeClassData.id === allSmallClassBtnData.id }"
              @click="activeClass(allSmallClassBtnData)"
            >
              {{allSmallClassBtnData.name}}
            </div>
            <div
              class="small-class-list"
              :class="{ noPager: !(posItemSmallClasses.length > classPageCount) }"
            >
              <ul>
                <li
                  v-for="list in itemClassLists"
                  :key="list.id"
                  :class="{active: activeClassData.id === list.id }"
                  @click="activeClass(list)"
                >
                  <span>{{list.name}}</span>
                </li>
              </ul>
            </div>
            <div class="small-class-pager" v-if="posItemSmallClasses.length > classPageCount">
              <!-- 进入分页公共组件 -->
              <NumPager
                :total="posItemSmallClasses.length"
                @pagechange="pagechange"
                :displayCount="classPageCount"
                ref="topScroll"
              ></NumPager>
            </div>
          </div>
          <!-- 菜单数据               :class="{active: activeClassData.id == list.id }" -->
          <div class="menus-content">
            <ul class="items-content" ref="itemListBoxStyle" id="ngtItemsListBox">
              <li
                v-for="(item,index) in itemsCurrnetPageShow"
                :key="item.itemId+'_'+ index"
                :class="{ active: activeItemIndex === index }"
                @click="activeItem(index)"
                ref="itemListStyle"
                id="ngtItemsList"
              >
                <p>
                  <span>{{item.code}}</span>
                </p>
                <p>{{item.itemName || item.name}}</p>
                <p>{{item.price}}/{{item.unitName}}</p>
                <em class="showCount" v-show="item.count">{{"x"+item.count}}</em>
              </li>
            </ul>
            <div class="pager-search-content">
              <div class="items-search" @click="()=>{this.$refs.negtArrangeItemsSearch.focus()}">
                <label v-if="isOpen" for>
                  <i class="icon icon-search"></i>
                  <input
                    id="negtArrangeItemsSearch"
                    ref="negtArrangeItemsSearch"
                    type="text"
                    :placeholder="$t('Dict.QuickSearch')"
                    v-switch-keyboard:top="{focusSetKeyboardPosition:'top'}"
                    v-model.trim="itemsSearch"
                    v-judge
                    v-autotest
                  >
                </label>
              </div>
              <div class="items-page-content-show">
                <span>{{ $t('Dict.Altogether') + menusList.length + $t('Dict.Strip')}}</span>
                <span>{{ itemsCurrentPage + '/' + itemsPageTotal + $t('Dict.Page')}}</span>
              </div>
              <div class="items-page-box">
                <!-- 进入分页公共组件 -->
                <NumPager
                  :total="menusList.length"
                  @pagechange="itemsPageChange"
                  :displayCount="itemsPageCount"
                  ref="itemsPageBtn"
                ></NumPager>
              </div>
            </div>
          </div>
          <!-- 结算方式 -->
          <div class="settlement-content" :class="{ disable: !selectedItems.length}">
            <ul>
              <li
                v-for="(list, index) in payListShow"
                :key="list.payway_type_id+ '_'+ index"
                @click="paywayClick(index)"
                :class="{ nextCls: list.id ==='next' }"
              >
                {{ list.name }}
              </li>
            </ul>
          </div>
      </div>
    </div>
    <PackageChangeNum
      ref="ngtSettlementCnum"
      submitId="ngtSettlementModifyNum"></PackageChangeNum>
    <OrderingChangePrice
      ref="ngtChangePrice"
      :appendToBody="true"
      type="ngtOrdering"></OrderingChangePrice>
    <!-- 宴会套餐 -->
    <PackagePart
      ref="ngtPackagePart"
      :appendToBody="true"
      type="ngtPackagePart"
      :isNgtMenu="true"
      submitId="ngtPackagePart"></PackagePart>
    <NSettleGroupAccounts
      ref="nSettleGroupAccounts"
      :bsData="bsData"
      :amountToBePaid="billMainData.billTotal"
      @doSettle="goPay"></NSettleGroupAccounts>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  sortBy,
  isEmpty,
  cloneDeep,
  find,
} from 'lodash';
import ajax from '@/common/js/ajax';
import quickSearch from '@/common/js/quicksearch';
import Pager from '@/components/Pos/Common/Pager';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationScrollMixin';
import NumPager from '@/components/Pos/Common/NumPager';

import {
  add,
  sub,
  multi,
  round,
} from '@/common/js/math';
import * as KeyboardUtil from '@/plugin/keyboard/util';
// 改量
const PackageChangeNum = (resolve) => {
  import('../ArrangeMenu/PackageChangeNum').then((module) => {
    resolve(module);
  });
};
// 改价
const OrderingChangePrice = (resolve) => {
  import('@/components/Pos/Ordering/OrderingBtnsFunc/OrderingChangePrice').then((module) => {
    resolve(module);
  });
};
// 宴会套餐
const PackagePart = (resolve) => {
  import('@/components/Pos/Ordering/Menu/Package/PackagePart').then((module) => {
    resolve(module);
  });
};
// 结算-集团负挂账
const NSettleGroupAccounts = (resolve) => {
  import('./NSettleGroupAccounts').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    Pager,
    Dialog,
    NumPager,
    quickSearch,
    PackageChangeNum,
    OrderingChangePrice,
    PackagePart,
    NSettleGroupAccounts,
  },
  mixins: [DialogMixin, PageMixin],
  props: {
    // arrangeMenuOpenType: {
    //   type: String,
    //   default: '',
    // },
  },
  data() {
    return {
      // 功能按钮数量
      actionBtnData: [
        {
          btnName: '删除',
          methodName: 'delete',
          id: 'ngtSetDelete',
        },
        {
          btnName: '数量',
          methodName: 'numChange',
          id: 'ngtSetNumChange',
        },
        {
          btnName: '价格',
          methodName: 'priceChange',
          id: 'ngtSetPriceChange',
          disable: false,
        },
        {
          btnName: '清空',
          methodName: 'emptyBill',
          id: 'ngtSetEmptyBill',
          disable: false,
        },
      ],
      // 全部小类按钮数据
      allSmallClassBtnData: {
        id: 'all',
        name: this.$t('Dict.AllSubclass'), // 全部小类
      },
      items: [],
      activeClassData: {},
      // 类一页显示几个
      classPageCount: 6,
      // 当前页数 这是类table的分页
      classCurrentPage: 1,
      // 缓存下过滤后的每个类对应的菜品数据
      classFilterItems: {},
      // 菜单品项搜索内容
      itemsSearch: '',
      // 菜品每页显示的条数
      itemsPageCount: 25,
      // 每个菜品的width/height
      itemListStyle: { width: 120, heigth: 82 },
      // 整个菜品容器的width/height
      itemListBoxStyle: { width: 513, heigth: 565 },
      // 菜品当前页数的
      itemsCurrentPage: 1,
      // 当前菜单选中的菜在当前页的下标
      activeItemIndex: 0,
      isOpen: false,
      // 左侧账单的数据
      selectedItems: [],
      // 账单选中的数据
      activeBillItem: null,
      // 整个负结算弹框需要的信息
      bsData: {},
      // 结算方式
      paywayList: [],
      // 结算方式当前页
      payCurrentPage: 1,
      payPageCount: 9,
    };
  },
  mounted() {
  },
  computed: {
    // 快捷键 posItemSmallClasses 小类类别的数据， posItemCustomClasses 自定义类别的数据
    hotKeySet() {
      return {
        ...this.setKeySearchHotKey(),
        BackSpace: () => {
          this.delWordInBlur();
        },
        // PgDn: () => {
        //   if (!this.leftInputFocus) {
        //     this.onSubmit();
        //   }
        // },
        // F1: () => {
        //   if (!this.leftInputFocus) {
        //     this.saveAsArrangeMenu();
        //   }
        // },
        // '↑': () => {
        //   if (!this.leftInputFocus) {
        //     this.upArrow();
        //   }
        // },
        // '↓': () => {
        //   if (!this.leftInputFocus) {
        //     this.downArrow();
        //   }
        // },
        // '←': () => {
        //   if (!this.leftInputFocus) {
        //     this.leftArrow();
        //   }
        // },
        // '→': () => {
        //   if (!this.leftInputFocus) {
        //     this.rightArrow();
        //   }
        // },
        Enter: () => {
          this.activeItem(this.activeItemIndex);
        },
      };
    },
    ...mapGetters([
      'posItemSmallClasses',
      'ArrangeMenu',
      'posSettings',
      'posBaseInfo',
      'posInfo',
    ]),
    // 菜类渲染的数据
    itemClassLists() {
      if (this.posItemSmallClasses.length > this.classPageCount) {
        // 截取的起始和终止的index  下标
        const startIdex = 0 + (this.classCurrentPage - 1) * this.classPageCount;
        const endIdex = this.classCurrentPage * this.classPageCount > this.posItemSmallClasses.length
          ? this.posItemSmallClasses.length + 1
          : this.classCurrentPage * this.classPageCount + 1;
        return this.posItemSmallClasses.slice(startIdex, endIdex);
      }
      return this.posItemSmallClasses;
    },
    // 菜单显示总数据数据
    menusList() {
      // 根据类过滤
      let filterItems = [];
      if (this.activeClassData.id === 'all') {
        filterItems = this.items;
      } else {
        filterItems = this.classFilterItems[this.activeClassData.id]
          ? this.classFilterItems[this.activeClassData.id]
          : this.items.filter(item => item.smallClassId === this.activeClassData.id);
      }
      // 在根据search内容过滤
      if (this.itemsSearch.length > 0) {
        filterItems = filterItems.filter((item) => {
          const keyFilters = quickSearch((this.itemsSearch.toString()).toLowerCase()); // 从这对数据进行处理
          const code = (item.code.toString()).toLowerCase(); // code代码
          const name = item.code.toLowerCase(); // 名称
          const pinyin = item.pinyin.toLowerCase(); // 拼音
          const barcode = item.barcode || ''; // 条码,数字格式
          return (() => {
            for (let i = 0; i < keyFilters.length; i += 1) {
              const key = keyFilters[i];
              if (
                code.indexOf(key) !== -1
                || name.indexOf(key) !== -1
                || pinyin.indexOf(key) !== -1
                || barcode.indexOf(key) !== -1
              ) {
                return true;
              }
            }
            return false;
          })();
        });
      }
      this.destructionItemsPage();
      return filterItems;
    },
    // 菜品的分页起始位置
    getItemsStartIdex() {
      return (this.itemsCurrentPage - 1) * this.itemsPageCount;
    },
    // 菜品的分页终止位置
    getItemsEndIdex() {
      return this.itemsCurrentPage * this.itemsPageCount > this.menusList.length
        ? this.menusList.length
        : this.itemsCurrentPage * this.itemsPageCount;
    },
    // 菜品显示的数据只是当前页的数据 对过滤完的数据filterItems做下分页处理
    itemsCurrnetPageShow() {
      // 截取的起始和终止的index  下标
      const showMenus = cloneDeep(this.menusList.slice(
        this.getItemsStartIdex,
        this.getItemsEndIdex,
      ));
      // 对显示的数据匹配已点的数
      showMenus.forEach((menu) => {
        this.$set(menu, 'count', 0);
        this.selectedItems.forEach((item) => {
          if (menu.itemId === item.itemId) {
            if (menu.count) {
              this.$set(menu, 'count', add(menu.count, Number(item.qty)));
            } else {
              this.$set(menu, 'count', Number(item.qty));
            }
          }
        });
      });
      return showMenus;
    },
    // 总页数
    itemsPageTotal() {
      return Math.ceil(this.menusList.length / this.itemsPageCount);
    },
    // 账单的总分数和合计
    billMainData() {
      let billTotal = 0; let billAllNum = 0;
      this.selectedItems.forEach((item) => {
        billTotal = add(billTotal, round(multi(item.qty, item.price)));
        billAllNum = add(billAllNum, item.qty);
      });
      billTotal = -billTotal;
      return { billTotal, billAllNum };
    },
    // 结算方式数据
    payListShow() {
      // payPageCount: 9,
      // 进行分页操作 payCurrentPage payCurrentPage
      // const pageTotal = Math.ceil(this.paywayList.length / 9);
      const sartIndex = (this.payCurrentPage - 1) * this.payPageCount;
      if (this.paywayList.length > 10) {
        return [...this.paywayList.slice(sartIndex, sartIndex + this.payPageCount), {
          name: this.$t('Dict.NextPage'),
          id: 'next',
        }];
      }
      return this.paywayList;
    },
  },
  methods: {
    // 四舍五入
    numRound(item) {
      return round(multi(item.qty, item.price));
    },
    // 设置搜索热键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          // 判断左侧输入的input框是否是聚焦
          this.inputKey(item);
        };
      });
      return keysObj;
    },
    // 右侧input框的录入
    inputKey(val) {
      if (
        document.hasFocus()
        && document.activeElement === this.$refs.negtArrangeItemsSearch
      ) { return; }
      this.itemsSearch = `${this.itemsSearch}${val}`;
    },
    // 在没有焦点情况下删除最后一个文本
    delWordInBlur() {
      if (
        document.hasFocus()
        && document.activeElement === this.$refs.negtArrangeItemsSearch
      ) { return; }
      this.itemsSearch = KeyboardUtil.deleteLastChar(this.itemsSearch);
    },
    // 类分页点击事件
    pagechange(current) {
      console.log(current);
      this.classCurrentPage = current;
    },
    // 菜单分页点击事件
    itemsPageChange(current) {
      this.itemsCurrentPage = current;
      setTimeout(() => {
        if (this.itemsCurrnetPageShow.length < this.activeItemIndex + 1) {
          this.activeItemIndex = 0;
        }
      }, 0);
    },
    // 菜品分页组件的销毁
    destructionItemsPage() {
      this.itemsCurrentPage = 1;
      this.activeItemIndex = 0;
      if (this.$refs.itemsPageBtn) {
        this.$refs.itemsPageBtn.init();
      }
    },
    onOpen() {
      this.bsData = this.resData.bsData;
      this.paywayList = [...this.resData.paywayList];
      this.isOpen = true;
      this.initSmallClassPager();
      this.initMenus();
      setTimeout(() => {
        this.initMenuPager();
        this.$refs.ngtBillPager.refresh();
      }, 0);
    },
    // 公共初始化
    publicInit() {
      this.itemsSearch = '';
      this.selectedItems = [];
      this.destructionItemsPage();
      this.activeBillItem = null;
      this.payCurrentPage = 1;
    },
    onClose() {
      this.isOpen = false;
      this.bsData = {};
      this.paywayList = [];
      this.publicInit();
    },
    // 菜单分页
    initMenuPager() {
      // 10是padding值加border的和
      this.itemsCurrentPage = 1;
      this.itemListStyle = this.getDomWithdAndHeight('ngtItemsList');
      this.itemListBoxStyle = this.getDomWithdAndHeight('ngtItemsListBox');
      const itemsRowCount = Math.floor(
        (this.itemListBoxStyle.height - 10) / this.itemListStyle.height,
      );
      const itemsRowShowNumber = Math.floor(
        (this.itemListBoxStyle.width - 10) / this.itemListStyle.width,
      );
      this.itemsPageCount = itemsRowShowNumber * itemsRowCount;
      console.log(this.itemsPageCount);
    },
    getDomWithdAndHeight(domId) {
      return document.getElementById(domId)
        ? {
          width: document.getElementById(domId).offsetWidth,
          height: document.getElementById(domId).offsetHeight,
        }
        : { width: 0, height: 0 };
    },
    // 初始化菜
    initMenus() {
      this.items = cloneDeep(
        this.ArrangeMenu.filter(menu => !menu.isPackage || menu.pkgType === 1),
      );
    },
    // 初始化下小类的分页以及默认选中事件
    initSmallClassPager() {
      // 默认选中时全部小类
      this.activeClassData = this.allSmallClassBtnData;
      this.classCurrentPage = 1;
    },
    // 小类的点击事件
    activeClass(list) {
      if (list !== this.activeClassData) {
        this.activeClassData = list;
        this.activeClassData[this.activeClassData.id] = this.items.filter(
          item => item.smallClassId === this.activeClassData.id,
        );
      }
    },
    // 执行加单操作
    activeItem(index) {
      this.activeItemIndex = index;
      const actItem = cloneDeep(this.itemsCurrnetPageShow[index]);
      // 如果是套餐
      if (actItem.isPackage) {
        this.requestPackgeItem(actItem, false);
      } else {
        this.addItem(actItem);
      }
    },
    // 9800000000008270
    // 套餐数据的处理isDesignates
    requestPackgeItem(item, isModify) {
      const options = {
        params: {
          pkgId: item.itemId.split('_')[0],
          scId: item.scId ? item.scId : '',
          pointId: this.bsData.pointId,
          isBuffet: false, // 是否是自助模式
        },
        needLog: true,
      };
      ajax('canyin.pos.bill.itempkgpart', options).then((res) => {
        const cloneRes = cloneDeep(res);
        // eslint-disable-next-line no-unused-vars
        this.openPackagePartMoudle(cloneRes, item, isModify);
      });
    },
    openPackagePartMoudle(res, item, isModify = false) {
      this.$refs.ngtPackagePart.open(res, {
        submit: (pkgPartData, pkgData) => {
          // pkgPartData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
          this.$refs.ngtPackagePart.close();// 关闭弹框
          const newItem = {
            ...item,
            qty: pkgPartData.num,
            stdPrice: pkgPartData.price,
            salePrice: item.salePrice,
            costPrice: pkgPartData.costPrice,
            discFlg: pkgPartData.discFlg,
            priceType: +pkgPartData.discFlg === 3 ? 4 : item.priceType,
            pkgList: pkgPartData.pkgList,
            price: pkgPartData.price,
            pkgData,
            itemType: this.SUBMIT_ITEM_TYPE_PKG_PART,
            pkgType: 1,
            isNotFollowAmount: pkgPartData.isNotFollowAmount,
          };
          if (!isModify) {
            this.addItem(newItem);
          } else {
            this.selectedItems.splice(item.billIndex, 1, newItem);
          }
        },
      });
    },
    addItem(actItem) {
      // 如果没有默认添加数为1
      if (!actItem.qty) {
        this.$set(actItem, 'qty', 1);
      }
      let sindex = null;
      // 如果开启了合并 需要走下是否满足合并
      if (this.posSettings.isMergeAddBill && !actItem.isPackage) {
        this.selectedItems.forEach((item, index) => {
          // discFlg 0正常 1赠送 2打折 3变价
          if (item.discFlg === actItem.discFlg
            && item.itemId === actItem.itemId
          ) {
            sindex = index;
          }
        });
      }
      if (sindex === null) {
        const itemIndex = this.selectedItems.length;
        this.$set(actItem, 'billIndex', itemIndex);
        this.selectedItems.push(actItem);
      } else {
        this.$set(this.selectedItems[sindex], 'billIndex', sindex);
        this.$set(this.selectedItems[sindex], 'qty', add(this.selectedItems[sindex].qty, actItem.qty));
      }
      this.activeBillItem = this.selectedItems[sindex] || actItem;
      // 强制刷新下分页
      setTimeout(() => {
        this.$refs.ngtBillPager.pushRefresh();
      }, 40);
      // 执行滑动
      setTimeout(() => {
        this.scrollToCurrSmallClassArea();
      }, 80);
    },
    scrollToCurrSmallClassArea() {
      // 当前所加品项 在列表中是选中的, 保存该数据DOM节点'billREF'+item.itemId+'_'+index
      const tmpDOM = this.$refs[
        `billREF${
          this.activeBillItem.itemId
        }_${
          this.activeBillItem.billIndex
        }`
      ][0];
      // 执行滑动, 保持总在账单可视区域(底部)
      tmpDOM.scrollIntoView({ block: 'end' });
    },
    activeBill(item, index) {
      // 如果是证明已选中
      if (this.activeBillItem.billIndex === index && item.isPackage) {
        const pkgData = cloneDeep(item.pkgData);
        pkgData.package.lastQty = item.qty;
        pkgData.package.price = item.price;
        pkgData.package.discFlg = item.discFlg || 0;
        pkgData.package.priLocals = null;
        this.openPackagePartMoudle(pkgData, this.activeBillItem, true);
      }
      this.activeBillItem = { ...item, billIndex: index };
    },
    // 功能按钮的方法
    actionBtnClick(methodName) {
      if (this[methodName]) {
        this[methodName]();
      }
    },
    delete() {
      // 如果是最后一个
      const activeIndex = this.activeBillItem.billIndex;
      this.selectedItems.splice(this.activeBillItem.billIndex, 1);
      // 如果数据空了
      if (this.selectedItems.length === 0) {
        this.activeBillItem = null;
      } else if (this.selectedItems[activeIndex]) {
        this.activeBillItem = { ...this.selectedItems[activeIndex], billIndex: activeIndex };
      } else {
        this.activeBillItem = { ...this.selectedItems[activeIndex - 1], billIndex: activeIndex - 1 };
      }
    },
    emptyBill() {
      this.selectedItems.splice(0, this.selectedItems.length);
      this.activeBillItem = null;
    },
    numChange() {
      // 改量 组合弹框所需要的数据
      const itemChangeData = {
        num: Number(this.activeBillItem.qty), // 当前选择的品项数量值
        itemName: this.activeBillItem.itemName, // 品项名称
        itemUnitName: this.activeBillItem.unitName, // 单位名称
      };
      // // //改量弹框
      this.$refs.ngtSettlementCnum.open(itemChangeData, {
        submit: (changeNumData) => {
          this.$refs.ngtSettlementCnum.close();
          this.selectedItems[this.activeBillItem.billIndex].qty = changeNumData.num;
        },
      });
    },
    priceChange() {
      const handleItem = [{
        name: this.activeBillItem.itemName,
        unitName: this.activeBillItem.unitName,
        num: this.activeBillItem.qty,
        price: this.activeBillItem.price,
        stdPrice: this.activeBillItem.price,
      }];
      this.$refs.ngtChangePrice.open(handleItem, {
        submit: (price) => {
          const item = this.selectedItems[this.activeBillItem.billIndex];
          this.selectedItems.splice(
            this.activeBillItem.billIndex, 1,
            {
              ...item, discFlg: 3, price, salePrice: price, priceType: 4,
            },
          );
        },
      });
    },
    // 结算的方法
    paywayClick(index) {
      if (this.payListShow[index].id === 'next') {
        if (this.payCurrentPage === Math.ceil(this.paywayList.length / 9)) {
          this.payCurrentPage = 1;
        } else {
          this.payCurrentPage += 1;
        }
        // 结算按钮
      } else if (this.payListShow[index].id === '60') {
        this.$refs.nSettleGroupAccounts.open(this.payListShow[index]);
      } else {
        console.log(this.selectedItems);
        this.goPay(this.payListShow[index]);
      }
    },
    // 刷新下账单
    loadBs() {
      ajax('canyin.pos.negativesettle.view', {
        params: {},
      }).then((res) => {
        // 数据
        if (res.success) {
          this.bsData = res.data.bsData;
          this.paywayList = res.data.paywayList;
          setTimeout(() => {
            this.initMenuPager();
            this.$refs.ngtBillPager.refresh();
          }, 0);
          this.publicInit();
        }
      });
    },
    // 结算
    goPay(payData, authData = {}, type = '', callback) {
      this.$vonce('authCode', (code) => {
        this.goPay(payData, code, type, callback);
      });
      const params = this.getSubmitData(payData, authData, type);
      ajax('canyin.pos.negativesettle.commit', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        if (res.success) {
          this.$message.success(this.$t('Dict.SuccessfulSettlement'));
          // 回调专为"集团负挂账"使用, 关闭页面
          if (callback) {
            callback(true);
          }
          // 刷新下流水
          this.loadBs();
        } else if (res.result === -2) {
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 五 结算相关打印部分, 并口打印需要的数据搜集*/
    asyncPrintDataPrepare(payName, paywayId) {
      const openTime = new Date(
        this.bsData.openTime
          .replace(new RegExp('-', 'gm'), '/')
          .replace(new RegExp('T'), ' '),
      ).getTime();
      const reaName = this.bsData.pointName == null || this.bsData.pointName === 'undefined'
        ? ''
        : this.bsData.pointName.split('.')[0];
      const pointCode = this.bsData.pointName == null || this.bsData.pointName === 'undefined'
        ? ''
        : this.bsData.pointName.split('.')[1].split('-')[0];
      const pointDisplayName = this.bsData.pointName == null || this.bsData.pointName === 'undefined'
        ? ''
        : this.bsData.pointName.split('.')[1];
      const crmPayMoney = 0;
      const DS1 = [
        {
          bsCode: this.bsData.code, // 营业流水号
          bsId: this.bsData.id, // bsid
          peopleQty: this.bsData.peopleQty, // 人数
          itemOrigMoney: 0, // 最终的费用合计
          origTotal: 0, // 应收
          address: this.posBaseInfo.address,
          areaCode: '',
          areaId: '',
          reaName,
          canceldBill: '',
          contact_tel: this.posBaseInfo.contactTel,
          createShopName: this.posBaseInfo.createShopName,
          slogan: this.posBaseInfo.slogan ? '' : this.posBaseInfo.slogan,
          discInfo: '', // 优惠信息
          discTotal: 0, // 优惠合计 折扣金额 + 抹零金额
          giveChange: 0, // 不弹框的找零的情况下 找零金额
          jzdPrintCount: 1,
          lastTotal: this.billMainData.billTotal, // 实收金额
          openShiftName: '',
          openTime,
          operName: this.posBaseInfo.user.name,
          orderCode: '', // 牌号
          pointCode,
          pointDisplayName,
          pointId: this.bsData.pointId,
          pointName:
            this.bsData.pointName == null || this.bsData.pointName == 'undefined'
              ? ''
              : this.bsData.pointName,
          presentMoney: 0, // 赠送的合计
          saleTypeId: this.bsData.saleTypeId,
          settleEmpName: this.posBaseInfo.user.username, // 收银员登陆者员工代号
          settleTime: new Date().valueOf(),
          takeMoney: this.billMainData.billTotal, // 收款金额
          wipeMoney: 0, // 抹零金额
          yjdPrintCount: '',
          ssRemark: '', // 整单备注
          crmPayMoney,
        },
      ];
      const DS2 = [];
      // 国际化遗留 货币
      const DS3 = [
        {
          payMoney: this.billMainData.billTotal,
          paywayId: paywayId || 1,
          paywayName: payName || '人民币',
          // payWayTypeFlg: this.otherPayWayTypeFlg === 4 ? 4 : 1, // 现金类
          payWayTypeFlg: 1,
        },
      ];
      const DS5 = [];
      // 打印需要的最终数据
      const { parallelPrinter } = this.posInfo;
      return {
        fileid: parallelPrinter != null ? parallelPrinter.style_id : '',
        exporttype: 1,
        printer: parallelPrinter != null ? parallelPrinter.printer : '',
        printcnt: parallelPrinter != null ? parallelPrinter.print_times : '',
        posid: this.posBaseInfo.id,
        DS1,
        DS2,
        DS3,
        DS4: [],
        DS5,
        DS6: [],
        DS7: [],
        DS8: [],
        DS9: [],
        DS10: [],
      };
    },
    // 数据
    getSubmitData(payData, authData, type = '') {
      const params = {
        posId: this.posBaseInfo.id, // 当前posId
        point_id: this.bsData.pointId, // 当前客位Id
        bsId: this.bsData.id, // 当前营业流水
        controlMode: '1',
        items: this.getBillItems(), // 加单数据
        orderCode: '',
        peopleQty: this.bsData.peopleQty,
        saleTypeId: this.bsData.saleTypeId, // 当前销售类型
        payMoney: this.billMainData.billTotal, // 收款金额
        takeMoney: this.billMainData.billTotal, // 收款金额
        lastTotal: this.billMainData.billTotal, // 实收
        giveMoney: 0, // 找零金额
        giveChange: 0,
        discountPlanId: null, // 执行打折方案 第N杯打折
        isCrmMixSettle: '0', // 快餐模式支付是否还有会员卡支付信息 使用会员卡为1
        printData: JSON.stringify(this.asyncPrintDataPrepare(payData.name, payData.id)), // 打印数据
        orderCodeMode: '', // 获取当前牌号模式(非后台设置牌号)
        ssRemark: '', // 备注内容
        orderSource: 1,
        paywayId: payData.id,
        paywayTypeId: payData.payway_type_id,
        ...authData,
      };
      // 如果是集团挂账,添加参数
      if (type === 'groupAccounts') {
        params.bizTsPwCompanyUnpaidDTOList = payData.accounts;
      }
      return params;
    },
    // 组装账单菜品数据
    getBillItems() {
      const items = [];
      this.selectedItems.forEach((list) => {
        const item = {
          costPrice: list.costPrice, // 成本价格
          isCanDiscount: list.isCanDiscount,
          discFlg: list.discFlg, // 打折标识
          scaleFlg: list.webScaleFlg,
          enableHalf: list.enableHalf, // 是否允许半份
          isWeighed: list.isWeighed, // 是否是开启了适用电子秤
          isSingleMethod: list.isSingleMethod, // 是否是开启专属做法
          isConfirmWeigh: list.isConfirmWeigh, // 是否是开启称重确认
          isNegativePrice: list.isNegativePrice,
          method_list: [], // 做法数据
          packFlg: list.isPack,
          totalMakeFee: 0, // 品项所有做法加价的总额
          is_buffet: list.isDinnerBuffet, // 是否是自助模式
          is_present_item: '', // 是否是赠送品项
          reason_id: list.reasonId,
          itemCode: list.code,
          itemName: list.itemName, // 品项名称
          item_name: list.itemName, // 品项名称
          item_id: list.realItemId, // 品项id
          item_size_id: list.sizeId || list.itemSizeId, // 规格id
          item_type: list.isPackage ? 4 : 1, // 1正常品项，2临时品项，3常规套餐品项，4 宴会套餐品项
          memberPrice: list.memberPrice, // 会员价格
          orderId: list.orderId ? list.orderId : '', // 是否是预点单过来的品项
          origPrice: list.price, // 这个代表的是最终的加单价格,比如执行会员价,就是会员的价格
          salePrice: list.discFlg === 3 ? list.price : list.salePrice, // 这个是销售价格只有在变价的时候才传变价完的价格,其他都是自己的销售价格不变
          stdPrice: list.stdPrice, // 这个是标准价格
          promotePrice: list.promotePrice ? list.promotePrice : 0, // 这个是促销价格
          isItemTimePrice: list.isItemTimePrice ? list.isItemTimePrice : false,
          priceType: list.priceType, //
          qty: list.qty,
          lastSubtotal: multi(list.price, list.qty),
          exchangeId: list.exchangeId ? list.exchangeId : null,
          promoteLimitedQty: (list.promoteLimit || list.promoteLimit === 0) ? list.promoteLimit : '',
          isPackage: list.isPackage,
          params: {
            price: list.price,
            unitName: list.unitName,
            disPrice: (list.disPrice || +list.disPrice === 0) ? list.disPrice : null,
          }, // //暂存额外的参数
          real_item_id: list.realItemId,
          serve_way_id: 0,
          unitId: list.unitId,
          saleTypeId: this.bsData.saleTypeId,
          busiType: list.isPincai ? 1 : 0,
          itemIndex: '',
          mergeItemIndex: list.bindId ? list.bindId : '',
          memberPlanId: list.memberPlanId ? list.memberPlanId : null, // 销售会员价方案ID
          promotePlanId: list.promotePlanId ? list.promotePlanId : null, // 促销价方案ID
        };
        // 如果是套餐
        if (list.isPackage) {
          // 联动回退
          // //信息中增加isNotFollowAmount属性，true为套餐明细数量不跟主套餐数量联动，否则均为联动
          item.isNotFollowAmount = list.isNotFollowAmount;
          // 套餐的明细品项加价的总和
          const tmpPkgRaisePrice = list.pkgRaisePrice ? list.pkgRaisePrice : 0;
          item.raisePrice = list.raisePrice ? list.raisePrice : tmpPkgRaisePrice;
          // 套餐明细加价类型
          item.raisePriceType = list.raisePriceType;
          // 套餐明细会员加价
          item.raiseMemberPrice = list.raiseMemberPrice || list.raiseMemberPrice === 0 ? list.raiseMemberPrice : null;
          // 宴会套餐添加个pkgPartPrice属性
          if (+list.pkgType === 1) {
            item.pkgPartPrice = list.price;
          }
          const pkgList = [];
          list.pkgList.forEach((_) => {
            const pkgItemData = {
              smallClassId: _.smallClassId, // 品项小类Id
              costPrice: _.costPrice,
              discFlg: list.discFlg, // 折扣走主套餐的
              is_buffet: list.isDinnerBuffet, // 是否是自助模式s
              itemCode: _.code,
              itemName: _.name,
              item_id: _.id ? _.id : _.itemId, // 已入库的品项是不存在id 所以加一个判断
              real_item_id: _.id,
              item_size_id: _.sizeId ? _.sizeId : _.itemSizeId, // //已入库的品项是不存在sizeId 所以加一个判断
              serve_way_id: (_.serveWay && _.serveWay.id) ? _.serveWay.id : 0,
              unitId: _.unitId,
              qty: _.num ? _.num : _.qty, // 已入库的品项是不存在num 所以加一个判断
              isItemTimePrice: _.isItemTimePrice ? _.isItemTimePrice : false, // 是否是时价
              raisePrice: _.bsId ? _.realRaisePrice : _.raisePrice, // 如果入库了,取realRaisePrice,否则取raisePrice
              raiseMemberPrice: _.raiseMemberPrice,
              isRaiseByQty: _.isRaiseByQty,
              item_type: 5, // 套餐明细里的品项类型为5
              params: {
                unitName: _.unitName,
                qty: _.num ? _.num : _.qty, // 已入库的品项是不存在num 所以加一个判断
              },
              saleTypeId: this.saleTypeId,
              apportionFlg: _.apportionFlg, // 是否参与分摊
            };
            // 添加 raisePriceType 常规套餐明细加价类型
            if (+list.itemType === 3) {
              if (+list.raisePriceType === 2 && (_.raiseMemberPrice || +_.raiseMemberPrice === 0)) {
                pkgItemData.raisePriceType = 2; // raisePriceType 为2 执行会员价
              } else {
                pkgItemData.raisePriceType = 1; // raisePriceType 为1 不存在后者是没验证会员的时候执行的普通加价
              }
            }
            // 判断有做法存在就添加
            if (_.methodList && _.methodList.length) {
              pkgItemData.method_list = this.submitItemMethod(_.methodList);
            }
            pkgList.push(pkgItemData);
          });
          // 添加套餐明细
          item.pkg_list = pkgList;
        }
        items.push(item);
      });
      return items;
    },
  },
  watch: {},
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "../Booking/BookingCommon/common.less";

@left-div: 430px;
@class-active-color: #0babb9;
@border-style: 1px solid #b5b5b5;
.wrap {
  width: 100%;
  height: 100%;
  font-size: 0;
  position: relative;
}
.negativeSetement-container {
  i {
    font-style: normal;
  }
  em {
    font-style: normal;
  }
  .big-box {
    font-size: 14px;
    height: 100%;
  }
  .ngtSet-bill-box {
    background-color: #f5f5f5;
    font-size: 14px;
    width: 310px;
    float: left;
    position: relative;
    .bill-header {
      height: 32px;
      width: 100%;
      padding: 10px 10px 0px 10px;
    }
    .bill-main-content {
      position: absolute;
      top: 42px;
      bottom: 92px;
      left: 0;
      right: 0px;
      background-color: #ffffff;
      font-size: 12px;
      >ul {
        position: absolute;
        top: 0px;
        bottom: 48px;
        width: 100%;
        overflow: hidden;
        overflow-y: auto;
        >li {
          padding: 8px 10px 2px 28px;
          position: relative;
          border-bottom: 1px solid #b5b5b5;
          cursor: pointer;
          &.active{
            background-color: #ddf1f6;
          }
          >em {
            position: absolute;
            left: 4px;
            top: 10px;
            display: inline-block;
            height: 16px;
            padding-left: 4px;
            padding-right: 4px;
            font-size: 12px;
            line-height: 16px;
            border-radius: 8px;
            background-color: #aebfc7;
            color: #fff;
            font-style: normal;
          }
          >.item-main {
            &.isPackge {
              box-shadow: 1px 0px 1px 1px #678;
              border-radius: 2px;
              cursor: pointer;
            }
            >p:nth-of-type(1) {
              white-space: nowrap;
              overflow: hidden;
              font-size: 14px;
              >span {
                min-width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
                font-size: 12px;
                color: #fff;
                font-style: normal;
                margin-left: 2px;
                margin-right: 2px;
                float: right;
                background-color: #ce4ff4;
              }
            }
            >p:nth-of-type(2) {
              >span {
                display: inline-block;
                width: 92px;
                overflow: hidden;
                white-space: nowrap;
                &:nth-of-type(2) {
                  width: 70px;
                  text-align: center;
                }
                &:nth-of-type(3) {
                  text-align: right;
                }
              }
            }
          }
          >.pkgList {
            li {
              border: none;
              padding: 2px 0px;
              >.pkgItemContent {
                padding-left: 16px;
                line-height: 15px;
                margin-top: 2px;
                padding-right: 84px;
                position: relative;
                > span {
                  display: inline-block;
                  text-align: center;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                }
                > span:nth-of-type(1) {
                  width: 90px;
                  text-align: left;
                }
                > span:nth-of-type(2) {
                  width: 68px;
                }
                > i {
                  font-size: 12px;
                  position: absolute;
                  left: 0px;
                }
              }
              >.pkgListMethod {
                padding-left: 16px;
              }
            }
          }
        }
      }
      >.bill-pager {
        position: absolute;
        bottom: 0px;
        width: 100%;
        height: 48px;
        padding: 6px 0px;
        border-top: 1px solid #b5b5b5;
        border-bottom: 1px solid #b5b5b5;
        >.bill-num {
          display: inline-block;
          padding: 7px;
          padding-left: 16px;
        }
        >.pos-pager {
          width: 120px;
          float: right;
        }
      }
    }
    .bill-total-content {
      position: absolute;
      height: 92px;
      bottom: 0px;
      left: 0px;
      right: 0px;
      background-color: #ffffff;
      padding: 6px;
      >div {
        padding: 8px;
        &:nth-child(2){
          >span:nth-child(2) {
            color: #0babb9;
          }
        }
        >span {
          display: inline-block;
          font-size: 16px;
          font-weight: bold;
          &:nth-child(2) {
            width: 188px;
            float: right;
            text-align: right;
            padding-right: 31px;
          }
        }
      }
    }
  }
  .action-btn {
    width: 56px;
    float: left;
    font-size: 14px;
    &::before {
      content: " ";
      position: absolute;
      border-left: 4px solid;
      height: 100%;
      border-color: rgba(197, 197, 197, 0.3);
      z-index: 1;
    }
    > ul {
      &.disable{
        pointer-events: none;
        opacity: 0.8;
      }
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      > li {
        margin-bottom: 2px;
        padding-left: 3px;
        background-color: #fff;
        border-radius: 0px 5px 5px 0px;
        height: 48px;
        width: 52px;
        overflow: hidden;
        cursor: pointer;
        text-align: center;
        line-height: 44px;
      }
    }
  }
  .ngtSet-menus-box {
    font-size: 14px;
    right: 13px;
    position: absolute;
    left: 366px;
    top: 13px;
    bottom: 13px;
    background-color: #ffffff;
    &.oneLineShow {
      >.menus-content {
        bottom: 66px;
      }
      >.settlement-content {
        height: 66px;
        >ul {
          overflow: hidden;
          padding: 0px;
        }
      }
    }
    >.items-class {
      height: 57px;
      cursor: pointer;
      position: relative;
      border-bottom: @border-style;
      >div {
        height: 100%;
        float: left;
        &.all-small-class {
          line-height: 56px;
          width: 66px;
          text-align: center;
          color: #666666;
        }
        &.small-class-list {
          overflow: hidden;
          position: absolute;
          left: 66px;
          height: 56px;
          right: 120px;
          border-right: @border-style;
          box-shadow: -6px 0px 0px #ececec inset;
          &.noPager {
            right: 0px;
            border-right: none;
            box-shadow: none;
          }
          > ul {
            height: 100%;
            width: 1000px;
            > li {
              float: left;
              width: 72px;
              padding: 6px 2px;
              overflow: hidden;
              line-height: 15px;
              color: #666666;
              &.active {
                color: @class-active-color;
                border-bottom: 2px solid @class-active-color;
              }
              > span {
                display: table-cell;
                width: 68px;
                height: 40px;
                text-align: center;
                word-break: break-word;
                vertical-align: middle;
              }
            }
          }
        }
        &.active {
          color: @class-active-color;
          border-bottom: 2px solid @class-active-color;
        }
        &.small-class-pager {
          float: right;
          padding: 10px 5px;
        }
      }
    }
    >.menus-content {
      position: absolute;
      top: 58px;
      bottom: 150px;
      left: 0px;
      right: 0px;
      background-color: #ffffff;
      border: 1px solid #b5b5b5;
      border-top: none;
      >.items-content {
        cursor: pointer;
        position: absolute;
        top: 0px;
        bottom: 48px;
        width: 100%;
        overflow: hidden;
        padding: 5px;
        background-color: #f5f5f5;
        >li {
          float: left;
          width: 120px;
          height: 78px;
          margin: 3px;
          border: @border-style;
          padding: 5px;
          position: relative;
          cursor: pointer;
          background-color: #ffffff;
          &.active {
            background-color: rgba(0, 0, 0, 0.1);
          }
          > p:nth-child(1) {
            font-size: 12px;
            color: #999999;
          }
          > p:nth-child(2) {
            max-height: 36px;
            overflow: hidden;
          }
          > p:nth-child(3) {
            position: absolute;
            right: 5px;
            bottom: 2px;
            height: 18px;
            overflow: hidden;
          }
          > .showCount {
            position: absolute;
            top: -3px;
            right: 5px;
            font-size: 20px;
            color: #ee4e63;
          }
        }
      }
      >.pager-search-content {
        position: absolute;
        height: 48px;
        bottom: 5px;
        width: 100%;
        >.items-search {
          cursor: pointer;
          width: 245px;
          padding: 0px 15px;
          border: 1px solid #ccc;
          border-radius: 20px;
          float: left;
          margin: 8px;
          >label {
            height: 34px;
            display: inline-block;
            margin-bottom: 0;
            max-width: 100%;
            font-weight: bold;
            >input {
              border: none;
              height: 100%;
              color: #273844;
              font-weight: normal;
              width: 186px;
              background-color: #ffffff;
            }
          }
        }
        >.items-page-content-show {
          position: absolute;
          right: 142px;
          padding: 20px 0px;
        }
        >.items-page-box {
          float: right;
          margin: 12px 5px;
        }
      }
    }
    >.settlement-content {
      height: 150px;
      position: absolute;
      bottom: 0px;
      width: 100%;
      background-color: #e4e4e4;
      &.disable {
        pointer-events: none;
      }
      >ul {
        padding: 10px 0px;
        overflow: hidden;
        >li {
          cursor: pointer;
          float: left;
          width: 118px;
          height: 42px;
          border: 1px solid #b5b5b5;
          text-align: center;
          line-height: 42px;
          background-color:#ffffff;
          margin: 16px 5px 8px 5px;
          padding: 0px 2px;
          white-space: nowrap;
          overflow: hidden;
          &.nextCls {
            position: absolute;
            right: 5px;
            bottom: 8px;
          }
        }
      }
    }
  }
}
</style>
