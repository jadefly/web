<template>
  <div class="header-con flex-box">
    <div class="leader-infor">
      <img src="../../assets/images/home/portrait.png" class="fl portrait">
      <div class="person-in fl">
        <p><span class="name-span">{{userAndRoleInfo.realname}}</span><span class="de-span">{{userAndRoleInfo.roleName}}</span></p>
        <p><span class="num-span">目标{{data.targetnum}}</span><span class="num-span">已实施{{data.completednum}}</span></p>
      </div>
    </div>
    <div class="date-infor">
      <p><span class="date-span"><i class="iconfont icontime"></i>&nbsp;{{moment().format('YYYY年MM月DD日')}}</span><span class="week-span">{{moment().format('dddd')}} {{moment().format('HH:mm')}}</span></p>
      <p class="hellos">{{moment().format('a')}}好，欢迎登陆管理系统，祝你开心每一天！</p>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'headerdiv',
  components: {

  },
  props: {
    data:{
      required: true,
      type: Object
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    })
  },
  methods: {
  }
}
</script>
<style scoped>
  .flex-box{
    display: flex;
    flex-direction:row;
    justify-content:space-between
  }
  .fl{
    float: left;
  }
  .header-con{
    width: 100%;
    height: 100px;
    background: #FFFFFF;
    box-shadow: 2px 6px 5px #ccc;
  }
  .leader-infor{
    flex:1 0 auto
  }
  .date-infor{
    height: 70px;
    color: #000;
    border-left:1px dotted #949494;
    padding-left:15px;
    padding-right:30px;
    flex: 0 0 auto;
  }
  .portrait{
    vertical-align: middle;
    margin: 15px 20px 10px 40px;
  }
  .person-in{
    width: calc(100% - 126px) !important;
    height: 75px;
    margin-top: 18px;
    line-height: 30px;
  }
  .name-span{
    color: #707070;
    font-size: 20px !important;
    margin-right: 15px;
  }
  .de-span{
    font-size: 12px !important;
  }
  .num-span{
    padding-right: 20px;
    font-size: 16px !important;
    color: #6A95FF;
  }
  .date-span{
    font-size:14px !important;
    padding:0px 10px 15px 40px;
    font-weight: 700;
  }
  .week-span{
    font-size: 20px !important;
  }
  .hellos{
    font-size:15px !important;
    padding: 15px 0 0 20px;
    color: #949494 !important;
  }
</style>
