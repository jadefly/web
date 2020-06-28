// 对不起，此接口已废弃不用

export const url = '/canyin/index/index/choosesysdov2';

export function trans(data) {
  const redirectDictionary = {
    'redirect:/canyin/mng/': 'mng',
    'redirect:/canyin/kitchen/kitchenindex/index': 'kitchen',
    'redirect:/canyin/report/': 'report',
    'redirect:/canyin/pos/opening/page/': 'opening',
  };

  return data.code === '1' ? {
    success: true,
    data: {
      redirect: redirectDictionary[data.msg],
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
