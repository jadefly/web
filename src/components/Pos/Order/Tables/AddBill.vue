<template>
  <Dialog
    name="PosDialog.AddBill"
    ref="dialog"
    :class="posSettings.isOpenBuffetDeposit?'isBuffetOpen':''"
    :title="title"
    width="700px"
    top="55px"
    :showSubmit="true"
    @submit="submitAddBill"
    @open="onOpen"
    @close="onClose"
    :append-to-body="true"
    :hotkeys="hotKeySet"
    v-if="posSettings"
    :submitId="submitId"
  >
    <div class="add-bill-wrap">
      <form action="javascript:;" class="form add-bill-form"
        v-keyboard:keyboard="{ autoSelect: true }">
        <div class="form-group">
          <label>{{$t('Biz.Order.SelectedTableLabel')}}</label>
          <div class="form-input">
            <div class="p">
              <div class="i">
                <strong>{{data.pointName ? data.pointName.substr(data.pointName.indexOf('-')+1) : '' }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" v-if="posSettings.isOpenBuffetDeposit===0">
          <label for="iPeopleNum">{{$t('Biz.Order.DinerPersonNumLabel')}}</label>
          <input ref="iPeopleNum" v-judge type="text" id="iPeopleNum" class="form-control"
                 v-model="peopleNum" onkeyup="value=value.replace(/[^\d]/g,'')" maxlength="6">
        </div>
        <div v-if="posSettings.isOpenBuffetDeposit===1">
          <PagerSlot class="buffetBox"
          :style="{height: eaters.length>pageSize?'240px':'auto'}"
          type="scroll"
          :listAll="eaters" :pageSize="pageSize" :paginationShow="paginationShow" :paginationBtnShow="eaters.length>pageSize">
            <template slot="list" slot-scope="scope">
              <li v-for="(eater, index) in scope.showList" :key="eater.id">
                <label class="item-title" :for="eater.id+'_'+index">{{eater.name}}:</label>
                <input type="text" class="form-control text_buff" autocomplete='off'
                  :placeholder="$t('Biz.Order.PeoplePlaceholder')"
                  v-model="eater.eaterQty"
                  :id="eater.id+'_'+index"
                  :maxlength="6"
                  @input="changeInput($event,index)" />
                <button class="selectBtn" @click="editPrice(eater, index)" v-if="eater.guestPriceItems.length>0">
                  {{eater.itemName}}
                  <i class="icon icon-edit"></i>
                </button>
              </li>
            </template>
          </PagerSlot>
          <div class="form-group">
            <label for="idDeposit">{{ $t('Dict.Btn.Deposit') }}:</label>
            <input id="idDeposit" v-judge type="text" class="form-control text_buff" :disabled="posSettings.isOpenDepositSet===1"
            :placeholder="$t('Biz.Pos.More.DepositMsg3')"
            v-model="buffetDeposit" @input="InputDeposit"/>
          </div>
        </div>
        <div class="form-group" v-if="isOpenSeatsNum&&posSettings.isOpenBuffetDeposit===0">
          <label for="seatsNum">{{$t('Biz.Order.SeatsNum')}}</label>
          <div class="form-input form-input-info">
            <input v-judge type="text" id="seatsNum" class="form-control" :disabled="isTeam==1"
            v-model="seatsNum" onkeyup="value=value.replace(/[^\d]/g,'')" maxlength="6">
          </div>
        </div>

        <div class="form-group">
          <label>{{$t('Biz.Order.ServerLabel')}}</label>
          <div class="form-input form-input-info">
            <input v-judge type="text" class="form-control" v-model="waiterCode" id="iWaiterCode">
            <label>{{waiterName}}</label>
            <img :src="images[0]" @click="changeWaiter(1)" :alt="$t('Biz.Order.SelectServerAlt')">
          </div>
        </div>
        <div class="form-group" v-if="posSettings.isOpenBuffetDeposit===0">
          <label>{{$t('Biz.Order.SaleManLabel')}}</label>
          <div class="form-input form-input-info">
            <input v-judge type="text" class="form-control"
            v-model="salesmanCode" id="iSalesmanCode">
            <label>{{salesmanName}}</label>
            <img :src="images[0]" @click="changeWaiter(2)" :alt="$t('Biz.Order.SelectSaleMan')">
          </div>
        </div>
         <div class="contact">
           <div class="form-group renewal-order" v-if="posSettings.isOpenBuffetDeposit===0">
             <label>{{$t('Biz.Order.ContinueLabel')}}</label>
             <div class="form-input form-input-switch">
               <el-switch v-model="isContinuedBill" :disabled="posBaseInfo.hasMultiSettle"
               active-color="#0096a4" inactive-color="#dcdfe6"></el-switch>
             </div>
           </div>
           <div class="form-group auto-additem" v-if="showAutoAddDishBtn">
             <label>{{$t('Biz.Order.OpenAutoAddBillLabel')}}</label>
             <div class="form-input form-input-switch">
               <el-switch v-model="isAutoAddDish" :disabled="isContinuedBill"
               active-color="#0096a4" inactive-color="#dcdfe6"></el-switch>
             </div>
           </div>
         </div>
         <div class="form-group"
          v-if="!posSettings.isOpenSelf
            && data.priLocalEnableMember
            && !posSettings.isForceMemberQuery">
          <label>{{$t('Biz.Order.MemberPriceLabel')}}</label>
          <div class="form-input form-input-switch">
            <el-switch v-model="enableMember" active-color="#0096a4"
            inactive-color="#dcdfe6"></el-switch>
          </div>
        </div>
        <div class="form-group">
          <label>{{$t('Biz.Order.DinerTypeLabel')}}</label>
          <div class="form-input">
            <strong class="form-control-static">{{ data.dinnerTypeName }}</strong>
            <button type="button" class="btn btn-default btn-edit"
              @click="operateDinerOrLabel('diner')"><i class="icon icon-edit"></i> {{$t('Dict.Modify')}}</button>
          </div>
        </div>
        <div class="form-group"
          v-if="posSettings.isUsePercentageTab&&posSettings.isOpenBuffetDeposit===0">
          <!-- vuex 参数判断是否启用自定义标签功能 -->
          <label>{{$t('Biz.Order.CustomLabel01')}}</label>
          <div class="form-input">
            <strong class="form-control-static special-row">{{ customTagName }}</strong>
            <button type="button" class="btn btn-default btn-edit special-btn"
              @click="operateDinerOrLabel('customTag')"><i class="icon icon-edit"></i> {{$t('Dict.Modify')}}</button>
          </div>
        </div>
        <div class="form-group" style="padding-right: 100px;">
          <label for="iBillRemark">{{$t('Biz.Order.BillMarkLabel')}}</label>
          <textarea type="textarea" id="iBillRemark" ref="iBillRemark" maxlength="80"
            class="form-control remarks"
            v-model="remark"
            :placeholder="$t('Biz.Order.BillMark')"
            @focus="showAndroidInput('remark')"></textarea>
            <button type="button"
              class="btn btn-default handWritingST"
              @click = "handWriting" v-hideHandwritingBoard>
              <i class="icon icon-edit"></i>
              <span>{{$t('Dict.WritingPad')}}</span>
            </button>
        </div>
      </form>
      <div class="add-bill-keyboard">
        <KeyBoard ref="keyboard"></KeyBoard>
      </div>
    </div>
    <DinerType ref="DinerType"></DinerType><!-- 就餐类型和自定义标签公用组件-->
    <AndroidInput ref="AndroidInput"></AndroidInput>
    <OrderingWaiterModal v-if="isOpen" ref="changeWaiter"
    :waiterType="chooseWaiter" ></OrderingWaiterModal> <!-- 选择服务员和营销员-->
    <EditGuestPrice ref="refEditPrice"></EditGuestPrice> <!--客人价格选择-品项选择-->
  </Dialog>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { debounce, extend, find } from 'lodash';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import ajax from '@/common/js/ajax';
import { SALES_MAN_TYPE, WAITER_TYPE } from '@/common/api/addBill';
import edit from '@/common/images/pos/singleItemTransfer/btn_edit.png';
import { decimal } from '@/common/util/RegExpCheck';
import { round } from '@/common/js/math';

const PagerSlot = () => import('@/components/Pos/Common/PagerSlot');

const EditGuestPrice = () => import('@/components/Pos/Order/Tables/EditGuestPrice');
// 开台就餐类型和自定义标签-组件
const DinerType = () => import('@/components/Pos/Order/DinerType');
// 开台选择点菜员和营销员
const OrderingWaiterModal = () => import('@/components/Pos/Ordering/OrderingBtnsFunc/OrderingWaiterModal');
export default {
  mixins: [DialogMixin, AndroidInputMixin],
  props: {
    submitId: {
      type: String,
      default: null,
    },
  },
  components: {
    PagerSlot,
    Dialog,
    KeyBoard,
    DinerType,
    AndroidInput,
    OrderingWaiterModal,
    EditGuestPrice,
  },
  data() {
    return {
      buffetDeposit: '', // 押金金额
      pageSize: 4, // 客人类型页面显示个数 多于4个翻页
      paginationShow: false,
      paginationBtnShow: false,
      eaters: [], // 客人类型数据集
      data: {
        pointName: '008',
        pointCode: '008',
        pointId: '10500000000094154',
        // 客位默认人数
        defCapacity: 2,
        // 客位最小容纳人数
        minCapacity: 0,
        // 客位最大容纳人数
        maxCapacity: 0,
        // 是否允许登记押金
        isDepositEnable: false,
        // 是否必须录入服务员
        isNeedWater: false,
        waiterId: '',
        waiterCode: '',
        waiterName: '',
        salesmanId: '',
        salesmanCode: '',
        salesmanName: '',
        orderOriginId: '1201',
        orderOriginName: '自来客',
        orderOriginIdOri: '1201',
        orderOriginNameOri: '自来客',
        dinnerTypeIdOri: '',
        dinnerTypeNameOri: '',
        // 默认就餐类型id
        dinnerTypeId: '',
        // 默认就餐类型名称
        dinnerTypeName: '',
        // 是否显示会员价
        priLocalEnableMember: false,
        // 是否修改开单
        isUpdate: '',
        // 是否自助模式
        isOpenSelf: false,
        // 就餐模式 1点餐模式 2是自助模式
        dinnerMode: 1,
        // 就餐类型列表
        dinnerTypeList: [],
        // 服务员列表
        waiters: [],
        // 营销员列表
        salesmans: [],
        // 开台自动增加品项列表
        addItemList: [
          {
            itemSizeId: '-1',
            itemServiceType: 0,
            isPackage: false,
            unitName: '单位',
            name: '品项B1',
            itemQty: 1.0,
            code: '001002999',
            pkgType: 0,
            itemId: '10500000000001422',
            pointMngId: '10500000000000413',
          },
        ],
        // 订单来源列表
        orderOriginList: [
          {
            id: '1201',
            name: '自来客',
          },
          {
            id: '1202',
            name: '本店营销',
          },
        ],
      },
      // 是否续单
      isContinuedBill: false,
      // 开台是否自动添加品项
      isAutoAddDish: true,
      // 显示隐藏自动添加品项开关
      showAutoAddDishBtn: false,
      // 自定义标签(无默认)
      customTagId: '',
      customTagName: '',
      customTagList: [],
      // 备注
      remark: '',
      errorMessage: '',
      peopleNum: 0,
      seatsNum: 0, // 席数
      isOpenSeatsNum: false, // 是否启用席数功能
      isTeam: 0, // 是否是团队开单
      waiterCode: '',
      waiterName: '',
      salesmanCode: '',
      salesmanName: '',
      enableMember: false,
      dinnerModeBuffet: 2, // 自助类型
      dinnerModeAdd: 1, // 零点类型就是普通的
      waiterRes: true, // 校验使用
      salesmanRes: true, // 校验使用
      closeHandWriting: false, // 是否关闭手写板
      title: '',
      isOpen: false, // 打开关闭时v-if OrderingWaiterModal组件
      chooseWaiter: 1, // 1 服务员 2 营销员 3 点菜员
      images: [edit],
      canSubmitClick: true, // 开台确认按钮是否可点击(防止重复点击)
      isSuccessSubmit: false, // 是否是成功开台
    };
  },
  computed: {
    ...mapGetters(['setting', 'posBaseInfo', 'posSettings', 'posBooking']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitAddBill();
        },
        Enter: () => {
          this.$refs.keyboard.enter();
        },
        F1: () => {
          this.changeContinuedBill();
        },
      };
    },
  },
  watch: {
    // 节流函数搜索
    waiterCode: debounce(async function (value) {
      if (value === '') {
        // this问题：此处不使用箭头函数
        this.waiterName = '';
        this.waiterRes = true;
      } else {
        const result = await this.getEmpNameByEmpCode(value);
        if (result) this.getEmpNameByEmpCodeCallBack(result, WAITER_TYPE);
      }
    }, 600),
    // 节流函数搜索
    salesmanCode: debounce(async function (value) {
      if (value === '') {
        // this问题：此处不使用箭头函数
        this.salesmanName = '';
        this.salesmanRes = true;
      } else {
        const result = await this.getEmpNameByEmpCode(value);
        if (result) this.getEmpNameByEmpCodeCallBack(result, SALES_MAN_TYPE);
      }
    }, 600),
    isContinuedBill(val) {
      this.isAutoAddDish = !val;
    },
  },
  mounted() {
    this.$von('choosePeople', (data) => {
      this.receivePeopleInfo(data);
    });
  },
  methods: {
    ...mapMutations({
      setPosPointData: 'SET_POS_POINT_DATA',
      setIsNeedTableWsHandle: 'SET_ISNEED_TABLE_WsHANDLE',
    }),
    onOpen() {
      const { from, data, table } = this.resData;
      this.isOpen = true;
      this.closeHandWriting = false;
      this.remark = data.remark || ''; // 账单备注
      this.waiterRes = true;
      this.salesmanRes = true;
      this.enableMember = false;
      if (this.posBaseInfo.isEnableHandwritingBoard) {
        this.closeHandWriting = true;
        this.$devices.Handwriting.open();
      }
      this.data = this.resData.data;
      this.data.dinnerTypeIdOri = this.data.dinnerTypeId;
      this.data.dinnerTypeNameOri = this.data.dinnerTypeName;
      this.data.orderOriginIdOri = this.data.orderOriginId;
      this.data.orderOriginNameOri = this.data.orderOriginName;
      this.waiterCode = this.data.waiterCode;
      this.waiterName = this.data.waiterName;
      this.salesmanCode = this.data.salesmanCode;
      this.salesmanName = this.data.salesmanName;
      this.customTagList = this.data.customTagList; // 自定义标签
      if (this.posSettings.isDefaultEmptyByOpenTable) {
        this.peopleNum = '';
      } else {
        this.peopleNum = this.data.defCapacity;
      }
      // this.$refs.iPeopleNum.focus(); // 默认人数框获取焦点
      this.isContinuedBill = false;
      this.isTeam = table.isTeam;
      this.isOpenSeatsNum = this.setting.isUseSeat === '1'; // 是否启用席数
      this.seatsNum = data.tableeaterQty || 1; // 初始化席数，默认为1

      // 自助餐-客人类型&押金
      if (this.posSettings.isOpenBuffetDeposit) {
        let num = 0; // 总人数
        this.eaters = this.data.eaters; // 客人类型数据集
        this.eaters.forEach((item) => {
          // 如果没有人数取默认值 开台时，1701为成人，默认为1，其他为0
          if (from === 0 && !item.eaterQty && item.id === '1701') this.$set(item, 'eaterQty', 1);
          this.$set(item, 'eaterQty', item.eaterQty || 0);
          num += item.eaterQty;
          if (!item.itemId) { // 未选择取默认值
            item.guestPriceItems.forEach((priceItem) => {
              if (priceItem.isDefault) {
                this.$set(item, 'itemId', priceItem.itemId || '');
                this.$set(item, 'itemSizeId', priceItem.itemSizeId || '');
                this.$set(item, 'itemName', priceItem.itemName || ''); // 用于视图显示
              }
            });
          }
        });
        this.peopleNum = num; // 自助餐总人数
      }

      if (from === 1) { // 0开台,1修改开台
        this.title = this.$t('Biz.Order.UpdateOpenTable');
        this.isContinuedBill = data.isContinuedBill; // 是否续单
        this.enableMember = data.memberPriceFlgChecked;
        this.peopleNum = data.defCapacity;
        this.buffetDeposit = data.buffetDeposit; // 自助餐押金
        // vuex参数判断, 总部控制是否启用"自定义标签"
        if (this.posSettings.isUsePercentageTab) {
          this.customTagId = data.customTagId || '';
          // 空值处理
          this.customTagName = find(data.customTagList, ['id', this.customTagId])
            ? find(data.customTagList, ['id', this.customTagId]).name
            : '';
        }
        this.$vonce('authCode', (code) => {
          this.submitAddBill(code);
        });
      } else { // 开台
        if (this.resData.isShareTable) {
          this.title = this.$t('Biz.Order.ShareTable'); // 搭台
        } else {
          this.title = this.$t('Biz.Order.OpenTable'); // 开台
        }
        if (this.posSettings.isOpenBuffetDeposit) this.updateDeposit(); // 自助餐押金计算
        if (this.resData.data.isHasDefItem) { // 后台是否设置了开台自动增加品项,如果设置了显示切换开关
          this.showAutoAddDishBtn = true;
        } else {
          this.showAutoAddDishBtn = false;
          this.isAutoAddDish = null;
        }
      }
      // 解决自助餐中接口数据动态创建的input，数据慢小键盘失效的问题
      setTimeout(() => {
        if (this.$refs.keyboard) this.$refs.keyboard.reSelect();
      }, 0);
    },
    onClose() {
      this.customTagId = '';
      this.customTagName = '';
      this.isOpen = false;
      this.data = {};
      this.isAutoAddDish = true;
      if (this.closeHandWriting) {
        this.$devices.Handwriting.close();
      }
      if (!this.isSuccessSubmit && this.$route.name === 'order') {
        this.setIsNeedTableWsHandle(true);
        this.$emit('updateTables');
      }
      this.isSuccessSubmit = false;
    },
    async submitAddBill() {
      // 先校验人数,席数
      const seatNum = this.seatsNumFun(this.seatsNum);
      const peopleNum = this.peopleNumFun(this.peopleNum);
      if (!seatNum || !peopleNum) { return; }
      // 防重复点击开台, 且防止服务员/营销员请求数据未正常返回就执行开台
      if (!this.canSubmitClick) return;
      this.canSubmitClick = false;
      setTimeout(() => {
        this.canSubmitClick = true;
      }, 4000);
      const active_eater = [];
      if (this.posSettings.isOpenBuffetDeposit) {
        // 自助餐校验 去掉【续单】【营销员】【人数】【自定义标签】【桌数】编辑项，添加【自助餐类型】和【押金】
        this.eaters.forEach((item) => {
          item.eaterQty = parseInt(item.eaterQty) || 0;
          active_eater.push({
            eaterId: item.id,
            eaterQty: item.eaterQty,
            itemId: item.itemId, // 客人价格品项id
            itemSizeId: item.itemSizeId,
          });
        });
        const hasQty = this.eaters.some(item => item.eaterQty > 0);
        if (!hasQty) {
          this.$message({
            type: 'error',
            duration: 1000,
            message: this.$t('Biz.Order.PersonNumNullMsg'),
          });
          return;
        }
        if (+this.buffetDeposit > 999.99) {
          this.$message({
            type: 'error',
            duration: 1000,
            message: this.$t('Dict.MaximumMessage', [999.99]),
          });
          return;
        }
        this.peopleNum = this.eaters.reduce((total, cur) => total + cur.eaterQty, 0); // 人数总和
      } else { // 提交前校验
        if (!this.peopleNumFun(this.peopleNum)) return; // 人数
        if (!this.seatsNumFun(this.seatsNum)) return;
        // 营销员
        const result2 = await this.getEmpNameByEmpCode(this.waiterCode, WAITER_TYPE);
        if (result2) this.getEmpNameByEmpCodeCallBack(result2, WAITER_TYPE);
        if (!this.salesmanRes) return;
      }
      const result1 = await this.getEmpNameByEmpCode(this.salesmanCode);
      if (result1) this.getEmpNameByEmpCodeCallBack(result1, SALES_MAN_TYPE);
      if (!this.waiterRes) return;
      // 参数
      const params = {
        pointId: this.resData.table.id, // 客位id
        pointCode: this.data.pointCode, // 客位code
        dinnerTypeId: this.data.dinnerTypeId, // 就餐类型
        orderOriginId: this.data.orderOriginId, // 订单来源
        waiterId: this.data.waiterId, // 服务员id
        salesmanId: this.data.salesmanId, // 营销员id
        isUpdate: this.data.isUpdate, // 是否为修改状态
        peopleQtyOri: this.data.defCapacity, // 原始人数
        dinnerTypeIdOri: this.data.dinnerTypeIdOri,
        dinnerTypeNameOri: this.data.dinnerTypeNameOri,
        orderOriginIdOri: this.data.orderOriginIdOri,
        orderOriginNameOri: this.data.orderOriginNameOri,
        customTagId: this.customTagId, // 自定义标签Id
        moduleBillAddBillIsOpenSelf: this.data.isOpenSelf, // 是否开通自助功能
        dinnerMode: this.data.dinnerMode,
        peopleQty: this.peopleNum,
        waiterCode: this.waiterCode,
        salesmanCode: this.salesmanCode,
        remark: this.remark,
        isContinuedBill: this.isContinuedBill,
        addOrder: this.isAutoAddDish,
        tableQty: Number(this.seatsNum), // 席数
      };
      if (this.data.isOpenSelf) {
        params.dinnerMode = this.dinnerModeBuffet; // 自助模式
      } else {
        params.dinnerMode = this.dinnerModeAdd; // 零点模式
      }
      // 加单的时候如果执行会员价就要传 memberPriceFlg
      if (this.enableMember) this.$set(params, 'memberPriceFlg', this.enableMember);
      if (this.posSettings.isOpenBuffetDeposit) { // 自助餐添加参数
        params.buffetDeposit = this.buffetDeposit; // 押金
        params.eaters = active_eater; // 选择的-客人类型数据集
        if (this.resData.from === 1 && this.data.depositId) params.depositId = this.data.depositId; // 押金Id
      }
      if (this.resData.from === 1) { // 修改开台
        this.modifyAddBill(params);
      } else if (this.resData.isShareTable) {
        this.sharePoint(params); // 搭台
      } else { // 开台
        this.addBill(params);
      }
    },
    InputDeposit(e) { // 两位小数 ??
      let val = e.target.value;
      val = decimal(val, 2);
      if (+val > 999.99) {
        this.$message.warning(this.$t('Dict.MaximumMessage', [999.99]));
        val = 999.99;
      }
      if (+this.buffetDeposit !== +val) this.buffetDeposit = val;
    },
    updateDeposit() {
      const { depositModel } = this.posSettings; // 0:押金金额固定为押金费品项;1:押金金额为人数x押金费品项
      this.buffetDeposit = parseFloat(this.posSettings.depositItemPrice); // 押金金额
      if (!(this.posSettings.isOpenDepositSet && depositModel === 0)) { // 押金非固定 计算押金值 = 人数*押金金额
        this.buffetDeposit = this.eaters.reduce((total, cur) => {
          const n = parseInt(cur.eaterQty) || 0;
          return round(total + this.buffetDeposit * n);
        }, 0);
      }
    },
    changeInput(e, index) {
      let val = e.target.value;
      val = val.replace(/[^\d]/g, '');
      if (+val > 999) {
        this.$message.warning(this.$t('Dict.MaximumMessage', [999]));
        val = 999;
      }
      if (+val !== +this.eaters[index].eaterQty) this.eaters[index].eaterQty = val;
      this.updateDeposit(); // 更新押金
    },
    editPrice(eaterItem, index) {
      // 选中项更新
      let selectedItem = null;
      if (eaterItem.itemId) {
        eaterItem.guestPriceItems.forEach((item) => {
          item.isDefault = false;
          if (item.itemId === eaterItem.itemId) {
            item.isDefault = true;
            selectedItem = item;
          }
        });
      }
      this.$refs.refEditPrice.open({
        list: eaterItem.guestPriceItems,
        selectedItem,
        pageSize: 1, // 每页显示个数
        paginationShow: true, // 页码
      }, {
        submit: (priceItem) => {
          this.$set(this.eaters[index], 'itemId', priceItem.itemId);
          this.$set(this.eaters[index], 'itemSizeId', priceItem.itemSizeId);
          this.$set(this.eaters[index], 'itemName', priceItem.itemName);
        },
      });
    },
    // 开台
    addBill(params) {
      ajax('canyin.pos.addBill.addBill', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        this.canSubmitClick = true;
        if (data.success) {
          const sucData = data.data;
          // 储存下客位信息 callback 是回调的函数 ，tableState是客位状态
          this.$vemit('loadBill', this.resData.table.id, {
            callback: () => {
              this.$vemit('control_addorder', sucData.pointId, null, sucData); // (pointId,orderId,sucData)
              this.close();
            },
            tableState: 1,
          });
          // 如果客位开台存在默认添加的品项,就要打印留台单
          if (data.data.bizPrintLeaveTableParamsList) {
            this.$vemit('printLeaveTableBill', data.data.bizPrintLeaveTableParamsList);
          }
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 搭台
    sharePoint(params) {
      extend(params, {
        bsId: this.resData.table.bsId,
        addBillType: '搭台开单',
      });
      ajax('canyin.pos.sharepoint.sharepoint', {
        contentType: 'paramsEncoded',
        data: params,
      }).then(() => {
        this.canSubmitClick = true;
        this.$vemit('updatePoint');
        this.$message.success(this.$t('Biz.Order.ShareTableSuccessMsg'));
        this.close();
      }).catch((errCode, msg) => {
        this.canSubmitClick = true;
        this.$message.error(msg);
      });
    },
    // 修改开台
    modifyAddBill(params) {
      ajax('canyin.pos.updateBill.updateBill', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        if (res.success) {
          this.close();
          // 储存下客位信息
          this.setPosPointData(this.resData.table);
          this.$vemit('loadBill', this.resData.table.id);
          if (res.data.printData && Array.isArray(res.data.printData) && res.data.printData.length > 0) {
            this.$devices.Printer.print(res.data.printData[0]);
          }
        } else if (res.result === -2) {
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else {
          this.$message({
            type: 'error',
            message: res.msg,
            duration: 2000,
          });
        }
      });
    },
    getEmpNameByEmpCodeCallBack(data, type) {
      if (data != null && data !== {} && data !== '') {
        if (type === SALES_MAN_TYPE) {
          this.salesmanName = data.name;
          this.data.salesmanId = data.id;
          this.salesmanRes = true;
        } else if (type === WAITER_TYPE) {
          this.waiterName = data.name;
          this.data.waiterId = data.id;
          this.waiterRes = true;
        }
      } else if (type === SALES_MAN_TYPE) {
        // this.salesmanName = "";  // 与产品确认，不要默认清空
        // this.data.salesmanId = "";
        // this.salesmanCode = "";
        this.salesmanRes = false;
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.NoSalemanMsg'), // '营销员：没有此员工编号或者员工已经删除'
          duration: 2000,
        });
      } else if (type === WAITER_TYPE) {
        // this.waiterName = "";   // 与产品确认，不要默认清空
        // this.data.waiterId = "";
        // this.waiterCode = "";
        this.waiterRes = false;
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.NoServerMsg'), // '服务员：没有此员工编号或者员工已经删除'
          duration: 2000,
        });
      }
    },
    getEmpNameByEmpCode(empCode) {
      if (empCode === '') return;
      return ajax('canyin.pos.bill.getempidname', { params: { empCode } });
    },
    // 原就餐人数组件被改为共用组件(就餐人数和自定义标签)
    // 两个业务共同使用同一方法进行判断执行
    operateDinerOrLabel(type) {
      if (type === 'diner') {
        this.dinerType();
      } else {
        this.customTag();
      }
    },
    // 就餐人数
    dinerType() {
      this.$refs.DinerType.open(
        // 入参
        {
          list: this.data.dinnerTypeList, // 就餐类型列表
          checkedItemId: this.data.dinnerTypeId, // 当前(或默认)就餐类型id
          type: 'diner', // 业务类型标记
        },
        // 回调
        {
          submit: (dinerType) => {
            this.data.dinnerTypeId = dinerType.id;
            this.data.dinnerTypeName = dinerType.name;
          },
        },
      );
    },
    // 开台前校验席数
    seatsNumFun(val) {
      if (this.isOpenSeatsNum && (val === '' || val.toString() === '0')) { // 开启了席数功能 但席数为0
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.SeatsNumMsg'),
          duration: 2000,
        });
        return false;
      }
      return true;
    },
    // 自定义标签
    customTag() {
      if (!this.customTagList.length) {
        this.$message.error(this.$t('Dict.NoData'));
        return false;
      }
      this.$refs.DinerType.open(
        {
          list: this.customTagList, // 自定义标签列表
          checkedItemId: this.customTagId, // 当前(或 空)自定义标签id
          type: 'customTag',
        },
        {
          submit: (customTag) => {
            this.customTagId = customTag.id;
            this.customTagName = customTag.name;
          },
        },
      );
    },
    peopleNumFun(value) { // 与产品确认，最后提交时校验
      if (value === '') {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.PersonNumNullMsg'),
          duration: 2000,
        });
        return false;
      }
      // 判断是否是纯数字
      if (!/^[0-9]+$/.test(value)) {
        return false;
      }
      const inputPeopleNum = parseInt(value, 10);
      const minPeopleNum = this.data ? this.data.minCapacity : '';
      const maxPeopleNum = this.data ? this.data.maxCapacity : '';

      if (inputPeopleNum <= 0) {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.PersonNumZeroMsg'),
          duration: 2000,
        });
        return false;
      }
      let peopleNumError = '';
      if (maxPeopleNum === 0) {
        peopleNumError = `${this.$t('Biz.Order.OutOfRange')}[${minPeopleNum}~${this.$t('Biz.Order.NotLimit')}]`;
      } else {
        peopleNumError = `${this.$t('Biz.Order.OutOfRange')}[${minPeopleNum}~${maxPeopleNum}]`;
      }
      if (inputPeopleNum < minPeopleNum) {
        this.$message({
          type: 'error',
          message: peopleNumError,
          duration: 2000,
        });
        return false;
      }
      if (maxPeopleNum !== 0 && inputPeopleNum > maxPeopleNum) {
        this.$message({
          type: 'error',
          message: peopleNumError,
          duration: 2000,
        });
        return false;
      }
      return true;
    },
    handWriting() {
      this.$refs.iBillRemark.focus();
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else {
        this.$devices.Handwriting.open();
      }
    },
    // 开台页面点击服务员/营销员编辑按钮 弹出本页面，type 1为服务员 2 营销员
    changeWaiter(type) {
      this.chooseWaiter = type;
      this.$refs.changeWaiter.open(type, {
        submit: (info) => {
          if (Object.is(type, 1)) {
            this.waiterCode = info;
          } else {
            this.salesmanCode = info;
          }
        },
      });
    },
    changeContinuedBill() {
      this.isContinuedBill = !this.isContinuedBill;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
li,ul { margin: 0; padding: 0;}
.add-bill-wrap {
  position: relative;
  padding-right: 332px;
  height: 100%;
}
.handWritingST{
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
}

.add-bill-form {
  background-color: @white;
  padding: 15px 0;
  height: 100%;
  .contact {
      display: flex;
      justify-content: space-between;

      .form-group {
        display: flex;
      }
      .renewal-order{
        flex-basis: 140px;
        > label{
          flex: 1;
        }
        > .form-input {
          flex: 1;
          text-align: center;
        }
        .el-switch {
          margin-left: 8px;
        }
      }
      .auto-additem{
        flex: 1;

        > label{
          flex: 2;
          text-align: center;
        }

        > .form-input {
            flex: 1;
            text-align: right;
        }
      }
    }
  .form-group {
    position: relative;
    padding-left: 80px;
    margin: 0 15px 12px;
    > label {
      position: absolute;
      left: 0;
      top: 50%;
      line-height: 40px;
      margin-top: -20px;
      margin-bottom: 0;
    }

    > .form-input {
      position: relative;
      min-height: 40px;

      > img {
        position: absolute;
        right: 10px;
        top: 12px;
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .form-control-static {
        line-height: 44px;

        &.special-row {
          max-width: 68%;
          height: 40px;
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .btn-edit {
        color: @brand-primary;
      }

      .special-btn {
        transform: translateY(-28%);
      }

      &-crm {
        padding-right: 50px;

        > button {
          position: absolute;
          right: 0;
          top: 0;
          .square(44px);
          border: 1px solid #ccc;
          border-radius: 3px;
          background: none;

          > i.icon {
            font-size: 24px;
            color: @brand-primary;
          }
        }
      }

      &-info {
        > .form-control {
          display: inline-block;
          width: 140px;
        }

        > label {
          font-weight: normal;
          margin-bottom: 0;
          color: #999;
        }
      }

      &-switch {
        padding-top: 10px;
      }
    }
  }

  .form-control {
    height: 40px;

    &:focus {
      border-color: @brand-primary;
      .box-shadow(inset 0 1px 5px #aff9ff);
    }
  }

  .p {
    .square(64px);
    border: 1px solid #f44e66;
    padding: 2px;
    text-align: center;

    > .i {
      .square(100%);
      border: 1px dotted #f44e66;
      padding-top: 6px;

      > span,
      > strong {
        display: block;
        color: #f44e66;
        .text-overflow();
      }

      > span {
        font-size: 12px;
        height: 20px;
        line-height: 20px;
      }

      > strong {
        height: 28px;
        line-height: 28px;
      }
    }
  }
}
.add-bill-keyboard {
  position: absolute;
  right: 0;
  top: 0;
  width: 332px;
  height: 100%;
  padding-left: 45px;
  padding-top: 78px;
}

.buffetBox {
  margin-bottom: 12px;
  padding: 0px 0 0 15px;
  // background: #f5f5f5;
  li {
    display: flex;
    width: 100%;
    height: 40px;
    margin-bottom: 12px;
    .selectBtn {
      margin-left:14px;
      width: 115px;
      height: 40px;
      overflow: hidden;
      border-radius: 4px;
      border:1px solid #ccc;
      background: #fff;
    }
    &:nth-last-child(1) { margin-bottom: 0; }
  }
  .text_buff { width: 128px; }
  .item-title{
    width: 80px;
    line-height: 40px;
    height: 40px;
    margin-bottom: 0;
  }
}

.lang-enUS {
  .add-bill-form .contact .auto-additem > label {
    text-align: left;
  }
  .handWritingST {
    font-size: 12px;
    width: 140px;
    padding-left: 5px;
  }
  .add-bill-form .form-control.remarks {
    width: 105px;
  }
  .add-bill-form {
    font-size: 12px;
  }
  .add-bill-form > .form-group > .form-input .btn-edit{
    font-size: 12px;
  }
}
</style>
<style>
.buffetBox .pos-pager { margin:10px 8px 0 0;}
</style>
