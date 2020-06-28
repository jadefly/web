import i18n from '@/locales/index';
import { Message } from 'element-ui';

/* 加单最大最小数&限量限制 params：{
  from: this.from, // 来源 signMenu为更多/易盘标菜页面
  num: this.changeNum, // 数量
  orderedNum: this.orderedNum, // 已点该品项的数量
  minAddQty: this.minAddQty, // 最小值
  maxAddQty: this.maxAddQty, // 最大值
  limitNum: this.limitNum, // 限量数
  isAllow0: this.posSettings.isAllowAddOrderWhenLimitZero, // 允许限量为 0 时继续加单
} */

// 限量-品项总数的限制
function limit_num(num, orderedNum, maxAddQty, limitNum, isAllow0) {
  if (!isAllow0 && limitNum && num > limitNum) {
    num = limitNum - orderedNum;
    Message.warning(i18n.t('Biz.BizComm.BizCommTip14', [limitNum])); // 限量为{0}
    return { num, tag: false };
  }
  return { num, tag: true };
}
// 单数最大数限制 单行个数限制，有做法会分开加单
function limit_Max(num, maxAddQty) {
  if (maxAddQty && num > maxAddQty) {
    num = maxAddQty;
    Message.warning(i18n.t('Biz.BizComm.BizCommTip13', [maxAddQty])); // 加单最大数量限制为{0}
    return { num, tag: false };
  };
  return { num, tag: true };
}
function limitAcount(params) {
  let { from, num, orderedNum, minAddQty, maxAddQty, limitNum, isAllow0 } = params;
  console.log('限量判断', num);
  from = from || '';
  let result = { num, tag: false };
  if (+num === 0
    && !(from === 'signMenu' && num === '00')) { // 更多/易盘标菜/弹框修改数量 易盘标签00为半份
    Message.warning(i18n.t('Biz.BizComm.BizCommTip11')); //菜品数量不能为0
    return result;
  }
  num = parseFloat(num);
  if (from === 'menuAdd' && minAddQty && num < minAddQty) { // 没有加单时，为最小值 暂未使用
    num = minAddQty;
  }
  // 单数最小数量限制
  if (minAddQty && num < minAddQty) {
    num = minAddQty;
    if (from === 'menuAdd') { // 加单
      result.tag = true;
      return result;
    }
    Message.warning(i18n.t('Biz.BizComm.BizCommTip12', [minAddQty])); // 最小数量限制为{0}
    return result;
  }
  if (maxAddQty > limitNum) { // 限量小时，先判断限量，再判断最大值
    result = limit_num(num, orderedNum, maxAddQty, limitNum, isAllow0);
    num = result.num;
    if (!result.tag) return result;
    result = limit_Max(num, maxAddQty);
    return result;
  }
  // 先最大值，再限量
  result = limit_Max(num, maxAddQty);
  num = result.num;
  if (!result.tag) return result;
  result = limit_num(num, orderedNum, maxAddQty, limitNum, isAllow0);
  return result;
}

export {
  limitAcount,
};
