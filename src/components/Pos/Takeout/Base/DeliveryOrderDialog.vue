<template>
  <Dialog
    name=""
    ref="dialog"
    width="746px"
    height="623px"
    top="8vh"
    :hotkeys="takeoutDeliveryHotkey"
    @open="onOpen"
    @close="onCloseDialog"
  >
    <div slot="title" class="pos-dialog-header">
      <h3 class="pos-dialog-title">配送发单</h3>
      <div class="pos-dialog-control">
        <button type="button" class="btn btn-default" @click="handWriting" v-hideHandwritingBoard>
          <i class="icon icon-edit"></i>
          <span>手写板</span>
        </button>
        <button type="button" class="btn btn-default" @click="onClose">关闭<span>(Esc)</span></button>
        <button
          type="button"
          class="btn btn-primary"
          @click="onSubmit"
          :disabled="submitDisable"
        >确认<span>(PgDn)</span></button>
      </div>
    </div>
    <div class="takeout-phone-wrapper">
      <el-form
        :inline=true
        ref="form"
        :model="takeoutForm"
        label-width="60px">
        <el-form-item class="width40">
          <div class="user-info">{{
            name
          }} {{
            phone
          }}<br>{{
            address
          }}<br>{{
            dateFormat('%Y-%M-%D %H:%I:%S', orderItem.createDateTime)
        }}</div>
        </el-form-item>
        <el-form-item class="width55">
          <el-radio-group v-model="takeoutForm.deliveryType">
            <el-radio :label="1">立即发送</el-radio>
            <el-radio :label="0" class="booking-delivery">预约时间</el-radio>
          </el-radio-group>
          <el-time-picker
            v-judge
            class="booking-time"
            v-model="takeoutForm.bookingTime"
            placeholder="时间"
            v-show="takeoutForm.deliveryType === 0"
            format="HH:mm"
            value-format="THH:mm:ss.000"
          ></el-time-picker>
          <el-date-picker
            v-judge
            class="booking-date"
            v-model="takeoutForm.bookingDate"
            type="date"
            placeholder="日期"
            v-show="takeoutForm.deliveryType === 0"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
        <el-form-item class="width100">
          <span class="user-info">{{takeoutForm.maxDistance}}公里</span>
          <button
            type="button"
            class="btn btn-default location"
            @click="initTakeoutForm"
          >重新定位</button>
        </el-form-item>

        <el-form-item label="备注：" class="width40">
          <el-input v-model="takeoutForm.billRemark" placeholder="请输入备注"></el-input>
        </el-form-item>
        <el-form-item label="小费：" class="width55" v-if="isShowTip">
          <span class="pos-takeout-content-money" v-if="takeoutForm.tip">{{takeoutForm.tip}}</span>
          <el-button
            v-if="takeoutForm.tip"
            class="pos-takeout-content-btn-edit"
            @click="addTip(takeoutForm.tip)"
          >修改</el-button>
          <el-button
            v-else
            class="pos-takeout-content-btn-addMoney"
            @click="addTip(takeoutForm.tip)"
          ><i class="el-icon--left xiaofei"></i><span>加小费</span></el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 选择配送平台 -->
    <div class="takeout-phone-wrapper">
      <div class="third">选择第三方配送</div>
      <div class="platformArea">
        <div
          v-for="(item, index) in takeoutForm.sendPlats"
          class="platformDiv"
          :key="item.sendFrom"
          :class="{
            'platformDiv-no':item.platErrorCode != '200',
            'platformDiv-select':selectPlatform.indexOf(index) !== -1,
            'platformDiv-selected':item.id && item.platErrorCode == '200',
          }"
          @click="clickPlatform(item, index)"
        >
          <i v-if="item.id" class="selected"></i>
          <div class="name">{{item.sendFromName}}</div>
          <div class="state">{{
            item.id
              ? '正在发单中...'
              : item.dePrice
                ? item.dePrice
                : item.platErrorText
          }}</div>
        </div>
      </div>
    </div>
    <!-- 选择骑手 -->
    <div class="takeout-phone-wrapper paddingRider">
      <div class="riderDiv">
        <el-radio-group v-model="isZPS" @change="clickZPS">
          <el-radio :label="true">自配送</el-radio>
        </el-radio-group>
        <div v-if="isZPS" class="name">{{takeoutForm.deliveryRider.name}}</div>
        <el-button v-if="isZPS" @click="selectRider">选择骑手</el-button>
      </div>
    </div>
    <!-- 选择骑手 -->
    <SelectRider ref="selectRider" oprateTitle="选择骑手" @handleRider="handleRider"></SelectRider>
    <AddTip ref="AddTip"></AddTip>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { ERR_OK } from '@/common/api/takeoutConfig';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';

const SelectRider = (resolve) => {
  import('@/components/Pos/Takeout/Base/SelectRider').then((module) => {
    resolve(module);
  });
};
const IMMEDIATE_DELIVERY = 1; // 立即配送
// 加小费
const AddTip = (resolve) => {
    import('./AddTip').then((module) => {
      resolve(module);
    });
};
export default {
  components: { Dialog, SelectRider, AddTip },
  mixins: [DialogMixin],
  data() {
    return {
      dateFormat,
      orderItem: {},
      name: '',
      phone: '',
      address: '',
      takeoutForm: {
        deliveryRider: '',
        billRemark: '',
        bookingDate: '',
        bookingTime: '',
        deliveryType: 1,
        tip: 0,
      },
      submitDisable: false,
      closeHandWriting: false,
      selectPlatform: [],
      isZPS: false,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
    };
  },
  computed: {
    ...mapGetters(['posInfo']),
    takeoutDeliveryHotkey() {
      return {
        Esc: () => {
          this.onClose();
        },
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    isShowTip() {
      let flag = false;
      if (this.takeoutForm.sendPlats) {
        this.takeoutForm.sendPlats.forEach((item) => {
          if (item.isTip === 1) {
            flag = true;
          }
        });
      }
      return flag;
    },
  },
  methods: {
    onOpen() {
      this.orderItem = this.resData;
      this.name = this.orderItem.o2oTakeoutDinerDTOList[0].contactName;
      this.phone = this.orderItem.o2oTakeoutDinerDTOList[0].contactTel;
      this.address = this.orderItem.o2oTakeoutDistributionDTOList[0].deAddress;
      // 初始化表单信息
      this.initTakeoutForm();
      // 检测并打开手写板
      if (this.posInfo.isEnableHandwritingBoard) {
        this.closeHandWriting = true;
        this.$devices.Handwriting.open();
      }
    },
    onCloseDialog() {
      this.selectPlatform = [];
      this.isZPS = false;
      this.takeoutForm = {
        deliveryRider: '',
        billRemark: '',
        bookingDate: '',
        bookingTime: '',
        deliveryType: 1,
        tip: 0,
      };
    },
    clickPlatform(item, index) {
      if (item.platErrorCode == '200') {
        if (item.id) {
          this.cancel(item);
        } else if (this.selectPlatform.indexOf(index) !== -1) {
          for (let i = 0; i < this.selectPlatform.length; i += 1) {
            if (index === this.selectPlatform[i]) {
              this.selectPlatform.splice(i, 1);
            }
          }
        } else {
          this.selectPlatform.push(index);
        }
        this.isZPS = false;
        this.takeoutForm.deliveryRider = '';
      }
    },
    clickZPS() {
      this.selectPlatform = [];
    },
    initTakeoutForm() {
      ajax('canyin.takeout.takeoutsend.querysendinfo', {
        contentType: 'json',
        data: {
          orderId: this.orderItem.id,
        },
      }).then((res) => {
        this.takeoutForm = Object.assign({}, this.takeoutForm, res);
      });
    },
    // 选择骑手
    selectRider() {
      this.$refs.selectRider.open({
        selectedDistributorId: this.takeoutForm.deliveryRider.mid,
        takeoutPhone: true,
      });
    },
    // 骑手赋值
    handleRider(id, rider) {
      this.takeoutForm.deliveryRider = rider;
    },
    // 提交校验
    onSubmit() {
      // 预约时间
      if (
        this.takeoutForm.deliveryType === 0
        && (
          !this.takeoutForm.bookingDate
          || !this.takeoutForm.bookingTime
        )
      ) {
        this.$message.warning('请选择预约时间');
        return;
      }
      if (this.selectPlatform.length === 0 && !this.isZPS) {
        this.$message.warning('请选择配送方式');
        return;
      }
      if (this.isZPS && !this.takeoutForm.deliveryRider) {
        this.$message.warning('请选择骑手');
        return;
      }
      const plats = [];
      if (!this.isZPS) {
        this.selectPlatform.forEach((key) => {
          plats.push(this.takeoutForm.sendPlats[key]);
        });
        // 配送发单
        ajax('canyin.takeout.takeoutsend.sendorder', {
          contentType: 'json',
          data: {
            orderId: this.orderItem.id,
            bookSendTime: this.takeoutForm.deliveryType === 0
              ? this.takeoutForm.bookingDate + this.takeoutForm.bookingTime
              : this.takeoutForm.bookSendTime,
            remark: this.takeoutForm.billRemark,
            sendPlats: plats,
          },
        }).then((res) => {
          this.$message.success('配送发单成功');
          if (res.o2oTakeoutSendDTOList && this.takeoutForm.tip) {
            this.changeNum(res.o2oTakeoutSendDTOList);
          }
          this.submit();
          // 关闭弹窗
          this.close();
        });
      } else {
        this.updateRider();
      }
    },
    //  取消配送单
    cancel(item) {
      this.$confirm(`是否取消【${item.sendFromName}】正在发单的配送订单？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        ajax('canyin.takeout.takeoutsend.cancelsend', {
          contentType: 'json',
          data: {
            orderId: this.orderItem.id,
            o2oTakeoutSendDTOList: [{
              id: item.id,
              sendFrom: item.sendFrom,
            }],
          },
        }).then((res) => {
          if (res.code === '1') {
            this.submit();
            this.initTakeoutForm();
            this.$message.success('取消成功');
          } else {
            this.$message.success('取消失败');
          }
        });
      });
    },
    // 配送并打印
    distributeAndPrint() {
      ajax('canyin.takeout.takeoutdistribution.takeoutordedistribution', {
        params: {
          orderId: this.orderItem.id,
          distributorId: this.takeoutForm.deliveryRider.mid,
        },
      }).then((res) => {
        this.$emit('updateOrderList');
        if (res.data.code === ERR_OK) {
          this.$message.success(res.data.msg);
          // 关闭弹窗
          this.close();
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((err) => {
        this.$message.error(err);
      });
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
      } else {
        this.$devices.Handwriting.open();
      }
    },
    // 增加小费
    addTip(tip) {
      const data = {
        count: tip,
      };
      const listItem = JSON.parse(JSON.stringify(data));
      this.oldCount = listItem.count;
      this.$refs.AddTip.open({
        listItem, // 当前套餐中item
      }, {
        submit: (res) => {
          this.takeoutForm.tip = res.count;
          // 关闭窗口
          this.$refs.AddTip.close();
        },
      });
    },
    // 增加小费请求
    changeNum(list) {
      ajax('canyin.takeout.takeoutsend.sendtip', {
        contentType: 'json',
        data: {
          orderId: this.orderItem.id,
          sendTip: this.takeoutForm.tip,
          o2oTakeoutSendDTOList: list,
        },
      }).then(() => {
        this.submit();
      });
    },
    // 修改骑手保存
    updateRider() {
      ajax('canyin.takeout.takeoutdistribution.updatetakeoutordedistririder', {
        params: {
          orderId: this.orderItem.id,
          distributorId: this.takeoutForm.deliveryRider.mid,
        },
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.$message.success('配送发单成功');
          this.submit();
          this.close();
        } else {
          this.$message.error('配送发单失败');
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
  },
  watch: {
    'takeoutForm.deliveryType': {
      handler(value) {
        if (value === IMMEDIATE_DELIVERY) {
          // 立即配送 清空预约时间
          this.takeoutForm.bookingDate = '';
          this.takeoutForm.bookingTime = '';
        } else {
          const time = Date.parse(new Date(this.takeoutForm.bookSendTime));
          this.takeoutForm.bookingDate = dateFormat('%Y-%M-%D', time);
          this.takeoutForm.bookingTime = `T${dateFormat('%H:%I:%S', time)}.000`;
        }
      },
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.takeout-phone-wrapper {
  padding: 20px 28px;
  background: white;
  margin-bottom: 10px;
  .third{
    font-size: 16px;
    color: #666666;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .platformArea{
    display: flex;
    flex-wrap:wrap;
    .platformDiv{
      width:160px;
      height:130px;
      border-radius:4px;
      margin-bottom: 8px;
      margin-right: 8px;
      text-align: center;
      padding-top: 45px;
      background:rgba(255,255,255,1);
      border:1px solid rgba(181,181,181,1);
      cursor: pointer;
      .name {
        font-size:16px;
        font-weight:bold;
        color: #333333;
      }
      .state{
        color: #666666;
        font-size: 14px;
      }
    }
    .platformDiv-select{
      .platformDiv;
      background: #DCF9FB;
      border: 2px solid #0BABB9;
      .name{
        color: #0BABB9;
      }
    }
    .platformDiv-selected{
      .platformDiv-select;
      position: relative;
      .name{
        color: #0BABB9;
      }
      .state{
        color: #0BABB9;
      }
      i{
        position: absolute;
        right: 0;
        bottom: 0;
        &.selected {
          background-image: url(~@/common/images/pos/takeout/ic_selected.png);
          width: 22px;
          height: 22px;
        }
      }
    }
    .platformDiv-no{
      .platformDiv;
      background: #F0F0F0;
      border: 1px solid #CCCCCC;
      cursor: not-allowed;
      .name{
        color: #999999;
      }
      .state{
        color: #999999;
      }
    }
  }
  .riderDiv{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    .name{
      width: 70%;
    }
  }
  .location{
    color: #0BABB9;
    margin-left: 10px;
  }
  .width40{
    width: 38%;
  }
  .width55{
    width: 57%;
  }
  .width100{
    width: 100%;
    clear: both;
  }
  .user-info{
    font-weight: bold;
    line-height: 2;
  }
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
    float: right;
    width: 140px;
    margin-left: 10px;
    margin-top: 30px;
  }
  .booking-time {
    float: right;
    width: 100px;
    margin-left: 10px;
    margin-top: 30px;
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
  .pos-takeout-content-btn-addMoney{
    height: 36px;
    line-height: 1;
    font-weight: bold;
    padding: 12px 20px 25px 15px;
    i{
      vertical-align:top;
      &.xiaofei {
        background-image: url(~@/common/images/pos/takeout/ic_xiaofei.png);
        width: 16px;
        height: 16px;
        margin-right: 0;
      }
    }
  }
  .pos-takeout-content-btn-edit{
    height: 36px;
    line-height: 1;
    font-weight: 400;
  }
  .pos-takeout-content-money{
    font-weight: 400;
    margin-left: 5px;
    margin-right: 10px;
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
.paddingRider{
  padding: 8px 24px;
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
      font-size: 16px;
    }
    .el-form-item__content{
      line-height: 2;
      font-size: 16px;
    }
    .el-button {
      border: 1px solid #bbb;
      /*width: 86px;*/
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
  .riderDiv{
    .el-radio-group {
      vertical-align: bottom;
      padding-top: 5px;
    }
    .el-radio__label{
      font-size: 16px;
    }
  }
}

</style>
