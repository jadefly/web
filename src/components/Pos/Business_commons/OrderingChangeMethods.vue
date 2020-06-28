/* eslint-disable vue/no-side-effects-in-computed-properties */
<!--
@onOpen Object 对象  打开传的参数有
  this.resData.methodsData  为做法的数据
  this.resData.itemData//品项数据
  this.resData.pkgItem //为是否是通过套餐打开的弹框
-->
<template>
  <div>
    <!-- $t-做法 -->
    <Dialog
      name="PosDialog.OrderingChangeMethods"
      :title="$t('Dict.Practice')"
      ref="dialog"
      @open="onOpen"
      :beforeClose="onBeforeClose"
      @close="onClose"
      :closeByEsc="enableEscClose"
      :showSubmit="true"
      @submit="submitOrderingChangeMethods"
      width="700px"
      height="540px"
      append-to-body
      :hotkeys="hotKeySet"
      :submitId="submitId"
    >
      <div class="pos-dialog-content">
        <div class="ordering-changemethods-wrap">
          <div class="ordering-changemethods-control">
            <ul class="ordering-changemethods-tab" v-show="!getisSetUpGroupMethod">
              <li
                v-show="privateMethods.length"
                :id="type + 'PrivateMethodsFilter'"
                :class="{ 'active': currentType == 'private' }"
                @click="toggleType('private')"
                v-autotest
              >
                <!-- $t-专有做法 -->
                <a href="javascript:;">{{ $t('Biz.BizComm.PrivateMethod') }}<span>(Ctrl+F1)</span></a>
              </li>
              <li
                v-show="publicMethods.length"
                :id="type + 'PublicMethodsFilter'"
                :class="{ 'active': currentType == 'public' }"
                @click="toggleType('public')"
                v-autotest
              >
                <!-- $t-通用做法 -->
                <a href="javascript:;">{{ $t('Biz.BizComm.PublicMethod') }}<span>(Ctrl+F2)</span></a>
              </li>
              <li
                :id="type + 'TempMethodsFilter'"
                :class="{ 'active': currentType == 'temp' }"
                @click="toggleType('temp')"
                v-autotest
              >
                <!-- $t-临时做法 -->
                <a href="javascript:;">{{ $t('Biz.BizComm.TempMethod') }}<span>(Ctrl+F4)</span></a>
              </li>
            </ul>
            <ul class="ordering-changemethods-tab" v-show="getisSetUpGroupMethod">
              <li
                v-show="groupMehodsLeftTableId.length"
                :id="type + 'groupMethodsFilter'"
                :class="{ 'active': currentType == 'group' }"
                @click="toggleType('group')"
                v-autotest
              >
                <!-- $t-做法分组 -->
                <a href="javascript:;">{{ $t('Biz.BizComm.MethodGroup') }}<span>(Ctrl+F3)</span></a>
              </li>
              <li
                :id="type + 'TempMethodsFilter'"
                :class="{ 'active': currentType == 'temp' }"
                @click="toggleType('temp')"
                v-autotest
              >
                <!-- $t-临时做法 -->
                <a href="javascript:;">{{ $t('Biz.BizComm.TempMethod') }}<span>(Ctrl+F4)</span></a>
              </li>
            </ul>
            <div class="ordering-changemethods-content" v-show="currentType == 'private'">
              <div class="ordering-changemethods-private">
                <ul
                  :id="type + 'PrivateMethodsList'"
                  class="ordering-changemethods-list"
                  v-autotest
                >
                  <li v-for="(item, index) in privateMethods" :key="item.id+index">
                    <button
                      type="button"
                      :class="{ 'select': selectedClass(item), 'active': activeIndex === index, 'sellout': item.isSellout }"
                      @click="clickHandler(item)"
                    >
                      <template v-if="item.isNeedFee">
                        <strong>{{ item.name }}</strong>
                        <span>+{{ item.fee }}</span>
                      </template>
                      <template v-else>{{ item.name }}</template>
                      <span class="selloutFt" v-if="item.isSellout">{{ $t('Dict.Sellout') }}</span>
                      <span class="itemCount" v-show="item.count > 0">x{{ item.count }}</span>
                    </button>
                  </li>
                </ul>
                <div class="ordering-changemethods-pager">
                  <Pager
                    :pagerId="type + 'PrivateMethodsList'"
                    :showInfo="false"
                    @setActiveIndex="setActiveIndex"
                    ref="privatePager"
                  ></Pager>
                </div>
              </div>
            </div>
            <div class="ordering-changemethods-content" v-show="currentType == 'public'">
              <div class="ordering-changemethods-public">
                <div class="ordering-changemethods-public-class">
                  <ul
                    :id="type + 'PublicMethodsClass'"
                    class="ordering-changemethods-public-class-list"
                  >
                    <li :class="{ 'active': !currentClass }">
                      <!-- $t-全部分类 -->
                      <a href="javascript:;" @click="currentClass = null">{{ $t('Biz.BizComm.AllType') }}</a>
                    </li>
                    <li
                      v-for="item in methodClassList"
                      :key="item.id"
                      :class="{ 'active': currentClass == item.id }"
                    >
                      <a href="javascript:;" @click="() => { currentClass = item.id; activeIndex = 0; }">{{ item.name }}</a>
                    </li>
                  </ul>
                  <div class="ordering-changemethods-public-class-pager">
                    <Pager
                      :pagerId="type + 'PublicMethodsClass'"
                      :showInfo="false"
                      ref="publicClassPager"
                    ></Pager>
                  </div>
                </div>
                <div class="ordering-changemethods-public-list">
                  <ul
                    :id="type + 'PublicMethodsList'"
                    class="ordering-changemethods-list"
                    v-autotest
                  >
                    <li v-for="(item, index) in publicMethodsFilter" :key="item.id+index">
                      <button
                        type="button"
                        :class="{'select': selectedClass(item), 'active': activeIndex === index, 'sellout': item.isSellout }"
                        @click="clickHandler(item)"
                      >
                        <template v-if="item.isNeedFee">
                          <strong>{{ item.name }}</strong>
                          <span>+{{ item.fee }}</span>
                        </template>
                        <template v-else>{{ item.name }}</template>
                        <span class="selloutFt" v-if="item.isSellout">{{ $t('Dict.Sellout') }}</span>
                        <span class="itemCount" v-show="item.count > 0">x{{ item.count }}</span>
                      </button>
                    </li>
                  </ul>
                  <div class="pulicMethodSearch" v-show="publicMethods.length">
                    <Search
                      @search="searchPulicMethod"
                      idName="pulicMethod"
                      focusSetKeyboardPosition="right"
                      ref="searchPulicMethod"
                      :resultLength="publicMethodsFilter.length || 0"
                    ></Search>
                  </div>
                  <div class="ordering-changemethods-public-control">
                    <div class="ordering-changemethods-public-checkbox" v-if="!isArrangeMenuMethod" :class="{isNoUse: isNoUse}">
                      <!-- $t-通用做法对本分类所有品项有效 -->
                      <el-checkbox
                        v-if="orderingPkgItem == 1"
                        v-model="valid"
                      >{{ $t('Biz.BizComm.MethodTip01') }}</el-checkbox>
                      <!-- $t-通用做法对本单所有品项有效 -->
                      <el-checkbox v-else v-model="valid">{{ $t('Biz.BizComm.MethodTip02') }}</el-checkbox>
                    </div>
                    <div class="ordering-changemethods-pager">
                      <Pager
                        :pagerId="type + 'PublicMethodsList'"
                        :showInfo="false"
                        ref="publicPager"
                        @setActiveIndex="setActiveIndex"
                      ></Pager>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!--做法分组的显示区域-->
            <div class="ordering-changemethods-content ordering-changemethods-content-group" v-if="currentType == 'group'">
              <div class="groupContent">
                <div class="groupTable">
                  <ul>
                    <li
                      v-for="(list,index) in groupMehodsLeftTableId"
                      :key="list+index"
                      @click="groupTableFn(list, index)"
                      :class="{active: list === activeGroupMehodsTableId}"
                    >{{groupMethodsOjectData[list].name}}</li>
                  </ul>
                </div>
                <div
                  class="allGroupMehodlists"
                  :id="type + 'GroupMethodsList'"
                  :ref="type + 'GroupMethodsList'"
                >
                  <div
                    v-for="(groud, index) in groupMehodsRightItemId"
                    :key="groud+index"
                    :ref="'groudMethod_'+index"
                  >
                    <p class="groupName">
                      <strong>{{groupMethodsOjectData[groud].name}}</strong>
                      <!-- $t-多选,单选,必选,限 -->
                      <span>
                        {{ groupMethodsOjectData[groud].selectModel
                            ? '('+ $t('Biz.BizComm.MethodOpt01')
                            : '('+ $t('Biz.BizComm.MethodOpt02') }}{{
                              groupMethodsOjectData[groud].requiredGroup
                                ? $t('Biz.BizComm.MethodOpt03')+')'
                                : ')' }}
                        <!-- 限定的数量  limitedQty -->
                        {{ +groupMethodsOjectData[groud].limitedQty
                            && groupMethodsOjectData[groud].selectModel
                              ? `(${$t('Biz.BizComm.MethodOpt04')}${groupMethodsOjectData[groud].limitedQty})`
                              : '' }}
                      </span>
                    </p>
                    <ul class="groupMethodsList">
                      <li
                        v-for="(item, index) in groupMethodsOjectData[groud].methodNodeList"
                        :key="item.id+index"
                        @click="clickHandler(item, index, 'group',groud)"
                        v-show="!(isArrangeMenuMethod && +item.fee)"
                      >
                        <button
                          type="button"
                          :class="{
                            'select': selectedClass(item,
                              index,
                              groupMethodsOjectData[groud],
                              groud
                            ), 'sellout': item.isSellout
                          }"
                        >
                          <!-- 做法回显的时候是price key -->
                          <template v-if="!!item.isNeedFee">
                            <strong>{{ item.name }}</strong>
                            <span>
                              +{{
                              item.price || item.price === 0
                              ? item.price
                              : item.fee }}{{(item.qty && item.qty != 1) ? "X"+item.qty : ''
                              }}
                            </span>
                          </template>
                          <template v-else>{{ item.name }}</template>
                          <span class="selloutFt" v-if="item.isSellout">{{ $t('Dict.Sellout') }}</span>
                          <span class="itemCount" v-show="item.count > 0">x{{ item.count }}</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <Pager
                  :pagerId="type + 'GroupMethodsList'"
                  scrollMode="simple"
                  itemTag="> div"
                  :ref="currentType + 'ClassPager'"
                  :class="currentType + 'ClassPager'"
                ></Pager>
              </div>
            </div>
            <div class="ordering-changemethods-content" v-show="currentType == 'temp'">
              <div class="ordering-changemethods-temp">
                <div class="ordering-changemethods-form">
                  <div class="form-group">
                    <label :for="type + 'TempName'">
                      <sup>*</sup>
                      <!-- $t-做法名称： -->
                      <span>{{ $t('Biz.BizComm.MethodName') }}</span>
                    </label>
                    <input
                      type="text"
                      ref="methodName"
                      v-model="newTempMethod.name"
                      name="tempName"
                      :id="type + 'TempName'"
                      class="form-control"
                    >
                    <button
                      type="button"
                      class="btn btn-default btn_writingPad"
                      @click="handWriting"
                      v-hideHandwritingBoard
                    >
                      <i class="icon icon-edit"></i>
                      <!-- $t-手写板 -->
                      <span>{{ $t('Dict.WritingPad') }}</span>
                    </button>
                    <button
                      type="button"
                      class="btn btn-default"
                      @click="backspace"
                    >
                      <span>退格</span>
                    </button>
                  </div>
                  <div class="form-group">
                    <label :for="type + 'TempPrice'">
                      <sup>*</sup>
                      <!-- $t-价格： -->
                      <span>{{ $t('Dict.Price01') }}</span>
                    </label>
                    <input
                      type="text"
                      ref="methodPrice"
                      v-judge
                      v-num-keyboard:bottom
                      v-model="newTempMethod.stdPrice"
                      name="tempPrice"
                      :id="type + 'TempPrice'"
                      class="form-control form-number"
                    >
                  </div>
                  <!-- $t-添加 -->
                  <button
                    type="button"
                    class="btn btn-default"
                    @click="addTempMethod"
                    :id="type + 'AddTempMethod'"
                  >{{ $t('Biz.BizComm.AddTo') }}</button>
                </div>
                <div class="ordering-changemethods-choicebox">
                  <!-- $t-历史临时做法 -->
                  <h4 class="ordering-changemethods-title">{{ $t('Biz.BizComm.PastTmpMethod') }}</h4>
                  <ul :id="type + 'TempMethodsList'" class="ordering-changemethods-list" v-autotest>
                    <li v-for="(item, index) in tempMethodsFilterFee" :key="item.id+index">
                      <button
                        type="button"
                        :class="{ 'select': selectedClass(item) }"
                        @click="clickHandler(item, index, 'temp')"
                      >
                        <template v-if="item.isNeedFee">
                          <strong>{{ item.name }}</strong>
                          <span>+{{ item.fee }}</span>
                        </template>
                        <template v-else>{{ item.name }}</template>
                        <span class="selloutFt" v-if="item.isSellout">{{ $t('Dict.Sellout') }}</span>
                        <span class="itemCount" v-show="item.count > 0">x{{ item.count }}</span>
                      </button>
                    </li>
                  </ul>
                  <div class="ordering-changemethods-pager">
                    <Pager
                      :pagerId="type + 'TempMethodsList'"
                      :showInfo="false"
                      ref="tempPager"
                    ></Pager>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ordering-changemethods-checked">
            <!-- $t-已选做法 -->
            <h4 class="ordering-changemethods-title">{{ $t('Biz.BizComm.ChosenMethod') }}</h4>
            <div class="ordering-methods-div">
              <ul :id="type + 'CheckedMethodsList'" class="ordering-changemethods-checked-list" :ref="type + 'CheckedMethodsList'">
                <li
                  v-for="(item, index) in selectedMethods"
                  :key="index"
                  :class="[
                            {
                              priceActvie: !!item.isNeedFee
                              && item == activeSelectedMethod
                            },
                            {
                              active: !item.isNeedFee
                              && item == activeSelectedMethod
                            }
                          ]"
                  @click="selectedMethodClick(index)"
                >
                  <button type="button">
                    <!-- 做法回显的时候是price key -->
                    <template v-if="!!item.isNeedFee">
                      <strong>{{ item.name }}</strong>
                      <span>
                        +{{
                        item.price || item.price === 0 ? item.price: item.fee
                        }}
                        {{
                        (item.qty && item.qty != 1) ? "X"+item.qty : ''
                        }}
                      </span>
                    </template>
                    <template v-else>{{ item.name }}</template>
                  </button>
                  <!-- $t-数量 -->
                  <span
                    class="numBtn handlerBtn"
                    @click.stop="changeSelectedMethodQty(index)"
                    v-autotest
                    :id="currentType"
                  >{{ $t('Dict.Amount') }}</span>
                  <!-- $t-删除 -->
                  <div
                    class="deleteBtn handlerBtn"
                    @click.stop="deleteSelectedMethod(index)"
                  >{{ $t('Dict.Delete') }}</div>
                </li>
              </ul>
            </div>
            <div class="ordering-changemethods-pager">
              <Pager
                :pagerId="type + 'CheckedMethodsList'"
                :showInfo="false"
                ref="checkedPager"
              ></Pager>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
    <ChangeMethodPrice ref="changeMethodPrice"></ChangeMethodPrice>
    <ChangeMethodQty ref="ChangeMethodQty"></ChangeMethodQty>

    <!-- <ChangeMethodPrice ref="changeMethodPrice"></ChangeMethodPrice> -->
  </div>
</template>

<script>
import {
  extend, cloneDeep, filter, debounce,
} from 'lodash';
import { Message } from 'element-ui';
import { mapState, mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';
import Search from '@/components/Pos/More/LimitQuantity/LimitSearch';
import quickSearch from '@/common/js/quicksearch';
import { add, multi, sub } from '@/common/js/math';

const ChangeMethodPrice = (resolve) => {
  import('@/components/Pos/Ordering/OrderingBtnsFunc/ChangeMethodPrice').then((module) => {
    resolve(module);
  });
};
const ChangeMethodQty = (resolve) => {
  import('@/components/Pos/Ordering/OrderingBtnsFunc/ChangeMethodQty').then((module) => {
    resolve(module);
  });
};
export default {
  components: {
    Dialog,
    Pager,
    ChangeMethodPrice,
    ChangeMethodQty,
    Search,
  },
  mixins: [DialogMixin],
  data() {
    return {
      list: null,
      currentType: 'public',
      privateMethods: [],
      methodClassList: [],
      currentClass: null,
      publicMethods: [],
      tempMethods: [],
      selectedMethods: [], // 被选择的做法
      newTempMethod: {
        name: '',
        stdPrice: 0,
      },
      valid: false, // 是否对整单有效
      orderingPkgItem: 0, // 代表了要加做法的品项是否是套餐或是套餐明细\
      closeHandWriting: false, // 是否启用手写板
      activeSelectedMethod: {}, // 右侧点击已选择的做法数据
      // 分组做法的左tables分组的id数组和右侧显示的id数组
      groupMehodsLeftTableId: [],
      groupMehodsRightItemId: [],
      groupMethodsOjectData: {},
      activeGroupMehodsTableId: null,
      // 这是做法分组的选中的唯一标识
      isActivedGroupMethod: 'isActivedGroupMethod',
      // 必须的做法分组的数据
      requiredGroupMethodsId: [],
      // 是否是通过确认关闭的
      isClickSubmit: false,
      quickSearchText: '',
      debounceFn: null,
      oldSearch: '',
      enableEscClose: true,
      activeIndex: 0,
      // 快捷键的对象
      hotKeySet: {},
    };
  },
  props: {
    type: {
      default: 'root',
    },
    submitId: {
      type: String,
      default: null,
    },
    // 是否是排菜时候弹的做法
    isArrangeMenuMethod: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState({
      itemMethodSellout: state => state.pos.itemMethodSellout,
    }),
    ...mapGetters(['posInfo', 'getisSetUpGroupMethod', 'packMethod']),
    // 这个是临时做法
    tempMethodsFilterFee() {
      return this.tempMethods.map((item) => {
        if (this.packMethod && item.name === this.packMethod.name) {
          this.$set(item, 'packFlg', true);
        }
        return item;
      });
    },
    // 对通用做法的数据进行类的过滤处理
    publicMethodsFilter() {
      let filterClassMethods = this.publicMethods;
      if (this.currentClass) {
        filterClassMethods = filter(
          this.publicMethods,
          method => method.parentId === this.currentClass,
        );
      }
      if (this.quickSearchText.length) {
        return filterClassMethods.filter((list) => {
          let resultItem;
          for (let i = 0; i < this.quickSearchText.length; i++) {
            const key = this.quickSearchText[i].toUpperCase();
            if (
              list.pinyin.indexOf(key) != -1
            ) {
              resultItem = true;
            }
          }
          return resultItem;
        });
      }
      // 需要刷下分页
      if (this.$refs.publicPager) {
        this.$refs.publicPager.refresh();
      }
      return filterClassMethods;
    },
    // 对所有本单品项有效是否可用
    isNoUse() {
      if (!this.isArrangeMenuMethod && this.selectedMethods.some(method => method.isNeedFee)) {
        if (this.valid) {
          this.valid = !this.valid;
        }
      }
      return !this.isArrangeMenuMethod && this.selectedMethods.some(method => method.isNeedFee);
    },
  },
  mounted() {
    this.debounceFn = debounce((val) => {
      this.quickSearchText = quickSearch(val);
      setTimeout(() => {
        this.$refs[`${this.currentType}Pager`].refresh();
        this.activeIndex = 0;
      }, 0);
    }, 300);
    this.hotKeySet = {
      'F1.ctrl': () => {
        if (this.privateMethods.length) {
          this.toggleType('private');
        }
      },
      'F2.ctrl': () => {
        if (this.publicMethods.length) {
          this.toggleType('public');
        }
      },
      'F3.ctrl': () => {
        if (this.groupMehodsLeftTableId.length) {
          this.toggleType('group');
        }
      },
      'F4.ctrl': () => {
        this.toggleType('temp');
      },
      '↑': () => {
        const items = this.currentType === 'public' ? this[`${this.currentType}MethodsFilter`] : this[`${this.currentType}Methods`];
        if (!(this.$refs[`${this.currentType}Pager`] && items.length)) {
          return false;
        }
        // privatePager
        const pageObject = this.$refs[`${this.currentType}Pager`];
        const {
          colSize, currentPage, pageSize,
        } = pageObject.pager;
        if (this.activeIndex - colSize < 0) {
          this.activeIndex = 0;
        }
        if (currentPage > 1 && Math.ceil((this.activeIndex + 1) / colSize) % pageSize === 1) {
          pageObject.prev();
        } else if (this.activeIndex - colSize < 0) {
          return false;
        }
        this.activeIndex -= colSize;
        return true;
      },
      '↓': () => {
        const items = this.currentType === 'public' ? this[`${this.currentType}MethodsFilter`] : this[`${this.currentType}Methods`];
        if (!(this.$refs[`${this.currentType}Pager`] && items.length)) {
          return false;
        }
        // privatePager
        const pageObject = this.$refs[`${this.currentType}Pager`];
        const {
          colSize, currentPage, pageSize, totalPage,
        } = pageObject.pager;
        if (currentPage < totalPage && Math.ceil((this.activeIndex + 1) / colSize) % pageSize === 0) {
          pageObject.next();
        }
        if (this.activeIndex + colSize >= items.length) {
          this.activeIndex = items.length - 1;
          return false;
        }
        this.activeIndex += colSize;
        return true;
      },
      '←': () => {
        const items = this.currentType === 'public' ? this[`${this.currentType}MethodsFilter`] : this[`${this.currentType}Methods`];
        if (!(this.$refs[`${this.currentType}Pager`] && items.length)) {
          return false;
        }
        // privatePager
        const pageObject = this.$refs[`${this.currentType}Pager`];
        const {
          colSize, currentPage, pageSize,
        } = pageObject.pager;
        if (currentPage > 1 && (this.activeIndex + 1) % (colSize * pageSize) === 1) {
          pageObject.prev();
        } else if (this.activeIndex === 0) {
          return false;
        }
        this.activeIndex -= 1;
        return true;
      },
      '→': () => {
        const items = this.currentType === 'public' ? this[`${this.currentType}MethodsFilter`] : this[`${this.currentType}Methods`];
        if (!(this.$refs[`${this.currentType}Pager`] && items.length)) {
          return false;
        }
        // privatePager
        const pageObject = this.$refs[`${this.currentType}Pager`];
        const {
          colSize, currentPage, pageSize, totalPage,
        } = pageObject.pager;
        if (currentPage < totalPage && (this.activeIndex + 1) % (colSize * pageSize) === 0) {
          pageObject.next();
        } else if ((this.activeIndex + 1) === items.length) {
          return false;
        }
        this.activeIndex += 1;
        return true;
      },
      Enter: () => {
        if (!this.getisSetUpGroupMethod && this.currentType !== 'temp') {
          this.clickHandler(this[`${this.currentType}Methods`][this.activeIndex], this.activeIndex, this.currentType);
        }
      },
      // 删除已选的数量
      F2: () => {
        if (this.selectedMethods.length) {
          this.deleteSelectedMethod(this.selectedMethods.indexOf(this.activeSelectedMethod));
        }
      },
      // 删除已选的数量
      F4: () => {
        if (this.selectedMethods.length && (this.activeSelectedMethod.price || this.activeSelectedMethod.fee)) {
          this.changeSelectedMethodQty(this.selectedMethods.indexOf(this.activeSelectedMethod));
        }
      },
      Esc: () => {
        if (!this.enableEscClose) {
          this.isShowMessage(this.$t('Biz.BizComm.MethodTip03'));
        }
      },
      PgDn: () => {
        this.submitOrderingChangeMethods();
      },
      ...this.setKeySearchHotKey(),
    };
  },
  methods: {
    setActiveIndex(data, direction) {
      if (direction === 'prev') {
        if (data.currentPage === 1) {
          this.activeIndex = 0;
        } else {
          this.activeIndex = (data.currentPage - 1) * data.colSize * data.pageSize;
        }
      } else if (data.currentPage === data.totalPage) {
        this.activeIndex = ((data.currentPage - 1) * data.pageSize - data.virtualRow) * data.colSize;
      } else {
        this.activeIndex = (data.currentPage - 1) * data.colSize * data.pageSize;
      }
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
    // 只有在通用做法下才生效
    inputKey(key) {
      if (this.currentType === 'public') {
        this.$refs.searchPulicMethod.addWordInBlur();
      }
    },
    // 通用做法的搜索
    searchPulicMethod(val) {
      this.debounceFn(val);
    },
    // 关闭之前进行判断下是否存在必选项
    onBeforeClose(done) {
      // 是通过关闭进来的菜对做法进行判断
      if (
        this.resData.methodsData.methodGroupList
        && this.resData.methodsData.methodGroupList.length
        && !this.isClickSubmit
        && this.resData.methodsData.methodGroupList.length
        && this.requiredGroupMethodsId.length
      ) {
        // '存在必选做法组不能关闭'
        this.isShowMessage(this.$t('Biz.BizComm.MethodTip03'));
      } else {
        this.privateMethods = []; // 专用做法
        this.publicMethods = []; // 通用做法的分类
        this.$devices.Handwriting.close();
        this.closeClearData();
        done();
      }
    },
    onOpen() {
      this.activeIndex = 0;
      // 被选择的做法初始化下
      this.$refs.searchPulicMethod && this.$refs.searchPulicMethod.searchTextClean();
    },
    onClose() {
      if (this.closeHandWriting) {
        this.handWriting();
      }
    },
    onOpen() {
      // 被选择的做法初始化下
      this.$refs.searchPulicMethod && this.$refs.searchPulicMethod.searchTextClean();
      this.initData();
      // this.$refs[this.currentType+'Pager'].refresh()
      // 判断esc能否关闭窗口
      if (this.resData.methodsData.methodGroupList
        && this.resData.methodsData.methodGroupList.length
        && this.requiredGroupMethodsId.length
      ) {
        // 存在做法分组的必选项,设置禁止关闭
        this.enableEscClose = false;
      } else {
        this.enableEscClose = true;
      }
    },
    // 打开的时候如果品项有做法进行回显
    echoMethods(methodListData) {
      methodListData.forEach((_) => {
        this.selectedMethods.push(_);
      });
    },
    toggleType(type) {
      this.activeIndex = 0;
      // 如果是从通用做法向其他table切换要清空搜索框
      if (this.currentType === 'public' && type !== 'public') {
        this.$refs.searchPulicMethod && this.$refs.searchPulicMethod.searchTextClean();
        this.quickSearchText = '';
      }
      this.currentType = type;

      // 时 做法
      if (type === 'temp' && this.posInfo.isEnableHandwritingBoard) {
        this.closeHandWriting = true;
        this.$devices.Handwriting.open();
      } else {
        this.closeHandWriting = false;
        this.$devices.Handwriting.close();
        setTimeout(() => {
          // 做法分组和现有做法的区分
          if (!this.getisSetUpGroupMethod) {
            this.$refs[`${this.currentType}Pager`].refresh();
          }
          if (this.$refs[`${this.currentType}ClassPager`]) {
            this.$refs[`${this.currentType}ClassPager`].refresh();
          }
        }, 200);
      }
    },
    // 做法已被选的样式显示
    /**
     * item 做法数据
     * index 做法数据的循环index值
     * groudMethodData 做法处于当前分组的数据
     * groudKey 当前做法分株数据的key
     */
    selectedClass(item, index, groudMethodData, groudKey) {
      const isActive = { isActive: false };
      if (groudMethodData) {
        // 每当分组数据第一次被匹配的时候要进行做法分组数据的已选中的数据初始化下
        this.$set(item, 'active', '');
        if (!index) {
          groudMethodData.selectedQty = 0;
        }
        return this.isSelectedMethod(item, isActive, groudMethodData, groudKey);
      }
      return this.isSelectedMethod(item, isActive);
    },
    isSelectedMethod(item, isActive, groudMethodData, groudKey) {
      // 根据过滤判断是否已点的做法含有次做法呢
      this.selectedMethods.forEach((method) => {
        // 找到就给对象的active设置个值为isActivedGroupMethod
        // 为了兼容排菜做法的回显目前排菜下单过来的数据是没有含做法type的
        // 所以加了个!method.type
        if (
          (
            !method.type
            || `${method.type}` === `${item.type}`
          )
          && method.id === item.id
          && method.name === item.name
        ) {
          const addQty = method.qty || 1;
          this.$set(item, 'count', addQty);
          if (groudMethodData) {
            // 做法下 做法分组，组选择做法的总数
            groudMethodData.selectedQty = add(groudMethodData.selectedQty, addQty);
            // 增加 分组的id
            this.$set(method, 'groudId', groudKey);
            this.$set(item, 'active', this.isActivedGroupMethod);
          }
          isActive.isActive = true;
        }
      });
      return isActive.isActive;
    },
    // 已选做法列表的点击事件
    selectedMethodClick(index) {
      this.activeSelectedMethod = this.selectedMethods[index];
    },
    // 做法选择事件
    clickHandler(item, index, type, groupTableClassId) {
      // 分组做法的当期选中的所在分组id
      if (this.selectedClass(item)) return; // 判断是否已被选
      if (item.isSellout) { // 做法估清不能点击
        Message.error({ message: this.$t('Biz.Order.methodIsSellout') }); // 此做法已估清不能使用
        return;
      }

      const cloneItemData = cloneDeep(item);
      // type主要是用来区分（临时、做法分组）和通用专用做法的区别
      if (type) {
        if (type === 'temp') {
          // 目前临时如果带有做法就是属于联动
          if (cloneItemData.fee) {
            cloneItemData.isRelaCount = true;
          }
          const findTempMethod = this.selectedMethods.filter(method => method.type === type);
          if (findTempMethod.length) {
            // this.isShowMessage('临时做法只能添加一种请重新选择');
            this.isShowMessage(this.$t('Biz.BizComm.MethodTip04'));
            return false;
          }
          // 在做法分组的情况下判断此组如果单选在选择的时候直接return false
        } else if (
          groupTableClassId
        ) {
          if (JSON.stringify(
            this.groupMethodsOjectData[groupTableClassId],
          ).indexOf(this.isActivedGroupMethod) !== -1
            && this.groupMethodsOjectData[groupTableClassId].selectModel === 0) {
            return false;
          }
          if (+this.groupMethodsOjectData[groupTableClassId].selectModel === 1) {
            const clonedGroup = cloneDeep(this.groupMethodsOjectData[groupTableClassId]);
            // 从这坐下数组分组的限定判断
            if (
              clonedGroup.limitedQty
              && add(clonedGroup.selectedQty, 1) > clonedGroup.limitedQty
            ) {
              // this.isShowMessage('超出当前做法组限定的数量');
              this.isShowMessage(this.$t('Biz.BizComm.BizCommTip07'));
              return false;
            }
          }
        }
      } else {
        if (this.currentType === 'public') {
          this.$refs.searchPulicMethod && this.$refs.searchPulicMethod.searchTextClean();
        }
        this.quickSearchText = '';
        // 判断专用做法也同时在通用的做法里 ,只能选择一个
        const isSelected = { isSelected: false };
        this.selectedMethods.forEach((method) => {
          if (`${method.id}` === `${cloneItemData.id}` && method.name === cloneItemData.name) {
            isSelected.isSelected = true;
          }
        });
        if (isSelected.isSelected) {
          return false;
        }
        // 如果单品选择的菜设置了专用做法只能单选
        if (this.list.isSingleMethod) {
          // 如果是从专用做法添加做法后者是通用添加是专用的
          if (this.currentType === 'private' || this.privateMethods.some(method => method.id === item.id)) {
            let findeIndex = null;
            for (let index = 0; index < this.selectedMethods.length; index++) {
              if (this.privateMethods.some(method => method.id === this.selectedMethods[index].id)) {
                findeIndex = index;
                break;
              }
            }
            // 找到直接替换
            if (findeIndex || findeIndex === 0) {
              // 如果当前被替换的做法没有价格话对添加含有做法价格的做法做下类的判
              if (!this.selectedMethods[findeIndex].isNeedFee && item.isNeedFee) {
                if (
                  this.selectedMethods.some(
                    method => (method.fee || method.price)
                      && method.isRelaCount !== item.isRelaCount,
                  )
                ) {
                  let messgeText = '';
                  if (!item.isRelaCount) {
                    // messgeText = '已添加按数量加价的制作方法，不能再添加固定加价的制作方法';
                    messgeText = this.$t('Biz.BizComm.MethodTip06');
                  } else {
                    // messgeText = '已添加固定加价的制作方法，不能再添加按数量加价的制作方法';
                    messgeText = this.$t('Biz.BizComm.MethodTip07');
                  }
                  return this.isShowMessage(`${messgeText}`);
                }
              } else if (this.selectedMethods[findeIndex].isNeedFee && item.isNeedFee) {
                if (this.selectedMethods[findeIndex].isRelaCount !== item.isRelaCount) {
                  let messgeText = '';
                  if (!item.isRelaCount) {
                    // messgeText = '已添加按数量加价的制作方法，不能再添加固定加价的制作方法';
                    messgeText = this.$t('Biz.BizComm.MethodTip06');
                  } else {
                    // messgeText = '已添加固定加价的制作方法，不能再添加按数量加价的制作方法';
                    messgeText = this.$t('Biz.BizComm.MethodTip07');
                  }
                  return this.isShowMessage(`${messgeText}`);
                }
              }
              this.activeSelectedMethod = {};
              // 目前的现状是初始的时候后端没有给数量qty字段 ,现在做法还有价格的时候要有数量所以手动添加个默认为1
              if (item.isNeedFee) {
                this.$set(item, 'qty', 1);
              }
              this.activeSelectedMethod = item;
              this.selectedMethods.splice(findeIndex, 1, item);
              return;
            }
          }
        }
        // findMethod.length ? isTrueAdd = false : isTrueAdd = true
      }
      // 做法带价格的做法分为两种根据isRelaCount字段判断，为true是联动，false为固定类型，两种不能共存
      if (this.selectedMethods.length && cloneItemData.isNeedFee) {
        if (
          this.selectedMethods.some(
            method => method.isNeedFee
              && method.isRelaCount !== cloneItemData.isRelaCount,
          )
        ) {
          let messgeText = '';
          if (!cloneItemData.isRelaCount) {
            // messgeText = '已添加按数量加价的制作方法，不能再添加固定加价的制作方法';
            messgeText = this.$t('Biz.BizComm.MethodTip06');
          } else {
            // messgeText = '已添加固定加价的制作方法，不能再添加按数量加价的制作方法';
            messgeText = this.$t('Biz.BizComm.MethodTip07');
          }
          return this.isShowMessage(`${messgeText}`);
        }
      }
      // 做法价格可修改的弹框
      if (item.isFeeEditable) {
        const methodData = extend({}, cloneItemData);
        this.$refs.changeMethodPrice.open(methodData, {
          submit: (method) => {
            // 价格是否给复制的判断
            if (`${method.fee}`.length) {
              // 没有找到就添加/临时做法只能添加一个
              this.addSelectMethods(method);
              this.$refs.changeMethodPrice.close();
            } else {
              // this.isShowMessage('做法费用必须填写');
              this.isShowMessage(this.$t('Biz.BizComm.MethodTip08'));
            }
          },
        });
      } else {
        // 没有找到就添加/ 临时做法只能添加一个
        this.addSelectMethods(cloneItemData);
      }
      if (['private', 'public'].indexOf(this.currentType) !== -1) {
        const { currentPage } = this.$refs[`${this.currentType}Pager`].pager;
        if (currentPage !== 1) {
          this.activeIndex = 0;
        }
      }
      if (this.selectedMethods.length > 8) {
        setTimeout(() => {
          const selectedBox = this.$refs[`${this.type}CheckedMethodsList`];
          if (selectedBox.scrollHeight > selectedBox.clientHeight) {
            selectedBox.scrollTop = sub(
              selectedBox.scrollHeight,
              selectedBox.clientHeight,
            );
          }
        }, 50);
      }
      return true;
    },
    // 添加选中的做法
    addSelectMethods(method) {
      this.activeSelectedMethod = {};
      // 目前的现状是初始的时候后端没有给数量qty字段 ,现在做法还有价格的时候要有数量所以手动添加个默认为1
      if (method.isNeedFee) {
        this.$set(method, 'qty', 1);
      }
      this.activeSelectedMethod = method;
      this.selectedMethods.push(method);
    },
    // 修改做法的价格
    // 删除已选择的做法
    deleteSelectedMethod(index) {
      this.selectedMethods.splice(index, 1);
      if (this.selectedMethods.length > 0) {
        this.activeSelectedMethod = this.selectedMethods[this.selectedMethods.length - 1];
      }
    },
    // 修改已选择的做法中被选中的还有价格做法的数量
    changeSelectedMethodQty(index) {
      const activeGroupData = this.groupMethodsOjectData[this.activeSelectedMethod.groudId];
      // 如果后台设置了组内的限定数量
      if (activeGroupData && activeGroupData.limitedQty && activeGroupData.selectModel) {
        // 计算出最大可点数
        const maxQty = sub(
          this.groupMethodsOjectData[this.activeSelectedMethod.groudId].limitedQty,
          sub(
            this.groupMethodsOjectData[this.activeSelectedMethod.groudId].selectedQty,
            this.activeSelectedMethod.qty,
          ),
        );
        this.activeSelectedMethod = extend(
          {},
          { maxQty: Number(maxQty) },
          this.activeSelectedMethod,
        );
      }
      this.$refs.ChangeMethodQty.open(cloneDeep(this.activeSelectedMethod), {
        submit: (qty) => {
          this.$set(this.activeSelectedMethod, 'qty', Number(qty));
          this.$set(this.selectedMethods[index], 'qty', Number(qty));
          // _this.$set(_this.activeSelectedMethod(index), 'qty', qty)
        },
      });
    },
    // 临时做法的添加事件
    addTempMethod() {
      this.newTempMethod.name = this.newTempMethod.name.trim();
      const isAddTempMethod = { isAddTempMethod: true };
      if (String(this.newTempMethod.stdPrice).trim() === '') {
        // this.isShowMessage('请输入临时做法价格');
        this.isShowMessage(this.t('Biz.BizComm.MethodTip09'));
        isAddTempMethod.isAddTempMethod = false;
      }

      const price = Number(this.newTempMethod.stdPrice);
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(price)) {
        // this.isShowMessage('请输入正确价格');
        this.isShowMessage(this.$t('Biz.Order.TempItemMessage03'));
        isAddTempMethod.isAddTempMethod = false;
      }

      if (price >= 1000000) {
        // this.isShowMessage('最大值为999999.99');
        this.isShowMessage(this.$t('Dict.MaximumMessage', [999999.99]));
        isAddTempMethod.isAddTempMethod = false;
      }
      // 存在打包增值的时候不允许修改打包的价格
      if (this.packMethod && this.newTempMethod.name === this.packMethod.name) {
        this.newTempMethod.stdPrice = 0;
      } else {
        this.newTempMethod.stdPrice = price;
      }

      if (!this.newTempMethod.name.length) {
        // this.isShowMessage('做法名称不能为空');
        this.isShowMessage(this.$t('Biz.BizComm.MethodTip11'));
        this.$refs.methodName.focus();
        isAddTempMethod.isAddTempMethod = false;
      }

      if (this.newTempMethod.name.length >= 50) {
        // this.isShowMessage('做法名称最多输入50位');
        this.isShowMessage(this.$t('Biz.BizComm.MethodTip12'));
        isAddTempMethod.isAddTempMethod = false;
      }
      // 排菜加单不能添加有价格的做法
      if (this.isArrangeMenuMethod && +price) {
        // this.isShowMessage('不允许添加有价格的做法');
        this.isShowMessage(this.$t('Biz.BizComm.MethodTip13'));
        isAddTempMethod.isAddTempMethod = false;
      }
      if (isAddTempMethod.isAddTempMethod) {
        // 请求接口进行添加
        ajax('canyin.pos.bill.updatetempmethod', {
          contentType: 'URLEncoded',
          data: this.newTempMethod,
        }).then((res) => {
          if (res.success) {
            // this.$message.success('临时做法添加成功');
            this.$message.success(this.$t('Biz.BizComm.MethodTip14'));
            this.tempMethods.splice(0, this.tempMethods.length);
            res.itData.forEach((_) => {
              if (this.packMethod && _.name === this.packMethod.name) {
                this.$set(_, 'packFlg', true);
              }
              this.$set(_, 'type', 'temp');
              // 直接显示已选择的做法列表里 clickHandler(item,'temp')
              let nowTemMethod = null;
              nowTemMethod = (_.name === this.newTempMethod.name) ? _ : null;
              // 如果找到就添加 如果是排菜的弹框做法需要排除掉有价格的做法
              if (nowTemMethod) {
                this.clickHandler(nowTemMethod, null, 'temp');
              }
              if (!(this.isArrangeMenuMethod && +_.fee)) {
                this.tempMethods.push(_);
              }
            });
            // 初始化下
            this.$set(this.newTempMethod, 'name', '');
            this.$set(this.newTempMethod, 'stdPrice', 0);
            // 并对分页初始化下
            this.$refs.tempPager.refresh();
          }
        });
      }
    },
    // 提示的公共方法
    isShowMessage(message, type, duration) {
      const options = {
        // message: message || '提示的内容', // 提示的内容
        message: message || this.$t('Dict.PromptInfo'), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    submitOrderingChangeMethods() {
      // 判断已选的做法是否是包含了所有要必选的做法
      if (this.isHaveAllRequiredGroupMethods()) {
        const methodList = []; // 做法的列表
        let lastMethodFeeTotal = 0; // 这次提交的做法加价的总额
        let isGodoAdd = true;
        try {
          this.selectedMethods.forEach((_) => {
            // 判断组内的限定数
            if (
              this.groupMethodsOjectData[_.groudId]
              && this.groupMethodsOjectData[_.groudId].selectModel
              && this.groupMethodsOjectData[_.groudId].limitedQty
              && this.groupMethodsOjectData[_.groudId].selectedQty
                > this.groupMethodsOjectData[_.groudId].limitedQty
            ) {
              isGodoAdd = false;
              throw `${`${this.$t('Biz.BizComm.MethodTip16')
                + this.groupMethodsOjectData[_.groudId].name
              } ${
                this.$t('Biz.BizComm.MethodTip17')
              } ${
                this.groupMethodsOjectData[_.groudId].selectedQty
              }${this.$t('Biz.BizComm.MethodTip18')
              }${this.groupMethodsOjectData[_.groudId].limitedQty}`}`;
            }
            const method = {};
            method.id = `${_.id}`;
            method.name = _.name;
            method.type = _.type;
            method.feeChanged = _.feeChanged || (_.isFeeEditable ? _.isFeeEditable : false);
            method.price = _.price || _.price === 0 ? _.price : null;
            // 暂时先这么解决做法提交参数缺少vprice问题，如果遇到其他问题再看。。
            method.isNeedFee = _.isNeedFee;
            method.fee = _.fee;
            method.packFlg = _.packFlg; // 打包标识
            // 是否计费
            if (_.isNeedFee) {
              //  method.price = _.fee == undefined  ? '' : _.fee
              method.price = _.price || _.price === 0 ? _.price : _.fee;
              method.vprice = method.price;
            }
            // 如果做法存在数量就直接赋值，如果不存在qty 为1 目前后端需要qty所以不存在默认为1
            method.qty = _.qty ? _.qty : 1;
            /**
             * 做这个处理就是当没有加价的时候不需要这个isRelaCount要变为false
             * 现在的前端2.0是如果存在了价格就一定是跟随这品项数量加价isRelaCount为 true
             * method.isRelaCount = !!method.price;
             * 前端2.0在182版本放开这个设置
             * 做法价格是否跟着品项数量联动不联动
             * 临时做法没有这个字段，临时做法如果待价格还要遵从以前的逻辑
             * */
            method.isRelaCount = _.isRelaCount;
            method.costPrice = _.costPrice || 0;
            // 这是临时做法还是走以前的逻辑
            if (_.isRelaCount === undefined) {
              method.isRelaCount = !!method.price;
            }
            lastMethodFeeTotal = add(lastMethodFeeTotal, method.price
              ? multi(method.price, method.qty)
              : 0);
            methodList.push(method);
          });
        } catch (err) {
          this.isShowMessage(`${err}`);
        }
        if (!isGodoAdd) {
          return false;
        }
        const methodData = {
          methodList,
          publicIsValid: this.valid,
          lastMethodFeeTotal,
        };
        this.isClickSubmit = true;
        console.log('submit-methods', methodData);
        this.submit(methodData);
        if (methodList.length > 0) {
          this.$log.info(`提交做法窗口。methodList:${methodList}`);
        } else {
          this.$log.info('直接提交做法窗口。');
        }
      }
    },
    // 关闭之前清除缓存，避免打开的时候显示上一次的数据
    closeClearData() {
      this.activeSelectedMethod = {};
      this.list = null;
      this.privateMethods = [];
      this.methodClassList = [];
      this.currentClass = null;
      this.publicMethods = [];
      this.selectedMethods = [];
      this.activeGroupMehodsTableId = null;
      this.valid = false;
      this.isClickSubmit = false;
      this.quickSearchText = '';
    },
    initData() { // 数据初始化&填充
      this.currentType = (!this.getisSetUpGroupMethod && this.resData.methodsData.publicMethodJson && this.resData.methodsData.publicMethodJson.length > 0) ? 'public'
        : this.resData.methodsData.methodGroupList
        && this.resData.methodsData.methodGroupList.length
          ? 'group'
          : 'temp';
      this.list = this.resData.itemData; // 品项数据
      // 如果品项之前有做法  就要回显
      // 套餐里明细的做法的key为method_list 其他的是methodList
      const methodListData = this.list.method_list ? this.list.method_list : this.list.methodList;
      this.tempMethods = []; // 临时做法的数据
      if (methodListData) {
        this.echoMethods(methodListData);
      }
      if (!this.getisSetUpGroupMethod) {
        // 专用做法的type 属性的添加
        if (this.resData.methodsData.privateMethodJson) {
          this.resData.methodsData.privateMethodJson.forEach((_) => {
            this.$set(_, 'type', 'private');
            // 排菜过来的弹框要过滤掉带价格的做法
            if (!(this.isArrangeMenuMethod && +_.fee)) {
              this.privateMethods.push(_);
            }
          });
        }
        // 通用做法的type 属性添加 publicMethodJson
        if (this.resData.methodsData.publicMethodJson) {
          this.resData.methodsData.publicMethodJson.forEach((_) => {
            this.$set(_, 'type', 'public');
            if (!(this.isArrangeMenuMethod && +_.fee)) {
              this.publicMethods.push(_);
            }
          });
        }
        // 如果没有后者是0 代表是请求过来的做法数据 如果是不存在代码的是非套餐的品项
        // 1- 代表的是常规套餐明细的做法修改  2-代表的是宴会套餐明细的做法修改
        this.orderingPkgItem = this.resData.pkgItem || 0;
        this.methodClassList = this.resData.methodsData.methodClassList; // 通用做法的分类
        // ["public", "private", "temp"]
        this.currentClass = null;
        if (this.privateMethods && this.privateMethods.length) {
          this.currentType = 'private';
        }
        this.$log.info(`打开做法窗口。id:${this.list.id},name:${this.list.name},price:${this.list.price}`);
      } else {
        // 做法分组的数据处理
        this.groupMehodsLeftTableId = [];
        this.groupMehodsRightItemId = [];
        this.requiredGroupMethodsId = [];
        this.groupMethodsOjectData = {};
        this.resData.methodsData.methodGroupList.forEach((list, index) => {
          // 给 list 添加 selectedQty 组已点的数量
          // this.$set(list, 'limitedQty', 1);
          this.$set(list, 'selectedQty', 0);
          this.groupMehodsLeftTableId.push(list.id + index);
          this.groupMehodsRightItemId.push(list.id + index);
          if (list.requiredGroup) {
            this.requiredGroupMethodsId.push(list.id + index);
          }
          this.groupMethodsOjectData[list.id + index] = list;
        });
      }
      // 临时做的type 属性添加
      if (this.resData.methodsData.tempMethodJson) {
        this.resData.methodsData.tempMethodJson.forEach((_) => {
          this.$set(_, 'type', 'temp');
          if (!(this.isArrangeMenuMethod && +_.fee)) {
            this.tempMethods.push(_);
          }
        });
      }
      // 初始化下被显示的区域 分页
      setTimeout(() => {
        if (this.$refs.publicPager) {
          this.$refs.publicPager.refresh();
        }
        if (this.$refs.privatePager) {
          this.$refs.privatePager.refresh();
        }
        if (this.$refs.tempPager) {
          this.$refs.tempPager.refresh();
        }
        if (this.$refs.publicClassPager) {
          this.$refs.publicClassPager.refresh();
        }
        // this.$refs[this.currentType+'Pager'] && this.$refs[this.currentType+'Pager'].refresh()
        // this.$refs['publicClassPager'] && this.$refs['publicClassPager'].refresh()
      }, 500);
    },
    handWriting() {
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else {
        this.$devices.Handwriting.open();
        this.$refs.methodName.focus();
      }
    },
    backspace() {
      this.$refs.methodName.focus();
      if (window.getSelection().toString() == this.newTempMethod.name) {
        this.newTempMethod.name = '';
      } else {
        this.newTempMethod.name = this.newTempMethod.name.substr(0, this.newTempMethod.name.length - 1);
      }
    },
    // 做法分组的table点击事件右侧显示的内容也跟着相应滚动
    groupTableFn(tableId, index) {
      let groudContentScrollTop = 0;
      this.activeGroupMehodsTableId = tableId;
      if (index) {
        for (let i = 0; i < index; i += 1) {
          groudContentScrollTop = add(groudContentScrollTop, this.$refs[`groudMethod_${i}`][0].scrollHeight);
        }
      }
      // `${this.type}GroupMethodsList`
      this.$refs[`${this.type}GroupMethodsList`].scrollTop = groudContentScrollTop;
    },
    // 做法分组弹框关闭的时候做的判断
    isHaveAllRequiredGroupMethods() {
      let isHaveAll = true;
      if (this.getisSetUpGroupMethod && this.requiredGroupMethodsId.length) {
        this.requiredGroupMethodsId.forEach((groupId) => {
          if (JSON.stringify(this.groupMethodsOjectData[groupId])
            .indexOf(this.isActivedGroupMethod) === -1
          ) {
            // `做法分组：${this.groupMethodsOjectData[groupId].name}为必选组`
            // this.isShowMessage(`做法分组：${this.groupMethodsOjectData[groupId].name}为必选组`);
            this.isShowMessage(`${this.$t('Biz.BizComm.MethodTip16')
              + this.groupMethodsOjectData[groupId].name
              + this.$t('Biz.BizComm.MethodTip19')}`);
            isHaveAll = false;
          }
        });
      }
      return isHaveAll;
    },
  },
  watch: {
    itemMethodSellout(newVal, oldVal) { // 更新估清数据
      this.publicMethods.forEach((item) => {
        item.isSellout = false; // 清空
        newVal.forEach((newItem) => {
          if (item.id === newItem.methodId) item.isSellout = true;
        });
      });
      this.privateMethods.forEach((item) => { // 专用做法可以关联通用做法，如果通用做法估清，专用做法也要估清
        item.isSellout = false; // 清空
        newVal.forEach((newItem) => {
          if (item.id === newItem.methodId) item.isSellout = true;
        });
      });
    },
    selectedMethods: {
      handler(newValue, oldValue) {
        if (newValue.length && oldValue.length) {
          this.$refs.checkedPager.refresh();
          // Todo: 滚动到底部加单的时候
        }
      },
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.ordering-changemethods-wrap {
  position: relative;
  height: 100%;
  padding-right: 246px;
  overflow: hidden;
}

.ordering-changemethods-control {
  position: relative;
  height: 100%;
  padding-top: 45px;
  overflow: hidden;
  background-color: @white;
  border-radius: 0 0 0 3px;
  .box-shadow(0 0 10px rgba(0, 0, 0, 0.2));
}

.ordering-changemethods-content {
  height: 100%;
  &.ordering-changemethods-content-group {
    padding-left: 96px;
  }
}

.ordering-changemethods-tab {
  position: absolute;
  left: 0;
  top: 0;
  .size(100%, 45px);
  border-bottom: 1px solid #b5b5b5;

  > li {
    float: left;
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
    cursor: pointer;

    > a {
      position: relative;
      display: block;
      height: 100%;
      line-height: 34px;
      > span {
        position: absolute;
        left: 0px;
        top: 14px;
      }
    }

    &.active > a {
      color: @brand-primary;

      &:after {
        position: absolute;
        content: "";
        left: 0;
        bottom: -1px;
        .size(100%, 3px);
        background-color: @brand-primary;
      }
    }
  }
}

.ordering-changemethods-list {
  height: 100%;
  margin-left: -4px;
  margin-right: -4px;
  overflow: hidden;
  .clearfix();

  > li {
    float: left;
    width: 25%;
    padding: 5px 4px;

    > button {
      display: block;
      position: relative;
      .size(100%, 44px);
      background-color: @white;
      border: 1px solid #b5b5b5;
      border-radius: 3px;
      .text-overflow();

      > strong,
      > span {
        display: block;
      }

      > strong {
        font-weight: normal;
        height: 24px;
        line-height: 24px;
        padding-top: 4px;
        .text-overflow();
      }

      > span {
        font-size: 12px;
        height: 16px;
        line-height: 16px;
      }
      >.itemCount {
        position: absolute;
        top: 0px;
        right: 2px;
        font-size: 16px;
        color: #ee4e63;
        display: none;
      }
      &.select {
        border-color: @brand-primary;
        color: @brand-primary;
        >.itemCount {
          display: block;
        }
      }
      &.active {
        background-color: #b8f9ff;
      }
    }
    .sellout {
      background: #d4e7eb;
      cursor: default;
    }
    .selloutFt {
      position: absolute;
      right:3px;
      top:1px;
      color: #df2d2d;
    }
  }
}

.ordering-changemethods-private {
  position: relative;
  height: 100%;
  padding-top: 10px;
  padding-bottom: 50px;

  .ordering-changemethods-list {
    padding-left: 15px;
    padding-right: 15px;
  }

  .ordering-changemethods-pager {
    position: absolute;
    left: 0;
    bottom: 0;
    .size(100%, 50px);
    padding-top: 10px;
    padding-right: 10px;
    border-top: 1px solid #b5b5b5;

    > .pos-pager {
      float: right;
    }
  }
}

.ordering-changemethods-public {
  position: relative;
  height: 100%;
  padding-left: 108px;
}

.ordering-changemethods-public-class {
  position: absolute;
  left: 0;
  top: 0;
  .size(108px, 100%);
  padding-bottom: 51px;
  background-color: #eee;
}

.ordering-changemethods-public-class-list {
  height: 100%;
  overflow: auto;
  > li {
    padding-left: 15px;
    padding-right: 15px;

    > a {
      display: block;
      height: 42px;
      line-height: 42px;
      text-align: center;
      color: #666;
      .text-overflow();
    }

    &.active {
      background-color: @white;

      > a {
        color: #333;
      }
    }
  }
}

.ordering-changemethods-public-class-pager {
  position: absolute;
  left: 50%;
  bottom: 0;
  .size(106px, 51px);
  padding-top: 10px;
  margin-left: 106px / -2;
  border-top: 1px solid #b5b5b5;
}

.ordering-changemethods-public-list {
  position: relative;
  height: 100%;
  padding-bottom: 92px;
  padding-left: 15px;
  padding-right: 15px;

  .ordering-changemethods-list > li {
    width: 33.32%;
  }
  .pulicMethodSearch {
    position: absolute;
    padding-left: 14px;
    left: -26px;
    bottom: 60px;
    width: 168px;
  }
}

.ordering-changemethods-public-control {
  position: absolute;
  left: 0;
  bottom: 0;
  .size(100%, 51px);
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  border-top: 1px solid #b5b5b5;

  .ordering-changemethods-pager {
    float: right;
  }
}

.ordering-changemethods-public-checkbox {
  padding-top: 6px;
  float: left;
  &.isNoUse {
    pointer-events: none;
    opacity: 0.8;
  }
}

.ordering-changemethods-temp {
  position: relative;
  height: 100%;
  padding-bottom: 246px;
}

.ordering-changemethods-form {
  height: 100%;
  margin-left: 10px;
  margin-right: 5px;
  padding-top: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #b5b5b5;

  .form-group {
    .clearfix();
    margin-bottom: 15px;

    > label,
    > .form-control,
    > button {
      float: left;
      height: 36px;
    }
    > input::-webkit-outer-spin-button,
    > input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    > .form-number {
      -moz-appearance: textfield;
    }
    > label {
      width: 90px;
      line-height: 36px;
      margin-bottom: 0;
      font-weight: normal;
      display: flex;
      align-items: center;
      line-height: 1.1;
      > sup {
        color: #f00;
        font-size: 14px;
        margin-right:5px;
        top:0;
      }
    }

    > .form-control {
      width: 174px;
    }

    > button {
      float: left;
      margin-left: 7px;
    }
  }

  > button {
    .size(100px, 40px);
    margin-top: 5px;
    margin-left: 90px;
  }
}

.ordering-changemethods-choicebox {
  position: absolute;
  left: 0;
  bottom: 0;
  .size(100%, 246px);
  padding-top: 35px;
  padding-bottom: 51px;

  .ordering-changemethods-title {
    position: absolute;
    left: 0;
    top: 0;
    .size(100%, 35px);
    padding-top: 15px;
    line-height: 20px;
    padding-left: 15px;
  }

  .ordering-changemethods-list {
    height: 162px;
    padding-left: 15px;
    padding-right: 15px;
  }

  .ordering-changemethods-pager {
    position: absolute;
    left: 0;
    bottom: 0;
    .size(100%, 51px);
    border-top: 1px solid #b5b5b5;
    padding-top: 10px;
    padding-right: 10px;

    > .pos-pager {
      float: right;
    }
  }
}

.ordering-changemethods-checked {
  position: absolute;
  right: 0;
  top: 0;
  .size(246px, 100%);
  padding-top: 44px;
  padding-bottom: 51px;

  .ordering-changemethods-title {
    position: absolute;
    left: 0;
    top: 0;
    .size(100%, 44px);
    line-height: 44px;
    padding-left: 20px;
  }

  .ordering-changemethods-pager {
    position: absolute;
    left: 20px;
    bottom: 0;
    .size(210px, 51px);
    border-top: 1px solid #b5b5b5;
    padding-top: 10px;

    > .pos-pager {
      float: right;
    }
  }
}
.ordering-methods-div {
  height: 100%;
  overflow: hidden;
}
.ordering-changemethods-checked-list {
  .clearfix();
  height: 100% !important;
  margin-left: -4px;
  margin-right: -4px;
  padding-left: 20px;
  padding-right: 15px;
  padding-top: 2px;
  overflow: hidden;

  > li {
    width: 214px;
    margin-bottom: 5px;
    border: 1px solid rgba(13, 49, 41, 0.2);
    border-radius: 3px;
    position: relative;
    &.priceActvie {
      background-color: @brand-primary;
      color: #fff;
      > button {
        width: 51%;
        background-color: @brand-primary;
        color: #fff;
      }
      > .handlerBtn {
        display: block;
      }
    }
    &.active {
      background-color: @brand-primary;
      color: #fff;
      > button {
        width: 75%;
        background-color: @brand-primary;
        color: #fff;
      }
      > .deleteBtn {
        display: block;
      }
      > .numBtn {
        display: none;
      }
    }
    > button {
      .size(100%, 42px);
      border: none;
      background-color: #ffffff;
      border-radius: 3px;
      .text-overflow();
      > strong,
      > span {
        display: block;
      }

      > strong {
        font-weight: normal;
        height: 20px;
        line-height: 20px;
        padding-top: 2px;
        .text-overflow();
      }

      > span {
        font-size: 12px;
        height: 16px;
        line-height: 16px;
      }
    }
    > .handlerBtn {
      width: 25%;
      height: 42px;
      line-height: 42px;
      text-align: center;
      right: 0;
      cursor: pointer;
      // padding: 0px 18px;
      border-left: 1px solid rgba(13, 49, 41, 0.2);
      position: absolute;
      top: 0px;
      display: none;
      &.numBtn {
        right: 25%;
      }
      &.deleteBtn {
        // right: 11px;
      }
    }
  }
}
// 做法分组的样式
.groupContent {
  overflow: auto;
  border-bottom: 1px solid #ccc;
  width: 100%;
  > .groupTable {
    width: 96px;
    position: absolute;
    height: 390px;
    left: 0px;
    background-color: #e4e4e4;
    > ul {
      > li {
        &.active {
          background-color: #ffffff;
        }
        cursor: pointer;
        padding: 11px 6px;
        text-align: center;
      }
    }
  }
  > .allGroupMehodlists {
    height: 390px;
    width: 353px;
    overflow: auto;
    > div {
      > .groupName {
        > span {
          color: #0babb9;
        }
      }
      > ul {
        padding-left: 12px;
        &.groupMethodsList {
          overflow: auto;
        }
        > li {
          float: left;
          width: 32%;
          padding: 5px 4px;
          > button {
            .size(100%, 42px);
            border: 1px solid #b5b5b5;
            background-color: #ffffff;
            border-radius: 3px;
            position: relative;
            .text-overflow();
            > strong,
            > span {
              display: block;
            }

            > strong {
              font-weight: normal;
              height: 20px;
              line-height: 20px;
              padding-top: 2px;
              .text-overflow();
            }

            > span {
              font-size: 12px;
              height: 16px;
              line-height: 16px;
            }
            &.active {
              border-color: @brand-primary;
              color: @brand-primary;
            }
          }

          .sellout {
            background: #d4e7eb;
            cursor: default;
          }
          .selloutFt {
            position: absolute;
            right:3px;
            top:1px;
            color: #df2d2d;
          }
        }
      }
    }
  }
}
//做法分组的分页
.groupClassPager {
  text-align: right;
  padding: 8px 20px;
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.ordering-changemethods-wrap .pager > button {
  .size(42px, 30px);
}

.lang-enUS {
  .ordering-changemethods-form .form-group > .form-control {
    width: 150px;
  }

  .ordering-changemethods-tab{
    display: flex;
    align-items: center;
    > li{
      padding: 0 10px;
      font-size:12px;
      a{
        line-height: 1.2;
        display: flex;
        align-items: center;
      }
    }
  }
  .ordering-changemethods-public-class-list{
    > li{
      padding: 0 6px;
    }
  }
  .ordering-changemethods-form{
    .btn_writingPad{
      font-size: 12px;
      margin-left: 4px;
      padding: 0 4px;
    }
  }
  .ordering-changemethods-public-checkbox {
    padding-top: 0;
    > label{
      display: flex;
      align-items: center;
      white-space: normal;
      width: 221px;

      .el-checkbox__label{
        font-size:12px;
        line-height: 1.2;
      }
    }
  }

}

</style>
