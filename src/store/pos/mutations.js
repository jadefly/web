import {
  find,
  findLast,
  each,
  extend,
  indexOf,
  cloneDeep,
} from 'lodash';
import * as types from './mutation-types';
/* 所有参数必须加注释,并声明参数的作用 */

const mutations = {
  [types.SET_CONFIG](state, data) {
    state.config = data;
  },
  [types.SET_LOCALE](state, data) {
    state.locale = data;
  },
  // [types.SET_LOGOMODE](state, data) {
  //   state.logoMode = data  //产品logo 标识
  // },
  [types.SET_SHOW_POS](state, data) {
    state.showPos = data; // 是否显示选择Pos页
  },
  [types.SET_SHOW_LOGIN](state, data) {
    state.showLogin = data; // 是否显示登录页
  },
  [types.SET_SHOW_KAIBAN](state, data) {
    state.showKaiban = data; // 是否显示开班页
  },
  [types.SET_ISLOGINORLOGOUT_ENTERKAIBAN](state, data) {
    state.isLoginOrLogoutEnterKaiban = data; // 进入开班页面的方式
  },
  [types.SET_RECEPTION_DATA](state, data) {
    state.receptionBusinessData = data; // 客位数据
  },
  [types.SET_POIONTS_LAST_MODIFY_TIOME](state, data) {
    // @param {String} pointsLastModifyTime 客位最后更新时间,yyyy-MM-dd HH:mm:ss
    state.tableInfo.pointsLastModifyTime = data;
  },
  [types.SET_POIONT_CONTENT_LAYOUT](state, data) {
    // 客位框上显示信息的自定义数据
    state.tableInfo.pointContentLayout = data;
  },
  [types.SET_POS_ORDER_BILL](state, data) {
    // 做下处理 添加个是否是自助类型点餐
    if (data != null) { // 清空账单,这个data为空
      data.isDinnerBuffet = (state.order.isOpenSelf && data.dinnerMode === 2);
    }
    state.posOrderBill = data;
  }, // 客位账单数据
  [types.SET_POS_ORDER_MENU](state, data) {
    state.menu = data;
  },
  // 当前客位信息
  [types.SET_POS_POINT_DATA](state, data) {
    state.pointData = data;
  },
  [types.SET_POS_BASE_INFO](state, data) {
    state.posBaseInfo = data;
  },
  [types.SET_POS_DEVICE](state, data) {
    state.device = data;
  },
  [types.SET_POS_SETTING](state, data) {
    state.setting = data;
  },
  [types.SET_POS_FASTFOOD](state, data) {
    state.fastFood = data;
  },
  [types.SET_FOOT_INFO](state, data) {
    state.footInfo = data;
  },
  [types.SET_POS_INFOFOOTER](state, data) {
    if (state.footInfo) {
      state.footInfo.currentBusinessDay.notSettlementMoney = data.notsettlementmoney;
      state.footInfo.currentBusinessDay.opened = data.opened;
      state.footInfo.currentBusinessDay.settled = data.settled;
      state.footInfo.currentBusinessDay.settlementMoney = data.settlementmoney;
      state.footInfo.currentBusinessDay.unsettle = data.unsettle;
      state.footInfo.currentBusinessDay.settledPeople = data.settledPeople;
      state.footInfo.currentBusinessDay.unsettledPeople = data.unsettledPeople;
      state.footInfo.currentShift.notSettlementMoney = data.notSettlementMoneyCurrentShift;
      state.footInfo.currentShift.opened = data.openedCurrentShift;
      state.footInfo.currentShift.settled = data.settledCurrentShift;
      state.footInfo.currentShift.settlementMoney = data.settlementMoneyCurrentShift;
      state.footInfo.currentShift.unsettle = data.unsettleCurrentShift;
      state.footInfo.currentShift.settledPeople = data.settledPeopleCurrentShift;
      state.footInfo.currentShift.unsettledPeople = data.unsettledPeopleCurrentShift;
    }
  },
  [types.SET_BOOKING](state, data) {
    state.booking = data;
  },
  [types.SET_CRM](state, data) {
    state.crm = data;
  },
  [types.SET_MEMBER](state, data) { // 荣管家会员模块
    state.member = data;
  },
  [types.SET_OUT_DEVICE_SETTING](state, data) {
    state.outDeviceSetting = data;
  },
  [types.SET_RESERVE](state, data) {
    state.reserve = data;
  },
  [types.SET_TAKEOUT](state, data) {
    state.takeout = data;
  },
  [types.SET_ORDER](state, data) {
    data.itemsMoreBarcode = data.itemsMoreBarcode.map((v) => {
      v.count = 0;
      return v;
    });
    state.order = data;
  },
  [types.SET_ORDER_INFO](state, data) {
    state.order = data;
  },
  [types.SET_ORDER_TABLES](state, data) {
    state.tableInfo.tables = data;
    if (state.pointData) {
      data.forEach((point) => {
        if (point.id === state.pointData.id) {
          state.pointData = point;
        }
      });
    }
  },
  [types.SET_SETTLEMENT_BILL_DATA](state, data) {
    state.settlementBillData = data;
  },

  [types.SET_SETTLE_DISCTYPE](state, data) {
    if (typeof (data) !== 'object' && typeof (data) === 'string') {
      state.settleDiscType[data] = null;
    } else {
      state.settleDiscType[data.bsId] = data;
    }
  },
  [types.SET_ETAG_ITEMS](state, data) {
    if (!state.dialogArr.length) {
      state.eTagItems = data;
    }
  },
  [types.SET_ITEMSELLOUTSMAP](state, data) {
    if (!state.order) state.order = {};
    state.itemInfo.itemSelloutsMap = data;
  },
  [types.SET_METHODSELLOUT](state, data) { // 做法估清
    state.itemMethodSellout = data;
  },
  [types.SET_PROMOTELIMITMAP](state, data) { // 促销限量
    if (!state.order) state.order = {};
    state.itemInfo.promoteLimitMap = data;
  },
  [types.SET_ITEMLIMITSMAP](state, data) {
    if (!state.order) state.order = {};
    state.itemInfo.itemLimitsMap = data;
  },
  [types.SET_ITEMTIMEPRICESMAP](state, data) {
    if (!state.order) state.order = {};
    state.itemInfo.itemTimePricesMap = data;
  },
  // 单独针对多条码数组处理,更新全部多条码数据
  [types.SET_ITEMSMOREBARCODE](state, data) {
    // if (!state.order) state.order = {};
    state.itemInfo.itemsMoreBarcode = data;
  },
  // 单独针对多条码数组处理,更新单条多条码数据
  [types.SET_ITEMSMOREBARCODE_SINGLE](state, data) {
    const { item, index } = data;
    state.itemInfo.itemsMoreBarcode[index] = item;
  },
  // 设置预点通知计数
  [types.SET_RESERVE_NOTIFY_COUNT](state, count) {
    state.headerNotifyCount.reserveCount = count;
  },
  // 按钮设置
  // [types.SET_SERVICE_FUNCTION_BTNS](state, serviceFunctionBtns) {
  //   state.serviceFunctionBtns = serviceFunctionBtns;
  // },
  // 所有Pos模块
  // [types.SET_ALL_POS_MODULE](state, allPosModule) {
  //   state.allPosModule = allPosModule;
  // },
  // 更新预订客位列表
  [types.SET_BOOKING_POINT_LIST](state, data) {
    if (state.booking) {
      state.booking.reservePointMap = data;
    }
  },
  // 更新预订单被执行后的客位id
  [types.SET_BOOK_EXECUTED_POINTS](state, data) {
    if (state.booking && data) {
      data.forEach((item) => {
        state.booking.executedPoints.push(item);
      });
    }
  },
  // 更改当前的客位的团队标识状态
  [types.SET_POS_TEAMPOINTFLG](state, data) {
    const { tables } = state.tableInfo;
    const finded = find(tables, { id: data.pointId });
    if (finded) {
      finded.isTeam = data.isTeam ? 1 : 0;
      finded.teamName = data.teamName;
      finded.teamId = data.teamId ? data.teamId : finded.teamId;
    }
  },
  // 这个是撤销转账的时候进行更显tables
  [types.SET_POS_CANCELTRANSFERPOINTSTATE](state, ids) {
    const { tables } = state.tableInfo;
    each(ids.split('-'), (id) => {
      const finded = find(tables, { id });
      if (finded) {
        tables.splice(indexOf(tables, finded), 1);
      }
    });
  },
  // 客位的按钮状态的显示更新
  [types.SET_POS_POINTSHOWSTATE](state, data) {
    const { tables } = state.tableInfo;
    if (data.wsName === 'addorderhaveitem') {
      each(data.pointIds, (id) => {
        const finded = find(tables, { id });
        if (finded) {
          finded.haveItem = data.haveItem;
        }
      });
    } else if (data.wsName === 'pointorigtotal') {
      const finded = find(tables, { id: data.pointId });
      const updateKeys = Object.keys(data);
      if (finded && updateKeys) {
        updateKeys.forEach((key) => {
          if (key !== 'pointId') {
            finded[key] = data[key];
          }
        });
      }
    } else if (data.wsName === 'depositdetail') {
      const finded = find(tables, { id: data.pointId });
      if (finded) {
        finded.deposit = data.deposit;
      }
    }
  },
  // 后台品项档案发生变化的时候推送的items 来改变
  [types.SET_POS_ITEMS](state, data) {
    // state.order.items.splice(0, state.order.items.length);
    state.itemInfo.items = data;
  },

  // 注销时清空信息
  [types.CLEAR_STATE_ON_LOGOUT](state) {
    state.pointData = null;
    state.posOrderBill = null;
  },
  // 快餐模式下的账单缓存
  [types.SET_FASTTFOODBILL_DATA](state, data) {
    state.fastFoodBillData = data;
  },
  [types.SET_SELECT_DISCOUNTPLAN_DATA](state, data) {
    state.selectDiscountPlanData = data;
  },
  [types.SET_SELECT_VOUCHER_DATA](state, data) {
    state.selectVoucherData = data;
  },
  // 修改预点单数据
  [types.SET_RESERVEORDER_LIST](state, data) {
    state.reserveOrderList = data;
  },
  // 系统时间和互联网时间
  [types.SET_TIME_COMPARE_DATA](state, data) {
    state.timeCompareData = data;
  },
  [types.SET_SELECT_CRM_DATA](state, data) {
    state.selectCrmData = data;
  },
  // 暂不使用
  // // 快餐模式下, 设置快餐的根组件(路由进入)创建DOM的状态, 用于判断该组件状态
  // [types.SET_FASTFOODSTATUS](state, data) {
  //   state.fastFoodStatus = data;
  // },

  // 快餐模式下, 执行验证会员方案(会员价和N杯打折)的状态参数对象
  [types.SET_FASTFOODMEMBERPLAN_FLG](state, data) {
    state.fastFoodMemberPlanFlg = data;
  },
  // 品相查询模式
  [types.SET_SEARCH_MODE](state, model) {
    state.order.searchMode = model;
  },
  // 中餐电子秤
  [types.SET_NEWWEIGHTDATA](state, data) {
    state.newWeightData = data;
  },
  [types.IS_EXIT_DATA](state, model) {
    state.isExitData = model;
  },
  [types.IS_BATCH_OPERATION](state, data) {
    state.isbatchOperation = data;
  },
  // [types.SET_DOMEMBERPRCIE_STATE](state, data) {
  //   state.fastFoodDoMemberPriceState = data
  // }
  [types.SET_TABLES_AREAS](state, data) {
    state.tableInfo.areas = data;
  },
  [types.SET_TABLES_TYPES](state, data) {
    state.tableInfo.types = data;
  },
  [types.SET_TABLES_INDEX](state, data) {
    state.tableInfo.tableIndexObject = data;
  },
  [types.SET_TABLES](state, data) {
    state.tableInfo.tables = data;
    if (state.pointData) {
      state.pointData = find(data, { id: state.pointData.id });
    }
  },
  [types.UPDATE_TABLES](state, updatePoints) {
    let callBackFn = null;
    let updateData = updatePoints;
    if (Object.prototype.toString.call(updatePoints).slice(8, -1) === 'Object') {
      callBackFn = updatePoints.callBack;
      updateData = updatePoints.data;
    }
    // isNewWs 是否是走新的推送改造逻辑 updateObject
    const { isOpenNewWesocket } = state.config;
    const { tableIndexObject } = state.tableInfo;
    const { tables } = state.tableInfo;
    // 匹配key 值不一样的问题,这块和后端说了尽量一致,目前先匹配下
    const objectNew = point => ({
      isTeam: point.is_team,
      haveItem: point.have_item > 0,
      teamName: point.team_name || null,
      isVIP: point.isVIP,
      peopleQty: point.peopleqty,
      defaultCapacity: point.defCapacity,
      bookPerson: point.bookPerson ? point.bookPerson : '',
      areaId: point.areaid,
      typeId: point.pointtypeid,
    });
    if (isOpenNewWesocket) {
      for (let index = 0; index < updateData.length; index += 1) {
        const element = updateData[index];
        // const seekIndex = tableIndexObject[element.pid || element.id];
        // 虚拟客位的时候
        if (element.pid) {
          const seekIndexs = tableIndexObject[element.pid]; // 虚拟的主客位是否存在
          // 如果找到初始的客位的主客位才执行否则不执行
          if (seekIndexs || seekIndexs === 0) {
            if (tables[seekIndexs].id === element.id) {
              tables.splice(seekIndexs, 1, { ...tables[seekIndexs], ...element, ...objectNew(element) });
            } else {
              const forLength = tables.length;
              const pidPointsIndex = [];
              let mianPointIndex = seekIndexs;
              let isFind = false;
              for (let k = seekIndexs; k < forLength; k += 1) {
                // 找到直接替换
                if (tables[k].pid === element.pid) {
                  pidPointsIndex.push(k);
                }
                if (tables[k].id === element.pid) {
                  mianPointIndex = k;
                }
                if (element.id === tables[k].id) {
                  if (state.pointData && element.id === state.pointData.id) {
                    state.pointData = { ...tables[k], ...element, ...objectNew(element) };
                    // 空闲的时候不需要回调
                    if (callBackFn) {
                      if (+element.state === 1) {
                        state.posOrderBill = null;
                      } else {
                        callBackFn(element.id);
                      }
                    }
                  }
                  tables.splice(k, 1, { ...tables[k], ...element, ...objectNew(element) });
                  isFind = true;
                  break;
                }
              }
              if (!isFind) {
                // 插入数组的位置
                let isInsertIndex = mianPointIndex + 1;
                if (pidPointsIndex.length) {
                  isInsertIndex = pidPointsIndex.pop() + 1;
                }
                tables.splice(isInsertIndex, 0, { ...element, ...objectNew(element) });
              }
            }
            // while (tables[seekIndexs].id !== element.pid) {
            //   seekIndexs += 1;
            // }
            // seekIndexs += 1;
            // while (tables[seekIndexs].id === element.id) {
            //   // 找到并直接替换
            //   if (tables[seekIndexs].id === element.id) {
            //     isHave = true;
            //     const notAlikeKey = {

            //     }
            //     tables.splice(seekIndexs, 1, { ...tables[seekIndexs], ...element });
            //   }
            //   seekIndexs += 1;
            // }
            // // 如果没找到
            // if (!isHave) {
            //   // 直接添加
            //   tables.splice(seekIndexs, 0, { ...tables[seekIndexs], ...element });
            // }
          }
        } else {
          const seekIndex = tableIndexObject[element.id];
          if (seekIndex || seekIndex === 0) {
            // 查找下标,找到相对对应的位置 如果是相等那直接替换更新
            if (tables[seekIndex].id === element.id) {
              if (state.pointData && element.id === state.pointData.id) {
                state.pointData = { ...tables[seekIndex], ...element, ...objectNew(element) };
                // 空闲的时候不需要回调
                if (+callBackFn) {
                  if (+element.state === 1) {
                    state.posOrderBill = null;
                  } else {
                    callBackFn(element.id);
                  }
                }
              }
              tables.splice(seekIndex, 1, { ...tables[seekIndex], ...element, ...objectNew(element) });
            } else {
              // let findeIndex = seekIndex;
              for (let i = seekIndex; i < tables.length; i += 1) {
                if (tables[i].id === element.id) {
                  if (state.pointData && element.id === state.pointData.id) {
                    state.pointData = { ...tables[i], ...element, ...objectNew(element) };
                    // 空闲的时候不需要回调
                    if (callBackFn) {
                      if (+element.state === 1) {
                        state.posOrderBill = null;
                      } else {
                        callBackFn(element.id);
                      }
                    }
                  }
                  tables.splice(i, 1, { ...tables[i], ...element, ...objectNew(element) });
                  break;
                }
              }
            }
          }
          // } else {
          //   for (let i = seekIndex; i < tables.length - seekIndex; i += 1) {
          //     if (tables[i].id === element.id) {
          //       tables.splice(i, 1, { ...tables[i], ...element });
          //       break;
          //     }
          //   }
          // }
        }
      }
    } else {
      const mergeUpdatePoint = (findPoint, point) => {
        extend(findPoint, {
          id: point.id,
          pid: point.pid,
          name: point.name,
          pinyin: point.pinyin,
          code: point.code,
          defaultCapacity: point.defCapacity,
          deposit: point.deposit,
          areaId: point.areaid,
          typeId: point.pointtypeid,
          bsId: point.bsId,
          haveItem: point.have_item > 0,
          isTeam: point.is_team,
          lastTotal: point.lastTotal,
          openTime: point.openTime,
          orderType: point.orderType,
          origTotal: point.origTotal,
          peopleQty: point.peopleqty,
          spendTime: point.spendTime,
          isContinuedBill: point.isContinuedBill,
          state: point.state,
          turnoverCount: point.turnoverCount,
          teamId: point.teamId,
          teamName: point.team_name ? point.team_name : null,
          isVIP: !!point.isVIP,
          bookPerson: point.bookPerson ? point.bookPerson : '',
          billRemark: point.billRemark, // 整单备注
          callState: point.callState, // 客位是否有叫起的菜
          membershipCardType: point.membershipCardType, // 会员卡类型
          memberPayNum: point.memberPayNum, // 会员消费次数
          progressOfServingDishes: point.progressOfServingDishes, // 上菜进度
          bookingTimes: point.bookingTimes, // 预定的次数
          pointGroupId: point.pointGroupId, // 分组客位的id
          advanceBalance: point.advanceBalance, // 预付差额
          birthday: point.birthday || '', // 会员生日
          cardBalance: point.cardBalance || '', // 会员卡余额
          memberName: point.memberName || '', // 会员名称
        });
      };
      each(updateData, (point) => {
        let findPoint = find(tables, { id: point.id });
        if (findPoint) {
          // 如果是空闲客位需要把开台消费时长初始化下由于后台给的增量接口数据key不全，暂时先把缓存的数据的key值初始化下
          if (point.state === 1) {
            findPoint.spendTime = 0;
          }
          mergeUpdatePoint(findPoint, point);
        } else {
          findPoint = cloneDeep(find(tables, { id: point.pid }));
          if (findPoint) {
            if (point.state === 1) {
              findPoint.spendTime = 0;
            }
            mergeUpdatePoint(findPoint, point);
            const lastPidTable = findLast(tables, { pid: point.pid });
            let index = 0;
            if (lastPidTable) {
              index = indexOf(tables, lastPidTable) + 1;
            } else {
              index = indexOf(tables, find(tables, { id: point.pid })) + 1;
            }
            tables.splice(index, 0, findPoint);
          }
        }
      });
      if (state.pointData) {
        state.pointData = find(tables, { id: state.pointData.id });
      }
    }
  },
  [types.DELETE_XUNI_TABLES](state, points) {
    const { tables } = state.tableInfo;
    const { tableIndexObject } = state.tableInfo;
    if (points.length) {
      for (let index = 0; index < points.length; index += 1) {
        const element = points[index];
        // 匹配主客位的大致的下标
        const mainIndex = tableIndexObject[element.pid];
        // let findIndex = 0;
        if (mainIndex || mainIndex === 0) {
          for (let i = mainIndex; i < tables.length; i += 1) {
            const point = tables[i];
            if (point.id === element.id) {
              // findIndex = i;
              // state.posOrderBill = null;
              tables.splice(i, 1);
              break;
            }
          }
          // if (findIndex) {
          //   tables.splice(findIndex, 1);
          // }
        }
      }
    }
  },
  [types.SET_ITEM_INFO](state, data) {
    Object.preventExtensions(data.items);
    Object.preventExtensions(data.itemsMoreBarcode);
    state.itemInfo = data;
  },
  // 多次结算的菜品
  [types.SET_MULTISETTLE](state, data) {
    state.multisettleArr = data;
  },
  [types.SET_MENU_BTNS](state) {
    if (state.order.allPosModuleOper) {
      const ADD_ORDER_AUTHID = '178'; // 加单二级权限
      const orderingAuthList = state.order.allPosModuleOper[ADD_ORDER_AUTHID];
      if (orderingAuthList && orderingAuthList.children.length > 0) {
        const list = state.order.customMenuBtn.map((btn) => {
          const auth = find(orderingAuthList.children, { id: btn.id });
          btn.hasNoAuth = auth ? !auth.checked : false; // 是否有权限
          return btn;
        });
        state.order.customMenuBtn = list;
      }
    }
  },
  [types.SET_FASTFOOD_MENU_BTNS](state) {
    // if(state.order.btns.length){
    //   state.order.customFastFoodMenuBtn = data;
    // }
    if (state.order.btns.length) {
      if (state.order.allPosModuleOper) {
        const ADD_ORDER_AUTHID = '178'; // 加单二级权限
        const orderingAuthList = state.order.allPosModuleOper[ADD_ORDER_AUTHID];
        if (orderingAuthList && orderingAuthList.children.length > 0) {
          const list = state.order.customFastFoodMenuBtn.map((btn) => {
            const auth = find(orderingAuthList.children, { id: btn.id });
            if (auth) {
              btn.hasNoAuth = !auth.checked; // 是否有权限
            } else if (btn.name === 'redemption') {
              btn.hasNoAuth = true;
            } else {
              btn.hasNoAuth = false;
            }
            return btn;
          });
          state.order.customFastFoodMenuBtn = list;
        }
      } else {
        // state.order.customFastFoodMenuBtn = data;
      }
    }
  },
  [types.SET_DIALOG](state, data) {
    if (data) {
      state.dialogArr.push(1);
    } else {
      state.dialogArr.splice(0, 1);
    }
  },
  [types.SET_RERFESHBS](state, data) {
    state.refreshBs = data;
  },
  [types.SET_DEFAULT_KEYBOARD_TYPE](state, { type, value }) {
    if (+type === 3) { // 3 是客位页面
      state.order.pointKeyboardMode = value;
    } else if (+type === 4) { // 4是加单页面 中快餐通用
      state.order.addOrderKeyboardMode = value;
    } else {
      state.order.pointKeyboardMode = value; // 中餐下没有客位页面，所以传过来的值不需要变
    }
  },
  [types.SET_DISCPLAN_AND_PAYWAY](state, data) {
    state.discPlanAndPayway = data;
  },
  [types.SET_SETTLE_BS_CODE](state, data) {
    state.settleBsCode = data;
  },
  [types.SET_CREDIT_ACCOUNT](state, data) {
    state.creditAccount = data;
  },
  // 用户桌面页面基础数据
  [types.SET_DESK_PAGE_BASE_INFO](state, data) {
    state.deskPageBaseInfo = data;
  },
  // 用户桌面权限数据
  [types.SET_DESK_PAGE_AUTH_MODULES](state, data) {
    state.deskPageAuthModules = data;
  },
  setTimerImgDetect(state, fn, timeer = 2000) { // AI智能加单-定时器开启
    fn();
    state.timerImgDetect = setInterval(fn, timeer); // 时间2s
  },
  clearTimerImgDetect(state) { // AI智能加单-定时器关闭
    clearInterval(state.timerImgDetect);
  },
  setCurrentPointId(state, val) { // 中餐-设置当前客位id-复制套餐时传参用
    state.currentPointId = val;
  },
  setPayPageOpen(state, val) {
    state.payPageOpen = val;
  },
  [types.SET_ISNEED_TABLE_WsHANDLE](state, data) {
    state.isNeedTableWsHandle = data;
  },
  // 当前选择客位的分组id  pointGroupId
  [types.SET_POINTGROUPID](state, data) {
    state.activePointGroupId = data;
  },
};

export default mutations;
