import { multi } from '@/common/js/math';

const kgToUtil = {
  0: 1,
  1: 2,
  2: 1000,
};
const jinToUtil = {
  0: 0.5,
  1: 1,
  2: 500,
};
// 电子秤单位换算
export default function newWeightUnitConversion(data, setting) {
  let newData;
  // 公斤换克 newData = multi(data,1000)
  // 公斤换斤 newData = multi(data,2)
  // 公斤换公斤 newData = multi(data,1)
  // 斤换克 newData = multi(data,500)
  // 斤换斤 newData = multi(data,1)
  // 斤换公斤 newData = multi(data,0.5)
  if (setting.electronicScaleUnit === 0) {
    // 公斤秤
    newData = multi(data, kgToUtil[setting.POSWeighingUnit]).toFixed(setting.POSReservedDecimal);
  } else {
    // 斤秤
    newData = multi(data, jinToUtil[setting.POSWeighingUnit]).toFixed(setting.POSReservedDecimal);
  }
  return newData;
}
