<template>
  <!-- 国际化：打折预结 -->
  <Dialog
    name="PosDialog.DiscountedKnot"
    :title="$t('Dict.Btn.DiscountSettlement')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    :hotkeys="hotKeySet"
    width="685px"
    height="430px"
  >
    <template slot="other-button">
      <!-- 国际化：撤销埋单 -->
      <button
        v-if="+pointState === 3 && hasUndoPayBillAthMsg"
        type="button"
        class="btn btn-default"
        @click="BackCheckBill">
        {{$t('Dict.Btn.UndoPayBill')}}(PgDn)
      </button>
      <!-- 国际化：埋单 -->
      <button
        v-if="+pointState !== 3 && hasCheckBillAuthMsg"
        type="button"
        class="btn btn-default"
        @click="checkBill">
        {{$t('Dict.Btn.PayBill')}}(PgDn)
      </button>
    </template>
    <div class="discountedKnot">
      <div class="discountedKnot-up">
        <div class="receivable">
          <div class="receivable-title">
            <!-- 国际化：应收 -->
            <div>{{$t('Dict.Receivable')}}</div>
            <div>{{baseBs.orig_total}}</div>
          </div>
          <!-- 国际化：品项费：，服务费：，最低消费： -->
          <ul class="receivable-ul">
            <li>
              <span>{{$t('Biz.Order.ItemPrice')}}</span>
              <span>{{itemsPrice}}</span>
            </li>
            <li>
              <span>{{$t('Biz.Order.ServicePrice')}}</span>
              <span>{{servicefee}}</span>
            </li>
            <li>
              <span>{{$t('Biz.Order.LeastBuy')}}</span>
              <span>{{leastbuy}}</span>
            </li>
          </ul>
        </div>
        <div class="discount">
          <div class="discount-title">
            <!-- 国际化：优惠 -->
            <div>{{$t('Dict.Offer')}}</div>
            <div>{{baseBs.disc_total}}</div>
          </div>
          <ul class="discount-ul">
            <li
              v-for="( item, index ) in select"
              v-if="index >= discountStrat && index <= discountEnd"
              :key="index" class="cursorPointer"
              @click="cancelSelectedActive(item)">
              <span>{{item.discTypeName}}</span>
              <span>{{item.discMoney}}</span>
            </li>
            <li class="nextPager cursorPointer"
              v-if="select.length > 6"
              @click="selectedNextPager" >
              <!-- 国际化：下一页 > -->
              <div>{{$t('Dict.NextPage')}}</div>
            </li>
          </ul>
        </div>
        <div class="netReceipts">
          <div class="netReceipts-title">
            <!-- 国际化：实收 -->
            <div>{{$t('Dict.NetReceipts')}}</div>
            <div>{{baseBs.last_total}}</div>
          </div>
          <ul>
            <li></li>
          </ul>
        </div>
      </div>
      <div class="discountedKnot-active">
        <div class="active-title">
          <!-- 国际化：活动方案 -->
          <div class="name">{{$t('Dict.ProgrammeOfActivities')}}</div>
          <ul class="active-title-ul">
            <li
              v-for=" (n,index) in activePagerCount"
              v-if=" index<3 && activePagerCount > 1 "
              :key="index"
              :class="{ active:changeActive == n}"
              @click="activePagerCountFun(n)"
              :ref="'pagerCount'+n"
              class="cursorPointer">
              {{n}}
            </li>
            <li
              v-if="activePagerCount > 3"
              class="noCursorPointer lastList"
              :class="{ active:changeActive == 4}">
              ...
            </li>
          </ul>
        </div>
        <ul class="active-ul">
          <li
            v-for="( item, index) in activeSheme"
            v-if="index >= activeStrat &&index <= activeEnd"
            :key="index"
            class="cursorPointer"
            @click="openDialogOrNextPageDiscType(item)" >
            <div class="midpoint">{{item.discTypeName}}</div>
          </li>
          <li
            @click="activeNextPager"
            class="activeNextPager cursorPointer"
            v-if="activeSheme.length>12">
              <!-- 国际化：下一页 > -->
              <div class="midpoint">{{$t('Dict.NextPage')}}</div>
          </li>
        </ul>
      </div>
    </div>
    <AllSinglePreferential
      ref="AllSinglePreferential"
      :pointId="pointId"
      :bsId="baseBs.id">
    </AllSinglePreferential>
    <CategoryPreference
      :pointId="pointId"
      :bsId="baseBs.id"
      ref="CategoryPreference">
    </CategoryPreference>
    <Discount
      :pointId="pointId"
      :bsId="baseBs.id"
      ref="Discount">
    </Discount>
    <FullSubtraction  :pointId="pointId" :bsId="baseBs.id" ref="FullSubtraction"></FullSubtraction>
    <ProportionPreferential
      :pointId="pointId"
      :bsId="baseBs.id"
      ref="ProportionPreferential">
    </ProportionPreferential>
    <Ration ref="Ration"  :pointId="pointId" :bsId="baseBs.id"></Ration>
    <SingleProductDiscount
      :pointId="pointId"
      :bsId="baseBs.id"
      ref="SingleProductDiscount">
    </SingleProductDiscount>
    <RationDiscount
      ref="rationDiscount"
      :pointId="pointId"
      :bsId="baseBs.id"></RationDiscount>
  </Dialog>
</template>

<script>

import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

const AllSinglePreferential = (resolve) => {
  import('./Pay/ActiveChildDialog/AllSinglePreferential').then((module) => {
    resolve(module);
  });
};
// 类别优惠
const CategoryPreference = (resolve) => {
  import('./Pay/ActiveChildDialog/CategoryPreference').then((module) => {
    resolve(module);
  });
};
// 折扣优惠
const Discount = (resolve) => {
  import('./Pay/ActiveChildDialog/Discount').then((module) => {
    resolve(module);
  });
};
// 满减优惠
const FullSubtraction = (resolve) => {
  import('./Pay/ActiveChildDialog/FullSubtraction').then((module) => {
    resolve(module);
  });
};
// 比例优惠
const ProportionPreferential = (resolve) => {
  import('./Pay/ActiveChildDialog/ProportionPreferential').then((module) => {
    resolve(module);
  });
};
// 手工定额
const Ration = (resolve) => {
  import('./Pay/ActiveChildDialog/Ration').then((module) => {
    resolve(module);
  });
};
// 单品优惠
const SingleProductDiscount = (resolve) => {
  import('./Pay/ActiveChildDialog/SingleProductDiscount').then((module) => {
    resolve(module);
  });
};
// 定额优惠
const RationDiscount = (resolve) => {
  import('./Pay/ActiveChildDialog/RationDiscount').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    Dialog,
    AllSinglePreferential,
    CategoryPreference,
    Discount,
    FullSubtraction,
    ProportionPreferential,
    Ration,
    SingleProductDiscount,
    RationDiscount,
  },
  mixins: [DialogMixin],
  data() {
    return {
      baseBs: {},
      pointId: '',
      discountStrat: 0, // 已选优惠开始标签
      discountEnd: 5, // 已选优惠结束标签
      activeStrat: 0, // 活动优惠开始标签
      activeEnd: 11, // 活动优惠结束标签
      activePagerCount: 1, // 活动优惠页数
      activeSheme: [], // 活动优惠列表
      select: [], // 已选活动列表
      changeActive: 1, // 原页签按钮颜色变换开关  默认第一页
      servicefee: 0, // 服务费
      leastbuy: 0, // 最低消费
      pointState: 0, // 是否为埋单，3：已埋单
      itemsPrice: 0, // 品项费用
      discTypeConst: {
        4: '全单优惠',
        5: '类别优惠',
        2: '折扣方案优惠',
        '-3': '满减优惠',
        1: '比例优惠',
        '-1': '手工定额',
        3: '单品优惠',
      },
      discTypeDialog: {
        4: 'AllSinglePreferential',
        5: 'CategoryPreference',
        2: 'Discount',
        '-3': 'FullSubtraction',
        1: 'ProportionPreferential',
        '-1': 'Ration',
        3: 'SingleProductDiscount',
      },
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 1, // 是否是团队账单
      hasCheckBillAuthMsg: true, // 埋单权限
      hasUndoPayBillAthMsg: true, // 取消埋单权限
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo']), // posBaseInfo.controlMode
    hotKeySet() {
      return {
        PgDn: () => {
          if (+this.pointState === 3) {
            this.BackCheckBill();
          } else {
            this.checkBill();
          }
        },
      };
    },
  },
  methods: {
    onOpen() {
      // 获取优惠活动初始化数据
      this.PreferentialActivities();
      // 获取账单金额信息以及已选优惠
      this.InitializationData();
      this.pointId = this.resData.pointId;
      this.hasCheckBillAuthMsg = this.resData.hasCheckBillAuthMsg;
      this.hasUndoPayBillAthMsg = this.resData.hasUndoPayBillAthMsg;
    },
    onClose() { // 关闭前初始化
      this.discountStrat = 0;
      this.discountEnd = 5;
      this.activeStrat = 0;
      this.activeEnd = 11;
      this.activePagerCount = 1;
    },
    selectedNextPager() { // 已选优惠的下一页
      if (+this.discountEnd === this.select.length - 1) {
        this.discountStrat = 0;
        this.discountEnd = 4;
        return;
      }
      this.discountStrat += 5;
      this.discountEnd += 5;
      if (this.discountEnd > this.select.length) {
        this.discountEnd = this.select.length - 1;
      }
    },
    activeNextPager() { // 活动优惠的下一页
      const len = this.activeSheme.length;
      if (+this.activeEnd === len - 1) {
        this.activeStrat = 0;
        this.activeEnd = 10;
        this.changeActive = 1;
        return;
      }
      this.activeStrat += 11;
      this.activeEnd += 11;
      if (this.activeEnd > len) {
        this.activeEnd = len - 1;
      }
      const n = Math.ceil((this.activeStrat + 1) / 11);
      this.changeActive = n > 3 ? 4 : n;
    },
    activePagerCountFun(n) { // 圆形按钮点击事件
      this.changeActive = n;
      this.activeStrat = n * 11 - 11;
      this.activeEnd = n * 11 - 1;
    },
    PreferentialActivities() {
      ajax('canyin.pos.settlement.getDiscplanAndPayway', {
        params: {
          pointId: this.resData.pointId,
          isDisplayDiscountPlan: 1,
          isDisplayPayWay: 0,
        },
      }).then((res) => {
        const data = res.data.discTypeList;
        const discTypeListTemp = [];
        // 固定打折类型
        const discTypeListData = data.discTypeList;
        if (discTypeListData != null) {
          discTypeListData.forEach((item) => {
            discTypeListTemp.push(item);
          });
        }
        // 打折方案数据
        const discountPlanListData = data.discountPlanList;
        if (discountPlanListData != null) {
          discountPlanListData.forEach((item) => {
            discTypeListTemp.push(item);
          });
        }
        // 满减数据
        const fulloffListData = data.fulloffList;
        if (fulloffListData != null) {
          fulloffListData.forEach((item) => {
            discTypeListTemp.push(item);
          });
        }

        this.activeSheme = discTypeListTemp;

        if (this.select.length > 6) {
          this.discountEnd = 4;
        }
        if (this.activeSheme.length > 12) {
          this.activeEnd = 10;
        }
        if (this.activeSheme.length > 12) {
          const len = this.activeSheme.length;
          const counts = Math.ceil(len / 11);
          this.activePagerCount = counts;
        }
      });
    },
    InitializationData() {
      ajax('canyin.pos.settlement.settle2', {
        params: {
          pointId: this.resData.pointId,
          isDisplayBill: 0, // 是否显示账单
          isDisplayUsePayWay: 0, // 是否显示已用结算方式
          isExecFullOffPlan: 0, // 是否执行满减方案
        },
      }).then((res) => {
        if (+res.data.code === 1) {
          this.$message.success(res.data.msg);
          const { data } = res.data;
          const { isTeamSettlement } = data.billMap;
          this.select = data.pointDiscList;
          this.baseBs = data.billMap.baseBs;
          this.servicefee = data.billMap.servicefee ? data.billMap.servicefee.last_fee : 0;
          this.leastbuy = data.billMap.leastbuy ? data.billMap.leastbuy.minimum_charge : 0;
          this.pointState = data.billMap.pointState;
          this.itemsPrice = this.baseBs.orig_total - this.servicefee;
          // this.isTeamSettlementFlg =
          // data.billMap.isTeamSettlement ? data.billMap.isTeamSettlement : 0;
          this.isTeamSettlementFlg = isTeamSettlement || 0;
          this.isTeamBill = data.billMap.isTeamSettlement ? data.billMap.isTeamSettlement : 0;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    openDialogOrNextPageDiscType(discType) {
      const discDialog = this.discTypeDialog[discType.discTypeId];
      if (discDialog === undefined || discDialog === null) {
        this.$message.error(this.$t('Biz.Order.UnknowType'));
      } else {
        this[discDialog](discDialog, discType);
      }
    },
    disctypeviewData(test) {
      const timer = new Date().getTime();
      ajax('canyin.pos.settlement.disctypeView', {
        params: {
          bsid: this.baseBs.id,
          pointid: this.resData.pointId,
          loadmodule: 1,
          _t: timer,
        },
      }).then((data) => {
        test(data);
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    // 这是执行满减活动方案 teamBsIds代表的是团队bsId
    disctypeFulloffPlan(fullId, test) {
      ajax('canyin.pos.settlement.disctypeFulloffPlan', {
        params: {
          bsid: this.baseBs.id,
          pointid: this.resData.pointId,
          planid: fullId,
          teamBsIds: this.baseBs.teamBsIds ? this.baseBs.teamBsIds : null,
        },
      }).then((data) => {
        test(data);
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    disctypeDiscountPlan(discountId, test) {
      ajax('canyin.pos.settlement.disctypeDiscountPlan', {
        params: {
          bsid: this.baseBs.id,
          pointid: this.resData.pointId,
          planid: discountId,
        },
      }).then((data) => {
        test(data);
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    // 全单优惠
    AllSinglePreferential(discDialog, discType) {
      const { discTypeId } = discType;
      const vm = this;
      this.disctypeviewData((data) => {
        vm.$refs[discDialog].open({
          data,
          discTypeId,
          isTeamBill: vm.isTeamBill,
          isTeamSettlementFlg: vm.isTeamSettlementFlg,
          baseBs: vm.baseBs,
        }, {
          submit: () => {
            vm.refreshBill();
          },
        });
      });
    },
    // 类别优惠
    CategoryPreference(discDialog, discType) {
      const { discTypeId } = discType;
      const vm = this;
      this.disctypeviewData((data) => {
        vm.$refs[discDialog].open({
          data,
          discTypeId,
          isTeamBill: vm.isTeamBill,
          isTeamSettlementFlg: vm.isTeamSettlementFlg,
          baseBs: vm.baseBs,
        }, {
          submit: () => {
            vm.refreshBill();
          },
        });
      });
    },
    // 单品优惠
    SingleProductDiscount(discDialog, discType) {
      const { discTypeId } = discType;
      const vm = this;
      this.disctypeviewData((data) => {
        vm.$refs[discDialog].open({
          data,
          discTypeId,
          isTeamBill: vm.isTeamBill,
          isTeamSettlementFlg: vm.isTeamSettlementFlg,
          baseBs: vm.baseBs,
        }, {
          submit: () => {
            vm.refreshBill();
          },
        });
      });
    },
    // 折扣优惠
    Discount(discDialog, discType) {
      const vm = this;
      const { discTypeId } = discType;
      const discountId = discType.dicountPlanId;
      if (+discType.discMode === 2) {
      // 定额优惠
        const tmpData = {
          discountId,
          discTypeId,
          isTeamBill: vm.isTeamBill,
          isTeamSettlementFlg: vm.isTeamSettlementFlg,
          baseBs: vm.baseBs,
        };
        this.fixedDiscount(discountId, (data) => {
          tmpData.data = data;
          tmpData.data.rationDiscount = {
            name: discType.discTypeName,
          };
          this.$refs.rationDiscount.open(
            tmpData,
            {
              submit: () => {
                vm.refreshBill();
              },
            },
          );
        });
      } else {
      // 普通打折
        this.disctypeDiscountPlan(discountId, (data) => {
          vm.$refs[discDialog].open({
            data,
            discountId,
            discTypeId,
            isTeamBill: vm.isTeamBill,
            isTeamSettlementFlg: vm.isTeamSettlementFlg,
            baseBs: vm.baseBs,
          }, {
            submit: () => {
              vm.refreshBill();
            },
          });
        });
      }
    },
    // 比例优惠
    ProportionPreferential(discDialog, discType) {
      const { discTypeId } = discType;
      const vm = this;
      this.disctypeviewData((data) => {
        vm.$refs[discDialog].open({
          data,
          discTypeId,
          isTeamBill: vm.isTeamBill,
          isTeamSettlementFlg: vm.isTeamSettlementFlg,
          baseBs: vm.baseBs,
        }, {
          submit: () => {
            vm.refreshBill();
          },
        });
      });
    },
    // 手工定额
    Ration(discDialog) {
      const { maxFixMoney } = this.baseBs;
      this.$refs[discDialog].open({
        maxFixMoney,
        isTeamBill: this.isTeamBill,
        isTeamSettlementFlg: this.isTeamSettlementFlg,
        baseBs: this.baseBs,
      }, {
        submit: () => {
          this.refreshBill();
        },
      });
    },
    // 满减优惠
    FullSubtraction(discDialog, discType) {
      const vm = this;
      const fullId = discType.dicountPlanId;
      this.disctypeFulloffPlan(fullId, (data) => {
        vm.$refs[discDialog].open({
          data,
          fullId,
          isTeamBill: vm.isTeamBill,
          isTeamSettlementFlg: vm.isTeamSettlementFlg,
          baseBs: vm.baseBs,
        }, {
          submit: () => {
            vm.refreshBill();
          },
        });
      });
    },
    // 定额优惠(普通打折类型)-调用接口
    fixedDiscount(discountId, test, type) {
      const params = {
        bsid: this.baseBs.id,
        pointid: this.resData.pointId,
        planid: discountId,
      };
      // 如果传参且为'change',为修改打开接口增加请求参数
      if (type === 'change') {
        params.type = 1;
      }
      ajax('canyin.pos.settlement.disctypeDiscountPlan', {
        params,
      }).then((data) => {
        test(data);
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    // 定额优惠-修改||删除-执行逻辑
    // 参数:rationDiscData.discType-定额方案基础数据,rationDiscData.type-打开类型(修改||删除)
    doRationDiscPrevOperation(rationDiscData) {
      this.rationDiscOptSwitch = false;
      // 删除定额优惠方案
      if (rationDiscData.type === 'delete') {
        this.cancelSelectedActive(rationDiscData.discType);
      } else {
      // 修改定额优惠
        const discountId = rationDiscData.discType.dpId;
        const discTypeId = rationDiscData.discType.discType;
        const tmpData = {
          // 匹配出,已添加的定额优惠的discountId
          discountId,
          // 匹配出,已添加的定额优惠的discTypeId
          discTypeId,
          isTeamBill: this.isTeamBill,
          isTeamSettlementFlg: this.isTeamSettlementFlg,
          baseBs: this.baseBs,
        };
        // 重新调用定额优惠接口方法,获取数据后,打开窗口,传参为修改状态(optType=1)
        this.fixedDiscount(
          // discountId(discountPlanId)-活动方案Id
          discountId,
          // 执行回调
          (data) => {
            tmpData.data = data;
            tmpData.data.optType = 1;
            tmpData.data.rationDiscount = {
              name: rationDiscData.discType.discTypeName,
            };
            this.$refs.rationDiscount.open(
              tmpData,
              {
                submit: () => {
                  this.refreshBill();
                },
              },
            );
          },
          // 打开定额弹窗的方式(新建||修改)
          'change',
        );
      }
    },
    // 定额优惠方案按钮(已添加)-按钮显示位置
    rationDiscBtnPosition(rationDiscData, event) {
      // 暂存-当前点击的(已添加的)定额优惠按钮DOM节点
      this.rationDiscAddedBtnDOM = event.target;

      // 设置位置参数,传向定额优惠按钮弹窗
      this.rationDiscPosition = {
        top: event.target.offsetParent.offsetTop,
        left: event.target.offsetParent.offsetLeft,
      };
    },
    // 定额优惠方案按钮(已添加)-全局监听'click'和'keydown'事件: 执行关闭
    rationDiscBtnEventListener() {
      // 比较事件目标DOM,是否为刚才打开(并保存)弹窗的'定额优惠'按钮(的DOM),点击执行关闭
      window.addEventListener('click', (ev) => {
        if (this.rationDiscOptSwitch
          && this.rationDiscAddedBtnDOM
          && !this.rationDiscAddedBtnDOM.isEqualNode(ev.target)
        ) {
          this.rationDiscOptSwitch = false;
        }
      });
      window.addEventListener('keydown', (ev) => {
        this.rationDiscOptSwitch = false;
      });
    },
    refreshBill() {
      this.InitializationData();
      console.log('DiscountedKnot');
      this.$vemit('loadBill', this.resData.pointId);
    },
    cancelSelectedActive(discType) {
      const typeId = discType.discType;
      const disPlanId = discType.dpId;
      if (+typeId === -10001 || +typeId === -2) {
        this.$message({
          message: this.$t('Biz.Order.CanotCancel'),
          type: 'warning',
        });
      }
      if (typeId < 0 && +typeId !== -10001) { // 满减，定额
        let fixUrl = 'canyin.pos.settlement.fiexd';
        const params = {
          bsId: this.baseBs.id,
          pointId: this.resData.pointId,
          money: 0,
          foId: null,
        };
        const { isTeamSettlementFlg, isTeamBill } = this;
        if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
          params.teamPointIds = this.baseBs.teamPointIds;
          params.teamBsIds = this.baseBs.teamBsIds;
          fixUrl = 'canyin.pos.settlement.teamfiexd';
        }
        ajax(fixUrl, {
          contentType: 'paramsEncoded',
          data: params,
        }).then((data) => {
          if (data.success) {
            this.$message({
              message: this.$t('Biz.Order.CancelSuccess'),
              type: 'success',
            });
            this.refreshBill();
          } else {
            this.$message({
              message: data.msg,
              type: 'warning',
            });
          }
        }).catch((msgCode, msg) => {
          this.$message({
            message: msg,
            type: 'warning',
          });
        });
      }
      if (typeId > 0) {
        let discUrl = 'canyin.pos.settlement.scale';
        const params = {
          bsId: this.baseBs.id,
          pointId: this.resData.pointId,
          disctype: 0,
          controlMode: this.posBaseInfo.controlMode,
          cancelDisctype: typeId, // 取消优惠的折扣类型
          cancelDisPlanId: disPlanId || null, // 取消优惠的打折方案ID
        };
        const { isTeamSettlementFlg, isTeamBill } = this;
        if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
          params.teamPointIds = this.baseBs.teamPointIds;
          params.teamBsIds = this.baseBs.teamBsIds;
          discUrl = 'canyin.pos.settlement.teamscale';
        }
        ajax(discUrl, {
          contentType: 'paramsEncoded',
          data: params,
        }).then((data) => {
          if (data.success) {
            this.$message({
              message: this.$t('Biz.Order.CancelSuccess'),
              type: 'success',
            });
            this.refreshBill();
          } else {
            this.$message({
              message: data.msg,
              type: 'warning',
            });
          }
        }).catch((msgCode, msg) => {
          this.$message({
            message: msg,
            type: 'warning',
          });
        });
      }
    },
    getToken(next) {
      ajax('canyin.pos.token.get').then((tokenId) => {
        next(tokenId);
      });
    },
    checkBill() {
      const vm = this;
      this.close();
      this.getToken((tokenId) => {
        let url = 'canyin.pos.settlement.CheckBill';
        const params = {
          bs_id: vm.baseBs.id,
          point_id: vm.resData.pointId,
          bs_code: vm.baseBs.code,
          ts_remark: '',
          total_invoice_money: '0',
          invoice_money: 0,
          tearing_invoice_money: 0,
          last_total: vm.baseBs.last_total,
          take_money: 0,
          give_change: 0,
          tokenHelper_tokenKey: '9310e8af-42ab-4dac-860e-12e313a04798',
          modify_time: vm.baseBs.modify_time,
          teamBsIds: '',
          teamPointIds: '',
          saleTypeId: 1,
          payway_list: [],
          controlMode: vm.posBaseInfo.controlMode,
          token_id: tokenId,
        };
        const { isTeamSettlementFlg, isTeamBill } = this;
        if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
          params.teamBsIds = vm.baseBs.teamBsIds;
          params.teamPointIds = vm.baseBs.teamPointIds;
          url = 'canyin.pos.settlement.TeamCheckBill'; // 埋单操作
        }
        ajax(url, {
          contentType: 'paramsEncoded',
          data: params,
        }).then((res) => {
          // if (res.data && res.data.printD) {
          //   _this.$devices.Printer.print(JSON.parse(res.data.printD))
          // } else if (res.data && res.data.printType !== 'SUC_TYPE_CLOSEBILL') {
          //   // 打印预结单
          //   _this.printPreSettle(res.data.bs_id)
          // }
          if (res.success) {
            vm.$message({
              message: this.$t('Biz.Order.PayBillSuccess'),
              type: 'success',
            });
            if (res.data && res.data.printD && res.data.printType === 'PRINT_PARALLEL') {
              vm.$devices.Printer.print(JSON.parse(res.data.printD));
            }
          } else {
            vm.$message({
              message: res.msg,
              type: 'warning',
            });
          }
        });
      });
    },
    BackCheckBill() {
      const vm = this;
      this.close();
      this.getToken((tokenId) => {
        let url = 'canyin.pos.settlement.BackCheckBill';
        const params = {
          bsId: vm.baseBs.id,
          pointId: vm.resData.pointId,
          teamBsIds: '',
          token_id: tokenId,
        };
        const { isTeamSettlementFlg, isTeamBill } = this;
        if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
          params.teamBsIds = vm.baseBs.teamBsIds;
          params.teamPointIds = vm.baseBs.teamPointIds;
          url = 'canyin.pos.settlement.TeamBackCheckBill'; // 撤销埋单操作
        }
        ajax(url, {
          contentType: 'paramsEncoded',
          data: params,
        }).then((res) => {
          if (res.success) {
            vm.$message({
              message: this.$t('Biz.Order.UndoPayBillSuccess'),
              type: 'success',
            });
          } else {
            vm.$message({
              message: res.msg,
              type: 'warning',
            });
          }
        });
      });
    },
    // 打印预结单
    printPreSettle(bsId) {
      if (!bsId) { return; }
      ajax('canyin.pos.printsettle.getsettleprintdata', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          bsId,
          styleType: '1',
        },
      }).then((printData) => {
        if (printData && printData.printD) {
          this.$devices.Printer.print(JSON.parse(printData.printD));
        }
      }).catch((errCode, msg) => {
        if (msg) {
          this.$message.error(msg);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .cursorPointer{
    cursor:pointer
  }
  .noCursorPointer{
    cursor: not-allowed;
  }
  .discountedKnot{
    padding: 0 15px;
  }
  .discountedKnot-up{
    width: 100%;
    height: 170px;
    margin-top: 10px;
    box-shadow: darkgrey 1px 3px 25px 7px;
    background: #fff;
    padding: 8px 10px;
    display: flex;
    justify-content: space-between;
    .receivable{
      width: 150px;
      .receivable-ul{
        padding: 4px 0;
        li{
          height: 35px;
          padding: 5px;
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
      }
    }
    .discount{
      width: 322px;
      position: relative;   // 用于子元素 下一页的定位
      .discount-ul{
        padding: 4px 8px;
        display: flex;
        flex-wrap: wrap;
        padding-bottom: 0;
        li{
          width: 150px;
          background: #63b3e8;
          height: 35px;
          padding: 5px;
          color: #fff;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          border-radius: 5px;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .nextPager{
          background: none;
          border: 1px solid #999;
          position: absolute;
          bottom: 0;
          right: 8px;
          color: #999;
          margin: 0;
          > div{
            width: 100%;
            text-align: center;
          }
        }
        li:nth-child(2n+2) {
          margin-right: 0;
        }
      }
    }
    .netReceipts{
      width: 150px;
    }
  }
  .discountedKnot-active{
    height: 142px;
    margin-top:20px;
    .active-title{
      height: 45px;
      padding: 0 10px;
      background: #eaeaea;
      display: flex;
      justify-content: space-between;
      .name{
        font-size: 16px;
        font-weight: bold;
        line-height: 45px;
        color: #666666;
      }
      .active-title-ul{
        display: flex;
        li{
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #dadada;
          color: #868d93;
          text-align: center;
          line-height: 38px;
          margin-top: 3px;
          margin-left: 2px;
        }
        li.active{
          background: #b5b5b5;
          color: #fff;
        }
        .lastList{
          line-height: 30px !important;
        }
      }
    }
    .active-ul{
      height: 101px;
      overflow: hidden;
      display: flex;
      flex-wrap: wrap;
      border-top: 1px solid #dcdcdc;
      border-left: 1px solid #dcdcdc;
      position: relative;
      li{
        width: 109px;
        height: 50px;
        border-right: 1px solid #dcdcdc;
        border-bottom: 1px solid #dcdcdc;
        background: #fff;
        position: relative;
        text-align: center;
      }
      .activeNextPager{
        position: absolute;
        right: 0;
        top: 50px;
        > div{
          color: #999;
        }
      }
    }
  }

  .discount-title, .receivable-title, .netReceipts-title{
    display: flex;
    font-weight: bold;
    justify-content: space-between;
    height: 35px;
    border: 1px solid #ddd;
    padding: 5px;
    background: #f5f5f5;
  }
  .midpoint{
    transform: translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    padding: 2px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
</style>
