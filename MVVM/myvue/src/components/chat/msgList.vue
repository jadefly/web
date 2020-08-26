<template>
  <div class="msgList">
    <div class="content">
      <ul class="msgUl">
        <li v-for="item in msgData" :key="item.id" :class="item.self?'self':''">
          <div class="s_name">{{item.user}}</div>
          <div class="s_msg">{{item.msg}}</div>
        </li>
      </ul>
    </div>
    <div><input type="text" placeholder="请输入消息" v-model="msgNow"> <button @click="sendMsg">发送</button></div>
  </div>
</template>

<script>
import WS from '@/assets/js/common/WS.js';
export default{
  name:'msgList',
  data(){
    return{
      msgNow:'',
      msgIndex:0,
      msgData:[
      ],
      wsMsgList: null
    }
  },
  mounted(){
    this.wsMsgList = new WS('ws://localhost:4000/ws/chat',{});
  },
  methods:{
    sendMsg(){
      this.msgData.push({
        id: this.msgIndex++,
        user: 'me',
        msg: this.msgNow,
        self: true
      });
      this.wsMsgList.send(this.msgNow)
      this.msgNow = ''; //清空

      
      // new WS('ws://localhost:4000/',{
      //   message:(msg)=>{
      //     console.log('获得新数据：',msg);
      //     //添加到data中
      //     this.msgData.push(msg)
      //   },
      //   value:{
      //     user:'xxx',
      //     id: this.msgIndex,
      //     msg: this.msgNow,
      //     self: false
      //   }
      // })
    }
  }
}
</script>
<style scoped>
ul,li{
  list-style: none;
}
.msgList{
  width:300px;
  border-right: 1px solid #999;
  padding-right: 20px;
}
.msgList .content{
  height: 400px;
}
.msgUl li{
  clear:both;
}
.msgUl .s_name{
  color: blue; 
}
.msgUl .self{
  float:right;
  text-align: right;
}
</style>