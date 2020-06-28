<template>
  <div class="wrapper tcslbgimg">
    <!-- 登录页 开始 -->
    <div class="login-wrapper" v-if="isShowLogin">
      <div class="hearder">
        <div class="logo">
          <i
            class="logo-title"
            :class="[
              {tcsllogo:logoMode == 1},
              {zjlogo: logoMode == 2},
              {customlogo:logoMode == 0}
            ]"
            :style="[customLogo]"
          ></i>
          <span v-html="title"></span>
        </div>
        <ul class="hearder-content">
          <li>
            <span>{{$t('Biz.Login.ShopLabel')}}:</span>
            <span>{{ shopId }}-{{ shopName }}</span>
          </li>
          <li @click="closeBrowser">
            <div class="close-btn"></div>
          </li>
        </ul>
      </div>
      <div class="content">
        <div class="login">
          <form v-keyboard:keyboard>
            <div class="user-password">
              <label @click="toggleStaffCard" class="num-password">
                <i class="icon" :class="{'icon-user1':!staffcardvalue,
                 'icon-cardb':staffcardvalue}"></i>
              </label>
              <input
                type="text"
                name="username"
                :placeholder="$t('Biz.Login.UserIdPlaceholder')"
                autocomplete="off"
                v-model.trim="useNameValue"
                value=""
                id="userNumber"
                ref="useName"
                @focus="focusUseName()"
                @keydown.enter.prevent="enterUseName"
                v-judge
                v-autotest
              >
            </div>
            <div class="user-password">
              <label for="" class="num-password lockicon"></label>
              <input
                type="password"
                name="userpass"
                :disabled="staffcardvalue && sysChoose === modulePos"
                :placeholder="$t('Biz.Login.PasswordPlaceholder')"
                autocomplete="off"
                v-model.trim="passWordValue"
                value=""
                id="userPassword"
                ref="passWord"
                @focus="focusPassWord()"
                @keydown.enter.prevent="enterPassWord"
                v-judge
                v-autotest
              >
            </div>
            <ul class="functional-module" v-autotest v-if="false">
              <li
                v-for="item in list"
                :key="item.method"
                @click="toggleTabs(item.method)"
                :class="{ functionactive:sysChoose === item.method }"
                ref="activeBackGround"
              >
                <span :class="['qhbcmodule', whiteActive(item.method)]"></span>
                <a href="javascript:void(0)">{{ item.tab }}</a>
              </li>
            </ul>
            <div class="login-type">
              <span>{{$t('Biz.Login.RememberUserId')}}</span>
              <el-switch v-model="staffnumber" active-color="#0babb9" inactive-color="#b5b5b5">
              </el-switch>
              <span class="staff-card">{{$t('Biz.Login.UseUserCard')}}</span>
              <el-switch
                :disabled="cardLoginDisable"
                v-model="staffcardvalue"
                active-color="#0babb9"
                inactive-color="#b5b5b5"
              ></el-switch>
            </div>
            <ul
              v-if="languageList.length > 1"
              class="toggle-lang"
              :class="['col-' + languageList.length]"
            >
              <li v-for="item in languageList" :key="item.name">
                <a
                  href="javascript:;"
                  :class="{ 'checked': item.lang === locale }"
                  @click="toggleLang(item.lang)"
                >{{ item.text }}</a>
              </li>
            </ul>
            <button
              type="button"
              ref="goLogin"
              :disabled="isClick"
              class="go-login"
              @click="goLogin()"
              v-autotest
            >{{$t('Dict.Btn.Login')}}</button>
            <KeyBoard ref="keyboard" @chopstickenter="chopstickenter"></KeyBoard>
            <!--员工打卡开始-->
            <div v-if="punchIsOn" class="punch-clock">
              <div class="punch-clock-btn" @click="showPounchDialog = true">
                <img :src="pounchIcon[0]" alt="">
                <span>{{ $t('Biz.Login.StaffPunchCard') }}</span>
                <span> > </span>
              </div>
            </div>
            <!--员工打卡结束-->
          </form>
        </div>
      </div>
      <div class="footer">
        <ul>
          <li @click="downloadBrowsers">
            <a href="javascript:void(0)">{{$t('Biz.Login.DownloadBrowser')}}</a>
          </li>
          <li>|</li>
          <li @click="helpcenter">
            <a href="javascript:void(0)">{{$t('Biz.Login.HelpCenter')}}</a>
          </li>
          <li>|</li>
          <li @click="aboutus('AboutUs')">
            <a href="javascript:void(0)">{{$t('Biz.Login.AboutUs')}}</a>
          </li>
          <li>|</li>
          <li @click="aboutus('ContactUs')">
            <a href="javascript:void(0)">{{$t('Biz.Login.ContactUs')}}</a>
          </li>
          <li v-if="isBeta">|</li>
          <li v-if="isBeta" @click="thanks = true"><a href="javascript:;">特别鸣谢</a></li>
        </ul>
        <p v-html="$t('Dict.CopyrightText', [1998, 2020])"></p>
      </div>
    </div>
    <!-- 登录页 结束 -->
    <Thanks :thanks="thanks" @close="closeThanks"></Thanks>
    <!--打开弹出框开始-->
    <el-dialog
      :visible.sync="showPounchDialog"
      :close-on-click-modal="false"
      width="400px"
      top="35.5vh"
      center>
      <div class="pounch-dialog-body">
        <h3 v-show="!hasPunch">
          <img :src="pounchIcon[1]" alt="">
          {{ $t('Biz.Login.SwipeCardTips') }}
        </h3>
        <div class="has-punch"  v-show="hasPunch">
          <div class="punch-clock-success" v-show="punchStatus">
            <h3>
              <img :src="pounchIcon[2]" alt="">
              {{ $t('Biz.Login.SwipeCardSuccess') }}({{ num }}S)
            </h3>
            <div>
              <span>{{ $t('Biz.Login.UserName') }} <span>{{punchName}}</span></span>
              <span>{{ $t('Biz.Login.PunchTime') }} <span>{{punchTime}}</span></span>
            </div>
          </div>
          <div class="punch-clock-fail" v-show="!punchStatus">
            <h3>
              <img :src="pounchIcon[3]" alt="">
              {{ $t('Biz.Login.SwipeCardFail') }}({{ num }}S)
            </h3>
            <div>
              <span class="gray">{{ $t('Biz.Login.SwipeCardFailTips') }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <!--打卡弹出框结束-->
  </div>
</template>

<script>
import { now, map, find } from 'lodash';
import { mapGetters, mapMutations } from 'vuex';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import ajax from '@/common/js/ajax';
import punchIcon from '@/common/images/pos/main/punch-clock.png';
import failed from '@/common/images/pos/main/failed.png';
import success from '@/common/images/pos/main/success.png';
import pleasePunch from '@/common/images/pos/main/please-punch.png';
import browser from '@/common/js/browser';
import langTable from '@/common/dictionary/lang-table';
import Thanks from './Thanks';

const MODULEID_POS = '157';

export default {
  mixins: [dateFormatMixin],
  components: { KeyBoard, Thanks },
  data() {
    return {
      // 员工打卡弹出框开始456
      showPounchDialog: false,
      num: 5,
      punchName: '',
      punchTime: '',
      hasPunch: false,
      punchStatus: false,
      timer: null,
      punchAccount: '',
      pounchIcon: [punchIcon, pleasePunch, success, failed],
      browserVersion: '', // 当前电脑操作系统
      punchIsOn: false, // 员工打卡弹出框结束
      modulePos: MODULEID_POS,
      title: '天财商龙餐饮管理系统',
      isBeta: false,
      shopId: null, // 当前组织机构
      shopName: '',
      staffnumber: false,
      staffcardvalue: false,
      focusDom: null, // 记录当前获取焦点的元素
      isShowLogin: false, // 是否显示登录页
      logoMode: 1,
      isEmpCardMandatory: false, // 是否强制使用员工卡登录(让员工卡登录按钮禁点)
      now: now(),
      isSubmiting: false, // 是否正在提交, 避免多次按回车
      // 当前进入系统的 ID | 157：前台营业 1：后台管理 158：报表中心 900：厨房管理
      sysChoose: MODULEID_POS,
      useNameValue: '', // 用户名value值
      passWordValue: '', // 密码框value值
      isClick: false, // 登录按钮是否可点
      reqPath: '/canyin/pos/opening/dobizv2', // 快餐收银模式下的开班进入路径
      username: '', // 登陆后获取用户的名称
      thanks: false,
      customLogo: null,
      langList: [],
    };
  },
  computed: {
    ...mapGetters(['locale']),
    // 卡登陆是否Disable
    cardLoginDisable() {
      if (this.isEmpCardMandatory) { return true; }
      if (this.sysChoose === MODULEID_POS) { return false; }
      return true;
    },
    languageList() {
      return map(this.langList, lang => find(langTable, { lang }));
    },
  },
  created() {
    this.$vclean();
    this.$von('logout', () => {
      this.logout();
    });
    if (this.getCookie('TCSL_CANYIN_SYSCHOOSE')) {
      this.setActive(this.getCookie('TCSL_CANYIN_SYSCHOOSE'));
    }
    ajax('canyin.sys.logo.getLogoImgMode').then((data) => {
      this.logoMode = data.logoImgMode;
      if (+this.logoMode === 0) {
        this.customLogo = {
          backgroundImage: `url(${window.location.origin}/custom/logo/logo.png)`,
        };
      }
      // 员工代码
      if (this.getCookie('loginedUsername')) {
        this.useNameValue = this.getCookie('loginedUsername');
        this.staffnumber = true;
      }
    });
    ajax('platform.login.login.login').then((data) => {
      this.title = data.title;
      this.isBeta = data.isBeta;
      this.shopId = data.shopId;
      this.shopName = data.shopName;
      localStorage.setItem('currentShopInfo', JSON.stringify(data)); // 储存当前登录店铺信息，用于报表查询中巴庄火锅的显示头部店铺信息
      if (data.isEmpCardMandatory) {
        this.staffcardvalue = true;
        this.isEmpCardMandatory = true;
      } else {
        this.staffcardvalue = false;
      }
      this.langList = data.languageList;
      this.setLocale(data.currentLanguage);
    });
  },
  mounted() {
    this.requestPunchStatus();
    this.isShowLogin = true;
    // 每秒时间 + 1 实现时钟显示
    setInterval(() => {
      this.now += 1000;
    }, 1000);
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (vm.isShowLogin) {
        vm.bindLoginHotkeys();
      }
      if (from.name === 'deskIndex') {
        vm.clearUserInput();
      }
    });
  },
  methods: {
    ...mapMutations({
      setLocale: 'SET_LOCALE',
    }),
    toggleLang(languageCode) {
      ajax('canyin.sys.sysloginlanguage.saveloginlanguage', {
        contentType: 'URLEncoded',
        data: { languageCode },
      }).then((lang) => {
        this.setLocale(lang);
      });
    },
    closeThanks() {
      this.thanks = false;
    },
    // 员工打卡倒计时
    Countdown() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        if (this.num > 1) {
          this.num -= 1;
        } else {
          clearInterval(this.timer);
          this.num = 5;
          this.punchAccount = '';
          this.showPounchDialog = false;
        }
      }, 1000);
    },
    // 员工打卡怎么还手动输入？
    async observePounchkeyDownEvent(e) {
      const { num, punchStatus, hasPunch } = this;
      if (hasPunch && punchStatus && num > 1) return;
      const { key } = e;
      const licenseArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Enter'];
      if (licenseArray.indexOf(key) > -1) {
        if (Object.is(key, 'Enter')) {
          if (!this.punchAccount) return;
          const ajaxResponse = await this.requestPunch(this.punchAccount);
          if (ajaxResponse.data) {
            this.punchStatus = true;
            const { data } = ajaxResponse;
            this.punchName = data.name;
            this.punchTime = data.time;
            this.num = 5;
          } else {
            this.punchStatus = false;
            this.punchAccount = '';
          }
          this.hasPunch = true;
          this.Countdown();
        } else {
          this.punchAccount += key;
        }
      }
    },
    // 请求打卡的接口
    async requestPunch(cardId) {
      return ajax('canyin.pos.employeepunchtime.punchempcard', {
        params: { cardId },
      }).then(res => res).catch(() => null);
    },
    // 判断后台是否开启员工打卡设置
    requestPunchStatus() {
      ajax('canyin.pos.employeepunchtime.getpunchstatus').then((res) => {
        this.punchIsOn = res.on;
      });
    },
    // 绑定登录页快捷键
    bindLoginHotkeys() {
      this.$hotKey.removeCurrentModule('Opening');
      this.$hotKey.set('Login', {
        '*': (event) => {
          event.preventDefault();
          this.staffnumber = !this.staffnumber;
        },
        '/': (event) => {
          event.preventDefault();
          this.toggleStaffCard();
        },
      });
    },
    // 切换是否使用员工卡
    toggleStaffCard() {
      if (this.cardLoginDisable) return;
      this.staffcardvalue = !this.staffcardvalue;
    },
    toggleTabs(method) {
      // 切换标签时，重置员工卡登陆Switch
      if (this.sysChoose !== method) {
        if (method === MODULEID_POS && this.isEmpCardMandatory) {
          this.staffcardvalue = true;
        } else {
          this.staffcardvalue = false;
        }
      }
      this.setActive(method);
    },
    setActive(method) {
      this.sysChoose = method;
    },
    focusUseName() { // 用户输入框获取焦点
      this.focusDom = 'useNameInput';
    },
    focusPassWord() { // 密码框获取焦点
      this.focusDom = 'passWordInput';
    },
    enterUseName(name) { // 回车操作
      if (this.useNameValue === '') {
        this.$message.error(this.$t('Biz.Login.UserIdMessage'));
        if (name === 'username') {
          this.$refs.passWord.focus();
        } else if (name === 'userpass') {
          this.$refs.useName.focus();
        } else {
          this.$refs.useName.focus();
        }
      } else if (this.$refs.passWord.getAttribute('disabled')) { // 员工卡登录的时候
        // 没有验证码的时候提交
        this.goLogin();
      } else if (name === 'username') { // 非员工卡登录的时候将焦点移到密码输入框
        this.$refs.useName.focus();
      } else if (name === 'userpass') {
        this.$refs.passWord.focus();
      } else {
        this.$refs.passWord.focus();
      }
    },
    // 软键盘回车逻辑
    chopstickenter(name) {
      if (name === 'username') {
        this.enterUseName(name);
      } else {
        this.enterPassWord(name);
      }
    },
    enterPassWord(name) { // 回车操作
      if (this.passWordValue.replace(/[ ]/g, '') === '') {
        this.$message.error(this.$t('Biz.Login.PasswordMessage'));
        if (name === 'userpass') {
          this.$refs.useName.focus();
        } else if (name === 'username') {
          this.$refs.passWord.focus();
        } else {
          this.$refs.passWord.focus();
        }
      } else {
        this.goLogin();
      }
    },
    goLogin() {
      // 首先验证用户名密码输入框输入限制是否正确
      if (!this.checkSubmit()) {
        return false;
      }
      if (!this.isSubmiting) { // 如果没有重复提交
        this.isSubmiting = true;// 提交中 不可再次提交
        this.isClick = true; // 登录按钮不可点击
        this.$refs.goLogin.value = this.$t('Biz.Pos.Common.CommTip13');
        // 是否记住员工代码 写入cookie
        if (this.staffnumber) { // 如果记住员工
          document.cookie = `loginedUsername=${this.useNameValue}; {expires:7}`;
        } else {
          document.cookie = 'loginedUsername=';
        }
        // 是否选中记住员工逻辑
        // document.cookie = 'posUsername=' + this.useNameValue + '; path=/';
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
              // eslint-disable-next-line no-console
              console.info(`TCSLCMD=TcslShop,MsgText=当前门店：${data.shopId}-${data.shopName}`);
            }
            document.cookie = `TCSL_CANYIN_BIZ_CONTROL_MODE=${data.controlMode}; expires=365; path=/`;
            if (data.message) {
              // 当有剩余认证时间的提示时执行下面提示
              this.$alert(data.message, {
                confirmButtonText: this.$t('Dict.Sure'),
                callback: () => {
                  this.gotoUserDestop();
                },
              });
            } else {
              this.gotoUserDestop();
            }
          } else {
            // 登录失败
            // 清空用户名和密码
            this.passWordValue = '';
            // 清空验证码输入框 暂无
            this.$refs.passWord.focus();
            this.$refs.goLogin.value = this.$t('Dict.Btn.Login');
            this.$message.error(data.message);
          }
        }).catch((errCode, msg) => {
          this.$alert(msg);
          this.isSubmiting = false;// 提交中 不可再次提交
          this.isClick = false; // 登录按钮不可点击
          this.$refs.goLogin.value = this.$t('Dict.Btn.Login');
        });
      }
      return true;
    },
    gotoUserDestop() {
      this.$router.push('/desk');
    },
    logout() {
      // 注销
      ajax('platform.login.login.logout').then(() => {
        this.isShowLogin = true;
        // 读取用户名cookie值
        const username = this.getCookie('loginedUsername');
        if (username && username !== 'null') {
          this.useNameValue = username;
          this.staffnumber = true;
        } else {
          this.useNameValue = '';
          this.staffnumber = false;
        }
        // 注销后清除输入框密码
        this.passWordValue = '';
      }).catch(() => {
        this.$message.error(this.$t('Biz.Login.LogoutError'));
      });
    },
    clearUserInput() {
      const username = this.getCookie('loginedUsername');
      if (username && username !== 'null') {
        this.useNameValue = username;
        this.staffnumber = true;
      } else {
        this.useNameValue = '';
        this.staffnumber = false;
      }
      // 注销后清除输入框密码
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
    // 验证输入框输入格式
    checkSubmit() {
      if (this.useNameValue === '') {
        this.$message.error(this.$t('Biz.Login.UserIdMessage'));
        this.$refs.useName.focus();
        return false;
      }
      // 员工代码最大10位
      if (this.useNameValue.length > 10 && !this.$refs.passWord.getAttribute('disabled')) {
        this.$message.error(this.$t('Biz.Pos.Common.CommTip10'));
        this.$refs.useName.focus();
        return false;
      }
      // 员工卡号最大30位
      if (this.useNameValue.length > 30 && this.$refs.passWord.getAttribute('disabled')) {
        this.$message.error(this.$t('Biz.Pos.Common.CommTip11'));
        this.$refs.useName.focus();
        return false;
      }
      // 只有非员工卡登陆时才验证密码。员工卡登陆没有密码
      if (!this.$refs.passWord.getAttribute('disabled')) {
        if (this.passWordValue === '') {
          this.$message.error(this.$t('Biz.Login.PasswordMessage'));
          this.$refs.passWord.focus();
          return false;
        }
        // 员工密码最大20位
        if (this.passWordValue.length > 20) {
          this.$message.error(this.$t('Biz.Pos.Common.CommTip12'));
          this.$refs.passWord.focus();
          return false;
        }
      }
      return true;
    },
    downloadBrowsers() {
      window.location.href = `${process.env.API_PATH}/canyin/index/browser/browser`;
    },
    helpcenter() {
      ajax('canyin.index.index.geturlbyto', {
        contentType: 'json',
        params: {
          to: 'help',
        },
      }).then((data) => {
        if (data.success) {
          const path = data.data;
          // eslint-disable-next-line no-console
          console.info(`TCSLCMD=OpenURL(${path})`);
        }
      });
    },
    aboutus(type) {
      ajax('platform.login.login.login').then(() => {}).then((res) => {
        if (type === 'AboutUs') {
          // eslint-disable-next-line no-console
          console.info(`TCSLCMD=OpenURL(${res.AboutUs})`);
        }
        if (type === 'ContactUs') {
          // eslint-disable-next-line no-console
          console.info(`TCSLCMD=OpenURL(${res.ContactUs})`);
        }
      });
    },
    closeBrowser() {
      if (typeof (console) !== 'undefined') {
        // eslint-disable-next-line no-console
        console.info('TCSLCMD=CloseBrowser');
      }
      // 调用安卓的api
      if (browser.isAndroid() || browser.isIPad()) {
        window.JsCy7.CloseWeb();
      }
    },
  },
  watch: {
    showPounchDialog(newVal) {
      if (newVal) {
        window.addEventListener('keydown', this.observePounchkeyDownEvent, false);
      } else {
        window.removeEventListener('keydown', this.observePounchkeyDownEvent, false);
        clearInterval(this.timer); // 清除倒计时
        this.num = 5;
        this.punchAccount = '';
        this.hasPunch = false;
      }
    },
    isShowLogin(val) {
      if (val) {
        setTimeout(() => {
          this.bindLoginHotkeys();
        }, 100);
      } else {
        this.$hotKey.removeCurrentModule('Login');
      }
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  * {
    margin: 0;
    padding: 0;
    list-style: none;
    text-decoration: none;
  }
  .tcslbgimg {
    background-image: url(~@/common/images/pos/main/login.jpg);
  }
  .zjbgimg {
    background-image: url();
  }
  .custombgimg {
    background-image: url();
  }
  .wrapper {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: center center;
    background-color: #001228;

    > .login-wrapper {
      > ul::after {
        content: "";
        display: block;
        clear: both;
      }

      > .hearder {
        position: relative;
        min-width: 1024px;
        height: 65px;
        padding-left: 400px;
        font-size: 16px;
        font-weight: bolder;
        color: #fff;
        background-image: url(~@/common/images/pos/main/bgnav.png);

        .user-destop {
          position: absolute;
          top: 20px;
          right: 330px;
        }

        > .logo {
          position: absolute;
          top: 50%;
          left: 0;
          width: 400px;
          height: 30px;
          margin-top: -15px;
          padding-left: 17px;

          > .logo-title {
            width: 40px;
            height: 40px;
            display: inline-block;
          }
          > .tcsllogo {
            background-image: url(~@static/img/btcsllogo.png);
            background-repeat: no-repeat;
            background-size: 100%;
          }
          > .zjlogo {
            background-image: url(~@static/img/zjlogo.png);
            background-repeat: no-repeat;
            background-size: 100%;
          }
          > .customlogo {
            background-repeat: no-repeat;
            background-size: 100% 100%;
          }
          > span {
            display: inline-block;
            height: 40px;
            line-height: 40px;
            vertical-align: top;
            width:255px;
            overflow:hidden;
          }
        }
        > .hearder-content {
          position: absolute;
          top: 50%;
          right: 0;
          height: 44px;
          margin-top: -22px;

          > li {
            float: left;
          }
          > li:first-child {
            line-height: 44px;
            padding-right: 20px;
            font-size: 15px;
            text-align: center;
            border-right: 1px solid #4a5b7f;
          }
          > li:nth-child(2) {
            width: 64px;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 11px;
            padding-bottom: 11px;
            line-height: 44px;
            border-right: 1px solid #4a5b7f;
            cursor: pointer;

            > .fullscreen {
              width: 22px;
              height: 22px;
              background-image: url(~@/common/images/pos/main/qp.png);
              background-repeat: no-repeat;
            }
            > .fullscreen:hover {
              width: 22px;
              height: 22px;
              background-image: url(~@/common/images/pos/main/qp1.png);
              background-repeat: no-repeat;
            }
            > .smallerscreen {
              width: 24px;
              height: 22px;
              background-image: url(~@/common/images/pos/main/qxqp.png);
              background-repeat: no-repeat;
            }

            > .smallerscreen:hover {
              width: 24px;
              height: 22px;
              background-image: url(~@/common/images/pos/main/qxqp1.png);
              background-repeat: no-repeat;
            }
          }
          > li:last-child {
            width: 64px;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 11px;
            padding-bottom: 11px;
            line-height: 44px;
            cursor: pointer;
            > .close-btn {
              width: 22px;
              height: 22px;
              background-image: url(~@/common/images/pos/main/close.png);
              background-repeat: no-repeat;
            }
            > .close-btn:hover {
              width: 22px;
              height: 22px;
              background-image: url(~@/common/images/pos/main/close1.png);
              background-repeat: no-repeat;
            }
          }
        }
      }
      > .content {
        margin: 0 auto;
        padding-right: 510px;

        > .login {
          position: absolute;
          top: 46.5%;
          right: 65px;
          width: 285px;
          border-radius: 10px;
          margin-top: -265px;
          padding-top: 22px;
          padding-left: 20px;
          padding-right: 6px;
          padding-bottom: 18px;
          background-color: #dde6f7;
          > form {
            > .user-password {
              position: relative;
              border: 1px solid #b5b5b5;
              width: 240px;
              height: 36px;
              border-radius: 18px;
              margin-bottom: 8px;
              padding-left: 50px;
              padding-right: 18px;
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

              // > .usericon {
              //   background-image: url(~@/common/images/pos/main/usernumbericon.png);
              //   background-repeat: no-repeat;
              //   background-size: 100%;
              // }
              > input {
                border: none;
                top: 2px;
                left: 50px;
                font-size: 14px;
                font-weight: 400;
                height: 30px;
                border-left: 1px solid #b5b5b5;
                padding-left: 8px;
                display: block;
                width: 100%;
              }
            }

            > .functional-module {
              border: 1px solid #b5b5b5;
              border-radius: 5px;
              width: 238px;
              height: 58px;
              margin-top: 10px;
              margin-bottom: 18px;
              background-color: #fff;
              > li::after {
                position: absolute;
                top: 7px;
                right: -1px;
                content: "";
                height: 42px;
                border: 0.5px solid #e0e2e7;
                display: inline-block;
              }
              > li:last-child::after {
                display: none;
              }

              > li {
                position: relative;
                float: left;
                width: 59px;
                text-align: center;
                line-height: 58px;
                cursor: pointer;
                > a {
                  font-size: 10px;
                  color: #747678;
                }
                > .qhbcmodule {
                  margin: 9px auto 4px auto;
                  width: 24px;
                  height: 24px;
                  display: block;
                  background-repeat: no-repeat;
                  background-size: 100%;
                }

                > .qtyingye {
                  background-image: url(~@/common/images/pos/main/qiantaiyingye.png);
                }
                > .htguanli {
                  background-image: url(~@/common/images/pos/main/houtaiguanli.png);
                }
                > .bbzhongxin {
                  background-image: url(~@/common/images/pos/main/baobiaozhongxin.png);
                }
                > .cfguanli {
                  background-image: url(~@/common/images/pos/main/chufangguanli.png);
                }
                > .aqtyingye {
                  background-image: url(~@/common/images/pos/main/qiantaiyingye1.png);
                }
                > .ahtguanli {
                  background-image: url(~@/common/images/pos/main/houtaiguanli1.png);
                }
                > .abbzhongxin {
                  background-image: url(~@/common/images/pos/main/baobiaozhongxin1.png);
                }
                > .acfguanli {
                  background-image: url(~@/common/images/pos/main/chufangguanli1.png);
                }

                > a {
                  height: 12px;
                  display: block;
                  line-height: 12px;
                }
              }

              > .functionactive {
                height: 58px;
                background-color: #0babb9;
                > a {
                  color: #fff;
                }
              }
            }
            > .login-type {
              margin-bottom: 8px;

              > .staff-card {
                margin-left: 8px;
              }
              > span {
                font-size: 12px;
                color: #333;
                font-weight: 400;
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
        .punch-clock {
          position: absolute;
          bottom: -40px;
          right: 0;
          cursor: pointer;
          text-align: center;
          background-color: #dde6f7;
          height: 36px;
          width: 285px;
          border-radius: 5px;
          > div {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            >span:nth-child(2) {
              margin: 0 5px;
            }
          }
        }
      }

      > .footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 80px;
        padding-top: 8px;
        background-image: url(~@/common/images/pos/main/footernav.png);

        > ul::after {
          content: "";
          display: block;
          clear: both;
        }
        > ul {
          margin: 0 auto;
          width: 100%;
          text-align: center;

          li {
            display: inline-block;
            height: 35px;
            line-height: 35px;
            padding-left: 10px;
            padding-right: 10px;

            > a {
              font-size: 12px;
              color: #fff;
            }

            &:nth-child(even) {
              color: #aca6ad;
            }
          }
        }

        > p {
          margin: 0 auto;
          width: 430px;
          height: 30px;
          line-height: 30px;
          padding-bottom: 8px;
          padding-left: 6px;
          font-size: 12px;
          color: #fff;
          font-weight: 400;
        }
      }
    }
    > .postype-wrapper {
      > .hearder {
        position: relative;
        min-width: 1024px;
        height: 65px;
        padding-left: 400px;
        font-size: 16px;
        font-weight: bolder;
        color: #fff;
        background-image: url(~@/common/images/pos/main/bgnav.png);

        > .logo {
          position: absolute;
          top: 50%;
          left: 0;
          width: 400px;
          height: 30px;
          margin-top: -15px;
          padding-left: 17px;

          > .logo-title {
            width: 40px;
            height: 40px;
            display: inline-block;
          }
          > .tcsllogo {
            background-image: url(~@static/img/btcsllogo.png);
            background-repeat: no-repeat;
            background-size: 100%;
          }
          .zjlogo {
            background-image: url(~@static/img/zjlogo.png);
            background-repeat: no-repeat;
            background-size: 100%;
          }
          > .customlogo {
            background-repeat: no-repeat;
            background-size: 100% 100%;
          }
          > span {
            display: inline-block;
            height: 40px;
            line-height: 40px;
            vertical-align: top;
            width: 255px;
            overflow:hidden;
          }
        }
      }
    }
  }
  .pounch-dialog-body {
    > .has-punch {
      > div {
        display: flex;
        flex-direction: column;
        > div {
          display: flex;
          flex-direction: column;
          margin: 20px auto;
          width: 250px;
          text-align: left;
          font-size: 16px;
          > span {
            color: #bbbbbb;
            text-align: center;
            > span {
              color: black
            }
          }
          > span:first-child {
            margin-bottom: 20px;
          }
        }
      }
    }
    .gray {
      color: #bbbbbb;
    }
    > h3 {
      padding: 20px 0;
    }
    h3 {
      text-align: center;
      font-size: 16px;
    }
    img {
      width: 35px;
      height: 35px;
    }
  }
  .toggle-lang {
    overflow: hidden;
    border-top: 1px solid #c8c8c8;
    padding-top: 5px;
    padding-bottom: 5px;

    > li {
      float: left;
      line-height: 24px;
      text-align: center;
      font-size: 12px;
      border-right: 1px solid #c8c8c8;

      &:last-child {
        border-right: none;
      }

      > a {
        display: inline-block;
        width: 100%;

        &.checked {
          color: #ce600a;
        }
      }
    }

    &.col-2 > li {
      width: 50%;
    }

    &.col-3 > li {
      width: 33.32%;
    }
  }
</style>
