export const url = '/dbi/emp/selectbyauthcardv2';

export function trans(data) {
  if (data.code === '1') {
    const { authCard, code, name } = data.data[0];
    return {
      success: true,
      data: { authCard, code, name },
    };
  }
  const { errCode, msg } = data;
  return {
    success: false,
    errCode,
    msg,
  };
}
