// 用于存储多组件复用情况下的特定ID号
export default name => (
  {
    privateMethodsFilter: `${name}PrivateMethodsFilter`,
    publicMethodsFilter: `${name}PublicMethodsFilter`,
    tempMethodsFilter: `${name}TempMethodsFilter`,
    privateMethodsList: `${name}PrivateMethodsList`,
    publicMethodsList: `${name}PublicMethodsList`,
    tempMethodsList: `${name}TempMethodsList`,
    checkedMethodsList: `${name}CheckedMethodsList`,
    tempName: `${name}TempName`,
    tempPrice: `${name}TempPrice`,
    addTempMethod: `${name}AddTempMethod`,
  }
);
