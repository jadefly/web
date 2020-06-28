export const url = '/canyin/desktop/bizpushmoneytable/recyclerevert';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
