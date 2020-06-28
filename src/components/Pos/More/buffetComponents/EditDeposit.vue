<template>
  <Dialog
    name="PosDialog.registerDeposit"
    :title="$t('Biz.Pos.More.DepositTitle2')"
    ref="dialog"
    class="bg-white"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :appendToBody="true"
    :hotkeys="AddPayHotkey"
    :closeByClickModel="false"
    :showSubmit="true"
    width="600px"
    height="450px"
    top="16vh">
    <!--结算 客位 预订登记押金单-->
    <div class="header" v-if="depositData.relationPointId">
      <div>
        <span class="img"></span>
        <span class="color">{{ depositData.areaName }}.{{ depositData.relationPointName}}</span>
      </div>
      <div>
        <span>{{$t('Dict.NumberOfPeople01')}}</span>
        <span>{{ depositData.peopleQty }}</span>
      </div>
      <div>
        <span>{{$t('Biz.Pos.More.DepositSpan1')}}</span>
        <span>{{ depositData.payMoney }}</span>
      </div>
    </div>
    <!--自助押金或普通登记押金单-->
    <div class="header" v-else>
      <div>
        <span>{{$t('Biz.Pos.More.DepositSpan2Label')}}</span>
        <span>{{ depositData.code }}</span>
      </div>
      <div>
        <span>{{$t('Dict.OperatorLabel')}}</span>
        <span>{{ operatorName }}</span>
      </div>
    </div>
    <div class="withdraw-big-cash">
      <div class="input-wrap">
        <!--只有自助餐押金才显示就餐人数-->
        <div class="input" v-if="showPeopleInput">
          <span>{{$t('Dict.EatPersonNum')}}</span>
          <div>{{ $t('Dict.ManyPerson', [depositData.peopleQty]) }}</div>
        </div>
        <div class="input">
          <span class="no-before">{{$t('Biz.Pos.More.DepositSpan4')}}</span>
         <div>{{depositData.payMoney}}</div>
        </div>
        <div class="input">
          <span class="no-before">{{$t('Dict.SettlementMethod')}}</span>
          <div>{{depositData.paywayDTOList ? depositData.paywayDTOList[0].paywayName : ""}}</div>
        </div>
        <div class="input associated">
          <span class="no-before remark margin-top-10">{{$t('Dict.Remarks')}}</span>
          <div class="width100">
            <el-input type="textarea"
              :maxlength="200"
              v-model="depositData.remark"
              @focus="showAndroidInput('remark')"
              :autosize="{ minRows: 3, maxRows: 3}" resize="none"
            ></el-input>
            <button
              type="button"
              class="btn btn-default margin-top-10"
              @click = "handWriting"
              v-hideHandwritingBoard
            >
              <i class="icon icon-edit"></i>
              <!-- 手写板 -->
              <span>{{ $t('Dict.WritingPad') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <PayWayBankModal
      @closeRegisterDeposit="closeRegisterDeposit"
      @clearActivePayWayTypeIndex="clearChoosePayType"
      :amount-to-be-paid="depositAmount"
      :isBuffet="isBuffet"
      ref="payWayBankModal"
    ></PayWayBankModal>
    <BuffetScanCode
      @closeRegisterDeposit="closeRegisterDeposit"
      @clearActivePayWayTypeIndex="clearChoosePayType"
      ref="buffetScanCode"
    ></BuffetScanCode>
  </Dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';

// 结算-银行卡
const PayWayBankModal = (resolve) => {
  import('@/components/Pos/Order/Bill/Pay/components/PayWayBankModal').then((module) => {
    resolve(module);
  });
};
// 微信+支付宝二码合一超级无敌付款码
const BuffetScanCode = (resolve) => {
  import('@/components/Pos/Order/Bill/Pay/PaymentCode/BuffetScanCode').then((module) => {
    resolve(module);
  });
};
const sourceArr = ['payIndex', 'tablesIndex', 'booking'];
export default {
  name: 'registerDeposit',
  // abstract: true,
  components: {
    Dialog,
    PayWayBankModal,
    BuffetScanCode,
  },
  mixins: [DialogMixin, PageMixin, AndroidInputMixin],
  data() {
    return {
      eatNum: '', // 就餐人数
      depositAmount: '', // 押金金额，根据后台的设置进行计算 (1：可编辑,总押金 = 人数 * 押金费品项。2：不可编辑,2-1：不能编辑押金金额根据后台设置,2-2：总押金 = 人数 * 押金金额)；
      payType: '', // 结算方式
      activePayWayTypeIndex: '', // 结算方式下标
      canOperationDepositAmount: true, // 后台默认押金可编辑
      canOperationDepositAmountType: 1, // 押金金额：0:押金金额固定为押金费品项;1:押金金额为人数x押金费品项
      buffetFoodItemsFee: 0,
      showInfo: true,
      payWays: [],
      isBuffet: true, // 结算方式中的银行卡是否显示备注
      prePageSize: 4, // 每页4条数据
      depositInfo: null,
      depositOrder: '', // 押金单号
      operatorName: '赵丽颖老公',
      currentAssociatedTable: null, // 当前关联的客位
      baseData: null, // resData
      depositMoney: 0, // 总的押金金额
      openBuffetDeposit: false, // 是否开启了自助餐押金
      closeHandWriting: false, // 是否启动手写板
      remark: '',
    };
  },
  props: {
    // 是否显示人数输入框（只有自助押金逻辑才显示人数输入框）
    showPeopleInput: {
      type: Boolean,
      default: false,
    },
    // 结算 - payIndex，客位 - tablesIndex，预订 - booking，押金管理 - ''
    whereOpen: {
      type: String,
      default: '',
    },
    // 押金单数据
    depositData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  mounted() {
    // 监听关联客位页面，关联客位成功后动态变化
    this.$von('associated', (data) => {
      this.currentAssociatedTable = data;
    });
    // 初始化手写板
    this.closeHandWriting = false;
    if (this.posInfo.isEnableHandwritingBoard) {
      this.closeHandWriting = true;
      this.$devices.Handwriting.open();
    }
  },
  destroyed() {
    if (this.closeHandWriting) {
      this.$devices.Handwriting.close();
    }
  },
  computed: {
    ...mapGetters(['posSettings', 'posItems', 'posBaseInfo', 'ALL_POS_MODULE', 'posInfo']),
    AddPayHotkey() {
      const hotkeyTmp = {};
      hotkeyTmp.PgDn = () => {
        this.onSubmit();
      };
      return hotkeyTmp;
    },
    // 显示列表
    showPayWayLists() {
      return this.pagination(this.currentPage, 4, this.payWays);
    },
    // 总页数
    allPages() {
      return this.pageCount(this.payWays, 4);
    },
    // 结算方式按钮是否可点击
    hasInputPeopleNumAndDepositAmount() {
      const {
        eatNum, depositAmount, showPeopleInput,
      } = this;
      if (showPeopleInput) { // 开启了自助押金逻辑
        if (+eatNum) { // 如果没有输入就餐人数，按钮肯定不能点击
          return !!(+depositAmount);
        }
      } else { // 结算客位预订押金逻辑(不需要输入就餐人数)
        return !!(+depositAmount);
      }

      return false;
    },
  },
  watch: {
    eatNum(newVal, oldVal) {
      if (!this.showPeopleInput) return; // 如果没有开启自助押金逻辑 就餐人数和押金金额不联动
      this.eatNum = newVal.toString().substring(0, 5);
      if (Object.is(newVal, oldVal)) return;
      const { canOperationDepositAmountType, buffetFoodItemsFee } = this;
      if (+canOperationDepositAmountType === 1) { // 押金不固定
        if (Object.is(+newVal, NaN)) return;
        if (Object.is(newVal, '')) {
          this.depositAmount = '';
        } else {
          this.depositAmount = +newVal * buffetFoodItemsFee;
        }
      }
    },
    depositAmount(newVal) {
      this.depositAmount = newVal.toString().substring(0, 12);
    },
  },
  methods: {
    // 自助押金模块是否显示(后台是否开启了自助押金模块)
    initShowBuffetDeposit() {
      // this.ALL_POS_MODULE.map((item) => {
      //   if ((+item.id === 1252 || item.text === '押金管理') && item.checked) {
      //     this.openBuffetDeposit = true;
      //   }
      //   return item;
      // });
      this.openBuffetDeposit = this.posSettings.isOpenBuffetDeposit;
    },
    // 删除当前关联的客位
    deleteAssociatedTable() {
      this.currentAssociatedTable = null;
    },
    // 关联修改客位
    showAssociatedTable() {
      const {
        id, code, relationPointId,
      } = this.depositInfo.buffetDeposit;
      this.$emit('associatedOrChangeTable', {
        id,
        code,
        peopleQty: this.eatNum,
        relationPointId, // 已关联的客位id
      });
    },
    closeRegisterDeposit(bool) {
      if (bool) {
        this.$message({
          type: 'success',
          message: this.$t('Biz.Pos.More.DepositMsg1'),
          duration: 1000,
        });
      }
      if (this.whereOpen === 'payIndex') {
        this.$vemit('refreshBill', '1'); // 刷新结算页面(从结算进入登记押金页面，登记完成后需要刷新结算页面来获取最新的登记的押金金额)
      }
      this.$emit('refreshDepositList');
      this.close();
    },
    // 线上支付前，先保存就餐人数和押金金额
    preRegisterDeposit() {
      const {
        eatNum, depositAmount, depositInfo, baseData,
      } = this;
      const { buffetDeposit } = depositInfo;
      let people = 1;
      if (eatNum) {
        people = eatNum;
      } else if (baseData && baseData.peopleQty) {
        people = baseData.peopleQty;
      }
      let relationPointId = this.currentAssociatedTable ? this.currentAssociatedTable.id : null;
      if (sourceArr.indexOf(this.resData.source) > -1) {
        people = this.baseData.peopleQty;
        relationPointId = this.baseData.pointId;
      }
      const bookOrderId = this.baseData ? this.baseData.bookOrderId : null;
      const depositType = this.getDepositType(); // 押金类型：0-自助餐；1-堂食；2-预订

      const data = {
        id: buffetDeposit.id,
        code: buffetDeposit.code,
        // eatNum是自助餐 baseData.peopleQty是结算和客位传过来的人数
        // 如果都没有说明是从押金管理进入的 人数默认为1
        peopleQty: people,
        payMoney: depositAmount,
        relationPointId,
        bookOrderId,
        depositType,
      };
      return ajax('canyin.pos.buffetdeposit.preregistdeposit', {
        contentType: 'json',
        data,
      });
    },
    // 选择支付方式
    async chooseActivePayWayTypeIndex(item) {
      this.clearChoosePayType();
      item.checked = !item.checked;
      if (+item.id === 2) { // 银行卡
        this.$refs.payWayBankModal.open({
          payWay: {
            id: 2,
            name: '银行卡',
          },
        }, {
          submit: bankData => this.doEdit(bankData),
        });
      } else if (+item.id === 37) { // 微信+支付宝二码合一超级无敌付款码
        const { success } = await this.preRegisterDeposit(); // 线上支付前，先保存就餐人数和押金金额
        if (success) {
          this.$refs.buffetScanCode.open(
            {
              shouldPayMoney: this.depositAmount,
              depositOrder: this.depositOrder,
            },
          );
        }
      }
    },
    // 清空已选择的支付方式下标
    clearPayWayTypeIndex() {
      if (!this.hasInputPeopleNumAndDepositAmount) {
        this.payWays.map((item) => {
          item.checked = false;
          return item;
        });
      }
    },
    async onOpen() {
      const { user } = this.posBaseInfo;
      const { depositItemId, isOpenDepositSet, depositModel } = this.posSettings;
      this.initShowBuffetDeposit(); // 判断是否开启了自助餐押金
      this.operatorName = user.name;
      if (sourceArr.indexOf(this.resData.source) > -1) { // 结算 客位 预订过来的可以编辑金额
        this.canOperationDepositAmount = true;
      } else { // 自助押金或正常情况下 根据后台设置来判断是否可编辑金额
        this.canOperationDepositAmount = !isOpenDepositSet;
      }
      this.canOperationDepositAmountType = depositModel;
      const item = this.posItems.filter(dish => dish.realItemId === depositItemId || '');
      if (item && item.length > 0) {
        this.buffetFoodItemsFee = item[0].price;
        this.depositAmount = item[0].price;
      }
      // 结算预订客位传过来的baseData和押金合计
      if (this.resData.source === 'payIndex') {
        this.baseData = this.resData.pointData.pointList[0] || null;
      } else if (this.resData.source === 'tablesIndex') {
        if (this.resData.pointData) {
          this.resData.pointData.areaName = (this.resData.pointData.pointFullName.split('.'))[0];
        }
        this.baseData = this.resData.pointData || null;
      } else if (this.resData.source === 'booking') {
        if (this.resData.bookingData) {
          this.resData.bookingData.pointId = this.resData.bookingData.pointList[0];
          this.baseData = this.resData.bookingData;
        } else {
          this.baseData = null;
        }
      } else {
        this.baseData = null;
      }
      this.depositInfo = await this.initDepositInfo() || {};
      this.depositMoney = this.depositInfo.buffetDeposit.totalPayMoney || 0;
      this.payWays = this.depositInfo.paywayList ? this.depositInfo.paywayList : [];
      this.payWays.map((item2) => {
        this.$set(item2, 'checked', false);
        return item2;
      });
      this.depositOrder = this.depositInfo.buffetDeposit ? this.depositInfo.buffetDeposit.code : '';
    },
    binarySearch(arr, key, val) {
      let min = 0;
      let max = arr.length - 1;
      let mid;
      while (min <= max) {
        mid = min + Math.ceil((max - min) / 2);
        if (arr[mid][key] > val) {
          max = mid - 1;
        } else if (arr[mid][key] < val) {
          min = mid + 1;
        } else {
          return arr[mid];
        }
      }
      return false;
    },
    onSubmit() {
      this.doEdit();
    },
    // 获取到选中的结算方式
    getChoosePayType() {
      const item = this.payWays.filter(i => i.checked);
      if (item && item.length > 0) {
        return item[0];
      }
      return false;
    },
    // 清楚已选中的结算方式
    clearChoosePayType() {
      this.payWays.map((item) => {
        item.checked = false;
        return item;
      });
    },
    // 获取当前关联的客位id
    getCurrentRelationPointId() {
      // 自助餐要关联的客位id
      let relationPointId = this.currentAssociatedTable ? this.currentAssociatedTable.id : null;
      // 结算，客位，预订要关联的客位id
      if (sourceArr.indexOf(this.resData.source) > -1) {
        relationPointId = this.baseData.pointId;
      }
      return relationPointId;
    },
    // 修改押金单
    doEdit() {
      const data = {
        id: this.depositData.id,
        remark: this.depositData.remark,
      };
      return ajax('canyin.pos.buffetdeposit.editdeposit', {
        contentType: 'json',
        data,
      }).then((res) => {
        this.$message({
          type: 'success',
          message: `${res.msg}`,
          duration: 1000,
        });
        this.close();
        this.$emit('refreshDepositList'); // 刷新押金列表
        if (this.whereOpen === 'payIndex') {
          this.$vemit('refreshBill', '1'); // 刷新结算页面(从结算进入登记押金页面，登记完成后需要刷新结算页面来获取最新的登记的押金金额)
        }
      });
    },
    // 获取登记押金的类型
    getDepositType() {
      let depositType = 0;
      if (
        this.whereOpen === 'payIndex'
        || this.whereOpen === 'tablesIndex'
      ) {
        depositType = 1;
      } else if (this.whereOpen === 'booking') {
        depositType = 2;
      } else {
        // 从押金管理按钮进入，如果开启了自助餐传0  没开启传1
        depositType = this.openBuffetDeposit ? 0 : 1;
      }
      return depositType;
    },
    initDepositInfo() {
      const depositType = this.getDepositType();
      const relationPointId = this.getCurrentRelationPointId();
      const bookOrderId = this.baseData ? this.baseData.bookOrderId : null;
      return ajax('canyin.pos.buffetdeposit.initdepositrecord', {
        contentType: 'json',
        data: {
          depositType, // 押金类型：0-自助餐；1-堂食；2-预订
          relationPointId, // 客位Id，用于查询客位名称
          bookOrderId, // 预订单Id，用于查询预订人和联系电话
        },
      });
    },
    onClose() {
      this.eatNum = '';
      this.depositAmount = '';
      this.clearChoosePayType();
      this.buffetFoodItemsFee = 0;
      this.currentPage = 1;
      this.nextBtnDisabled = false;
      this.preBtnDisabled = false;
      this.baseData = null;
      this.currentAssociatedTable = null;
    },
    // 限制输入数字保留2位小数
    InputNumber(key, fixed = 2, init = false) {
      const str = this[key];
      this.$nextTick(() => {
        this[key] = this.onlyNumber(str, fixed, init);
        this.clearPayWayTypeIndex();
      });
    },
    onlyNumber(val, fixed = 2, init) {
      let str = '';
      const tmp = new RegExp(`^(\\-)*(\\d+)\\.(\\d{0,${fixed}}).*$`, 'g');
      str += val;
      str = str.replace(/[^\d.]/g, '');
      if (init) {
        str = str.replace(/\./g, '');
      }
      str = str.replace(/\.{2,}/g, '.');
      str = str.replace('.', '$#$');
      str = str.replace(/\./g, '');
      str = str.replace('$#$', '.');
      str = str.replace(tmp, '$1$2.$3');
      if (str.indexOf('.') === 0 && str !== '') {
        str = '';
      }
      if (str.indexOf('.') < 0 && str !== '') {
        str = parseFloat(str);
      }
      return str;
    },
    handWriting() {
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else {
        this.$devices.Handwriting.open();
      }
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .header {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px 10px 20px;
    box-shadow: 0 0 10px 0 inset rgba(0, 0, 0, 0.2);
    background-color: #eee;
    > div {
      display: flex;
      align-items: center;
      font-size: 14px;
      > .img {
        display: inline-block;
        margin-right: 3px;
        background-image: url("~@/common/images/pos/exitBill/table-number.png");
        width: 20px;
        height: 20px;
      }
      > .color {
        color: #f06174;
      }
    }
  }
  .withdraw-big-cash {
    display: flex;
    padding: 10px 20px;
    .input-wrap {
      flex: 2;
      margin-right: 20px;
      .input {
        display: flex;
        align-items: center;
        margin: 5px 0 16px 0;
        color: #333;
        > span {
          min-width: 90px;
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        > input {
          width: 130px;
          padding: 0 10px;
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
        > span:first-child:before {
          content: "*";
          color: #f56c6c;
          margin-right: 4px;
        }
        > span.no-before:before {
          color: transparent;
        }
        .pay-way {
          height: 78px !important;
          overflow: hidden;
          color: #273844;
        }
        .pay-way-wrap {
          width: 250px;
          display: flex;
          flex-wrap: wrap;
          border-radius: 4px;
          > li {
            padding: 3px;
            height: 39px;
            width: 50%;
            > button {
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
        &.nomarl {
          align-items: normal;
        }
      }
      .rightArea-footer {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px 0 135px;
        // 箭头按钮
        .pos-takeout-pager {
          position: absolute;
          right: 18px;
          text-align: right;
          > button {
            display: inline-block;
            width: 44px;
            height: 30px;
            border: 1px solid #9a9a9a;
            line-height: 28px;
            border-radius: 14px;
            text-align: center;
            margin-left: 4px;
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
      }
      .associated {
        margin-top: 15px;
      }
      .width100{
        width:100%
      }
      .remark{
        align-self: baseline;
        text-align: center;
      }
    }
    .margin-left-10 {
      margin-left: 10px;
    }
    .margin-top-10 {
      margin-top: 10px;
    }
  }
  .lang-enUS {
    .withdraw-big-cash .input-wrap .input > span {
      font-size: 12px;
      margin-right: 5px;
    }
  }
</style>
<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input[type="number"]{
    -moz-appearance: textfield;
  }
  .bg-white .el-dialog__body {
    background-color: #ffffff;
  }
</style>
