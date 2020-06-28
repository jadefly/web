<template>
  <div class="pos-dialog-content">
    <div class="offwork-wrap" :style="{ 'width': width }">
      <ul class="offwork-info">
        <li><div>
          <!-- $t-结班流水： -->
          <strong>{{ $t('Dict.FlowingWater01') }}</strong><span>{{ data.code }}</span>
        </div></li>
        <li><div>
          <!-- $t-操作者： -->
          <strong>{{ $t('Biz.BizComm.Operator03') }}</strong>
          <span>{{ data.operatorName ? data.operatorName : '' }}</span>
        </div></li>
        <li><div>
          <!-- $t-备用金： -->
          <strong>{{ $t('Dict.ReserveFund01') }}</strong><span>{{ data.pettyCash }}</span>
        </div></li>
        <li><div>
          <!-- $t-签到时间： -->
          <strong>{{ $t('Dict.CheckInTime01') }}</strong>
          <span>{{
            data.openTime
            ? dateFormat('%M-%D %H:%I', Date.parse(data.openTime))
            : ''
          }}</span>
        </div></li>
        <li><div>
          <!-- $t-POS号： -->
          <strong>{{ $t('Biz.BizComm.POSnum') }}</strong><span>{{ data.posName }}</span>
        </div></li>
        <li><div>
          <!-- $t-签退时间： -->
          <strong>{{ $t('Dict.SigningTime01') }}</strong>
          <span>{{
            data.closeTime
              ? dateFormat('%M-%D %H:%I', Date.parse(data.closeTime))
              : ''
          }}</span>
        </div></li>
        <li class="w-33">
          <div class="w-100 t-left">
            <!-- $t-类别销售： -->
            <strong>{{ $t('Biz.BizComm.TypeSales') }}</strong>
            <el-switch
              v-model="data.salesCategorySwitch"
              active-color="#0babb9"
              inactive-color="#b5b5b5"
              @change="changeSwitch()"
              :active-value="1"
              :inactive-value="0"
            ></el-switch>
            <!-- $t-'显示' : '隐藏' -->
            <span class="toggle-text">{{
              data.salesCategorySwitch === 1
              ? $t('Biz.BizComm.Show')
              : $t("Biz.BizComm.Hide")
            }}</span>
          </div>
        </li>
        <li class="w-33 t-left">
          <div class="w-100">
            <!-- $t-账单明细： -->
            <strong>{{ $t('Biz.BizComm.BillDetails') }}</strong>
            <el-switch
              v-model="data.billsDetailSwitch"
              active-color="#0babb9"
              inactive-color="#b5b5b5"
              @change="changeSwitch()"
              :active-value="1"
              :inactive-value="0"
            ></el-switch>
            <!-- $t-'显示' : '隐藏' -->
            <span class="toggle-text">{{
              data.billsDetailSwitch === 1
              ? $t('Biz.BizComm.Show')
              : $t("Biz.BizComm.Hide")
            }}</span>
          </div>
        </li>
        <li class="w-33 t-left">
          <div class="w-100">
            <strong>{{ $t('Biz.BizComm.PaymentInfo') }}：</strong>
            <el-switch
              v-model="data.sumPayMoneySwitch"
              active-color="#0babb9"
              inactive-color="#b5b5b5"
              @change="changeSwitch()"
              :active-value="1"
              :inactive-value="0"
            ></el-switch>
            <span class="toggle-text">{{
              data.sumPayMoneySwitch === 1
                ? $t('Biz.BizComm.Show')
                : $t("Biz.BizComm.Hide")
            }}</span>
          </div>
        </li>
      </ul>
      <div :id="offworkDataPagerId" class="offwork-data">
        <!-- 非快餐模式下显示的 -->
        <dl v-if="posMode == '1' && isShowPrevWork">
          <!-- $t-上班次信息, 上班未结台数/上班未结人数/上班未结金额/上班未退押金-->
          <dt>{{ $t('Biz.BizComm.LastDutyInfo') }}</dt>
          <dd>
            <strong>{{ $t('Biz.BizComm.LastDutyInfo01') }}</strong>
            <span>{{ data.psDetail.preUnsettledBillQty }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.LastDutyInfo02') }}</strong>
            <span>{{ data.psDetail.preUnsettledPeople }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.LastDutyInfo03') }}</strong>
            <span>{{ data.psDetail.preUnsettledMoney }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.LastDutyInfo04') }}</strong>
            <span>{{ data.psDetail.preUnreturnedDeposit }}</span>
          </dd>
        </dl>
        <dl>
          <!-- $t-本班次信息: 本班开台数量/本班续单数量/本班已结台数 -->
          <dt>{{ $t('Biz.BizComm.ThisDutyInfo') }}</dt>
          <template v-if="posMode == '1'">
            <dd>
              <strong>{{ $t('Biz.BizComm.ThisDutyInfo01') }}</strong>
              <span>{{ data.psDetail.openBillQty }}</span>
            </dd>
            <dd>
              <strong>{{ $t('Biz.BizComm.ThisDutyInfo02') }}</strong>
              <span>{{ data.psDetail.continuedBillCount }}</span>
            </dd>
            <dd>
              <strong>{{ $t('Biz.BizComm.ThisDutyInfo03') }}</strong>
              <span>{{ data.psDetail.settledBillQty }}</span>
            </dd>
          </template>
          <dd v-if="posMode == '3'">
            <!-- $t-本班已结单数 -->
            <strong>{{ $t('Biz.BizComm.ThisDutyInfo04') }}</strong>
            <span>{{ data.psDetail.settledBillQty }}</span>
          </dd>
          <!-- $t-本班已结人数 -->
          <dd>
            <strong>{{ $t('Biz.BizComm.ThisDutyInfo05') }}</strong>
            <span>{{ data.psDetail.settledPeople }}</span>
          </dd>
          <!-- $t-本班已结金额 -->
          <dd>
            <strong>{{ $t('Biz.BizComm.ThisDutyInfo06') }}</strong>
            <span>{{ data.psDetail.settledMoney }}</span>
          </dd>
          <template v-if="posMode == '1'">
            <!-- $t-本班登记押金 -->
            <dd>
              <strong>{{ $t('Biz.BizComm.ThisDutyInfo07') }}</strong>
              <span>{{ data.psDetail.registerDeposit }}</span>
            </dd>
            <!-- $t-本班使用押金 -->
            <dd>
              <strong>{{ $t('Biz.BizComm.ThisDutyInfo08') }}</strong>
              <span>{{ data.psDetail.useedDeposit }}</span>
            </dd>
            <!-- $t-本班已退押金 -->
            <dd>
              <strong>{{ $t('Biz.BizComm.ThisDutyInfo09') }}</strong>
              <span>{{ data.psDetail.returnedDeposit }}</span>
            </dd>
          </template>
          <!-- $t-本班赠单金额 -->
          <dd>
            <strong>{{ $t('Biz.BizComm.ThisDutyInfo10') }}</strong>
            <span>{{ data.psDetail.presentMoney }}</span>
          </dd>
          <dd v-if="posMode == '1'">
            <!-- $t-本班退单金额 -->
            <strong>{{ $t('Biz.BizComm.ThisDutyInfo11') }}</strong>
            <span>{{ data.psDetail.cancelMoney }}</span>
          </dd>
          <!-- $t-本班废单数量 -->
          <dd>
            <strong>{{ $t('Biz.BizComm.ThisDutyInfo12') }}</strong>
            <span>{{ data.psDetail.voidQty }}</span>
          </dd>
          <!-- $t-本班废单金额 -->
          <dd>
            <strong>{{ $t('Biz.BizComm.ThisDutyInfo13') }}</strong>
            <span>{{ data.psDetail.voidMoney }}</span>
          </dd>
          <template v-if="posMode == '1'">
            <!-- $t-本班开票金额 -->
            <dd>
              <strong>{{ $t('Biz.BizComm.ThisDutyInfo14') }}</strong>
              <span>{{ data.psDetail.invoiceMoney }}</span>
            </dd>
            <!-- $t-本班返位笔数 -->
            <dd>
              <strong>{{ $t('Biz.BizComm.ThisDutyInfo15') }}</strong>
              <span>{{ data.psDetail.cancelSettlementQty }}</span>
            </dd>
          </template>
            <!-- $t-本班抽大钞金 -->
          <dd>
            <strong>{{ $t('Biz.BizComm.ThisDutyInfo16') }}</strong>
            <span>{{ data.psDetail.smokeCash }}</span>
          </dd>
        </dl>
        <dl>
          <!-- $t-应收: 品项消费/服务费/最低消费补齐/合计 -->
          <dt>{{ $t('Dict.Receivable') }}</dt>
          <dd>
            <strong>{{ $t('Dict.ItemConsume') }}</strong>
            <span>{{ data.psDetail.itemTotalCharge }}</span>
          </dd>
          <template v-if="posMode == '1'">
            <dd>
              <strong>{{ $t('Biz.BizComm.ServiceCharge') }}</strong>
              <span>{{ data.psDetail.serviceCharge }}</span>
            </dd>
            <dd>
              <strong>{{ $t('Dict.MinMakeUp') }}</strong>
              <span>{{ data.psDetail.fillMinimumCharge }}</span>
            </dd>
          </template>
          <dd class="total">
            <strong>{{ $t('Dict.Total') }}</strong>
            <span>{{ data.sumYingShou }}</span>
          </dd>
        </dl>
        <dl>
          <!-- $t-优惠: 会员价优惠/促销优惠/赠送金额/折扣优惠/定额优惠/抹零/合计-->
          <dt>{{ $t('Dict.Offer') }}</dt>
          <dd>
            <strong>{{ $t('Biz.BizComm.Offer01') }}</strong>
            <span>{{ data.psDetail.memberMoney }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.Offer02') }}</strong>
            <span>{{ data.psDetail.promoteMoney }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Dict.GiveAmountLable') }}</strong>
            <span>{{ data.psDetail.presentMoney }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.Offer04') }}</strong>
            <span>{{ data.psDetail.discMoney }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.Offer05') }}</strong>
            <span>{{ data.psDetail.discFix }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Dict.WipeMoney') }}</strong>
            <span>{{ data.psDetail.wipeMoney }}</span>
          </dd>
          <dd class="total">
            <strong>{{ $t('Dict.Total') }}</strong>
            <span>{{ data.sumDisc }}</span>
          </dd>
        </dl>
        <dl>
          <!-- $t-实收:非收入金额/纯收金额  -->
          <dt>{{ $t('Dict.NetReceipts') }}</dt>
          <dd>
            <strong>{{ $t('Biz.BizComm.NetIncome01') }}</strong>
            <span>{{ data.sumNotIncomeMoney }}</span>
          </dd>
          <dd><strong>{{ $t('Dict.NetIncome') }}</strong><span>{{ data.sumIncomeTotal }}</span></dd>
          <dd class="total">
            <strong>{{ $t('Dict.Total') }}</strong>
            <span>{{ data.sumLastTotal }}</span>
          </dd>
        </dl>
        <dl v-if="data.sumPayMoneySwitch === 0">
          <dt>{{ $t('Biz.BizComm.NetIncome01') }}</dt>
          <dd
            v-for="(item, key) in data.payWayDetails"
            :key="key"
            v-if="item.notIncomeMoney != 0"
          >
            <strong>{{ item.payWayName }}</strong>
            <span>{{ item.notIncomeMoney }}</span>
          </dd>
          <dd class="total">
            <strong>{{ $t('Dict.Total') }}</strong>
            <span>{{ data.sumNotIncomeMoney }}</span>
          </dd>
        </dl>
        <dl v-if="data.sumPayMoneySwitch === 0">
          <dt>{{ $t('Dict.NetIncome') }}</dt>
          <dd
            v-for="(item, key) in data.payWayDetails"
            :key="key"
            v-if="item.incomeMoney != 0"
          >
            <strong>{{ item.payWayName }}</strong>
            <span>{{ item.incomeMoney }}</span>
          </dd>
          <dd class="total">
            <strong>{{ $t('Dict.Total') }}</strong>
            <span>{{ data.sumIncomeTotal }}</span>
          </dd>
        </dl>
        <dl v-if="data.sumPayMoneySwitch === 1">
          <dt>{{ $t('Biz.BizComm.PaymentInfo') }}</dt>
          <dd class="total member-details">
            <strong>{{ $t('Dict.SettlementMethod') }}</strong>
            <strong class="center">{{ $t('Dict.Numbers') }}</strong>
            <strong style="text-align: right">{{$t('Biz.Settlement.PaymentAmount1')}}</strong>
          </dd>
          <dd class="settle-type" v-for="(item, key) in data.sumPayMoneyByGroup" :key="key">
            <strong>{{ item.payWayName }}</strong>
            <span class="center">{{ item.tsCount }}</span>
            <span>{{ item.payMoney }}</span>
          </dd>
          <dd class="total settle-type">
            <strong>{{$t('Dict.Total')}}</strong>
            <span class="center">{{countNumber(data, 'tsCount')}}</span>
            <span>{{data.sumLastTotal}}</span></dd>
        </dl>
        <dl v-if="data.crmVersion == '1' && data.queryCrmPosSerialInfo =='1'">
          <!-- $t-会员发展: 01-"新增会员总数",02-"其中微信会员数",03-"其中实体会员数",04-"其中支付宝会员数",
          05-"其中美团外卖会员数",06-"其中饿了么外卖会员数",07-"其中百度外卖会员数",08-"其中其它会员数",09-"储值笔数",
          10-"储值应收",11-"储值实收",12-"会员储值合计",13-"会员消费笔数",14-"会员消费合计", -->
          <dt>{{ $t('Biz.BizComm.MembersDetail') }}</dt>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail01') }}</strong>
            <span>{{ data.crmInfo.saleCardCount }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail02') }}</strong>
            <span>{{ data.crmInfo.wxmemberCnt }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail03') }}</strong>
            <span>{{ data.crmInfo.cardmemberCnt }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail04') }}</strong>
            <span>{{ data.crmInfo.alipayMemberCnt }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail05') }}</strong>
            <span>{{ data.crmInfo.mtTakeoutMemberCnt }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail06') }}</strong>
            <span>{{ data.crmInfo.eleTakeoutMemberCnt }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail07') }}</strong>
            <span>{{ data.crmInfo.baiduTakeoutMemberCnt }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail08') }}</strong>
            <span>{{ data.crmInfo.otherMemberCnt }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail09') }}</strong>
            <span>{{ data.crmInfo.chargeCount }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail10') }}</strong>
            <span>{{ data.crmInfo.chargeMoney }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail11') }}</strong>
            <span>{{ data.crmInfo.realChargeMoney }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail12') }}</strong>
            <span>{{ data.crmInfo.sumCrm }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail13') }}</strong>
            <span>{{ data.crmInfo.consumeTimes }}</span>
          </dd>
          <dd>
            <strong>{{ $t('Biz.BizComm.MembersDetail14') }}</strong>
            <span>{{ data.crmInfo.consumeTotal }}</span>
          </dd>
        </dl>
        <dl v-if="data.crmVersion == '1' && data.queryCrmPosSerialInfo =='1'">
          <!-- $t会员储值,支付方式,金额 -->
          <dt>{{ $t('Biz.BizComm.MembersDetail15') }}</dt>
          <dd class="total">
            <strong>{{ $t('Dict.PaymentMethod') }}</strong>
            <span>{{ $t('Dict.Amount0') }}</span>
          </dd>
          <dd v-for="(item, key) in data.crmPayInfoList" :key="key">
            <strong>{{ item.name }}</strong>
            <span>{{ item.sumMoney }}</span>
          </dd>
          <dd class="total">
            <strong>{{ $t('Dict.Total') }}</strong>
            <span>{{ data.crmInfo.sumCrm }}</span>
          </dd>
        </dl>
        <dl>
          <!-- $t-会员卡(券)明细,使用券名称,使用张数,券面值合计 -->
          <dt>{{ $t('Biz.Order.MemberCardDetail') }}</dt>
          <dd class="total member-details">
            <strong>{{ $t('Biz.BizComm.MembersDetail17') }}</strong>
            <strong class="center">{{ $t('Biz.BizComm.MembersDetail18') }}</strong>
            <strong style="text-align: right">{{ $t('Biz.BizComm.MembersDetail19') }}</strong>
          </dd>
          <dd
            v-for="(item, key) in data.crmTickets"
            :key="key"
            class="member-details"
          >
            <strong>{{ item.detailType }}</strong>
            <strong class="center">{{ item.data1 }}</strong>
            <strong style="text-align: right">{{ item.data2 }}</strong>
          </dd>
        </dl>
        <dl v-if="data.salesCategorySwitch === 1">
          <!-- <dt>类别销售</dt> -->
          <dt>{{ $t('Biz.BizComm.TypeSales1') }}</dt>
          <dd v-for="(item, key) in data.rptPsSalesRevenueData" :key="key">
            <strong>{{ item.typeName }}</strong>
            <span>{{ item.actualMoney }}</span>
          </dd>
          <dd class="total">
            <strong>{{ $t('Dict.Total') }}</strong>
            <span>{{ data.rptPsSalesRevenueTotal }}</span>
          </dd>
        </dl>
        <dl v-if="data.billsDetailSwitch === 1">
          <!-- <dt>账单明细</dt> -->
          <dt>{{ $t('Biz.BizComm.BillDetails1') }}</dt>
          <dd class="total member-details">
            <!-- $t-营业流水号,账单金额,支付信息 -->
            <strong>{{ $t('Biz.BizComm.SerialNum') }}</strong>
            <strong class="center">{{ $t('Dict.AmountOfBill') }}</strong>
            <strong style="text-align: right">{{ $t('Biz.BizComm.PaymentInfo') }}</strong>
          </dd>
          <dd
            v-for="(item, key) in billDetailList"
            :key="key"
            class="member-details"
            style="line-height: normal; height: auto;"
          >
            <strong>{{ item.bsCode }}</strong>
            <strong  class="center">{{ item.actualMoney }}</strong>
            <strong style="text-align: right">{{ item.settleInfo }}</strong>
          </dd>
          <!--查看全部账单明细-->
          <dd class="see-all" @click="seeAllBillDetail = true">{{$t('Biz.Pos.ShowAllBillsDetail')}}</dd>
        </dl>
        <!-- CRM7版本显示 -->
        <dl v-if="setting.crmVersion === 1">
          <dt>{{$t('Biz.BizComm.PayMethodsAll')}}</dt>
          <dd class="total">
            <strong>{{ $t('Dict.PaymentMethod') }}</strong>
            <span>{{ $t('Dict.Amount0') }}</span>
          </dd>
          <!-- 因为统计纯收，所以去掉纯收为0的项 -->
          <dd
            v-for="(item ,key) in data.sumIncomeMoneyAndCrmMoney"
            :key="key"
            v-show="item.incomeMoney!=0"
          >
            <strong>{{ item.payWayName }}</strong>
            <span>{{ item.incomeMoney }}</span>
          </dd>
          <dd class="total">
            <strong>{{ $t('Dict.Total') }}</strong>
            <span>{{ data.sumIncomeTotal }}</span>
          </dd>
        </dl>
        <!-- 销售类型统计 -->
        <dl>
          <dt>销售类型统计</dt>
          <dd class="total member-details">
            <strong>{{$t('Dict.Type')}}</strong>
            <strong class="center">单数</strong>
            <strong class="center">{{$t('Dict.NetReceipts')}}</strong>
            <strong style="text-align: right">实收占比</strong>
          </dd>
          <dd class="settle-type" v-for="(item, key) in data.saleTypeStatistics" :key="key">
            <strong>{{ item.name }}</strong>
            <span class="center">{{ item.billCount }}</span>
            <span class="center">{{ item.shiShou }}</span>
            <span>{{ item.shiShouRatio }}<span v-if="item.shiShouRatio">%</span></span>
          </dd>
        </dl>
        <!-- 外卖单统计 -->
        <dl>
          <dt>外卖单统计</dt>
          <dd class="total member-details">
            <strong>渠道</strong>
            <strong class="center">单数</strong>
            <strong class="center">商家实际收入</strong>
            <strong style="text-align: right">收入占比</strong>
          </dd>
          <dd class="settle-type" v-for="(item, key) in data.takeoutStatistics" :key="key">
            <strong>{{ item.name }}</strong>
            <span class="center">{{ item.billCount }}</span>
            <span class="center">{{ item.shiShou }}</span>
            <span>{{ item.shiShouRatio }}<span v-if="item.shiShouRatio">%</span></span>
          </dd>
        </dl>
      </div>
      <div class="offwork-pager">
        <Pager
          :pagerId="offworkDataPagerId"
          arrowDirection="up-down"
          scrollMode="simple"
          itemTag="> dl"
          ref="offworkDataPager"
        ></Pager>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import dateFormat from '@/common/js/dateformat';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';

const defaultCheckMap = {
  typeSales: 0, // 类别销售
  billDetails: 0, // 账单明细
  payInfo: 0, // 是否开启了支付信息开关
};
const prePrintDetails = [
  {
    type: 'typeSales',
    value: 'rptPsSalesRevenueData',
  },
  {
    type: 'billDetails',
    value: 'rptPsBsRecordData',
  },
  {
    type: 'payInfo',
    value: 'showSumPayMoney',
  },
];

export default {
  name: 'OffWorkComponent',
  props: {
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    isShowPrevWork: {
      type: Boolean,
      default() {
        return false;
      },
    },
    width: {
      type: String,
      default() {
        return '560px';
      },
    },
    posMode: {
      type: Number,
      default() {
        return 1;
      },
    },
  },
  computed: {
    ...mapGetters(['setting']),
    billDetailList() {
      if (this.seeAllBillDetail) {
        return this.data.rptPsBsRecordData;
      }
      return this.data.rptPsBsRecordData.slice(0,10);
    },
  },
  data() {
    return {
      checkMap: defaultCheckMap,
      offworkDataPagerId: '',
      seeAllBillDetail: false, // 是否查看全部账单
    };
  },
  components: {
    Pager,
  },
  watch: {
    checkMap: {
      handler(data) {
        const prePrintDetailArr = prePrintDetails.filter(item => data[item.type])
          .map(item => item.value)
          .join(',');
        this.$emit('handleGetCheckData', prePrintDetailArr);
      },
      deep: true,
    },
  },
  methods: {
    countNumber(data, key) {
      if (!data || !data.sumPayMoneyByGroup || data.sumPayMoneyByGroup.length === 0) {
        return 0;
      }
      return data.sumPayMoneyByGroup.reduce((num, item) => num += Number(item[key]), 0);
    },
    init() {
      console.log(`CRM版本号：${this.setting.crmVersion === 1 ? '7' : '6'}`);
      this.offworkDataPagerId = 'offworkData';
      this.$refs.offworkDataPager.refresh();
      this.checkMap = Object.assign({
        billDetails: this.data.billsDetailSwitch,
        typeSales: this.data.salesCategorySwitch,
        payInfo: this.data.sumPayMoneySwitch,
      });
      console.log('xxxxxxxxxxx', this.checkMap)
    },
    dateFormat(format, time) {
      return dateFormat(format, time);
    },
    // 切换switch bar
    changeSwitch() {
      // 原有逻辑的字段值保留
      this.checkMap.billDetails = this.data.billsDetailSwitch;
      this.checkMap.typeSales = this.data.salesCategorySwitch;
      this.checkMap.payInfo = this.data.sumPayMoneySwitch;
      // 保存请求
      const params = {
        salesCategorySwitch: this.data.salesCategorySwitch,
        billsDetailSwitch: this.data.billsDetailSwitch,
        sumPayMoneySwitch: this.data.sumPayMoneySwitch,
      };
      ajax('canyin.pos.posserial.saveuserhabit', {
        contentType: 'URLEncoded',
        data: params,
      }).then(() => {}).catch((errCode, msg) => {
        this.$message.error(msg);
      });
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .center {
    text-align: center;
  }

  .pos-dialog-content {
    display: flex;
    justify-content: center;

    .offwork-wrap {
      position: relative;
      height: 100%;
      width: 550px;
    }
  }

  .offwork-info {
    // position: absolute;
    top: 0;
    left: 0;
    .size(100%, 120px);
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 18px;

    > li {
      float: left;
      width: 60%;
      // padding-left: 10px;
      // padding-right: 10px;
      line-height: 22px;
      font-size: 12px;
      display: flex;

      &:nth-child(2n) {
        justify-content: flex-end;
        width: 40%;

        > div {
          width: 155px;
          overflow: hidden;
          white-space: nowrap;
        }
      }

      &:nth-child(n) {
        text-align: right;
      }

      > div {
        text-align: left;

        > strong {
          font-weight: normal;
        }

        > .toggle-text {
          color: #767676;
        }
      }
    }

    .w-33 {
      width: 33.3% !important;
    }

    .w-40 {
      width: 40.3% !important;
    }

    .w-25 {
      width: 25% !important;
    }

    .w-100 {
      width: 100% !important;
    }

    .t-left {
      text-align: left;
    }

    .t-right {
      text-align: right;
    }

    .t-center {
      text-align: center;
    }
  }

  .offwork-data {
    height: calc(100% - 185px);
    overflow-y: auto;
    padding-left: 10px;
    padding-right: 10px;

    > dl {
      margin-bottom: 10px;
      background-color: @white;

      > dt {
        height: 36px;
        line-height: 36px;
        padding-left: 12px;
        padding-right: 12px;
        background-color: #eff8ff;
        border-bottom: 1px solid #e4e4e4;
        color: #344b5d;
        font-weight: bold;
      }

      .flex {
        display: flex;

        > span {
          flex: 1;
        }

        .center {
          text-align: center;
        }

        .right {
          text-align: right;
        }
      }

      > dd {
        margin-left: 10px;
        margin-right: 10px;
        height: 44px;
        line-height: 44px;
        border-bottom: 1px solid #e4e4e4;

        > strong {
          font-weight: normal;
        }

        > span {
          float: right;
        }

        &.member-details {
          display: flex;
          justify-content: space-between;

          > strong {
            flex: 1;
          }
        }

        &.total > strong,
        &.total > span {
          font-weight: bold;
        }

        .mar-l-36 {
          margin-left: 36%;
        }

        &.ml-46 {
          margin-left: 44%;
        }

        &.total > span {
          text-align: right;
        }

        &:last-child {
          border-bottom: none;
          &.see-all {
            color: #344b5d;
            font-weight: bold;
          }
        }
      }

      .settle-type {
        display: flex;
        justify-content: space-around;

        > strong {
          flex: 1;
          text-align: left;
        }

        > span {
          flex: 1;
          text-align: right;
        }

        .center {
          flex: 1;
          text-align: center;
        }
      }
    }
  }

  .offwork-pager {
    position: absolute;
    bottom: 0;
    left: 0;
    .size(100%, 50px);
    padding-top: 8px;
    padding-left: 24px;
    padding-right: 24px;
    background-color: @white;
    display: flex;
    justify-content: center;
  }
</style>
