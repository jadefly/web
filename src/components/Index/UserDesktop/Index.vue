<template>
  <div class="desktop-wrapper" id="gogo">
    <header>
      <div class="logo">
        <i class="logo-title"
        :class="[
          { 'tcsllogo': logoMode == 1 },
          { 'zjlogo': logoMode == 2 },
          { 'customlogo': logoMode == 0 },
        ]"
        :style="[customLogo]"
        ></i>
        <span v-html="title"></span>
      </div>
      <div class="about" @click="openVersionDialog">
        <i class="icon icon-about"></i>
        <span>{{$t('Biz.UserDesktop.VersionInfoTitle1')}}</span>
      </div>
      <div class="user">
        <span
          class="manager"
          :class="{ 'activemanager': isShow }"
          @click="togglemanager"
          id="desktopUserTip"
        >
          <i class="icon icon-user1"></i>
          <span>{{ deskPageBaseInfo.user.name }}</span>
          <i class="icon icon-pager-down"></i>
        </span>
        <ul class="pulldown-info" v-show="isShow">
          <li @click="modifyPassword">{{$t('Dict.ChangePassword')}}</li>
          <li @click="logout">{{$t('Dict.Btn.Cancellation')}}</li>
        </ul>
      </div>
    </header>
    <main>
      <ul class="moudle-list">
        <!-- 权限模块 -->
        <li
          v-for="moudle in desktopMoudle"
          :key="moudle.moduleId"
          @click="selectMoudle(moudle)"
          :class="{
            'close-btn': moudle.moduleId === COMPUTER_CLOSE_ID,
            'updateinfo-btn': moudle.moduleId === UPDATE_INFO_ID,
          }"
        >
          <svg class="svg" aria-hidden="true" v-if="moudle.svgName">
            <use :xlink:href="`#icon-${moudle.svgName}`"></use>
          </svg>
          <i class="icon" :class="moudle.iconName" v-if="moudle.iconName"></i>
          <span>{{ moudle.MoudleName }}</span>
        </li>
        <!-- 设备管理器模块 -->
        <li v-if="operationList.length > 0" @click="shortcutOperation()">
          <svg class="svg" aria-hidden="true">
            <use xlink:href="#icon-kuaijiecaozuo"></use>
          </svg>
          <el-popover
              style="float: right;margin-top: 50px"
              placement="right"
              trigger="manual"
              v-model="showTooltip"
              popper-class="customColor">
            <!-- 操作列表-->
            <div
              v-for="(operation, index) in operationList"
              :key="index"
              class="optionItem"
              :class="index !== operationList.length - 1 ? 'bottom-line' : ''"
              @click="optionClick(operation)"
            >
              <svg class="svg">
                <use v-if="operation === 1" xlink:href="#icon-fuwuguanliqi"></use>
                <use v-if="operation === 2" xlink:href="#icon-dayinfuwu"></use>
                <use v-if="operation === 3" xlink:href="#icon-wuxianjieshou"></use>
              </svg>
              <span
                v-if=""
                style="margin-left: 5px"
              >{{
                operation === 1
                  ? '服务管理器'
                  : operation === 2
                    ? '打印服务'
                    : '无线接收'
              }}</span>
            </div>
            <!-- 占位标签 -->
            <p slot="reference"></p>
          </el-popover>
          <i class="icon"></i>
          <span>快捷操作</span>
        </li>
      </ul>
    </main>
    <ModifyPassword ref="modifyPassword"></ModifyPassword>
    <BussinessStarting
      ref="bussinessStarting"
      :isGroupEmp="deskPageBaseInfo.isGroupEmp"
    ></BussinessStarting>
    <VersionInfoDialog
      ref="versionInfo"
      :versionInfo="deskPageBaseInfo.versionInfo"
    ></VersionInfoDialog>
    <UpdateInfoDialog ref="updateInfo"></UpdateInfoDialog>
    <CrmBindDialog ref="crmBindDialog" :crmBindStatus="false"></CrmBindDialog>
    <SupplyBindDialog ref="supplyBindDialog" :supplyBindStatus="false"></SupplyBindDialog>

    <!-- 右侧二维码 -->
    <transition name="slideR">
      <div class="ewm_box" v-show="ewmBoxShow">
        <ul class="ewm_top">
          <li v-for="(item, index) in ewmTab" :key="'ewm_'+index" :class="item.active?'on':''" @click="tabFn(index)"> {{ item.name }}</li>
        </ul>
        <ul class="ewm_img">
          <li class="ewm_gzh" v-show="ewmTab[0].active">
            <img src="static/img/ewm_gzh.jpg" alt=""/>
            <p>{{ $t('Dict.ewm.wxGzh') }}</p>
          </li>
          <li class="ewm_app" v-show="ewmTab[1].active">
            <img src="static/img/ewm_app.png" alt=""/>
            <p>{{ $t('Dict.ewm.APP') }}{{ $t('Dict.ewm.Download') }}</p>
          </li>
        </ul>
        <i class="btnClose" @click="ewmBoxShow=false"></i>
      </div>
    </transition>

  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import axios from 'axios';
import '@static/fonts/base/iconfont';
import {
  includes, map, cloneDeep, find,
} from 'lodash';
import ajax from '@/common/js/ajax';
import checkSystemTime from '@/common/js/checkSystemTime';
import { excluded } from '@/common/js/dom';
import i18n from '@/locales/index';
import langTable from '@/common/dictionary/lang-table';
import desktopMoudle from './base/desktop-moudle';
import BussinessStarting from './BussinessStarting/Index';
import userDesktopMinxin from './base/userDesktopMinxin';
import VersionInfoDialog from './VersionInfoDialog';
import UpdateInfoDialog from './UpdateInfoDialog';
import CrmBindDialog from './ParameterSetting/FastLoginModule/CrmBindDialog';
import SupplyBindDialog from './ParameterSetting/FastLoginModule/SupplyBindDialog';
import {
  BUSSINESS_START_ID,
  MNG_ID,
  REPORT_ID,
  KITCHEN_ID,
  COMPUTER_CLOSE_ID,
  UPDATE_INFO_ID,
} from './base/moudle-ids';

const ModifyPassword = (resolve) => {
  import('@/components/Pos/User/ModifyPassword').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    ModifyPassword,
    BussinessStarting,
    VersionInfoDialog,
    CrmBindDialog,
    SupplyBindDialog,
    UpdateInfoDialog,
  },
  mixins: [userDesktopMinxin],
  data() {
    return {
      ewmBoxShow: false, // 右侧二维码显示/隐藏
      desktopMoudle: [],
      isShow: false,
      toggleSystem: false,
      COMPUTER_CLOSE_ID,
      UPDATE_INFO_ID,
      showTooltip: false, // 是否弹出tooltip
      operationList: [], // 快捷操作列表
      ewmTab: [{
        name: this.$t('Dict.ewm.ThroughTrain'),
        active: true,
      }, {
        name: this.$t('Dict.ewm.APP'),
        active: false,
      }],
    };
  },
  computed: {
    ...mapGetters(['deskPageBaseInfo', 'config']),
  },
  beforeDestroy() {
    this.showTooltip = false;
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getModuleAuth();
      vm.globalClick();
      vm.$hotKey.set('UserDesktop', {});
      const { bussinessStarting } = vm.$refs;
      if (bussinessStarting.isshowKaiban) {
        bussinessStarting.closeKaiBan();
      }
    });
  },
  mounted() {
    this.ewmBoxShow = true;
  },
  activated() {
    this.ewmBoxShow = true;
  },
  deactivated() {
    this.ewmBoxShow = false;
  },
  methods: {
    ...mapMutations({
      setDeskPageAuthModules: 'SET_DESK_PAGE_AUTH_MODULES',
    }),
    tabFn(index) {
      this.ewmTab.forEach(item => item.active = false);
      this.ewmTab[index].active = true;
    },
    to(sysId) {
      const { cy7CenterUrl } = this.deskPageBaseInfo;
      const {
        shopId,
        code,
        password,
      } = this.deskPageBaseInfo.user;
      axios(`${cy7CenterUrl}/platform/login/login/getrandomstr`).then((res) => {
        const finded = find(langTable, { name: i18n.locale });
        const randomStr = res.data;
        if (randomStr) {
          window.location.href = `${cy7CenterUrl}/platform/login/login/shopaccesslogincheck?shopId=${shopId}&userName=${code}&passWord=${encodeURIComponent(password)}&subSys=${sysId}&randomStr=${randomStr}&sysLang=${finded.lang}`;
        }
      });
    },
    selectMoudle(moudle) {
      this.showTooltip = false;
      const path = moudle.routerPath;
      const { method, parameter } = moudle;
      if (path && path.length > 0) {
        this.checkRouter(path);
      } else if (this[method]) {
        if (parameter) {
          this[method](parameter);
        } else {
          this[method]();
        }
      }
    },
    checkRouter(path) {
      if (path === 'searchPrint') {
        this.$router.push({
          name: 'searchPrint',
          params: {},
        });
      } else {
        this.$router.push(`/desk/${path}`);
      }
    },
    toBussiness() {
      document.cookie = `TCSL_CANYIN_SYSCHOOSE=${BUSSINESS_START_ID}; expires=365; path=/`;
      if (this.deskPageBaseInfo.isGroupEmp) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg033'));
      } else {
        checkSystemTime().then(() => {
          this.$refs.bussinessStarting.renderOpeningPage();
        });
      }
    },
    toKitchen() {
      if (this.deskPageBaseInfo.isGroupEmp) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg033'));
      } else {
        this.gotoMoudle(KITCHEN_ID);
      }
    },
    toCRM() {
      this.gotoCrmOrSupplyMoudle('002');
    },
    toSupplyChain() {
      this.gotoCrmOrSupplyMoudle('003');
    },
    gotoCrmOrSupplyMoudle(productId) {
      ajax('canyin.desktop.bindingrelation.query', {
        contentType: 'URLEncoded',
        data: { productId },
      }).then((data) => {
        const { loginUrl } = data;
        if (loginUrl) {
          window.location.href = loginUrl;
        } else {
          if (productId === '002') {
            this.$refs.crmBindDialog.open({ isCrm7: false });
          }
          if (productId === '003') {
            this.$refs.supplyBindDialog.open();
          }
        }
      });
    },
    gotoMoudle(id) {
      document.cookie = `TCSL_CANYIN_SYSCHOOSE=${id}; expires=365; path=/`;
      if ((id === MNG_ID || id === REPORT_ID) && this.deskPageBaseInfo.isGroupEmp) {
        this.$message.warning(this.$t('Biz.Pos.Common.CommTip14'));
      }
      window.location.href = `${process.env.API_PATH}/canyin/index/index/choosesysdo?sysid=${id}`;
    },
    // 快捷操作
    shortcutOperation() {
      // 如果是快捷操作则弹出tooltip，其他不弹出
      this.showTooltip = !this.showTooltip;
    },
    // 点击快捷操作选项
    optionClick(operation) {
      this.$devices.DesktopButton.doOperation((data) => {
        if (data.list) {
          this.operationList = data.list;
          this.$log.info('快捷操作==', operation);
        }
      }, operation);
    },
    getModuleAuth() {
      ajax('canyin.desktop.userdesktop.page').then((data) => {
        const moduleIdArr = map(data.modules, obj => obj.moduleId);
        this.desktopMoudle = desktopMoudle().filter(item => includes(moduleIdArr, item.moduleId));
        this.desktopMoudle.push({
          MoudleName: '更新详情', iconName: 'icon-gengxinxiangqing', method: 'updateInfo', moduleId: 8888,
        });
        // 获取设备管理器 “快捷操作” 列表
        this.$devices.DesktopButton.getList((button) => {
          if (button.list) {
            this.operationList = button.list;
            this.$log.info('快捷操作列表', this.operationList);
          }
        });
        // 即将过期 提示续费
        if (data.expireTimeStr) {
          this.message = this.$message({
            dangerouslyUseHTMLString: true,
            showClose: true,
            type: 'warning',
            duration: 0,
            message: this.$t('Biz.UserDesktop.UserDesktopMsg192', [data.expireTimeStr]),
          });
        }
        this.setDeskPageAuthModules(cloneDeep(data));
      });
    },
    togglemanager() {
      this.isShow = !this.isShow;
    },
    modifyPassword() {
      this.closeUserTip();
      this.closeSystemTip();
      this.$refs.modifyPassword.open();
    },
    logout() {
      ajax('platform.login.login.logout').then(() => {
        this.closeUserTip();
        this.closeSystemTip();
        this.$router.push('/');
      });
    },
    // 父组件点击事件传入，判断点击焦点不是
    globalClick() {
      window.onclick = (event) => {
        // 如果在 User 按钮外点击则关闭 User 下拉框
        excluded(event.target, '#desktopUserTip', this.closeUserTip);
        // 如果在 System 按钮外点击则关闭下拉导航
        excluded(event.target, '#desktopSystemTip', this.closeSystemTip);
      };
    },
    closeUserTip() {
      this.isShow = false;
    },
    closeSystemTip() {
      this.toggleSystem = false;
    },
    closeComputer() {
      this.$confirm(this.$t('Biz.UserDesktop.UserDesktopMsg191'), this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        this.$devices.Shutdown.open();
      });
    },
    updateInfo() {
      this.$refs.updateInfo.open();
    },
    openVersionDialog() {
      this.$refs.versionInfo.open();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.desktop-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: url(./img/bg.jpg) no-repeat;
  background-size: cover;
  > header {
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
      > .zjlogo {
        background-image: url(~@static/img/zjlogo.png);
        background-repeat: no-repeat;
        background-size: 100%;
      }
      > .customlogo {
        background-image: url();
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

    > .about {
      position: absolute;
      right: 160px;
      top: 0;
      width: 80px;
      height: 100%;
      line-height: 65px;
      text-align: center;
      font-size: 16px;
      color: #939495;
      cursor: pointer;
      &:hover {
        color: white;
      }

      .icon-about {
        display: inline-block;
        vertical-align: middle;
        margin-top: 2px;
        font-size: 18px;
      }

      > span {
        display: inline-block;
        vertical-align: middle;
      }
    }

    > .user {
      > .activemanager {
        color: #fff !important;
      }
      > .pulldownactive {
        display: none;
      }
      > .pulldown-info {
        position: absolute;
        top: 65px;
        right: 0;
        box-shadow: 0px 0px 10px 0px #3c4950;

        > li {
          width: 160px;
          height: 55px;
          background-color: #fff;
          color: #333;
          text-align: center;
          line-height: 55px;
          cursor: pointer;
        }
        > li:hover {
          background-color: #defcff;
        }

        > li:first-child {
          border-bottom: 1px solid #d9d9d9;
        }
      }

      > .manager {
        position: absolute;
        top: 50%;
        right: 12px;
        margin-top: -14px;
        font-size: 16px;
        color: #939495;
        cursor: pointer;

        > .icon-user1 {
          vertical-align: baseline;
          font-size: 20px;
          margin-right: 5px;
        }
        > span {
          width: 80px;
          white-space:nowrap;
          overflow: hidden;
          display: inline-block;
          vertical-align: bottom;
        }

        > .icon-pager-down {
          margin-left: 10px;
        }
      }
    }
  }
  > main {
    padding: 120px 80px 0;
    flex-grow: 1;
    .moudle-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      > li {
        margin: 18px;
        cursor: pointer;
        text-align: center;
        > svg {
          width: 96px;
          height: 96px;
        }
        > span {
          display: block;
          font-size: 18px;
          line-height: 2;
          color: white;
        }
        &.close-btn {
          position: absolute;
          bottom: 0;
          left: 0;
          > i {
            display: inline-block;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            font-size: 20px;
            color: black;
            background-color: white;
          }
          > span {
            display: inline-block;
            font-size: 16px;
            color: white;
          }
        }
        &.updateinfo-btn{
          .close-btn;
          right: 0;
          left: unset;
          > i {
            font-size: 30px;
            color: white;
            background-color: unset;
          }
        }
      }
    }
  }

}
</style>
<style lang="less">
.customColor{
  background: #142945;
  opacity: 0.6;
  border: none;
  padding: 0;
  .popper__arrow {
    border-right-color: #142945 !important;
    border-left-color: #142945 !important;
  }
  .popper__arrow::after {
    border-right-color: #142945 !important;
    border-left-color: #142945 !important;
  }
  .optionItem {
    color: #ffffff;
    cursor: pointer;
    margin: 5px 15px;
    padding: 10px 0;
  }
  .bottom-line{
    border-bottom: 1px solid #284365;
  }
  svg {
    width: 18px;
    height: 18px;
  }
}

.ewm_box{
  position: fixed;
  right: 4px;
  top: 50%;
  z-index: 100;
  transform: translate(0, -50%);
  width: 160px;
  font-size: 12px;
  color: #fff;
  text-align: center;
  line-height: 2;
  transition: all .7s;
  .ewm_top {
    display: flex;
    > li { flex: 1;
      font-size: 14px;
      line-height: 36px;
      border-radius: 5px 5px 0 0;
      background: rgba(0,0,0,.2);
      &.on {background: rgba(0,0,0,.4);}
    }
  }
  .ewm_img{
    border-radius: 0 0 5px 5px;
    background: rgba(0,0,0,.4);
    padding: 20px 0;
    p { margin-top: 5px;}
  }
  img { width: 110px; margin: 0 auto; }
  .btnClose{
    position: absolute;
    top: -23px;
    right: 0px;
    width: 21px;
    height: 21px;
    cursor: pointer;
  }
  .btnClose::before, .btnClose::after {
    content: '';
    width: 20px;
    height: 1px;
    background: #999;
    overflow: hidden;
    position: absolute;
    top: 7px;
    left: 0;
    transform-origin: center;
  }
  .btnClose::before{
    transform: rotate(45deg)
  }
  .btnClose::after{
    transform: rotate(-45deg)
  }
}
.slideR-enter, .slideR-leave-to{
  right: -150px;
}
</style>
