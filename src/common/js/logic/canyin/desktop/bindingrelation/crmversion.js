export const url = '/platform/cas/cas/querycrmversionv2';
export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}