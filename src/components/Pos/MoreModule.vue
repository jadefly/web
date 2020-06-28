<template>
  <Dialog
    name="PosDialog.HeaderMoreModule"
    :title="$t('Biz.Settlement.MoreOperation')"
    ref="dialog"
    :width="width"
    @close="onClose"
    @open="onOpen"
    :hotkeys="HeaderMoreModuleHotKey"
    closeId="closeHeaderMoreModule"
    top="3vh"
  >
    <div class="pos-dialog-content">
      <div
        class="more-module-wrap"
        :class="isHiddenHotkey">
        <h4>{{$t('Biz.Pos.MoreModuleH1')}}</h4>
        <ul class="row">
          <li class="col-xs-3">
            <button type="button" @click="billReport" :disabled="disable" v-autotest id="billReport">
              {{$t('Dict.Btn.ClosedAccount')}}
              <span>(A)</span>
            </button>
          </li>
          <li id="teamBill" class="col-xs-3" v-if="!(getVuexPosMode === '3')">
            <button type="button" @click="teamBill" :disabled="disable || isServer('389', '383')" >
              {{$t('Biz.Order.TeamBill')}}
              <span>(B)</span>
            </button>
          </li>
          <!--183开始报表查询迁移到桌面-->
          <li id="report" class="col-xs-3">
            <button type="button" @click="report" :disabled="isServer('960', '175')">{{$t('Dict.BusinessReport')}}
              <span>(C)</span>
            </button>
          </li>
          <li id="itemsQuery" class="col-xs-3" v-if="!(getVuexPosMode === '3')">
            <button type="button" @click="itemsQuery" :disabled="isServer('909', '175')">
              {{$t('Biz.Pos.MoreModuleSpan4')}}
              <span>(D)</span>
            </button>
          </li>
          <li id="dishSearch" class="col-xs-3" v-show="showReadyDishSearch">
            <button type="button" :disabled="isServer('947', '175')" @click="KVS">
              {{$t('Biz.Pos.MoreModuleSpan5')}}
              <span>(E)</span>
            </button>
          </li>
        </ul>
        <h4>{{$t('Dict.Dishes')}}</h4>
        <ul class="row">
          <li id="sellOut" class="col-xs-3" v-autotest>
            <button type="button" @click="sellOut" :disabled="isServer('198', '176')">
              {{$t('Dict.Btn.ItemSellout')}}<span>(G)</span>
            </button>
          </li>
          <li id="limited" class="col-xs-3" v-autotest><button type="button" @click="limited" :disabled="isServer('348', '176')">{{$t('Dict.Limit')}}<span>(H)</span></button></li>
          <li id="setPriceByTime" class="col-xs-3" v-autotest>
            <button type="button" @click="setPriceByTime" :disabled="isServer('1294', '176')">
              {{$t('Biz.Pos.MoreModuleSpan8')}}<span>(O)</span>
            </button>
          </li>
          <!--排菜调整为无论有无权限都只在中餐下显示 bug-122329 -->
          <li id="arrangeMenu" v-if="!(getVuexPosMode === '3')"  class="col-xs-3" v-autotest>
            <button type="button" :disabled="isServer('1140', '174')" @click="arrangeMenu">
              {{$t('Biz.ArrangeMenu.ArrangeMenu')}}<span>(P)</span>
            </button>
          </li>
          <li id="easySignMenu" class="col-xs-3" v-autotest>
            <button type="button" :disabled="isDisabledSignMenu" @click="easySignMenu">
              {{$t('Biz.Pos.MoreModuleSpan10')}}<span>(Q)</span>
            </button>
          </li>
          <li id="methodsSellOut" class="col-xs-3" v-autotest>
            <button type="button" @click="methodsSellOut" :disabled="isServer('1451', '176')">
              {{$t('Dict.Btn.MethodsSellout')}}<span>(R)</span>
            </button>
          </li>
        </ul>
        <h4>{{$t('Biz.Pos.MoreModuleH3')}}</h4>
        <ul class="row">
          <li class="col-xs-3" id="openCashbox" ><button type="button" @click="openCashbox" :disabled="disable || isServer('1037', '173')" >{{$t('Dict.OpenCashBox')}}<span>(F)</span></button></li>
          <li class="col-xs-3" id="withdrawBigCash">
            <button type="button" @click="withdrawBigCash" :disabled="disable || isServer('1229', '173')">
              {{$t('Biz.Pos.MoreModuleSpan12')}}<span>(K)</span>
            </button>
          </li>
          <!--快餐下不显示自助押金模块-->
          <li id="buffetDeposit" class="col-xs-3" v-if="isOpen('', '1252', true)">
            <button type="button" @click="buffetDeposit">
              {{$t('Biz.Pos.MoreModuleSpan13')}}<span>(M)</span>
            </button>
          </li>
          <!-- 负结算 非快餐-->
          <li id="negativeSettlement" class="col-xs-3" v-if="+getVuexPosMode === 1 && posBaseInfo.isNegativeSettle">
            <button type="button" @click="negativeSettlement" :disabled="isServer('1476', '174')">
              {{$t('Biz.Pos.MoreModuleSpan14')}}<span>(N)</span>
            </button>
          </li>
        </ul>
        <!-- 功能迁移至用户桌面, 代码注释 -->
        <!-- <h4>其他</h4>
        <ul class="row">
          <li class="col-xs-3"><button type="button" @click="posIpLoginInfo" >终端IP一览<span>(L)</span></button></li>
          <li class="col-xs-3"><button type="button" @click="managerLog" :disabled="isServer('1169', '175')">经理日记<span>(M)</span></button></li>
          <li class="col-xs-3"><button type="button" @click="discardDishRecord" :disabled="isServer('1204', '175')">废菜统计<span>(N)</span></button></li>
        </ul> -->
        <!--开启了crm7后屏蔽掉此模块-->
        <h4 v-if="!setting.enableCrm7">Crm7</h4>
        <ul v-if="!setting.enableCrm7" class="row">
          <li class="col-xs-3" id="crm7SellCard"><button type="button" @click="crm7SellCard" :disabled="isServer('923','176')">{{$t('Dict.Btn.CardSelling')}}<span>(I)</span></button></li>
          <li class="col-xs-3" id="crm7CardCharge"><button type="button" @click="crm7CardCharge" :disabled="isServer('924','176')">{{$t('Dict.Btn.CardCharge')}}<span>(J)</span></button></li>
          <!-- <li class="col-xs-4"><button type="button" @click="crm7" :class="{ 'disableBtn' :isServer('修改卡型')}">修改卡型<span>(K)</span></button></li> -->
        </ul>
        <h4>{{$t('Dict.Other')}}</h4>
        <ul class="row">
          <!--是否开启，开启了是否有权限-->
          <li class="col-xs-3" v-if="isOpen('357', '175')" id="businessInfo">
            <button type="button" :disabled="isServer('357', '175')" @click="businessInfo">{{$t('Biz.Pos.MoreModuleButton1')}}</button>
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import {
  cloneDeep, isEmpty, find,
} from 'lodash';
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      width: '78%', // Dialog宽度: 固定1024*768分辨率下, 保证按钮宽度192,所以,可以调整Dialog宽度占比
      disable: false, // 是否为录单模式
      // 快捷键数据模型
      // 增加jurisdiction这个字段主要是为了根据备餐查询的权限来显示隐藏备餐查询按钮和快捷键，
      btns: [{
        id: '192',
        name: this.$t('Dict.Btn.ClosedAccount'),
        hotKey: 'A',
        method: 'billReport',
        jurisdiction: true,
      }, {
        id: '389',
        name: this.$t('Biz.Order.TeamBill'),
        hotKey: 'B',
        method: 'teamBill',
        jurisdiction: true,
      }, {
        id: '909',
        name: this.$t('Biz.Pos.MoreModuleSpan4'),
        hotKey: 'D',
        method: 'itemsQuery',
        jurisdiction: true,
      }, {
        id: '947',
        name: this.$t('Biz.Pos.MoreModuleSpan5'),
        hotKey: 'E',
        method: 'KVS',
        jurisdiction: true,
      }, {
        id: '1037',
        name: this.$t('Dict.OpenCashBox'),
        hotKey: 'F',
        method: 'openCashbox',
        jurisdiction: true,
      }, {
        id: '1229',
        name: this.$t('Biz.Pos.MoreModuleSpan12'),
        hotKey: 'K',
        method: 'withdrawBigCash',
        jurisdiction: true,
      }, {
        id: '1252',
        name: this.$t('Biz.Pos.MoreModuleSpan13'),
        hotKey: 'M',
        method: 'buffetDeposit',
        jurisdiction: true,
        oneForAll: true,
      }, {
        id: '198',
        name: this.$t('Dict.Btn.ItemSellout'),
        hotKey: 'G',
        method: 'sellOut',
        jurisdiction: true,
      }, {
        id: '348',
        name: this.$t('Dict.Limit'),
        hotKey: 'H',
        method: 'limited',
        jurisdiction: true,
      }, {
        id: '1294',
        name: this.$t('Biz.Pos.MoreModuleSpan8'),
        hotKey: 'O',
        method: 'setPriceByTime',
        jurisdiction: true,
      }, {
        id: '1140',
        name: this.$t('Dict.PromptInfo'),
        hotKey: 'P',
        method: 'arrangeMenu',
        jurisdiction: true,
      }, {
        id: '1235',
        name: this.$t('Biz.Pos.MoreModuleSpan10'),
        hotKey: 'Q',
        method: 'easySignMenu',
        jurisdiction: true,
      }, {
        id: '923',
        name: this.$t('Dict.Btn.CardSelling'),
        hotKey: 'I',
        method: 'crm7SellCard',
        jurisdiction: true,
      }, {
        id: '924',
        name: this.$t('Dict.Btn.CardCharge'),
        hotKey: 'J',
        method: 'crm7CardCharge',
        jurisdiction: true,
      }, {
        id: '960',
        name: this.$t('Dict.BusinessReport'),
        hotKey: 'C',
        method: 'report',
        jurisdiction: true,
      }, {
        id: '1451',
        name: this.$t('Dict.Btn.MethodsSellout'),
        hotKey: 'R',
        method: 'methodsSellOut',
        jurisdiction: true,
      }, {
        id: '1476',
        name: this.$t('Biz.Pos.MoreModuleSpan14'),
        hotKey: 'N',
        method: 'negativeSettlement',
        jurisdiction: true,
      }],
      // 功能迁移至用户桌面, 代码注释
      // {
      //   id: '66666', name: '终端IP一览', hotKey: 'L', method: 'posIpLoginInfo', jurisdiction: true,
      // },
      // {
      //   id: '1169', name: '经理日记', hotKey: 'M', method: 'managerLog', jurisdiction: true,
      // },
      // {
      //   id: '1204', name: '废菜统计', hotKey: 'N', method: 'discardDishRecord', jurisdiction: true,
      // },
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo', 'ALL_POS_MODULE', 'getVuexPosMode', 'allPosModule', 'posDevice', 'posFastFood', 'posInfo', 'setting']),
    isHiddenHotkey() {
      if (this.posBaseInfo
          && +this.posBaseInfo.controlMode === 3
          && this.posFastFood
          && this.posFastFood.fastFoodIsHiddenShortcutKeys
      ) {
        return 'hiddenHotkey';
      }
      return '';
    },
    HeaderMoreModuleHotKey() {
      const tmp = {};
      const tmpObj = this.getSimpleArray();
      let moduleList = [];
      // 快餐下不显示 团队账单 品项查询 排菜
      if (this.getVuexPosMode === '3') {
        moduleList = this.btns.filter(item => ['389', '909', '1140'].indexOf(item.id) === -1);
      } else if (this.setting.enableCrm7) {
        moduleList = this.btns.filter(item => ['923', '924'].indexOf(item.id) === -1);
      } else {
        moduleList = this.btns;
      }
      moduleList.forEach((_) => {
        // oneForAll为true则表示此模块为押金管理 需要单独判断
        if (_.oneForAll) {
          const item = this.ALL_POS_MODULE.filter(i => i.id === '1252');
          if (item.length > 0 && item[0].checked) {
            tmp[_.hotKey] = () => {
              this[_.method]();
            };
          }
        } else if (_.hotKey && _.jurisdiction && (tmpObj[_.id] && tmpObj[_.id].checked)) {
          tmp[_.hotKey] = () => {
            if (_.method === 'negativeSettlement') {
              if (this.isServer('1476', '174')) {
                return;
              }
            }
            this[_.method]();
          };
        }
      });
      return tmp;
    },
    hasSearchPrint() {
      const arr = this.allPosModule.filter(({ id }) => Object.is(id, '175'));
      return arr.length ? arr[0].children ? arr[0].children : [] : [];
    },
    showReadyDishSearch() {
      const isLimit = this.hasSearchPrint.some((ele, index, arr) => Object.is(ele.id, '947'));
      this.btns.map((item) => {
        if (Object.is(item.id, '947')) {
          item.jurisdiction = isLimit;
        }
      });
      return isLimit;
    },
    isDisabledSignMenu() {
      if (this.posBaseInfo.isEnableYiPan || this.posBaseInfo.isEnableZhiPan) {
        return this.isServer('1235', '176');
      }
      return true;
    },
  },
  methods: {
    // 狗不理功能补齐
    businessInfo() {
      this.$emit('operation', 'gblBusinessInfo');
      this.close();
    },
    // 给allPosModule里的数组降维
    getSimpleArray() {
      let tmpArr = [];
      const tmpObj = {};
      const baseArr = cloneDeep(this.ALL_POS_MODULE);
      baseArr.map((item) => {
        if (item.children && item.children.length > 0) {
          tmpArr = [...tmpArr, ...item.children];
        }
        return item;
      });
      tmpArr.map((item) => {
        if (+item.id === 198) {
          item.text = this.$t('Dict.Btn.ItemSellout');
        }
        if (+item.id === 348) {
          item.text = this.$t('Dict.Limit');
        }
        tmpObj[item.id] = item;
        return item;
      });
      tmpObj['66666'] = {
        text: this.$t('Dict.TerminalIP'),
        checked: true,
      };
      return tmpObj;
    },
    billReport() {
      this.$emit('operation', 'billed');
      this.close();
    },
    // 功能迁移至用户桌面, 代码注释
    // 经理日记
    // managerLog() {
    //   this.$emit('operation', 'managerLog');
    //   this.close();
    // },
    // 废菜统计
    // discardDishRecord() {
    //   this.$emit('operation', 'discardDishRecord');
    //   this.close();
    // },
    // 报表查询
    report() {
      this.$emit('operation', 'report');
      this.close();
    },
    paymentsReport() {
      // alert('收支')
      this.close();
    },
    KVS() {
      this.$emit('operation', 'kvsBox');
      this.close();
    },
    openCashbox() {
      this.$emit('operation', 'moneyBox');
      this.close();
    },
    withdrawBigCash() {
      this.$emit('operation', 'withdrawBigCash');
      this.close();
    },
    buffetDeposit() {
      this.$emit('operation', 'buffetDeposit');
      this.close();
    },
    // 品项估清
    sellOut() {
      this.$emit('operation', 'itemsSellOut');
      this.close();
    },
    // 做法估清
    methodsSellOut() {
      this.$emit('operation', 'methodsSellOut');
      this.close();
    },
    limited() {
      this.$emit('operation', 'limitQuantity');
      this.close();
    },
    // 时价
    setPriceByTime() {
      this.$emit('operation', 'setPriceByTime');
      this.close();
    },
    arrangeMenu() {
      // 使用排菜功能前校验默认模板, false-不可使用 宴会套餐校验, 单品模式不用
      if (this.checkdefaulttemp === '1') {
        this.$emit('operation', 'arrangeMenu');
        this.close();
        return false;
      }
      ajax('canyin.pos.arrangemenubase.checkdefaulttemp').then((res) => {
        if (!isEmpty(res)) {
          this.$emit('operation', 'arrangeMenu');
          this.close();
        }
      });
      return true;
    },
    easySignMenu() {
      const { enableYiPan } = this.posDevice;
      const { yipanList } = this.posBaseInfo;
      if (this.isDisabledSignMenu) {
        return;
      }
      if (!enableYiPan) {
        // 没开启易盘
        this.$message.error(this.$t('Biz.Pos.MoreModuleMsg1'));
      } else if (!yipanList.length) {
        // 只开启易盘，但没添加设备
        this.$message.error(this.$t('Biz.Pos.MoreModuleMsg2'));
      } else {
        this.$emit('operation', 'easySignMenu');
        this.close();
      }
    },
    itemsQuery() {
      // ddddd
      this.$emit('operation', 'itemQuery');
      this.close();
    },
    teamBill() {
      this.$emit('operation', 'teamBill');
      this.close();
    },
    crm7SellCard() {
      this.$emit('operation', 'crm7SellCard');
      this.close();
    },
    crm7CardCharge() {
      this.$emit('operation', 'crm7CardCharge');
      this.close();
    },
    negativeSettlement() {
      this.$emit('operation', 'negativeSettlement');
      this.close();
    },
    // 功能迁移至用户桌面, 代码注释
    // posIpLoginInfo() {
    //   this.$emit('operation', 'posIpLoginInfo');
    //   this.close();
    // },
    onOpen() {
      this.disable = (+this.posBaseInfo.controlMode === 2);
    },
    // 是否开启了使用权限 (控制按钮可点击状态)
    isServer(itemId, classId) {
      const changeUpdateItem = this.ALL_POS_MODULE.find(({ id }) => id === classId);
      let bool = null;
      if (changeUpdateItem) {
        const changeUpdateList = changeUpdateItem.children;
        for (let i = 0; i < changeUpdateList.length; i += 1) {
          // 未在后台选中，则置灰不可点
          // if (+changeUpdateList[i].id === +itemId && !changeUpdateList[i].checked) { // 未选中
          //   return !changeUpdateList[i].checked;
          // }
          if (+changeUpdateList[i].id === +itemId) {
            return !changeUpdateList[i].checked;
          }
          bool = true;
        }
        return bool;
      }
      return true;
    },
    // 是否开启了增值业务 (控制按钮显示隐藏)
    isOpen(itemId, classId, onlyOne = false) { // onlyOne 目前用于押金管理模块 因为只有一个classId 没有itemId
      const { hasMultiSettle } = this.posInfo;
      if (classId === '1252' && hasMultiSettle) return false;
      const changeUpdateItem = this.ALL_POS_MODULE.find(({ id }) => id === classId);
      if (onlyOne && changeUpdateItem) {
        return changeUpdateItem.checked;
      }
      let isOpen = false;
      if (changeUpdateItem) {
        const changeUpdateList = changeUpdateItem.children;
        if (changeUpdateList.find(({ id }) => id === itemId)) {
          isOpen = true;
        }
        return isOpen;
      }
      return false;
    },
  },
  mounted() {
    console.log('xxxxxxxxxxxxxx', this.setting.enableCrm7);
  },
  updated() {
    // 发下是否满足二级权限 负结算
    this.$emit('setIsShowNgtModule', !this.isServer('1476', '174'));
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.more-module-wrap {
  padding: 15px 30px;
  &.hiddenHotkey {
    >ul {
      >li {
        >button {
          >span {
            display: none;
          }
        }
      }
    }
  }
  > h4 {
    line-height: 20px;
    color: #999;
  }

  > ul {
    // margin-bottom: 10px;

    button {
      .size(100%, 55px);
      margin-top: 8px;
      margin-bottom: 8px;
      background-color: @white;
      border: none;
      border-radius: 4px;
      color: #344b5b;

      &:hover {
        background-color: #defcff;
      }
    }
    button[disabled]{
      background: #ddd !important;
      color: #999 !important;
      cursor: not-allowed;
    }
  }
}
</style>
