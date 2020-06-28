export const url = '/canyin/pos/opening/pagebaseinfov2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      versionInfo: {
        version: data.data.version,
        versionTypeName: data.data.versionTypeName,
        releaseDate: data.data.releaseDate,
        dbVersion: data.data.dbVersion,
      },
      cy7CenterUrl: data.data.cy7CenterUrl,
      user: {
        name: data.data.user.username,
        shopId: data.data.user.belongShopId,
        code: data.data.user.code,
        password: data.data.user.password,
      },
      isGroupEmp: data.data.isGroupEmp,
      HTTP_CONTEXTPATH: data.data.HTTP_CONTEXTPATH,
      isUseSeat: data.data.isUseSeat,
      readCardOpt: data.data.readCardOpt,
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
