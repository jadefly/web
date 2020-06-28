<template>
  <Dialog
    name="PosDialog.PayWayEasyLifeVerifyTypeModal"
    :title="$t('Dict.VerifyType')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="AddPayHotkey"
    :append-to-body="true"
    :closeByClickModel="false"
    :showSubmit="true"
    width="400px"
    height="450px"
    top="10vh">
    <div class="withdraw-big-cash" v-keyboard:keyboard>
      <div class="input-wrap">
        <div class="input" v-if="verifyType">
          <span>{{$t('Biz.Settlement.InputPw')}}</span>
          <el-input
            type="password"
            v-model="passWord">
          </el-input>
        </div>
        <div class="input" v-else>
          <span>{{$t('Biz.Settlement.SMSCode')}}</span>
          <el-input
            type="password"
            v-model="sMSCode">
          </el-input>
        </div>
      </div>
      <div class="keyboard-warp">
        <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
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
  name: 'PayWayEasyLifeVerifyTypeModal',
  // abstract: true,
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      passWord: '',
      sMSCode: '', // 验证码
      verifyType: 1, // 1 是密码 0 是发短信
      isApiCallBackClose: false, // 是否是接口回调成功后关闭的页面
    };
  },
  computed: {
    AddPayHotkey() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    verifyCode(params) {
      return ajax('canyin.pos.settlement.pay.twitterlifepayway.savetradecode', {
        contentType: 'diy',
        data: params,
      }).then((res) => {
        if (res.success) {
          this.isApiCallBackClose = true;
          this.close();
          this.$nextTick(() => {
            this.submit();
          });
        } else {
          this.$message.error(`${res.msg}`);
        }
      });
    },
    onOpen() {
      const { isPasswordOrMessage } = this.resData;
      this.verifyType = isPasswordOrMessage === 'sms' ? 0 : 1;
      this.isApiCallBackClose = false;
      // 每次进入, 默认选中输入内容
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    onClose() {
      if (!this.isApiCallBackClose) {
        this.$vemit('clearEasyLifeSettlePayWay');
      }
      this.passWord = '';
      this.sMSCode = '';
      this.verifyType = 1;
    },
    onSubmit() {
      const {
        verifyType, passWord, sMSCode, resData,
      } = this;
      const verifyCode = verifyType ? passWord : sMSCode;
      const tradeVerifyType = verifyType ? 'password' : 'sms';
      const data = `verifyCode=${(verifyCode)}&bsId=${resData.bsId}&tradeVerifyType=${tradeVerifyType}`;
      this.verifyCode(data);
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .withdraw-big-cash {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px 25px;
    .input-wrap {
      width: 100%;
      .input {
        display: flex;
        align-items: center;
        margin: 5px 0 20px 0;
        > span {
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        > div {
          flex: 1;
        }
        > button {
          margin-left: 10px;
        }
      }
    }

  }
</style>
<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input[type="number"]{
    -moz-appearance: textfield;
  }
</style>
