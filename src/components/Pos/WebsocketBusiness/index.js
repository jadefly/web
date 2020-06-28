/**
 *推送业务的有关处理
 * @author sea
 */
// 推送method 和执行方法关联表
const wsRelationMthodChart = {
  point: 'pointUpdate', // 客位有关推送
  pointdelete: 'pointdelete', // 虚拟客位的删除
};
// let card = "";
export default {
  getMethod(name) {
    return wsRelationMthodChart[name];
  },
  // 根据推送的类型来执行对应的方法 更新客位数据vuex
  pointUpdate(data) {
    console.log(data);
    this.updateTables({
      data,
      callBack: (pointId) => {
        this.$vemit('loadBill', pointId);
      },
    });
  },
  // 执行删除的虚拟客位
  pointdelete(data) {
    const activePointId = this.getVuexPointData.id;
    this.deleteTables(data);
    // 如果删除的正好是选中的择需要进行重置下 客位数据和账单数据 清除缓存
    if (data.some(point => point.id === activePointId)) {
      this.rePosPointData();
    }
  },
};
