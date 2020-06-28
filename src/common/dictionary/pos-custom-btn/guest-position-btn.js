import i18n from '@/locales/index';
import * as tableState from '@/common/dictionary/pos-order-table-state';
import * as virtualSource from '@/common/dictionary/pos-virtual-table-source';

export default () => ([{ // 搭台
  id: '1168',
  name: 'shareTable',
  text: i18n.t('Dict.Btn.ShareTable'),
  hotKey: 'F7',
  method: 'shareTable',
  disabled: false,
  allowState: [
    tableState.OCCUPY,
    tableState.CHECK_BILL,
    tableState.LOCK,
    tableState.PRE_PAY,
  ],
}, { // 换台
  id: '194',
  name: 'changeTable',
  text: i18n.t('Dict.Btn.ChangeTable'),
  hotKey: 'F8',
  method: 'changeTable',
  disabled: false,
  allowState: [
    tableState.OCCUPY,
    tableState.PRE_PAY,
    virtualSource.SHARETABLE,
  ],
}, { // 转账
  id: '186',
  name: 'transferAccount',
  text: i18n.t('Dict.Btn.TransferAccount'),
  hotKey: 'F10',
  method: 'transferAccount',
  disabled: false,
  allowState: [tableState.OCCUPY, virtualSource.TRANSFERTABLE],
}, { // 并账
  id: '184',
  name: 'mergeAccount',
  text: i18n.t('Dict.Btn.MergeAccount'),
  hotKey: 'F11',
  method: 'mergeAccount',
  disabled: false,
  allowState: [tableState.OCCUPY],
}, { // 关台
  id: '185',
  name: 'closeAccount',
  text: i18n.t('Dict.Btn.CloseAccount'),
  hotKey: 'F12',
  method: 'closeAccount',
  disabled: false,
  allowState: [tableState.OCCUPY, virtualSource.SHARETABLE],
}, { // 团队开单
  id: '385',
  name: 'teamOrder',
  text: i18n.t('Dict.Btn.TeamOrder'),
  disabled: false,
  method: 'teamOrder',
  hotKey: '',
}, { // 组成团队
  name: 'teamConstitute',
  text: i18n.t('Dict.Btn.TeamConstitute'),
  disabled: false,
  hotKey: '',
}, { // 加入团队
  name: 'teamJoin',
  text: i18n.t('Dict.Btn.TeamJoin'),
  disabled: false,
  hotKey: '',
  allowState: [tableState.OCCUPY],
}, { // 退出团队
  name: 'teamQuit',
  text: i18n.t('Dict.Btn.TeamQuit'),
  disabled: false,
  hotKey: '',
  allowState: [tableState.OCCUPY],
}, { // 押金
  id: '181',
  name: 'deposit',
  text: i18n.t('Dict.Btn.Deposit'),
  disabled: false,
  hotKey: '',
  allowState: [
    tableState.OCCUPY,
    tableState.CHECK_BILL,
    tableState.LOCK,
    virtualSource.SHARETABLE,
    virtualSource.TRANSFERTABLE,
  ],
}, { // 清扫
  name: 'clear',
  text: i18n.t('Dict.ClearState'),
  disabled: false,
  hotKey: '',
  allowState: [tableState.CLEAR],
}]);
