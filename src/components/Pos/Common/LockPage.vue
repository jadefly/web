<template>
  <div class="LockPage" :class="[transparentClass, {'displayNone': displayNone}]" ref="lockPage">
    <div :class="[transparentClass, 'login']" v-if="isShowLogin">
      <div class="title" v-if="!posBaseInfo.isTransparentLockScreen">
        <i class="lockicon"></i>
        <!-- $t-系统已锁定，进入请登录 -->
        <span>{{ $t('Biz.Pos.Common.LockPageTitle') }}</span>
      </div>
      <form action="javascript:;" v-keyboard:keyboard>
        <div class="user-password">
          <label @click="toggleStaffCard" class="num-password">
            <i class="icon" :class="{'icon-user1':!staffcardvalue, 'icon-cardb':staffcardvalue}"></i>
          </label>
          <!-- $t-请输入员工号码 -->
          <input type="text" v-judge name=""
            :placeholder="$t('Biz.Login.UserIdPlaceholder')" autocomplete="off"
            v-model="useNameValue" id="userName"  ref="useName"
            @keydown.enter.prevent="enterUseName"
            @focus="focusUseName()"/>
        </div>
        <div class="user-password">
          <label for="" class="num-password lockicon"></label>
          <!-- $t-请输入员工密码 -->
          <input type="password" v-judge name=""
            :disabled="staffcardvalue && active == 0"
            :placeholder="$t('Biz.Login.PasswordPlaceholder')"
            autocomplete="off" v-model="passWordValue"
            id="userPassword" ref="passWord"
            @focus="focusPassWord()"
            @keydown.enter.prevent="enterPassWord"/>
        </div>

        <div class="login-type">
          <!-- $t-记住员工代码 -->
          <span>{{ $t('Biz.Login.RememberUserId') }}</span>
          <el-switch v-model="staffnumber" active-color="#0babb9" inactive-color="#b5b5b5"></el-switch>
          <!-- $t-员工卡登录 -->
          <span class="staff-card">{{ $t('Biz.Login.UseUserCard') }}</span>
          <el-switch :disabled="cardLoginDisable"  v-model="staffcardvalue" active-color="#0babb9" inactive-color="#b5b5b5">
          </el-switch>
        </div>

        <input type="button" :value="$t('Dict.Btn.Login')" @click="goLogin" ref="goLogin" :disabled = "isClick" class="go-login">
        <KeyBoard ref="keyboard"></KeyBoard>
      </form>
    </div>
    <div class="lock-state" v-else>
      <i class="icon icon-login-password"></i>
      <!-- $t-系统已锁定，进入请登录 -->
      <h1>{{ $t('Biz.Pos.Common.LockPageTitle') }}</h1>
      <!-- $t-解锁 -->
      <button class="btn btn-primary" @click="onClickUnlock">{{ $t('Biz.Pos.Common.Unlock') }}</button>
    </div>
    <BussinessStarting
      ref="bussinessStartingLock"
      :isGroupEmp="false"
      :lockLoad="true"
      :unLockLoadFun="bussinessStartingCallback"
    ></BussinessStarting>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import BussinessStarting from '@/components/Index/UserDesktop/BussinessStarting/Index';
import ajax from '@/common/js/ajax';

export default {
  components: { KeyBoard, BussinessStarting },
  data() {
    return {
      displayNone: true,
      useNameValue: '', // 用户名value值
      passWordValue: '', // 密码框value值
      isSubmiting: false, // 是否正在提交, 避免多次按回车
      isClick: false, // 登录按钮是否可点
      sysChoose: 157,
      staffnumber: false,
      staffcardvalue: false,
      isEmpCardMandatory: false, // 是否强制使用员工卡登录(让员工卡登录按钮禁点)
      focusDom: null, // 记录当前获取焦点的元素
      active: 0,
      isShowLogin: false,
    };
  },
  computed: {
    ...mapGetters(['posDevice', 'posBaseInfo']),
    // 卡登陆是否Disable
    cardLoginDisable() {
      if (this.isEmpCardMandatory) { return true; }
      if (this.active === 0) { return false; }
      return true;
    },
    transparentClass() {
      const { isTransparentLockScreen } = this.posBaseInfo;
      if (isTransparentLockScreen) {
        return 'transparent';
      }
      return 'shanglong';
    },
  },
  created() {
    // 快捷键 全局初始化
    ajax('platform.login.login.login').then((data) => {
      if (data.isEmpCardMandatory) {
        this.staffcardvalue = true;
        this.isEmpCardMandatory = true;
      } else {
        this.staffcardvalue = false;
      }
    });
  },
  methods: {
    onClickUnlock() {
      this.isShowLogin = true;
    },
    open() {
      // 关闭开班弹窗
      this.$refs.bussinessStartingLock.closeKaiBan();
      // 根据设置选择锁屏方案
      const { isTransparentLockScreen } = this.posBaseInfo;
      if (isTransparentLockScreen) {
        this.isShowLogin = false;
      } else {
        this.isShowLogin = true;
      }
      // 快捷键禁用
      this.$hotKey.set('Pos.LockPage', {});
      this.$hotKey.stop();
      this.displayNone = false;
      // 初始化定位焦点
      this.$nextTick(() => {
        if (this.$refs.useName) {
          this.$refs.useName.focus();
        }
      });
    },
    close() {
      this.$hotKey.removeCurrentModule('Pos.LockPage');
      this.displayNone = true;
      this.$vemit('resetOrderSearchText');
    },
    // 切换是否使用员工卡
    toggleStaffCard() {
      if (this.cardLoginDisable) return;
      this.staffcardvalue = !this.staffcardvalue;
    },
    enterUseName() { // 回车操作
      if (this.useNameValue.replace(/[ ]/g, '') == '') {
        // this.$message.error('请输入员工号码');
        this.$message.error(this.$t('Biz.Login.UserIdMessage'));
        this.$refs.useName.focus();
      } else {
        // 员工卡登录的时候
        if (this.$refs.passWord.getAttribute('disabled')) {
          // 没有验证码的时候提交
          this.goLogin();
        } else {
          // 非员工卡登录的时候将焦点移到密码输入框
          this.$refs.passWord.focus();
        }
      }
    },
    enterPassWord() { // 回车操作
      if (this.passWordValue.replace(/[ ]/g, '') == '') {
        // this.$message.error('请输入员工密码');
        this.$message.error(this.$t('Biz.Login.PasswordMessage'));
        this.$refs.passWord.focus();
      } else {
        this.goLogin();
      }
    },
    checkSubmit() { // 验证输入框输入格式
      // 空串验证
      const trimRegex = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g;
      // passWordValue
      if (this.useNameValue.replace(trimRegex, '') == '') {
        // this.$message.error('请输入员工编号!');
        this.$message.error(this.$t('Biz.Login.UserIdMessage'));
        this.$refs.useName.focus();
        return false;
      }
      // 员工代码最大10位
      if (this.useNameValue.length > 10 && !this.$refs.passWord.getAttribute('disabled')) {
        // this.$message.error('员工代码最长为10位!');
        this.$message.error(this.$t('Biz.Pos.Common.CommTip10'));
        this.$refs.useName.focus();
        return false;
      }
      // 员工卡号最大30位
      if (this.useNameValue.length > 30 && this.$refs.passWord.getAttribute('disabled')) {
        // this.$message.error('员工卡号最长为30位!');
        this.$message.error(this.$t('Biz.Pos.Common.CommTip11'));
        this.$refs.useName.focus();
        return false;
      }
      // 只有非员工卡登陆时才验证密码。员工卡登陆没有密码
      if (!this.$refs.passWord.getAttribute('disabled')) {
        if (this.passWordValue.replace(trimRegex, '') == '') {
          // this.$message.error('请输入员工密码!');
          this.$message.error(this.$t('Biz.Login.PasswordMessage'));
          this.$refs.passWord.focus();
          return false;
        }
        // 员工密码最大20位
        if (this.passWordValue.length > 20) {
          // this.$message.error('员工密码最大20位!');
          this.$message.error(this.$t('Biz.Pos.Common.CommTip12'));
          this.$refs.passWord.focus();
          return false;
        }
      }
      return true;
    },
    goLogin() {
      // 首先验证用户名密码输入框输入限制是否正确
      if (!this.checkSubmit()) {
        return;
      }
      // 判断系统登录时间是否正确
      this.checkSystemTime(() => {
        if (!this.isSubmiting) { // 如果没有重复提交
          this.isSubmiting = true;// 提交中 不可再次提交
          this.isClick = true; // 登录按钮不可点击
          // this.$refs.goLogin.value = '正在登录中...';
          this.$refs.goLogin.value = this.$t('Biz.Pos.Common.CommTip13');
          // 是否选中记住员工逻辑
          // 是否记住员工代码 写入cookie
          if (this.staffnumber) { // 如果记住员工
            document.cookie = `loginedUsername=${this.useNameValue}; {expires:7}`;
          } else {
            document.cookie = 'loginedUsername=' + '';
          }
          // 登陆类型默认为用户名密码形式
          let loginType = 1;
          // 启用员工卡的时候设为员工卡类型
          // 登陆类型默认为用户名密码形式
          if (this.staffcardvalue) {
            loginType = 2;
          }
          // 启用员工卡的时候设为员工卡类型
          // 开始登录
          ajax('platform.login.login.loginCheck', {
            contentType: 'URLEncoded',
            data: {
              userName: this.useNameValue,
              passWord: this.passWordValue,
              checkCode: ' ',
              loginType,
            },
          }).then((data) => {
            // 登录之后可以再次登录
            this.isSubmiting = false;
            this.isClick = false;
            if (data.enableLogin) {
              // 登录成功 记录当前门店信息
              if (typeof console !== 'undefined') {
                console.info(`TCSLCMD=TcslShop,MsgText=当前门店：${data.shopId}-${data.shopName}`);
              }
              if (data.isGroupEmp) {
                // 是否为集团员工 默认为 false
                if (this.sysChoose == 157 || this.sysChoose == 900) { // 如果是集团员工判断当前处于什么模块,如果是前台营业和厨房管理则不能进入其他可以进入但需提示
                  // this.$refs.goLogin.value = '登录';
                  // this.$message.error('当前用户是集团员工不能登录此模块!');
                  this.$refs.goLogin.value = this.$t('Dict.Btn.Login');
                  this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg033'));
                  return;
                } // 后台管理和报表中心给提示但是可以登录进去
                // this.$message.error('当前用户是集团员工!');
                this.$message.error(this.$t('Biz.Pos.Common.CommTip14'));
              }
              // 使用 Ajax 请求时，response.addCookie 无法直接写入 Cookie，所以此处手写
              document.cookie = `TCSL_CANYIN_BIZ_CONTROL_MODE=${data.controlMode}; expires=365; path=/`;
              document.cookie = `TCSL_CANYIN_SYSCHOOSE=${this.sysChoose}; expires=365; path=/`;
              if (data.message) {
                this.$message.error(data.message);
              }
              ajax('canyin.pos.opening.page').then((val) => {
                if (!val.data.posStatus) { // 未开班
                  this.$refs.bussinessStartingLock.renderOpeningPage();
                  this.zero();
                } else {
                  this.bussinessStartingCallback();
                }
              });
            } else {
              // 登录失败
              // 清空用户名和密码
              this.zero();
              // 清空验证码输入框 暂无
              this.$message.error(data.message);
            }
          });
        }
      });
    },
    // 解锁登录处理函数【补开班回调函数】
    bussinessStartingCallback() {
      this.close();
      this.zero();
      this.$vemit('unlock');
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'reloadDataItem',
          result: [],
        });
      }
    },
    checkSystemTime(callback) {
      ajax('canyin.pos.checkSystemTime.doBiz').then((data) => {
        if (data.success) {
          callback();
        } else {
          // this.$message('当前系统时间可能有误，请调整后重新登录系统');
          this.$message(this.$t('Dict.SysTimeErrorMessage'));
        }
      });
    },
    focusUseName() { // 用户输入框获取焦点
      this.focusDom = 'useNameInput';
    },
    focusPassWord() { // 密码框获取焦点
      this.focusDom = 'passWordInput';
    },
    zero() {
      const username = this.getCookie('loginedUsername');
      if (username && username != 'null') {
        this.useNameValue = username;
        this.staffnumber = true;
        this.$refs.passWord.focus();
      } else {
        this.useNameValue = '';
        this.staffnumber = false;
        this.$refs.useName.focus();
      }
      // 注销后清除输入框密码
      // this.$refs.goLogin.value = '登录';
      this.$refs.goLogin.value = this.$t('Dict.Btn.Login');
      this.passWordValue = '';
    },
    getCookie(name) { // 获得cookie值
      const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
      const arr = document.cookie.match(reg);
      if (arr) {
        return unescape(arr[2]);
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .displayNone{
    display: none
  }
  .LockPage{
    width: 100%;
    height: 100%;
    position: fixed;
    background-size: 100% 100%;
    z-index: 800;
    top: 0;
    left: 0;
    &.transparent {
      background-image: url(~@/common/images/pos/lock/lock-transparent.png);
    }
    &.shanglong {
      background-image: url(~@/common/images/pos/lock/lock-login.jpg);
    }
  }
  .lock-state {
    position: absolute;
    top: 36%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    > .icon {
      font-size: 88px;
    }
    > h1 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 30px;
      margin-top: 6px;
    }
    > .btn {
      width: 140px;
      height: 46px;
      font-size: 16px;
    }
  }
  .login {
    position: absolute;
    top: 50%;
    width: 285px;
    border-radius: 10px;
    background-color: #dde6f7;
    &.transparent {
      left: 50%;
      transform: translate(-50%, -50%);
    }
    &.shanglong {
      right: 65px;
      margin-top: -265px;
    }
    .title{
      border-bottom: 1px dashed #999;
      height: 50px;
      padding: 15px;
      text-align: center;
      .lockicon {
        width: 20px;
        height: 20px;
        display: inline-block;
        margin-right: 5px;
        background: url(~@/common/images/pos/main/password2.png) no-repeat;
        background-size: 100%;
      }
      span{
        vertical-align: top;
        font-size: 15px;
        font-weight: bold;
        color: #666;
      }
    }
    > form {
      padding: 22px;
      > .user-password {
        position: relative;
        border: 1px solid #b5b5b5;
        width: 240px;
        height: 36px;
        border-radius: 18px;
        margin-bottom: 8px;
        padding-left: 50px;
        font-size: 14px;
        font-weight: 400;
        background-color: #fff;

        > .num-password {
          position: absolute;
          top: 7px;
          left: 17px;
          width: 16px;
          height: 18px;
          color: #b5b5b5;

          > .icon-cardb {
            font-size: 18px;
          }
        }

        > .lockicon {
          background-image: url(~@/common/images/pos/main/passwordicon.png);
          background-repeat: no-repeat;
          background-size: 100%;
        }
        > input {
          width: 175px;
          border: none;
          position: absolute;
          top: 2px;
          left: 50px;
          font-size: 14px;
          font-weight: 400;
          height: 30px;
          border-left: 1px solid #b5b5b5;
          padding-left: 8px;
          // color: #b6b6b6;
        }
      }
      > .go-login {
        width: 240px;
        height: 38px;
        margin-bottom: 10px;
        border: none;
        border-radius: 19px;
        background-color: #0babb9;
        font-size: 15px;
        color: #fff;
      }
    }
  }
  .login-type {
    margin-bottom: 8px;

    > .staff-card {
      margin-left: 12px;
    }
    > span {
      font-size: 12px;
      color: #333;
      font-weight: 400;
    }
  }
  .lang-enUS {
    .login .title span {
      font-size: 13px;
    }
  }
</style>
