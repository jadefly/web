import i18n from '@/locales/index';
import * as tableStyle from '@/common/dictionary/pos-order-table-style';
// 对数据进行格式化下   这里返回函数而不是对象，是因为多语言切换时不会重新加载此文件引起语言不能切换
export default () => ({
  // 客位代码
  [tableStyle.CODE]: `
    <div class="code"><%= code %></div>
  `,
  // 会员生日
  [tableStyle.BIRTHDAY]: `
    <% if (birthday) { %>
      <div class="code"><i class="logo icon icon-dangao"></i><%= birthday %></div>
    <% } else { %>
      <div></div>
    <% } %>
  `,
  // 会员卡余额
  [tableStyle.CARDBALANCE]: `
    <% if (cardBalance || cardBalance === 0) { %>
      <div class="code">${i18n.t('Dict.Rest')}<%= cardBalance %></div>
    <% } else { %>
      <div></div>
    <% } %>
  `,
  // 会员名称
  [tableStyle.MEMBERNAME]: `
    <% if (memberName) { %>
      <div class="code"><i class="logo icon icon-huangguan"></i><%= memberName %></div>
    <% } else { %>
      <div></div>
    <% } %>
  `,
  // 预付差值
  [tableStyle.ADVANCEBALANCE]: `
    <% if (advanceBalance || advanceBalance === 0) { %>
      <div class="code"><%= advanceBalance %></div>
    <% } else { %>
      <div></div>
    <% } %>
  `,
  // 团队名
  [tableStyle.TEAMNAME]: `
    <div class="groupInfo<%= teamName ? '' : ' hide' %>"><%= teamName %></div>
  `,
  // 预订时间
  [tableStyle.BOOKINGTIME]: `
    <div class="bookingInfo"><%= bookingInfo ? (bookingInfo.reserveDate ? bookingInfo.reserveDate : '') : '' %></div>
  `,
  // 预订人姓名
  [tableStyle.BOOKINGNAME]: `
    <div class="bookingInfo">
      <% if (state === 4) { %>
        <%= bookingInfo ? (bookingInfo.bookPerson ? bookingInfo.bookPerson : '') : '' %>
      <% } else { %>
        <%= bookPerson ? bookPerson : '' %>
      <% } %>
    </div>
  `,
  // 预订人手机号
  [tableStyle.BOOKINGPHONE]: `
    <div class="bookingInfo"><%= bookingInfo ? (bookingInfo.contactTel ? bookingInfo.contactTel : '') : null %></div>
  `,
  // 就餐人数信息
  [tableStyle.DINERINFO]: `
    <div class="peopleInfo"><i class="icon icon-user"></i><em><%= peopleQty %></em>/<%= defaultCapacity %></div>
  `,
  // 开台时间 2019-01-17T10:20:36.298 传过来的是这样进行截取
  [tableStyle.STARTTIME]: `
    <div class="startTime"><i class="icon icon-clock"></i><%= openTime && openTime.substring(11,16) %></div>
  `,
  // 就餐时长
  [tableStyle.DININGTIME]: `
    <div class="diningTime"><i class="icon icon-clock"></i><%= spendTime ? spendTime : 0 %></div>
  `,
  // 账单总额
  [tableStyle.BILLAMOUNT]: `
    <div class="billAmount <%= isShowBillAmount ? '' : 'hide' %>"><%= lastTotal ? lastTotal*1000/1000 : 0 %></div>
  `,
  // 人均消费
  [tableStyle.PERCAPITA]: `
    <div class="perCapita"><%= (lastTotal && peopleQty) ? Math.round(lastTotal*100/peopleQty)/100 : 0 %></div>
  `,
  // 已加单（未加单标记）// 如果是占用客位并且客位中无品项显示未加单标识
  [tableStyle.HAVEITEMS]: `
    <div class="billInfo<%= (!haveItem && state !== 1) ? '' : ' hide' %>"><%= !haveItem ? '${i18n.t('Biz.Order.NotBilled')}' : '' %></div> 
  `,
  // 押金标识
  [tableStyle.DEPOSIT]: `
    <div class="deposit"><%= deposit ? ('${i18n.t('Dict.Btn.Deposit')}' + deposit) : '' %></div>
  `,
  // 翻台标识
  [tableStyle.TURNOVER]: `
    <div class="turnover"><%= turnoverCount > 0 ? ('${i18n.t('Biz.Order.TurnTable')}' + turnoverCount) : '' %></div>
  `,
  [tableStyle.ISVIP]: `
    <div class="vip"><%= isVIP ? '<span>VIP</span>' : '' %></div>
  `,
  // 续单
  [tableStyle.ISCONTINUEDBILL]: `
    <div class="continued"><%= isContinuedBill ? '<span>${i18n.t('Biz.Order.ContinueOrder')}</span>' : '' %></div>
  `,
  // 账单备注 字符串
  [tableStyle.BIllREMARK]: `
    <div class="textOverHidden"><%= billRemark ? billRemark : '' %></div>
  `,
  // 叫起状态 字符串
  [tableStyle.CALLSTATE]: `
    <div class="textOverHidden"><%= callState ? callState : '' %></div>
  `,
  // 会员卡卡型 字符串
  [tableStyle.MEMBERSHIPCARDTYPE]: `
    <div class="textOverHidden"><%= membershipCardType ? membershipCardType : '' %></div>
  `,
  // 会员消费次数 Number
  [tableStyle.MEMBERPAYNUM]: `
    <div class="billAmount"><%= memberPayNum ? (memberPayNum + '${i18n.t('Dict.Btn.Times')}') : '' %></div>
  `,
  // 上菜进度 字符串
  [tableStyle.PROGRESSOFSERVINGDISHES]: `
    <div class="serveDishes"><%= (progressOfServingDishes && progressOfServingDishes.split('/')[1] !== '0')
      ? (Number(progressOfServingDishes.split('/')[0]) + '/' + Number(progressOfServingDishes.split('/')[1])): '' %>
    </div>
  `,
  // 上菜进度 字符串 <%= bookingTimes ? ('订' + bookingTimes) : '' %> <%= (!haveItem && state !== 1) ? '' : ' hide' %>
  [tableStyle.BOOKINGTIMES]: `
    <% if (bookingTimes) { %>
      <div class="<%= (state === 4) ? 'bookingStateTimes' : 'groupInfo' %>"><%= bookingTimes ? ('${i18n.t('Biz.Order.Book')}' + bookingTimes) : '' %></div>
    <% } else { %>
      <div></div>
    <% } %>
  `,
});
