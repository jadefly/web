<template>
  <el-form
    class="form-warp"
    :model="rechargeForm"
    :rules="rechargeRules"
    ref="rechargeForm"
    label-width="115px"
  >
    <el-form-item :label="$t('Biz.Crm.CardTelNum')" prop="cardnumber" class="card-input-warp">
      <el-input
        class="card-input"
        ref="rechargeNumber"
        v-model.trim="rechargeForm.cardnumber"
        v-judge
      >
      </el-input><button class="btn btn-primary" type="button" @click="readCard">
        {{ $t('Dict.CardReading') }}<span class="quick-tip">(Enter)</span>
      </button>
    </el-form-item>
    <template v-if="cardInfo">
      <!-- $t-充值金额： -->
      <el-form-item :label="$t('Biz.Crm.RechargeAmount')" prop="money">
        <el-input v-model.trim="rechargeForm.money" v-judge></el-input>
      </el-form-item>
      <!-- $t-支付类型： -->
      <el-form-item :label="$t('Biz.Crm.TypeOfPay')" prop="paytype" >
        <div class="paytype-input-warp">
          <div class="pay-type-item" v-for="item in payWayList" :key="item.key">
            <div class="pay-type" @click="changePayWay(item.key)"
            :class="{'active':rechargeForm.payway === item.key}">
              <img :src="item.icon">
              <span>{{item.title}}</span>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item class="btn-warp" label-width="0">
        <button class="btn btn-default" type="button" @click="reset">
          {{ $t('Biz.Crm.Reset') }}<span class="quick-tip">(PgUp)</span>
        </button>
        <button class="btn btn-primary" type="button" @click="submit">
          {{ $t('Dict.Sure') }}<span class="quick-tip">(PgDn)</span>
        </button>
      </el-form-item>
    </template>
  </el-form>
</template>
<script>
import { isEmpty } from 'lodash';
import ajax from '@/common/js/ajax';
import i18n from '@/locales/index';
import cashIconUrl from '@/common/images/sl-msg/ic_cash.png';
import alipayIconUrl from '@/common/images/sl-msg/ic_alipay.png';
import wechatIconUrl from '@/common/images/sl-msg/ic_wechat.png';
import cardIconUrl from '@/common/images/sl-msg/ic_card.png';

const validateMoney = (rule, value, callback) => {
  const money = Number(value);
  if (Number.isNaN(money)) {
    // callback(new Error('请输入正确数字'));
    callback(new Error(i18n.t('Dict.Validate.NumberMessage')));
  } else if (money <= 0 || money > 999999.99) {
    // callback(new Error('请输入大于0小于999999.99的数字'));
    callback(new Error(i18n.t('Biz.Crm.CrmTip12')));
  } else {
    callback();
  }
};

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
      payWayList: [{
        // title: '现金',
        title: this.$t('Biz.Crm.Cash'),
        icon: cashIconUrl,
        key: '10401',
      }, {
        // title: '支付宝',
        title: this.$t('Dict.Alipay'),
        icon: alipayIconUrl,
        key: '10425',
      }, {
        // title: '微信',
        title: this.$t('Dict.WeChat'),
        icon: wechatIconUrl,
        key: '10420',
      }, {
        // title: '银行卡',
        title: this.$t('Biz.Crm.BankCard'),
        icon: cardIconUrl,
        key: '10405',
      }],
      rechargeForm: {
        cardnumber: this.cardInfo ? this.cardInfo.cardNo : '',
        money: 0,
        payway: '10401',
      },
      rechargeRules: {
        cardnumber: [
          // { required: true, message: '请输入卡号或手机号', trigger: 'change' },
          { required: true, message: this.$t('Biz.Crm.CrmTip03'), trigger: 'change' },
        ],
        money: [
          // { required: true, message: '请输入充值金额', trigger: 'change' },
          { required: true, message: this.$t('Biz.Crm.CrmTip13'), trigger: 'change' },
          { validator: validateMoney, trigger: 'change' },
        ],
      },
    };
  },
  // 未知操作, 关联影响: 选择手机号查询的卡时, 有element-input组件验证报错, 暂注释不用
  // watch : {
  //   'cardInfo.cardNo' (cardNo) {
  //     this.rechargeForm.cardnumber = cardNo;
  //   }
  // },
  mounted() {
    // 跨组件事件代理 处理显示'会员卡列表'组件返回的具体数据
    this.$von('crm6CardNoChangeBus', (data) => {
      this.$emit('change', data);
      this.rechargeForm.cardnumber = data.cardNo;
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
      if (isEmpty(this.rechargeForm.cardnumber)) {
        this.$devices.Cardop.read((card) => {
          if (+card.returnCode === 0) {
            this.rechargeForm.cardnumber = card.CardNo;
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
      if (this.rechargeForm.cardnumber === ''
        || ((`${this.rechargeForm.cardnumber}`).length < 12
        && !(/^1[34578]\d{9}$/.test(this.rechargeForm.cardnumber)))
      ) {
        // this.$message.error('查询号码有误，请重试');
        this.$message.error(this.$t('Biz.Crm.CrmTip05'));
        return false;
      }
      ajax('canyin.pos.crm.crmsalescounter.readcard', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.rechargeForm.cardnumber,
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
            this.$parent.$refs.crmCardList.open({ list: data.cardList, callback: '' });
          }
        } else {
          this.$message.warning(data.msg);
        }
      });
      return undefined;
    },
    // 更改支付方式
    changePayWay(payway) {
      this.rechargeForm.payway = payway;
    },
    // 重置表单
    reset() {
      this.$refs.rechargeForm.resetFields();
      this.$emit('change', null);
      this.$refs.rechargeNumber.focus();
    },
    // 提交充值流程
    submitRecharge() {
      ajax('canyin.pos.crm.crmsalescounter.charge', {
        contentType: 'paramsEncoded',
        data: {
          cardNo: this.cardInfo.cardNo,
          chargeMoney: this.rechargeForm.money,
          payWayId: this.rechargeForm.payway,
          cardTypeId: this.cardInfo.cardTypeId,
          cardTypeName: this.cardInfo.cardTypeName,
          deposit: this.cardInfo.deposit,
        },
      }).then((data) => {
        if (data.success) {
          this.$message.success(data.msg);
          this.$refs.rechargeForm.resetFields();
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
      this.$refs.rechargeForm.validate((valid) => {
        if (valid) {
          this.submitRecharge();
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
  .paytype-input-warp{
    position: relative;
    left: -8px;
    margin: -8px -16px 0 0;
    .pay-type-item{
      display: inline-block;
      width: 33%;
      padding: 8px;
    }
    .pay-type{
      cursor: pointer;
      border: 1px solid #b5b5b5;
      border-radius: 7px;
      font-size: 16px;
      color: #666;
      line-height: 2.5;
      padding-left: 14px;
      position: relative;
      >*{
        vertical-align: middle;
      }
      &.active{
        border: 2px solid #0babb9;
        &::after{
          position: absolute;
          right: 0;
          top: -1.5px;
          content: url(~@/common/images/sl-msg/ic_choose.png)
        }
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
