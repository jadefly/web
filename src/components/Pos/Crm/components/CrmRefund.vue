<template>
  <el-form class="form-warp" :model="refundForm"
  :rules="refundRules" ref="refundForm" label-width="96px">
    <!-- $t-交易序号 -->
    <el-form-item :label="$t('Biz.Crm.TransNum')+'：'" prop="ordernumber" class="card-input-warp">
      <el-input class="card-input" ref="refundNumber" v-model.trim="refundForm.ordernumber" v-judge>
      </el-input><button class="btn btn-primary" @click="query" type='button'>
        {{ $t('Dict.Search') }}<span class="quick-tip">(Enter)</span>
      </button>
    </el-form-item>
    <template v-if="serialData">
      <!-- $t-控制卡卡号： -->
      <el-form-item :label="$t('Biz.Crm.ControlNum')+'：'" prop="controlCardNo"
      class="controlcard-input-warp" label-width="108px">
        <el-input class="card-input" v-model.trim="refundForm.controlCardNo" v-judge>
          </el-input><button class="btn btn-primary" type='button' @click="readCard">
          {{ $t('Dict.CardReading') }}<span class="quick-tip">(/)</span>
      </button>
      </el-form-item>
      <!-- $t-控制卡密码： -->
      <el-form-item :label="$t('Biz.Crm.ControlPwd')+'：'" prop="controlPwd"
      class="controlcard-input-warp" label-width="108px">
        <el-input class="card-input" type="password"
        v-model.trim="refundForm.controlPwd" v-judge></el-input>
      </el-form-item>
      <el-form-item class="info-warp" label-width="0">
        <!-- $t-充值方式：,充值金额,赠送金额： -->
        <p><span class="title">{{ $t('Biz.Crm.RechargeMode') }}</span><span class="info">{{serialData.payWay}}</span></p>
        <p><span class="title">{{ $t('Biz.Crm.RechargeAmount')+'：' }}</span><span class="info">{{serialData.realMoney}}</span></p>
        <p><span class="title">{{ $t('Biz.Crm.GiveAmount') }}</span><span class="info">{{serialData.giveMoney}}</span></p>
      </el-form-item>
      <el-form-item class="back-warp" label-width="0">
        <!-- $t-撤销充值金额： -->
        <p class="danger-tip">{{ $t('Biz.Crm.CancelRechargeVal') }}<span class="info">{{serialData.operationMoney}}</span></p>
      </el-form-item>
      <el-form-item class="btn-warp" label-width="0">
        <button class="btn btn-default" @click="reset" type="button">
          {{ $t('Biz.Crm.Reset') }}<span class="quick-tip">(PgUp)</span>
        </button>
        <button class="btn btn-primary" @click="submit" type="button">
          {{ $t('Dict.Sure') }}<span class="quick-tip">(PgDn)</span>
        </button>
      </el-form-item>
    </template>
  </el-form>
</template>
<script>
import ajax from '@/common/js/ajax';

export default {
  model: {
    prop: 'cardInfo',
    event: 'change',
  },
  props: {
    cardInfo: {
      required: true,
    },
  },
  data() {
    return {
      refundForm: {
        ordernumber: '',
        controlCardNo: '',
        controlPwd: '',
      },
      refundRules: {
        ordernumber: [
          // { required: true, message: '请输入交易序号', trigger: 'change' },
          { required: true, message: (this.$t('Biz.Crm.Input')+this.$t('Biz.Crm.TransNum')), trigger: 'change' },
        ],
        controlCardNo: [
          // { required: true, message: '请输入控制卡卡号', trigger: 'change' },
          { required: true, message: (this.$t('Biz.Crm.Input')+this.$t('Biz.Crm.ControlNum')), trigger: 'change' },
        ],
        controlPwd: [
          // { required: true, message: '请输入控制卡密码', trigger: 'change' },
          { required: true, message: (this.$t('Biz.Crm.Input')+this.$t('Biz.Crm.ControlPwd')), trigger: 'change' },
        ],
      },
      // 流水信息
      serialData: null,
    };
  },
  methods: {
    setCurrentHotkey() {
      this.$hotKey.set('Pos.Crm', {
        Enter: () => {
          this.query();
        },
        PgUp: () => {
          this.reset();
        },
        PgDn: () => {
          this.submit();
        },
      });
    },
    // 读卡
    readCard() {
      this.$devices.Cardop.read((card) => {
        if (+card.returnCode === 0) {
          this.refundForm.controlCardNo = card.CardNo;
        } else {
          // this.$message.error('读卡器读卡失败');
          this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg082'));
        }
      });
    },
    // 重置表单
    reset() {
      this.$refs.refundForm.resetFields();
      this.$emit('change', null);
      this.serialData = null;
    },
    // 提交
    submit() {
      this.$refs.refundForm.validate((valid) => {
        if (valid) {
          ajax('canyin.pos.crm.crmsalescounter.undocharge', {
            contentType: 'paramsEncoded',
            data: {
              paySerialNo: this.refundForm.ordernumber,
              controlCard: this.refundForm.controlCardNo,
              password: this.refundForm.controlPwd,
              chargeMoney: this.serialData.realMoney,
              cardNo: this.serialData.cardNo,
              giveMoney: this.serialData.giveMoney,
            },
          }).then((data) => {
            if (data.success) {
              this.$message.success(data.msg);
              this.$emit('change', null);
              this.$refs.refundForm.resetFields();
              this.serialData = null;
              if (data.printData.success) {
                const { printData } = data;
                if (printData.printType === 'PRINT_PARALLEL' && printData.printD && this.$devices.Printer) {
                  this.$devices.Printer.print(printData.printD);
                }
              } else {
                this.$notify.warning(data.printData.msg);
              }
            } else {
              this.$message.warning(data.msg);
            }
          });
        } else {
          // this.$message.warning('请完善表单信息');
          this.$message.warning(this.$t('Biz.Crm.CrmTip07'));
          return false;
        }
        return undefined;
      });
    },
    // 获取会员卡信息
    getMemberCardInfo() {
      ajax('canyin.pos.crm.crmsalescounter.readcard', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.serialData.cardNo,
        },
      }).then((data) => {
        if (data.success) {
          this.$message.success(data.msg);
          this.$emit('change', data.data);
        } else {
          this.$message.warning(data.msg);
        }
      });
    },
    // 查询交易序号
    query() {
      if (this.refundForm.ordernumber === '') {
        // this.$message.warning('请输入交易序号');
        this.$message.warning(this.$t('Biz.Crm.Input')+this.$t('Biz.Crm.TransNum'));
        return;
      }
      ajax('canyin.pos.crm.crmsalescounter.tradequery', {
        contentType: 'URLEncoded',
        data: {
          serialNo: this.refundForm.ordernumber,
        },
      }).then((data) => {
        this.serialData = data;
        this.getMemberCardInfo();
      });
    },
  },
};
</script>
<style lang="less" scoped>
  button{
    font-size: 16px;
    .quick-tip{
      font-size: 14px;
    }
  }
  .form-warp{
    width: 523px;
    text-align: left;
  }
  .card-input-warp{
    .card-input{
      width: 310px;
    }
    button{
      height: 38px;
      margin-left: 16px;
      width: 100px;
    }
  }
  .controlcard-input-warp{
    .card-input{
      width: 232px;
    }
    button{
      height: 38px;
      margin-left: 16px;
      width: 100px;
    }
  }
  .info-warp{
    background-color: #eee;
    border: 1px dashed #c5ccd9;
    border-radius: 5px;
    line-height: 2.375;
    font-size: 16px;
    padding: 8px 30px;
    p > *{
      display: inline-block;
    }
    .title{
      width: 88px;
    }
  }
  .back-warp{
    .danger-tip{
      color: #F00;
      font-size: 16px;
      .info{
        font-size: 18px;
        line-height: 1.5;
      }
    }
  }
  .btn-warp{
    text-align: center;
    button{
      width: 200px;
      height: 42px;
    }
    button+button{
      margin-left: 16px;
    }
  }
</style>
