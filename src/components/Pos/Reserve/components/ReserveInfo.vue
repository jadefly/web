<template>
  <div class="reserve-info-warp">
    <div class="btns-warp">
      <button
        type="button"
        class="btn btn-primary order-btn"
        :disabled="!canReserveOrder"
        @click="submitReserve"
      >{{ curMode ? this.$t('Dict.PlaceAnOrder') : this.$t('Dict.AllOrders')}}</button>
      <el-row class="dynamicBtnWrap" :gutter="4">
        <el-col :span="dynamicProgressBtnWidth">
          <button
            type="button"
            class="btn btn-default"
            v-if="curMode"
            @click="editReserve"
          >{{$t('Biz.Reserve.EditReserveOrder')}}</button>
          <div class="allDoRserveLogo" @click="showProgressDialog" v-else>
            <p v-show="executeState">
              <i></i>
              <span>{{$t('Biz.Reserve.OrderProgressDisplay')}}</span>
            </p>
          </div>
        </el-col>
        <el-col :span="dynamicCancelBtnWidth">
          <button
            type="button"
            class="btn btn-default"
            @click="cancelReserve"
          >{{$t('Dict.CancelReserve')}}</button>
        </el-col>
        <el-col :span="funBtnSpan" v-if="curMode">
          <button
            type="button"
            class="btn btn-default"
            @click="printReserve"
          >{{$t('Dict.Printing')}}</button>
        </el-col>
      </el-row>
    </div>
    <div v-if="itemList.length > 0" class="table-info">
      <h4 class="order-no-content">
        {{$t('Dict.ReservOrderId')}}
        <span>{{order.code}}</span>
      </h4>
      <p class="info-detail">
        <span class="seat">{{$t('Dict.Seat01')}}{{order.pointName}}</span>
        <span class="cost" v-show="order.totalprice">{{$t('Dict.OrderTotalPrice')}} {{order.totalprice | keepTwo}}</span>
        <span class="cost" v-show="!order.totalprice">{{$t('Dict.OrderTotalPrice')}}</span>
      </p>
    </div>
    <div class="item-list" v-loading='loading' ref="listwarp">
      <div :class="['item',{'pointer': item.errorMsg && item.wuuOrderItemDetails}]" v-for="(item,index1) in itemList" :key="item.id" @click="handleClickItem(item)">

        <div v-if="(item.wuuOrderItemDetails && item.wuuOrderItemDetails.length>0) || !isConfirmWeight" class="package-wrap">
          <h4 class="item-title">
            <span v-show="item.itemSizeName">({{ item.itemSizeName }})</span>
            {{item.itemName}}
          </h4>
          <p class="item-info">
            <span class="money">{{$t('Dict.UnitPrice1')}}{{item.itemPrice}}</span>
            <span class="num">{{`${item.itemcount}${item.skuinfo}`}}</span>
            <span class="total">{{$t('Dict.Subtotal1')}}{{item.lastSubTotal}}</span>
          </p>
        </div>
        <div v-else @click="changeItemNum(item,index1)" class="cursorItem" :class="{active:tabIndex === index1 && currentPkg.id == item.id}">
          <h4 class="item-title">
            <em class="give" v-if="item.isWeighItem && isConfirmWeight">{{ $t('Dict.ConfirmWeigh') }}</em>
            <span v-show="item.itemSizeName">({{ item.itemSizeName }})</span>
            {{item.itemName}}
          </h4>
          <p class="item-info">
            <span class="money">{{$t('Dict.UnitPrice1')}}{{item.itemPrice}}</span>
            <span class="num">{{`${item.itemcount}${item.skuinfo}`}}</span>
            <span class="total">{{$t('Dict.Subtotal1')}}{{item.lastSubTotal}}</span>
          </p>
        </div>
        <p v-if="item.itemMoListMap && item.itemMoListMap.length > 0" class="item-tip">{{$t('Dict.Remarkss')}}{{item.itemMoListMap | itemtip}}</p>
        <p v-for="(pkgItem,index) in item.wuuOrderItemDetails" :key="pkgItem.id" class="item-tip pkg-item" @click="changeItemNum(item,index)" :class="{cursorItem:pkgItem.isWeighItem  && isConfirmWeight,active:tabIndex === index && currentPkg.id == pkgItem.id}">
          <span class="give" v-if="pkgItem.isWeighItem  && isConfirmWeight">称</span>
          <i class="icon icon-dian1 pkg-item-icon"></i>
          <span :class="pkgItem.isWeighItem  && isConfirmWeight? 'pkg-item-name-yuku': 'pkg-item-name'">{{pkgItem.itemName}}</span>
          <span class="pkg-item-count">{{pkgItem.count}}{{pkgItem.unitName}}</span>
          <span class="pkg-item-addPr">{{pkgItem.addPr !== 0 ? `+${pkgItem.addPr}` : ''}}</span>
          <span class="pkg-item-methods" v-if="pkgItem.itemMoListMap != null">{{$t('Dict.Remarkss')}}
            <em v-for="(methodItem, methodIndex) in pkgItem.itemMoListMap"
            :key="methodIndex">{{ methodItem.name + (methodItem.isNeedFee ? `(+${methodItem.vprice})` : '')}}</em></span>
          <span class="pkg-item-total-vprice">{{calcTotalVPrice(pkgItem.itemMoListMap)}}</span>
        </p>
        <span v-if="item.errorMsg" class="danger-badge">{{item.errorMsg}}</span>
      </div>
    </div>
    <div class="operating-area">
      <div class="pos-pager">
        <div class="pos-takeout-pager">
          <span class="page-info">{{
            $t('Dict.PageStyle.Text1', {
              length: itemList.length,
              currentPage,
              totalPage: pageCount,
            })
          }}</span>
          <button href="javascript:;" class="prev" @click="upPage">
            <i class="el-icon-arrow-up"></i>
          </button>
          <button href="javasctipt:;" class="next" @click="downPage">
            <i class="el-icon-arrow-down"></i>
          </button>
        </div>
      </div>
    </div>
    <ReserveModal ref="reserveModal"></ReserveModal>
    <ReservePkgModal ref="reservePkgModal"></ReservePkgModal>
    <ChangeNum ref="ChangeNum"></ChangeNum>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import { isEmpty, extend } from 'lodash';
import PageMixin from '@/common/util/PaginationScrollMixin';
import numberformat from '@/common/js/numberformat';
import * as MathUtil from '@/common/js/math';
import ajax from '@/common/js/ajax';

// 改量
const ChangeNum = (resolve) => {
  import('./ChangeNum').then((module) => {
    resolve(module);
  });
};
// 快餐-全部下单-执行状态
const ReserveModal = (resolve) => {
  import('./ReserveModal').then((module) => {
    resolve(module);
  });
};
// 预点单套餐异常明细弹窗
const ReservePkgModal = (resolve) => {
  import('./ReservePkgModal').then((module) => {
    resolve(module);
  });
};

export default {
  mixins: [PageMixin],
  data() {
    return {
      allList: [],
      itemList: [],
      prePageSize: 4,
      loading: false,
      curMode: true, // 当前营业模式, true-中餐, false-快餐
      funBtnSpan: 8, // 不同营业模式,左上角,预订单功能按钮的宽度(栅格份数)
      executeState: false,
      executeTimer: false,
      tabIndex: -1,
      isPkg: false, // 是否为套餐
      currentPkg: null,
    };
  },
  props: {
    order: {
      default() {
        return {};
      },
    },
  },
  components: {
    ReserveModal,
    ReservePkgModal,
    ChangeNum,
  },
  computed: {
    /**
     * 中餐快餐业务逻辑判断参数说明:
     * 中餐-快餐判断依据:Vux中配置数据posBaseInfo.controlMode 中餐-1, 录单-2, 快餐-3
     * 中餐可执行-单独下单,修改,取消和打印; 快餐可执行-全部下单,取消,并显示全部下单进度;
     * 快餐默认设置数据 posFastFood, 快餐部分接口不返回客位ID, 故客位id修改为逻辑判断 posFastFood.buffetPointId
     */
    ...mapGetters(['posBaseInfo', 'posFastFood', 'posItems', 'posAreas', 'posSettings']),
    // 当前业务模式客位id 判断处理
    curModePointId() {
      return this.posBaseInfo.controlMode == 3
        ? this.posFastFood.buffetPointId
        : this.order.pointId;
    },
    // 是否可以下单
    canReserveOrder() {
      if (this.allList.length != 0) {
        const state = this.allList.filter(item => item.isdownsuccess == 2 || item.isdownsuccess == 6);
        if (state.length != 0) {
          return true;
        }
      }
      if (
        (this.order.isdownsuccess === 2 || this.order.isdownsuccess === 6)
        && !this.order.errorMsg
      ) { return true; }
      return false;
    },
    // 快餐模式-取消预点按钮 动态长度
    dynamicCancelBtnWidth() {
      if (this.curMode) {
        return this.funBtnSpan;
      }
      if (this.executeState) {
        return 12;
      }
      return 24;
    },
    // 快餐模式-进度状态按钮(容器) 动态长度
    dynamicProgressBtnWidth() {
      if (this.curMode) {
        return this.funBtnSpan;
      }
      if (this.executeState) {
        return 12;
      }
      return 0;
    },
    // 是否可以修改数量
    // 支付状态为2  订单状态2 或者 6  不是异常订单  鱼酷增值
    isConfirmWeight() {
      return this.order.paystate === 0 && (this.order.isdownsuccess === 2 || this.order.isdownsuccess == 6) && !this.order.errorMsg && this.posSettings.isFishCoolEnable;
    },
  },
  methods: {
    // 计算套餐做法加价合计
    calcTotalVPrice(itemMoListMap) {
      if (!itemMoListMap || !itemMoListMap.length) return '';
      const total = itemMoListMap.reduce(
        (p, c) => MathUtil.add(p, c.vprice),
        0,
      );
      return total === 0 ? '' : `+ ${total}`;
    },
    /**
     * @description: 预点账单套餐明细品项异常的方法
     * @Author: wy
     * @param {Object} item 当前预点账单点击的品项
     * @return: void
     * @Date: 2019-04-29 11:25:05
     */
    handleClickItem(item) {
      if (item.errorMsg && item.wuuOrderItemDetails) {
        this.$refs.reservePkgModal.open(item.pkgItemDetailErrMsg);
      }
    },
    // 进度按钮 重新呼出下单进度dialog
    showProgressDialog() {
      this.$refs.reserveModal.open();
    },
    //
    getInfo() {
      this.loading = true;
      ajax('canyin.pos.reserveorderbill.reserveorderitemlist', {
        params: {
          orderId: this.order.id,
        },
      }).then((data) => {
        this.loading = false;
        this.itemList = data;
        this.$nextTick(() => {
          this.setPageInfo(this.$refs.listwarp);
        });
      });
    },
    // 单条总价
    itemTotalPrice(price, count, addPr) {
      if (addPr) {
        return MathUtil.add(MathUtil.multi(price, count), addPr);
      }
      return MathUtil.multi(price, count);
    },
    // 修改预点单
    editReserve() {
      // 临时变量
      const idTmpArr = [];
      let objTmpArr = [];

      // 如果存在提示音  需要做下处理
      // 判断是否存预点单 存在就执行否则直接return
      if (!isEmpty(this.order)) {
        if (
          Number(this.order.isdownsuccess) !== 2
          && Number(this.order.isdownsuccess) !== 6
        ) {
          this.$message.warning(this.$t('Biz.Reserve.ReserveMsg001'));
          return;
        }
        /* 增加功能
         * 20190319 杨杰
         * 线上品项与线下品项对比校验, 如存不匹配情况, 阻止"修改预点单"并提示用户
         */
        this.itemList.forEach((_) => {
          idTmpArr.indexOf(_.itemId) === -1 && idTmpArr.push(_.itemId);
        });
        objTmpArr = this.posItems.filter(_ => idTmpArr.indexOf(_.id) != -1);
        console.log(objTmpArr, this.itemList, idTmpArr);
        if (idTmpArr.length != objTmpArr.length) {
          this.$message.error(this.$t('Biz.Reserve.ReserveMsg002'));
          return;
        }

        // 查看下当前的客位状态
        this.checkePointState();
        // 【原因】嵌套Biz调用中的客位推送，如预订、预点
        // PointModule.setPointPushLazy(true, 1000);
      } else {

      }
    },
    /**
     * 查看当前客位,如果不存在、非空闲 则弹出选择客位的窗口:
     * 修改预点是在未下单的状态下，进行修改和下单，主要有估清的品项无法下单的，和需要修改已点品项的情况下。
     */
    checkePointState() {
      ajax('canyin.pos.reserveorderbill.pointstate', {
        contentType: 'URLEncoded',
        data: {
          pointId: this.curModePointId,
        },
      }).then((res) => {
        // 客位空闲, 执行后台开台, 再进入加单界面
        res == '1' && this.freePointAddBill(); // 客位空闲
        // 客位占用  后者是预付 直接进入加单界面
        res == '6' && this.gotoOrderChangeReserve();
        res == '2' && this.gotoOrderChangeReserve();
        res == '3' && this.$message.error(this.$t('Biz.Reserve.ReserveMsg003'));
        res == '5' && this.$message.error(this.$t('Biz.Reserve.ReserveMsg004'));
      });
    },
    /**
     * 空闲客位 执行 开台
     */
    freePointAddBill() {
      const params = {
        pointId: this.curModePointId,
        orderId: this.order.id,
        people: this.order.people,
      };
      // 执行预点修改开台
      ajax('canyin.pos.reserveorderbill.doreserveorderaddbill', {
        contentType: 'URIEncodedToken',
        needToken: true,
        data: params,
      }).then((res) => {
        if (!isEmpty(res)) {
          this.$message({
            message: this.$t('Biz.Reserve.ReserveMsg005'),
            type: 'success',
          });
          // 如果开台有默认添加的品项，对其进行打印留台单
          if (res.addBillBizPrintLeaveTableParamsList) {
            this.printLeaveTable(
              res.addBillBizPrintLeaveTableParamsList,
              data.data.posId,
            );
          }
          // ordernote-蒸蛋备注内容
          this.gotoOrderChangeReserve();
        } else {
          this.$message({
            message: this.$t('Biz.Reserve.ReserveMsg006'),
            type: 'warning',
          });
        }
      });
    },
    /**
     * 进入加单界面进行 修改:
     */
    gotoOrderChangeReserve() {
      // 进行数据整理
      const changeOrderItems = [];
      this.itemList.forEach((orderItem) => {
        const orderMenu = {};
        let pkgListTotalMakeFee = 0;
        // 对套餐的品项进行处理
        if (
          orderItem.wuuOrderItemDetails
          && orderItem.wuuOrderItemDetails.length
        ) {
          const pkgList = [];
          orderItem.wuuOrderItemDetails.forEach((item) => {
            if (item.addPr) {
              pkgListTotalMakeFee = MathUtil.add(
                pkgListTotalMakeFee,
                item.addPr,
              );
            }
            const pkgItem = {
              code: item.itemCode,
              id: item.itemId,
              sizeId: item.itemSizeId,
              name: item.itemName,
              num: item.count,
              unitName: item.unitName,
              raisePrice: item.addPr,
              methodList:
                item.itemMoListMap && item.itemMoListMap.length
                  ? this.reasseMblyMehod(item.itemMoListMap)
                  : [],
              // itemId:
            };
            pkgList.push(pkgItem);
          });
          orderMenu.pkgList = pkgList;
          // 预点单线上的套餐都是联动的
          orderMenu.isNotFollowAmount = false;
          orderMenu.pkgListTotalMakeFee = pkgListTotalMakeFee;
        }
        orderMenu.id = orderItem.itemId; // 品项id
        orderMenu.sizeId = orderItem.itemSizeId; // 规格id
        orderMenu.sizeName = orderItem.itemSizeName; // 规格名称
        orderMenu.name = orderItem.itemName;
        orderMenu.num = orderItem.itemcount;
        orderMenu.price = orderItem.price;
        // orderMenu.origPrice = orderItem["price"]
        // orderMenu.salePrice = orderItem["price"]
        orderMenu.priceType = 1;
        orderMenu.deFaultItemSizeId = orderItem.deFaultItemSizeId; // 是不是多规格
        orderMenu.orderId = orderItem.orderId;
        orderMenu.methodList = orderItem.itemMoListMap && orderItem.itemMoListMap.length
          ? this.reasseMblyMehod(orderItem.itemMoListMap)
          : []; // 存在话重新组装下
        changeOrderItems.push(orderMenu);
      });
      // 目前的思路是
      this.$router.push({
        name: 'order',
        params: {
          pointId: this.curModePointId,
          orderId: this.order.id,
          ordernote: this.order.note,
          orderingData: changeOrderItems,
          reserveErrorFn: () => {
            this.$message.error(this.$t('Biz.Reserve.ReserveMsg007'));
          },
        },
      });
    },
    ...mapActions(['getReserveNotifyCount']),
    // 做法的整理
    reasseMblyMehod(itemMoListMap) {
      const methodList = [];
      itemMoListMap.forEach((method) => {
        // 由于线上做法是没数量的要增加个数量，默认为1
        const newMethod = method.isNeedFee
          ? {
            id: method.id,
            name: method.name,
            vprice: method.vprice,
            feeChanged: false,
            isRelaCount: true, // 目前写死的线上支持只支持联动的做法
            price: method.vprice,
            fee: method.vprice,
            qty: 1,
          }
          : {
            id: method.id,
            name: method.name,
            vprice: method.vprice,
            feeChanged: false,
            isRelaCount: false,
            qty: 1,
          };
        methodList.push({ ...newMethod, isNeedFee: method.isNeedFee });
      });
      return methodList;
    },
    // 下单-调用相应接口
    submitReserve() {
      // 判断, 执行不同营业模式下业务逻辑和接口
      this.posBaseInfo.controlMode == 3
        ? this.fastFoodExecute() // 中餐时执行
        : this.normalExecute(); // 快餐时执行
    },
    // 中餐下单-常规下单
    normalExecute() {
      if (
        Number(this.order.isdownsuccess) !== 2
        && Number(this.order.isdownsuccess) !== 6
      ) {
        this.$message.warning(this.$t('Biz.Reserve.ReserveMsg001'));
        return;
      }
      ajax('canyin.pos.reserveorderbill.doreserveorder', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          pointId: this.curModePointId,
          orderId: this.order.id,
          people: this.order.people,
        },
      }).then((data) => {
        this.getReserveNotifyCount();
        if (data.success) {
          this.$message.success(this.$t('Biz.Reserve.ReserveMsg009'));
          this.$emit('update-list');
          // 如果开台有默认添加的品项，对其进行打印留台单
          if (data.data.addBillBizPrintLeaveTableParamsList) {
            this.printLeaveTable(
              data.data.addBillBizPrintLeaveTableParamsList,
              data.data.posId,
            );
          }
          // 打印留台单
          if (data.data.bizPrintLeaveTableParamsList) {
            this.printLeaveTable(
              data.data.bizPrintLeaveTableParamsList,
              data.data.posId,
            );
          }
          // 打印加单标签
          this.printAddBill(data.data.bsId, data.data.posId);
          // 结账单走推动, 暂不打印
        } else {
          this.$message.warning(data.msg);
        }
      });
    },
    // 快餐下单- 自动下单
    fastFoodExecute() {
      // 开启下单标志显示
      this.executeState = true;
      // 打开下单进度内容显示弹框
      this.$refs.reserveModal.open();
      ajax('canyin.pos.reserveorderbill.doreserveorderauto', {
        params: {
          isAuto: false,
        },
      }).then((data) => {
        this.getReserveNotifyCount();
        if (!data.errorMsg) {
          this.$emit('update-list');
          // 循环传入所有账单的bsId, 进行打印
          data.list.filter((item) => {
            // 快餐模式-打印结账单
            this.printSettle(item.bsId);
            // 打印加单标签
            this.printAddBill(item.bsId, item.posId);
            // 快餐模式-留台单不用打印
            this.printLeaveTable(item.bizPrintLeaveTableParamsList, item.posId);
          });
          data.successCount > 0
            && this.$message.success(this.$t('Biz.Reserve.ReserveMsg009'));
          // 中断执行状态接口调用
          this.executeTimer = true;
          // 关闭状态指示标志
          this.executeState = false;
          // 关闭 弹窗
          setTimeout((_) => {
            this.$refs.reserveModal.onClose();
          }, 500);
        } else {
          this.$message.warning(data);
        }
      });
      // 执行 循环调用接口, 直到'doreserveorderauto'接口成功返回数据, 关闭弹窗
      this.fastFoodExecuteState();
    },
    // 快餐-自动下单-下单进度执行反馈: 循环调用接口, 实时返回数据, 显示执行进度
    fastFoodExecuteState() {
      if (this.executeTimer) {
        this.executeTimer = false;
        return false;
      }
      ajax('canyin.pos.reserveorderbill.getisalldoreserveordercount', {
        params: {},
      }).then((data) => {
        this.$refs.reserveModal.buffetCount = data.buffetCount;
        this.$refs.reserveModal.successCount = data.successCount;
        this.$refs.reserveModal.errorCount = data.errorCount;
      });
      setTimeout(() => {
        this.fastFoodExecuteState();
      }, 800);
    },
    /**
     * @函数说明 打印加单标签
     * @创建 马 2018/10/29
     */
    printAddBill(bsId, posId) {
      ajax('canyin.pos.printaddbilltag.getaddbillprintdata', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: { bsId },
      }).then((data) => {
        if (data.success) {
          if (!data.printType) {
            // http://192.168.4.84:88/zentao/bug-view-74109.html
            // 后台没有设置加单标签打印，此处不应该提示这句
            // this.$message.error('加单标签打印设置异常, 请设置后刷新重试!')
            return false;
          }
          if (data.printType == 'PRINT_PARALLEL' && this.$devices.Printer) {
            // 并口
            // 循环 返回数据, 执行多次加单标签的打印
            for (const aData in data.printD.data) {
              const newPrintD = {};
              extend(newPrintD, data.printD.data[aData]);
              newPrintD.exporttype = data.printD.exporttype;
              newPrintD.fileid = data.printD.fileid;
              newPrintD.printcnt = data.printD.printcnt;
              newPrintD.printer = data.printD.printer;
              newPrintD.style_data = data.printD.style_data;
              // 执行打印
              this.$devices.Printer.print(newPrintD);
            }
          } else if (data.printType == 'PRINT_SERIAL') {
            // 串口
            // do nothing
          }
        } else {
          this.$message.error(`异常${data.msg}`);
        }
      });
    },
    /**
     * @函数说明 打印结账单
     * @创建 马 2018/10/29
     */
    printSettle(bsId) {
      ajax('canyin.pos.printsettle.getsettleprintdata', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          bsId,
          styleType: '1',
          // make: true,
          // authCode : code ? code : null
        },
      })
        .then((res) => {
          if (!res.data.printType) {
            this.$message.error(this.$t('Biz.Reserve.ReserveMsg010'));
            return false;
          }
          // printType PRINT_PARALLEL 打印类型是并口的执行 进行打印业务
          // printType 1 结账单
          if (res.data.printType == 'PRINT_PARALLEL' && this.$devices.Printer) {
            res.data.printD && this.$devices.Printer.print(res.data.printD);
          }
        })
        .catch((error) => {
          this.$message.error(this.$t('Dict.abnormal') + error);
        });
    },
    /**
     * @函数说明 打印留台单
     * @创建 马 2018/6/11
     */
    printLeaveTable(bizPrintLeaveTableParamsList, posId) {
      // 如果bizPrintLeaveTableParamsList为空，则不执行打印留台单(留台单打印未设置)
      if (isEmpty(bizPrintLeaveTableParamsList)) {
        return false;
      }
      bizPrintLeaveTableParamsList.map((list) => {
        let params = {
          bsId: list.bsId,
          ssId: list.ssId,
          pointId: list.pointId,
          styleType: 7,
        };
        if (posId) {
          params = Object.assign({}, params, { posId });
        }
        ajax('canyin.pos.printleavetable.getleavetablestyledata', {
          loading: false,
          contentType: 'paramsEncoded',
          needToken: true,
          data: params,
        }).then((res) => {
          if (!res.printType) {
            // this.$message.error('留台单打印设置异常, 请设置后刷新重试!')
            return false;
          }
          if (
            res.printType === 'PRINT_PARALLEL'
            && res.printD
            && this.$devices.Printer
          ) {
            this.$devices.Printer.print(res.printD);
          }
        }).catch((error) => {
          this.$message.error(this.$t('Dict.abnormal') + error);
        });
      });
    },
    // 取消预点
    cancelReserve() {
      if (
        Number(this.order.isdownsuccess) !== 2
        && Number(this.order.isdownsuccess) !== 6
      ) {
        this.$message.warning(this.$t('Biz.Reserve.ReserveMsg001'));
        return;
      }
      this.$confirm(
        this.$t('Biz.Reserve.ReserveMsg012'),
        this.$t('Dict.Tips'),
        {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        },
      ).then(() => {
        ajax('canyin.pos.reserveorderbill.cancelorder', {
          params: {
            orderId: this.order.id,
          },
        }).then((data) => {
          if (data.success) {
            this.$message.success(this.$t('Biz.Reserve.ReserveMsg013'));
            this.$emit('update-list');
          }
          this.getReserveNotifyCount();
        });
      });
    },
    // 打印预点
    printReserve() {
      ajax('canyin.pos.reserveorderbill.printorder', {
        params: {
          orderId: this.order.id,
        },
      }).then((data) => {
        if (data.success) {
          const printData = data;
          if (
            printData.printType == 'PRINT_PARALLEL'
            && printData.printD
            && this.$devices.Printer
          ) {
            this.$devices.Printer.print(printData.printD);
          }
        } else {
          this.$message.warning(data.msg);
        }
      });
    },
    // 修改数量按钮
    changeItemNum(list, index) {
      if (!this.isConfirmWeight) {
        return;
      }
      let listItem = '';
      if (list.wuuOrderItemDetails) {
        if (!list.wuuOrderItemDetails[index].isWeighItem) {
          return;
        }
        this.isPkg = true;
        listItem = JSON.parse(JSON.stringify(list.wuuOrderItemDetails[index]));
        this.currentPkg = listItem;
      } else {
        if (!list.isWeighItem) {
          return;
        }
        this.isPkg = false;
        list.count = list.itemcount;
        listItem = JSON.parse(JSON.stringify(list));
        this.currentPkg = listItem;
      }
      this.tabIndex = index;// 记录当前点击的item下标
      this.oldCount = listItem.count;
      this.$refs.ChangeNum.open({
        listItem, // 当前套餐中item
      }, {
        submit: (num) => {
          this.changeNum(num);
        },
      });
    },
    // 修改数量请求
    changeNum(item) {
      const requestParams = {};
      requestParams.orderId = item.orderId;
      const itemData = new Array();
      itemData.push({ id: item.id, quantity: item.count });
      if (this.isPkg) {
        requestParams.pkgData = itemData;
      } else {
        requestParams.itemData = itemData;
      }
      ajax('canyin.pos.reserveorderbill.modifyreserveorderitem', {
        contentType: 'URLEncoded',
        data: { data: JSON.stringify(requestParams) },
      }).then((res) => {
        // 刷新列表
        this.getInfo();
        // 还原点击的item下标
        this.tabIndex = -1;
        // 关闭窗口
        this.$refs.ChangeNum.close();
      });
    },
  },
  watch: {
    'order.id': function () {
      this.getInfo();
    },
    // 监听 Vux中pos设置数据-营业模式, 设置中餐-快餐下, 不同的预点下单相关功能和显示
    posBaseInfo: {
      handler(val) {
        if (this.posBaseInfo.controlMode == 3) {
          this.curMode = false;
          this.funBtnSpan = 12;
        } else {
          this.curMode = true;
          this.funBtnSpan = 8;
        }
      },
      deep: true,
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
    // 制作方法
    // 修改样式，使预点的做法样式与客单做法样式相同 bug-588,594 by L.R
    itemtip(list) {
      if (!list) return '';
      // let money = 0;
      return list.map(({ name, vprice, isNeedFee }) => (
        // money += vprice;
        name + (isNeedFee ? `(+￥${vprice})` : '')
      )).join(' | ');
      // if (money <= 0) return methodStr;
      // return `${methodStr}  ${money}`;
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pointer {
  cursor: pointer;
}
.reserve-info-warp {
  background-color: #ebf3f4;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.table-info {
  padding: 4px 12px 16px;
  min-height: 80px;
  .order-no-content {
    font-size: 16px;
    color: #333;
    font-weight: bold;
    line-height: 2.25;
    white-space: nowrap;
    > span {
      font-size: 14px;
    }
  }
  .info-detail {
    color: #666;
    line-height: 1.7;
    .seat {
      padding-right: 40px;
    }
  }
}
.item-list {
  background-color: @white;
  flex-grow: 1;
  overflow: auto;
  .item {
    padding: 8px 12px;
    border-bottom: 1px solid #cfd6d9;
    counter-increment: itemindex;
    position: relative;
  }
  .package-wrap {
    box-shadow: 1px 0 1px 1px #667788;
    border-radius: 2px;
  }
  .item-title {
    font-weight: bold;
    line-height: 1.5;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &::before {
      content: counter(itemindex);
      background: #b0bfc7;
      border-radius: 10px;
      color: @white;
      width: 1.3em;
      line-height: 1.3em;
      text-align: center;
      display: inline-block;
      margin-right: 4px;
    }
  }
  .give{
    background: #f24f64;
    display: inline-block;
    width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    font-size: 12px;
    color: #fff;
    font-style: normal;
    margin-left: 2px;
    margin-right: 2px;
  }
  .item-info {
    color: #666;
    font-size: 12px;
    line-height: 1.5;
    > * {
      display: inline-block;
    }
    .money {
      width: 52%;
      padding-left: 20px;
    }
    .num {
      width: 20%;
      text-align: right;
    }
    .total {
      width: 28%;
      text-align: right;
    }
  }
  .item-tip {
    padding-left: 20px;
    color: #333;
    font-size: 12px;
    line-height: 1.5;
  }
  .active{
    background: #cccccc;
  }
  .cursorItem{
    cursor: pointer;
  }
  .pkg-item{
    overflow: hidden;
    padding: 6px 0 6px 20px;
    >span{
      float: left;
    }
    .pkg-item-code {
      text-align: right;
      width: 28%;
      padding-right: 16px;
    }
    .pkg-item-icon {
      width: 5%;
      float: left;
      font-size: 12px;
    }
    .pkg-item-name {
      width: 45%;
    }
    .pkg-item-name-yuku{
      width: 36%;
    }
    .pkg-item-addPr{
      width: 30%;
      text-align: right;
    }
    .pkg-item-count {
      text-align: right;
      width: 20%;
    }
    .pkg-item-total-vprice {
      width: 25%;
      text-align: right;
    }
    .pkg-item-methods {
      display: block;
      width: 75%;
      clear: both;
      padding-left: 4px;
      // overflow: hidden;
      // white-space: nowrap;
      // text-overflow: ellipsis;
      > em {
        margin-right: 4px;
        font-style: normal;
        &:nth-child(1) {
          margin-left: 6px;
        }
        &:after {
          content: "  ";
          height: 12px;
          display: inline-block;
          padding-left: 3px;
          vertical-align: middle;
          border-right: 1px solid #333;
        }
        &:last-child::after {
          padding: 0;
          border: none;
        }
      }
    }
  }
  .danger-badge {
    white-space: nowrap;
    transform: rotate(-10deg);
    position: absolute;
    padding: 2px 4px;
    color: #f00;
    border: 2px solid #f00;
    top: 50%;
    left: 50%;
    margin-top: -10px;
    margin-left: -40px;
  }
}

// 箭头按钮
.pos-takeout-pager {
  margin-top: 4px;
  float: right;
  color: #999;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
    background-color: rgba(255, 255, 255, 0.16);

    > i {
      color: #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}

.operating-area {
  width: 100%;
  background-color: @white;
  .pos-pager {
    overflow: hidden;
    border-bottom: 1px solid #b5b5b5;
    padding: 8px 12px;
  }
}
.btns-warp {
  width: 100%;
  background-color: @white;
  padding: 12px;
  min-height: 102px;
  button {
    width: 100%;
  }
  .order-btn {
    margin-bottom: 10px;
  }
}
.allDoRserveLogo {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.34;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  // -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  // -webkit-user-select: none;
  // -moz-user-select: none;
  // -ms-user-select: none;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;

  > p {
    > i {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      vertical-align: middle;
      background-color: #f00;
    }
    > span {
      vertical-align: middle;
    }
  }
}
// .dynamicBtnWrap div{
//   transition: all .1s ease-in-out ;
// }
  .lang-enUS{
    .table-info {
      .order-no-content {
        font-size: 14px;
        > span {
          font-size: 12px;
        }
      }
    }
  }
</style>
