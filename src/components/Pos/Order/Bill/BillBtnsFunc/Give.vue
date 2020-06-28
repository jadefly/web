<template>
  <!-- $t-品项赠送 -->
  <Dialog
    name="PosDialog.Give"
    :title="$t('Dict.ItemPresentation')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="itemPresentSubmit"
    :showSubmit="true"
    top="10vh"
    width="720px"
    :hotkeys="hotKeySet"
    submitId="orderGiveSubmit"
  >
    <div class="item-give">
      <div class="item-give-info">
        <strong>
          <!-- <i></i> -->
          <span>{{ giveData.pointName }}</span>
        </strong>
         <!-- $t-开单时间：, 就餐人数： -->
        <span class="openbill-time">{{$t('Dict.OpeningTime')}}{{ giveData.openTime }}</span>
        <span class="number-guest">{{$t('Biz.Order.DinerPersonNumLabel')}}{{ giveData.peopleQty }}</span>
      </div>
      <div class="item-give-content">
        <div class="give-content-left">
          <!-- $t-选择赠送原因： -->
          <h2>{{$t('Biz.Order.ChooseGiveReason')}}</h2>
          <form id="giveReasonList">
            <button
              type="button"
              class="btn btn-default give-reason"
              :class="{
              'give-reason-active': reasonBtnActive == reason,
              'give-reason-lang': reason.name.length > 5,
            }"
              v-for="(reason, index) in reasons"
              :key="index"
              @click="selectActive(reason)"
            >
              <div>{{reason.name}}</div>
            </button>
          </form>
          <Pager
            pagerId="giveReasonList"
            arrowDirection="up-down"
            itemTag="> button"
            ref="givePager"
          ></Pager>
        </div>
        <div class="give-content-right">
          <ul class="give-cancle-item-nav">
            <!-- $t-可赠菜品, 已赠菜品 -->
            <li
              :class="{'swith-active':currentActive == currentTitle[0] }"
              @click="tabClick(0)"
            >{{ $t('Biz.Order.CanGiveItem') }}({{ cangiftitem.length}})</li>
            <li
              :class="{'swith-active':currentActive == currentTitle[1] }"
              @click="tabClick(1)"
            >{{ $t('Biz.Order.BeenGivenItem') }}({{ havengiftitem.length }})</li>
          </ul>
          <div class="give-cancle-item-content">
            <div class="can-give-item" v-show="currentActive == currentTitle[0]">
              <div class="giveitem-thead">
                <!-- $t-序号,品项,可赠数量,赠送数量 -->
                <span class="head-btn-checkedbox"></span>
                <span class="head-giveitem-order">{{ $t('Dict.SerialNumber') }}</span>
                <span class="head-giveitem-item">{{ $t('Dict.Item') }}</span>
                <span class="head-giveitem-haven">{{ $t('Dict.PresentationNum') }}</span>
                <span class="head-giveitem-giftnumber">{{ $t('Biz.Order.BeenGivenItem') }}</span>
              </div>
              <div class="list-content-div">
                <ul class="list-content" id="giveListId">
                  <li
                    class="giveitem-tbody"
                    @click="handleCheckedCitiesChange(index, canitem)"
                    v-for="(canitem , index) in filterCanGiftItems"
                    :key="index"
                  >
                    <span class="btn-checkedbox" @click.stop>
                      <el-checkbox
                        v-model="canitem.isChecked"
                        @change="handleCheckedCitiesChange(index)"
                      ></el-checkbox>
                    </span>
                    <span class="giveitem-order">{{ index + 1 }}</span>
                    <span class="giveitem-item">
                      {{ canitem.mergeScId ? '['+$t('Dict.Mixing')+']' : '' }}
                      <span
                        v-show="canitem.itemSizeName"
                      >({{ canitem.itemSizeName }})</span>
                      {{ canitem.name }}
                    </span>
                    <span class="giveitem-haven" :class="canitem.auxiliaryUnitId ? 'have-aux-unit': ''">
                      <p>{{canitem.lastQty}}</p>
                      <p v-if="canitem.auxiliaryUnitId">{{canitem.auxiliaryUnitQty}}</p>
                    </span>
                    <span class="giveitem-giftnumber" @click.stop>
                      <!-- isNotFollowAmount判断此套餐是否是联动,isNotFollowAmount为true的时候是不联动要置灰色 只要选中就是全选-->
                      <el-input-number
                        id="orderGiveNumber"
                        :disabled="!!canitem.isNotFollowAmount"
                        v-model="canitem.giftQty"
                        v-num-keyboard:left
                        size="small"
                        @change="handleChange(index)"
                        :min="0"
                        :max="canitem.lastQty"
                        :label="$t('Dict.DescriptiveText')"
                        v-judge
                      ></el-input-number>
                      <span :class="{haveAuxiliary: canitem.auxiliaryUnitId}">{{canitem.unitName}}</span>
                      <!-- 辅助单位数量 -->
                      <el-input-number
                        id="orderGiveAuxiliaryQty"
                        :disabled="!!canitem.isNotFollowAmount
                                  || !canitem.isChecked
                                  || +canitem.giftQty === +canitem.lastQty"
                        v-if="canitem.auxiliaryUnitId"
                        v-model="canitem.giftAuxQty"
                        v-num-keyboard:left
                        size="small"
                        :min="0"
                        :max="canitem.auxiliaryUnitQty"
                        :label="$t('Dict.DescriptiveText')"
                        @change="handleAuxChange(index)"
                        v-judge
                      ></el-input-number>
                      <span v-if="canitem.auxiliaryUnitId">{{canitem.auxiliaryUnitName}}</span>
                    </span>
                    <p
                      v-if="!canitem.pkgFlg && canitem.methodText"
                      class="methodText"
                    >{{ canitem.methodText }}</p>
                  </li>
                  <!-- </el-checkbox-group> -->
                </ul>
              </div>
            </div>
            <div class="haven-give-item" v-show="currentActive == currentTitle[1]">
              <div class="giveitem-thead">
                <!-- $t-序号,品项,可赠数量,赠送数量 -->
                <span class="head-btn-checkedbox"></span>
                <span class="head-giveitem-order">{{ $t('Dict.SerialNumber') }}</span>
                <span class="head-giveitem-item">{{ $t('Dict.Item') }}</span>
                <span class="head-giveitem-haven">{{ $t('Biz.Order.CanGiveItem') }}</span>
                <span class="head-giveitem-giftnumber">{{ $t('Biz.Order.CancelGivenNum') }}</span>
              </div>
              <div class="list-content-div">
                <ul class="list-content" id="cancelGiveListId">
                  <li
                    class="giveitem-tbody"
                    @click="handleCheckedCitiesChange(index, havenitem)"
                    v-for="(havenitem , index)  in filterHavenGiftItem"
                    :key="index"
                  >
                    <span class="btn-checkedbox" @click.stop>
                      <el-checkbox
                        v-model="havenitem.isChecked"
                        @change="handleCheckedCitiesChange(index)"
                      ></el-checkbox>
                    </span>
                    <span class="giveitem-order">{{ index + 1 }}</span>
                    <span class="giveitem-item">
                      {{ havenitem.mergeScId ? '['+$t('Dict.Mixing')+']' : '' }}
                      <span
                        v-show="havenitem.itemSizeName"
                      >({{ havenitem.itemSizeName }})</span>
                      {{ havenitem.name }}
                    </span>
                    <span class="giveitem-haven" :class="havenitem.auxiliaryUnitId ? 'have-aux-unit': ''">
                      <p>{{ havenitem.presentQtyed }}</p>
                      <p v-if="havenitem.auxiliaryUnitId">{{havenitem.auxiliaryUnitQty}}</p>

                      </span>
                    <span class="giveitem-giftnumber" @click.stop>
                      <!-- isNotFollowAmount判断此套餐是否是联动,isNotFollowAmount为true的时候是不联动要置灰色 只要选中就是全选-->
                      <el-input-number
                        v-model="havenitem.cancleQty"
                        :disabled="!!havenitem.isNotFollowAmount"
                        v-num-keyboard:left
                        size="small"
                        @change="handleChange(index)"
                        :min="0"
                        :max="havenitem.presentQtyed"
                        :label="$t('Dict.DescriptiveText')"
                        v-judge
                      ></el-input-number>
                      <span :class="{haveAuxiliary: havenitem.auxiliaryUnitId}">{{havenitem.unitName}}</span>
                      <!-- 辅助单位数量 -->
                      <el-input-number
                        id="orderGiveAuxiliaryQty"
                        :disabled="!!havenitem.isNotFollowAmount
                                  || !havenitem.isChecked
                                  || +havenitem.cancleQty === +havenitem.presentQtyed"
                        v-if="havenitem.auxiliaryUnitId"
                        v-model="havenitem.cancleAuxQty"
                        v-num-keyboard:left
                        size="small"
                        :min="0"
                        :max="havenitem.auxiliaryUnitQty"
                        :label="$t('Dict.DescriptiveText')"
                        @change="handleAuxChange(index)"
                        v-judge
                      ></el-input-number>
                      <span v-if="havenitem.auxiliaryUnitId">{{havenitem.auxiliaryUnitName}}</span>
                    </span>
                    <p v-if="havenitem.methodText" class="methodText">{{ havenitem.methodText }}</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="give-cancle-item-footer">
            <div class="select-all">
              <el-checkbox
                id="orderGiveAll"
                :indeterminate="isIndeterminate"
                v-model="checkAll[currentActive]"
                @change="handleCheckAllChange"
                :label="$t('Dict.SelectAll')"
              ></el-checkbox>
            </div>
            <Search
              class="give-search"
              ref="givSearch"
              @search="onSearch"
              :placeholderText="$t('Dict.QuickSearch')"
              searchId="searchGiveItems"
              :resultLength="currentActive === 'cangiftCheck' ? filterCanGiftItems.length : filterHavenGiftItem.length"
            ></Search>
            <div class="pagerbtn">
              <Pager
                v-if="currentActive == currentTitle[0]"
                pagerId="giveListId"
                scrollMode="simple"
                itemTag="li"
                arrowDirection="up-down"
                ref="givelistPager"
              ></Pager>
              <Pager
                v-else
                pagerId="cancelGiveListId"
                scrollMode="simple"
                itemTag="li"
                arrowDirection="up-down"
                ref="cancelGiveListPager"
              ></Pager>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Search from '@/components/Pos/Order/Tables/Search';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';
// import { post } from '@/common/http/axios';
import quickSearch from '@/common/js/quicksearch';

export default {
  components: { Dialog, Pager, Search },
  mixins: [DialogMixin],
  data() {
    return {
      giveData: {}, // 赠送的所有数据
      reasons: [
        { id: '6', name: '熟客赠送' },
      ],
      // 建立个对象在不同状态下的全选
      checkAll: {
        havengiftCheck: false,
        cangiftCheck: false,
      },
      isIndeterminate: false,
      reasonBtnActive: {}, // 赠送原因激活
      currentTitle: ['cangiftCheck', 'havengiftCheck'],
      currentActive: 'cangiftCheck', // 选项卡切换激活标识
      havengiftitem: [], // 已赠送的品项
      cangiftitem: [], // 还没有赠送的品项
      searchText: '',
    };
  },
  computed: {
    quickSearchText() {
      return quickSearch((`${this.searchText}`).toLowerCase());
    },
    hotKeySet() {
      return {
        PgDn: () => {
          // 提交按钮获得焦点后执行提交
          this.whenSubmitBtnFocus(() => {
            this.itemPresentSubmit();
          });
        },
      };
    },
    filterCanGiftItems() {
      return this.filterItems(this.cangiftitem);
    },
    filterHavenGiftItem() {
      return this.filterItems(this.havengiftitem);
    },
  },
  methods: {
    // 关闭弹框的事件
    onClose() {
      this.init(); // 初始化数据
      this.giveData = {}; // 赠送的所有数据
      this.reasons = [
        { id: '6', name: '熟客赠送' },
      ];
      this.isIndeterminate = false;
      this.currentTitle = ['cangiftCheck', 'havengiftCheck'];
      this.currentActive = 'cangiftCheck'; // 选项卡切换激活标识
      this.searchText = '';
    },
    onOpen() {
      // this.resData 为所有的数据
      this.init(); // 初始化数据
      this.giveData = this.resData;
      this.reasons = this.resData.reasons; // 赠单的原因
      // 如果后台开启了默认的赠送原因,就走默认的原因
      if (this.resData.isShowPresentReason && +this.resData.isShowPresentReason === 1) {
        this.reasonBtnActive = this.reasons.find(item => item.id === this.resData.defaultReason);
      }
      this.resData.serviceContents.forEach((item) => {
        const { ...newItem } = item; // 进行拷贝 不触碰原有的数据
        this.$set(newItem, 'isChecked', false); // isChecked是否被选中
        if (+item.discFlg === 1) {
          this.$set(newItem, 'cancleQty', 0); // 添加个取消赠送的数量数量
          // // 如果存在辅助单位添加 赠送辅助单位的数量
          if (newItem.auxiliaryUnitQty) {
            this.$set(newItem, 'cancleAuxQty', 0);
          }
          this.havengiftitem.push(newItem); // 已赠送的
        } else {
          // 添加属性 giftQty 赠的数量
          this.$set(newItem, 'giftQty', 0);
          // 如果存在辅助单位添加 赠送辅助单位的数量
          if (newItem.auxiliaryUnitId) {
            this.$set(newItem, 'giftAuxQty', 0);
          }
          this.cangiftitem.push(newItem);
        }
      });
      setTimeout(() => {
        this.$refs.givelistPager.refresh();
        this.$refs.givePager.refresh();
      }, 500);
      // 清除搜索框
      this.clearFastSearch();
    },

    // 初始化数据
    init() {
      this.reasonBtnActive = {};
      this.havengiftitem = [];
      this.cangiftitem = [];
      // 初始全选的样式
      this.checkAll.havengiftCheck = false;
      this.checkAll.cangiftCheck = false;
      this.currentActive = 'cangiftCheck';// 初始化下选项卡切换激活标识
    },
    // 原因的选择事件
    selectActive(reason) {
      this.reasonBtnActive = reason;
    },
    tabClick(to) {
      if (this.currentActive !== this.currentTitle[to]) {
        this.clearFastSearch();
      }
      this.currentActive = this.currentTitle[to];
      // 进行分页刷新
      setTimeout(() => {
        if (to) {
          this.$refs.cancelGiveListPager.refresh();
          this.changeAllCheckedState(this.filterHavenGiftItem);
        } else {
          this.$refs.givelistPager.refresh();
          this.changeAllCheckedState(this.filterCanGiftItems);
        }
      }, 100);
    },
    // 辅助单位变化
    handleAuxChange(index) {
      const taleNumTest = /^[1-9]\d*$/g;
      setTimeout(() => {
        let items = this.filterHavenGiftItem;
        // 已赠和要取消赠送的辅助数量的key 和总数的key
        let auxNumKey = 'cancleAuxQty';
        let numKey = 'presentQtyed';
        if (this.currentActive === 'cangiftCheck') {
          items = this.filterCanGiftItems;
          auxNumKey = 'giftAuxQty';
          numKey = 'lastQty';
        }
        const auxQty = items[index][auxNumKey];
        if (!taleNumTest.test(auxQty)) {
          this.$message.warning(this.$t('Dict.Validate.NumberMessage')); // 请输入正确数量
          this.$set(items[index], auxNumKey, auxQty.toString().substr(0, auxQty.toString().length - 1));
        }
        if (auxQty === 0) {
          this.$message.warning(this.$t('Dict.MinmumMessage', [1])); // 最小数判断
          items[index][auxNumKey] = 1;
        }
        // 如果赠送不是全部赠送话 辅助单位数也不能为全部
        // if (+items[index][auxNumKey] < items[index][numKey]) {
        //   if (+auxQty === +items[index].auxiliaryUnitQty) {
        //     items[index].giftAuxQty = auxQty - 1;
        //   }
        // }
      });
    },
    // 加减监听事件
    handleChange(index) {
      // 这未赠的品项操作 setTimeout 这是饿了吗的 @change感觉有点问题加个setTimeout
      setTimeout(() => {
        const items = (this.currentActive === 'cangiftCheck') ? this.filterCanGiftItems : this.filterHavenGiftItem;
        // 现操作的品项数量 判断 是可赠区域还是已赠区域的
        // 已赠和要取消赠送的辅助数量的key 和总数的key
        const auxNumKey = items[index].giftQty ? 'giftAuxQty' : 'cancleAuxQty';
        const numKey = items[index].giftQty ? 'lastQty' : 'presentQtyed';
        const num = items[index].giftQty ? items[index].giftQty : items[index].cancleQty;
        if (num > 0) {
          this.$set(items[index], 'isChecked', true);
          this.changeAllCheckedState(items);
          // 辅助数量的处理逻辑
          if (items[index].auxiliaryUnitId) {
            // 如果全部赠送话 辅助数量也是全部
            if (Number(num) === items[index][numKey] && items[index].auxiliaryUnitQty) {
              items[index][auxNumKey] = items[index].auxiliaryUnitQty;
              // 如果当前不是全部赠送后者取消赠送 辅助数量不能为最大值
            }
            // 如果辅助单位为0 变为1
            if (+items[index][auxNumKey] === 0) {
              items[index][auxNumKey] = 1;
            }
          }
        } else {
          this.$set(items[index], 'isChecked', false);
          // 存在辅助单位
          if (items[index].auxiliaryUnitId) {
            items[index][auxNumKey] = 0;
          }
          if (this.checkAll[this.currentActive]) {
            this.checkAll[this.currentActive] = false;
          }
        }
      }, 0);
    },
    // 选中按钮事件
    handleCheckedCitiesChange(index, item) {
      // 可赠品项
      if (this.currentActive === 'cangiftCheck') {
        if (item) {
          Object.assign(item, {
            isChecked: !item.isChecked,
          });
        }
        const nowCangiftItem = this.filterCanGiftItems[index];
        // 如果这个是被选中判断是否需要全选对应勾上
        if (nowCangiftItem.isChecked) {
          this.$set(nowCangiftItem, 'giftQty', nowCangiftItem.lastQty);
          // 对应设置下辅助编码
          if (nowCangiftItem.auxiliaryUnitId) {
            this.$set(nowCangiftItem, 'giftAuxQty', nowCangiftItem.auxiliaryUnitQty);
          }
          this.changeAllCheckedState(this.filterCanGiftItems);
        } else {
          this.$set(nowCangiftItem, 'giftQty', 0);
          // 对应设置下辅助编码
          if (nowCangiftItem.auxiliaryUnitId) {
            this.$set(nowCangiftItem, 'giftAuxQty', 0);
          }
          this.checkAll[this.currentActive] = false;
        }
        // 已赠品项
      } else {
        if (item) {
          Object.assign(item, {
            isChecked: !item.isChecked,
          });
        }
        const nowHavengiftitem = this.filterHavenGiftItem[index];
        // 如果这个是被选中判断是否需要全选对应勾上
        if (nowHavengiftitem.isChecked) {
          this.$set(nowHavengiftitem, 'cancleQty', nowHavengiftitem.presentQtyed);
          // 对应设置下辅助编码
          if (nowHavengiftitem.auxiliaryUnitId) {
            this.$set(nowHavengiftitem, 'cancleAuxQty', nowHavengiftitem.auxiliaryUnitQty);
          }
          this.changeAllCheckedState(this.filterHavenGiftItem);
        } else {
          this.$set(nowHavengiftitem, 'cancleQty', 0);
          // 对应设置下辅助编码
          if (nowHavengiftitem.auxiliaryUnitId) {
            this.$set(nowHavengiftitem, 'cancleAuxQty', 0);
          }
          this.checkAll[this.currentActive] = false;
        }
      }
    },
    // 选中联动全选
    changeAllCheckedState(items) {
      const findItem = items.filter(item => !item.isChecked);
      if (!findItem.length && items.length) {
        this.checkAll[this.currentActive] = true;
      } else {
        this.checkAll[this.currentActive] = false;
      }
    },
    // 全选的按钮事件
    handleCheckAllChange(value) {
      if (value) {
        // 判断进行执行方法
        if (this.currentActive === 'cangiftCheck') {
          this.allCheckedFn(this.filterCanGiftItems, true);
        }
        if (this.currentActive === 'havengiftCheck') {
          this.allCheckedFn(this.filterHavenGiftItem, false);
        }
      } else {
        if (this.currentActive === 'cangiftCheck') {
          this.cancelCheckedFn(this.filterCanGiftItems);
        }
        if (this.currentActive === 'havengiftCheck') {
          this.cancelCheckedFn(this.filterHavenGiftItem);
        }
      }
    },
    // 全选函数
    allCheckedFn(items, isCangiftCheck) {
      items.forEach((item) => {
        this.$set(item, 'isChecked', true);
        if (isCangiftCheck) {
          this.$set(item, 'giftQty', item.lastQty);
        } else {
          this.$set(item, 'cancleQty', item.presentQtyed);
        }
      });
    },
    // 取消全选
    cancelCheckedFn(items) {
      items.forEach((item) => {
        this.$set(item, 'isChecked', false);
        if (item.giftQty) {
          this.$set(item, 'giftQty', 0);
        } else {
          this.$set(item, 'cancleQty', 0);
        }
      });
    },
    // 快速查找
    onSearch(searchText) {
      this.searchText = searchText;
      setTimeout(() => {
        this.$refs.givelistPager.refresh();
        this.$refs.givePager.refresh();
      }, 500);
    },
    // 过滤品项
    filterItems(list) {
      let filterList = [];
      filterList = list.filter((item) => {
        const keyFilters = this.quickSearchText;
        let resultItem;
        for (let i = 0; i < keyFilters.length; i += 1) {
          const key = keyFilters[i];
          if (
            String(item.code).toLowerCase().indexOf(key) !== -1
            || item.pinyin.toLowerCase().indexOf(key) !== -1
            || item.name.toLowerCase().indexOf(key) !== -1
          ) {
            resultItem = true;
          }
        }
        return !keyFilters.length || resultItem;
      });
      return filterList;
    },
    // 清空快速搜索
    clearFastSearch() {
      if (this.$refs.givSearch) {
        this.$refs.givSearch.clearSearchText();
      }
    },
    // 确认按钮事件
    itemPresentSubmit(authData = {}) {
      const submitListData = []; // 搜集要赠送品项和取消赠送品项的信息
      this.filterCanGiftItems.forEach((item) => {
        if (item.isChecked) {
          this.submitDataItem(submitListData, item);
        }
      });
      if (!this.reasonBtnActive.id && submitListData.length > 0) {
        this.$message({
          type: 'error',
          // message: '请选择原因',
          message: this.$t('Biz.Order.OrderOptMsg09'),
        });
        return false;
      }
      this.filterHavenGiftItem.forEach((item) => {
        if (item.isChecked) {
          this.submitDataItem(submitListData, item);
        }
      });
      if (submitListData.length === 0) {
        this.$message({
          type: 'error',
          // message: '没有可变动的数据',
          message: this.$t('Biz.Order.OrderOptMsg10'),
        });
        return false;
      }
      this.$vonce('authCode', (code2) => {
        this.itemPresentSubmit(code2);
      });

      // 提交的数据
      const params = {
        pointId: this.giveData.pointId, // 客位id
        bsId: this.giveData.bsId, // 营业流水id
        items: submitListData, // 品项数据
        isAfterBizCheck: true, // 前置校验小卖不需要
        modifyTime: +new Date(this.giveData.modify_time.replace('T', ' ')), // 时间戳
        ...authData,
      };
      // 请求接口
      ajax('canyin.pos.BillBtnsApi.presentItem.presentItem', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        this.close();
        if (!this.reasonBtnActive.id && submitListData.length > 0) {
          this.submit(data.success, 2);
        } else {
          this.submit(data.success, 1);
        }
      });
      return false;
      // //请求接口
      // ajax('canyin.pos.BillBtnsApi.presentItem.presentItem',{
      //   contentType: 'URLEncoded',
      //   data: params
      // }).then(data => {
      //   console.log(data)
      // })
    },
    // 整理的items
    submitDataItem(itemArr, item) {
      // if(item.giftQty) {
      //   if(typeof(item.giftQty) != 'number') {
      //     this.$message({
      //       type: 'error',
      //       message: '存在无效的数字'
      //     })
      //   }
      // }
      // 整理数据
      const Newitem = {};
      Newitem.itemId = item.itemId;// 品项id
      Newitem.itemType = item.itemType;// 品项类型（临）
      Newitem.pkgType = item.pkgType;// 套餐类型
      Newitem.itemSmallClassId = item.smallClassId;// 小类id
      Newitem.itemSizeId = item.itemSizeId;// (多)规格id
      Newitem.scId = item.scId;// 服务内容id
      if (item.giftQty) {
        Newitem.qty = item.giftQty;
        if (item.auxiliaryUnitId) {
          Newitem.auxiliaryUnitQty = item.giftAuxQty;
        }
      } else {
        Newitem.qty = (item.presentQtyed * 1000 - item.cancleQty * 1000) / 1000; // 赠送数量
        //
        if (item.auxiliaryUnitId) {
          Newitem.auxiliaryUnitQty = item.cancleAuxQty;
        }
      }
      // 如果存在辅助单位
      if (item.auxiliaryUnitId) {
        Newitem.auxiliaryUnitName = item.auxiliaryUnitName;
        Newitem.auxiliaryUnitId = item.auxiliaryUnitId;
      }
      Newitem.lastQty = (item.presentQtyed * 1000 - Newitem.qty * 1000) / 1000;// 可赠数量
      Newitem.origQty = item.origQty;// 原始数量
      Newitem.price = item.price;// 价格
      Newitem.presentMoney = Newitem.qty * (item.price * 1000) / 1000;// 赠送金额
      Newitem.discFlg = item.discFlg;// 折扣标识
      // item.discFlg = 1;//折扣标识
      Newitem.reasonId = this.reasonBtnActive.id;// 原因id
      Newitem.type = 1; // 变化类型
      // 变化数量，用于后端验证。当增加的时候，为正数，否则为负数。
      Newitem.count = (Newitem.qty * 1000 - item.presentQtyed * 1000) / 1000;
      Newitem.isNotFollowAmount = !!item.isNotFollowAmount; // 针对套餐isNotFollowAmount 为true是不联动否则为联动
      itemArr.push(Newitem);
    },
  },
  watch: {
    filterCanGiftItems(newValue, oldValue) {
      if (this.currentActive === 'cangiftCheck' && newValue.length !== oldValue.length) {
        this.changeAllCheckedState(newValue);
      }
    },
    filterHavenGiftItem(newValue, oldValue) {
      if (this.currentActive === 'havengiftCheck' && newValue.length !== oldValue.length) {
        this.changeAllCheckedState(newValue);
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.item-give {
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;
  > .item-give-info {
    line-height: 48px;
    height: 48px;

    > strong {
      font-size: 14px;
      color: #f24f64;
      > i {
        width: 20px;
        height: 20px;
        background-image: url("~@/common/images/pos/exitBill/table-number.png");
        background-repeat: no-repeat;
        background-size: 100%;
        display: inline-block;
        vertical-align: text-top;
      }
    }
    > .number-guest {
      margin-left: 23px;
      font-size: 14px;
      font-weight: 400;
    }
    > .openbill-time {
      margin-left: 27px;
      font-size: 14px;
      font-weight: 400;
    }
  }
  > .item-give-content::after {
    content: "";
    display: block;
    clear: both;
  }
  > .item-give-content {
    > .give-content-left {
      position: relative;
      padding-top: 36px;
      padding-bottom: 55px;
      width: 145px;
      height: 528px;
      float: right;
      padding-left: 16px;
      padding-right: 16px;
      background-color: #fff;
      > h2 {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 36px;
        font-size: 15px;
        font-weight: 900;
        padding-top: 11px;
        padding-bottom: 8px;
        padding-left: 15px;
      }
      > .pos-pager {
        position: absolute;
        bottom: 12px;
        left: 0;
        width: 100%;
        text-align: center;
      }
      > form {
        height: 100%;
        > .give-reason {
          display: block;
          width: 112px;
          height: 45px;
          font-size: 15px;
          font-weight: 500;
          margin-top: 7px;

          > div {
            white-space: normal;
            display: -webkit-box;
            word-break: break-all;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
          }
        }

        > .give-reason-lang {
          font-size: 12px;
        }

        > .give-reason:hover {
          color: #000;
          background-color: #defcff;
        }

        > .give-reason-active {
          color: #fff !important;
          background-color: #0097a4 !important;
        }
      }
    }

    > .give-content-right {
      margin-right: 155px;
      background-color: #fff;

      > .give-cancle-item-nav {
        height: 45px;
        line-height: 45px;
        font-size: 17px;
        text-align: center;
        border-bottom: 1px solid #e4e4e4;
        > li {
          position: relative;
          width: 140px;
          display: inline-block;
          cursor: pointer;
        }
        > .swith-active {
          font-weight: bolder;
          color: #0097a4;
        }
        > .swith-active::after {
          position: absolute;
          content: "";
          left: 0;
          bottom: 1px;
          width: 100%;
          height: 2px;
          background-color: #0097a4;
        }
        > li:first-child {
          margin-right: 10px;
        }
        > li:last-child {
          margin-left: 10px;
        }
      }
      > .give-cancle-item-content {
        > .can-give-item,
        .haven-give-item {
          > .giveitem-thead {
            border-bottom: 1px solid #ccc;
            font-size: 12px;
            height: 37px;
            line-height: 37px;
            color: #666;

            > span {
              display: inline-block;
              text-align: center;
            }
            > .head-btn-checkedbox {
              width: 8%;
            }
            > .head-giveitem-order {
              width: 8%;
            }
            > .head-giveitem-item {
              width: 26%;
            }
            > .head-giveitem-haven {
              width: 18%;
            }
            > .head-giveitem-giftnumber {
              width: 25%;
            }
          }
          > .list-content-div {
            height: 392px;
            > .list-content {
              height: 392px;
              overflow-y: auto;

              > .giveitem-tbody {
                border-bottom: 1px solid #e4e4e4;
                position: relative;

                > span {
                  max-height: 48px;
                  text-align: center;
                  vertical-align: middle;
                  font-size: 14px;
                  font-weight: 600;
                  display: inline-block;
                  overflow: hidden;
                }

                > .btn-checkedbox {
                  width: 8%;
                }

                > .giveitem-order {
                  width: 8%;
                  height: 48px;
                  line-height: 48px;
                }
                > .giveitem-item {
                  width: 25%;
                }
                > .giveitem-haven {
                  width: 16%;
                  &.have-aux-unit {
                    max-height: 84px;
                    >p {
                      height: 34px;
                      line-height: 34px;
                    }
                  }
                }
                > .giveitem-giftnumber {
                  width: 28%;
                  max-height: 84px;
                  >span{
                    position: absolute;
                    width: 58px;
                    margin-left: 4px;
                    overflow: hidden;
                    white-space: nowrap;
                    top: 16px;
                    &.haveAuxiliary {
                      top: 10px;
                    }
                    &:nth-of-type(2) {
                      top: 46px;
                    }
                  }
                  >.el-input-number:nth-of-type(1) {
                    margin-top: 4px;
                    margin-bottom: 2px;
                  }
                  >.el-input-number:nth-of-type(2) {
                    margin-top: 2px;
                    margin-bottom: 4px;
                  }
                }
              }
            }
          }
        }
      }
      > .give-cancle-item-footer::after {
        content: "";
        display: block;
        clear: both;
      }
      > .give-cancle-item-footer {
        position: relative;
        height: 53px;
        padding: 6px 12px;
        .give-search {
          .clearfix();
        }
        > .pagerbtn {
          position: absolute;
          top: 12px;
          right: 12px;
          text-align: right;
        }
        > .select-all {
          float: left;
          width: 65px;
          height: 30px;
          margin-top: 6px;
          border: 1px solid #ddd;
          text-align: center;
          line-height: 30px;
          background-color: #f1f6f8;
        }
      }
    }
  }
}
.methodText {
  padding-left: 16%;
}
.lang-enUS{
  .item-give > .item-give-content > .give-content-right > .give-cancle-item-nav > li {
    width: 41%;
  }
  .item-give > .item-give-content > .give-content-right > .give-cancle-item-nav {
    font-size: 14px;
  }
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.item-give .give-cancle-item-footer .pos-order-tables-search {
  position: relative;
  margin-top: 4px;
  margin-left: 12px;
  border: 1px solid #b5b5b5;
}
</style>
