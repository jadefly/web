export const url = '/canyin/takeout/takeoutsend/sendorder';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: data.data,
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg.replace('失败原因：暂不支持向同一平台多次发单，敬请期待!', '<span style="color: red">失败原因：暂不支持向同一平台多次发单，敬请期待!</span>'),
  };
}
