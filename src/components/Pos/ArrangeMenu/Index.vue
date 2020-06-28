<template>
  <Dialog
    name="PosDialog.ArrangeMenu"
    :title="title"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    top="auto"
    width="1024px"
    height="100%"
    maxHeight="768px"
    customClass="moudel-center"
    :hotkeys="hotKeySet"
  >
    <!-- 指定width和height固定模态框尺寸, 非全屏显示-->
    <template slot="other-button" v-if="isMainShow">
      <!-- 按钮:新建 -->
      <button
        type="button"
        id="createArrangeMenuDOMId"
        class="btn btn-default top-button topButton"
        @click="createArrangeMenu"
        v-autotest
      >{{ $t('Dict.NewlyBuild') }}(F1)</button>
      <!-- 修改 -->
      <button
        type="button"
        id="changeArrangeMenuDOMId"
        class="btn btn-default top-button topButton"
        @click="changeArrangeMenu"
        v-autotest
      >{{ $t('Dict.Modify') }}(F2)</button>
      <!-- 删除 -->
      <button
        type="button"
        id="deleteArrangeMenuDOMId"
        class="btn btn-default top-button topButton"
        @click="deleteArrangeMenu"
        v-autotest
      >{{ $t('Dict.Btn.DeleteItem') }}(F3)</button>
      <!-- 关联 -->
      <button
        type="button"
        id="doneBookingOfArrangeMenuDOMId"
        class="btn btn-default top-button topButton"
        @click="doneArrangeMenu"
        v-autotest
        v-if="openType === 'booking'"
      >{{ $t('Biz.ArrangeMenu.Relate') }}(F5)</button>
      <!-- 打印 -->
      <button
        type="button"
        id="printArrangeMenuDOMId"
        class="btn btn-primary top-button topButton"
        @click="printArrangeMenu"
        v-autotest
      >{{ $t('Dict.Printing') }}(PgDn)</button>
    </template>
    <!-- 下单/预订 启调页面 显示用的按钮 -->
    <template slot="other-button" v-if="!isMainShow">
      <!-- 修改 -->
      <button
        type="button"
        id="changeArrangeMenuDOMId"
        class="btn btn-default top-button topButton"
        @click="changeArrangeMenu"
        v-show="openType === 'booking'"
        v-autotest
      >{{ $t('Dict.Modify') }}(F2)</button>
      <button
        type="button"
        id="doneArrangeMenuDOMId"
        class="btn btn-primary top-button topButton"
        @click="doneArrangeMenu"
        v-autotest
      >{{ $t('Dict.PlaceAnOrder') }}(PgDn)</button>
    </template>
    <!-- 排菜单类型 普通和全部(含预订)切换 -->
    <div class="wrap">
      <!-- 左侧 -->
      <div class="arrangeMenu-list-box">
        <!-- 类型过滤功能, 暂不上线, 不显示 -->
        <div class="select-box">
          <!-- 排菜单类型过滤： -->
          <span class="select-box-title">{{ $t('Biz.ArrangeMenu.MenuFilteType') }}</span>
          <span>
            <el-select size="small" v-model="switchMenuType" @change="menuTypeCommand">
              <el-option
                v-for="item in menuTypeData"
                :key="item.type"
                :label="item.name"
                :value="item.type"
              ></el-option>
            </el-select>
          </span>
        </div>
        <div class="list">
          <ul class="list-row arrangeMenu-list-title">
            <!-- 排菜单名称 -->
            <li class="list-row-item">{{ $t('Biz.ArrangeMenu.ArrangeMenuName') }}</li>
            <!-- 价格 -->
            <li class="list-row-item">{{ $t('Dict.Price') }}</li>
            <!-- 桌数 -->
            <li class="list-row-item">{{ $t('Dict.TableNumber01') }}</li>
            <!-- 备注 -->
            <li class="list-row-item">{{ $t('Dict.Remarks') }}</li>
            <!-- 预订信息 -->
            <li class="list-row-item">{{ $t('Biz.ArrangeMenu.BookedInfo') }}</li>
            <!-- 套餐模板 -->
            <li class="list-row-item" v-if="isOldArrange">{{ $t('Dict.PkgModel') }}</li>
          </ul>
          <div
            class="list-row arrangeMenu-list-detailWrap"
            v-for="(item, index) in allItemList"
            :key="index"
            @click="arrangeMenuListActive(item, index)"
            :class="{'list-active': menuActiveItemIndex === index }"
          >
            <p class="list-row arrangeMenu-list-detail">
              <span class="list-row-item">{{ item.name }}</span>
              <span class="list-row-item">{{ item.itemPrice }}</span>
              <span class="list-row-item">{{ Number(item.tableNum) }}</span>
              <span class="list-row-item">{{ item.remark }}</span>
              <span class="list-row-item" :class="isOldArrange ? '' : 'isNoTemplate' ">{{ item.orderContent ? item.orderContent : '' }}</span>
              <span class="list-row-item" v-if="isOldArrange">{{ item.itemName }}</span>
            </p>
          </div>
        </div>
        <!-- 分页 -->
        <div class="arrangeMenu-list-pagerBox">
          <!-- 关键词搜索框 -->
          <div class="queryKeyWord">
            <em class="icon icon-fangdajing"></em>
            <input
              type="text"
              v-model.trim="keyword"
              @keydown.enter="searchMenu"
              :placeholder="$t('Dict.QuickSearch')"
            >
            <span></span>
            <div
              id="arrangeMenu-clearSearchBtn"
              class="clearSearch el-icon-close"
              v-show="!!keyword.length"
              @click="clearSearch"></div>
          </div>
          <div class="pagerBtn-box">
            <p class="pagerBtn-pageNum">{{
              $t('Dict.PageStyle.Text1', {
                length: totalListNum,
                currentPage: currentPageNum,
                totalPage: allPageNum,
              })
            }}</p>
            <p class="pagerBtn-btn">
              <span class="pagerBtn-upBtn icon icon-pager-up" @click="turnPageUp"></span>
              <span class="pagerBtn-downBtn icon icon-pager-down" @click="turnPageDown"></span>
            </p>
          </div>
        </div>
      </div>
      <!-- 右侧 -->
      <div class="arrangeMenu-detail-box">
        <!-- 显示隐藏容器 -->
        <div v-if="activeDetailOfList.length">
          <!-- 套餐菜品明细 -->
          <div class="detail-title">
            {{ $t('Biz.ArrangeMenu.PkgItemDetails') }}
            <em class="detail-title-pkgName" v-if="isOldArrange">{{ pkgDetailName }}</em>
          </div>
          <!-- 指定标题 -->
          <div class="detail-caption detail-row">
            <!-- 菜品 -->
            <span class="detail-row-item">{{ $t('Dict.Dishes') }}</span>
            <!-- 数量 -->
            <span class="detail-row-item">{{ $t('Dict.Amount') }}</span>
            <span class="detail-row-item">{{ $t('Dict.AuxiliaryUnitQty') }}</span>
            <!-- 单价 -->
            <span class="detail-row-item">{{ $t('Dict.UnitPrice') }}</span>
            <!-- 小计 -->
            <span class="detail-row-item">{{ $t('Dict.Subtotal') }}</span>
          </div>
          <!-- 列表详情内容 块1 -->
          <div class="detail-content" :id="arrangeMenuDetailId">
            <div
              class="detail-content-box"
              v-for="item in activeDetailOfList"
              :key="item.itemClassId"
            >
              <p class="detail-content-typeData">
                <span>{{ item.itemClassName }}</span>
                <span>{{ Number(item.qty) }}</span>
                <span>{{ Number(item.total) }}</span>
              </p>
              <div class="detail-content-list">
                <ul class="detail-row" v-for="el in item.items" :key="el.id">
                  <li class="detail-row-item">
                    {{
                      el.itemType === 2
                      ? '['+$t('Dict.Temporary')+']'
                      : ''
                    }}
                    {{
                      el.itemSizeId !='-1'
                      ? '('+el.sizeName+')'+el.itemName
                      : el.itemName
                    }}
                  </li>
                  <li class="detail-row-item">{{ Number(el.qty)+el.unitName }}</li>
                  <li class="detail-row-item">{{ Number(el.auxiliaryUnitQty)+el.auxiliaryUnitName || '' }}</li>
                  <li class="detail-row-item">{{ Number(el.salePrice) }}</li>
                  <li class="detail-row-item">
                    {{ workOutInfo(el.qty, el.salePrice, 'multi') }}
                    <em v-if="el.pkgList" class="pkg-name-cls">
                      {{ $t('Dict.Package') }}
                    </em>
                    <em
                      v-if="discFlgdata[+el.discFlg]"
                      :class="discFlgdata[+el.discFlg] ? discFlgdata[+el.discFlg].className : ''"
                    >
                      {{discFlgdata[+el.discFlg] ? discFlgdata[+el.discFlg].text : ''}}
                    </em>
                  </li>
                  <!-- 做法: 单独回行 -->
                  <li class="detail-row-item" v-show="el.methodText">{{ `${$t('Dict.Notes01')}: ${el.methodText} `}}</li>
                  <ul v-show="el.pkgList && el.pkgList.length" class="pkg-list-content">
                    <li
                      v-for="(list, index) in el.pkgList"
                      :key="index"
                    >
                      <p>
                        <i data-v-c7bd95f2="" class="icon icon-dian1"></i>
                        <span>
                          {{
                            list.itemType === 2
                            ? '['+$t('Dict.Temporary')+']' + list.itemName
                            : list.itemSizeId !='-1'
                              ? '('+list.sizeName+')'+list.itemName
                              : list.itemName
                           }}
                        </span>
                        <span>{{ Number(list.qty) }}{{list.unitName}}</span>
                        <span>
                          {{
                             list.auxiliaryUnitId ? Number(list.auxiliaryUnitQty)+list.auxiliaryUnitName : ''
                          }}
                        </span>
                        <span>{{ Number(list.salePrice) }}</span>
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
                              v-for="(method, i) in list.methodList"
                              >
                              {{ i === 0 ? method.name:` | ${method.name}` }}
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
                </ul>
              </div>
            </div>
            <!-- 合计 -->
            <div class="detail-content-total">
              <span>{{$t('Dict.Total')}}</span>
              <span>{{ activeDetailSum }}</span>
              <span>{{ fillFloat(activeDetailTotal) }}</span>
            </div>
          </div>
          <!-- 分页按钮 -->
          <Pager
            class="arrangeMenuDetailPager"
            :pagerId="arrangeMenuDetailId"
            itemTag=".detail-content-box"
            scrollMode="simple"
            arrowDirection="up-down"
            ref="arrangeMenuDetailPager"
          ></Pager>
        </div>
        <!-- 空白页 -->
        <div class="noneInfo" v-else>
          <p class="noneInfo-logo icon icon-lack"></p>
          <p class="noneInfo-txt">
            <!-- 暂无信息 -->
            <span>{{ $t('Dict.NoInfo') }}</span>
            <!-- 请从左侧选择相应套餐 -->
            <span>{{ $t('Biz.ArrangeMenu.ChoosePkgFromLeft') }}</span>
          </p>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { isEmpty, cloneDeep } from 'lodash';
import { MessageBox } from 'element-ui';
import ajax from '@/common/js/ajax';
// import quickSearch from '@/common/js/quicksearch';
import Pager from '@/components/Pos/Common/Pager';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationScrollMixin';
import * as Algorithm from '@/common/js/math';
import { mapGetters } from 'vuex';

export default {
  components: { Pager, Dialog },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      // 是否 排菜主功能打开页面(或是 下单/预订 调用打开排菜单页面), 是否显示'新建/复制..'等按钮
      isMainShow: false,
      openType: '',
      // 切换排菜单列表数据类型(全部 线下(不含预订))
      switchMenuType: 0,
      menuTypeData: [
        { name: this.$t('Dict.All'), type: 0 }, // 全部
        { name: this.$t('Dict.SaleType.ForHere'), type: 1 }, // 堂食
        { name: this.$t('Dict.SaleType.Booking'), type: 2 }, // 预订
      ],
      // 搜索关键字
      keyword: '',
      // 左侧分页数据
      everyPageListNum: 13, // 列表每页条数
      totalListNum: 1, // 总条数
      allPageNum: 1, // 总页数
      currentPageNum: 1, // 当前页数
      // 套餐详情 分页id
      arrangeMenuDetailId: 'arrangeMenuDetailId',
      // 排菜单明细部分 顶部标题
      pkgDetailName: '',
      // 全部品项列表
      allItemList: [],
      // 排菜单列表激活项
      menuActiveItem: '',
      // 排菜单列表激活项的索引
      menuActiveItemIndex: '',
      // 显示品项列表 选中项的明细
      activeDetailOfList: [],
      activeDetailSum: 0, // 列表详情的总数
      activeDetailTotal: 0, // 列表详情的总价
      title: this.$t('Biz.ArrangeMenu.ArrangeMenu'), // 弹框的title名称
      discFlgdata: [
        { text: '', className: '' },
        { text: '赠', className: 'give-cls' },
        { text: '折', className: 'discount-cls' },
        { text: this.$t('Dict.Change'), className: 'change-cls' },
      ], // 标识的显示 0 - '',1-赠送 2-打折 -3-变价
    };
  },
  computed: {
    ...mapGetters([
      'posInfo',
    ]),
    // 是否是老的预定单模式 老的排菜单是宴会排菜模式 新的是单品排菜模式
    isOldArrange() {
      return this.posInfo.putItemsMode !== '1';
    },
    // 快捷键
    hotKeySet() {
      return {
        F1: () => {
          this.createArrangeMenu();
        },
        F2: () => {
          this.changeArrangeMenu();
        },
        F3: () => {
          this.deleteArrangeMenu();
        },
        // 预订单打开排菜单, 关联(执行)按钮快捷处理
        F5: () => {
          if (this.resData.openType === 'booking') {
            this.doneArrangeMenu();
          }
        },
        PgDn: () => {
          if (this.isMainShow) {
            this.printArrangeMenu();
          } else {
            // 排菜单下单
            this.doneArrangeMenu();
          }
        },
      };
    },
  },
  mounted() {
    this.$von('reloadData', () => {
      // 其他组件 更新排菜单主列表信息(不可执行init函数)
      this.queryMenuList(1, false);
    });
  },
  methods: {
    onOpen() {
      // 并且, 判断打开页面类型(从什么位置打开: 下单-addOrder or 预订-booking), 根据参数显示不同按钮名称和功能
      this.openType = this.resData.openType;
      // 判断当前可视区小于768时候分页的一页显示为11
      if (window.innerHeight < 760) {
        this.everyPageListNum = 11;
      } else {
        this.everyPageListNum = 13;
      }
      // 打开时, 根据传值判断按钮显示状态
      if (this.resData.showBtn) {
        this.isMainShow = true;
        this.title = this.$t('Biz.ArrangeMenu.ArrangeMenu');
      } else {
        this.title = this.$t('Biz.ArrangeMenu.ArrangeMenuBill');
        this.isMainShow = false;
        // 并且, 判断打开页面类型(从什么位置打开: 下单-addOrder or 预订-booking), 根据参数显示不同按钮名称和功能
        this.openType = this.resData.openType;
      }
      // 如果是 预订打开的业务窗口
      if (this.resData.openType === 'booking') {
        this.title = this.$t('Biz.ArrangeMenu.ArrangeMenuBill');
      }
      this.initData('init');
    },
    // 初始化 加载接口数据
    initData(msg) {
      // 初始化 加载数据
      this.queryMenuList(1, false, msg);
      // 初始化下右侧显示套餐明细显示的数据
      this.activeDetailOfList = [];
      //
    },
    // 查找排菜单列表数据
    queryMenuList(pageType, isTurnPage, isInit) {
      const keywordTest = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/g;
      // 非首页 空数据查询 提示
      if (!(this.keyword !== '' && !keywordTest.test(this.keyword))) {
        ajax('canyin.pos.arrangemenubase.menutemps', {
          params: {
            // 排菜单类型: 1-线下(当餐), 2-线上(预订)
            type: this.switchMenuType,
            searchText: this.keyword, // 查找文本信息
            pageSize: this.everyPageListNum, // 分页-条数
            pageNo: pageType || this.currentPageNum, // 分页-页码
          },
        }).then((data) => {
          if (!isEmpty(data)) {
            // 列表数据
            this.allItemList = data.bizMenuTemps;
            // 重置激活项
            this.menuActiveItemIndex = '';
            // 总条数
            this.totalListNum = data.bizMenuTempsTotal;
            // 分页页码计算
            this.computeListPagerData(isTurnPage);
            // 重置明细列表
            this.activeDetailOfList = [];
          } else {
            if (isInit !== 'init') {
              this.$message.warning({
                message: this.$t('Biz.ArrangeMenu.NoValidInfo'),
                customClass: 'arrangeMenu-message-top',
              });
            }
            // 列表数据
            this.allItemList = [];
            // 总条数
            this.totalListNum = 0;
            // 分页页码计算
            this.computeListPagerData(isTurnPage);
            // 重置明细列表
            this.activeDetailOfList = [];
          }
        })
          .catch((code, msg) => {
            // this.close()
            MessageBox.alert(msg, this.$t('Dict.WrongInfo'));
          });
      } else {
        this.$message.error({
          // 快速查找内容不可用！
          message: this.$t('Biz.ArrangeMenu.QuickSearchDisabled'),
          customClass: 'arrangeMenu-message-top',
        });
      }
    },
    // 补足小数点两位方法
    fillFloat(val) {
      // 小数点后两位补足方法, 但是超过小数点两位不在处理范围之内
      const int = `${parseInt(val, 0) || 0}`;
      let float = '';
      const fractionalPart = (`${val}`).split('.')[1];
      // 不含浮点
      if ((`${val}`).indexOf('.') === -1) {
        float = '.00';
      } else if ((`${val}`).split('.')[1].length === 1) {
        float = `.${fractionalPart}0`;
      } else {
        float = `.${fractionalPart}`;
      }
      // 返回整数和浮点部分(字符串)
      return int + float;
    },
    // 详情明细 单条数据-"小计"的计算, 精确到小数点后两位
    workOutInfo(num1, num2, method) {
      return this.fillFloat(Algorithm.round(Algorithm[method](num1, num2), 2));
    },
    // 查找排菜单详情
    queryMenuDetail() {
      ajax('canyin.pos.arrangemenubase.findmenudetail', {
        params: {
          menuTempId: this.menuActiveItem.id,
        },
      })
        .then((data) => {
          if (!isEmpty(data)) {
            this.activeDetailOfList = data;
            // 计算总数和总价: 清空后再求和
            this.activeDetailSum = 0;
            this.activeDetailTotal = 0;
            this.activeDetailOfList.forEach((_) => {
              this.activeDetailSum = Algorithm.add(this.activeDetailSum, _.qty);
              this.activeDetailTotal = Algorithm.add(this.activeDetailTotal, _.total);
            });
            // // 延后刷新分页
            // setTimeout(() => {
            //   this.$refs.arrangeMenuDetailPager.refresh();
            // }, 100);
          } else {
            this.activeDetailOfList = [];
            // 计算总数和总价: 清空后再求和
            this.activeDetailSum = 0;
            this.activeDetailTotal = 0;
            // // 延后刷新分页
            // this.$refs.arrangeMenuDetailPager.refresh();
            // 第三方预订菜品未绑定或菜品规格不匹配，请前往检查
            MessageBox.alert(this.$t('Biz.ArrangeMenu.O2OBookedItemDisabled'), this.$t('Dict.WrongInfo'));
          }
          // 延后刷新分页
          setTimeout(() => {
            this.$refs.arrangeMenuDetailPager.refresh();
          }, 100);
        })
        .catch((code, msg) => {
          // this.close()
          // WrongInfo错误
          MessageBox.alert(msg, this.$t('Dict.WrongInfo')).then(() => {}).catch(() => {});
        });
    },
    onClose() {
      // 清空参数
      this.isMainShow = false;
      this.switchMenuType = 0;
      this.keyword = '';
      this.menuActiveItem = '';
      this.menuActiveItemIndex = '';
      // 不用这里做清空
      // this.allItemList = [];
      // this.activeDetailOfList = [];

      this.totalListNum = 1;
      this.allPageNum = 1;
      this.currentPageNum = 1;
    },
    // 排菜单列表数据类型(下拉菜单)
    menuTypeCommand() {
      // 查找数据
      this.queryMenuList(1, false);
    },
    // 排菜单列表 选中
    arrangeMenuListActive(item, index) {
      if (this.menuActiveItemIndex !== index) {
        this.menuActiveItem = item;
        this.menuActiveItemIndex = index;
        // 延后执行 方式提前渲染
        setTimeout(() => {
          this.queryMenuDetail();
          this.pkgDetailName = this.menuActiveItem.itemName;
        }, 0);
      }
    },
    // 进入新建、修改排菜的界面根据arguments 来判断是否有参数
    enterArrangeMenuDetailModule(needArrangeMenuData) {
      // 保留排菜单列表页,不关闭, 解决两个页面切换时,其之间空隙时间的画面闪烁, 露出背景画面的问题
      // this.close()
      if (needArrangeMenuData) {
        this.$emit('openArrangeMenuDetail', needArrangeMenuData);
      } else {
        this.$emit('openArrangeMenuDetail');
      }
    },
    // 新建
    createArrangeMenu() {
      this.enterArrangeMenuDetailModule();
    },
    // 修改
    changeArrangeMenu() {
      if (this.canExecuted()) {
        const tmpArr = cloneDeep(this.activeDetailOfList);
        // 修改时, 调整数据中的字段名(替换对象中的属性名)
        const newArr = JSON.parse(
          JSON.stringify(
            JSON.parse(JSON.stringify(tmpArr).replace(/salePrice/g, 'price')),
          ).replace(/itemName/g, 'name'),
        );
        const needArrangeMenuData = {
          openType: 'change',
          avtiveMenuItem: this.menuActiveItem,
          avtiveMenuItemDetail: newArr,
        };
        // 执行跨页面传值
        this.enterArrangeMenuDetailModule(needArrangeMenuData);
      }
    },
    // 各按钮功能 执行前校验
    canExecuted() {
      if (!this.menuActiveItem) {
        this.$message.error({
          // 请先选中左侧列表中需要操作的排菜单
          message: this.$t('Biz.ArrangeMenu.ChooseMenuBillFromLeft'),
          customClass: 'arrangeMenu-message-top',
        });
        return false;
      }
      return true;
    },
    // 删除
    deleteArrangeMenu() {
      if (this.canExecuted()) {
        /**
         * 删除逻辑:
         * 排菜单(非线上预订), 均可删除;
         * 增值业务(食尚订, 客必得), 也能删除排菜单;
         * ## 但是, 后台(接口)执行: 判断排菜单关联的预订单的业务状态(未执行 || (开台 && 未结算)), 符合的(后台)阻拦.
         */
        if (!isEmpty(this.menuActiveItem.orderContent)) {
          // 该排菜单已关联预订单，是否确定删除？
          this.$confirm(this.$t('Biz.ArrangeMenu.DeleteOfRelatedMenu'), this.$t('Dict.Tips'), {
            distinguishCancelAndClose: true,
            type: 'warning',
          }).then(() => {
            // 执行删除, 并传入回调
            this.deleteInterface(() => {
              this.$vemit('selectedArrangeMenuBus', null);
            });
          });
        } else {
          this.deleteInterface();
        }
      }
    },
    // 删除 执行的ajax: callback-传入的回调
    deleteInterface(callback) {
      ajax('canyin.pos.arrangemenubase.domenutempremove', {
        params: {
          menuTempId: this.menuActiveItem.id,
        },
      }).then(() => {
        this.$message.success({
          message: this.$t('Dict.DeleteSuccess'),
          customClass: 'arrangeMenu-message-top',
        });
        this.queryMenuList(1, false);
        if (callback) { callback(); }
      });
    },
    // 打印
    printArrangeMenu() {
      if (this.canExecuted()) {
        ajax('canyin.pos.arrangemenubase.menutempprint', {
          params: {
            menuTempId: this.menuActiveItem.id,
            type: this.menuActiveItem.type,
          },
        }).then((res) => {
          if (isEmpty(res)) {
            this.$message.success({
              message: this.$t('Dict.PrintSuccess'),
              customClass: 'arrangeMenu-message-top',
            });
          }
        });
      }
    },
    // 执行(下单-点菜 / 关联-预订)
    doneArrangeMenu() {
      if (this.canExecuted()) {
        // 加单的下单事件
        if (this.openType === 'addOrder') {
          this.doAddArrangeMenu();
        } else {
          /**
           * 关联 预订单(新建/修改), 传递当前选中排菜单数据
           * 排除 重复关联问题
           * 1.若 '新建预订单'(this.resData.bookedOfMenu为null), 或'修改预订单'(this.resData.bookedOfMenu.id有值)
           * ## 只能关联 未被预订关联的排菜单(this.menuActiveItem.orderContent为false),
           * 2.若 '修改预订单'(this.resData.bookedOfMenu.id有值), 删除(非 提交删除)已关联排菜单后,
           * ## 重新关联 原有排菜单(刚删除的排菜单, 排菜单原存储的预订单id:this.menuActiveItem.orderId), 是允许的
           * 以上两种情况, 无论排菜单已关联的预订单的状态如何, 均不可! 除非从预订单(可操作的)解除与该排菜单的关联关系!
          */
          if (!isEmpty(this.menuActiveItem.orderContent)
            && (isEmpty(this.resData.bookedOfMenu)
              || this.menuActiveItem.orderId !== this.resData.bookedOfMenu.id)
          ) {
            // 该排菜单已经关联预订单, 不可重复关联
            this.$alert(this.$t('Biz.ArrangeMenu.DontRelateOfRelatedMenu'), this.$t('Dict.Tips'), {
              dangerouslyUseHTMLString: true,
            });
            return false;
          }
          // 执行选中项, 返回给预订单页面
          this.$vemit('selectedArrangeMenuBus', this.menuActiveItem);
          // 延迟关闭当前页面
          setTimeout(() => {
            this.close();
          }, 0);
        }
      }
      return true;
    },
    // 整理需要的数据
    // handleSingleData() {
    //   const items = [];
    //   this.activeDetailOfList.forEach((list) => {
    //     list.items.forEach((item) => {
    //       items.push({
    //         itemId: item.itemId,
    //         itemSizeId: item.itemSizeId,
    //         qty: item.qty,
    //         itemName: item.itmeName,
    //       });
    //     });
    //   });
    //   return items;
    // },
    // 下单
    doAddArrangeMenu() {
      // menuMode模式类型  '1' -单品模式 ，'0'宴会套餐模版模式
      if (this.menuActiveItem.menuMode === '1') {
        this.$vemit('doneArrangeMenuOrder', {
          pkgItemData: {
            detailOfList: this.activeDetailOfList, // 排菜类和菜品数据
            price: Number(this.menuActiveItem.itemPrice), // 模板套餐的显示价格
            remark: this.menuActiveItem.remark, // 排菜单的加单备注
            menuMode: '1',
          },
          callBack: () => {
            this.close();
          },
        });
        return false;
      }
      // 套餐模板的是否存在的校验以及存在话获取是否是联动判断标识
      ajax('canyin.pos.arrangemenubase.checkitemtemp', {
        params: {
          tempItemId: this.menuActiveItem.itemId,
        },
      }).then((res) => {
        this.$vemit('doneArrangeMenuOrder', {
          pkgItemData: {
            itemId: this.menuActiveItem.itemId, // 模板套餐的品项id
            detailOfList: this.activeDetailOfList, // 模板套餐的明细分类组和组内的数据
            salePrice: Number(this.menuActiveItem.itemPrice), // 模板套餐的销售价格
            price: Number(this.menuActiveItem.itemPrice), // 模板套餐的显示价格
            remark: this.menuActiveItem.remark, // 排菜单的加单备注
            name: this.menuActiveItem.itemName, // 排菜模板的名称
            isNotFollowAmount: res ? res.isNotFollowAmount : false, // 排菜模板的联动与不联动判断
            menuMode: '0',
          },
          callBack: () => {
            this.close();
          },
        });
      });
      return false;
    },
    // 查找
    searchMenu() {
      // 查找数据
      this.queryMenuList(1, false);
    },
    clearSearch() {
      this.keyword = '';
      this.searchMenu();
    },
    // 上翻页
    turnPageUp() {
      if (!(this.currentPageNum <= 1)) {
        // 减页码
        this.currentPageNum -= 1;
        // 加载列表数据
        this.queryMenuList(this.currentPageNum, true);
      }
    },
    // 下翻页
    turnPageDown() {
      if (!(this.currentPageNum >= this.allPageNum)) {
        // 加页码
        this.currentPageNum += 1;
        // 加载列表数据
        this.queryMenuList(this.currentPageNum, true);
      }
    },
    // 分页数据计算
    computeListPagerData(isTurnPage) {
      // 总页数
      this.allPageNum = Math.ceil(this.totalListNum / this.everyPageListNum);
      // 当前页数: 如果不是翻页, 重置页码
      if (!isTurnPage) {
        this.currentPageNum = 1;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "../Booking/BookingCommon/common.less";

.select-box {
  margin: 8px 16px;
  .select-box-title {
    margin-right: 11%;
    font-size: 15px;
    font-weight: bold;
  }
}

.wrap {
  width: 100%;
  height: 100%;
  font-size: 0;
}

.switchMenuTypeBtn {
  position: absolute;
  left: 150px;
  top: 0;
  bottom: 0;
  margin: auto;
}

.arrangeMenu-list-box {
  width: 57.8%;
  height: 100%;
  position: relative;
  display: inline-block;
  vertical-align: top;
  background-color: #fff;
}

.arrangeMenu-detail-box {
  width: 42.2%;
  height: 100%;
  position: relative;
  display: inline-block;
  vertical-align: top;
  padding: 16px 4px;
  background-color: #f5f5f5;
  box-shadow: inset 2px -2px 6px 0 #666;
}

@list-row-item-width: 10%;
.list {
  width: 100%;
  font-size: 0;

  // 1期不上线 排菜单过滤功能, 样式被隐藏 暂试着列表顶部距离, 2期需要删除
  // padding-top: 26px;
  // end

  .list-row {
    width: 100%;
    font-size: 0;

    .list-row-item {
      display: inline-block;
      text-align: left;
      overflow: hidden;
      padding: 0px 4px;
      font-size: 14px;
      white-space: nowrap;
      line-height: 1.2;
      &:nth-child(5),
      &:nth-child(6) {
        width: @list-row-item-width * 2;
      }
      &:nth-child(4) {
        width: @list-row-item-width;
      }
      &:nth-child(3) {
        width: @list-row-item-width * 1.5;
      }
      &:nth-child(2) {
        width: @list-row-item-width * 1.5;
      }
      &:nth-child(1),
      &:nth-child(7) {
        width: @list-row-item-width * 1.6;

      }
      &.isNoTemplate {
        width: @list-row-item-width * 3.6;
      }
    }
  }
}

.list-row.arrangeMenu-list-title {
  width: calc(100% - 32px);
  margin: 0 16px;
  .bgc(#7bcad6);
  display: flex;
  align-items: center;
  min-height: 30px;
  li{
    position: relative;
  }
  .list-row-item {
    color: #fff;

    &:not(:first-child):before {
      content: "";
      display: inline-block;
      width: 1px;
      height: 11px;
      margin-right: 5px;
      background: #fff;
      position: absolute;
      transform: translate(0,-50%);
      top: 50%;
      left: 0;
    }
  }
}

@arrangeMenu-list-detail-height: 45.9px;

.arrangeMenu-list-detailWrap {
  height: @arrangeMenu-list-detail-height;
  padding: 0 16px;
  line-height: @arrangeMenu-list-detail-height;
  cursor: pointer;

  &.list-active {
    .bgc(#ddf1f6);
  }
}

.list-row.arrangeMenu-list-detail {
  height: @arrangeMenu-list-detail-height;
  border-bottom: 1px solid #b5b5b5;
  display: flex;
  align-items: center;
  .list-row-item {
    padding: 0px 8px;
  }
}

.arrangeMenu-list-pagerBox {
  position: absolute;
  width: 100%;
  height: 50px;
  bottom: 0;
  font-size: 14px;
  border-top: 1px solid #b5b5b5;
  .bgc(#fff);
}

.detail-title {
  font-size: 14px;
  margin-bottom: 10px;

  > .detail-title-pkgName {
    font-style: normal;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-left: 8px;
  }
}

@detail-row-item-width: 15%;

.detail-row {
  width: 100%;

  .detail-row-item {
    display: inline-block;
    text-align: left;
    overflow: hidden;
    padding: 0px 4px;
    font-size: 14px;
    white-space: nowrap;

    &:nth-child(1) {
      width: @detail-row-item-width * 2.1;
      padding: 0 6px 0 14px;
    }
    &:nth-child(2) {
      width: @detail-row-item-width * 0.932;
      padding: 0 4px;
    }
    &:nth-child(3) {
      width: @detail-row-item-width * 1;
      padding: 0px;
    }
    &:nth-child(4) {
      width: @detail-row-item-width * 1.2;
      padding: 0 4px;
    }
    &:nth-child(5) {
      width: 21.12%;
      padding: 0px;
    }
    // 设置为超长, 回行显示
    &:nth-child(6) {
      width: 99%;
      padding: 0 8px;
      color: #0babb9;
    }
    >em {
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
      &.pkg-name-cls {
        background-color: #3186bf;
      }
    }
  }
}

.detail-caption {
  .bgc(#b5b5b5);

  .detail-row-item {
    color: #fff;

    &:not(:first-child):before {
      content: "";
      display: inline-block;
      width: 1px;
      height: 11px;
      margin-right: 5px;
      background: #fff;
    }
  }
}
.detail-content {
  height: 590px;
  overflow-x: auto;

  .detail-content-typeData,
  .detail-content-total {
    padding: 4px 0;

    > span {
      display: inline-block;
      font-weight: bold;
      .setFont(14px, #666);

      &:nth-child(1) {
        width: @detail-row-item-width * 2.1;
        padding-left: 14px;
      }

      &:nth-child(2) {
        width: @detail-row-item-width * 2.333;
        padding-left: 8px;
      }

      &:nth-child(3) {
        width: @detail-row-item-width * 1.468;
        padding-left: 8px;
        float: right;
      }
    }
  }

  .detail-content-list {
    padding: 4px 6px;
    border-bottom: 1px solid #b5b5b5;
    .bgc(#fff);

    .detail-row-item:not(:last-child) {
      padding: 6px 8px;
      color: #666;
    }
    >ul {
      >.pkg-list-content {
        >li {
          padding: 0px 6px;
          >p {
            padding: 0px 16px;
            position: relative;
            font-size: 14px;
            > span {
              display: inline-block;
              text-align: left;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
            > span:nth-of-type(1) {
              width: 113px;
            }
            > span:nth-of-type(2), >span:nth-of-type(3) {
              width: 54px;
              padding-right: 3px;
            }
            >span:nth-of-type(4) {
              width: 110px;
            }
            >i {
              font-size: 12px;
              position: absolute;
              left: 0px;
            }
          }
        }
      }
    }
  }

  .detail-content-total {
    padding: 18px 0;
    border-bottom: 1px solid #b5b5b5;

    > span {
      .setFont(16px, #333);
    }
  }
}

.queryKeyWord {
  width: 36%;
  height: 32px;
  position: relative;
  float: left;
  line-height: 32px;
  margin: 9px 0 0 16px;
  padding-left: 16px;
  border-radius: 20px;
  color: #344b5b;
  .bgc(#f5f5f5);

  > em {
    float: left;
    font-size: 24px;
  }

  > input {
    width: 71%;
    border: none;
    z-index: 8;
    position: relative;
    padding-left: 6px;
    .bgc(transparent);

    &::-webkit-input-placeholder {
      color: #344b5b;
    }

    &:focus + span {
      border-color: @activeColor;
    }
  }

  > span {
    width: 100%;
    height: 100%;
    .positionTop;
    z-index: 5;
    border-radius: 20px;
    border: 1px solid #ddd;
  }
}
.pagerBtn-box {
  width: 50%;
  height: 32px;
  margin-top: 8px;
  line-height: 32px;
  float: right;

  .pagerBtn-pageNum {
    float: left;
  }

  .pagerBtn-btn {
    float: right;
    margin-right: 16px;

    > span {
      display: inline-block;
      width: 50px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      border-radius: 18px;
      background-color: #f1f6f9;
      border: 1px solid #b5b5b5;
      font-size: 20px;
      cursor: pointer;
      .setFont(20px, #273844);
    }
  }
}

.clearSearch {
  position: relative;
  z-index: 999;
  border-radius: 50%;
  background-color: #7bcad6;
  vertical-align: sub;
  cursor: pointer;
  font-size: 24px;
  color: #fff;
}

.arrangeMenuDetailPager {
  float: right;
  position: relative;
  top: 5px;
  > button.pager-btn {
    margin-right: 4px;
    cursor: pointer;
  }
}

.noneInfo {
  position: absolute;
  display: table;
  width: 220px;
  height: 72px;
  top: calc(38.2% - 72px);
  left: 0;
  right: 0;
  /*margin: auto;*/
  margin-left: 110px;

  > p {
    display: table-cell;
  }
  .noneInfo-logo {
    .setFont(50px, #999);
  }
  .noneInfo-txt {
    padding-left: 10px;
    vertical-align: middle;
    .setFont(16px, #666);

    > span {
      display: block;
    }
  }
}
</style>

<style lang="less">
.arrangeMenu-message-top {
  top: 55px;
}
.arrangeMenuDetailPager {
  float: right;
  position: relative;
  top: 5px;
  > button.pager-btn {
    margin-right: 4px;
  }
}

.lang-enUS{
  .list .list-row{
    .list-row-item{
      font-size: 12px;
      line-height: 1.1;
    }
  }
  .select-box {
    .select-box-title {
      font-size:12px;
    }
  }
}

</style>
