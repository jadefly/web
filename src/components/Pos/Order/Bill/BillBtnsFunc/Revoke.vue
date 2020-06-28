<template>
  <!-- 进入公共模块弹框 -->
  <Dialog
    name="PosDialog.Revoke"
    :title="$t('Dict.Chargeback')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :showSubmit="true"
    :appendToBody="true"
    width="800px"
    :hotkeys="hotKeySet"
    :submitId="submitIdName"
  >
    <template slot="other-button">
      <el-checkbox
        v-model="cancelBillNotReconfirm"
        border
        @change="saveState()"
        :true-label="1"
        :false-label="0"
      >{{ $t('Biz.Pos.More.ChargebackModalCb1') }}</el-checkbox>
    </template>
  <!-- 弹框的主要内容 -->
    <div class="pos-order-content">
      <div class="pos-order-bill-title">
        <span class="table-number title-list">{{bsData.pointName}}</span>
        <span class="title-list">{{ $t('Dict.OpeningTime') }}{{bsData.openTime}}</span>
        <span class="title-list">{{
          $t('Biz.Order.DinerPersonNumLabel')
        }}{{
          bsData.peopleQty
        }}</span>
      </div>
      <div class="pos-order-main-content">
        <div class="pos-order-bill-list">
          <div class="pos-order-bill-list-title">
            <span class="head-item-checkedbox"></span>
            <!-- SerialNumber: "序号" -->
            <span class="bill-index">{{ $t('Dict.SerialNumber') }}</span>
            <span class="title-name-item">{{ $t('Dict.Item') }}</span>
            <!-- ExistingNumTabel 现有数量 -->
            <span class="title-name-number">{{ $t('Biz.Order.ExistingNumTabel') }}</span>
            <span class="tilte-name-remark">{{ $t('Dict.Remarks') }}</span>
            <!-- ChargebackNum": "退单数量" -->
            <span class="title-name-exitNumber">{{ $t('Dict.ChargebackNum') }}</span>
            <!-- <span class="title-name-exiteBill">退单</span> -->
          </div>
          <div class="pos-order-bill-list-box">
            <ul :id="'posOrderBillLists'+pageIdType">
              <li
                v-for="(itemList, index) in filterOrderList"
                :key="index"
                @click="checkeBoxHandel(itemList)">
                <span class="item-checkedbox">
                  <i class="icon icon-duihao isChecked" v-show="itemList.exitQty > 0"></i>
                  <i class="isNoChecked" v-show="+itemList.exitQty === 0"></i>
                </span>
                <span class="item-index">{{index+1}}</span>
                <span class=item-name>
                  <!-- Mixing 拼 -->
                  {{ itemList.mergeScId ? $t('Biz.Order.SpellFoodTag') : '' }}
                  <!-- Temporary 临 -->
                  <span v-if="+itemList.itemType === 2">{{
                    `[${$t('Dict.Temporary')}]` + itemList.name
                  }}</span>
                  <span v-else>
                    <span v-if="+itemList.pkgFlg === 1">{{
                      `(${$t('Dict.Package')})`+itemList.name
                    }}</span>
                    <span v-else>{{ itemList.name }}</span>
                  </span>
                </span>
                <span class="item-number" :class="itemList.auxiliaryUnitId ? 'have-aux-unit': ''" >
                  <p>{{itemList.lastQty}}</p>
                  <p v-if="itemList.auxiliaryUnitId">{{itemList.auxiliaryUnitQty}}</p>
                </span>
                <span class="item-remark">
                  <span v-if="+itemList.discFlg === 1">{{ $t('Dict.Gift') }}</span>
                  <!-- 由于打折discFlg的字段给的不准，就用是否存在打折类型和打折优惠的钱来判断 -->
                  <span v-else-if="+itemList.discType && +itemList.discMoney">
                    {{ $t('Dict.Discount') }}
                  </span>
                  <span v-else-if="+itemList.discFlg === 3">{{ $t('Dict.Change') }}</span>
                  <span v-else></span>
                </span>
                <!-- isNotFollowAmount判断此套餐是否是联动,isNotFollowAmount为true的时候是不联动要置灰色 只要选中就是全选-->
                <span
                  class="item-exitBox"
                  @click="handleChangeFn(itemList)"
                  @click.stop>
                  <!-- "DescriptiveText": "描述文字", -->
                  <el-input-number
                    :disabled="!!itemList.isNotFollowAmount"
                    id="orderRevokeNumber"
                    size="small"
                    v-model="itemList.exitQty"
                    v-num-keyboard:left
                    :min="0"
                    :max="itemList.lastQty"
                    :label="$t('Biz.Order.DescriptiveText')"
                    @change="changeNum(itemList)"
                    v-autotest
                    v-judge>
                  </el-input-number>
                  <span :class="{haveAuxiliary: itemList.auxiliaryUnitId}">{{itemList.unitName}}</span>
                  <el-input-number
                    :disabled="!!itemList.isNotFollowAmount
                      || !itemList.exitQty
                      || +itemList.exitQty === +itemList.lastQty"
                    id="orderRevokeAuxiliaryQty"
                    size="small"
                    v-if="itemList.auxiliaryUnitId"
                    v-model="itemList.exitAuxQty"
                    v-num-keyboard:left
                    :min="0"
                    :max="itemList.auxiliaryUnitQty"
                    :label="$t('Biz.Order.DescriptiveText')"
                    @change="changeAutNum(itemList)"
                    v-autotest
                    v-judge>
                  </el-input-number>
                  <span v-if="itemList.auxiliaryUnitId">{{ itemList.auxiliaryUnitName }}</span>
                </span>
                <!-- "Notes01": "注：", -->
                <p
                  class="itemMethodText"
                  v-show="+itemList.serveWayId !== 0 || itemList.methodText">
                  {{ $t('Dict.Notes01') }}
                  <i>{{+itemList.serveWayId !== 0 ? itemList.serveWayName : ''}}</i>
                  <i>
                    {{ itemList.methodText ? (itemList.serveWayId != '0' ?
                      '|'+ itemList.methodText :
                      itemList.methodText) :
                      ''}}
                  </i>
                </p>
              </li>
            </ul>
          </div>
          <div class="pos-order-bill-list-footer">
            <div class="pagerBox">
              <!-- 进入分页公共组件 -->
              <Pager
                :pagerId="'posOrderBillLists'+pageIdType"
                scrollMode="simple"
                arrowDirection="up-down"
                ref="revokePager"
              >
              </Pager>
            </div>
            <div class="allChangeBtnBox" id="orderRevokeAll">
              <el-checkbox
                v-model="allIsChange"
                :label="$t('Dict.SelectAll')"
                fill="#0097a4"
                border
                size="medium"
                @change="allIsChecked"
                v-autotest
              >
              </el-checkbox>
            </div>
            <div class="cancelBillPrint">
              <el-checkbox
                v-model="isCancelBillPrint"
                :label="$t('Dict.Btn.SkipKitchenList')"
                fill="#0097a4"
                border
                size="medium"
              >
              </el-checkbox>
            </div>
            <div
              class="isTeam"
              v-if="bsData.is_team && bsData.team_area_point_names">
              <!-- "TeamRevoke": "团队退单" -->
              <el-checkbox
                v-model="isTeamExitBill"
                :label="$t('Biz.Order.TeamRevoke')"
                fill="#0097a4"
                border
                size="medium"
                @change="filterItemBillList">
              </el-checkbox>
            </div>
            <Search
              class="revoke-search"
              ref="revokeSearch"
              @search="onSearch"
              :placeholderText="$t('Dict.QuickSearch')"
              searchId="searchRevokeItems"
              :class="{'is-team': bsData.is_team && bsData.team_area_point_names}"
              :resultLength="filterOrderList.length"
            ></Search>
          </div>
        </div>
        <div class="pos-order-exit-reason">
          <p class="pos-order-exit-reason-title">{{ $t('Biz.Order.PlsSelectedRvRsons') }}:</p>
          <form :id="'posOrderExitReasonList'+pageIdType">
            <button
              type="button"
              class="btn btn-default give-reason"
              :class="{
                'give-reason-active': exitBillReasonListActive == reason,
                'give-reason-lang': reason.name.length > 5,
              }"
              v-for="(reason, index) in exitBillReasonList"
              :key="index"
               @click="reasonBtn(reason)"
            >
              <div>{{reason.name}}</div>
            </button>
          </form>
          <div class="pos-order-exit-reason-pager">
            <Pager
              :pagerId="'posOrderExitReasonList'+pageIdType"
              ref="pager"
              itemTag="> button"
              arrowDirection="up-down">
            </Pager>
          </div>
        </div>
      </div>
    </div>
    <!--线上部分退-->
    <el-dialog
      :title="$t('Dict.Tips')"
      :visible.sync="showConfirmDialog"
      :modal="false"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="400px">
      <!-- "RevokeSureTips": "此操作将选中的品项进行退单操作，请选择退款方式？" -->
        <h3 style="text-align: center">
          {{ $t('Biz.Order.RevokeSureTips') }}
        </h3>
        <span style="display: block;text-align: center" slot="footer" class="dialog-footer">
          <!--取消-->
          <el-button @click="showConfirmDialog = false">{{ $t('Dict.Cancel') }}</el-button>
          <!--退现金-->
          <el-button
            v-if="showChargeBack"
            type="default"
            @click="messageBox"
          >{{ $t('Biz.Order.ReturnCash') }}</el-button>
          <!--线上退-->
          <el-button
            type="primary"
            @click="onlineRevoke"
          >{{ $t('Biz.Order.Return', [onlinePayType]) }}</el-button>
        </span>
    </el-dialog>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { MessageBox } from 'element-ui';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Search from '@/components/Pos/Order/Tables/Search';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';
import quickSearch from '@/common/js/quicksearch';

export default {
  components: { Dialog, Pager, Search },
  mixins: [DialogMixin],
  props: {
    // isBillOfAcount 如果是false表明是账单界面的退单,如果是true证明是已结账单里的退单
    isBillOfAcount: {
      type: Boolean,
      default() {
        return false;
      },
    },
    pageIdType: {
      type: String,
      default() {
        return '';
      },
    },
    // 被引入的方位
    submitIdMode: {
      type: String,
      default() {
        return '';
      },
    },
  },
  data() {
    return {
      demo: [],
      // 整单的头部部分数据
      bsData: {
        dinnerTypeName: '普通包房',
        pointCode: '005',
        openTime: '12:45',
        peopleQty: 6,
      },
      // 列表数据 exitQty在这起的非常关键的作用，建议后台需要加入这个参数。。
      orderList: [],
      // 全选控制开关
      allIsChange: false,
      exitBillReasonList: [
        // "CustomerNeeds": "客人要求"
        { id: '1', name: this.$t('Biz.Order.CustomerNeeds') },
      ],
      // 选中的退单原因数据
      exitBillReasonListActive: null,
      // 免厨打
      isCancelBillPrint: false,
      // 团队退单
      isTeamExitBill: false,
      // 快速搜索
      searchText: '',
      exitBillMoney: 0,
      isOnlyOnlinePay: false, // 支付方式是否仅为微信或支付宝
      onlineType: 1, // 线上部分退类型 1扫码付 2会员卡）
      showConfirmDialog: false, // 是否显示部分退的提示弹窗
      // WeChat
      onlinePayType: this.$t('Dict.WeChat'), // 微信/支付宝
      msgCb: null, // $message的返回值
      cancelBillNotReconfirm: false, // 退单免二次确认
      showChargeBack: true, // 线上部分退弹框是否显示现金退按钮
    };
  },
  computed: {
    ...mapGetters(['getVuexPosMode', 'posBaseInfo']),
    quickSearchText() {
      return quickSearch((`${this.searchText}`).toLowerCase());
    },
    hotKeySet() {
      return {
        PgDn: () => {
          // 提交按钮获得焦点后执行提交
          this.whenSubmitBtnFocus(() => {
            this.onSubmit();
          });
        },
      };
    },
    submitIdName() {
      const idTypeName = this.isBillOfAcount ? 'ExitBill' : 'Bill';
      return `revokeSubmit${idTypeName}`;
    },
    // 过滤后的退单列表
    filterOrderList() {
      return this.orderList.filter((item) => {
        const keyFilters = this.quickSearchText;
        let resultItem;
        for (let i = 0; i < keyFilters.length; i += 1) {
          const key = keyFilters[i];
          if (
            String(item.code).toLowerCase().indexOf(key) !== -1
            || item.pinyin.toLowerCase().indexOf(key) !== -1
            || item.name.toLowerCase().indexOf(key) !== -1
          ) {
            resultItem = true;
          }
        }
        return !keyFilters.length || resultItem;
      });
    },
  },
  methods: {
    // 保存状态
    saveState() {
      ajax('canyin.sys.syshabit.updatehabit', {
        contentType: 'json',
        data: {
          type: 8,
          value: this.cancelBillNotReconfirm,
        },
      }).then(() => {});
    },
    // 数据的变化
    changeNum(item) {
      setTimeout(() => {
        if (+item.exitQty === 0) {
          this.$set(item, 'exitAuxQty', 0);
        }
        if (+item.exitQty === +item.lastQty) {
          this.$set(item, 'exitAuxQty', item.auxiliaryUnitQty);
        }
      }, 0);
    },
    // 辅助数量的改变
    changeAutNum(item) {
      const taleNumTest = /^[1-9]\d*$/g;
      setTimeout(() => {
        if (!taleNumTest.test(item.exitAuxQty)) {
          this.$message.warning(this.$t('Dict.Validate.NumberMessage')); // 请输入正确数量
          this.$set(item, 'exitAuxQty', item.exitAuxQty.toString().substr(0, item.exitAuxQty.toString().length - 1));
        }
      }, 0);
    },
    onClose() {
      // 列表数据 exitQty在这起的非常关键的作用，建议后台需要加入这个参数。。
      this.orderList = [];
      // 全选控制开关
      this.allIsChange = false;
      this.exitBillReasonList = [
        { id: '1', name: '客人需求' },
      ];
      // 选中的退单原因数据
      this.exitBillReasonListActive = null;
      // 免厨打
      this.isCancelBillPrint = false;
      // 团队退单
      this.isTeamExitBill = false;
      // 快速搜索
      this.searchText = '';
      this.exitBillMoney = 0;
      this.isOnlyWeChatOrAliPay = false; // 支付方式是否仅为微信或支付宝
      this.showConfirmDialog = false; // 是否显示部分退的提示弹窗
      this.onlinePayType = '微信';// 微信/支付宝
    },
    // 数量控件的监听事件
    handleChangeFn(item) {
      if (this.allIsChange && +item.exitQty === 0) {
        // 判断如果存在辅助单位 已置为0
        if (item.auxiliaryUnitId) {
          this.$set(item, 'exitAuxQty', 0);
        }
        this.allIsChange = false;
      } else {
        const findIdNoChecked = this.filterOrderList.filter(_ => +_.exitQty === 0);
        if (!findIdNoChecked.length) {
          this.allIsChange = true;
        }
      }
    },
    // 快速搜索
    onSearch(text) {
      this.searchText = text;
    },
    // 下面的全选按钮事件
    allIsChecked(value) {
      if (value) {
        this.filterOrderList.forEach((item) => {
          const item1 = item;
          item1.exitQty = item1.lastQty;
          // 判断下辅助单位
          if (item1.auxiliaryUnitId) {
            item1.exitAuxQty = item1.auxiliaryUnitQty;
          }
        });
      } else {
        this.filterOrderList.forEach((item) => {
          const item1 = item;
          item1.exitQty = 0;
          if (item1.auxiliaryUnitId) {
            item1.exitAuxQty = 0;
          }
        });
      }
    },
    checkeBoxHandel(item) {
      // 全选选中, 并这个要操作的也是选中状态 点击取消选中的判断
      if (this.allIsChange && item.exitQty) {
        this.allIsChange = false;
      }
      this.$set(item, 'exitQty', item.exitQty > 0 ? 0 : item.lastQty);// 给退单的数量重新赋值
      // 辅助单位数量的更新
      if (item.auxiliaryUnitId) {
        if (item.exitQty > 0) {
          this.$set(item, 'exitAuxQty', +item.exitQty === +item.lastQty ? item.auxiliaryUnitQty : 1);
        } else {
          this.$set(item, 'exitAuxQty', 0);
        }

        // 给退单的数量重新赋值
      }
      // 判断全选按钮没被checked的时候对每个品项checked的时候之间的判断
      if (!this.allIsChange) {
        // 如果发现了没有被选中的品项  就全选样式显示是checked的样式
        const findIdNoChecked = this.filterOrderList.filter(_ => +_.exitQty === 0);
        if (!findIdNoChecked.length) {
          this.allIsChange = true;
        }
      }
    },
    filterItemBillList(val) {
      if (val) {
        this.teamExitBillList();
      } else {
        this.showAllExitBillList();
      }
      if (this.allIsChange) {
        this.allIsChange = !this.allIsChange;
      }
      // !this.isTeamExitBill &&
      // this.isTeamExitBill && this.showAllExitBillList()
    },
    // //全选和取消全选方法
    // exitAllFn() {
    //   if (this.allIsChange) {
    //     this.orderList.forEach((item, index) => {
    //       item.exitQty = item.lastQty;
    //     });
    //   } else {
    //     this.orderList.forEach((item, index) => {
    //       item.exitQty = 0;
    //     });
    //   }
    //   return this.orderList;
    // },
    reasonBtn(reason) {
      this.exitBillReasonListActive = reason;
    },
    // 结算方式是否满足线上部分退
    isContentOnlineRevoke() {
      return ajax('canyin.pos.settlement.canonlinepayrefund', {
        contentType: 'URLEncoded',
        loading: false,
        data: {
          bsCode: this.resData.bsData.code, // 营业流水号
          from: 2, // 来源（1:结算界面；2:已结账单）
          orderId: null, // 订单id
        },
      });
    },
    async onOpen() {
      this.isOnlyOnlinePay = false;
      this.msgCb = null;
      this.showChargeBack = this.resData.isSupportCash;
      if (this.isBillOfAcount) {
        const res = await this.isContentOnlineRevoke();
        this.isOnlyOnlinePay = !!res.data.data.onlinePayRefund || !!res.data.data.crmPayRefund;
        if (res.data.data.payTypeId === 6) {
          this.onlinePayType = this.$t('Dict.WeChat');
        } else if (res.data.data.payTypeId === 8) {
          this.onlinePayType = this.$t('Dict.Alipay');
        } else {
          this.onlinePayType = this.$t('Dict.Unknown');
        }
        if (res.data.data.onlinePayRefund) { // 单一扫码付
          this.onlineType = 1;
        } else if (res.data.data.crmPayRefund) { // 单一会员卡
          this.onlineType = 2;
          this.onlinePayType = this.$t('Dict.MemberCard');
        }
      }
      // 给每个品项添加个exitQty key 为退单的数量默认为0orderList
      // 品项数据
      this.orderList = [];
      this.resData.scList.forEach((_) => {
        this.$set(_, 'exitQty', 0);
        // 如果辅助编码存在添加属性
        if (_.auxiliaryUnitId) {
          this.$set(_, 'exitAuxQty', 0);
        }
        this.orderList.push(_);
      });
      this.bsData = this.resData.bsData;// 操作客位账单的主要信息
      this.cancelBillNotReconfirm = this.resData.cancelBillNotReconfirm;// 退单免二次确认状态
      this.exitBillReasonList = this.resData.reasonList; // 退单原因列表
      // 如果后台开启了默认的退单原因,就默认选中默认的
      if (this.resData.isShowCancelBillReason && +this.resData.isShowCancelBillReason === 1) {
        this.exitBillReasonListActive = this.exitBillReasonList.find(
          item => item.id === this.resData.defaultReason,
        );
      } else {
        this.exitBillReasonListActive = null;
      }
      this.orderList.forEach((_) => {
        // eslint-disable-next-line no-param-reassign
        _.exitQty = 0;
      });
      // 初始化下底部ckebox的状态
      this.allIsChange = false;
      this.isCancelBillPrint = false;
      // 团队退单
      this.isTeamExitBill = false;
      setTimeout(() => {
        this.$refs.revokePager.refresh();
        this.$refs.pager.refresh();
      }, 1000);
      this.clearFastSearch();
    },
    // 获取提交所需的参数
    getSubmitParams() {
      const items = [];
      let params = {};
      if (this.isBillOfAcount) {
        this.exitBillMoney = 0;
        this.orderList.forEach((_) => {
          // eslint-disable-next-line no-unused-expressions
          _.exitQty && this.cteateBillOfAcount(items, _);
        });

        const { controlMode } = this.$store.state.pos.posBaseInfo;
        const fastSettleFlg = controlMode === '3';
        params = {
          isAfterBizCheck: false,
          pointId: this.bsData.pointId,
          bsId: this.resData.currentTsData.bsId,
          items,
          exitBillMoney: this.exitBillMoney,
          posId: this.resData.currentTsData.posId,
          fastSettleFlg,
          unCancelBillPrint: this.isCancelBillPrint,
        };
      } else {
        this.orderList.forEach((_) => {
          // 过滤下退单数为大于0 的数据并进行重新组装品项数据
          // eslint-disable-next-line no-unused-expressions
          _.exitQty && this.createExitBillDataFn(items, _);
        });
        params = {
          pointId: this.resData.pointId,
          bsId: this.resData.bsData.id,
          items,
          isTeamCancel: this.isTeamExitBill, // 是否是团队退单
          teamPointIds: this.resData.bsData.team_point_ids
            ? this.resData.bsData.team_point_ids : null,
          modifyTime: this.resData.modifyTime
            ? this.resData.modifyTime : this.resData.modify_time,
          unCancelBillPrint: this.isCancelBillPrint ? this.isCancelBillPrint : null,
        };
      }
      return params;
    },
    onSubmit() {
      const exitBillItem = this.orderList.filter(_ => _.exitQty > 0);
      if (!exitBillItem.length) {
        // PlsSelectedRvList 请设定退单数据
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.PlsSelectedRvList'),
        });
      } else {
        if (!this.exitBillReasonListActive) {
          // "PlsSelectedRvRsons": "请选择退单原因"
          this.$message({
            type: 'error',
            message: this.$t('Biz.Order.PlsSelectedRvRsons'),
          });
          return;
        }
        // 确认提示框
        if (this.isOnlyOnlinePay) {
          this.showConfirmDialog = true;
        } else {
          this.messageBox();
        }
      }
    },
    cteateBillOfAcount(items, item) {
      let scale = null; // 折扣判断 如果不是数字 显示100%
      scale = (Math.round(item.discScale * 10000) / 100).toFixed(0);
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(scale)) {
        scale = 100;
      }
      scale = parseFloat(scale);
      // eslint-disable-next-line eqeqeq
      if (!item.rzFreeId || item.rzFreeId == 'undefined' || item.rzFreeId == 'null') {
        // 有做法金额时肯定要全退
        // this.exitBillMoney
        // ## +=item.lastPrice * (scale / 100) * item.exitQty + item.lastMakeFee * (scale / 100)
        this.exitBillMoney += (item.exitQty * item.lastSubtotal) / item.lastQty;
      }
      this.createExitBillDataFn(items, item);
    },
    // 组装退单品项list数据
    createExitBillDataFn(items, _) {
      const exitBill = {
        discFlg: _.discFlg, // 优惠标识
        isBuffet: _.isBuffet, // 是否自助
        isChangePrice: _.isChangePrice, // 是否变价
        itemId: _.itemId, // 品项id
        itemSizeId: _.itemSizeId, // 品项规格id
        itemType: _.itemType, // 品项类型
        methodText: _.methodText ? _.methodText : null, // 制作方法内容
        pkgFlg: _.pkgFlg, // 套餐标志
        qty: _.exitQty, // 退单的数量
        scMethods: _.scMethods ? _.scMethods : null, // 制作方法id拼接
        scId: _.scId, // 服务id
        serveWayId: _.serveWayId, // 起菜方式id
        tempItemName: _.tempItemName, // 临时品项名称
        unitId: _.unitId, // 单位id
        rzFreeId: _.rzFreeId ? _.rzFreeId : null, // 赠单原因id,
        isNotFollowAmount: !!_.isNotFollowAmount, // 针对套餐isNotFollowAmount 为true是不联动否则为联动
        reason: {
          isBreak: this.exitBillReasonListActive.isBreak,
          isSellout: this.exitBillReasonListActive.isSellout,
          reasonId: this.exitBillReasonListActive.id,
        }, // 退单单的原因数据
      };
      // 如果存在辅助数量话
      if (_.auxiliaryUnitId) {
        exitBill.auxiliaryUnitId = _.auxiliaryUnitId;
        exitBill.auxiliaryUnitQty = _.exitAuxQty;
        exitBill.auxiliaryUnitName = _.auxiliaryUnitName;
      }
      if (this.isBillOfAcount) {
        exitBill.itemName = _.name; // 已结账单退单需要
        exitBill.unitName = _.unitName;// 已结账单退单需要
      }
      items.push(exitBill);
    },
    // 如果不是微信支付宝弹出确认框，是就不弹
    messageBox() {
      this.showConfirmDialog = false;
      const params = this.getSubmitParams();
      params.onlinePayRefundFlg = false;
      if (this.cancelBillNotReconfirm) { // 勾选退单免二次确认
        this.doRevoke(params);
      } else { // 取消勾选
        // RevokeTipsContent 此操作将选中的品项进行退单操作, 是否继续?
        MessageBox.confirm(this.$t('Biz.Order.RevokeTipsContent'), this.$t('Dict.Tips'), {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
          center: true,
        }).then(() => {
          // 确认就回调接口
          this.doRevoke(params);
        }).catch(() => {});
      }
    },
    //
    doRevoke(params) {
      // eslint-disable-next-line eqeqeq
      const isAfterBizCheck = this.getVuexPosMode == 3; // 快餐模式 不执行前置校验
      if (!this.isBillOfAcount) {
        this.$set(params, 'isAfterBizCheck', isAfterBizCheck);
      }
      this.messageBoxAjaxFun(params);
    },
    // 执行线上部分退
    onlineRevoke(event, rfOrderId) {
      this.showConfirmDialog = false;
      this.msgCb = this.$message({
        message: '正在退款,请稍候...',
        type: 'success',
        duration: 0,
      });
      const params = this.getSubmitParams();
      params.onlinePayRefundFlg = true;
      params.onlineType = this.onlineType;
      if (rfOrderId) params.rfOrderId = rfOrderId;
      this.messageBoxAjaxFun(params);
    },
    // 线上部分退失败后弹出确认
    onlineRevokeFailed() {
      return this.$confirm('<strong style="color: red; font-size: 14px;"> 退款失败!</strong><br><span style="font-size: 12px;">【重试】: 重新发起退款</span><br>【取消】: <span style="font-size: 12px;color: red;">请与食客确认是否退款成功,以免造成重复退款</span>', '提示', {
        confirmButtonText: '重试',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      });
    },
    messageBoxAjaxFun(params, authData = {}) {
      // 授权
      // eslint-disable-next-line no-shadow
      this.$vonce('authCode', (authData) => {
        this.messageBoxAjaxFun(params, authData);
      });
      let url = '';
      const sendParams = {
        contentType: 'paramsEncoded',
        needToken: true,
        timeout: 70000,
        data: {
          ...params,
          ...authData,
        },
      };
      if (this.isBillOfAcount) {
        url = 'canyin.pos.closedaccountexitbill.doexitbill';
      } else {
        url = 'canyin.pos.addexitbill.addexitbill';
      }
      ajax(url, sendParams).then((res) => {
        if (this.msgCb && this.msgCb.close) {
          this.msgCb.close();
        }
        if (res.result === 1 || !res.result) { // 客位退单成功或失败会返回result 1 -1，已结账单退单不会返回 1或-1
          if (!this.isBillOfAcount) { // 客位退单逻辑
            if (res.success && res.data) {
              this.$message.success(res.data.msg);
              this.close();
              // 进行回调处理
              this.submit(res.data);
              this.showConfirmDialog = false;
            }
          } else { // 已结账单退单逻辑
            // 已结账单里的退单的成功判断
            // eslint-disable-next-line no-lonely-if
            if (res.success) {
              if (res.msg) {
                this.$message.success(res.msg);
              }
              this.showConfirmDialog = false;
              this.$emit('handleRevokeSuccess');
              this.close();
              const printData = res;
              // 退单的总单打印
              // eslint-disable-next-line eqeqeq
              if (printData.printType == 'PRINT_PARALLEL' && printData.parallelPrintData && this.$devices.Printer) {
                printData.parallelPrintData.forEach((data) => {
                  this.$devices.Printer.print(data);
                });
              }
              // 打印结账单
              if (printData.printType === 'PRINT_PARALLEL' && printData.printD && this.$devices.Printer) {
                this.$devices.Printer.print(printData.printD);
              }
            } else {
              this.$message.warning(res.msg);
            }
          }
        } else if (res.result === -2) {
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else if (!this.isBillOfAcount || !res.data || !res.data.isOnlineRefund) {
          this.$message.warning(`${res.msg}`);
        } else if (res.data && res.data.isOnlineRefund) {
          this.onlineRevokeFailed().then(() => {
            this.onlineRevoke(res.data.rfOrderId);
          }).catch(() => {
            this.close();
          });
        }
      });
    },
    /**
     *2018/7/12 @马秋瑶  团队退单的列表请求接口
    */
    teamExitBillList() {
      ajax('canyin.pos.addexitbill.exitbilllist', {
        contentType: 'URLEncoded',
        data: { isTeamCancel: true, pointId: this.resData.pointId },
      }).then((res) => {
        if (res.length === 0) {
          this.orderList = [];
        } else {
          this.showTeamExitBillList(res);
        }
      });
    },
    /**
     * 团队的品项列表显示处理
    */
    showTeamExitBillList(res) {
      this.orderList = [];
      res.forEach((_) => {
        this.$set(_, 'exitQty', 0);
        if (_.auxiliaryUnitId) {
          this.$set(_, 'exitAuxQty', 0);
        }
        this.orderList.push(_);
      });
    },
    /**
     * 全部品项显示
    */
    showAllExitBillList() {
      this.orderList = [];
      this.resData.scList.forEach((_) => {
        this.$set(_, 'exitQty', 0);
        if (_.auxiliaryUnitId) {
          this.$set(_, 'exitAuxQty', 0);
        }
        this.orderList.push(_);
      });
    },
    // 清空快速搜索
    clearFastSearch() {
      if (this.$refs.revokeSearch) {
        this.$refs.revokeSearch.clearSearchText();
      }
    },
  },
  watch: {
    filterOrderList(newValue, oldValue) {
      if (newValue.length === 0) {
        this.allIsChange = false;
        return;
      }
      if (newValue.length !== oldValue.length) {
        const filter = newValue.filter(item => +item.exitQty === 0);
        // eslint-disable-next-line no-unused-expressions
        !filter.length ? this.allIsChange = true : this.allIsChange = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pos-order-content {
  padding: 0px 15px 15px 15px;
  //头部样式
  .pos-order-bill-title {
    padding: 12px 0px;
    font-size: 14px;
    .title-list {
      margin-right: 20px;
    }
    > .table-number {
      // padding-left: 24px;
      position: relative;
      color: #f24f64;
      font-weight: bold;
      > i {
        background-image: url("~@/common/images/pos/exitBill/table-number.png");
        position: absolute;
        left: 0px;
        top: 1px;
        display: inline-block;
        width: 20px;
        height: 20px;
      }
    }
  }
  //内容部分
  .pos-order-main-content {
    height: 484px;
    padding-right: 152px;
    position: relative;
    .pos-order-bill-list {
      width: 100%;
      height: 100%;
      background: #ffffff;
      .pos-order-bill-list-title {
        color: #8c8c8c;
        width: 100%;
        height: 37px;
        line-height: 37px;
        border-bottom: 1px solid #ccc;
        span {
          display: inline-block;
          text-align: center;
        }
        > .head-item-checkedbox{
          width: 8%;
        }
        > .bill-index {
          width: 7%;
          text-align: center;
        }
        > .title-name-item {
          width: 27%;
          text-align: center;
        }
        > .title-name-number{
          width: 12%;
        }
        > .tilte-name-remark {
          width: 16%;
        }
        > .title-name-exitNumber {
          width: 25%;

        }
      }
      .pos-order-bill-list-box {
        height: 392px;
        ul {
          height: 100%;
          overflow-y: auto;
          li {
            width: 100%;
            border-bottom: 1px solid #cccccc;
            color: #333333;
            position: relative;
            span {
              display: inline-block;
              vertical-align: middle;
              max-height: 48px;
              text-align: center;
              font-size: 14px;
              font-weight: 600;
              overflow: hidden;
            }
            > .item-checkedbox{
              width: 8%;
              cursor: pointer;
              >.isChecked{
                font-size: 12px;
                background-color: #0096a4;
                color: #fff;
                padding: 1px;
                font-weight:100;
                border-radius: 2px;
              }
              >.isNoChecked {
                border: 1px solid #dcdfe6;
                width: 14px;
                height: 15px;
                margin-top: 6px;
                display: inline-block;
                border-radius: 2px;
                &:hover {
                  border: 1px solid #0096a4;
                }
              }
            }
            > .item-index {
              width: 7%;
              height: 48px;
              line-height: 48px;
              text-align: center;
            }
            > .item-name {
              width: 25%;
              height: 36px;
              text-align: center;
              line-height: 36px;
              overflow: hidden;
              white-space: nowrap;
            }
            > .item-number {
              width: 12%;
              text-align: center;
              &.have-aux-unit {
                max-height: 84px;
                  >p {
                    height: 34px;
                    line-height: 34px;
                  }
              }
            }
            > .item-remark {
              width: 15%;
              overflow: hidden;
              color: #f06174;
            }
            > .item-exitBox {
              width: 26%;
              max-height: 84px;
              >span{
                position: absolute;
                width: 34px;
                overflow: hidden;
                white-space: nowrap;
                top: 16px;
                &.haveAuxiliary {
                  top: 10px;
                }
                &:nth-of-type(2) {
                  top: 46px;
                }
              }
              >.el-input-number:nth-of-type(1) {
                margin-top: 4px;
                margin-bottom: 2px;
              }
              >.el-input-number:nth-of-type(2) {
                margin-top: 2px;
                margin-bottom: 4px;
              }
            }
            > .item-exite-billIcon {
              background: url("~@/common/images/pos/exitBill/exit-bill.png")
              no-repeat left top;
              width: 27px;
              height: 24px;
              margin-left: 3.6%;
            }
            > .active {
              background: url("~@/common/images/pos/exitBill/exit-bill-active.png")
              no-repeat left top;
              width: 27px;
              height: 24px;
              // margin-left: 14px;
              margin-left: 3.6%;
            }
            >.itemMethodText {
              padding-left: 22%;
              color: #333333;
              >i{
                font-style: normal;
              }
            }
          }
        }
      }
      .pos-order-bill-list-footer {
        position: relative;
        padding: 6px 12px;
        text-align: right;
        .revoke-search {
          .clearfix();
          position: absolute;
          right: 118px;
          top: 2px;
          width: 210px;
          &.is-team {
            width: 112px;
          }
        }
        .allChangeBtnBox,.cancelBillPrint {
          width: 92px;
          text-align:left;
          float: left;
        }
        .isTeam {
          width: 98px;
          text-align:left;
          float: left;
          margin-left: 10px;
        }
        .pagerBox {
          width: 200px;
          float: right;
        }
      }
    }
    .pos-order-exit-reason {
      width: 144px;
      height: 100%;
      position: absolute;
      padding-top: 45px;
      padding-bottom: 56px;
      right: 0px;
      top: 0px;
      background: #ffffff;
      > form {
        height: 100%;
        padding: 0px 16px;
        > .give-reason {
          display: block;
          width: 112px;
          height: 45px;
          font-size: 15px;
          font-weight: 500;
          margin-top: 6px;
          > div {
            white-space: normal;
            display: -webkit-box;
            word-break: break-all;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
          }
        }

        > .give-reason-lang {
          font-size: 12px;
        }

        > .give-reason:hover {
          color: #000;
          background-color: #defcff;
        }

        > .give-reason-active {
          color: #fff !important;
          background-color: #0097a4 !important;
        }
      }
      .pos-order-exit-reason-title {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        color: #333;
        line-height: 36px;
        text-align: center;
        height: 36px;
        font-size: 16px;
        font-weight: 700;
      }
      .pos-order-exit-reason-pager {
        position: absolute;
        left: 0;
        bottom: 13px;
        width: 100%;
        text-align: center;
      }
      .pos-order-exit-reason-btnContent {
        height: 100%;
        padding-top: 8px;
        li {
          width: 112px;
          margin: 0 auto 8px;
          text-align: center;
          border: 1px solid #ccc;
          border-radius: 5px;
          color: #344b5b;
          line-height: 42px;
          height: 42px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        li:hover {
          background: #defcff;
        }
        .active {
          color: #fff !important;
          background-color: #0097a4 !important;
        }
      }
    }
  }
}

.lang-enUS {
  .pos-order-content
    .pos-order-main-content
      .pos-order-bill-list
        .pos-order-bill-list-title > .title-name-item {
          width: 22%;
        }
  .pos-order-content
    .pos-order-main-content
      .pos-order-bill-list
        .pos-order-bill-list-title > .title-name-number {
          width: 16%;
        }
  .pos-order-content .pos-order-main-content .pos-order-exit-reason .pos-order-exit-reason-title {
    font-size: 12px;
    line-height: 18px;
  }
  .pos-order-content
    .pos-order-main-content
      .pos-order-bill-list
        .pos-order-bill-list-footer
          .allChangeBtnBox {
            width: 80px;
          }
  .pos-order-content
    .pos-order-main-content
      .pos-order-bill-list
        .pos-order-bill-list-footer
          .cancelBillPrint {
            width: 170px;
          }
}
</style>
<style lang="less">
.pos-order-bill-list-footer {
  padding: 6px 12px;
  height: 47px;
  .pos-pager {
    .pager-btn {
      background-color: rgba(170, 198, 214, 0.36);
    }
  }
  .pos-order-tables-search {
    position: relative;
    width: 100%;
    margin-top: 4px;
    border: 1px solid #b5b5b5;
  }
}
</style>
