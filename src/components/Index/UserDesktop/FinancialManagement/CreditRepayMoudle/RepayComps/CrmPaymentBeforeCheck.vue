<template>
  <Dialog
    name="PosDialog.CrmPaymentBeforeCheck"
    :append-to-body="true"
    :showSubmit="true"
    :hotkeys="hotkeys"
    :title="allTitle"
    @submit="onSubmit"
    @close="onClose"
    @open="onOpen"
    ref="dialog"
    top="12%"
    width="440px"
    height="260px"
  >
    <div class="warp">
      <!-- <div class="show-content" v-if="verifyType === 'all'">
        <p class="two-box">
          <input
            class="block input"
            type="text"
            v-model="smsInput"
            placeholder="请输入验证码">
          <button class="block btnRight btn btn-default">发送验证码</button>
        </p>
         <p class="two-box">
          <input
            style="90%"
            class="input longInput"
            type="text"
            v-model="pwdInput"
            placeholder="请输入6-12位密码">
        </p>
      </div> -->
      <!-- <p class="box" v-else-if="verifyType === 'sms'"></p> -->
      <p class="box" v-if="verifyType === 'sms'">
        <input
                class="block input"
                type="text"
                ref="sms"
                v-model="input"
                :placeholder="$t('Biz.Settlement.EnterVerificationCode')">
        <button
                class="block btnRight btn btn-default"
                @click="sendSMS">{{$t('Biz.Settlement.SendVerificationCode')}}
        </button>
      </p>
      <p class="box" v-else-if="verifyType === 'pwd'">
        <input
                class="input longInput"
                type="text"
                ref="pwd"
                v-model="input"
                :placeholder="$t('Biz.Settlement.EnterPw')">
      </p>
    </div>
  </Dialog>
</template>

<script>
  import ajax from '@/common/js/ajax';
  import Dialog from '@/components/Pos/Common/Dialog';
  import DialogMixin from '@/components/Pos/Common/DialogMixin';


  export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      allTitle: this.$t('Dict.VerifyType'),
      // 验证方式: all-所有,pwd-密码,sms-短信
      verifyType: 'pwd',
      // smsInput: '', // 密码+短信方式的验证码短信输入值
      // pwdInput: '', // 密码+短信方式的密码输入值
      input: '', // 密码或短息方式的输入值
    };
  },
  computed: {
    // 快捷键
    hotkeys() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        Enter: () => {
          this.readCard();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.verifyType = this.resData.type;
      setTimeout(() => {
        if (this.$refs.sms) {
          this.$refs.sms.focus();
        }
        if (this.$refs.pwd) {
          this.$refs.pwd.focus();
        }
      }, 40);
    },
    onClose() {
      // 参数重置
      this.verifyType = '';
      this.input = '';
    },
    // 短信验证码发送
    sendSMS() {
      // 接口地址是假的,骗你的
      ajax('canyin.pos.settlement.pay.crmPayWay.getmemberallcards', {
        params: {
          memberId: this.resData.memberId,
        },
      }).then((res) => {
        if (res.success) {
          if (res.data.code === 1) {
            this.$message.info(this.$t('Biz.UserDesktop.UserDesktopMsg074'));
          } else {
            this.$message.error(res.data.msg);
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 提交
    onSubmit() {
      if (!this.input && this.verifyType === 'pwd') {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg075'));
        return false;
      }
      if (!this.input && this.verifyType === 'sms') {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg076'));
        return false;
      }
      this.$emit('submitDone', this.input);
      this.close();
      return true;
    },
  },
};
</script>

<style lang="less" scoped>
.warp {
  width: 100%;
  height: 100%;
  // padding: 16% 0;
  background: #fff;

  .show-content {
    width: 100%;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }

  .box,
  .two-box {
    width: 80%;

    .block {
      display: inline-block;
    }

    .input {
      width: 228px;
      height: 36px;
      padding: 0 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      color: #333;
      font-size: 15px;
      font-weight: normal;
    }

    .longInput {
      width: 100%;
    }

    .btnRight {
      height: 36px;
      float: right;
      font-size: 16px;
    }
  }

  .two-box {
    margin: 0 auto 40px;
  }
  .box {
    margin: 0 auto;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
