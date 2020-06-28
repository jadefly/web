<template>
  <div class="pos-order-tables">
    <List
      ref="list"
      @updateTables="updateTables"
    ></List>
    <Btns :tableFunctionsTest="tableBtns" @tableFunction="tableFunction" ref="tableFunction"></Btns>
    <AddBill ref="addBill" :submitId="submitId" @updateTables="updateTables"></AddBill>
    <ChangeTable ref="changeTable"></ChangeTable>
    <TransferAccount ref="transferAccount"></TransferAccount>
    <MergeAccount ref="mergeAccount"></MergeAccount>
    <TeamOrder ref="teamOrder"></TeamOrder>
    <TeamConstitute ref="teamConstitute"></TeamConstitute>
    <TeamJoin ref="teamJoin"></TeamJoin>
    <MoreTableBtns
      :tableFunctionsTest="moreTableBtns"
      ref="moreTableBtns"
      @tableFunction="tableFunction"></MoreTableBtns>
    <Deposit ref="Deposit"></Deposit>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import {
  find, map, extend, each, cloneDeep, debounce,
} from 'lodash';
import ajax from '@/common/js/ajax';
import checkSystemTime from '@/common/js/checkSystemTime';
import * as tableState from '@/common/dictionary/pos-order-table-state';
import dateFormat from '@/common/js/dateformat';
import Btns from './Btns';
import List from './List';

const AddBill = (resolve) => {
  import('./AddBill.vue').then((module) => {
    resolve(module);
  });
};

const ChangeTable = (resolve) => {
  import('./TableBtnsFunc/changeTable.vue').then((module) => {
    resolve(module);
  });
};

const TransferAccount = (resolve) => {
  import('./TableBtnsFunc/transferAccount.vue').then((module) => {
    resolve(module);
  });
};

const MergeAccount = (resolve) => {
  import('./TableBtnsFunc/mergeAccount.vue').then((module) => {
    resolve(module);
  });
};

const TeamOrder = (resolve) => {
  import('./TableBtnsFunc/teamOrder.vue').then((module) => {
    resolve(module);
  });
};

const TeamConstitute = (resolve) => {
  import('./TableBtnsFunc/teamConstitute.vue').then((module) => {
    resolve(module);
  });
};

const TeamJoin = (resolve) => {
  import('./TableBtnsFunc/teamJoin.vue').then((module) => {
    resolve(module);
  });
};

const MoreTableBtns = (resolve) => {
  import('./TableBtnsFunc/moreTableBtns.vue').then((module) => {
    resolve(module);
  });
};

// 押金
const Deposit = (resolve) => {
  import('./TableBtnsFunc/Deposit.vue').then((module) => {
    resolve(module);
  });
};
const ISTEAM = 1;
const ISNOTTEAM = 0;
export default {
  components: {
    List,
    Btns,
    AddBill,
    ChangeTable,
    TransferAccount,
    MergeAccount,
    TeamOrder,
    TeamConstitute,
    TeamJoin,
    MoreTableBtns,
    Deposit,
  },
  data() {
    return {
      submitId: null,
      newPointData: null,
      oldPointData: null,
      moreBtns: [{
        name: 'moreTableBtns',
        text: `${this.$t('Dict.Btn.More')} >`,
        hotKey: 'F10.ctrl',
        disabled: false,
        hotKeyTip: 'Ctrl+F10',
      }],
      timer: null,
    };
  },
  created() {
    this.$von('posAddBill', (table) => {
    // 后台校验系统时间，失败跳到登录页
      checkSystemTime().then(() => {
        // 开台系统时间与互联网时间比较 相隔一天提示
        const { timeOver, ...timeCollection } = this.timeCompareData;
        if (timeOver) {
          this.timeOverWarning(table, timeCollection);
        } else {
          this.addBill(table);
        }
      });
    });
  },
  computed: {
    ...mapGetters([
      'config',
      'getCustomPositionBtn',
      'getVuexPointData',
      'posInfo',
      'posBaseInfo',
      'posOrderBill',
      'posTables',
      'timeCompareData',
      'ALL_POS_MODULE',
      'posSettings',
    ]),
    tableFunctions() {
      // 开启自助押金模块后不显示押金按钮
      const openBuffetDeposit = this.posSettings.isOpenBuffetDeposit;
      // this.ALL_POS_MODULE.map((item) => {
      //   if ((+item.id === 1252 || item.text === '押金管理') && item.checked) {
      //     openBuffetDeposit = true;
      //   }
      //   return item;
      // });
      let tmpBtnsArr = [];
      // 开启了自助押金下 不显示押金按钮
      if (openBuffetDeposit) {
        tmpBtnsArr = this.getCustomPositionBtn.filter(item => item.name !== 'deposit');
      } else {
        tmpBtnsArr = this.getCustomPositionBtn;
      }
      return map(tmpBtnsArr, (item) => {
        const {
          newPointData: newPoint,
          oldPointData: oldPoint,
        } = this;
        let disabled = false;
        const allowState = item.allowState ? item.allowState : [];
        const { hasMultiSettle } = this.posInfo;
        let { name, text } = item;
        if (item.name === 'transferAccount') {
          const thePoint = this.getVuexPointData;
          const findPid = find(this.posTables, {
            pid: thePoint.id,
            isTeam: ISTEAM,
          });
          const isTransPoint = (thePoint.pid && thePoint.isTeam) || findPid;
          name = isTransPoint ? 'cancelTransfer' : 'transferAccount';
          text = isTransPoint ? this.$t('Dict.Btn.CancelTransfer') : this.$t('Dict.Btn.TransferAccount');
        }
        if (hasMultiSettle) {
          if (item.name !== 'changeTable' && item.name !== 'closeAccount') {
            disabled = hasMultiSettle;
          } else if (newPoint) {
            disabled = !allowState.find(state => state === newPoint.state);
          }
        } else if (!newPoint || newPoint.state === tableState.VACANCY) {
          // 无客位状态按空闲状态处理
          disabled = this.controlStateTable({ item, state: tableState.VACANCY });
        } else if (
          !oldPoint
          || newPoint.state !== oldPoint.state
          || newPoint.pid !== oldPoint.pid
          || newPoint.teamName !== oldPoint.teamName
        ) {
          // 状态1：客位状态发生变化时 进行相应按钮的禁用
          // 状态2：监听为虚拟客位 进行相应按钮的禁用 (属于占用客位状态的子集)
          // 非虚拟客位 根据状态进行相应的按钮禁用
          if (!newPoint.pid) {
            disabled = this.controlStateTable({ item, state: newPoint.state });
          } else {
            // 判断虚拟客位来源：转账产生的虚拟客位
            if (newPoint.isTeam === ISTEAM) {
              disabled = this.controlStateTable({ item, state: newPoint.state, virtualSource: 'transfer' });
            }
            // 判断虚拟客位来源：搭台产生的虚拟客位
            if (newPoint.isTeam === ISNOTTEAM) {
              disabled = this.controlStateTable({ item, state: newPoint.state, virtualSource: 'share' });
            }
          }
        }
        // 客必得押金禁用登记押金按钮
        if (name === 'deposit' && this.isKeBiDeBs) {
          disabled = true;
        }
        // 如果是虚拟客位 组成团队按钮不可用
        if (newPoint && name === 'teamConstitute') {
          if (newPoint.pid) {
            disabled = true;
          }
        }
        return extend({}, item, { disabled, name, text });
      });
    },
    isKeBiDeBs() {
      let re = false;
      if (
        this.posBaseInfo.isKeBiDe
        && this.posBaseInfo.isKeBiDeDeposit
        && this.posOrderBill
        && this.posOrderBill.bsData.bookOrderSource
        && this.posOrderBill.bsData.bookOrderSource.length
      ) {
        each(this.posOrderBill.bsData.bookOrderSource, (item) => {
          if (
            item.bs_id === this.posOrderBill.bsData.id
            && item.order_source === 6
          ) {
            re = true;
          }
        });
      }
      return re;
    },
    tableBtns() {
      return this.tableFunctions && this.tableFunctions.length > 7
        ? this.tableFunctions.slice(0, 6).concat(this.moreBtns)
        : this.tableFunctions;
    },
    moreTableBtns() {
      return this.tableFunctions && this.tableFunctions.length > 7
        ? this.tableFunctions.slice(6)
        : [];
    },
    getVuexPointDataClone() {
      if (this.tableFunctions.length && this.getVuexPointData) {
        return this.getVuexPointData;
      }
      return undefined;
    },
  },
  watch: {
    getVuexPointDataClone(newPoint, oldPoint) {
      if (!newPoint) {
        return;
      }
      if (oldPoint) {
        if (
          newPoint.state === oldPoint.state
          && newPoint.pid === oldPoint.pid
          && newPoint.isTeam === oldPoint.isTeam
        ) {
          this.newPointData = newPoint;
          return;
        }
      }
      this.newPointData = newPoint;
      this.oldPointData = oldPoint;
    },
  },
  methods: {
    // 根据客位状态 进行按钮的禁用 （虚拟客位进行特殊处理）
    controlStateTable({ item: _, state, virtualSource }) {
      let tranfersAccountTable = false;
      let disabled = false;
      // const { hasMultiSettle } = this.posInfo;
      if (this.getVuexPointData) {
        tranfersAccountTable = find(this.posTables, {
          pid: this.getVuexPointData.id,
          isTeam: ISTEAM,
        });
      }
      const allowState = _.allowState ? _.allowState : [];
      // 存在虚拟参数根据虚拟客位来源条件进行判断，否则根据客位状态条件进行判断
      const allowCondition = virtualSource
        ? allowState.indexOf(virtualSource) !== -1
        : allowState.indexOf(state) !== -1;
      // 相应按钮禁用
      if (allowState.length === 0) {
        // 不设置 默认允许
        disabled = false;
      } else if (tranfersAccountTable && (_.name === 'teamJoin' || _.name === 'teamQuit')) {
        // 转账形成的团队客位，对加入和退出团队做特殊处理
        disabled = false;
      } else if (allowCondition) {
        // 遍历允许状态
        disabled = false;
      } else {
        disabled = true;
      }
      return disabled;
    },
    // 弹出开台日期不同警告
    timeOverWarning(table, timeData) {
      const systemTime = dateFormat('%Y-%M-%D', Date.parse(timeData.systemTime));
      const interTime = dateFormat('%Y-%M-%D', Date.parse(timeData.interTime));
      const msg = table ? this.$t('Biz.Order.LongMsg037', [systemTime, interTime]) : this.$t('Biz.Order.LongMsg038', [systemTime, interTime]);
      this.$confirm(msg, this.$t('Dict.Tips'), {
        confirmButtonText: table ? this.$t('Biz.Order.ContinueOpenTable') : this.$t('Biz.Order.ContinueShareTable'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        // 参数table判断执行开台还是搭台
        if (table) {
          this.addBill(table);
        } else {
          this.executeShareTable();
        }
      }).catch(() => {
        this.$message.info(table ? this.$t('Biz.Order.CancelOpenTable') : this.$t('Biz.Order.CancelShareTable'));
      });
    },
    tableFunction(method, isMore = true) {
      const tableBtns = isMore ? this.moreTableBtns : this.tableBtns;
      let disabled = true;
      console.log('method==', method);
      if (method === 'transferAccount' && tableBtns.find(item => item.text === this.$t('Dict.Btn.CancelTransfer'))) {
        // eslint-disable-next-line no-param-reassign
        method = 'cancelTransfer';
      }
      // eslint-disable-next-line prefer-destructuring
      disabled = tableBtns.find(item => item.name === method).disabled;
      // 更多功能按钮窗口
      if (method === 'moreTableBtns') {
        this.$refs[method].open();
      } else if (method) {
        // eslint-disable-next-line no-unused-expressions
        !disabled && this[method](method); // 执行对应的方法
      } else {
        this.$message.error(this.$t('Biz.Order.ModuleNotFound'));
      }
    },
    // 清扫
    clear(method) {
      console.log('清扫', method);
    },
    // 开台
    addBill(table) {
      this.submitId = 'addBillSubmit';
      // 阻断客位状态的推送更新的进程
      this.setIsNeedTableWsHandle(false);
      ajax('canyin.pos.addBill.addBillView', {
        params: { pointId: table.id },
      }).then((data) => {
        if (this.$refs.addBill) {
          this.$refs.addBill.open({ table, data, from: 0 }); // from:0开台,1修改开台
        }
      }).catch(() => {
        this.setIsNeedTableWsHandle(true);
      });
    },
    // 搭台校验
    shareTable() {
      // 后台校验系统时间，失败跳到登录页
      checkSystemTime().then(() => {
        if (this.getVuexPointData.isTeam === 1) {
          this.$message.error(this.$t('Biz.Order.TeamCannotShareMsg'));
          return;
        }
        // 开台系统时间与互联网时间比较 相隔一天提示
        const { timeOver, ...timeCollection } = this.timeCompareData;
        if (timeOver) {
          this.timeOverWarning(null, timeCollection);
        } else {
          this.executeShareTable();
        }
      });
    },
    executeShareTable() {
      this.submitId = 'shareTableSubmit';
      ajax('canyin.pos.addBill.addBillView', {
        params: { pointId: this.getVuexPointData.id },
      }).then((data) => {
        if (this.$refs.addBill) {
          this.$refs.addBill.open({ table: this.getVuexPointData, data, isShareTable: true, from: 0 }); // from:0开台,1修改开台
        }
      }).catch((errCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 换台
    changeTable(method) {
      ajax('canyin.pos.modifypoint.checkpointisteam', {
        params: {
          pointId: this.getVuexPointData.id, // 客位id
        },
      }).then(data => new Promise((resolve, reject) => {
        if (data.success === true) {
          resolve(data);
        } else {
          reject(data);
        }
      })).catch((msgCode, msg) => {
        this.$message.error(msg);
      }).then(() => {
        ajax('canyin.pos.modifypoint.findpoint', {
          params: {
            pointId: this.getVuexPointData.id, // 客位id
            loadmodule: 1,
            _t: new Date().getTime(),
          },
        }).then((data) => {
          this.$refs[method].open(data, {
            submit: (pointData) => {
              // 删除搭台后的虚拟客位
              if (this.getVuexPointData.pid) {
                this.updateCancelTransferPointState(this.getVuexPointData.id);
              }
              // 刷新目标客位和账单信息
              this.updatePointAndBill(pointData);
            },
          });
        }).catch((msgCode, msg) => {
          this.$message.error(msg);
        });
      });
    },
    // 转账
    transferAccount(method) {
      ajax('canyin.pos.transferbills.volidbusinessbefore', {
        params: {
          pointId: this.getVuexPointData.id, // 客位id
        },
      }).then(data => new Promise((resolve, reject) => {
        if (data.success === true) {
          resolve(data);
        } else {
          reject(data);
        }
      })).catch((msgCode, msg) => {
        this.$message.error(msg);
      }).then(() => {
        ajax('canyin.pos.transferbills.transferbillview', {
          params: {
            pointId: this.getVuexPointData.id, // 客位id
            loadmodule: 1,
            _t: new Date().getTime(),
          },
        }).then((data) => {
          this.$refs[method].open(data, {
            submit: (pointData) => {
              // 加载客位及账单信息
              this.updatePointAndBill(pointData);
              // 切换为撤销转账
              // this.isShowTransferBtn({ show: false });
            },
          });
        }).catch((msgCode, msg) => {
          this.$message.error(msg);
        });
      });
    },
    // 撤销转账
    cancelTransfer(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.cancelTransfer(code);
      });
      if (!this.getVuexPointData.pid) {
        this.$message.error(this.$t('Biz.Order.NotVirtualCannotMsg'));
        return;
      }
      const params = {
        teamId: this.getVuexPointData.teamId,
        pointId: this.getVuexPointData.id,
        bsId: this.getVuexPointData.bsId,
        loadmodule: 1,
        _t: (new Date()).getTime(),
        ...authData,
      };
      ajax('canyin.pos.canceltransferbills.canceltransferbills', {
        needToken: true,
        contentType: 'paramsEncoded',
        data: params,
      }).then(() => {
        // 在推送中做刷新客位和账单操作
        this.$message.success(this.$t('Biz.Order.CancelTransferSuccessMsg'));
        // 加载客位信息
        if (this.getVuexPointData && this.getVuexPointData.pid) {
          const pointData = find(this.posTables, { id: this.getVuexPointData.pid });
          this.updatePointAndBill(pointData);
        }
        // 切换为转账
        // this.isShowTransferBtn({ show: true });
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 并账
    mergeAccount(method) {
      ajax('canyin.pos.mergebill.checkpointisteam', {
        params: {
          pointId: this.getVuexPointData.id, // 客位id
        },
      }).then(data => new Promise((resolve, reject) => {
        if (data.success === true) {
          resolve(data);
        } else {
          reject(data);
        }
      })).catch((msgCode, msg) => {
        this.$message.error(msg);
      }).then(() => {
        ajax('canyin.pos.mergebill.mergebillview', {
          params: {
            pointId: this.getVuexPointData.id, // 客位id
            loadmodule: 1,
            _t: new Date().getTime(),
          },
        }).then((data) => {
          this.$refs[method].open(data, {
            submit: (pointData) => {
              // 并账刷新客位和账单信息
              this.updatePointAndBill(pointData);
            },
          });
        }).catch((msgCode, msg) => {
          this.$message.error(msg);
        });
      });
    },
    // 团队开单
    teamOrder(method) {
      const activeId = this.getVuexPointData.id;
      ajax('canyin.pos.teambill.teambillview', {
        params: {
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((data) => {
        this.$refs[method].open(data, {
          submit: (data) => {
            // 推送刷新客位
            setTimeout(() => {
              this.$vemit('updatePoint');
              // 如果操作的客位被选中的话进行刷新下账单
              if (activeId && data.pointIds.indexOf(activeId) !== -1) {
                this.$vemit('loadBill', activeId);
              }
            }, 500);
          },
        });
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 团队组成
    teamConstitute(method) {
      ajax('canyin.pos.teammangergroup.teammangergroupview', {
        params: {
          loadmodule: 1, _t: new Date().getTime(),
        },
      }).then((data) => {
        this.$refs[method].open(data, {
          submit: (pointDatas) => {
            pointDatas.pointIds.forEach((pointId) => {
              // // 添加团队标志
              this.setTeamPointFlgState({
                pointId,
                isTeam: true,
                teamName: pointDatas.teamName,
                teamId: pointDatas.teamId,
              });
            });
            this.$refs.moreTableBtns.close();
            setTimeout(() => {
              this.$vemit('updatePoint');
              this.$vemit('loadBill', this.getVuexPointData.id);
            }, 500);
          },
        });
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 团队加入
    teamJoin(method) {
      if (
        !this.getVuexPointData
        || this.getVuexPointData.state !== tableState.OCCUPY
        || this.getVuexPointData.isTeam !== 0
      ) {
        this.$message.error(this.$t('Biz.Order.SelectTeamAndOccupyMsg'));
        return;
      }
      ajax('canyin.pos.teammanger.addteamview', {
        params: {
          pointId: this.getVuexPointData.id,
          bsId: this.getVuexPointData.bsId,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((data) => {
        this.$refs[method].open(data, {
          submit: (teamName) => {
            const changedPointData = {
              pointId: this.getVuexPointData.id,
              isTeam: true,
              teamName,
            };
            // 添加团队标志
            this.setTeamPointFlgState(changedPointData);
            // 组成团队更新
            setTimeout(() => {
              this.$vemit('updatePoint');
              this.$vemit('loadBill', this.getVuexPointData.id);
            }, 500);
            this.$refs.moreTableBtns.close();
          },
        });
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 退出团队
    teamQuit() {
      if (this.getVuexPointData.state !== tableState.OCCUPY) {
        this.$message.error(this.$t('Biz.Order.OnlyOccupyMsg'));
        return;
      }
      if (+this.getVuexPointData.isTeam !== 1) {
        this.$message.error(this.$t('Biz.Order.CurrentNotTeamMsg'));
        return;
      }
      const params = {
        teamId: this.getVuexPointData.teamId,
        pointId: this.getVuexPointData.id,
        bsId: this.getVuexPointData.bsId,
        loadmodule: 1,
        _t: (new Date()).getTime(),
      };
      ajax('canyin.pos.teammanger.cancelteambill', {
        needToken: true,
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        const changedPointData = {
          pointId: this.getVuexPointData.id,
          isTeam: false,
          teamName: null,
        };
        // 移除团队标志
        this.setTeamPointFlgState(changedPointData);
        // 更新下
        setTimeout(() => {
          this.$vemit('updatePoint');
          this.$vemit('loadBill', this.getVuexPointData.id);
        }, 500);
        this.$refs.moreTableBtns.close();
        this.$message.success(data.data.msg);
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 定时增量刷新客位
    intervalRefreshTables() {
      // 定时60s刷新客位以及账单
      this.timer = setInterval(() => {
        this.$vemit('updatePoint', null, this.config.isOpenNewWesocket);
      }, 30 * 1000);
    },
    // 清除刷新客位的定时器
    clearRefreshTables() {
      clearInterval(this.timer);
    },
    // 关台
    closeAccount(method, closeTeam) {
      if (this.getVuexPointData && this.getVuexPointData.state === tableState.PRE_PAY) {
        this.$message.error(this.$t('Biz.Order.PrepayCannotCloseMsg'));
        return;
      }
      const params = {
        pointId: this.getVuexPointData.id,
        controlMode: this.posBaseInfo.controlMode,
        loadmodule: 1,
        _t: (new Date()).getTime(),
      };
      if (closeTeam !== null && closeTeam !== undefined) {
        params.closeTeam = closeTeam;
      }
      if (this.getVuexPointData && this.getVuexPointData.id) {
        ajax('canyin.pos.closeBill.closeBill', {
          contentType: 'paramsEncoded',
          data: params,
        }).then((data) => {
          // 是否进行团队正常关台
          if (data.teamNoSc >= 2) {
            this.$confirm(this.$t('Biz.Order.IsPerformCloseTeamMsg'), this.$t('Dict.Tips'), {
              distinguishCancelAndClose: true,
              confirmButtonText: this.$t('Biz.Order.CloseCurrentTable'),
              cancelButtonText: this.$t('Biz.Order.CloseAllTables'),
              type: 'warning',
            }).then(() => {
              this.closeAccount('closeAccount', false);
            }).catch((action) => {
              if (action === 'cancel') {
                this.closeAccount('closeAccount', true);
              }
            });
          } else {
            this.closeAccountSuccess();
          }
        }).catch((err, msg) => {
          // 在接口错误逻辑中,判断执行'废单流程',
          // ## 接口输出字段 转赋值,err实际输出为接口逻辑错误时的data, 并不是真正的errCode
          if (+err.result === -103) {
            // 判断是否团队 ? 提示'脱团'在废单 : 直接执行废单
            if (this.getVuexPointData.isTeam === 1) {
              this.$message.error(this.$t('Biz.Order.LongMsg001'));
              return false;
            }
            // 执行废单(非团队)
            this.abolishBill();
          } else if (err.result === -102) {
            this.$confirm(this.$t('Biz.Order.LangMsg039'), this.$t('Dict.Tips'), {
              dangerouslyUseHTMLString: true,
            }).then(() => {
              this.cancelAllBill();
            }).catch(() => {});
          } else {
            this.$confirm(`${msg}`, this.$t('Dict.Tips'), {
              type: 'warning',
              showCancelButton: false,
            });
          }
          return true;
        });
      } else {
        this.$message.error(this.$t('Biz.Order.PleaseSelectTableMsg'));
      }
    },
    // 退所有
    cancelAllBill(authData = {}) {
      this.$vonce('authCode', (data) => {
        this.cancelAllBill(data);
      });
      const { bsData } = this.posOrderBill;
      const modifyTime = Number(new Date(bsData.modifyTime.replace('T', ' ')));
      ajax('canyin.pos.addexitbill.cancelallbill', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          bsId: this.getVuexPointData.bsId,
          pointId: this.getVuexPointData.id,
          isTeamCancel: false,
          teamPointIds: null,
          modifyTime,
          unCancelBillPrint: false,
          onlinePayRefundFlg: false,
          isAfterBizCheck: false,
          ...authData,
        },
      }).then((data) => {
        if (data.success && data.data) {
          this.$message.success(data.data.msg);
          this.requestabolishBill();
        }
      });
    },
    // 关台成功
    closeAccountSuccess() {
      if (this.getVuexPointData.pid) {
        this.updateCancelTransferPointState(this.getVuexPointData.id);
      }
      // 执行刷新客位账单
      this.$message.success(this.$t('Biz.Order.CloseTableSuccessMsg'));
      // 清账单
      setTimeout(() => {
        this.$vemit('clearEmptyBill', false);
      }, 500);
    },
    // 客位界面执行的<废单>业务
    abolishBill() {
      this.$confirm(this.$t('Biz.Order.LongMsg002'), this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }).then(() => {
        this.requestabolishBill();
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: this.$t('Dict.OperationCancelled'),
        });
      });
    },
    requestabolishBill(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.requestabolishBill(code);
      });
      const params = {
        pointId: this.getVuexPointData.id,
        teamBsIds: '',
        ...authData,
      };
      ajax('canyin.pos.abandonedbill.abandonedbill', {
        params: { params },
      }).then((res) => {
        if (res.result === 1) {
          this.$message.success(this.$t('Dict.WasteSuccess'));
          // 废单打印接口
          const url = 'canyin.pos.printsettle.getsettleprintdata';
          // 组装参数
          const tmpParams = {
            bsId: res.data.bsId,
            styleType: 1,
            isCheckTeam: false, // 团队废单被阻拦,所以写死为 非团队
          };
          // 执行打印(只执行常规打印)
          if (!this.config.dontPrintStatementAfterCancelOrder) {
            this.$vemit('commonPrint', { url, params: tmpParams, printType: 1 });
          }
          // 重置账单
          this.$vemit('clearEmptyBill', {});
          // 清空搜索框
          this.$vemit('resetOrderSearchText');
        } else if (res.result === -2) {
          // 执行授权
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else {
          // 错误返回
          this.$message({
            type: 'error',
            message: res.msg,
            duration: 2000,
          });
        }
      });
    },
    // 撤销转账的时候更显客位状态
    updateCancelTransferPointState(id) {
      // Vuex中删除虚拟客位
      this.setCancelTransferPointState(id);
    },
    // 是否开启了押金管理
    isOpenBuffetDepositManage() {
      const hasBuffetDepost = this.ALL_POS_MODULE.find(({ id }) => id === '1252');
      return hasBuffetDepost && hasBuffetDepost.checked;
    },
    // 押金
    deposit() {
      if (this.getVuexPointData && this.getVuexPointData.id) {
        if (!this.isOpenBuffetDepositManage()) {
          this.$message.error(this.$t('Dict.UserNoPermissionOfDepositMsg'));
          return;
        }
        const data = cloneDeep(this.getVuexPointData);
        data.pointId = data.id;
        this.$vemit('moreOperation', 'buffetDeposit', {
          pointData: data,
          bsId: data.bsId,
          source: 'tablesIndex',
        });
      } else {
        this.$message.error(this.$t('Biz.Order.PleaseSelectTableMsg'));
      }
    },
    // 刷新当前客位和账单状态
    updatePointAndBill(pointData) {
      // 加载账单
      if (this.getVuexPointData.state === tableState.VACANCY) {
        this.getOrderBill({ list: null });
      } else {
        this.$vemit('loadBill', pointData.id);
      }
      // 加载客位
      const table = find(this.posTables, item => item.id === pointData.id);
      this.setPosPointData(table);
    },
    ...mapMutations({
      setTeamPointFlgState: 'SET_POS_TEAMPOINTFLG',
      setCancelTransferPointState: 'SET_POS_CANCELTRANSFERPOINTSTATE',
      setPosPointData: 'SET_POS_POINT_DATA',
      setOrderTables: 'SET_TABLES',
      setIsNeedTableWsHandle: 'SET_ISNEED_TABLE_WsHANDLE',
    }),
    ...mapActions([
      'getOrderBill',
    ]),
    /**
     * @函数说明 更新所有客位的显示信息
     */
    updateTables(callBack = null) {
      ajax('canyin.pos.reception.receptionbusiness.getspendtime', {
        loading: false,
      })
        .then((res) => {
          // 更新客位列表的vuex数据
          this.setOrderTables(map(res, item => ({
            id: item.id,
            pid: item.pid ? item.pid : null,
            name: item.name,
            pointFullName: item.pointFullName || '', // 客位全称  area.code-name
            pinyin: item.pinyin,
            code: item.code,
            defaultCapacity: item.defCapacity,
            deposit: item.deposit,
            areaId: item.areaid,
            typeId: item.pointtypeid,
            bsId: item.bsId,
            haveItem: item.have_item > 0,
            isTeam: item.is_team,
            lastTotal: item.lastTotal,
            openTime: item.openTime,
            orderType: item.orderType,
            origTotal: item.origTotal,
            peopleQty: item.peopleqty,
            spendTime: item.spendTime ? item.spendTime : 0,
            state: item.state,
            isContinuedBill: item.isContinuedBill,
            turnoverCount: item.turnoverCount,
            teamId: item.teamId,
            teamName: item.team_name ? item.team_name : null,
            isVIP: item.isVIP,
            bookingTimes: item.bookingTimes, // 预订的次数
            pointGroupId: item.pointGroupId, // 客位限定品项关联得分组id
            billRemark: item.billRemark, // 整单备注
            callState: item.callState, // 客位是否有叫起的菜
            membershipCardType: item.membershipCardType, // 会员卡类型
            memberPayNum: item.memberPayNum, // 会员消费次数
            progressOfServingDishes: item.progressOfServingDishes, // 上菜进度
            advanceBalance: item.advanceBalance, // 预付差额
            birthday: item.birthday || '', // 会员生日
            cardBalance: item.cardBalance || '', // 会员卡余额
            memberName: item.memberName || '', // 会员名称
          })));
          callBack && callBack();
        }).catch(() => {
          callBack && callBack();
        });
    },
    //
    /**
     * 消费时长的定时管理
     */
    setSpendTimeTimerSwitch(swich = false) {
      this.$refs.list.openSpendTime(swich);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-order-tables {
  position: relative;
  height: 100%;
  padding-bottom: @pos-order-tables-btns-height +
    @pos-order-tables-btns-offset-bottom +
    @pos-order-tables-control-offset-bottom;
}
</style>
