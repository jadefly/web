<template>
  <Dialog
    name="PosDialog.ArrangeMenuDetail"
    :title="title[arrangeMenuOpenType]"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    top="auto"
    width="1024px"
    height="100%"
    maxHeight="768px"
    :hotkeys="hotKeySet"
    :showSubmit="true"
    customClass="moudel-center"
    :submitText="$t('Dict.Preservation')"
  >
    <template slot="other-button" v-if="arrangeMenuOpenType == 'change'">
      <button
        type="button"
        id="SaveAsDOMId"
        class="btn btn-default top-button topButton"
        @click="saveAsArrangeMenu"
        v-autotest
      >{{ $t('Dict.SaveAs') }}(F1)</button>
    </template>
    <div class="arrangeMenuDetail-container wrap" id="arrangeWrap">
      <!-- 左侧 -->
      <div class="arrangeMenu-bill-box">
        <div class="arrangeMenu-bill-content" :class="arrangeMenuSetting.isPkgArrangeMenu ? '' : 'newMode-arrangeMenu-bill-content'">
          <div class="arrangeMenu-bill-header">
            <div class="arrangeMenu-bill-main">
              <p class="pkgNameShowBox">
                <label>{{ $t('Biz.ArrangeMenu.ArrangeMenuNamex') }}</label>
                <input
                  type="text"
                  id="enterPkgName"
                  :placeholder="$t('Biz.ArrangeMenu.InputPkgName')"
                  v-model.trim="pkgName"
                  @focus="inputFocus()"
                  @blur="inputBlur()"
                  v-judge
                  v-autotest
                >
                <button
                  type="button"
                  class="btn btn-default handWritingBtn"
                  @click="handWriting"
                  v-hideHandwritingBoard
                >
                  <i class="icon icon-edit"></i>
                  <span>{{ $t('Dict.WritingPad') }}</span>
                </button>
              </p>
              <div class="pkgTwoRow">
                <div class="pkgPriceShowBox" v-if="arrangeMenuSetting.isPkgArrangeMenu">
                  <el-form
                    size="small"
                    :model="pkgMianData"
                    label-position="left"
                    :rules="rules"
                    @submit.native.prevent
                    ref="methodForm"
                    label-width="86px"
                  >
                    <el-form-item
                      :label="$t('Biz.ArrangeMenu.ArrangeMenuPrice')"
                      :prop="arrangeMenuSetting.ArrangeMenuLinkageShowTotal ? '' : 'pkgPrice'"
                      v-if="isOpen"
                    >
                      <el-input
                        v-if="arrangeMenuSetting.ArrangeMenuLinkageShowTotal"
                        ref="changePrice"
                        v-judge
                        v-model.trim="pkgLastTotal"
                        v-num-keyboard:bottom-right="{focusSetKeyboardPosition:'bottom'}"
                        v-autotest
                        @focus="inputFocus()"
                        @blur="inputBlur()"
                        class="disabledClass"
                      >
                        <i class="price-prefix" slot="prefix">￥</i>
                      </el-input>
                      <el-input
                        ref="changePrice"
                        v-else
                        v-judge
                        v-model.trim="pkgMianData.pkgPrice"
                        v-num-keyboard:bottom-right="{focusSetKeyboardPosition:'bottom'}"
                        v-autotest
                        @focus="inputFocus()"
                        @blur="inputBlur()"
                      >
                        <i class="price-prefix" slot="prefix"></i>
                      </el-input>
                      <span class="changeBtn icon icon-jisuanqi" @click="openCalcTemp"></span>
                    </el-form-item>
                  </el-form>
                </div>
                <div class="tableNumber" :class="arrangeMenuSetting.isPkgArrangeMenu ? '' : 'newModelTableNumber'">
                  <el-form
                    size="small"
                    :model='pkgMianData'
                    :rules="rules"
                    @submit.native.prevent
                  >
                    <el-form-item :label="$t('Dict.TableNumber')" prop="tableNumber">
                      <span class="subtractBtn" @click="tableNumberMinus">-</span>
                      <el-input
                        :style="{width:'55px'}"
                        v-model.trim="pkgMianData.tableNumber"
                        ref="tableNum"
                        v-num-keyboard:bottom-right="{focusSetKeyboardPosition:'bottom'}"
                        v-judge
                        v-autotest
                        @focus="inputFocus()"
                        @blur="inputBlur()"
                      ></el-input>
                      <span class="addBtn" @click="tableNumberPlus">+</span>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
              <div class="pkgThreeRow">
                <div class="pkgModuleName" v-if="arrangeMenuSetting.isPkgArrangeMenu">
                  <label>{{ $t('Dict.BanquetModel')}}</label>
                  <span class="selectMenuTemp">{{ currentPackageTemp.name }}</span>
                  <span class="changeBtn icon icon-edit" @click="openPackageTemp"></span>
                </div>
                <div class="pkgRemarks" :class="arrangeMenuSetting.isPkgArrangeMenu ? '' : 'newModelPkgRemarks'">
                  <label>{{ $t('Dict.Remarkss')}}</label>
                  <input
                    v-model.trim="remark"
                    type="text"
                    ref="remarkInput"
                    @focus="inputFocus()"
                    @blur="inputBlur()"
                  >
                </div>
              </div>
            </div>
            <div class="arrangeMenu-bill-money" v-if="arrangeMenuSetting.isPkgArrangeMenu">
              <div>
                <span>{{ $t('Biz.ArrangeMenu.ArrangeMenuOriginalPrice') }}</span>
                <span>{{pkgLastTotal }}</span>
              </div>
              <div>
                <span>{{ $t('Dict.DetailNumber') }}</span>
                <span>{{ pkgAddItemsLastQty }}</span>
              </div>
              <div>
                <span>{{ $t('Dict.AllowanceAmount') }}</span>
                <span>{{allowanceAmountFn.allowanceAmount}}</span>
              </div>
              <div>
                <span>{{ $t('Dict.AllowanceRatio') }}</span>
                <span>{{ allowanceAmountFn.proportion }}</span>
              </div>
            </div>
          </div>
          <!-- 账单菜品区域 -->
          <div class="arrangeMenu-bill-dish" id="arrangeMenuBillList" ref="arrangeMenuBillList">
            <!-- 小类块 -->
            <div
              v-for="(classList, classIndex) in selectedClassItems"
              :key="classList.itemClassId + classIndex"
            >
              <p class="item-class-name">{{ classList.itemClassName+'['+classList.qty+']' }}</p>
              <ul>
                <!-- 菜品, :ref-因id组装存在问题,使用了realItemId+itemSizeId+index组合,保证正确性 -->
                <li
                  v-for="(item, index) in classList.items"
                  :key="item.itemId+index"
                  :class="{ active : billListActive(item, index) }"
                  :ref="'billSmallItemREF' + item.realItemId + item.itemSizeId + index"
                  @click="billClickFn(item, index, classIndex)"
                >
                  <div :class="{ packageItem : item.isPackage || item.pkgList }">
                    <div class="item-name">
                      <!-- 名称后面拼接下 辅助单位数量和单位名称 -->
                      <strong>
                        {{
                          item.itemType === 2
                          ? '['+$t('Dict.Temporary')+']' + item.name
                          : (item.itemName || item.name)
                        }}
                        {{
                          item.auxiliaryUnitId
                          ? `(${Number(item.auxiliaryUnitQty) || 1}${item.auxiliaryUnitName})`
                          : ''
                        }}
                      </strong>
                      <em class="changed" :class="item.discFlg && discFlgdata[item.discFlg] ? discFlgdata[item.discFlg].className : ''">
                        {{
                          +item.discFlg && discFlgdata[item.discFlg]? discFlgdata[item.discFlg].text : ''
                        }}
                      </em>
                    </div>
                    <div class="item-content">
                      <span>
                        <em>{{ $t('Dict.UnitPrice1') }}</em>
                        <em>{{Number(item.price) }}</em>
                      </span>
                      <span>{{ Number(item.qty) + item.unitName }}</span>
                      <span>
                        <em>{{ $t('Dict.Subtotal1') }}</em>
                        <em>{{computeLastSubtotal(item)}}</em>
                      </span>
                    </div>
                    <div class="item-remarks" v-if="item.methodList && item.methodList.length">
                      <span>{{ $t('Dict.Notes01')}}</span>
                      <span v-for="(method, index) in item.methodList" :key="index">
                        {{ method.name }}{{ method.price
                          ? '(+' + method.price + ( method.qty && method.qty!=1
                              ? 'x'+ method.qty
                              : '' ) + ')'
                          : '' }}
                        <strong
                          v-if="index != (item.methodList.length - 1)"
                        >|</strong>
                      </span>
                    </div>
                  </div>
                  <ul v-if="item.isPackage || item.pkgList" class="pkgList">
                    <li
                      v-for="(list, index) in item.pkgList"
                      :key="item.itemId+list.itemId+index"
                    >
                    <p class="pkgItemContent">
                      <i data-v-c7bd95f2="" class="icon icon-dian1"></i>

                      <span>
                        {{
                          list.itemType === 2
                          ? '['+$t('Dict.Temporary')+']' + list.name
                          : list.itemSizeId !== '-1' && list.sizeName ? `(${ list.sizeName })${ list.name }` : list.name
                        }}
                        {{
                          list.auxiliaryUnitId
                          ? `(${Number(list.auxiliaryUnitQty) || 1}${list.auxiliaryUnitName})`
                          : ''
                        }}
                      </span>
                      <span>{{ list.num ? list.num : Number(list.qty) }}{{ list.unitName }}</span>
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
            </div>
          </div>
        </div>
        <!-- 分页 -->
        <div v-if="!arrangeMenuSetting.isPkgArrangeMenu" class="bill-length-box">
          <span>
            {{ $t('Biz.Order.AllCopies', [selectedItemNums]) }}
          </span>
          <span> , </span>
          <span>
            {{$t('Dict.Total01')}}{{pkgLastTotal}}
          </span>
        </div>
        <div class="arrangeMenu-bill-pagerBox">
          <!-- 进入分页公共组件 -->
          <Pager
            pagerId="arrangeMenuBillList"
            scrollMode="simple"
            ref="arrangeMenuBillListPager"
            itemTag="> div"
          ></Pager>
        </div>
      </div>
      <!--中间操作功能按钮-->
      <div class="actionBtn">
        <ul>
          <li
            v-for="(btn, index) in partContorlBtnDataNow"
            @click="actionBtnClick(btn.method)"
            :id="btn.id"
            :key="index"
            :class="{disabledClass:btn.disabled}"
          >
            <span>{{btn.btnName}}</span>
          </li>
        </ul>
      </div>
      <!-- 右侧 -->
      <div class="arrangeMenu-items-box">
        <div class="items-class" id="itemsClass">
          <!-- 类别的数据列表 -->
          <div
            class="all-small-class"
            @click="activeSmallClass(allSmallClassBtnData)"
            :class="{active: activeClassData.id === allSmallClassBtnData.id }"
          >{{allSmallClassBtnData.name}}</div>
          <div
            class="small-class-list"
            id="smallClassListBox"
            :class="{ noPager: !(itemSmallClassList.length > classPageCount) }"
          >
            <ul>
              <li
                v-for="list in smallClassList"
                :key="list.id"
                :class="{active: activeClassData.id == list.id }"
                @click="activeSmallClass(list)"
                id="smallClassList"
              >
                <span>{{list.name}}</span>
              </li>
            </ul>
          </div>
          <div class="small-class-pager" v-if="itemSmallClassList.length > classPageCount">
            <!-- 进入分页公共组件 -->
            <NumPager
              :total="classListTotal"
              @pagechange="pagechange"
              :displayCount="classPageCount"
              ref="topScroll"
            ></NumPager>
          </div>
        </div>
        <div class="arrange-items-content" id="itemsListBox">
          <ul id="arrangeitems" v-autotest>
            <li
              class="item-list"
              v-for="(item, index) in itemsCurrnetPageShow"
              :key="item.itemId+'-'+index"
              id="itemsList"
              :class="{active: activeItemIndex === index}"
              @click="activeItemAction(index)"
            >
              <p>
                <span>{{item.code}}</span>
              </p>
              <p>{{item.itemName || item.name}}</p>
              <p>{{item.price}}/{{item.unitName}}</p>
              <em class="showCount" v-show="item.count">{{"x"+item.count}}</em>
            </li>
          </ul>
        </div>
        <div class="arrangeMenu-items-foot-action">
          <div class="items-search">
            <label for>
              <i class="icon icon-search"></i>
              <input
                id="arrangeItemsSearch"
                ref="arrangeItemsSearch"
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
            <span>{{ $t('Dict.Altogether') + itmesTotal + $t('Dict.Strip')}}</span>
            <span>{{ itemsCurrentPage + '/' + itemsPageTotal + $t('Dict.Page')}}</span>
          </div>
          <div class="items-page-box">
            <!-- 进入分页公共组件 -->
            <NumPager
              :total="itmesTotal"
              @pagechange="itemsPageChange"
              :displayCount="itemsPageCount"
              ref="itemsPageBtn"
            ></NumPager>
          </div>
        </div>
      </div>
      <PackageTemp
        ref="packageTemp"
        @chosenPackageTemp="chosenPackageTempCallback">
      </PackageTemp>
      <PackageChangeNum
        ref="PackageChangeNum"
        submitId="arrangeMenuDetailModifyNum">
      </PackageChangeNum>
      <!-- 修改数量的组件-->
      <PackageItemMethod
        ref="PackageItemMethod"
        type="arrangeMenuDetailModifyMethod"
        submitId="arrangeMenuModifyMethod"
        :isArrangeMenuMethod="isArrangeMenuMethod"
      ></PackageItemMethod>
      <!-- 做法的组件-->
      <!-- 套餐价格计算器 -->
      <CalcTempDialog ref="CalcTempDialog"></CalcTempDialog>
      <!-- 上菜方式的组件-->
      <ItemTemp
        ref="itemTemp"
        :appendToBody="true"
        type="'PkgPartArrangeMenu"
        testId="arrangeMenu"
      ></ItemTemp>
      <!-- 宴会套餐 -->
      <PackagePart
        ref="PackagePart"
        :appendToBody="true"
        type="ArrangeMenuPackagePart"
        :isArrangeMenu="true"
        submitId="ArrangeMenuPackagePart"
      ></PackagePart>
      <OrderingChangePrice
        ref="orderingChangePrice"
        :appendToBody="true"
        type="arrangeOrdering"
      >
      </OrderingChangePrice>
    </div>
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
import dateFormat from '@/common/js/dateformat';
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
  getByteLength,
} from '@/common/js/math';
import * as KeyboardUtil from '@/plugin/keyboard/util';

// 改量
const PackageChangeNum = (resolve) => {
  import('./PackageChangeNum').then((module) => {
    resolve(module);
  });
};
// 做法
const PackageItemMethod = (resolve) => {
  import('@/components/Pos/Business_commons/OrderingChangeMethods').then(
    (module) => {
      resolve(module);
    },
  );
};
// 套餐的模板
const PackageTemp = (resolve) => {
  import('./PackageTemp').then((module) => {
    resolve(module);
  });
};
// 套餐价格计算器
const CalcTempDialog = (resolve) => {
  import('./CalcTempDialog').then((module) => {
    resolve(module);
  });
};
// 临时品项
const ItemTemp = (resolve) => {
  import('@/components/Pos/Ordering/Menu/ItemTemp').then((module) => {
    resolve(module);
  });
};
// 宴会套餐
const PackagePart = (resolve) => {
  import('@/components/Pos/Ordering/Menu/Package/PackagePart').then((module) => {
    resolve(module);
  });
};
// 改价
const OrderingChangePrice = (resolve) => {
  import('@/components/Pos/Ordering/OrderingBtnsFunc/OrderingChangePrice').then((module) => {
    resolve(module);
  });
};
export default {
  components: {
    Pager,
    Dialog,
    NumPager,
    PackageTemp,
    PackageChangeNum,
    PackageItemMethod,
    CalcTempDialog,
    ItemTemp,
    PackagePart,
    OrderingChangePrice,
  },
  mixins: [DialogMixin, PageMixin],
  props: {
    arrangeMenuOpenType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // 顶部标题
      title: {
        new: this.$t('Biz.ArrangeMenu.NewlyMenu'), // 新建时显示
        // new: '排菜单——新建', // 新建时显示
        change: this.$t('Biz.ArrangeMenu.ModifyMenu'), // 修改时显示
        // change: '排菜单——修改', // 修改时显示
      },
      closeHandWriting: false, // 是否关闭手写板
      // 功能按钮
      partContorlBtnData: [
        {
          btnName: this.$t('Dict.Btn.DeleteItem'), // 删除
          method: 'pkgDelete',
          disabled: false,
          id: 'partpkgDelete',
        },
        {
          btnName: '+',
          method: 'pkgAdd',
          disabled: false,
          id: 'partpkgAdd',
          name: 'changeNum',
        },
        {
          btnName: '-',
          method: 'pkgSubtract',
          disabled: false,
          name: 'changeNum',
          id: 'partpkgSubtract',
        },
        {
          btnName: this.$t('Dict.Btn.ChangeHalfNum'), // 半份
          method: 'pkgItemHalf',
          disabled: false,
          name: 'changeNum',
          id: 'partpkgItemHalf',
        },
        {
          btnName: this.$t('Dict.Btn.ChangeItemNum'), // 数量
          method: 'pkgChangeNumber',
          disabled: false,
          name: 'changeNum',
          id: 'partpkgChangeNumber',
        },
        {
          btnName: this.$t('Dict.Btn.ChangeItemMethods'), // 做法
          method: 'pkgChoseMethod',
          disabled: false,
          id: 'partpkgChoseMethod',
        },
        {
          btnName: this.$t('Dict.Btn.ChangeItemPrice'), // 价格
          method: 'changePrice',
          disabled: false,
          id: 'partpkgchangePrice',
        },
        {
          btnName: this.$t('Dict.TemporaryItems'), // 临时品项
          method: 'itemTemp',
          disabled: false,
          id: 'partpkgItemTemp',
        },
      ],
      // 菜品类的按钮数据
      allSmallClassBtnData: {
        id: 'all',
        name: this.$t('Dict.AllSubclass'), // 全部小类
      },
      // 小类的数据
      itemSmallClassList: [],
      pkgMianData: {
        pkgPrice: '',
        tableNumber: 1, // 桌数  modify by zyy TO:CY7-2484 -排菜增加人均人数计算金额 输入优化
      },
      billItems: [],
      // 菜品数据
      items: [],
      /**
      * 注：自己写分页的目前，为了运用下一页的数据，
      * 不需要对所有的数据坐下处理，目前的思路好像和写的公共分页组件有点隔阂，
      * 就暂时自己写一个，可能维护受累了但都有注释。。
      * 到时这块如果只是自己用就不需要封装了。。。。如果可以可以后期考虑下
       */
      // 被选中的类的数据
      activeClassData: {},
      // 当前页数 这是类table的分页
      classCurrentPage: 1,
      // 类一页显示几个
      classPageCount: 4,
      // 类显示区域的width
      classListBoxWidth: 0,
      classlistWidth: 72,
      // 菜品当前页数的
      itemsCurrentPage: 1,
      // 菜品每页显示的条数
      itemsPageCount: 24,
      // 菜品区域显示的行数
      itemsRowCount: 6,
      // 一行显示几个菜
      itemsRowShowNumber: 4,
      // 每个菜品的width/height
      itemListStyle: { width: 120, heigth: 82 },
      // 整个菜品容器的width/height
      itemListBoxStyle: { width: 513, heigth: 565 },
      // 缓存下过滤后的每个小类对应的菜品数据
      smallClassFilterItems: {},
      // 菜品区域被选中的菜品的index 值
      activeItemIndex: 0,
      activeItemData: null,
      // 菜单品项搜索内容
      itemsSearch: '',
      // 头部套餐名称的
      pkgName: '',
      // 套餐模板
      currentPackageTemp: { name: this.$t('Dict.BanquetPackage'), id: 1 },
      // 套餐价格的elment 表单验证的事件
      rules: {
        pkgPrice: [
          { required: true, message: this.$t('Biz.ArrangeMenu.InputPkgPrice'), trigger: 'change' },
          { validator: this.validateMoney, trigger: 'change' },
        ],
        tableNumber: [
          { validator: this.inputTableNumber, trigger: 'change' },
        ],
      },
      // 已点加单的数据
      selectedClassItems: [],
      // 小类数组的数据转化
      classObjectList: {},
      // 账单中已点菜品中的被选中的菜品数据
      activeBillItem: null,
      // 打开做法是否是排菜过来的
      isArrangeMenuMethod: true,
      // remark
      remark: '',
      isOpen: false, // 判断当前的弹框是否是开着
      leftInputFocus: false, // 左侧input输入框的聚焦情况
      SUBMIT_ITEM_TYPE_NORMAL: 1, // 正常品项
      SUBMIT_ITEM_TYPE_TEMP: 2, // 临时品项
      SUBMIT_ITEM_TYPE_PKG_NORMAL: 3, // 常规套餐品项
      SUBMIT_ITEM_TYPE_PKG_PART: 4, // 宴会套餐品项
      SUBMIT_ITEM_TYPE_PKG_INNER: 5, // 套餐内品项
      discFlgdata: [
        { text: '', className: '' },
        { text: '赠', className: 'give-cls' },
        { text: '折', className: 'discount-cls' },
        { text: this.$t('Dict.Change'), className: 'change-cls' },
      ], // 标识的显示 0 - '',1-赠送 2-打折 -3-变价
    };
  },
  mounted() {},
  computed: {
    // 快捷键 posItemSmallClasses 小类类别的数据， posItemCustomClasses 自定义类别的数据
    ...mapGetters([
      'posBooking',
      'getisSetUpGroupMethod',
      'posSettings',
      'config',
      'posItemSmallClasses',
      'posItemCustomClasses',
      'ArrangeMenu',
      'posInfo',
    ]),
    //
    partContorlBtnDataNow() {
      let btnData = this.partContorlBtnData;
      // 如果是老模式的排菜过滤掉变价 价格功能按钮
      if (this.arrangeMenuSetting.isPkgArrangeMenu) {
        btnData = this.partContorlBtnData.filter(btn => btn.method !== 'changePrice');
      }
      if (this.activeBillItem && (this.activeBillItem.isPackage || this.activeBillItem.pkgList)) {
        return cloneDeep(btnData).map((btn) => {
          // 如果是套餐的话需要禁用掉 半份和数量以及做法
          const noHandleBtnMethod = ['changePrice', 'pkgChoseMethod', 'pkgItemHalf'];
          if (noHandleBtnMethod.indexOf(btn.method) !== -1) {
            this.$set(btn, 'disabled', true);
          }
          return btn;
        });
      }
      return btnData;
    },
    // 是否是自定义类 不用自定义类 用小类
    // isOpenCustomClasses() {
    //   return this.posItemCustomClasses && this.posItemCustomClasses.length;
    // },
    // 排菜一些设置
    arrangeMenuSetting() {
      return {
        isPkgArrangeMenu: this.posInfo.putItemsMode !== '1',
        ArrangeMenuLinkageShowTotal: this.posInfo.putItemsMode === '1' || this.posInfo.putItemsDefPrice !== '0',
      };
    },
    hotKeySet() {
      return {
        ...this.setKeySearchHotKey(),
        BackSpace: () => {
          this.delWordInBlur();
        },
        PgDn: () => {
          if (!this.leftInputFocus) {
            this.onSubmit();
          }
        },
        F1: () => {
          if (!this.leftInputFocus) {
            this.saveAsArrangeMenu();
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
            this.activeItemAction(this.activeItemIndex, true);
          }
        },
      };
    },
    // 右侧菜单小类的总数
    classListTotal() {
      return this.itemSmallClassList.length;
    },
    // 右侧菜单数据的总数
    itmesTotal() {
      return this.filterItems.length;
    },
    // 总页数
    itemsPageTotal() {
      return Math.ceil(this.itmesTotal / this.itemsPageCount);
    },
    quickSearchText() {
      return quickSearch((this.itemsSearch.toString()).toLowerCase());
    },
    // 对数据进行小类的过滤和查询的过滤处理
    filterItems() {
      // 根据类过滤
      let filterItems = [];
      if (this.activeClassData.id === 'all') {
        filterItems = this.items;
      } else {
        filterItems = this.smallClassFilterItems[this.activeClassData.id]
          ? this.smallClassFilterItems[this.activeClassData.id]
          : this.items.filter(item => item.smallClassId === this.activeClassData.id);
        // this.smallClassFilterItems[this.activeClassData.id] = filterItems;(暂时必掉的)
      }
      // 在根据search内容过滤
      if (this.itemsSearch.length > 0) {
        filterItems = filterItems.filter((item) => {
          const keyFilters = this.quickSearchText; // 从这对数据进行处理
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
      // 重新复制，并且分页组件初始化下并且是默认选中第一个显示区域的第一个菜
      this.destructionItemsPage();
      // this.itemsCurrentPage = 1; //暂时先必掉
      // this.activeItemIndex = 0;
      return filterItems;
    },
    // 类显示的数据
    smallClassList() {
      if (this.itemSmallClassList.length) {
        // 截取的起始和终止的index  下标
        const startIdex = 0 + (this.classCurrentPage - 1) * this.classPageCount;
        const endIdex = this.classCurrentPage * this.classPageCount > this.itemSmallClassList.length
          ? this.itemSmallClassList.length + 1
          : this.classCurrentPage * this.classPageCount + 1;
        return this.itemSmallClassList.slice(startIdex, endIdex);
      }
      return [];
    },
    // 菜品的分页起始位置
    getItemsStartIdex() {
      return (this.itemsCurrentPage - 1) * this.itemsPageCount;
    },
    // 菜品的分页终止位置
    getItemsEndIdex() {
      return this.itemsCurrentPage * this.itemsPageCount > this.filterItems.length
        ? this.filterItems.length
        : this.itemsCurrentPage * this.itemsPageCount;
    },
    // 菜品显示的数据只是当前页的数据 对过滤完的数据filterItems做下分页处理
    itemsCurrnetPageShow() {
      // 截取的起始和终止的index  下标
      const showMenus = this.filterItems.slice(
        this.getItemsStartIdex,
        this.getItemsEndIdex,
      );
      // 对显示的数据匹配已点的数
      showMenus.forEach((menu) => {
        this.$set(menu, 'count', 0);
        cloneDeep(this.selectedClassItems).forEach((classItem) => {
          classItem.items.forEach((item) => {
            if (menu.itemId === `${item.itemId}_${item.itemSizeId}`) {
              if (menu.count) {
                this.$set(menu, 'count', add(menu.count, Number(item.qty)));
              } else {
                this.$set(menu, 'count', Number(item.qty));
              }
            }
          });
        });
      });
      return showMenus;
    },
    // 已点菜品的小计总额
    pkgLastTotal() {
      let pkgLastTotalCount = 0;
      this.selectedClassItems.forEach((classData) => {
        classData.items.forEach((item) => {
          pkgLastTotalCount = add(item.lastTotal, pkgLastTotalCount);
        });
      });
      return pkgLastTotalCount;
    },
    // 已点的餐品的份数
    selectedItemNums() {
      return this.selectedClassItems.reduce((total, current) => add(total, current.qty), 0);
    },
    // 已点所有菜品的数量总和
    pkgAddItemsLastQty() {
      let allAddItemsLastQty = 0;
      this.selectedClassItems.forEach((classData) => {
        allAddItemsLastQty = add(classData.qty, allAddItemsLastQty);
      });
      return allAddItemsLastQty;
    },
    // 让利金额
    allowanceAmountFn() {
      // 如果是自动输入价格 让利始终为0
      if (this.arrangeMenuSetting.ArrangeMenuLinkageShowTotal || !this.pkgLastTotal) {
        return { allowanceAmount: 0, proportion: '0%' };
      }
      return this.pkgMianData.pkgPrice === ''
        ? { allowanceAmount: 0, proportion: '0%' }
        : {
          allowanceAmount: sub(this.pkgLastTotal, this.pkgMianData.pkgPrice),
          proportion:
            `${Math.round(
              (sub(this.pkgLastTotal, this.pkgMianData.pkgPrice)
                / this.pkgLastTotal)
                * 10000,
            )
            / 100.0
            }%`,
        };
    },
  },
  methods: {
    // 校验套餐价格，控制输入
    validateMoney(rule, value, callback) {
      const pkgPriceTest = /^[0-9]+(.[0-9]{1,2})?$/g;
      const money = Number(value);
      const i = value.toString().indexOf('.');
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(money)) {
        callback(new Error(this.$t('Dict.Validate.NumberMessage'))); // 请输入正确数量
        if (value !== '.') {
          // eslint-disable-next-line no-restricted-globals
          this.pkgMianData.pkgPrice = value.toString().substr(0, value.toString().length - 1);
        }
      } else if (money > 9999999.99 || money <= 0) {
        callback(new Error(this.$t('Dict.MaximumMessage', [9999999.99]))); // 最大值为9999999.99
      } else if (
        !+money || !pkgPriceTest.test(money)
        || (i !== -1 && value.toString().substr(i + 1).length > 2)
      ) {
        this.$message.warning(this.$t('Biz.ArrangeMenu.TwoDecimalPlaces')); // 小数点后两位
        this.pkgMianData.pkgPrice = value.toString().substr(0, i + 3);
      } else {
        callback();
      }
    },
    // 校验桌数输入
    inputTableNumber(rule, value) {
      const val = Number(value);
      const taleNumTest = /^[1-9]\d*$/g;
      if (val === 0) { // 清空或者输入0时，值置位1
        this.$message.warning(this.$t('Biz.ArrangeMenu.InputCorrectTableNum')); // 请正确输入桌数
        this.pkgMianData.tableNumber = 1;
      // eslint-disable-next-line no-restricted-globals
      } else if (isNaN(val) || !val || !taleNumTest.test(value)) { // 禁止输入数字外的字符
        this.$message.warning(this.$t('Biz.ArrangeMenu.InputCorrectTableNum')); // 请正确输入桌数
        this.pkgMianData.tableNumber = value.toString().substr(0, value.toString().length - 1);
      }
      if (val && val > 999) { // 限制最大输入值
        this.$message.warning(this.$t('Biz.ArrangeMenu.MaxTableNum999')); // 桌数不应大于999
        this.pkgMianData.tableNumber = value.toString().substr(0, value.toString().length - 1);
      }
    },
    // 设置搜索热键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          // 判断左侧输入的input框是否是聚焦
          if (!this.leftInputFocus) {
            this.inputKey(item);
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
    // 右侧input框的录入
    inputKey(val) {
      if (
        document.hasFocus()
        && document.activeElement === this.$refs.arrangeItemsSearch
      ) { return; }
      this.itemsSearch = `${this.itemsSearch}${val}`;
    },
    // 在没有焦点情况下删除最后一个文本
    delWordInBlur() {
      if (
        document.hasFocus()
        && document.activeElement === this.$refs.arrangeItemsSearch
      ) { return; }
      this.itemsSearch = KeyboardUtil.deleteLastChar(this.itemsSearch);
    },
    onOpen() {
      this.isOpen = true;
      // 打开的时候计算下各个分页一页能显示几个 这块实际可以写在分页组件里面的（后期再说）
      setTimeout(() => {
        this.classListBoxWidth = this.getDomWithdAndHeight(
          'smallClassListBox',
        ).width;
        this.classListWidth = this.getDomWithdAndHeight('smallClassList').width;
        this.classPageCount = Math.floor(
          this.classListBoxWidth / this.classlistWidth,
        );
        this.itemListStyle = this.getDomWithdAndHeight('itemsList');
        this.itemListBoxStyle = this.getDomWithdAndHeight('itemsListBox');
        // 8和14是padding值加border的和
        this.itemsRowCount = Math.floor(
          (this.itemListBoxStyle.height - 14) / this.itemListStyle.height,
        );
        this.itemsRowShowNumber = Math.floor(
          (this.itemListBoxStyle.width - 8) / this.itemListStyle.width,
        );
        this.itemsPageCount = this.itemsRowShowNumber * this.itemsRowCount;
        // 左侧账单品项的分页初始化
        setTimeout(() => {
          this.$refs.arrangeMenuBillListPager.refresh();
        }, 100);
      }, 0);
      this.initArrangeAllData();
      this.initSmallClassPager();
      this.initItemsArea();
      // 初始化 新建时默认模板
      if (this.arrangeMenuOpenType === 'new' && this.arrangeMenuSetting.isPkgArrangeMenu) {
        this.initDefaultTmpOfNew();
      }
    },
    // 初始化下数据
    initArrangeAllData() {
      // 小类的数据
      // 如果是设置了支持单品模式 类别走和客位加单的小类数据如果自定义类别存在就走自定义类别的数据
      if (this.arrangeMenuSetting.isPkgArrangeMenu) {
        // +list.pid !== 0
        this.itemSmallClassList = this.resData.itemSmallClassList
          && this.resData.itemSmallClassList.filter(list => list.pid !== 0);
        this.items = this.resData.items;
        // 模板数据
        this.currentPackageTemp = {
          name: this.resData.tempItemName,
          id: this.resData.tempItemId,
        };
      } else {
        this.itemSmallClassList = this.posItemSmallClasses;
        //* "pkgType":0, //0 常规套餐（默认值） ；1 宴会套餐；2 临时套餐
        this.items = cloneDeep(this.ArrangeMenu.filter(menu => !menu.isPackage || menu.pkgType === 1));
      }
      this.itemSmallClassList.forEach((list) => {
        this.classObjectList[list.id] = list;
      });
      // 账单被选中品项数据
      this.activeBillItem = null;
      // 账单已点品项数据
      this.selectedClassItems = this.resData.selcetedItems;
      // 备注数据
      this.remark = this.resData.remark;
      // 桌数
      this.pkgMianData.tableNumber = this.resData.tableNum;
      // 套擦价格
      this.pkgMianData.pkgPrice = this.resData.menuPrice;
      // 套餐名称
      this.pkgName = this.resData.name;
    },
    // dom元素的width和高的获取
    getDomWithdAndHeight(domId) {
      return document.getElementById(domId)
        ? {
          width: document.getElementById(domId).offsetWidth,
          height: document.getElementById(domId).offsetHeight,
        }
        : { width: 0, height: 0 };
    },
    // 初始化下小类的分页以及默认选中事件
    initSmallClassPager() {
      // 默认选中时全部小类
      this.activeClassData = this.allSmallClassBtnData;
      this.classCurrentPage = 1;
    },
    // 初始化下菜品区域事件
    initItemsArea() {
      this.itemsCurrentPage = 1;
    },
    // 新建时获取默认模板数据
    initDefaultTmpOfNew() {
      ajax('canyin.pos.arrangemenubase.checkdefaulttemp').then((res) => {
        if (!isEmpty(res)) {
          this.currentPackageTemp = res;
        }
      });
    },
    onClose() {
      // 这是销毁下 分页组件的index的暂存 值重新给赋值
      this.destructionItemsPage();
      this.destructionSmallClassPage();
      // 关闭手写板
      if (this.closeHandWriting) {
        this.$devices.Handwriting.close();
      }
      // 重置参数
      this.billItems = [];
      this.items = [];
      this.itemSmallClassList = [];
      this.smallClassFilterItems = {};
      this.selectedClassItems = [];
      this.remark = '';
      this.pkgName = '';
      this.activeItemIndex = 0;
      this.activeItemData = null;
      this.itemsSearch = '';
      this.pkgMianData.pkgPrice = '';
      this.closeHandWriting = false;
      this.isOpen = false;
    },
    // 菜品分页组件的销毁
    destructionItemsPage() {
      this.itemsCurrentPage = 1;
      this.activeItemIndex = 0;
      if (this.$refs.itemsPageBtn) {
        this.$refs.itemsPageBtn.init();
      }
    },
    // 小类分页组件的销毁
    destructionSmallClassPage() {
      if (this.$refs.topScroll) {
        this.$refs.topScroll.init();
      }
    },
    // 小类的过滤点击事件
    activeSmallClass(list) {
      if (list !== this.activeClassData) {
        this.activeClassData = list;
        this.smallClassFilterItems[this.activeClassData.id] = this.items.filter(
          item => item.smallClassId === this.activeClassData.id,
        );
      }
    },
    // 账单当前所加品项的样式执行选中判断
    billListActive(item, index) {
      if (this.activeBillItem) {
        return `${this.activeBillItem.realItemId
          || this.activeBillItem.itemId}${this.activeBillItem.itemSizeId}${this.activeBillItem.index}`
          === `${item.realItemId || item.itemId}${item.itemSizeId}${index}`;
      }
      return false;
    },
    // 回车后者是点击菜品事件
    activeItemAction(index, isEnter) {
      this.activeItemData = this.itemsCurrnetPageShow[index];
      this.activeItemIndex = index;
      // 如果是套餐
      if (this.activeItemData.isPackage) {
        this.getPkgModuleData(this.activeItemData, false);
      } else {
        this.addItem(this.activeItemData);
      }
      // 如果是回车加的菜清空输入框，点击不清空
      if (isEnter || this.posSettings.isAutoClearKey) {
        this.itemsSearch = '';
      }
    },
    // 打开套餐的工作方法和完成后的处理
    /**
     * res 套餐弹框需要的数据
     * item 当前操作的品项数据
     *  isModify Boolean值 如果是修改的套餐为true
     */
    openPackagePartMoudle(res, item, isModify) {
      console.log(res);
      this.$refs.PackagePart.open(res, {
        submit: (pkgPartData, pkgData) => {
          // pkgPartData 代表要用到的数据 pkgData代表套餐弹框原有的数据用来套餐修改
          console.log(pkgPartData, pkgData);
          this.$refs.PackagePart.close();// 关闭弹框

          const newItem = {
            ...item,
            qty: pkgPartData.num,
            stdPrice: pkgPartData.price,
            salePrice: pkgPartData.salePrice,
            costPrice: pkgPartData.costPrice,
            discFlg: pkgPartData.discFlg,
            priceType: pkgPartData.priceType,
            pkgList: pkgPartData.pkgList,
            price: pkgPartData.price,
            pkgData,
            itemType: this.SUBMIT_ITEM_TYPE_PKG_PART,
            pkgType: 1,
            itemId: pkgPartData.realItemId,
          };
          // 新添加的菜
          if (!isModify) {
            // 套餐的联动
            this.addItem({ ...newItem, isNotFollowAmount: pkgPartData.isNotFollowAmount });
          } else {
            // 修改套餐
            newItem.index = this.activeBillItem.index;
            newItem.classIndex = this.activeBillItem.classIndex;
            this.selectedClassItems[this.activeBillItem.classIndex].items.splice(
              this.activeBillItem.index, 1, newItem,
            );
            this.activeBillItem = newItem;
          }
        },
      });
    },
    // 套餐s修改和加单数据请求方法方法
    getPkgModuleData(item, isModify) {
      const options = {
        params: {
          pkgId: item.realItemId ? item.realItemId : item.itemId.split('_')[0],
          scId: '',
          isBuffet: false, // 是否是自助模式
          menuTempsFlg: 1, // 0-正常加单的请求， 1-单品模式下的排菜单的请求
        },
        needLog: true,
      };
      ajax('canyin.pos.bill.itempkgpart', options).then((res) => {
      // res.package.isItemTimePrice = itemPkgData.isItemTimePrice
        //   ? itemPkgData.isItemTimePrice
        //   : false;
        const cloneRes = cloneDeep(res);
        // eslint-disable-next-line no-unused-vars
        if (item.pkgList && item.pkgList.length) {
          cloneRes.package.lastQty = Number(item.qty);
          cloneRes.package.price = Number(item.price);
          cloneRes.package.discFlg = item.discFlg || 0;
          cloneRes.package.priLocals = null;// 加单修改过来的时候区域价格的显示不能用只能显示当前的价格
          cloneRes.pkgSelectedItems = [];
          // // 循环已点的套餐的明细进行整理数据
          item.pkgList.forEach((list) => {
            cloneRes.pkgSelectedItems.push(
              {
                ...list,
                stdPrice: list.stdPrice || Number(list.price),
                count: Number(item.qty),
                itemCode: list.code,
                realItemId: list.realItemId || list.itemId,
                defaultQty: 0,
                itemName: list.itemSizeId !== '-1' ? `(${list.sizeName})${list.name}` : list.name,
                itemId: `${list.realItemId || list.itemId}_${list.itemSizeId}`,
              },
            );
          });
          // 如果是修改过来的，填加一个字段
          // eslint-disable-next-line no-const-assign
        }
        this.openPackagePartMoudle(cloneRes, item, isModify);
      });
    },
    // 数据整理
    itemPkgItem(pkgItem) {
      return {
        costPrice: pkgItem.itemType === 2 ? 0 : pkgItem.costPrice,
        defaultQty: 0,
        enableMutiSize: pkgItem.enableMutiSize,
        itemCode: pkgItem.code,
        itemId: pkgItem.itemId || pkgItem.id,
        itemName: pkgItem.name,
        itemSizeId: pkgItem.itemSizeId || pkgItem.sizeId,
        itemUnit: pkgItem.unitName,
        realItemId: pkgItem.realItemId || pkgItem.id,
        unitId: pkgItem.unitId,
        itemType: pkgItem.itemType || 1,
        stdPrice: pkgItem.stdPrice,
      };
    },
    // 加单进行数组组装
    addItem(item) {
      // 宴会套餐
      // 简克隆下
      const { ...cloneItem } = item;
      this.$set(cloneItem, 'itemId', item.realItemId);
      // 添加数量key qty,默认为1
      this.$set(cloneItem, 'qty', item.qty || 1);
      // 匹配账单总数据中, 当前添加品项所在的小类分组数据(key为小类id)
      const [filterClassItem] = this.selectedClassItems.filter(
        list => list.itemClassId === cloneItem.smallClassId,
      );
      // 如果存在添加此菜，找不到添加类id和名称以及菜的数据
      if (filterClassItem) {
        filterClassItem.items.push(cloneItem);
        // 刷新排序 按照品项code
        filterClassItem.items = sortBy(filterClassItem.items, 'code');
        // 小类的小计: 小类分组内所有品项数量的累加
        filterClassItem.qty = add(filterClassItem.qty, cloneItem.qty);
        this.activeBillItem = Object.assign(item, {
          // index: filterClassItem.items.length - 1,  代码不用了
          // 当前加菜所处组内 DOM('li'元素)的位置: 用于active项的active样式选中
          index: filterClassItem.items.indexOf(cloneItem),
          // 坐在小类的匹配下标
          classIndex: this.selectedClassItems.indexOf(filterClassItem),
        });
      } else {
        const itemClassId = cloneItem.smallClassId;
        const newClassItems = {
          itemClassId,
          itemClassName: this.classObjectList[itemClassId].name,
          items: [cloneItem],
          qty: cloneItem.qty,
          code: this.classObjectList[itemClassId].code,
        };
        this.selectedClassItems.push(newClassItems);
        // 刷新排序 按照小类code
        this.selectedClassItems = sortBy(this.selectedClassItems, 'code');
        this.activeBillItem = Object.assign(item, {
          // 当前加菜所处组内 DOM('li'元素)的位置: 用于active项的active样式选中, 初始为 0
          index: 0,
          // 坐在小类的匹配下标
          classIndex: this.selectedClassItems.length - 1,
        });
      }
      // 强制刷新下分页
      setTimeout(() => {
        this.$refs.arrangeMenuBillListPager.pushRefresh();
      }, 40);
      // 执行滑动
      setTimeout(() => {
        this.scrollToCurrSmallClassArea();
      }, 80);
      // 如果是称重品项自动弹 快速修改数量 暂时先去掉
      // if (item.isConfirmWeigh) {
      //   this.pkgChangeNumber(
      //     this.selectedClassItems[this.activeBillItem.classIndex],
      //     this.selectedClassItems[this.activeBillItem.classIndex].items[this.activeBillItem.index],
      //   );
      // }
      //  this.selectedClassItems[this.activeBillItem.classIndex],
      //   this.selectedClassItems[this.activeBillItem.classIndex].items[this.activeBillItem.index],
    },
    // 滚动到当前所加小类位置
    scrollToCurrSmallClassArea() {
      // 当前所加品项 在列表中是选中的, 保存该数据DOM节点
      const tmpDOM = this.$refs[
        `billSmallItemREF${
          this.activeBillItem.realItemId
        }${
          this.activeBillItem.itemSizeId
        }${
          this.activeBillItem.index}`
      ][0];
      // 执行滑动, 保持总在账单可视区域(底部)
      tmpDOM.scrollIntoView({ block: 'end' });
    },
    // 滚动到底部
    scrollEnd() {
      const addBillBox = this.$refs.arrangeMenuBillList;
      if (addBillBox.scrollHeight > addBillBox.clientHeight) {
        addBillBox.scrollTop = sub(
          addBillBox.scrollHeight,
          addBillBox.clientHeight,
        );
      }
    },
    // 账单已选品项的点击事件
    billClickFn(item, index, classIndex) {
      // 给选中的菜增加 index, 和 classIdex，为删除改量和做法好查找
      this.$set(item, 'index', index);
      this.$set(item, 'classIndex', classIndex);
      if (
        this.activeBillItem
        && `${item.index}_${item.classIndex}`
        === `${this.activeBillItem.index}_${this.activeBillItem.classIndex}`
      ) {
        // 证明这个已别选中 如果是套餐进行套餐修改
        if (item.pkgList) {
          // 如果存在套餐数据不需要请求接口
          if (item.pkgData) {
            const isModify = true;
            this.openPackagePartMoudle(item.pkgData, this.activeBillItem, isModify);
          } else {
            this.getPkgModuleData(item, true);
          }
        }
        return false;
      }
      this.activeBillItem = item;
      return false;
    },
    // 重置下接口过来的套餐的主要数据
    // res.package.isItemTimePrice = itemPkgData.isItemTimePrice
    //   ? itemPkgData.isItemTimePrice
    //   : false;
    // res.package.lastQty = itemPkgData.num;
    // res.package.price = itemPkgData.price;
    // res.package.discFlg = itemPkgData.discFlg;
    // res.package.priLocals = null;// 加单修改过来的时候区域价格的显示不能用只能显示当前的价格
    // res.pkgSelectedItems = [];
    // // 循环已点的套餐的明细进行整理数据
    // itemPkgData.pkgList.forEach((item) => {
    //   // 循环请求套餐过来的可点菜品 找到对应进行整理
    //   let newPkgeItem = null;
    //   const pkgItem = find(res.pkgUnSelectedItems, { realItemId: item.id, itemSizeId: item.sizeId });
    //   if (pkgItem) {
    //     newPkgeItem = this.itemPkgItem(pkgItem);
    //   } else {
    //     newPkgeItem = this.itemPkgItem(item);
    //   }
    //   res.pkgSelectedItems.push(
    //     {
    //       ...newPkgeItem,
    //       stdPrice: item.stdPrice,
    //       count: item.num,
    //       methodList: item.methodList,
    //       serveWay: item.serveWay || null,
    //       serveWayId: item.serveWayId,
    //       serveWayName: item.serveWayName,
    //     },
    //   );
    // });
    //
    // modifyPackage(item) {
    //   // 如果存在套餐数据不需要请求接口
    //   if (item.pkgData) {
    //     this.openPackagePartMoudle(item.pkgData);
    //   }
    // },
    // 临时品项
    openItemTemp() {
      ajax('canyin.pos.bill.billitemtempview', {
        params: {
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((data) => {
        const pkgTempItemData = {
          ...data,
          ...{ pointData: { isPkg: true, pkgName: this.pkgName } },
        };
        this.$refs.itemTemp.open(pkgTempItemData, {
          submit: (itemData) => {
            this.addItem(this.getItemTempData(itemData));
            // 临时品项加入点菜单
            // this.$vemit('posOrderAddDish', { item: itemData });
          },
        });
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 临时品项的数据整理
    getItemTempData(itemData) {
      const itempData = {
        ...itemData,
        itemId: `${itemData.id}-1`,
        itemSizeId: '-1',
        realItemId: itemData.id,
        enableMutiSize: false,
        costPrice: 0, // 临时品项的成本价格为0
      };
      // 老版本的添加临时品项的分摊
      if (this.arrangeMenuSetting.isPkgArrangeMenu) {
        itempData.apportionFlg = true;
      }
      return itempData;
    },
    // 功能按钮事件
    actionBtnClick(methodName) {
      // 如果是临时品项功能就走临时品项的
      if (methodName === 'itemTemp') {
        this.openItemTemp();
        return false;
      }
      if (!this.activeBillItem) {
        this.$message.error({
          message: this.$t('Dict.SelectTheAddedItem'), // 请选择您要操作的已加单品项
          customClass: 'arrangeMenu-message-top',
        });
        // 方法的两个参数一个是类的数据一个是类下面items对应的品项数据
      } else if (this.activeBillItem && this[methodName]) {
        this[methodName](
          this.selectedClassItems[this.activeBillItem.classIndex],
          this.selectedClassItems[this.activeBillItem.classIndex].items[this.activeBillItem.index],
        );
      }
      return false;
    },
    // 价格
    changePrice(activeBillClassData, findActiveItem) {
      console.log(findActiveItem);
      const handleItem = [{
        name: findActiveItem.itemName || findActiveItem.name,
        unitName: findActiveItem.unitName,
        num: findActiveItem.qty,
        price: findActiveItem.price,
        stdPrice: findActiveItem.price,
      }];
      this.$refs.orderingChangePrice.open(handleItem, {
        submit: (price) => {
          this.$set(findActiveItem, 'discFlg', 3);
          this.$set(findActiveItem, 'price', price);
          this.$set(findActiveItem, 'salePrice', price);
          this.$set(findActiveItem, 'priceType', 4);
        },
      });
    },
    // 删除
    pkgDelete(activeBillClassData, findActiveItem) {
      // 找到对应的类的数据

      // 如果找到的类对应的items品项就一个那删除整个类的数据
      if (activeBillClassData.items.length === 1) {
        this.selectedClassItems.splice(this.activeBillItem.classIndex, 1);
      } else {
        // 对应删除菜品并且总数相应更新
        this.$set(
          activeBillClassData,
          'qty',
          sub(activeBillClassData.qty, findActiveItem.qty),
        );
        activeBillClassData.items.splice(this.activeBillItem.index, 1);
      }
      // 初始化下选中的已点菜品
      this.activeBillItem = null;
    },
    // 加加
    pkgAdd(activeBillClassData, findActiveItem) {
      // 对应删除菜品并且总数相应更新
      this.$set(findActiveItem, 'qty', add(findActiveItem.qty, 1));
      this.$set(activeBillClassData, 'qty', add(activeBillClassData.qty, 1));
    },
    // 减减
    pkgSubtract(activeBillClassData, findActiveItem) {
      // 减得时候要判断当前数小于等于1的时候需要做删除操作
      if (findActiveItem.qty <= 1) {
        if (activeBillClassData.items.length === 1) {
          this.selectedClassItems.splice(this.activeBillItem.classIndex, 1);
        } else {
          activeBillClassData.items.splice(this.activeBillItem.index, 1);
          this.$set(
            activeBillClassData,
            'qty',
            sub(activeBillClassData.qty, findActiveItem.qty),
          );
        }
        // 初始化下选中的已点菜品
        this.activeBillItem = null;
      } else {
        this.$set(findActiveItem, 'qty', sub(findActiveItem.qty, 1));
        this.$set(activeBillClassData, 'qty', sub(activeBillClassData.qty, 1));
      }
    },
    // 半分强制变为出入的数值 如果没有默认0.5
    pkgItemHalf(activeBillClassData, findActiveItem) {
      this.changeItemQty(activeBillClassData, findActiveItem);
    },
    // 直接改量方法
    changeItemQty(activeBillClassData, findActiveItem, newQty) {
      // eslint-disable-next-line no-param-reassign
      newQty = newQty || 0.5;
      const changeQty = sub(newQty, findActiveItem.qty);
      if (+changeQty !== 0) {
        if (changeQty > 0) {
          this.$set(
            activeBillClassData,
            'qty',
            add(activeBillClassData.qty, changeQty),
          );
        } else {
          this.$set(
            activeBillClassData,
            'qty',
            sub(activeBillClassData.qty, Math.abs(changeQty)),
          );
        }
        this.$set(findActiveItem, 'qty', newQty);
      }
    },
    // 改量
    pkgChangeNumber(activeBillClassData, findActiveItem) {
      // 改量 组合弹框所需要的数据
      const itemChangeData = {
        num: Number(findActiveItem.qty), // 当前选择的品项数量值
        itemName: findActiveItem.name, // 品项名称
        itemUnitName: findActiveItem.unitName, // 单位名称
        auxiliaryUnitId: findActiveItem.auxiliaryUnitId, // 辅助单位id
        auxiliaryUnitQty: Number(findActiveItem.auxiliaryUnitQty) || 1, // 辅助单位数量
      };
      // //改量弹框
      this.$refs.PackageChangeNum.open(itemChangeData, {
        submit: (changeNumData) => {
          // 如果存在辅助单位更新
          if (findActiveItem.auxiliaryUnitId) {
            this.$set(findActiveItem, 'auxiliaryUnitQty', changeNumData.auxiliaryUnitQty);
          }
          this.$refs.PackageChangeNum.close();
          this.changeItemQty(
            activeBillClassData,
            findActiveItem,
            changeNumData.num,
          );
        },
      });
    },
    // 做法
    pkgChoseMethod(activeBillClassData, findActiveItem) {
      const methodUrl = this.getisSetUpGroupMethod
        ? 'canyin.pos.bill.itemmethodgroupinfo'
        : 'canyin.pos.bill.moremethodandserveway';
      ajax(methodUrl, {
        params: {
          itemId: findActiveItem.itemId,
          itemSizeId: findActiveItem.itemSizeId,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (+res.data.code === 1) {
          this.$refs.PackageItemMethod.open(
            { itemData: findActiveItem, methodsData: res.data.data },
            {
              submit: (methodData) => {
                // 对当前选中的类所有已添加的品项进行添加做法
                // 找到对应的品项数据并添加做法
                this.$set(findActiveItem, 'methodList', methodData.methodList);
                this.$set(
                  findActiveItem,
                  'lastMethodFeeTotal',
                  methodData.lastMethodFeeTotal,
                );
                this.$refs.PackageItemMethod.close();
              },
            },
          );
        }
      });
    },
    // 加菜 上下左右键盘事件
    upArrow() {
      if (this.activeItemIndex - this.itemsRowShowNumber >= 0) {
        this.activeItemIndex = this.activeItemIndex - this.itemsRowShowNumber;
      } else if (this.itemsCurrentPage - 1) {
        this.$refs.itemsPageBtn.pagechange(this.itemsCurrentPage - 1);
        this.activeItemIndex = this.itemsPageCount - (
          this.itemsRowShowNumber - this.activeItemIndex
        );
      }
    },
    downArrow() {
      // 在一个页的时候
      if (
        this.activeItemIndex + this.itemsRowShowNumber
        <= this.itemsCurrnetPageShow.length - 1
      ) {
        this.activeItemIndex = this.activeItemIndex + this.itemsRowShowNumber;
        // 翻页的时候 itemsCurrnetPageShow
      } else if (this.itemsCurrentPage + 1 <= this.itemsPageTotal) {
        this.$refs.itemsPageBtn.pagechange(this.itemsCurrentPage + 1);
        this.activeItemIndex = this.itemsRowShowNumber
        - (this.itemsPageCount - this.activeItemIndex);
        // 如果进入下一个页的时候index大于这页显示的数据就为初始值0
        if (this.activeItemIndex > this.itemsCurrnetPageShow.length - 1) {
          this.activeItemIndex = 0;
        }
      }
    },
    leftArrow() {
      if (this.activeItemIndex >= 1) {
        this.activeItemIndex -= 1;
      } else if (this.itemsCurrentPage - 1) {
        this.$refs.itemsPageBtn.pagechange(this.itemsCurrentPage - 1);
        this.activeItemIndex = this.itemsPageCount - 1;
      }
    },
    rightArrow() {
      // 如果下标小于显示菜品的条数减一时候
      if (this.activeItemIndex < this.itemsCurrnetPageShow.length - 1) {
        this.activeItemIndex += 1;
      } else if (this.itemsCurrentPage + 1 <= this.itemsPageTotal) {
        this.$refs.itemsPageBtn.pagechange(this.itemsCurrentPage + 1);
        this.activeItemIndex = 0;
      }
    },
    // 这块可以把分页算完的起始位置返回来，以后（弄它....呵呵）
    pagechange(current) {
      this.classCurrentPage = current;
    },
    itemsPageChange(current) {
      this.itemsCurrentPage = current;
    },
    // 加单账单显示明细的小计计算
    computeLastSubtotal(item) {
      // 这个是如果品项添加了做法，lastMethodFeeTotal代表的所有做法一份的总额
      // this.$set(item, 'lastTotal', 0)
      const subTotal = round(multi(
        item.qty,
        add(item.price, item.lastMethodFeeTotal ? item.lastMethodFeeTotal : 0),
      ));
      this.$set(item, 'lastTotal', subTotal);
      return subTotal;
    },
    // 调用手写板
    handWriting() {
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else {
        this.$devices.Handwriting.open();
      }
    },
    // 桌数 运算 减
    tableNumberMinus() {
      this.pkgMianData.tableNumber = +this.pkgMianData.tableNumber;
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(this.pkgMianData.tableNumber) || +this.pkgMianData.tableNumber === 0) {
        this.pkgMianData.tableNumber = 1;
      }
      if (
        this.pkgMianData.tableNumber
        // eslint-disable-next-line no-restricted-globals
        && !isNaN(this.pkgMianData.tableNumber)
        && this.pkgMianData.tableNumber > 1
      ) {
        this.pkgMianData.tableNumber -= 1;
      }
      this.pkgMianData.tableNumber = this.pkgMianData.tableNumber;
    },
    // 桌数 运算 加
    tableNumberPlus() {
      this.pkgMianData.tableNumber = +this.pkgMianData.tableNumber;
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(this.pkgMianData.tableNumber) || +this.pkgMianData.tableNumber === 0) {
        this.pkgMianData.tableNumber = 1;
      }
      if (
        this.pkgMianData.tableNumber
        // eslint-disable-next-line no-restricted-globals
        && !isNaN(this.pkgMianData.tableNumber)
        && this.pkgMianData.tableNumber < 999
      ) {
        this.pkgMianData.tableNumber += 1;
      }
      this.pkgMianData.tableNumber = this.pkgMianData.tableNumber;
    },
    // 保存
    onSubmit() {
      // 如果是套餐模式
      if (this.arrangeMenuSetting.isPkgArrangeMenu) {
        // 判断如果开启了自动计算套餐价格走计算的否则走输入的
        if (this.arrangeMenuSetting.ArrangeMenuLinkageShowTotal) {
          this.$set(this.pkgMianData, 'pkgPrice', this.pkgLastTotal);
        }
        const pkgPriceTest = /^[0-9]+(.[0-9]{1,2})?$/g;
        // 价格的非法数值校验
        if (
          !+this.pkgMianData.pkgPrice
          || !pkgPriceTest.test(this.pkgMianData.pkgPrice)
          || +this.pkgMianData.pkgPrice > 9999999.99
        ) {
          this.$message.error({
            message: this.$t('Biz.ArrangeMenu.PkgPriceLessThan7DigitNum'), // 套餐价格必须为小于7位的整数或含小数点两位的数字
            customClass: 'arrangeMenu-message-top',
          });
          this.$refs.changePrice.select();
          return;
        }
      }
      const pkgNameTest = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/g;
      const remarkTest = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/g;
      const taleNumTest = /^[1-9]\d*$/g;

      if (!this.pkgName || !pkgNameTest.test(this.pkgName)) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.WrongPkgName'), // '套餐名称不可用'
          customClass: 'arrangeMenu-message-top',
        });
        return;
      }
      // 长度的校验
      if (getByteLength(this.pkgName) > 50) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.PkgNameMax50Words'), // 套餐名称不能大于50个字符
          customClass: 'arrangeMenu-message-top',
        });
        return;
      }
      // 桌数的非法数值校验
      if (!this.pkgMianData.tableNumber || !taleNumTest.test(this.pkgMianData.tableNumber)) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.InputWrongTableNum'), // 桌数输入格式错误
          customClass: 'arrangeMenu-message-top',
        });
        this.$refs.tableNum.select();
        return;
      }
      if (this.pkgMianData.tableNumber && this.pkgMianData.tableNumber > 999) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.MaxTableNum999'), // 桌数不应大于999
          customClass: 'arrangeMenu-message-top',
        });
        this.$refs.tableNum.select();
        return;
      }
      // 备注的非法内容校验
      if (this.remark !== '' && !remarkTest.test(this.remark)) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.WrongRemark'), // 备注内容不可用
          customClass: 'arrangeMenu-message-top',
        });
        this.$refs.remarkInput.select();
        return;
      }
      // 备注的校验
      if (getByteLength(this.remark) > 200) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.RemarkMax200Words'), // 备注内容不能大于200个字符
          customClass: 'arrangeMenu-message-top',
        });
        this.$refs.remarkInput.select();
        return;
      }
      // 添加品项为空时校验
      if (!this.selectedClassItems.length) {
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.AddItemIsEmpty'), // 加单品项数据不可为空
          customClass: 'arrangeMenu-message-top',
        });
        return;
      }
      // 已关联预订的排菜单 进入修改阻拦提交
      if (!isEmpty(this.resData.orderId)) {
        // 线上预订业务(含有预订单信息且为线上预订时)判断阻拦
        if (this.isOnLineBooked()) {
          return;
        }
        this.$message.error({
          message: this.$t('Biz.ArrangeMenu.CannotModifiedOrSaved'), // 已关联预订的排菜单, 不可修改保存
          customClass: 'arrangeMenu-message-top',
        });
        return;
      }
      // 数据整理
      // this.doSubmitHandle();
      // 提交, 执行回调, 刷新排菜单列表页数据
      this.newOrChangeSubmit();
    },

    //
    // 数据整理和调接口
    doSubmitHandle(newPkgName) {
      // newPkgName-另存时, 使用的拼接时间字符串的套餐名称
      // 重组下已点的品项数据
      const items = [];
      this.selectedClassItems.forEach((classList) => {
        classList.items.forEach((item) => {
          const newItem = {
            salePrice: item.price,
            qty: item.qty,
            itemId: item.itemId,
            itemSizeId: item.itemSizeId,
            smallClassId: item.smallClassId,
            customGroupId: item.customGroupId,
            unitId: item.unitId,
            methodList: this.handleMethod(item.methodList),
            enableMutiSize: items.enableMutiSize,
            name: item.name,
            code: item.code,
            itemType: item.itemType || 1,
            costPrice: item.costPrice,
            discFlg: item.discFlg || 0, // 变价标识
            // priceType: item.priceType || 1,
          };
          // 如果是临时品项需要增加stdPrice
          if (item.itemType === 2) {
            newItem.stdPrice = item.stdPrice;
            newItem.itemName = item.name;
          }
          // 辅助单位
          if (item.auxiliaryUnitId) {
            newItem.auxiliaryUnitId = item.auxiliaryUnitId;
            newItem.auxiliaryUnitQty = item.auxiliaryUnitQty;
            newItem.auxiliaryUnitName = item.auxiliaryUnitName;
          }
          // 如果是套餐，添加明细数据
          if (item.pkgList && item.pkgList.length) {
            newItem.isNotFollowAmount = item.isNotFollowAmount;
            newItem.pkgList = item.pkgList.map(list => this.singlePkgList(list));
          }
          items.push(newItem);
        });
      });
      const submitParams = {
        menuTempId: this.resData.menuTempId,
        tempItemId: this.arrangeMenuSetting.isPkgArrangeMenu ? this.currentPackageTemp.id : '', // 单品模式不存在套餐模板id
        name: newPkgName || this.pkgName, // 排菜单的id
        tableNum: +this.pkgMianData.tableNumber, // 桌数
        remark: this.remark, // 备注
        menuPrice: this.arrangeMenuSetting.isPkgArrangeMenu
          ? +this.pkgMianData.pkgPrice
          : this.pkgLastTotal, // 排菜单的价格
        type: +this.resData.type, // 类型 （线上线下）
        items, // 数据
        menuMode: this.arrangeMenuSetting.isPkgArrangeMenu ? 0 : 1, // 模式
      };
      return submitParams;
    },
    // 单品模式下的套餐明显数据转化
    singlePkgList(list) {
      return {
        salePrice: (list.stdPrice || list.stdPrice === 0) ? list.stdPrice : Number(list.price),
        qty: list.num || Number(list.qty),
        itemId: list.itemId || list.id,
        itemSizeId: list.sizeId || list.itemSizeId,
        smallClassId: list.smallClassId,
        unitId: list.unitId,
        name: list.name,
        itemName: list.name,
        code: list.code,
        costPrice: list.costPrice,
        stdPrice: (list.stdPrice || list.stdPrice === 0) ? list.stdPrice : Number(list.price),
        itemType: list.itemType || 5,
        discFlg: list.discFlg || 0,
        methodList: this.handleMethod(list.methodList),
        auxiliaryUnitId: list.auxiliaryUnitId,
        auxiliaryUnitQty: list.auxiliaryUnitQty,
        auxiliaryUnitName: list.auxiliaryUnitName,
      };
    },
    // 做法转化
    handleMethod(methodList = []) {
      if (methodList && methodList.length) {
        methodList.map(method => ({
          fee: method.fee,
          feeChanged: false,
          id: method.methodId,
          isNeedFee: false,
          isRelaCount: false,
          name: method.name,
          price: null,
          qty: method.qty,
        }));
        return methodList;
      }
      return [];
    },
    // 新建/修改 保存
    newOrChangeSubmit() {
      // 请求接口, 根据打开类型(新建-new, 修改-change)匹配 命令对象参数
      const tmp = {
        new: 'domenutempnew',
        change: 'domenutempmodify',
      };
      ajax(`canyin.pos.arrangemenubase.${tmp[this.arrangeMenuOpenType]}`, {
        // 加单请求,
        contentType: 'paramsEncoded',
        data: this.doSubmitHandle(),
      }).then(() => {
        this.$message.success({
          message: '保存成功',
          customClass: 'arrangeMenu-message-top',
        });
        this.$vemit('reloadData');
        this.close();
      });
    },
    // 另存: 排菜单-修改时执行的另存(复制排菜单)
    saveAsArrangeMenu() {
      // 判断如果开启了自动计算套餐价格走计算的否则走输入的
      if (this.arrangeMenuSetting.ArrangeMenuLinkageShowTotal) {
        this.$set(this.pkgMianData, 'pkgPrice', this.pkgLastTotal);
      }
      // 线上预订业务(含有预订信息时)判断阻拦
      if (!isEmpty(this.resData.orderId) && this.isOnLineBooked()) {
        return false;
      }
      let savaAsName = '';
      if (this.pkgName.indexOf('_') === -1) {
        savaAsName = `${this.pkgName}_${dateFormat('%Y%M%D%H%I%S')}`;
      } else {
        savaAsName = `${this.pkgName.split('_')[0]}_${dateFormat('%Y%M%D%H%I%S')}`;
      }
      ajax('canyin.pos.arrangemenubase.domenutempnew', {
        // 加单请求,
        contentType: 'paramsEncoded',
        // 原有套餐名称 + 时间字符串处理后的新名称, 组装进入提交数据对象
        data: this.doSubmitHandle(savaAsName),
      }).then(() => {
        this.$message.success({
          message: this.$t('Dict.SaveAsSuccess'), // 另存为成功
          customClass: 'arrangeMenu-message-top',
        });
        this.$vemit('reloadData');
        this.close();
      });
      return true;
    },
    // 线上预订业务 判断并阻拦
    isOnLineBooked() {
      const onLineBookedStr = {
        4: this.$t('Dict.ShiShangDing'),
        // 5: '新荣记', // 新荣记没有预订排菜业务
        6: this.$t('Dict.KeBiDe'),
      };
      // 第三方预订业务的排菜单, 业务阻拦
      if (this.posBooking.bookedPlatform
        && (this.posBooking.bookedPlatform > 3)) {
        this.$message.error({
          message: `开通${onLineBookedStr[this.posBooking.bookedPlatform]}业务, 不允许编辑关联预订的排菜单`,
          customClass: 'arrangeMenu-message-top',
        });
        return true;
      }
      return false;
    },
    // 打开套餐模板
    openPackageTemp() {
      ajax('canyin.pos.arrangemenubase.findtempitems').then((res) => {
        if (!isEmpty(res)) {
          this.$refs.packageTemp.open({
            tempData: res,
            activeTemp: this.currentPackageTemp,
          });
        } else {
          this.$message.error({
            message: this.$t('Biz.ArrangeMenu.PkgModelEmpty'), // 套餐模板数据为空
            customClass: 'arrangeMenu-message-top',
          });
        }
      });
    },
    // 选择套餐模板后执行回调
    chosenPackageTempCallback(data) {
      this.currentPackageTemp = data;
    },
    // 打开套餐价格计算器模板
    openCalcTemp() {
      this.$refs.CalcTempDialog.open({ price: this.pkgMianData.pkgPrice }, {
        submit: (val) => {
          this.pkgMianData.pkgPrice = val;
        },
      });
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
em,
i {
  font-style: normal;
}
/* 左侧账单部分 */
.arrangeMenu-bill-box {
  width: @left-div;
  height: 100%;
  position: relative;
  font-size: 14px;
  background-color: #ffffff;
  box-shadow: 6px 0px #d8d8d8;
  float: left;
}
.arrangeMenu-bill-content {
  position: absolute;
  width: @left-div;
  top: 0px;
  bottom: 56px;
  padding-top: 222px;
  &.newMode-arrangeMenu-bill-content {
    padding-top: 166px;
    bottom: 90px;
  }
  > .arrangeMenu-bill-dish {
    height: 100%;
    overflow: auto;
    div {
      .item-class-name {
        background-color: #e4e4e4;
        padding: 4px 14px;
      }
      ul {
        font-size: 12px;
        li {
          padding: 5px 14px;
          border-bottom: @border-style;
          cursor: pointer;
          &.active {
            background-color: #ddf1f6;
          }
          .packageItem {
            box-shadow: 0px 0px 1px 1px #678;
            border-radius: 2px;
            cursor: pointer;
          }
          .pkgList {
            li {
              border: none;
              padding: 2px 14px;
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
                  width: 128px;
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
          div {
            line-height: 24px;
          }
          .item-name {
            font-size: 14px;
            em {
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
              &.change-cls {
                background-color: #ce4ff4;
              }
            }
          }
          .item-content {
            > span {
              display: inline-block;
              width: 32%;
              &:nth-of-type(2) {
                text-align: center;
              }
              &:nth-of-type(3) {
                text-align: right;
              }
            }
          }
          .item-remarks {
            color: @class-active-color;
            > span {
              > strong {
                font-weight: 100;
                margin: 0px 2px;
              }
            }
          }
        }
      }
    }
  }
}
.bill-length-box {
  position: absolute;
  bottom: 56px;
  height: 34px;
  line-height: 34px;
  width: 100%;
  text-align: right;
  padding-right: 20px;
  font-weight: bolder;
}
.arrangeMenu-bill-pagerBox {
  border-top: @border-style;
}
.arrangeMenu-bill-header {
  // height: 200px;
  position: absolute;
  top: 0px;
  width: @left-div;
}

.arrangeMenu-bill-main {
  padding: 5px 8px 10px;
  width: 100%;
  border-bottom: 1px solid #c2c2c2;
  p {
    // padding: 5px 9px;
    padding: 5px 0 5px 8px;
    &.pkgNameShowBox {
      // >label {
      //   padding-right: 12px;
      // }
      padding-left: 0px;
      > input {
        border: 1px solid #ccc;
        width: 216px;
        padding: 7px;
        border-radius: 5px;
      }

      .handWritingBtn {
        height: 35px;
        vertical-align: bottom;
        float: right;
      }
    }
  }
  div {
    &.pkgTwoRow {
      height: 38px;
      margin: 18px 0;
      > div {
        float: left;
        &.pkgPriceShowBox {
          margin-right: 0;
          .el-form-item {
            margin-bottom: 0px;
            > .el-form-item__label {
              padding: 0px !important;
              color: #000000 !important;
            }
            > .el-form-item__content {
              float: left;
              > .el-input--prefix {
                &.disabledClass {
                  pointer-events: none;
                  cursor: default;
                }
                width: 95px;
              }
            }
          }

          .changeBtn {
            display: inline-block;
            margin-left: 2px;
            padding: 0 5px;
            border-radius: 4px;
            vertical-align: bottom;
            border: 1px solid #ccc;
            .setFont(20px, #0babb9);
            cursor: pointer;
          }

          > input {
            font-size: 12px;
            width: 112px;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
        }
        &.tableNumber {
          width: 180px;
          float: right;
          span {
            padding: 5.5px 11px;
            border-radius: 5px;
            border: 1px solid #ccc;
            cursor: pointer;
          }
          .subtractBtn {
            margin-right: 2px;
            margin-left: -8px;
          }
          .addBtn {
            margin-left: 2px;
          }
        }
        &.newModelTableNumber {
          float: left;
          margin-left: 42px;
        }
      }
    }
    &.pkgThreeRow {
      overflow: auto;
      padding: 0px 0 0 9px;

      .pkgModuleName {
        float: left;
        // margin-top: 3px;
        // width: 188px;
        .selectMenuTemp {
          width: 95px;
          display: inline-block;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          vertical-align: middle;
        }

        .changeBtn {
          display: inline-block;
          margin-left: 2px;
          padding: 0 5px;
          border-radius: 4px;
          vertical-align: bottom;
          border: 1px solid #ccc;
          .setFont(20px, #0babb9);
          cursor: pointer;
        }
      }
      > .pkgRemarks {
        float: right;
        > input {
          width: 132px;
          padding: 4px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        &.newModelPkgRemarks {
          float: left;
          margin-left: 33px;
          > input {
            width: 212px;
          }
        }
      }
    }
  }
}
.arrangeMenu-bill-money {
  margin-top: 4px;
  padding: 4px 14px;
  box-shadow: 0px 6px 8px -6px #000;

  div {
    display: inline-block;
    width: 48%;
    font-size: 14px;
  }
}
.arrangeMenu-bill-pagerBox {
  height: 56px;
  position: absolute;
  width: @left-div;
  bottom: 0px;
  text-align: right;
  padding: 10px;
}
/* 中间功能按钮部分 */
.actionBtn {
  height: 100%;
  &::before {
    content: " ";
    position: absolute;
    border-left: 4px solid;
    height: 100%;
    border-color: rgba(197, 197, 197, 0.3);
    z-index: 1;
  }
  float: left;
  width: 56px;
  font-size: 14px;
  background-color: #e4e4e4;
  > ul {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    > li {
      margin-bottom: 2px;
      padding-left: 3px;
      background-color: #fff;
      border-radius: 0px 5px 5px 0px;
      height: 44px;
      width: 50px;
      overflow: hidden;
      cursor: pointer;
      > span {
        display: table-cell;
        width: 41px;
        height: 44px;
        border-radius: 0 5px 5px 0;
        text-align: center;
        color: #666666;
        word-break: break-word;
        vertical-align: middle;
        line-height: 20px;
      }
      &.disabledClass {
        pointer-events: none;
        cursor: default;
        opacity: 0.6;
      }
    }
  }
}
/*右侧菜单的展示*/
.arrangeMenu-items-box {
  position: absolute;
  left: 490px;
  right: 13px;
  top: 13px;
  bottom: 13px;
  font-size: 12px;
  border: @border-style;
  background-color: #ffffff;
}
.items-class {
  font-size: 14px;
  height: 57px;
  cursor: pointer;
  position: relative;
  border-bottom: @border-style;
  > div {
    float: left;
    height: 100%;
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
          padding: 6px 8px;
          overflow: hidden;
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
//右侧菜品
.arrange-items-content {
  position: absolute;
  padding: 6px 3px;
  top: 57px;
  bottom: 56px;
  border-bottom: @border-style;
  width: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
  > ul {
    overflow: auto;
    > .item-list {
      width: 120px;
      height: 82px;
      border: @border-style;
      float: left;
      margin: 4px;
      padding: 5px;
      position: relative;
      cursor: pointer;
      background-color: #ffffff;
      border: @border-style;
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
        bottom: 5px;
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
}
//右侧菜品底部功能区域
.arrangeMenu-items-foot-action {
  height: 56px;
  position: absolute;
  bottom: 0px;
  width: 100%;
  > .items-search {
    width: 245px;
    padding: 0px 15px;
    border: 1px solid #ccc;
    border-radius: 20px;
    float: left;
    margin: 8px;
    > label {
      height: 34px;
      display: inline-block;
      max-width: 100%;
      font-weight: bold;
      > input {
        border: none;
        height: 100%;
      }
    }
  }
  > .items-page-content-show {
    position: absolute;
    right: 142px;
    padding: 20px 0px;
  }
  > .items-page-box {
    float: right;
    margin: 12px 5px;
  }
}

  .lang-enUS{
    .arrangeMenu-bill-main{
      font-size: 12px;
    }
    .arrangeMenu-bill-main {
      padding: 5px 8px 10px;
      width: 100%;
      border-bottom: 1px solid #c2c2c2;
      font-size: 12px;
      p {
        // padding: 5px 9px;
        padding: 5px 0 5px 8px;
        &.pkgNameShowBox {
          // >label {
          //   padding-right: 12px;
          // }
          > input {
            border: 1px solid #ccc;
            width: 200px;
            padding: 7px;
            border-radius: 5px;
          }

          .handWritingBtn {
            height: 35px;
            vertical-align: bottom;
            float: right;
            font-size: 12px;
          }
        }
      }
      div {
        &.pkgTwoRow {
          height: 38px;
          margin: 18px 0;
          > div {
            float: left;
            &.pkgPriceShowBox {
              margin-right: 0;

              .el-form-item {
                margin-bottom: 0px;
                > .el-form-item__label {
                  padding: 0px !important;
                }
                > .el-form-item__content {
                  float: left;
                  > .el-input--prefix {
                    width: 95px;
                  }
                }
              }

              .changeBtn {
                display: inline-block;
                margin-left: 2px;
                padding: 0 5px;
                border-radius: 4px;
                vertical-align: bottom;
                border: 1px solid #ccc;
                .setFont(20px, #0babb9);
                cursor: pointer;
              }

              > input {
                font-size: 12px;
                width: 112px;
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 5px;
              }
            }
            &.tableNumber {
              width: 180px;
              float: right;
              span {
                padding: 5.5px 11px;
                border-radius: 5px;
                border: 1px solid #ccc;
                cursor: pointer;
              }
              .subtractBtn {
                margin-right: 2px;
                margin-left: -8px;
              }
              .addBtn {
                margin-left: 2px;
              }
            }
          }
        }
        &.pkgThreeRow {
          overflow: auto;
          padding: 0px 0 0 9px;

          .pkgModuleName {
            float: left;
            // margin-top: 3px;
            // width: 188px;
            .selectMenuTemp {
              width: 95px;
              display: inline-block;
              margin-bottom: 5px;
              white-space: nowrap;
              overflow: hidden;
              vertical-align: middle;
            }

            .changeBtn {
              display: inline-block;
              margin-left: 2px;
              padding: 0 5px;
              border-radius: 4px;
              vertical-align: bottom;
              border: 1px solid #ccc;
              .setFont(20px, #0babb9);
              cursor: pointer;
            }
          }
          > .pkgRemarks {
            float: right;
            > input {
              width: 132px;
              padding: 4px;
              border-radius: 5px;
              border: 1px solid #ccc;
            }
          }
        }
      }
    }
  }
</style>

<style lang="less">
.arrangeMenuDetail-container .tableNumber {
  .el-form-item__label {
    color: #000000 !important;
  }
}
.arrangeMenuDetail-container .pkgPriceShowBox {
  .el-form-item__label {
    padding-right: 0;
    color: #000000 !important;
  }
  .el-form-item__error {
    padding-top: 0;
  }
}

.arrangeMenu-message-top {
  top: 55px;
}
.lang-enUS{
  .arrangeMenuDetail-container label {
    font-size: 12px;
  }
}
</style>
