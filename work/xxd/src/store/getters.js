export default {
  getTimestamp: (state) => state.timestamp,
  getRouters: (state) => state.routers,
  getRole: (state) => state.role,
  getRoleCode: (state) => state.userAndRoleInfo.roleCode,
  getRoleName: (state) => state.userAndRoleInfo.realname,
  getUserName: (state) => state.userName,
  getLoading: (state) => state.loading,
  getHtml: (state) => state.html,
  getCertificate: (state) => state.certificate,
  getScanTaskId: (state) => state.scanTaskId,
  getPocTaskId: (state) => state.pocTaskId,
  getIpResult: (state) => state.ipResult,
  getConfirm: (state) => state.confirmDialog,
  getisCollapse: (state) => state.isCollapse,
  getListParams(state) {
    let params = {
      // additional: '',
      approvalState: '',
      bpmStatu: '',
      // hasApprpval: '',
      // assignState: ''
    };
    // 未考虑多个角色, 取第一个角色
    // bpmStatu 1销售;2-销售总监;3-技术总监;4-总经理 ;5-安服经理；6-安服组长；7-项目经理/组员
    // approvalState 0：待提交; 1：审批中; 2：已通过; 3 待审批 -1：退回）
    let releCode = state.userAndRoleInfo.roleCode.split(',')[0];
    switch (releCode) {
      case 'sales_director': // 审批中-待审批-销售总监
        params.approvalState = '3';
        params.bpmStatu = '2';
        break;
      case 'technical_director': // 审批中 -待审批-技术总监 
        params.approvalState = '3';
        params.bpmStatu = '3';
        break;
      case 'general_manager': // 审批中 -待审批-总经理
        params.approvalState = '3';
        params.bpmStatu = '4';
        break;
      case 'safety_server': // 安服经理，已通过
        params.bpmStatu = '5';
        break;
    }
    return JSON.stringify(params);
  }
}
