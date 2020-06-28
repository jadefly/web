export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinessmemberv2';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      enable: data.data.isGloryButlerEnable, // 是否允许使用荣管家会员模块
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
