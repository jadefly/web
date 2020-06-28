export const url = '/canyin/pos/posserial/bizpsv2';

export function trans(data) {
  return (data.code === '1' && data.data) ? {
    success: true,
    data: data.data,
    msg: data.data.msg,
  } : {
    success: false,
    msg: data.msg,
  };
}
