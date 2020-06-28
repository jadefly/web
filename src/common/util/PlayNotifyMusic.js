// method:订单类型  j 接单  t 退单
// fromid:订单来源  3 微信  7 百度  11 美团  13 饿了么  33 饿百
export default function PlayNotifyMusic(method, fromid) {
  const fromData = {
    3: `takeout/weixin${method}.ogg`,
    11: `takeout/meituan${method}.ogg`,
    13: `takeout/eleme${method}.ogg`,
    33: `takeout/ebai${method}.ogg`,
    default: `takeout/default${method}.ogg`,
  };
  let path = `${process.env.API_PATH}${process.env.DIST_PATH}/static/media/${fromData[fromid] ? fromData[fromid] : 'wuuOrder_1.mp3'}`;
  if (process.env.NODE_ENV === 'development') {
    path = `/static/media/${fromData[fromid] ? fromData[fromid] : 'wuuOrder_1.mp3'}`;
  }
  const notifyAudio = new Audio(path);
  notifyAudio.play();
}
