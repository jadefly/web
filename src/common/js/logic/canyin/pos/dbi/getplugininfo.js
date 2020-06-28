export const url = '/dbi/auth/plugin/getplugininfo'; // 后台设置的增值业务，目前只有备餐查询

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
