<template>
  <Dialog
    name="PosDialog.buffetDeposit"
    class="buffet-deposit"
    :title="$t('Biz.Pos.MoreModuleSpan13')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :submitText="$t('Biz.Pos.More.DepositTitle1')"
    :hotkeys="AddPayHotkey"
    :closeByClickModel="false"
    :showSubmit="!(openBuffetDeposit && getVuexPosMode === '3')"
    :disableSubmitBtn="!limit.register"
    width="1020px"
    height="650px"
    top="10vh">
    <span class="btn-wrap" slot="other-button">
      <!--选中行状态不是已登记，或选中行数超过1，或没有退押金权限则不能点击-->
      <button id="recedeDepositConfirm" class="btn btn-default" :disabled="!canRecedeDeposit || onlyOne ||!limit.back" @click="recedeDepositConfirm(1)">{{$t('Biz.Pos.More.BuffetDeBtn1')}}(F1)</button>
      <!--只有结算界面进来的才显示，且选中行状态必须为已登记才能点击-->
      <button id="useDeposit" class="btn btn-default" v-if="whereOpen === 'payIndex'" :disabled="!canRecedeDeposit || !receiveMoneyBiggerThanZero" @click="useDeposit">
          {{$t('Biz.Pos.More.BuffetDeBtn2')}}(F2)
      </button>
      <!--自主押金二期调整：开启自助押金后显示罚没按钮-->
      <button class="btn btn-default" v-if="openBuffetDeposit" :disabled="!canRecedeDeposit || onlyOne ||!limit.forfeit" @click="recedeDepositConfirm(2)">
        {{$t('Biz.Pos.More.BuffetDeBtn6')}}(F2)
      </button>
      <!--自助押金下已退的不能关联客位，其他押金下已退和已关联客位的不能关联客位-->
      <!--自主押金二期调整：开启自助押金并且是快餐模式下，不显示关联客位和登记押金按钮-->
      <button id="associatedTable" class="btn btn-default" v-if="(!openBuffetDeposit || getVuexPosMode !== '3') && showDom" :disabled="ifNotBuffetLimitAssociatedTable" @click="associatedTable">{{$t('Biz.Pos.More.AssociatedTitle1')}}(F3)</button>
      <!--选中行状态不是已登记，或选中行数超过1不能点击-->
      <button id="printOrder" class="btn btn-default" :disabled="!canRecedeDeposit || onlyOne" @click="printOrder">{{$t('Biz.Pos.More.BuffetDeBtn4')}}(F4)</button>
      <!--选中1行可以点击，否则不能点击-->
      <button id="editRemark" class="btn btn-default" :disabled="onlyOne" @click="editRemark()">{{$t('Biz.Pos.More.BuffetDeBtn5')}}(F5)</button>
    </span>
      <div class="buffet-deposit top-level-wrap">
        <div class="table-ordersBox">
          <!--头部过滤查询开始-->
          <div class="table-order-queryBox table-fnBtn-box clear">
            <div class="table-datePicker datePicker-box" v-if="showDom">
              <el-date-picker
                v-model="pickerTime"
                :editable="false"
                :clearable="false"
                @change="refreshDepositList('')"
                value-format="yyyy-MM-dd"
                type="daterange"
                :range-separator="$t('Dict.To')"
                :start-placeholder="$t('Dict.StartDate')"
                :end-placeholder="$t('Dict.EndDate')">
              ></el-date-picker>
            </div>
            <ul class="booking-dropdown-group businessShift-btnBox">
              <li
                class="dropdown-btnGroup businessShift-btn"
                :class="shiftActiveIndex === index ? 'active' : ''"
                v-for="(item, index) in shifts"
                @click="chooseActiveShiftsOrStatus('shiftActiveIndex', index)"
                :key="index"
              >{{ item.name }}</li>
            </ul>
            <div class="next-line-filter">
              <div
                id="orderFilterBox1"
                class="booking-dropdown-group order-dropdown-group">
                <!--押金单状态过滤-->
                <ul class="booking-dropdown-group businessShift-btnBox no-margin">
                  <li
                    class="dropdown-btnGroup businessShift-btn"
                    :class="stateActiveIndex === index ? 'active' : ''"
                    v-for="(item, index) in status"
                    @click="chooseActiveShiftsOrStatus('stateActiveIndex', index)"
                    :key="index">{{ item.name }}</li>
                </ul>
              </div>
              <div
                id="orderFilterBox2"
                class="booking-dropdown-group order-dropdown-group margin-left-12">
                <!--押金单状态过滤-->
                <ul class="booking-dropdown-group businessShift-btnBox no-margin">
                  <li
                    class="dropdown-btnGroup businessShift-btn"
                    :class="sourceActiveIndex === index ? 'active' : ''"
                    v-for="(item, index) in source"
                    @click="chooseActiveShiftsOrStatus('sourceActiveIndex', index)"
                    :key="index">{{ item.name }}</li>
                </ul>
              </div>
              <div v-if="showDom" class="queryKeyWord margin-left-12">
                <em class="icon icon-fangdajing"></em>
                <input
                  v-switch-keyboard:fixed="keyboardData"
                  ref="input"
                  type="text"
                  maxlength="16"
                  @keyup="InputNumber('inputValue', 0, true)"
                  v-model="inputValue"
                  :placeholder="placeHolder">
              </div>
              <button v-if="showDom" class="queryBtn" :disabled="!canClickSearch" @click="search()">{{$t('Dict.Search2')}}</button>
            </div>
          </div>
          <!--头部过滤查询结束-->
          <!--列表开始-->
          <ul
            :class="{
              'open': openBuffetDeposit
             }"
            class="orderTable-title orderTable-row">
            <li
              v-for="item in tableHead"
              class="orderTable-title-item orderTable-row-item textCenter"
              :key="item.id"
            >{{ item.text }}</li>
          </ul>
          <div
            id="bookingOrderPagerId"
            class="orderTable-listBox">
              <div v-for="(item, index) in tableDataShow">
                <el-popover
                  placement="bottom"
                  trigger="hover"
                  :content="item.remark"
                  :disabled="!item.remark"
                  width="300"
                  close-delay="0"
                  :open-delay=openDelay>
                  <ul slot="reference"
                    class="orderTable-row"
                    @click="activeRowHandle(item, index)"
                    @dblclick="dbClickItem(item)"
                    :class="{
                      'black': item.state === 1,
                      'red': item.state === 3,
                      'blue': item.state === 2,
                      'active': item.checked,
                      'open': openBuffetDeposit
                     }"
                    :key="index">
                      <li class="orderTable-row-item">
                        <!--押金单号-->
                        {{ item.code }}
                      </li>
                      <li class="orderTable-row-item">
                        <!--人数-->
                        {{ item.peopleQty }}
                      </li>
                      <li class="orderTable-row-item">
                        <!--金额-->
                        {{ item.payMoney }}
                      </li>
                      <li class="orderTable-row-item">
                        <!--押金状态 1登记 2退 3罚没 4使用-->
                        <span v-if="+item.state === 1">{{$t('Biz.Pos.More.BuffetDeSpan1')}}</span>
                        <span v-else-if="+item.state === 2">{{$t('Biz.Pos.More.BuffetDeSpan2')}}</span>
                        <span v-else-if="+item.state === 3">{{$t('Biz.Pos.More.BuffetDeSpan4')}}</span>
                        <span v-else>{{$t('Biz.Pos.More.BuffetDeSpan3')}}</span>
                      </li>
                      <li class="orderTable-row-item">
                        <!--登记方式-->
                        {{ formatRegisterType(item.paywayDTOList)}}
                      </li>
                      <li class="orderTable-row-item">
                        <!--市别-->
                        {{ item.shiftName }}
                      </li>
                      <li class="orderTable-row-item">
                        <!--客位 或 牌号-->
                        {{ seatOrOrderCode(item) }}
                      </li>
                      <!--自助押金调整：开启自助押金后屏蔽掉预定人 联系电话 押金类型-->
                      <li v-if="!openBuffetDeposit" class="orderTable-row-item">
                        <!--预订人-->
                        {{ item.bookPerson }}
                      </li>
                      <li v-if="!openBuffetDeposit" class="orderTable-row-item">
                        <!--联系电话-->
                        {{ item.contactTel }}
                      </li>
                      <li v-if="!openBuffetDeposit" class="orderTable-row-item">
                        <!--押金类型-->
                        {{ item.depositTypeName }}
                      </li>
                      <li class="orderTable-row-item">
                        <!--登记时间-->
                        {{ item.registerTime }}
                      </li>
                      <li class="orderTable-row-item">
                        <!--操作人-->
                        {{ item.registerOperatorName }}
                      </li>
                      <li class="orderTable-row-item">
                        <!--退/使用押金时间-->
                        <!--退/罚没押金时间-->
                        {{ item.cancelTime || '' }}
                      </li>
                      <li class="orderTable-row-item">
                        <!--退押金操作人-->
                        {{ item.cancelOperatorName || '' }}
                      </li>
                   </ul>
                </el-popover>
              </div>
          </div>
          <!--列表结束-->
        </div>
        <!--底部开始-->
        <div class="rightArea-footer">
          <div class="orderTable-listNum">{{$t('Dict.Altogether')}} {{tableDataShow.length}} {{$t('Dict.Strip')}}{{$t('Biz.Booking.Record')}}</div>
          <div class="orderTable-pagerNum">
            <Pager
              pagerId="bookingOrderPagerId"
              itemTag=".orderTable-row"
              arrowDirection="up-down"
              :showInfo="showInfo"
              class="pos-booking-order-pager"
              ref="orderPager"
            ></Pager>
          </div>
        </div>
        <!--底部结束-->
      </div>
    <!--登记押金模块-->
    <RegisterDeposit
      ref="registerDeposit"
      @refreshDepositList="refreshDepositList('')"
      @associatedOrChangeTable="associatedOrChangeTable"
      :whereOpen="whereOpen"
      :showPeopleInput="showPeopleInput">
    </RegisterDeposit>
    <!--修改押金单模块-->
    <EditDeposit
      ref="editDeposit"
      @refreshDepositList="refreshDepositList('')"
      @associatedOrChangeTable="associatedOrChangeTable"
      :depositData="depositData"
      :whereOpen="whereOpen"
      :showPeopleInput="showPeopleInput">
    </EditDeposit>
    <!--关联客位页面-->
    <AssociatedTable
      ref="associatedTable"
      @refreshDepositList="refreshDepositList('')"
      :openBuffetDeposit="openBuffetDeposit">
    </AssociatedTable>
  </Dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import {
  cloneDeep,
} from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import RegisterDeposit from '@/components/Pos/More/buffetComponents/RegisterDeposit';
import EditDeposit from '@/components/Pos/More/buffetComponents/EditDeposit';
import AssociatedTable from '@/components/Pos/More/buffetComponents/AssociatedTable';
import * as KeyboardUtil from '@/plugin/keyboard/util';
import i18n from '@/locales/index';

let tmpStatus = [];
let tmpSource = [];
let tmpTableHead = [];
export default {
  name: 'buffetDeposit',
  // abstract: true,
  components: {
    Dialog,
    Pager,
    RegisterDeposit,
    EditDeposit,
    AssociatedTable,
  },
  mixins: [DialogMixin],
  data() {
    return {
      openDelay: 200, // 打开弹框的延迟时间
      msg: 'hello wrold',
      shiftActiveIndex: 0, // 早午晚餐下标
      shifts: [], // 早午晚餐数组
      status: [], // 状态数组
      sourceActiveIndex: 0, // 订单来源下标
      source: [], // 押金单来源数组
      stateActiveIndex: 0, // 状态下标
      tableHead: [],
      tableData: [],
      showInfo: true,
      pickerTime: '',
      inputValue: '',
      canClickSearch: true,
      timer: null, // 定时器
      isEnter: false, // 是否是回车触发的查询操作
      isHandlerTriggerEnter: false, // 是否是手动的回车操作
      limit: { // 登记 退 罚没 押金的权限
        register: false,
        back: false,
        forfeit: false,
      },
      whereOpen: '', // 那个页面打开的押金管理模块。只有是payIndex时使用押金按钮才可见
      baseData: {}, // resData
      keyboardData: { // 虚拟键盘固定数字或全键盘
        letterType: 'full',
      },
      showPeopleInput: false, // 是否显示人数输入框（只有自助押金逻辑才显示人数输入框）
      openBuffetDeposit: false, // 是否开启了自助餐 如果开启了 类型筛选里不显示自助餐
      precisionSearch: true, // 从客位结算预订界面进入的，第一次进行精准查询，后面的模糊查询
      receiveMoneyBiggerThanZero: false, // 结算客位是否加单(既应收金额是否大于0，如果不大于零则不能点击使用押金按钮)
      showDom: false, // 是否显示时间控件(只有从押金管理进入的才显示)
      depositData: {}, // 押金单数据
      placeHolder: '',
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo', 'getVuexPointData', 'ALL_POS_MODULE', 'posSettings', 'getVuexPosMode', 'posInfo']),
    AddPayHotkey() {
      return {
        F1: () => {
          if (!this.canRecedeDeposit || !this.limit.back || this.onlyOne) return;
          this.recedeDepositConfirm(1);
        },
        F2: () => {
          if (this.openBuffetDeposit) {
            if (!this.canRecedeDeposit || !this.limit.forfeit || this.onlyOne) return;
            this.recedeDepositConfirm(2);
          } else {
            if (this.whereOpen !== 'payIndex') return;
            if (!this.canRecedeDeposit) return;
            this.useDeposit();
          }
        },
        F3: () => {
          if (!this.showDom) return; // 只有押金管理才能使用关联客位
          if (!this.whereOpen) { // 是自助餐押金逻辑
            if (!this.canRecedeDeposit) return; // 如果选中的列不是已登记状态，不执行函数
          } else if (this.ifNotBuffetLimitAssociatedTable) return; // 不是自助餐逻辑，如果已关联客位或不是已登记状态则不执行函数
          // 自助押金调整：开启自助押金后，快餐模式下屏蔽掉关联客位和登记押金
          if (this.openBuffetDeposit && this.getVuexPosMode === '3') return;
          this.associatedTable();
        },
        F4: () => {
          if (!this.canRecedeDeposit || this.onlyOne) return;
          this.printOrder();
        },
        F5: () => {
          if (this.onlyOne) return;
          this.editRemark();
        },
        PgDn: () => {
          // 自助押金调整：开启自助押金后，快餐模式下屏蔽掉关联客位和登记押金
          if (this.openBuffetDeposit && this.getVuexPosMode === '3') return;
          this.onSubmit();
        },
        Enter: () => {
          this.enterTriggerSearch();
        },
        BackSpace: () => {
          this.delWordInBlur();
        },
        ...this.setKeySearchHotKey(),
      };
    },
    tableDataShow() {
      const {
        tableData, oneForAllToFillter, stateActiveIndex, shiftActiveIndex,
        sourceActiveIndex, source, shifts, status,
      } = this;
      const a = oneForAllToFillter(tableData, source, sourceActiveIndex, 'depositType');
      const b = oneForAllToFillter(a, shifts, shiftActiveIndex, 'shiftId');
      return oneForAllToFillter(b, status, stateActiveIndex, 'state');
    },
    // 已退状态的押金单不能再次点击退押金和关联客位按钮
    // 状态不是已登记的禁止点击
    // :disabled="!canRecedeDeposit" 返回false时为禁止状态
    canRecedeDeposit() {
      const activeArr = this.hadTableListChecked();
      if (activeArr.length === 0) return false;
      return !activeArr.some(item => item.state !== 1);
    },
    onlyOne() {
      const activeArr = this.hadTableListChecked();
      return activeArr.length !== 1;
    },
    // 自助押金下已退的不能关联客位，其他押金下已退和已关联客位的不能关联客位
    ifNotBuffetLimitAssociatedTable() {
      const activeArr = this.hadTableListChecked();
      if (activeArr.length === 0) return true;
      // 如果不是自助餐押金则判断是否已关联客位，如果关联了则不能点击
      if (!this.openBuffetDeposit) {
        if (this.canRecedeDeposit) {
          if (activeArr.some(item => item.relationPointName)) return true;
        }
        return !this.canRecedeDeposit;
      }
      return !this.canRecedeDeposit;
    },
  },
  mounted() {
    this.$quickinput((str) => {
      console.log(str);
    });
  },
  methods: {
    // 客位或牌号
    seatOrOrderCode(item) {
      if (this.getVuexPosMode !== '3') {
        return item.relationPointName;
      }
      return item.orderCode;
    },
    // 每次打开的时候都初始化值，保证多语言切换后正常显示
    initTmpVariable() {
      tmpStatus = [
        {
          name: this.$t('Biz.Pos.More.BuffetDeSpan1'),
          id: 1,
        },
        {
          name: this.$t('Biz.Pos.More.BuffetDeSpan2'),
          id: 2,
        },
        {
          name: this.$t('Biz.Pos.More.BuffetDeSpan4'),
          id: 3,
        },
        {
          name: this.$t('Biz.Pos.More.BuffetDeSpan3'),
          id: 4,
        },
      ];
      tmpSource = [
        {
          name: this.$t('Dict.SaleType.Buffet'),
          id: 0,
        },
        {
          name: this.$t('Biz.Pos.More.BuffetDeName2'),
          id: 1,
        },
        {
          name: this.$t('Dict.SaleType.Booking'),
          id: 2,
        },
      ];
      tmpTableHead = [
        {
          id: 1,
          text: this.$t('Biz.Pos.More.DepositSpan2'), // 押金单号
        },
        {
          id: 2,
          text: this.$t('Dict.NumberOfPeople'), // 人数
        },
        {
          id: 3,
          text: this.$t('Biz.Pos.More.BuffetDeTh3'), // 金额
        },
        {
          id: 4,
          text: this.$t('Biz.Pos.More.BuffetDeTh4'), // 押金状态
        },
        {
          id: 5,
          text: this.$t('Biz.Pos.More.BuffetDeTh5'), // 登记方式
        },
        {
          id: 6,
          text: this.$t('Dict.Shift'), // 市别
        },
        {
          id: 7,
          text: this.$t('Biz.Pos.More.AssociatedTitle1'), // 关联客位
        },
        {
          id: 8,
          text: this.$t('Biz.Booking.BookPerson'), // 预订人
        },
        {
          id: 9,
          text: this.$t('Dict.ContactNumber'), // 联系电话
        },
        {
          id: 10,
          text: this.$t('Biz.Pos.More.BuffetDeTh10'), // 押金类型
        },
        {
          id: 11,
          text: this.$t('Biz.Pos.More.BuffetDeTh11'), // 登记时间
        },
        {
          id: 12,
          text: this.$t('Biz.Booking.Operator01'), // 操作员
        },
        {
          id: 13,
          text: this.$t('Biz.Pos.More.BuffetDeTh13'), // 退/使用时间
        },
        {
          id: 14,
          text: this.$t('Biz.Booking.Operator01'), // 操作员
        },
      ];
    },
    // 自助押金模块是否显示(后台是否开启了自助押金模块)
    initShowBuffetDeposit() {
      // this.ALL_POS_MODULE.map((item) => {
      //   if ((+item.id === 1252 || item.text === '押金管理') && item.checked) {
      //     this.openBuffetDeposit = true;
      //   }
      //   return item;
      // });
      this.openBuffetDeposit = this.posSettings.isOpenBuffetDeposit === 1;
    },
    // 打开页面
    async onOpen() {
      this.initShowBuffetDeposit(); // 判断是否开启了自助餐
      this.initTmpVariable();
      this.initTableHead();
      this.initPlaceHolder();
      this.precisionSearch = true; // 初始化是否精准查询(只有押金管理进入的此页面不是精准查询)
      await this.initBtnAndFilterList(); // 初始化自助餐按钮权限和过滤条件
      const bool = this.whichSource(this.resData); // 判断数据来源 执行对应逻辑（结算，客位，预订）
      this.initBtnLimit(); // 初始化按钮操作权限
      if (!bool) return; // 说明是从预订进来的
      this.refreshDepositList(!this.openBuffetDeposit && this.whereOpen); // 登记押金后刷新押金列表，传参表示刷新列表后是否选中第一条数据
    },
    // 初始化输入框文字
    initPlaceHolder() {
      if (this.getVuexPosMode !== '3') {
        this.placeHolder = `${this.$t('Biz.Pos.More.BuffetDePh3')}/${this.$t('Dict.Seat')}`;
      } else {
        this.placeHolder = `${this.$t('Biz.Pos.More.BuffetDePh3')}/${this.$t('Dict.OrderCode')}`;
      }
    },
    // 初始化列表头部
    initTableHead() {
      console.log('xxxxxxxx', this.openBuffetDeposit);
      if (this.openBuffetDeposit) {
        const tmpArr = tmpTableHead.filter(item => [8, 9, 10].indexOf(item.id) < 0);
        // 把退/使用时间改为退/罚没时间
        tmpArr.map((item) => {
          if (item.id === 13) {
            Object.assign(item, {
              text: this.$t('Biz.Pos.More.BuffetDeTh14'), // 退/罚没时间
            });
          }
          // 开启自助押金后快餐模式下显示牌号，中餐显示客位
          if (item.id === 7) {
            if (this.getVuexPosMode === '3') {
              Object.assign(item, {
                text: this.$t('Dict.OrderCode'),
              });
            } else {
              Object.assign(item, {
                text: this.$t('Dict.Seat'),
              });
            }
          }
        });
        this.tableHead = tmpArr;
      } else {
        this.tableHead = tmpTableHead;
      }
    },
    // 关闭页面
    onClose() {
      this.pickerTime = [this.formatDate(), this.formatDate()];
      this.shifts = [];
      this.status = [];
      this.tableData = [];
      this.shiftActiveIndex = 0;
      this.stateActiveIndex = 0;
      this.sourceActiveIndex = 0;
      this.inputValue = '';
      this.whereOpen = '';
      this.showPeopleInput = false;
      this.showDom = false;
    },
    // 使用押金
    useDeposit() {
      const activeArr = this.hadTableListChecked();
      if (activeArr.length === 0) return;
      // const data = {
      //   // depositMoney: this.baseData.depositMoney, // 押金金额 真正情况应该是登记押金成功后后台存入库
      //   depositMoney: activeArr, // 登记的押金金额
      //   selectedPayway: activeArr[0].paywayDTOList, // 押金类型(人民币美元之类的，默认人民币)
      // };
      this.$vemit('useDeposit', activeArr);
      this.close();
    },
    // 罚没押金
    forfeit(item) {
      const data = {
        id: item.id || '',
        pointId: item.relationPointId || null,
      };
      ajax('canyin.pos.buffetdeposit.confiscateDeposit', {
        contentType: 'json',
        data,
      }).then((res) => {
        console.log(res);
        if (res.resultCode !== 1) {
          this.$message({
            type: 'error',
            message: `${res.msg}`,
            duration: 1000,
          });
          return;
        }
        this.$message({
          type: 'success',
          message: `${res.msg}`,
          duration: 1000,
        });
        this.baseTypeDoSomething(+res.data.type);
      });
    },
    // 判断那个页面的操作打开的押金管理
    whichSource(data) {
      this.baseData = data;
      let bool = true;
      switch (data.source) {
        case 'payIndex':
          this.whereOpen = 'payIndex';
          this.inputValue = data.pointData.pointList[0].pointName;
          this.receiveMoneyBiggerThanZero = +data.baseBs.orig_total > 0;
          break;
        case 'tablesIndex':
          this.whereOpen = 'tablesIndex';
          this.inputValue = data.pointData.name;
          break;
        case 'booking':
          bool = false;
          this.whereOpen = 'booking';
          this.inputValue = data.bookingData.tableName;
          this.refreshDepositList(true, () => {
            this.$nextTick(() => {
              this.onSubmit();
            });
          });
          console.log('预订押金');
          break;
        default:
          // 直接点击押金管理进入此页面，开启了自助押金则正常显示人数输入框，没有开启则不显示
          this.showPeopleInput = this.openBuffetDeposit;
          // 从押金管理进入此页面 显示时间控件
          this.showDom = true;
          this.precisionSearch = false; // 结算 客位 预订进入的一直是精准查询
          break;
      }
      return bool;
    },
    // 监听搜索框的搜索事件
    onSearch(inputValue) {
      this.inputValue = inputValue;
    },
    // 回车触发的search
    enterTriggerSearch() {
      setTimeout(() => { // 加定时器是为了先让$quickinput执行，初始化变量是否是扫码枪触发的回车
        this.isEnter = true; // 是否是回车触发的
        this.search();
      }, 0);
    },
    // 初始化自助餐按钮权限和过滤条件
    async initBtnAndFilterList() {
      this.pickerTime = [this.formatDate(), this.formatDate()];
      const { shiftList, currentShiftId } = await this.queryShiftList();
      if (shiftList && shiftList.length > 0) {
        const allShiftList = [{ id: '', name: this.$t('Dict.All') }, ...shiftList];
        if (this.openBuffetDeposit) { // 如果开启了自助餐 选中到对应市别
          allShiftList.map((item, index) => {
            if (item.id === currentShiftId) {
              this.shiftActiveIndex = index;
            }
            return item;
          });
        } else { // 没有开启自助餐 市别选中到全部
          this.shiftActiveIndex = 0;
        }
        this.shifts = cloneDeep(allShiftList);
      } else {
        this.shifts = [{ id: '', name: this.$t('Dict.All') }];
      }
      let statusArr = cloneDeep([{ id: '', name: this.$t('Dict.All') }, ...tmpStatus]);
      let sourceArr = cloneDeep([{ id: '', name: this.$t('Dict.All') }, ...tmpSource]);
      // 如果没有开启自助押金，则过滤列表不显示自助押金项
      if (!this.openBuffetDeposit) {
        sourceArr = sourceArr.filter(item => item.id !== 0);
        statusArr = statusArr.filter(item => item.id !== 5);
      } else {
        sourceArr = [];
        // 自主押金二期调整：如果开启了自主押金，则状态列已使用改为已罚没
        statusArr = statusArr.filter(item => item.id !== 4);
      }
      this.status = statusArr;
      this.source = sourceArr;
    },
    // 请求市别列表
    queryShiftList() {
      const { shopId } = this.posBaseInfo;
      return ajax('canyin.pos.buffetdeposit.queryshiftlist', {
        contentType: 'json',
        data: {
          shopId,
        },
      });
    },
    // 登记押金后刷新押金列表
    // active刷新偶是否选中第一条数据
    // 当active为true时 不清除输入框的值
    async refreshDepositList(active = false, cb = null) {
      const tmpArr = await this.queryDepositList() || [];
      this.tableData = tmpArr.map((item) => {
        item.checked = false;
        return item;
      });
      if (active || this.whereOpen === 'payIndex') {
        this.activeFirstOrAllList(false);
      } else if (this.whereOpen === 'payIndex') {
        this.activeFirstOrAllList(true, true); // 第一个参数是否清空输入框值，第二个参数是选中第一条还是所有列
      }
      this.refreshPager();
      if (cb && this.tableData.length === 0) {
        cb();
      }
    },
    // 请求押金列表
    queryDepositList() {
      const {
        pickerTime, openBuffetDeposit,
      } = this;
      const tmpData = {};
      // 如果是从结算和客位进来的 按bsId查
      if (this.whereOpen === 'payIndex' || this.whereOpen === 'tablesIndex') {
        if (this.precisionSearch) {
          tmpData.bsId = this.baseData.bsId; // 押金单号 结算客位进来的按bsId查
          this.inputValue = '';
        } else {
          tmpData.codeOrPointName = this.inputValue;
        }
      } else if (this.whereOpen === 'booking') {
        if (this.precisionSearch) {
          tmpData.bookOrderId = this.baseData.bookingData.bookOrderId; // 预订单号 预订单进来的按预订单号查
          this.inputValue = '';
        } else {
          tmpData.codeOrPointName = this.inputValue;
        }
      } else {
        tmpData.codeOrPointName = this.inputValue; // 搜索框的值 非结算客位预订进来的按这个查
        if (!openBuffetDeposit) {
          tmpData.depositType = '';
        }
      }
      if (this.getVuexPosMode === '3') {
        tmpData.orderCode = tmpData.codeOrPointName;
        delete tmpData.codeOrPointName;
      }
      let beginTime = pickerTime[0];
      let endTime = pickerTime[1];
      // 如果是精准查询(客位，结算，预订页进入的)不传时间参数，查当前id下的所有押金单
      if (tmpData.bsId || tmpData.bookOrderId) {
        beginTime = '';
        endTime = '';
      }
      const data = {
        beginTime,
        endTime,
        // shiftId: shifts.length > 0 ? shifts[shiftActiveIndex].id : '', // 市别id （早 晚 中市）
        // state: status.length > 0 ? status[stateActiveIndex].id : '', // 状态id （登记 退 使用）
        depositType: openBuffetDeposit ? 0 : '', // 押金类型(0-自助 1-堂食 2-预订)
        isOpenBuffetDeposit: openBuffetDeposit ? 1 : 0, // 如果开启了自助餐传1 所有查的都是自助餐下的
        ...tmpData,
      };
      return ajax('canyin.pos.buffetdeposit.querydepositdetail', {
        contentType: 'json',
        data,
      });
    },
    // 查询按钮点击事件
    async search() {
      let isScanCode = this.getCookie('isScanCode');
      if (isScanCode) {
        isScanCode = JSON.parse(isScanCode);
      }
      if (this.isEnter) { // 回车触发
        if (isScanCode) { // 扫码调用的回车
          const tmpArr = await this.queryDepositList() || [];
          this.tableData = tmpArr.map((item) => {
            item.checked = false;
            return item;
          });
          this.activeFirstOrAllList();
        } else if (!this.isHandlerTriggerEnter) { // 手动回车
          this.isHandlerTriggerEnter = true;
          const tmpArr = await this.queryDepositList() || [];
          this.tableData = tmpArr.map((item) => {
            item.checked = false;
            return item;
          });
        }
      } else { // 点击触发
        this.canClickSearch = false; // 禁止重复点击
        const tmpArr = await this.queryDepositList() || [];
        this.tableData = tmpArr.map((item) => {
          item.checked = false;
          return item;
        });
      }
      setTimeout(() => {
        this.isHandlerTriggerEnter = false;
        this.canClickSearch = true;
      }, 1000);
      this.refreshPager();
      this.isEnter = false;
      document.cookie = 'isScanCode=false;'; // 重置isScanCode
    },
    // 选中列表的第一条
    activeFirstOrAllList(clear = true) {
      const { tableDataShow } = this;
      if (tableDataShow && tableDataShow.length > 0) {
        if (this.whereOpen === 'payIndex') { // 从结算界面进入的 默认选中所有押金列表
          this.tableData.forEach((item) => {
            if (item.state === 1) {
              item.checked = true;
            }
          });
        } else { // 不是结算界面进入的 默认选中第一条
          for (let i = 0; i < tableDataShow.length; i += 1) {
            if (this.tableData[i].state === 1) {
              this.tableData[i].checked = true;
              break;
            }
          }
        }
      }
      if (clear) {
        this.inputValue = '';
      }
    },
    // 列表是否有选中的
    hadTableListChecked() {
      return this.tableData.filter(item => item.checked) || [];
    },
    // 罚没或退押金确认 type=2罚没 type=1退
    recedeDepositConfirm(type) {
      const activeArr = this.hadTableListChecked();
      if (activeArr.length === 0) return;
      if (activeArr.length > 1) {
        this.$message.warning(this.$t('Biz.Pos.More.BuffetDeMsg1'));
        return;
      }
      const msg = type === 1 ? this.$t('Biz.Pos.More.BuffetDeConfirm1') : this.$t('Biz.Pos.More.BuffetDeConfirm5');
      this.$confirm(`${msg}${activeArr[0].code}${this.$t('Biz.Pos.More.BuffetDeConfirm2')}`, {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        if (type === 1) {
          this.recedeDeposit(activeArr[0]);
        } else if (type === 2) {
          this.forfeit(activeArr[0]);
        }
      }).catch(() => false);
    },
    // 根据返回类型执行对应操作(关台，废单)
    baseTypeDoSomething(type) {
      switch (type) {
        case 0:
          this.refreshDepositList();
          break;
        case 1:
          this.$confirm(this.$t('Biz.Pos.More.BuffetDeConfirm3'), {
            confirmButtonText: this.$t('Dict.Sure'),
            cancelButtonText: this.$t('Dict.Cancel'),
            type: 'warning',
          }).then(() => {
            this.requestCloseBill();
            this.refreshDepositList();
          }).catch(() => {
            this.refreshDepositList();
          });
          break;
        case 2:
          this.$confirm(this.$t('Biz.Pos.More.BuffetDeConfirm4'), {
            confirmButtonText: this.$t('Dict.Sure'),
            cancelButtonText: this.$t('Dict.Cancel'),
            type: 'warning',
          }).then(() => {
            this.requestAbandonedBill();
            this.refreshDepositList();
          }).catch(() => {
            this.refreshDepositList();
          });
          break;
        default:
          this.$message({
            type: 'error',
            message: 'unknow type',
            duration: 1000,
          });
      }
    },
    // 执行退押金
    recedeDeposit(item) {
      const data = {
        from: 3,
        id: item.id || '',
        code: item.code || '',
        bsId: item.bsId || null,
        linkData: item.code || null, // 押金单号
        shopId: this.posBaseInfo.shopId || null,
        money: item.payMoney || 0, // 金额
        empId: this.posBaseInfo.user.id, // 操作人id
        posId: this.posBaseInfo.id || null,
        pointId: item.relationPointId || null, // 关联客位id
        orderId: null,
        rfOrderId: null,
      };
      ajax('canyin.pos.buffetdeposit.canceldeposit', {
        contentType: 'URLEncoded',
        data,
      }).then((res) => {
        if (res) {
          this.$message({
            type: 'success',
            message: `${res.msg}`,
            duration: 1000,
          });
          if (this.whereOpen === 'payIndex') {
            this.$vemit('refreshBill', '1'); // 刷新结算页面(从结算进入登记押金页面，退押金完成后需要刷新结算页面来获取最新的押金金额)
          }
          this.baseTypeDoSomething(+res.data.type);
        }
      });
      /*
      ajax('canyin.pos.buffetdeposit.canceldeposit', {
        contentType: 'URLEncoded',
        data,
      }).then((res) => {
        if (res) {
          this.$message({
            type: 'success',
            message: `${res.msg}`,
            duration: 1000,
          });
          if (this.whereOpen === 'payIndex') {
            this.$vemit('refreshBill', '1'); // 刷新结算页面(从结算进入登记押金页面，退押金完成后需要刷新结算页面来获取最新的押金金额)
          }
          switch (+res.data.type) {
            case 0:
              this.refreshDepositList();
              break;
            case 1:
              this.$confirm(this.$t('Biz.Pos.More.BuffetDeConfirm3'), {
                confirmButtonText: this.$t('Dict.Sure'),
                cancelButtonText: this.$t('Dict.Cancel'),
                type: 'warning',
              }).then(() => {
                this.requestCloseBill();
                this.refreshDepositList();
              }).catch(() => {
                this.refreshDepositList();
              });
              break;
            case 2:
              this.$confirm(this.$t('Biz.Pos.More.BuffetDeConfirm4'), {
                confirmButtonText: this.$t('Dict.Sure'),
                cancelButtonText: this.$t('Dict.Cancel'),
                type: 'warning',
              }).then(() => {
                this.requestAbandonedBill();
                this.refreshDepositList();
              }).catch(() => {
                this.refreshDepositList();
              });
              break;
            default:
              this.$message({
                type: 'error',
                message: 'unknow type',
                duration: 1000,
              });
          }
        }
      });
      */
    },
    // 登记押金页面修改关联客位
    associatedOrChangeTable(data) {
      this.$refs.associatedTable.open(
        {
          currentBuffetDepositData: data,
          source: 'registerDeposit',
        },
      );
    },
    // 关联客位
    associatedTable() {
      const activeArr = this.hadTableListChecked();
      if (activeArr.length === 0) return;
      if (activeArr.length > 1) {
        this.$message.warning(this.$t('Biz.Pos.More.BuffetDeMsg2'));
        return;
      }
      this.$refs.associatedTable.open(
        {
          currentBuffetDepositData: activeArr[0],
          source: 'buffetDeposit',
        },
      );
    },
    // 补打押金单
    printOrder() {
      const activeArr = this.hadTableListChecked();
      if (activeArr.length === 0) return;
      if (activeArr.length > 1) {
        this.$message.warning(this.$t('Biz.Pos.More.BuffetDeMsg3'));
        return;
      }
      ajax('canyin.pos.buffetdeposit.printbuffetdeposit', {
        contentType: 'json',
        data: {
          id: activeArr[0].id,
          orderCode: activeArr[0].orderCode || null,
        },
      }).then((res) => {
        this.$message({
          type: 'success',
          message: `${res}`,
          duration: 1000,
        });
      });
    },
    // 押金列表点击事件
    activeRowHandle(item) {
      if (this.whereOpen === 'payIndex') {
        item.checked = !item.checked;
      } else if (item.checked) {
        item.checked = false;
      } else {
        this.tableData.forEach(item => item.checked = false);
        item.checked = true;
      }
    },
    // 押金列表双击事件
    dbClickItem(item) {
      if (this.limit.register) {
        this.depositData = item;
        console.info('1111', this.baseData);
        this.$refs.editDeposit.open(this.baseData);
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('Biz.Pos.More.BuffetDeMsg5'),
          duration: 1000,
        });
      }
    },
    // 修改押金
    editRemark() {
      const activeArr = this.hadTableListChecked();
      this.dbClickItem(activeArr[0]);
    },
    // 设置当前市别或状态的下标
    chooseActiveShiftsOrStatus(key, index) {
      this[key] = index;
      this.refreshPager();
    },
    // 初始化按钮操作权限
    initBtnLimit() {
      // 从结算客位预订进入的此页面不做登记和退押金的权限校验
      // 只有从押金管理进入的页面才校验权限
      // 后来又说受这个控制，暂时注释掉省的以后又改回来
      // if (!this.whereOpen) {
      //   this.limit.register = true;
      //   this.limit.back = true;
      //   return;
      // }
      const baseArr = cloneDeep(this.ALL_POS_MODULE);
      let hasSetLimit = false;
      baseArr.map((item) => {
        if (+item.id === 1252) {
          if (item.children && item.children.length > 0) {
            hasSetLimit = true;
            item.children.map((son) => {
              switch (+son.id) {
                case 1253:
                  this.limit.register = son.checked; // 登记押金
                  break;
                case 1254:
                  this.limit.back = son.checked; // 退押金
                  break;
                case 1499:
                  this.limit.forfeit = son.checked; // 罚没押金
                  break;
                default:
                  console.warn('位置的权限操作');
              }
              return son;
            });
          }
        }
        return item;
      });
      if (!hasSetLimit) {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Pos.More.BuffetDeMsg4'),
          duration: 1000,
        });
      }
    },
    // 打开登记押金
    onSubmit() {
      if (this.limit.register) {
        this.$refs.registerDeposit.open(this.baseData);
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('Biz.Pos.More.BuffetDeMsg5'),
          duration: 1000,
        });
      }
    },
    // 过滤押金列表市别
    filterShifts(arr) {
      const { shiftActiveIndex, shifts } = this;
      if (!arr || arr.length === 0) return [];
      if (shifts.length < 1) {
        return arr;
      }
      if (Object.is(+shiftActiveIndex, 0)) {
        return arr;
      }
      const currentShift = shifts[shiftActiveIndex].id;
      return arr.filter(item => item.shiftId === currentShift);
    },
    // 过滤押金列表状态
    filterStatus(arr) {
      const { stateActiveIndex, status } = this;
      if (!arr || arr.length === 0) return [];
      if (status.length < 1) {
        return arr;
      }
      if (Object.is(+stateActiveIndex, 0)) {
        return arr;
      }
      const currentStatus = status[stateActiveIndex].id;
      return arr.filter(item => +item.state === +currentStatus);
    },
    // 过滤押金列表来源
    filterSource(arr) {
      const { sourceActiveIndex, source } = this;
      if (!arr || arr.length === 0) return [];
      if (source.length < 1) {
        return arr;
      }
      if (Object.is(+sourceActiveIndex, 0)) {
        return arr;
      }
      const currentSource = source[sourceActiveIndex].id;
      return arr.filter(item => +item.source === +currentSource);
    },
    // 过滤方法整理
    oneForAllToFillter(base, arr, index, key) {
      if (!base || base.length === 0) return [];
      if (arr.length < 1) {
        return base;
      }
      if (Object.is(+index, 0)) {
        return base;
      }
      const currentId = arr[index].id;
      return base.filter(item => item[key] === currentId);
    },
    // 限制输入数字
    InputNumber(key) {
      const str = this[key];
      this.$nextTick(() => {
        let str2 = '';
        str2 += str;
        // str2 = str2.replace(/[^\d]/g, '');
        str2 = str2.replace(/[^0-9a-zA-Z]/gi, '');
        this[key] = str2.toUpperCase();
      });
    },
    // 获得cookie值
    getCookie(name) {
      const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
      const arr = document.cookie.match(reg);
      if (arr) {
        return unescape(arr[2]);
      }
      return null;
    },
    // 废单
    requestAbandonedBill(authData = {}) {
      this.$log.info(`退押金执行废单开始：${new Date().getTime()}`);
      this.$vonce('authCode', (code) => {
        this.requestAbandonedBill(code);
      });
      const activeArr = this.hadTableListChecked();
      const params = {
        pointId: activeArr.length > 0 ? activeArr[0].relationPointId : '',
        teamBsIds: '',
        ...authData,
      };
      ajax('canyin.pos.abandonedbill.abandonedbill', {
        params: { params },
      }).then((res) => {
        if (res.result === 1) {
          this.$message({
            type: 'success',
            message: this.$t('Dict.WasteSuccess'),
            duration: 1000,
          });
          setTimeout(() => {
            this.$vemit('clearEmptyBill', {});
          }, 200);
        } else if (res.result === -2) {
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else {
          this.$message({
            type: 'error',
            message: res.msg,
            duration: 1000,
          });
        }
      });
    },
    // 关台
    requestCloseBill() {
      const activeArr = this.hadTableListChecked();
      const params = {
        pointId: activeArr.length > 0 ? activeArr[0].relationPointId : '',
        controlMode: 1,
        teamBsIds: '',
      };
      ajax('canyin.pos.closeBill.closeBill', {
        params: { params },
      }).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('Biz.Pos.More.BuffetDeMsg7'),
          duration: 1000,
        });
        setTimeout(() => {
          this.$vemit('clearEmptyBill', {});
        }, 200);
      });
    },
    // 获取搜索框用的快捷键
    setKeySearchHotKey() {
      if (!this.showDom) return {};
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
      if (document.hasFocus() && document.activeElement === this.$refs.input) return;
      this.inputValue = `${this.inputValue}${key}`;
    },
    // 在没有焦点情况下删除最后一个文本
    delWordInBlur() {
      if (document.hasFocus() && document.activeElement === this.$refs.input) return;
      this.inputValue = KeyboardUtil.deleteLastChar(this.inputValue);
    },
    // 格式化登记方式
    formatRegisterType(arr = []) {
      if (arr && arr.length > 0) {
        return arr.reduce((type, item) => type += item.paywayName, '');
      }
      return '';
    },
    // 登记方式排序
    sort(arr = []) {
      arr.sort((a, b) => a.sortOrder - b.sortOrder);
    },
    // 刷新分页
    refreshPager() {
      // 清备注 刷分页
      this.$nextTick(() => {
        this.$refs.orderPager.refresh();
      });
    },
    /** 格式化时间相关方法 * */
    // 转为正常时间字符串 2019-08-08
    formatDate(num) {
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      if (+num) {
        day += num;
        if ([1, 3, 5, 7, 8, 10, 12].indexOf(month) > -1) { // 31天的情况
          [year, month, day] = [...this.factory(year, month, day, 31)];
        } else if ([4, 6, 9, 11].indexOf(month) > -1) { // 30天的情况
          [year, month, day] = [...this.factory(year, month, day, 30)];
        } else if (this.isLeapYear(year)) { // 闰年的2月份 29天的情况
          [year, month, day] = [...this.factory(year, month, day, 29)];
        } else { // 平年的2月份 28天的情况
          [year, month, day] = [...this.factory(year, month, day, 28)];
        }
      }
      month = this.double(month);
      day = this.double(day);
      return `${year}-${month}-${day}`;
    },
    factory(year, month, day, num) {
      if (day > num) { // num为整数 相加大于31的情况（day - 31）
        day -= num;
        month += 1;
        if (month > 12) { // 月份加1 如果相加大于12的话 年加1
          month -= 12;
          year += 1;
        }
      } else if (day < 1) { // num为负数 相加小于1的情况 (上个月的天数减去day + 1  monthD - day + 1)
        month -= 1;
        if (month < 1) { // 正好是1月份 年减少1
          year -= 1;
        }
        if ([1, 3, 5, 7, 8, 10, 12].indexOf(month) > -1) { // 上个月是31天的情况
          day = 31 + day + 1;
        } else if ([4, 6, 9, 11].indexOf(month) > -1) { // 上个月是30天的情况
          day = 30 + day + 1;
        } else if (this.isLeapYear(year)) { // 闰年的2月份 29天的情况
          day = 29 + day + 1;
        } else {
          day = 28 + day + 1;
        }
      }
      return [year, month, day];
    },
    // 数字不足两位，在前面补0
    double(num) {
      const str = `${num}`;
      if (str.length === 1) return `0${str}`;
      return str;
    },
    // 判断是否为闰年
    isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    },
  },
};
</script>
<!--<style lang="less" scoped>-->
  <!--@import "~@/common/less/variables.less";-->
  <!--@import "~@/common/less/mixins.less";-->
  <!--.buffet-deposit {-->
    <!---->
  <!--}-->
<!--</style>-->
<style lang="less" scoped>
  // @import "~@/common/less/variables.less"
  @import "~@/common/less/mixins.less";
  @import "../Booking/BookingCommon/common.less";
  .buffet-deposit {
    padding: 5px;
  }
  .btn-wrap > button {
    height: 44px;
  }
  .booking-dropdown-group {
    height: 36px;
    display: table;
    text-align: center;
    border-radius: 18px;
    .bgc(@toggleBtnBg);

    .dropdown-btnGroup {
      width: 25%;
      float: left;
      position: relative;
      cursor: pointer;
      border-right: 1px solid @rgba255-20;

      &:first-child {
        border-radius: 20px 0 0 20px;
      }

      &:last-child {
        border: none;
        border-radius: 0 20px 20px 0;
        &.lastItem {
          padding-right: 18px;

          .dropdown-btn-txt {
            > em {
              right: calc(4% + 18px);
            }
          }
        }
      }

      &.active {
        .bgc(@toggleBtnActive);

        .dropdown-btn-txt {
          > em:before {
            content: "\e8aa";
          }
        }
      }

      &.chartFilterRange .dropdown-btn-itemBox {
        width: 306%;

        .chartFilterRange-scale {
          width: 14px;
          height: 14px;
          float: left;
          display: block;
          margin-top: 34px;
          position: relative;
          .setFont(12px, #fff);

          .startSign,
          .endSign {
            position: absolute;
            color: @activeColor;
            .normalFont;
            bottom: 16px;
            right: -2px;
          }
          .endSign {
            left: -15px;
          }
        }
        .chartFilterRange-reWrite {
          width: 80%;
          float: left;
        }
      }

      .dropdown-btn-txt {
        width: 76%;
        max-width: 200px;
        height: 36px;
        margin: 0 auto;
        line-height: 36px;
        .setFont(14px, #273844);

        > em {
          position: absolute;
          right: 4%;
          top: 0;
        }
      }

      .dropdown-btn-itemBox {
        width: 440px;
        border-radius: 4px;
        position: absolute;
        top: 37px;
        left: 0;
        padding: 22px;
        .bgc(rgba(46, 74, 89, 0.95));
        cursor: default;
        z-index: 500;

        &.firstDropItem {
          left: 13px;
        }

        .dropdown-btn-item {
          float: left;
          margin: 0 30px 12px 0;
          color: #fff;
          cursor: pointer;

          > span {
            width: 18px;
            height: 18px;
            line-height: 14px;
            display: inline-block;
            margin-right: 6px;
            vertical-align: middle;
            border: 1px solid #9aa7af;
            border-radius: 3px;

            .checkSign {
              .setFont(12px, @activeColor);
            }
          }
        }

        .dropdown-btn-allOrNo {
          width: 100%;
          float: left;
          margin-top: 10px;
          text-align: left;
          color: @activeColor;

          > span {
            margin: 0 6px;
            cursor: pointer;
            &:active {
              border-bottom: 1px solid @activeColor;
            }
          }
        }
      }
    }
  }
  .businessShift-btnBox {
    margin-top: 12px;
    .businessShift-btn {
      /*width: 110px;*/
      width: 82px;
      line-height: 36px;
      border-radius: 20px;
      border: none;
      color: #273844;

      &.active {
        border-radius: 20px;
        .bgc(@toggleBtnActive);
        color: #fff;
      }
    }
  }
  .stateBox(@bgc, @color) {
    background-color: @bgc;
    color: @color;
  }
  .table-ordersBox {
    height: 100%;
    position: relative;
    padding-top: 135px;

    .table-order-queryBox {
      width: 100%;
      .positionTop;
      .next-line-filter {
        display: flex;
        width: 100%;
        .margin-left-12 {
          margin-left: 12px;
        }
      }
    }

    .table-datePicker {
      float: left;
      margin-right: 12px;
    }

    .booking-dropdown-group.businessShift-btnBox {
      float: left;
      margin: 0;
      &.no-margin {
        margin: 0;
      }
    }

    .queryBtn {
      margin: 12px 0 0 10px;
      float: right;
      outline: none;
      border: none;
      width: 72px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      border-radius: 20px;
      .btnPress(@toggleBtnBg);
      cursor: pointer;
      .bgc(#4cb862);
      color: #fff;
    }

    .order-dropdown-group {
      clear: both;
    }
    .booking-dropdown-group {
      // width: 45%;
      float: left;
      margin-top: 12px;
      .dropdown-btnGroup.orderDropDown {
        width: 33.33%;

        .dropdown-btn-txt > em {
          right: 8%;
        }

        &:last-child {
          padding-right: 18px;

          .dropdown-btn-txt > em {
            right: calc(4% + 18px);
          }
        }
      }
    }

    .queryKeyWord {
      width: 22%;
      height: 36px;
      position: relative;
      line-height: 36px;
      margin-top: 12px;
      padding-left: 16px;
      border-radius: 20px;
      float: right;
      color: #344b5b;
      .bgc(@toggleBtnBg);

      > em {
        float: left;
        font-size: 24px;
      }

      > input {
        border: none;
        z-index: 3;
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
        z-index: 1;
        border-radius: 20px;
        border: 1px solid transparent;
      }
    }

    .orderTable-row {
      display: flex;
      width: 100%;
      height: 39px;
      line-height: 39px;
      border: 1px solid #ccc;
      border-top: none;
      font-size: 0;
      &.active {
        background-color: #c0dae0;
        transition: all .8s;
      }
      &.black > li {
        color: black;
      }
      &.red > li {
        color: red;
      }
      &.blue > li {
        color: #0babb9;
      }
      &.active > li {
        color: #ffffff;
        transition: all .2s;
      }
      &.open {
        .orderTable-row-item {
          &:last-child {
            border-right: none;
          }
          &:nth-child(1){
            width: 10%;
          }
          &:nth-child(2){
            width: 4%;
          }
          &:nth-child(3){
            width: 5%;
          }
          &:nth-child(4){
           width: 7%;
          }
          &:nth-child(5){
            width: 7%;
          }
          &:nth-child(6){
            width: 5%;
          }
          &:nth-child(7){
            width: 6%;
          }
          &:nth-child(8){
            width: 13%;
          }
          &:nth-child(9){
            width: 6%;
          }
          &:nth-child(10){
            width: 13%;
          }
          &:nth-child(11){
            width: 6%;
          }
        }
      }
      .orderTable-row-item {
        height: 38px;
        display: inline-block;
        padding: 0 2px;
        overflow: hidden;
        border-right: 1px solid #ccc;
        word-break: break-word;
        text-align: center;
        .setFont(12px, #273844);

        &:last-child {
          border-right: none;
        }

        &:nth-child(1){
          width: 10%;
        }
        &:nth-child(2){
          width: 4%;
        }
        &:nth-child(3){
          width: 5%;
        }
        &:nth-child(4){
          width: 7%;
        }
        &:nth-child(5){
          width: 7%;
        }
        &:nth-child(6){
          width: 5%;
        }
        &:nth-child(7){
          width: 6%;
        }
        &:nth-child(8){
          width: 6%;
        }
        &:nth-child(9){
          width: 9%;
        }
        &:nth-child(10){
          width: 6%;
        }
        &:nth-child(11){
          width: 13%;
        }
        &:nth-child(12){
          width: 6%;
        }
        &:nth-child(13){
          width: 13%;
        }
        &:nth-child(14){
          width: 6%;
        }
      }

      .item-stateLogo {
        padding: 4px 8px;
        border-radius: 20px;
        text-align: center;
        &.state-0 {
          .bgc(#3e76cf);
          color: white;
        }
        &.state-1 {
          .bgc(#5ab95a);
          color: white;
        }
        &.state-2 {
          .bgc(#f9767c);
          color: white;
        }
        &.state-3 {
          .bgc(#ffa95a);
          color: white;
        }
      }
    }

    .orderTable-title {
      top: 96px;
      left: 0;
      position: absolute;
      .bgc(#65a4a9);
      border: 1px solid #ccc;

      .orderTable-title-item {
        border-right: 1px solid #ccc;
        color: white;
        &:last-child {
          border-right: none;
        }
      }
    }

    .orderTable-listBox {
      height: 390px !important;
      overflow: hidden;
      color: #273844;
      // border: 1px solid #29424f;
      // border-top: none;

      .orderTable-row {
        &.active {
          .bgc(#0babb9);
        }
      }

      .orderTable-row-item {
        cursor: pointer;
      }
    }
  }
  .rightArea-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% - 24px);
    height: 36px;
    .absolute;
    bottom: 16px;
    left: 0;
    right: 0;
    margin: auto;
    .setFont(14px, #fff);
    .table-datePicker {
      float: left;
      margin-right: 8px;
    }
    .table-dateInCol-box {
      width: 82px;
      float: left;
    }

    .table-dateInterval-box {
      height: 36px;
      line-height: 36px;
      margin-left: 18px;
      float: left;
      color: #273844;
      > span {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
          > em {
            text-decoration: underline;
            color: #273844;
          }
        }
        > em {
          .normalFont;
          color: #919799;
        }
      }
    }

    .table-pager-box {
      float: right;
    }

    .orderTable-listNum {
      /*float: left;*/
      /*line-height: 36px;*/
      .setFont(12px, #999);
    }

    .orderTable-option {
      float: right;

      .cancel {
        .bgc(@rgba255-20);
      }
      .modify {
        .bgc(#2e76cb);
      }

      .print {
        width: 96px;
      }
      .print,
      .execute {
        .bgc(#0babb9);
      }

      > li {
        width: 72px;
        height: 36px;
        float: right;
        margin-right: 8px;
        line-height: 36px;
        text-align: center;
        border-radius: 20px;
        .setFont(14px, #fff);
        .btnPress(#666);
        cursor: pointer;
      }

      > li.btnDisalbed {
        cursor: not-allowed;
        opacity: 0.5;
        &:active {
          border: none;
        }
      }
    }
    .orderTable-pagerNum {
      /*float: right;*/
      margin-left: 300px;
    }
  }
  // 预订单取消原因弹窗
</style>
<style lang="less">
  .buffet-deposit .el-input__prefix{
    color: black;
  }
  .buffet-deposit input::-webkit-input-placeholder{
    color: black;
  }
  /* 覆盖element-ui dataPicker样式 */
  .buffet-deposit .el-dialog__body {
    background-color: #ffffff;
  }
  .datePicker-box {
    > .el-date-editor {
      /*width: 142px;*/
      height: 36px;
    }
    .el-input__inner {
      /*width: 142px;*/
      height: 36px;
      border-radius: 40px;
    }
  }
  .pickerDatePopperClass {
    width: 280px;

    .el-date-table {
      width: 85%;
    }
    .el-date-table td {
      padding: 0;
    }
    .el-date-picker__header {
      margin-bottom: 0;
    }
    .el-picker-panel__content {
      margin-top: 0;
    }
  }

  .memberCallList-pagerBox .pos-booking-list-pager.pager {
    > span {
      margin-right: 14px;
      color: #666;
    }
    .pager-btn {
      background-color: #f0f2f3;
      color: #333;
    }
    .pager-btn[disabled] {
      color: #999;
    }
  }

  .table-datePicker .el-input__inner {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: transparent;
    color: #273844;
  }
  .buffet-deposit .table-ordersBox .table-datePicker .el-input__inner {
    width: 360px;
    color: #273844;
    background-color: #c0dae0;
  }
  .buffet-deposit .table-ordersBox .table-datePicker .el-input__inner input {
    color: #273844;
    background-color: transparent;
  }
  .buffet-deposit .table-ordersBox .table-datePicker .el-input__inner input::-webkit-input-placeholder{
    color: #273844;
  }
  .buffet-deposit.table-ordersBox .table-datePicker .el-input__inner .el-range__icon {
    color: #273844;
  }
  .buffet-deposit .table-ordersBox .el-date-editor .el-range-separator {
    display: inline-block;
    height: 100%;
    padding: 0 5px;
    text-align: center;
    line-height: 32px;
    font-size: 14px;
    width: 5%;
    color: #303133;
    margin-top: -3px;
  }
  .table-dateInCol-box .el-dropdown {
    width: 84px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.2);
    border-color: transparent;
    color: #273844;
  }
  // 新建预订单
  // 覆盖弹窗body样式
  .booking-container .pos-dialog > .el-dialog__body {
    background-color: #eee;
  }

  .addOrder-dateBox .el-date-editor.el-input {
    width: 160px;
  }
  .pos-booking-chart-pager.pager,
  .pos-booking-order-pager.pager {
    .pager-btn {
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid transparent;
      font-weight: bold;
      color: #273844;
    }
  }
  .pos-booking-addChangePoint-pager.pager {
    .pager-btn {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
  .addBookingDialog {
    // width: 82px;
    margin-left: 10px;
    // font-weight: bold;
    > em {
      display: inline-block;
      // width: 14px;
      font-style: normal;
    }
  }
  // 客位已预订列表 弹窗
  .bookedPointListDialog {
    max-height: 460px;
    overflow: scroll;
  }
  // 客位预订订金列表
  #addOrderDepositPaywayList {
    position: absolute;
    top: 1px;
    right: 115px;
    border: none;
    text-align: left;
    padding-left: 6px;
  }
</style>
