<template>
  <Dialog
    name="PosDialog.ModifyAddBill"
    ref="dialog"
    :title="$t('Biz.Order.UpdateOpenTable')"
    width="700px"
    :showSubmit="true"
    @submit="submitModifyAddBill"
    @open="onOpen"
    @close="onClose"
    :hotkeys="hotKeySet"
    submitId="modifyAddBillSubmit"
  >
    <div class="add-bill-wrap">
      <form action="javascript:;" class="form add-bill-form" v-keyboard:keyboard="{ autoSelect: true }">
        <div class="form-group">
          <label>{{$t('Biz.Order.SelectedTableLabel')}}</label>
          <div class="form-input">
            <div class="p">
              <div class="i">
                <strong>{{ data.pointName }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="iPeopleNum">{{$t('Biz.Order.DinerPersonNumLabel')}}</label>
          <input v-judge type="text" id="modifyPeopleNum"
            class="form-control" v-model="peopleNum"
            onkeyup="value=value.replace(/[^\d]/g,'')" maxlength="6">
        </div>
        <div class="form-group" v-if="isOpenSeatsNum">
          <label for="seatsNum">{{$t('Biz.Order.SeatsNum')}}</label>
          <div class="form-input form-input-info">
            <input v-judge type="text" id="seatsNum" class="form-control" :disabled="isTeam==1"
            v-model="seatsNum" onkeyup="value=value.replace(/[^\d]/g,'')" maxlength="6">
          </div>
        </div>
        <div class="form-group">
          <label>{{$t('Biz.Order.ServerLabel')}}</label>
          <div class="form-input form-input-info">
            <input v-judge type="text" class="form-control"
              v-model="waiterCode" id="modifyWaiterCode">
            <label>{{waiterName}}</label>
            <img :src="images[0]" @click="changeWaiter(1)" :alt="$t('Biz.Order.SelectServerAlt')">
          </div>
        </div>
        <div class="form-group">
          <label>{{$t('Biz.Order.SaleManLabel')}}</label>
          <div class="form-input form-input-info">
            <input v-judge type="text" class="form-control"
             v-model="salesmanCode" id="modifySalesmanCode">
            <label>{{salesmanName}}</label>
            <img :src="images[0]" @click="changeWaiter(2)" :alt="$t('Biz.Order.SelectSaleMan')">
          </div>
        </div>
        <div class="form-group">
          <label>{{$t('Biz.Order.ContinueLabel')}}</label>
          <div class="form-input form-input-switch">
            <el-switch v-model="isContinuedBill" :disabled="posInfo.hasMultiSettle"
              active-color="#0096a4" inactive-color="#dcdfe6"></el-switch>
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
            <strong class="form-control-static">{{data.dinnerTypeName}}</strong>
            <button type="button" class="btn btn-default btn-edit"
            @click="operateDinerOrLabel('diner')"><i class="icon icon-edit"></i> {{$t('Dict.Modify')}}</button>
          </div>
        </div>
        <div class="form-group"
          v-if="posSettings.isUsePercentageTab">
          <!-- vuex 参数判断是否启用自定义标签功能 -->
          <label>{{$t('Biz.Order.CustomLabel')}}</label>
          <div class="form-input">
            <strong class="form-control-static special-row">{{ customTagName }}</strong>
            <button type="button" class="btn btn-default btn-edit special-btn"
              @click="operateDinerOrLabel('customTag')"><i class="icon icon-edit"></i> {{$t('Dict.Modify')}}</button>
          </div>
        </div>
        <div class="form-group" style="padding-right: 100px;">
          <label for="modifyBillRemark">{{$t('Biz.Order.BillMarkLabel')}}</label>
          <textarea
            type="textarea"
            ref="iBillRemark"
            :maxlength="80"
            id="modifyBillRemark"
            class="form-control remarks"
            :placeholder="$t('Biz.Order.BillMark')"
            v-model="remark" @focus="showAndroidInput('remark')"></textarea>
          <button type="button" class="btn btn-default handWritingST"
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
    <OrderingWaiterModal
      v-if="isOpen"
      ref="changeWaiter"
      :waiterType="chooseWaiter" ></OrderingWaiterModal><!-- 选择服务员和营销员-->
  </Dialog>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { debounce, find } from 'lodash';
import { MessageBox } from 'element-ui';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import { SALES_MAN_TYPE, WAITER_TYPE } from '@/common/api/addBill';
import edit from '@/common/images/pos/singleItemTransfer/btn_edit.png';

// 开台就餐类型和自定义标签-组件
const DinerType = (resolve) => {
  import('@/components/Pos/Order/DinerType').then((module) => {
    resolve(module);
  });
};
// 开台选择点菜员和营销员
const OrderingWaiterModal = (resolve) => {
  import('@/components/Pos/Ordering/OrderingBtnsFunc/OrderingWaiterModal').then((module) => {
    resolve(module);
  });
};
export default {
  components: {
    Dialog,
    KeyBoard,
    DinerType,
    AndroidInput,
    OrderingWaiterModal,
  },
  mixins: [DialogMixin, AndroidInputMixin],
  data() {
    return {
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
        title: '开单',
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
        // 就餐模式
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
        // 是否默认显示销售会员价
        memberPriceFlgChecked: false,
      },
      // 是否续单
      isContinuedBill: false,
      // 自定义标签(无默认)
      customTagId: '',
      customTagName: '',
      customTagList: [],
      // 备注
      remark: '',
      errorMessage: '',
      peopleNum: 0,
      waiterCode: '',
      waiterName: '',
      salesmanCode: '',
      salesmanName: '',
      enableMember: false,
      waiterRes: true, // 校验使用
      salesmanRes: true, // 校验使用
      closeHandWriting: false, // 手写板
      isOpen: false, // 打开关闭时v-if OrderingWaiterModal组件
      chooseWaiter: 1, // 1 服务员 2 营销员 3 点菜员
      images: [edit],
      seatsNum: 0, // 席数
      isOpenSeatsNum: false, // 是否启用了席数功能
      isTeam: 0, // 是否是团队开单
    };
  },
  computed: {
    ...mapGetters(['setting', 'posInfo', 'posSettings']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitModifyAddBill();
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
  },
  methods: {
    ...mapMutations({
      setPosPointData: 'SET_POS_POINT_DATA',
    }),
    onOpen() {
      this.$vonce('authCode', (code) => {
        this.submitModifyAddBill(code);
      });
      this.isOpen = true;
      this.closeHandWriting = false;
      this.remark = '';
      this.waiterRes = true;
      this.salesmanRes = true;
      this.isContinuedBill = false;
      this.enableMember = false;
      if (this.posInfo.isEnableHandwritingBoard) {
        this.closeHandWriting = true;
        this.$devices.Handwriting.open();
      }
      ajax('canyin.pos.updateBill.updateBillView', {
        params: {
          pointId: this.resData.id ? this.resData.id : this.resData.data.pointId,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (res.code) {
          this.data = res.data;
          this.data.dinnerTypeIdOri = this.data.dinnerTypeId;
          this.data.dinnerTypeNameOri = this.data.dinnerTypeName;
          this.peopleNum = this.data.defCapacity;
          this.data.orderOriginIdOri = this.data.orderOriginId;
          this.data.orderOriginNameOri = this.data.orderOriginName;
          this.waiterCode = this.data.waiterCode;
          this.waiterName = this.data.waiterName;
          this.salesmanCode = this.data.salesmanCode;
          this.salesmanName = this.data.salesmanName;
          // vuex参数判断, 总部控制是否启用"自定义标签"
          if (this.posSettings.isUsePercentageTab) {
            this.customTagList = res.data.customTagList;
            this.customTagId = res.data.customTagId || '';
            // 空值处理
            this.customTagName = find(res.data.customTagList, ['id', this.customTagId])
              ? find(res.data.customTagList, ['id', this.customTagId]).name
              : '';
          }
          this.remark = this.data.remark;
          this.enableMember = this.data.memberPriceFlgChecked;
          this.isContinuedBill = this.data.isContinuedBill;
          if (this.data.pointName.indexOf('-') !== -1) {
            this.data.pointName = this.data.pointName.substr(this.data.pointName.indexOf('-') + 1);
          }
          this.isTeam = this.resData.isTeam;
          this.isOpenSeatsNum = this.setting.isUseSeat === '1'; // 是否启用席数
          this.seatsNum = this.data.tableQty || 1; // 初始化席数
          this.$refs.keyboard.reSelect();
        }
      }).catch((code, msg) => {
        this.close();
        MessageBox.alert(msg, this.$t('Dict.WrongInfo'));
      });
    },
    onClose() {
      this.customTagId = '';
      this.customTagName = '';
      this.isOpen = false;
      this.data = {};
      if (this.closeHandWriting) {
        this.$devices.Handwriting.close();
      }
    },
    async submitModifyAddBill(authData = {}) {
      // 提交前校验
      const seatNum = this.seatsNumFun(this.seatsNum);
      const peopleNum = this.peopleNumFun(this.peopleNum);
      const result1 = await this.getEmpNameByEmpCode(this.salesmanCode);
      if (result1) {
        this.getEmpNameByEmpCodeCallBack(result1, SALES_MAN_TYPE);
      }
      const result2 = await this.getEmpNameByEmpCode(this.waiterCode, WAITER_TYPE);
      if (result2) {
        this.getEmpNameByEmpCodeCallBack(result2, WAITER_TYPE);
      }
      if (!peopleNum || !this.waiterRes || !this.salesmanRes || !seatNum) { return; }
      const params = {
        // 客位id
        pointId: this.resData.id,
        // 客位code
        pointCode: this.data.pointCode,
        // 就餐类型
        dinnerTypeId: this.data.dinnerTypeId,
        // 订单来源
        orderOriginId: this.data.orderOriginId,
        // 服务员id
        waiterId: this.data.waiterId,
        // 营销员id
        salesmanId: this.data.salesmanId,
        // 是否为修改状态
        isUpdate: this.data.isUpdate,
        // 原始人数
        peopleQtyOri: this.data.defCapacity,
        dinnerTypeIdOri: this.data.dinnerTypeIdOri,
        dinnerTypeNameOri: this.data.dinnerTypeNameOri,
        orderOriginIdOri: this.data.orderOriginIdOri,
        orderOriginNameOri: this.data.orderOriginNameOri,
        customTagId: this.customTagId,
        // 是否开通自助功能
        moduleBillAddBillIsOpenSelf: this.data.isOpenSelf,
        dinnerMode: this.data.dinnerMode,
        peopleQty: this.peopleNum,
        waiterCode: this.waiterCode,
        salesmanCode: this.salesmanCode,
        remark: this.remark,
        isContinuedBill: this.isContinuedBill,
        tableQty: Number(this.seatsNum), // 席数
        ...authData,
      };
      if (this.data.isOpenSelf) {
        params.dinnerMode = 2;
      } else {
        params.dinnerMode = 1;
      }
      // 如果是执行会员价 就添加这个属性
      if (this.enableMember) {
        this.$set(params, 'memberPriceFlg', this.enableMember);
      }
      ajax('canyin.pos.updateBill.updateBill', {
        contentType: 'paramsEncoded',
        data: params,
      })
        .then((res) => {
          if (res.success) {
            this.close();
            // 储存下客位信息
            this.setPosPointData(this.resData);
            this.$vemit('loadBill', this.resData.id);
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
    // 修改开台前校验席数
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
    getEmpNameByEmpCodeCallBack(res, type) {
      const data = res;
      // if (data != null && data != {} && data != "") {
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
      } else {
        if (type === SALES_MAN_TYPE) {
          // this.salesmanName = "";
          // this.data.salesmanId = "";
          // this.salesmanCode = "";
          this.salesmanRes = false;
        } else if (type === WAITER_TYPE) {
          // this.waiterName = "";
          // this.data.waiterId = "";
          // this.waiterCode = "";
          this.waiterRes = false;
        }
        this.errorMessage = `${type === WAITER_TYPE ? '服务员：' : '营销员：'}没有此员工编号或者员工已经删除`;
      }
      // } else {
      //   this.waiterRes = false;
      //   this.salesmanRes = false;
      //   this.errorMessage = "查询错误";
      // }
      if (this.errorMessage !== '') {
        this.$message({
          type: 'error',
          message: this.errorMessage,
          duration: 2000,
        });
      }
    },
    getEmpNameByEmpCode(empCode) {
      if (empCode === '') {
        return null;
      }
      this.errorMessage = '';
      return ajax('canyin.pos.bill.getempidname', {
        params: {
          empCode,
        },
      });
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
        {
          // 回调
          submit: (dinerType) => {
            this.data.dinnerTypeId = dinerType.id;
            this.data.dinnerTypeName = dinerType.name;
          },
        },
      );
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
    peopleNumFun(value) {
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
      const minPeopleNum = this.data.minCapacity;
      const maxPeopleNum = this.data.maxCapacity;
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
    padding: 15px;
    height: 100%;

    > .form-group {
      position: relative;
      padding-left: 90px;
      margin-bottom: 12px;

      > label {
        position: absolute;
        left: 0;
        top: 50%;
        height: 44px;
        line-height: 44px;
        margin-top: -22px;
        margin-bottom: 0;
      }

      > .form-input {
        position: relative;
        min-height: 44px;

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
            height: 44px;
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
      height: 44px;

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
  .lang-enUS {
    .handWritingST {
      font-size: 12px;
      width: 140px;
      padding-left: 5px;
    }
    .add-bill-form .form-control.remarks {
      width: 105px;
    }
  }
</style>
