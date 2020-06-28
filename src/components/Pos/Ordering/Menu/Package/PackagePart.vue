
<template>
  <!-- 国际化：宴会套餐 -->
  <Dialog
    name="PosDialog.PackagePart"
    :title="$t('Dict.BanquetPkg')"
    ref="dialog"
    top="62px"
    width="900px"
    height="670px"
    @open="onOpen"
    @close="onClose"
    @submit="submitPkgPartItems"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    :submitId="submitId"
    :appendToBody="appendToBody"
  >
    <div class="pkgContent">
      <div class="itemList">
        <div class="itemListTitle">
          <p class="pkgName">{{pkgMainData.name}}</p>
          <div class="pkgControl">
            <span class="pkgNum">
              <!-- 国际化：描述文字 -->
              <el-input-number
                v-judge
                :id="type + 'Number'"
                size="small"
                v-model="pkgMainData.lastQty"
                v-num-keyboard:bottom
                @change="handleChange"
                :min="pkgMainData.lastQtyMin || 1"
                :max="pkgMainData.lastQtyMax || Infinity"
                :label="$t('Dict.DescriptiveText')"
                class="pkgNumInput"
                @focus="inputFocus()"
                @blur="inputBlur()"
              ></el-input-number>
            </span>
            <!-- <span>加价: {{PkgNormalTotalRaisePrice}}</span> -->
            <span class="subTotal" v-if="pkgMainData.price != pkgMainData.originalPrice">
              <!-- 国际化：原单价: -->
              {{$t('Biz.BizComm.OriginalPrice')}}
              <del> {{pkgMainData.originalPrice}}</del>
            </span>
          </div>
          <div class="priceFormula">
            <!-- 国际化：品项合计，套餐价格，做法加价，总价 -->
            <p class="title">
              <span class="w_total">{{$t('Biz.Order.ItemTotal')}}</span>
              <span class="sign"></span>
              <span class="w_price">{{$t('Dict.PkgPrice01')}}</span>
              <span class="sign"></span>
              <span class="w_method">{{$t('Biz.Order.MethodPrice')}}</span>
              <span class="sign"></span>
              <span class="w_totalPrice">{{$t('Biz.Order.TotalPrice')}}</span>
            </p>
            <p>
              <span class="w_total">{{itemTotalPrice}}</span>
              <span class="w_price">{{(pkgMainData.price*100)*(pkgMainData.lastQty*100)/10000}}</span>
              <span class="sign">+</span>
              <span class="w_method">{{methodTotalPrice}}</span>
              <span class="sign">=</span>
              <span class="w_totalPrice">{{totalPrice}}</span>
            </p>
          </div>
        </div>
        <div class="itemListContent">
          <ul :id="'partitemListUl' + (type ? type : '')" ref="partitemListUl" v-autotest>
            <li
              v-for="(item,index) in pkgSelecteItems"
              :key="index"
              @click="activeItem(item,index)"
              :class="{active: activeCondition.activeItemId == (item.itemId+'-'+index)}"
            >
              <p class="itemCode">{{ item.itemCode || ''}}</p>
              <div class="item">
                <!-- 国际化：临 -->
                <span class="itemName">
                  {{ item.itemType === 2 ? '['+$t('Dict.Temporary')+']'+item.itemName : item.itemName }}
                  {{
                    item.auxiliaryUnitId
                    ? `(${Number(item.auxiliaryUnitQty) || 1}${item.auxiliaryUnitName})`
                    : ''
                  }}
                </span>
                <span class="itemMethodPrice">{{handleRaisePrice(item)}}</span>
                <span class="itemNum">{{item.count}}</span>
              </div>
              <!-- <p class="itemRemarks" v-if="(item.methodList && item.methodList.length) || (item.serveWay && item.serveWay.id !='0')"> -->
              <!-- 国际化：0_即起 -->
              <p
                class="itemRemarks"
                v-if="(item.methodList && item.methodList.length) || (item.serveWayId && item.serveWayId != $t('Biz.Order.EqualVal'))"
              >
                <!-- 国际化：注: -->
                <span>{{$t('Dict.Notes01')}}</span>
                <span v-if="item.serveWay && item.serveWay.name">
                  {{item.serveWay.name}}
                  <strong v-if="item.methodList && item.methodList.length">|</strong>
                </span>
                <span v-if="item.serveWay && item.sc_id">
                  {{item.servewayName}}
                  <strong v-if="item.methodList && item.methodList.length">|</strong>
                </span>
                <span v-for="(method, index) in item.methodList" :key="index">
                  {{method.name}}{{ method.isNeedFee ? '(+'+ method.price + (method.qty && method.qty!=1 ? 'x'+ method.qty : '') + ')' : '' }}
                  <strong v-if="index != (item.methodList.length-1)">|</strong>
                </span>
              </p>
            </li>
          </ul>
        </div>
        <div class="showListCount" v-show="pkgSelecteItems.length">
            <!-- 国际化：共{0}道 -->
            {{$t('Biz.Order.AlTogether', [pkgSelecteItems.length])}}
        </div>
        <div class="listPager">
          <!-- 进入分页公共组件 -->
          <Pager
            :pagerId="'partitemListUl' + (type ? type : '')"
            scrollMode="simple"
            ref="partitemListPager"
          ></Pager>
        </div>
      </div>
      <div class="actionBtn">
        <ul>
          <li
            v-autotest
            v-for="(btn, index) in partContorlBtnDataComputed"
            @click="actionBtnClick(btn.method)"
            :id="type + btn.method"
            :key="index"
            :class="{btnDisabled:btn.disabled}"
          >
            <span>{{btn.btnName}}</span>
          </li>
        </ul>
      </div>
      <div class="menu">
        <div class="mueContent">
          <div class="menuClass">
            <div
              class="allSmallClass"
              @click="activePkgClass(allSmallClassBtnData)"
              :class="{active: activePkgClassData == allSmallClassBtnData }"
            >{{allSmallClassBtnData.name}}</div>
            <div class="menuClassList" :class="{classListWidth:itemClassList.length > 4}">
              <ul>
                <li
                  v-for="list in classList"
                  :key="list.id"
                  :class="{active: activePkgClassData.id == list.id }"
                  @click="activePkgClass(list)"
                >
                  <span>{{list.name}}</span>
                </li>
              </ul>
            </div>
            <div class="menuClassPager" v-if="itemClassList.length > 4">
              <!-- 进入分页公共组件 -->
              <NumPager
                :total="vuePagerTotal"
                @pagechange="pagechange"
                :displayCount="vuePagerDisplay"
                ref="topScroll"
              ></NumPager>
            </div>
          </div>
          <div class="menuList">
            <ul :id="type + 'MenuList'" v-autotest>
              <li
                class="menuItem"
                v-for="(menu, index) in classPkgMenusPager"
                :key="menu.itemId+'-'+index"
                :class="{active: activeMenuIndex === index}"
                @click="addMenu(menu, index)"
              >
                <p>
                  <span>{{menu.code}}</span>
                  <!-- 限量这块 老的程序只是个显示没有做一些判断, 判断在提交所点的品项的时候做了下处理 -->
                  <!-- 国际化：限{0},估清 -->
                  <span
                    v-show="!menu.itemSelloutData && menu.itemLimitData"
                    class="itemLimit"
                  >{{$t('Dict.LimitNum', [menu.itemLimitData ?menu.itemLimitData.quantity : ''])}}</span>
                  <span v-show="menu.itemSelloutData" class="itemSellout">{{$t('Dict.Sellout')}}</span>
                </p>
                <p>{{menu.name}}</p>
                <p> {{menu.price}}/{{menu.unitName}}</p>
                <em v-show="menu.count">{{menu.count}}</em>
              </li>
            </ul>
          </div>
          <div class="menuControl">
            <el-checkbox
              v-show="!!scId"
              v-model="skipKitchenPrint"
              :label="$t('Dict.Btn.SkipKitchenList')"
              fill="#0097a4"
              border
              size="medium"
              class="checkbox-skip"
            >
            </el-checkbox>
            <div class="menuSearch" :class="!!scId ? 'showCheckBoxSy':''">
              <label for>
                <i class="icon icon-search"></i>
                <!-- 国际化：快速查找 -->
                <input
                  :id="type + 'Search'"
                  ref="partMenusSearch"
                  type="text"
                  :placeholder="$t('Dict.QuickSearch')"
                  v-switch-keyboard:top="keyboardParams"
                  v-model.trim="menuSearch"
                  v-judge
                  v-autotest
                >
              </label>
            </div>
            <!-- <div class="menuListPager">
            </div>-->
            <div class="menuListPager" v-if="classPkgMenus.length > bottomPagerDisplay">
              <NumPager
                :total="bottomPagerTotal"
                @pagechange="bottomPagechange"
                :displayCount="bottomPagerDisplay"
                ref="bottomScroll"
              ></NumPager>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PackageChangeNum ref="PackageChangeNum" :submitId="type + 'ModifyNum'"></PackageChangeNum>
    <!-- 修改数量的组件-->
    <PackageChangePrice ref="PackageChangePrice" :type="type + 'ChangePrice'"></PackageChangePrice>
    <!-- 修改价格的组件-->
    <PackageItemMethod
      ref="PackageItemMethod"
      :type="type + 'ModifyMethod'"
      :submitId="type + 'ModifyMethod'"
      :isArrangeMenuMethod="isArrangeMenu"
    ></PackageItemMethod>
    <!-- 做法的组件-->
    <PackageItemServeWay ref="PackageItemServeWay" :type="type + 'ServeWay'"></PackageItemServeWay>
    <!-- 上菜方式的组件-->
    <ItemTemp ref="itemTemp" :appendToBody="true" :type="'PkgPart' + scId ? 'Order' : 'Ordering'" testId="packagePart"></ItemTemp>
    <!-- 临时品项的组件 -->
  </Dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import { Message } from 'element-ui';
import {
  find, extend, cloneDeep,
} from 'lodash';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Dialog from '@/components/Pos/Common/Dialog';
import ajax from '@/common/js/ajax';
import {
  add, sub, multi, zeroize, div,
} from '@/common/js/math';
import Pager from '@/components/Pos/Common/Pager';
import NumPager from '@/components/Pos/Common/NumPager';
import quickSearch from '@/common/js/quicksearch';
import * as KeyboardUtil from '@/plugin/keyboard/util';
// 改量
const PackageChangeNum = (resolve) => {
  import('./PackageChangeNum').then((module) => {
    resolve(module);
  });
};
// 套餐改价
const PackageChangePrice = (resolve) => {
  import('./PackageChangePrice').then((module) => {
    resolve(module);
  });
};
// 做法
const PackageItemMethod = (resolve) => {
  import('@/components/Pos/Business_commons/OrderingChangeMethods').then((module) => {
    resolve(module);
  });
};
// 上菜方式
const PackageItemServeWay = (resolve) => {
  import('@/components/Pos/Ordering/OrderingBtnsFunc/OrderingServeWay').then((module) => {
    resolve(module);
  });
};
// 临时品项
const ItemTemp = (resolve) => {
  import('../ItemTemp').then((module) => {
    resolve(module);
  });
};
export default {

  components: {
    Dialog,
    Pager,
    PackageChangeNum,
    NumPager,
    PackageChangePrice,
    PackageItemMethod,
    PackageItemServeWay,
    ItemTemp,
  },
  mixins: [DialogMixin],
  props: {
    appendToBody: {
      type: Boolean,
      default: false, // 这是饿了么组件弹框嵌套的设置 true证明是在弹框的基础上弹框
    },
    isArrangeMenu: {
      type: Boolean,
      default: false, // 是不是排菜单过来的
    },
    isNgtMenu: {
      type: Boolean,
      default: false, // 是不是负结算界面调用的
    },
    type: {
      default: '',
    },
    areaType: {
      type: Number,
      default: 0,
    },
    submitId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      partContorlBtnData: [
        { btnName: this.$t('Dict.PkgPrice01'), method: 'pkgChangePrice', disabled: false }, // 国际化：套餐价格
        { btnName: this.$t('Dict.Btn.DeleteItem'), method: 'pkgDelete', disabled: false }, // 国际化：删除
        {
          btnName: '+', method: 'pkgAdd', disabled: false, id: 'partpkgAdd', name: 'changeNum',
        },
        {
          btnName: '-', method: 'pkgSubtract', disabled: false, name: 'changeNum',
        },
        {
          btnName: this.$t('Dict.Btn.ChangeHalfNum'), method: 'pkgItemHalf', disabled: false, name: 'changeNum', // 国际化：半份
        },
        {
          btnName: this.$t('Dict.Btn.ChangeItemNum'), method: 'pkgChangeNumber', disabled: false, name: 'changeNum', // 国际化：数量
        },
        { btnName: this.$t('Dict.Btn.ChangeItemMethods'), method: 'pkgChoseMethod', disabled: false }, // 国际化：做法
        { btnName: this.$t('Dict.Btn.ChangeItemServeWay'), method: 'pkgServeWay', disabled: false }, // 国际化：上菜方式
      ],
      // 一页显示的条数 这是类table的分页
      vuePagerDisplay: 4,
      // 当前页数 这是类table的分页
      currentPage: 1,
      // 宴会套餐的数据
      pkgPartData: {},
      // 宴会套餐的头部主要信息
      pkgMainData: {},
      // 右侧菜单的分类数据
      itemClassList: [],
      // 左侧账单部分已默认选的数据和加单的数据
      pkgSelecteItems: [],
      // 右侧菜单部分
      pkgMenus: [],
      // 选择的类table 切换的数据
      activePkgClassData: null,
      // search 内容
      menuSearch: '',
      // 正加单的menu当前数据
      addMenuData: null,
      // 左侧账单被选中的 后获取的id和下标和数据缓存起来
      activeCondition: {
        activeItemId: '',
        activeItemIndex: null,
        activeItemData: {},
      },
      // 选中对应的所在的类
      activeItemPkgClassData: {},
      // 这个是用来告诉做法的子组件这是在套餐弹框里操作的加做法
      orderingPkgItem: true,
      // 用来区分是否是已提交套餐的修改过来的
      scId: null,
      // 右侧菜单的分页的一页显示的个数
      bottomPagerDisplay: 20,
      // 当前页数 这是右侧菜单的分页
      bottomCurrentPage: 1,
      // 菜单多少行
      bottomMenuRowCount: 5,
      // 菜单一行显示几个
      bottomRowShowNumber: 4,
      // 国际化：全部小类
      allSmallClassBtnData: {
        id: 'all',
        name: this.$t('Dict.AllSubclass'),
      },
      // 所有套餐一份的做法价格和
      pkgListTotalMakeFee: null,
      // 左侧账单的套餐的数量的input聚焦状态
      leftInputFocus: false,
      // 被选中的品项的下标
      activeMenuIndex: 0,
      // 国际化：临时品项
      tempItemBtnMessage: { btnName: this.$t('Dict.TemporaryItems'), method: 'openItemTemp', disabled: false },
      // 是否是免厨打
      skipKitchenPrint: false,
    };
  },
  computed: {
    hotKeySet() {
      return {
        ...this.setKeySearchHotKey(),
        BackSpace: () => {
          this.inputKey('del'); // 删除
        },
        PgDn: () => {
          this.submitPkgPartItems();
        },
        F1: () => {
          this.actionBtnClick('pkgChangePrice'); // 改价
        },
        F2: () => {
          this.actionBtnClick('pkgDelete'); // 删
        },
        '+': () => {
          this.actionBtnClick('pkgAdd'); // 加
        },
        '-': () => {
          this.actionBtnClick('pkgSubtract'); // 减
        },
        F3: () => {
          this.actionBtnClick('pkgItemHalf'); // 半份
        },
        F6: () => {
          this.actionBtnClick('pkgChangeNumber'); // 改量
        },
        F7: () => {
          this.actionBtnClick('pkgChoseMethod'); // 做法
        },
        F8: () => {
          this.actionBtnClick('pkgServeWay'); // 上菜方式
        },
        F9: () => {
          if (this.posItemTempSmallClasses.length) {
            this.actionBtnClick('openItemTemp'); // 临时品项
          }
        },
        '↑': () => {
          if (!this.leftInputFocus) {
            this.upArrow();
          }
        },
        '↓': () => {
          if (!this.leftInputFocus) {
            this.downArrow();
          }
        },
        '←': () => {
          if (!this.leftInputFocus) {
            this.leftArrow();
          }
        },
        '→': () => {
          if (!this.leftInputFocus) {
            this.rightArrow();
          }
        },
        Enter: () => {
          if (!this.leftInputFocus) {
            this.addMenu(this.classPkgMenusPager[this.activeMenuIndex], this.activeMenuIndex, true);
          }
        },
      };
    },
    // 总页数
    itemsPageTotal() {
      return Math.ceil(this.bottomPagerTotal / this.bottomPagerDisplay);
    },
    keyboardParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {};
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard ? 'full' : 'nine',
      };
    },
    partContorlBtnDataComputed() {
      let btnData = this.partContorlBtnData;
      if (this.isArrangeMenu) {
        btnData = this.partContorlBtnData.filter(btn => btn.method !== 'pkgServeWay');
      }
      // 如果是负结算 功能调用的套餐需要 排除下做法和上菜方式
      if (this.isNgtMenu) {
        btnData = this.partContorlBtnData.filter(btn => btn.method !== 'pkgServeWay' && btn.method !== 'pkgChoseMethod');
      }
      const cloneData = cloneDeep(btnData);
      if (this.scId && !this.pkgMainData.isNotFollowAmount) {
        cloneData.forEach((btn) => {
          this.$set(btn, 'disabled', false);
          // 如果是排菜加单过来的不需要上菜方式
          if (btn.name && btn.name === 'changeNum' && btn.method !== 'pkgChangeNumber') {
            // 如果是提交完的宴会套餐并且是联动的情况下不能对明细进行数量修改
            this.$set(btn, 'disabled', true);
          }
        });
      }
      // 临时品项权限控制
      this.tempItemBtnMessage.disabled = !this.tempItemModuleAuth;
      if (this.posItemTempSmallClasses.length) {
        return [...cloneData, this.tempItemBtnMessage];
      }
      return cloneData;
    },
    // 分页的总条数
    // 过滤掉大类 剩小类
    vuePagerTotal() {
      return this.itemClassList.length;
    },
    classList() {
      if (this.itemClassList.length) {
        // 截取的起始和终止的index  下标
        const startIdex = 0 + (this.currentPage - 1) * this.vuePagerDisplay;
        const endIdex = this.currentPage * this.vuePagerDisplay > this.itemClassList.length ? this.itemClassList.length + 1 : this.currentPage * this.vuePagerDisplay + 1;
        return this.itemClassList.slice(startIdex, endIdex);
      }
    },
    // 用vuex getter方法获取限量的数据和估清的数据
    ...mapGetters([
      'getVuexItemSelloutsMap',
      'getVuexItemLimitsMap',
      'getVuexItemServeWays',
      'getisSetUpGroupMethod',
      'posItemTempSmallClasses',
      'getVuexPointData',
      'tempItemModuleAuth',
      'haveLimitSmallClasses',
      'getActiveOrderItemSmClsTotal',
    ]),
    // 所有已点品项销售价格的合计和明细做法价格的合计
    // isNotFollowAmount {Boolean} isNotFollowAmount 为true的时候是此套餐不联动否则联动
    itemTotalPrice() {
      let allItemStdtotalPrice = 0;
      if (this.pkgSelecteItems.length) {
        this.pkgSelecteItems.forEach((_) => {
          allItemStdtotalPrice = add(allItemStdtotalPrice, multi(_.stdPrice, _.count));
        });
      }
      allItemStdtotalPrice = this.scId ? allItemStdtotalPrice : (this.pkgMainData.isNotFollowAmount ? allItemStdtotalPrice : multi(allItemStdtotalPrice, this.pkgMainData.lastQty));
      this.$log.debug(`宴会套餐已点品项总价：${allItemStdtotalPrice} 做法总价：${this.methodTotalPrice}`);
      return add(this.methodTotalPrice, allItemStdtotalPrice);
    },
    // isNotFollowAmount {Boolean} isNotFollowAmount 为true的时候是此套餐不联动否则联动
    // 套菜的总价计算公式是 主套餐的价格*主套餐的数量 + 此套餐所有明细的做法价格和*(主套餐的数量,如果此套餐是联动需要乘以主套餐的数量,否则不乘以主套餐的数量)
    totalPrice() {
      let totalPrice = 0;
      if (this.pkgMainData) {
        totalPrice = add(multi(this.pkgMainData.price, this.pkgMainData.lastQty), this.methodTotalPrice);
      }
      this.$log.debug(`宴会套餐总价：${totalPrice}`);
      return totalPrice;
    },
    /** 做法价格
     * 监听已点的品项进行循环计算出每个品项的做法合,以及整单的做法合
     * isNotFollowAmount {Boolean} isNotFollowAmount 为true的时候是此套餐不联动否则联动
    */
    methodTotalPrice() {
      let allItemTotalPrice = 0;
      this.pkgSelecteItems.map((item) => {
        // 明细的数量，如果是联动的话入库完后是乘以套餐的数量的所以要特殊处理下
        const itemCount = (!this.pkgMainData.isNotFollowAmount && this.scId)
          ? div(item.count, this.pkgMainData.lastQty)
          : item.count;
        let totalMakeFee = 0;
        if (item.methodList && item.methodList.length) {
          // pkgListMethodTotal 每个明细的做法总和
          item.methodList.forEach((method) => {
            if (method.price) {
              if (method.isRelaCount) {
                totalMakeFee = add(totalMakeFee, multi(multi(method.price, method.qty), itemCount));
              } else {
                totalMakeFee = add(totalMakeFee, multi(method.price, method.qty));
              }
            }
          });
        }
        this.$set(item, 'totalMakeFee', totalMakeFee);
        allItemTotalPrice = add(allItemTotalPrice, totalMakeFee);
      });
      // 不应这样写。。当时学得vue比较浅薄
      this.pkgListTotalMakeFee = allItemTotalPrice;
      // 所有明细做法价格和的计算在加单下如果是联动需要乘以主套餐的数量,如果是提交完的不管是联动还是不联动都是不需要乘以主套餐的数量,因为对联动已提交完的套餐明细的数量已经是乘以主套餐数量后的数量
      return this.pkgMainData.isNotFollowAmount ? allItemTotalPrice : multi(allItemTotalPrice, this.pkgMainData.lastQty);
    },
    // 右侧进行估清和限量的进行拼配
    menusHandel() {
      // 如果是排菜过来的不需要估清和限量的处理
      if (this.pkgMenus.length && !(this.isArrangeMenu || this.isNgtMenu)) {
        this.pkgMenus.forEach((pkgmenu) => {
          // 获取下相应的品项估清数据
          const menuSelloutData = this.getMenuSelloutData(pkgmenu);
          pkgmenu.itemSelloutData = menuSelloutData;
          // 获取下相应的品项限量数据
          const menuLimitData = this.getMenuLimitData(pkgmenu);
          pkgmenu.itemLimitData = menuLimitData;
        });
        return this.pkgMenus;
      }
      return this.pkgMenus;
    },
    classPkgMenusPager() {
      if (this.classPkgMenus.length > this.bottomPagerDisplay) {
        // 截取的起始和终止的index 下标
        const startIdex = 0 + (this.bottomCurrentPage - 1) * this.bottomPagerDisplay;
        const endIdex = this.bottomCurrentPage * this.bottomPagerDisplay > this.classPkgMenus.length ? this.classPkgMenus.length + 1 : this.bottomCurrentPage * this.bottomPagerDisplay + 1;
        return this.classPkgMenus.slice(startIdex, endIdex - 1);
      }
      return this.classPkgMenus;
    },
    // 右侧的菜单的过滤和search的过滤
    classPkgMenus() {
      let pkgMenus = [];
      if (this.pkgMenus.length) {
        pkgMenus = this.menusHandel.filter((menu) => {
          if (this.menuSearch.length > 0) {
            const keyFilters = quickSearch((`${this.menuSearch}`).toLowerCase()); // 从这对数据进行处理
            const code = (`${menu.code}`).toLowerCase(); // code代码
            const name = (menu.code).toLowerCase(); // 名称
            const pinyin = menu.pinyin.toLowerCase(); // 拼音
            const barcode = menu.barcode || ''; // 条码,数字格式

            return ((menu.smallClassId == this.activePkgClassData.id || this.activePkgClassData.id == 'all') && (function () {
              for (let i = 0; i < keyFilters.length; i++) {
                const key = keyFilters[i];
                if ((code.indexOf(key) != -1 || name.indexOf(key) != -1 || pinyin.indexOf(key) != -1 || barcode.indexOf(key) != -1)) {
                  return true;
                }
              }
              return false;
            }()));
          }
          return this.activePkgClassData.id != 'all' ? (menu.smallClassId == this.activePkgClassData.id) : menu;
        });
      }
      // 重新复制，并且分页组件初始化下并且是默认选中第一个显示区域的第一个菜
      this.destructionItemsPage();
      return pkgMenus;
    },
    // 右侧的菜品的分页的数据的总数
    bottomPagerTotal() {
      return this.classPkgMenus.length;
    },
  },
  methods: {
    // 设置搜索热键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          // 判断左侧输入的input框是否是聚焦
          if (!this.leftInputFocus) {
            this.inputKey('add', item);
          }
        };
      });
      return keysObj;
    },
    // 左侧聚焦事件
    inputFocus() {
      this.leftInputFocus = true;
    },
    // 失去焦点事件
    inputBlur() {
      this.leftInputFocus = false;
    },
    // 右侧input在失去焦点的录入和删除
    inputKey(type, val = '') {
      if (
        (document.hasFocus()
        && document.activeElement === this.$refs.partMenusSearch)
        || this.leftInputFocus
      ) { return; }
      if (type === 'add') {
        this.menuSearch = `${this.menuSearch}${val}`;
      } else {
        this.menuSearch = KeyboardUtil.deleteLastChar(this.menuSearch);
      }
    },
    // 选菜的快捷键
    upArrow() {
      if (this.activeMenuIndex - this.bottomRowShowNumber >= 0) {
        this.activeMenuIndex = this.activeMenuIndex - this.bottomRowShowNumber;
      } else if (this.bottomCurrentPage - 1) {
        this.$refs.bottomScroll.pagechange(this.bottomCurrentPage - 1);
        this.activeMenuIndex = this.bottomPagerDisplay - (
          this.bottomRowShowNumber - this.activeMenuIndex
        );
      }
    },
    downArrow() {
      // 在一个页的时候
      if (
        this.activeMenuIndex + this.bottomRowShowNumber
        <= this.classPkgMenusPager.length - 1
      ) {
        this.activeMenuIndex = this.activeMenuIndex + this.bottomRowShowNumber;
        // 翻页的时候 classPkgMenusPager
      } else if (this.bottomCurrentPage + 1 <= this.itemsPageTotal) {
        this.$refs.bottomScroll.pagechange(this.bottomCurrentPage + 1);
        this.activeMenuIndex = this.bottomRowShowNumber
        - (this.bottomPagerDisplay - this.activeMenuIndex);
        // 如果进入下一个页的时候index大于这页显示的数据就为初始值0
        if (this.activeMenuIndex > this.classPkgMenusPager.length - 1) {
          this.activeMenuIndex = 0;
        }
      }
    },
    leftArrow() {
      if (this.activeMenuIndex >= 1) {
        this.activeMenuIndex -= 1;
      } else if (this.bottomCurrentPage - 1) {
        this.$refs.bottomScroll.pagechange(this.bottomCurrentPage - 1);
        this.activeMenuIndex = this.bottomPagerDisplay - 1;
      }
    },
    rightArrow() {
      // 如果下标小于显示菜品的条数减一时候
      if (this.activeMenuIndex < this.classPkgMenusPager.length - 1) {
        this.activeMenuIndex += 1;
      } else if (this.bottomCurrentPage + 1 <= this.itemsPageTotal) {
        this.$refs.bottomScroll.pagechange(this.bottomCurrentPage + 1);
        this.activeMenuIndex = 0;
      }
    },
    limitLastQty(newVal) { // 套餐加单-限制数量（最大、最小值）
      const minAddQty = this.pkgMainData.minAddQty || 1;
      const { maxAddQty } = this.pkgMainData;
      if (newVal < minAddQty) {
        this.isShowMessage(`加单最小数量限制为${minAddQty}`);
        this.$set(this.pkgMainData, 'lastQty', minAddQty);
        this.$set(this.pkgMainData, 'lastQtyMin', minAddQty); // 自己添加
        return false;
      }
      if (maxAddQty && newVal > maxAddQty) {
        this.isShowMessage(`加单最大数量限制为${maxAddQty}`);
        this.$set(this.pkgMainData, 'lastQty', maxAddQty);
        this.$set(this.pkgMainData, 'lastQtyMax', maxAddQty);// 自己添加
        return false;
      }
      return true;
    },
    /** 监听主套餐的数量变化
     * 如果此套餐是提交完并设置了是联动话对此修改的时候,改变它的数量的时候套餐明细的数量和类的限定数也要跟着改变
     * @param newVal {number} 变量后的值
     * @param oldVal {number} 变量前的值
     * @param proportionsNumber {number} 变化的比例
     * @param changeCount {number} 算出变化的数值差
     * @param lastCount {number} 算出变化的后数值
     */
    handleChange(newVal, oldVal) {
      const taleNumTest = /^[1-9]\d*$/g;
      if (!taleNumTest.test(newVal)) {
        this.$message.warning(this.$t('Dict.Validate.NumberMessage')); // 请输入正确数量
        setTimeout(() => {
          this.$set(this.pkgMainData, 'lastQty', newVal.toString().substr(0, newVal.toString().length - 1));
        }, 0);
      }
      this.limitLastQty(newVal, oldVal); // 套餐加单-限制数量（最大、最小值）
      if (this.scId && !this.pkgMainData.isNotFollowAmount && oldVal && newVal) {
        // const proportionsNumber = (newVal * 1000) / (oldVal * 1000); //未使用注释
        this.pkgSelecteItems.map((item, index) => {
          // 算出变化的后数量值
          const lastCount = multi(item.proportionNum, newVal);
          const changeCount = sub(lastCount, item.count);
          // 改变右侧菜单已点品项所对应的菜的数值
          this.numHandle(changeCount, item);
          // 改变账单已点品项的数值
          this.$set(item, 'count', add(item.count, changeCount));
        });
      }
    },
    // 菜单组件修改完当前页的触发事件
    bottomPagechange(current) {
      this.bottomCurrentPage = current;
      setTimeout(() => {
        if (this.activeMenuIndex > this.classPkgMenusPager.length - 1) {
          this.activeMenuIndex = 0;
        }
      }, 0);
    },
    // 对过来的数据先进行count 属性添加 整理完return
    initResData(resData) {
      // 克隆下 let cloneResData
      const cloneResData = cloneDeep(resData);
      if (cloneResData) {
        // 套餐右侧菜品品项 添加属性count 数量的key
        cloneResData.pkgUnSelectedItems.forEach((pkgSelItem, index) => {
          // 添加属性 key count
          pkgSelItem = Object.assign({}, pkgSelItem, {
            count: 0,
          });
          cloneResData.pkgUnSelectedItems.splice(index, 1, pkgSelItem);
        });
        // 左侧默认选择的套餐添加count key
        cloneResData.pkgSelectedItems.forEach((list, index) => {
          // 每个组内的默认品项 添加个count数量属性
          list = Object.assign({}, list, {
            // 如果count存在证明是修改套餐过来的数据
            count: list.count ? list.count : list.defaultQty,
          });
          // 如果是已入库的修改,需要算出明细数量个主套餐的数量的占比
          this.$set(list, 'serveWayId', list.serveWay);
          if (this.scId) {
            if (list.serveWay) {
              const serveWayData = {};
              serveWayData.id = list.serveWay.split('_')[0];
              serveWayData.name = this.getVuexItemServeWays.find(item => item.id == serveWayData.id).name;
              this.$set(list, 'serveWay', serveWayData);
            }
            this.$set(list, 'proportionNum', (list.count * 1000) / (resData.package.lastQty * 1000));
          }
          // 必须用这个splice vue才能起作用 可以看官方文档的 对象更改检测注意事项
          cloneResData.pkgSelectedItems.splice(index, 1, list);
          // 找到对应的菜单的品项给count 赋值
          const findItem = find(cloneResData.pkgUnSelectedItems, {
            itemId: list.itemId,
          });
          findItem && this.$set(list, 'smallClassId', findItem.smallClassId);
          const findeIndex = cloneResData.pkgUnSelectedItems.indexOf(findItem);
          if (findItem) {
            findItem.count = add(findItem.count, list.count);
            cloneResData.pkgUnSelectedItems.splice(findeIndex, 1, findItem);
          }
        });
        return cloneResData;
      }
    },
    onClose() {
      // 这是销毁下 分页组件的index的暂存 值重新给赋值
      this.destructionItemsPage(true);
    },
    // 菜品分页组件的销毁
    destructionItemsPage(isInitTop = false) {
      this.bottomCurrentPage = 1;
      this.activeMenuIndex = 0;
      if (this.$refs.topScroll && isInitTop) {
        this.$refs.topScroll.init();
      }
      if (this.$refs.bottomScroll) {
        this.$refs.bottomScroll.init();
      }
    },
    onOpen() {
      this.skipKitchenPrint = false;
      // 初始菜单选中状态
      this.activeMenuIndex = 0;
      // 对数据进行处理
      // 初始化下 清空搜索
      this.menuSearch = '';
      // 用来区分是否是已提交套餐的修改过来的 isNotFollowAmount 为true是不联动,否则为false
      this.scId = this.resData.scId ? this.resData.scId : null;
      this.pkgPartData = this.initResData(this.resData);
      this.$log.debug(`初始化宴会套餐数据组合：${this.pkgPartData}`);
      // 根据areaType类型的不同  当前客位所在的不同区域显示不同的价格判断添加条件 排除下 促销的价和时价的情况
      if (this.pkgPartData.package.discFlg != 4
        && !this.pkgPartData.package.isItemTimePrice
        && this.areaType !== 0 && this.pkgPartData.package.priLocals
        && (this.pkgPartData.package.priLocals[0][`other_price${this.areaType}`]
        || this.pkgPartData.package.priLocals[0][`other_price${this.areaType}`] == 0)) {
        this.pkgPartData.package.price = this.pkgPartData.package.priLocals[0][`other_price${this.areaType}`];
        this.pkgPartData.package.salePrice = this.pkgPartData.package.priLocals[0][`other_price${this.areaType}`];
      }
      // 给套餐添加个原价的属性, 防止和修改价格混淆
      const originalPrice = this.pkgPartData.package.price;
      this.$set(this.pkgPartData.package, 'originalPrice', originalPrice);
      // 默认数量为1
      this.$set(this.pkgPartData.package, 'lastQty', this.pkgPartData.package.lastQty ? this.pkgPartData.package.lastQty : this.pkgPartData.package.minAddQty || 1);
      // 对各个数据  进行初始化赋值
      this.pkgMainData = this.pkgPartData.package;
      // 过滤掉大类..
      this.itemClassList = this.pkgPartData.itemSmallClassList.filter(list => list.pid != 0);
      // 左侧的账单数据
      this.pkgSelecteItems = this.pkgPartData.pkgSelectedItems;
      this.pkgMenus = this.pkgPartData.pkgUnSelectedItems;
      // 默认显示all的类的菜单品项 一个
      // this.activePkgClassData = this.itemClassList[0]
      this.activePkgClassData = this.allSmallClassBtnData;
      // 初始下账单中被选中的品项数据
      this.activeItemInit();
      // 初始化下类分页数据
      this.currentPage = 1;
      // 初始化右侧菜品的分页的当前页
      this.bottomCurrentPage = 1;
      // 延迟刷新下分页组件 ,后期优化
      setTimeout(() => {
        this.$refs.partitemListPager.refresh();
      }, 100);
    },
    // 价格显示转化 补零
    handleRaisePrice(item) {
      const price = item.stdPrice;
      return zeroize(price);
    },
    // 估清的菜单匹配
    getMenuSelloutData(item) {
      const itemSellouts = this.getVuexItemSelloutsMap;
      let newSellouts = null;
      for (const key in itemSellouts) {
        if (itemSellouts[item.itemId] || itemSellouts[item.itemId] == 0) {
          newSellouts = {
            type: itemSellouts[item.itemId], // 0不指定（默认），1当前市别（退单估清时默认）,2当天
            isSelloutItem: true, // 是否估清
          };
        }
      }
      return newSellouts;
    },
    // 限量的匹配
    getMenuLimitData(item) {
      const limitLists = this.getVuexItemLimitsMap;
      let newLimitLists = null;
      for (const key in limitLists) {
        if (limitLists[item.itemId]) {
          newLimitLists = {
            limitQuantity: limitLists[item.itemId].limitQuantity, // 限量的数
            salesQuantity: limitLists[item.itemId].salesQuantity, // 已售出的数
            // quantity: (limitLists[item.itemId].limitQuantity*1000-limitLists[item.itemId].salesQuantity*1000)/1000,//限量所剩下的数
            quantity: limitLists[item.itemId].restQuantity,
            isAutoRestore: limitLists[item.itemId].isAutoRestore, // 自动重置
            type: limitLists[item.itemId].type, // 0不指定（默认），1当前市别（退单限量时默认）,2当天
          };
        }
      }
      return newLimitLists;
    },
    // 分页组件修改完当前页的触发事件
    pagechange(current) {
      this.currentPage = current;
    },
    // 类的点击事件
    activePkgClass(list) {
      this.activePkgClassData = list;
      // 设置当前的页数
      this.bottomCurrentPage = 1;
      // 这是销毁下 分页组件的index的暂存 值重新给赋值
      // this.$refs.topScroll && this.$refs.topScroll.init()

      this.$refs.bottomScroll && this.$refs.bottomScroll.init();
    },
    // 限量的判断
    limitHandel(menu, num) {
      // 如果限量的数据不存在从新匹配下，防止默认添加的品项
      const itemLimitData = menu.itemLimitData || this.getMenuLimitData(menu);
      if (itemLimitData && (!itemLimitData.quantity || sub(itemLimitData.quantity, menu.count) < num)) {
        const messageText = this.$t('Biz.Order.LimitQuantityVal0', [itemLimitData.quantity]);
        this.isShowMessage(messageText);
        return true;
      }
      return false;
    },
    // 小类数量限定判断
    /**
     * item当前点的菜
     * items 代表是当前所有已点的菜 包含（当前套餐其他的菜和当前套餐的明细和）
     * changeNum 变化的数量
     */
    limitItemSamllClsNumJudge(item, items, changeNum) {
      const limitSmallClsItemNum = this.haveLimitSmallClasses[item.smallClassId];
      if (limitSmallClsItemNum) {
        // 入库的当前菜对应的小类已点的总数
        // 账单除当前套餐所有已点小类的菜总和
        let orderingItemSmClsTotal = 0;
        if (this.$parent.guestList) {
          orderingItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId, this.$parent.guestList, 'num');
        }
        const orderingItemPkgSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId, items, 'count');
        if (limitSmallClsItemNum < add(orderingItemPkgSmClsTotal, add(orderingItemSmClsTotal, changeNum))) {
          this.$message.error(`菜品所属小类限定数为${limitSmallClsItemNum}`);
          return false;
        }
      }
      return true;
    },
    // 加单事件 isEnter 是否是回车加的单
    addMenu(menu, index, isEnter = false) {
      console.log('加单事件menu', menu);
      // 加单的时候数量默认为1
      let count = 1;
      // 如果快速查找里面有所搜条件的话就要清空
      this.menuSearch = '';
      // 每次添加的数量默认为1
      if (menu.itemSelloutData) {
        this.isShowMessage(this.$t('Biz.Order.ItemSellOut'));
        return;
      } if (menu.itemLimitData) { // 存在品项限量就要进行判断
        if (this.limitHandel(menu, 1)) {
          return;
        }
      }
      // 加单的时候如果是已提交并且是联动的套餐那么加单的数量是主套餐的数量
      if (this.scId && !this.pkgMainData.isNotFollowAmount) {
        count = this.pkgMainData.lastQty;
      }
      if (!this.limitItemSamllClsNumJudge(menu, this.pkgSelecteItems, 1)) {
        return;
      }
      const extendMenu = this.scId ? {
        count,
        itemCode: menu.code,
        itemName: menu.name,
        itemUnit: menu.unitName,
        stdPrice: menu.price,
        type: 1,
        proportionNum: 1, // 加单数量和主套餐的数量的比列
        smallClassId: menu.smallClassId,
      } : {
        count,
        itemCode: menu.code,
        itemName: menu.name,
        itemUnit: menu.unitName,
        stdPrice: menu.price,
        smallClassId: menu.smallClassId,
      };
      const itemData = extend({}, menu, extendMenu);
      this.$log.debug(`宴会套餐加单组合数据：${itemData}`);
      this.pkgSelecteItems.push(itemData);
      this.activeMenuIndex = index || 0;
      // 如果是回车加的菜清空输入框，点击不清空
      if (isEnter) {
        this.menuSearch = '';
      }

      // 默认选中刚加单的
      this.activeItem(menu, (this.pkgSelecteItems.length - 1));
      // 强制刷新
      this.$refs.partitemListPager.pushRefresh();
      // 滚动到最底部
      this.scrollEnd();

      // 快速修改数量
      if (menu.enableEasyDiskModifyQty) {
        this.pkgChangeNumber();
      }

      // 改变菜单已点数量
      menu.count = add(count, menu.count);
    },
    // 滚到底部
    scrollEnd() {
      // setTimeout(()=> {
      //   let addBillBox = this.$refs.partitemListUl
      //   if(addBillBox.scrollHeight > addBillBox.clientHeight) {
      //     addBillBox.scrollTop = sub(addBillBox.scrollHeight,addBillBox.clientHeight)
      //   }
      // },20)
      this.$nextTick(() => {
        const addBillBox = this.$refs.partitemListUl;
        if (addBillBox.scrollHeight > addBillBox.clientHeight) {
          addBillBox.scrollTop = sub(addBillBox.scrollHeight, addBillBox.clientHeight);
        }
      });
    },
    // 账单的品项选中事件初始化
    activeItem(item, index) {
      this.activeCondition.activeItemData = item;
      this.activeCondition.activeItemId = `${item.itemId}-${index}`;
      this.activeCondition.activeItemIndex = index;
    },
    // 账单的功能按钮事件
    actionBtnClick(fnName) {
      console.info(fnName);
      if (this.activeCondition.activeItemId.length) {
        this[fnName] && this[fnName]();// 执行对应的方法
      } else {
        // 提示
        if (['pkgChangePrice', 'openItemTemp'].indexOf(fnName) !== -1) {
          this[fnName]();
        } else {
          this.isShowMessage(this.$t('Dict.SelectTheAddedItem'));
        }
      }
    },
    numHandle(num, item) {
      const handleItem = item || this.activeCondition.activeItemData;
      // 如果是临时品项就不需要一下操作 // 1正常品项，2临时品项，3常规套餐品项，4 宴会套餐品项
      if (handleItem.itemType === 2) {
        return false;
      }
      // 找到右侧对应的菜单品项
      const menu = this.menusHandel.filter(_ => _.itemId == handleItem.itemId)[0];
      // 给右侧的找到的对应品项的cout 重新赋值
      if (menu) {
        this.$set(menu, 'count', add(menu.count, num));
      } else {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.DishesArchivesChange'),
        });
      }
    },
    // 删除功能
    pkgDelete() {
      // 记录当前要删除的品项数量
      const menuCount = this.pkgSelecteItems[this.activeCondition.activeItemIndex].count;
      this.numHandle(-menuCount);
      this.pkgSelecteItems.splice(this.activeCondition.activeItemIndex, 1);
      this.$log.debug(`宴会套餐品项删除：${this.pkgSelecteItems}`);
      // 初始化下被选中的账单品项
      this.activeItemInit();
    },
    // 加加事件
    pkgAdd(num) {
      const newNum = num || 1;
      const item = this.pkgSelecteItems[this.activeCondition.activeItemIndex];
      // 判断限量
      if ((item.itemLimitData || item.limitQuantity) && newNum > 0) {
        if (this.limitHandel(item, newNum)) {
          return;
        }
      }
      // 判断如果数小于等于0就删除
      if (add(item.count, newNum) <= 0) {
        this.pkgDelete();
        return;
      }
      if (!this.limitItemSamllClsNumJudge(item, this.pkgSelecteItems, newNum)) {
        return;
      }
      this.numHandle(newNum);
      console.log(item);
      this.$set(item, 'count', add(item.count, newNum));
    },
    // 减减事件
    pkgSubtract(num) {
      const newNum = num || 1;
      this.pkgAdd(-newNum);
    },
    // 半份
    pkgItemHalf() {
      const menuCahnge = this.pkgSelecteItems[this.activeCondition.activeItemIndex];
      const changeAddNum = (0.5 * 1000 - menuCahnge.count * 1000) / 1000;
      this.$log.debug(`宴会套餐品项半份浮点数精度记录：${changeAddNum}`);
      // 这 执行了方法 如果是false 证明条件不符合不能关闭
      changeAddNum != 0 && this.pkgAdd(changeAddNum);
    },
    // 改量事件
    pkgChangeNumber() {
      // 改量 组合弹框所需要的数据
      const menuCahnge = this.pkgSelecteItems[this.activeCondition.activeItemIndex];
      const itemChangeData = {
        num: (this.scId && !this.pkgMainData.isNotFollowAmount)
          ? div(menuCahnge.count, this.pkgMainData.lastQty)
          : menuCahnge.count, // 当前选择的品项数量值
        itemName: menuCahnge.itemName, // 品项名称
        itemUnitName: menuCahnge.itemUnit, // 单位名称
        isHaveScIdFollowAmount: this.scId && !this.pkgMainData.isNotFollowAmount, // 是否是对提交完并且是
        pkgMainQty: this.pkgMainData.lastQty, // 套餐的数量
        total: menuCahnge.count, // 总数
        auxiliaryUnitQty: menuCahnge.auxiliaryUnitId
          ? (this.scId && !this.pkgMainData.isNotFollowAmount)
            ? div(menuCahnge.auxiliaryUnitQty || 1, this.pkgMainData.lastQty)
            : menuCahnge.auxiliaryUnitQty || 1
          : null, // 辅助单位数量
        auxiliaryUnitName: menuCahnge.auxiliaryUnitName || '',
      };
      // 改量弹框
      this.$refs.PackageChangeNum.open(itemChangeData, {
        submit: (changeNumData) => {
          let changedNum = changeNumData.num;
          // 重置下辅助单位数量
          if (changeNumData.auxiliaryUnitQty) {
            this.$set(menuCahnge, 'auxiliaryUnitQty', changeNumData.auxiliaryUnitQty);
          }
          // 如果是已提交并且是联动套餐的明细修改走一下逻辑
          if (changeNumData.isHaveScIdFollowAmount) {
            changedNum = changeNumData.total.zTotalNum;
            // const { findItem } = this.findActivceItemData();
            // // 重新设置下明细和套餐的比列
            this.$set(menuCahnge, 'proportionNum', (changedNum * 1000) / (this.pkgMainData.lastQty * 1000));
            if (changeNumData.auxiliaryUnitQty) {
              this.$set(menuCahnge, 'auxiliaryUnitQty', multi(changeNumData.auxiliaryUnitQty, this.pkgMainData.lastQty));
            }
          }
          // 判断改量是增加了还是减少了
          if (changedNum > menuCahnge.count) {
            // 增加了 就调用加加 的方法 this.pkgItemChangeCount('pkgAdd',changeAddNum)
            const changeAddNum = (changedNum * 1000 - menuCahnge.count * 1000) / 1000;
            // 这 执行了方法 如果是false 证明条件不符合不能关闭
            this.pkgAdd(changeAddNum);
            this.$refs.PackageChangeNum.close();
          } else if (changedNum == menuCahnge.count) {
            // 相等的时候没有进行变化 直接关闭窗口
            this.$refs.PackageChangeNum.close();
          } else {
            // 比原先减少了就执行减的方法 pkgSubtract
            const changeSubNum = (menuCahnge.count * 1000 - changedNum * 1000) / 1000;
            this.pkgSubtract(changeSubNum);
            this.$refs.PackageChangeNum.close();
          }
        },
      });
    },
    // 改价
    pkgChangePrice() {
      const pkgMain = {
        lastQty: this.pkgMainData.lastQty, // 当前套餐数量值
        originalPrice: this.pkgMainData.originalPrice, // 套餐的原单价
        price: this.pkgMainData.price, // 套餐可修改的价格
        name: this.pkgMainData.name,
      };
      this.$refs.PackageChangePrice.open(pkgMain, {
        submit: (changePriceData) => {
          if (changePriceData.price == this.pkgMainData.price) {
            // 相等的时候没有进行变化 直接关闭窗口
            this.$refs.PackageChangePrice.close();
          } else {
            // 修改下套餐的价格
            if (this.pkgMainData.price != changePriceData.price) {
              this.$set(this.pkgMainData, 'price', changePriceData.price);
              // 变价价格类型为4 ,打折标识为3
              this.$set(this.pkgMainData, 'discFlg', 3);
              this.$set(this.pkgMainData, 'priceType', 4);
            }
            this.$log.debug(`宴会套餐套餐价格修改：${this.pkgMainData}`);
            this.$refs.PackageChangePrice.close();
          }
        },
      });
    },
    /** *
     * @params itemData object      代表当前所操作品项的数据
     * @params methodsData object   代表是请求过来的做法数据
     * @params pkgItem number
     *
     * 代表是请求过来的做法数据 如果是不存在代码的是非套餐的品项, 1-代表的是常规套餐明细的做法修改  2-代表的是宴会套餐明细的做法修改
     */
    pkgChoseMethod() {
      const itemData = this.activeCondition.activeItemData;
      const ulr = this.getisSetUpGroupMethod ? 'canyin.pos.bill.itemmethodgroupinfo' : 'canyin.pos.bill.moremethodandserveway';
      ajax(ulr, {
        params: {
          itemId: itemData.realItemId,
          itemSizeId: itemData.itemSizeId,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (res.data.code == 1) {
          this.$refs.PackageItemMethod.open({ itemData, methodsData: res.data.data, pkgItem: 2 }, {
            submit: (methodData) => {
              // 对当前选中的类所有已添加的品项进行添加做法
              if (methodData.publicIsValid) {
                this.pkgSelecteItems.map((_) => {
                  // 如果存在就直接替换,不存在就添加
                  // 存在合并去重
                  if (_.methodList && _.methodList.length) {
                    const mergeMethodList = [..._.methodList, ...methodData.methodList];
                    const hash = {};
                    const newMethodList = mergeMethodList.reduce((preVal, curVal) => {
                      hash[`${curVal.id}${curVal.name}`] ? '' : hash[`${curVal.id}${curVal.name}`] = true && preVal.push(curVal);
                      return preVal;
                    }, []);
                    this.$set(_, 'methodList', newMethodList);
                  } else {
                    // 如果不存在就添加
                    this.$set(_, 'methodList', methodData.methodList);
                  }
                });
              } else {
                // 找到对应的品项数据并添加做法
                const menuCahnge = this.pkgSelecteItems[this.activeCondition.activeItemIndex];
                this.$set(menuCahnge, 'methodList', methodData.methodList);
              }
              this.$refs.PackageItemMethod.close();
            },
          });
        }
      });
    },
    // 上菜方式
    pkgServeWay() {
      const itemData = this.activeCondition.activeItemData;
      this.$refs.PackageItemServeWay.open({ itemData }, {
        submit: (serveWayData) => {
          const menuCahnge = this.pkgSelecteItems[this.activeCondition.activeItemIndex];
          if (serveWayData.isOrderingBillAllServeWay) {
            this.pkgSelecteItems.map((_) => {
              this.$set(_, 'serveWay', serveWayData.serveWay);
              this.$set(_, 'serve_way_id', serveWayData.serveWay.id);
              this.$set(_, 'serveWayId', serveWayData.serveWay.id);
            });
          } else if (serveWayData.isOrderingBillTypeServeWay) {
            this.pkgSelecteItems.map((_) => {
              if (serveWayData.smallClassId == _.smallClassId) {
                this.$set(_, 'serveWayId', serveWayData.serveWay.id);
                this.$set(_, 'serveWay', serveWayData.serveWay);
                this.$set(_, 'serve_way_id', serveWayData.serveWay.id);
              }
            });
          } else {
            this.$set(menuCahnge, 'serveWayId', serveWayData.serveWay.id);
            this.$set(menuCahnge, 'serveWay', serveWayData.serveWay);
            this.$set(menuCahnge, 'serve_way_id', serveWayData.serveWay.id);
          }
          this.$refs.PackageItemServeWay.close();
        },
      });
    },
    // 临时品项
    openItemTemp() {
      ajax('canyin.pos.bill.billitemtempview', {
        params: {
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((data) => {
        // const obj = {};
        // let { openTime } = this.getVuexPointData;
        // const { name: pointName, peopleQty } = this.getVuexPointData;
        // openTime = dateFormat('%H:%I', Date.parse(openTime));
        // obj.pointData = { pointName, openTime, peopleQty };
        // extend(data, obj);
        const pkgTempItemData = {
          ...data,
          ...{ pointData: { isPkg: true, pkgName: this.pkgMainData.name } },
        };
        this.$refs.itemTemp.open(pkgTempItemData, {
          submit: (itemData) => {
            this.addMenu(
              {
                ...itemData,
                itemId: `${itemData.id}-1`,
                itemSizeId: '-1',
                realItemId: itemData.id,
                enableMutiSize: false,
                origPrice: itemData.price,
                isTempItem: true,
              },
            );
            // 临时品项加入点菜单
            // this.$vemit('posOrderAddDish', { item: itemData });
          },
        });
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 选中的初始化
    activeItemInit() {
      this.activeCondition.activeItemId = '';
      this.activeCondition.activeItemIndex = null;
      this.activeCondition.activeItemData = {};
    },
    // 确认按钮
    submitPkgPartItems() {
      // 套餐加单-限制数量（最大、最小值）
      if (!this.limitLastQty(this.pkgMainData.lastQty)) return false;
      const { pointGroupId } = this.getVuexPointData;
      // 判断是否有加单
      let isSubmitTrue = true;// 是否可以提交
      if (!this.pkgSelecteItems.length) {
        this.isShowMessage(this.$t('Biz.Order.PkgListCannotEmpty'));
        return;
      }
      const pkgList = [];
      this.pkgSelecteItems.forEach((pkgClassItem) => {
      // 判断下添加的品项是否属于分组客位的显示的菜
        if (pointGroupId && pkgClassItem.pointGroupId && pkgClassItem.pointGroupId !== pointGroupId) {
          this.$message({
            type: 'error',
            message: this.$t('Biz.Order.LongMsg017', [pkgClassItem.itemName]),
          });
          isSubmitTrue = false;
          return;
        }
        // 提交的时候 判断默认添加的品项是否是估清的品项 对入库套餐并且是已加单的明细不予处理
        if (pkgClassItem.isSellout && !(pkgClassItem.scId && this.scId)) {
          this.$message({
            type: 'error',
            message: this.$t('Biz.Order.LongMsg021', [pkgClassItem.itemName]),
          });
          isSubmitTrue = false;
          return;
        }
        // 判断默认添加的品项是否是超出了品项限量
        const limitData = pkgClassItem.itemLimitData || this.getMenuLimitData(pkgClassItem);
        if (limitData) {
          // 如果入库的不于处理
          if (limitData.quantity < pkgClassItem.count && !(pkgClassItem.scId && this.scId)) {
            this.$message({
              type: 'error',
              message: this.$t('Biz.Order.LongMsg022', [pkgClassItem.itemName]),
            });
            isSubmitTrue = false;
            return;
          }
        }
        // 整理套餐列表的数据
        let item = this.scId ? {
          itemId: pkgClassItem.realItemId, // 品项id
          realItemId: pkgClassItem.realItemId,
          itemSizeId: pkgClassItem.itemSizeId ? pkgClassItem.itemSizeId : -1, // 品项规格id
          code: pkgClassItem.itemCode, // 品项code
          name: pkgClassItem.itemName, // 品项名称
          unitId: pkgClassItem.itemUnitId ? pkgClassItem.itemUnitId : pkgClassItem.unitId, // 品项单位id
          unitName: pkgClassItem.itemUnitName ? pkgClassItem.itemUnitName : pkgClassItem.unitName, // 品项单位名称
          costPrice: pkgClassItem.costPrice, // 品项成本价格
          stdPrice: pkgClassItem.stdPrice,
          qty: pkgClassItem.count, // 已点的品项数量
          raisePrice: pkgClassItem.raisePrice, // 加价 价格
          isRaiseByQty: pkgClassItem.isRaiseByQty, // 是否按数量加价
          methodList: pkgClassItem.methodList ? pkgClassItem.methodList : [], // 做法
          serve_way_id: (pkgClassItem.serveWay && pkgClassItem.serveWay.id) ? pkgClassItem.serveWay.id : (pkgClassItem.serveWay ? pkgClassItem.serveWay.split('_')[0] : 0), // 上菜方式
          type: pkgClassItem.type == 1 ? pkgClassItem.type : 0,
          scId: pkgClassItem.scId ? pkgClassItem.scId : null,
          smallClassId: pkgClassItem.smallClassId, // 套餐明细的小类id
          itemType: pkgClassItem.itemType, // 品项的类型
        } : {
          id: pkgClassItem.realItemId, // 品项id
          sizeId: pkgClassItem.itemSizeId, // 品项规格id
          code: pkgClassItem.itemCode, // 品项code
          name: pkgClassItem.itemName, // 品项名称
          unitId: pkgClassItem.unitId, // 品项单位id
          unitName: pkgClassItem.itemUnit || pkgClassItem.unitName, // 品项单位名称
          costPrice: pkgClassItem.costPrice ? pkgClassItem.costPrice : 0, // 品项成本价格 临时品项没有成本价格默认设为0，给套餐里的临时品项做下兼容
          stdPrice: pkgClassItem.stdPrice,
          num: pkgClassItem.count, // 已点的品项数量
          isSellout: pkgClassItem.isSellout, // 是否是估清
          methodList: pkgClassItem.methodList ? pkgClassItem.methodList : [], // 做法
          serveWay: pkgClassItem.serveWay ? pkgClassItem.serveWay : null, // 上菜方式
          smallClassId: pkgClassItem.smallClassId, // 套餐明细的小类id
          itemType: pkgClassItem.itemType, // 品项的类型
        };
        // 增加辅助单位的key
        if (pkgClassItem.auxiliaryUnitId) {
          item = Object.assign({}, item, {
            auxiliaryUnitId: pkgClassItem.auxiliaryUnitId,
            auxiliaryUnitQty: pkgClassItem.auxiliaryUnitQty || 1,
            auxiliaryUnitName: pkgClassItem.auxiliaryUnitName,
          });
        }
        this.$set(item, 'apportionFlg', pkgClassItem.apportionFlg !== false); // 是否参与分摊 true 分摊 false 不分摊 null 分摊
        pkgList.push(item);
      });
      this.$log.debug(`宴会套餐账单数据：${pkgList}`);
      const pkgPartSubmitData = this.scId ? {
        itemId: `${this.pkgMainData.id}_-1`, // 套餐的id
        qty: this.pkgMainData.lastQty, // 数量
        name: this.pkgMainData.name, // 名称
        costPrice: this.pkgMainData.costPrice, // 成本价格
        price: this.pkgMainData.price, // 价格
        salePrice: this.pkgMainData.price ? this.pkgMainData.price : this.pkgMainData.salePrice,
        pkgList, // 套餐明细列表
        itemSizeId: -1, // 套餐主项没有规格 因此默认传-1
        realItemId: this.pkgMainData.id,
        priceType: this.pkgMainData.priceType ? this.pkgMainData.priceType : 1, // 价格类型
        bigClassId: this.pkgMainData.bigclassid,
        smallClassId: this.pkgMainData.smallClassId,
        unitName: this.pkgMainData.unit,
        unitId: this.pkgMainData.unitId,
        isCanDiscount: false,
      } : {
        id: this.pkgMainData.id, // id
        num: this.pkgMainData.lastQty, // 数量
        name: this.pkgMainData.name, // 名称
        costPrice: this.pkgMainData.costPrice, // 成本价格
        price: this.pkgMainData.price, // 价格
        priceType: this.pkgMainData.priceType || 1, // 价格类型
        pkgList, // 套餐明细列表
        realItemId: this.pkgMainData.id,
        isItemTimePrice: this.pkgMainData.isItemTimePrice, // 时价的判断
      };
      // 这样判断如果是联动的话不知道给的值是否准确不联动可定是true
      pkgPartSubmitData.isNotFollowAmount = !!this.pkgMainData.isNotFollowAmount;// 信息中增加isNotFollowAmount属性，true为套餐明细数量不跟主套餐数量联动，否则均为联动
      // 一份套餐所有明细的做法合计
      pkgPartSubmitData.pkgListTotalMakeFee = this.pkgListTotalMakeFee;
      // 促销价存在给赋值
      if (this.pkgMainData.promotePrice != null && this.pkgMainData.promotePrice != undefined && this.pkgMainData.promotePrice != 'undefined') {
        pkgPartSubmitData.promotePrice = this.pkgMainData.promotePrice; // 促销价格
      }
      // 标准价格
      if (this.pkgMainData.stdPrice != null && this.pkgMainData.stdPrice != undefined && this.pkgMainData.stdPrice != 'undefined') {
        pkgPartSubmitData.stdPrice = this.pkgMainData.stdPrice; // 标准价格
      }
      // 会员价存在给赋值
      if (this.pkgMainData.memberPrice != null && this.pkgMainData.memberPrice != undefined && this.pkgMainData.memberPrice != 'undefined') {
        pkgPartSubmitData.promotePrice = this.pkgMainData.memberPrice; // 会员价格
      }
      pkgPartSubmitData.discFlg = this.pkgMainData.discFlg;// 打折
      // 执行回调
      // this.pkgPartData为原始数据类型的数据 为修改套餐做铺垫
      this.$log.debug(`宴会套餐提交数据组合：${pkgPartSubmitData}`);
      if (isSubmitTrue) {
        if (this.scId) {
          this.submit(pkgPartSubmitData, this.pkgPartData, this.skipKitchenPrint);
        } else {
          this.submit(pkgPartSubmitData, this.pkgPartData);
        }
      }
    },
    // 提示的公共方法
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo '), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },

  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/pos/fastFood/package.less";
/*.disabledClass {*/
/*  pointer-events: none;*/
/*  cursor: not-allowed;*/
/*  opacity: 0.6;*/
/*}*/
</style>
