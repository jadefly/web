<template>
  <Dialog
    name="PosDialog.TakeoutPhone"
    ref="dialog"
    @open="onOpen"
    width="550px"
    height="623px"
    top="8vh"
    :hotkeys="takeoutPhoneHotkey"
  >
    <div slot="title" class="pos-dialog-header">
      <!-- 提示 --订单信息 -->
      <h3 class="pos-dialog-title">{{ $t('Biz.Takeout.OrderInformation') }}</h3>
      <div class="pos-dialog-control">
        <button type="button" class="btn btn-default"  @click="handWriting" v-hideHandwritingBoard>
          <i class="icon icon-edit"></i>
          <!-- 手写板 -->
          <span>{{ $t('Dict.WritingPad') }}</span>
        </button>
        <button type="button" class="btn btn-default" @click="onClose">{{ $t('Dict.Close') }}<span>(Esc)</span></button>
        <button type="button" class="btn btn-primary" @click="onSubmit" :disabled="submitDisable">{{ $t('Dict.SubmitBtn') }}<span>(PgDn)</span></button>
      </div>
    </div>
    <div class="takeout-phone-wrapper">
      <el-form
        ref="form"
        :model="takeoutForm"
        label-width="100px">
        <el-form-item :label="$t('Dict.ContactNumber')">
          <!-- 请输入手机号 -->
          <el-input
            v-judge
            class="short"
            :class="{'error': phoneError}"
            :maxlength="11"
            :placeholder="$t('Biz.Takeout.PleaseEnterMbNumber')"
            v-model="takeoutForm.phoneNumber"
            autofocus="true"
            ref="takeoutPhone"
            v-num-keyboard:bottom
          ></el-input>
          <el-button @click="queryCustomerInfo" class="confirm-btn">{{ $t('Dict.Sure') }}</el-button>
        </el-form-item>
        <!-- 顾客姓名： -->
        <el-form-item :label="$t('Biz.Takeout.CustomerName')">
          <el-input
            v-model="takeoutForm.customerName"
            :placeholder="$t('Biz.Takeout.InptCustomerName')"
            :maxlength="100"
            ref="takeoutCustomerName"
          ></el-input>
        </el-form-item>
        <!-- 顾客类型： -->
        <el-form-item :label="$t('Biz.Takeout.CustomerType')">
          <el-radio-group v-model="takeoutForm.customertype">
            <!-- 新客 -->
            <el-radio :label="1" disabled>{{ $t('Biz.Takeout.NewCustomer') }}</el-radio>
            <!-- 熟客 -->
            <el-radio :label="0" disabled>{{ $t('Biz.Takeout.FrequentVisitor') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 送餐地址： -->
        <el-form-item :label="$t('Biz.Takeout.DeliveryAddress')">
          <!-- 请选择或输入配送地址 -->
          <el-input
            id="takeoutDeliveryAddress"
            ref="takeoutDeliveryAddress"
            :placeholder="$t('Biz.Takeout.InputAddress')"
            v-model="takeoutForm.deliveryAddress"
            @focus="showAddressList = true"
            @blur="showAddressList = false"
          ></el-input>
          <div class="delivery-address-icon">
            <i class="icon icon-quxiao" v-show="takeoutForm.deliveryAddress" @click="takeoutForm.deliveryAddress = ''"></i>
            <i class="icon icon-arr-down" @click="showAddressList = !showAddressList"></i>
          </div>
          <transition name="slide-fade">
            <ul class="address-list" v-show="addressList.length > 1 && showAddressList">
              <li v-for="item in addressList" @click="selectAddress(item)">{{ item.address }}</li>
            </ul>
          </transition>
        </el-form-item>
        <!-- 是否要发票： -->
        <el-form-item :label="$t('Biz.Takeout.IsNeedInvoice')">
          <el-switch v-model="takeoutForm.invoiceSwitch" active-color="#0096a4" inactive-color="#dcdfe6"></el-switch>
          <!-- 请填写发票抬头、税号等 -->
          <el-input
            class="middle"
            :placeholder="$t('Biz.Takeout.InvoiceTittle')"
            v-model="takeoutForm.invoiceTitle"
            v-show="takeoutForm.invoiceSwitch"
          ></el-input>
        </el-form-item>
        <!-- 送餐时间： -->
        <el-form-item :label="$t('Biz.Takeout.DeliveryTime')">
          <el-radio-group v-model="takeoutForm.deliveryType">
            <!-- 立即配送 -->
            <el-radio :label="1">{{ $t('Biz.Takeout.ImmediateDelivery') }}</el-radio>
            <!-- 预约配送时间 -->
            <el-radio :label="0" class="booking-delivery">{{ $t('Biz.Takeout.MakeDeliveryTime') }}</el-radio>
          </el-radio-group>
          <!-- 选择日期 -->
          <el-date-picker
            v-judge
            class="booking-date"
            v-model="takeoutForm.bookingDate"
            type="date"
            :placeholder="$t('Dict.SelectionDate')"
            v-show="takeoutForm.deliveryType === 0"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <el-time-picker
            v-judge
            class="booking-time"
            arrow-control
            v-model="takeoutForm.bookingTime"
            :placeholder="$t('Dict.SelectionTime')"
            v-show="takeoutForm.deliveryType === 0"
            format="HH:mm"
            value-format="THH:mm:ss.000"
          ></el-time-picker>
        </el-form-item>
        <!-- 骑手： -->
        <el-form-item :label="$t('Biz.Takeout.Rider')">
          <!-- 请选择骑手 -->
          <el-input
            v-model="takeoutForm.deliveryRider.name"
            :placeholder="$t('Biz.Takeout.PChooseRider')"
            class="short"
            disabled
          ></el-input>
          <el-button @click="selectRider" class="confirm-btn">{{ $t('Dict.Choose') }}</el-button>
        </el-form-item>
        <el-form-item :label="$t('Dict.Remarkss')">
          <!-- 请输入备注 -->
          <el-input v-model="takeoutForm.billRemark" :placeholder="$t('Biz.Takeout.EnterRemarks')"></el-input>
        </el-form-item>
      </el-form>
      <!-- 选择骑手 -->
      <SelectRider ref="selectRider" :oprateTitle="$t('Dict.ChooseRiders')" @handleRider="handleRider"></SelectRider>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import Dialog from '@/components/Pos/Common/Dialog'
import DialogMixin from '@/components/Pos/Common/DialogMixin'
import ajax from '@/common/js/ajax'
import dateFormat from '@/common/js/dateformat';

const SelectRider = (resolve) => {
  import('@/components/Pos/Takeout/Base/SelectRider').then((module) => {
    resolve(module);
  });
};

const NEW_CUSTOMER = 1; // 新客
const FREQUENT_CUSTOMER = 0; // 熟客
const IMMEDIATE_DELIVERY = 1; // 立即配送
const BOOKING_DELIVERY = 0; // 预约配送

export default {
  components: { Dialog, SelectRider },
  mixins: [DialogMixin],
  data() {
    return {
      takeoutForm: {
        id: '',
        phoneNumber: '',
        customerName: '',
        customertype: '',
        deliveryAddress: '',
        invoiceSwitch: false,
        invoiceTitle: '',
        deliveryType: '',
        bookingDate: '',
        bookingTime: '',
        deliveryRider: '',
        billRemark: '',
      },
      phoneError: false,
      addressList: [],
      showAddressList: false,
      submitDisable: false,
      closeHandWriting: false,
    };
  },
  computed: {
    ...mapGetters(['posInfo']),
    takeoutPhoneHotkey() {
      return {
        Esc: () => {
          this.onClose();
        },
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      // 初始化表单信息
      this.initTakeoutForm();
      // 检测并打开手写板
      if (this.posInfo.isEnableHandwritingBoard) {
        this.closeHandWriting = true;
        this.$devices.Handwriting.open();
      }
      // 自动显示电话号码
      if (this.resData.handlingPhone) {
        const { telNo, id } = this.resData.handlingPhone;
        this.takeoutForm.id = id;
        this.takeoutForm.phoneNumber = telNo;
        this.queryCustomerInfo();
      }
    },
    initTakeoutForm() {
      // 清空表单数据
      for (const key in this.takeoutForm) {
        this.takeoutForm[key] = '';
      }
      // 清空其他数据
      this.takeoutForm.invoiceSwitch = false;
      this.phoneError = false;
      this.addressList = [];
      this.showAddressList = false;
      this.submitDisable = false;
      // 备注回显
      this.$vemit('fastFoodReadRemark', (remark) => {
        if (remark) {
          this.takeoutForm.billRemark = remark;
        }
      });
    },
    // 查询顾客信息
    queryCustomerInfo() {
      // 校验手机号
      if (!this.isLegalPhoneNumber(this.takeoutForm.phoneNumber)) {
        this.phoneError = true
        this.$refs.takeoutPhone.focus()
        this.$message.error('请输入合法的联系电话,长度为7到11位')

      } else {
        // 获取地址列表
        this.phoneError = false
        ajax('canyin.takeout.takeoutdistriset.queryaddress', {
          params: {
            phone: this.takeoutForm.phoneNumber
          }
        }).then(data => {
          this.addressList = data.addressList
          if (this.addressList.length > 0) {
            this.initFrequentCustomer() // 设为熟客
          } else {
            this.initNewCustomer() // 设为新客
          }
        })
      }
    },
    // 初始化新客信息
    initNewCustomer() {
      this.$refs.takeoutCustomerName.focus();
      this.takeoutForm.customertype = NEW_CUSTOMER;
      this.takeoutForm.deliveryType = IMMEDIATE_DELIVERY;
      this.takeoutForm.customerName = '';
      this.takeoutForm.deliveryAddress = '';
    },
    // 初始化熟客信息
    initFrequentCustomer() {
      this.takeoutForm.customertype = FREQUENT_CUSTOMER;
      this.takeoutForm.deliveryType = IMMEDIATE_DELIVERY;
      this.takeoutForm.customerName = this.addressList[0].name;
      this.takeoutForm.deliveryAddress = this.addressList[0].address;
    },
    // 选择送餐地址
    selectAddress(item) {
      this.takeoutForm.deliveryAddress = item.address;
      this.takeoutForm.customerName = item.name;
      this.showAddressList = false;
    },
    // 选择骑手
    selectRider() {
      this.$refs.selectRider.open({ selectedDistributorId: this.takeoutForm.deliveryRider.mid, takeoutPhone: true });
    },
    // 骑手赋值
    handleRider(id, rider) {
      this.takeoutForm.deliveryRider = rider;
    },
    // 提交校验
    onSubmit() {
      // 配送时间
      if (this.takeoutForm.deliveryType === '') {
        // 请点击确认查询联系电话
        this.$message.error(this.$t('Biz.Takeout.ErrorMsg'));
        return;
      }
      // 联系电话校验
      if (!this.isLegalPhoneNumber(this.takeoutForm.phoneNumber)) {
        this.$refs.takeoutPhone.focus();
        // 请输入合法的联系电话
        // 请输入合法的联系电话,长度为7到11位
        this.$message.error(this.$t('Biz.Takeout.ErrorMsg01'));
        return;
      }
      // 顾客姓名校验
      if (this.takeoutForm.customerName === '') {
        this.$refs.takeoutCustomerName.focus();
        // 顾客姓名不能为空
        this.$message.error(this.$t('Biz.Takeout.ErrorMsg02'));
        return;
      }
      // 送餐地址校验
      if (this.takeoutForm.deliveryAddress === '') {
        this.$refs.takeoutDeliveryAddress.focus();
        // 送餐地址不能为空
        this.$message.error(this.$t('Biz.Takeout.ErrorMsg03'));
        return;
      }
      // 禁用提交按钮 防止重复你点击
      this.submitDisable = true;
      this.submit(this.takeoutForm);
      // 关闭弹窗
      this.close();
    },
    // 正则校验是否为合法号码 手机和座机
    isLegalPhoneNumber(number) {
      return /^\d{7,11}$/.test(number);
    },
    // 关闭手写板
    onClose() {
      if (this.closeHandWriting) {
        this.$devices.Handwriting.close();
      }
      this.close();
    },
    // 切换手写板
    handWriting() {
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else{
        this.$devices.Handwriting.open();
      }
    },
  },
  watch: {
    'takeoutForm.invoiceSwitch': function (value) {
      if (value === false) {
        // 不开发票 清空发票抬头
        this.takeoutForm.invoiceTitle = '';
      }
    },
    'takeoutForm.deliveryType': function (value) {
      if (value === IMMEDIATE_DELIVERY) {
        // 立即配送 清空预约时间
        this.takeoutForm.bookingDate = '';
        this.takeoutForm.bookingTime = '';
      } else {
        const now = Date.parse(new Date());
        this.takeoutForm.bookingDate = dateFormat('%Y-%M-%D', now);
        this.takeoutForm.bookingTime = `T${dateFormat('%H:%I:%S', now)}.000`;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.takeout-phone-wrapper {
  padding: 24px 32px;
  background-color: white;
  .short {
    width: 76%;
    margin-right: 10px;
  }
  .confirm-btn {
    position: absolute;
    top: 0;
    right: 0;
  }
  .middle {
    width: 86%;
    margin-left: 8px;
  }
  .booking-delivery {
    display: table-cell;
    padding-top: 16px;
    padding-bottom: 10px;
  }
  .booking-date {
    position: absolute;
    bottom: 0;
    right: 125px;
    width: 142px;
  }
  .booking-time {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 121px;
  }
  .error > input:focus {
    border-color: red;
  }
  .address-list {
    position: absolute;
    top: 40px;
    left: 0;
    border: 1px solid #dcdfe6;
    cursor: pointer;
    z-index: 1;
    width: 100%;
    background-color: white;
    padding-left: 16px;
    > li:hover {
      color: #0096a4;
    }
  }
  .delivery-address-icon {
    position: absolute;
    top: 0;
    right: 0;
    padding-right: 6px;
    cursor: pointer;
    > i {
      color: #ccc;
      &.icon-quxiao {
        font-size: 20px;
      }
      &.icon-arr-down {
        font-size: 24px;
      }
    }

  }
  // 动画
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.2s ease;
  }
  .slide-fade-enter,
  .slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
  }
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
// 修改elementUI CSS
.takeout-phone-wrapper {
  .el-form-item {
    margin-bottom: 16px;
    .el-form-item__label{
      font-size: 12px;
    }
    .el-button {
      border: 1px solid #bbb;
      width: 86px;
    }
    .el-radio-group {
      vertical-align: initial;
    }
    .el-input__inner {
      border: 1px solid #bbb;
    }
    .el-input.is-disabled .el-input__inner {
      background-color: white;
      border: 1px solid #bbb;
      color: #606266;
    }
    .el-radio__input.is-disabled {
      & + span.el-radio__label {
        color: #606266;
      }
      .el-radio__inner {
        background-color: white;
      }
      &.is-checked .el-radio__inner {
        border-color: #0096a4;
        background: #0096a4;
        &::after {
          background-color: white;
        }
      }
    }
  }
}

.lang-enUS{
  .takeout-phone-wrapper{
    padding: 12px 16px;
    .el-form-item__label{
      font-size: 12px;
      width: 120px !important;
    }
    .el-input{
      width: 70%;
    }
  }
}

</style>
