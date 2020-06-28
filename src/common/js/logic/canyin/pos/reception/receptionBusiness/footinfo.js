export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinessfooterinfov2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      currentBusinessDay: { // 当前营业日
        notSettlementMoney: data.data.footerInfo.notsettlementmoney, // 未结金额
        opened: data.data.footerInfo.opened !== '-' ? parseInt(data.data.footerInfo.opened, 0) : null, // 开台数
        settled: parseInt(data.data.footerInfo.settled, 0), // 结算数
        settlementMoney: data.data.footerInfo.settlementmoney, // 已结金额
        unsettle: data.data.footerInfo.unsettle !== '-' ? parseInt(data.data.footerInfo.unsettle, 0) : null, // 未结算数
        settledPeople: data.data.footerInfo.settledPeople, // 结算人数
        unsettledPeople: data.data.footerInfo.unsettledPeople, // 未结人数
      },
      currentShift: { // 当前市别信息
        notSettlementMoney: data.data.footerInfo.notSettlementMoneyCurrentShift, // 未结金额
        opened: data.data.footerInfo.openedCurrentShift !== '-' ? parseInt(data.data.footerInfo.openedCurrentShift, 0) : null, // 开台数
        settled: data.data.footerInfo.settledCurrentShift !== '-' ? parseInt(data.data.footerInfo.settledCurrentShift, 0) : null, // 结算数
        settlementMoney: data.data.footerInfo.settlementMoneyCurrentShift, // 已结金额
        unsettle: data.data.footerInfo.unsettleCurrentShift !== '-' ? parseInt(data.data.footerInfo.unsettleCurrentShift, 0) : null, // 未结算数
        settledPeople: data.data.footerInfo.settledPeopleCurrentShift, // 结算人数
        unsettledPeople: data.data.footerInfo.unsettledPeopleCurrentShift, // 未结人数
      },
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
