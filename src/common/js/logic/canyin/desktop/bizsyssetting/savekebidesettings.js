export const url = '/canyin/sys/kebidebooking/savekebidesettings';
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode ? data.errCode : 0,
    msg: data.msg,
  };
}
