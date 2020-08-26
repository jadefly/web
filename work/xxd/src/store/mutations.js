export default {
  UPDATE_TIMESTAMP: (state, timestamp) => {
    state.timestamp = timestamp
  },
  SET_ROUTERS: (state, routers) => {
    state.addRouters = routers
    state.routers = routers
  },
  SET_USERINFO: (state, userInfo) => {
    state.userAndRoleInfo = userInfo
  },
  SET_ROLE: (state, role) => {
    state.role = role
  },
  SET_USER_NAME: (state, userName) => {
    state.userName = userName
  },
  UPDATE_LOADING: (state, loading) => {
    state.loading = loading
  },
  UPDATE_HTML: (state, html) => {
    state.html = html
  },
  UPDATA_CERTIFICATE: (state, certificate) => {
    state.certificate = certificate
  },
  UPDATA_SCAN_TASK_ID: (state, scanTaskId) => {
    state.scanTaskId = scanTaskId
  },
  UPDATA_POC_TASK_ID: (state, pocTaskId) => {
    state.pocTaskId = pocTaskId
  },
  UPDATA_IP_RESULT: (state, ipResult) => {
    state.ipResult = ipResult
  },
  UPDATE_CONFIRM: (state, confirmDialog) => {
    state.confirmDialog = confirmDialog
  },
  UPDATE_ISCOLLAPSE: (state, isCollapse) => {
    state.isCollapse = isCollapse
  }
}
