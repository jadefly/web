import i18n from '@/locales/index';
import {
  BAR_ID,
  BUSSINESS_MANAGE_ID,
  BUSSINESS_START_ID,
  COMPUTER_CLOSE_ID,
  CRM_ID,
  FINANCIAL_ID,
  KITCHEN_ID,
  MNG_ID,
  PARAME_ID,
  REPORT_ID,
  SEARCH_SEARCH_ID,
  SUPPLY_CHAIN_ID,
  SYSTEM_TOOLS_ID,
  UPDATE_INFO_ID,
} from './moudle-ids';

export default () => ([{
  moduleId: BUSSINESS_START_ID,
  MoudleName: i18n.t('Dict.FrontOfficeBusiness'),
  method: 'toBussiness',
  svgName: 'front-desk',
}, {
  moduleId: KITCHEN_ID,
  MoudleName: i18n.t('Dict.KitchenManagement'),
  method: 'toKitchen',
  svgName: 'kitchen-management',
}, {
  moduleId: BAR_ID,
  MoudleName: i18n.t('Biz.UserDesktop.BarCounting'),
  routerPath: 'barCounter',
  svgName: 'bataipandian',
}, {
  moduleId: BUSSINESS_MANAGE_ID,
  MoudleName: i18n.t('Biz.UserDesktop.BusinessManagement'),
  routerPath: 'bussinessManagement',
  svgName: 'bussiness-management',
}, {
  moduleId: FINANCIAL_ID,
  MoudleName: i18n.t('Biz.UserDesktop.FinancialManagement'),
  routerPath: 'financialManagement',
  svgName: 'finance-management',
}, {
  moduleId: SEARCH_SEARCH_ID,
  MoudleName: i18n.t('Dict.BusinessReport'),
  routerPath: 'searchPrint',
  svgName: 'bar-check',
}, {
  moduleId: SYSTEM_TOOLS_ID,
  MoudleName: i18n.t('Biz.UserDesktop.Tools'),
  routerPath: 'systemTools',
  svgName: 'system-tools',
}, {
  moduleId: PARAME_ID,
  MoudleName: i18n.t('Biz.UserDesktop.SystemParameter'),
  routerPath: 'parameterSetting',
  svgName: 'parameter-setting',
}, {
  moduleId: MNG_ID,
  MoudleName: i18n.t('Dict.BackStageManagement'),
  method: 'to',
  parameter: MNG_ID,
  svgName: 'back_manage',
}, {
  moduleId: REPORT_ID,
  MoudleName: i18n.t('Dict.ReportCenter'),
  method: 'to',
  parameter: REPORT_ID,
  svgName: 'back_report',
}, {
  moduleId: CRM_ID,
  MoudleName: 'CRM',
  method: 'toCRM',
  svgName: 'crm',
}, {
  moduleId: SUPPLY_CHAIN_ID,
  MoudleName: i18n.t('Dict.CloudSupplyChain'),
  method: 'toSupplyChain',
  svgName: 'supply-chain',
}, {
  moduleId: COMPUTER_CLOSE_ID,
  MoudleName: i18n.t('Dict.TurnOffYourComputer'),
  method: 'closeComputer',
  iconName: 'icon-shutdown',
}, {
  moduleId: UPDATE_INFO_ID,
  MoudleName: '更新详情',
  method: 'updateInfo',
  iconName: 'icon-gengxinxiangqing',
}]);
