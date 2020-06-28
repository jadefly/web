export const url = '/canyin/pos/module/buffetdeposit/querypointlistwithdeposit'; // 查询客位列表
export function trans(data) {
  return +data.result === 1 ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
