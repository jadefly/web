<template>
  <header class="pos-main-header">
    <button
      type="button"
      id="posMainNavBtn"
      class="pos-main-toggle-menu"
      @click="toggleNav"
    ><i class="icon icon-toggle-menu"></i></button>
    <h1 class="pos-main-brand" @click="toggleBrowser">
      <i
        class="icon logo-title"
        :class="[
        {tcsllogo:logoMode == 1},
        {zjlogo: logoMode == 2},
        {customlogo:logoMode == 0}]"
        :style="[customLogo]"></i>
      <strong v-html="title"></strong>
    </h1>
    <ul class="pos-main-header-nav" :class="{ active: showNav }">
      <li
        v-for="item in tmpModuleList"
        :key="item.moduleName"
        v-show="item.enable">
        <router-link
          :to="'/pos/' + item.moduleName"
          active-class="active"
          :ref="item.moduleName">
          <strong>{{ getName(item.moduleName) }}</strong>
          <span v-if="item.notifyCount" class="notify-tip">{{ item.notifyCount }}</span>
          <span class="hotKeyTip" v-if="!isHideHotKey">({{ item.hotKeyTip }})</span>
        </router-link>
      </li>
      <li>
        <a
          id="moreOperation"
          href="javascript:;"
          @click="more"
          v-autotest
        >
          <strong>{{ $t('Dict.Btn.More') }}</strong>
          <span class="hotKeyTip" v-if="!isHideHotKey">(Ctrl+F8)</span>
        </a>
      </li>
    </ul>
    <div class="pos-main-user" :class="{ active: showUser }">
      <a href="javascript:;"
        id="posMainUserBtn"
        @click="toggleUser">
        <span>Hi{{ userName }}</span>
        <i class="icon icon-arr-down"></i>
        <i class="icon icon-user"></i>
      </a>
      <ul>
        <li><a
          id="modifyPassword"
          href="javascript:;"
          @click="modifyPassword"
          :class="{
            'disableBtn': isServer('957', '176')
          }">{{ $t('Dict.ChangePassword') }}</a></li>
        <li>
          <a
            id="offWork"
            href="javascript:;"
            @click="offWork($event)"
            :class="{
              'disableBtn': getVuexPosMode === 2 || isServer('189', '174')
            }"
          >{{ $t('Dict.Btn.PosSerial') }}</a>
        </li>
        <!-- "PosSerial": "结班", -->
        <li v-if="getVuexPosMode == 2">
          <a
            id="logoffOrder"
            href="javascript:;"
            class="logout"
            @click="logoff"
          >{{ $t('Dict.Btn.Cancellation') }}</a>
        </li>
        <!-- "Cancellation": "注销", -->
        <li v-else>
          <a
            href="javascript:;"
            id="logoutOrder"
            class="logout"
            @click="logout"
          >{{ $t('Dict.Btn.SignOut') }}</a>
        </li>
      </ul>
    </div>
    <ManagerLog ref="managerLog"></ManagerLog>
  </header>
</template>

<script>
import { filter, take } from 'lodash';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import ajax from '@/common/js/ajax';
import { excluded } from '@/common/js/dom';

// 经理日记
const ManagerLog = (resolve) => {
  import('@/components/Pos/More/ManagerLog.vue').then((module) => {
    resolve(module);
  });
};

export default {
  data() {
    return {
      showUser: false, // User 列表列表打开状态
      showNav: false, // Nav 列表显示状态
      logoMode: null, // 产品logo标识
      takeoutCount: '', // 营业信息
      isFastFood: false, // 当前模式是否为快餐
      customLogo: null,
    };
  },
  props: ['moduleList', 'isOrdering'],
  components: {
    ManagerLog,
  },
  computed: {
    ...mapGetters([
      'posFastFood',
      'posBaseInfo',
      'posBooking',
      'posTakeout',
      'posCrm',
      'posDevice',
      'ALL_POS_MODULE',
      'posMember',
      'getVuexPosMode',
      'setting',
    ]),
    title() {
      return this.posBaseInfo ? this.posBaseInfo.title : this.$t('Dict.TCSL');
    },
    userName() {
      return this.posBaseInfo ? `，${this.posBaseInfo.user.name}` : null;
    },
    tmpModuleList() {
      const length = 6;
      if (this.getVuexPosMode === 3) {
        return take(filter(this.moduleList, item => item.moduleName !== 'booking'), length);
      }
      return this.moduleList.filter(item => item.enable);
    },
    isHideHotKey() {
      return this.getVuexPosMode === 3
        && this.posFastFood
        && this.posFastFood.fastFoodIsHiddenShortcutKeys;
    },
  },
  created() {
    ajax('canyin.sys.logo.getLogoImgMode').then((data) => {
      this.logoMode = data.logoImgMode;
      if (+this.logoMode === 0) {
        this.customLogo = {
          backgroundImage: `url(${window.location.origin}/custom/logo/logo.png)`,
        };
      }
    });
  },
  mounted() {
    this.headerTabsHotKey();
  },
  methods: {
    getName(moduleName) {
      const moduleNames = {
        order: this.$t('Biz.ModuleName.OrderDishes'),
        fastFood: this.$t('Biz.ModuleName.OrderDishes'),
        reserve: this.$t('Biz.ModuleName.ReserveDishes'),
        booking: this.$t('Biz.ModuleName.Booking'),
        takeout: this.$t('Biz.ModuleName.Takeout'),
        crm: this.$t('Dict.Member'),
        crm7: this.$t('Dict.Member'),
        member: this.$t('Biz.ModuleName.LgjMember'),
      };
      return moduleNames[moduleName];
    },
    bindGlobalClick() {
      window.onclick = (event) => {
        this.globalClick(event);
      };
    },
    // 专业浏览器下切换其他窗口
    toggleBrowser() {
      if (console) {
        console.info('TCSLCMD=ShowNextCy7Browser');
      }
    },
    // 快捷键 跳转路由
    headerTabsHotKey() {
      this.$hotKey.set('Pos', {
        // 点餐
        'F1.ctrl': () => {
          if (!this.isHideHotKey) {
            if (+this.getVuexPosMode === 3) {
              this.$router.push('/pos/fastFood');
            } else {
              this.$router.push('/pos/order');
            }
          }
        },
        // 预点
        'F2.ctrl': () => {
          if (!this.isHideHotKey) {
            this.$router.push('/pos/reserve');
          }
        },
        // 预订
        'F3.ctrl': () => {
          if (!this.isHideHotKey && this.posBooking.enable) {
            this.$router.push('/pos/booking');
          }
        },
        // 外卖
        'F4.ctrl': () => {
          if (!this.isHideHotKey && this.posTakeout.enable) {
            this.$router.push('/pos/takeout');
          }
        },
        // 会员6 - 会员7 - 荣管家会员
        'F5.ctrl': () => {
          if (!this.isHideHotKey) {
            if (this.setting.enableCrm) {
              this.$router.push('/pos/crm');
            } else if (this.setting.enableCrm7) {
              this.$router.push('/pos/crm7');
            } else if (this.posMember && this.posMember.enable) {
              this.$router.push('/pos/member');
            }
          }
        },
        // 更多
        'F8.ctrl': () => {
          if (!this.isHideHotKey) {
            this.$emit('more');
          }
        },
      });
    },
    // 父组件点击事件传入，判断点击焦点不是
    globalClick(event) {
      // 如果在 User 按钮外点击则关闭 User 下拉框
      excluded(event.target, '#posMainUserBtn', this.closeUser);
      // 如果在 Nav 按钮外点击则关闭下拉导航
      excluded(event.target, '#posMainNavBtn', this.closeNav);
    },
    // 切换 User 下拉框显示状态
    toggleUser() {
      this.showUser = !this.showUser;
    },
    // 关闭 User 下拉框
    closeUser() {
      this.showUser = false;
    },
    // 切换 下拉导航显示状态
    toggleNav() {
      this.showNav = !this.showNav;
    },
    // 关闭下拉导航
    closeNav() {
      this.showNav = false;
    },
    // 更多按钮
    more() {
      this.$emit('more');
    },
    // 修改密码
    modifyPassword() {
      if (!this.isServer('957', '176')) {
        ajax('canyin.pos.changePwd.changepwdView', {
          params: {
            loadmodule: 1,
            _t: (new Date()).getTime(),
          },
        }).then(() => {
          this.$emit('modifyPassword');
        });
      }
    },
    // 判断是否含有某个className
    hasClass(elements, cName) {
      return !!elements.className.match(new RegExp(`(\\s|^)${cName}(\\s|$)`)); // ( \\s|^ ) 判断前面是否有空格 （\\s | $ ）判断后面是否有空格 两个感叹号为转换为布尔值 以方便做判断
    },
    // 结班
    offWork(events) {
      // 修改只判断当前的dom是否还有className为disableBtn的时候是禁用状态不可操作的
      if (this.hasClass(events.srcElement, 'disableBtn')) {
        return false;
      }
      if (this.posFastFood.isWriteManagerDiary) {
        this.$refs.managerLog.open(null, {
          close: () => {
            this.$emit('offWork');
          },
        });
      } else {
        this.$emit('offWork');
      }
      return '';
    },
    // 获取cookie值
    getCookie(cname) {
      const name = `${cname}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i += 1) {
        const c = ca[i].trim();
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    },
    // 请求crm7的退出登录接口
    requestCrm7LoginOut() {
      const session = this.getCookie('CRMSESSIONID');
      $.ajax({
        url: `http://scrm.wuuxiang.com/crm7/login/${session}/logout.do`,
        async: true,
        type: 'GET',
        success(res) {
          if (res.errMessage) {
            this.$message.error(`${res.errMessage}`);
          }
        },
        error(err) {
          if (err.errMessage) {
            this.$message.error(`${err.errMessage}`);
          }
        },
      });
    },
    // 退出
    async logout() {
      // 排除掉快餐模式
      if (this.getVuexPosMode !== 3) {
        // 根据理由判断 当前是否处于正在加单操作
        if (this.$route.name === 'ordering') {
          this.$vemit('orderingConfirm', this.logoutHandle);
        } else {
          this.logoutHandle();
        }
      } else {
        this.$vemit('handleLoginOut', this.logoutHandle);
      }
      this.requestCrm7LoginOut();
      // await this.$confirm('此操作将清空未提交的品项, 是否继续?','提示',{
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning',
      //   // closeOnPressEscape: false,
      // });
      // 关闭所有的notify
    },
    // 注销 录单模式
    logoff() {
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.close();
      }
      this.$router.push('/desk');
      // const ENV = process.env;
      // if (ENV.NODE_ENV === 'development') {
      //   this.gotoLoginPager('/');
      // }
      // if (ENV.NODE_ENV === 'production') {
      //   this.gotoLoginPager(`${ENV.API_PATH}${ENV.DIST_PATH}/`);
      // }
    },
    // 路由跳转
    gotoLoginPager(href) {
      window.location.href = href;
    },
    // 退出需要操作的处理
    logoutHandle() {
      this.$emit('closeNotify');
      ajax('canyin.pos.reception.receptionbusiness.exitreceptionbusiness').then(() => {
        this.CLEAR_STATE_ON_LOGOUT();
        this.getShowPos({ list: false });
        this.getShowLogin({ list: false });
        this.getShowKaiban({ list: true });
        this.getIsLoginOrLogoutEnterKaiban({ list: false });// 退出登录打开开班页
        if (this.posDevice.enableVice) {
          this.$devices.SubMonitor.close();
        }
        this.$router.push('/desk');
      });
    },
    ...mapActions([
      'getShowPos',
      'getShowLogin',
      'getShowKaiban',
      'getIsLoginOrLogoutEnterKaiban',
    ]),
    ...mapMutations([
      'CLEAR_STATE_ON_LOGOUT',
    ]),
    isServer(name, type) {
      const changeUpdateItem = this.ALL_POS_MODULE.find(({ id }) => id === type);
      if (changeUpdateItem) {
        const changeUpdateList = changeUpdateItem.children;
        for (let i = 0, len = changeUpdateList.length; i < len; i += 1) {
          if (changeUpdateList[i].id === name) { // 未在后台选中，则置灰不可点
            return !changeUpdateList[i].checked;
          }
        }
      }
      return false;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "~@/common/less/scaffolding.less";

// Component Header

//== base text color
@pos-main-header-text-color: #999;
//== base font size
@pos-main-header-font-size: 16px;
//== background color
@pos-main-header-bg: rgba(0, 0, 0, 0.65);

//== brand

//** width
@pos-main-brand-width: 307px;
//** padding horizontal
@pos-main-brand-padding-horizontal: 10px;
//** font size
@pos-main-brand-font-size: @pos-main-header-font-size;
//** icon size
@pos-main-brand-icon-size: 40px;

//** flag

//**** size
@pos-main-brand-flag-size: 12px;
//**** height
@pos-main-brand-flag-height: 18px;
//**** padding horizontal
@pos-main-brand-flag-padding-horizontal: 5px;
//**** border radius
@pos-main-brand-flag-border-radius: 5px;
//**** background color
@pos-main-brand-flag-bg: #d22c41;

//== nav

//** space
@pos-main-header-nav-space: 1px;
//** item padding horizontal
@pos-main-header-nav-item-padding-horizontal: 35px;
//** item for large padding horizontal
@pos-main-header-nav-item-lg-padding-horizontal: 25px;
//** font size
@pos-main-header-nav-font-size: @pos-main-header-font-size;
//** text color
@pos-main-header-nav-text-color: @pos-main-header-text-color;
//** active circular flag size
@pos-main-header-nav-active-circ-size: 20px;

//== user

//** width for large
@pos-main-user-lg-width: 200px;
//** width
@pos-main-user-width: 44px;
//** text color
@pos-main-user-text-color: @pos-main-header-text-color;
//** font-size
@pos-main-user-font-size: @pos-main-header-font-size;
//** icon size
@pos-main-user-icon-size: 26px;

//** menu

//**** box shadow
@pos-main-user-menu-box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
//**** item border style
@pos-main-user-menu-item-border: 1px solid #c8c8c8;
//**** item height
@pos-main-user-menu-item-height: 24px;
//**** item padding vertical
@pos-main-user-menu-item-padding-vertical: 15px;
//**** item padding horizontal
@pos-main-user-menu-item-padding-horizontal: 50px;
//**** item font size
@pos-main-user-menu-item-font-size: 16px;
//**** logout button color
@pos-main-user-menu-logout-color: #f24f64;
//**** hover background color
@pos-main-user-menu-hover-bg: #e6f4ff;
//**** toggle button size
@pos-main-toggle-menu-size: 44px;

.pos-main-header {
  position: absolute;
  left: 0;
  top: 0;
  .size(100%, @pos-main-header-height);
  padding-left: @pos-main-brand-width + @pos-main-toggle-menu-size;
  padding-right: @pos-main-user-width;
  background-color: @pos-main-header-bg;

  @media screen and (min-width: @screen-sm-min) {
    padding-left: @pos-main-brand-width;
    padding-right: @pos-main-user-lg-width;
  }
}

.pos-main-toggle-menu {
  position: absolute;
  left: 0;
  top: 50%;
  .square(@pos-main-toggle-menu-size);
  margin-top: @pos-main-toggle-menu-size / -2;
  background: none;
  border: none;
  color: @white;

  > .icon {
    font-size: 20px;
  }

  @media screen and (min-width: @screen-sm-min) {
    display: none;
  }
}

.pos-main-brand {
  position: absolute;
  left: @pos-main-toggle-menu-size;
  top: 0;
  .size(@pos-main-brand-width, @pos-main-header-height);
  line-height: @pos-main-header-height;
  padding-left: 0;
  color: @white;
  font-size: @pos-main-brand-font-size;
  overflow: hidden;
  cursor: pointer;

  > .icon {
    font-size: @pos-main-brand-icon-size;
  }
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

  // > em {
  //   display: inline-block;
  //   height: @pos-main-brand-flag-height;
  //   line-height: @pos-main-brand-flag-height;
  //   padding-left: @pos-main-brand-flag-padding-horizontal;
  //   padding-right: @pos-main-brand-flag-padding-horizontal;
  //   border-radius: @pos-main-brand-flag-border-radius;
  //   background-color: @pos-main-brand-flag-bg;
  //   font-size: @pos-main-brand-flag-size;
  //   font-weight: normal;
  //   font-style: normal;
  //   vertical-align: middle;
  // }

  @media screen and (min-width: @screen-sm-min) {
    left: 0;
    padding-left: @pos-main-brand-padding-horizontal;
  }
}

.pos-main-header-nav {
  display: none;
  position: absolute;
  left: 0;
  top: @pos-main-header-height;
  z-index: 1;
  background-color: @pos-main-header-bg;

  > li {
    height: 50px;
    line-height: 50px;
    font-size: @pos-main-header-nav-font-size;
    text-align: center;

    > a {
      position: relative;
      display: inline-block;
      padding-left: @pos-main-header-nav-item-padding-horizontal;
      padding-right: @pos-main-header-nav-item-padding-horizontal;
      color: @pos-main-header-nav-text-color;
      height: 100%;
      .text-overflow();

      &.active {
        color: @white;
        .hotKeyTip {
          color: #aaa;
        }
        &:before {
          display: none;
          position: absolute;
          content: "";
          top: 50%;
          left: -2px;
          .square(@pos-main-header-nav-active-circ-size);
          margin-left: @pos-main-header-nav-active-circ-size / -2;
          margin-top: @pos-main-header-nav-active-circ-size / -2;
          background-color: @white;
          .img-circle();
        }
      }

      .hotKeyTip {
        position: absolute;
        bottom: 4px;
        left: 0;
        right: 0;
        margin: 0 auto;
        line-height: 1;
        transform: scale(0.9);
        font-size: 12px;
        color: #666;
      }
    }
  }

  &.active {
    display: block;
  }

  @media screen and (min-width: @screen-sm-min) {
    position: static;
    display: block;
    height: @pos-main-header-height;
    padding-top: @pos-main-header-nav-space;
    background-color: transparent;

    > li {
      float: left;
      height: 100%;
      line-height: @pos-main-header-height;

      > a {
        padding-left: @pos-main-header-nav-item-lg-padding-horizontal;
        padding-right: @pos-main-header-nav-item-lg-padding-horizontal;

        &.active > strong {
          text-shadow: 0 0 35px @white;
        }

        &.active:before {
          display: block;
          top: @pos-main-header-nav-active-circ-size / -2 - 2;
          left: 50%;
          margin-top: 0;
          margin-left: @pos-main-header-nav-active-circ-size / -2;
        }
      }
    }
  }
}

.pos-main-user {
  position: absolute;
  right: 0;
  top: 0;
  .size(@pos-main-user-width, @pos-main-header-height);

  > a {
    display: block;
    height: @pos-main-header-height;
    line-height: @pos-main-header-height;
    text-align: right;
    color: @pos-main-user-text-color;
    font-size: @pos-main-user-font-size;

    span {
      display: none;
      vertical-align: middle;
      width: 140px;
      text-align: right;
      overflow: hidden;
      line-height: 2;
      height: 30px;

      @media screen and (min-width: @screen-xs-min) {
        display: inline-block;
      }
    }

    > .icon {
      font-size: @pos-main-user-icon-size;

      &-user {
        display: inline-block;

        @media screen and (min-width: @screen-xs-min) {
          display: none;
        }
      }

      &-arr-down {
        display: none;

        @media screen and (min-width: @screen-xs-min) {
          display: inline-block;
        }
      }
    }
  }

  > ul {
    display: none;
    position: absolute;
    z-index: 10;
    top: @pos-main-header-height;
    right: 0;
    background-color: @white;
    .box-shadow(@pos-main-user-menu-box-shadow);

    > li {
      border-bottom: @pos-main-user-menu-item-border;

      > a {
        display: block;
        line-height: @pos-main-user-menu-item-height;
        padding-top: @pos-main-user-menu-item-padding-vertical;
        padding-bottom: @pos-main-user-menu-item-padding-vertical;
        padding-left: @pos-main-user-menu-item-padding-horizontal;
        padding-right: @pos-main-user-menu-item-padding-horizontal;
        font-size: @pos-main-user-menu-item-font-size;
        white-space: nowrap;
        font-weight: bold;
        text-align: center;

        &.logout {
          color: @pos-main-user-menu-logout-color;
        }

        &:hover {
          background-color: @pos-main-user-menu-hover-bg;
        }
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }

  &.active > a {
    color: @white;
  }

  &.active > ul {
    display: block;
  }

  @media screen and (min-width: @screen-xs-min) {
    .size(@pos-main-user-lg-width, @pos-main-header-height);
  }
}
.notify-tip{
  background-color: #e94646;
  color: #fff;
  padding: 2px 5px;
  border-radius: 6px;
  position: absolute;
  display: inline-block;
  min-width: 10px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  vertical-align: baseline;
  white-space: nowrap;
  text-align: center;
  top: 12px;
  right: 0;
}
.disableBtn {
  background: #ddd !important;
  color: #999 !important;
  cursor: not-allowed;
}

.lang-enUS {
  .pos-main-header-nav {
    > li {
      font-size: 14px
    }
  }
}
</style>
