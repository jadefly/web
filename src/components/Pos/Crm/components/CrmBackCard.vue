<template>
  <el-form
    class="form-warp"
    :model="backcardForm"
    ref="backcardForm"
    :rules="backcardRules"
    label-width="115px"
  >
    <el-form-item :label="$t('Biz.Crm.CardTelNum')" prop="cardnumber" class="card-input-warp">
      <el-input
        class="card-input"
        ref="backcardNumber"
        v-model.trim="backcardForm.cardnumber"
        v-judge
      >
      <!-- $t-读卡 -->
      </el-input><button class="btn btn-primary" type="button" @click="readCard">
        {{ $t('Dict.CardReading') }}<span class="quick-tip">(Enter)</span>
      </button>
    </el-form-item>
    <template v-if="cardInfo && cardInfo.isTempCard === '1'">
      <el-form-item class="info-warp" label-width="0">
        <!-- $t-姓名：手机号：余额：赠送押金：押金： -->
        <p><span class="title">{{ $t('Dict.FullNameLabel') }}</span><span class="info">{{cardInfo.name}}</span></p>
        <p><span class="title">{{ $t('Dict.PhoneNumber') }}</span><span class="info">{{cardInfo.phone}}</span></p>
        <p><span class="title">{{ $t('Balance.Balance') }}</span><span class="info">{{cardInfo.balanceMoney}}</span></p>
        <p><span class="title">{{ $t('Biz.Crm.GiveDeposit') }}</span><span class="info">{{cardInfo.giveMoney}}</span></p>
        <p><span class="title">{{ $t('Biz.Crm.CrmDeposit') }}</span><span class="info">{{cardInfo.deposit}}</span></p>
      </el-form-item>
      <el-form-item class="back-warp" label-width="0">
        <!-- $t-可退款金额： -->
        <p class="danger-tip">{{ $t('Biz.Crm.CrmTip01') }}<span class="info">{{cardInfo.backCardMoney}}</span></p>
        <!-- $t-(*可退款金额=余额-赠送金额+押金) -->
        <p class="formula-tip">{{ $t('Biz.Crm.CrmTip02') }}</p>
      </el-form-item>
      <el-form-item class="btn-warp" label-width="0">
        <button class="btn btn-default" type="button" @click="reset()">
          {{ $t('Biz.Crm.Reset') }}<span class="quick-tip">(PgUp)</span>
        </button>
        <button class="btn btn-primary" type="button" @click="submit()">
          {{ $t('Dict.Sure') }}<span class="quick-tip">(PgDn)</span>
        </button>
      </el-form-item>
    </template>
  </el-form>
</template>
<script>
import { isEmpty } from 'lodash';
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
      backcardForm: {
        cardnumber: '',
      },
      backcardRules: {
        cardnumber: [
          // { required: true, message: '请输入卡号或手机号', trigger: 'change' },
          { required: true, message: this.$t('Biz.Crm.CrmTip03'), trigger: 'change' },
        ],
      },
    };
  },
  mounted() {
    // 跨组件事件代理 处理显示'会员卡列表'组件返回的具体数据
    this.$von('crm6CardNoChangeBus', (data) => {
      this.$emit('change', data);
      this.backcardForm.cardnumber = data.cardNo;
    });
  },
  methods: {
    // 设置热键
    setCurrentHotkey() {
      this.$hotKey.set('Pos.Crm', {
        Enter: () => {
          this.readCard();
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
      if (isEmpty(this.backcardForm.cardnumber)) {
        this.$devices.Cardop.read((card) => {
          if (+card.returnCode === 0) {
            this.backcardForm.cardnumber = card.CardNo;
            this.loadCard();
          } else {
            // this.$message.error('读卡失败');
            this.$message.error(this.$t('Biz.Crm.CrmTip04'));
          }
        });
      } else {
        this.loadCard();
      }
    },
    loadCard() {
      // 号码为空 或 为手机号验证不通过时, 错误返回
      if (this.backcardForm.cardnumber === ''
        || ((`${this.backcardForm.cardnumber}`).length < 12
        && !(/^1[34578]\d{9}$/.test(this.backcardForm.cardnumber)))
      ) {
        // this.$message.error('查询号码有误，请重试');
        this.$message.error(this.$t('Biz.Crm.CrmTip05'));
        return false;
      }
      ajax('canyin.pos.crm.crmsalescounter.readcard', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.backcardForm.cardnumber,
        },
      }).then((data) => {
        if (data.success) {
          // 如果data.data不为空且cardList为空时, 查询的是一个卡号或只绑定一个卡的手机号, 执行唯一卡数据处理
          if (data.data && isEmpty(data.cardList)) {
            this.$emit('change', data.data);
            this.$message.success(data.msg);
          } else if (isEmpty(data.data) && !isEmpty(data.cardList) && data.cardList.length > 1) {
          // 如果 data.data为空且cardList不为空时,且cardList数组length > 1, 手机号绑定多个卡, 执行卡列表选择
            // 传参 list-多卡列表数据, callback-传入需要执行的回调, 无回调置空
            this.$parent.$refs.crmCardList.open({
              list: data.cardList,
              msg: data.msg,
              callback: (res) => {
                if (res.isTempCard !== '1') {
                  // this.$message.warning('该卡为正式卡，不允许退卡');
                  this.$message.warning(this.$t('Biz.Crm.CtmTip06'));
                }
              },
            });
          }
        } else {
          this.$message.warning(data.msg);
        }
      });
      return undefined;
    },
    // 重置表单
    reset() {
      this.$refs.backcardForm.resetFields();
      this.$emit('change', null);
      this.$refs.backcardNumber.focus();
    },
    // 提交退卡
    submitBackCard() {
      ajax('canyin.pos.crm.crmsalescounter.backcard', {
        contentType: 'paramsEncoded',
        data: {
          cardNo: this.cardInfo.cardNo,
          cardTypeId: this.cardInfo.cardTypeId,
          cardTypeName: this.cardInfo.cardTypeName,
        },
      }).then((data) => {
        if (data.success) {
          this.$message.success(data.msg);
          this.$refs.backcardForm.resetFields();
          this.$emit('change', null);
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
    },
    // 提交
    submit() {
      this.$refs.backcardForm.validate((valid) => {
        if (valid) {
          this.submitBackCard();
        } else {
          // this.$message.warning('请完善表单信息');
          this.$message.warning(this.$t('Biz.Crm.CrmTip07'));
          return false;
        }
        return undefined;
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
      width: 290px;
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
      font-weight: bold;
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
    .formula-tip{
      line-height: 2;
      font-size: 14px;
      color: #666;
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
