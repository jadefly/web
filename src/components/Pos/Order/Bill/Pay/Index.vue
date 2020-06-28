<template>
  <AllSrceenDialog
    ref="dialog"
    width="1024px"
    submitId="orderPaySubmit"
    name="PosDialog.AddPayHotkey"
    class="pay-dialog-20200107"
    :title="title"
    :top="testTops"
    :height="payHeight"
    :showSubmit="true"
    :hotkeys="AddPayHotkey"
    :closeByEsc="closeByEsc"
    :headerTitle="headerTitle"
    :submitClose="submitClose"
    :businessType="businessType"
    :beforeClose="onBeforeClose"
    :invoicesOpened="invoicesOpened"
    :settlementRemarkInfo="settlementRemarkInfo"
    @open="onOpen"
    @close="onClose"
    @submit="submitSettle"
    @cancelInvoice="cancelInvoice"
    @teamSettleChange="teamSettleChange"
    @cancelSettlementRemarkInfo="cancelSettlementRemarkInfo">
    <!-- 页面内容 -->
    <div class="pay-content df">
      <!-- 1. 左侧-账单 && 费用说明功能区 -->
      <PayGuestSeatMsg
        ref="PayGuestSeatMsg"
        :buffetDataForSettle="buffetDataForSettle"
        :getSettlement="getSettlement"
        :currentServiceMoney="currentServiceMoney"
        :payMinimumConsumption="minimumConsumptionData"
        :settlementRemarkInfo="settlementRemarkInfo"
        :isOpenBuffetDeposit="posSettings.isOpenBuffetDeposit"></PayGuestSeatMsg>
      <!-- 2. 收款信息 && 优惠和结算功能区 -->
      <div class="contentR p12">
        <div class="pay-selected bcf fw">
          <!-- 2.1.1 收款信息 -->
          <ul class="df pay-select-priceList">
            <li class="borR" :class="{'displayInline': isDisplayInline(baseBs.orig_total) }">
              <div>{{$t('Dict.Receivable')}}</div>
              <span class="f24 realIncome" id="payOriginTotal">{{ baseBs.orig_total }}</span>
            </li>
            <li class= "borR" :class="{'displayInline': isDisplayInline(baseBs.orig_total) }">
              <div>{{$t('Dict.Offer')}}</div>
              <span class="fcb f24" id="payDiscTotal">{{ baseBs.disc_total }}</span>
            </li>
            <li class="borR" :class="{'displayInline': isDisplayInline(baseBs.orig_total) }">
              <div>{{$t('Dict.NetReceipts')}}</div>
                  <span class="fcg f24 realIncome" id="payLastTotal">{{ baseBs.last_total }}</span>
            </li>
            <li :class="{'displayInline': isDisplayInline(sumPayWayMoney) }">
              <div>{{$t('Dict.Receivables')}}</div>
              <span
                :class="{ 'realIncome' : sumPayWayMoney > 0 }">
                {{ sumPayWayMoney > 0 ? sumPayWayMoney: "" }}
              </span>
            </li>
            <li>
              <div>{{$t('Dict.GiveChange')}}</div>
              <span class="fcr realIncome">{{ giveChange }}</span>
            </li>
          </ul>
          <!-- 2.1.2 已添加结算方式 && 优惠方式 -->
          <div class="pay-selectedList">
            <RationDiscPrevOperation
              v-if="rationDiscOptSwitch"
              ref="rationDiscPrevOperation"
              :discSchemeData="rationDiscSchemeData"
              :postionData="rationDiscPosition"
              @rationDiscHandle="doRationDiscPrevOperation"
            ></RationDiscPrevOperation>
            <div class="division-div"
                 v-for="(items, index) in discAndPayWayData"
                 :key="index" v-autotest>
              <ul>
                <li class="tc cursorPointer"
                    :class="{
                    bcg: payWay.type == 2,
                    bcb: payWay.type == 1,
                    nextbcg: payWay.nextPage == 1
                  }"
                  v-for="(payWay, index2) in items"
                  :key="index2"
                  @click="cancelSelected(payWay, $event)">
                  <!--添加的优惠活动方式 type == 1 -->
                    <div
                      v-if="payWay.type == 1"
                      class="vertical-middle cursorPointer"
                    >{{
                      payWay.discTypeName
                    }}<br>{{
                      '[' +  $t('Dict.Reduce') + payWay.discMoney + ']'
                    }}</div>
                  <!--添加的结算方式 type == 2 -->
                    <div
                      v-else-if="payWay.type == 2"
                      class="vertical-middle cursorPointer"
                    >
                      <!--如果是现金的非本位币方式-->
                      <span v-if="payWay.allStandardData" class="is-standard">
                        <!--本位币的名称和金额，人民币100-->
                        <span>{{payWay.allStandardData.name + payWay.allStandardData.money}}</span>
                        <!--非本位币的名称和金额，[越南盾30000]-->
                        <span>[ {{
                          payWay.name + payWay.allStandardData.foreignCurrencyMoney
                        }} ]</span>
                      </span>
                      <!--结算方式入库后的外币结算方式，泰铢+会员卡-->
                      <span
                        v-else-if="payWay.payway_type_id === '501' && payWay.foreignCurrencyMoney"
                        class="is-standard"
                      >
                        <span>{{payWay.baseCurrencyName + payWay.take_money}}</span>
                        <span>[ {{payWay.name + payWay.foreignCurrencyMoney}} ]</span>
                      </span>
                      <span v-else>
                        {{
                          payWay.is_deposit === 1
                            ? $t('Dict.Btn.Deposit') + payWay.take_money
                            : payWay.name + payWay.take_money
                        }}
                      </span>
                    <!-- 这里专属挂账,显示关账账号使用,不做其他功能使用 -->
                    <p class="payoutsAccountName"
                       v-if="payWay.payway_type_id == 510"
                    >{{ payWay.accountName }}</p>
                    <span
                      v-if="payWay.payway_type_id == '507'"
                      class="pay-loading"
                    ></span>
                  </div>
                  <div v-else class="vertical-middle cursorPointer">
                    <span>{{ payWay.name }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- 优惠及结算功能区 -->
        <div class="pay-select-scheme df">
          <!-- 2.2 活动方案功能区(分页) -->
          <div class="active-scheme" ref="activeScheme">
            <!-- 2.2.1 活动方案-分页按钮 -->
            <div class="schemeTitle df" ref="schemeTitle">
              <span>{{$t('Dict.ProgrammeOfActivities')}}</span>
              <ul class="shemeCirclePagerBtn df">
                <li
                  v-for="(n, index) in pageData['discType'].allPage"
                  v-if="index < 3 && pageData['discType'].allPage > 1"
                  :class="['shemeCircleList' + index, { btnPageActive: n == shemePageOrder }]"
                  :key="index"
                  class="tc cursorPointer"
                  @click="pageForWard('discType', n)"
                >{{n}}</li>
                <li
                  v-if="pageData['discType'].allPage > 3"
                  class="tc cursorPointer shemeApostrophe"
                  :class="[{ btnPageActive:shemePageOrder > 3 }]"
                >...</li>
              </ul>
            </div>
            <div class="active-scheme-list">
              <!-- 2.2.2 活动方案-功能按钮 -->
              <ul id="discTypeList" class="division-div">
                <li
                  class="tc cursorPointer"
                  ref="activeSchemeLi"
                  v-for="(discType, index2) in discTypeList"
                  :key="index2"
                  @click="openDialogOrNextPageDiscType(discType, 'discType')">
                  <div class="midpoint"
                    :class="calcDisPayBtnTxtStyle(
                      discType.name
                        ? discType.name
                        : discType.discTypeName,
                      discType.shortKey,
                      'disPlanBtn',
                    )">
                    <!-- 按钮显示内容 做分组样式 -->
                    <p :class="calcDisPayBtnTxtStyle(
                        discType.name
                          ? discType.name
                          : discType.discTypeName,
                        discType.shortKey,
                        'btnTxt',
                      )">{{
                        discType.isGroup ? '&lt;': '' }}{{
                        discType.name ? discType.name : discType.discTypeName }}{{
                        discType.isGroup ? '&gt;': ''
                      }}</p>
                    <p :class="calcDisPayBtnTxtStyle(
                        discType.name
                          ? discType.name
                          : discType.discTypeName,
                        discType.shortKey,
                        'hotkey',
                      )">{{
                        discType.shortKey ? 'ctrl+' + discType.shortKey : ''
                      }}</p>
                  </div>
                </li>
              </ul>
              <!-- 写死添加了"上一页""Home""下一页"按钮,并添加相应功能, 样式固定底部 -->
              <ul class="division-div division-div-fixed">
                <li class="tc cursorPointer"
                  @click="turnPageDiscAndPayWay(-1, 'discType')">
                  <div class="midpoint disPlanBtn">
                    <p class="btnTxt">{{$t('Dict.Btn.PreviousPage')}}</p>
                    <p class="hotkey">ctrl+↑</p>
                  </div>
                </li>
                <li class="tc cursorPointer">
                  <div
                    class="midpoint disPlanBtn"
                    v-show="discTypeGroupBack"
                    @click="turnPageDiscAndPayWay(0, 'discType')">
                    <p class="btnTxt">{{$t('Dict.Btn.Back')}}</p>
                    <p class="hotkey">ctrl+Home</p>
                  </div>
                </li>
                <li class="tc cursorPointer"
                  @click="turnPageDiscAndPayWay(1, 'discType')">
                  <div class="midpoint disPlanBtn">
                    <p class="btnTxt">{{$t('Dict.Btn.NextPage')}}</p>
                    <p class="hotkey">ctrl+↓</p>
                  </div>
                </li>
              </ul>
              <!-- 2.2.3 活动方案-搜索组件 -->
              <SearchDisPlan
                ref="searchDisPlan"
                v-if="searchDisPlanShow"
                @search="onSearchDisPlan"
                @resetHandler="resetSearchDisPlanPaging"></SearchDisPlan>
            </div>
          </div>
          <!-- 2.3 结算功能区(分页) -->
          <div class="active-scheme noMarginR">
            <!-- 2.3.1 结算方式-分页按钮 -->
            <div class="schemeTitle df">
              <span>{{$t('Dict.SettlementMethod')}}</span>
              <ul class="shemeCirclePagerBtn df">
                <li
                  class="tc cursorPointer"
                  :class="['payWayCircleList' + index, { btnPageActive: n == payWayPageOrder }]"
                  v-for="(n, index) in pageData['payWayType'].allPage"
                  v-if="index < 3 && pageData['payWayType'].allPage > 1"
                  :key="index"
                  @click="pageForWard('payWayType', n)">{{ n }}</li>
                <li
                  v-if="pageData['payWayType'].allPage > 3"
                  class="tc cursorPointer payWayApostrophe"
                  :class="[{ btnPageActive:payWayPageOrder > 3 }]"
                >...</li>
              </ul>
            </div>
            <!-- 2.3.2 结算方式-功能按钮 -->
            <div class="active-scheme-list">
              <!-- 竖着排结算方式 -->
              <!-- <div class="division-div" v-for="(items, index) in payWayList"  :key="index">
                  <ul>
                    <li class="tc cursorPointer"
                      v-for="(payWay, index2) in items"
                      :key="index2"
                      @click="openDialogOrNextPagePayWay(payWay,'payWayType')">
                     <div class="midpoint">
                      {{payWay.name}}
                     </div>
                    </li>
                  </ul>
              </div>-->
              <!-- 横着排 -->
              <ul id="payWayTypeList" class="division-div">
                <li
                  class="tc cursorPointer"
                  v-for="(payWay, index2) in payWayList"
                  :key="index2"
                  @click="openDialogOrNextPagePayWay(payWay, 'payWayType')">
                  <div class="midpoint"
                    :class="calcDisPayBtnTxtStyle(
                      payWay.name,
                      payWay.short_key,
                      'disPlanBtn',
                    )">
                    <!-- 按钮显示内容 做分组样式 -->
                    <p :class="calcDisPayBtnTxtStyle(
                        payWay.name,
                        payWay.short_key,
                        'btnTxt',
                      )">{{ payWay.isGroup ? `&lt;${payWay.name}&gt;`: payWay.name }}</p>
                    <p :class="calcDisPayBtnTxtStyle(
                        payWay.name,
                        payWay.short_key,
                        'hotkey',
                      )">{{ payWay.short_key }}</p>
                  </div>
                </li>
              </ul>
              <!-- 写死添加了"上一页""Home""下一页"按钮,并添加相应功能, 样式固定底部 -->
              <ul class="division-div division-div-fixed">
                <li class="tc cursorPointer"
                  @click="turnPageDiscAndPayWay(-1, 'payWayType')">
                  <div class="midpoint disPlanBtn">
                    <p class="btnTxt">{{$t('Dict.Btn.PreviousPage')}}</p>
                    <p class="hotkey">↑</p>
                  </div>
                </li>
                <li class="tc cursorPointer">
                  <div class="midpoint disPlanBtn"
                    v-show="payWayTypeGroupBack"
                    @click="turnPageDiscAndPayWay(0, 'payWayType')">
                    <p class="btnTxt">{{$t('Dict.Btn.Back')}}</p>
                    <p class="hotkey">Home</p>
                  </div>
                </li>
                <li class="tc cursorPointer"
                  @click="turnPageDiscAndPayWay(1, 'payWayType')">
                  <div class="midpoint disPlanBtn">
                    <p class="btnTxt">{{$t('Dict.Btn.NextPage')}}</p>
                    <p class="hotkey">↓</p>
                  </div>
                </li>
              </ul>
              <!-- 2.3.3 结算-搜索组件 -->
              <SearchPay
                ref="searchPayway"
                v-if="searchPayShow"
                @search="onSearch"
                @resetHandler="resetSearchPaywayPaging"></SearchPay>
            </div>
          </div>
        </div>
      </div>
      <!-- 3. 结算页面-底部功能区(各个组件) -->
      <!-- 3.1 容器组件 -->
      <PayBottomBtn
        ref="payBottomBtn"
        :bs-data="baseBs"
        :billData='billData'
        :buffetDataForSettle="buffetDataForSettle"
        :wipeState="wipeState"
        :depositMoney="depositMoney"
        :invoicesOpened="invoicesOpened"
        :settleType="settleType"
        :isTeamBill="isTeamBill"
        @payFunction="payFunction"
        @payNoDialogFunction="payNoDialogFunction"></PayBottomBtn>
      <!-- 3.2 (各个)附加功能组件 -->
      <PayDeposit
        ref="payDesposit"
        :point-id="resData.pointId"
        :bs-data="baseBs"
        :bookOrderSource="bookOrderSource"
        @deposit="deposit"
        @usedeposit="useDeposit"></PayDeposit>
      <PayOnlinePayment
        ref="payOnlinePayment"></PayOnlinePayment>
      <PaySettlementNote
        ref="paySettlementNote"
        :settlementRemarkInfo="settlementRemarkInfo"
        @settlementremark="settlementRemark"></PaySettlementNote>
      <PayDrawInvoice
        ref="payDrawInvoice"
        :bs-data="baseBs"
        :electronicInvoiceData="electronicInvoiceData"
        @drawInvoice="drawInvoice"></PayDrawInvoice>
      <PayMoneyBox
        ref="payMoneyBox"></PayMoneyBox>
      <PayMore
        ref="payMore"
        :prePayBtnBusinessType="prePayBtnBusinessType"
        :bs-data="baseBs"
        :billData="billData"
        :buffetDataForSettle="buffetDataForSettle"
        :wipeState="wipeState"
        :depositMoney="depositMoney"
        :invoicesOpened="invoicesOpened"
        :isTeamBill="isTeamBill"
        @payNoDialogFunction="payNoDialogFunction"
        @payFunction="payFunction"
        @payPayAdvance="payPayAdvance"
        @undoPayPayAdvance="undoPayPayAdvance"
        @payWithdrawDeposit="payWithdrawDeposit"></PayMore>
      <PayServiceCharge
        ref="payServiceCharge"
        @currentServiceMoney="serviceMoney"></PayServiceCharge>
      <PayMinimumConsumption
        ref="payMinimumConsumption"
        @minimumConsumption="minimumConsumption"></PayMinimumConsumption>
      <PayGroupLightIntegral
        :point-id="resData.pointId"
        :bs-data="baseBs"
        ref="payGroupLightIntegral"></PayGroupLightIntegral>
    </div>
    <!-- 4. 结算-结算相关弹窗或第三方结算功能(各个组件) -->
    <PayWayBanquetModal
      ref="payWayBanquetModal"
      :amount-to-be-paid="amountToBePaid"
      :bs-data="baseBs"
      @add-pay-way="addPayWay"></PayWayBanquetModal>
    <PayWayRunModal
      ref="payWayRunModal"
      :amount-to-be-paid="amountToBePaid"
      :bs-data="baseBs"
      @add-pay-way="addPayWay"></PayWayRunModal>
    <PayWayCheckModal
      ref="payWayCheckModal"
      :amount-to-be-paid="amountToBePaid"
      :bs-data="baseBs"
      @add-pay-way="addPayWay"></PayWayCheckModal>
    <PayWayVoucherModal
      ref="payWayVoucherModal"
      :amount-to-be-paid="amountToBePaid"
      :currPayWayList="haveUsePayWay"
      :bs-data="baseBs"
      :is-bill-win="false"
      :amount-paid="sumPayWayMoney"
      @add-pay-way="addPayWay"></PayWayVoucherModal>
    <PayWayPayoutsModal
      ref="payWayPayoutsModal"
      :amount-to-be-paid="amountToBePaid"
      :bs-data="baseBs"
      @add-pay-way="addPayWay"></PayWayPayoutsModal>
    <PayWayGroupPayoutsModal
      ref="payWayGroupPayoutsModal"
      :amount-to-be-paid="amountToBePaid"
      :point-id="resData.pointId"
      :bs-data="baseBs"
      :isSelectTeamBtn="isSelectTeamBtn"
      @componentGetPayWayList="componentGetPayWayList"
      @operate-group-payouts="operateGroupPayouts"
      @add-pay-way="addPayWay"></PayWayGroupPayoutsModal>
    <PayWayBankModal
      ref="payWayBankModal"
      :amount-to-be-paid="amountToBePaid"
      :bs-data="baseBs"
      @add-pay-way="addPayWay"></PayWayBankModal>
    <PayWayRMBModal
      ref="payWayRMBModal"
      :amount-to-be-paid="amountToBePaid"
      :actualPay="sumPayWayMoney"
      :bsId="baseBs.id"
      :teamBsIds="baseBs.teamBsIds"
      :pointId="resData.pointId"
      @add-pay-way="addPayWay"></PayWayRMBModal>
    <PayWayOneChopstickModal
      ref="payWayOneChopstickModal"
      :amount-to-be-paid="amountToBePaid"
      :bs-data="baseBs"
      @refreshBill="refreshBill"></PayWayOneChopstickModal>
    <PayWayCoucouModal
      ref="payWayCoucouModal"
      :bs-data="baseBs"
      @refreshBill="refreshBill"></PayWayCoucouModal>
    <PayWayMeituanGroupVoucher
      ref="PayWayMeituanGroupVoucher"
      :amount-to-be-paid="amountToBePaid"
      :bs-data="baseBs"
      @refreshBill="refreshBill"></PayWayMeituanGroupVoucher>
    <PayWayMinChenMembershipCard
      ref="PayWayMinChenMembershipCard"
      :amount-to-be-paid="amountToBePaid"
      :bs-data="baseBs"
      @refreshBill="refreshBill"></PayWayMinChenMembershipCard>
    <MinChenVerifyTicket
      ref="MinChenVerifyTicket"
      :pointId="resData.pointId"
      :bsId="baseBs.id"
      @refreshBill="refreshBill"></MinChenVerifyTicket>
    <AllSinglePreferential
      ref="AllSinglePreferential"
      :payThenDiscountFlg="payThenDiscountFlg"
      :currPayWayList="haveUsePayWay"
      :pointId="resData.pointId"
      :bsId="baseBs.id"
      @getPayThenDiscParams="payThenDiscBizParams"></AllSinglePreferential>
    <CategoryPreference
      ref="CategoryPreference"
      :payThenDiscountFlg="payThenDiscountFlg"
      :currPayWayList="haveUsePayWay"
      :pointId="resData.pointId"
      :bsId="baseBs.id"
      @getPayThenDiscParams="payThenDiscBizParams"></CategoryPreference>
    <Discount
      ref="Discount"
      :payThenDiscountFlg="payThenDiscountFlg"
      :currPayWayList="haveUsePayWay"
      :currDiscRule="currDiscRule"
      :pointId="resData.pointId"
      :bsId="baseBs.id"
      @getPayThenDiscParams="payThenDiscBizParams"></Discount>
    <FullSubtraction
      ref="FullSubtraction"
      :currPayWayList="haveUsePayWay"
      :pointId="resData.pointId"
      :bsId="baseBs.id"
      @getPayThenDiscParams="payThenDiscBizParams"></FullSubtraction>
    <ProportionPreferential
      ref="ProportionPreferential"
      submitId="proportionPreferential"
      :payThenDiscountFlg="payThenDiscountFlg"
      :currPayWayList="haveUsePayWay"
      :pointId="resData.pointId"
      :bsId="baseBs.id"
      @getPayThenDiscParams="payThenDiscBizParams"></ProportionPreferential>
    <Ration
      ref="Ration"
      :pointId="resData.pointId"
      :bsId="baseBs.id"></Ration>
    <RationDiscount
      ref="rationDiscount"
      :pointId="resData.pointId"
      :bsId="baseBs.id"></RationDiscount>
    <SingleProductDiscount
      ref="SingleProductDiscount"
      :pointId="resData.pointId"
      :bsId="baseBs.id"></SingleProductDiscount>
    <CouponDisc
      ref="couponDisc"
      :pointId="resData.pointId"
      :bsId="baseBs.id"></CouponDisc>
    <ScanCode
      ref="ScanCode"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payMoneyBox="payMoneyBox"
      @clearOnlinePayWay="clearOnlinePayWayAndRefreshBill"></ScanCode>
    <WeChatPaymentCode
      ref="WeChatPaymentCode"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payMoneyBox="payMoneyBox"
      @clearOnlinePayWay="clearOnlinePayWayAndRefreshBill"></WeChatPaymentCode>
    <WeChatQRCode
      ref="WeChatQRCode"
      @closeQRcodeFun="closeQRcodeFun"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payPreformPrint="payPreformPrint"></WeChatQRCode>
    <AlipayQRCode
      ref="AlipayQRCode"
      @closeQRcodeFun="closeQRcodeFun"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payPreformPrint="payPreformPrint"></AlipayQRCode>
    <AlipayPaymentCode
      ref="AlipayPaymentCode"
      @doPrint="printSettleBill"
      @cancelPay="cancelTongLianPayWay"
      @tongLianManualSettle="tongLianManualSettle"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payMoneyBox="payMoneyBox"
      @clearOnlinePayWay="clearOnlinePayWayAndRefreshBill"></AlipayPaymentCode>
    <TongLianPaymentCode
      ref="TongLianPaymentCode"
      :loading="componentsLoading"
      @refreshBill="refreshBill"
      @tongLianManualSettle="tongLianManualSettle"
      @tongLianEnforceSettle="tongLianEnforceSettle"
      @clearOnlinePayWay="clearOnlinePayWayAndRefreshBill"></TongLianPaymentCode>
    <ShekHuiPaymentCode
      ref="ShekHuiPaymentCode"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payMoneyBox="payMoneyBox"
      @clearOnlinePayWay="clearOnlinePayWayAndRefreshBill"></ShekHuiPaymentCode>
    <ShekHuiQRCode
      ref="ShekHuiQRCode"
      @closeQRcodeFun="closeQRcodeFun"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payPreformPrint="payPreformPrint"></ShekHuiQRCode>
    <UnionPayQRCode
      ref="UnionPayQRCode"
      @closeQRcodeFun="closeQRcodeFun"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payPreformPrint="payPreformPrint"></UnionPayQRCode>
    <UnionPayPaymentCode
      ref="UnionPayPaymentCode"
      @enforceSettle="enforceSettle"
      @manualSettle="manualSettle"
      @payMoneyBox="payMoneyBox"
      @clearOnlinePayWay="clearOnlinePayWayAndRefreshBill"></UnionPayPaymentCode>
    <FeiZPaymentCode
      ref="feiZPaymentCode"
      @clearOnlinePayWay="clearOnlinePayWayAndRefreshBill"></FeiZPaymentCode>
    <LockBill
      ref="LockBill"
      :baseBsdata="baseBs"
      @onClose="normalCloseHandler"></LockBill>
    <PayWayMembershipCard
      ref="PayWayMembershipCard"
      @crmSettle="crmSettle"
      @cancelCrmSettle="cancelCrmSettle"></PayWayMembershipCard>
    <PayWayMembershipCardCrm7
      ref="PayWayMembershipCardCrm7"
      @crmSettle="crmSettle"
      @cancelCrmSettle="cancelCrmSettle"
      @refreshBill="refreshBill"></PayWayMembershipCardCrm7>
    <MemberCardPaymentInfo
      ref="memberCardPaymentInfo"></MemberCardPaymentInfo>
    <MoneyBoxModal
      ref="moneyBoxModal"></MoneyBoxModal>
    <TransferRoomAccount
      ref="transferRoomAccount"
      :amount-to-be-paid="amountToBePaid"
      @add-pay-way="addPayWay"></TransferRoomAccount>
    <PayWayRGJcrm
      ref="payWayRGJcrm"
      :amount-to-be-paid="amountToBePaid"
      @add-pay-way="addPayWay"
      @refreshBill="refreshBill"></PayWayRGJcrm>
    <PayWayTwitterLifeModal
      ref="PayWayTwitterLifeModal"
      :amount-to-be-paid="amountToBePaid"
      :actualPay="sumPayWayMoney"
      :bsId="baseBs.id"
      :teamBsIds="baseBs.teamBsIds"
      :pointId="resData.pointId"
      @add-pay-way="addPayWay"
      @refreshBill="refreshBill"></PayWayTwitterLifeModal>
    <PayWayFishCoolModal
      ref="PayWayFishCoolModal"
      :amount-to-be-paid="amountToBePaid"
      :payWayList="haveUsePayWay"
      :discTypeList="discTypeList"
      :actualPay="sumPayWayMoney"
      :bsId="baseBs.id"
      :teamBsIds="baseBs.teamBsIds"
      :pointId="resData.pointId"
      :payThenDiscountFlg="payThenDiscountFlg"
      @add-pay-way="addPayWay"
      @cancelSettle="cancelSettle"
      @refreshBill="refreshBill"></PayWayFishCoolModal>
    <PayWayGroupLightMembershipCard
      ref="payWayGroupLightMembershipCard"
      :amount-to-be-paid="amountToBePaid"
      :bsId="baseBs.id"
      :pointId="resData.pointId"
      @refreshBill="refreshBill"></PayWayGroupLightMembershipCard>
    <PayWayGroupLightVoucher
      ref="payWayGroupLightVoucher"
      :bs-data="baseBs"
      :amount-to-be-paid="amountToBePaid"
      :bsId="baseBs.id"
      :pointId="resData.pointId"
      @refreshBill="refreshBill"></PayWayGroupLightVoucher>
    <BilledTourGuideFee
      ref="billedTourGuideFee"
      @billedTourGuideFee="billedTourGuideFee"></BilledTourGuideFee>
    <PayWaySSDDepositModal
      ref="payWaySSDDeposit"
      :bs-data="baseBs"
      :pointId="resData.pointId"
      :teamBsIds="baseBs.teamBsIds"
      :isSelectTeamBtn="isSelectTeamBtn"
      :amount-to-be-paid="amountToBePaid"
      @componentGetPayWayList="componentGetPayWayList"></PayWaySSDDepositModal>
    <!--线上部分退-->
    <el-dialog
      class="online-revoke"
      :title="$t('Dict.Tips')"
      :visible.sync="showConfirmDialog"
      :modal="false"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="30vh"
      width="400px">
      <div class="dialog-top">
        <div class="el-message-box__status el-icon-warning"></div>
        <h3 style="text-align: center; font-size: 15px; font-weight: bold;">{{
          $t('Biz.Settlement.ChooseDeleteType')
        }}</h3>
      </div>
      <div class="dialog-bottom">
        <div class="btn-wrap">
          <el-button
            type="default"
            @click="revokeMoney"
          >{{ $t('Biz.Settlement.Return101') }}</el-button>
          <span v-if="deletePayWayData">({{
            $t('Biz.Settlement.Return102')
          }}{{
            revokeFactMoney
          }})</span>
        </div>
        <div class="btn-wrap">
          <el-button type="primary" @click="deleteOnlinePayRevoke">{{$t('Dict.Delete')}}</el-button>
          <span>{{$t('Biz.Settlement.DeleteAndReturnAll')}}</span>
        </div>
      </div>
    </el-dialog>
  </AllSrceenDialog>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import {
  // filter,
  indexOf,
  findIndex,
  // includes,
  chunk,
  extend,
  sortBy,
  find,
  isNaN,
  cloneDeep,
  each,
  isBoolean,
  isEmpty,
  isEqual,
  differenceWith,
} from 'lodash';
import { Loading } from 'element-ui';
import { sub, round, add } from '@/common/js/math';
import ajax from '@/common/js/ajax';
import AllSrceenDialog from '@/components/Pos/Common/AllSrceenDialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import SearchPay from '@/components/Pos/Order/Tables/SearchPay';
import SearchDisPlan from '@/components/Pos/Order/Tables/SearchDisPlan';
import * as tableState from '@/common/dictionary/pos-order-table-state';
import quickSearch from '@/common/js/quicksearch';
import PayGuestSeatMsg from './PayGuestSeatMsg';
import PayBottomBtn from './PayBottomBtn';

// 异步加载组件
// 结算-宴请
const PayWayBanquetModal = (resolve) => {
  import('./components/PayWayBanquetModal').then((module) => {
    resolve(module);
  });
};
// 结算-跑单
const PayWayRunModal = (resolve) => {
  import('./components/PayWayRunModal').then((module) => {
    resolve(module);
  });
};
// 结算-支票
const PayWayCheckModal = (resolve) => {
  import('./components/PayWayCheckModal').then((module) => {
    resolve(module);
  });
};
// 结算-代金券
const PayWayVoucherModal = (resolve) => {
  import('./components/PayWayVoucherModal').then((module) => {
    resolve(module);
  });
};
// 结算-挂账
const PayWayPayoutsModal = (resolve) => {
  import('./components/PayWayPayoutsModal').then((module) => {
    resolve(module);
  });
};
// 结算-集团挂账
const PayWayGroupPayoutsModal = (resolve) => {
  import('./components/PayWayGroupPayoutsModal').then((module) => {
    resolve(module);
  });
};
// 结算-银行卡
const PayWayBankModal = (resolve) => {
  import('./components/PayWayBankModal').then((module) => {
    resolve(module);
  });
};
// 结算-人民币
const PayWayRMBModal = (resolve) => {
  import('./components/PayWayRMBModal').then((module) => {
    resolve(module);
  });
};
// 结算-一筷捞
const PayWayOneChopstickModal = (resolve) => {
  import('./components/PayWayOneChopstickModal').then((module) => {
    resolve(module);
  });
};
// 结算-凑凑
const PayWayCoucouModal = (resolve) => {
  import('./components/PayWayCoucouModal').then((module) => {
    resolve(module);
  });
};
// 美团点评 团购
const PayWayMeituanGroupVoucher = (resolve) => {
  import('./components/PayWayMeituanGroupVoucher').then((module) => {
    resolve(module);
  });
};
// 冥晨会员卡
const PayWayMinChenMembershipCard = (resolve) => {
  import('./components/PayWayMinChenMembershipCard').then((module) => {
    resolve(module);
  });
};
// 冥晨验券
const MinChenVerifyTicket = (resolve) => {
  import('./ActiveChildDialog/MinChenVerifyTicket').then((module) => {
    resolve(module);
  });
};
// 全单优惠
const AllSinglePreferential = (resolve) => {
  import('./ActiveChildDialog/AllSinglePreferential').then((module) => {
    resolve(module);
  });
};
// 类别优惠
const CategoryPreference = (resolve) => {
  import('./ActiveChildDialog/CategoryPreference').then((module) => {
    resolve(module);
  });
};
// 折扣优惠
const Discount = (resolve) => {
  import('./ActiveChildDialog/Discount').then((module) => {
    resolve(module);
  });
};
// 满减优惠
const FullSubtraction = (resolve) => {
  import('./ActiveChildDialog/FullSubtraction').then((module) => {
    resolve(module);
  });
};
// 比例优惠
const ProportionPreferential = (resolve) => {
  import('./ActiveChildDialog/ProportionPreferential').then((module) => {
    resolve(module);
  });
};
// 手工定额
const Ration = (resolve) => {
  import('./ActiveChildDialog/Ration').then((module) => {
    resolve(module);
  });
};
// 单品优惠
const SingleProductDiscount = (resolve) => {
  import('./ActiveChildDialog/SingleProductDiscount').then((module) => {
    resolve(module);
  });
};
// 优惠券方案
const CouponDisc = (resolve) => {
  import('./ActiveChildDialog/CouponDisc').then((module) => {
    resolve(module);
  });
};
// 定额优惠
const RationDiscount = (resolve) => {
  import('./ActiveChildDialog/RationDiscount').then((module) => {
    resolve(module);
  });
};
// 定额优惠-删除 || 修改 操作
const RationDiscPrevOperation = (resolve) => {
  import('./ActiveChildDialog/RationDiscPrevOperation.vue').then((module) => {
    resolve(module);
  });
};
// 押金
const PayDeposit = (resolve) => {
  import('./PayBottomBtns/PayDeposit').then((module) => {
    resolve(module);
  });
};
// 食尚订订金
const PayWaySSDDepositModal = (resolve) => {
  import('./components/PayWaySSDDepositModal').then((module) => {
    resolve(module);
  });
};
// 线上支付查询
const PayOnlinePayment = (resolve) => {
  import('./PayBottomBtns/PayOnlinePayment').then((module) => {
    resolve(module);
  });
};
// 结算备注
const PaySettlementNote = (resolve) => {
  import('./PayBottomBtns/PaySettlementNote').then((module) => {
    resolve(module);
  });
};
// 开发票
const PayDrawInvoice = (resolve) => {
  import('./PayBottomBtns/PayDrawInvoice').then((module) => {
    resolve(module);
  });
};
// 开钱箱
const PayMoneyBox = (resolve) => {
  import('./PayBottomBtns/PayMoneyBox').then((module) => {
    resolve(module);
  });
};
// 更多模块
const PayMore = (resolve) => {
  import('./PayBottomBtns/PayMore').then((module) => {
    resolve(module);
  });
};
// 服务费
const PayServiceCharge = (resolve) => {
  import('./PayBottomBtns/PayServiceCharge').then((module) => {
    resolve(module);
  });
};
// 最低消费
const PayMinimumConsumption = (resolve) => {
  import('./PayBottomBtns/PayMinimumConsumption').then((module) => {
    resolve(module);
  });
};
// 群光积分
const PayGroupLightIntegral = (resolve) => {
  import('./PayBottomBtns/PayGroupLightIntegral').then((module) => {
    resolve(module);
  });
};
// 微信支付码
const WeChatPaymentCode = (resolve) => {
  import('./PaymentCode/WeChatPaymentCode').then((module) => {
    resolve(module);
  });
};
// 微信+支付宝二码合一超级无敌付款码
const ScanCode = (resolve) => {
  import('./PaymentCode/ScanCode').then((module) => {
    resolve(module);
  });
};
// 微信二维码
const WeChatQRCode = (resolve) => {
  import('./PaymentCode/WeChatQRCode').then((module) => {
    resolve(module);
  });
};
// 支付宝二维码
const AlipayQRCode = (resolve) => {
  import('./PaymentCode/AlipayQRCode').then((module) => {
    resolve(module);
  });
};
// 支付宝付款码
const AlipayPaymentCode = (resolve) => {
  import('./PaymentCode/AlipayPaymentCode').then((module) => {
    resolve(module);
  });
};
// 通联银行卡
const TongLianPaymentCode = (resolve) => {
  import('./PaymentCode/TongLianPaymentCode').then((module) => {
    resolve(module);
  });
};
// 闪惠付款码
const ShekHuiPaymentCode = (resolve) => {
  import('./PaymentCode/ShekHuiPaymentCode').then((module) => {
    resolve(module);
  });
};
// 闪惠二维码
const ShekHuiQRCode = (resolve) => {
  import('./PaymentCode/ShekHuiQRCode').then((module) => {
    resolve(module);
  });
};
// 云闪付二维码
const UnionPayQRCode = (resolve) => {
  import('./PaymentCode/UnionPayQRCode').then((module) => {
    resolve(module);
  });
};
// 云闪付支付码
const UnionPayPaymentCode = (resolve) => {
  import('./PaymentCode/UnionPayPaymentCode').then((module) => {
    resolve(module);
  });
};
// 菲滋付支
const FeiZPaymentCode = (resolve) => {
  import('./PaymentCode/FeiZPaymentCode').then((module) => {
    resolve(module);
  });
};
// 锁单
const LockBill = (resolve) => {
  import('./LockBill').then((module) => {
    resolve(module);
  });
};
// 会员卡
const PayWayMembershipCard = (resolve) => {
  import('./components/PayWayMembershipCard').then((module) => {
    resolve(module);
  });
};
// 会员卡
const PayWayMembershipCardCrm7 = (resolve) => {
  import('./components/PayWayMembershipCardCrm7').then((module) => {
    resolve(module);
  });
};
// 会员卡结算信息弹窗
const MemberCardPaymentInfo = (resolve) => {
  import('./components/MemberCardPaymentInfo').then((module) => {
    resolve(module);
  });
};
// 开钱箱
const MoneyBoxModal = (resolve) => {
  import('@/components/Pos/More/MoneyBoxModal').then((module) => {
    resolve(module);
  });
};
// 结算-转房账
const TransferRoomAccount = (resolve) => {
  import('./components/TransferRoomAccount').then((module) => {
    resolve(module);
  });
};
// 结算-荣管家会员卡
const PayWayRGJcrm = (resolve) => {
  import('./components/PayWayRGJcrm').then((module) => {
    resolve(module);
  });
};
// 结算-微生活
const PayWayTwitterLifeModal = (resolve) => {
  import('./components/PayWayTwitterLifeModal').then((module) => {
    resolve(module);
  });
};
// 结算-鱼酷
const PayWayFishCoolModal = (resolve) => {
  import('./components/PayWayFishCoolModal').then((module) => {
    resolve(module);
  });
};
// 结算-群光会员卡
const PayWayGroupLightMembershipCard = (resolve) => {
  import('./components/PayWayGroupLightMembershipCard').then((module) => {
    resolve(module);
  });
};
// 结算-群光优惠券结算
const PayWayGroupLightVoucher = (resolve) => {
  import('./components/PayWayGroupLightVoucher').then((module) => {
    resolve(module);
  });
};
// 导游提成
const BilledTourGuideFee = (resolve) => {
  import('../../../More/components/BilledTourGuideFee').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    AllSrceenDialog,
    SearchPay,
    SearchDisPlan,
    PayBottomBtn,
    PayGuestSeatMsg,
    PayWayBanquetModal,
    PayWayCheckModal,
    PayWayVoucherModal,
    PayWayPayoutsModal,
    PayWayGroupPayoutsModal,
    PayWayBankModal,
    PayWayRMBModal,
    PayWayOneChopstickModal,
    PayWayCoucouModal,
    PayWayMeituanGroupVoucher,
    PayWayMinChenMembershipCard,
    AllSinglePreferential,
    CategoryPreference,
    Discount,
    FullSubtraction,
    ProportionPreferential,
    Ration,
    RationDiscount,
    RationDiscPrevOperation,
    SingleProductDiscount,
    CouponDisc,
    PayWayRunModal,
    PayDeposit,
    PayWaySSDDepositModal,
    PayOnlinePayment,
    PaySettlementNote,
    PayDrawInvoice,
    PayMoneyBox,
    PayMore,
    PayServiceCharge,
    PayMinimumConsumption,
    PayGroupLightIntegral,
    ScanCode,
    WeChatPaymentCode,
    WeChatQRCode,
    AlipayQRCode,
    AlipayPaymentCode,
    TongLianPaymentCode,
    ShekHuiPaymentCode,
    ShekHuiQRCode,
    UnionPayQRCode,
    UnionPayPaymentCode,
    LockBill,
    PayWayMembershipCard,
    PayWayMembershipCardCrm7,
    MemberCardPaymentInfo,
    MoneyBoxModal,
    TransferRoomAccount,
    PayWayRGJcrm,
    MinChenVerifyTicket,
    PayWayTwitterLifeModal,
    PayWayFishCoolModal,
    PayWayGroupLightMembershipCard,
    PayWayGroupLightVoucher,
    BilledTourGuideFee,
    FeiZPaymentCode,
  },
  mixins: [DialogMixin],
  data() {
    return {
      payLoading: null,
      getSettlement: {}, // 结算界面数据
      // 流水数据
      baseBs: {},
      bookOrderSource: [], // 客必得预定客位
      sumPayWayMoney: 0, // 收款金额
      // 圆形按钮-选中后背景样式
      circleBack1: { background: '#5d7e96', color: '#fff' },
      // 圆形按钮-取消选中后背景样式
      circleBack2: { background: '#40637e', color: '#868d93' },
      // 折扣优惠分组的退出按钮显示状态
      discTypeGroupBack: false,
      // 结算方式分组的退出按钮显示状态
      payWayTypeGroupBack: false,
      // 优惠类型数据
      discTypeList: [],
      // 活动方案-热键数据
      hotDisPlanList: [],
      // 所有已使用的结算方式
      haveUsePayWay: [],
      // 新添加的结算方式
      newAddPayWayList: [],
      // 结算方式数据
      hotPayWayList: [],
      // 结算分页显示数据
      payWayList: [],
      // 账单数据
      billData: {},
      // 当前结算-抹零功能状态
      wipeState: {
        state: null,
        operable: null,
      },
      // 当前页已用优惠和结算方式
      discAndPayWayData: [],
      // 分页
      pageData: {
        discType: {
          // 当前页
          currentPage: 0,
          // 总页数
          allPage: 1,
          // 显示的列数目
          displayColNum: 3,
          // 每一列的数目
          colElementNum: 7,
          // 数据总数
          dataTotal: 0,
          // 优惠类型集合
          dataList: [],
          // 接口原始数据
          origDataList: [],
        },
        payWayType: {
          // 当前页
          currentPage: 0,
          // 总页数
          allPage: 1,
          // 显示的列数目
          displayColNum: 3,
          // 每一列的数目
          colElementNum: 7,
          // 数据总数
          dataTotal: 0,
          // 支付方式数据
          dataList: [],
          // 接口原始数据
          origDataList: [],
        },
        useDiscAndPayWayType: {
          // 当前页
          currentPage: 0,
          // 总页数
          allPage: 1,
          // 显示的列数目
          displayColNum: 4,
          // 每一列的数目
          colElementNum: 2,
          // 数据总数
          dataTotal: 0,
          // 已用优惠和结算方式集合
          dataList: [],
          // 接口原始数据
          origDataList: [],
        },
      },
      // discTypeConst: {
      //   4: '全单优惠',
      //   5: '类别优惠',
      //   2: '折扣方案优惠',
      //   '-3': '满减优惠',
      //   1: '比例优惠',
      //   '-1': '手工定额',
      //   3: '单品优惠',
      // },
      // 活动方案-discTypeId对应业务类型数据对象(字典)
      discTypeDialog: {
        // 4: '全单优惠',
        4: 'AllSinglePreferential',
        // 5: '类别优惠',
        5: 'CategoryPreference',
        // 2: '折扣方案优惠',包含:普通打折方案,N杯打折,定额优惠方案,优惠券方案,满减(品项) 共5种
        2: 'Discount',
        // '-3': '满减优惠',
        '-3': 'FullSubtraction',
        // 1: '比例优惠',
        1: 'ProportionPreferential',
        // '-1': '手工定额',
        '-1': 'Ration',
        // 3: '单品优惠',
        3: 'SingleProductDiscount',
        6: 'MinChenVerifyTicket',
      },
      resData: '',
      lastSubtotal: 0,
      invoicesOpened: 0, // 开发票
      currentServiceMoney: 0, // 服务费
      minimumConsumptionData: null, // 最低消费
      depositMoney: 0, // 押金回显
      settlementRemarkInfo: '', // 结算备注
      invoiceRemark: '', // 开票备注
      machineInvoice: 0, // 机打发票
      handInvoice: 0, // 手撕发票
      electronicInvoiceData: {}, // 电子发票业务基础数据
      // isElectronicInvoice:false,//是否开启了电子发票
      dataLoadCompleteSettle: false,
      dataLoadComplteDiscoutAndPayWay: false,
      title: `${this.$t('Dict.Btn.Settlement')}`,
      headerTitle: '',
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 1, // 是否是团队账单
      isSelectTeamBtn: false, // 是否勾选团队结算按钮默认不勾选为false
      businessType: 1,
      prePayBtnBusinessType: 0,
      onlineClearData: [30, 32, 33, 17, 5, 4, 10, 19, 24, 25, 26, 31, 37, 46, 48], // 二维码和付款码 支付方式id
      SETTLE_LOCK_INTERVAL: null, // 结算锁定定时
      testTops: '0px', // 页面top值
      payHeight: '0px', // 页面高度值
      payWay: {}, // 点击的结算方式
      MeituanGiveMoney: false, // 美团券是否找零
      shemePageOrder: 1, // 活动方案和结算方式翻页按钮选中
      payWayPageOrder: 1, // 活动方案和结算方式翻页按钮选中
      paymentGetBillData: {}, // 快餐模式结算所需的数据
      rationInputCount: 0, // 手工定额的金额
      settleType: 2, // 当前结算的状态,2为全部结算1为部分结算
      submitClose: false, // 是否是结算确认关闭页面
      searchDiscPlanAndPayWayData: {}, // 快速查找搜索所用活动方案和结算方式数据
      searchText: '', // 快速查找文字
      closeKeyboardPayPageBus: true,
      isMinChenVIP: false, // 是否验证过冥晨会员
      // 活动方案和结算方式搜索框及其键盘组件,显示隐藏开关
      searchPayShow: false,
      searchDisPlanShow: false,
      // 活动方案-定额优惠(删除/修改时选择弹窗)-开关
      rationDiscOptSwitch: false,
      // 活动方案-定额优惠(修改||删除时)-传向子组件数据(方法cancelSelected(discType)的discType)
      rationDiscSchemeData: null,
      // 活动方案-定额优惠(已添加按钮)-实时位置:供定额的修改||删除弹窗使用
      rationDiscPosition: null,
      // 活动方案-定额优惠(已添加按钮)-DOM节点临时存储
      rationDiscAddedBtnDOM: null,
      // 线上部分退弹出框
      showConfirmDialog: false,
      // 点击删除的结算方式缓存
      deletePayWayData: null,
      loading: null, // $loading (type Function)
      componentsLoading: false, // 通联弹出框的loading控制
      closeByEsc: true, // 是否可以使用esc快捷键关闭页面
      // 退实收金额
      revokeFactMoney: 0,
      // 当前结算预扣状态 是否为预扣状态(该预扣是"先付后折"优惠计算执行的预扣,非线上预结导致)
      payThenDiscountFlg: false,
      // 当前结算N杯使用状态-仅限快餐: 快餐时打开页面,已执行了"N杯"(从外面底部打折执行),限制所有打折功能(折上折业务逻辑)
      fastFoodUsedNCupDiscFlg: false,
      // 当前账单业务逻辑时"先到先得"-1 还是 "折上折" -2
      currDiscRule: 1,
      // 自助餐押金数据
      buffetDataForSettle: {},
    };
  },
  created() {
    // 为了避免中餐快餐切换引起的以下事件重复监听，
    // 在BussinessStarting/Index添加了清除以下事件的方法clearPayIndexEventListen
    this.$von('closeSettleDialog', () => {
      this.$log.info('中餐结算窗口被调用关闭');
      this.close({ force: true });
    });
    // 监听快餐关闭结算窗口事件
    this.$von('fastfoodCloseSettleDialog', () => {
      this.$log.info('快餐结算窗口被调用关闭');
      this.close({ force: true });
    });
    // 清空结算备注
    this.$von('clearSettlementRemark', () => {
      this.settlementRemarkInfo = '';
      // 顺便清除下发票金额
      this.cancelInvoice();
    });
    this.$von('clearEasyLifeSettlePayWay', () => {
      // 微生活的settle调用后就增加结算方式了，应该是验证密码或短信成功后才增加，验证不通过的话删除结算方式
      this.twitterlifepaywayUndo();
    });
    // 创建组件时,挂载全局监听事件: 处理点击非弹框,执行关闭
    this.rationDiscBtnEventListener();
    // 监听押金管理页面，使用押金
    this.$von('useDeposit', (data) => {
      this.useDeposit(data);
    });
    // 监听押金管理页面，使用押金
    this.$von('refreshBill', (str) => {
      this.refreshBill(str);
    });
    // 折扣优惠方案失效后,当前页面实时更新数据
    this.$vonce('reGetDiscPlanAndPayWayBUS', () => {
      this.reGetDiscPlanAndPayWay();
    });
  },
  watch: {
    getSettlement() {
      // 初始化押金
      this.depositMoney = this.getSettlement.billMap.deposit;
      this.baseBs = this.getSettlement.billMap.baseBs;
    },
    // 监听收款金额用于客显显示
    sumPayWayMoney(val) {
      this.$devices.CDI.pay(val);
    },
    // 监听找零金额用于客显显示
    giveChange(val) {
      setTimeout(() => {
        this.$devices.CDI.change(val);
      }, 2000);
    },
  },
  computed: {
    // 待付金额
    amountToBePaid() {
      let lastTotal = Number(this.baseBs.last_total);
      if (isNaN(lastTotal)) lastTotal = 0;
      let sumPayWayMoney = +Number(this.sumPayWayMoney).toFixed(2); // '+':转为number
      if (isNaN(sumPayWayMoney)) sumPayWayMoney = 0;
      return sub(lastTotal, sumPayWayMoney);
    },
    // 计算找零
    giveChange() {
      const { dataLoadCompleteSettle, dataLoadComplteDiscoutAndPayWay } = this;
      if (!dataLoadCompleteSettle || !dataLoadComplteDiscoutAndPayWay) return '';
      // 账单实收
      const lastTotal = Number(this.baseBs.last_total);
      if (isNaN(lastTotal)) {
        this.$message.error(
          `${this.$t('Biz.Settlement.Error38')}:${this.baseBs.last_total}`,
        );
        return '';
      }
      const sumPayWayMoney = +Number(this.sumPayWayMoney).toFixed(2); // '+':转为number
      if (isNaN(sumPayWayMoney)) {
        this.$message.error(
          `${this.$t('Biz.Settlement.Error39')}:${sumPayWayMoney}`,
        );
        return '';
      }
      // 计算找零金额的暂存变量
      const giveChangeMoney = round((lastTotal - sumPayWayMoney));
      // 找零: 正好
      if (giveChangeMoney === 0) {
        return 0;
      } if (giveChangeMoney > 0) {
        // 找零: 负值-显示为待付金额
        return -Number(giveChangeMoney).toFixed(2);
      }
      // 找零: 正值,实收小于收款应该找零
      let MeituanGiveMoney = 0; // 美团结算的金额
      // 美团点评团购不找零即美团点评团购结算方式金额大于实收的这部分金额不找零
      // 是否包含美团结算方式,默认不包含
      let isHaveMeiTuan = false;
      this.haveUsePayWay.forEach((payWay) => {
        if (+payWay.payway_id === 9) {
          isHaveMeiTuan = true;
          MeituanGiveMoney = Number(payWay.take_money);
        }
      });

      // 如果所有结算方式包含美团点评团购结算方式
      if (isHaveMeiTuan) {
        // 判断美团结算方式金额是否大于实收 如果大于 这部分不找零
        if (MeituanGiveMoney > lastTotal) {
          return -(
            Number(giveChangeMoney)
              + (MeituanGiveMoney - lastTotal)
          ).toFixed(2);
        }
        // 正常找零
        return -Number(giveChangeMoney).toFixed(2);
      }
      // 其他均返回找零金额
      return -Number(giveChangeMoney).toFixed(2);
    },
    ...mapGetters([
      'posInfo',
      'posBaseInfo',
      'posDevice',
      'posTables',
      'getVuexPointData',
      'outDeviceSetting',
      'getSettleDiscType',
      'allPosModuleOper',
      'getDiscPlanAndPayway',
      'ALL_POS_MODULE',
      'posOrderBill',
      'getFastFoodBillData',
      'getSettlementBillMap',
      'posSettings',
      'setting',
      // "快餐"外部已执行的N杯打折数据
      'getSelectDiscountPlanData',
    ]),
    // 注册结算主界面快捷键(程序写死), onOpen中, 执行的是用户自定义设置快捷键
    AddPayHotkey() {
      const hotkeyTmp = {};
      const { hasMultiSettle } = this.posInfo;
      hotkeyTmp['Y.ctrl.alt'] = () => {
      };
      // 结算-客位信息显示翻页
      // 左
      hotkeyTmp['←'] = () => {
        this.$refs.PayGuestSeatMsg.$refs.roomMsgPagerId.prev();
      };
      // 右
      hotkeyTmp['→'] = () => {
        this.$refs.PayGuestSeatMsg.$refs.roomMsgPagerId.next();
      };
      // 加单明细显示区域翻页
      // 上
      hotkeyTmp['←.ctrl'] = () => {
        this.$refs.PayGuestSeatMsg.$refs.guestSeatMsg.prev();
      };
      // 下
      hotkeyTmp['→.ctrl'] = () => {
        this.$refs.PayGuestSeatMsg.$refs.guestSeatMsg.next();
      };
      // 活动方案-上一页
      hotkeyTmp['↑.ctrl'] = () => {
        this.turnPageDiscAndPayWay(-1, 'discType');
      };
      // 活动方案-下一页
      hotkeyTmp['↓.ctrl'] = () => {
        this.turnPageDiscAndPayWay(1, 'discType');
      };
      // 活动方案-返回Home(不分组时)
      hotkeyTmp['Home.ctrl'] = () => {
        this.turnPageDiscAndPayWay(0, 'discType');
      };
      // 结算方式-上一页
      hotkeyTmp['↑'] = () => {
        this.turnPageDiscAndPayWay(-1, 'payWayType');
      };
      // 结算方式-下一页
      hotkeyTmp['↓'] = () => {
        this.turnPageDiscAndPayWay(1, 'payWayType');
      };
      // 结算方式-返回Home(不分组时)
      hotkeyTmp.Home = () => {
        this.turnPageDiscAndPayWay(0, 'payWayType');
      };
      // 快餐时, 不可执行相关快捷键
      if (this.posInfo.controlMode !== '3') {
        // 预结单打印
        hotkeyTmp.F3 = () => {
          const id = '1237';
          if (!this.checkPayAuthority(id)) return;
          const { baseBs } = this;
          if (!Object.is(baseBs.point_state, 3)) {
            // eslint-disable-next-line consistent-return
            return false;
          }
          this.payPreformPrint();
        };
        // 服务费
        hotkeyTmp.F4 = () => {
          const id = '1240';
          // 自助不可用服务费
          if (!this.checkPayAuthority(id)
            && this.posSettings.isOpenBuffetDeposit
          ) {
            return false;
          }
          this.payServiceCharge('payServiceCharge');
        };
        // 最低消费
        hotkeyTmp.F5 = () => {
          const id = '1241';
          // 自助不可用最低消费
          if (!this.checkPayAuthority(id)
            && this.posSettings.isOpenBuffetDeposit
          ) {
            return false;
          }
          this.payMinimumConsumption('payMinimumConsumption');
        };
        // F8押金
        hotkeyTmp.F8 = () => {
          // 自助不可用押金
          if (this.posSettings.isOpenBuffetDeposit
            && this.buffetDataForSettle.buffetDeposit
          ) {
            return;
          }
          const hasBuffetDepost = this.ALL_POS_MODULE.find(({ id }) => id === '1252');
          if (!hasBuffetDepost || !hasBuffetDepost.checked) return;
          const id = '1231';
          if (!this.checkPayAuthority(id)) return;
          if (hasMultiSettle) return;
          this.payDesposit('payDesposit');
        };
        // 埋单/撤销埋单
        hotkeyTmp.PgUp = () => {
          if (this.posSettings.isOpenBuffetDeposit
            && this.buffetDataForSettle.buffetDeposit
          ) {
            return false;
          }
          const payId = '1238';
          const unpayId = '1239';
          const { baseBs, settleType } = this;
          const pointState = baseBs.point_state;
          // 多次结算？
          if (+settleType === 1) {
            return;
          }
          if (Object.is(pointState, 2)) {
            if (!this.checkPayAuthority(payId)) return;
            this.payPayBill();
          } else if (Object.is(pointState, 3)) {
            if (!this.checkPayAuthority(unpayId)) return;
            const code = {
              isNeedDialog: 0,
              method: 'undoPayPayBill',
              name: 'undoPayPayBill',
              text: '撤销埋单',
            };
            this.undoPayPayBill(code);
          }
        };
        // 预付/撤销预付
        hotkeyTmp.Insert = () => {
          const perpayId = '1243';
          const unperpayId = '1244';
          const { isPrePayEnable } = this.billData;
          const { point_state } = this.baseBs;
          if (Object.is(+isPrePayEnable, 1)) { // 是否开启了预付模式
            if (Object.is(+point_state, 6)) { // 如果状态码是6 说明是预付状态(应该是吧)
              if (!this.checkPayAuthority(unperpayId)) return;
              this.undoPayPayAdvance();
            } else { // 否则就是取消预付状态
              if (!this.checkPayAuthority(perpayId)) return;
              this.payPayAdvance();
            }
          }
        };
        // 更多
        hotkeyTmp['F12.ctrl'] = () => {
          if (hasMultiSettle) return;
          const isExistPayWay = this.checkExistPayWay();
          this.$refs.payMore.open({ isExistPayWay: Number(isExistPayWay) });
        };
      }
      hotkeyTmp.PgDn = () => {
        // PgDn结算按钮
        this.submitSettle();
      };
      // 线上支付查询
      hotkeyTmp.F9 = () => {
        const id = '1232';
        if (!this.checkPayAuthority(id)) return;
        // 执行线上预付款
        this.payOnlinePayment();
      };
      // 结算备注
      hotkeyTmp.F10 = () => {
        const id = '1233';
        if (!this.checkPayAuthority(id)) return;
        this.paySettlementNote('paySettlementNote');
      };
      // 开发票
      hotkeyTmp.F11 = () => {
        const id = '1234';
        if (!this.checkPayAuthority(id)) return;
        this.payDrawInvoice('payDrawInvoice');
      };
      // 开钱箱
      hotkeyTmp.F1 = () => {
        const id = '1235';
        if (!this.checkPayAuthority(id)) return;
        this.payMoneyBox('payMoneyBox');
      };
      // 现金等额
      hotkeyTmp.F2 = () => {
        const id = '1236';
        if (!this.checkPayAuthority(id)) return;
        this.payCashEquivalents();
      };
      return hotkeyTmp;
    },
  },
  methods: {
    // 打开导游提成
    billedTourGuideFee() {
      this.$refs.billedTourGuideFee.open();
    },
    checkPayAuthority(id) { // true 为有权限
      if (this.allPosModuleOper) {
        const payAuthorityId = '182';
        const payAuthList = this.allPosModuleOper[payAuthorityId];
        if (payAuthList && payAuthList.children.length > 0) {
          const auth = find(payAuthList.children, { id });
          if (auth && !auth.checked) {
            return false;
          }
        }
      }
      return true;
    },
    onBeforeClose(done, options) {
      if (this.posInfo.controlMode === '3') {
        if (options && options.force === true) {
          done();
        } else {
          ajax(
            'canyin.pos.reception.receptionbusiness.closesettlementwin',
          ).then((res) => {
            if (res.success && res.isTsPayway === true) {
              this.$message.error(`${this.$t('Biz.Settlement.Error40')}`);
            } else {
              this.$vemit('fastLoadBillBus');
              done();
            }
          });
        }
      } else if (
      // 不是被强制关闭
        !(options && options.force === true)
          // 且含有结算备注信息或发票信息
          && (this.settlementRemarkInfo !== '' || this.invoicesOpened !== 0)
      ) {
        this.$confirm(
          `${this.$t('Biz.Settlement.Tip7')}`,
        ).then(() => {
          done();
        });
      } else {
        done();
      }
    },
    // 获取结算界面的数据
    getSettlementData(resData, isUpdateTeamBillFlg, IsVerifyOrErrorRefresh, init) {
      const params = {
        pointId: resData.pointId,
        loadmodule: 1,
        init: init === 1 ? 1 : 0,
        scIdStr: resData.scIdStr,
        _t: new Date().getTime(),
      };
      const { isTeamSettlementFlg } = this;
      if (+isTeamSettlementFlg === 1) {
        params.isTeamBill = this.isTeamBill;
      }
      // 获取结算页面信息
      ajax('canyin.pos.settlement.settle2', {
        params,
      }).then((res) => {
        if (+res.data.code === 1) {
          this.getSettlement = res.data.data;
          // 把结算界面数据上传到vueX
          this.setSettleBsCode(res.data.data.billMap.baseBs.code);
          this.getSettlementBillData({ list: cloneDeep(res.data.data) });
          this.getDiscAndPayWayData(
            cloneDeep(res.data.data),
            IsVerifyOrErrorRefresh,
          );
          this.baseBs = res.data.data.billMap.baseBs;
          this.billData = res.data.data.billMap;
          // 根据结算业务数据,缓存自助押金信息
          this.buffetDataForSettle = {
            depositId: this.billData.depositId,
            buffetDeposit: this.billData.buffetDeposit,
          };
          // 当前结算状态是否-预结("先付后折"执行)
          this.payThenDiscountFlg = res.data.data.billMap.payDiscountFlg || false;

          /**
             * 当前结算-抹零功能按钮可操作状态设置
             * ## wipeZeroModeKey和wipeZeroPositionKey 均 不为空时,
             * ## 且均不为'0'时,
             * ## 且wipeZeroModeKey的值不为'1006004'时(1006004为后台不抹零了逻辑值),
             * ## 且该账单状态不是埋单(pointState != 3)时, 才可执行抹零业务
             *  */
          const { wipeZeroModeKey, wipeZeroPositionKey } = res.data.data;
          if (wipeZeroModeKey
              && wipeZeroModeKey !== '0'
              && wipeZeroModeKey !== '1006004'
              && wipeZeroPositionKey
              && wipeZeroPositionKey !== '0'
              && `${res.data.data.billMap.pointState}` !== '3'
          ) {
            this.wipeState.operable = true;
          } else {
            this.wipeState.operable = false;
          }

          this.bookOrderSource = res.data.data.billMap.bookOrderSource;
          this.electronicInvoiceData = {
            isDefaultChecked: res.data.data.isDefaultChecked,
            isOpenElectronicInvoice: res.data.data.isOpenElectronicInvoice,
            defaultInvoiceType: this.setting.defaultInvoiceType,
          };
          this.isMinChenVIP = res.data.data.isVIP;
          this.dataLoadCompleteSettle = true;
          const pointState = this.baseBs.point_state;
          if (pointState) {
            // 锁台状态
            if (+pointState === 5) {
              this.$refs.LockBill.open(this.baseBs);
            }
          }
          // 显示结算头部信息
          if (
            +this.posInfo.controlMode === 3
              && this.paymentGetBillData.saleTypeName
          ) {
            this.title = `${this.$t('Dict.Btn.Settlement')}(${this.$t('Biz.Settlement.FastFoodArea')}.${
              this.paymentGetBillData.saleTypeName
            })`;
          } else {
            this.title = `${this.$t('Dict.Btn.Settlement')}(${this.baseBs.point_name})`;
          }
          /**
             * isUpdateTeamBillFlg - 控制获取结算参数 是否为open, 还是当前页面的刷新;
             * 原因: 后台参数billData.isTeamSettlement(接口 pos.settlement.settle),不会跟去前台传递 是否为团队的参数而改变
             * ## 所以,刷新结算时,不能根据后台返回的参数修改 this.headerTitle和 this.isTeamBill,(这时,这两参数可能会根据用户操作发生了变化)
             * ### 不可被后台数据修改!
             * 判断说明:
             * # open时调用getSettlementData(),传参isUpdateTeamBillFlg为undefined,
             * ## 而结算刷新时调用getSettlementData为false..
             */
          if (isUpdateTeamBillFlg !== false) {
            const { isTeamSettlement } = this.billData;
            if (+isTeamSettlement === 1) {
              this.headerTitle = `${this.$t('Biz.Settlement.TeamSettlement')}`;
              this.isTeamBill = 1;
            } else {
              this.isTeamBill = 0;
            }
            this.isTeamSettlementFlg = this.billData.isTeamSettlement;
          }
          this.$hotKey.start();
          this.payLoading.close();
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg,
            duration: 2000,
          });
        }
      });
    },
    // 添加结算方式
    addPayWay(data) {
      data.transferRoomAccountType = data.type; // 缓存转房账页面传过来的type，防止下面重写
      // 收款金额
      let sumPayWayMoneyTemp = 0;
      if (isNaN(this.sumPayWayMoney)) {
        sumPayWayMoneyTemp = 0;
      } else {
        sumPayWayMoneyTemp = this.sumPayWayMoney;
      }
      this.newAddPayWayList.push(data);
      const { origDataList } = this.pageData.useDiscAndPayWayType;
      // 所有的优惠类型和结算方式
      const newPayWayArray = [];
      if (origDataList && origDataList.length > 0) {
        // type 1 优惠方式  2 结算方式
        data.type = 2;
        // 设置收款金额
        this.sumPayWayMoney = (
          Number(sumPayWayMoneyTemp) + Number(data.take_money)
        ).toFixed(2);
        // 把原始的结算方式放到 newPayWayArray
        origDataList.forEach((payWay) => {
          newPayWayArray.push(payWay);
        });
        // 把新添加的结算方式放到 newPayWayArray
        this.newAddPayWayList.forEach((payWay) => {
          newPayWayArray.push(payWay);
        });
      } else {
        // type 1 优惠方式  2 结算方式
        data.type = 2;
        // 设置收款金额
        this.sumPayWayMoney = Number(
          Number(sumPayWayMoneyTemp) + Number(data.take_money),
        ).toFixed(2);
        this.newAddPayWayList.forEach((payWay) => {
          newPayWayArray.push(payWay);
        });
      }
      // 记录所有的结算方式数据
      this.haveUsePayWay = newPayWayArray;
      // 每添加一个结算方式就初始化翻页
      this.dealPageData('useDiscAndPayWayType', newPayWayArray, true);
    },
    // 结算方式打开窗口
    async openDialogOrNextPagePayWay(payWay) {
      /**
       * 开启结算分组
       * 判断是否分组按钮, 执行替换为分组数据(使用搜索结果数据进行容器数据替换)
       */
      if (payWay.isGroup && !payWay.payway_type_id) {
        // 执行子分组结算方式数据传入结算方式搜索的数据源
        this.searchDiscPlanAndPayWayData.payWayList = cloneDeep(
          this.resData.discPlanAndPayWayData.paywayInGroupList[payWay.id],
        );
        // 结算方式容器内所有结算方式填充为 选中分组的结算方式, 且分页初始化
        this.dealPageData('payWayType', this.searchDiscPlanAndPayWayData.payWayList, false);
        // 显示分组退出按钮
        this.payWayTypeGroupBack = true;
        // 阻止事件向下执行
        return false;
      }

      /** 校验拦截1: 足够金额检查 */
      const { amountToBePaid } = this;
      // 判断结算方式中是否包含线上结算方式
      const onlinePayWayList = this.checkExistOnlinePayWay();
      if (onlinePayWayList.length <= 0 || payWay.payway_type_id != '507') {
        if (amountToBePaid <= 0) {
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error43')}`,
            duration: 2000,
          });
          return false;
        }
      }
      /** 校验拦截2: 重复结算方式 */
      // 是否允许 添加重复的结算方式 开关
      let allowAddPayWay = true;
      // 阻止 使用重复的结算方式, 只能删除后再选择该方式
      if (this.haveUsePayWay.length) {
        // 改造后 实现
        each(this.haveUsePayWay, (itemPayWay) => {
          // 排除使用了押金
          if (`${itemPayWay.is_deposit}` !== '1'
              && itemPayWay.payway_type_id // 只循环结算方式数据
              && `${itemPayWay.payway_id}` === `${payWay.id}` // 相同的结算方始
          ) {
            // 排除: '团购券','一筷捞','群光储值卡','群光优惠券','食尚订订金'
            if (!(+payWay.id === 9
              || +payWay.id === 34
              || +payWay.id === 43
              || +payWay.id === 44
              || +payWay.id === 59)
            ) {
              this.$message({
                type: 'error',
                message: this.$t('Biz.Settlement.Error41'),
                duration: 2000,
              });
              allowAddPayWay = false;
              return false;
            }
          }
          // 添加了'鱼酷会员券或者会员卡'后不能再次使用这2个
          if ((+itemPayWay.payway_id === 54 || +itemPayWay.payway_id === 55)
            && (+payWay.id === 54 || +payWay.id === 55)
          ) {
            this.$message({
              type: 'error',
              message: this.$t('Biz.Settlement.Error41'),
              duration: 2000,
            });
            allowAddPayWay = false;
            return false;
          }
          // 如果有支付方式，'转房账'和'一招过'不能混用,'一招过'判断逻辑待添加
          if (itemPayWay.payway_type_id && +payWay.id === 38) {
            this.$message({
              type: 'error',
              message: `${this.$t('Biz.Settlement.Error41')}`,
              duration: 2000,
            });
            allowAddPayWay = false;
            return false;
          }
          // '通联pos'不能先于一卡通结算方式添加
          if ((+itemPayWay.payway_type_id === 502 && +itemPayWay.payway_id === 47)
            && +payWay.id === 3
          ) {
            this.$message({
              type: 'error',
              message: `${this.$t('Biz.Settlement.Error42')}`,
              duration: 2000,
            });
            allowAddPayWay = false;
            return false;
          }
          // 箭头函数末尾返回-无实际意义
          return '';
        });
        // 跳出循环后, 执行判断是否可以继续添加结算方式
        if (!allowAddPayWay) {
          return false;
        }

        /** 校验拦截3: 互斥 */
        // 执行结算方式(与打折和结算)互斥校验
        const mutexData = await this.checkDiscPayWayMutex(this.haveUsePayWay, payWay);
        // 阻拦校验结果
        if (mutexData.data.mutex) { // 逻辑阻拦
          this.$message({
            message: mutexData.data.msg,
            type: 'warning',
            duration: 2000,
          });
          return false;
        }
      }

      /** 部分版本代码缺失说明: 很重要
       * 功能按钮组(数据)内 添加 "下一页"按钮及翻页, 该功能被移除,-184.4及186以上, 改造为置底固定翻页, 原数据不在改动 */
      // 打开对应业务模块
      // 如果打开结算方式页面关闭虚拟键盘
      this.$vemit('closeKeyboardPayPageBus');

      // 微生活所需基础数据
      const twitterLifeParams = this.getBaseSubmitParams();
      twitterLifeParams.payway_list = this.getSubmitPayWay();
      const len = twitterLifeParams.payway_list.length;
      const sortOrder = len ? 1 : len + 1;
      const easyLifePaywayList = {
        payway_id: 3297, // 结算方式ID
        payway_name: `${this.$t('Biz.Settlement.MicroLife')}`, // 结算方式名称
        payway_type_id: 511, // 结算方式类型id
        take_money: this.baseBs.orig_total, // 收款金额
        pay_money: this.baseBs.orig_total, // 支付金额（实收）
        give_change: this.giveChange, // 找零金额
        is_deposit: 0, // 0非押金结算，1押金结算
        sort_order: sortOrder, // 顺序
      };
      twitterLifeParams.payway_list.push(easyLifePaywayList);

      /** 校验拦截4: 押金 */
      // 是否有未使用的押金
      const isHaveNoUsedDeposit = this.checkDepositUsed();
      if (+isHaveNoUsedDeposit === 1) {
        return false;
      }
      this.payWay = payWay;
      // 命令对象: 结算方式-点击执行
      const teamSettelement = this.judgeisTeamSettlement();
      let teamBsIds = '';
      if (teamSettelement !== false) {
        // 团队结算
        // eslint-disable-next-line prefer-destructuring
        teamBsIds = teamSettelement.teamBsIds;
      }
      const { isWithdrawCashEnable } = this.billData;
      const payWayDoMethod = {
        501: () => {
          if (payWay.id === '34') {
            this.$refs.payWayOneChopstickModal.open(payWay);
          } else {
            this.$refs.payWayRMBModal.open({
              payWayInfo: payWay, // 当前选择的结算方式信息
              payWayList: this.hotPayWayList, // 所有结算方式信息，用于查找到本位币，计算汇率
              paywayInGroupList: this.resData.discPlanAndPayWayData.paywayInGroupList, // 分组的结算方式
              fromWhere: 'pay', // 此标识为了区分人民币模块从哪个界面打开
            });
          }
        },
        // 银行卡
        502: () => {
          if (payWay.id === '47' || payWay.id === '56') {
            const whichOpen = payWay.id === '47' ? '0' : '1';
            this.$refs.TongLianPaymentCode.open({
              money: this.amountToBePaid,
              bsId: this.baseBs.id,
              pointId: this.resData.pointId,
              isTeamSettle: !!this.judgeisTeamSettlement(), // 是否是团队
              whichOpen, // String - 通联传'0'，聚合支付传'1'
            },
            {
              submit: (params) => {
                // 通联银行卡的刷卡确认
                if (payWay.id === '47') {
                  this.tongLianPay(params);
                  return null;
                }
                return this.aggregationPay(params, 0);
              },
            });
          } else {
            this.$refs.payWayBankModal.open({
              payWay,
              isWithdrawCashEnable,
            });
          }
        },
        // 支票
        503: () => {
          this.$refs.payWayCheckModal.open({
            payWay,
            isWithdrawCashEnable,
          });
        },
        // 宴请
        504: () => {
          this.$refs.payWayBanquetModal.open(payWay);
        },
        // 跑单
        505: () => {
          this.$refs.payWayRunModal.open(payWay);
        },
        // 代金券
        506: () => {
          this.$refs.payWayVoucherModal.open([
            payWay,
            this.amountToBePaid,
            teamBsIds,
          ]);
        },
        // 二维码，支付码弹窗
        507: () => {
          // 需要清除之前选择的二维码或者付款码
          this.clearOnlinePayWay();
          this.paymentCode(payWay);
        },
        // 会员卡
        508: () => {
          if (payWay.id === '39') { // 荣管家会员卡
            this.$refs.payWayRGJcrm.open({
              payWay,
              bsid: this.baseBs.id,
              pointid: this.resData.pointId,
            });
          } else if (payWay.id === '9003') { // 冥晨会员卡
            this.$refs.PayWayMinChenMembershipCard.open({
              bsId: this.baseBs.id,
              pointId: this.resData.pointId,
            });
          } else if (payWay.id === '3297') { // 微生活
            if (!teamSettelement) {
              // 微生活 不支持团队结算
              this.$refs.PayWayTwitterLifeModal.open({
                payWay,
                params: twitterLifeParams,
                bsid: this.baseBs.id,
                pointid: this.resData.pointId,
              });
            } else {
              this.$message.error(`${this.$t('Biz.Settlement.Error44')}`);
            }
          } else if (payWay.id === '43') { // 群光储值卡
            if (!teamSettelement) {
              // 群光储值卡 不支持团队结算
              this.$refs.payWayGroupLightMembershipCard.open({
                payWay,
                params: twitterLifeParams,
                bsid: this.baseBs.id,
                pointid: this.resData.pointId,
              });
            } else {
              this.$message.error(`${this.$t('Biz.Settlement.Error44')}`);
            }
          } else if (payWay.id === '44') { // 群光优惠券
            if (!teamSettelement) {
              // 群光优惠券 不支持团队结算
              this.$refs.payWayGroupLightVoucher.open({
                payWay,
                params: twitterLifeParams,
                bsid: this.baseBs.id,
                pointid: this.resData.pointId,
              });
            } else {
              this.$message.error(`${this.$t('Biz.Settlement.Error44')}`);
            }
          } else if (payWay.id === '54') { // 鱼酷会员
            if (!teamSettelement) {
              // 鱼酷 不支持团队结算
              this.$refs.PayWayFishCoolModal.open({
                bsId: this.baseBs.id,
                pointId: this.resData.pointId,
                controlMode: this.posBaseInfo.controlMode,
                settlementData: this.getSettlement,
                canUseDiscount: this.checkExistPayWay() === 0,
                amountToBePaid: this.amountToBePaid,
              });
            } else {
              this.$message.error(`${this.$t('Biz.Settlement.Error44')}`);
            }
          } else {
            this.openCrmPayDialog(payWay);
          }
        },
        // 美团团购点评
        509: () => {
          this.$refs.PayWayMeituanGroupVoucher.open([
            payWay,
            this.resData.pointId,
          ]);
        },
        // 挂账
        510: () => {
          this.$refs.payWayPayoutsModal.open(payWay);
        },
        // 人民币
        511: () => {
          this.$refs.payWayRMBModal.open(payWay);
        },
        //  线上礼品卡
        518: () => {
          this.$refs.payWayCoucouModal.open({
            bsId: this.baseBs.id,
            pointId: this.resData.pointId,
            payWay,
          });
        },
        // 转房账
        519: () => {
          this.$refs.transferRoomAccount.open({ payWay });
        },
        // 食尚订订金
        520: () => {
          this.$refs.payWaySSDDeposit.open(
            {
              payWayInfo: payWay,
            },
            {
              submit: () => {
                this.refreshBill();
              },
            },
          );
        },
        // 集团挂账
        521: () => {
          this.$refs.payWayGroupPayoutsModal.open(payWay);
        },
      };
      // 执行(命令对象绑定的方法): payWay.payway_type_id-支付方式的id
      payWayDoMethod[payWay.payway_type_id]();
    },
    // 活动方案打开窗口
    async openDialogOrNextPageDiscType(discType) {
      // console.log(discType);
      /** 校验拦截1 */
      // 仅限快餐: 打开页面,已执行了"N杯"(从外面底部打折执行),限制所有打折功能(折上折业务逻辑)
      if (this.fastFoodUsedNCupDiscFlg
        && this.posInfo.controlMode === '3'
      ) {
        this.$message({
          // message: '请先撤销【打折】中选中的打折方案，再选择其他活动方案。',
          message: this.$t('Biz.Settlement.Error88'),
          type: 'warning',
          duration: 2000,
        });
        return false;
      }
      /** 校验拦截2 */
      // 如果是"折上折"业务, 阻拦已经被添加过的打折 且 该打折不是最后添加的
      // ## 如果是最后添加的, 不阻拦!
      // ## this.posOrderBill.bsData.discRule: 1-先到先得, 2-折上折
      // 已使用打折 且非最后一个
      let usedDiscAndNotLast = false;
      // 已使用的打折(排除结算)
      const allUsedDiscTmp = this.haveUsePayWay.filter(i => i.type === 1);
      if (!isEmpty(this.haveUsePayWay)) {
        if (discType.discTypeId === 2
          && find(this.haveUsePayWay, { dpId: discType.dicountPlanId })
          && discType.dicountPlanId !== allUsedDiscTmp[allUsedDiscTmp.length - 1].dpId
        ) {
          usedDiscAndNotLast = true;
        }
        if (discType.discTypeId !== 2
          && find(this.haveUsePayWay, { discType: discType.discTypeId })
          && discType.discTypeId !== allUsedDiscTmp[allUsedDiscTmp.length - 1].discType
        ) {
          usedDiscAndNotLast = true;
        }
      }
      // 中餐(和快餐)时 && 该账单属性"折上折" && 点击的打折 已被添加过 且 不是已加打折的最后一个
      // 该逻辑保证"折上折"时,已执行的折扣修改时显示正常
      if (this.currDiscRule === 2 && usedDiscAndNotLast) {
        return false;
      }

      /** 部分版本代码缺失说明: 很重要
       * 功能按钮组(数据)内 添加 "下一页"按钮及翻页, 该功能被移除,-184.4及186以上, 改造为置底固定翻页, 原数据不在改动 */

      // 如果打开活动方案页面关闭虚拟键盘
      this.$vemit('closeKeyboardPayPageBus');
      // 检查是否添加结算方式, 当前可使用折扣状态
      const isExistPayWay = this.checkExistPayWay();

      /**
       * 添加折扣业务逻辑判断: isExistPayWay:0 - 可执行打折; isExistPayWay:1 - 不可执行打折.
       * # 1.常规-添加结算方式后,不可再添加折扣优惠.
       * # 2.特殊-(结算方式的isUseTicketFirst==true即含折现率结算;添加折现率结算再执行比例类打折后执行)
       * ## 2.1 添加特定(isUseTicketFirst==true)结算方式后,判断是否为比例类型的折扣优惠. 是-可继续添加, 否-不可执行.
       * ### 2.2.1 discTypeId:比例(1)/全单(4)/类别(5)/折扣方案(2)时的按小类(settingMode=1),可继续添加,与特殊结算方式进行组合优惠.
       * ### 2.2.2 discTypeId:单品(3)/满减(-3)/手工(-1)/折扣方案(2)时的按品项(settingMode=0)的定额类(disType=0),均不可添加特殊结算方式后再添加次优惠
       * #### 此功能为 <鱼酷第一期>业务,"先券后折"功能(即组合优惠)CY7-3601-20191203-184.1时添加.
       * #### 上述判断,均为 未执行组合优惠(payThenDiscountFlg==false)时所用.
       * ## 2.2 执行组合优惠后,再执行打折时,不再限制打折类型,均可执行.
       * ### 此功能为<鱼酷第二期>业务,"折上折"功能CY7-3821-20200117-184.4时添加.
       */
      if (isExistPayWay === 0) {
        /** 校验拦截3 */
        /**
         * "先付后折"逻辑判断:
         * # 未执行组合优惠(未预结) && 已添加结算方式 && 全部为折现率结算方式 && 非 比例类型折扣 : 阻拦提示
         */
        // 已用的含折现率的结算方式
        const usedTicketPayWays = this.haveUsePayWay.filter(
          item => item.type === 2 && item.isUseTicketFirst === true,
        ).length;
        // 已用的所有的结算方式
        const usedAllPayWays = this.haveUsePayWay.filter(item => item.type === 2).length;
        if (!this.payThenDiscountFlg
          && find(this.haveUsePayWay, ['type', 2])
          && (usedTicketPayWays === usedAllPayWays)
          && (discType.discTypeId === 3
            || discType.discTypeId === -3
            || discType.discTypeId === -1
            || (discType.discTypeId === 2
              && (discType.settingMode === 0 && discType.disType === 0)))
        ) {
          this.$message({
            // message: '此活动方案不可使用',
            message: this.$t('Biz.Settlement.Error89'),
            type: 'warning',
            duration: 2000,
          });
          return false;
        }

        /**
         * 开启折扣分组
         * 判断是否分组按钮, 执行替换为分组数据(使用搜索结果数据进行容器数据替换)
         */
        if (discType.isGroup && !discType.dicountPlanId) {
          // 执行子分组结算方式数据传入结算方式搜索的数据源
          this.searchDiscPlanAndPayWayData.discTypeList = cloneDeep(
            this.resData.discPlanAndPayWayData.discTypeList.activityInGroupList[discType.id],
          );
          // 排序:按照sortOrder.
          // 代码注释,改动:新建打折的要排序最后.在不新增字段的前提下, 后台传sortOrder为null
          // ## 使用lodash的sortBy排序内置逻辑,将null置位最后
          // this.searchDiscPlanAndPayWayData.discTypeList.sort(
          //   (aItem, bItem) => aItem.sortOrder - bItem.sortOrder,
          // );
          this.searchDiscPlanAndPayWayData.discTypeList = sortBy(
            this.searchDiscPlanAndPayWayData.discTypeList,
            item => item.sortOrder,
          );

          // 结算方式容器内所有结算方式填充为 选中分组的结算方式, 且分页初始化
          this.dealPageData('discType', this.searchDiscPlanAndPayWayData.discTypeList, false);
          // 显示分组退出按钮
          this.discTypeGroupBack = true;
          // 阻止事件向下执行
          return false;
        }

        /** 校验拦截4 */
        // 过滤-当前点击的按钮是否为'定额'优惠类型(节流)
        if (discType.discMode && discType.discMode === 2) {
          // 判断当前点击的'定额优惠',阻止(已经添加的)相同的定额优惠,被重复点击添加
          // flat()有兼容性问题, 暂不使用
          if (
            this.discAndPayWayData
              .reduce((pre, cur) => pre.concat(cur), [])
              .some(el => el.discMode && el.dpId === discType.dicountPlanId)
          ) {
            return false;
          }
        }

        /** 校验拦截5 */
        // 执行折扣优惠互斥校验: 仅校验普通打折方案(2)/N杯(2)/定额优惠方案(2)/优惠券方案(2)/满减(-3)
        if (this.haveUsePayWay.length
          && (discType.discTypeId === 2
            || discType.discTypeId === -3)
        ) {
          const mutexData = await this.checkDiscPayWayMutex(this.haveUsePayWay, discType);
          // 阻拦校验结果(程序错误不拦截)
          if (mutexData.data.mutex) {
            this.$message({
              message: mutexData.data.msg,
              type: 'warning',
              duration: 2000,
            });
            return false;
          }
        }

        // 根据折扣id(discTypeId)字典, 执行打开相应功能方法(再打开弹窗)
        const discDialog = this.discTypeDialog[discType.discTypeId];
        if (discDialog) {
          this[discDialog](discDialog, discType);
        }
      } else {
      /** 校验拦截6 */
      // 含不可用结算方式,阻拦
        this.$message({
          // message: '请先删除已用结算方式，再进行优惠！',
          message: this.$t('Biz.Settlement.Error90'),
          type: 'error',
          duration: 2000,
        });
      }
    },
    // 结算方式互斥(打折与结算)校验接口
    checkDiscPayWayMutex(usedData, newDiscOrPayWay) {
      const params = {
        prePaywayIds: [], // 已用结算方式(id)数组(多个)
        selectedPlans: [], // 已选活动列表(多个)
      };
      // 执行业务为结算方式时
      if (newDiscOrPayWay.payway_type_id) {
        params.newPaywayId = newDiscOrPayWay.id;
      } else {
      // 打折方案时
        params.newPlanId = newDiscOrPayWay.dicountPlanId;
        params.newDiscType = newDiscOrPayWay.discTypeId;
      }
      usedData.forEach((item) => {
        // 已用打折数据
        if (item.type === 1) {
          params.selectedPlans.push({
            id: item.dpId ? item.dpId : item.foId,
            discType: item.discType,
          });
        }
        // 已用结算数据
        if (item.type === 2) {
          params.prePaywayIds.push(item.payway_id);
        }
      });
      return ajax('canyin.pos.settlement.checkmutex', {
        contentType: 'paramsEncoded',
        data: params,
      });
    },
    // 活动方案及结算方式按钮区域-置底固定按钮(翻页)功能
    turnPageDiscAndPayWay(turn, type) {
      // 活动 || 结算 列表总页数
      const { allPage } = this.pageData[type];
      // 获取 活动 || 结算 当前页
      let { currentPage } = this.pageData[type];
      // 下一页
      if (turn === 1) {
        currentPage += 1;
        if (currentPage > allPage) {
          return false;
        }
      }
      // 上一页
      if (turn === -1) {
        currentPage -= 1;
        if (currentPage < 1) {
          return false;
        }
      }
      // Home(分组内)
      if (turn === 0) {
        // 恢复为分组外(打折 || 结算)数据结构
        if (type === 'discType') {
          // 重置为分组外原"折扣优惠"的搜索数据源
          this.searchDiscPlanAndPayWayData.discTypeList = cloneDeep(
            this.splitDiscPlanAndPayWayData(this.resData.discPlanAndPayWayData).discTypeList,
          );
          // 容器重置为分组外原"折扣优惠"的数据,且重置分页显示内容
          this.dealPageData('discType', this.searchDiscPlanAndPayWayData.discTypeList, false);
          // 隐藏分组退出按钮
          this.discTypeGroupBack = false;
        } else {
        // 重置为分组外原"结算方式"的搜索数据源
          this.searchDiscPlanAndPayWayData.payWayList = cloneDeep(
            this.resData.discPlanAndPayWayData.payWayList,
          );
          this.dealPageData('payWayType', this.searchDiscPlanAndPayWayData.payWayList, false);
          this.payWayTypeGroupBack = false;
        }
        // 重置页码
        this.pageForWard(type, 1);
        // 关闭搜索软键盘
        this.$vemit('closeKeyboardPayPageBus');
        return false;
      }
      // 执行相应的页码翻页
      this.pageForWard(type, currentPage);
    },
    // 得到已使用优惠类型和结算方式
    // 第二个参数代表执行refreshBill方法时的来源 1代表团购代金券,一筷捞,线上礼品卡 2代表添加支付方式失败后的刷新其他代表添加线上支付方式的刷新
    getDiscAndPayWayData(data, IsVerifyOrErrorRefresh) {
      if (data == undefined || data == null) {
        // 记录接口原始已使用优惠类型和结算方式
        this.pageData.useDiscAndPayWayType.origDataList = [];
        return false;
      }
      const discAndPayWayTemp = [];
      // 结算折扣活动方案
      const { pointDiscList } = data;
      if (pointDiscList && pointDiscList.length > 0) {
        pointDiscList.forEach((item) => {
          item.type = 1;
          discAndPayWayTemp.push(item);
        });
        if (+this.posInfo.controlMode === 3) {
          this.$vemit('fastLoadBillBus', {
            fromSettle: true,
            dontClearRemark: true,
          });
        }
      }
      // 预结结算方式
      const { preSettlePayWayList } = data;
      this.preSettlePayWayList = preSettlePayWayList;

      if (preSettlePayWayList && preSettlePayWayList.length > 0) {
        preSettlePayWayList.forEach((item) => {
          item.type = 2;
          discAndPayWayTemp.push(item);
        });
      }
      // 如果 后台返回接口数据,即已存(活动方案+预结)存在
      if (discAndPayWayTemp != null && discAndPayWayTemp.length > 0) {
        // 打开结算界面如果不进行添加结算方式操作此时haveUsePayWay就是所有已使用的结算方式
        if (IsVerifyOrErrorRefresh === '1') {
          this.haveUsePayWay = discAndPayWayTemp.concat(this.newAddPayWayList);
          let sumPayWayMoneyTemp = 0;
          this.haveUsePayWay.forEach((payWay) => {
            if (payWay.take_money) {
              sumPayWayMoneyTemp += Number(payWay.take_money);
            }
          });
          this.sumPayWayMoney = sumPayWayMoneyTemp.toFixed(2);
        } else {
          // 其他
          // 清除线下结算方式预结中包含了所有的结算方式
          this.newAddPayWayList = [];
          // 此时预结就是所有的结算方式
          this.haveUsePayWay = discAndPayWayTemp;
          let sumPayWayMoneyTemp = 0;
          this.haveUsePayWay.forEach((payWay) => {
            if (payWay.take_money) {
              sumPayWayMoneyTemp += Number(payWay.take_money);
            }
          });
          this.sumPayWayMoney = sumPayWayMoneyTemp.toFixed(2);
        }
        // 结算界面打开后已使用的结算方式
        this.pageData.useDiscAndPayWayType.origDataList = discAndPayWayTemp;
        this.dealPageData('useDiscAndPayWayType', this.haveUsePayWay, true);
      } else {
        if (this.newAddPayWayList.length > 0) {
          if (IsVerifyOrErrorRefresh === '1') {
            this.haveUsePayWay = this.newAddPayWayList;
            let sumPayWayMoneyTemp = 0;
            this.newAddPayWayList.forEach((payWay) => {
              if (payWay.take_money) {
                sumPayWayMoneyTemp += Number(payWay.take_money);
              }
            });
            this.sumPayWayMoney = sumPayWayMoneyTemp.toFixed(2);
          } else { // 桌边付混付如果预结字段为空  则清空二维码类支付方式，暂时注释掉是因为后台还未提交相应代码
            this.haveUsePayWay = [];
            this.newAddPayWayList = [];
            this.sumPayWayMoney = 0;
          }
        } else {
          this.haveUsePayWay = [];
          this.sumPayWayMoney = 0;
        }

        this.pageData.useDiscAndPayWayType.origDataList = [];
        this.dealPageData('useDiscAndPayWayType', this.haveUsePayWay, true);
      }
      this.dataLoadComplteDiscoutAndPayWay = true;
    },
    onOpen() {
      this.setPayPageOpen(1);
      // 打开弹窗的回调事件
      this.baseBs = {};
      // 计算top值，上下居中,  计算高度
      this.$hotKey.stop();
      this.payLoading = Loading.service({
        background: 'rgba(0, 0, 0, 0)',
        spinner: 'none',
      });
      const boxHeight = document.documentElement.clientHeight;
      const boxH = (boxHeight - 690) / 2;
      this.payHeight = boxHeight > 690 ? '690px' : `${boxHeight}px`;
      this.testTops = boxH > 0 ? `${boxH}px` : `${0}px`;
      // 动态计算活动方案和结算方式一列显示个数
      setTimeout(() => {
        const activeSheme = this.$refs.activeScheme.offsetHeight;
        const schemeTitle = this.$refs.schemeTitle.offsetHeight;
        const counts = (activeSheme - schemeTitle) / 57;
        this.pageData.discType.colElementNum = Math.floor(counts);
        this.pageData.payWayType.colElementNum = Math.floor(counts);
      }, 200);
      // 进入结算页面的时候屏蔽掉浏览器关闭按钮的功能
      console.info('TCSLCMD=RefuseCloseBrowser');
      this.SETTLE_LOCK_INTERVAL = null;
      const { lockState } = this.resData;
      if (lockState) {
        // 每1分钟执行一次
        this.SETTLE_LOCK_INTERVAL = setInterval(() => {
          // 结算窗口锁定
          this.lockSettleWin();
        }, 1000 * 60);
      }
      // 清空初始化数据
      this.clearPageData();
      this.prePayBtnBusinessType = 0;
      this.isTeamSettlementFlg = 0;
      this.isTeamBill = 1;
      // 清空新添加的结算方式
      this.newAddPayWayList = [];
      // 清空所有的结算方式
      this.haveUsePayWay = [];
      // 开启多次结算时，确认当前结算状态，1为部分结算，2为全部结算
      this.settleType = this.resData.settleType; // 是否是部分结算2为全部结算
      this.$log.info(`是否是全部结算：settleType:${this.settleType}`);
      // 获取结算界面的数据
      this.paymentGetBillData = this.resData.paymentGetBillData;
      this.getSettlementData(this.resData, undefined, undefined, 1);
      // 得到活动方案和结算方式数据
      // this.getDiscPlanAndPayWay(this.resData.pointId);
      // 整理后台返回的数据为两部分：活动方案和结算方式
      // const discPlanAndPayWayData = this.splitDiscPlanAndPayWayData(
      //   this.posInfo.controlMode === '3'
      //     ? this.getDiscPlanAndPayway
      //     : this.resData.discPlanAndPayWayData,
      // );
      // eslint-disable-next-line max-len
      const discPlanAndPayWayData = this.splitDiscPlanAndPayWayData(this.resData.discPlanAndPayWayData);
      // 快速查找搜索所用活动方案和结算方式数据
      this.searchDiscPlanAndPayWayData = cloneDeep(discPlanAndPayWayData);
      this.getDiscPlanAndPayWay(this.searchDiscPlanAndPayWayData);

      // 根据后台传值(数据为true时), 手动设置增加 打折优惠和结算方式快捷键
      this.setDiscAndPayWayHotKey();
      // 优惠和结算方式组件,用v-if控制,达到重新注册组件挂载DOM
      // 为了保持键盘公共组件的传值,控制,切换,规避一些错误问题(键盘组件设计开发的太垃圾了)
      this.searchPayShow = true;
      this.searchDisPlanShow = true;
      // 结算方式分页选中默认选中到第一页
      this.payWayPageOrder = 1;
      // 活动方案分页重置第一页
      this.shemePageOrder = 1;
      // 中餐||快餐时, 根据数据源-账单设置业务逻辑, 设置本地打折逻辑(先到先得||折上折)
      if ((this.posInfo.controlMode !== '3'
          && this.posOrderBill.bsData.discRule === 2)
        || (this.posInfo.controlMode === '3'
          && this.getFastFoodBillData.bsData.discRule === 2)
      ) {
        this.currDiscRule = 2;
      }
      // 根据vuex中存储已选快餐打折数据
      if (this.getSelectDiscountPlanData) {
        this.fastFoodUsedNCupDiscFlg = true;
      }
    },
    // 根据后台传值(数据为true时), 手动设置增加 打折优惠和结算方式快捷键
    setDiscAndPayWayHotKey() {
      const tmp = {};
      this.hotPayWayList.forEach((payWay) => {
        if (payWay.short_key === '0' || payWay.short_key) {
          tmp[payWay.short_key] = () => {
            // 同步队列方式打开结算方式弹窗, 避免快捷键输入到新打开的弹窗输入框
            setTimeout(() => {
              // 进入结算分组, 组外快捷键的执行被阻拦
              if (!this.payWayTypeGroupBack) {
                this.openDialogOrNextPagePayWay(payWay, 'payWayType');
              }
            }, 0);
          };
        }
      });
      each(this.resData.discPlanAndPayWayData.paywayInGroupList, (group) => {
        each(group, (gpItem) => {
          if (gpItem.short_key === '0' || gpItem.short_key) {
            tmp[gpItem.short_key] = () => {
              setTimeout(() => {
                // 进入结算分组, 才能执行组内快捷键
                if (this.payWayTypeGroupBack) {
                  this.openDialogOrNextPagePayWay(gpItem, 'payWayType');
                }
              }, 0);
            };
          }
        });
      });
      this.hotDisPlanList.forEach((disItem) => {
        if (disItem.shortKey === '0' || disItem.shortKey) {
          tmp[`${disItem.shortKey}.ctrl`] = () => {
            // 同步队列方式打开活动方案弹窗, 避免快捷键输入到新打开的弹窗输入框
            setTimeout(() => {
              // 进入打折分组, 组外快捷键的执行被阻拦
              if (!this.discTypeGroupBack) {
                this.openDialogOrNextPageDiscType(disItem, 'discType');
              }
            }, 0);
          };
        }
      });
      each(this.resData.discPlanAndPayWayData.discTypeList.activityInGroupList, (group) => {
        each(group, (gpItem) => {
          if (gpItem.shortKey === '0' || gpItem.shortKey) {
            tmp[`${gpItem.shortKey}.ctrl`] = () => {
              setTimeout(() => {
                // 进入打折分组, 才能执行组内快捷键
                if (this.discTypeGroupBack) {
                  this.openDialogOrNextPageDiscType(gpItem, 'discType');
                }
              }, 0);
            };
          }
        });
      });
      this.$hotKey.set('PosDialog.AddPayHotkey', tmp);
    },
    splitDiscPlanAndPayWayData(data) {
      // 打折类型临时
      let discTypeListTemp = [];
      // 固定打折类型
      const discTypeListData = data.discTypeList.discTypeList;
      if (discTypeListData != null) {
        discTypeListData.forEach((item) => {
          discTypeListTemp.push(item);
        });
      }
      // 打折方案数据
      const discountPlanListData = data.discTypeList.discountPlanList;
      if (discountPlanListData != null) {
        discountPlanListData.forEach((item) => {
          discTypeListTemp.push(item);
        });
      }
      // 满减数据
      const fulloffListData = data.discTypeList.fulloffList;
      if (fulloffListData != null) {
        fulloffListData.forEach((item) => {
          discTypeListTemp.push(item);
        });
      }
      // 排序(固定打折,打折方案,满减优惠三个数据集合):按照sortOrder.
      // 代码注释,改动:新建打折的要排序最后.在不新增字段的前提下, 后台传sortOrder为null
      // ## 使用lodash的sortBy排序内置逻辑,将null置位最后
      // discTypeListTemp.sort((aItem, bItem) => aItem.sortOrder - bItem.sortOrder);
      discTypeListTemp = sortBy(discTypeListTemp, item => item.sortOrder);
      // 拆分后的数据结算方式和活动方案
      return {
        discTypeList: discTypeListTemp,
        payWayList: data.payWayList,
      };
    },
    // 得到活动方案和结算方式数据
    getDiscPlanAndPayWay(data) {
      // 活动方案数据
      const discTypeListTemp = data.discTypeList;
      this.hotDisPlanList = data.discTypeList;
      if (discTypeListTemp != null && discTypeListTemp.length > 0) {
        this.pageData.discType.origDataList = discTypeListTemp;
        this.dealPageData('discType', discTypeListTemp, false);
      } else {
        this.pageData.discType.dataList = [];
        this.pageData.discType.origDataList = [];
        // 清空分页后的内容
        this.dealPageData('discType', [], false);
      }
      // 结算方式数据
      const payWayListTemp = data.payWayList;
      this.hotPayWayList = data.payWayList;
      if (payWayListTemp != null && payWayListTemp.length > 0) {
        // 记录接口原始数据
        this.pageData.payWayType.origDataList = payWayListTemp;
        this.dealPageData('payWayType', payWayListTemp, false);
      } else {
        this.pageData.payWayType.dataList = [];
        this.pageData.payWayType.origDataList = [];
        // 清空分页后的内容
        this.dealPageData('payWayType', [], false);
      }
    },
    // 初始化需要翻页的数据
    dealPageData(type, data, isHorizontalvertical) {
      // 如果数据为空
      if (data.length && data.length === 0) {
        if (type === 'discType') {
          // 活动方案
          this.discTypeList = [];
        } else if (type === 'payWayType') {
          // 支付方式类型
          this.payWayList = [];
        } else if (type === 'useDiscAndPayWayType') {
          // 使用优惠和支付方式
          this.discAndPayWayData = [];
        }
      }
      if (isHorizontalvertical) {
        // 竖着排
        // 显示列数目
        const { displayColNum } = this.pageData[type];
        // 每一列的数目
        const { colElementNum } = this.pageData[type];
        // 分隔数据
        this.pageData[type].dataList = chunk(data, colElementNum);
        // 初始化当前页
        this.pageData[type].currentPage = 0;
        // 优惠方式 和 支付方式集合 已使用优惠和结算方式
        // 总列数
        const payWayListLen = this.pageData[type].dataList.length;
        // 记录总列数
        this.pageData[type].dataTotal = payWayListLen;
        // 一共多少页
        if (+payWayListLen % displayColNum === 0) {
          this.pageData[type].allPage = payWayListLen / displayColNum;
        } else {
          this.pageData[type].allPage = parseInt(payWayListLen / displayColNum, 10) + 1;
        }
        // 总数据不够一页
        if (this.pageData[type].dataList.length <= displayColNum) {
          if (type === 'discType') {
            this.discTypeList = chunk(data, colElementNum);
          } else if (type === 'payWayType') {
            this.payWayList = chunk(data, colElementNum);
          } else if (type === 'useDiscAndPayWayType') {
            this.discAndPayWayData = chunk(data, colElementNum);
          }
        } else {
          let payWayPosition = 1;
          const result = [];
          data.forEach((payway) => {
            result.push(payway);
            if (payWayPosition % (displayColNum * colElementNum - 1) === 0) {
              result.push({
                name: `${this.$t('Dict.NextPage')}`,
                nextPage: 1,
              });
            }
            payWayPosition += 1;
          });
          result.push({
            name: `${this.$t('Dict.NextPage')}`,
            nextPage: 1,
          });
          this.pageData[type].dataList = chunk(result, colElementNum);
          if (type === 'discType') {
            this.discTypeList = this.sliceArray(type, isHorizontalvertical);
          } else if (type === 'payWayType') {
            this.payWayList = this.sliceArray(type, isHorizontalvertical);
          } else if (type === 'useDiscAndPayWayType') {
            this.discAndPayWayData = this.sliceArray(type, true);
          }
        }
      } else {
        // 横着排
        // 记录数据总数
        this.pageData[type].dataList = data;
        // 记录当前页
        this.pageData[type].currentPage = 0;

        // 总数据不够一页直接展示
        if (data.length <= 15) {
          if (type === 'discType') {
            this.discTypeList = data;
          } else if (type === 'payWayType') {
            this.payWayList = data;
          } else if (type === 'useDiscAndPayWayType') {
            this.discAndPayWayData = data;
          }
          // 快速查找之后如果结算方式数量小于等于一页，更改当前总页数，让分页按钮1,2,3,不再显示
          this.pageData[type].allPage = 1;
        } else {
          /** 部分版本代码缺失说明: 很重要
           * 功能按钮组(数据)内 添加 "下一页"按钮及翻页, 该功能被移除,-184.4及186以上, 改造为置底固定翻页, 原数据不在改动
           * 所以, 不在需要判断每页末尾添加"下一页", 只做分页处理即可 */

          // 优惠方式 和 支付方式数据长度
          const payWayListLen = data.length;
          //  数据的个数
          this.pageData[type].dataTotal = payWayListLen;
          // 计算一共几页
          if (payWayListLen % 15 === 0) {
            // 每页显示18
            this.pageData[type].allPage = payWayListLen / 15;
          } else {
            this.pageData[type].allPage = parseInt(payWayListLen / 15, 10) + 1;
          }
          this.pageData[type].dataList = data;
          if (type === 'discType') {
            this.discTypeList = this.sliceArray(type, isHorizontalvertical);
          } else if (type === 'payWayType') {
            this.payWayList = this.sliceArray(type, isHorizontalvertical);
          } else if (type === 'useDiscAndPayWayType') {
            this.discAndPayWayData = this.sliceArray(
              type,
              isHorizontalvertical,
            );
          }
        }
      }
    },
    // 根据传过来的类型 进行数据拆分
    sliceArray(type, isHorizontalvertical) {
      const pageData = this.pageData[type];
      // 类型不正确,返回空数据
      if (pageData == null) {
        return [];
      }
      if (isHorizontalvertical) {
        // 竖着排
        // 总列数
        const origArrayLen = pageData.dataList.length;
        // 总列数小于等于一页的列数
        if (origArrayLen <= pageData.displayColNum) {
          return pageData.dataList;
        }
        pageData.currentPage += 1;
        // 当前页大于总页数
        if (pageData.currentPage > pageData.allPage) {
          pageData.currentPage = 1;
        }
        // 最终显示的数据
        const displayArray = [];
        // 分隔每一页显示的列数
        for (
          let i = (pageData.currentPage - 1) * pageData.displayColNum;
          i < pageData.currentPage * pageData.displayColNum;
          i += 1
        ) {
          if (i >= pageData.dataList.length) {
            break;
          }
          const eleNum = pageData.dataList[i].length;
          // 如果列数小于应该显示的列数停止
          if (eleNum < pageData.colElementNum) {
            displayArray.push(pageData.dataList[i]);
            break;
          }
          // 总列数如果小于当前页*每页显示的列数停止
          const { dataTotal } = pageData;
          if (
            dataTotal
              < (pageData.currentPage - 1) * pageData.displayColNum + 1
          ) {
            displayArray.push(pageData.dataList[i]);
            break;
          }
          displayArray.push(pageData.dataList[i]);
        }
        return displayArray;
      }
      // 横着排
      // 总列数
      const origArrayLen = pageData.dataList.length;
      // 总列数小于等于一页的列数
      if (origArrayLen <= 15) {
        return pageData.dataList;
      }
      pageData.currentPage += 1;
      // 当前页大于总页数
      if (pageData.currentPage > pageData.allPage) {
        pageData.currentPage = 1;
      }
      // 最终显示的数据
      const displayArray = [];
      // 分隔每一页显示的列数
      for (
        let i = (pageData.currentPage - 1) * 15;
        i < pageData.currentPage * 15;
        i += 1
      ) {
        // 总列数如果小于当前页*每页显示的列数停止,如果不够一页显示到哪个地方就停止到哪
        if (
          origArrayLen < pageData.currentPage * 15
              && origArrayLen == i + 1
        ) {
          displayArray.push(pageData.dataList[i]);
          break;
        }
        displayArray.push(pageData.dataList[i]);
      }
      return displayArray;
    },
    // 清空初始化数据
    clearPageData() {
      this.dataLoadCompleteSettle = false;
      this.dataLoadComplteDiscoutAndPayWay = false;
    },
    onClose() {
      window.console.log('close-结算');
      this.setSettleBsCode(null);
      if (this.posInfo.controlMode !== '3') {
        this.settlementRemarkInfo = '';
        this.handInvoice = 0;
        this.machineInvoice = 0;
        this.invoicesOpened = 0;
        this.invoiceRemark = '';
      }
      this.sumPayWayMoney = 0;
      // 清空初始化数据
      this.clearPageData();
      this.prePayBtnBusinessType = 0;
      // 每次打开结算页面, 即执行团队结算判定参数的初始化和赋值, 并保持正确性, 关闭时不再处理
      // (因为:如开启结算打印,这时不能在close中清除,因为打印需要参数判断,并应试做还未完成结算流程)
      // this.isTeamSettlementFlg = 0;
      // this.isTeamBill = 1;
      // 清空新添加的结算方式
      this.newAddPayWayList = [];
      // 清空所有的结算方式
      this.haveUsePayWay = [];
      // 清空当前页已选结算方式
      this.discAndPayWayData = [];
      // 结算头部信息清空
      this.headerTitle = '';
      this.title = `${this.$t('Dict.Btn.Settlement')}`;
      this.fastFoodUsedNCupDiscFlg = false;
      // 强制清空 定额优惠(使用时)产生的缓存数据
      this.rationDiscOptSwitch = false;
      this.rationDiscSchemeData = null;
      this.rationDiscAddedBtnDOM = null;
      // 重置预结状态
      this.payThenDiscountFlg = false;
      // 清空 结算页面左侧账单(子组件)相关数据
      this.$refs.PayGuestSeatMsg.cleanData();
      // this.openRemark = false;
      this.clearLockSettleWin();
      this.clearSettleLockInterval();

      // 延迟重置 两个搜索组件DOM节点挂载状态
      setTimeout(() => {
        this.searchPayShow = false;
        this.searchDisPlanShow = false;
      }, 300);

      // 离开结算页面的时候恢复浏览器关闭按钮功能
      window.console.info('TCSLCMD=AllowCloseBrowser');

      // 删除动态绑定的快捷键(活动方案中的快捷键信息)
      this.hotDisPlanList.forEach((disItem) => {
        if (disItem.shortKey === '0' || disItem.shortKey) {
          this.$hotKey.clearBoundOperation(`PosDialog.AddPayHotkey.${disItem.shortKey}.ctrl`);
        }
      });
      this.setPayPageOpen(2);
    },
    // 常规关闭页面方法，此方法会清除复屏的品项列表
    normalCloseHandler() {
      this.reloadDataItem();
    },
    // ws执行刷新方法，清空复屏数据
    reloadDataItem() {
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'reloadDataItem',
          result: [],
        });
      }
    },
    // 判断有没有现金混付
    hasCashPayWay() {
      let re = false;
      this.haveUsePayWay.forEach((paywayData) => {
        if (paywayData.type === 2 && paywayData.payway_type_id === '501') {
          re = true;
        }
      });
      return re;
    },
    /** "先付后折"业务的取消预结功能,由删除结算方式时进行联动执行(后台执行) */
    // "先付后折"-执行预结逻辑的参数整理: 使用结算前参数
    payThenDiscBizParams(callback) {
      const isEmptyBill = this.checkEmptyBill(); // 检查是否是空账单(如果是执行关台或废单操作)
      if (isEmptyBill) {
        return false;
      }
      // 获取基本参数
      const params = this.getBaseSubmitParams();
      //  获取结算方式数组
      params.payway_list = this.getSubmitPayWay();

      let tmpIndex = null;
      // 判断"先付后折",结算方式添加相关属性
      this.haveUsePayWay.forEach((item) => {
        // 查找并设置提交参数中的结算方式,是已添加结算方式, 则设置isUseTicketFirst
        tmpIndex = findIndex(params.payway_list, sub => sub.payway_id === item.payway_id);
        if (item.type === 2 && tmpIndex !== -1) {
          params.payway_list[tmpIndex].isUseTicketFirst = item.isUseTicketFirst;
        }
      });
      if (+this.posInfo.controlMode !== 3) {
        // 只有收银模式下有多次结算, 如果当前为多次结算状态,判断当前结算状态是全部结算还是部分结算
        if (this.posInfo.hasMultiSettle) {
          params.settleType = this.settleType;
        }
        params.controlMode = 1;
      }
      params.controlMode = this.posInfo.controlMode;
      // 执行回调,并将组装后的数据return回去
      if (callback) {
        callback(params);
      }
    },
    /** "先付后折"业务的取消预结功能,由删除结算方式时进行联动执行(后台执行), 代码注释不在使用 */
    // 结算确认
    submitSettle(type, authData = {}, dialog, ScanCodeData) {
      const isEmptyBill = this.checkEmptyBill(); // 检查是否是空账单(如果是执行关台或废单操作)
      if (isEmptyBill) {
        return false;
      }
      this.$vonce('authCode', (code) => {
        this.submitSettle(type, code);
      });
      const { amountToBePaid } = this;
      if (amountToBePaid > 0) { // 还需收金额
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error46')}`,
          duration: 2000,
        });
        return false;
      }
      // 检测结算方式存在非现金,不能有找零
      // 如需找零的话 最后一个结算方式必须是现金类
      const isCashTypeLastPayWay = this.checkLastGiveMoney();
      if (+isCashTypeLastPayWay === 1) {
        return false;
      }
      // 押金是否已使用
      const isDepositUsed = this.checkDepositUsed();
      if (+isDepositUsed === 1) {
        return false;
      }
      // 不是强制结算(线上支付手动结算)的逻辑
      if (type !== 'enforceSettlement') {
        const onlinePayWayState = this.queryOnlinePayState();
        if (
          onlinePayWayState.wuuTypeId != 0
            && onlinePayWayState.isFinish == 'false'
        ) {
          this.manualSettle(onlinePayWayState.wuuTypeId);
          return false;
        }
      }
      // 有开钱箱权限 并且有现金混付的情况 打开钱箱
      if (
        this.outDeviceSetting.isAccounAutoOpenCashbox === true
          && this.hasCashPayWay()
      ) {
        this.payMoneyBox();
      }

      let url = 'canyin.pos.settlement.settle.commitsettle';
      // 请求参数
      let params = this.getBaseSubmitParams();
      // 获取提交的结算方式参数
      const getSubmitPayWay = this.getSubmitPayWay();
      getSubmitPayWay.forEach((item) => {
        if (item.payway_id === '37' && ScanCodeData) {
          if (ScanCodeData.paytypeid === 6) {
            item.payway_id = 30;
          } else if (ScanCodeData.paytypeid === 8) {
            item.payway_id = 31;
          }
          item.wuu_pay_typeid = ScanCodeData.paytypeid;
        }
      });
      params.payway_list = getSubmitPayWay;
      /**
         * @美团团购券特殊处理数据说明 :
         * 当 美团团购券是结算方式中最后一项时,并且找零金额(give_change)大于0时, 不找零, 找零金额(giveChange) 置 0;
         * ## 结算时接口的回传数据的逻辑(takeMoney - lastTotal = giveChange)不成立,
         * ## 所以需要给接口回传符合逻辑的数据(汇总统计数据, 非结算方式数组payway_list中的);
         * @处理方法 : 由于找零为0, 应收金额(lastTotal)不可变,
         * ## 所以使实收(takeMoney) 等于 应收金额后,回传后台(执行结算接口).
         * ### 2019-05-24 杨杰 添加
         */
      if (params.payway_list.length
          && params.payway_list[params.payway_list.length - 1].payway_type_id === '509'
          && params.payway_list[params.payway_list.length - 1].give_change > 0
      ) {
        params.takeMoney = params.lastTotal;
      }

      // # 转账客位不再做前台判断 #
      // 判断是否为转账客位
      // let isTransferTable = false;
      if (+this.posInfo.controlMode !== 3) {
        // 收银模式
        // 只有收银模式下有多次结算,如果当前为多次结算状态,判断当前结算状态是全部结算还是部分结算
        if (this.posInfo.hasMultiSettle) {
          params.settleType = this.settleType;
        }
        params.controlMode = 1;
        // // 判断是否为转账客位
        // isTransferTable = find(this.posTables, {
        //   pid: this.getVuexPointData.id,
        // });
      }
      params.controlMode = this.posInfo.controlMode;
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
        url = 'canyin.pos.settlement.settle.teamcommitsettle';
      }
      // # 转账客位不再做前台判断 #
      // else if (
      //   +isTeamSettlementFlg === 1
      //   && +isTeamBill === 0
      //   && isTransferTable
      // ) {
      //   // 转账客位不能单独进行结算
      //   this.$message.error(
      //     '转账客位不允许单独进行结算，请先将虚拟客位进行撤销转账操作后再进行结算',
      //   );
      //   return false;
      // }
      params = {
        ...params,
        ...authData,
      };
      if (type === 'enforceSettlement') {
        params.enforce = true;
      }
      // 结算方式里是否有转房账
      this.newAddPayWayList.forEach((payWay) => {
        if (`${payWay.payway_id}` === '38') {
          params.trbInfo = {
            revNo: payWay.revNo,
            custId: payWay.custId,
            type: payWay.transferRoomAccountType,
            arNo: payWay.arNo,
            hotelCode: payWay.hotelCode,
          };
        }
      });

      /** 自助餐押金业务,常规结算前逻辑校验: 开启自助餐且有押金时 start */
      const { buffetDeposit, depositId } = this.buffetDataForSettle;
      if (this.posSettings.isOpenBuffetDeposit && buffetDeposit) {
        // 1. 所用结算方式,每个均小于押金金额: 阻拦结算
        if (getSubmitPayWay.every(item => item.pay_money < buffetDeposit)) {
          this.$message.error(this.$t('Biz.Settlement.buffetTip01'));
          return false;
        }
        // 2. 所用结算方式,用于支付(大于)押金的结算如不是 人民币/现金类/扫码付(付款码): 阻拦结算
        const tmpPay = getSubmitPayWay.filter(
          item => item.pay_money >= buffetDeposit
            && (item.payway_type_id === '501'
              || item.payway_type_id === '502'
              || item.payway_type_id === '507'
              || item.payway_type_id === '511'),
        );
        if (!tmpPay.length) {
          this.$message.error(this.$t('Biz.Settlement.buffetTip01'));
          return false;
        }
        // 参数整理(银行卡支付押金时,额外需要的card_no和type_id再paway_list中)
        params.depositParam = {
          id: depositId, // 押金id
          payMoney: buffetDeposit, // 押金金额
          paywayId: tmpPay[0].payway_id, // 支付押金的结算方式id
        };
      }
      /** end */

      // 部分结算，结算完成后不关台
      // this.posInfo.hasMultiSettle后台是否开启多次结算功能如果不开通,保持原有结算逻辑不变
      if (this.posInfo.hasMultiSettle && +this.settleType === 1) {
        this.submitSettleTask(url, params, dialog);
      } else if (this.posInfo.hasMultiSettle && +this.settleType === 2) {
        // 全部结算，结算完成后结算关台
        this.$confirm(`${this.$t('Biz.Settlement.Tip8')}`, `${this.$t('Dict.Tips')}`, {
          distinguishCancelAndClose: true,
          confirmButtonText: `${this.$t('Biz.Settlement.ButtonText1')}`,
          cancelButtonText: `${this.$t('Biz.Settlement.ButtonText2')}`,
          type: 'warning',
          dangerouslyUseHTMLString: true,
        })
          .then(() => {
            // 全部结算时，弹出是否执行关台操作页面，如果点击确认执行结算并关台操作
            this.submitSettleTask(url, params, dialog);
          })
          .catch((action) => {
            // 区分关闭和取消按钮
            if (action === 'cancel') {
              // 全部结算时，弹出是否执行关台操作页面，如果点击取消执行结算但是不关台,此时也就相当于部分结算状态，因此此时应将结算状态手工改为部分结算状态
              params.settleType = 1;
              this.submitSettleTask(url, params, dialog);
            }
          });
      } else {
        this.submitSettleTask(url, params, dialog);
      }
    },
    // 结算请求接口逻辑
    submitSettleTask(url, params) {
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
        needToken: true,
      }).then((res) => {
        if (+res.result === 1) {
          // 有开钱箱权限 并且有现金混付的情况 打开钱箱
          if (
            this.outDeviceSetting.isAccounAutoOpenCashbox === true
            && this.hasCashPayWay()
          ) {
            this.payMoneyBox();
          }
          this.$vemit('closeAuthCheck');
          this.$message.success(`${this.$t('Dict.SuccessfulSettlement')}`);
          this.$vemit('closeSettleDialog');
          this.normalCloseHandler();
          if (+this.posInfo.controlMode !== 3) {
            this.setIsBatchOperation(false);
            this.$vemit('resetOrderSearchText');
            setTimeout(() => {
              this.$vemit('clearEmptyBill', {});
            }, 0);
          } else { // 快餐模式
            const d = res.data;
            if (d && d.printD && d.printD.printType === 'PRINT_PARALLEL') {
              this.fastPrintAddBill(d.printD.printD);
            }
            if (d && d.bizPrintLeaveTableParamsList) {
              this.printLeaveTable(d.bizPrintLeaveTableParamsList);
            }
            setTimeout(() => {
              this.$vemit('fastClearEmptyBill', +params.giveChange);
            }, 0);
            this.$vemit('clearSearch');
          }
          // 如果是关账或是废单,不打印结账单
          // 结算成功是否打印结账单提示 0：不开启打印结账单提醒 1：开启打印结账单提醒
          const { isEnableAlertWhenPrintSettleBill } = this.billData;
          if (+isEnableAlertWhenPrintSettleBill === 1) {
            this.$confirm(`${this.$t('Biz.Settlement.Tip9')}`, `${this.$t('Dict.Tips')}`, {
              confirmButtonText: `${this.$t('Dict.Sure')}`,
              cancelButtonText: this.$t('Dict.Cancel'),
              type: 'warning',
              dangerouslyUseHTMLString: true,
            }).then(() => {
              this.printSettleBill();
            }).catch(() => {
              this.$message({
                type: 'info',
                message: this.$t('Dict.OperationCancelled'),
              });
            });
          } else {
            this.printSettleBill();
          }
        } else if (+res.result === -1) {
          this.errorMsgDisplay(res.msg);
        } else if (+res.result === -2) { // 没有成功的是 -2  就是弹验证授权框
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else {
          this.printSettleBill();
        }
      }).catch((code, msg) => {
        this.errorMsgDisplay(msg);
      });
    },
    // 分页跳转
    pageForWard(type, currentPage) {
      this.pageData[type].currentPage = currentPage - 1;
      if (type === 'discType') {
        // 点击翻页按钮选中
        this.shemePageOrder = currentPage;
        this.discTypeList = this.sliceArray(type);
      } else if (type === 'payWayType') {
        // 点击翻页按钮选中
        this.payWayPageOrder = currentPage;
        this.payWayList = this.sliceArray(type);
      } else if (type === 'useDiscAndPayWayType') {
        this.discAndPayWayData = this.sliceArray(type);
      }
    },
    // 固定打折优惠-调用接口
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
      })
        .catch((msgCode, msg) => {
          this.$message({
            message: msg,
            type: 'warning',
          });
        });
    },
    // 满减优惠(账单)-调用接口: teamBsIds代表的是团队bsId
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
    // 满减优惠(品项)(新增的-187)-调用接口:
    fulloffplanview(fullId, callback) {
      ajax('canyin.pos.settlement.fulloffplanview', {
        params: {
          bsid: this.baseBs.id,
          pointid: this.resData.pointId,
          planid: fullId,
        },
      }).then((data) => {
        callback(data);
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    // 普通打折-调用接口
    // useType-修改状态(重复打开相关打折)标识,目前只用于"优惠券方案"
    disctypeDiscountPlan(discountId, test, useType) {
      ajax('canyin.pos.settlement.disctypeDiscountPlan', {
        params: {
          bsid: this.baseBs.id,
          pointid: this.resData.pointId,
          planid: discountId,
          type: useType || null, // 优惠券方案-新建(传空) || 修改(传值)
        },
      }).then((data) => {
        /**
           * 普通折扣方案有效市别校验
           * 不含'定额优惠方案',普通折扣方案,点击打开窗口前,由后台完成该折扣方案是否在有效市别内;
           * 校验结果返回code != '1'的结果中,由接口进行弹窗提示.并执行刷新结算页面数据
           * 刷新结算页面,是为了排除该失效的折扣方案.
           */
        // 执行打开窗口的回调
        test(data);
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
        // 判断 失效时返回2,执行相关操作
        if (msgCode === '2') {
          // 弹出错误信息, 并刷新页面, 刷新最新数据
          this.refreshBill();
          // 重新获取折扣优惠, 并执行数据更新
          this.reGetDiscPlanAndPayWay();
        }
      });
    },
    // 重新获取优惠类型数据
    reGetDiscPlanAndPayWay() {
      const params = {
        pointId: this.resData.pointId, // pointId当前的客位
        controlMode: this.posBaseInfo.controlMode, // 营业类型
      };
      // 非 快餐模式下 isTeamBill 是否是团队客位
      if (this.posBaseInfo.controlMode !== '3') {
        params.isTeamBill = this.posOrderBill.bsData.is_team;
      }
      ajax('canyin.pos.settlement.settle.getdiscplanandpayway',
        { params }).then((res) => {
        /**
           * 注意: 此处代码执行顺序不可变!!!
           */
        // 查找页面存储折扣优惠和接口更新数据后的不同项
        const overdue = differenceWith(
          // 页面缓存的折扣数据
          this.resData.discPlanAndPayWayData.discTypeList.discountPlanList,
          // 更新接口的折扣数据(过滤调了过期失效的)
          res.discTypeList.discountPlanList,
          // 深度比较参数
          isEqual,
        );
        // 更新折扣优惠数据
        this.resData.discPlanAndPayWayData.discTypeList.discountPlanList = cloneDeep(
          res.discTypeList.discountPlanList,
        );
        // 用onOpen执行重新初始化页面功能
        this.onOpen();
        // 删除已失效的快捷键(活动方案中的快捷键信息,this.hotDisPlanList已实时更新)
        if (overdue.length) {
          overdue.forEach((disItem) => {
            if (disItem.shortKey) {
              this.$hotKey.clearBoundOperation(`PosDialog.AddPayHotkey.${disItem.shortKey}.ctrl`);
            }
          });
        }
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
      window.addEventListener('keydown', () => {
        this.rationDiscOptSwitch = false;
      });
    },
    // 全单优惠
    AllSinglePreferential(discDialog, discType) {
      const { discTypeId } = discType;
      this.disctypeviewData((data) => {
        this.$refs[discDialog].open(
          {
            data,
            discTypeId,
            isTeamBill: this.isTeamBill,
            isTeamSettlementFlg: this.isTeamSettlementFlg,
            baseBs: this.baseBs,
          },
          {
            submit: () => {
              this.refreshBill();
            },
          },
        );
      });
    },
    // 类别优惠
    CategoryPreference(discDialog, discType) {
      const { discTypeId } = discType;
      this.disctypeviewData((data) => {
        this.$refs[discDialog].open(
          {
            data,
            discTypeId,
            isTeamBill: this.isTeamBill,
            isTeamSettlementFlg: this.isTeamSettlementFlg,
            baseBs: this.baseBs,
          },
          {
            submit: () => {
              this.refreshBill();
            },
          },
        );
      });
    },
    // 单品优惠
    SingleProductDiscount(discDialog, discType) {
      const { discTypeId } = discType;
      this.disctypeviewData((data) => {
        this.$refs[discDialog].open(
          {
            data,
            discTypeId,
            isTeamBill: this.isTeamBill,
            isTeamSettlementFlg: this.isTeamSettlementFlg,
            baseBs: this.baseBs,
          },
          {
            submit: () => {
              this.refreshBill();
            },
          },
        );
      });
    },
    // 折扣优惠
    Discount(discDialog, discType) {
      const { discTypeId } = discType;
      const discountId = discType.dicountPlanId;
      const tmpData = {
        discountId,
        discTypeId,
        isTeamBill: this.isTeamBill,
        isTeamSettlementFlg: this.isTeamSettlementFlg,
        baseBs: this.baseBs,
      };
        // 第N杯打折
      if (+discType.discMode === 1) {
        this.nCupDiscount(discType);
      } else if (+discType.discMode === 2) {
        // 定额优惠
        this.fixedDiscount(discountId, (data) => {
          tmpData.data = data;
          tmpData.data.rationDiscount = {
            name: discType.discTypeName,
          };
          this.$refs.rationDiscount.open(
            tmpData,
            {
              submit: () => {
                this.refreshBill();
              },
            },
          );
        });
      } else if (+discType.discMode === 3) {
      // 优惠券方案
        if (this.judgeisTeamSettlement()) {
          this.$message({
            message: '优惠券方案不支持团队业务',
            type: 'warning',
          });
          return false;
        }
        // 修改状态标识参数,用于(修改时的):接口传参
        const useType = find(this.haveUsePayWay, { dpId: discountId }) ? 1 : null;
        this.disctypeDiscountPlan(
          discountId,
          (data) => {
            tmpData.data = data;
            tmpData.data.useType = useType;
            tmpData.controlMode = this.posInfo.controlMode;
            this.$refs.couponDisc.open(
              tmpData,
              {
                submit: () => {
                  this.refreshBill();
                },
              },
            );
          },
          useType,
        );
      } else if (+discType.discMode === 5) {
        // 满减(品项)
        this.fulloffplanview(discountId, (data) => {
          this.$refs.FullSubtraction.open(
            {
              // 品项型满减(187新增), 打开"满减"组件
              openType: 'item',
              data,
              discTypeId,
              discountId,
              isTeamBill: this.isTeamBill,
              isTeamSettlementFlg: this.isTeamSettlementFlg,
              baseBs: this.baseBs,
            },
            {
              submit: () => {
                this.refreshBill();
              },
            },
          );
        });
      } else {
      // 普通打折
        // 修改状态标识参数,用于(修改时的):页面传参
        const useType = find(this.haveUsePayWay, { dpId: discountId }) ? 1 : 0;
        this.disctypeDiscountPlan(discountId, (data) => {
          tmpData.data = data;
          tmpData.data.useType = useType;
          this.$refs[discDialog].open(
            tmpData,
            {
              submit: () => {
                this.refreshBill();
              },
            },
          );
        });
      }
    },
    // 比例优惠
    ProportionPreferential(discDialog, discType) {
      const { discTypeId } = discType;
      this.disctypeviewData((data) => {
        this.$refs[discDialog].open(
          {
            data,
            discTypeId,
            isTeamBill: this.isTeamBill,
            isTeamSettlementFlg: this.isTeamSettlementFlg,
            baseBs: this.baseBs,
          },
          {
            submit: () => {
              this.refreshBill();
            },
          },
        );
      });
    },
    // 手工定额
    Ration(discDialog) {
      const { maxFixMoney } = this.baseBs;
      this.$refs[discDialog].open(
        {
          maxFixMoney,
          isTeamBill: this.isTeamBill,
          isTeamSettlementFlg: this.isTeamSettlementFlg,
          baseBs: this.baseBs,
        },
        {
          submit: (data) => {
            // 手工定额的金额
            this.rationInputCount = data;
            this.refreshBill();
          },
        },
      );
    },
    // 满减优惠(账单)
    FullSubtraction(discDialog, discType) {
      const fullId = discType.dicountPlanId;
      this.disctypeFulloffPlan(fullId, (data) => {
        this.$refs[discDialog].open(
          {
            // 账单型满减(原), 打开"满减"组件
            openType: 'bill',
            data,
            fullId,
            isTeamBill: this.isTeamBill,
            isTeamSettlementFlg: this.isTeamSettlementFlg,
            baseBs: this.baseBs,
          },
          {
            submit: () => {
              this.refreshBill();
            },
          },
        );
      });
    },
    // 执行第N杯打折
    nCupDiscount(discType, authData = {}) {
      this.$vonce('authCode', (code) => {
        this.nCupDiscount(discType, code);
      });
      const params = {
        bsId: this.baseBs.id,
        pointId: this.resData.pointId,
        disctype: discType.discTypeId,
        planid: discType.dicountPlanId,
        controlMode: this.posBaseInfo.controlMode,
        ...authData,
      };
      let url = 'canyin.pos.settlement.scale';
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
        params.teamPointIds = this.baseBs.teamPointIds;
        params.teamBsIds = this.baseBs.teamBsIds;
        url = 'canyin.pos.settlement.teamscale';
      }
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success) {
          if (data.data
              && data.data.disc_money === 0
          ) {
            this.$message({
              message: `${this.$t('Biz.Settlement.Error48')}`,
              type: 'error',
            });
            return false;
          }
          // 上传优惠类型到VueX
          this.setDiscTypeCache(params);
          this.refreshBill();
          this.$message({
            message: `${this.$t('Biz.Settlement.Success3')}`,
            type: 'success',
          });
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
    },
    // 冥晨验券
    MinChenVerifyTicket() {
      if (this.isMinChenVIP === true) { // 是否验证过会员
        const params = {
          pointId: this.resData.pointId,
          bsId: this.baseBs.id,
        };
        const url = 'canyin.pos.settlement.pay.crmPayWay.mingchengetcrmticketlistbymemberid';
        ajax(url, {
          params,
        }).then((res) => {
          if (res.result === 1) {
            if (res.data && res.data.ticketList) {
              this.$refs.MinChenVerifyTicket.open({
                ticketList: res.data.ticketList,
              });
            }
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        });
      } else {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning35')}`);
      }
    },
    // 取消优惠
    cancelSelectedActive(discType) {
      const typeId = discType.discType;
      const disPlanId = discType.dpId;
      const { mcTicketId } = discType; // 撤销冥晨验券
      const { foId } = discType;
      // 已添加结算方式,冻结活动方案操作
      const isExistPayWay = this.checkExistPayWay();
      if (isExistPayWay === 1) {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error49')}`,
          duration: 2000,
        });
      } else if (+typeId === -10001 || +typeId === -2) {
        this.$message({
          message: `${this.$t('Biz.Settlement.Warning36')}`,
          type: 'warning',
        });
      } else if (typeId < 0 && +typeId !== -10001) {
        // 满减，定额 手动定额typeId:-1,满减typeId:-3
        let fixUrl = 'canyin.pos.settlement.fiexd';
        const params = {
          bsId: this.baseBs.id,
          pointId: this.resData.pointId,
          money: 0,
          foId: foId || null,
          mcTicketId: mcTicketId || null,
        };
        const teamSettelement = this.judgeisTeamSettlement();
        if (teamSettelement !== false) {
          // 团队结算
          params.teamBsIds = teamSettelement.teamBsIds;
          params.teamPointIds = teamSettelement.teamPointIds;
          fixUrl = teamSettelement.urlTeamfiexd;
        }
        ajax(fixUrl, {
          contentType: 'paramsEncoded',
          data: params,
        }).then((data) => {
          if (data.success) {
            this.$message({
              message: `${this.$t('Biz.Settlement.Success12')}`,
              type: 'success',
            });
            this.setSettleDiscType({ list: this.baseBs.id });
            this.refreshBill('1');
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
      } else if (typeId > 0) {
        // 其他活动方案
        let discUrl = 'canyin.pos.settlement.scale';
        const params = {
          bsId: this.baseBs.id,
          pointId: this.resData.pointId,
          disctype: 0,
          controlMode: this.posBaseInfo.controlMode,
          cancelDisctype: typeId, // 取消优惠的折扣类型
          cancelDisPlanId: disPlanId || null, // 取消优惠的打折方案ID
          mcTicketId: mcTicketId || null,
        };
        const teamSettelement = this.judgeisTeamSettlement();
        if (teamSettelement !== false) {
          // 团队结算
          params.teamBsIds = teamSettelement.teamBsIds;
          params.teamPointIds = teamSettelement.teamPointIds;
          discUrl = teamSettelement.urlTeamscale;
        }
        ajax(discUrl, {
          contentType: 'paramsEncoded',
          data: params,
        }).then((data) => {
          if (data.success) {
            this.$message({
              message: `${this.$t('Biz.Settlement.Success12')}`,
              type: 'success',
            });
            this.setSettleDiscType({ list: this.baseBs.id });
            this.refreshBill('1');
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
    async cancelSelected(discType, event) {
      this.deletePayWayData = discType;
      // 取消优惠
      if (discType.type === 1) {
        // 阻拦 如果账单已预扣("先付后折"计算优惠),不允许单独删除打折
        // 删除折扣优惠时会有问题,允许打折就允许了删除,但是先预扣,再打折,也视为预扣,不能单独删除打折
        if (this.payThenDiscountFlg && this.haveUsePayWay.some(item => item.type === 2)) {
          this.$message({
            type: 'error',
            message: '请先删除已用结算方式，再进行优惠取消！',
            duration: 2000,
          });
          return false;
        }
        // 点击已添加的优惠-这时判断为'定额优惠'类型,显示小弹窗(显示修改||删除),并确定需要显示的位置
        if (discType.discMode && discType.discMode === 2) {
          // 弹窗开关
          this.rationDiscOptSwitch = !this.rationDiscOptSwitch;
          // 传入的'定额优惠'方案数据
          this.rationDiscSchemeData = discType;
          // 调用处理定额优惠方案(已添加)按钮的位置
          this.rationDiscBtnPosition(discType, event);
        } else {
          // 普通打折
          this.cancelSelectedActive(discType);
          // 快餐时, 重置外部添加N杯打折,结算页内阻止打折开关
          if (this.posInfo.controlMode === '3') {
            this.fastFoodUsedNCupDiscFlg = false;
          }
        }
      } else if (discType.type === 2) {
        // 判断是否可以部分退
        const {
          take_money, attrs, payway_id, payway_type_id, ts_id,
        } = discType;
        // 是否是线上预付支付方式
        // 是否需要找零
        // 是否只有线上预付结算方式
        const bool = this.haveUsePayWay.some(item => item.type == 2 && item.payway_id !== '18');
        if (
          payway_id === '18'
          && this.giveChange > 0
          && take_money > this.giveChange
          && !bool
        ) {
          const res = await this.isContentOnlineRevoke(attrs);
          const shouldOpen = res.data.data.onlinePayRefund || false;
          if (shouldOpen) {
            this.revokeFactMoney = this.giveChange;
            this.showConfirmDialog = shouldOpen;
          } else {
            // 删除结算方式
            this.deletePayWayToastMsg(discType);
          }
        } else {
          // 删除结算方式
          this.deletePayWayToastMsg(discType);
        }
      } else {
        // 相当于点击下一页按钮
        // 已选结算方式翻页
        this.discAndPayWayData = this.sliceArray('useDiscAndPayWayType', true);
      }
    },
    // 结算方式是否满足线上部分退
    isContentOnlineRevoke(attrs) {
      return ajax('canyin.pos.settlement.canonlinepayrefund', {
        contentType: 'URLEncoded',
        loading: false,
        data: {
          bsCode: this.baseBs.code,
          from: 1,
          orderId: attrs.wuuorderid,
        },
      });
    },
    // 删除线上预付支付方式(部分退) ---> 删除
    deleteOnlinePayRevoke() {
      this.showConfirmDialog = false;
      this.deletePayWayToastMsg(this.deletePayWayData);
    },
    // 删除线上预付支付方式(部分退) ---> 退差额
    revokeMoney() {
      this.showConfirmDialog = false;
      this.$confirm(
        this.$t('Biz.Settlement.IndexMsg9', [this.revokeFactMoney]),
        this.$t('Dict.Tips'),
        {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: `${this.$t('Dict.Cancel')}`,
          type: 'warning',
          dangerouslyUseHTMLString: true,
        },
      ).then(() => {
        // 执行线上部分退
        ajax('canyin.pos.settlement.onlinepayrefund', {
          contentType: 'URLEncoded',
          data: {
            from: 1,
            bsId: this.baseBs.id,
            orderId: this.deletePayWayData.attrs.wuuorderid,
            money: this.revokeFactMoney,
            empId: this.posBaseInfo.user.id, // 操作人id
            posId: this.posInfo.id,
          },
        }).then((res) => {
          if (res.data.code === '1') {
            this.$message.success(`${res.data.data.msg}`);
            this.refreshBill();
          } else {
            this.$message.error(`${res.data.msg}`);
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('Dict.OperationCancelled'),
        });
      });
    },
    /**
     * 这个方法很早就废弃了,代码一直不删,撤销入库的线下结算方式,都走cancelSettle.
     * 现 添加注释, 代码留存
     */
    // 撤销线下结算方式
    doCancelOfflinePayway(paywayId) {
      const params = {
        paywayId,
        bsId: this.baseBs.id,
      };
      ajax('canyin.pos.settlement.docancelofflinetspayway', {
        params,
      }).then((res) => {
        if (+res.code === 1) {
          if (+this.getVuexPointData.state === 6 && this.haveUsePayWay.length) {
            // 中餐且預付狀態，需要去掉所有的結算方式才撤銷預付
            this.undoPayPayAdvance();
          } else {
            this.refreshBill('1');
          }
        }
      });
    },
    aggregationPay(params, type = 0) {
      const requestData = this.tongLianParams(params);
      if (type === 0) {
        this.clearPayWayByPayWay('56');
      } else {
        this.clearPayWayByPayWay('57');
      }
      Object.assign(requestData, {
        consumeType: type,
        payAllMoney: params.money,
      });
      return ajax('canyin.pos.settlement.pay.polymer.settle', {
        contentType: 'URLEncoded',
        loading: false,
        timeout: 70000,
        data: requestData,
      });
    },
    // 通联支付请求所需数据
    tongLianParams(params) {
      this.addPayWay({
        payway_id: this.payWay.id,
        name: this.payWay.name,
        payway_type_id: this.payWay.payway_type_id,
        take_money: Number(params.money).toFixed(2),
        pay_money: Number(params.money).toFixed(2),
        give_change: 0,
        is_deposit: 0,
        sort_order: 1,
        finish: false,
        dis_name: '',
        confirm_del: this.payWay.isconfirmdelete,
      });
      const baseData = this.getBaseSubmitParams();
      baseData.payway_list = this.getSubmitPayWay();
      const requestData = {
        payMoney: params.money,
        cardNo: params.cardNo,
        pointId: this.resData.pointId,
        bsId: this.baseBs.id, // 流水id
        isTeamSettle: !!this.judgeisTeamSettlement(), // 是否是团队
      };
      requestData.params = JSON.stringify(baseData);
      return requestData;
    },
    // 通联银行卡点击确认按钮支付
    tongLianPay(params) {
      this.loading = this.$loading({
        lock: true,
        text: '支付中，请刷卡确认',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      });
      this.componentsLoading = true;
      this.closeByEsc = false;
      const timer = setTimeout(() => {
        this.loading.close();
        this.componentsLoading = false;
        this.closeByEsc = true;
      }, 70000);
      ajax('canyin.pos.settlement.pay.unitedbank.settle', {
        contentType: 'URLEncoded',
        loading: false,
        timeout: 70000,
        data: this.tongLianParams(params),
      }).then((res) => {
        const { success, msg } = res;
        if (success) {
          clearTimeout(timer);
          this.loading.close();
          this.componentsLoading = false;
          this.closeByEsc = true;
          this.$refs.TongLianPaymentCode.close();
          this.refreshBill();
        } else {
          this.clearPayWayByPayWay('47');
          clearTimeout(timer);
          this.loading.close();
          this.componentsLoading = false;
          this.closeByEsc = true;
          this.$message.error(`${msg}`);
        }
      });
    },
    // 通联银行卡点击手动确认
    tongLianManualSettle(params) {
      const baseData = this.getBaseSubmitParams();
      if (params.which === '1') {
        this.addPayWay({
          payway_id: this.payWay.id,
          name: this.payWay.name,
          payway_type_id: this.payWay.payway_type_id,
          take_money: Number(params.money).toFixed(2),
          pay_money: Number(params.money).toFixed(2),
          give_change: 0,
          is_deposit: 0,
          sort_order: 1,
          finish: false,
          dis_name: '',
          confirm_del: this.payWay.isconfirmdelete,
        });
        baseData.payway_list = this.getSubmitPayWay();
        this.clearPayWayByPayWay(this.payWay.id);
      }
      // baseData.payway_list = this.getSubmitPayWay();
      const requestData = {
        payMoney: params.money,
        cardNo: params.cardNo,
        pointId: this.resData.pointId,
        bsId: this.baseBs.id, // 流水id
        isTeamSettle: !!this.judgeisTeamSettlement(), // 是否是团队
      };
      requestData.params = JSON.stringify(baseData);
      let url = '';
      if (params.which === '0') { // 通联银行卡手动确认
        url = 'canyin.pos.settlement.pay.unitedbank.settlecheck';
      } else { // 聚合支付手动确认
        url = 'canyin.pos.settlement.pay.polymer.settlecheck';
        requestData.payAllMoney = requestData.payMoney;
        if (params.modal === 'scanCode') { // 聚合支付扫码的手动确认
          requestData.consumeType = 1;
        } else {
          requestData.consumeType = 0; // 聚合支付银行卡的手动确认
        }
      }
      ajax(url, {
        contentType: 'URLEncoded',
        loading: false,
        timeout: 60000,
        data: requestData,
      }).then((res) => {
        if (params.which === '0') { // 通联小程序会自动确认，这里不做任何操作
        } else { // 聚合支付
          if (res.success) {
            if (params.modal === 'scanCode') { // 关闭聚合扫码付
              setTimeout(() => { // 刷新客位
                this.$vemit('clearEmptyBill', {});
              }, 200);
              this.$refs.AlipayPaymentCode.close();
              this.$vemit('closeSettleDialog');
            } else { // 关闭聚合银行卡
              this.refreshBill();
              this.$refs.TongLianPaymentCode.close();
            }
          } else {
            this.$message.error(`${res.msg}`);
          }
        }
      });
    },
    doTongLianForceSettle(params, codeData = {}) {
      // this.addPayWay({
      //   payway_id: this.payWay.id,
      //   name: this.payWay.name,
      //   payway_type_id: this.payWay.payway_type_id,
      //   take_money: Number(params.money).toFixed(2),
      //   pay_money: Number(params.money).toFixed(2),
      //   give_change: 0,
      //   is_deposit: 0,
      //   sort_order: 1,
      //   finish: false,
      //   dis_name: '',
      //   confirm_del: this.payWay.isconfirmdelete,
      // });
      const baseData = this.getBaseSubmitParams();
      baseData.payway_list = this.getSubmitPayWay();
      const requestData = {
        payMoney: params.money,
        cardNo: params.cardNo,
        pointId: this.resData.pointId,
        bsId: this.baseBs.id, // 流水id
        isTeamSettle: !!this.judgeisTeamSettlement(), // 是否是团队
        ...codeData,
      };
      requestData.params = JSON.stringify(baseData);
      let url = '';
      if (params.which === '0') { // 通联银行卡强制结算
        url = 'canyin.pos.settlement.pay.unitedbank.settleforce';
      } else { // 聚合支付强制结算
        url = 'canyin.pos.settlement.pay.polymer.settleforce';
        requestData.consumeType = 0;
        requestData.payAllMoney = requestData.payMoney;
      }
      ajax(url, {
        contentType: 'URLEncoded',
        data: requestData,
      }).then((res) => {
        const { msg, result } = res;
        if (+result === -2) { // 没有成功的是 -2  就是弹验证授权框
          this.$vemit('posAuthCheck', {
            message: msg,
          });
        } else if (+result === -1) {
          this.$message.error(`${msg}`);
        } else {
          this.refreshBill();
          this.$refs.TongLianPaymentCode.close();
        }
        // this.$message.error(`${msg}`);
        // this.clearPayWayByPayWay('47');
      });
    },
    // 通联银行卡点击强制结算
    tongLianEnforceSettle(params, codeData = {}) {
      this.$vonce('authCode', (code) => {
        this.tongLianEnforceSettle(params, code);
      });
      if (Object.keys(codeData).length === 0) {
        const msg = '<b style="color:red; font-size:20px">请注意，您正在操作强制结算。<br>'
            + '未确认:客户支付信息正确并且已经支付成功,将出现跑单！</b><br>（接收到线上支付成功消息后会自动结算）';
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true,
        }).then(() => {
          this.doTongLianForceSettle(params, codeData);
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作',
          });
        });
      } else {
        this.doTongLianForceSettle(params, codeData);
      }
    },
    // 刷新账单
    refreshBill(IsVerifyOrErrorRefresh) {
      this.clearPageData();
      // 清除已使用的优惠类型和结算方式
      this.pageData.useDiscAndPayWayType.origDataList = [];
      // 快餐模式
      if (+this.posInfo.controlMode !== 3) {
        // 收银模式
        // 刷新客位账单
        // eslint-disable-next-line eqeqeq
        if (this.getVuexPointData.state == tableState.VACANCY) {
          this.getOrderBill({ list: null });
        } else {
          console.log('Pay/Index1');
          this.$vemit('loadBill', this.resData.pointId);
        }
      } else {
        // 快餐模式下每次刷新营业流传手工定额的值(副屏使用)
        this.$vemit('fastLoadBillBus', {
          fromSettle: true,
          dontClearRemark: true,
        });
      }
      // 重新获取结算界面的数据
      this.getSettlementData(this.resData, false, IsVerifyOrErrorRefresh);
    },
    // 检查当前添加的结算方式, 判断相应逻辑, 能否继续添加折扣优惠和取消折扣优惠
    checkExistPayWay() {
      let isExistPayWay = 0;
      /**
       * this.payThenDiscountFlg - 预扣状态("先付后折"优惠计算)
       * isUseTicketFirst - 含折现率结算方式的标识(折现率结算方式使用后,可以再加折扣=>"先付后折"业务=>预扣)
       */
      this.haveUsePayWay.some((item, index) => {
        // 含有结算方式,不可再添加优惠折扣. 但添加特殊结算除外(可再执行折扣)
        // 184.4(186)-20200117实现"先付后折"的"券折折"逻辑,放开预扣后不能再打折的逻辑
        // 删除折扣优惠时会有问题,允许打折就允许了删除,但是先预扣,再打折,也视为预扣,不能单独删除打折
        if (item.type === 2 && !item.isUseTicketFirst) {
          isExistPayWay = 1;
          // 返回判断结果，循环节流
          return true;
        }
        // 未预扣时, 含有 自动执行的折扣优惠(discType == -10001), 可继续执行"先付后折"业务;
        // 手动执行折扣优惠(discType有0/1/2/3/4/5/6)后, 不可再使用"先付后折"业务;
        // ## 所有优惠折扣(无论自动或手动),使用后均会入库, 来自settle接口的pointDiscList;
        const tmpDiscItem = this.haveUsePayWay[index - 1] || null; // 已加结算方式的前一个结算或折扣
        if (!this.payThenDiscountFlg // 未预扣时（初始添加）
          && item.isUseTicketFirst // 有结算且为含折现率属性时
          && tmpDiscItem // 前一个为折扣时
          && tmpDiscItem.discType // 前一个为折扣时
          && tmpDiscItem.discType !== -10001 // 前一个折扣为自动执行优惠
        ) {
          if (item.payway_id === '55' && item.take_money === 0) { // 过滤掉鱼酷会员券0元
            return true;
          }
          isExistPayWay = 1;
          // 返回判断结果，循环节流
          return true;
        }
      });
      // 常规业务状态均可执行打折
      return isExistPayWay;
    },
    // 使用线上结算方式
    paymentCode(payWay) {
      const { amountToBePaid } = this;
      const tmpMoney = amountToBePaid;
      /* 自助餐时结算,使用微信/支付宝类线上结算方式
       * 逻辑: 只能使用微信/支付宝/二合一等三种付款码(其他的付款码和二维码不可用于支付押金) */
      let buffetCheckState = false; // 自助餐可结算状态开关
      const depositParam = {}; // 自助餐-结算用参数
      // 自助餐时
      if (this.posSettings.isOpenBuffetDeposit
        && this.buffetDataForSettle.buffetDeposit
      ) {
        // 押金参数
        const { buffetDeposit, depositId } = this.buffetDataForSettle;
        // 已用结算数据
        const buffetUsePaywayList = this.getSubmitPayWay();
        // 1. 所用结算方式(buffetUsePaywayList)中(已含有当前要用的扫码结算), 每个均小于押金金额: 阻拦结算
        if (buffetUsePaywayList.every(item => item.pay_money < buffetDeposit)
          && amountToBePaid < buffetDeposit
        ) {
          this.$message.error(this.$t('Biz.Settlement.buffetTip01'));
          return false;
        }
        // 2.因二维码和扫码付均只能为最后一个结算, 如果不是支付宝(payWay.id:10)/微信(17)/二合一付款码(37): 阻拦
        if (indexOf(['10', '17', '37'], payWay.id) === -1) {
          this.$message.error(this.$t('Biz.Settlement.buffetTip01'));
          return false;
        }
        // 自助餐可结算状态-可用
        buffetCheckState = true;
        // 3.组装自助押金相关参数
        depositParam.id = depositId; // 押金id
        depositParam.payMoney = buffetDeposit; // 押金金额
        depositParam.paywayId = payWay.id; // 支付押金的结算方式id
      }
      // 前台缓存添加结算
      this.addPayWay({
        payway_id: payWay.id,
        name: payWay.name,
        payway_type_id: payWay.payway_type_id,
        take_money: Number(amountToBePaid).toFixed(2),
        pay_money: Number(amountToBePaid).toFixed(2),
        give_change: 0,
        is_deposit: 0,
        sort_order: 1,
        finish: false,
        dis_name: '',
        confirm_del: payWay.isconfirmdelete,
      });
      const params = this.getBaseSubmitParams();
      const payWayList = this.getSubmitPayWay();
      params.payway_list = payWayList;
      let teamSettlementFlg = 0;
      const teamSettelement = this.judgeisTeamSettlement();
      if (teamSettelement !== false) {
        // 团队结算
        params.teamSettlementFlg = true;
        teamSettlementFlg = 1;
      } else {
        params.teamSettlementFlg = false;
      }
      if (payWay.id === '57') { // 聚合支付扫码付预结方法
        const requestData = {
          consumeType: 1,
          bsId: this.baseBs.id,
          pointId: this.resData.pointId,
          payAllMoney: tmpMoney,
          isTeamSettle: !!teamSettelement,
          params: JSON.stringify(params),
        };
        ajax('canyin.pos.settlement.pay.polymer.show', {
          contentType: 'URLEncoded',
          data: requestData,
          needToken: true,
        }).then((res) => {
          if (res.success) {
            this.refreshBill();
            this.$refs.AlipayPaymentCode.open({
              data: res.data,
              baseBs: this.baseBs,
              payWay,
              haveUsePayWay: this.haveUsePayWay,
            }, {
              submit: data2 => this.aggregationPay(data2, 1),
            });
          } else {
            this.$message.error(`${res.msg}`);
          }
        });
        return;
      }
      // 二维码调用接口
      let url = 'canyin.pos.settlement.pay.scancodepay.qrcode';
      // 付款码调用接口
      if (indexOf(['10', '17', '24', '26', '37', '46', '48', '61'], payWay.id) !== -1) {
        if (+teamSettlementFlg === 0) {
          url = 'canyin.pos.settlement.pay.scancodepay.scancodepayway';
        } else {
          url = 'canyin.pos.settlement.pay.scancodepay.teamscancodepayway';
        }
      }
      // 自助餐使用扫码付结算时, 最后添加参数
      if (buffetCheckState) {
        params.depositParam = depositParam;
      }
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
        needToken: true,
      }).then((res) => {
        // 如果错误res.data 为 null
        // 向副屏传递数据
        // 刷新账单
        if (res && +res.result === 1) {
          this.refreshBill();
          switch (payWay.id) {
            case '4':
              // 微信二维码
              this.$refs.WeChatQRCode.open(res.data);
              this.getQRcodeFun();
              break;
            case '5':
              // 支付宝二维码
              this.$refs.AlipayQRCode.open(res.data);
              this.getQRcodeFun();
              break;
            case '10': // 支付宝付款码
            case '46': // 航空积分(扫码)支付
            case '48': // 一招过(扫码)
              this.$refs.AlipayPaymentCode.open({
                data: res.data,
                baseBs: this.baseBs,
                payWay,
                haveUsePayWay: this.haveUsePayWay,
              });
              break;
            case '17':
              // 微信付款码
              this.$refs.WeChatPaymentCode.open({
                data: res.data,
                baseBs: this.baseBs,
                payWay,
                haveUsePayWay: this.haveUsePayWay,
              });
              break;
            case '19':
              // 闪惠二维码
              this.$refs.ShekHuiQRCode.open(res.data);
              this.getQRcodeFun();
              break;
            case '24':
              // 闪惠付款码
              this.$refs.ShekHuiPaymentCode.open({
                data: res.data,
                baseBs: this.baseBs,
                payWay,
                haveUsePayWay: this.haveUsePayWay,
              });
              break;
            case '25':
              // 云闪付二维码
              this.$refs.UnionPayQRCode.open(res.data);
              this.getQRcodeFun();
              break;
            case '26':
              // 云闪付付款码
              this.$refs.UnionPayPaymentCode.open({
                data: res.data,
                baseBs: this.baseBs,
                payWay,
                haveUsePayWay: this.haveUsePayWay,
              });
              break;
            case '37': // 微信+支付宝二码合一超级无敌付款码
              this.$refs.ScanCode.open({
                data: res.data,
                baseBs: this.baseBs,
                payWay,
                haveUsePayWay: this.haveUsePayWay,
              });
              break;
            case '61': // 菲滋支付
              ajax('canyin.pos.settlement.pay.getfeiziviewurl').then((feiziviewRes) => {
                const tmp = this.posInfo.websocketContextPath.split('//')[1];
                this.$refs.feiZPaymentCode.open({
                  url: feiziviewRes.feiziUrl,
                  shopId: this.posInfo.shopId,
                  ip: tmp.split('/cy7')[0],
                  bsId: this.baseBs.id,
                  origTotal: res.data.paymoney,
                });
                this.getQRcodeFun();
              }).catch((data) => {
                this.$message.error(`${data}`);
              });
              break;
            default:
              console.error('未知的payWay id');
              break;
          }
        } else {
          this.errorMsgDisplay(res.msg);
          this.clearOnlinePayWay();
          // 刷新营业流水
          this.refreshBill('1');
        }
      })
        .catch((errCode, msg) => {
          this.errorMsgDisplay(msg);
          this.clearOnlinePayWay();
          // 刷新营业流水
          this.refreshBill('1');
        });
    },
    // 向副屏传递数据
    getQRcodeFun() {
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'getqrcode',
          result: this.resData.pointId,
        });
      }
    },
    // 是否是团队结算
    judgeisTeamSettlement() {
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
        return {
          teamBsIds: this.baseBs.teamBsIds, // 团队Id
          teamPointIds: this.baseBs.teamPointIds, // 客位Id
          urlTeamcommitsettle: 'canyin.pos.settlement.settle.teamcommitsettle', // 团队提交结算
          urlTeamfiexd: 'canyin.pos.settlement.teamfiexd', // 团队取消优惠
          urlTeamscale: 'canyin.pos.settlement.teamscale', // 团队优惠url
          urlTeampresettle: 'canyin.pos.settlement.settle.teampresettle', // 团队预结打印
          urlTeamundo: 'canyin.pos.settlement.pay.crmPayWay.teamundo', // 一卡通撤销团队
          urlTeamsttle: 'canyin.pos.settlement.pay.crmPayWay.teamsettle', // CRM团队结算
          urlTeamCheckBill: 'canyin.pos.settlement.TeamCheckBill', // 团队埋单操作
        };
      }
      return false;
    },
    // 获取提交的基础参数 埋单或结算
    getBaseSubmitParams() {
      let params;
      if (+this.posInfo.controlMode === 3) {
        // 快餐模式
        params = {
          pointId: this.resData.pointId,
          bsId: this.baseBs.id, // 流水id
          bsCode: this.baseBs.code, // 流水code
          tsRemark: this.settlementRemarkInfo, // 结算备注
          totalInvoiceMoney: this.invoicesOpened, // 发票金额分类传输就行
          invoiceMoney: Number(this.machineInvoice), // 机打的发票值 现在是number类型
          tearingInvoiceMoney: Number(this.handInvoice), // 手撕发票的值 现在是number类型
          lastTotal: Number(this.baseBs.last_total).toFixed(2), // 实4收
          giveChange: Number(this.giveChange).toFixed(2), // 找零
          modifyTime: this.baseBs.modify_time, // 最后修改时间
          orderCode: this.paymentGetBillData.orderCode,
          orderCodeMode: this.paymentGetBillData.orderCodeMode,
          saleTypeId: this.paymentGetBillData.saleTypeId, // 销售类型
          controlMode: this.posBaseInfo.controlMode,
          paramFlag: 0,
          invoiceRemark: this.invoiceRemark, // 开票备注
        };
      } else {
        // 中餐模式
        params = {
          pointId: this.resData.pointId,
          bsId: this.baseBs.id, // 流水id
          bsCode: this.baseBs.code, // 流水code
          tsRemark: this.settlementRemarkInfo, // 结算备注
          totalInvoiceMoney: this.invoicesOpened, // 发票金额分类传输就行
          invoiceMoney: Number(this.machineInvoice), // 机打的发票值 现在是number类型
          tearingInvoiceMoney: Number(this.handInvoice), // 手撕发票的值 现在是number类型
          lastTotal: Number(this.baseBs.last_total).toFixed(2), // 实4收
          giveChange: Number(this.giveChange).toFixed(2), // 找零
          modifyTime: this.baseBs.modify_time, // 最后修改时间
          orderCode: '',
          saleTypeId: this.posOrderBill ? this.posOrderBill.bsData.saleTypeId : 1, // 销售类型
          paramFlag: 0,
          controlMode: this.posBaseInfo.controlMode,
          invoiceRemark: this.invoiceRemark, // 开票备注
          isSelectTeamBtn: this.isTeamSettlementFlg ? this.isSelectTeamBtn : !!this.isTeamSettlementFlg, // this.isSelectTeamBtn这值起初作者写的有问题我只能已补救的方式解决最快最稳的
        };
      }

      const teamSettelement = this.judgeisTeamSettlement();
      if (teamSettelement !== false) {
        // 团队结算
        params.teamPointIds = this.baseBs.teamPointIds;
        params.teamBsIds = this.baseBs.teamBsIds;
      }
      const { sumPayWayMoney } = this;
      if (sumPayWayMoney !== '') {
        // 收款
        params.takeMoney = this.sumPayWayMoney;
      } else {
        // 收款
        params.takeMoney = 0;
      }
      return params;
    },
    // 获取提交的结算方式 埋单或结算
    getSubmitPayWay(filterPayWayId) {
      const payway_list = [];
      if (filterPayWayId == null || filterPayWayId == undefined) {
        filterPayWayId = '-9999';
      }
      // 用于计算找零
      let remain = Number(this.baseBs.last_total);
      // 结算方式序号
      let sortOrder = 1;
      this.haveUsePayWay.forEach((paywayData) => {
        if (paywayData.type === 2 && filterPayWayId != paywayData.payway_id) {
          const paywayTypeId = paywayData.payway_type_id;
          const pwyWayId = paywayData.payway_id;
          const takeMoney = Number(paywayData.take_money);
          const payWayParams = {
            payway_id: paywayData.payway_id, // 结算方式ID
            payway_name: paywayData.name, // 结算方式名称
            payway_type_id: paywayTypeId, // 结算方式类型id
            take_money: takeMoney, // 收款金额
            pay_money: takeMoney, // 支付金额（实收）
            is_deposit: paywayData.is_deposit === 1 ? 1 : 0, // 0非押金结算，1押金结算
            sort_order: sortOrder, // 顺序
            foreignCurrencyMoney: paywayData.foreignCurrencyMoney, // 外币金额，只外币用到此参数
            baseCurrencyName: paywayData.baseCurrencyName, // 本位币名称，只外币用到此参数
          };
          sortOrder += 1;
          if (paywayTypeId === '501' && pwyWayId === '49') { // 押金
            payWayParams.depositList = paywayData.depositList;
          }
          if (paywayTypeId === '502' || paywayTypeId === '503') {
            payWayParams.card_no = paywayData.card_no;
            payWayParams.type_id = paywayData.type_id;
            payWayParams.remark = paywayData.remark;
            payWayParams.dis_name = paywayData.dis_name;
          } else if (paywayTypeId === '504' || paywayTypeId === '505') {
            payWayParams.reason_id = paywayData.reason_id;
            payWayParams.remark = paywayData.remark;
            payWayParams.dis_name = paywayData.dis_name;
          } else if (paywayTypeId === '510') {
            payWayParams.account_id = paywayData.account_id;
            payWayParams.type_id = paywayData.type_id;
            payWayParams.remark = paywayData.remark;
          } else if (paywayTypeId === '506') {
            const ticketValue = paywayData.ticket_value;
            const ticketCount = paywayData.ticket_count;
            if (ticketValue != undefined && ticketValue != null) {
              payWayParams.ticket_value = paywayData.ticket_value.toString();
            }
            if (ticketCount != undefined && ticketCount != null) {
              payWayParams.ticket_count = paywayData.ticket_count.toString();
            }
            payWayParams.no_give_chan = paywayData.no_give_chan;
            payWayParams.remark = paywayData.remark;
          }
          const giveMoney = (takeMoney * 1000 - remain * 1000) / 1000; // 收款 - 应收 = 找零
          if (giveMoney < 0) {
            // 如果不需要找零 说明还富裕
            payWayParams.give_change = 0; // 找零金额
          } else if (remain <= 0) {
            payWayParams.give_change = Number(takeMoney).toFixed(2); // 找零金额
            payWayParams.pay_money = 0;
          } else {
            payWayParams.pay_money = Number(takeMoney - giveMoney).toFixed(2); // 实际支付
            payWayParams.give_change = giveMoney;
          }
          // 剩余金额,下次计算时使用
          remain = Number(remain - takeMoney).toFixed(2);

          // 特殊参数处理
          if (paywayData.attrs != undefined && paywayData.attrs != '') {
            const attrsData = paywayData.attrs;
            for (const key in attrsData) {
              const temp = attrsData[key];
              if (payWayParams[key] == undefined) {
                if (paywayTypeId === '508') {
                  payWayParams[key] = temp.replace(/&quot;/g, '"');
                } else if (paywayTypeId === '506') {
                  if (temp != undefined && temp != null) {
                    payWayParams[key] = temp.toString();
                  } else {
                    payWayParams[key] = temp;
                  }
                } else {
                  payWayParams[key] = temp;
                }
              }
            }
          }
          // 国际化本位币需求：现金类型下，如果添加的结算方式不是本位币的  那么需给后台额外传参
          if (paywayData.allStandardData) {
            Object.assign(payWayParams, {
              foreignCurrencyMoney: paywayData.allStandardData.foreignCurrencyMoney, // 非本位币转换成本位币的金额
              exchangeRate: paywayData.allStandardData.exchangeRate, // 非本位币的汇率
            });
          }
          payway_list.push(payWayParams);
        }
      });
      return payway_list;
    },
    // 检查是否存在线上结算方式
    checkExistOnlinePayWay() {
      const onlinePayWay = [];
      this.haveUsePayWay.forEach((paywayData) => {
        if (paywayData.type === 2 && paywayData.isolpayway) {
          onlinePayWay.push(paywayData);
        }
      });
      return onlinePayWay;
    },
    // 检查是否存在需要确认删除的结算方式
    checkExistNeedConfirmDelPayWay() {
      const needConfirmDelPayWay = [];
      this.haveUsePayWay.forEach((paywayData) => {
        if (paywayData.type === 2 && (paywayData.is_confirm_delete || paywayData.isconfirmdelete)) {
          needConfirmDelPayWay.push(paywayData);
        }
      });
      return needConfirmDelPayWay;
    },
    // 检查是否存在银行卡或者支票结算方式
    checkExistBankOrChequePayWay() {
      const bankOrChequePayWay = [];
      this.haveUsePayWay.forEach((paywayData) => {
        if (
          paywayData.type === 2
            && (+paywayData.payway_type_id === 502
            || +paywayData.payway_type_id === 503)
        ) {
          bankOrChequePayWay.push(paywayData);
        }
      });
      return bankOrChequePayWay;
    },
    // 获取现金类型的支付金额
    getCashTypePayMoney() {
      let payMoney = 0;
      this.haveUsePayWay.forEach((paywayData) => {
        if (paywayData.type === 2 && +paywayData.payway_type_id === 501) {
          payMoney += Number(paywayData.take_money);
        }
      });
      return payMoney;
    },
    // 线上支付结算强制结算
    enforceSettle(code, dialog, ScanCodeData) {
      if (!code) {
        const msg = `<b style="color:red; font-size:20px">${this.$t('Biz.Settlement.Tip10')}<br>${this.$t('Biz.Settlement.Tip11')}</b><br>(${this.$t('Biz.Settlement.Tip12')})`;
        this.$confirm(msg, `${this.$t('Dict.Tips')}`, {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
          dangerouslyUseHTMLString: true,
        })
          .then(() => {
            // 参数enforceSettlement代表强制结算标识
            this.submitSettle('enforceSettlement', code, dialog, ScanCodeData);
            this.closeQRcodeFun();
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('Dict.OperationCancelled'),
            });
          });
      } else {
        // 参数enforceSettlement代表强制结算标识
        this.submitSettle('enforceSettlement', code, dialog, ScanCodeData);
        this.closeQRcodeFun();
      }
    },
    // 线上支付结算手动结算
    manualSettle(typeId, authData = {}) {
      const params = {
        typeId,
        orderid: this.baseBs.code,
        teamBsIds: '',
        ...authData,
      };
      const teamSettelement = this.judgeisTeamSettlement();
      if (teamSettelement !== false) {
        // 团队结算
        params.teamBsIds = teamSettelement.teamBsIds;
      }
      this.$vonce('authCode', (code) => {
        this.manualSettle(typeId, code);
      });
      ajax('canyin.pos.settlement.pay.scancodepay.checkwuupayandsettle', {
        params,
      }).then((res) => {
        if (res) {
          if (res.queryState === false) {
            if (res.resultCode && res.resultCode === '-2') {
              this.$vemit('posAuthCheck', { message: res.resultMsg });
            } else if (res.resultMsg) {
              this.$message({
                type: 'warn',
                message: res.resultMsg,
                duration: 2000,
              });
            } else {
              this.$message({
                type: 'warn',
                message: `${this.$t('Biz.Settlement.Warning37')}`,
                duration: 2000,
              });
            }
          } else if (res.payState) {
            // 支付成功
            if (!res.payMoneyState) {
              // 核对线上支付金额是否一致（一致的情况在后台处理）
              // 金额不一致
              this.onlinePayMoneyError(res);
            } else {
              if (res.resultCode != undefined && res.resultCode !== '000') {
                if (res.resultMsg) {
                  this.$message({
                    type: 'error',
                    message: res.resultMsg,
                    duration: 2000,
                  });
                }
                return;
              }
              this.settlementSuccess(res);
            }
          } else {
            // 支付不成功，提示未支付
            this.$message({
              type: 'warn',
              message: this.$t('Biz.Pos.Member.IndexMsg1'),
              duration: 2000,
              dangerouslyUseHTMLString: true,
            });
          }
        } else {
          this.$message({
            type: 'warn',
            message: `${this.$t('Biz.Settlement.Warning37')}`,
            duration: 2000,
          });
        }
      });
    },
    // 清除已用结算方式 根据支付方式id
    clearPayWayByPayWay(payway_id) {
      let sumPayWayMoneyTemp = 0;
      if (isNaN(this.sumPayWayMoney)) {
        sumPayWayMoneyTemp = 0;
      } else {
        sumPayWayMoneyTemp = this.sumPayWayMoney;
      }
      console.info(`删除结算方式,支付方式id: = ${payway_id}`);
      // 去除haveUsePayWay中已删除的结算方式保证haveUsePayWay是实时的结算方式
      const haveUsePayWayNum = this.haveUsePayWay.length;
      if (haveUsePayWayNum > 0) {
        this.haveUsePayWay = this.haveUsePayWay.filter((payWay) => {
          if (payWay.type == 2) {
            if (payWay.payway_id != payway_id) {
              return true;
            }
            this.sumPayWayMoney = Number(
              Number(sumPayWayMoneyTemp) - Number(payWay.take_money),
            ).toFixed(2);
            return false;
          }
          return true;
        });
      }
      // 删除缓存的页面存有的结算数据
      const { origDataList } = this.pageData.useDiscAndPayWayType;
      if (origDataList.length > 0) {
        this.pageData.useDiscAndPayWayType.origDataList = this.pageData.useDiscAndPayWayType.origDataList.filter((payWay) => {
          if (+payWay.type === 2) {
            if (`${payWay.payway_id}` !== `${payway_id}`) {
              return true;
            }
            return false;
          }
          return true;
        });
      }
      // 删除结算方式
      const newAddPayWayNum = this.newAddPayWayList.length;
      if (newAddPayWayNum > 0) {
        this.newAddPayWayList = this.newAddPayWayList.filter((payWay) => {
          if (+payWay.type === 2) {
            if (`${payWay.payway_id}` !== `${payway_id}`) {
              return true;
            }
            return false;
          }
          return true;
        });
      }
      const newPayWayArray = [];
      if (this.haveUsePayWay.length > 0) {
        this.haveUsePayWay.forEach((payWay) => {
          newPayWayArray.push(payWay);
        });
      }
      this.dealPageData('useDiscAndPayWayType', newPayWayArray, true);
    },
    // 清除已用线上结算方式 根据支付方式id(封装方法)
    clearOnlinePayWay() {
      let sumPayWayMoneyTemp = 0;
      if (isNaN(this.sumPayWayMoney)) {
        sumPayWayMoneyTemp = 0;
      } else {
        sumPayWayMoneyTemp = this.sumPayWayMoney;
      }
      // 删除结算方式
      // 去除haveUsePayWay中已删除的结算方式保证haveUsePayWay是实时的结算方式
      const haveUsePayWayNum = this.haveUsePayWay.length;
      if (haveUsePayWayNum > 0) {
        this.haveUsePayWay = this.haveUsePayWay.filter((payWay) => {
          if (+payWay.type === 2) {
            const isHavePayWay = this.isHavePayWay(
              this.onlineClearData,
              payWay.payway_id,
            );
            if (!isHavePayWay) {
              return true;
            }
            this.sumPayWayMoney = Number(
              Number(sumPayWayMoneyTemp) - Number(payWay.take_money),
            ).toFixed(2);
            return false;
          }
          return true;
        });
      }

      const { origDataList } = this.pageData.useDiscAndPayWayType;
      const origDataListNum = origDataList.length;
      if (origDataListNum > 0) {
        this.pageData.useDiscAndPayWayType.origDataList = this.pageData.useDiscAndPayWayType.origDataList.filter((payWay) => {
          if (+payWay.type === 2) {
            const isHavePayWay = this.isHavePayWay(
              this.onlineClearData,
              payWay.payway_id,
            );
            return !isHavePayWay;
          }
          return true;
        });
      }

      // 删除结算方式
      const newAddPayWayNum = this.newAddPayWayList.length;
      if (newAddPayWayNum > 0) {
        this.newAddPayWayList = this.newAddPayWayList.filter((payWay) => {
          if (+payWay.type === 2) {
            const isHavePayWay = this.isHavePayWay(
              this.onlineClearData,
              payWay.payway_id,
            );
            return !isHavePayWay;
          }
          return true;
        });
      }

      const newPayWayArray = [];
      if (this.haveUsePayWay.length > 0) {
        this.haveUsePayWay.forEach((payWay) => {
          newPayWayArray.push(payWay);
        });
      }
      this.dealPageData('useDiscAndPayWayType', newPayWayArray, true);
    },
    // 关台
    closeBill() {
      this.$confirm(`${this.$t('Biz.Settlement.Tip13')}`, `${this.$t('Dict.Tips')}`, {
        confirmButtonText: `${this.$t('Dict.Sure')}`,
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      })
        .then(() => {
          this.requestCloseBill();
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('Dict.OperationCancelled'),
          });
        });
    },
    requestCloseBill() {
      const params = {
        pointId: this.resData.pointId,
        controlMode: 1,
        teamBsIds: '',
      };
        // 客位属于团队进行关台时,只能脱团再进行结算的关台,将脱团参数传给后台
        // 该操作, 区别于客位界面的团队关台业务.
      if (!this.isSelectTeamBtn) {
        params.quitTeam = true;
      }
      ajax('canyin.pos.closeBill.closeBill', {
        params: { params },
      }).then(() => {
        // 删除搭台后的虚拟客位
        if (this.posInfo.controlMode !== '3' && this.getVuexPointData.pid) {
          this.setCancelTransferPointState(this.getVuexPointData.id);
        }
        this.$message.success(`${this.$t('Biz.Settlement.Success14')}`);
        this.$vemit('clearEmptyBill', {});
        this.$vemit('resetOrderSearchText');
        this.close();
      });
    },
    // 废单
    abandonedBill() {
      this.$confirm(`${this.$t('Biz.Settlement.Tip14')}`, `${this.$t('Dict.Tips')}`, {
        confirmButtonText: `${this.$t('Dict.Sure')}`,
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
        dangerouslyUseHTMLString: true,
      })
        .then(() => {
          this.requestAbandonedBill();
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('Dict.OperationCancelled'),
          });
        });
    },
    requestAbandonedBill(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.requestAbandonedBill(code);
      });
      const params = {
        pointId: this.resData.pointId,
        teamBsIds: '',
        ...authData,
      };
      ajax('canyin.pos.abandonedbill.abandonedbill', {
        params: { params },
      }).then((res) => {
        if (res.result === 1) {
          this.$message.success('废单成功');
          // 废单打印
          const url = 'canyin.pos.printsettle.getsettleprintdata';
          const teamSettelement = this.judgeisTeamSettlement();
          const params = { bsId: this.baseBs.id, styleType: 1 };
          if (teamSettelement !== false) {
            // 团队结算
            params.isCheckTeam = true;
          } else {
            params.isCheckTeam = false;
          }
          this.$vemit(
            this.posInfo.controlMode === '3'
              ? 'fastCommonPrint'
              : 'commonPrint',
            {
              url,
              params,
              printType: 1,
            },
          );
          this.$vemit('clearEmptyBill', {});
          this.$vemit('resetOrderSearchText');
        } else if (res.result === -2) {
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else {
          this.$message({
            type: 'error',
            message: res.msg,
            duration: 2000,
          });
        }
      });
      this.close();
    },
    // 结算备注
    settlementRemark(val) {
      this.settlementRemarkInfo = val;
    },
    // 使用押金
    useDeposit(arr) {
      // 检查是否存在结算方式
      const isExistPayWay = this.checkExistPayWay();
      if (+isExistPayWay === 0) {
        // 先清除押金类型的结算方式
        this.clearPayWayByPayWay('0');
        const depositList = [];
        const allUsedMoney = arr.reduce((sum, item) => (add(sum, item.payMoney)), 0);
        arr.map((item) => {
          depositList.push({
            depositId: item.id,
            depositCode: item.code,
          });
        });
        this.addPayWay({
          payway_id: '49',
          name: `${this.$t('Dict.Btn.Deposit')}`,
          payway_type_id: '501',
          take_money: Number(allUsedMoney),
          pay_money: Number(allUsedMoney),
          give_change: 0,
          is_deposit: 1,
          sort_order: 1,
          depositList, // 使用的押金单code和id集合
          finish: false,
          dis_name: '',
          confirm_del: false,
        });
      } else {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error50')}`,
        });
      }
    },
    errorMsgDisplay(msg) {
      const teamSettelement = this.judgeisTeamSettlement();
      let message = '';
      if (msg == '2') {
        if (teamSettelement !== false) {
          // 团队结算
          message = `${this.$t('Biz.Settlement.Error51')}`;
        } else {
          this.closeBill();
        }
      } else if (msg == '3') {
        this.checkDepositUsed();
      } else if (msg == '4') {
        if (teamSettelement !== false) {
          // 团队结算
          message = `${this.$t('Biz.Settlement.Error51')}`;
        } else {
          this.abandonedBill();
        }
      } else {
        message = `${this.$t('Dict.WrongInfo')}：${msg}`;
      }
      if (message !== '') {
        this.$message({
          type: 'error',
          message,
        });
      }
    },
    checkDepositUsed() {
      const { depositMoney } = this;
      if (depositMoney > 0) {
        const isExistDepositPayWay = this.checkExistDepositPayWay();
        if (isExistDepositPayWay == 0) {
          const errMsg = `${this.$t('Biz.Settlement.Error52')}`;
          this.$message({
            type: 'error',
            message: errMsg,
          });
          return 1;
        }
      }
      return 0;
    },
    // 检查是否存在押金结算方式
    checkExistDepositPayWay() {
      let isExistDepositPayWay = 0;
      this.haveUsePayWay.forEach((paywayData) => {
        if (paywayData.type === 2 && paywayData.is_deposit === 1) {
          isExistDepositPayWay = 1;
        }
      });
      return isExistDepositPayWay;
    },
    // 删除结算方式
    deletePayWayToastMsg(payway) {
      // console.log('点击删除的结算方式', payway);
      let msg = true;
      const paywayId = payway.payway_id;
      const paywayTypeId = `${payway.payway_type_id}`;
      if (paywayId === '3') {
        // 执行弹窗：显示会员卡结算信息
        // 打开已预付的会员卡结算信息弹窗，并传入回调：删除结算方式的方法
        this.$refs.memberCardPaymentInfo.open({
          data: '',
          callback: () => {
            this.clearOnlinePayWayByPayWay(payway);
          },
        });
        msg = false;
      } else if (indexOf(['10', '17', '24', '26'], paywayId) !== -1) {
        msg = this.$t('Biz.Settlement.Tip15');
      } else if (indexOf(['4', '5', '19', '25'], paywayId) !== -1) {
        msg = this.$t('Biz.Settlement.Tip16');
      } else if (indexOf(['30', '31', '32', '33', '37'], paywayId) !== -1) {
        msg = this.$t('Biz.Settlement.Tip17');
      } else if (paywayTypeId === '512' || paywayId === '18') {
        msg = this.$t('Biz.Settlement.Tip18');
      } else if (paywayId === '34') {
        msg = this.$t('Biz.Settlement.Tip19');
      } else if (paywayId === '9') {
        msg = this.$t('Biz.Settlement.Tip20');
      } else if (paywayId === '39') {
        msg = this.$t('Biz.Settlement.Tip21');
      } else if (paywayId === '35') {
        msg = this.$t('Biz.Settlement.Tip22');
      } else if (paywayId === '9003') {
        msg = this.$t('Biz.Settlement.Tip23');
      } else if (paywayId === '3297') {
        msg = this.$t('Biz.Settlement.Tip24');
      } else if (paywayId === '55' || paywayId === '54') {
        msg = '是否删除鱼酷会员支付方式？删除后会撤销本次的消费';
      } else if (paywayId === '43') {
        msg = this.$t('Biz.Settlement.Tip25');
      } else if (paywayId === '44') {
        msg = this.$t('Biz.Settlement.Tip26');
      } else if (paywayId === '47') {
        msg = this.$t('Biz.Settlement.Tip27');
      } else if (paywayId === '56') {
        msg = this.$t('Biz.Settlement.Tip522');
      } else if (paywayId === '59') {
        msg = this.$t('Biz.Settlement.Tip523');
      } else if (paywayId === '60') {
        msg = this.$t('Biz.Settlement.Tip520');
      }
      if (isBoolean(msg) && msg) {
        this.cancelSettle({ paywayId }, () => { // 删除数据库里的结算方式
          this.clearPayWayByPayWay(paywayId); // 删除前端缓存的结算方式
          // 中餐且预付状态，需要去掉所有的结算方式才撤销预付
          // 且预付状态下,删除结算, 不再有相关提示
          this.refreshBill('1');
        });
      } else if (msg) {
        // 如果是线上预付，并且
        this.$confirm(msg, `${this.$t('Dict.Tips')}`, {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        }).then(() => {
          if (indexOf(['4', '5', '10', '17', '19', '24', '25', '26', '30', '31', '32', '33', '37'], paywayId) !== -1) {
            const teamSettelement = this.judgeisTeamSettlement();
            // 判断是否团队结算 ? 团队bsid : 空值
            const teamBsIds = teamSettelement ? teamSettelement.teamBsIds : '';
            // 检查是否支付成功
            const url = 'canyin.pos.settlement.pay.scancodepayway';
            // 撤销预付参数
            const params = {
              orderid: this.baseBs.code, // 流水
              paytypeid: payway.attrs.wuu_pay_typeid,
              teamBsIds,
            };
            ajax(url, { params }).then((data) => {
              if (data.isSuccess) {
                this.$confirm(this.$t('Biz.Settlement.IndexMsg2'), this.$t('Dict.Tips'), {
                  confirmButtonText: `${this.$t('Dict.Sure')}`,
                  cancelButtonText: this.$t('Dict.Cancel'),
                  type: 'warning',
                  dangerouslyUseHTMLString: true,
                }).then(() => {
                  // 这里不用调用这个了，直接调cancelSettle就好了
                  // this.clearOnlinePayWayByPayWay(payway);
                  this.cancelSettle({ paywayId }, () => {
                    this.clearOnlinePayWay();
                    this.refreshBill();
                  });
                }).catch(() => {
                  this.$message.info(this.$t('Dict.OperationCancelled'));
                });
              } else {
                this.cancelSettle({ paywayId }, () => {
                  this.clearOnlinePayWay();
                  this.refreshBill();
                });
              }
            });
          } else if (paywayId === '34') {
            // 撤销一筷捞结算方式
            this.undoChopStick(payway);
          } else if (paywayId === '39') {
            // 撤销新荣记结算方式
            this.rgjUndosettle(payway);
          } else if (paywayId === '9003') {
            // 撤销冥晨会员卡结算方式
            this.undoMinChenSettle(payway);
          } else if (paywayId === '3297') {
            // 撤销微生活结算方式
            this.twitterlifepaywayUndo(payway);
          } else if (paywayId === '55' || paywayId === '54') {
            // 撤销鱼酷会员卡结算方式
            this.checkFishCoolUndo(payway);
          } else if (paywayId === '43') {
            // 撤销群光储值卡结算方式
            this.groupLightMembershipCardUndo(payway);
          } else if (paywayId === '44') {
            // 撤销群光优惠券结算方式
            this.groupLightVoucherUndo(payway);
          } else if (paywayId === '47') {
            this.cancelTongLianPayWay({ type: '0' });
          } else if (paywayId === '56') {
            this.cancelTongLianPayWay({ type: '1' });
          } else if (paywayId === '35') {
            // 撤销线上礼品卡券结算方式
            this.undoCoucouSettle(payway);
          } else if (paywayId === '9') {
            // 撤销美团团购券
            this.cancelMeiTuanTick();
          } else if (paywayId === '60') {
            this.operateGroupPayouts(false, payway);
          } else {
            this.clearOnlinePayWayByPayWay(payway);
          }
        }).catch(() => {
          this.$message.info(this.$t('Dict.OperationCancelled'));
        });
      }
    },
    // 撤销美团代金券结算方式
    cancelMeiTuanTick(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.cancelMeiTuanTick(code);
      });
      ajax('canyin.pos.gbticketbill.unsettle', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.baseBs.id, // 当前的营业流水号
          ...authData,
        },
      }).then((data) => {
        if (data.success && data.result === 1) {
          this.refreshBill('1');
          this.$message.success(data.data || `${this.$t('Biz.Settlement.Success15')}`);
        } else if (data.result === -2) {
          this.$vemit('posAuthCheck', {
            message: data.msg || `${this.$t('Biz.Settlement.Error53')}`,
          });
        } else {
          this.$message.error(data.msg || `${this.$t('Biz.Settlement.Error53')}`);
        }
      });
    },
    // 撤销荣管家结算方式
    rgjUndosettle() {
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.undosettle', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.baseBs.id,
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (`${res.code}` === '0') {
          // 更新营业流水相关信息
          this.refreshBill('1');
          this.$message.success(res.message);
        } else {
          this.$message.error(res.message);
        }
      });
    },
    // 撤销冥晨会员卡结算方式
    undoMinChenSettle() {
      ajax('canyin.pos.settlement.pay.crmPayWay.mingchenundo', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.baseBs.id,
          pointId: this.resData.pointId,
        },
      }).then((res) => {
        if (res.result === 1) {
          // 更新营业流水相关信息
          this.refreshBill('1');
          this.$message.success(`${this.$t('Biz.Settlement.Success16')}`);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 撤销通联pos结算方式
    // type: { type: '1', scanCode: true }
    cancelTongLianPayWay(type) {
      let url = '';
      if (type.type === '0') { // 通联撤销
        url = 'canyin.pos.settlement.pay.unitedbank.unsettle';
      } else { // 聚合撤销
        url = 'canyin.pos.settlement.pay.polymer.unsettle';
      }
      const requestData = {
        pointId: this.resData.pointId,
        bsId: this.baseBs.id, // 流水id
      };
      const baseData = this.getBaseSubmitParams();
      const teamSettelement = this.judgeisTeamSettlement();
      if (teamSettelement) {
        if (type.type === '0') { // 通联撤销
          url = 'canyin.pos.settlement.pay.unitedbank.unsettleteam';
        } else { // 聚合撤销
          url = 'canyin.pos.settlement.pay.polymer.unsettleteam';
          Object.assign(requestData, {
            teamBsIds: teamSettelement.teamBsIds.split(',')[0],
            teamPointIds: teamSettelement.teamPointIds.split(',')[0],
          });
        }
        baseData.payway_list = (this.getSubmitPayWay() || []).filter(item => item.payway_id !== '47');
      } else {
        baseData.payway_list = this.getSubmitPayWay();
      }
      requestData.params = JSON.stringify(baseData);
      const timer = setTimeout(() => {
        this.refreshBill('1');
      }, 70000);
      if (type.type === '0') {
        this.loading = this.$loading({
          lock: true,
          text: this.$t('Biz.Settlement.Loading2'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        });
      } else if (type.scanCode) { // 聚合扫码的取消
        requestData.consumeType = 1;
      } else { // 聚合银行卡的取消
        requestData.consumeType = 0;
      }
      this.$hotKey.stop();
      this.closeByEsc = false;
      const timer2 = setTimeout(() => {
        if (type.type === '0') {
          this.loading.close();
        }
        this.$hotKey.start();
        this.closeByEsc = true;
      }, 70000);
      ajax(url, {
        contentType: 'URLEncoded',
        timeout: 70000,
        data: requestData,
      }).then((res) => {
        if (res.success) {
          clearTimeout(timer);
          clearTimeout(timer2);
          if (type.type === '0') {
            this.loading.close();
            this.$hotKey.start();
            this.closeByEsc = true;
          }
          // 更新营业流水相关信息
          this.refreshBill('1');
          if (type.scanCode) { // 聚合扫码
            this.$refs.AlipayPaymentCode.close();
          }
        } else {
          this.$message.error(`${res.msg}`);
        }
      }).catch((err) => {
        this.$message.error(`${err.msg}`);
      });
    },
    // 已添加的结算方式中是否有其他代金券
    findOtherVoucher() {
      let bool = false;
      if (this.haveUsePayWay.length > 0) {
        for (let i = 0; i < this.haveUsePayWay.length; i += 1) {
          if (this.haveUsePayWay[i].payway_type_id === '506') {
            bool = true;
            break;
          }
        }
      }
      return bool;
    },
    // 已添加的结算方式中是否有比例折扣
    findDiscount() {
      let bool = false;
      if (this.haveUsePayWay.length > 0) {
        for (let i = 0; i < this.haveUsePayWay.length; i += 1) {
          if (this.haveUsePayWay[i].dpId && this.haveUsePayWay[i].comeFrom === 1) {
            bool = true;
            break;
          }
        }
      }
      return bool;
    },
    // 撤销鱼酷结算方式时，如果存在其他代金券 那么额外调用cancelSettle方法
    checkFishCoolUndo(payway) {
      const doScale = this.hasFishCoolDiscount(payway);
      if (payway.take_money !== 0) { // 满足预结条件
        const data = {
          paywayId: '55',
        };
        this.cancelSettle(data, () => {
          this.fishCoolUndo(payway, doScale);
        });
      } else {
        this.fishCoolUndo(payway, doScale);
      }
    },
    // 已添加的结算方式中是否有通过鱼酷折扣券添加的折扣方式
    hasFishCoolDiscount(payway) {
      if (payway.take_money !== 0) {
        // 是否存在鱼酷折扣券
        let fishCoolDiscount = null;
        for (let i = 0; i < this.haveUsePayWay.length; i += 1) {
          if (this.haveUsePayWay[i].comeFrom === 1) {
            fishCoolDiscount = this.haveUsePayWay[i];
            break;
          }
        }
        return fishCoolDiscount;
      }
      return null;
    },
    // 撤销鱼酷结算方式
    fishCoolUndo(payway, doScale = null) {
      ajax('canyin.pos.settlement.pay.yukupayway.unsettle', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.baseBs.id, // 流水id
          paywayid: '55',
          payMoney: payway.take_money,
        },
      }).then((res) => {
        if (res && doScale) {
          this.cancelFishCoolDisc(doScale);
        } else {
          // 更新营业流水相关信息
          this.refreshBill('1');
        }
      });
    },
    // 鱼酷取消优惠
    cancelFishCoolDisc(discType) {
      const typeId = discType.discType;
      const disPlanId = discType.dpId;
      const { mcTicketId } = discType; // 撤销冥晨验券
      // 其他活动方案
      let discUrl = 'canyin.pos.settlement.scale';
      const params = {
        bsId: this.baseBs.id,
        pointId: this.resData.pointId,
        disctype: 0,
        controlMode: this.posBaseInfo.controlMode,
        cancelDisctype: typeId, // 取消优惠的折扣类型
        cancelDisPlanId: disPlanId || null, // 取消优惠的打折方案ID
        mcTicketId: mcTicketId || null,
      };
      const teamSettelement = this.judgeisTeamSettlement();
      if (teamSettelement !== false) {
        // 团队结算
        params.teamBsIds = teamSettelement.teamBsIds;
        params.teamPointIds = teamSettelement.teamPointIds;
        discUrl = teamSettelement.urlTeamscale;
      }
      ajax(discUrl, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success) {
          this.$message({
            message: '取消优惠成功',
            type: 'success',
          });
          this.setSettleDiscType({ list: this.baseBs.id });
          this.refreshBill('1');
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
    },
    // 撤销微生活结算方式
    twitterlifepaywayUndo() {
      const params = this.getBaseSubmitParams(); // 提交数据
      params.payway_list = this.getSubmitPayWay();
      params.payway_list.map((item, index) => {
        if (+item.payway_id === 3297) {
          params.payway_list.splice(index, 1);
        }
        return item;
      });
      const { teamBsIds, teamPointIds } = this.baseBs;
      const { controlMode } = this.posBaseInfo;
      Object.assign(params, {
        teamBsIds,
        teamPointIds,
        controlMode,
      });
      let url = 'undo';
      const teamSettelement = this.judgeisTeamSettlement();
      if (teamSettelement) {
        url = teamSettelement.urlTeamundo;
      }
      ajax(`canyin.pos.settlement.pay.twitterlifepayway.${url}`, {
        contentType: 'paramsEncoded',
        data: {
          ...params,
        },
      }).then(() => {
        // 更新营业流水相关信息
        this.refreshBill('1');
      }).catch((err) => {
        this.$message.error(`${err.msg}`);
      });
    },
    // 撤销一筷捞结算方式
    undoChopStick(payway) {
      const params = {
        bsId: this.baseBs.id, // 当前营业流水
      };
      ajax('canyin.pos.settlement.pay.chopstickpayway.cancelcoupon', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.result.code === 0) {
          this.clearOnlinePayWayByPayWay(payway);
          // 更新营业流水相关信息
          this.refreshBill('1');
          this.$message.success(`${this.$t('Biz.Settlement.Success17')}`);
        } else if (res.result.code === -1) {
          this.$message.error(res.result.message);
        }
      }).catch(() => {
        this.$message.error(`${this.$t('Biz.Settlement.Error54')}`);
        this.refreshBill('1');
      });
    },
    // 撤销线上礼品卡券结算方式、
    undoCoucouSettle() {
      const params = {
        bsId: this.baseBs.id,
        requestFrom: 1, // 结算页面发起请求传1
        pointId: this.resData.pointId,
        ticketCode: '',
      };
      ajax('canyin.pos.settlement.pay.coucoupayway.backoutcoupon', {
        contentType: 'URLEncoded',
        data: params,
      }).then((res) => {
        if (res.success) {
          // 更新营业流水相关信息
          this.refreshBill('1');
          // 撤销核销后的支付方式后清除已添加的线上礼品卡和线上礼品券
          this.$vemit('clearCardAndVoucherBus');
          this.$message.success(`${this.$t('Biz.Settlement.Success18')}`);
        } else if (!res.success) {
          this.$message.error(res.message);
        }
      });
    },
    // 撤销群光储值卡结算方式
    groupLightMembershipCardUndo() {
      ajax('canyin.pos.settlement.pay.grouplight.unsettle', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.baseBs.id,
          pointId: this.resData.pointId,
        },
      }).then((res) => {
        if (res.result === 1) {
          // 更新营业流水相关信息
          this.refreshBill('1');
          this.$message.success(`${this.$t('Biz.Settlement.Success19')}`);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 撤销群光优惠券结算方式
    groupLightVoucherUndo() {
      ajax('canyin.pos.settlement.pay.grouplight.uncouponpaylist', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.baseBs.id,
          pointId: this.resData.pointId,
        },
      }).then((res) => {
        if (res.result === 1) {
          // 更新营业流水相关信息
          this.refreshBill('1');
          this.$message.success(`${this.$t('Biz.Settlement.Success20')}`);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 清除线上结算方式
    clearOnlinePayWayByPayWay(payway) {
      // 获取是否是在线支付
      const paywayId = payway.payway_id;
      // if (
      //   paywayId === '4'
      //   || paywayId === '5'
      //   || paywayId === '19'
      //   || paywayId === '25'
      //   || paywayId === '10'
      //   || paywayId === '17'
      //   || paywayId === '24'
      //   || paywayId === '26'
      //   || paywayId === '30'
      //   || paywayId === '31'
      //   || paywayId === '32'
      //   || paywayId === '33'
      //   || paywayId === '37'
      // ) {
      //   // http://192.168.4.84:88/zentao/bug-view-93174.html
      //   // 这里先执行了删除线上结算方式再调用后台接口，感觉不太对。
      //   // this.clearOnlinePayWay();
      //   // 原来的preSettle改名为cancelsettle，作为删除结算方式的统一调用
      //   // this.preSettle(payway_id);
      //   this.cancelSettle(paywayId, () => {
      //     this.clearOnlinePayWay();
      //   });
      // } else
      if (paywayId === '3'
        || paywayId === '59'
        || paywayId === '60'
      ) {
        // CRM支付，需要重新预结
        // 或 食尚订订金(同逻辑)
        // 或 集团挂账(同逻辑)
        const params = {
          paywayId,
          payway_list: this.getSubmitPayWay(paywayId),
        };
        if (this.getSettleDiscType) {
          extend(params, {
            discTypeParams: this.getSettleDiscType[this.baseBs.id],
          });
        }
        this.cancelSettle(params, (data) => {
          this.clearPayWayByPayWay(paywayId);
          this.refreshBill();
          // 按照所执行不同结算方式, 提示相应的信息
          if (paywayId === '3') {
            this.$message.success(this.$t('Biz.Settlement.Success21'));
          }
          if (paywayId === '59') {
            this.$message.success(this.$t('Biz.Settlement.SSDTip05'));
          }
          if (paywayId === '60') {
            this.$message.success(this.$t('Biz.Settlement.AccountWarn02'));
          }
        });
      } else if (paywayId === '18' || paywayId === '512') {
        this.olpreMsg(payway);
      } else {
        this.cancelSettle({ paywayId }, () => {
          this.clearPayWayByPayWay(paywayId);
        });
      }
    },
    /**
       * 删除结算方式统一接口
       * @param { String } 结算方式ID
       * @param { Function } 接口成功后的回调
       */
    cancelSettle(params, callback) {
      console.log('执行删除的结算方式参数', params);
      // http://192.168.4.84:88/zentao/bug-view-93174.html
      // 改为不进行空账判断，预结接口变为取消预结试试
      // const isCheckEmptyBill = this.checkEmptyBill();
      // if (isCheckEmptyBill) {
      //   return false;
      // }
      // const params = this.getBaseSubmitParams(); // 提交数据
      // params.payway_list = this.getSubmitPayWay();
      // extend(params, opts);
      const url = 'canyin.pos.settlement.cancelsettle';
      // 整理参数,添加接口提交时的基础数据
      const data = extend({}, this.getBaseSubmitParams(), params);
      // const teamSettelement = this.judgeisTeamSettlement();
      // if (teamSettelement !== false) {
      //   // 团队结算
      //   url = teamSettelement.urlTeampresettle;
      // }
      // 删除结算方式-增加取消预扣参数,判定: 当前已预扣 && 当前被删除的结算是入库的
      if (this.payThenDiscountFlg
          && find(this.preSettlePayWayList, ['payway_id', params.paywayId])
      ) {
        data.cancelDiscountFlg = 1;
      }
      ajax(url, { data, contentType: 'paramsEncoded' }).then((res) => {
        callback(res);
      });
    },
    // 团队结算按钮 改变事件
    teamSettleChange(value, isOpen) {
      if (value == true) {
        this.isTeamBill = 1;
        this.isSelectTeamBtn = true;
      } else {
        this.$message({
          message: `${this.$t('Biz.Settlement.Warning38')}`,
          type: 'warning',
        });
        this.isTeamBill = 0;
        this.isSelectTeamBtn = false;
      }
      if (!isOpen) {
        this.refreshBill();
      }
    },
    // 检查最后一个结算方式是否是现金类型的
    checkLastGiveMoney() {
      let isCashTypeLastPayWay = 0;
      const { giveChange } = this;
      if (giveChange > 0) {
        const { discAndPayWayData } = this;
        const discAndPayWayDataLen = discAndPayWayData.length;
        if (discAndPayWayDataLen == 0) {
          return isCashTypeLastPayWay;
        }
        const payway = discAndPayWayData[discAndPayWayDataLen - 1];
        // 获取最后一个结算方式
        const lastPayway = payway[payway.length - 1];
        if (lastPayway.type === 2 && lastPayway.payway_type_id != '501') {
          isCashTypeLastPayWay = 1;
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error55')}`,
          });
        }
        return isCashTypeLastPayWay;
      }
      return isCashTypeLastPayWay;
    },
    // 检测是否是空帐
    checkEmptyBill() {
      const scSize = Number(this.billData.itemLastQty);
      const coRecord = Number(this.billData.coRecord);
      const origTotal = Number(this.billData.baseBs.orig_total);
      const useDeposit = Number(this.depositMoney);
      const teamSettelement = this.judgeisTeamSettlement();
      // 如果没有加单,应收=0,没有押金,退单记录=0，可以关台
      if (
        Number(scSize) == 0
          && Number(origTotal) == 0
          && useDeposit == 0
          && Number(coRecord) == 0
      ) {
        if (teamSettelement !== false) {
          // 团队结算
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error56')}`,
          });
        } else {
          this.closeBill();
        }
        return true;
        // 如果没有加单,应收=0,没有押金,退单记录>0，可以废单
      } if (
        Number(scSize) == 0
          && Number(origTotal) == 0
          && useDeposit == 0
          && Number(coRecord) > 0
      ) {
        if (teamSettelement !== false) {
          // 团队结算
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error57')}`,
          });
        } else {
          this.abandonedBill();
        }
        return true;
      }
      return false;
    },
    // 打印留台单
    printLeaveTable(bizPrintLeaveTableParamsList) {
      this.$log.info('更多结算打印留台单');
      const url = 'canyin.pos.printleavetable.getleavetablestyledata'; // 接口地址
      // 获取posId  posInfo  Pos的一些信息见 vuex getter.js 的posInfo
      bizPrintLeaveTableParamsList.map((list) => {
        ajax(url, {
          loading: false,
          contentType: 'paramsEncoded',
          needToken: true,
          data: {
            bsId: list.bsId,
            ssId: list.ssId,
            pointId: list.pointId,
            styleType: 7,
          },
        }).then((res) => {
          if (res.printType === 'PRINT_PARALLEL' && res.printD) {
            this.$devices.Printer.print(res.printD);
          }
        });
      });
    },
    // 打印加单标签
    fastPrintAddBill(printD) {
      this.$log.info('更多结算打印加单标签');
      const {
        exporttype, fileid, printcnt, printer, style_data,
      } = printD;
      each(printD.data, (item) => {
        this.$devices.Printer.print(
          extend({}, item, {
            exporttype,
            fileid,
            printcnt,
            printer,
            style_data,
          }),
        );
      });
    },
    // 打印结账单
    printSettleBill() {
      const bsId = this.baseBs.id;
      if (bsId != undefined && bsId != null) {
        const { posInfo } = this;
        if (posInfo == undefined || posInfo == null) {
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error58')}`,
          });
        } else {
          const url = 'canyin.pos.printsettle.getsettleprintdata';
          const params = {
            bsId,
            styleType: 1,
            posId: posInfo.id,
          };
          const teamSettelement = this.judgeisTeamSettlement();
          if (teamSettelement !== false) {
            // 团队结算
            params.teamBsIds = teamSettelement.teamBsIds;
            params.isCheckTeam = true;
          } else {
            params.teamBsIds = '';
            params.isCheckTeam = false;
          }
          // if(this.posInfo.controlMode != "3"){
          this.$log.info(`打印结账单${bsId}`);
          this.$vemit(
            this.posInfo.controlMode === '3'
              ? 'fastCommonPrint'
              : 'commonPrint',
            {
              url,
              params,
              printType: 1,
            },
          );
        }
      }
    },
    // 数组中 是否包含具体结算方式
    isHavePayWay(payWayIdArray, payWayId) {
      let isHavePayWay = false;
      if (
        payWayIdArray == undefined
          || payWayIdArray == null
          || payWayIdArray.length == 0
      ) {
        return isHavePayWay;
      }
      for (let i = 0; i < payWayIdArray.length; i += 1) {
        if (payWayIdArray[i] == payWayId) {
          isHavePayWay = true;
        }
      }
      return isHavePayWay;
    },
    lockSettleWin() {
      const url = 'canyin.pos.settlement.exclusiveagain'; // 锁定结算窗口接口
      ajax(url, {
        loading: false,
        params: { pointId: this.resData.pointId },
      }).then(() => {
      });
    },
    // 清除结算锁定窗口
    clearLockSettleWin() {
      const url = 'canyin.pos.settlement.closeexclusive'; // 清除锁定结算窗口接口
      ajax(url, {
        loading: false,
        params: {
          pointId: this.resData.pointId,
          controlMode: this.posBaseInfo.controlMode,
          bsId: this.baseBs.id,
        },
      }).then((res) => {
      });
    },
    // 清除结算锁定定时
    clearSettleLockInterval() {
      const { SETTLE_LOCK_INTERVAL } = this;
      if (SETTLE_LOCK_INTERVAL != null) {
        clearInterval(SETTLE_LOCK_INTERVAL);
        this.SETTLE_LOCK_INTERVAL = null;
      }
    },
    // 清除线上结算方式并重新刷新账单
    clearOnlinePayWayAndRefreshBill() {
      this.clearOnlinePayWay();
      this.refreshBill();
    },
    // 结算成功
    settlementSuccess() {
      this.$message.success(`${this.$t('Dict.SuccessfulSettlement')}`);
      if (this.posInfo.controlMode == '3') {
        // 快餐模式
        this.$vemit('clearSearch');
        // 关闭当面付窗口
        this.$vemit('fastfoodCloseSettleDialog');
        // 手工核销不在执行打印业务,由后台统一完成
        // if (!data.isReturnPointAndSettle && data.bsId != null) {
        //   this.printAddBill(data.bsId);
        // }

        // // 如果是还有会员卡结算的时候，结算完要恢复被禁止的按钮并且显示会员卡支付的金额要消失
        // BillBsModule.CrMceldisabletnfunc()
        // // 结算完后付款价位回显
        // BillBsModule.Payshowarea((me.wuuparams.paymoney * 1000 + me.cashfastsettleMoney * 1000) / 1000, '0.00')
        ajax('canyin.pos.reception.receptionbusiness.findbssettlestate', {
          contentType: 'paramsEncoded',
        }).then((res) => {
          if (res.success) {
            // 刷新账单
            setTimeout(() => {
              // this.clearBillAndRefresh();
              this.$vemit('fastClearEmptyBill', false, false);
            }, 0);
          }
        });
      } else {
        // 收银模式
        this.$vemit('closeSettleDialog');
        this.$vemit('resetOrderSearchText');
        this.$vemit('clearEmptyBill', {});
      }
    },
    closeQRcodeFun() {
      if (this.posDevice.enableVice) {
        this.$devices.SubMonitor.send({
          moduleName: 'SubMonitor',
          method: 'closeQRCode',
          result: 'close',
        });
      }
    },
    // crm结算
    crmSettle(data) {
      this.clearPayWayByPayWay('3');
      this.addPayWay({
        payway_id: this.payWay.id,
        name: this.payWay.name,
        payway_type_id: this.payWay.payway_type_id,
        take_money: Number(data.crmPayData.takeMoney).toFixed(2),
        pay_money: Number(data.crmPayData.takeMoney).toFixed(2),
        give_change: 0,
        is_deposit: 0,
        sort_order: 1,
        finish: false,
        dis_name: '',
        confirm_del: this.payWay.isconfirmdelete,
      });
      const requestData = data.data;
      const params = this.getBaseSubmitParams();
      params.payway_list = this.getSubmitPayWay();
      requestData.params = JSON.stringify(params);
      let url = 'canyin.pos.settlement.pay.crmPayWay.settle';
      const teamSettelement = this.judgeisTeamSettlement();
      if (teamSettelement !== false) {
        // 团队结算
        url = teamSettelement.urlTeamsttle;
      }
      ajax(url, {
        contentType: 'URLEncoded',
        data: requestData,
      }).then((data) => {
        if (data.result === 1) {
          this.refreshBill();
        } else {
          this.$message.error(data.msg ? data.msg : `${this.$t('Biz.Settlement.Error59')}`);
          this.clearPayWayByPayWay('3');
        }
      });
    },
    cancelCrmSettle(options) {
      // 获取打折参数
      if (this.getSettleDiscType) {
        const discTypeParams = this.getSettleDiscType[options.bsId];
        if (discTypeParams) {
          options.discTypeParams = JSON.stringify(discTypeParams);
        }
      }
      ajax('canyin.pos.settlement.pay.crmPayWay.cancel', {
        contentType: 'URLEncoded',
        data: options,
      }).then(() => {
        if (options.deviceReadCardNo) {
          if (this.posDevice.readCardOpt.mode === 9) {
            this.$devices.Cardop.cancel();
          }
          if (this.posDevice.readCardOpt.mode === 15) {
            this.$devices.Cardop.cancelOut();
          }
          if (this.posDevice.readCardOpt.mode === 16) {
            this.$devices.Cardop.cancelOut();
          }
        }
        // 这个是crm7 取消会员折扣的回调方法
        if (options != null && options.cardNo != undefined && options.flg) {
          this.$refs.PayWayMembershipCardCrm7.crm7HtmlRefresh();
        }
        // 刷新账单
        this.refreshBill('1');
      });
    },
    // 打开CRM支付窗口
    openCrmPayDialog(payWay) {
      let teamBsIds = '';
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (isTeamSettlementFlg == 1 && isTeamBill == 1) {
        teamBsIds = this.baseBs.teamBsIds;
      }
      ajax('canyin.pos.settlement.pay.crmPayWay.getcrmversion').then((data) => {
        const crmVersion = data.isCrm7 && data.isCrm7 === 1 ? 7 : 6;
        const bsId = this.baseBs.id;
        const actualPay = this.sumPayWayMoney || 0;
        ajax('canyin.pos.settlement.pay.crmPayWay.view', {
          params: {
            bsId,
            paywayid: payWay.id,
            crmFlg: crmVersion === 7 ? 1 : 0,
            actualPay,
            teamBsIds,
            teamSettlementFlg: teamBsIds !== '',
            jsFunCrmGetCardCallback: 'crmGetCardCallback',
            jsFunCrmPreConsumeCallback: 'crmPreConsumeCallback',
            jsFunGetCardNoCallback: 'crmGetCardNoCallback',
            jsFunGetCardChargeCallback: 'crmGetCardChargeCallback',
          },
        }).then((res) => {
          if (crmVersion === 7) {
            ajax('canyin.pos.settlement.pay.crmPayWay.getcardnofromreserveorder', {
              contentType: 'URLEncoded',
              data: { pointId: this.resData.pointId },
            }).then((showMemberNoMessage) => {
              this.$refs.PayWayMembershipCardCrm7.open({
                crmHtml: res.crmHtml,
                isHaveCrmMemberDiscAuth: res.isHaveCrmMemberDiscAuth,
                bsId,
                actualPay,
                teamBsIds,
                showMemberNoMessage,
              });
            });
          }
          if (crmVersion === 6) {
            this.$refs.PayWayMembershipCard.open({
              crmHtml: res.crmHtml,
              bsId,
              actualPay,
              teamBsIds,
            });
          }
        });
      });
    },
    // 查询线上支付状态  用于手工核销/结算窗口确定按钮
    queryOnlinePayState() {
      let wuuTypeId = 0;
      let isFinish = 'false';
      this.haveUsePayWay.forEach((paywayData) => {
        if (
          paywayData.type === 2
            && (paywayData.isolpayway == true || paywayData.isolpayway == 'true')
        ) {
          if (
            paywayData.payway_type_id == 507
              && paywayData.payway_id != 18
              && paywayData.payway_id != 22
              && paywayData.payway_id != 23
          ) {
            if (paywayData.attrs != undefined && paywayData.attrs != '') {
              const attrsData = paywayData.attrs;
              for (const key in attrsData) {
                if (key == 'wuu_pay_typeid') {
                  wuuTypeId = attrsData[key];
                }
                if (key == 'finish') {
                  isFinish = attrsData[key];
                }
              }
            }
          }
        }
      });
      return { isFinish, wuuTypeId };
    },
    // 结算显示的金额(实收应收)的字体，由于存在百万级数值，做字体缩小处理（动态样式）
    // 限制显示金额最大值为 ‘9999999.99’
    isDisplayInline(price) {
      if (price && (`${price}`).length > 9) {
        return true;
      }
    },
    olpreMsg(payway) {
      this.$confirm(
        this.$t('Biz.Pos.Member.IndexMsg03'),
        `${this.$t('Dict.Tips')}`,
        {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
          dangerouslyUseHTMLString: true,
        },
      )
        .then(() => {
          this.undoOlpre(payway);
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('Dict.OperationCancelled'),
          });
        });
    },
    undoOlpre(payway) {
      // const paywayList = [];
      let wuupaytypeid = '';
      let wuuorderid = '';
      let pwdetailids = '';
      // 有可能一笔线上预付订单存在多个结算方式
      if (payway.attrs) {
        const attrsData = payway.attrs;
        wuupaytypeid = attrsData.wuupaytypeid;
        wuuorderid = attrsData.wuuorderid;
      }
      if (wuupaytypeid === '' || wuupaytypeid === 0) {
        this.$message.warn(`${this.$t('Biz.Settlement.Error60')}`);
      } else {
        each(this.haveUsePayWay, (paywayData) => {
          // 线上预付
          if (
            paywayData.type === 2
              && (
                paywayData.payway_id === '18'
                || paywayData.payway_type_id === '512'
              )
          ) {
            // 特殊参数处理
            if (paywayData.attrs) {
              const attrsData = paywayData.attrs;
              const wuuorderidTemp = attrsData.wuuorderid;
              if (wuuorderidTemp === wuuorderid) {
                pwdetailids = `${attrsData.pwdetailids},`;
              }
            }
          }
        });
        const params = {
          wuupaytypeid,
          wuuorderid,
          pwdetailids,
          paywayId: payway.payway_id,
          pointId: this.resData.pointId,
        };
        this.cancelSettle(params, () => {
          this.$message.success(`${this.$t('Biz.Settlement.Success22')}`);
          this.refreshBill('1');
        });
      }
    },
    payFunction(method) {
      if (method && this.$refs[method]) {
        if (method == 'payMore') {
          const isExistPayWay = this.checkExistPayWay();
          this.$refs[method].open({ isExistPayWay: Number(isExistPayWay) });
        } else if (this[method]) {
          this[method](method); // 执行对应的方法
        } else {
          this.$message.error(`${this.$t('Biz.Settlement.Error61')}`);
        }
      } else {
        this.$message.error(`${this.$t('Biz.Settlement.Error61')}`);
      }
    },
    payNoDialogFunction(item) {
      if (item != null && item.method != null) {
        if (this[item.method]) {
          this[item.method](item); // 执行对应的方法
        } else {
          this.$message.error(`${this.$t('Biz.Settlement.Error62')}`);
        }
      } else {
        this.$message.error(`${this.$t('Biz.Settlement.Error62')}`);
      }
    },
    // 是否开启了押金管理
    isOpenBuffetDepositManage() {
      const hasBuffetDepost = this.ALL_POS_MODULE.find(({ id }) => id === '1252');
      return hasBuffetDepost && hasBuffetDepost.checked;
    },
    // 押金
    payDesposit(method) {
      // 是否存在结算方式
      const isExistPayWay = this.checkExistPayWay();
      let teamBsIds = '';
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (isTeamSettlementFlg == 1 && isTeamBill == 1) {
        teamBsIds = this.baseBs.teamBsIds;
      }
      // 弹框
      // this.$refs[method].open({
      //   bsId: this.baseBs.id,
      //   isExistPayWay,
      //   depositMoney: this.depositMoney,
      //   isTeamSettlementFlg: this.isTeamSettlementFlg,
      //   teamBsIds,
      // });
      // return;
      if (!this.isOpenBuffetDepositManage()) {
        this.$message.error(`${this.$t('Dict.UserNoPermissionOfDepositMsg')}`);
        return;
      }
      this.$vemit('moreOperation', 'buffetDeposit', {
        bsId: this.baseBs.id,
        isExistPayWay,
        depositMoney: this.depositMoney,
        isTeamSettlementFlg: this.isTeamSettlementFlg,
        teamBsIds,
        pointData: this.getSettlement,
        baseBs: this.baseBs,
        source: 'payIndex',
      });
    },
    // 登记押金或者退押金  押金金额回显
    deposit(val) {
      this.depositMoney = val;
      this.refreshBill('1');
    },
    // 线上支付查询
    payOnlinePayment() {
      ajax('canyin.pos.settlement.paybottombtn.queryallonlinepaystate', {
        params: {
          orderid: this.baseBs.code,
        },
      }).then((res) => {
        const pay = res;
        let msg = `<span style="font-size:12px; line-height: 32px; font-weight:200 ">${this.$t('Biz.Settlement.Tip28')}：${this.baseBs.code}</span>`
          + '<hr/>';
        if (pay.length == 0) {
          msg
            += `<span style="font-size:18px ">${this.$t('Biz.Settlement.Tip28')}</span>`
            + '<br>'
            + `<span style="font-size:12px ">(${this.$t('Biz.Settlement.Tip30')})</span>`;
          this.$alert(msg, `${this.$t('Dict.Tips')}`, {
            dangerouslyUseHTMLString: true,
          });
          return false;
        }
        pay.forEach((payInfo) => {
          msg
            += `<span style="font-size:18px; font-weight:bold ">${this.$t('Biz.Settlement.PayMoney')}：${payInfo.payMoney}</span>`
            + '<br>';
          msg
            += `<span style="font-size:12px; font-weight:200  ">${this.$t('Biz.Settlement.DealSource')}：${
              payInfo.payType
            }</span>`
              + '<br>';
          msg
            += `<span style="font-size:12px; font-weight:200  ">${this.$t('Biz.Settlement.DealOrder')}：${
              payInfo.transactionNumber
            }</span>`
              + '<br>';
          if (payInfo.payUser != '') {
            msg
              += `<span style="font-size:12px; font-weight:200  ">${this.$t('Biz.Settlement.PayAccount')}：${
                payInfo.payUser
              }</span>`
                + '<br>';
          }
          msg
            += `<span style="font-size:12px; font-weight:200  ">${this.$t('Biz.Settlement.DealTime')}：${
              payInfo.payTime
            }</span>`
              + '<br>';
          msg
            += `<span style="font-size:12px; font-weight:200  ">${this.$t('Biz.Settlement.PayStatus')}：${
              payInfo.payState
            }</span>`
              + '<hr/>';
        });
        msg
          += `(${this.$t('Biz.Settlement.Tip30')})`;
        this.$alert(msg, `${this.$t('Dict.Tips')}`, {
          dangerouslyUseHTMLString: true,
        });
        return false;
      });
    },
    // 结算备注
    paySettlementNote(method) {
      this.$refs[method].open();
    },
    // 开发票
    payDrawInvoice(method) {
      this.$refs[method].open({
        invoicesOpened: this.invoicesOpened,
        machineInvoice: this.machineInvoice,
        handInvoice: this.handInvoice,
        baseBsOrigtotal: this.baseBs.orig_total,
        payWayList: this.getSubmitPayWay(),
      });
    },
    drawInvoice(obj) {
      this.invoicesOpened = obj.invoicesOpened;
      this.machineInvoice = obj.machineInvoice;
      this.handInvoice = obj.handInvoice;
      this.invoiceRemark = obj.invoiceRemark;
    },
    // 清空开发票信息
    cancelInvoice() {
      this.handInvoice = 0;
      this.machineInvoice = 0;
      this.invoicesOpened = 0;
      this.invoiceRemark = '';
    },
    cancelSettlementRemarkInfo() {
      this.settlementRemarkInfo = '';
    },
    // 开钱箱
    payMoneyBox(method) {
      if (method) {
        this.$refs.moneyBoxModal.open();
      } else {
        this.$devices.Cashbox.open();
      }
    },
    // 现金等额
    payCashEquivalents() {
      const isExistPayWay = this.checkExistPayWay();
      // 添加完鱼酷支付方式后 不能再使用现金等额
      const fishCool = this.haveUsePayWay.find(({ payway_id }) => +payway_id === 54 || +payway_id === 55);
      if (isExistPayWay === 1 || fishCool) {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error63')}`,
          duration: 2000,
        });
        return false;
      }
      const isHaveNoUseDeposit = this.checkDepositUsed();
      if (isHaveNoUseDeposit === 1) {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error64')}`,
          duration: 2000,
        });
        return false;
      }
      // # 转账客位不再做前台判断 #
      // if (this.posInfo.controlMode != '3') {
      //   // 收银模式
      //   const isTransferTable = find(this.posTables, {
      //     pid: this.getVuexPointData.id,
      //   });
      //   if (
      //     this.isTeamSettlementFlg == 1
      //     && this.isTeamBill == 0
      //     && isTransferTable
      //   ) {
      //     // 转账客位不能单独进行结算
      //     this.$message({
      //       type: 'error',
      //       message:
      //         '转账客位不允许单独进行结算，请先将虚拟客位进行撤销转账操作后再进行结算.',
      //       duration: 2000,
      //     });
      //     return false;
      //   }
      // }
      let saleTypeId = 1;
      if (`${this.posInfo.controlMode}` === '3') {
        saleTypeId = this.paymentGetBillData.saleTypeId;
      } else {
        saleTypeId = this.posOrderBill ? this.posOrderBill.bsData.saleTypeId : 1;
      }
      let realId = '';
      let realName = '';
      let realTypeId = '';
      // 是否开启了国际化增值
      if (this.setting.isInternational) {
        realId = this.setting.baseCurrency.paywayId;
        realName = this.setting.baseCurrency.name;
        realTypeId = this.setting.baseCurrency.paywayTypeId;
      } else {
        realId = '1';
        realName = '人民币';
        realTypeId = '501';
      }
      const params = {
        point_id: this.resData.pointId,
        bs_id: this.baseBs.id, // 流水id
        bsCode: this.baseBs.code, // 流水code
        tsRemark: this.settlementRemarkInfo, // 结算备注
        totalInvoiceMoney: this.invoicesOpened, // 发票金额分类传输就行
        invoiceMoney: Number(this.machineInvoice), // 机打的发票值 现在是number类型
        tearingInvoiceMoney: Number(this.handInvoice), // 手撕发票的值 现在是number类型
        lastTotal: this.baseBs.last_total, // 实收
        takeMoney: this.baseBs.last_total, // 收款
        giveChange: 0, // 找零
        modify_time: this.baseBs.modify_time, // 最后修改时间
        teamBsIds: this.baseBs.teamBsIds, // 团队营业流水ID拼接串
        teamPointIds: this.baseBs.teamPointIds, // 团队客位ID拼接串
        orderCode: this.posInfo.controlMode == '3'
          ? this.paymentGetBillData.orderCode
          : '',
        orderCodeMode: this.posInfo.controlMode == '3'
          ? this.paymentGetBillData.orderCodeMode
          : '',
        saleTypeId, // 销售类型
        controlMode: this.posInfo.controlMode,
        payway_list: [
          {
            paywayId: realId, // 结算方式ID
            paywayName: realName, // 结算方式名称
            paywayTypeId: realTypeId, // 结算方式类型id
            takeMoney: this.baseBs.last_total, // 收款金额
            payMoney: this.baseBs.last_total, // 支付金额（实收）
            giveChange: 0, // 找零金额
            isDeposit: 0, // 0非押金结算，1押金结算
            sortOrder: 1, // 顺序
          },
        ],
        isSelectTeamBtn: this.isTeamSettlementFlg ? this.isSelectTeamBtn : !!this.isTeamSettlementFlg,
      };
      // 自助餐业务快速结算时参数整理
      if (this.posSettings.isOpenBuffetDeposit
        && this.buffetDataForSettle.buffetDeposit
      ) {
        params.depositParam = {
          id: this.buffetDataForSettle.depositId, // 押金id
          payMoney: this.buffetDataForSettle.buffetDeposit, // 押金金额
          paywayId: realId, // 支付押金的结算方式id
        };
      }
      // 获取提交的结算方式参数
      let url = 'canyin.pos.settlement.settle.commitsettle';
      const teamSettelement = this.judgeisTeamSettlement();
      if (teamSettelement !== false) {
        // 团队结算
        url = teamSettelement.urlTeamcommitsettle;
      }
      // 只有收银模式下有多次结算,如果当前为多次结算状态,判断当前结算状态是全部结算还是部分结算
      if (this.posInfo.hasMultiSettle) {
        params.settleType = this.settleType;
      }
      // 部分结算，结算完成后不关台
      // this.posInfo.hasMultiSettle后台是否开启多次结算功能如果不开通,保持原有结算逻辑不变
      if (this.posInfo.hasMultiSettle && this.settleType == 1) {
        this.defaultCashSettle(url, params);
      } else if (this.posInfo.hasMultiSettle && this.settleType == 2) {
        // 全部结算，结算完成后结算关台
        this.$confirm(`${this.$t('Biz.Settlement.Tip8')}`, `${this.$t('Dict.Tips')}`, {
          confirmButtonText: `${this.$t('Dict.Sure')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
          dangerouslyUseHTMLString: true,
        })
          .then(() => {
            // 全部结算时，弹出是否执行关台操作页面，如果点击确认执行结算并关台操作
            this.defaultCashSettle(url, params);
          })
          .catch(() => {
            // 全部结算时，弹出是否执行关台操作页面，如果点击取消执行结算但是不关台,此时也就相当于部分结算状态，因此此时应将结算状态手工改为部分结算状态
            params.settleType = 1;
            this.defaultCashSettle(url, params);
          });
      } else {
        this.defaultCashSettle(url, params);
      }
    },
    // 更多结算中的现金等额(F2快速结算)
    defaultCashSettle(url, params) {
      ajax(url, {
        contentType: 'paramsEncoded',
        needToken: true,
        data: params,
      }).then((res) => {
        if (res.result == '1') {
          this.close({ force: true }); // 手动关闭, 触发关闭相关操作
          this.$message.success(this.$t('Dict.SuccessfulSettlement'));
          // 现金等额 打开钱箱
          if (this.outDeviceSetting.isAccounAutoOpenCashbox === true) {
            this.payMoneyBox();
          }
          if (this.posInfo.controlMode != '3') {
            // 收银模式
            this.$vemit('resetOrderSearchText');
            // 刷新账单
            setTimeout(() => {
              this.$vemit('clearEmptyBill', {});
            }, 0);
            // 线上支付方式支付成功后如果后台开启多次结算需要把批量操作按钮置为非选中状态
            this.setIsBatchOperation(false);
          } else {
            // 快餐模式
            const d = res.data;
            if (d && d.printD && d.printD.printType === 'PRINT_PARALLEL') {
              this.fastPrintAddBill(d.printD.printD);
            }

            if (d && d.bizPrintLeaveTableParamsList) {
              this.printLeaveTable(d.bizPrintLeaveTableParamsList);
            }
            this.$vemit('clearSearch');
            setTimeout(() => {
              this.$vemit('fastClearEmptyBill');
            }, 10);
          }
          // 结算成功是否打印结账单提示 0：不开启打印结账单提醒 1：开启打印结账单提醒
          const { isEnableAlertWhenPrintSettleBill } = this.billData;
          if (
            isEnableAlertWhenPrintSettleBill != undefined
              && isEnableAlertWhenPrintSettleBill == 1
          ) {
            this.$confirm(
              `${this.$t('Biz.Settlement.Tip9')}`,
              `${this.$t('Dict.Tips')}`,
              {
                confirmButtonText: `${this.$t('Dict.Sure')}`,
                cancelButtonText: this.$t('Dict.Cancel'),
                type: 'warning',
                dangerouslyUseHTMLString: true,
              },
            )
              .then(() => {
                this.printSettleBill();
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: this.$t('Dict.OperationCancelled'),
                });
              });
          } else {
            this.printSettleBill();
          }
        } else if (res.result == '-1') {
          this.errorMsgDisplay(res.msg);
        } else if (res.result == '-2') {
          // 没有成功的是 -2  就是弹验证授权框
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
          setTimeout(() => {
            this.errorMsgDisplay(res.msg);
          }, 200);
        } else {
          this.errorMsgDisplay(res.msg);
        }
      })
        .catch((errCode, msg) => {
          this.errorMsgDisplay(msg);
        });
    },
    // 预结单打印
    payPreformPrint() {
      if (this.checkEmptyBill()) {
        return false; // 校验是否是空账
      }
      let url = 'canyin.pos.settlement.paybottombtn.printpresettlebill';
      const { isTeamSettlement } = this.billData; // 当前是否是团队结算
      if (
        isTeamSettlement != undefined
          && isTeamSettlement != null
          && isTeamSettlement == '1'
      ) {
        url = 'canyin.pos.settlement.paybottombtn.teamprintpresettlebill';
      }
      const params = this.getBaseSubmitParams();
      params.payway_list = this.getSubmitPayWay();
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success && data.result == 1) {
          this.refreshBill();
          if (data.data.modify_time) {
            this.baseBs.modify_time = data.data.modify_time;
          }
          if (data.data.printInfo) {
            this.$message({
              type: 'warn',
              message: data.data.printInfo,
              duration: 2000,
            });
          } else if (data.data.printType == 'PRINT_PARALLEL' && data.data.printD) {
            this.$log.info('更多结算打印预结单');
            this.$devices.Printer.print(JSON.parse(data.data.printD));
          }
        } else {
          this.errorMsgDisplay(data.msg);
        }
      });
    },
    // 埋单
    payPayBill() {
      const pointState = this.baseBs.point_state;
      if (pointState != undefined && pointState != null && pointState != '') {
        // 客位状态是预付状态
        if (pointState === 6) {
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error65')}`,
            duration: 2000,
          });
        } else {
          let url = 'canyin.pos.settlement.CheckBill'; // 埋单操作
          const params = this.getBaseSubmitParams();
          const teamSettelement = this.judgeisTeamSettlement();
          if (teamSettelement !== false) {
            // 团队结算
            url = teamSettelement.urlTeamCheckBill; // 埋单操作
          }
          params.payway_list = this.getSubmitPayWay();
          ajax(url, {
            contentType: 'paramsEncoded',
            data: params,
          }).then((res) => {
            if (res.success) {
              if (res.result == 1) {
                this.$message.success(`${this.$t('Biz.Settlement.Success23')}`);
                // 打印
                if (res.data.printType == 'PRINT_PARALLEL' && res.data.printD) {
                  this.$devices.Printer.print(JSON.parse(res.data.printD));
                }
                if (res.data.printInfo) {
                  this.$message({
                    type: 'warn',
                    message: res.data.printInfo,
                    duration: 2000,
                  });
                }
                this.$vemit('updatePoint');
                // 更新账单信息
                this.refreshBill();
              } else {
                this.errorMsgDisplay(res.msg);
              }
            } else {
              this.errorMsgDisplay(res.msg);
            }
          });
        }
      } else {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error66')}`,
          duration: 2000,
        });
      }
    },
    // 撤销埋单
    undoPayPayBill(authData = {}) {
      const pointState = this.baseBs.point_state;
      this.$vonce('authCode', (code) => {
        this.undoPayPayBill(code);
      });
      if (pointState != undefined && pointState != null && pointState != '') {
        // 客位状态是预付状态
        if (pointState === 6) {
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error65')}`,
            duration: 2000,
          });
        } else {
          let url = 'canyin.pos.settlement.BackCheckBill'; // 撤销埋单操作
          const params = {
            bsId: this.baseBs.id, // 流水,
            pointId: this.resData.pointId,
            ...authData,
          };
          const { isTeamSettlementFlg, isTeamBill } = this;
          if (isTeamSettlementFlg == 1 && isTeamBill == 1) {
            params.teamBsIds = this.baseBs.teamBsIds;
            url = 'canyin.pos.settlement.TeamBackCheckBill'; // 撤销埋单操作
          }
          ajax(url, {
            contentType: 'paramsEncoded',
            data: params,
          }).then((res) => {
            if (res.success) {
              if (res.result == 1) {
                this.$message.success(`${this.$t('Biz.Settlement.Success24')}`);
                this.newAddPayWayList = [];
                // 更新账单信息
                this.refreshBill();
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg,
                  duration: 2000,
                });
              }
            } else {
              this.$message({
                type: 'error',
                message: res.msg,
                duration: 2000,
              });
            }
          });
        }
      } else {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Success66')}`,
          duration: 2000,
        });
      }
    },
    // 服务费
    payServiceCharge(method) {
      this.$refs[method].open([this.resData.pointId, this.baseBs.id, this.baseBs.teamBsIds]);
    },
    serviceMoney(val) {
      this.currentServiceMoney = val;
      this.refreshBill('1');
    },
    // 最低消费
    payMinimumConsumption(method) {
      this.$refs[method].open([this.resData.pointId, this.baseBs.id]);
    },
    minimumConsumption(val) {
      this.minimumConsumptionData = val;
      this.refreshBill('1');
    },
    // 群光积分
    payGroupLightIntegral(method) {
      this.$refs[method].open(
        {
          pointId: this.resData.pointId,
          bsId: this.baseBs.id,
        },
      );
    },
    // 预付
    payPayAdvance() {
      const pointState = this.baseBs.point_state;
      // if (pointState != undefined && pointState != null && pointState != '') {
      if (pointState || pointState === 0) {
        // 客位状态是埋单状态
        if (pointState === 3) {
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error67')}`,
            duration: 2000,
          });
        } else {
          const isExistPayWay = this.getSubmitPayWay();
          if (isExistPayWay.length === 0) {
            this.$message({
              type: 'error',
              message: `${this.$t('Biz.Settlement.Error68')}`,
              duration: 2000,
            });
          } else {
            // 先付后折时, 阻止使用
            if (this.payThenDiscountFlg) {
              this.$message.error(this.$t('Biz.Settlement.ErrorPrePay68'));
              return false;
            }
            let url = 'canyin.pos.settlement.paybottombtn.prepay'; // 预付操作
            const params = this.getBaseSubmitParams();
            const { isTeamSettlementFlg, isTeamBill } = this;
            if (isTeamSettlementFlg == 1 && isTeamBill == 1) {
              url = 'canyin.pos.settlement.paybottombtn.teamprepay';
            }
            params.payway_list = this.getSubmitPayWay();
            ajax(url, {
              contentType: 'paramsEncoded',
              data: params,
            }).then((res) => {
              if (res.result == 1) {
                this.$message.success(`${this.$t('Biz.Settlement.Success25')}`);
                this.prePayBtnBusinessType = 3;
                if (res.data.printType == 'PRINT_PARALLEL' && res.data.printD) {
                  this.$devices.Printer.print(JSON.parse(res.data.printD));
                }
                if (res.data.printInfo) {
                  this.$message({
                    type: 'warn',
                    message: res.data.printInfo,
                    duration: 2000,
                  });
                }
                this.$vemit('updatePoint');
                // 更新账单信息
                this.refreshBill();
              } else {
                this.errorMsgDisplay(res.msg);
              }
            });
          }
        }
      } else {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error66')}`,
          duration: 2000,
        });
      }
    },
    // 撤销预付
    undoPayPayAdvance(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.undoPayPayAdvance(code);
      });
      const pointState = this.baseBs.point_state;
      if (pointState != undefined && pointState != null && pointState != '') {
        // 客位状态是埋单状态
        if (pointState === 3) {
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error67')}`,
            duration: 2000,
          });
        } else {
          /**
           * 撤销预付,不在执行删除结算方式,所以不需要再进行撤销时的二次确认和阻拦
           * CY7-6687(20200611)
           */
          // // 判断结算方式中是否包含线上结算方式
          // const onlinePayWayList = this.checkExistOnlinePayWay();
          // if (onlinePayWayList.length > 0) {
          //   console.log(111111111111);
          //   this.$message({
          //     type: 'error',
          //     message:
          //     `${this.$t('Biz.Settlement.IndexMsg4')} [${
          //       onlinePayWayList[0].name
          //     }] ${this.$t('Biz.Settlement.IndexMsg5')}`,
          //     duration: 2000,
          //   });
          //   return false;
          // }
          // // 判断结算方式中是否包含“删除时需确认”的结算方式，如果包含，提示“请先删除[x]结算方式，才能撤销预付
          // const needConfirmDelPayWayList = this.checkExistNeedConfirmDelPayWay();
          // if (needConfirmDelPayWayList.length > 0) {
          //   console.log(3333333);
          //   this.$message({
          //     type: 'error',
          //     message:
          //     `${this.$t('Biz.Settlement.IndexMsg4')} [${
          //       needConfirmDelPayWayList[0].name
          //     }] ${this.$t('Biz.Settlement.IndexMsg5')}`,
          //     duration: 2000,
          //   });
          //   return false;
          // }
          let url = 'canyin.pos.settlement.paybottombtn.backprepay'; // 撤销预付操作
          // 撤销预付参数
          const params = {
            ...authData,
            bsId: this.baseBs.id, // 流水,
            pointId: this.resData.pointId,
          };
          const { isTeamSettlementFlg, isTeamBill } = this;
          if (isTeamSettlementFlg == 1 && isTeamBill == 1) {
            params.teamBsIds = this.baseBs.teamBsIds;
            url = 'canyin.pos.settlement.paybottombtn.teambackprepay';
          }
          ajax(url, {
            contentType: 'paramsEncoded',
            data: params,
          }).then((res) => {
            if (res.result === 1) {
              this.$message.success(`${this.$t('Biz.Settlement.Success26')}`);
              this.prePayBtnBusinessType = 4;
              this.$vemit('updatePoint');
              // 更新账单信息
              this.refreshBill();
            } else if (res.result === -2) {
              // 授权
              this.$vemit('posAuthCheck', {
                message: res.msg,
              });
            } else {
              this.$message({
                type: 'error',
                message: res.msg,
                duration: 2000,
              });
            }
          });
        }
      } else {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error66')}`,
          duration: 2000,
        });
      }
      return true;
    },
    // 子组件触发获取父组件组织的已用结算方式数据, 可为通用方法, 目前集团挂账用
    componentGetPayWayList(callback) {
      callback(this.getSubmitPayWay());
    },
    // 集团挂账后,执行的相关操作(刷账单或取消集团挂账)
    operateGroupPayouts(data, payway) {
      if (data) {
        // 刷账单
        this.refreshBill();
      } else {
        // 不在执行使用取消接团挂账接口进行取消, 同意走CRM预结逻辑和代码(并增加相应判断)
        this.clearOnlinePayWayByPayWay(payway);
      }
    },
    // 提现
    payWithdrawDeposit() {
      // 检查是否存在银行卡或者支票
      // 找零金额必须大于0
      const { giveChange } = this;
      if (giveChange > 0) {
        const bankOrChequeList = this.checkExistBankOrChequePayWay();
        if (bankOrChequeList.length > 0) {
          this.addPayWay({
            payway_id: 1,
            name: '人民币',
            payway_type_id: '501',
            take_money: this.getCashTypePayMoney() - Number(giveChange),
            pay_money: this.getCashTypePayMoney() - Number(giveChange),
            give_change: 0,
            is_deposit: 0,
            sort_order: 1,
            finish: false,
            dis_name: '',
            confirm_del: false,
          });
        } else {
          this.$message({
            type: 'error',
            message: `${this.$t('Biz.Settlement.Error69')}`,
            duration: 2000,
          });
        }
      } else {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error70')}`,
          duration: 2000,
        });
      }
      // 关闭提现页面
      this.$vemit('payMoreCloseBus');
    },
    // 缓存当前抹零执行状态
    wipeStateSysData() {
      /**
         * '抹零'按钮显示业务规则: 当bsData数据中wipeFlg
         * 为true,则该流水 执行了抹零, 不可再执行, 按钮显示为'取消抹零';
         * 为false,则该流水 未被抹零, 可执行抹零, 按钮显示'执行抹零'.
         */
      setTimeout(() => {
        if (this.posOrderBill.bsData.wipeFlg !== null
            && this.posOrderBill.bsData.wipeFlg !== undefined
        ) {
          this.wipeState.state = this.posOrderBill.bsData.wipeFlg;
        }
      });
    },
    // 执行或取消抹零
    wipeOpration(data) {
      // 检查是否存在结算方式
      if (this.checkExistPayWay() !== 0) {
        this.$message.error(`${this.$t('Biz.Settlement.Error71')}`);
        return false;
      }
      const params = {
        bsId: this.baseBs.id,
        // wipeFlg: !this.posOrderBill.bsData.wipeFlg,
      };
        // 执行 中餐/快餐 业务判断: 功能设置参数来源不同
      if (this.posInfo.controlMode !== '3') {
        params.wipeFlg = !this.posOrderBill.bsData.wipeFlg;
      } else {
        // 快餐时(区别于中餐), 初始pointbsinfo接口,该字段可能会不存在,视为执行抹零(即默认)
        // params.wipeFlg = !this.getFastFoodBillData.bsData.wipeFlg;
        params.wipeFlg = this.getFastFoodBillData.bsData.wipeFlg === false;
      }
      // 如果是团队结算
      if (this.judgeisTeamSettlement() !== false) {
        params.teamBsIds = this.baseBs.teamBsIds;
      }
      ajax('canyin.pos.settlement.updatebswipeflg', {
        params,
      }).then((res) => {
        if (res.code === '1') {
          if (params.wipeFlg) {
            this.$message.success(`${this.$t('Biz.Settlement.Success27')}`);
          } else {
            this.$message.success(`${this.$t('Biz.Settlement.Success28')}`);
          }
          // this.setSettleDiscType({ list: this.baseBs.id });
          // 刷新账单(包含中餐或快餐)
          this.refreshBill();
        }
      });
    },
    // 监听 结算方式搜索框的搜索事件
    onSearch(searchText) {
      this.searchText = searchText.toLowerCase();
      const searchDiscPlanAndPayWayTempData = cloneDeep(
        this.searchDiscPlanAndPayWayData,
      );
      // 当搜索框无值时显示全部
      if (!this.searchText) {
        // 搜索后的结算数据集合(向容器)填充
        this.dealPageData('payWayType', searchDiscPlanAndPayWayTempData.payWayList, false);
        return false;
      }
      const keyFilters = quickSearch((`${this.searchText}`).toLowerCase());
      if (!isEmpty(this.searchDiscPlanAndPayWayData.payWayList)) {
        const payWayList = this.searchDiscPlanAndPayWayData.payWayList.filter(
          (item) => {
            // 按拼音过滤
            const pinYin = String(item.pinyin).toLowerCase();
            for (let i = 0; i < keyFilters.length; i += 1) {
              const key = keyFilters[i];
              // 此处注意，不符合过滤条件的循环里切记也不能用return false,否则会终止循环,导致匹配出错
              if (pinYin.indexOf(key) !== -1) {
                return true;
              }
            }
          },
        );
        // 搜索后的结算方式数组集合
        searchDiscPlanAndPayWayTempData.payWayList = payWayList;
        // 搜索后的结算数据集合(向容器)填充
        this.dealPageData('payWayType', searchDiscPlanAndPayWayTempData.payWayList, false);
      }
      return '';
    },
    // 监听 活动方案搜索框
    onSearchDisPlan(searchText) {
      const searchTextTmp = searchText.toLowerCase();
      const searchDiscPlanAndPayWayTempData = cloneDeep(
        this.searchDiscPlanAndPayWayData,
      );
        // 当搜索框无值时显示全部
      if (!searchTextTmp) {
        // 搜索后的折扣数据集合(向容器)填充
        this.dealPageData('discType', searchDiscPlanAndPayWayTempData.discTypeList, false);
        return false;
      }
      const keyFilters = quickSearch((`${searchTextTmp}`).toLowerCase());
      if (!isEmpty(this.searchDiscPlanAndPayWayData.discTypeList)) {
        const discTypeList = this.searchDiscPlanAndPayWayData.discTypeList.filter(
          (item) => {
            // 按拼音过滤
            const pinYin = String(item.pinyin).toLowerCase();
            for (let i = 0; i < keyFilters.length; i += 1) {
              const key = keyFilters[i];
              // 此处注意，不符合过滤条件的循环里切记也不能用return false,否则会终止循环,导致匹配出错
              if (pinYin.indexOf(key) !== -1) {
                return true;
              }
            }
          },
        );
        // 搜索后的折扣方案数据集合
        searchDiscPlanAndPayWayTempData.discTypeList = discTypeList;
        // 搜索后的折扣数据集合(向容器)填充
        this.dealPageData('discType', searchDiscPlanAndPayWayTempData.discTypeList, false);
      }
      return '';
    },
    // 结算方式-分页重置: 结算搜索组件触发
    resetSearchPaywayPaging(dontForWard) {
      // 重置分页-按钮
      this.payWayPageOrder = 1;
      // 重置分页-显示内容:false/null - 不执行跳页或重置分页显示内容
      if (!dontForWard) {
        this.pageForWard('payWayType', this.payWayPageOrder);
      }
    },
    // 活动方案-分页重置: 优惠搜索组件触发
    resetSearchDisPlanPaging(dontForWard) {
      // 重置分页-按钮
      this.shemePageOrder = 1;
      // 重置分页-显示内容:false/null - 不执行跳页或重置分页显示内容
      if (!dontForWard) {
        this.pageForWard('discType', this.shemePageOrder);
      }
    },
    // 活动方案和结算方式-按钮-文字内容(及快捷键内容)-样式动态计算
    // btnTxt-按钮文本,hotkey-热键,className-传来的类名
    calcDisPayBtnTxtStyle(btnTxt, hotkey, className) {
      if (hotkey || hotkey === 0) {
        let len = 0;
        each(btnTxt, (i) => {
          if (btnTxt.charCodeAt(i) > 255) { // 如果当前字符的编码大于255
            len += 2; // 中文所占字节数加2
          } else {
            len += 1; // 英文类所占字节数加1
          }
        });
        if (len > 14) {
          return `${className} txtRetrunLine`;
        }
        return className;
      }
      return '';
    },
    // 上传优惠类型到Vuex
    setDiscTypeCache(data) {
      this.setSettleDiscType({ list: data });
    },
    ...mapActions([
      'getSettlementBillData',
      'getOrderBill',
      'setSettleDiscType',
    ]),
    ...mapMutations({
      setPayPageOpen: 'setPayPageOpen',
      setCancelTransferPointState: 'SET_POS_CANCELTRANSFERPOINTSTATE',
      setIsBatchOperation: 'IS_BATCH_OPERATION',
      setSettleBsCode: 'SET_SETTLE_BS_CODE',
    }),
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .mt170{
    margin-top:170px;
  }
  .mt0{
    margin-top:0;
  }
  div.pos-pager{
    display: inline-block;
  }
  .cursorPointer{
    cursor:pointer;
  }

  .realIncome{
    position: relative;
  }
  .realIncome:after{
    position: absolute;
    content: " ";
    width: 100%;
    height: 1px;
    background: #fff;
    left: 0;
    top: 50%;
  }
  .listNum{
    font-size: 12px;
    color: #9d9d9d;
  }
  .pay-roomMsg-pager {
    height: 72px;
    overflow: hidden;
  }
  .pay-roomMsg-pager-ul {
    height: 100%;
  }
  .tc{
    text-align: center;
  }
  .tr{
    text-align: right;
  }
  .f20{
    font-size: 20px;
  }
  .f24{
    font-size: 24px;
  }
  .fcb{
    color: #63b3e8;
  }
  .fcg{
    color: #6acb48;
  }
  .fcr{
    color: #fe0000;
  }
  .df{
    display: flex;
  }
  .p5{
    padding:5px;
  }
  .p12{
    padding: 12px;
  }
  .w15{
    width: 15%;
  }
  .w19{
    width: 19%;
  }
  .bcF5{
    background-color: #f5f5f5;
  }
  .bcf{
    background-color: #fff;
  }
  .bcE4{
    background-color: #e4e4e4;
  }
  .bcb{
    background: #63b3e8;
  }
  .nextbcg{
    color: #273844;
    background: #42bbc6 !important;
    font-weight:bold;
  }
  .bcg{
    background: #6acb48;
  }
  .w17{
    width: 17%;
  }
  .w145{
    width: 145px;
  }
  .borR::after{
    content: '';
    width: 1px;
    height: 46px;
    display: inline-block;
    position: absolute;
    top: 48%;
    right: 0;
    transform: translateY(-50%);
    background-color: #e4e4e4;
  }
  .w25{
    width: 25%;
  }
  .w50{
    width: 50%;
  }
  .min-w50{
    min-width: 50%;
  }
  .w60{
    width: 60%;
  }
  .w45{
    width: 45%;
  }
  .pl5{
    padding-left: 5px;
  }
  .pt5{
    padding-top: 5px;
  }
  .pl10{
    padding-left: 10px;
  }
  .mt5{
    margin-top: 5px;
  }
  .mr20{
    margin-right: 20px;
  }
  .fw{
    font-weight: bold;
  }
  .displayInline{
    > span {
      // font-size: 19px !important;
      &.f24 {
        font-size: 21px !important;
      }
    }
  }
  .pay-content{
    height: 100%;
    padding-bottom: 50px;
    position: relative;
    overflow: hidden;
  }

  .contentR{
    background: #9dc1ca;
    height: 100%;
    display: flex;
    flex:2;
    flex-direction: column;
  }

  .pay-selected {
    height: 180px;
    border-radius: 8px;
    padding: 12px;
    flex: none;
    position: relative;
    background: #c5e0e5;

    .pay-select-priceList {
      height: 58px;
      width: 100%;
      background: white;
      border-radius: 5px;

      li{
        width: 23%;
        height: 58px;
        line-height: 74px;
        padding-left: 12px;
        position: relative;
        font-size: 0;

        span{
          font-size: 14px;
          &.f24 {
            font-size: 24px;
          }
        }

        > div{
          position: absolute;
          top: 4px;
          left: 6px;
          line-height: 1;
          font-size: 14px;
        }

        &:nth-child(4),
        &:nth-child(5) {
          width: 15.4%;

          > span {
            line-height: 82px;
          }
        }
      }
    }

    .pay-selectedList{
      width: 100%;
      background: white;
      position: relative;

      .division-div{
        float: left;
        width: 24%;
      }
      .vertical-middle{
        width: 100%;
        padding: 5px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);

        .payoutsAccountName {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .pay-loading{
          width: 16px;
          height: 16px;
          margin: 0 auto;
          position: relative;
          display: inline-block;
          vertical-align: top;
          border: 5px solid rgba(255,0,0,0.9);
          border-left: 5px solid rgba(0,0,0,0);
          border-right: 5px solid rgba(0,0,0,0);
          border-radius: 50px;
          background-color: rgba(0,0,0,0);
          opacity: .9;
          animation: spinoffPulse 1s infinite linear;
        }

        @keyframes spinoffPulse {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      }
      .is-standard {
        & > span {
          display: block;
          width: 100%;
          height: 50%;
        }
      }
      ul{
        flex-wrap: wrap;
        height: 115px;
        li{
          flex-wrap: wrap;
          height: 50px;
          border-radius: 6px;
          position: relative;
          margin-top: 4px;
          margin-right: 4px;
          color: #fff;
        }
      }
    }
  }
  .pay-select-scheme{
    color:#273844;
    margin-top:5px;
    flex:2;
    overflow: hidden;
    justify-content: space-between;
    .active-scheme{
      position: relative;
      width: 49.5%;
      .schemeTitle{
        position: absolute;
        width: 100%;
        background: #c5e0e5;
        height: 45px;
        line-height: 45px;
        padding:0 10px;
        margin-bottom: 1px;
        justify-content: space-between;
        z-index: 10000;
        .shemeCirclePagerBtn{
          .btnPageActive {
            background-color: #42bbc6;
            color: #ffffff;
          }
          li{
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #e2f0f2;
            color: #273844;
            text-align: center;
            line-height: 38px;
            margin-top: 3px;
            margin-left: 2px;
          }
          // li:hover{
          //   background-color: #87d2d9;
          //   color: #273844
          // li:first-child{
          //   background: #e2f0f2 !important;
          //   color: #273844;
          // }
        }
      }
      .active-scheme-list{
        height: 376px;
        padding-top: 45px;
        position: relative;
        background-color: #c5e0e5;
        // display: flex;
        .division-div{
          width:100%;
          color: #273844;
          margin-top: 1%;
          margin-right:0.5%;
        }
        .division-div.division-div-fixed {
          top: unset;
          bottom: 49px;
          margin: 0;
        }
        ul{
          position:absolute;
          top: 45px;
          li{
            float: left;
            background: #f5f9fa;
            height:44.5px;
            width: 32%;
            margin-bottom: 2px;
            margin-right: 2px;
            position: relative;
            padding:2px;
            .midpoint{
              transform: translate(-50%,-50%);
              position: absolute;
              top: 50%;
              left: 50%;
              width: 100%;
              padding: 2px;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              // 非标老弹性盒子语法, 被构建工具autoprefixer忽略, 所以进行构建时处理
              /*! autoprefixer: off */
              -webkit-box-orient: vertical;
              /* autoprefixer: on */
            }
            .midpoint.disPlanBtn {
              height: 100%;

              .btnTxt {
                overflow: hidden;

                &.txtRetrunLine {
                  line-height: 1.08;
                }
              }

              .hotkey {
                position: absolute;
                margin: auto;
                left: 0;
                right: 0;
                font-size: 12px;
                color: #666;

                &.txtRetrunLine {
                  bottom: -2px;
                }
              }
            }
          }
          li:nth-child(3n+3) {
            margin-right: 0;
          }
          .shemePagerBtn{
            position: absolute;
            right: 0.1%;
            bottom: 0;
          }
        }
        .pos-order-tables-search-wrap {
          position: absolute;
          left: 50%;
          bottom: 8px;
          margin-left: -105px;
        }


      }
    }
  }
</style>
<style lang="less">
  .online-revoke {
    .el-dialog__body {
      padding: 5px 20px;
      .dialog-top {
        display: flex;
        align-items: center;
        .el-message-box__status {
          position: relative;
          top: auto;
          transform: translateY(0%);
          font-size: 24px !important;
          margin-right: 3px;
        }
      }
      .dialog-bottom {
        display: flex;
        margin: 10px 0;
        & > div {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          & > span {
            display: block;
            margin-top: 5px;
          }
        }
      }
    }
  }
</style>
