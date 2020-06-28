import numberFormat, { prefixInteger } from './common/js/numberformat';

const VueNumberFormat = {};

VueNumberFormat.install = (Vue) => {
  const VueSelf = Vue;
  VueSelf.prototype.numberFormat = numberFormat;
  VueSelf.prototype.prefixInteger = prefixInteger;
};

export default VueNumberFormat;
