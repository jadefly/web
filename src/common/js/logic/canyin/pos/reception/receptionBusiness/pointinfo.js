import { map, pick } from 'lodash';

export const url = '/canyin/pos/reception/receptionbusiness/receptionbusinesspointinfov2';
export function trans(data) {
  return data.code === '1' ? {
    success: true,
    data: {
      areas: data.data.areas, // 区域列表
      tables: map(data.data.pointListJson, item => ({
        id: item.id,
        pid: item.pid ? item.pid : null,
        name: item.name,
        pinyin: item.pinyin,
        code: item.code,
        defaultCapacity: item.defCapacity,
        deposit: item.deposit,
        areaId: item.areaid,
        typeId: item.pointtypeid,
        bsId: item.bsId,
        haveItem: item.have_item > 0,
        isTeam: item.is_team,
        lastTotal: item.lastTotal,
        openTime: item.openTime,
        orderType: item.orderType,
        origTotal: item.origTotal,
        peopleQty: item.peopleqty,
        spendTime: item.spendTime,
        state: item.state,
        turnoverCount: item.turnoverCount,
        teamId: item.teamId,
        teamName: item.team_name ? item.team_name : null,
        isVIP: item.isVIP,
        isContinuedBill: !!item.isContinuedBill,
        bookPerson: item.bookPerson ? item.bookPerson : '',
        pointFullName: item.pointFullName || '', // 客位全称  area.code-name
        billRemark: item.billRemark, // 整单备注
        callState: item.callState, // 客位是否有叫起的菜
        membershipCardType: item.membershipCardType, // 会员卡类型
        memberPayNum: item.memberPayNum, // 会员消费次数
        progressOfServingDishes: item.progressOfServingDishes, // 上菜进度
        bookingTimes: item.bookingTimes, // 预定次数
        pointGroupId: item.pointGroupId, // 分组客位的id
        advanceBalance: item.advanceBalance || '', // 预付差额
        birthday: item.birthday || '', // 会员生日
        cardBalance: item.cardBalance || '', // 会员卡余额
        memberName: item.memberName || '', // 会员名称
      })),
      tableIndexObject: Object.freeze(data.data.pointListJson.reduce((prev, cur, index) => {
        if (!cur.pid) {
          return { ...prev, [cur.id]: index };
        }
        return prev;
      }, {})),
      types: map(data.data.pointTypes, item => pick(item, ['id', 'name'])), // 客位类型信息
      pointsLastModifyTime: data.data.pointsLastModifyTime, // 客位最后更新时间, 传到前台, 更新时将此值发回, 后台将比此时间新的客位传回去, 实现增量逻辑
      pointContentLayout: data.data.pointContentLayout, // 客位框上显示信息的数据
    },
  } : {
    success: false,
    errCode: data.errCode,
    msg: data.msg,
  };
}
