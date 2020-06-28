export const url = '/canyin/pos/posserial/saveuserhabit';

export function trans(data) {
  return (data.code === '1') ? {
    success: true,
    data: data.data,
    msg: data.data.msg,
  } : {
    success: false,
    msg: data.msg,
  };
}
