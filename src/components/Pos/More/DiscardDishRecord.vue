<template>
  <Dialog
    name="PosDialog.discardDishRecord"
    :title="$t('Biz.UserDesktop.StatisticsOfWasteVegetables')"
    ref="dialog"
    width="900px"
    height="564px"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    @open="onOpen"
    @close="onClose"
    @submit="hadDeleteFunc"
  >
    <div class="pos-dialog-content">
      <div class="ordering-spellfood-wrap">
        <div class="ordering-spellfood-left">
          <div class="ordering-spellfood-list">
            <ul
              id="discardDishBillsPager"
              class="ordering-spellfood-bills"
              ref="discardDishBills">
              <li
                v-for="(item, index) in guestListData"
                :key="index"
                :class="{ active: activeItem && activeItem == item.elId }"
                :ref="item.elId"
                @click="billClickHandler(item)">
                <p class="itemCode">{{ item.code }}</p>
                <div class="item">
                  <span class="itemName">{{ item.bindId ? `[${$t('Biz.Order.SpellFoodText')}]` : '' }}{{ item.sizeName ? ('('+item.sizeName+')'+item.name) : item.name }}</span>
                  <span class="itemMethodPrice">{{ handlerRaisePrice(item.price) }}</span>
                  <span class="itemNum">{{ item.lastQty }}</span>
                </div>
                <p
                  class="itemRemarks"
                  v-if="(item.methodList && item.methodList.length) || item.serveWay">
                  <span>{{$t('Dict.Notes01')}}</span>
                  <span v-if="item.serveWay">{{ item.serveWay.name }}<strong v-if="item.methodList && item.methodList.length">|</strong></span>
                  <span v-for="(method, index) in item.methodList" :key="index">
                      {{ method.name }}{{ method.price ? '(+' + method.price + (method.qty && method.qty!=1 ? 'x'+ method.qty : '') + ')' : '' }}
                      <strong v-if="index !== item.methodList.length - 1">|</strong>
                  </span>
                </p>
              </li>
            </ul>
            <div class="ordering-spellfood-bills-pager">
              <div class="ordering-spellfood-lasttotal">{{$t('Dict.Total01')}}{{ lastTotal }}</div>
              <Pager
                ref="discardDishBillsPager"
                scrollMode="simple"
                pagerId="discardDishBillsPager"
                :animate="200"
                arrowDirection="up-down"
              ></Pager>
            </div>
          </div>
          <div class="ordering-spellfood-btns">
            <button type="button" @click="deleteItem">{{$t('Dict.Btn.DeleteItem')}}</button>
            <button type="button" @click="addItemNum">+</button>
            <button type="button" @click="subtractItemNum">-</button>
            <button type="button" @click="changeHalfNum">{{$t('Dict.Btn.ChangeHalfNum')}}</button>
            <button type="button" @click="changeItemNum">{{$t('Dict.Btn.ChangeItemNum')}}</button>
          </div>
        </div>
        <div class="ordering-spellfood-right">
          <div class="ordering-spellfood-time">
            <span class="demonstration">{{$t('Biz.Pos.More.DiscardRecordSpan1')}}</span>
            <el-date-picker
              v-model="time"
              :disabled="true"
              type="date"
              :placeholder="$t('Dict.SelectionDate')">
            </el-date-picker>
          </div>
          <div class="ordering-spellfood-content">
            <div class="ordering-spellfood-filter">
              <Paging
                :data="smallClasses"
                :active.sync="activeClass"
                :itemWidth="90"
                :itemHeight="55"
                :fix="1"
                :autoActive="false"
                class="ordering-spellfood-filter-list"
                ref="ordingSpellFoodFilterList"
                id="ordingSpellFoodFilterList">
                <button
                  type="button"
                  slot-scope="props"
                  :class="{ 'active': activeClass && props.item.id === activeClass.id }"
                  @click="changeClassFilter(props.item)">
                  {{ props.item.name }}
                </button>
              </Paging>
              <PagingBtn
                ref="ordingSpellFoodFilterPagingBtn"
                class="ordering-spellfood-filter-pager">
              </PagingBtn>
            </div>
            <div class="ordering-spellfood-menus">
              <Paging
                :data="filteredMenus"
                :active.sync="activeMenu"
                :itemWidth="126"
                :itemHeight="86"
                class="ording-spellfood-menu-list"
                ref="ordingSpellFoodMenuList"
                id="ordingSpellFoodMenuList">
                <button
                  type="button"
                  slot-scope="props"
                  :class="{ 'active': props.item.activeId === activeMenu.activeId }"
                  @click="add(props.item)">
                  <div class="c">
                    <span class="code">{{ props.item.code }}</span>
                  </div>
                  <div class="n">{{ props.item.itemName ? props.item.itemName : props.item.name }}</div>
                  <div class="p">{{ props.item.price }}/{{ props.item.unitName }}</div>
                  <div class="count" v-if="props.item.count">{{ props.item.count }}</div>
                </button>
              </Paging>
            </div>
            <div class="ordering-spellfood-control">
              <Search
                ref="spellFoodSearch"
                @search="onSearch"
                :placeholderText="$t('Dict.QuickSearch')"
                searchId="searchSpellFoodMenus"
                class="ordering-spellfood-search"
                :unSearchMode="true"
                :resultLength="filteredMenus.length"
              ></Search>
              <div class="ordering-spellfood-pager">
                <PagingBtn
                  ref="orderingSpellFoodMenuListPagingBtn"
                  :showInfo="true"
                  class="ordering-spellfood-menu-pager">
                </PagingBtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ItemSize
      ref="itemSize"
      @choiceSize="addSize"
      :areaType ="areaType"
      submitId="spellFoodItemSize"
      :isNest="true"
      type="spell"
    ></ItemSize>
    <OrderingChangeNum
      ref="orderingChangeNum"
      :isNest="true"
    ></OrderingChangeNum>
  </Dialog>
</template>

<script>
import {
  filter,
  map,
  each,
  extend,
  concat,
  groupBy,
  reduce,
  first,
  last,
  isString,
  isPlainObject,
  find,
  findLast,
  indexOf,
  times,
  constant,
  isInteger,
} from 'lodash';
import {
  add, sub, multi, zeroize,
} from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import Search from '@/components/Pos/Order/Tables/Search';
import ajax from '@/common/js/ajax';
import LoadScaleMixin from '@/components/Pos/Common/LoadScaleMixin';
import quickSearch from '@/common/js/quicksearch';

// 规格
const ItemSize = (resolve) => {
    import('../Ordering/Menu/ItemSize').then((module) => {
      resolve(module);
    });
};

// 改量
const OrderingChangeNum = (resolve) => {
    import('../Ordering/OrderingBtnsFunc/OrderingChangeNum').then((module) => {
      resolve(module);
    });
};

const tmpArr = [
  {
    activeId: '9800000000005121_-1',
    lastQty: 3,
  },
  {
    activeId: '9800000000005122_-1',
    lastQty: 2,
  },
];

export default {
  components: {
    Dialog,
    Pager,
    Paging,
    PagingBtn,
    ItemSize,
    Search,
    OrderingChangeNum,
  },
  mixins: [DialogMixin, LoadScaleMixin],
  props: {
    areaType: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      activeList: [], // 左侧已登记废菜品项
      activeMenu: {}, // 右侧列表选中的品项
      activeClass: null, // 选中的小类
      activeItem: null, // 左侧列表选中的品项
      searchText: '', // 搜索框查询文字
      time: '', // 当前日期
      posItems: [], // 品项数据
      hadDelete: false, // 是否删除了登记的品项
      posItemSmallClasses: [], // 全部小类
    };
  },
  mounted() {
    // this.init()
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.hadDeleteFunc();
        },
        '↑': () => {
          this.$refs.ordingSpellFoodMenuList.select('↑');
        },
        '↓': () => {
          this.$refs.ordingSpellFoodMenuList.select('↓');
        },
        '←': () => {
          this.$refs.ordingSpellFoodMenuList.select('←');
        },
        '→': () => {
          this.$refs.ordingSpellFoodMenuList.select('→');
        },
        Enter: () => {
          this.add(this.activeMenu);
        },
        BackSpace: () => {
          this.$refs.spellFoodSearch.delWordInBlur();
        },
        ...this.setKeySearchHotKey(),
      };
    },
    quickSearchText() {
      return quickSearch((`${this.searchText}`).toLowerCase());
    },
    // 计算合计
    lastTotal() {
      // 遍历账单，计算价格乘数量
      return reduce(this.activeList, (sum, item) => add(
        sum,
        multi(
          // 价格为菜品价格加做法价格
          add(
            item.price,
            // 判断是否有做法，含有做法遍历所有做法加上加价做法的钱，没有做法为0
            item.methodList && item.methodList.length
            // 遍历做法，计算做法加价，做法价格乘做法数量
              ? reduce(
                item.methodList,
                (methodSum, method) => add(
                  methodSum,
                  multi(method.price, method.qty),
                ),
                0,
              )
              : 0,
          ),
          item.num,
        ),
      ), 0);
    },
    // 过滤出拼菜的菜单
    menu() {
      return filter(this.posItems, item => item.isPackage === false);
    },
    // 菜单的扩展数据
    menus() {
      return map(this.menu, item => extend({}, item, {
        count: this.countByItemId(item, this.activeList),
        maxAddQty: 99,
        minAddQty: 0,
        barcode: item.barcode ? item.barcode : '',
      }));
    },
    // 小类列表
    smallClasses() {
      return concat({
        id: '',
        name: this.$t('Dict.AllSubclass'),
      }, this.computedSmallClasses);
    },
    // 计算小类已选数量
    computedSmallClasses() {
      return filter(this.countByClassId(this.menus), item => item.count > 0);
    },
    // 显示过滤菜单数据
    filteredMenus() {
      return filter(this.menus, item => this.classFilter(item) && this.checkSearchText(item));
    },
    // 分组菜品列表
    groupedList() {
      return groupBy(this.activeList, item => this.getElId(item)); // 根据elId分组
    },
    // 处理分组数据
    guestListData() {
      return this.calcMethodPrice(map(this.groupedList, (item, elId) => extend({}, item[0], {
        elId,
        list: item,
        lastQty: reduce(item, (sum, n) => add(sum, n.num), 0),
        pkgType: item[0].pkgType ? item[0].pkgType : null, // 套餐类型
        serveWay: item[0].serveWay,
        price: item[0].raisePrice ? add(item[0].price, item[0].raisePrice) : item[0].price, // item[0].price 联动回退
        item_type: item[0].itemType,
        salePrice: item[0].raisePrice ? add(item[0].salePrice, item[0].raisePrice) : item[0].salePrice, // item[0].salePrice 联动的回退
        promotePrice: item[0].promotePrice, // item[0].promotePrice 联动的回退
        isItemTimePrice: item[0].isItemTimePrice ? item[0].isItemTimePrice : false,
        raisePrice: item[0].raisePrice ? item[0].raisePrice : 0,
        memberPrice: item[0].raisePrice ? add(item[0].salePrice, item[0].memberPrice) : item[0].memberPrice, // item[0].memberPrice 联动的回退
      })));
    },
  },
  methods: {
    /**
       *  打开时初始化
       */
    onOpen() {
      this.init();
      this.$nextTick(() => {
        this.$refs.orderingSpellFoodMenuListPagingBtn.bind(this.$refs.ordingSpellFoodMenuList); // 右侧品项分页
        this.$refs.ordingSpellFoodFilterPagingBtn.bind(this.$refs.ordingSpellFoodFilterList);
        this.$refs.ordingSpellFoodMenuList.refresh();
      });
    },
    /**
       *  初始化左侧列表和右侧列表
       */
    async init() {
      this.time = this.formatDate();
      const data = await this.getRightDishList();
      this.posItems = this.formatRightDishList(data.items);
      this.posItemSmallClasses = data.itemSmallClasses;
      // this.posItems = this.formatRightDishList(await this.getRightDishList()); // 获取右侧品项列表
      this.activeClass = first(this.smallClasses); // 选中的小类，默认是全部小类
      this.activeList = this.formatLeftDiscarDishList(await this.getLeftDiscardDishList()); // 获取左侧已登记的列表
      this.activeFirstItem(); // 选中第一个右侧品项   this.activeMenu
    },
    /**
       *  获取左侧已登记废菜数据
       */
    async getLeftDiscardDishList() {
      return await ajax('canyin.pos.abandonitem.querycurrentdayabandoneditem').then(res => res);
    },
    /**
       *  格式化左侧已登记废菜数据
       */
    formatLeftDiscarDishList(arr) {
      arr.map((item) => {
        Object.assign(item, {
          activeId: `${item.itemId}_${item.itemSizeId}`,
        });
      });
      return this.formatDiscardDishList([...arr]);
    },
    /**
       *  关联左侧已登记废菜数据的数量,
       */
    formatDiscardDishList(arr) {
      const tmpArr = [];
      const transferObj = this.setArrayToAttr(arr, 'activeId');
      this.menus.map((item) => {
        if (transferObj[item.activeId]) {
          item.num = transferObj[item.activeId].itemAbandonNumber;
          tmpArr.push(item);
        }
      });
      return tmpArr;
    },
    /**
       *  用array[i]里的key值，把array[i]设置为Object的属性 为了不嵌套循环
       *  测试500^2 处理加渲染差距大概4-5倍
       */
    setArrayToAttr(arr, key) {
      const transferObj = Object.create(null);
      arr.map((item) => {
        Object.assign(transferObj, {
          [item[key]]: item,
        });
      });
      return transferObj;
    },
    /**
       *  获取右侧品项数据
       */
    async getRightDishList() {
      return await ajax('canyin.pos.abandonitem.querycurrentdayallitem').then(res => res);
    },
    /**
       *  格式化右侧品项数据
       */
    formatRightDishList(arr) {
      arr.map((item) => {
        Object.assign(item, {
          id: item.itemId, // 菜品真是 ID
          realItemId: item.realItemId, // 菜品真是 ID
          barcode: item.barcode, // 商品条码
          itemId: item.itemId, // 带规格的品项 ID
          sizeId: item.itemSizeId, // 规格 ID
          discFlg: item.discFlg, // 打折状态
          isSellout: item.isSellout === 1, // 是否被估清
          isSingleMethod: item.isSingleMethod, // 专用做法是多选还是单选
          isMultiPrice: item.is_multi_price_plan, // 一菜多价
          activeId: `${item.realItemId}_${item.itemSizeId}`, // 选中状态唯一标识
        });
      });
      return arr;
    },
    /**
       *  提交事件
       */
    onSubmit() {
      if (this.activeList.length && this.activeList.length !== filter(this.activeList, { bindId: null }).length) {
        this.onSubmitAjax();
      } else {
        this.$message.warning(this.$t('Biz.Pos.More.DiscardRecordMsg1'));
      }
    },
    onSubmitAjax() {
      ajax('canyin.pos.abandonitem.abandonitem', {
        contentType: 'paramsEncoded',
        data: this.getAttrFromArray([...this.guestListData]),
      }).then((res) => {
        this.$message.success(res.msg);
        this.close();
      });
    },
    /**
       *  判断是否删除了已登记的废菜
       */
    hadDeleteFunc() {
      if (this.hadDelete) {
        this.onSubmitAjax();
      } else {
        this.onSubmit();
      }
      this.hadDelete = false;
    },
    /**
       *  提交时 格式化要提交的数据
       */
    getAttrFromArray(arr) {
      const tmpArry = [];
      arr.map((item) => {
        const obj = {
          itemId: item.realItemId,
          itemSizeId: item.sizeId,
          itemAbandonNumber: item.lastQty,
          price: item.price,
        };
        tmpArry.push(obj);
      });
      return tmpArry;
    },
    /**
       *  关闭时初清空
       */
    onClose() {
      this.activeList = [];
      this.posItems = [];
      this.activeMenu = {};
      this.$vemit('clearSearch'); // 清除搜索框
    },
    // 根据小类 Id 在 menu 总计算数量
    countByClassId(menus) {
      return map(this.posItemSmallClasses, item => extend({}, item, {
        count: this.countMenuCount(menus, item.id),
      }));
    },
    // 根据小类 Id 计算 menu 中同类菜品数量总和
    countMenuCount(menus, id) {
      return filter(menus, { smallClassId: id }).length;
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
    inputKey(key) {
      this.$refs.spellFoodSearch.addWordInBlur(key);
    },
    // 菜单点击事件
    billClickHandler(item) {
      this.setActiveItem(item.elId);
    },
    // 选中菜 遍历左侧列表 把activeItem的值设置为对应的elId
    setActiveItem(elIdOrItem) {
      if (elIdOrItem) {
        if (isString(elIdOrItem) && find(this.guestListData, { elId: elIdOrItem })) {
          this.activeItem = elIdOrItem;
        } else if (isPlainObject(elIdOrItem)) {
          if (find(this.guestListData, { elId: this.getElId(elIdOrItem) })) {
            this.activeItem = this.getElId(elIdOrItem);
          } else {
            this.setActiveItem();
          }
        }
      } else {
        this.activeItem = this.guestListData.length ? last(this.guestListData).elId : null;
      }
    },
    // 格式化时间
    formatDate() {
      // 转为正常时间字符串
      const date = new Date();
      const year = date.getFullYear();
      const month = addZero(date.getMonth() + 1);
      const day = addZero(date.getDate());
      // 数字不足两位，在前面补0
      function addZero(num) {
        const str = `${num}`;
        if (str.length === 1) return `0${str}`;
        return str;
      }
      return `${year}-${month}-${day}`;
    },
    // 价格显示转化 补零
    handlerRaisePrice(price) {
      return zeroize(price);
    },
    // 拆分 elId
    getActiveItem() {
      if (this.activeItem) {
        const it = this.activeItem.split('.');
        return {
          id: it[0],
          sizeId: it[1],
          discFlg: parseInt(it[2]),
        };
      }
      return null;
    },
    // 控制所选品项，回调返回选中值
    controlActive(handler, onlyLast) {
      const active = this.getActiveItem();
      if (active) {
        let finded = null;
        if (onlyLast) {
          finded = findLast(this.activeList, extend({}, active, { num: 1 }));
          if (!finded) {
            finded = findLast(this.activeList, active);
          }
        } else {
          finded = filter(this.activeList, active);
        }
        if (onlyLast ? finded : finded && finded.length) {
          if (onlyLast) {
            handler(finded);
          } else {
            each(finded, (item) => {
              handler(item);
            });
          }
          this.setActiveItem(active);
        } else {
          // 没有找到该品项
          this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg'));
        }
      } else {
        // 请在账单中选择您要操作的品项
        this.$message.warning(this.$t('Biz.Order.AddOrderWarnMsg'));
      }
    },
    // 加单列表中筛选出 所选品项的列表 这个是个数组 因为把改量和+的都已push的形式添加进去的渲染的时候在Bill文件夹下的List.vue里又新根据lid 和uid重新合并一起
    getActiveList() {
      return filter(this.activeList, this.getActiveItem());
    },
    // 所选品项的总数量
    getActiveCount() {
      return reduce(
        this.getActiveList(),
        (sum, item) => add(sum, item.num),
        0,
      );
    },
    // 删除按钮
    deleteItem() {
      if (this.activeItem) {
        this.controlActive((finded) => {
          this.activeList.splice(indexOf(this.activeList, finded), 1);
        });
        this.hadDelete = true;
      }
    },
    // +1 按钮
    addItemNum() {
      const count = this.getActiveCount();
      if (count < 100) {
        this.controlActive((finded) => {
          if (finded.maxAddQty && count >= finded.maxAddQty) {
            this.$message.warning(this.$t('Biz.Pos.More.DiscardRecordMsg5', [finded.maxAddQty]));
          } else {
            this.activeList.push(extend({}, finded, { num: 1 }));
          }
        }, true);
      } else {
        this.$message.warning(this.$t('Biz.Pos.More.DiscardRecordMsg4'));
      }
    },
    // -1 按钮
    subtractItemNum() {
      this.controlActive((finded) => {
        if (
          finded.num <= 1
            || (finded.minAddQty && finded.num <= finded.minAddQty)
        ) {
          this.activeList.splice(indexOf(this.activeList, finded), 1);
        } else {
          --finded.num;
        }
      }, true);
    },
    // 改量
    changeNum(num) {
      if (num > this.getActiveCount()) {
        const diff = sub(num, this.getActiveCount());
        let willAdd = times(
          parseInt(diff),
          constant(extend({}, last(this.getActiveList()), { num: 1 })),
        );
        willAdd = willAdd.map(item => ({ ...item }));
        if (!isInteger(diff)) {
          willAdd.push(
            extend({}, last(this.getActiveList()), {
              num: sub(diff, parseInt(diff)),
            }),
          );
        }
        this.activeList.push(...willAdd);
      } else if (num && this.getActiveCount() > num) {
        let diff = sub(this.getActiveCount(), num);
        each(this.getActiveList(), (item) => {
          if (diff === 0) {
            return false;
          }
          if (diff >= item.num) {
            this.activeList.splice(indexOf(this.activeList, item), 1);
            diff = sub(diff, item.num);
          } else {
            // 半份的时候
            this.activeList.splice(
              indexOf(this.activeList, item),
              1,
              extend({}, item, { num: sub(item.num, diff) }),
            );
            return false;
          }
          return true;
        });
      }
    },
    // 半份按钮
    changeHalfNum() {
      const item = this.getActiveList()[0];
      if (item.enableHalf && !item.minAddQty) {
        this.changeNum(0.5);
      } else {
        // 此品项不允许半份
        this.$message.warning(this.$t('Biz.Order.CantHalfMessage'));
      }
    },
    // 修改数量按钮
    changeItemNum() {
      const list = this.getActiveList();
      this.$refs.orderingChangeNum.open({
        list,
      }, {
        submit: (num) => {
          this.changeNum(num);
        },
      });
    },
    // 根据 activeId 计算数量
    countByItemId(item, list) {
      return reduce(filter(list, { activeId: item.activeId }), (sum, n) => add(sum, n.num), 0);
    },
    // 获取 elId 用来分组
    getElId(item) {
      return [
        item.id,
        item.sizeId,
        item.discFlg,
      ].join('.');
    },
    // 遍历做法加价，还有合计的计算
    calcMethodPrice(list) {
      return map(list, (item) => {
        if (item.methodList && item.methodList.length) {
          let methodTotal = 0;
          each(item.methodList, (method) => {
            if (method.price) {
              methodTotal = method.isRelaCount
                ? add(methodTotal, multi(multi(method.price, method.qty), item.lastQty))
                : add(methodTotal, multi(method.price, method.qty));
            }
          });
          // 添加 key totalMakeFee 此品项所有做法的价格总额
          item.totalMakeFee = methodTotal;
          item.lastSubtotal = item.discFlg === 1
            ? 0
            : add(item.lastSubtotal, methodTotal);
        }
        return item;
      });
    },
    // 菜单品项点击事件
    add(item) {
      this.activeMenu = item;
      this.addDish({ item, beforeAddNum: 1 });
    },
    // 绑定 elId
    bindElId() {
      return this.getElId(first(this.activeList));
    },
    // 加菜
    addDish({ item, beforeAddNum }) {
      this.$vemit('combo');
      const escaped = extend({
        sizeId: '-1',
        discFlg: 0,
        id: '',
      }, item, {
        num: 1,
        busiType: 1,
        itemType: 1,
      });
        // 进行加单最大最小数量限制
      if (
        (escaped.minAddQty || escaped.maxAddQty)
          && this.limitMaxOrMinQty(escaped, beforeAddNum) === false
      ) {
        return;
      }
      this.activeList.push(escaped); // 左侧列表添加选择的品项
      if (this.activeList.length < 2) {
        this.$refs.discardDishBillsPager.refresh(); // 第一次添加品项的时候刷新分页，不然分页计算不到itemHeight的高度
      }
      this.setActiveItem(escaped);
      // 账单列表滚动到底部
      this.scrollToEnd();
      // 根据设置判断是否清空助记符
      this.$refs.spellFoodSearch.clearSearchText();
    },
    // 账单列表滚动到底部
    scrollToEnd() {
      const box = this.$refs.discardDishBills;
      if (box.scrollHeight > box.clientHeight) {
        box.scrollTop = sub(box.scrollHeight, box.clientHeight);
      }
    },
    // 加单最大最小数量限制: 点击后加单最小数量 加单不允许超过最大限制 (需考虑是否合并品项情况)
    limitMaxOrMinQty(item, beforeAddNum) {
      // 非多规格情况
      if (item.sizeId === -1) {
        // 最小数量限制：第一次加单情况 加最小限制数量的菜 (需考虑加单前数量已设置的情况)
        if (
          item.minAddQty
            && item.count === 0
            && beforeAddNum < item.minAddQty
        ) {
          this.$set(item, 'num', item.minAddQty);
        } else if (
          item.maxAddQty
            && (
              item.count >= item.maxAddQty
              || beforeAddNum + item.count > item.maxAddQty
            )
        ) {
          // 最大数量限制： 品项已点数量与最大限制数量作比较 返回false不执行加菜 (需考虑加单前数量已设置的情况)
          this.$message.warning(this.$t('Biz.Pos.More.DiscardRecordMsg5', [item.maxAddQty]));
          return;
        }
      }
      // 多规格情况
      if (item.sizeId !== -1) {
        // sizeItemList为所选多规格品项的数组 用于判断是否为第一个加此单 和 计算此规格品项的数目sizeItemCount
        const sizeItemList = filter(
          this.activeList,
          it => it.id === item.id && it.sizeId === item.sizeId,
        );
        const sizeItemCount = reduce(
          sizeItemList,
          (sum, item) => add(sum, item.num),
          0,
        );
          // 最小数量限制：第一次加单情况 加最小限制数量的菜 (需考虑加单前数量已设置的情况)
        if (
          item.minAddQty
            && sizeItemList.length === 0
            && beforeAddNum < item.minAddQty
        ) {
          this.$set(item, 'num', item.minAddQty);
        } else if (
          item.maxAddQty
            && (
              sizeItemCount >= item.maxAddQty
              || beforeAddNum + sizeItemCount > item.maxAddQty
            )
        ) {
          // 最大数量限制： 此规格品项已点数量与最大限制数量作比较 返回false不执行加菜 (需考虑加单前数量已设置的情况)
          this.$message.warning(this.$t('Biz.Pos.More.DiscardRecordMsg5', [item.maxAddQty]));
        }
      }
    },
    // 添加规格
    addSize(sizeData) {
      // 渲染规格品项
      if (sizeData) {
        this.addDish({ item: sizeData });
      } else {
        // 没有找到选中的菜品
        this.$message.error(this.$t('Biz.Order.AddOrderErrorMsg10'));
      }
    },
    // 小类筛选切换
    changeClassFilter(cls) {
      this.activeClass = cls;
      this.refreshMenu();
    },
    // 过滤小类筛选
    classFilter(item) {
      if (this.activeClass && this.activeClass.id !== '') {
        return item.smallClassId === this.activeClass.id;
      }
      return true;
    },
    // 根据 code、拼音、名称、条码进行筛选
    checkSearchText(item) {
      if (this.searchText.length) {
        const keyFilters = this.quickSearchText;
        let re = false;
        each(keyFilters, (str) => {
          if (
            item.pinyin.toLowerCase().indexOf(str) !== -1
              || item.name.toLowerCase().indexOf(str) !== -1
              || String(item.code).toLowerCase().indexOf(str) !== -1
              || item.barcode.indexOf(str) !== -1
          ) {
            re = true;
            return false;
          }
          return true;
        });
        return re;
      }
      return true;
    },
    // 快速查找
    onSearch(searchText) {
      this.searchText = searchText.toLowerCase();
      this.refreshMenu();
    },
    // 刷新菜品分页组件
    refreshMenu() {
      this.$refs.ordingSpellFoodMenuList.refresh();
      this.activeFirstItem();
    },
    // 选中第一个
    activeFirstItem() {
      this.activeMenu = first(this.filteredMenus);
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .ordering-spellfood-wrap {
    position: relative;
    height: 100%;
    padding-left: 366px;
    overflow: hidden;
  }

  .ordering-spellfood-left {
    position: absolute;
    left: 0;
    top: 0;
    width: 366px;
    height: 100%;
    padding-right: 56px;
  }

  .ordering-spellfood-list {
    position: relative;
    z-index: 1;
    height: 100%;
    padding-bottom: 49px;
    background-color: #fff;
    border-right: 1px solid #b5b5b5;
    .box-shadow(5px 0 5px rgba(15, 15, 15, .1));
  }

  .ordering-spellfood-bills {
    height: 100%;
    overflow: hidden;

    > li {
      padding-top: 5px;
      padding-bottom: 5px;
      padding-left: 15px;
      padding-right: 15px;
      border-bottom: 1px solid #b5b5b5;
      cursor: pointer;

      > p.itemCode {
        color: #999;
        font-size: 12px;
      }

      > .item {
        position: relative;
        overflow: hidden;

        > span {
          float: left;

          &.itemName {
            width: 130px;
            .text-overflow();
            max-height: 36px;
            line-height: 18px;
            padding: 2px;
          }

          &.itemMethodPrice {
            width: 64px;
            position: absolute;
            bottom: 0;
            left: 140px;
          }

          &.itemNum {
            width: 72px;
            text-align: right;
            position: absolute;
            right: 0;
            bottom: 0;
          }
        }
      }

      > p.itemRemarks {
        color: #0babb9;

        > span > strong {
          font-weight: bold;
          margin: 0 2px;
        }
      }

      &.active {
        background-color: #ddf1f6;
      }

      /*&:first-child {*/
        /*font-weight: bold;*/
        /*color: #0babb9;*/

        /*> p.itemCode {*/
          /*color: #0babb9;*/
        /*}*/
      /*}*/

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .ordering-spellfood-bills-pager {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 49px;
    border-top: 1px solid #b5b5b5;
    padding-top: 6px;
    padding-right: 15px;
    text-align: right;

    > .pos-pager {
      float: right;
    }
  }

  .ordering-spellfood-btns {
    position: absolute;
    right: 0;
    top: 100px;
    width: 56px;
    padding-right: 6px;

    > button {
      display: block;
      width: 100%;
      height: 44px;
      border: none;
      background-color: #fff;
      border-radius: 0 5px 5px 0;
      text-align: center;
      margin-bottom: 2px;
      cursor: pointer;
    }
  }

  .ordering-spellfood-right {
    position: relative;
    height: 99%;
    /*padding-top: 56px;*/
    /*padding-bottom: 58px;*/
    /*border: 1px solid #b5b5b5;*/
    /*background-color: #f5f5f5;*/
  }
  .ordering-spellfood-time {
    margin: 5px 0;
  }
  .ordering-spellfood-content {
    position: relative;
    height: 93%;
    padding-top: 56px;
    padding-bottom: 58px;
    border: 1px solid #b5b5b5;
    background-color: #f5f5f5;
  }
  .ordering-spellfood-filter {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 56px;
    padding-right: 150px;
    background-color: #fff;
    border-bottom: 1px solid #b5b5b5;
  }

  .ordering-spellfood-filter-list {
    width: 100%;
    height: 55px;
    overflow: hidden;

    > li > button {
      position: relative;
      display: block;
      width: 100%;
      height: 55px;
      line-height: 55px;
      border: none;
      background-color: #fff;
      .text-overflow();

      &.active {
        color: #0babb9;

        &:after {
          display: block;
        }
      }

      &:after {
        display: none;
        position: absolute;
        content: '';
        left: 0;
        bottom: 0;
        width: 100%;
        height: 2px;
        background-color: #0babb9;
      }
    }
  }

  .ordering-spellfood-filter-pager {
    position: absolute;
    right: 15px;
    top: 10px;
  }

  .ordering-spellfood-menus {
    height: 100%;
    padding: 4px;
  }

  .ording-spellfood-menu-list {
    height: 100%;
    overflow: hidden;

    > li > button {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      background-color: #fff;
      border: 1px solid #b5b5b5;
      padding: 5px;

      > .c {
        position: absolute;
        left: 5px;
        top: 0;
        height: 18px;
        line-height: 18px;
        font-size: 12px;
        color: #999;

        > span {
          display: inline-block;
          vertical-align: middle;

          &.sellout,
          &.limit {
            padding: 0 6px;
            border-radius: 8px;
            color: @white;
          }

          &.sellout {
            background-color: #ccc;
          }

          &.limit {
            background-color: #ffa71d;
          }
        }
      }

      > .n {
        height: 36px;
        line-height: 18px;
        text-align: left;
        overflow: hidden;
      }

      > .p {
        position: absolute;
        right: 5px;
        bottom: 0;
        font-size: 12px;
      }

      > .count {
        position: absolute;
        right: -4px;
        top: -4px;
        min-width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        font-size: 12px;
        border-radius: 12px;
        background-color: #f24f64;
        color: #fff;
      }

      &.active {
        background-color: rgba(0, 0, 0, .1);
      }
    }
  }

  .ordering-spellfood-control {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 58px;
    padding-left: 5px;
    padding-right: 5px;
    border-top: 1px solid #b5b5b5;
    background-color: #fff;
  }

  .ordering-spellfood-search {
    position: absolute;
    left: 15px;
    top: 10px;
  }

  .ordering-spellfood-pager {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>

<style lang="less">
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .ording-spellfood-menu-list > li {
    float: left;
    width: 126px;
    height: 86px;
    padding: 4px;
  }

  .ordering-spellfood-filter-list > li {
    float: left;
    width: 90px;
    height: 55px;
  }

  .ordering-spellfood-search > .pos-order-tables-search {
    background-color: @white;
    border: 1px solid #c8c8c8;
  }

  .ordering-spellfood-lasttotal {
    float: left;
    padding-left: 15px;
    line-height: 36px;
  }
</style>
