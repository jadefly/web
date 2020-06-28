import * as load from './load'; // 龙决策的加载基本信息;
import * as save from './save'; // 龙决策的保存营业数据上传频率与汇总数据上传时间;
import * as update from './update'; // 龙决策的保存基本信息;
import * as uploadbusiness from './uploadbusiness'; // 龙决策的手动上传营业数据;
import * as uploadsummary from './uploadsummary'; // 龙决策的手动上传汇总数据;
import * as validateinterface from './validateinterface'; // 龙决策的测试连接;
import * as logs from './logs';
 // 龙决策的加载日志查看;
export default {
  load,
  save,
  update,
  uploadbusiness,
  uploadsummary,
  validateinterface,
  logs,
};
