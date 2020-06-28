<template>
  <div class="framework-wrapper">
    <header>
      <div class="title">
        <i class="logo-title"
          :class="[
            {tcsllogo: logoMode == 1},
            {zjlogo: logoMode == 2},
            {customlogo: logoMode == 0}
          ]"
          :style="[customLogo]"
        ></i>
        <strong>{{ title }}</strong>
        <strong class="line">|</strong>
        <strong>{{ moduleName }}</strong>
      </div>
      <div class="back">
          <button @click="toUserDesktop">{{$t('Dict.Return')}}</button>
      </div>
    </header>
    <div class="framework-left-slide">
      <div
        class="slide-item"
        v-for="item in filteredTabs"
        :key="item.name"
        :class="{ 'active': item.name === activeModule }"
        @click="changeActive(item.name, item.modulePid)"
      >{{ item.label }}</div>
    </div>
    <div class="framework-right-box">
      <div class="view">
        <Hearder
          v-if="isSearchPrint"
          :businessReportViewData="businessReportViewData"
          :businessReportCurrentModuleId="businessReportCurrentModuleId">
        </Hearder>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { includes } from 'lodash';
import ajax from '@/common/js/ajax';
import userDesktopMinxin from './userDesktopMinxin';
import * as allId from './moudle-ids';
import Hearder from '../SearchPrint/components/Header';

const RouterMap = {
  '/barCounter': allId.BAR_ID,
  '/bussinessManagement': allId.BUSSINESS_MANAGE_ID,
  '/financialManagement': allId.FINANCIAL_ID,
  '/systemTools': allId.SYSTEM_TOOLS_ID,
  '/parameterSetting': allId.PARAME_ID,
};

export default {
  name: 'Framework',
  mixins: [userDesktopMinxin],
  components: { Hearder },
  props: {
    moduleName: {
      type: String,
      default: '',
    },
    tabs: {
      type: Array,
      default: () => [],
    },
    reportList: {
      type: Array,
      default: () => [],
    },
    isSearchPrint: { // 是否是查询打印
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters([
      'posInfo',
    ]),
  },
  data() {
    return {
      activeModule: '',
      filteredTabs: [],
      businessReportViewData: {},
      businessReportCurrentModuleId: null,
      billedStatementMountedNum: 0, // 已结账单报表的mounted次数
    };
  },
  methods: {
    toUserDesktop() {
      this.$router.push('/desk');
    },
    filterTabsWithAuth({ path }) {
      if (this.isSearchPrint) { // 如果是查询打印，走查询打印的过滤逻辑。
        this.filterSearchPrintTabs();
        return;
      }
      Object.keys(RouterMap).some((k) => {
        if (path.includes(k)) {
          this.getAuthorityTab(RouterMap[k]);
          return true;
        }
        return false;
      });
    },
    getAuthorityTab(modulePid) {
      ajax('canyin.desktop.userdesktop.getmodulebyempidandpid', {
        params: {
          modulePid,
        },
      }).then((data) => {
        const moduleIdArr = data.map(obj => obj.moduleId);
        this.filteredTabs = this.tabs.filter(item => includes(moduleIdArr, item.modulePid));
        this.selectFirstTab();
      });
    },
    selectFirstTab() {
      if (this.filteredTabs.length > 0) {
        this.changeActive(this.filteredTabs[0].name);
      }
    },
    changeActive(name, id = 0) {
      this.activeModule = name;
      // Header组件通过watch此属性来调用对应的报表的接口
      this.businessReportCurrentModuleId = id;
      this.routerCheck(name);
    },
    routerCheck(name) {
      if (name === 'billedStatement') {
        // 这里是为了通知已结账单模块只在第一次创建时执行相应事件
        // 已结账单会获取mountedNum === 1 ？ 来判断是否执行相应事件
        this.billedStatementMountedNum += 1;
        this.$router.push({
          name,
          params: {
            mountedNum: this.billedStatementMountedNum,
          },
        });
      } else {
        this.$router.push({ name });
      }
    },
    // 过滤出查询打印的左侧列表
    filterSearchPrintTabs() {
      ajax('canyin.pos.businessreport.view', {
        params: {
          fromType: 1,
        },
      }).then((data) => {
        this.filteredTabs = this.tabs;
        if (this.filteredTabs && this.filteredTabs.length > 0) {
          this.changeActive(this.filteredTabs[0].name, this.filteredTabs[0].modulePid);
        }
        if (data.errorMsg) {
          this.$message.warning(`${data.errorMsg}`);
          return;
        }
        this.businessReportViewData = {
          ...data,
          reportList: this.reportList,
        };
      });
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .framework-wrapper{
    width: 100%;
    height: 100%;
    > header {
      width: 100%;
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #374347;
      color: white;
      .title {
        padding-left: 18px;
        font-size: 18px;
        > strong {
          display: inline-block;
          max-width: 240px;
          height: 28px;
          vertical-align: middle;
          overflow: hidden;
        }
        > .line {
          font-size: 20px;
          padding: 0 6px;
        }
        > .logo-title {
          width: 40px;
          height: 40px;
          display: inline-block;
          vertical-align: middle;
        }
        > .tcsllogo {
          background-image: url(~@/common/images/pos/main/btcsllogo.png);
          background-repeat: no-repeat;
          background-size: 100%;
        }
        > .zjlogo {
          background-image: url();
          background-repeat: no-repeat;
          background-size: 100%;
        }
        > .customlogo {
          background-image: url();
          background-repeat: no-repeat;
          background-size: 100% 100%;
        }
      }
      .back {
        padding-right: 24px;
        > button {
          width: 80px;
          height: 40px;
          border: 1px solid white;
          border-radius: 5px;
          background-color: #535e61;
          font-size: 12px;
          &:hover {
            background-color: #5a6568;
          }
        }
      }
    }
    .icon-user{
      vertical-align: top;
    }
    .framework-left-slide{
      width: 163px;
      height: calc(100% - 64px);
      float: left;
      background-color: #3f4d51;

      > .slide-item {
        height: 42px;
        line-height: 42px;
        padding-left: 20px;
        font-size: 16px;
        color: #ccc;
        cursor: pointer;

        &.active {
          position: relative;
          background-color: #01bded;
          color: #fff;

          &:after {
            position: absolute;
            content: '';
            right: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background-color: #fff;
            border-radius: 1px;
          }
        }
      }
    }
    > .framework-right-box{
      float: left;
      background-color:#9dc1ca;
      width: calc(100% - 163px);
      height: calc(100% - 64px);
      padding: 15px;
      > .view{
        display: flex;
        flex-direction: column;
        background-color: #fff;
        height: 100%;
        border-radius: 5px;
      }
    }
  }

  .lang-enUS{
    .framework-left-slide {
      width: 163px;
      height: calc(100% - 64px);
      float: left;
      background-color: #3f4d51;

      > .slide-item {
        padding: 10px 0 10px 20px;
        font-size: 14px;
        color: #ccc;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        line-height: 20px;
        height: 60px;
        &.active {
          position: relative;
          background-color: #01bded;
          color: #fff;

          &:after {
            position: absolute;
            content: '';
            right: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background-color: #fff;
            border-radius: 1px;
          }
        }
      }
    }
  }
</style>

<style lang="less">
  .framework-right-box {
    .el-table__header-wrapper .el-table__header{
      th {
        color: #333;
      }
      td {
        padding: 8px 0;
      }
    }
    .el-table__body {
      tr {
        color: #333;
      }
    }
    tr.current-row {
      td {
        background-color: #f3f7ff;
      }
    }
    .user-desktop-search {
      .pos-order-tables-search {
        border: 1px solid gray;
      }
    }
    .user-desktop-clearall {
      float: left;
      margin-right: 10px;
    }
    .el-table .no-wrap .cell {
      white-space: nowrap;
    }
    .el-table .two-line .cell {
      overflow : hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

</style>
