export const url = '/canyin/pos/reception/systemtime/getcurrenttimemillis'
export function trans(data) {
  return data ? {
    success: true,
    data: {
      data: data
    }
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg
  }
}
