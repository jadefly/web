<template>
<div class="kitchen-dining-page">
  <div class="container-fluid kitchen-dining-container">
    <div class="kitchen-dining-menu">
      <div
        class="kitchen-dining-dishes"
        :class="{ 'single-keyboard': !isEnableMultiKeyboardOperation }"
      >
        <button
          type="button"
          v-for="(item, index) in itemList"
          :key="item.kscId"
          :class="{ 'lock': item.lock }"
          @click="activeDishId = item.kscId"
        >
          <em v-if="index < 10">{{ index === 9 ? 0 : (index + 1) }}</em>
          <small v-if="item.kitchenFlg === 0">{{ $t('Biz.KDS.WaitingDish') }}</small>
          <template v-if="item.sizeId !== '-1'">（{{ item.sizeName }}）</template>
          {{ item.itemName }}
        </button>
      </div>
    </div>
    <div class="kitchen-dining-side">
      <div class="kitchen-dining-doing">
        <div class="kitchen-dining-doing-title">
          <i class="iconfont-kds icon-tongji"></i>{{ $t('Biz.KDS.Doing') }}
        </div>
        <ul class="kitchen-dining-doing-list">
          <Emp
            v-for="item in empListData"
            :key="item.empId"
            :emp="item"
            @click.native="revoke(item)"
          ></Emp>
        </ul>
      </div>
    </div>
  </div>
  <div class="kitchen-dinging-footer-hr"></div>
  <div class="kitchen-dining-footer">
    <div class="kitchen-dining-btns">
      <a href="javascript:;" @click="logout">
        <i class="iconfont-kds icon-icon_logout"></i>
        <em>{{ $t('Dict.Btn.Cancellation') }}</em>
      </a>
      <a href="javascript:;">
        <i class="iconfont-kds icon-kds-user"></i>
        <em>{{ userName }}</em>
      </a>
      <a href="javascript:window.location.reload();">
        <i class="iconfont-kds icon-shuaxin"></i>
        <em>{{ $t('Dict.Btn.Refresh') }}</em>
      </a>
    </div>
    <h1 class="logo" :class="logoModeClass">厨房管理</h1>
    <div class="kitchen-dining-sys-info">
      {{ now | dateFormat }}
    </div>
  </div>
  <div
    class="kitchen-dining-choice-people"
    v-if="activeDish"
    @click="activeDishId = null"
  >
    <div class="kitchen-dining-people-list">
      <button
        type="button"
        v-for="item in empList"
        :key="item.empId"
        @click.prevent="toConfirm(item.empAuthCard)"
      >{{ item.empName }}</button>
    </div>
  </div>
</div>
</template>

<script>
import {
  now,
  map,
  filter,
  includes,
  sortBy,
  find,
  each,
  first,
  keyBy,
  extend,
} from 'lodash';
import { mapMutations } from 'vuex';
import { add, sub } from '@/common/js/math';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import ajax from '@/common/js/ajax';
import WS from '@/common/js/WS';
import Emp from './Emp';

export default {
  components: {
    Emp,
  },
  mixins: [dateFormatMixin],
  data() {
    return {
      // 当前客户端时间
      now: now(),
      // 厨房管理 WebSocket
      kitchenWebSocket: null,
      // 当前登录人姓名
      userName: '',
      // 服务端跟目录
      HTTP_CONTEXTPATH: '/cy7',
      // 按品项过滤方案
      itemIdList: [],
      // 按小类过滤方案
      smallClassIdList: [],
      // 当前 Pos 管理区域列表
      areaIdList: [],
      // 当前 Pos 管理销售类型列表
      saleTypeList: [],
      // 菜品列表
      kitchenItemInfoList: {},
      // 员工列表
      empList: [],
      // 多键盘员工登录信息
      empKeyboardList: [],
      // 语音队列
      callingList: [],
      // 当前全屏状态
      isFullScreen: true,
      // 当前选中的菜
      activeDishId: null,
      // 是否开启多键盘模式
      isEnableMultiKeyboardOperation: false,
      logoMode: '1',
    };
  },
  created() {
    // 时钟显示
    this.setClock();
    // 初始化基础信息
    this.initBaseInfo();
    // 初始化厨房管理数据
    this.initKitchenInfo();
    ajax('canyin.sys.logo.getLogoImgMode').then((data) => {
      this.logoMode = data.logoImgMode;
    });
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$hotKey.init();
      vm.setHotKey();
      vm.$tcsl.fullScreen(true);
    });
  },
  computed: {
    logoModeClass() {
      if (this.logoMode === '1') {
        return 'tcsllogo';
      }
      return 'customlogo';
    },
    itemList() {
      return sortBy(this.kitchenItemInfoList, (item) => {
        if (item.hastenFlg > 0) {
          return 0;
        }
        if (item.kitchenFlg === 0) {
          return item.createTimeForTimeStamp;
        }
        return item.callUpTimeTimeStamp;
      });
    },
    activeDish() {
      if (this.activeDishId && this.kitchenItemInfoList[this.activeDishId]) {
        return this.kitchenItemInfoList[this.activeDishId];
      }
      return null;
    },
    empListData() {
      if (this.isEnableMultiKeyboardOperation) {
        return map(this.empKeyboardList, keyboard => (
          extend({}, keyboard, find(this.empList, { empAuthCard: keyboard.empAuthCard }))
        ));
      }
      return this.empList;
    },
  },
  methods: {
    ...mapMutations({
      setLocale: 'SET_LOCALE',
    }),
    // 设置快捷键
    setHotKey() {
      this.$hotKey.set('KDS.dining', {
        'F11.ctrl': this.toggleFullScreen,
      });
    },
    // 切换全屏状态
    toggleFullScreen() {
      if (this.isFullScreen) {
        this.$tcsl.fullScreen(true);
      } else {
        this.$tcsl.fullScreen(false);
      }
      this.isFullScreen = !this.isFullScreen;
    },
    // 初始化基础信息
    initBaseInfo() {
      ajax('canyin.kitchen.kitchenindex', {
        contentType: 'json',
      }).then((data) => {
        this.setLocale(data.currentLanguage);
        this.initWebsocket(data.WS_CONTEXTPATH);
        this.userName = data.username;
        this.HTTP_CONTEXTPATH = data.HTTP_CONTEXTPATH;
        const isEnableMultiKeyboardOperation = data.isEnableMultiKeyboardOperation === '1';
        this.isEnableMultiKeyboardOperation = isEnableMultiKeyboardOperation;
        if (!isEnableMultiKeyboardOperation) {
          this.$quickinput((str) => {
            if (str.length === 10) {
              this.confirmFirst(str);
            }
          });
        }
        this.initDevices();
      });
    },
    // 初始化厨房管理数据
    initKitchenInfo() {
      const { filterid, posid, loginMode } = this.$route.params;
      ajax('canyin.kitchen.kitcheninfoinit.getkcallinfoforinitdisplay', {
        contentType: 'json',
        data: {
          itemfilterId: filterid,
          posId: posid,
          loginMode,
        },
      }).then((data) => {
        const {
          itemIdList,
          posHasAreaList,
          posHasSaleTypes,
          smallClassIdList,
          kitchenItemInfoList,
          kitchenEmpCookInfoList,
          serverTime,
        } = data;
        this.itemIdList = itemIdList;
        this.smallClassIdList = smallClassIdList;
        this.areaIdList = map(posHasAreaList, area => area.id);
        this.saleTypeList = map(posHasSaleTypes, saleType => Number(saleType.saleTypeId));
        this.kitchenItemInfoList = keyBy(this.filterList(kitchenItemInfoList), 'kscId');
        this.empList = filter(kitchenEmpCookInfoList, 'empAuthCard');
        if (Math.abs(serverTime / 1000 - Date.parse(new Date()) / 1000) > 60 * 5) {
          this.$message.error(this.$t('Dict.SysTimeErrorMessage2'));
        }
      });
    },
    // 过滤菜品列表
    filterList(list) {
      const {
        itemIdList,
        smallClassIdList,
        areaIdList,
        saleTypeList,
      } = this;
      return filter(list, (item) => {
        const itemIdValidate = itemIdList
          && itemIdList.length
          && (
            includes(itemIdList, item.itemId)
            || item.tempItemName != null
          );
        const smallClassIdValidate = smallClassIdList
          && smallClassIdList.length
          && includes(smallClassIdList, item.smallClassId);
        const areaIdValidate = !item.pointAreaId
          || item.pointAreaId === '9'
          || item.pointAreaId === '10'
          || !areaIdList.length
          || includes(areaIdList, item.pointAreaId);
        const saleTypeValidate = includes(saleTypeList, item.saleTypeId);
        return (itemIdValidate || smallClassIdValidate)
          && areaIdValidate && saleTypeValidate;
      });
    },
    // 设置时钟
    setClock() {
      setInterval(() => {
        this.now = now();
      }, 1000);
    },
    // 初始化设备管理器
    initDevices() {
      this.$devices.init({
        onOpen: () => {
          if (this.isEnableMultiKeyboardOperation) {
            this.$devices.Keyboard.init((event) => {
              if (event.kbId && event.input) {
                this.keyInput(event.kbId, event.input, event.login);
              }
            });
          }
        },
        onError: () => {
          this.$log.info(this.$t('Biz.Order.DevicesWarnMsg01'));
        },
      });
    },
    // 初始化 WebSocket
    initWebsocket(path) {
      this.kitchenWebSocket = new WS(`${path}/websocket/cookmodewebsocketserver`, {
        message: (message) => {
          switch (message.method) {
            case 'cookInfoAdd':
            case 'cancelRecord':
              this.addDishesToList(message.data);
              break;
            case 'cookInfoDelete':
              this.deleteCompeletedItems(map(message.data, 'kscId'), this.isEnableMultiKeyboardOperation);
              break;
            case 'cancelOrder':
              this.cancelOrder(map(message.data, 'kcKscId'));
              break;
            case 'callUp':
              this.callUp(message.data);
              break;
            default:
              break;
          }
        },
      });
    },
    // 指定人员配菜
    toConfirm(cardId) {
      this.confirm(this.activeDish, cardId);
    },
    // 配出第一个
    confirmFirst(cardId) {
      if (this.itemList.length) {
        this.confirm(this.itemList[0], cardId);
      }
    },
    // 多键盘输入
    keyInput(kbId, input, login) {
      if (login) {
        this.empLogin(kbId, input);
      } else {
        const finded = find(this.empKeyboardList, { kbId });
        if (finded) {
          if (
            input.length === 1
            && includes('0123456789', input)
          ) {
            const index = input === '0' ? 9 : sub(input, 1);
            if (index < this.itemList.length) {
              const dish = this.itemList[index];
              if (!dish.lock) {
                this.confirm(dish, finded.empAuthCard);
              }
            }
          } else {
            this.$message.error(this.$t('Biz.KDS.ConfirmErrorMsg3'));
          }
        } else {
          this.$message.error(this.$t('Biz.Login.SwipeCardTips'));
        }
      }
    },
    // 多键盘员工登录
    empLogin(kbId, empAuthCard) {
      const emp = find(this.empList, { empAuthCard });
      if (emp) {
        this.$message.success(this.$t('Biz.KDS.LoginSuccess', [emp.empName]));
        const keyboard = find(this.empKeyboardList, { kbId });
        if (keyboard) {
          keyboard.empAuthCard = empAuthCard;
        } else {
          this.empKeyboardList.push({ kbId, empAuthCard });
        }
      } else {
        // 未找到对应员工卡
        this.$message.error(this.$t('Biz.KDS.ConfirmErrorMsg4'));
      }
    },
    // 提交配菜
    confirm(dish, authCard) {
      if (dish.kitchenFlg === 0) {
        // 当前菜还在叫起中
        this.$message.error(this.$t('Biz.KDS.ConfirmErrorMsg1'));
      } else if (dish.lastQty === 0) {
        // 当前菜已退单，请再次获取
        this.$message.error(this.$t('Biz.KDS.ConfirmErrorMsg2'));
        this.cancelOrder([dish.kscId]);
      } else {
        this.$set(dish, 'lock', true);
        ajax('canyin.kitchen.kitchencookmode.updatewhencompletecook', {
          contentType: 'json',
          data: {
            kcKscIdList: [dish.kscId],
            authCard,
          },
        }).then((data) => {
          if (data && data.resultOfParallelList && data.resultOfParallelList.length) {
            this.print(data.resultOfParallelList);
          }
          if (data && data.resultOfServeBillSum && data.resultOfServeBillSum.length) {
            this.print(data.resultOfServeBillSum);
          }
          if (data && data.resultOfCookBillSum && data.resultOfCookBillSum.length) {
            this.print(data.resultOfCookBillSum);
          }
          const finded = find(this.empList, { empAuthCard: authCard });
          if (finded) {
            finded.cookedCount = add(finded.cookedCount, dish.lastQty);
            finded.recentlyCookedKcKscId = dish.kscId;
            finded.recentlyCookedItemId = dish.itemId;
            finded.recentlyCookedItemName = dish.itemName;
            finded.recentlyCookedItemLastQty = dish.lastQty;
          }
        }).catch((errCode, msg) => {
          this.$set(dish, 'lock', false);
          this.$alert(msg, this.$t('Dict.Tips'), {
            customClass: 'ajax-error-alert',
          });
        });
      }
    },
    revoke(emp) {
      if (emp.recentlyCookedKcKscId) {
        // 是否撤销？
        this.$confirm(this.$t('Biz.KDS.ConfirmRevoke')).then(() => {
          ajax('canyin.kitchen.kitchenhis.updatewhencancelcook', {
            contentType: 'json',
            data: {
              kcKscIdList: [emp.recentlyCookedKcKscId],
            },
          }).then(() => {
            // 已撤销
            this.$message.success(this.$t('Biz.KDS.Revoked'));
            const finded = find(this.empList, { empId: emp.empId });
            if (finded) {
              finded.cookedCount = sub(finded.cookedCount, emp.recentlyCookedItemLastQty);
              finded.recentlyCookedKcKscId = null;
              finded.recentlyCookedItemId = null;
              finded.recentlyCookedItemName = null;
              finded.recentlyCookedItemLastQty = null;
            }
          });
        }).catch(() => {});
      }
    },
    // 打印
    print(printList) {
      each(printList, (item) => {
        if (item.printData && item.printType === 'PRINT_PARALLEL') {
          this.$devices.Printer.print(item.printData);
        }
      });
    },
    // 退菜已知
    cancelOrder(kscIdArr) {
      const kcKscIdList = filter(kscIdArr, kscId => find(this.kitchenItemInfoList, { kscId }));
      ajax('canyin.kitchen.kitchencancelorder.updatewhenknowcancelorder', {
        contentType: 'json',
        data: { kcKscIdList },
      }).then(() => {
        this.deleteCompeletedItems(kcKscIdList);
      });
    },
    // 增加菜品
    addDishesToList(data) {
      const filtered = this.filterList(data);
      if (filtered.length) {
        this.calling({ busiCode: 0 });
        each(filtered, (item) => {
          const finded = this.kitchenItemInfoList[item.kscId];
          if (finded) {
            finded.kitchenFlg = item.kitchenFlg;
            finded.orderFlg = item.orderFlg;
          } else {
            this.$set(this.kitchenItemInfoList, item.kscId, item);
          }
        });
      }
    },
    // 起菜
    callUp(list) {
      each(list, (item) => {
        const finded = this.kitchenItemInfoList[item.kscId];
        if (finded) {
          this.$set(this.kitchenItemInfoList, item.kscId, item);
        }
      });
    },
    // 删除菜品
    deleteCompeletedItems(kscIdArr, beforeLock) {
      const { kitchenItemInfoList: list } = this;
      each(kscIdArr, (kscId) => {
        const finded = list[kscId];
        if (finded) {
          if (beforeLock) {
            this.$set(finded, 'lock', true);
            setTimeout(() => {
              this.$delete(list, kscId);
            }, 1000);
          } else {
            this.$delete(list, kscId);
          }
        }
      });
    },
    // 语音
    calling(params) {
      if (params.busiCode === 0) {
        this.addCalling({
          type: 'file',
          file: '/static/media/dining.mp3',
        });
      }
    },
    // 添加一条语音并开始播报
    addCalling(params) {
      const data = {
        file: '',
        count: params.count ? params.count : 1,
        id: params.id,
      };
      if (params.type === 'file') {
        if (process.env.NODE_ENV !== 'development') {
          data.file = `${process.env.API_PATH}${process.env.DIST_PATH}${params.file}`;
        } else {
          data.file = params.file;
        }
        if (params.toHead) {
          this.callingList.unshift(data);
        } else {
          this.callingList.push(data);
        }
        this.playCalling();
      }
    },
    // 语音播报
    playCalling() {
      if (this.callingList.length && !this.isPlaying) {
        const it = first(this.callingList);
        const calling = new Audio(it.file);
        it.count -= 1;
        if (it.count === 0) {
          this.callingList.shift();
        }
        this.isPlaying = true;
        calling.play();
        const endHandler = () => {
          this.isPlaying = false;
          this.playCalling();
        };
        calling.onended = () => {
          setTimeout(endHandler, 700);
        };
        calling.onerror = () => {
          setTimeout(endHandler, 6000);
        };
      }
    },
    logout() {
      window.location = `${this.HTTP_CONTEXTPATH}/platform/login/login/logout`;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "~@/common/less/iconfont-kds.less";

@new-footer-height: 75px;

.kitchen-dining-page {
  position: relative;
  height: 100%;
}

.kitchen-dining-container {
  position: absolute;
  left: 0;
  top: 0;
  .square(100%);
  padding-top: 0;
  padding-right: 10px;
  padding-bottom: @new-footer-height;
  padding-left: 10px;
  background-color: #000201;

  @media (min-width: 900px) {
    padding-right: 430px;
  }

  @media (min-width: 1920px) {
    padding-left: 30px;
    padding-right: 540px;
  }
}

.kitchen-dining-menu {
  display: none;
  height: 100%;
  padding-top: 15px;
  padding-bottom: 15px;

  @media (min-width: 900px) {
    display: block;
  }
}

.kitchen-dining-dishes {
  position: relative;
  height: 100%;
  overflow: hidden;

  > button {
    position: relative;
    .size(128px, 80px);
    margin: 8px;
    border-radius: 10px;
    background-color: #394551;
    border: none;
    color: #bcc7dd;
    font-size: 20px;
    vertical-align: bottom;
    word-break: break-all;
    overflow: hidden;

    &.lock {
      border: 3px solid #95ffff;
      #gradient > .vertical(@start-color: #0c466c; @end-color: #095e95);
      color: #fff;
    }

    > em {
      display: block;
      position: absolute;
      left: 5px;
      top: 5px;
      .square(16px);
      background-color: #fff;
      border-radius: 50%;
      color: #000;
      font-size: 12px;
      font-weight: bold;
      font-style: normal;
    }

    @media (min-width: 1920px) {
      .size(260px, 150px);
      margin: 12px;
      font-size: 30px;
    }
  }

  &.single-keyboard > button {
    > em {
      display: none;
    }

    &:first-child {
      .size(272px, 150px);
      border: 3px solid #95ffff;
      #gradient > .vertical(@start-color: #0c466c; @end-color: #095e95);
      font-size: 34px;
      color: #fff;

      @media (min-width: 1920px) {
        .size(548px, 300px);
        font-size: 60px;
      }
    }
  }

  &:after {
    position: absolute;
    content: '';
    bottom: 0;
    left: 0;
    width: 100%;
    height: 10%;
    #gradient > .vertical(@start-color: rgba(0, 2, 1, 0); @end-color: rgba(0, 2, 1, 1));
  }
}

.kitchen-dining-side {
  position: absolute;
  right: 0;
  top: 0;
  .square(100%);
  padding-top: 0;
  padding-bottom: @new-footer-height;

  @media (min-width: 900px) {
    width: 430px;
  }

  @media (min-width: 1920px) {
    width: 540px;
  }
}

.kitchen-dining-doing {
  position: relative;
  height: 100%;
  padding-top: 44px;
  background-color: #2b2d3a;
  overflow: hidden;

  @media (min-width: 1920px) {
    padding-top: 88px;
  }

  &-title {
    position: absolute;
    top: 0;
    left: 0;
    .size(100%, 44px);
    line-height: 44px;
    padding-left: 15px;
    font-size: 20px;
    color: #6f7487;

    i {
      font-size: 20px;
      margin-right: 5px;
    }

    @media (min-width: 1920px) {
      height: 88px;
      line-height: 88px;
      padding-left: 35px;
      font-size: 36px;

      i {
        font-size: 36px;
        margin-right: 10px;
        vertical-align: middle;
      }
    }
  }

  &-list {
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
  }
}

.kitchen-dining-choice-people {
  position: absolute;
  z-index: 1000;
  left: 0;
  top: 0;
  .square(100%);
  background-color: rgba(0, 0, 0, .5);
}

.kitchen-dining-people-list {
  position: absolute;
  left: 50%;
  top: 50%;
  .square(500px);
  margin-left: -250px;
  margin-top: -250px;
  padding: 20px;
  background-color: rgba(255, 255, 255, .8);
  border-radius: 10px;

  > button {
    .size(140px, 90px);
    margin: 5px;
    padding-left: 15px;
    padding-right: 15px;
    background-color: #000201;
    border: none;
    border-radius: 5px;
    color: @white;
    font-size: 30px;
    float: left;
  }
}

.kitchen-dining-footer {
  position: fixed;
  z-index: 100;
  left: 0;
  bottom: 0;
  width: 100%;
  height: @new-footer-height;

  &-hr {
    height: @new-footer-height;
  }
}

.kitchen-dining-btns {
  float: left;
  padding-left: 15px;
  padding-top: 15px;

  a {
    float: left;
    .size(75px, 48px);
    text-align: center;
    color: #6e768b;

    i,
    em {
      display: block;
    }

    i {
      height: 28px;
      font-size: 26px;
    }

    em {
      font-style: normal;
      font-size: 12px;
      height: 20px;
      line-height: 20px;
    }

    &:hover {
      color: @white;
    }
  }
}

.kitchen-dining-sys-info {
  float: right;
  padding-right: 15px;
  line-height: 75px;
  color: @white;
  font-size: 18px;
  font-weight: bold;
}

.logo {
  float: right;
  width: 44px;
  height: 44px;
  margin-top: 14px;
  margin-right: 10px;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: 100% 100%;
  text-indent: -9999px;

  &.tcsllogo {
    background-image: url(~@/common/images/pos/main/btcsllogo.png);
  }

  &.customlogo {
    background-image: url(/custom/logo/logo.png);
  }
}
</style>
