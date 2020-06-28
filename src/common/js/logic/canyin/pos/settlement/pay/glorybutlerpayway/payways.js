export const url = '/canyin/report/common/reportcommon/payways';

export function trans(data) {
  return data ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.message,
  };
}
