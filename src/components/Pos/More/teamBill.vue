<template>
  <Dialog
    name="PosDialog.TeamBill"
    :title="$t('Biz.Order.TeamBill')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :fullscreen="true"
    width="100%"
  >
    <div class="pos-dialog-content pos-team-bill-wrapper">
      <div class="left has-shadow team-general-info-wrapper">
        <div class="bill-header">
          <span class="water-info">
            <span class="settlement-water">{{$t('Dict.SettlementFlow')}}</span>
            <span class="business-water">{{$t('Dict.OperationFlow')}}</span>
          </span>
          <span class="order-table">{{$t('Dict.Seat')}}</span>
          <span class="settlement-time">{{$t('Dict.SettlingTime')}}</span>
        </div>
        <div class="bill-content">
          <ul id="teamBillList">
            <li
              v-for="(item, index) in teamBill"
              :key="index"
              :class="{listActive: listActive == index}"
              @click="clickTeamBill(item, index)"
              v-show="!item.isUnShow">
              <span class="index">{{ index + 1 }}</span>
              <span class="water-info">
                <span class="settlement-water">{{ item.tsCode }}</span>
                <span class="business-water">{{ item.bsCode }}</span>
              </span>
              <span class="order-table">{{ item.pointName }}</span>
              <span class="settlement-time">{{ item.settleTime }}</span>
            </li>
          </ul>
        </div>
        <div class="bill-footer">
          <Pager
            :showInfo="true"
            arrowDirection="up-down"
            pagerId="teamBillList"
            ref="teamBillList"></Pager>
          <div v-switch-keyboard:top="keybordParams">
            <el-input
              v-model="keyword"
              class="teambill-search"
              prefix-icon="el-icon-search"
              :placeholder="$t('Dict.OperationFlow')"
            ></el-input>
            <el-select v-model="shiftDefId" :placeholder="$t('Dict.PleaseChoose')" @change="changeShift">
              <el-option v-for="item in shiftList" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="right team-detail-info-wrapper">
        <ul class="detail-header">
          <li
            v-for="(item, index) in DetailHeader"
            :key="index"
            @click="selectTab(index)"
            :class="{ active: selectedTab === index }"><span>{{ item }}</span></li>
        </ul>
        <!-- 结算信息 -->
        <div v-if="selectedTab === 0" class="tab-content settlement-info">
          <div class="left">
            <dl>
              <dt>{{$t('Dict.Receivable')}}</dt>
              <dd><strong>{{$t('Dict.ItemConsume')}}</strong><span>{{settleMsgTab.origMoney}}</span></dd>
              <dd><strong>{{$t('Dict.Btn.ServiceCharge')}}</strong><span>{{settleMsgTab.serviceFee}}</span></dd>
              <dd><strong>{{$t('Biz.Pos.More.TBillDd3')}}</strong><span>{{settleMsgTab.minFee}}</span></dd>
              <dd class="total"><strong>{{$t('Dict.Total')}}</strong><span>{{settleMsgTab.origTotal}}</span></dd>
            </dl>
            <dl>
              <dt>{{$t('Dict.Offer')}}</dt>
              <dd><strong>{{$t('Biz.BizComm.Offer04')}}</strong><span>{{settleMsgTab.discMoney}}</span></dd>
              <dd><strong>{{$t('Biz.BizComm.Offer05')}}</strong><span>{{
                isNaN(settleMsgTab.fixedDiscMoney) ? '':settleMsgTab.fixedDiscMoney
                }}</span></dd>
              <dd><strong>{{$t('Dict.WipeMoney')}}</strong><span>{{settleMsgTab.wipeMoney}}</span></dd>
              <dd><strong>{{$t('Biz.Pos.More.TBillDd7')}}</strong><span>{{settleMsgTab.presentMoney}}</span></dd>
              <dd><strong>{{$t('Biz.BizComm.Offer02')}}</strong><span>{{settleMsgTab.promoteMoney}}</span></dd>
              <dd><strong>{{$t('Biz.BizComm.Offer01')}}</strong><span>{{settleMsgTab.memberMoney}}</span></dd>
              <dd class="total"><strong>{{$t('Dict.Total')}}</strong><span>{{settleMsgTab.discTotal}}</span></dd>
            </dl>
            <dl>
              <dt>{{$t('Dict.Other')}}</dt>
              <dd><strong>{{$t('Biz.Order.ChargePos')}}</strong><span>{{settleMsgTab.posName}}</span></dd>
              <dd><strong>{{$t('Biz.Order.ChargeTime')}}</strong><span>{{settleMsgTab.shiftName}}</span></dd>
              <dd><strong>{{$t('Biz.Order.ChargeOper')}}</strong><span>{{settleMsgTab.modifierName}}</span></dd>
              <dd><strong>{{$t('Dict.SettlementNote')}}</strong><span>{{settleMsgTab.tsRemark}}</span></dd>
              <dd><strong>{{$t('Biz.Pos.More.TBillDd14')}}</strong><span>{{
                settleMsgTab.isGiveInvoice === false ? $t('Dict.FalseVal') : $t('Dict.TrueVal')
                }}</span></dd>
              <dd><strong>{{$t('Biz.Pos.More.TBillDd15')}}</strong><span>{{settleMsgTab.invoiceMoney}}</span></dd>
              <dd><strong>{{$t('Biz.Pos.More.TBillDd16')}}</strong><span>{{discountInfo ? discountInfo : ''}}</span></dd>
            </dl>
          </div>
          <div class="right">
            <dl>
              <dt>{{$t('Dict.NetReceipts')}}</dt>
              <dd
                v-for="(payWay, index) in payWayInfo"
                :key="index"><strong>{{
                    payWay.payWayName
                  }}</strong><span>{{payWay.payMoney}}</span></dd>
              <dd class="total"><strong>{{$t('Dict.Total')}}</strong><span>{{settleMsgTab.lastTotal}}</span></dd>
            </dl>
          </div>
        </div>
        <!-- 消费明细 -->
        <div v-if="selectedTab === 1" class="tab-content consume-detail">
          <div class="consume-detail-header">
            <span class="code">{{$t('Dict.Code')}}</span>
            <span class="name head">{{$t('Dict.Item')}}</span>
            <span class="quantity">{{$t('Dict.Amount')}}</span>
            <span class="price">{{$t('Dict.Btn.ChangeItemPrice')}}</span>
            <span class="discount">{{$t('Dict.DiscountRate')}}</span>
            <span class="remark">{{$t('Dict.Remarks')}}</span>
            <span class="total">{{$t('Dict.Subtotal')}}</span>
          </div>
          <div class="consume-detail-content">
            <ul id="consumeDetail">
              <li v-for="(item, index) in scList" :key="index">
                <span class="index">{{ index + 1 }}</span>
                <span class="code">{{ item.code }}</span>
                <span class="name">{{ item.mergeScId ? `[${Biz.Order.SpellFoodText}]` : '' }}{{ item.name }}</span>
                <span class="quantity">{{ item.lastQty }}{{ item.unitName }}</span>
                <span class="price">{{ item.price }}</span>
                <span class="discount">{{ item.discount}}</span>
                <span class="remark">
                  <a v-if="item.discFlg === 1" class="tip-mark">{{$t('Dict.Gift')}}</a>
                  <a v-else-if="item.discFlg === 2" class="tip-mark">{{$t('Dict.Discount')}}</a>
                  <a v-else-if="item.discFlg === 3" class="tip-mark">{{$t('Dict.Change')}}</a>
                </span>
                <span class="total">{{ item.lastSubtotal }}</span>
                <p v-if="item.methodText" class="method">{{$t('Dict.Notes01')}}{{ item.methodText }}</p>
                <ul v-if="item.pkgList" class="packeage-list">
                  <li v-for="(subitem, index) in item.pkgList" :key="index">
                    <span class="name">{{ subitem.name }}</span>
                    <span class="quantity">{{ subitem.lastQty }}{{ subitem.unitName }}</span>
                    <p v-if="subitem.methodText" class="method">{{$t('Dict.Notes01')}}{{ subitem.methodText }}</p>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div class="consume-detail-footer">
            <span
              v-if="settleMsgTab.fullBillRemark"
              class="fullbill-remark"
            ><i class="icon icon-edit"></i>{{ settleMsgTab.fullBillRemark }}</span>
            <Pager
              :showInfo="true"
              arrowDirection="up-down"
              pagerId="consumeDetail"
              ref="consumeDetail" scrollMode="simple"></Pager>
          </div>
        </div>
        <!-- 团队日志 -->
        <div v-if="selectedTab === 2" class="tab-content team-log">
          <ul class="teamlog-header">
            <li>
              <strong>{{$t('Biz.Order.TeamNmaeLabel')}}</strong>
              <span>{{teamInfo.teamName}}</span>
            </li>
            <li>
              <strong>{{$t('Dict.OpeningTime')}}</strong>
              <span>{{teamInfo.openTime}}</span>
            </li>
            <li>
              <strong>{{$t('Dict.NumberOfPeople01')}}</strong>
              <span>{{teamInfo.peopleQty}}</span>
            </li>
          </ul>
          <div class="teamlog-content" id="teamlogContent">
            <dl v-for="(item, index) in teamLogList" :key="index">
              <dt>
                <strong class="name">{{ item.moduleName }}</strong>
                <strong class="time">{{ item.creatorTime }}</strong>
              </dt>
              <dd class="time-line" :class="{last: hasTimeLine === index+1}">
                <i class="icon icon-circle" v-if="index === 0"></i>
                <i class="icon icon-arr-up" v-else></i>
                </dd>
              <dd class="log-list">
                <ul>
                  <li>{{ item.info }}</li>
                  <li>{{ item.content }}</li>
                </ul>
              </dd>
            </dl>
          </div>
          <div class="teamlog-footer">
            <Pager
              :showInfo="true"
              arrowDirection="up-down"
              pagerId="teamlogContent"
              ref="teamlogContent"
              scrollMode="simple"></Pager>
          </div>
        </div>
        <!-- 会员消费 -->
        <div v-if="selectedTab === 3" class="tab-content member-consume">
         <div class="left">
            <dl>
              <dt>{{$t('Biz.Order.MemberCardDetail')}}</dt>
              <dd
              v-for="(crmPayWay, index) in crmPayWayInfo"
              :key="index"><strong>{{
                  crmPayWay.crmTicketName
                }}</strong><span class="card-num">{{
                    crmPayWay.crmTicketCount
                  }}</span><span>{{
                      crmPayWay.crmTicketMoney
                    }}</span></dd>
              <dd class="total"><strong>{{$t('Dict.Total')}}</strong><span>{{sumCrmPayWayMoney}}</span></dd>
            </dl>
          </div>
          <div class="right">
            <dl v-if="crmSettleData">
              <dt>{{$t('Biz.Order.CardChargeCred')}}</dt>
              <dd><strong>{{$t('Dict.CardNumber')}}</strong><span>{{crmSettleData.cardno}}</span></dd>
              <dd><strong>{{$t('Dict.CardType2')}}</strong><span>{{crmSettleData.cardkindtype}}</span></dd>
              <dd><strong>{{$t('Biz.Order.MemberName')}}</strong><span>{{crmSettleData.memberName}}</span></dd>
              <dd><strong>{{$t('Biz.Order.MemberPhone')}}</strong><span>{{crmSettleData.mobile}}</span></dd>
              <dd><strong>{{$t('Biz.Order.ChargeStoreMoney')}}</strong><span>{{crmSettleData.consumeUseMoney}}</span></dd>
              <dd><strong>{{$t('Biz.Order.ChargeSendMoney')}}</strong><span>{{crmSettleData.consumePeruseMoney}}</span></dd>
              <dd><strong>{{$t('Biz.Order.ChargeCouponTotal')}}</strong><span>{{crmSettleData.consumeTicketMoney}}</span></dd>
              <dd><strong>{{$t('Biz.Order.DelScore')}}</strong><span>{{crmSettleData.consumeScore}}</span></dd>
              <dd><strong>{{$t('Biz.Order.AddScore')}}</strong><span>{{crmSettleData.addScore}}</span></dd>
              <dd><strong>{{$t('Dict.CardLeaveMoney')}}</strong><span>{{crmSettleData.balanceMoney}}</span></dd>
              <dd><strong>{{$t('Dict.RemainingPoints')}}</strong><span>{{crmSettleData.balanceScore}}</span></dd>
              <dd v-if="crmSettleData.balanceTicketMoney == 0 || crmSettleData.balanceTicketMoney">
                <strong>{{$t('Biz.Order.LeftCoupon')}}</strong>
                <span>{{crmSettleData.balanceTicketMoney}}</span>
              </dd>
            </dl>
            <dl v-else>
              <dt>{{$t('Biz.Order.CardChargeCred')}}</dt>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import Search from '@/components/Pos/Order/Tables/Search';
import ajax from '@/common/js/ajax';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, Pager, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      // 左侧账单数据集
      teamBill: [{
        tsCode: 'JS000109-20180319-0008',
        bsCode: 'YY000109-20180319-0006',
        pointName: 'B区.0002',
        settleTime: '04-03 14:51',
        team_id: '15150780000000021',
        team_bs_id: '15150780000000166,15150780000000167',
        bsId: '15150780000000167',
        tsId: '15150780000000173',
        isUnShow: false,
      }, {
        tsCode: 'JS000109-20180319-0008',
        bsCode: 'YY000109-20180319-0006',
        pointName: 'B区.0002',
        settleTime: '04-03 14:51',
        team_id: '15150780000000021',
        team_bs_id: '15150780000000166,15150780000000167',
        bsId: '15150780000000167',
        tsId: '15150780000000173',
        isUnShow: false,
      }],
      // 结算信息tab数据
      settleMsgTab: {
        // 品项消费
        origMoney: 77,
        // 服务费
        serviceFee: 20,
        // 最低消费补齐
        minFee: 15,
        // 应收合计
        origTotal: 112,
        // 折扣优惠
        discMoney: 0,
        // 定额优惠 = TMath.round(优惠总额 - 抹零 - 折扣优惠 - 赠送优惠 - 促销优惠 - 会员优惠)
        fixedDiscMoney: 0,
        // 抹零金额
        wipeMoney: 0,
        // 赠送优惠
        presentMoney: 0,
        // 促销优惠
        promoteMoney: 0,
        // 会员价优惠
        memberMoney: 0,
        // 优惠合计
        discTotal: 0,
        // 结算POS
        posName: null,
        // 结算市别
        shiftName: null,
        // 结算操作者
        modifierName: null,
        // 实收合计
        lastTotal: 111,
      },
      // 支付信息
      payWayInfo: [],
      shiftList: [{
        id: '',
        name: '全部',
      }, {
        id: '选项2',
        name: '流水',
      }, {
        id: '选项3',
        name: '时间',
      }],
      discountInfo: '',
      shiftDefId: '',
      selectedTab: 0,
      // 消费明细
      scList: [{
        name: '浏阳河',
        lastQty: 999,
        unitName: '瓶',
        price: 9999,
        discount: '100%',
        remark: '备注备注',
        lastSubtotal: 999999,
        discScale: 0,
      }, {
        name: '可口可乐',
        lastQty: 2,
        unitName: '瓶',
        price: 5,
        discount: '100%',
        remark: '无',
        lastSubtotal: 10,
        discScale: 0,
      }, {
        name: '套餐',
        lastQty: 1,
        unitName: '份',
        price: 135,
        discount: '100%',
        remark: '不要辣椒',
        lastSubtotal: 135,
        discScale: 0,
        pkgList: [{
          name: '鱼香肉丝',
          lastQty: 1,
          unitName: '份',
        }, {
          name: '鸡蛋汤',
          lastQty: 1,
          unitName: '份',
        }],
      }],
      // 团队信息
      teamInfo: [{
        teamName: null,
        openTime: null,
        peopleQty: null,
      }],
      // 团队日志信息
      teamLogList: [{
        moduleName: '团队开单',
        creatorTime: '15:15',
        info: '000-管理员 触摸屏pos 192.168.8.254',
        content: '<团队加入>，客位名称：003-888',
        creator: null,
        pos: null,
        ip: null,
      }, {
        moduleName: '团队开单',
        creatorTime: '14:45',
        info: '000-管理员 触摸屏pos 192.168.8.254',
        content: '<团队加入>，客位名称：003-888',
        creator: null,
        pos: null,
        ip: null,
      }],
      // CRM支付信息
      crmPayWayInfo: [{
        crmTicketName: null,
        crmTicketCount: null,
        crmTicketMoney: null,
      }],
      // CRM消费凭证
      crmSettleData: {
        // 卡号
        cardno: null,
        // 卡类型
        cardkindtype: null,
        // 会员姓名
        memberName: null,
        // 会员电话号码
        mobile: null,
        // 本次消费储值金额
        consumeUseMoney: null,
        // 本次消费赠送金额
        consumePeruseMoney: null,
        // 消费电子券总额
        consumeTicketMoney: null,
        // 本次抵现积分
        consumeScore: null,
        // 本次产生积分
        addScore: null,
        // 卡余额
        balanceMoney: null,
        // 剩余积分
        balanceScore: null,
        // 剩余券总额
        balanceTicketMoney: null,
      },
      // 左侧列表 选中样式 状态参数
      listActive: 0,
      keyword: '',
    };
  },
  computed: {
    // 键盘参数
    keybordParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {
          focusSetKeyboardPosition: this.focusSetKeyboardPosition,
        };
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard ? 'full' : 'nine',
        focusSetKeyboardPosition: this.focusSetKeyboardPosition,
      };
    },
    DetailHeader() {
      if (this.teamBill.length > 0) {
        return [
          this.$t('Biz.Pos.More.BilledModalDiv3'),
          this.$t('Biz.Pos.More.BilledModalDiv1'),
          this.$t('Biz.Pos.More.TBillItem3'),
          this.$t('Biz.Pos.More.TBillItem4'),
        ];
      }
      return [
        this.$t('Biz.Pos.More.BilledModalDiv3'),
        this.$t('Biz.Pos.More.BilledModalDiv1'),
        this.$t('Biz.Pos.More.TBillItem3'),
      ];
    },
    hasTimeLine() {
      return this.teamLogList.length;
    },
    sumCrmPayWayMoney() {
      let crmTicketSumMoney = 0;
      if (this.crmPayWayInfo) {
        this.crmPayWayInfo.forEach((crmPayWay) => {
          crmTicketSumMoney += crmPayWay.crmTicketMoney;
        });
      }
      return crmTicketSumMoney;
    },
  },
  watch: {
    keyword(n, o) {
      if (n !== o) {
        this.onSearch(n);
      }
    },
  },
  methods: {
    // 页面初始化
    onOpen() {
      // 市别信息
      this.shiftList = [];
      this.shiftList.push({ id: '', name: this.$t('Dict.All') });
      if (this.resData.shiftList) {
        this.resData.shiftList.forEach((shift) => {
          this.shiftList.push(shift);
        });
      }
      this.initData(this.resData);
    },
    selectTab(index) {
      this.selectedTab = index;
      this.refreshPager(this.selectedTab);
    },
    // 左侧列表点击事件
    clickTeamBill(item, index) {
      // 改变 选中项
      this.listActive = index;
      this.findData(item);
      // 刷新分页
      this.refreshPager(this.selectedTab);
    },
    // 刷新分页
    refreshPager(index) {
      if (index === 2) {
        setTimeout(() => {
          this.$refs.teamlogContent.refresh();
        }, 100);
      }
      if (index === 1) {
        setTimeout(() => {
          this.$refs.consumeDetail.refresh();
        }, 100);
      }
    },
    // 市别下拉框选择
    changeShift() {
      ajax('canyin.pos.teamlog.shifttsinfo', {
        params: {
          toBeInclude: 1,
          tsId: '',
          bsIds: '',
          shiftId: this.shiftDefId,
          _: new Date().getTime(),
        },
      }).then((data) => {
        this.initData(data);
        this.$refs.teamBillList.refresh();
      }).catch(() => {
        this.$message.error(this.$t('Biz.Pos.More.TBillMsg1'));
      });
    },
    // 初始化数据
    initData(resData) {
      // 左侧账单信息数据
      this.teamBill = resData.tsList ? resData.tsList : [];
      // 结算信息tab
      this.settleMsgTab = (resData.tsList && resData.tsList.length > 0) ? resData.tsList[0] : {};
      if (!this.settleMsgTab.serviceFee) {
        this.$set(this.settleMsgTab, 'serviceFee', 0);
      }
      if (!this.settleMsgTab.minFee) {
        this.$set(this.settleMsgTab, 'minFee', 0);
      }
      // 优惠信息
      this.discountInfo = '';
      if (resData.discountInfo) {
        resData.discountInfo.forEach((info) => {
          // eslint-disable-next-line no-unused-expressions
          info.dpName && (this.discountInfo += `【${info.dpName}】`);
        });
      }
      // 定额优惠
      const fixedDisc = this.settleMsgTab.discTotal
        - this.settleMsgTab.wipeMoney
        - this.settleMsgTab.discMoney
        - this.settleMsgTab.presentMoney
        - this.settleMsgTab.promoteMoney
        - this.settleMsgTab.memberMoney;
      this.$set(this.settleMsgTab, 'fixedDiscMoney', fixedDisc);
      // 支付信息
      this.payWayInfo = resData.payWayInfo;
      // 消费明细
      this.scList = resData.scList;
      // CRM支付信息
      this.crmPayWayInfo = resData.crmPayWayInfo;
      // CRM消费凭证
      this.crmSettleData = resData.crmSettleData;
      // 备注 折扣比例
      // eslint-disable-next-line no-unused-expressions
      this.scList && this.scList.forEach((sc) => {
        let remarkText = '';
        let discountText = (Math.round(sc.discScale * 10000) / 100).toFixed(0);
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(discountText)) {
          discountText = 100;
        }
        discountText += '%';

        if (sc.discFlg && `${sc.discFlg}` !== '0') {
          if (`${sc.discFlg}` === '1') {
            remarkText += this.$t('Dict.Gift');
          } else if (`${sc.discFlg}` === '2') {
            remarkText += this.$t('Dict.Discount');
          } else if (`${sc.discFlg}` === '3') {
            remarkText += this.$t('Dict.Change');
          }
        }
        this.$set(sc, 'remark', remarkText);
        this.$set(sc, 'discount', discountText);
      });
      // 获取团队日志信息
      // eslint-disable-next-line no-unused-expressions
      this.teamBill[0] && ajax('canyin.pos.teamloglist.view', {
        params: {
          toBeInclude: 1,
          teamBsId: this.teamBill[0].team_bs_id,
          teamId: this.teamBill[0].team_id,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((data) => {
        this.$set(this.teamInfo, 'teamName', data.teamName);
        this.$set(this.teamInfo, 'openTime', data.openTime);
        this.$set(this.teamInfo, 'peopleQty', data.peopleQty);
        this.teamLogList = data.bills;
        this.teamLogList.forEach((teamLog) => {
          this.$set(
            // teamLog,
            // 'info',
            // `${teamLog.creator} ${teamLog.pos} ${teamLog.ip}`
            teamLog,
            'info',
            `${teamLog.creator ? teamLog.creator : this.$t('Biz.Pos.More.TBillSystem')} ${teamLog.pos} ${teamLog.ip}`,
          );
        });
      }).catch((error) => {
        this.$message.error(this.$t('Biz.Pos.More.TBillMsg2'));
      });
    },
    onSearch(searchText) {
      const filterBills = this.teamBill.filter(bill => bill.bsCode.indexOf(searchText) != -1);
      this.teamBill.forEach((bill) => {
        if (bill.bsCode.indexOf(searchText) == -1) {
          this.$set(bill, 'isUnShow', true);
        } else {
          this.$set(bill, 'isUnShow', false);
        }
      });
      if (filterBills.length > 0) {
        this.findData(filterBills[0]);
        this.$refs.teamBillList.refresh();
      }
    },
    findData(item) {
      let billData = {};
      this.teamBill.forEach((bill) => {
        if (bill.bsId == item.bsId) {
          this.settleMsgTab = item;
          billData = item;
          if (!this.settleMsgTab.serviceFee) {
            this.$set(this.settleMsgTab, 'serviceFee', 0);
          }
          if (!this.settleMsgTab.minFee) {
            this.$set(this.settleMsgTab, 'minFee', 0);
          }
          // 定额优惠
          const fixedDisc = this.settleMsgTab.discTotal
            - this.settleMsgTab.wipeMoney
            - this.settleMsgTab.discMoney
            - this.settleMsgTab.presentMoney
            - this.settleMsgTab.promoteMoney
            - this.settleMsgTab.memberMoney;
          this.$set(this.settleMsgTab, 'fixedDiscMoney', fixedDisc);
          // console.log(this.settleMsgTab.discTotal,
          //  this.settleMsgTab.wipeMoney,
          //  this.settleMsgTab.discMoney,
          //  this.settleMsgTab.presentMoney,
          //  this.settleMsgTab.promoteMoney,
          //  this.settleMsgTab.memberMoney);
          // console.log(fixedDisc);
        }
      });
      ajax('canyin.pos.teamlog.shifttsinfo', {
        params: {
          toBeInclude: 1,
          tsId: item.tsId,
          bsIds: item.team_bs_id,
          shiftId: this.shiftDefId,
          _: new Date().getTime(),
        },
      }).then((data) => {
        // 优惠信息
        this.discountInfo = '';
        data.discountInfo.forEach((info) => {
          info.dpName && (this.discountInfo += `【${info.dpName}】`);
        });
        // 支付信息
        this.payWayInfo = data.payWayInfo;
        // 消费明细
        this.scList = data.scList;
        // CRM支付信息
        this.crmPayWayInfo = data.crmPayWayInfo;
        // CRM消费凭证
        this.crmSettleData = data.crmSettleData;
        // 备注 折扣比例
        this.scList.forEach((sc) => {
          let remarkText = '';
          let discountText = (Math.round(sc.discScale * 10000) / 100).toFixed(0);
          if (isNaN(discountText)) {
            discountText = 100;
          }
          discountText += '%';

          if (sc.discFlg && data.discFlg != 0) {
            if (data.discFlg == 1) {
              remarkText += this.$t('Dict.Gift');
            } else if (data.discFlg == 2) {
              remarkText += this.$t('Dict.Discount');
            } else if (data.discFlg == 3) {
              remarkText += this.$t('Dict.Change');
            }
          }
          this.$set(sc, 'remark', remarkText);
          this.$set(sc, 'discount', discountText);
        });
        // 获取团队日志信息
        ajax('canyin.pos.teamloglist.view', {
          params: {
            toBeInclude: 1,
            teamBsId: billData.team_bs_id,
            teamId: billData.team_id,
            loadmodule: 1,
            _t: new Date().getTime(),
          },
        }).then((data) => {
          this.$set(this.teamInfo, 'teamName', data.teamName);
          this.$set(this.teamInfo, 'openTime', data.openTime);
          this.$set(this.teamInfo, 'peopleQty', data.peopleQty);
          this.teamLogList = data.bills;
          this.teamLogList.forEach((teamLog) => {
            this.$set(
              // teamLog, 'info', `${teamLog.creator} ${teamLog.pos} ${teamLog.ip}`
              teamLog,
              'info',
              `${teamLog.creator ? teamLog.creator : this.$t('Biz.Pos.More.TBillSystem')} ${teamLog.pos} ${teamLog.ip}`,
            );
          });
        }).catch((error) => {
          this.$message.error(this.$t('Biz.Pos.More.TBillMsg2'));
        });
      }).catch((error) => {
        this.$message.error(this.$t('Biz.Pos.More.TBillMsg2'));
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-team-bill-wrapper {
  position: relative;
  .size(100%, 100%);
  overflow: hidden;
  .clearfix();
  background-color: white;

  .left {
    float: left;
    .size(42%, 100%);
    position: relative;
    &.has-shadow {
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
    }
  }

  .right {
    float: right;
    .size(57%, 100%);
    position: relative;
  }

  .team-general-info-wrapper {
    .bill-header {
      position: absolute;
      top: 0;
      left: 0;
      .size(100%, 45px);
      padding: 10px 10px;
      border-bottom: 1px solid #ccc;
      display: flex;
      align-items: center;

      > span {
        display: inline-block;
      }

      .water-info {
        width: 44%;
        font-size: 12px;

        > .settlement-water {
          color: rgb(255, 162, 0);
          &::before {
            content: "";
            .square(10px);
            display: inline-block;
            background-color: rgb(255, 162, 0);
            border-radius: 2px;
            margin-left: 16px;
            margin-right: 4px;
          }
        }

        > .business-water {
          color: rgb(11, 171, 185);
          &::before {
            content: "";
            .square(10px);
            display: inline-block;
            background-color: rgb(11, 171, 185);
            border-radius: 2px;
            margin-left: 16px;
            margin-right: 4px;
          }
        }
      }

      .order-table {
        width: 30%;
        border-left: 1px solid #ccc;
        padding-left: 10px;
      }

      .settlement-time {
        width: 20%;
        border-left: 1px solid #ccc;
        padding-left: 10px;
      }
    }

    .bill-content {
      .square(100%);
      padding-top: 45px;
      padding-bottom: 104px;
      font-size: 12px;

      > ul {
        height: 436px !important;
        overflow: hidden !important;
      }

      li {
        padding: 4px 10px;
        cursor: pointer;
        border-bottom: 1px solid #ccc;

        &.listActive {
          background-color: #eee;
        }
      }

      span {
        display: inline-block;
        vertical-align: middle;
      }

      .index {
        font-size: 14px;
        padding-right: 6px;
      }

      .water-info {
        width: 41%;
        > .settlement-water {
          color: rgb(255, 162, 0);
          .text-overflow();
        }
        > .business-water {
          color: rgb(11, 171, 185);
          .text-overflow();
        }
      }

      .order-table {
        width: 30%;
        padding-left: 10px;
        .text-overflow();
      }

      .settlement-time {
        width: 20%;
        padding-left: 10px;
        .text-overflow();
      }
    }

    .bill-footer {
      position: absolute;
      left: 0;
      bottom: 0;
      .size(100%, 104px);
      border-top: 1px solid #ccc;
      padding: 10px 18px;
      text-align: right;
      .teambill-search{
        width: 50%;
        float: left;
        text-align: left;
      }
    }
  }

  .team-detail-info-wrapper {
    padding-right: 12px;

    .detail-header {
      position: absolute;
      top: 0;
      left: 0;
      .size(97%, 46px);
      line-height: 46px;
      border-bottom: 1px solid #ccc;
      padding-left: 8px;
      margin-right: 12px;
      .clearfix();
      display: flex;
      align-items: center;

      > li {
        float: left;
        cursor: pointer;
        padding: 0 20px;
        // width: 22%;

        &.active {
          color: rgb(11, 171, 185);
          span {
            display: inline-block;
            line-height: 40px;
            border-bottom: 3px solid rgb(11, 171, 185);
          }
        }
      }
    }

    .tab-content {
      .square(100%);
      padding-top: 46px;
      padding-bottom: 56px;
      font-size: 12px;
      overflow: hidden;
    }
    .settlement-info,
    .member-consume {
      strong {
        font-weight: normal;
      }

      dl {
        margin-bottom: 12px;

        > dt {
          height: 24px;
          line-height: 24px;
          margin-top: 6px;
          padding-left: 8px;
          background-color: #7bcad6;
          color: white;
        }

        > dd {
          position: relative;
          height: 30px;
          line-height: 30px;
          padding-left: 8px;
          padding-right: 8px;
          .clearfix();

          > span {
            float: right;
            &.card-num {
              position: absolute;
              top: 0;
              right: 80px;
            }
          }

          &.total > strong,
          &.total > span {
            font-weight: bold;
          }
        }
      }
    }
    .consume-detail {
      span {
        display: inline-block;
        vertical-align: top;
        padding-left: 6px;
      }

      .name {
        .size(22%, 30px);
        overflow: hidden;
        padding-left: 28px;
        &.head {
          height: 17px;
        }
      }

      .code {
        width: 14%;
        padding-left: 32px;
      }

      .quantity {
        width: 12%;
      }

      .price {
        width: 12%;
      }

      .discount {
        width: 12%;
      }

      .remark {
        width: 12%;
        .tip-mark {
          background-color: #f34f64;
          color: #ffffff;
          padding: 0 2px;
        }
      }

      .total {
        width: 12%;
      }

      .method {
        color: #0babb9;
        padding-left: 32px;
      }

      .consume-detail-header {
        height: 32px;
        color: white;
        background-color: #7bcad6;
        margin-top: 4px;
        display: flex;
        align-items: center;
        > span {
          border-left: 1px solid white;
          &:first-child {
            border-left: none;
          }
        }
      }

      .consume-detail-content {
        .square(100%);
        height: calc(100% - 36px);
        > ul {
          .square(100%);
          overflow: hidden;
          > li {
            position: relative;
            width: 100%;
            min-height: 40px;
            line-height: 40px;
            border-top: 1px solid #ccc;
            &:first-child {
              border-top: none;
            }
            > .index {
              position: absolute;
              top: 0;
              left: 0;
              font-weight: bold;
            }

            .packeage-list {
              background-color: rgb(245, 245, 245);
              font-size: 10px;
              color: rgb(11, 171, 185);
              line-height: 2;
              padding-top: 10px;
              padding-bottom: 10px;
            }
          }
        }
      }

      .consume-detail-footer {
        position: absolute;
        left: 0;
        bottom: 0;
        .size(100%, 56px);
        text-align: right;
        border-top: 1px solid #ccc;
        padding: 10px 16px;

        .fullbill-remark {
          position: absolute;
          top: 14px;
          left: 0;
          font-size: 14px;
          > i {
            font-size: 20px;
            padding-right: 4px;
          }
        }
      }
    }

    .team-log {

      .teamlog-header {
        position: absolute;
        top: 46px;
        left: 0;
        .size(97%, 36px);
        line-height: 36px;
        .clearfix();
        border-bottom: 1px solid #ccc;
        > li {
          float: left;
          padding-right: 26px;
        }
      }

      .teamlog-content {
        position: relative;
        .size(100%, 86%);
        margin-top: 40px;
        overflow: scroll;

        > dl {
          position: relative;
          .size(100%, 90px);

          > dt {
            position: absolute;
            top: 0;
            left: 0;
            font-size: 15px;
            width: 60px;
            text-align: center;
            .name {
              color: rgb(11, 171, 185);
            }
          }

          .time-line {
            position: absolute;
            left: 68px;
            top: 0;
            height: 100%;
            &::after {
              position: absolute;
              top: 19px;
              left: 9px;
              content: "";
              display: inline-block;
              height: 100%;
              border-left: 2px solid rgb(11, 171, 185);
            }
            &.last::after {
              display: none;
            }
            > i {
              display: inline-block;
              text-align: center;
              vertical-align: middle;
              .square(20px);
              line-height: 14px;
              color: white;
              background-color: rgb(11, 171, 185);
              border: 3px solid #e4e4e4;
              border-radius: 50%;
              &.icon-circle {
                font-size: 12px;
              }
            }
          }

          .log-list {
            position: absolute;
            top: 0;
            right: 0;
            .square(100%);
            padding-left: 105px;

            > ul {
              position: relative;
              width: 315px;
              background-color: #e4e4e4;
              padding: 6px 8px;
              border-radius: 6px;
              &::before {
                content: "";
                .square(0);
                position: absolute;
                top: 8px;
                left: -10px;
                border-top: 5px solid transparent;
                border-right: 11px solid #e4e4e4;
                border-bottom: 5px solid transparent;
              }
              > li {
                .text-overflow();
              }
            }
          }
        }
      }

      .teamlog-footer {
        position: absolute;
        left: 0;
        bottom: 0;
        .size(97%, 56px);
        text-align: right;
        border-top: 1px solid #ccc;
        padding: 10px 16px;
      }
    }
  }
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-team-bill-wrapper {
  .bill-footer {
    .pos-pager {
      padding-bottom: 10px;
    }
    .pos-order-tables-search {
      position: relative;
      .size(208px, 40px);
      border: 1px solid #ccc !important;
      background-color: #eee !important;
    }
    .el-input__inner {
      height: 40px;
    }
  }
}

.lang-enUS{
  .pos-team-bill-wrapper{
    .team-general-info-wrapper {
      .bill-header {
        padding: 5px 10px;
      }
    }
  }

  .water-info{
    span{
      display: block;
    }
  }
}

</style>
