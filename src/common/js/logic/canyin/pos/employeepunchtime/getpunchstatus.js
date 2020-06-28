export const url = '/canyin/pos/employee/employeepunchtime/getpunchstatus'; // 登录页  员工打卡

export function trans(data) {
  return (data.code === '1' && data.data) ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
