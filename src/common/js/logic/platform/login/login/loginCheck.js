export const url = '/platform/login/login/logincheckv2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data.success ? {
      enableLogin: true,
      shopId: data.data.shopId,
      shopName: data.data.shopName,
      shopCode: data.data.shopCode,
      controlMode: parseInt(data.data.controlMode),
      isGroupEmp: data.data.isGroupEmp,
      message: data.data.msg ? data.data.msg : null,
    } : {
      enableLogin: false,
      message: data.data.msg,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
