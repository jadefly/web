export default {
  vuex: 'posBooking',
  url: '/canyin/pos/reception/receptionbusiness/receptionbusinesssyssettingv2',
  data: [{
    key: 'enable',
    type: Boolean,
    text: '是否允许使用预订模块',
  }, {
    key: 'isOpenBookCancelReason',
    type: Boolean,
    text: '取消预订时必须输入取消原因',
  }, {
    key: 'bookedPlatform',
    type: Number,
    text: '当前预订对接业务模式 -1：吾享线上 4：食尚订 5：新荣记 6：客必得',
  }, {
    key: 'devicePathNum',
    type: Number,
    text: '预订来电设备线路总数',
  }, {
    key: 'deviceType',
    type: String,
    text: '预订来电设备类型',
  }, {
    key: 'isOpenBookCallerID',
    type: Boolean,
    text: '是否启用来电显示',
  }, {
    key: 'reservePointMap',
    type: Object,
    text: '预订客位',
  }],
};
