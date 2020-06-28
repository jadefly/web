export const url = '/canyin/bm/ic/itemtemphis/tempitemlist';
export function trans(data) {
  return (data.code === '1' && data.data) ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.error_code,
    msg: data.msg,
  };
}
