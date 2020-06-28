export const url = '/canyin/wuu/wuuconfiglocal/crmconsumeupload';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      success: true,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
