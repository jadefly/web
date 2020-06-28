
<template>
  <Dialog
    name="PosDialog.PackageNormal"
    :title="$t('Biz.Order.PackageNormal')"
    ref="dialog"
    top="62px"
    width="900px"
    height="670px"
    :showSubmit="true"
    :append-to-body="true"
    @open="onOpen"
    @close="onClose"
    @submit="pkgItemsSubmit"
    :hotkeys="hotKeySet"
    :submitId="submitId"
  >
    <div class="pkgContent">
       <div class="itemList">
         <div class="itemListTitle">
            <p class="pkgName">
              {{pkgMainData.name}}
              <span class="disFlgClass">
                <i v-if="pkgMainData.discFlg == 1" class="giveClass">{{ $t('Dict.Gift') }}</i>
              </span>
            </p>
            <div class="pkgControl">
              <span class="pkgNum">
                <!-- "DescriptiveText": "描述文字" -->
                <el-input-number
                  id="packageNormalNumber"
                  size="small"
                  v-model="pkgMainData.lastQty"
                  v-num-keyboard:bottom
                  @change="handleChange"
                  :min="pkgMainData.lastQtyMin || 1"
                  :max="pkgMainData.lastQtyMax || Infinity"
                  :label="$t('Dict.DescriptiveText')"
                  class="pkgNumInput"
                  v-judge
                  @blur="changeFocusState(false)"
                  @focus="changeFocusState(true)"
                >
                </el-input-number>
              </span>
              <!-- <span>加价: ￥{{pkgNormalTotalRaisePrice}}</span> -->
              <!-- <span class="subTotal">
                <del>￥{{pkgMainData.price}}</del>
                <strong>￥{{PkgNormalTotal(pkgMainData)}}</strong>
              </span> -->
            </div>
            <div class="priceFormula">
              <p class="title">
                <!-- 套餐价格 -->
                <span class="w_total">{{ $t('Dict.PkgPrice01') }}</span>
                <span class="sign"></span>
                <!-- "PkgListRaisePrice": "明细加价" -->
                <span class="w_price">{{ $t('Biz.Order.PkgListRaisePrice') }}</span>
                <span class="sign"></span>
                <!-- 联动回去的时候是没有数量标签的 -->
                <!-- "MethodPrice": "做法加价" -->
                <span class="w_method">{{ $t('Biz.Order.MethodPrice') }}</span>
                <span class="sign"></span>
                <!--   "TotalPrice": "总价"-->
                <span class="w_totalPrice">{{ $t('Biz.Order.TotalPrice') }}</span>
              </p>
              <p>
                <span class="w_total">{{(pkgMainData.price)*100*(pkgMainData.lastQty*100)/10000}}</span>
                <span class="sign">+</span>
                <!-- raisePriceType套餐明细的加价类型如果是2那么代表的是会员加价,如果不存在这个属性或者是为1为普通的加价 -->
                <span class="w_price" v-if="!pkgMainData.raisePriceType || pkgMainData.raisePriceType == 1">
                  {{!pkgMainData.isNotFollowAmount ?
                    (pkgNormalTotalRaisePrice.totalRaisePrice*100)*(pkgMainData.lastQty*100)/10000 :
                    pkgNormalTotalRaisePrice.totalRaisePrice}}
                </span>
                <span class="w_price" v-if="pkgMainData.raisePriceType == 2">
                  {{!pkgMainData.isNotFollowAmount ?
                   (pkgNormalTotalRaisePrice.totalRaiseMemberPrice*100)*(pkgMainData.lastQty*100)/10000 :
                   pkgNormalTotalRaisePrice.totalRaiseMemberPrice}}
                </span>
                <span class="sign">+</span>
                <span class="w_method">
                  {{!pkgMainData.isNotFollowAmount ?
                   (pkgNormalTotalRaisePrice.pkgListTotalMakeFee*100)*(pkgMainData.lastQty*100)/10000 :
                   pkgNormalTotalRaisePrice.pkgListTotalMakeFee}}
                </span>
                <span class="sign">=</span>
                <span class="w_totalPrice">{{PkgNormalTotal(pkgMainData)}}</span>
              </p>
            </div>
         </div>
         <div class="itemListBox">
          <div class="itemListContent" :id="'itemListContent'+type" ref="addItemContent">
            <div v-for="pkgClass in pkgClasses" :key="pkgClass.pkgClassId">
              <p class="itemGroupTitle" :class="{active: pkgClass.pkgClassId == activePkgClassData.pkgClassId}">{{pkgClass.pkgClassName}}</p>
              <ul id="itemListUl">
                <li v-for="(item, index) in (pkgClass.activePkgDtList || [])" :key="item.realItemId+index" @click="itemClickHandle(item, index, pkgClass)"
                :class="{active:activeItemId == (item.itemId + '-' + index)}"
                >
                  <p class="itemCode">{{item.itemCode || item.code}}</p>
                  <div class="item">
                    <span class="itemName">{{item.itemName || item.name}}</span>
                    <span class="itemMethodPrice" v-show="!isShowRaiseMemberPrice(item)">{{ item.raisePrice ? '+' + handleRaisePrice(item.raisePrice) : ''}}</span>
                    <span class="itemMethodPrice" v-show="isShowRaiseMemberPrice(item)">{{ item.raiseMemberPrice || item.raiseMemberPrice == 0 ? '+' + handleRaisePrice(item.raiseMemberPrice) : ''}}</span>
                    <span v-show="isShowRaiseMemberPrice(item)" class="vipClasss">{{ $t('Dict.Vip') }}</span>
                    <!-- #e0ba4d; -->
                    <span class="itemNum">{{item.count}}</span>
                  </div>
                  <!-- <p class="itemRemarks" v-if="scId && ((item.methodList && item.methodList.length)|| (item.serveWay && item.serveWay !='0_即起'))">
                    <span>注:</span>
                    <span v-if="item.serveWay">{{item.serveWay.name ? item.serveWay.name : (item.servewayName ? item.servewayName :'')}}<strong v-if="item.methodList && item.methodList.length">|</strong></span>
                    <span v-for="(method, index) in item.methodList" :key="index">{{method.name}}<strong v-if="index != (item.methodList.length-1)">|</strong></span>
                  </p> -->
                  <p class="itemRemarks" v-if="(item.methodList && item.methodList.length) || (item.serveWay) && !scId">
                    <!-- "Notes": "注", -->
                    <span>{{ $t('Dict.Notes01') }}</span>
                    <span v-if="item.serveWay">{{item.serveWay.name}}<strong v-if="item.methodList && item.methodList.length">|</strong></span>
                    <span v-for="(method, index) in item.methodList" :key="index">
                      {{method.name}}
                      {{ method.isNeedFee ? '(+'+ method.price + (method.qty && method.qty!=1 ? 'x'+ method.qty : '') + ')' : '' }}
                      <strong v-if="index != (item.methodList.length-1)">|</strong>
                    </span>
                  </p>
                </li>
              </ul>
            </div>
          </div>
         </div>
         <div class="listPager">
            <!-- 进入分页公共组件 -->
            <Pager
              :pagerId="'itemListContent'+type"
              scrollMode="simple"
              itemTag="> div"
              ref="pager"
            >
            </Pager>
                <!-- <Pager v-show="ordering" :pagerId="posOrderingListId" scrollMode="simple" ref="pager"></Pager> -->
         </div>
       </div>
       <div class="actionBtn">
         <ul >
          <li
            v-for="(btn, index) in contorlBtnLists"
            @click="actionBtnClick(btn.method,btn)"
            :key="index"
            :id="btn.method + type"
            v-show="btn.isShow"
            :class="{btnDisabled:btn.disabled}"
          >
          <!-- end -->
            <span>{{btn.btnName}}</span>
            </li>
         </ul>
       </div>
       <div class="menu">
          <div class="mueContent">
            <div class="menuClass">
              <div class="menuClassList" :class="{classListWidth:pkgClasses.length > 5}">
                <ul>
                  <li v-for="list in classList" :key="list.pkgClassId"
                  :class="{active: activePkgClassData.pkgClassId == list.pkgClassId }"
                  @click="activePkgClassBtn(list)">
                    <span>{{list.pkgClassName.split("(")[0]}}</span>
                  </li>
                </ul>
              </div>
              <div class="menuClassPager" v-if = "pkgClasses.length > 5">
                <!-- 进入分页公共组件 -->
                <NumPager
                  :total="vuePagerTotal"
                  @pagechange="pagechange"
                  :displayCount="vuePagerDisplay"
                  ref="topScroll"
                >
                </NumPager>
              </div>
            </div>
            <div class="menuList">
              <ul :id="type + 'MenuList'" v-autotest>
                <li class="menuItem" v-for="(menu, index) in pkgUnSelectedItemsPager" :key="menu.itemId" @click="addMenu(menu, index)"
                 :class="[{active: activeMenuIndex === index},{sellout: menu.itemSelloutData}]">
                  <p>
                    <span>{{menu.code}}</span>
                    <!-- 限量这块 老的程序只是个显示没有做一些判断, 判断在提交所点的品项的时候做了下处理 -->
                    <span v-show="!menu.itemSelloutData && menu.itemLimitData" class="itemLimit">
                      {{ $t('Dict.LimitNum', [menu.itemLimitData ? menu.itemLimitData.quantity : '']) }}
                    </span>
                    <span v-show="menu.itemSelloutData" class="itemSellout">{{ $t('Dict.Sellout') }}</span>
                  </p>
                  <p>{{menu.name}}</p>
                  <p v-show="menu.raisePrice">{{menu.raisePrice}}/{{menu.itemUnitName}}</p>
                  <em v-show="menu.count">{{menu.count}}</em>
                </li>
              </ul>
            </div>
            <div class="menuControl">
              <div class="menuSearch">
                <label for="">
                  <i class="icon icon-search"></i>
                  <input
                    :id="type + 'Search'"
                    ref="menusSearch"
                    type="text"
                    :placeholder="$t('Dict.QuickSearch')"
                    v-switch-keyboard:top="keyboardParams"
                    v-model.trim="menuSearch"
                    v-judge
                  >
                </label>
              </div>
              <div class="menuListPager" v-if = "pkgUnSelectedItems.length > bottomPagerDisplay">
                <NumPager
                  :total="bottomPagerTotal"
                  @pagechange="bottomPagechange"
                  :displayCount="bottomPagerDisplay"
                  ref="bottomScroll"
                >
                </NumPager>
              </div>
            </div>
          </div>
       </div>
    </div>
    <PackageChangeNum ref="PackageChangeNum" :submitId="type + 'ModifyNum'"></PackageChangeNum><!-- 改量的组件-->
    <PackageItemMethod ref="PackageItemMethod" :type="type + 'ModifyMethod'"  :submitId="type + 'ModifyMethod'"></PackageItemMethod><!-- 做法的组件-->
    <PackageItemServeWay ref="PackageItemServeWay" :type="type + 'ServeWay'"></PackageItemServeWay><!-- 上菜方式的组件-->
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
import ajax from '@/common/js/ajax.js';
import {
  add,
  sub,
  multi,
  zeroize,
} from '@/common/js/math';
import Pager from '@/components/Pos/Common/Pager';
import NumPager from '@/components/Pos/Common/NumPager';
import quickSearch from '@/common/js/quicksearch';
import * as KeyboardUtil from '@/plugin/keyboard/util';

// import index from 'vue';
const PackageChangeNum = (resolve) => {
  import('./PackageChangeNum').then((module) => {
    resolve(module);
  });
};

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
export default {
  components: {
    Dialog,
    Pager,
    PackageChangeNum,
    NumPager,
    PackageItemMethod,
    PackageItemServeWay,
  },
  mixins: [DialogMixin],
  props: {
    type: {
      type: String,
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
      contorlBtnData:
      [
        {
          btnName: this.$t('Dict.Btn.DeleteItem'), method: 'pkgDelete', disabled: false, isShow: true,
        },
        {
          btnName: '+', method: 'pkgAdd', disabled: false, name: 'changeNum', isShow: true,
        },
        {
          btnName: '-', method: 'pkgSubtract', disabled: false, name: 'changeNum', isShow: true,
        },
        {
          btnName: this.$t('Dict.Btn.ChangeHalfNum'), method: 'pkgItemHalf', disabled: false, name: 'changeNum', isShow: true,
        },
        {
          btnName: this.$t('Dict.Btn.ChangeItemNum'), method: 'pkgChangeNumber', disabled: false, name: 'changeNum', isShow: true,
        },
        {
          btnName: this.$t('Dict.Btn.ChangeItemMethods'), method: 'pkgChoseMethod', disabled: false, isShow: true,
        },
        {
          btnName: this.$t('Dict.Btn.ChangeItemServeWay'), method: 'pkgServeWay', disabled: false, isShow: true,
        },
      ],
      // 一页显示的条数 这是分类table 的分页
      vuePagerDisplay: 4,
      // 右侧菜单的分页一页显示多少数据
      bottomPagerDisplay: 20,
      // 当前页数 这是类table的分页
      currentPage: 1,
      // 当前页数 这是右侧菜单的分页
      bottomCurrentPage: 1,
      // 菜单多少行
      bottomMenuRowCount: 5,
      // 菜单一行显示几个
      bottomRowShowNumber: 4,
      // 套餐的数据
      pkgNormalData: null,
      // 选择的类table 切换的数据
      activePkgClassData: null,
      // search 内容
      menuSearch: '',
      // 正加单的menu当前数据
      addMenuData: null,
      // 左侧账单被选中的item id
      activeItemId: '',
      // 被选中后找到对应的数据 activeItemData 分开为了破数据受污染了找不到只能用对应的唯一id找
      activeItemData: {},
      // 选中对应的所在的类
      activeItemPkgClassData: {},
      // 这个是用来告诉做法的子组件这是在套餐弹框里操作的加做法
      orderingPkgItem: true,
      // 用来区分是否是已提交套餐的修改过来的
      scId: null,
      // 左侧账单的套餐的数量的input聚焦状态
      leftInputFocus: false,
      // 被选中的下标
      activeMenuIndex: 0,
    };
  },
  computed: {
    // 用vuex getter方法获取限量的数据和估清的数据
    ...mapGetters([
      'getVuexItemSelloutsMap', 'getVuexItemLimitsMap', 'posBaseInfo', 'getFastFoodBillData', 'getFastFoodMemberPlanFlg', 'getisSetUpGroupMethod',
      'haveLimitSmallClasses',
      'getActiveOrderItemSmClsTotal',
    ]),
    quickSearchText() {
      return quickSearch((`${this.menuSearch}`).toLowerCase());
    },
    // 联动回退
    contorlBtnLists() {
      return this.contorlBtnData.map((item) => {
        if (+this.posBaseInfo.controlMode === 3 && item.method === 'pkgServeWay') {
          this.$set(item, 'isShow', false);
        }
        return item;
      });
    },
    hotKeySet() {
      return {
        ...this.setKeySearchHotKey(),
        BackSpace: () => {
          this.inputKey('del'); // 删除
        },
        PgDn: () => {
          this.pkgItemsSubmit();
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
        F4: () => {
          this.actionBtnClick('pkgChangeNumber'); // 改量
        },
        F7: () => {
          this.actionBtnClick('pkgChoseMethod'); // 做法
        },
        F8: () => {
          this.actionBtnClick('pkgServeWay'); // 上菜方式
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
            this.addMenu(this.pkgUnSelectedItemsPager[this.activeMenuIndex], this.activeMenuIndex);
          }
        },
      };
    },
    keyboardParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {};
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard ? 'full' : 'nine',
      };
    },
    // 分页的总条数
    vuePagerTotal() {
      return this.pkgClasses.length;
    },
    bottomPagerTotal() {
      return this.pkgUnSelectedItems.length;
    },
    // 主要的信息
    pkgMainData() {
      return this.pkgNormalData ? this.pkgNormalData.package : {};
    },
    // 左边item类的列表初始化数据
    pkgClasses() {
      if (this.pkgNormalData) {
        // 对数据进行处理单独写方法
        this.itemListHandle();
      }
      return this.pkgNormalData ? this.pkgNormalData.pkgClasses : [];
    },
    // 分页对类的数据进行处理
    classList() {
      if (this.pkgClasses.length) {
        // 截取的起始和终止的index  下标
        const startIdex = 0 + (this.currentPage - 1) * this.vuePagerDisplay;
        const endIdex = this.currentPage * this.vuePagerDisplay > this.pkgClasses.length ? this.pkgClasses.length + 1 : this.currentPage * this.vuePagerDisplay + 1;
        return this.pkgClasses.slice(startIdex, endIdex);
      }
      return [];
    },
    pkgUnSelectedItemsPager() {
      if (this.pkgUnSelectedItems.length > this.bottomPagerDisplay) {
        // 截取的起始和终止的index 下标
        const startIdex = 0 + (this.bottomCurrentPage - 1) * this.bottomPagerDisplay;
        const endIdex = this.bottomCurrentPage * this.bottomPagerDisplay > this.pkgUnSelectedItems.length
          ? this.pkgUnSelectedItems.length + 1
          : this.bottomCurrentPage * this.bottomPagerDisplay + 1;
        return this.pkgUnSelectedItems.slice(startIdex, endIdex - 1);
      }
      return this.pkgUnSelectedItems;
    },
    // 右边的数据 这块处理逻辑有问题，暂时没时间改下，不影响使用就是性能不好
    pkgUnSelectedItems() {
      const pkgUnSelectedItems = this.pkgNormalData ? this.pkgNormalData.pkgUnSelectedItems : null;
      if (pkgUnSelectedItems) {
        const newPkgUnSelectedItems = pkgUnSelectedItems.map((item) => {
          // 获取下相应的品项限量数据
          const itemLimitData = this.getItemLimitData(item);
          // 获取下相应的品项估清数据
          const itemSelloutData = this.getItemSelloutData(item);
          return Object.assign(item, {
            itemSelloutData,
            itemLimitData,
          });
        });
        // 对右侧的菜单 品项进行过滤操作 或者可以写成外套的过滤也行
        const result = this.itemFilterFn(newPkgUnSelectedItems);
        return result;
      }
      return '';
      // if (pkgUnSelectedItems) {
      //   // 过滤处理 根据pkgClassId 类id分组显示 如果搜索框有值的时候要加上进行过滤
      //   this.pkgNormalData.newPkgUnSelectedItem = [];
      //   pkgUnSelectedItems.forEach((item) => {
      //     // 获取下相应的品项限量数据
      //     const itemLimitData = this.getItemLimitData(item);
      //     // 获取下相应的品项估清数据
      //     const itemSelloutData = this.getItemSelloutData(item);
      //     item.itemLimitData = itemLimitData;
      //     item.itemSelloutData = itemSelloutData;
      //     const newItem = {
      //       isRequired: item.isRequired, // 是否是必选的品项
      //       itemUnitName: item.itemUnitName, // 品项名称
      //       code: item.code, // 品项code
      //       count: item.count, // 品项的默认数值
      //       realItemId: item.realItemId, // realItemId
      //       costPrice: item.costPrice, // 成本价格
      //       pkgClassId: item.pkgClassId, // 类id
      //       itemSizeId: item.itemSizeId, // 规格id
      //       limitedqty: item.limitedqty, // 套餐方案里的限定数值
      //       itemId: item.itemId, // itemId
      //       pinyin: item.pinyin, // 拼音
      //       isRaiseByQty: item.isRaiseByQty, // 是否根据数量加价
      //       name: item.name, // 名称
      //       enableMutiSize: item.enableMutiSize, //
      //       itemUnitId: item.itemUnitId,
      //       isqtylimited: item.isqtylimited, // 是否是限定
      //       raisePrice: item.raisePrice, // 加价金额
      //       itemLimitData, // 品项限量的数据,不存在
      //       itemSelloutData,
      //     };
      //     this.pkgNormalData.newPkgUnSelectedItem.push(newItem);
      //   });
      //   // 对右侧的菜单 品项进行过滤操作 或者可以写成外套的过滤也行
      //   const result = this.itemFilterFn(pkgUnSelectedItems);
      //   return result;
      // }
      // return '';
    },
    // 类总共所点的数判断和类的数据
    classTotal() {
      // 根据当前的类的id找到相应的数据
      let pkgClassCountTotal = 0;

      const nowPkgClassData = this.pkgClasses.filter(nowPKg => nowPKg.pkgClassId == this.activePkgClassData.pkgClassId);
      nowPkgClassData[0].activePkgDtList.forEach((list) => {
        // 如为称重确认的品项,则数量按1来计算
        let { count } = list;
        if (list.isConfirmWeigh) count = 1;
        pkgClassCountTotal = (count * 1000 + pkgClassCountTotal * 1000) / 1000;
      });
      // nowPkgClassData[0] 为数据  isOrderRemainderNum 为当前组内所剩可以点的数量 没超过可以继续加单否则提示
      return { classData: nowPkgClassData[0], isOrderRemainderNum: (nowPkgClassData[0].choiceQty * 1000 - pkgClassCountTotal * 1000) / 1000, choiceQty: nowPkgClassData[0].choiceQty };
    },
    // 套餐明细品项加价和做法加价总和 是个对象的逻辑
    pkgNormalTotalRaisePrice() {
      if (this.pkgClasses) {
        let totalRaisePrice = 0; // 套餐明细价格的总额
        let totalRaiseMemberPrice = 0; // 套餐明细加价会员价的总额
        let pkgListTotalMakeFee = 0; // 套餐明细做法加价的总额
        this.pkgClasses.forEach((pkgCls) => {
          pkgCls.normalDtList.forEach((item) => {
            // 加价是按照所点的条数来做判断的
            if (item.raisePrice) {
              totalRaisePrice = this.countTotalRaisePrice(item, item.raisePrice, totalRaisePrice);
            }
            // 会员加价的总计算
            totalRaiseMemberPrice = this.countTotalRaisePrice(item,
              (item.raiseMemberPrice || item.raiseMemberPrice == 0) ? item.raiseMemberPrice : (item.raisePrice ? item.raisePrice : 0),
              totalRaiseMemberPrice);
            // 如果做法存在,做下循环把所有的做法价格和计算下
            let itemMethodTotal = 0;
            if (item.methodList && item.methodList.length) {
              // pkgListMethodTotal 每个明细的做法总和
              item.methodList.forEach((method) => {
                if (method.price) {
                  const methodTotalPrice = multi(method.price, method.qty);
                  // 做法是联动的和计算
                  if (method.isRelaCount) {
                    itemMethodTotal = add(itemMethodTotal, multi(methodTotalPrice, item.count));
                  } else {
                    itemMethodTotal = add(itemMethodTotal, methodTotalPrice);
                  }
                }
              });
            }
            // 提交完的已入库套餐修改的时候
            this.$set(item, 'totalMakeFee', itemMethodTotal);
            pkgListTotalMakeFee = add(item.totalMakeFee, pkgListTotalMakeFee);
          });
        });
        return {
          totalRaisePrice,
          totalRaiseMemberPrice,
          pkgListTotalMakeFee,
          additionalTotalPrice: add(totalRaisePrice, pkgListTotalMakeFee),
          additionalMemberTotalPrice: add(totalRaiseMemberPrice, pkgListTotalMakeFee),
        };
      }
      return {};
    },
  },
  methods: {
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
        this.$set(this.pkgMainData, 'lastQtyMax', maxAddQty); // 自己添加
        return false;
      }
      return true;
    },
    handleChange(newVal, oldVal) {
      this.limitLastQty(newVal); // 套餐加单-限制数量（最大、最小值）
    },
    changeFocusState(state) {
      this.leftInputFocus = state;
    },
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
    // 右侧input在失去焦点的录入和删除
    inputKey(type, val = '') {
      if (
        (document.hasFocus()
          && document.activeElement === this.$refs.menusSearch)
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
        <= this.pkgUnSelectedItemsPager.length - 1
      ) {
        this.activeMenuIndex = this.activeMenuIndex + this.bottomRowShowNumber;
        // 翻页的时候 pkgUnSelectedItemsPager
      } else if (this.bottomCurrentPage + 1 <= this.itemsPageTotal) {
        this.$refs.bottomScroll.pagechange(this.bottomCurrentPage + 1);
        this.activeMenuIndex = this.bottomRowShowNumber
          - (this.bottomPagerDisplay - this.activeMenuIndex);
        // 如果进入下一个页的时候index大于这页显示的数据就为初始值0
        if (this.activeMenuIndex > this.pkgUnSelectedItemsPager.length - 1) {
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
      if (this.activeMenuIndex < this.pkgUnSelectedItemsPager.length - 1) {
        this.activeMenuIndex += 1;
      } else if (this.bottomCurrentPage + 1 <= this.itemsPageTotal) {
        this.$refs.bottomScroll.pagechange(this.bottomCurrentPage + 1);
        this.activeMenuIndex = 0;
      }
    },
    // 判断是否显示会员加价
    isShowRaiseMemberPrice(item) {
      // pkgMainData
      if (this.pkgMainData.raisePriceType == 2 && (item.raiseMemberPrice || item.raiseMemberPrice == 0)) {
        return true;
      }
      return false;
    },
    /**
     * 计算下套餐明细的加价的总额
     * @param item {Object} 套餐明细数据
     * @param totalRaisePrice {Number} 本套餐所有的套餐明细的价格和
     * @param raisePrice {Number} 明细加价的价格
     */
    countTotalRaisePrice(item, raisePrice, totalRaisePrice) {
    // 如果套餐明细加价随着数量而变化
      if (item.isRaiseByQty) {
        // totalRaisePrice = add(totalRaisePrice,item.raisePrice*item.count)
        // 联动 回退
        totalRaisePrice = add(totalRaisePrice, raisePrice * item.count);
      } else {
        totalRaisePrice = add(totalRaisePrice, raisePrice);
      }
      return totalRaisePrice;
    },
    // 对过来的数据先进行count 属性添加 整理完return
    initResData(resData) {
      // 克隆下 let cloneResData
      const cloneResData = cloneDeep(resData);
      if (cloneResData) {
        // 添加判断是加单时候的修改不需要重新走new的排序顺序
        // pkgClassesNew 是套餐类的自定义排序的字段
        if (!cloneResData.isOrderingModify) {
          cloneResData.pkgClasses = resData.pkgClassesNew;
        }
        // raisePriceType 如果当前营业流水执行了会员价格 则改变套餐加价类型

        // getFastFoodMemberPlanFlg.isDoMemberPrice执行会员价状态(不区分按钮或验证会员的会员价)
        //
        (this.getFastFoodMemberPlanFlg && this.getFastFoodMemberPlanFlg.isDoMemberPrice) ? cloneResData.package.raisePriceType = 2 : cloneResData.package.raisePriceType = 1;
        // 套餐右侧菜品品项 添加属性count 数量的key
        cloneResData.pkgUnSelectedItems.forEach((pkgSelItem, index) => {
          // 添加属性 key count
          this.$set(pkgSelItem, 'count', 0);
        });
        cloneResData.pkgClasses.forEach((pkcls) => {
          // 每个组
          pkcls.normalDtList.forEach((list, index) => {
          // 每个组内的默认品项 添加个count数量属性
            list = Object.assign({}, list, {
              count: list.count ? list.count : list.defaultQty, // 这是套餐修改过来的都是还有count key
            });
            // 必须用这个splice vue才能起作用 可以看官方文档的 对象更改检测注意事项
            pkcls.normalDtList.splice(index, 1, list);
            // 找到对应的菜单的品项给count 赋值
            const findItem = find(cloneResData.pkgUnSelectedItems, {
              itemId: list.itemId,
            });
            if (findItem) {
              const findeIndex = cloneResData.pkgUnSelectedItems.indexOf(findItem);
              findItem.count = add(findItem.count, list.count);
              cloneResData.pkgUnSelectedItems.splice(findeIndex, 1, findItem);
            }
          });
        });
        return cloneResData;
      }
    },
    onClose() {
      // 这是销毁下 分页组件的index的暂存 值重新给赋值
      this.destructionItemsPage(true);
	    this.$refs.pager.refresh();
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
      // 初始菜单选中状态
      this.activeMenuIndex = 0;
      // 获取数据
      // 对过来的数据做下处理
      // 初始化下 清空搜索
      this.menuSearch = '';
      this.scId = this.resData.scId ? this.resData.scId : null;
      this.pkgNormalData = this.initResData(this.resData);
      // 根据areaType类型的不同  当前客位所在的不同区域显示不同的价格判断 添加条件 排除下 促销的价和时价的情况
      if (this.pkgNormalData.package.discFlg != 4 && !this.pkgNormalData.package.isItemTimePrice && this.areaType != 0 && this.pkgNormalData.package.priLocals && (this.pkgNormalData.package.priLocals[0][`other_price${this.areaType}`] || this.pkgNormalData.package.priLocals[0][`other_price${this.areaType}`] == 0)) {
        this.pkgNormalData.package.price = this.pkgNormalData.package.priLocals[0][`other_price${this.areaType}`];
        this.pkgNormalData.package.salePrice = this.pkgNormalData.package.priLocals[0][`other_price${this.areaType}`];
      }
      this.activeItemId = '';
      this.activeItemData = {};
      this.activePkgClassData = null;
      this.currentPage = 1;
      this.bottomCurrentPage = 1;
      // 延迟刷新下分页组件 ,后期优化
      setTimeout(() => {
        this.$refs.pager.refresh();
      }, 200);
    },
    // 对数据分类 进行整理
    itemListHandle() {
      this.pkgNormalData.pkgClasses.forEach((pkgClass, index) => {
        // 类的选中默认第一个 这块可以根据数据默认显示的是哪个类的数据
        if (index == 0 && !this.activePkgClassData) {
          this.activePkgClassData = {
            pkgClassName: pkgClass.pkgClassName.split('(')[0],
            pkgClassId: pkgClass.pkgClassId,
          };
        }
        pkgClass.activePkgDtList = pkgClass.normalDtList;
        // 合并的 为计算是否按数量加价
        const mergePkgDtList = [];
        pkgClass.activePkgDtList.forEach((item, index) => {
          const findItem = mergePkgDtList.filter(list => list.itemId == item.itemId);
          if (findItem.length) {
            findItem[0].count = add(item.count, findItem[0].count);
          } else {
            mergePkgDtList.push(extend({}, item));
          }
        });
        pkgClass.mergePkgDtList = mergePkgDtList;
      });
    },
    // 左侧账单的点击事件
    itemClickHandle(item, index, pkgClass) {
      this.assignmentHandle(item, index, pkgClass);
    },
    // 数据的key值变化要进行重新赋值
    assignmentHandle(item, index, pkgClass) {
      // 初始化下正加单的数据
      this.addMenuData = null;
      this.activePkgClassData = {
        pkgClassName: pkgClass.pkgClassName.split('(')[0],
        pkgClassId: pkgClass.pkgClassId,
      };
      // 给选中的ID赋值 唯一性
      this.activeItemId = item ? `${item.itemId}-${index}` : '';
      this.activeItemData = item || {};
      this.activeItemPkgClassData = pkgClass;
    },
    // 找到当前正操作的品项数据
    findActivceItemData() {
      let activeIndex = 0;
      const findItem = this.classTotal.classData.activePkgDtList.filter((list, index) => {
        if (`${list.itemId}-${index}` == this.activeItemId) {
          activeIndex = index;
        }
        return `${list.itemId}-${index}` == this.activeItemId;
      });
      const findMergeItem = this.classTotal.classData.mergePkgDtList.filter((mergeList, index) => mergeList.itemId == this.activeItemData.itemId);
      return { findItem: findItem[0], index: activeIndex, findMergeItem: findMergeItem[0] };
    },
    // 操作按钮 事件
    actionBtnClick(btnMethodName, btn) {
      // 联动回退
      // 判断当前的按钮是否被禁用了就不需要 被快捷键触发
      const findBtn = find(this.contorlBtnLists, { method: btnMethodName });
      if (findBtn.disabled || !findBtn.isShow) {
        return false;
      }
      if (this.activeItemId) {
        // console.log(this.activeItemData)
        // 做法
        if (btnMethodName == 'pkgChoseMethod') {
          this.pkgChoseMethod();
        } else if (btnMethodName == 'pkgChangeNumber') {
          this.pkgChangeNumber();// 改量
        } else if (btnMethodName == 'pkgServeWay') {
          this.pkgServeWay();// 上菜方式
        } else {
          // 半份的判断
          if (btnMethodName == 'pkgItemHalf') {
            // 强制0.5
            this.activeItemData.count < 0.5 && this.pkgItemChangeCount('pkgAdd', (0.5 * 1000 - this.activeItemData.count * 1000) / 1000);
            this.activeItemData.count > 0.5 && this.pkgItemChangeCount('pkgSubtract', (this.activeItemData.count * 1000 - 0.5 * 1000) / 1000);
          } else {
            // 这是 减 /删 /加 的事件
            this.pkgItemChangeCount(btnMethodName);
          }
        }
      } else {
        // 提示 "SelectTheAddedItem": "请选择您要操作的已加单品项"
        this.isShowMessage(this.$t('Dict.SelectTheAddedItem'));
      }
    },
    // 上菜方式
    pkgServeWay() {
      // 判断是快餐模式下就返回,因为快餐模式下不支持上菜方式的
      if (this.posBaseInfo.controlMode == 3) {
        return false;
      }
      const itemData = this.activeItemData;
      this.$refs.PackageItemServeWay.open({ itemData, isPkgModule: true }, {
        submit: (serveWayData) => {
          // 找到对应的品项数组
          const { findItem } = this.findActivceItemData();
          if (serveWayData.isOrderingBillAllServeWay) {
            // 对目前所有已点的品项进行添加上菜方式的字段
            this.classTotal.classData.activePkgDtList.map((_) => {
              this.$set(_, 'serveWay', serveWayData.serveWay);
              this.$set(_, 'serve_way_id', serveWayData.serveWay.id);
            });
          } else {
            this.$set(findItem, 'serveWay', serveWayData.serveWay);
            this.$set(findItem, 'serve_way_id', serveWayData.serveWay.id);
          }
          this.$refs.PackageItemServeWay.close();
        },
      });
    },
    // 做法
    pkgChoseMethod() {
      const itemData = this.activeItemData;
      const url = this.getisSetUpGroupMethod ? 'canyin.pos.bill.itemmethodgroupinfo' : 'canyin.pos.bill.moremethodandserveway';
      ajax(url, {
        params: {
          itemId: itemData.realItemId,
          itemSizeId: itemData.itemSizeId,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (res.data.code == 1) {
          this.$refs.PackageItemMethod.open({ itemData, methodsData: res.data.data, pkgItem: 1 }, {
            submit: (methodData) => {
              // 对当前选中的类所有已添加的品项进行添加做法
              if (methodData.publicIsValid) {
                this.classTotal.classData.activePkgDtList.map((_) => {
                  // 如果存在就直接替换,不存在就添加
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
                const { findItem } = this.findActivceItemData();
                this.$set(findItem, 'methodList', methodData.methodList);
              }
              this.$refs.PackageItemMethod.close();
            },
          });
        }
      });
    },
    // 改量的方法
    pkgChangeNumber() {
      // 改量 组合弹框所需要的数据
      const itemChangeData = {
        num: this.activeItemData.count, // 当前选择的品项数量值
        itemName: this.activeItemData.itemName, // 品项名称
        itemUnitName: this.activeItemData.itemUnitName, // 单位名称
      };
      // 改量弹框
      this.$refs.PackageChangeNum.open(itemChangeData, {
        submit: (changeNumData) => {
          // 判断改量是增加了还是减少了
          if (changeNumData.num > this.activeItemData.count) {
            // 增加了 就调用加加 的方法 this.pkgItemChangeCount('pkgAdd',changeAddNum)
            const changeAddNum = (changeNumData.num * 1000 - this.activeItemData.count * 1000) / 1000;
            // 这 执行了方法 如果是false 证明条件不符合不能关闭
            if (this.pkgItemChangeCount('pkgAdd', changeAddNum) != false) {
              this.$refs.PackageChangeNum.close();
            }
          } else if (changeNumData.num == this.activeItemData.count) {
            // 相等的时候没有进行变化 直接关闭窗口
            this.$refs.PackageChangeNum.close();
          } else {
            // 比原先减少了就执行减的方法 pkgSubtract
            const changeSubNum = (this.activeItemData.count * 1000 - changeNumData.num * 1000) / 1000;
            if (this.pkgItemChangeCount('pkgSubtract', changeSubNum) != false) {
              this.$refs.PackageChangeNum.close();
            }
          }
        },
      });
    },
    // 判断是否满足 是必选品项的默认数量必须大于0的判断
    isRequiredFn(deleteCount) {
      const { mergePkgDtList } = this.activeItemPkgClassData;
      let isRequired = true;
      mergePkgDtList.forEach((mergeItem) => {
        if (mergeItem.itemId == this.activeItemData.itemId) {
          if ((mergeItem.count - deleteCount) <= 0 && mergeItem.isRequired) {
            // 提示
            isRequired = false;
            // "PackageErrorMsg": "必选品项的默认数量必须大于0",
            this.isShowMessage(this.$t('Biz.Order.PackageErrorMsg'));
          }
        }
      });
      return isRequired;
    },
    // 改变右边的菜单的已点品项的数量
    menuChangeCount(eventName, count) {
      // 改变右边菜单的数量
      this.pkgUnSelectedItems.forEach((menu) => {
        if (menu.itemId == this.activeItemData.itemId) {
          switch (eventName) {
            case '+':
              menu.count = add(count, menu.count);
              break;
            case '-':
              menu.count = sub(menu.count, count);
              break;
            default:
              break;
          }
        }
      });
    },
    // 加减 ,删除,改量的公共方法
    pkgItemChangeCount(controlBtnName, changeNum) {
      console.log('fast-选中的品项：', this.findActivceItemData());
      // 找到对应的数据 合并的和不合并的
      const { findItem } = this.findActivceItemData();
      if (!findItem) {
        // "SelectTheAddedItem": "请选择您要操作的已加单品项"
        this.isShowMessage(this.$t('Dict.SelectTheAddedItem'));
        return false;
      }
      const { findMergeItem } = this.findActivceItemData();
      const index = this.classTotal.classData.activePkgDtList.indexOf(findItem);
      // 删除和减的事件
      if (controlBtnName == 'pkgSubtract' || controlBtnName == 'pkgDelete') {
        // 去判断减的时候是否满足了必须的条件 - 是值为1 删除为 现有的值 findItem[0].count
        let subCount = changeNum || (controlBtnName == 'pkgSubtract' ? 1 : findItem.count);
        subCount = sub(findItem.count, subCount) < 0 ? findItem.count : subCount;
        if (this.isRequiredFn(subCount)) {
          findItem.count = sub(findItem.count, subCount);
          // 当减为零的时候要删除
          if (!findItem.count) {
            this.classTotal.classData.activePkgDtList.splice(index, 1);
            // 初始化下当前被选中的item数据和id
            findItem[0] = null;
            this.activeItemId = '';
          }
          findMergeItem.count = sub(findMergeItem.count, subCount);
          // 对应改变右侧的cout 数显示
          this.menuChangeCount('-', subCount);
          // 变化了就要重新赋值
          this.assignmentHandle(findItem, index, this.classTotal.classData);
        }
        // 加的事件
      } else if (controlBtnName == 'pkgAdd') {
        // isOrderRemainderNum 组内所剩的最大量和要加的数量做下比较
        // 剩余的和新添加的做下比较
        const addCount = changeNum || 1;

        // 如为称重品项不做数量判断
        if (findItem.isConfirmWeigh || this.classTotal.isOrderRemainderNum >= addCount) {
          // 判断已点的品项是否达到限量品项的值 必须是限量所对应的品项
          // addCount+findMergeItem.count  > findMergeItem.itemLimitData.limitQuantity
          if (findMergeItem.itemLimitData) {
            // 限量所剩的和要加的做比较如果剩余小于要加的就提示
            if (sub(findMergeItem.itemLimitData.quantity, findMergeItem.count) < addCount) {
              // "LimitQuantityVal0": "该品项限量值为",
              this.isShowMessage(this.$t('Biz.Order.LimitQuantityVal0', [findMergeItem.itemLimitData.limitQuantity]));
              return false;
            }
          }
          // 套餐明细下的品项限定判断
          // console.log(findMergeItem[0].isqtylimited,findMergeItem[0].limitedqty)
          if (findMergeItem.isqtylimited && findMergeItem.limitedqty != 0) {
            if (sub(findMergeItem.limitedqty, findMergeItem.count) < addCount) {
              // "LimitedqtyVal0": "该品项的限定值为"
              this.isShowMessage(this.$t('Biz.Order.LimitedqtyVal0', [findMergeItem.limitedqty]));
              return false;
            }
          }

          findItem.count = add(addCount, findItem.count);
          findMergeItem.count = add(addCount, findMergeItem.count);
          // 所点品项超过了限量的值要
          // 改变右边菜单的数量
          this.menuChangeCount('+', addCount);
          // 变化了就要重新赋值
          this.assignmentHandle(findItem, index, this.classTotal.classData);
        } else {
          // this.classTotal.choiceQty "PkgGroupsMaximum0": "套餐当前的分组最大限制数为"
          this.isShowMessage(this.$t('Biz.Order.PkgGroupsMaximum0', [this.classTotal.choiceQty]));
          return false;
        }
      }
    },
    // 计算套餐总的合计
    PkgNormalTotal(pkgMainData) {
      if (pkgMainData && JSON.stringify(pkgMainData) !== '{}') {
        // raisePriceType 属性是加价类型的判断 2:会员加价, 1:普通加价
        let additionalLastTotalPrice = (pkgMainData.raisePriceType == 1 || !pkgMainData.raisePriceType) ? this.pkgNormalTotalRaisePrice.additionalTotalPrice : this.pkgNormalTotalRaisePrice.additionalMemberTotalPrice;
        // 套餐明细里的加价,要判断联动,不联动下的加价的算法
        !pkgMainData.isNotFollowAmount ? additionalLastTotalPrice = multi(additionalLastTotalPrice, pkgMainData.lastQty) : additionalLastTotalPrice;
        return add(multi(pkgMainData.price, pkgMainData.lastQty), additionalLastTotalPrice);
      }
    },
    // 加价价格的显示转化
    handleRaisePrice(num) {
      // let reg = /.*\..*/
      // return reg.test(item.raisePrice) ? '￥'+item.raisePrice : '￥'+item.raisePrice+'.00'
      return zeroize(num);
    },
    // 套餐类的选择事件
    activePkgClassBtn(list) {
      // 重新给被选择的数据赋值
      this.activePkgClassData = list;
      // 每次的都得初始下分页组件的暂存index
      // 设置当前的页数
      this.destructionItemsPage();
    },
    // 小类数量限定判断
    /**
     * item当前点的菜
     * items 代表是当前所有已点的菜 包含（当前套餐其他的菜和当前套餐的明细和）
     * changeNum 变化的数量
     */
    // limitItemSamllClsNumJudge(item, clsItems, changeNum) {
    //   const limitSmallClsItemNum = this.haveLimitSmallClasses[item.smallClassId];
    //   if (limitSmallClsItemNum) {
    //     // 入库的当前菜对应的小类已点的总数
    //     // 账单除当前套餐所有已点小类的菜总和
    //     let orderingItemSmClsTotal = 0;
    //     if (this.$parent.guestList) {
    //       orderingItemSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId, this.$parent.guestList, 'num');
    //     }
    //     let items = [];
    //     if (clsItems) {
    //       clsItems.forEach((pkcls) => {
    //         items = items.concat(pkcls.activePkgDtList);
    //       });
    //     }
    //     const orderingItemPkgSmClsTotal = this.getActiveOrderItemSmClsTotal(item.smallClassId, items, 'count');
    //     if (limitSmallClsItemNum < add(orderingItemPkgSmClsTotal, add(orderingItemSmClsTotal, changeNum))) {
    //       this.$message.error(`菜品所属小类限定数为${limitSmallClsItemNum}`);
    //       return false;
    //     }
    //   }
    //   return true;
    // },
    // 加单事件
    addMenu(menu, index) {
      // 如果快速查找里面有所搜条件的话就要清空
      this.menuSearch = '';
      // 估清和限量的提示
      if (menu.itemSelloutData) {
        // "AddOrderIsSellout": "此品项已估清不能使用",
        this.isShowMessage(this.$t('Biz.Order.AddOrderIsSellout'));
        return;
      } if (menu.itemLimitData) {
        if (!menu.itemLimitData.quantity || sub(menu.itemLimitData.quantity, menu.count) < 1) {
          // "LimitQuantityVal0": "该品项限量值为"
          const messageText = this.$t('Biz.Order.LimitQuantityVal0', [menu.itemLimitData.quantity]);
          this.isShowMessage(messageText);
          return false;
        }
      }
      // 套餐明细下的品项限定判断
      if (menu.isqtylimited && menu.limitedqty != 0) {
        if (sub(menu.limitedqty, menu.count) < 1) {
          // "LimitedqtyVal0": "该品项的限定值为",
          this.isShowMessage(this.$t('Biz.Order.LimitedqtyVal0', [menu.limitedqty]));
          return false;
        }
      }
      this.activeItemId = '';
      if (this.classTotal.isOrderRemainderNum > 0) {
        const addPKgClass = this.classTotal.classData.activePkgDtList;
        this.addMenuData = menu;
        // 这块 写活了  以前的count 默认就为1
        const menuCount = this.classTotal.isOrderRemainderNum >= 1 ? 1 : this.classTotal.isOrderRemainderNum;
        // 判断当前菜所属于类的限定值是否满足加单 true为没超过可以继续加单
        // if (!this.limitItemSamllClsNumJudge(menu, this.pkgClasses, menuCount)) {
        //   return;
        // }
        // 每次添加的数量默认为如果可剩的数>= 1就为1 否则为 所剩的数
        const extendMenu = {
          count: menuCount,
          itemCode: menu.code,
          itemName: menu.name,
        };
        const itemData = extend({}, menu, extendMenu);
        // 加单
        const { length } = addPKgClass;
        addPKgClass.push(itemData);
        this.activeMenuIndex = index;
        this.activeItemId = `${itemData.itemId}-${length}`;// 默认选择最后加的菜
        this.activeItemData = itemData;
        this.activeItemPkgClassData = this.pkgClasses.filter(_ => _.pkgClassId == itemData.pkgClassId)[0];
        // this.$refs.pager.refresh()
        setTimeout(() => {
          this.scrollEnd();
        });

        // 快速修改数量
        if (menu.enableEasyDiskModifyQty) {
          this.pkgChangeNumber();
        }

        // 改变菜单已点数量
        menu.count = add(menuCount, menu.count);
      } else {
        // "PkgGroupsMaximum0": "套餐当前的分组最大限制数为"
        this.isShowMessage(this.$t('Biz.Order.PkgGroupsMaximum0', [this.classTotal.choiceQty]));
      }
    },
    // 滚到底部
    scrollEnd() {
      setTimeout(() => {
        const addBillBox = this.$refs.addItemContent;
        if (addBillBox.scrollHeight > addBillBox.clientHeight) {
          addBillBox.scrollTop = sub(addBillBox.scrollHeight, addBillBox.clientHeight);
        }
      }, 0);
    },
    // 提示的公共方法
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo'), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    // 获取菜单的限量数据 不是套餐方案内的限定数
    getItemLimitData(item) {
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
    // 获取菜单的估清数据
    getItemSelloutData(item) {
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
    // 右侧菜单的品项过滤方法
    itemFilterFn(newPkgUnSelectedItem) {
      const itemFilterData = newPkgUnSelectedItem.filter((item) => {
        if (item.count || item.count == 0) {
          item.count = item.count;
        } else {
          item.count = 0;
        }
        // 过滤条件
        if (this.menuSearch.length > 0) {
          let keyFilters = this.quickSearchText; // 从这对数据进行处理
          const code = (`${item.code}`).toLowerCase(); // code代码
          const name = (item.code).toLowerCase(); // 名称
          const pinyin = item.pinyin.toLowerCase(); // 拼音
          const barcode = item.barcode || ''; // 条码,数字格式
          // 如果keyFilters参数不是数组，说明输入的是一个单一的过滤值，转化为数组
          !Array.isArray(keyFilters) && (keyFilters = [`${keyFilters}`]);
          // console.log(item.pinyin.toLowerCase(),this.menuSearch.toLowerCase())
          return (item.pkgClassId == this.activePkgClassData.pkgClassId && (function () {
            for (let i = 0; i < keyFilters.length; i++) {
              const key = keyFilters[i];
              if ((code.indexOf(key) != -1 || name.indexOf(key) != -1 || pinyin.indexOf(key) != -1 || barcode.indexOf(key) != -1)) {
                return true;
              }
            }
            return false;
          }()));
        }
        return (item.pkgClassId == this.activePkgClassData.pkgClassId);
      });
      return itemFilterData;
    },
    // 分页组件修改完当前页的触发事件table
    pagechange(current) {
      this.currentPage = current;
    },
    // 菜单组件修改完当前页的触发事件
    bottomPagechange(current) {
      this.bottomCurrentPage = current;
    },
    // 确认事件
    pkgItemsSubmit() {
      // 套餐加单-限制数量（最大、最小值）
      if (!this.limitLastQty(this.pkgMainData.lastQty)) return false;
      // 循环数组判断每个组内的允许的最小值满足不满足
      let isSubmitTrue = true;// 是否可以提交
      const pkgList = [];
      this.pkgNormalData.pkgClasses.forEach((_class) => {
        let _classNum = 0;
        _class.activePkgDtList.map((_classItem) => {
          // 判断默认的选择品项中是否存在了估清的品项
          if (_classItem.isSellout) {
            this.$message({
              type: 'error',
              // message: `套餐分组:${_class.pkgClassName}中的${_classItem.itemName}已估清`,
              message: this.$t('Biz.Order.PkgClassSellOutTip01', [_class.pkgClassName, _classItem.itemName]),
            });
            isSubmitTrue = false;
            return false;
          }
          _classNum = (_classItem.count * 1000 + _classNum * 1000) / 1000;
          // 整理数据
          pkgList.push(this.creatItem(_classItem));
        });
        // 如果存在一个组内的所点数小于允许的最小值,那么提示
        if (_classNum < _class.choiceMinQty) {
          this.$message({
            type: 'error',
            // message: `存在套餐分组:${_class.pkgClassName}的所点数量小于最小数${_class.choiceMinQty}`,
            message: this.$t('Biz.Order.PkgClassSellOutTip02', [_class.pkgClassName, _class.choiceMinQty]),
          });
          isSubmitTrue = false;
          return;
        }
        // 默认所点的品项是否大于限量的数
        _class.mergePkgDtList.forEach((mergeClass) => {
          if (mergeClass.count > mergeClass.quantity) {
            this.$message({
              type: 'error',
              // message: `已点的品项${mergeClass.itemName}的数量大于限量`,
              message: this.$t('Biz.Order.PkgClassSellOutTip03', [mergeClass.itemName]),
            });
            isSubmitTrue = false;
          }
        });
      });
      // 套餐的主要信息整理
      const pkgSubmitData = {
        pkgList,
      };
      this.creatPkgMain(this.pkgMainData, pkgSubmitData);
      isSubmitTrue && this.submit(pkgSubmitData, this.pkgNormalData);
    },
    // 套餐明细的数据整理

    creatItem(pkgItem) {
      // 判断是否是提交完的套餐修改
      const item = {
        id: pkgItem.realItemId, // 品项id
        sizeId: pkgItem.itemSizeId, // 品项规格id
        code: pkgItem.itemCode, // 品项code
        name: pkgItem.itemName ? pkgItem.itemName : pkgItem.name, // 品项名称
        unitId: pkgItem.itemUnitId, // 品项单位id
        unitName: pkgItem.itemUnitName, // 品项单位名称
        costPrice: pkgItem.costPrice, // 品项成本价格namename
        num: pkgItem.count, // 已点的品项数量
        raisePrice: pkgItem.raisePrice, // 加价 价格
        isRaiseByQty: pkgItem.isRaiseByQty, // 是否按数量加价
        methodList: pkgItem.methodList ? pkgItem.methodList : [], // 做法
        serveWay: pkgItem.serveWay ? pkgItem.serveWay : null, // 上菜方式
        raisePriceType: this.isShowRaiseMemberPrice(pkgItem) ? 2 : 1, // 加价类型
        raiseMemberPrice: pkgItem.raiseMemberPrice, // 会员加价金额
      };
      this.$set(item, 'apportionFlg', pkgItem.apportionFlg !== false); // 是否参与分摊 true 分摊 false 不分摊 null 分摊
      return item;
    },
    // 套餐的主要信息整理
    creatPkgMain(pkgMainData, pkgSubmitData) {
      pkgSubmitData.isWeighed = pkgMainData.isWeighed ? pkgMainData.isWeighed : false;// 是否称重
      pkgSubmitData.num = pkgMainData.lastQty;// 套餐数
      pkgSubmitData.id = pkgMainData.id;// 套餐的id
      pkgSubmitData.sizeId = pkgMainData.sizeId ? pkgMainData.sizeId : '-1';// 规格id
      pkgSubmitData.isItemTimePrice = pkgMainData.isItemTimePrice; // 是否是时价的判断
      pkgSubmitData.raisePriceType = pkgMainData.raisePriceType;// 加价的类型
      pkgSubmitData.bigClassId = pkgMainData.bigclassid;// 大类id
      pkgSubmitData.smallClassId = pkgMainData.smallClassId;// 小类id
      pkgSubmitData.name = pkgMainData.name;// 套餐名称
      pkgSubmitData.unitId = pkgMainData.unitId;// 单位id
      pkgSubmitData.unitName = pkgMainData.unitName;// 单位名称
      pkgSubmitData.realItemId = pkgMainData.id;
      pkgSubmitData.price = pkgMainData.price;// 套餐单价格
      pkgSubmitData.raisePrice = this.pkgNormalTotalRaisePrice.totalRaisePrice;// 套餐明细下普通加价的总和
      pkgSubmitData.raiseMemberPrice = this.pkgNormalTotalRaisePrice.totalRaiseMemberPrice;// 套餐明细下会员加价的和
      pkgSubmitData.pkgListTotalMakeFee = this.pkgNormalTotalRaisePrice.pkgListTotalMakeFee; // 套餐明细下做法价格的总和
      // 这样判断如果是联动的话不知道给的值是否准确不联动可定是true
      // pkgSubmitData.oldPrice = pkgMainData.price//套餐单价格价格
      if (pkgMainData.origPrice || pkgMainData.origPrice == 0) {
        pkgSubmitData.origPrice = pkgMainData.origPrice;// 单价
      }
      // 促销价格
      if (pkgMainData.promotePrice) {
        pkgSubmitData.promotePrice = pkgMainData.promotePrice;
      }
      pkgSubmitData.discFlg = pkgMainData.discFlg;// 打折
      // 这样判断如果是联动的话不知道给的值是否准确不联动可定是true
      pkgSubmitData.isNotFollowAmount = !!pkgMainData.isNotFollowAmount;// 信息中增加isNotFollowAmount属性，true为套餐明细数量不跟主套餐数量联动，否则均为联动
      if (pkgMainData.memberPrice || pkgMainData.memberPrice == 0) {
        pkgSubmitData.memberPrice = pkgMainData.memberPrice;// 会员价格存在的时候
      }
      pkgSubmitData.salePrice = pkgMainData.salePrice;// 销售价格
    },
  },
  watch: {
    menuSearch() {
      this.destructionItemsPage();
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/pos/fastFood/package.less";
</style>
