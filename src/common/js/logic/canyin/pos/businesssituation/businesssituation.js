export const url = '/canyin/pos//businesssituation/businesssituationv2'; // 狗不理营业情况
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
