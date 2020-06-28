<template>
  <Dialog
    name="PosDialog.AuthCheck"
    :title="$t('Dict.Empower')"
    ref="dialog"
    width="400px"
    :showSubmit="true"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :hotkeys="hotKeySet">
    <div class="pos-dialog-content">
      <div class="auth-check-wrap">
        <p class="auth-check-message" v-html="message"></p>
        <div class="auth-check-input">
          <label for="iAuthCheckInput">{{ $t('Biz.Pos.Common.InputEmpower') }}</label>
          <input v-judge ref="iAuthCheckInput" @keyup="isCardInput" type="password" name="authCheckInput" id="iAuthCheckInput" class="form-control" v-model="authCheckCode">
        </div>
        <!-- 如果是开启了强制使用员工卡授权禁用虚拟键盘 -->
        <div class="auth-check-keyboard" :class="{ 'disabled': setting && setting.isAuthCardMandatory }">
          <keyboard-num type="large"></keyboard-num>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      message: '',
      authCheckCode: '',
      lastTime: null, // 输入框的时间
      nextTime: null, // 输入框的下一个时间
    };
  },
  computed: {
    ...mapGetters([
      'posInfo',
      'setting',
    ]),
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        Enter: () => {
          this.onSubmit();
        },
      };
    },
    // message() {
    //   return this.resData.message || ''
    // }
  },
  methods: {
    identifyEmpFingerPrint() {
      // isFingerprintMandatory 后台设置 优先使用指纹授权 1 为可以 0 为不可以
      if (this.posInfo.isFingerprintMandatory) {
        this.$devices.Fingerprint.identifyEmp((res) => {
          const { returnCode, FingerResult } = res;
          // returnCode为1的时候代表了成功0代表了失败
          if (+returnCode === 1) {
            setTimeout(() => {
              this.$vemit('authCode', {
                authId: FingerResult,
              });
            }, 1500);
            this.close();
          }
        });
      }
    },
    onOpen() {
      this.message = this.resData.message;
      this.authCheckCode = '';
      this.lastTime = null;
      this.nextTime = null;
      this.$nextTick(() => {
        this.$refs.iAuthCheckInput.focus();
      });
      this.$vonce('closeAuthCheck', () => {
        this.close();
      }, true);
      this.identifyEmpFingerPrint();
    },
    onClose() {
      this.$devices.Fingerprint.close();
    },
    // 强制使用员工卡授权
    isCardInput(event) {
      // isAuthCardMandatory是否开启了员工卡授权
      if (this.setting.isAuthCardMandatory) {
        const keycode = event.keyCode || event.which || event.charCode;
        this.nextTime = new Date();
        if (keycode !== 13 && this.lastTime) {
          // 非扫码
          if (!(this.nextTime - this.lastTime < 45)) {
            this.authCheckCode = '';
          }
        }
        this.lastTime = this.nextTime;
      }
    },
    onSubmit() {
      if (this.authCheckCode === '') {
        this.$message.error(this.$t('Biz.Pos.Common.NoEmpower'));
      } else {
        // 这个为了兼容下 新封装的axios, 把授权号和需要的请求用的url和方式数据传过去
        if (this.resData.callback) {
          this.resData.callback(this.authCheckCode, this.resData.requestData);
        } else {
          this.$vemit('authCode', {
            authCode: this.authCheckCode,
          });
        }
        this.lastTime = null;
        this.nextTime = null;
        this.close();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.auth-check-wrap {
  background-color: @white;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 10px;
}

.auth-check-message {
  line-height: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.auth-check-input {
  position: relative;
  padding-left: 100px;
}

.auth-check-input label {
  position: absolute;
  left: 0;
  top: 0;
  width: 100px;
  height: 34px;
  line-height: 34px;
  margin-bottom: 0;
}

.auth-check-keyboard {
  padding-top: 35px;
  padding-bottom: 35px;
  text-align: center;
  > .keyboard {
    margin-left: auto;
    margin-right: auto;
  }
  &.disabled {
    pointer-events: none;
    cursor: default;
    opacity: 0.6;
  }
}
</style>
