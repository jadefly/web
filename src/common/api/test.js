const protocol = 'http';
const ip = '192.168.9.127';
const port = '8080';
const path = '/canyin7';
const format = mod => `${protocol}://${ip}${port && port !== '80' ? (`:${port}`) : ''}${path}${mod}`;
export default format('/canyin/pos/reception/receptionbusiness/getposmaindata');
