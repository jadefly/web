export default {
  timestamp: 0, // 时间戳
  routers: [],
  addRouters: [],
  userAndRoleInfo: { // 用户信息
    id: '',
    realname: '',
    roleCode: '', // sales_man-销售经理,
    roleName: '',
    username: ''
  },
  role: '',
  userName: '',
  loading: false,
  isCollapse: true,
  html: null,
  certificate: null,
  scanTaskId: null,
  pocTaskId: null,
  ipResult: null,
  confirmDialog: {
    show: false,
    title: null,
    tips: null,
    confirm: false // 是否确认操作
  }
}
