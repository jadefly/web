import { Message } from 'element-ui';
// import { post } from '@/common/http/axios';
import ajax from '@/common/js/ajax';
const actions = {
  checkcontainkds({ commit }, paymentItems) {
    return new Promise((resolve, reject) => {
      // post('/canyin/pos/settlement/checkcontainkdsitem', {
      //   contentType: 'paramsEncoded',
      //   // loading: true,
      //   data: {
      //     items: paymentItems, // 加单的品项列表
      //   },
      // }).then((res) => {
      //   if (res.code === '1') { // 成功
      //     commit('setIsContainKDS', res.data.isContain); // 设置-加单中是否包含KDS方案品项
      //     resolve(res.data.isContain);
      //   } else {
      //     Message.error(res.msg);
      //     reject(res);
      //   }
      // });

      ajax('canyin.pos.settlement.checkcontainkdsitem', {
        contentType: 'paramsEncoded',
        data: {
          items: paymentItems,
        },
      }).then((res) => {
        if (!res.isContain) commit('setOrderCode', '');
        commit('setIsContainKDS', res.isContain); // 设置-加单中是否包含KDS方案品项
        resolve(res.isContain);
      });

    });
  },
  getMethodsInfo({ commit }, data) { // 接口-获取做法信息??
    return new Promise((resolve) => {
      ajax(data.url, {
        params: {
          itemId: data.itemData.id,
          itemSizeId: data.itemData.sizeId ? data.itemData.sizeId : -1,
          loadmodule: 1,
          _t: new Date().getTime(),
        },
      }).then((res) => {
        resolve(res.data);
      });
    });
  },
  // 获取规格接口数据
  getSizeData({ commit }, options = {}) {
    // const options = {
    //   itemId, // 品项id
    //   isDinnerBuffet, // 是否是自助模式
    // };
    return new Promise((resolve) => {
      ajax('canyin.pos.itemPkgAndSize.itemSize', { params: options }).then((res) => {
        if (res.itemSizeList) {
          resolve(res.itemSizeList);
          commit('setIsLimitOrSellout', false);
          // console.log('规格接口数据：', res);
        } else {
          Message.error(res.msg);
        }
      }).catch((error) => {
        Message.error(error.msg);
      });
    });
  },
};
export default actions;
