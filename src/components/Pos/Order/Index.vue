<template>
  <div class="pos-order-container">
    <Bill ref="bill"
    @isCanClickAddbtn="isCanClickAddbtn"
    ></Bill>
    <div class="pos-order-right">
      <Tables
        ref="tables"
      ></Tables>
    </div>
    <Pay ref="orderingPay"></Pay>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import ajax from '@/common/js/ajax';
import newWeightUnitConversion from '@/common/js/newWeightUnitConversion';
import Bill from './Bill';
import Tables from './Tables';
import Pay from './Bill/Pay';

export default {
  components: { Tables, Bill, Pay },
  data() {
    return {
      prohibitionAddClick: false, // 加单快捷键是否可以使用,默认可以使用
    };
  },
  props: {
    connectState: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters(['posBaseInfo', 'posDevice', 'posFastFood', 'posOrderBill', 'setting', 'getIsNeedTableWsHandle']),
  },
  // 路由守卫console.log()
  beforeRouteEnter(to, from, next) {
    // 修改预点单做的处理
    // console.log(to, from);
    if (from.path === '/pos/reserve' && to.params && to.params.orderingData) {
      ajax('canyin.pos.bill.pointbsinfo', {
        loading: false,
        params: {
          pointId: to.params.pointId,
        },
      }).then((res) => {
        if (+res.data.code === 1) {
          next((vm) => {
            if (vm.connectState === false) {
              vm.$refs.tables.intervalRefreshTables();
            }
            vm.setETagItems([]);
            // if (from.path === '/pos') {
            //   vm.initOrderData();
            //   vm.resetSearchText();
            // }
            vm.$vemit('changeOrderingState', true);
            vm.setReserveOrderList(null);
            // let reservePointData = Object.assign({}, res.data.data, { reserveData: to.params })
            if (to.params) {
              vm.setReserveOrderList(to.params);
            }
            vm.getOrderBill({ list: res.data.data });
            vm.$router.push(`/pos/order/${to.params.pointId}`);
            if (from.path === '/pos') {
              vm.resetSearchText();
            }
            vm.setHotKey();
            vm.$vemit('resetOrderSearchText');
          });
        } else {
          // 失败在调回预点界面
          to.params.reserveErrorFn();
          return false;
          // vm.$message.error('修改进入点餐界面失败从重新修改')
          // vm.$router.push("/pos/reserve/")
        }
        return '';
      });
    } else {
      next((vm) => {
        // 打开对客位有关的推送
        if (!vm.getIsNeedTableWsHandle && from.path !== '/' && from.path !== '/pos') {
          // 重新获取最新的客显示状态
          vm.$refs.tables.updateTables(vm.setIsNeedTableWsHandle(true));
          // 设置消费时长
          vm.$refs.tables.setSpendTimeTimerSwitch(true);
        } else if (!vm.getIsNeedTableWsHandle) {
          vm.setIsNeedTableWsHandle(true);
        }
        // 判断下 客位有关的推送是否挂掉
        if (vm.connectState === false) {
          vm.$refs.tables.intervalRefreshTables();
        }
        if (from.path === '/pos' || from.path === '/') {
          vm.resetSearchText();
          vm.$vemit('changeClock');
        }
        vm.$vemit('changeOrderingState', true);
        vm.setReserveOrderList(null);// 如果不是 把修改预点单的数据就复位空null
        vm.orderInit();
        if (from.path === '/pos') {
          vm.resetSearchText();
        }
        vm.setHotKey();
        // 如果是从加单界面过来的话需要每次重制下搜索框的text
        if (from.params.tableId) {
          vm.$vemit('clearSearch');
        }
        vm.$vemit('refreshTableFlterPager');
        // vm.$vemit('resetOrderSearchText');
      });
    }

    // next(vm => {
    //   //如果是从预点单过来的 并且还有修改的数据 这个是修改预点单过来的
    //   if(from.path == '/pos/reserve' && to.params && to.params.orderingData) {
    //     vm.$vemit('loadBill',to.paramspointId)
    //   }
    //   vm.orderInit()
    //   // vm.$vemit('tableInput')
    //   // vm.$vemit('posOrderTablesListInitPager')
    //   // console.log(vm.)
    // })
  },
  created() {
    this.$von('pay', (data) => {
      this.$refs.orderingPay.open(data);
    });
    // 执行电子秤自动称重的指令
    this.isNewWeightOpenFun();
    this.$von('orderStartAutoWeight', () => {
      this.isNewWeightOpenFun();
    });
  },
  beforeRouteLeave(to, from, next) {
    // 关闭对客位有关的推送
    this.setIsNeedTableWsHandle(false);
    this.$refs.tables.setSpendTimeTimerSwitch(false);
    this.$refs.tables.clearRefreshTables();
    // this.setTablesClone([]);
    next();
  },
  methods: {
    // 设置热键
    setHotKey() {
      this.$hotKey.set('Pos.Order', {
        ...this.setKeySearchHotKey(),
        '↑': () => {
          this.$vemit('tableSelect', '↑');
        },
        '↓': () => {
          this.$vemit('tableSelect', '↓');
        },
        '←': () => {
          this.$vemit('tableSelect', '←');
        },
        '→': () => {
          this.$vemit('tableSelect', '→');
        },
        BackSpace: () => {
          this.$vemit('delOrderSearchTextdInBlur');
        },
        // 开台 (2期)
        '/': () => {
          setTimeout(() => {
            // 如果是空闲客位执行开台
            if (!this.posOrderBill) {
              this.$vemit('posAddBill', this.$refs.tables.$refs.list.activePoint);
            }
          }, 500);
        },
        // 加单
        '+': () => {
          // 如果开启多次结算禁止加单事件的执行
          if (this.prohibitionAddClick) {
            return false;
          }
          if (!this.$refs.bill.$refs.orderControl) return false;
          this.$refs.bill.$refs.orderControl.order();
          // this.$vemit('resetOrderSearchText')
          return undefined;
        },
        // 回车键 如果是占用客位则加单，如果是空闲客位则开台
        Enter: () => {
          setTimeout(() => {
            if (this.posOrderBill) {
              // 占用客位
              this.$refs.bill.$refs.orderControl.order();
            } else {
              // 空闲客位
              this.$vemit('posAddBill', this.$refs.tables.$refs.list.activePoint);
            }
          }, 500);
        },
        // Esc 键 清空客位搜索
        Esc: () => {
          this.$vemit('resetOrderSearchText');
        },
        // 结算
        '*': () => {
          if (!this.$refs.bill.$refs.orderControl) return;
          if (this.posBaseInfo && +this.posBaseInfo.controlMode === 2) {
            this.$refs.bill.$refs.orderControl.discountedKnot();
          } else {
            this.$refs.bill.$refs.orderControl.pay();
          }
        },
      });
    },
    isCanClickAddbtn(data) {
      this.prohibitionAddClick = data;
    },
    // 设置搜索热键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          this.inputKey(item);
        };
      });
      return keysObj;
    },
    // 在输入框里添加搜索文本
    inputKey(key) {
      this.$vemit('addOrderSearchTextdInBlur', key);
    },
    // 重置搜索文字
    resetSearchText() {
      this.$vemit('resetOrderSearchText');
    },
    orderInit() {
      this.$vemit('posOrderTablesListInitPager');
    },
    // 电子秤
    isNewWeightOpenFun() {
      if (this.posDevice.enableScale && this.posDevice.isNetWeight
      && this.posDevice.isSupportNewWeight) {
        const that = this;
        setTimeout(() => {
          that.$devices.Scale.autoWeighStart((data) => {
            const newData = data;
            if (+newData.returnCode === -1) {
              that.$message.error(`${that.$t('Biz.Order.WeightItemErrorMsg') + newData.returnText}`);
            } else {
              newData.autoWeighNetValue = newData.autoWeighNetValue ? newWeightUnitConversion(newData.autoWeighNetValue, this.setting) : 0;
              newData.autoWeighTareValue = newData.autoWeighTareValue ? newWeightUnitConversion(newData.autoWeighTareValue, this.setting) : 0;
              // vuex 实时存储电子秤的数据
              this.setNewWeightData(newData);
            }
          });
        }, 200);
      }
    },
    ...mapMutations({
      setReserveOrderList: 'SET_RESERVEORDER_LIST',
      setNewWeightData: 'SET_NEWWEIGHTDATA',
      setOrderInfo: 'SET_ORDER_INFO',
      setItemInfo: 'SET_ITEM_INFO',
      setETagItems: 'SET_ETAG_ITEMS',
      setIsNeedTableWsHandle: 'SET_ISNEED_TABLE_WsHANDLE',
      // setTablesClone: 'SET_TABLES_CLONE',
    }),
    ...mapActions([
      'getOrderBill',
      'setTableInfo',
    ]),
  },
  watch: {
    connectState(data) {
      if (typeof (data) === 'boolean') {
        if (data) {
          // 如果客位有关的推送链接话需要清空定时轮询 查询客位状态的接口
          this.$refs.tables.clearRefreshTables();
        }
        // 如果客位有关的推送断开了链接话需要开启定时轮询 查询客位状态的接口
        if (!data && this.$route.name === 'order') {
          this.$refs.tables.intervalRefreshTables();
        }
      }
    },
  },
};
</script>


<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

//== right padding horizontal
@pos-right-padding-horizontal: 12px;

.pos-order-container {
  position: relative;
  height: 100%;
  padding-left: @pos-order-left-width;
}
.pos-order-right {
  height: 100%;
  padding-left: @pos-right-padding-horizontal;
  padding-right: @pos-right-padding-horizontal;
}
.lang-enUS {
  .pos-order-container {
    padding-left: 390px;
  }
}
</style>
