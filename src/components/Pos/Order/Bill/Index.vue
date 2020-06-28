<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-03-19 17:01:42
 * @LastEditTime: 2019-08-09 17:00:18
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div class="pos-order-left">
    <div class="pos-order-window">
      <div
        class="pos-order-bill"
        :class="{
          'has-crmInfo': posOrderBill
            && (
              posOrderBill.crmMemberQueryData
              && posOrderBill.crmMemberQueryData.data
              || posOrderBill.mingchenQueryData
              && posOrderBill.mingchenQueryData.data
            )
        }"
      >
        <div class="pos-order-bill-welcome" v-if="posOrderBill == null">
          <img src="~@/common/images/pos/bill/welcome-icon.png">
          <!-- 国际化：在右侧选择一个桌台， -->
          <p>{{$t('Biz.Order.SelectTable')}}</p>
          <!-- 国际化：开始营业吧 -->
          <p>{{$t('Biz.Order.StartBusiness')}}</p>
        </div>
        <template v-show="posOrderBill">
          <Info></Info>
          <CrmInfo
            v-if="posOrderBill
              && (
                posOrderBill.crmMemberQueryData
                && posOrderBill.crmMemberQueryData.data
                || posOrderBill.mingchenQueryData
                && posOrderBill.mingchenQueryData.data
              )"
          ></CrmInfo>
          <List
            v-if="posOrderBill"
            ref="billList"
            :scList = "posOrderBill.scList"
            :ordering="false"
            :guestList="guestList"
          ></List>
          <Control
            ref="orderControl"
            v-show="posOrderBill"
            :ordering="false"
            :lastTotal="lastTotal"
            @isCanAddbtn="isCanAddbtn"
          ></Control>
        </template>
      </div>
      <BillBtns
        :billFunctionsTest="billOrderBtns"
        @billFunction="billFunction"
      >
      </BillBtns>
    </div>
    <Revoke ref="revoke"></Revoke>
    <Give ref="give"></Give>
    <Hasten ref="hasten"></Hasten>
    <Serving ref="serving"></Serving>
    <Served  ref="served"></Served>
    <Transfer ref="transfer"></Transfer>
    <ChangePrice ref="changePrice"></ChangePrice>
    <ConfirmWeight ref="confirmWeight"></ConfirmWeight>
    <CheckingBills ref="checkingBills" :checkData="checkData"></CheckingBills>
    <div ref="printGuestList"></div>
    <ChangeWaiter ref="changeWaiter"></ChangeWaiter>
    <Other ref="other"></Other>
    <MoreBillBtns
      ref="moreBillBtns"
      @billFunction="billFunction"
      :moreBillFunctionsTest="billMoreOrderBtns">
     </MoreBillBtns>
    <ModifyItemSize
      ref="modifyItemSize"
      @choiceSize="modifyItemSizeCallBack"
      submitId="billModifyItemSize">
    </ModifyItemSize>
    <!-- <OrderingPay ref="orderingPay"></OrderingPay> -->
    <OrderingVerifiedMemberModal ref="verifiedMember"></OrderingVerifiedMemberModal>
    <!-- 冥晨会员卡验证会员 -->
    <OrderingVerifiedMinChenModal ref="orderingVerifiedMinChenModal"></OrderingVerifiedMinChenModal>
    <BillQuery whichModal="1" ref="billQuery"></BillQuery>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { Message, MessageBox } from 'element-ui';
import { map, extend, intersectionBy } from 'lodash';
import * as tableState from '@/common/dictionary/pos-order-table-state';
import Info from './Info';
import CrmInfo from './CrmInfo';
import List from './List';
import Control from './Control';
import BillBtns from './BillBtns';
import ajax from '@/common/js/ajax';

// 退单
const Revoke = (resolve) => {
  import('./BillBtnsFunc/Revoke').then((module) => {
    resolve(module);
  });
};
// 赠单
const Give = (resolve) => {
  import('./BillBtnsFunc/Give').then((module) => {
    resolve(module);
  });
};
// 催单
const Hasten = (resolve) => {
  import('./BillBtnsFunc/Hasten').then((module) => {
    resolve(module);
  });
};

// 起菜
const Serving = (resolve) => {
  import('./BillBtnsFunc/Serving').then((module) => {
    resolve(module);
  });
};
// 上菜
const Served = (resolve) => {
  import('./BillBtnsFunc/Served').then((module) => {
    resolve(module);
  });
};

// 单品转台
const Transfer = (resolve) => {
  import('./BillBtnsFunc/Transfer').then((module) => {
    resolve(module);
  });
};
// 品项变价
const ChangePrice = (resolve) => {
  import('./BillBtnsFunc/ChangePrice').then((module) => {
    resolve(module);
  });
};

// 称重确认
const ConfirmWeight = (resolve) => {
  import('./BillBtnsFunc/ConfirmWeight').then((module) => {
    resolve(module);
  });
};

// 核对单据
const CheckingBills = (resolve) => {
  import('./BillBtnsFunc/CheckingBills').then((module) => {
    resolve(module);
  });
};

// 改点菜员
const ChangeWaiter = (resolve) => {
  import('./BillBtnsFunc/ChangeWaiter').then((module) => {
    resolve(module);
  });
};

// 其他
const Other = (resolve) => {
  import('./BillBtnsFunc/Other').then((module) => {
    resolve(module);
  });
};

// 更多模块
const MoreBillBtns = (resolve) => {
  import('./BillBtnsFunc/MoreBillBtns').then((module) => {
    resolve(module);
  });
};

// 更改规格
const ModifyItemSize = (resolve) => {
  import('@/components/Pos/Ordering/Menu/ItemSize').then((module) => {
    resolve(module);
  });
};

// 验证会员
const OrderingVerifiedMemberModal = (resolve) => {
  import('./BillBtnsFunc/OrderingVerifiedMemberModal').then((module) => {
    resolve(module);
  });
};

// 验证冥晨会员
const OrderingVerifiedMinChenModal = (resolve) => {
  import('./BillBtnsFunc/OrderingVerifiedMinChenModal').then((module) => {
    resolve(module);
  });
};

// 账单查询
const BillQuery = (resolve) => {
  import('../../More/BilledModal').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    List,
    Info,
    CrmInfo,
    Control,
    BillBtns,
    MoreBillBtns,
    Revoke, // 退单
    Give, // 赠单
    Hasten, // 催单
    Serving, // 起菜
    Served, // 上菜
    Transfer, // 单品转台
    ChangePrice, // 品项变价
    ConfirmWeight, // 称重确认
    CheckingBills, // 核对单据
    ChangeWaiter, // 改点菜员
    Other, // 其他
    ModifyItemSize,
    // OrderingPay
    OrderingVerifiedMemberModal,
    OrderingVerifiedMinChenModal,
    BillQuery,
  },
  data() {
    return {
      guestList: null,
      lastTotal: 0,
      moreBtns: [
        {
          name: 'moreBillBtns', hotKey: 'F9.ctrl', hotKeyTip: 'Ctrl+F9', text: this.$t('Dict.Btn.More'), disabled: false, isShow: true, allowState: [2, 3, 4, 5, 6],
        },
      ],
      isClcok: true,
      requestTimeStamp: '',
      checkData: null, // 核对账单的数据
    };
  },
  computed: {
    ...mapGetters(['getCustomListBtn', 'getVuexPosMode', 'posInfo', 'posOrderBill', 'getVuexPointData', 'outDeviceSetting', 'posBaseInfo', 'getMultisettleArr', 'getIsbatchOperation', 'ALL_POS_MODULE', 'posDevice']),
    billFunctions() {
      const { state } = this.getVuexPointData;
      const { hasMultiSettle } = this.posInfo;
      return map(this.getCustomListBtn, (item) => {
        const { name, allowState } = item;
        let disabled = false;
        let isShow = true;
        if (allowState) {
          if (allowState.indexOf(state) !== -1) {
            if (name === 'batchOperation' || name === 'billQuery') {
              // 批量操作 或 账单查询
              disabled = !hasMultiSettle;
            }
            if (
              name === 'served' // 上菜
            ) {
              disabled = hasMultiSettle;
            }
          } else {
            disabled = true;
          }
          if (name === 'batchOperation') {
            // 批量操作
            if (this.getVuexPosMode === '2') {
              isShow = false;
            } else {
              isShow = !hasMultiSettle;
            }
          }
        }
        return extend({}, item, { disabled, isShow });
      });
    },
    billOrderBtns() {
      if (this.billFunctions && this.billFunctions.length > 11) {
        return this.billFunctions.slice(0, 10).concat(this.moreBtns);
      }
      return this.billFunctions;
    },
    billMoreOrderBtns() {
      if (this.billFunctions && this.billFunctions.length > 11) {
        return this.billFunctions.slice(10);
      }
      return [];
    },
  },
  created() {
    this.$von('changeClock', () => {
      this.isClcok = true;
    });
    this.$von('loadBill', (tableId, afterOpenOrdering) => {
      ajax('canyin.pos.bill.pointbsinfo', {
        loading: false,
        params: {
          pointId: tableId,
        },
      }).then((res) => {
        if (
          this.requestTimeStamp === ''
          || this.requestTimeStamp < res.data.data.requestTimeStamp
        ) {
          // 预订客位的状态参数
          let pointState = this.getVuexPointData.state; // 当前客位的状态
          // 这是传参过来的客位状态，如果存在走传过来的数据，否则使用vuex的值
          if (afterOpenOrdering && afterOpenOrdering.tableState) {
            pointState = afterOpenOrdering.tableStat;
          }
          // 因为预订客位没有bs，所以预订客位不加载账单
          if (pointState === tableState.BOOKING) { return; }
          if (+res.data.code === 1) {
            if (res.data.data.requestTimeStamp) {
              this.requestTimeStamp = res.data.data.requestTimeStamp;
            }
            // 如果不是（搜索框过来的请求并且和当前的选中的客位不匹配）才执行
            if (res.data.data.no_bs) {
              // this.$message.info('该客位已经结算或已关闭，请重新开台后操作。')
              this.getOrderBill({ list: null });
              if (this.$route.name === 'ordering') {
                MessageBox.confirm('营业流水不存在, 是否返回到客位界面?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                  center: true,
                }).then(() => {
                  this.$router.push('/pos/order');
                });
              }
              // if (this.$route.name === 'order') {
              //   MessageBox.confirm('营业流水不存在, 可能已开台是否需要刷新界面 ?', '提示', {
              //     confirmButtonText: '确定',
              //     cancelButtonText: '取消',
              //     type: 'warning',
              //     center: true,
              //   }).then(() => {
              //     window.location.reload();
              //     if (this.posDevice.enableVice) {
              //       this.$devices.SubMonitor.send({
              //         moduleName: 'SubMonitor',
              //         method: 'reloadDataItem',
              //         result: [],
              //       });
              //     }
              //   });
              // }
            } else {
              this.getOrderBill({ list: res.data.data });
              if (afterOpenOrdering) {
                afterOpenOrdering.callback();
              }
            }
          } else {
            this.$message.error(res.data.msg);
          }
        }
      });
    });
    /**
     * @函数说明 打印通用方法
     * @创建 马 2018/6/11
     * data 包含url ,params 数据
     * @public
     */
    this.$von('commonPrint', (data) => {
      // console.log(data);
      ajax(data.url, {
        loading: false,
        contentType: 'paramsEncoded',
        needToken: true,
        data: data.params,
      }).then((res) => {
        // printType PRINT_PARALLEL 打印类型是并口的执行 进行打印业务
        // printType 1 结账单
        if ((data.printType !== undefined || data.printType !== null) && +data.printType === 1) {
          if (res.success && +res.result === 1) {
            if (res.data.msg) {
              this.$message.error(res.data.msg);
            } else if (res.data.printType === 'PRINT_PARALLEL' && res.data.printD) {
              this.$log.info('向设备管理器发送打印数据');
              this.$devices.Printer.print(res.data.printD);
            }
          } else {
            this.$message.error(res.msg);
          }
        } else if (res.printType === 'PRINT_PARALLEL' && res.printD) {
          this.$log.info('向设备管理器发送打印数据');
          this.$devices.Printer.print(res.printD);
        }
      });
    });
    // 清空账单
    this.$von('clearEmptyBill', (isUpdatePoint = true) => {
      // 储存下客位信息
      // this.setPosPointData(null);
      this.getOrderBill({ list: null });
      if (isUpdatePoint !== false) {
        this.$vemit('updatePoint'); // 刷新客位, 不需要手动刷新, 如有问题可恢复
      }
    });
    // 打开称重确认弹窗
    this.$von('openConfirmWeight', () => {
      this.confirmWeight('confirmWeight');
    });
    // 代码注释,见(腾讯在线)前端维护文档BUG-2020,详细说明
    // // 绑定快捷键
    // this.$von('handleBindBillBtnsHotKey', () => {
    //   this.createHotKey();
    // });
    this.$von('printGuestList', () => {
      this.printGuestList(true);
    });
    // 刷新核对账单数据
    this.$von('billedCheckRefresh', () => {
      this.checkingBills('checkingBills', false);
    });
  },
  methods: {
    // 设置快捷键
    createHotKey() {
      const tmp = {};
      this.billOrderBtns.forEach((item) => {
        if (item.hotKey) {
          tmp[item.hotKey] = () => {
            this.$log.info(`当前操作客单的快捷键名称：${item.name}`);
            this.billFunction(item.name, false);
          };
        }
      });
      this.$hotKey.set('Pos.Order', tmp);
    },
    // 账单操作的按钮
    billFunction(method, isMore = true) {
      const orderBtns = isMore ? this.billMoreOrderBtns : this.billOrderBtns;
      const billBtnData = orderBtns.find(item => item.name === method);
      const { disabled } = billBtnData;
      let isHasCheck = false;
      if (billBtnData.id) {
        isHasCheck = this.isServer(billBtnData.id);
      }

      if (!this.getVuexPointData) {
        this.isShowMessage(this.$t('Biz.Order.LongMsg028'));
        return;
      }
      if (method && this.$refs[method]) {
        if (this[method]) {
          if (!disabled && !isHasCheck) {
            this[method](method);// 执行对应的方法
          }
        } else {
          this.$message.error(this.$t('Biz.Order.ModuleNotFound'));
        }
      } else {
        // this.$message.error('没有找到该模块');
      }
    },
    isServer(name) {
      const checked = this.ALL_POS_MODULE.find((items) => {
        const changeUpdateList = items ? items.children : [];
        return changeUpdateList.find((item) => {
          if (item.id === name) {
            return !item.checked;
          }
          return false;
        });
      });
      return checked;
    },
    // 退单退单
    revoke(method) {
      // 未加单就不需要进行请求
      if (!this.posOrderBill.scList.length) {
        this.$alert(this.$t('Biz.Order.LongMsg029'), this.$t('Dict.Tips'));
        return;
      }
      ajax('canyin.pos.addexitbill.exitBillView', {
        params: {
          pointId: this.posOrderBill.bsData.pointId, // 客位id
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (+res.code === 1) {
          // 弹框
          this.$refs[method].open(res.data, {
            submit: (data) => {
              // 是否加\\退\\赠单后自动打开钱箱
              if (this.outDeviceSetting.isOthersOpenCashbox === true) {
                this.$devices.Cashbox.open();
              }
              //   TDevices.cbox.open(); //打开钱箱
              // 刷下账单
              this.$vemit('loadBill', this.posOrderBill.bsData.pointId);
              // 更新客位状态的显示
              this.$vemit('updatePoint');
              // 打印 print
              if (data.parallelPrintData && data.parallelPrintData.length) {
                this.printExitItem(data.parallelPrintData);
              }
              // this.$refs[method].close()
            },
          });
          // res.data.bsData//操作客位账单的主要信息
          // res.data.scList //客位账单的品项信息列表
          // res.data.reasonList //退单原因列表
        }
      });
    },
    // 打印退单
    printExitItem(parallelPrintData) {
      parallelPrintData.forEach((printD) => {
        this.$devices.Printer.print(printD);
      });
    },
    // 赠送
    give(method) {
      ajax('canyin.pos.presentItem.presentItemView', {
        params: {
          pointId: this.posOrderBill.bsData.pointId,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (+res.code === 1 && res.data) {
          // 成功打开弹框
          this.$refs[method].open(res.data, {
            submit: (data, type) => {
              if (data.success) {
                let str;
                if (+type === 1) {
                  str = this.$t('Biz.Order.ItemGiftSuccess');
                } else if (type === 2) {
                  str = this.$t('Biz.Order.CancelGiftSuccess');
                }
                this.$message.success(str);
                // 刷新账单
                this.$vemit('loadBill', this.posOrderBill.bsData.pointId);
              } else {
                this.$message({
                  type: 'error',
                  message: data.msg,
                });
              }
            },
          });
        }
      });
    },
    // 催单
    hasten(method) {
      // 需要的数据
      ajax('canyin.pos.hasten.hastenView', {
        params: {
          pointId: this.posOrderBill.bsData.pointId,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (+res.code === 1) {
          // 弹框
          this.$refs[method].open({ hastenData: res.data }, {
            submit: () => {
              // 进行刷新账单
              this.$vemit('loadBill', this.posOrderBill.bsData.pointId);
            },
          });
        }
      }).catch((errorCode, msg) => {
        MessageBox.alert(msg, this.$t('Dict.WrongInfo'));
      });
    },
    // 起菜
    serving(method) {
      ajax('canyin.pos.callup.callupView', {
        params: {
          pointId: this.posOrderBill.bsData.pointId, // 客位id
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (+res.code === 1) {
          // 判断数据
          if (!res.data.callUpList.length) {
            this.$message({
              message: this.$t('Biz.Order.LongMsg030'),
              type: 'error',
            });
          } else {
            this.$refs[method].open(res.data, {
              // 回调
              submit: () => {

              },
            });
          }
          // 如果有数据打开弹框
          // this.$refs[method].open(res.data.data,{
          //   //回调
          //   submit: result =>{

          //   }
          // })
        }
      });
    },
    // 上菜详情
    served(method) {
      this.$refs[method].open();
    },
    // 单品转台
    transfer(method) {
      if (this.posOrderBill && this.posOrderBill.scList.length) {
      // 先验证是否是团队开单客位 团队开单不允许单品转台的
        ajax('canyin.pos.tranItem.checkpointisteam', {
          contentType: 'URLEncoded',
          data: {
            pointId: this.posOrderBill.bsData.pointId,
            loadmodule: 1,
            _t: new Date().getTime(),
          },
        }).then((res) => {
          if (res.data != null) {
            // 如果验证当前的客位不是团队客位就请求单品转台的接口
            if (res.data.success) {
              // 请求接口
              ajax('canyin.pos.tranItem.tranItemView', {
                contentType: 'URLEncoded',
                data: {
                  pointId: this.posOrderBill.bsData.pointId,
                },
              }).then((res2) => {
                if (res2.data) {
                  this.$refs[method].open(res2.data);
                }
              });
            } else {
              this.$message({
                message: res.data.msg,
                type: 'warning',
                duration: 1500,
              });
            }
          } else {
            this.$message({
              message: res.data.msg,
              type: 'error',
              duration: 1500,
            });
          }
        });
      } else {
        this.$message.warning(this.$t('Biz.Order.LongMsg031'));
      }
    },
    // 品项变价
    changePrice(method) {
      ajax('canyin.pos.changePrice.changePriceView', {
        params: {
          pointId: this.posOrderBill.bsData.pointId, // 客位id
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (+res.code === 1) {
          // 弹框
          this.$refs[method].open({ changePriceData: res.data }, {
            submit: () => {
              // 品项变价成功后进行刷新账单
              this.$vemit('loadBill', this.posOrderBill.bsData.pointId);
            },
          });
        } else {
          this.$message({
            type: 'error',
            message: res.msg,
            duration: 2000,
          });
        }
      });
    },
    checkingBills(method, shouldOpen = true) {
      ajax('canyin.pos.checkViewBill.view', {
        params: {
          pointId: this.posOrderBill.bsData.pointId, // 客位id
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        this.checkData = res;
        if (shouldOpen) {
          this.openCheckingBillModal(method);
        }
      });
    },
    openCheckingBillModal(method) {
      // 弹框
      this.$refs[method].open({}, {
        submit: () => {
          console.info('变价后刷新账单.');
        },
      });
    },
    moreBillBtns() {
      this.$refs.moreBillBtns.open();
    },
    billQuery() {
      this.$refs.billQuery.open();
    },
    verifiedMember() {
      const { isMingChenEnable } = this.posBaseInfo;
      if (isMingChenEnable) { // 开启冥晨会员卡
        this.$refs.orderingVerifiedMinChenModal.open();
      } else { // CRM会员卡
        this.$refs.verifiedMember.open();
      }
    },
    ...mapActions([
      'getOrderBill',
    ]),
    // 修改被选中加单规格品项弹框进行修改
    modifyItemSize() {
      this.controlActive((finded) => {
        this.$refs.modifyItemSize.open(finded);
      });
    },
    // 修改完后点击确认后要处理的
    modifyItemSizeCallBack(sizeData) {
      this.controlActive((finded) => {
        // 替换下
        this.guestList.splice(this.guestList.indexOf(finded), 1, sizeData);
      });
    },
    // 提示的公共方法
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo'), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    // 打印客单
    async printGuestList(dontShowTip) {
      let params = {
        pointId: this.posOrderBill.bsData.pointId,
        styleType: 3,
      };
      // 如果不开启了加单自动打印, 和启用客单增量设置 !this.posInfo.isPrintBillAfterAddOrder && this.posInfo.guestSingleIncrementalPrinting
      if (!this.posInfo.isPrintBillAfterAddOrder && this.posInfo.guestSingleIncrementalPrinting) {
        let incrementalPrintGuestBillType = '0';
        await this.$confirm(this.$t('Biz.Order.ListTipsText1'), this.$t('Dict.Tips'), {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          showClose: false,
          type: 'warning',
        }).then(() => {
        // 将当前账单挂单并读取下一单
          incrementalPrintGuestBillType = '1';
        // this.$emit('designates', this.doDesignate);
        })
          .catch(() => {
          });
        params = { ...params, incrementalPrintGuestBillType };
      }
      ajax('canyin.pos.print.getStyleData', {
        loading: false,
        params: {
          params,
        },
      }).then((data) => {
        if (data.success) {
          if (data.msg) {
            this.$message.error(data.msg);
          } else if (data.printType === 'PRINT_PARALLEL') {
            if (!dontShowTip) {
              this.$message.success(this.$t('Dict.OperationSucceeded'));
            }
            this.$devices.Printer.print(data.printD);
          }
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 称重确认
    confirmWeight(method) {
      ajax('canyin.pos.confirmWeigh.view', {
        params: {
          pointId: this.posOrderBill.bsData.pointId, // 客位id
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        if (!res || res.code !== '1') {
          this.$message.error(this.$t('Biz.Order.LongMsg032'));
          return;
        }
        // 判断数据
        if (!res.data.scList.length) {
          this.$message.warning(this.$t('Biz.Order.LongMsg033'));
          return;
        }
        const multisettleArr = this.getMultisettleArr.filter(item => item.confirmWeighType !== 0);
        const checkMenus = multisettleArr.map((item) => {
          item.id = item.scId;
          return undefined;
        });
        if (this.getIsbatchOperation) {
          res.data.scList = intersectionBy(res.data.scList, checkMenus, 'id');
        }
        this.$refs[method].open(res.data, {
          // 回调
          submit: () => {
            // TODO 称重确认成功需要刷新账单
            this.$vemit('loadBill', this.posOrderBill.bsData.pointId);
          },
        });
      });
    },
    isCanAddbtn(data) {
      this.$emit('isCanClickAddbtn', data);
    },
    ...mapMutations({
      setPosPointData: 'SET_POS_POINT_DATA',
    }),
  },
  watch: {
    ordering(value) {
      this.$emit('ordering', value);
    },
    'billOrderBtns.length': {
      handler() {
        // 进行业务判断, 防止刷账单后, 意外触发
        if (this.$hotKey.modules[this.$hotKey.modules.length - 1] === 'Pos.Order') {
          this.createHotKey();
        }
      },
      deep: true,
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// Component Pos/Order

//== window ( bill window )

//** background color
@pos-order-bill-bg: rgba(255, 255, 255, 0.9);
//** shadow
@pos-order-bill-shadow: 0 0 8px @gray-dark;

@pos-order-bill-welcome-height: 218px;
@pos-order-bill-welcome-padding-left: 86px;
@pos-order-bill-welcome-pic-offset: 36px;
@pos-order-bill-welcome-pic-margin: 15px;
@pos-order-bill-welcome-text-height: 24px;
@pos-order-bill-welcome-text-color: #999;

.pos-order-left {
  position: absolute;
  left: 0;
  top: 0;
  .size(@pos-order-left-width, 100%);

  &.is-ordering {
    width: 100%;
    padding-left: @pos-order-left-width;
  }
}

.pos-order-window {
  position: absolute;
  left: 0;
  top: 0;
  .size(@pos-order-left-width, 100%);
  padding-right: @pos-order-btns-width;
}

.pos-order-bill {
  position: relative;
  height: 100%;
  padding-top: @pos-order-bill-info-height;
  padding-bottom: @pos-order-bill-control-height;
  background-color: @pos-order-bill-bg;
  .box-shadow(@pos-order-bill-shadow);

  &.has-crmInfo {
    padding-top: @pos-order-bill-info-height + @pos-order-bill-crminfo-height;
  }
}

.pos-order-bill-welcome {
  position: absolute;
  top: 50%;
  left: 0;
  .size(100%, @pos-order-bill-welcome-height);
  margin-top: @pos-order-bill-welcome-height / -2;
  padding-left: @pos-order-bill-welcome-padding-left;

  > img {
    margin-left: @pos-order-bill-welcome-pic-offset;
    margin-bottom: @pos-order-bill-welcome-pic-margin;
  }

  > p {
    line-height: @pos-order-bill-welcome-text-height;
    color: @pos-order-bill-welcome-text-color;
  }
}

.lang-enUS {
  .pos-order-left {
    width: 390px;
  }
}
</style>
