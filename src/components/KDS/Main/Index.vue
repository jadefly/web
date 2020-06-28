<template>
  <div class="kds-page" @click="$refs.header.$refs.control.showMoreMenu = false">
    <Header ref="header" class="header"></Header>
    <keep-alive>
      <router-view class="content"></router-view>
    </keep-alive>
    <Footer class="footer"></Footer>
    <ListItem
      v-for="item in mergedList"
      :key="item.key"
      :data="item"
    ></ListItem>
  </div>
</template>

<script>
import {
  now,
  each,
  first,
  filter,
  includes,
  groupBy,
  map,
  remove,
} from 'lodash';
import { mapGetters, mapMutations, mapActions } from 'vuex';
import ajax from '@/common/js/ajax';
import WS from '@/common/js/WS';
import Header from './Header/Index';
import Footer from './Footer/Index';
import ListItem from './ListItem';

export default {
  components: {
    Header,
    Footer,
    ListItem,
  },
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
      // 数据最终时间
      currentTimeMillis: null,
      timer: null,
    };
  },
  computed: {
    ...mapGetters('KDS', ['config', 'remindConfig', 'filter', 'dishes']),
    mergedList() {
      return map(groupBy(this.dishes, item => [
        item.scId,
        item.kitchenFlg,
      ]), (list, key) => {
        const firstItem = first(list);
        return {
          key,
          scId: firstItem.scId,
          kitchenFlg: firstItem.kitchenFlg,
          callUpTimeTimeStamp: firstItem.callUpTimeTimeStamp,
          warnTime: firstItem.warnTime,
          standardTime: firstItem.standardTime,
          pointAreaId: firstItem.pointAreaId,
          saleTypeId: firstItem.saleTypeId,
          orderCode: firstItem.orderCode,
          deFromName: firstItem.deFromName,
          sn: firstItem.sn,
          pointName: firstItem.pointName,
          sizeId: firstItem.sizeId,
          sizeName: firstItem.sizeName,
          itemName: firstItem.itemName,
        };
      });
    },
    currentMode() {
      const { posId, loginMode } = this.$route.query;
      let confirm = '';
      let confirmSuccessMessage = '';
      let reload = '';
      let websocket = '';
      if (loginMode === '0') {
        confirm = 'canyin.kitchen.kitchencookmode.updatewhencompletecook';
        reload = 'canyin.kitchen.kitchencookmode.getallitemforcommoncookmode';
        websocket = '/websocket/cookmodewebsocketserver';
        confirmSuccessMessage = '配菜成功';
      }
      if (loginMode === '1') {
        confirm = 'canyin.kitchen.kitchenservemode.updatewhencompleteserve';
        reload = 'canyin.kitchen.kitchenservemode.getallitemforcommonservemode';
        websocket = '/websocket/servemodewebsocketserver';
        confirmSuccessMessage = '传菜成功';
      }
      return {
        mode: loginMode,
        posId,
        confirmSuccessMessage,
        api: {
          confirm,
          reload,
          websocket,
        },
      };
    },
    isNeedCount() {
      return (this.currentMode.mode === '0'
      && (this.config.countPrepareEmp || this.config.countCookEmp))
      || (this.currentMode.mode === '1' && this.config.countServeEmp);
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.setMode(vm.$route.query.loginMode);
      vm.initBaseInfo();
      vm.initKitchenInfo();
      vm.startTimer();
    });
  },
  mounted() {
    this.$von('dishCalling', (data, type) => {
      this.dishesCalling(data, type);
    });
    this.$von('removeCalling', (scId) => {
      remove(this.callingList, n => n.id === scId);
    });
    // 扫码
    this.$quickinput((str) => {
      // 扫码枪
      if (
        this.config.barcodeScanner
        && this.currentMode.mode === '1'
        && str.length === 13
      ) {
        ajax('canyin.kitchen.kitchenservemode.updatewhencompleteservebyscanbarcode', {
          contentType: 'json',
          data: { barcode: str, authCard: null },
        }).then((data) => {
          console.log('scannerServe data', data);
          this.$message.success('传菜成功');
        });
      }
      // 员工卡
      if (this.isNeedCount && str.length >= 6 && str.length !== 13) {
        this.$vemit('getAuthInfo', str);
      }
    });
  },
  methods: {
    ...mapActions('KDS', ['setBaseInfo', 'setKitchenInfo', 'startTimer', 'updateDishes']),
    ...mapMutations('order', {
      kitchenInit: 'KITCHEN_INIT',
    }),
    ...mapMutations({
      setLocale: 'SET_LOCALE',
    }),
    ...mapMutations('KDS', {
      setMode: 'SET_MODE',
      clearChecked: 'CLEAR_CHECKED',
      setDishes: 'SET_DISHES',
      deleteDishes: 'DELETE_DISHES',
      cancelOrder: 'CANCEL_ORDER',
      changeHasten: 'CHANGE_HASTEN',
      changeTable: 'CHANGE_TABLE',
      changeKitchenFlg: 'CHANGE_KITCHENFLG',
      changeDiscFlg: 'CHANGE_DISCFLG',
      changeLastQty: 'CHANGE_LASTQTY',
      updateChecked: 'UPDATE_CHECKED',
      toggleServer: 'READY_TO_SERVER',
      updatePeopleQty: 'UPDATE_PEOPLEQTY',
    }),
    initWebsocket(path) {
      this.kitchenWebSocket = new WS(`${path}${this.currentMode.api.websocket}`, {
        doStatus: (event) => {
          this.$vemit('changeStatus', event);
        },
        message: (message) => {
          console.log('websocket', message);
          this.currentTimeMillis = message.currentTimeMillis;
          switch (message.method) {
            case 'cookInfoAdd': // 前台加单菜品进入配菜
            case 'serveInfoAdd': // 配菜完成菜品进入传菜
              this.addDishes(message.data);
              break;
            case 'cancelRecord': // 撤销
              this.addDishes(message.data, true);
              break;
            case 'cookInfoDelete': // 配菜完成删除菜品
            case 'serveInfoDelete': // 传菜完成删除菜品
              this.deleteDishes(message.data);
              break;
            case 'cancelOrder': // 退菜消息
              this.cancelOrder(message.data);
              break;
            case 'hasten': // 催菜
              this.changeHasten(message.data);
              break;
            case 'tranItem': // 单品转台
            case 'modifyPoint': // 换台
              this.changeTable(message.data);
              break;
            case 'callUp': // 起菜
              this.changeKitchenFlg(message.data);
              break;
            case 'cancelCookRecord': // 配菜
              if (this.config.liandong) {
                this.deleteDishes(message.data);
              } else {
                this.changeKitchenFlg(message.data);
              }
              break;
            case 'transferBills': // 转账
            case 'present': // 赠菜
              this.changeDiscFlg(message.data);
              break;
            case 'confirmWeigh': // 称重确认
              this.changeLastQty(message.data);
              break;
            case 'doReadyToServe': // 传菜准备
              console.log('xxxxxxxxxxxxxxx', message.data);
              this.updateChecked({
                check: message.data,
              });
              this.toggleServer({
                kscIds: message.data,
                type: 4,
              });
              break;
            case 'cancelReadyToServe': // 取消传菜准备
              console.log('xxxxxxxxxxxxxxx', message.data);
              this.updateChecked({
                unCheck: message.data,
              });
              this.toggleServer({
                kscIds: message.data,
                type: '',
              });
              break;
            case 'updatePeopleQty': // 更新人数
              this.updatePeopleQty(message.data);
              break;
            default:
              break;
          }
        },
      });
    },
    initDevices() {
      this.$devices.init({
        onError: () => {
          this.$log.info(this.$t('Biz.Order.DevicesWarnMsg01'));
        },
      });
    },
    initBaseInfo() {
      ajax('canyin.kitchen.kitchenindex', {
        contentType: 'json',
      }).then((data) => {
        this.kitchenInit({
          mode: this.currentMode.mode === '0' ? 'COOK' : 'SERVE',
          linkage: data.liandong === '0',
          kitchenMode: data.kitchenMode,
        });
        this.setBaseInfo(data);
        this.setLocale(data.currentLanguage);
        this.initWebsocket(data.WS_CONTEXTPATH);
        this.initDevices();
        this.setEvents();
      });
    },
    filterList(list) {
      const {
        dishes, areas, smallClasses, saleTypes,
      } = this.filter;
      return filter(list, (item) => {
        const itemIdValidate = dishes
          && dishes.length
          && (
            includes(dishes, item.itemId)
            || item.tempItemName != null
          );
        const smallClassIdValidate = smallClasses
          && smallClasses.length
          && includes(smallClasses, item.smallClassId);
        const areaIdValidate = !item.pointAreaId
          || item.pointAreaId === '9'
          || item.pointAreaId === '10'
          || !areas.length
          || includes(areas, item.pointAreaId);
        const saleTypeValidate = includes(saleTypes, item.saleTypeId);
        return (itemIdValidate || smallClassIdValidate)
          && areaIdValidate && saleTypeValidate;
      });
    },
    addDishes(list, dontCalling) {
      const filtered = this.filterList(list);
      if (filtered.length) {
        this.setDishes(filtered);
        if (!dontCalling) {
          this.calling({ busiCode: 0 });
        }
      }
    },
    initKitchenInfo() {
      const { filterId, posId, loginMode } = this.$route.query;
      ajax('canyin.kitchen.kitcheninfoinit.getkcallinfoforinitdisplay', {
        contentType: 'json',
        data: {
          itemfilterId: filterId,
          posId,
          loginMode,
          noDishes: true,
        },
      }).then((data) => {
        this.setKitchenInfo(data);
        if (Math.abs(data.serverTime / 1000 - Date.parse(new Date()) / 1000) > 60 * 5) {
          this.$message.error(this.$t('Dict.SysTimeErrorMessage2'));
        }
        this.reloadData();
      });
    },
    reloadData() {
      const { filterId, posId, loginMode } = this.$route.query;
      ajax(this.currentMode.api.reload, {
        contentType: 'json',
        data: {
          itemfilterId: filterId,
          posId,
          loginMode,
        },
      }).then((data) => {
        if (!this.currentTimeMillis || data.currentTimeMillis > this.currentTimeMillis) {
          this.updateDishes(this.filterList(data.data));
        }
      });
    },
    setEvents() {
      this.$tcsl.fullScreen(true);
      this.$hotKey.init();
      this.$hotKey.set('kds.main', {
        BackSpace: (event) => {
          this.$vemit('kdsSearchText', 'BackSpace', event);
        },
        F1: () => {
          this.$vemit('kdsSwitchType', 'F1');
        },
        F2: () => {
          this.$vemit('kdsSwitchType', 'F2');
        },
        'F11.ctrl': () => {
          this.toggleFullScreen();
        },
        '←.ctrl': () => {
          this.$vemit('turnPageLR', 'left');
        },
        '→.ctrl': () => {
          this.$vemit('turnPageLR', 'right');
        },
        '↑.ctrl': () => {
          this.$vemit('turnPageUD', 'up');
        },
        '↓.ctrl': () => {
          this.$vemit('turnPageUD', 'down');
        },
        ...this.setKeySearchHotKey(),
      });
      this.$von('confirm', (kscIds) => {
        this.confirm(kscIds);
      });
    },
    setKeySearchHotKey() {
      // 如果开启扫码传菜，关闭搜索快捷键
      if (this.config.barcodeScanner) {
        return {};
      }
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      each(searchKeys, (key) => {
        keysObj[key] = (event) => {
          this.$vemit('kdsSearchText', key, event);
        };
      });
      return keysObj;
    },
    // 切换全屏状态
    toggleFullScreen() {
      if (this.isFullScreen) {
        this.$tcsl.fullScreen(false);
      } else {
        this.$tcsl.fullScreen(true);
      }
      this.isFullScreen = !this.isFullScreen;
    },
    // 打印
    print(printList) {
      each(printList, (item) => {
        if (item.printData && item.printType === 'PRINT_PARALLEL') {
          this.$devices.Printer.print(item.printData);
        }
      });
    },
    /**
     * 传菜/配菜
     * params = {  kcKscIdList, scIdList };
     */
    confirm(params = {}) {
      // Todo: 判断绩效统计
      const { posId, api } = this.currentMode;
      ajax(api.confirm, {
        contentType: 'json',
        data: {
          posId,
          ...params,
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
        this.$message.success(this.currentMode.confirmSuccessMessage);
        this.clearChecked();
        if (this.currentMode.mode === '1' && this.remindConfig.serveDone) {
          this.calling({ busiCode: 3 });
        }
        if (this.config.autoClearKey) {
          this.$vemit('clearSearchText');
        }
      });
    },
    dishesCalling(dish, busiCode) {
      let count = 1;
      if (busiCode === 5 || busiCode === 6) {
        count = this.remindConfig.timeout.times;
      } else if (busiCode === 7) {
        count = this.remindConfig.hasten.times;
      }
      this.calling({
        busiCode,
        id: dish.scId,
        text: this.getCallingText(dish, busiCode),
        count,
      });
    },
    getCallingText(dish, type) {
      let typeText = '';
      if (type === 5) {
        typeText = '即将超时';
      } else if (type === 6) {
        typeText = '已超时';
      } else if (type === 7) {
        typeText = '催菜';
      }
      const { pointAreaId, saleTypeId } = dish;
      const orderCode = dish.orderCode ? dish.orderCode : '未输入';
      let name = '';
      if (pointAreaId === '9') {
        if (saleTypeId === 3) {
          name = `外卖${orderCode}号`;
        } else if (saleTypeId === 2) {
          name = `外带${orderCode}号`;
        } else {
          name = `${orderCode}号`;
        }
      } else if (pointAreaId === '10') {
        name = `${dish.deFromName}${dish.sn}号`;
      } else {
        name = `${dish.pointName}客位`;
      }
      return `请注意，${name},${dish.sizeId !== '-1' ? dish.sizeName : ''}${dish.itemName}${typeText}`;
    },
    /**
     * 添加一条语音
     * @param {Array} arr 叫号数组 内部：
     * {
     *   busiCode: 业务类型 0 为固定mp3文件 567见代码
     *   callingId: 对应View的cid
     *   text: 语音内容
     *   count: 连续播放次数
     * }
     */
    calling(params) {
      if (params.busiCode === 0) {
        this.addCalling({
          type: 'file',
          file: '/static/media/dining.mp3',
        });
      } else if (params.busiCode === 1) {
        this.addCalling({
          busiCode: 1,
          type: 'data',
          text: params.text,
          fileName: params.fileName,
          posId: params.posId,
          count: 1,
          saveFile: true,
        });
      } else if (params.busiCode === 3) {
        this.addCalling({
          type: 'file',
          file: '/static/media/serve-end.mp3',
          toHead: true,
        });
      } else {
        this.addCalling({
          busiCode: params.busiCode,
          type: 'data',
          text: params.text,
          id: params.id,
          count: params.count,
          saveFile: false,
        });
      }
    },
    // 添加一条语音并开始播放
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
      } else if (params.type === 'data') {
        ajax('canyin.speech.speech.synthesis', {
          loading: false,
          contentType: 'URLEncoded',
          data: {
            busiCode: params.busiCode,
            fileName: params.fileName,
            text: params.text,
            posId: params.posId,
            saveFile: !!params.saveFile,
          },
        }).then((res) => {
          if (params.saveFile) {
            data.file = this.HTTP_CONTEXTPATH + res.fileName;
          } else {
            data.file = `data:audio/x-mp3;base64,${res.data}`;
          }
          this.callingList.push(data);
          this.playCalling();
        });
      }
    },
    /**
     * 语音叫号
     */
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
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.kds-page {
  position: relative;
  height: 100%;
  padding-top: @kds-main-header-height;
  padding-bottom: @kds-main-footer-height;
}

.header,
.footer {
  position: absolute;
  left: 0;
  width: 100%;
  background-color: #313341;
}

.header {
  top: 0;
  height: @kds-main-header-height;
}

.content {
  height: 100%;
}

.footer {
  bottom: 0;
  height: @kds-main-footer-height;
}
</style>
