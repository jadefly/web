const protocol = 'http'
const ip = '192.168.8.225'
const port = ''
const path = '/api/server/index.php?g=Web&c=Mock&o=simple&projectID=2&uri='

const format = module => {
  return protocol + '://' + ip + (port && port != '80' ? (':' + port) : '') + path + module
}

export const POSMAINDATA = format('/pos/main/data')
