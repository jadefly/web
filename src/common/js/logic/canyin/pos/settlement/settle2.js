export const url = '/canyin/pos/settlement/settle';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: { data },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}