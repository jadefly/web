// var socket = new WebSocket("ws://localhost:4000/");
// // 打开socket
// socket.onopen = (event)=>{
//   console.log('open:',event);
//   // 发送消息
//   socket.send('send msg111......');
// }
// // 监听消息
// socket.onmessage = (event)=>{
//   console.log('onmessage:', event)
// }
// // 关闭消息
// socket.onclose = (event)=>{
//   console.log('socket has closed!');
// }
// socket.onerror = (event)=>{
//   console.log('error!!!!');
// }
// 关闭Socket.... 
//socket.close()

class WS{
  static wss = []; //存储多个websocket
  constructor(url,setting){
    if (url === 'clear') {//清空
      this.wss.forEach(ws => {
        ws.close();
      });
      this.constructor.wss = [];
    } else {
      this.url = url;
      this.options = {
        timer:null,
        time: 3000, //ms
        ws: null,
        protocal: null,
        ...setting
      };
      
      this.ws = new WebSocket(this.url,this.options.protocal);
      this.events(this.options);
      //存入wss
      console.log(this)
      this.constructor.wss.push(this);
    }
  }

  events(options){
    this.options = {
      ...this.options,
      ...options
    };
    this.ws.onopen = (event)=>{
      this.state = 'open';
      console.log('onopen-value:',this.options.value)
      this.send(this.options.value);
    }
    // 监听消息
    this.ws.onmessage = (event)=>{
      console.log('onmessage:', event);
      if(event.data){
        let d = JSON.parse(event.data);
        console.log('onmessage:', d)
      }
      
      if(this.options.message){
        //event.data需要加类型判断
        this.options.message(event.data);
      }
    }
  }

  send(val){
    console.log(2222,val)
    this.ws.send(val);
  }

  close(){
    this.state = 'close';
    this.ws.close();
    console.log('socket has closed!');
  }
}


export default WS;