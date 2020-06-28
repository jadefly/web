<!--临时作为微生活模块开发，原始的是人民币结算方式，后面让后台单独添加一个微生活结算方式-->
<template>
  <Dialog
    name="PosDialog.PayWayFishCoolModal"
    title="鱼酷会员卡"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayEasyLifeModal"
    :append-to-body="true"
    :showSubmit="true"
    submit-text="结算"
    width="728px"
    id="PayWayEasyLifeModal">
    <div class="easy-life body">
      <!--左侧布局-->
      <div class="list-area body-left" v-keyboard:keyboard>
        <p>{{$t('Biz.Settlement.EnterMemberCardOrPhone')}}</p>
        <!--查询搜索框-->
        <div class="item search-item">
          <div class="search">
            <el-select
              class="my-select"
              v-model="searchType"
              @visible-change="activeFocus"
              placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <input
              ref="searchInput"
              class="my-input"
              maxlength="18"
              v-model="searchText"
              :class="whichFocus === 'cardNo' ? 'focus' : ''"
              @keyup="InputIntNumber('searchText')"
              @focus="whichFocus = 'cardNo'"
              @blur="whichFocus = ''"
              v-autotest />
          </div>
          <div class="search-btn">
            <button
              type="button"
              @click="PayWayEasyLifeModal.Enter"
              class="btn btn-primary"
              v-autotest>
              {{$t('Dict.Search')}}(Enter)
            </button>
          </div>
        </div>
        <!--列表数据-->
        <div class="list">
          <p class="list-title">{{$t('Biz.Settlement.ChooseElectronicCoupons')}}:</p>
          <div class="table-body">
            <ul>
              <li
                v-for="(item, index) in showTicksLists"
                :key="index"
                class="as-ticks-btn"
                :class="{'checked': item.checked, 'limit': limit && !item.checked}"
                @click="chooseTicksClickHandler(item)">
                <div class="td-left-div">
                  <p>{{ item.name }}</p>
                  <p>{{$t('Dict.TermOfValidity')}}{{$t('Dict.To')}}：{{ formatDate(+item.expireDate) }}</p>
                </div>
                <div class="td-right-div">{{item.reduceCost | keepTwo}}</div>
              </li>
            </ul>
          </div>
        </div>
        <!--分页按钮-->
        <div class="pos-pager pos-takeout-pager">
          <span class="page-info">
            {{$t('Dict.PageStyle.Text1', { length: ticksLists.length, currentPage: currentPage, totalPage: pageCount(ticksLists) })}}
          </span>
          <button class="prev" :disabled="preBtnDisabled" @click="upPage">
            <i class="el-icon-arrow-up"></i>
          </button>
          <button class="next" :disabled="nextBtnDisabled" @click="downPage(ticksLists)">
            <i class="el-icon-arrow-down"></i>
          </button>
        </div>
      </div>
      <!--右侧布局-->
      <div class="money-area body-right">
        <div class="item to-be-pay">
          <div>
            <span class="title"><b>{{$t('Biz.Settlement.BillPayment')}}</b></span>
            <div class="content"><span class="payouts-money">{{amountToBePaid | keepTwo}}</span></div>
          </div>
          <div>
            <span class="title"><b>{{$t('Biz.Settlement.ElectronicCouponSettle')}}：</b></span>
            <div class="content">
              <span class="payouts-money">{{ticketsAccount | keepTwo}}</span>
            </div>
          </div>
        </div>
        <div class="info-area">
          <div class="detail-info">
            <div class="detail-info-head">
              <strong>{{ accountInfo.mobile }}</strong>
              <img
                v-if="+accountInfo.gender === 1"
                src="@/common/images/sl-msg/icon_male.png"
                alt="性别男">
              <img
                v-if="+accountInfo.gender === 2"
                src="@/common/images/sl-msg/icon_female.png"
                alt="性别女">
            </div>
            <table>
              <tr>
                <td colspan="2">{{ accountInfo.memberName }}</td>
              </tr>
              <tr>
                <td>微信会员卡号:</td>
                <td>{{ accountInfo.wechatCode }}</td>
              </tr>
            </table>
          </div>
          <div class="keybord-content">
            <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
          </div>
        </div>
      </div>
    </div>
    <AndroidInput ref="AndroidInput"></AndroidInput>
  </Dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { find, cloneDeep, isEmpty } from 'lodash';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import * as KeyboardUtil from '@/plugin/keyboard/util';
import { add, div } from '@/common/js/math';

export default {
  components: {
    Dialog,
    KeyBoard,
    AndroidInput,
  },
  mixins: [DialogMixin, PageMixin, AndroidInputMixin],
  data() {
    return {
      resData: null,
      searchText: '', // 搜索条件
      searchTextCache: '', // 搜索条件缓存 用于对比搜索条件是否变化  无变化不执行查询操作
      prePageSize: 6, // 每页6条数据
      ticksLists: [], // 电子券列表
      tickets: 0, // 电子券结算
      accountInfo: {}, // 账户明细
      whichFocus: '', // 输入框聚焦时改变css样式
      limit: false, // 电子券的可点击状态
      options: [
        {
          value: '1',
          label: '卡号',
        }, {
          value: '2',
          label: '手机号',
        },
      ],
      searchType: '1',
      ticketsEntry: {}, // 已使用券的id和{ 已用数量，限制数量 }的映射。用来在添加券时判断相同id的券是否超过了限制数量
      score: 0, // 券添加操作的计数器，每添加成功一次券，score加1并给券添加到属性上，通过排序来保证添加券的有序性
      canSearch: true,
    };
  },
  props: {
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
    bsId: {
      default: 0,
    },
    pointId: {
      default: 0,
    },
    teamBsIds: {
      default: '',
    },
    // 结算界面已收款金额
    actualPay: {
      default: 0,
    },
    // 已添加结算方式
    payWayList: {
      type: Array,
      default: () => [],
    },
    // 所有活动方案列表
    discTypeList: {
      type: Array,
      default: () => [],
    },
    payThenDiscountFlg: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters([
      'posBaseInfo',
    ]),
    // 添加快捷键
    PayWayEasyLifeModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        Enter: this.throttle(this.search, 2000),
        BackSpace: () => {
          this.delWordInBlur();
        },
        ...this.setKeySearchHotKey(),
      };
    },
    /**
     * 当前页的券列表
     */
    showTicksLists() {
      return this.pagination(this.currentPage, this.prePageSize, this.ticksLists);
    },
    /**
     * 当前已选中的券的数组
     * 这里做了排序，用于维护券的添加顺序，先添加券的score值小于后添加的
     */
    currentChooseTicks() {
      const checkedArr = this.ticksLists.filter(item => item.checked);
      return checkedArr.sort((a, b) => a.score - b.score);
    },
    /**
     * 当前选择的电子券总面值
     * 这里计算了已添加品项对应的菜品券的面值，用于显示当前菜品券抵扣了多少钱
     */
    ticketsAccount() {
      return this.currentChooseTicks.reduce((total, item) => {
        if (item.productId) {
          const data = this.judgeItem(item);
          if (data && data.length > 0) {
            const { lastSubTotal, lastQty } = data[0];
            return add(total, div(lastSubTotal, lastQty));
          }
        }
        return add(total, (+item.reduceCost));
      }, 0) || 0;
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val) || 0.00;
    },
  },
  methods: {
    ...mapActions([
      'setSettleDiscType',
    ]),
    onOpen() {
      this.$nextTick(() => {
        this.$refs.searchInput.focus();
      });
      this.score = 0;
      this.limit = false;
      this.currentPage = 1;
      this.searchText = '';
      this.canSearch = true;
      // 每次进入, 默认选中输入内容
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    /**
     * 输入卡号后点击查询
     */
    async search() {
      if (!this.searchText) {
        this.$message.error('请输入会员卡号或手机号');
        return;
      }
      // 每次查询前先撤销掉结算页面已经添加的鱼酷券，防止多卡结算
      await this.fishCoolUndo();
      // 撤销成功后刷新账单
      this.$emit('refreshBill', '1');
      const { memberInfo, couponList } = await this.getFishCoolSearchApi();
      if (!this.canSearch) return;
      this.canSearch = false;
      setTimeout(() => {
        this.canSearch = true;
      }, 30000);
      this.ticketsEntry = {};
      this.currentPage = 1;
      this.preBtnDisabled = true;
      this.nextBtnDisabled = false;
      this.accountInfo = memberInfo || {};
      this.addProperty(couponList);
      this.ticksLists = this.countDishPrice(this.filterDiscount(couponList)) || [];
      this.activeFirstOne(this.ticksLists);
    },
    /**
     * 调用鱼酷查询接口
     */
    getFishCoolSearchApi() {
      const params = {
        bsId: this.bsId, // 流水id
      };
      if (this.searchType === '1') {
        Object.assign(params, {
          wechatCode: this.searchText,
          mobile: '',
        });
      } else {
        Object.assign(params, {
          wechatCode: '',
          mobile: this.searchText,
        });
      }
      return ajax('canyin.pos.settlement.pay.yukupayway.getmemberinfo', {
        contentType: 'URLEncoded',
        data: params,
      });
    },
    /**
     * 撤销鱼酷结算方式
     */
    fishCoolUndo() {
      return ajax('canyin.pos.settlement.pay.yukupayway.unsettle', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId, // 流水id
          paywayid: '55',
          payMoney: this.amountToBePaid,
        },
      });
    },
    /**
     * 已添加的结算方式中是否有其他代金券或者折扣优惠，根据type来区分
     * type = discount 是折扣券，其他是代金券
     */
    findOtherVoucher(type) {
      const voucherList = [];
      if (this.payWayList.length > 0) {
        for (let i = 0; i < this.payWayList.length; i += 1) {
          let condition;
          if (type === 'discount') {
            condition = this.payWayList[i].dpId; // 折扣类优惠
          } else {
            condition = this.payWayList[i].payway_type_id === '506'; // 代金券
          }
          if (condition) {
            const obj = this.payWayList[i];
            Object.assign(obj, {
              payway_name: obj.name,
              pay_money: obj.attrs ? obj.attrs.pay_money : obj.take_money,
              ticket_value: obj.attrs ? obj.attrs.ticket_value : obj.ticket_value,
              ticket_count: obj.attrs ? obj.attrs.ticket_count : obj.ticket_count,
              no_give_chan: obj.attrs ? obj.attrs.no_give_chan : obj.no_give_chan,
              remark: obj.attrs ? obj.attrs.remark : obj.remark,
              is_deposit: 0,
              give_change: 0,
              sort_order: i + 1,
            });
            voucherList.push(obj);
          }
        }
      }
      return voucherList.length > 0 ? voucherList : null;
    },
    /**
     * 核销鱼酷的接口，clearAll为true时撤销所有券
     */
    useOrCancel(clearAll = false) {
      const { memberName, mobile, wechatCode } = this.accountInfo;
      const allPayMoney = this.currentChooseTicks.reduce((total, item) => add(total, item.ticketpaymoney), 0);
      let useCoupons = '';
      if (clearAll) {
        useCoupons = [];
      } else {
        useCoupons = cloneDeep(this.currentChooseTicks);
        useCoupons.forEach(item => item.productId = item.requestProductId);
      }
      const params = {
        wechatCode,
        mobile,
        memberName,
        bsId: this.bsId,
        allPayMoney: clearAll ? '0' : allPayMoney,
        useCoupons: JSON.stringify(useCoupons),
        payway_list: JSON.stringify(this.findOtherVoucher('voucher')),
      };
      return ajax('canyin.pos.settlement.pay.yukupayway.ensureverify', {
        contentType: 'URLEncoded',
        data: params,
      });
    },
    /**
     * 包装的核销券的方法
     */
    useOrCancelHandle(checked, item) {
      this.useOrCancel().then(() => {
        this.limit = false;
        if (item.discount) {
          this.$emit('refreshBill');
        } else {
          this.$emit('refreshBill', '1');
        }
        this.canSearch = true;
      }).catch((errCode, errMsg) => { // 如果接口请求失败  将选中的券取消掉
        this.$alert(errMsg, '提示', {
          customClass: 'ajax-error-alert',
        });
        this.limit = false;
        this.canSearch = true;
        Object.assign(item, {
          checked: !checked,
        });
        try {
          this.createEntry(!checked, item);
        } catch (e) {
          this.$message.error(e);
        }
      });
    },
    /**
     * 两个数组取交集，用于判断菜品或折扣券和已添加的品项之间是否满足使用要求
     * 使用菜品券必须要添加对应的品项
     * 使用折扣券，对应的折扣方案必须绑定了已添加的品项
     */
    intersection(arr1, arr2) {
      if (!Array.isArray(arr1)) {
        arr1 = [...arr1];
      }
      if (!Array.isArray(arr2)) {
        arr2 = [...arr2];
      }
      arr1.sort((a, b) => a - b);
      const all = new Array(arr1[arr1.length - 1] + 1);
      arr1.forEach((item) => {
        all[item] = item;
      });
      const result = [];
      arr2.forEach((item) => {
        if (all[item.itemCode]) {
          result.push(item);
        }
      });
      return result.length > 0 ? result : null;
    },
    // 默认选中第一个
    activeFirstOne(list) {
      if (list.length > 0) {
        this.chooseTicksClickHandler(list[0]);
      }
    },
    /**
     * 如果是菜品券，判断已添加的品项中是否有此菜品，没有的话不能用
     */
    judgeItem(item) {
      const { settlementData } = this.resData;
      if (item.productId) {
        return this.intersection(item.productId, settlementData.pointBillList); // 返回null或非空数组
      }
      return [];
    },
    /**
     * 过滤出满足条件的券
     */
    filterDiscount(list) {
      // item.discount === 0
      // 暂时不允许折上折
      // const hasOtherDiscount = this.findOtherVoucher('discount');
      // if (hasOtherDiscount) {
      //   return list.filter(item => item.discount
      //     && this.againstUnonlineActive(item)
      //     && this.canUseShopList(item)
      //     && this.canUseTicks(item)
      //     && this.judgeItem(item));
      // }
      return list.filter(item => this.againstUnonlineActive(item)
        && this.canUseShopList(item)
        && this.canUseTicks(item)
        && this.judgeItem(item));
    },
    /**
     * 判断券是否满足启用金额
     */
    canUseTicks(item) {
      if (+item.leastCost === 0) return true;
      return this.amountToBePaid >= +item.leastCost;
    },
    /**
     * 判断相同券的使用张数上限 最小值为1
     */
    mostCanUse(addOrDel, item) {
      if (!addOrDel) return true; // 删除券不做校验
      if (!this.ticketsEntry) return true; // 说明是第一张券，肯定不会超过限制
      const entry = this.ticketsEntry[item.id];
      if (!entry) return true; // 说明第一次添加此类型的券，肯定不会超过限制
      return (entry.amount + 1) <= entry.base.useLimit;
    },
    /**
     * 创建一个哈希表来维护添加新券，或删除已添加券的操作
     * { id: { amount: 1, base: item } }
     * amount为当前数量 base为当前操作的菜品
     * 添加券时数量默认为1，当再次添加相同券时数量对应增加。
     * 删除券时数量减1，当数量小于1时，从表中删除此条数据
     */
    createEntry(addOrDel, item) {
      if (!this.ticketsEntry) this.ticketsEntry = Object.create(null);
      const ticketsInfo = this.ticketsEntry[item.id];
      if (ticketsInfo) {
        let num = ticketsInfo.amount;
        if (addOrDel) {
          num += 1;
          ticketsInfo.amount = num;
        } else if (num > 1) {
          num -= 1;
          ticketsInfo.amount = num;
        } else {
          delete this.ticketsEntry[item.id];
        }
      } else {
        this.ticketsEntry[item.id] = {
          amount: 1,
          base: item,
        };
      }
    },
    /**
     * 查询后计算所有菜品券的抵扣金额
     * 这里计算了，那么计算属性中的计算菜品金额逻辑应该可以删除掉
     */
    countDishPrice(list) {
      list.map((item) => {
        if (item.productId) { // 如果是菜品券，从账单中获取菜品的价格 (小计/数量)
          const data = this.judgeItem(item);
          if (data && data.length > 0) {
            const { lastSubTotal, lastQty } = data[0];
            item.reduceCost = div(lastSubTotal, lastQty);
          }
        }
        return item;
      });
      return list || [];
    },
    /**
     * 计算每张券的实际抵扣金额ticketpaymoney
     * 当添加操作时 券的实际抵扣金额最大不超过本身金额
     * 当删除操作时，如果之前添加的券的抵扣金额有少于本身金额的，将删除券的抵扣金额加到此券上
     * 栗子：账单金额100，券A（50元）券B（40元）券C（30元）
     * 此时券C实际抵扣金额为100-50-40=10元，而C本身金额为30元。
     * 删除掉券B，100-50-10=40元，券C实际抵扣金额少于本身金额，所以把删除券的金额加到券C上
     * 增加的金额最大不能超过券C本身金额
     */
    countTicketPayMoney(addOrDel, item) {
      if (addOrDel) { // 如果是添加券操作
        if (item.productId) { // 如果是菜品券，从账单中获取菜品的价格 (小计/数量)
          const data = this.judgeItem(item);
          if (data && data.length > 0) {
            const { lastSubTotal, lastQty } = data[0];
            const num = div(lastSubTotal, lastQty);
            if (this.amountToBePaid >= num) {
              item.ticketpaymoney = num;
            } else {
              item.ticketpaymoney = this.amountToBePaid;
            }
            // 菜品券可以抵扣[1,2,3]，加单只加了
            item.requestProductId = data[0].itemCode;
          } // 如果是代金券(赞不考虑折扣券的金额)
        } else if (this.amountToBePaid >= item.reduceCost) { // 如果是代金券 并且小于等于待付金额
          item.ticketpaymoney = item.reduceCost;
        } else { // 如果是代金券 并且大于待付金额
          item.ticketpaymoney = this.amountToBePaid;
        }
      } else { // 如果是删除券操作
        this.smartComputed(item);
        item.ticketpaymoney = 0;
      }
    },
    // 如果剩余选中的券A，面值大于实际抵扣金额，那么把当前删除的这张券的抵扣金额叠加到A里
    smartComputed(item) {
      const arr = this.currentChooseTicks.filter(son => son.ticketpaymoney < son.reduceCost);
      let num = item.ticketpaymoney;
      if (arr.length > 0) {
        let i = 0;
        while (num !== 0) {
          if (add(arr[i].ticketpaymoney, num) >= arr[i].reduceCost) { // 12 + 5 > 15  12 + 5 = 17
            num = 0;
            arr[i].ticketpaymoney = arr[i].reduceCost;
          } else { // 12 + 5 < 20
            arr[i].ticketpaymoney = add(arr[i].ticketpaymoney, num);
            num = 0;
          }
          i += 1;
        }
      }
    },
    /**
     * 判断互斥券，已添加的券中是否和当前要添加的券互斥
     */
    againstTicks(addOrDel, list, item) {
      if (!addOrDel) return true; // 删除券不做校验
      let againstArr = [];
      const entryArr = Object.keys(this.ticketsEntry);
      if (entryArr.length === 0) return true; // 说明之前未添加过券，肯定不会互斥
      entryArr.forEach((key) => {
        const son = this.ticketsEntry[key].base;
        if (son.mutexCouponList) {
          againstArr = againstArr.concat(son.mutexCouponList);
        }
      });
      return againstArr.indexOf(item.id) < 0;
    },
    /**
     * 判断与线下优惠是否互斥, 目前仅抹零优惠可用
     */
    againstUnonlineActive(item) {
      if (!item.mutexOtherPromotion) { // mutexOtherPromotion 是否可与线下活动共享
        const { settlementData } = this.resData;
        // 没有优惠方式 或者 只有抹零优惠
        if (settlementData.pointDiscList.length === 0 || settlementData.pointDiscList[0].discType === -10001) {
          return true;
        }
      }
      return true;
    },
    /**
     * 优惠券适用门店列表，不满足当前门店的券不显示
     */
    canUseShopList(item) {
      if (!item.shopList || item.shopList.length === 0) return true;
      return item.shopList.indexOf(this.posBaseInfo.shopId) > 0;
    },
    /**
     * 给集合中的对象添加属性
     * checked：选中状态，score：添加的顺序，ticketpaymoney：实际抵扣金额
     */
    addProperty(list) {
      if (!Array.isArray(list)) return;
      list.map((item) => {
        Object.assign(item, {
          checked: false,
          score: 0,
          ticketpaymoney: 0, // 券实际抵扣金额
        });
        return item;
      });
    },
    /**
     * 用于判断已添加的券中是否有折扣券，如果有返回对应下标
     */
    hasAddAccountTicks() {
      let index = -1;
      if (this.currentChooseTicks && this.currentChooseTicks.length > 0) {
        for (let i = 0; i < this.currentChooseTicks.length; i += 1) {
          if (this.currentChooseTicks[i].discount) {
            index = i;
            break;
          }
        }
      }
      return index;
    },
    /**
     * 第一张是否是折扣券
     */
    firstTicksIsAccount() {
      return this.currentChooseTicks[0].discount;
    },
    /**
     * 清空所有已选券和已建立的映射关系, 初始化到刚查询状态
     */
    clearAllTicksAndEntry() {
      this.addProperty(this.ticksLists);
      this.ticketsEntry = {};
      this.score = 0;
    },
    /**
     * 使用折扣券前
     * 先从所有活动方案中找到此券所对应的折扣方案
     * 再请求接口查询此折扣方案都允许什么品项打折
     * 再判断当前是否添加了允许打折的品项
     * 如果没有，使用折扣券时提示
     */
    disctypeDiscountPlan(item) {
      let tmpData = null;
      for (let i = 0; i < this.discTypeList.length; i += 1) {
        if (item.discount === this.discTypeList[i].discTypeCode) {
          tmpData = this.discTypeList[i];
          break;
        }
      }
      if (tmpData) {
        return ajax('canyin.pos.settlement.disctypeDiscountPlan', {
          params: {
            bsid: this.resData.bsid,
            pointid: this.resData.pointid,
            planid: tmpData.dicountPlanId,
          },
        });
      }
      return null;
    },
    checkExistPayWay() {
      let isExistPayWay = 0;
      /**
       * this.payThenDiscountFlg - 预扣状态("先付后折"优惠计算)
       * isUseTicketFirst - 含折现率结算方式的标识(折现率结算方式使用后,可以再加折扣=>"先付后折"业务=>预扣)
       */
      this.payWayList.some((item, index) => {
        // 含有结算方式,不可再添加优惠折扣. 但添加特殊结算除外(可再执行折扣)
        // 184.4(186)-20200117实现"先付后折"的"券折折"逻辑,放开预扣后不能再打折的逻辑
        // 删除折扣优惠时会有问题,允许打折就允许了删除,但是先预扣,再打折,也视为预扣,不能单独删除打折
        if (item.type === 2 && !item.isUseTicketFirst) {
          isExistPayWay = 1;
          // 返回判断结果，循环节流
          return true;
        }
        // 未预扣时, 含有 自动执行的折扣优惠(discType == -10001), 可继续执行"先付后折"业务;
        // 手动执行折扣优惠(discType有0/1/2/3/4/5/6)后, 不可再使用"先付后折"业务;
        // ## 所有优惠折扣(无论自动或手动),使用后均会入库, 来自settle接口的pointDiscList;
        const tmpDiscItem = this.payWayList[index - 1] || null; // 已加结算方式的前一个结算或折扣
        if (!this.payThenDiscountFlg // 未预扣时（初始添加）
          && item.isUseTicketFirst // 有结算且为含折现率属性时
          && tmpDiscItem // 前一个为折扣时
          && tmpDiscItem.discType // 前一个为折扣时
          && tmpDiscItem.discType !== -10001 // 前一个折扣为自动执行优惠
        ) {
          if (item.payway_id === '55' && item.take_money === 0) { // 过滤掉鱼酷会员券0元
            return true;
          }
          isExistPayWay = 1;
          // 返回判断结果，循环节流
          return true;
        }
      });
      // 常规业务状态均可执行打折
      return isExistPayWay;
    },
    /**
     * 点击选择券时的各种校验
     */
    async verifyTicksClickHandler(checked, item) {
      if (item.limitUse) {
        this.$message.warning('当前折扣券不满足使用条件');
        return false;
      }
      if (checked && +this.amountToBePaid <= 0) { // 如果是添加操作，当待付金额为0时不让再添加
        this.$message.warning('支付金额已足够，无需再添加');
        return false;
      }
      if (!this.againstTicks(checked, this.ticksLists, item)) {
        this.$message.warning('跟已添加的券互斥');
        return false; // 要添加的券和已经添加的券互斥
      }
      if (!this.mostCanUse(checked, item)) {
        this.$message.warning('相同券数量使用超过上限');
        return false; // 相同券数量使用超过上限
      }
      if (checked && item.discount) {
        // 不能添加相同的折扣券
        if (this.hasAddAccountTicks() !== -1) {
          const isSameDiscountTicks = this.currentChooseTicks.some((tick) => tick.discount === item.discount);
          if (isSameDiscountTicks) {
            this.$message.warning('相同折扣券不能重复添加');
            return false;
          }
        }
        // 使用了线下折扣+线下代金券后不能再使用线上折扣券(这里的线上特指鱼酷)
        if (!this.resData.canUseDiscount) {
          this.$message.warning('请先删除已用结算方式，再进行优惠！');
          return false;
        }
        if (this.checkExistPayWay() !== 0) {
          this.$message.warning('请先删除已用结算方式，再进行优惠！');
          return false;
        }
        // 添加了线下折扣的情况下能否使用鱼折
        // if (this.payWayList.length > 0) {
        //   let hasUseDiscountType = false;
        //   this.payWayList.sort((a, b) => a.sortOrder - b.sortOrder);
        //   console.log('xxxxxxxxxxx', this.payWayList)
        //   for (let i = 0; i < this.payWayList.length; i += 1) {
        //     if (this.payWayList[i].type === 1) { // 有优惠方式
        //       hasUseDiscountType = true;
        //     } else if (this.payWayList[i].type === 2 && this.payWayList[i].take_money !== 0 && hasUseDiscountType) { // 有优惠方式并且之前用过折扣
        //       this.$message.warning('请先删除已用结算方式，再进行优惠！');
        //       return false;
        //     }
        //   }
        // }
      }
      if (checked) { // 添加操作，score自增后更新item的score值。为了通过排序来维持已添加券的有序性
        if (item.discount) {
          const result1 = this.deleteBeforeUseDiscountTicket();
          if (result1) {
            this.$message.warning(`使用折扣券前请先删除${result1.name}结算方式`);
            return false;
          }
          const result2 = await this.disctypeDiscountPlan(item);
          if (result2 && Array.isArray(result2.canDiscountItemList)) {
            if (result2.canDiscountItemList.length > 0) {
              const itemsCode = [];
              for (let i = 0; i < result2.canDiscountItemList.length; i += 1) {
                itemsCode.push(result2.canDiscountItemList[i].item_code);
              }
              const arr = this.intersection(itemsCode, this.resData.settlementData.pointBillList);
              if (!arr || arr.length === 0) {
                this.$message.warning('当前折扣券不满足使用条件');
                return false;
              }
            } else {
              this.$message.warning('当前折扣券不满足使用条件');
              return false;
            }
          } else {
            this.$message.warning('当前折扣券不满足使用条件');
            return false;
          }
        }
        this.score += 1;
      } else if (!this.firstTicksIsAccount()) { // 删除操作，已添加的券第一张不是折扣券
        if (item.discount) { // 如果要删除的是折扣券
          this.$message.warning('请先取消代金券/赠品券，此时会自动取消折扣券');
          return false;
        }
        // 要删除的是非折扣券，并且已添加了折扣券
        // 栗子: 第一张代金券，第二张折扣券，这时取消代金券，那么要把折扣券一起取消掉
        if (this.currentChooseTicks.length > 1 && this.hasAddAccountTicks() !== -1) {
          // 撤销打折券
          this.cancelDiscount(true, (clearAll) => {
            this.useOrCancel(clearAll).then(() => {
              this.canSearch = true;
              this.limit = false;
              // 清空所有已选券和建立的映射关系
              this.clearAllTicksAndEntry();
              this.$emit('refreshBill', '1');
            }).catch((errCode, errMsg) => { // 如果接口请求失败  将选中的券取消掉
              this.canSearch = true;
              this.$alert(errMsg, '提示', {
                customClass: 'ajax-error-alert',
              });
            });
          });
          return false;
        }
      }
      return true;
    },
    /**
     * 撤销折扣券事件，当满足现付后折时要调用cancelSettle接口
     * clearAll ? 清空打折券：清空所有券
     */
    cancelDiscount(clearAll = false, cb) {
      const data = {
        paywayId: '55',
      };
      this.$emit('cancelSettle', data, () => {
        if (cb && cb instanceof Function) {
          cb(clearAll);
        }
      }, () => {
        this.canSearch = true;
      });
    },
    /**
     * 点击选择电子券事件，添加或删除逻辑如下
     * 折扣券不是第一张添加的，添加走正常流程，删除的话后面的其他券时清空所有券,并且不能删除折扣券。
     * 折扣券是第一张添加的，添加删除都走正常流程
     */
    async chooseTicksClickHandler(item) {
      // 限制重复点击
      if (this.limit) return false;
      this.limit = true;
      setTimeout(() => {
        this.limit = false;
      }, 1000);
      const checked = !item.checked;
      if (!await this.verifyTicksClickHandler(checked, item)) return false;
      Object.assign(item, {
        checked,
        score: this.score,
      });
      try {
        // 建立映射关系
        this.createEntry(checked, item);
      } catch (e) {
        this.$message.error(e);
      }
      // 计算每张券的实际抵扣金额ticketpaymoney
      this.countTicketPayMoney(checked, item);
      if (!checked && item.discount) { // 删除操作，并且是第一张添加的折扣券
        if (this.currentChooseTicks.length === 0) { // 如果没有其他券了 那么走取消优惠方法
          this.fishCoolCancelDiscount(item);
          // this.cancelDiscount(false, () => {
          //   this.useOrCancelHandle(checked, item);
          // });
        } else { // 如果有其他券 那么走撤销折扣方法
          this.cancelDiscount(false, () => {
            this.useOrCancelHandle(checked, item);
          });
        }
      } else {
        this.useOrCancelHandle(checked, item);
      }
      return true;
    },
    /**
     * 如果已添加的结算方式中有isUseTicketFirst=false的
     * 那么使用鱼库折扣券时提示先删除此结算方式。
     * 栗子：人民币+鱼代+鱼折，这时会提示请先删除人民币结算方式
     */
    deleteBeforeUseDiscountTicket() {
      let result = null;
      if (this.payWayList.length > 0) {
        for (let i = 0; i < this.payWayList.length; i += 1) {
          if (this.payWayList[i].type === 2 && !this.payWayList[i].isUseTicketFirst) {
            result = this.payWayList[i];
            break;
          }
        }
      }
      return result;
    },
    /**
     * 取消优惠方法
     * 当只有一张折扣券的时候，不满足现付后折逻辑，不能调用cancelSettle接口，需要调用此方法来取消
     */
    fishCoolCancelDiscount(item) {
      let discData = null;
      let tmpData = null;
      // 从所有活动方案和已添加的结算方式中找到对应的由鱼酷打折券添加的支付方式
      for (let i = 0; i < this.discTypeList.length; i += 1) {
        if (item.discount === this.discTypeList[i].discTypeCode) {
          tmpData = this.discTypeList[i];
          break;
        }
      }
      if (tmpData) {
        for (let i = 0; i < this.payWayList.length; i += 1) {
          if (tmpData.dicountPlanId === this.payWayList[i].dpId) {
            discData = this.payWayList[i];
            break;
          }
        }
      }
      const params = {
        bsId: this.resData.bsid,
        pointId: this.resData.pointid,
        controlMode: this.resData.controlMode,
        cancelDisctype: discData ? discData.discType : null, // 取消优惠的折扣类型
        cancelDisPlanId: discData ? discData.dpId : null, // 取消优惠的打折方案ID
        disctype: 0,
        mcTicketId: null,
      };
      ajax('canyin.pos.settlement.scale', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success) {
          this.setSettleDiscType({ list: this.resData.bsid });
          this.$emit('refreshBill', '1');
        } else {
          this.$message({
            message: data.msg,
            type: 'warning',
          });
        }
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    // 关闭页面回调
    onClose() {
      // 关闭后刷新账单--鱼酷0元
      this.$emit('refreshBill', '1');
      this.clearCache();
    },
    // 点击提交
    onSubmit() {
      this.close();
    },
    // 清空缓存的数据
    clearCache() {
      this.accountInfo = {};
      this.searchType = '1';
      this.ticketsEntry = {};
      this.ticksLists = [];
      this.currentPage = 1;
      this.searchText = '';
      this.tickets = 0; // 电子券结算
      this.preBtnDisabled = true;
      this.nextBtnDisabled = false;
    },
    // 设置聚焦
    activeFocus() {
      this.$nextTick(() => {
        this.$refs.searchInput.focus();
      });
    },
    // 重置分页
    reSetPagination() {
      this.currentPage = 1;
    },
    // 限制输入数字
    InputIntNumber(key) {
      let str = '';
      str += this[key];
      this.$nextTick(() => {
        this[key] = str.replace(/[^\d]/g, '');
      });
    },
    // 获取搜索框用的快捷键
    setKeySearchHotKey() {
      const searchKeys = '1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          setTimeout(() => {
            this.addWordInBlur(item);
          }, 0);
        };
      });
      return keysObj;
    },
    // 在没有焦点情况下添加文本
    addWordInBlur(key) {
      if (document.hasFocus() && document.activeElement === this.$refs.searchInput) return;
      this.searchText = `${this.searchText}${key}`;
    },
    // 在没有焦点情况下删除最后一个文本
    delWordInBlur() {
      if (document.hasFocus() && document.activeElement === this.$refs.searchInput) return;
      this.searchText = KeyboardUtil.deleteLastChar(this.searchText);
    },
    // 时间戳转字符串时间格式
    formatDate(num) {
      if (!num) return '--';
      const date = new Date(num);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    },
    // 节流函数
    debounce(fn, delay) {
      let timer = null;
      return () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(), delay);
      };
    },
    // 防抖函数
    throttle(fn, delay) {
      let prev = Date.now();
      return () => {
        const now = Date.now();
        if (now - prev >= delay) {
          fn();
          prev = Date.now();
        }
      };
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .easy-life{
    display: table;
    width: 100%;
    height: 570px;
    >* {
      display: table-cell;
      vertical-align: top;
    }
  }
  .list-area{
    position: relative;
    padding: 16px;
    width: 466px;
    background-color: @white;
    border-right: 1px solid #ddd;
  }
  .item{
    display: table;
    width: 100%;
    >*{
      display: table-cell;
    }
    .payouts-money{
      font-size: 18px;
      color: #0babb9;
      font-weight: bold;
    }
    & + &{
      margin-top: 10px;
    }
  }
  .search-item{
    .search{
      width: 310px;
      display: flex;
      .my-select{
        width: 150px!important;
      }
    }
    .search-btn{
      padding-left: 8px;
      vertical-align: middle;
      button{
        width: 100%;
      }
    }
    input {
      width: 100%;
      padding: 0 50px 0 15px;
      height: 40px;
      line-height: 40px;
      border-radius: 4px;
      outline: none;
      border: 1px solid #dcdfe6;
      transition: border-color 0.3s cubic-bezier(0.645, 0.045, 0.355);
      &:hover {
        border-color: #bbb;
      }
      &[disabled] {
        cursor: not-allowed;
      }
    }
    .focus {
      border-color: #039eac;
    }
  }
  .settle-item {
    & > .item-input {
      display: flex;
      position: relative;
      align-items: center;
      & > span:first-child {
        width: 120px;
        color: gray;
      }
      & > span:last-child {
        position: absolute;
        right: 15px;
        color: #bbbbbb;
      }
      input {
        flex: 1;
        padding: 0 50px 0 15px;
        height: 40px;
        line-height: 40px;
        border-radius: 4px;
        outline: none;
        border: 1px solid #dcdfe6;
        transition: border-color 0.3s cubic-bezier(0.645, 0.045, 0.355);
        &:hover {
          border-color: #bbb;
        }
        &[disabled] {
          cursor: not-allowed;
        }
      }
      .focus {
        border-color: #039eac;
      }
    }
    .margin-bt-10 {
      margin-bottom: 10px;
    }
  }
  .title{
    width: 78px;
    font-size: 14px;
  }
  .list{
    /*margin-bottom: 50px;*/
    .list-title{
      font-size: 14px;
      color: #333;
      line-height: 2.5;
      margin-top: 8px;
    }
    table{
      width: 100%;
    }
    th,td{
      padding-left: 6px;
      font-weight: normal;
    }
    .table-head{
      padding: 4px 0;
      background-color: #7bcad6;
      color: @white;
      th {
        font-size: 12px;
        line-height: 1.1;
      }
      th+th{
        border-left: 1px solid @white;
      }
    }
    .table-body{
      margin-top: 6px;
      padding: 8px;
      color: @gray-dark;
      height: 400px;
      border-radius: 3px;
      background-color: #eeeeee;
      border: 1px solid #bbbbbb;
      & > ul {
        list-style-type: none;
        height: 100%;
        .as-ticks-btn {
          display: flex;
          position: relative;
          margin-bottom: 5px;
          padding: 3px 0;
          width: 100%;
          height: 60px;
          border-radius: 5px;
          cursor: pointer;
          color: #ffffff;
          background-color: rgb(133, 200, 189);
          &.checked {
            border: 2px solid rgb(11, 171, 185);
          }
          &.checked:after {
            content: '';
            width: 24px;
            height: 24px;
            position: absolute;
            right: -12px;
            top: -6px;
            background-image: url(~@/common/images/pos/bill/ticks-checked.png);
          }
          .td-left-div {
            flex: 1;
            padding: 10px;
            font-size: 14px;
          }
          .td-right-div {
            padding: 10px;
            width: 90px;
            font-size: 26px;
            border-left: 2px dotted #ffffff;
          }
          &.limit {
            cursor: not-allowed;
          }
        }
      }
    }
    .no-col{
      width: 9.7%;
    }
    .name-col{
      width: 36%;
    }
    .quota-col{
      width: 16%;
    }
    .balance-col{
      width: 16%;
    }
    .status-col{
      width: 10.1%;
    }
    td.choose-col{
      text-align: center;
    }
    .account-checkbox{
      vertical-align: -6px;
    }
  }
  .no-item{
    text-align: center;
    font-size: 14px;
    color: #999999;
    padding-top: 20px;
  }
  .tip-content{
    display: inline-block;
    font-size: 12px;
    img.document-icon{
      float: left;
      padding-right: 8px;
    }
    p{
      text-align: left;
      line-height: 36px;
      word-break:keep-all;
      white-space:nowrap;
    }
  }

  // 箭头按钮
  .pos-takeout-pager {
    position: absolute;
    right: 15px;
    bottom: 8px;
    > button {
      display: inline-block;
      width: 44px;
      height: 30px;
      border: 1px solid #9a9a9a;
      line-height: 28px;
      border-radius: 14px;
      text-align: center;
      margin-left: 8px;
      background-color: white;

      > i {
        color : #9a9a9a;
      }

      &[disabled] {
        color: @btn-disabled-color;
        cursor: not-allowed;
      }
    }
  }

  .money-area{
    background-color: #f5f5f5;
    .to-be-pay{
      display: flex;
      flex-direction: column;
      padding: 12px;
      /*line-height: 52px;*/
      border-bottom: 1px dashed #b5b5b5;
      .content{
        text-align: right;
      }
      & > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        & > span {
          width: 85px;
        }
      }
    }
    .info-area{
      padding: 12px;
      .detail-info {
        table {
          width: 100%;
          tr {
            td {
              padding-top: 3px;
            }
            td:nth-child(1) {
              text-align: left;
              color: gray;
            }
            td:nth-child(2) {
              text-align: right;
            }
          }
          tr:nth-child(2) > td {
            padding-top: 10px;
          }
        }
      }
    }
    .pay-money{
      margin-top: 12px;
    }
    .remark-title{
      line-height: 2;
    }
    .keybord-content{
      margin: 20px 0;
      text-align: center;
    }
  }
</style>
<style>
  .easy-life .el-input__inner {
    padding-right: 30px;
  }
</style>
