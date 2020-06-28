export const url = '/canyin/desktop/bizbmsmakestock/findstocktakingtime';
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode || 0,
    msg: data.msg || '',
  };
}
