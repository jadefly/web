<template>
  <Dialog
    name="PosDialog.PayServiceCharge"
    :title="$t('Dict.Btn.ServiceCharge')"
    footer=""
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :hotkeys="PayServiceCharge"
    :append-to-body="true"
    :showSubmit="true"
    @submit="submit"
    top="25vh"
    width="660px"
  >
  <div class="extendbutton" slot="other-button">
    <button class="resumption-service-charges btn btn-default" @click="resumptionServiceCharge" type="button">{{$t('Biz.Settlement.RecoveryServiceFee')}}(F1)</button>
    <button class="exempt-charges btn btn-default" @click="exemptCharge" type="button">{{$t('Biz.Settlement.Exempt')}}(F2)</button>
    <button v-if="isPrivateRoom" class="exempt-charges btn btn-default" :disabled="Boolean(teamBsIds)" @click="adjustmentTime" type="button">
      {{$t('Biz.Settlement.AdjustmentTiming')}}(F3)
    </button>
  </div>
  <div class="wrapper-serviceCharge">
    <div class="private-room" v-if="isPrivateRoom">
      <div class="fee-info">
        <div>
          <span>{{$t('Biz.Settlement.BillingPlan')}}</span>
          <span>{{ privateRoomForm.billPlan }}</span>
        </div>
        <div>
          <span>{{$t('Biz.Settlement.BillingTime2')}}</span>
          <span>{{ privateRoomForm.billTime }}</span>
        </div>
        <div>
          <span>{{$t('Dict.StartTime')}}</span>
          <span>{{ privateRoomForm.startTime }}</span>
        </div>
        <div>
          <span>{{$t('Dict.EndTime')}}</span>
          <span>{{ privateRoomForm.endTime }}</span>
        </div>
        <div>
          <span>{{$t('Biz.Settlement.FirstTimeCharge')}}</span>
          <span>{{ privateRoomForm.firstFee }}</span>
        </div>
        <div>
          <span>{{$t('Biz.Settlement.TimingCharge')}}</span>
          <span>{{ privateRoomForm.countFee }}</span>
        </div>
        <div>
          <span>{{$t('Biz.Settlement.AdditionalCharges')}}</span>
          <span>{{ privateRoomForm.addFee }}</span>
        </div>
        <div>
          <span>{{$t('Biz.Settlement.CurrentServiceFee')}}</span>
          <span>{{ privateRoomForm.totalFee }}</span>
        </div>
      </div>
      <el-form :rules="privateRoomMoneyRules" :model="privateRoomForm" ref="privateRoomForm" label-width="112px" size="small" label-position="left" class="wrapper-left private">
        <el-form-item :label="$t('Biz.Settlement.ServiceFeeModifiedTo')" class="form-info-right" v-keyboard:keyboard>
          <el-input class="text-right" v-model="privateRoomForm.changeFee" v-judge :autofocus="true" placeholder="" :disabled="Boolean(teamBsIds)" size="mdedium"></el-input>
        </el-form-item>
      </el-form>
      <p>{{$t('Biz.Settlement.Tip37')}}</p>
      <p>{{$t('Biz.Settlement.Tip38')}}</p>
    </div>
    <el-form v-else :rules="moneyRules" :model="moneyForm" ref="moneyForm" label-width="125px" size="small" label-position="left" class="wrapper-left">
      <el-form-item :label="$t('Biz.Settlement.CollectionMethod') + ':'">
        <span class="align-right" v-if="!teamBsIds">{{ collectionMethod }}</span>
      </el-form-item>
      <el-form-item :label="$t('Biz.Settlement.CurrentServiceFee')">
        <span class="align-right">{{ currentServiceMoney }}</span>
      </el-form-item>
      <el-form-item :label="$t('Biz.Settlement.ServiceFeeModifiedTo')" class="form-info-right" prop="money" v-keyboard:keyboard>
        <el-input class="text-right" v-model="moneyForm.money" v-judge :autofocus="true" placeholder="" size="mdedium" :disabled="Boolean(teamBsIds)"></el-input>
      </el-form-item>
    </el-form>
    <div class="wrapper-right">
        <KeyBoard class="keybord" ref="keyboard" :isDisabled="Boolean(teamBsIds)"></KeyBoard>
    </div>
  </div>
    <AdjustmentTime ref="adjustmentTime" @refresh="onOpen"></AdjustmentTime>
  </Dialog>
</template>

<script>
import { isNaN } from 'lodash';
import ajax from '@/common/js/ajax';
import AdjustmentTime from './PayServiceChargeComponents/AdjustmentTime';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import i18n from '@/locales/index';


// 验证金钱数量
const validateMoney = (rule, value, callback) => {
  const money = Number(value);
  if (isNaN(money)) {
    callback(new Error(i18n.t('Dict.Validate.NumberMessage')));
  } else if (money <= 0 || money > 999999.99) {
    callback(new Error(i18n.t('Dict.Validate.NumberRangeMessage', [0, 999999.99])));
  } else {
    callback();
  }
};

export default {
  components: { Dialog, KeyBoard, AdjustmentTime },
  mixins: [DialogMixin],
  data() {
    return {
      teamBsIds: null,
      collectionMethod: `${this.$t('Dict.Null')}`, // 服务费收取方式
      currentServiceMoney: 0, // 当前服务费
      pointId: null,
      bsId: null,
      moneyForm: {
        money: '',
      },
      moneyRules: {
        money: [
          { required: true, message: this.$t('Biz.BizComm.BizCommTip04'), trigger: 'change' },
          { validator: validateMoney, trigger: 'change' },
        ],
      },
      isPrivateRoom: false, // 是否是收费时长
      privateRoomForm: { // 收费时长时显示的各种计费值
        billPlan: '',
        billTime: '',
        startTime: '',
        endTime: '',
        firstFee: 0,
        countFee: 0,
        addFee: 0,
        totalFee: 0,
        chargePlanId: '',
        changeFee: 0,
      },
      privateRoomMoneyRules: {
        totalFee: [
          { required: true, message: `${this.$t('Biz.Settlement.Error79')}`, trigger: 'change' },
          { validator: validateMoney, trigger: 'change' },
        ],
      },
      ajaxCacheData: null,
    };
  },
  computed: {
    // 添加快捷键
    PayServiceCharge() {
      return {
        // 恢复服务费
        F1: () => {
          this.resumptionServiceCharge();
        },
        // 免除
        F2: () => {
          this.exemptCharge();
        },
        F3: () => {
          if (this.isPrivateRoom && !Boolean(this.teamBsIds)) {
            this.adjustmentTime();
          }
        },
        // 确认
        PgDn: () => {
          this.submit();
        },
      };
    },
  },
  methods: {
    adjustmentTime() {
      this.$refs.adjustmentTime.open({
        roomData: this.privateRoomForm,
        ajaxData: this.ajaxCacheData,
        baseData: this.resData,
      });
    },
    onOpen() {
      this.teamBsIds = this.resData[2];
      const params = {
        pointid: this.resData[0],
        bsid: this.resData[1],
      };
      if (this.teamBsIds) {
        params.teamBsIds = this.teamBsIds;
      }
      ajax('canyin.pos.settlement.servicefeeview', {
        params,
      }).then((res) => {
        if (res.data.code === '1') {
          this.serviceCollectionMethod(res.data.data);
        }
      });
    },
    // 包房费计时收费各种显示的费用
    showPrivateRoomFee(data) {
      const { serviceFeeInfo } = data;
      if (serviceFeeInfo) {
        this.ajaxCacheData = data;
        Object.assign(this.privateRoomForm, {
          billPlan: serviceFeeInfo.name,
          billTime: this.formatTime(serviceFeeInfo.times),
          startTime: this.formatDate(serviceFeeInfo.beginTime),
          endTime: this.formatDate(serviceFeeInfo.endTime),
          firstFee: serviceFeeInfo.firstChargeTotal,
          countFee: serviceFeeInfo.chargeTotal,
          addFee: serviceFeeInfo.addChargeTotal,
          totalFee: serviceFeeInfo.serviceFeeTotal,
          changeFee: serviceFeeInfo.serviceFeeLastTotal,
          chargePlanId: serviceFeeInfo.chargePlanId,
        });
        this.isPrivateRoom = true;
      } else {
        this.isPrivateRoom = false;
      }
    },
    serviceCollectionMethod(serviceData) {
      // 包房费计时收费各种显示的费用
      this.showPrivateRoomFee(serviceData);
      // 以下为old服务费逻辑
      if (serviceData.servicefee) { // 如果有服务信息
        if (serviceData.servicefee.is_modify == true) {
          this.collectionMethod = `${this.$t('Biz.Settlement.CollectionMethodMsg1')}${serviceData.servicefee.orig_fee}`;
        } else if (serviceData.pointMng) {
          if (serviceData.pointMng.service_charge_type == 1) {
            this.collectionMethod = `${this.$t('Biz.Settlement.CollectionMethodMsg1')}${serviceData.pointMng.service_charge}`;
          } else if (serviceData.pointMng.service_charge_type == 2) {
            this.collectionMethod = `${this.$t('Biz.Settlement.CollectionMethodMsg1')}
            ${(serviceData.pointMng.service_charge * 100).toFixed(2)} %
            ${this.$t('Biz.Settlement.Charge')}`;
          } else if (serviceData.pointMng.service_charge_type == 3) {
            this.collectionMethod = `${this.$t('Biz.Settlement.ChargedPerPeople')}${serviceData.pointMng.service_charge}`;
          }
        }
        // 当前服务费
        this.currentServiceMoney = serviceData.servicefee.orig_fee;
        // 输入框当前服务费
        this.moneyForm.money = serviceData.servicefee.orig_fee;
      } else if (serviceData.servicefeeList && serviceData.servicefeeList.length) {
        const teamServiceFee = serviceData.servicefeeList.reduce((sum, item) => sum + item.orig_fee, 0);
        this.currentServiceMoney = teamServiceFee;
        this.moneyForm.money = 0;
      } else {
        // 收取方式
        this.collectionMethod = `${this.$t('Dict.Null')}`;
        // 当前服务费
        this.currentServiceMoney = 0;
        this.moneyForm.money = 0;
      }
    },
    // 恢复服务费
    resumptionServiceCharge() {
      const params = {
        pointId: this.resData[0],
        bsId: this.resData[1],
      };
      if (this.teamBsIds) {
        params.teamBsIds = this.teamBsIds;
      }
      ajax('canyin.pos.settlement.servicefee.recover', {
        data: params,
        contentType: 'paramsEncoded',
      }).then((res) => {
        if (res.data.code === '1') {
          if (res.data.data.result == '1') {
            // 当前服务费
            this.currentServiceMoney = res.data.data.data.orig_fee;
            // 当前输入框服务费
            this.moneyForm.money = res.data.data.data.orig_fee;
            this.$message({
              type: 'success',
              message: `${this.$t('Biz.Settlement.Success33')}`,
            });
            // 当前服务费
            this.$emit('currentServiceMoney', res.data.data.data.orig_fee);
            // 关闭弹框
            this.close();
          } else if (res.data.data.result == '-1') {
            this.$message({
              type: 'error',
              message: `${this.$t('Biz.Settlement.Error80')}`,
            });

            // this.$confirm('对不起,恢复服务费失败', '提示', {
            //   confirmButtonText: '确定',
            //   cancelButtonText: '取消',
            //   type: 'warning',
            //   showClose: false,
            //   showConfirmButton: false,

            // }).then(() => {
            //   // this.$message({
            //   //   type: 'success',
            //   //   message: '删除成功!'
            //   // });
            // }).catch(() => {
            //   // this.$message({
            //   //   type: 'info',
            //   //   message: '已取消删除'
            //   // });
            // });
          }
        }
      });
    },
    // 免除服务费
    exemptCharge(authData = {}) {
      // if(this.currentServiceMoney == 0) {
      //   this.$message({
      //       type: 'error',
      //       message: '免除服务费失败'
      //     });
      //     return false;
      // }
      const params = {
        pointId: this.resData[0],
        bsId: this.resData[1],
        ...authData,
      };
      if (this.teamBsIds) {
        params.teamBsIds = this.teamBsIds;
      }
      this.$vonce('authCode', (code) => {
        this.exemptCharge(code);
      });
      ajax('canyin.pos.settlement.servicefee.off', {
        contentType: 'paramsEncoded',
        data: params,
      })
        .then((res) => {
          if (res.result == '1') {
            this.$message({
              type: 'success',
              message: `${this.$t('Biz.Settlement.Success34')}`,
            });
            // 当前服务费
            this.currentServiceMoney = 0;
            // 当前输入框服务费
            this.moneyForm.money = '';
            // 当前服务费
            this.$emit('currentServiceMoney', `${this.$t('Biz.Settlement.Free')}`);
            this.close();
          } else if (res.result == '-1') {
            this.$message({
              type: 'error',
              message: res.msg,
            });
          // 免除服务费失败
          }
        });
    },
    // 验证表单
    validForm(key) {
      return new Promise((resolve, reject) => {
        this.$refs[key].validate((valid) => {
          if (valid) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },
    // 更改服务费
    submit(authData = {}) {
      const key = this.isPrivateRoom ? 'privateRoomForm' : 'moneyForm';
      this.validForm(key)
        .then(() => {
          const params = {
            pointId: this.resData[0],
            bsId: this.resData[1],
            money: this.isPrivateRoom ? this.privateRoomForm.changeFee : this.moneyForm.money,
            ...authData,
          };
          this.$vonce('authCode', (code) => {
            this.submit(code);
          });
          ajax('canyin.pos.settlement.servicefee.modify', {
            contentType: 'paramsEncoded',
            data: params,
          })
            .then((res) => {
              if (res.result == '1') {
                // 当前服务费
                this.currentServiceMoney = res.data.orig_fee;
                // 当前输入框服务费
                this.moneyForm.money = res.data.orig_fee;
                this.$message({
                  type: 'success',
                  message: `${this.$t('Biz.Settlement.Success35')}`,
                });
                // 当前服务费
                this.$emit('currentServiceMoney', res.data.orig_fee);
                this.close();
              } else if (res.result == '-1') {
                // 服务费修改失败
                this.$message({
                  type: 'error',
                  message: res.msg,
                });
              }
            });
        }).catch(() => false);
    },
    // 格式化时间
    formatDate(time) {
      // 补零
      const addZero = (num) => {
        const str = `${num}`;
        if (str.length === 1) return `0${str}`;
        return str;
      };
      // 转为正常时间字符串
      const date = new Date(time);
      const year = date.getFullYear();
      const month = addZero(date.getMonth() + 1);
      const day = addZero(date.getDate());
      const hours = addZero(date.getHours());
      const min = addZero(date.getMinutes());
      return `${year}-${month}-${day} ${hours}:${min}`;
    },
    formatTime(str) {
      let time = '';
      if (+str < 60) {
        time = `${str}${this.$t('Dict.Minute')}`;
      } else if (+str === 60) {
        time = `1${this.$t('Dict.Hour')}`;
      } else {
        const hours = Math.floor(str / 60);
        const mins = str % 60;
        time = `${hours}${this.$t('Dict.Hour')}${mins}${this.$t('Dict.Minute')}`;
      }
      return time;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.extendbutton {
  display: inline-block;
  > button {
    height: 44px;
    border: 1px solid #0babb9;
    color: #0babb9;
  }
}
.wrapper-serviceCharge {
  display: flex;
  .wrapper-left {
    padding-top: 18px;
    padding-left: 18px;
    padding-right: 18px;
    width: 360px;
    flex: none;
    background-color: #fff;
    .align-right{
      text-align: right;
      display: block;
    }
    &.private {
      padding: 0;
    }
  }
  .wrapper-right {
    display: flex;
    align-items: center;
    padding: 16px 16px 25px 16px;
    flex: 1;
  }
  .private-room {
    padding: 15px;
    background-color: #ffffff;
    .fee-info {
      & > div {
        display: flex;
        margin-bottom: 15px;
        & > span:first-child {
          width: 130px;
        }
        & > span:last-child{
          flex: 1;
          text-align: right;
        }
      }
    }
    > p {
      font-size: 14px;
    }
  }
}
</style>
<style lang="less">
.form-info-right {
  .text-right {
    .el-input__inner {
      text-align: right;
      font-weight: bolder;
      font-size: 15px;
    }
  }
}
</style>
