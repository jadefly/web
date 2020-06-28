import { extend } from 'lodash';
import {
  round, ceil, floor, calc5yuan,
} from './math';

export default function numberFormat(number, options) {
  const mode = {
    round,
    ceil,
    floor,
    calc5yuan,
  };
  const defaults = {
    mode: 'round',
    specialParam: null,
    fractionDigits: 2,
    decimalSeparator: '.',
    orderSeparator: ',',
    smallDecimals: false,
    includeDecimalSeparatorToSmall: true,
    orderSepUnits: 3,
    smallTag: 'small',
  };
  const settings = extend(defaults, options);
  const reg = new RegExp(`(\\d)(?=(?:\\d{${settings.orderSepUnits}})+$)`, 'g');
  let num;
  let oper = null;
  if (mode[settings.mode]) {
    oper = mode[settings.mode];
  } else {
    oper = settings.mode;
  }
  if (number) {
    num = oper(
      number,
      settings.specialParam
        ? settings.specialParam
        : settings.fractionDigits,
    ).toFixed(settings.fractionDigits);
  } else {
    if (number === 0) {
      return '0';
    }
    return '';
  }
  const parts = num.toString().split('.');
  let fnums = parts[0];
  const decimals = parts[1] ? parts[1] : '';
  fnums = fnums.replace(reg, `$1${settings.orderSeparator ? settings.orderSeparator : ''}`);
  if (settings.smallDecimals) {
    if (settings.includeDecimalSeparatorToSmall) {
      return `${fnums}<${settings.smallTag}>${settings.decimalSeparator}${decimals}</${settings.smallTag}>`;
    }
    return `${fnums + settings.decimalSeparator}<${settings.smallTag}>${decimals}</${settings.smallTag}>`;
  }
  return fnums + settings.decimalSeparator + decimals;
}

export function prefixInteger(num, length = 2) {
  return (Array(length).join('0') + num).slice(-length);
}
