export const url = '/canyin/interfaces/shishangd/shishangdbookingv2/getbasicconfig';

export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      bindData: {
        ip: data.data.host,
        port: data.data.port,
        id: data.data.appID,
      },
      bindStatus: data.data.isConfig,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
