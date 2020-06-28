import checkSystemTime from './checkSystemTime';
import opening from './opening';
import reception from './reception';
import ordering from './ordering';
import cashbox from './cashbox';
import BillBtnsApi from './BillBtnsApi';
import queryitemstate from './queryitemstate';
import token from './token';
import closedaccount from './closedaccount';
import billquery from './billquery';
import returnpointandsettle from './returnpointandsettle';
import itemSellout from './itemSellout';
import itemLimit from './itemLimit';
import bill from './bill';
import closedaccountexitbill from './closedaccountexitbill';
import fillininvoice from './fillininvoice';
import querykvsinfo from './querykvsinfo';
import itemPkgAndSize from './itemPkgAndSize';
import teammangergroup from './teammangergroup';
import canceltransferbills from './canceltransferbills';
import businessreport from './businessreport';
import modifypoint from './modifypoint';
import booking from './booking';
import transferbills from './transferbills';
import mergebill from './mergebill';
import teambill from './teambill';
import teammangeradd from './teammangeradd';
import teammanger from './teammanger';
import teamlog from './teamlog';
import teamloglist from './teamloglist';
import depositdetail from './depositdetail';
import print from './print';
import settlement from './settlement';
import gbticketbill from './gbticketbill';
import addexitbill from './addexitbill';
import printleavetable from './printleavetable';
import closeBill from './closeBill';
import edititempkgbill from './edititempkgbill';
import edititempkgpartbill from './edititempkgpartbill';
import printsettle from './printsettle';
import reserveorderbill from './reserveorderbill';
import crm from './crm';
import updateBill from './updateBill';
import tranItem from './tranItem';
import posserial from './posserial';
import changePrice from './changePrice';
import addBill from './addBill';
import viceScreen from './viceScreen';
import changePwd from './changePwd';
import inputBillOpening from './inputBillOpening';
import inputBillSaleandPrint from './inputBillSaleandPrint';
import printaddbilltag from './printaddbilltag';
import checkViewBill from './checkViewBill';
import hasten from './hasten';
import callup from './callup';
import presentItem from './presentItem';
import confirmWeigh from './confirmWeigh';
import abandonedbill from './abandonedbill';
import addorder from './addorder';
import sharepoint from './sharepoint';
import managerlog from './managerlog';
import openingextension from './openingextension';
import openingprinttest from './openingprinttest'; // 开班测试打印的接口
import designates from './designates';
import designatesreturnpoint from './designatesreturnpoint';
import returnpointandabandonbill from './returnpointandabandonbill';
import takeoutphone from './takeoutphone';
import transRoomBill from './transRoomBill';
import serving from './serving';
import abandonitem from './abandonitem';
import employeepunchtime from './employeepunchtime';
import smokecash from './smokecash';
import cashdeposit from './cashdeposit';
import tourguidescommission from './tourguidescommission';
import syshabit from './syshabit';
import arrangemenubase from './arrangemenubase';
import buffetdeposit from './buffetdeposit';
import fastfoodpresentauth from './fastfoodpresentauth';
import fastfoodchangepriceauth from './fastfoodchangepriceauth';
import itemtimeprice from './itemtimeprice';
import businesssituation from './businesssituation';
import changeauthcode from './changeauthcode';
import posserialproxy from './posserialproxy';
import payservice from './payservice';
import methodsellout from './methodsellout';
import negativesettle from './negativesettle';

export default {
  checkSystemTime,
  opening,
  openingextension,
  openingprinttest,
  reception,
  BillBtnsApi,
  ordering,
  cashbox,
  queryitemstate,
  token,
  closedaccount,
  returnpointandsettle,
  itemSellout,
  itemLimit,
  bill,
  crm,
  closedaccountexitbill,
  fillininvoice,
  querykvsinfo,
  itemPkgAndSize, // 这目前只有规格品项的弹框请求接口,以后要加套餐的
  teammangergroup,
  canceltransferbills,
  modifypoint,
  booking,
  transferbills,
  mergebill,
  businessreport,
  teambill,
  teammangeradd,
  teammanger,
  teamlog,
  teamloglist,
  depositdetail,
  print,
  gbticketbill,
  settlement,
  printleavetable, // 打印留台单
  addexitbill, // 退单的确认请求接口
  closeBill,
  edititempkgbill, // 提交完的套餐修改接口常规
  edititempkgpartbill, // 提交完的套餐修改接口宴会
  printsettle,
  reserveorderbill,
  updateBill,
  tranItem,
  posserial,
  changePrice,
  addBill,
  viceScreen,
  changePwd,
  inputBillOpening,
  inputBillSaleandPrint,
  printaddbilltag,
  checkViewBill,
  hasten,
  callup,
  presentItem,
  confirmWeigh,
  abandonedbill,
  addorder,
  sharepoint,
  managerlog,
  designates,
  designatesreturnpoint,
  returnpointandabandonbill,
  takeoutphone,
  transRoomBill,
  serving,
  abandonitem,
  employeepunchtime,
  smokecash,
  billquery,
  cashdeposit,
  tourguidescommission,
  syshabit,
  arrangemenubase, // 关于排菜的所有接口
  buffetdeposit, // 自助餐押金所有接口
  fastfoodpresentauth, // 快餐赠菜权限校验
  fastfoodchangepriceauth, // 快餐改价权限校验
  itemtimeprice,
  businesssituation, // 狗不理营业情况
  changeauthcode, // 修改授权号
  posserialproxy,
  payservice,
  methodsellout, // 做法估清
  negativesettle,
};
