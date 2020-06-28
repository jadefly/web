import { map, find } from 'lodash';
import i18n from '@/locales/index';

export const url = '/canyin/pos/opening/pagev2';
export function trans(data) {
  const redirectDictionary = {
    'redirect:/canyin/pos/reception/receptionbusiness/receptionbusiness': 'pos',
    'canyin/pos/reception/receptionbusiness/opening': 'opening',
  };

  const getPosInfo = info => ({
    isOpening: info.buttontext === i18n.t('Biz.Login.GetInto'),
    pettyCash: info.pettycash,
    enableEdit: info.editable,
  });
  return data.code === '1' ? {
    success: true,
    data: {
      redirect: redirectDictionary[data.msg],
      isBuffet: !!data.data.isBuffet,
      versionInfo: {
        version: data.data.version,
        versionTypeName: data.data.versionTypeName,
        releaseDate: data.data.releaseDate,
        dbVersion: data.data.dbVersion,
      },
      cy7CenterUrl: data.data.cy7CenterUrl,
      // // 是否启用开班时厨打测试(显示不显示)
      // isEnableOpeningTestPrint: data.data.IsEnableOpeningTestPrint === '1',
      // // 是否执行厨打测试(开关默认状态)
      // isOpenSerialTestPrint: data.data.isOpenSerialTestPrint === '1',
      user: {
        name: data.data.user.username,
        shopId: data.data.user.belongShopId,
        code: data.data.user.code,
        password: data.data.user.password,
      },
      data: {
        isAllowUpdatePosModeWhenOpening: data.data.isAllowUpdatePosModeWhenOpening === '1',
        // 是否启用开班时厨打测试(显示不显示)
        isEnableOpeningTestPrint: data.data.IsEnableOpeningTestPrint === '1',
        // 是否执行厨打测试(开关默认状态)
        isOpenSerialTestPrint: data.data.isOpenSerialTestPrint === '1',
        posList: map(data.data.posBtns, item => ({
          id: item.posid,
          mode: parseInt(item.mode, 0),
          code: item.poscode,
          name: item.posname,
          state: item.posstate,
          userName: item.username ? item.username : null,
          ipaddress: item.ipaddress ? item.ipaddress : null,
          ...getPosInfo(find(data.data.PettycashAndButtonText, { posid: item.posid })),
        })),
        selectedPosId: data.data.selectedPosId ? data.data.selectedPosId : null,
        posCode: data.data.posCode,
        posName: data.data.posName,
        pettyCash: data.data.pettyCash,
        posStatus: data.data.isOpen ? 1 : 0,
        posMode: data.data.posMode,
        username: data && data.data.user ? data.data.user.username : null,
        belongShopId: data && data.data.user ? data.data.user.belongShopId : null,
        isGroupEmp: data.data.isGroupEmp,
      },
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
