<template>
  <div class="pos-takeout-container">
    <div class="pos-takeout-header">
      <h3 class="pos-takeout-title">{{$t('Biz.Pos.Takeout.TakeoutMsg070')}}</h3>
      <div class="pos-takeout-state">
        <strong>{{$t('Biz.Pos.Takeout.TakeoutMsg071')}}</strong>
        <i18n path="Biz.Pos.Takeout.TakeoutMsg072" tag="span">
          <em place="businessCount">{{ businessData.businessCount }}</em>
        </i18n>
        <span>{{$t('Biz.Pos.Takeout.TakeoutMsg073')}}<em>{{ businessData.sumPayAmount }}</em></span>
      </div>
      <div class="pos-takeout-btn">
        <el-switch
          id="posTakeoutAutoAccept"
          v-model="autoAccept"
          active-color="#0babb9"
          inactive-color="#666"
          @change="setAutoAccept">
        </el-switch>
        <strong @click="toggleAutoAccept">{{$t('Biz.Pos.Takeout.TakeoutMsg074')}}</strong>
      </div>
    </div>
    <div class="pos-takeout-content">
      <ul class="pos-takeout-nav">
        <li>
          <router-link to="/pos/takeout/new" active-class="active">
            <i class="icon icon-pos-takeout-new"></i>
            <span>{{$t('Dict.NewOrder')}}</span>
            <em v-if="newTotal > 0">{{ newTotal }}</em>
          </router-link>
        </li>
        <li>
          <router-link to="/pos/takeout/back" active-class="active">
            <i class="icon icon-pos-takeout-back"></i>
            <span>{{$t('Dict.Chargeback')}}</span>
            <em v-if="backTotal > 0">{{ backTotal }}</em>
          </router-link>
        </li>
        <li>
          <router-link to="/pos/takeout/handling" active-class="active">
            <i class="icon icon-pos-takeout-handling"></i>
            <span>{{$t('Dict.InProcessing')}}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/pos/takeout/history" active-class="active">
            <i class="icon icon-pos-takeout-history"></i>
            <span>{{$t('Dict.HistoricalOrder')}}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/pos/takeout/abnormal" active-class="active">
            <i class="icon icon-pos-takeout-abnormal"></i>
            <span>配送异常</span>
            <em v-if="abnormalTotal > 0">{{ abnormalTotal }}</em>
          </router-link>
        </li>
        <li>
          <router-link to="/pos/takeout/abnormal" active-class="active">
            <i class="icon icon-pos-takeout-abnormal"></i>
            <span>配送异常</span>
            <em v-if="abnormalTotal > 0">{{ abnormalTotal }}</em>
          </router-link>
        </li>
      </ul>
      <div class="pos-takeout-main">
        <router-view ref="takeOut"></router-view>
      </div>
    </div>
    <PayErrorDialog :result="result" ref="payErrorDialog"></PayErrorDialog>
    <AfterPayErrorDialog :result="result" ref="afterPayErrorDialog"></AfterPayErrorDialog>
  </div>
</template>

<script>
import Vue from 'vue';
import { Switch } from 'element-ui';
import 'element-ui/lib/theme-chalk/switch.css';
import { mapGetters } from 'vuex';
import { each, debounce, includes } from 'lodash';
import ajax from '@/common/js/ajax';
import {
  ERR_OK, INIT_PAGER,
} from '@/common/api/takeoutConfig';
import PayErrorDialog from '@/components/Pos/Takeout/Base/payErrorDialog';
import AfterPayErrorDialog from '@/components/Pos/Takeout/Base/payErrorDialog';

Vue.use(Switch);

export default {
  components: { PayErrorDialog, AfterPayErrorDialog },
  data() {
    return {
      autoAccept: false,
      ifAutoConfirm: '0',
      businessData: {},
      newTotal: 0,
      backTotal: 0,
      abnormalTotal: 0,
      result: {},
      businessCountData: '',
      isOpenScanPay: false,
    };
  },
  computed: {
    ...mapGetters(['posInfo']),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$hotKey.set('Pos.Takeout', {});
      vm.controlTakeout();
      vm.getOrderBussiness();
    });
  },
  created() {
    this.queryOrderSet();
    // 监听刷新营业信息
    this.$von('refreshBussinessData', () => {
      this.getOrderBussiness();
    });
    // 扫码付窗口是否打开
    this.$von('payWayScanModalStatus', (data) => {
      this.isOpenScanPay = data;
      console.info('状态', data);
    });
  },
  mounted() {
    // 屏幕大小改变 重新计算高度获取列表
    window.addEventListener('resize', debounce(() => {
      if (this.$refs.takeOut) {
        this.$refs.takeOut.calculateLimit();
        this.$refs.takeOut.getOrderList(INIT_PAGER);
        this.$refs.takeOut.$refs.pager.init();
      }
    }, 1000));
    // 扫码核销
    this.$quickinput((str) => {
      console.log('扫码自提', str);
      // 防止扫码支付 和 自提冲突 做路由判断 和 窗口打开/关闭状态判断
      if (includes(this.$route.name, 'takeout.') && !this.isOpenScanPay) {
        this.selfGetOrder(str);
      }
    });
  },
  methods: {
    // 外卖角标控制
    controlTakeout() {
      const onRefreshMethods = ['refreshNewOrder', 'refreshRefundOrder', 'refreshTakeoutState', 'refreshBussinessData', 'refreshSendWarnChange'];
      this.getTakeoutCount();
      // 监听数据变化 刷新角标
      each(onRefreshMethods, (method) => {
        this.$von(method, () => {
          this.getTakeoutCount();
        });
      });
    },
    // 刷新新订单、退单合配送异常角标
    getTakeoutCount() {
      if (!this.posInfo.id) return;
      ajax('canyin.takeout.takeoutview.getposbusinessdata', {
        params: {
          posId: this.posInfo.id,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.businessCountData = res.data.data;
            this.newTotal = this.businessCountData.takeOutNewCount;
            this.backTotal = this.businessCountData.takeOutRefundCount;
            this.abnormalTotal = this.businessCountData.takeOutSendWarn;
            // 将外卖总数派发
            this.$vemit('takeOutCount', this.businessCountData.takeOutCount);
          } else {
            this.$message.error(res.data.msg);
          }
        });
    },
    // 获取外卖营业情况
    getOrderBussiness() {
      ajax('canyin.takeout.takeoutview.takeoutorderbusiness')
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.businessData = res.data.data.businessData;
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    // 查询外卖设置（是否自动接单）
    queryOrderSet() {
      ajax('canyin.takeout.takeoutorder.querytakeoutorderset')
        .then((res) => {
          if (res.data.code === ERR_OK) {
            switch (res.data.data.ifAutoConfirm) {
              case '0':
                this.autoAccept = false;
                break;
              case '1':
                this.autoAccept = true;
                break;
              default:
                this.autoAccept = false;
                break;
            }
          } else {
            this.$message.error(res.data.msg);
            this.autoAccept = false;
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    // 更新外卖设置（是否自动接单）
    updateOrderSet() {
      ajax('canyin.takeout.takeoutorder.updatetakeoutset', {
        params: {
          key: 'ifAutoConfirm',
          value: this.ifAutoConfirm,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            switch (this.autoAccept) {
              case true:
                this.$message.success(this.$t('Biz.Pos.Takeout.TakeoutMsg075'));
                break;
              case false:
                this.$message.success(this.$t('Biz.Pos.Takeout.TakeoutMsg076'));
                break;
              default:
                this.$message.success(res.data.msg);
                break;
            }
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    // 自动接单
    toggleAutoAccept() {
      this.autoAccept = !this.autoAccept;
      if (!this.autoAccept) {
        this.ifAutoConfirm = '0';
      } else {
        this.ifAutoConfirm = '1';
      }
      this.updateOrderSet();
    },
    // switch change事件
    setAutoAccept() {
      if (!this.autoAccept) {
        this.ifAutoConfirm = '0';
      } else {
        this.ifAutoConfirm = '1';
      }
      this.updateOrderSet();
    },
    // 自提核销
    selfGetOrder(str) {
      ajax('canyin.takeout.takeoutorder.checkoutselforder', {
        contentType: 'json',
        data: {
          deNo: str,
        },
      }).then((res) => {
        console.info('自提核销', res);
        this.$message.success(res.msg);
        this.$refs.takeOut.getOrderList(this.$refs.takeOut.currentPager);
      }).catch((err, msg) => {
        this.$message.error(msg);
      });
    },
  },
  watch: {
    'posInfo.id': function (id) {
      if (id) {
        this.getTakeoutCount();
      }
    },
    autoAccept(value) {
      this.$vemit('autoAcceptNewOrder', value);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-takeout-container {
  position: relative;
  height: 100%;
  padding-top: 62px;
  padding-bottom: 8px;
}

.pos-takeout-header {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 12px;
  .size(100%, 54px);
}

.pos-takeout-title {
  position: absolute;
  left: 0;
  top: 0;
  .size(auto, 54px);
  padding-left: 26px;
  line-height: 54px;
  font-size: 18px;
  color: white;
  font-weight: 900;
}

.pos-takeout-state {
  position: absolute;
  left: 120px;
  top: 8px;
  margin-left: 24px;
  padding: 10px 20px;
  font-weight: 900;
  color: white;
  border: none;
  border-radius: 24px;
  background-color: rgba(0,0,0,0.5);

  > span {
    margin-right: 20px;

    > em {
      padding-left: 10px;
      padding-right: 10px;
      font-style: normal;
    }
  }
}

.pos-takeout-btn {
  position: absolute;
  top: 8px;
  right: 340px;
  height: 40px;
  color: white;
  border-radius: 25px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;

  > strong {
    cursor: pointer;
  }
}

.pos-takeout-content {
  position: relative;
  height: 100%;
  padding-left: 90px;
}

.pos-takeout-nav {
  position: absolute;
  left: 10px;
  top: 0;
  .size(80px, 100%);
  background-color: rgba(0, 0, 0, 0.65);

  > li > a {
    position: relative;
    display: block;
    height: 80px;
    padding-top: 10px;
    text-align: center;
    color: #d9dbdc;
    text-decoration: none;

    > i.icon,
    > span {
      display: block;
    }

    > i.icon {
      height: 30px;
      line-height: 30px;
      font-size: 26px;
    }
    > span {
      height: 20px;
      line-height: 20px;
    }

    > em {
      position: absolute;
      right: 20px;
      top: 8px;
      display: block;
      .square(16px);
      border-radius: 50%;
      font-size: 12px;
      line-height: 16px;
      font-style: normal;
      color: @white;
      background-color: #fe4644;
    }

    &.active {
      background-color: #0babb9;
      color: white;
      &::after {
        position: absolute;
        top: 24px;
        right: -24px;
        content: '';
        display: block;
        width: 0;
        height: 0;
        border-top: 12px solid transparent;
        border-left: 12px solid #0babb9;
        border-bottom: 12px solid transparent;
        border-right: 12px solid transparent;
      }
    }
  }

  > li:first-child > a {
    height: 74px;
    padding-top: 14px;
  }
}

.pos-takeout-main {
  height: 100%;
}
.lang-enUS{
  .pos-takeout-state {
    position: absolute;
    left: 220px;
    top: 8px;
    font-size: 12px;
    padding: 10px 15px;
    > span {
      margin-right: 10px;

      > em {
        padding-left: 10px;
        padding-right: 0;
        font-style: normal;
      }
    }
  }
  .pos-takeout-title {
    font-size: 14px;
  }
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-takeout-window {
  height: 100%;
  position: relative;
  padding-right: 343px;
}

.pos-takeout-control {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding-left: 18px;
  padding-right: 363px;

  > button.btn {
    float: left;
    margin-left: 8px;
    .size(80px, 38px);
    border: none;
    background-color: #9dc1ca;
    color: #273844;
    &:hover {
      background-color: #9dc1ca;
    }
  }

  .pos-pager {
    float: right;
  }
}

.pos-takeout-preview {
  position: absolute;
  right: 12px;
  top: -62px;
  .size(320px, 111%);
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 3px 3px 0 0;

  .pos-takeout-wrapper {
    position: relative;
    height: 100%;
  }
}
</style>
