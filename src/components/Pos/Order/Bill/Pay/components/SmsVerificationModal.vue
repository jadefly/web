<template>
  <Dialog
    name="PosDialog.PaySmsVerificationModal"
    @close="onClose"
    @open="onOpen"
    @submit="doVerify"
    :title="title"
    :disableSubmitBtn="!phone"
    ref="dialog"
    :hotkeys="SmsVerificationModal"
    :append-to-body="true"
    :showSubmit="true"
    :submit-text="$t('Biz.Settlement.Verification')"
    top="20vh"
    width="700px"
    id="posDialogSmsVerificationModal"
  >
  <button
    slot="other-button"
    type="button"
    class="btn btn-default"
    @click="passAndCredit('')"
  >
    {{$t('Biz.Settlement.SkipAndAccount')}}
  </button>
  <div class="PaySmsVerificationModal">
    <div class="list-area">
      <div class="item search-item">
        <div class="account">
          <span>{{$t('Dict.AccountName01')}}</span>
          <span class="name">{{ accountName }}</span>
        </div>
        <div class="verification">
          <div>
            <span class="verification-title">{{$t('Biz.Settlement.AccountVerificationPhone01')}}</span>
            <span v-if="!phone" class="error">{{ errorMsg }}</span>
            <span v-else>{{ phone }}</span>
          </div>
          <el-button
            type="button"
            class="btn code-btn"
            :disabled="phone ? isDisabled : 'disabled'"
            @click="sendPhoneCode">{{ btnText }}
          </el-button>
        </div>
        <div class="tip">
          <span v-if="!phone" class="error">{{$t('Biz.Settlement.ImproveInfo')}}</span>
          <span v-else>{{$t('Biz.Settlement.ModifyPhone')}}</span>
        </div>
        <div class="search" v-keyboard:keyboard="">
          <span>{{$t('Biz.Settlement.SMSCode')}}</span>
          <el-input
            v-model="phoneCode"
            :disabled="!phone"
            maxlength="4"
            :placeholder="$t('Biz.Settlement.EnterVerificationCode2')">
          </el-input>
        </div>
      </div>
    </div>
    <div class="money-area" v-keyboard:keyboard="">
      <div class="keybord-content">
        <KeyBoard class="keybord" ref="keyboard" :isDisabled="!phone"></KeyBoard>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      accountId: '',
      accountName: '', // 账号名称   从$props.data.currentPayout中获取
      phone: '', // 手机号  从$props.data.currentPayout中获取
      btnText: `${this.$t('Biz.Settlement.SendVerificationCode')}`, // 验证码按钮文字
      num: 60, // 倒计时事件
      isDisabled: false, // 发送验证码按钮控是否可点击
      timer: null, // 定时器
      phoneCode: '', // 验证码
      error: false, // 手机号是否有问题  从$props.data.currentPayout中获取
      errorMsg: `${this.$t('Biz.Settlement.Unfilled')}`, // 错误提示
    };
  },
  props: {
    /**
     * data 结构 { currentPayout，resData }
     * currentPayout-当前挂账账户信息
     * resData-支付信息
     * remark-备注
     * money-挂账金额
     * bsData-账单数据
     * verifySource-提交短信验证的来源: 'groupPayouts'-集团挂账
     */
    data: {
      type: Object, // unpaidSum - 信用额度， remainingSum - 余额
      default: null,
    },
    title: {
      type: String,
      default() {
        return this.$t('Biz.Settlement.SmsVerification');
      }, // 弹窗头部文字
    },
  },
  computed: {
    // 添加快捷键
    SmsVerificationModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.$vonce('authCode', (code) => {
        this.passAndCredit(code);
      });
      const { currentPayout } = this.data;
      if (!currentPayout) return;
      this.accountName = currentPayout.name;
      this.phone = currentPayout.validateMobile;
      this.accountId = currentPayout.id;
    },
    onClose() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.num = 60;
      this.isDisabled = false;
      this.btnText = `${this.$t('Biz.Settlement.SendVerificationCode')}`;
      this.phoneCode = '';
    },
    // 点击验证
    doVerify() {
      if (!/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(this.phone)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error33')}`);
        return;
      }
      if (!this.phoneCode) {
        this.$message.error(`${this.$t('Biz.Settlement.EnterVerificationCode')}`);
        return;
      }
      if (!+this.phoneCode) {
        this.$message.error(`${this.$t('Biz.Settlement.Error34')}`);
        return;
      }
      ajax('canyin.pos.settlement.pay.smsverify', {
        params: {
          id: this.accountId,
          code: this.phoneCode,
          validateMobile: this.phone,
        },
      }).then(() => {
        this.$message.success(`${this.$t('Biz.Settlement.Success13')}`);
        this.doCredit();
      });
    },
    // 点击跳过并挂账
    /**
     * 这里的code变为 data: { isFinger: true, authId: "29500000000000002" }
     * isFinger 是否是指纹识别  指纹识别是authId，手动输入是authCode
     * * */
    passAndCredit(authData = {}) {
      const baseParams = {
        validateMobile: this.data.currentPayout.validateMobile,
        money: this.data.money,
        bsId: this.data.bsData.id,
        uid: this.accountId,
        ...authData,
      };
      ajax('canyin.pos.settlement.pay.skipgz', {
        contentType: 'json',
        data: baseParams,
      }).then((res) => {
        if (+res.result === 1) {
          this.doCredit();
        } else if (+res.result === -2) { // 判断-2为没有权限 弹出授权框
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else {
          this.$message.error(`${this.$t('Biz.Settlement.Error35')}`);
        }
      });
    },
    // 挂账逻辑
    doCredit() {
      if (this.data.verifySource
        && this.data.verifySource === 'groupPayouts'
      ) {
        // 经过权限和或短信验证, 传值true执行挂账
        this.$emit('handleBackEndLogic', null, true);
      }
      this.$emit('addPayWay');
      this.close();
      this.$emit('parentClose');
    },
    sendPhoneCode() {
      this.isDisabled = true;
      if (!/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(this.phone)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error33')}`);
        this.isDisabled = true;
        return;
      }
      ajax('canyin.pos.settlement.pay.sendsmscode', {
        params: {
          id: this.accountId,
          validateMobile: this.phone,
        },
      }).then((res) => {
        this.$message.success(res);
        this.Countdown();
      });
      setTimeout(() => { // 这里加个30s定时器 是为了防止接口报错时，点击发送按钮一直处于无法点击状态
        this.isDisabled = false;
      }, 30000);
    },
    Countdown() {
      this.isDisabled = true;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        if (this.num > 0) {
          this.btnText = `${this.num}S`;
          this.num -= 1;
        } else {
          clearInterval(this.timer);
          this.btnText = `${this.$t('Biz.Settlement.Error36')}`;
          this.num = 60;
          this.isDisabled = false;
        }
      }, 1000);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.PaySmsVerificationModal{
  display: table;
  width: 100%;
  >* {
    display: table-cell;
    vertical-align: top;
  }
}
.list-area{
  position: relative;
  padding: 16px 30px 16px 16px;
  width: 466px;
  background-color: @white;
  border-right: 1px solid #ddd;
}
.item{
  display: table;
  width: 100%;
  >*{
    display: table-cell;
  }
  .payouts-money{
    font-size: 18px;
    color: #0babb9;
    font-weight: bold;
  }
  & + &{
    margin-top: 10px;
  }
}
.search-item{
  display: flex;
  flex-direction: column;
  & > div {
    padding: 8px 0;
  }
  .search{
    display: flex;
    align-items: center;
    & > span {
      width: 110px;
      font-size: 18px;
    }
    .el-input {
      flex: 1;
    }
  }
  .search-btn{
    padding-left: 8px;
    vertical-align: middle;
    button{
      width: 100%;
    }
  }
  .account {
    font-size: 18px;
    .name {
      margin-left: 15px;
    }
  }
  .verification {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0;
    .verification-title {
      font-size: 13px;
      font-weight: bold;
    }
    .code-btn {
      background: transparent;
      border: 1px solid #bbbbbb;
    }
    .error {
      color: red;
      font-size: 16px;
    }
  }
  .tip {
    padding-top: 0;
    font-size: 10px;
    color: #bbbbbb;
    .error {
      color: red;
      font-size: 16px;
    }
  }
}
.title{
  width: 78px;
  font-size: 14px;
}
.list{
  margin-bottom: 50px;
  .list-title{
    font-size: 14px;
    color: #333;
    line-height: 2.5;
    margin-top: 8px;
  }
  table{
    width: 100%;
  }
  th,td{
    padding-left: 6px;
    font-weight: normal;
  }
  .table-head{
    padding: 4px 0;
    background-color: #7bcad6;
    color: @white;
    th {
      font-size: 12px;
      line-height: 1.1;
    }
    th+th{
      border-left: 1px solid @white;
    }
  }
  .table-body{
    margin-top: 6px;
    color: @gray-dark;
    height: 260px;
    table{
      table-layout: fixed;
    }
    td{
      font-size: 12px;
      line-height: 1.5;
      padding: 8px 0 8px 8px;
    }
    tr{
      border-bottom: 1px solid #7bcad6;
      counter-increment: itemindex;
      vertical-align: middle;
      color: #333333;
    }
  }
  .no-col{
    width: 9.7%;
  }
  .name-col{
    width: 36%;
  }
  .quota-col{
    width: 16%;
  }
  .balance-col{
    width: 16%;
  }
  .status-col{
    width: 10.1%;
  }
  td.choose-col{
    text-align: center;
  }
  .account-checkbox{
    vertical-align: -6px;
  }
}
.no-item{
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding-top: 20px;
}
.tip-content{
  display: inline-block;
  font-size: 12px;
  img.document-icon{
    float: left;
    padding-right: 8px;
  }
  p{
    text-align: left;
    line-height: 36px;
    word-break:keep-all;
    white-space:nowrap;
  }
}

// 箭头按钮
.pos-takeout-pager {
  position: absolute;
  right: 12px;
  bottom: 12px;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
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

.money-area{
  background-color: #f5f5f5;
  .to-be-pay{
    padding: 0 12px;
    line-height: 52px;
    border-bottom: 1px dashed #b5b5b5;
    .content{
      text-align: right;
    }
  }
  .input-area{
    padding: 0 12px;
  }
  .pay-money{
    margin-top: 12px;
  }
  .remark-title{
    line-height: 2;
  }
  .keybord-content{
    margin: 20px 0;
    text-align: center;
  }
}
</style>
