// 项目管理列表 
const projectState = [
  { value: '', label: '全部'},
  { value: '0', label: '未实施'},
  { value: '300101', label: '启动过程'},
  { value: '300102', label: '规划过程'},
  { value: '300103', label: '执行过程'},
  { value: '300104', label: '监管过程'},
  { value: '300105', label: '收尾过程'},
  { value: '1', label: '完成'}
];
const projectType = {
  HG: '79d761246873b6c445d38ab8a512fbc8', // 合规
  AF: '00708431ba82c7fd7243a7acca3925c3', // 安服
  DSF: '782196ff714197b58c6a5dc38850a3c6', // 第三方
  ZZ: '5a140ef9eb6de73dbb8087dba9da401e' // 自有产品
};
const projectTypeArr = [
  { name: 'HG', type: '79d761246873b6c445d38ab8a512fbc8' },
  { name: 'AF', type: '79d761246873b6c445d38ab8a512fbc8' },
  { name: 'DSF', type: '79d761246873b6c445d38ab8a512fbc8' },
  { name: 'ZZ', type: '79d761246873b6c445d38ab8a512fbc8' },
];

function getPro(projectType) {
  const finded = projectTypeArr.find((el) => el.type === projectType)
  return finded.name
}

export {
  projectState, // 项目状态
  projectType, // 项目类型
  getPro
}