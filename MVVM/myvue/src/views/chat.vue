<template>
  <div class="chat">
    <msgList></msgList>
    <userList></userList>
  </div>
</template>

<script>


import msgList from '@/components/chat/msgList';
import userList from '@/components/chat/userList';
export default{
  components: {
    msgList,
    userList
  },
  methods:{

  }
}
</script>
<style scoped>
.chat{
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  border: 1px solid #999;
  border-radius: 5px;
  padding: 20px;
}
</style>