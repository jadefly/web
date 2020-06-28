<template>
  <Dialog
    width="700px"
    name="PosDialog.ModifyPassword"
    :title="$t('Dict.ChangePassword')"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    @submit="submit"
    :hotkeys="hotKeySet"
  >
    <div class="modify-password-wrap">
      <!-- Tab标签 -->
      <div class="modify-tabs">
        <div v-for="(item,index) in modifyTabs" class="modif-tab-item" :key="index" :class="{'activetab':currentTab==item}" @click="toogleTabs(item)">{{item}}</div>
      </div>
      <!-- 修改密码 -->
      <form
        action="javascript:;"
        :id="psdFormId"
        class="form modify-password-form"
        ref="form"
        v-keyboard:keyboard
        v-if="currentTab==$t('Dict.Password')"
      >
        <div class="form-group">
          <label for="iOPwd">{{$t('Dict.OriginalPassword')}}</label>
          <input
            v-judge
            :type="viewPassword ? 'text' : 'password'"
            name="opwd"
            id="iOPwd"
            class="form-control"
            :placeholder="$t('Biz.Pos.PosMsg003')"
            required
            v-model="opwd"
          >
        </div>
        <div class="form-group">
          <label for="iNPwd">{{$t('Dict.NewPassword')}}</label>
          <input
            v-judge
            :type="viewPassword ? 'text' : 'password'"
            name="npwd"
            id="iNPwd"
            class="form-control"
            :placeholder="$t('Biz.Pos.PosMsg004')"
            required v-model="npwd"
          >
        </div>
        <div class="form-group">
          <label for="iRPwd">{{$t('Biz.Pos.PosMsg005')}}</label>
          <input
            v-judge
            :type="viewPassword ? 'text' : 'password'"
            name="rpwd"
            id="iRPwd"
            class="form-control"
            :placeholder="$t('Biz.Pos.PosMsg006')"
            required
            v-model="rpwd"
          >
        </div>
        <div class="form-group">
          <label @click="viewPassword = !viewPassword">{{$t('Dict.DisplayPassword')}}</label>
          <div class="form-control-static"><el-switch v-model="viewPassword" :style="{marginTop:'5px'}"></el-switch></div>
        </div>
      </form>
      <!-- 修改授权号 -->
      <form
        action="javascript:;"
        :id="athFormId"
        class="form modify-password-form modify-authcode-form"
        ref="form"
        v-keyboard:keyboard
        v-if="currentTab==$t('Dict.AuthorizationNumber')"
      >
        <div class="form-group">
          <label for="iOriAuthCode">{{$t('Dict.OriginalAuthorizationNumber')}}</label>
          <input
            v-judge
            :type="viewAuthCode ? 'text' : 'password'"
            name="origAuthCode"
            id="iOriAuthCode"
            class="form-control"
            :placeholder="$t('Biz.Pos.Common.InputEmpower1')"
            required
            v-model="origAuthCode"
          >
        </div>
        <div class="form-group">
          <label for="iNewAuthCode">{{$t('Dict.NewAuthorizationNumber')}}</label>
          <input
            v-judge
            :type="viewAuthCode ? 'text' : 'password'"
            name="newAuthCode"
            id="iNewAuthCode"
            class="form-control"
            :placeholder="$t('Biz.Pos.PosMsg008')"
            required v-model="newAuthCode"
          >
        </div>
        <div class="form-group">
          <label for="iConfirmAuthCode">{{$t('Biz.Pos.PosMsg009')}}</label>
          <input
            v-judge
            :type="viewAuthCode ? 'text' : 'password'"
            name="confirmAuthCode"
            id="iConfirmAuthCode"
            class="form-control"
            :placeholder="$t('Biz.Pos.PosMsg010')"
            required
            v-model="confirmAuthCode"
          >
        </div>
        <div class="form-group">
          <label @click="viewAuthCode = !viewAuthCode">{{$t('Biz.Pos.PosMsg011')}}</label>
          <div class="form-control-static"><el-switch v-model="viewAuthCode" :style="{marginTop:'5px'}"></el-switch></div>
        </div>
      </form>
      <div class="modify-password-keyboard">
        <KeyBoard ref="keyboard"></KeyBoard>
      </div>
    </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import $ from 'jquery';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  created() {
    this.handler = null;
  },
  data() {
    return {
      modifyTabs: [this.$t('Dict.Password'), this.$t('Dict.AuthorizationNumber')], // Tab标签
      currentTab: this.$t('Dict.Password'), // 当前Tab标签页
      psdFormId: 'modifyPasswordForm', // 密码表单ID
      athFormId: 'modifyAuthCodeForm', // 授权号表单ID
      opwd: '', // 原密码
      npwd: '', // 新密码
      rpwd: '', // 确认密码
      viewPassword: false, // 是否显示密码
      origAuthCode: '', // 原授权号
      newAuthCode: '', // 新授权号
      confirmAuthCode: '', // 确认授权号
      viewAuthCode: false, // 是否显示授权号
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submit();
        },
        Enter: () => {
          this.loopInputFocus();
        },
      };
    },
  },
  methods: {
    submit() {
      if (this.validate()) {
        if (this.currentTab == this.$t('Dict.Password')) {
          ajax('canyin.pos.changePwd.changePwd', {
            contentType: 'paramsEncoded',
            data: {
              origPwd: this.opwd, // 原密码
              newPwd: this.npwd, // 新密码
              confirmPwd: this.rpwd, // 确认密码
            },
          }).then((res) => {
            if (res.success) {
              this.$message.success(this.$t('Biz.Pos.PosMsg012'));
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          ajax('canyin.pos.changeauthcode.changeauthcode', {
            contentType: 'paramsEncoded',
            data: {
              origAuthCode: this.origAuthCode, // 原授权号
              newAuthCode: this.newAuthCode, // 新授权号
              confirmAuthCode: this.confirmAuthCode, // 确认授权号
            },
          }).then((res) => {
            if (res.success) {
              this.$message.success(this.$t('Biz.Pos.PosMsg013'));
            } else {
              this.$message.error(res.msg);
            }
          });
        }
        this.close();
      }
    },
    validate() {
      if (this.currentTab == this.$t('Dict.Password')) {
        if (this.opwd === '') {
          this.$message.error(this.$t('Biz.Pos.PosMsg003'));
          $('#iOPwd').focus();
          return false;
        }
        if (this.npwd === '') {
          this.$message.error(this.$t('Biz.Pos.PosMsg004'));
          $('#iNPwd').focus();
          return false;
        }
        if (this.rpwd !== this.npwd) {
          this.$message.error(this.$t('Biz.Pos.PosMsg014'));
          $('#iRPwd').focus();
          return false;
        }
      } else {
        if (this.origAuthCode === '') {
          this.$message.error(this.$t('Biz.Pos.PosMsg015'));
          $('#iOriAuthCode').focus();
          return false;
        }
        if (this.newAuthCode === '') {
          this.$message.error(this.$t('Biz.Pos.PosMsg008'));
          $('#iNewAuthCode').focus();
          return false;
        }
        if (!/^[0-9]+.?[0-9]*/.test(this.newAuthCode)) {
          this.$message.error(this.$t('Biz.Pos.PosMsg016'));
          $('#iNewAuthCode').focus();
          return false;
        }
        if (this.confirmAuthCode !== this.newAuthCode) {
          this.$message.error(this.$t('Biz.Pos.PosMsg017'));
          $('#iConfirmAuthCode').focus();
          return false;
        }
      }
      return true;
    },
    onOpen() {
      // 显示密码按钮 打卡重置
      this.viewPassword = false;
      // 显示授权码按钮 重置
      this.viewAuthCode = false;
      this.resetForm();
    },
    resetForm() {
      this.opwd = '';
      this.npwd = '';
      this.rpwd = '';
      this.origAuthCode = '';
      this.newAuthCode = '';
      this.confirmAuthCode = '';
      this.currentTab = this.$t('Dict.Password');
    },
    loopInputFocus() {
      let num = 0;
      const inputs = $(this.$refs.form.querySelectorAll('input.form-control'));
      inputs.each((index, element) => {
        if ($(element).is(':focus')) {
          if (index + 1 < inputs.length) {
            num = index + 1;
          } else {
            num = 0;
            $(this.$refs.form)[0].dispatchEvent(new Event('submit'));
          }
        }
      });
      if (inputs[0]) {
        inputs[num].focus();
      }
    },
    // 切换密码/授权号Tab标签
    toogleTabs(item) {
      this.currentTab = item;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.modify-password-wrap {
  position: relative;
  padding-right: 332px;
  font-size: 12px;
  > .modify-tabs{
    width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #fff;
    margin-bottom: 2px;

    > .modif-tab-item {
      display: block;
      width: 30%;
      float: left;
      cursor: pointer;
      font-weight: bold;
      text-align: center;
    }

    > .activetab{
      color: #039eac;
      border-bottom: 2px solid #039eac;
    }
  }
}

.modify-password-form {
  height: 360px;
  background-color: @white;
  padding-top: 30px;
  padding-left: 12px;
  padding-right: 15px;

  > .form-group {
    position: relative;
    margin-bottom: 12px;
    padding-left: 90px;

    > label {
      position: absolute;
      left: 0;
      top: 0;
      .size(90px, 44px);
      line-height: 44px;
      margin-bottom: 0;
      font-weight: normal;
      .text-overflow();
    }

    > .form-control {
      height: 44px;

      &:focus {
        border-color: @brand-primary;
        .box-shadow(inset 0 1px 5px #aff9ff);
      }
    }
  }
}

.modify-authcode-form > .form-group {
    padding-left: 100px;
    > label {
      .size(100px, 44px);
    }
}

.modify-password-keyboard {
  position: absolute;
  right: 0;
  top: 0;
  .size(332px, 100%);
  padding-top: 30px;
  padding-left: 45px;
}
.lang-enUS{
  .modify-password-wrap {
    font-size: 12px;
    > .modify-tabs{
      > .modif-tab-item {
        width: 30%;
      }
    }
  }
  .modify-password-form {
    > .form-group {
      > .form-control {
        font-size: 12px;
        padding: 6px;
      }
    }
  }
}
</style>
