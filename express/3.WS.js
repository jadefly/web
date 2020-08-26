/**
 * nodejs搭建websocket服务器的方案
 * ws 是nodejs的一个WebSocket库，可以用来创建服务。使用cnpm install ws 命令行进行安装 
 */
// 导入WebSocket模块:
const ws = require('ws');
// 引用Server类
const wsServer = ws.Server;
// 实例化
const wss = new wsServer({
  port:4000
})

wss.on('connection', function (ws) {
    console.log(`[SERVER] connection()`);
    ws.on('message', function (message) {
        console.log(`[SERVER] Received: ${message}`);
        ws.send('发送消息')
        ws.send(`ECHO: ${message}`, (err) => {
            if (err) {
                console.log(`[SERVER] error: ${err}`);
            }
        });
    })
});