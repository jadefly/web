export const url = '/canyin/pos/fastfoodchangepriceauth/check'; // 快餐改价权限校验
export function trans(data) {
  return +data.code === 1 ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
