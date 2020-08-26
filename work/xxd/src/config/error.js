export default {
  400: { message: '无法解析此请求', reason: '' },
  401: { message: '未经授权', reason: '访问由于凭据无效被拒绝。' },
  403: { message: '禁止访问', reason: '访问被拒绝。' },
  404: {
    message: '文件或目录未找到',
    reason: '找不到文件或目录。'
  },
  405: {
    message: '',
    reason: '用于访问该页的 HTTP 动作未被许可。'
  },
  406: {
    message: '',
    reason: '客户端浏览器不接受所请求页面的 MIME 类型。'
  },
  407: {
    message: '',
    reason: 'Web 服务器需要初始的代理验证。'
  },
  410: {
    message: '',
    reason: '文件已删除。'
  },
  412: {
    message: '',
    reason: '客户端设置的前提条件在 Web 服务器上评估时失败。'
  },
  414: {
    message: '',
    reason: '请求 URL 太大，因此在 Web 服务器上不接受该 URL。'
  },
  500: {
    message: '服务器错误',
    reason: '服务器内部错误。'
  },
  501: {
    message: '',
    reason: '标题值指定的配置没有执行。'
  },
  502: {
    message: '',
    reason: 'Web 服务器作为网关或代理服务器时收到无效的响应。'
  },
  504: {
    message: '',
    reason: 'Gateway Time-out错误的解决方法。'
  }
}
