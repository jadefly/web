<template>
    <div class="project">
       <div class="project-con" :class="'bg'+(index+1)" v-for="(item,index) in data" :key="'bg'+(index+1)">
         <div class="project-data" align="center">
           <span class="project-icon" :class="'pi'+(index+1)"></span>
           <p class="pro-text">{{item.name}}</p>
           <p class="pro-num">{{item.value==''?0:item.value}}</p>
         </div>
       </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'projectdiv',
  components: {

  },
  props: {
    data: {
      required: true,
      type: Array
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    })
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.project{
  display: flex;
  margin-bottom: 20px;
  .project-con{
    height: 240px;
    flex: 1;
    margin:0 10px 0 10px;
  }
  .project-con:first-child{
    margin-left: 0;
  }
  .project-con:last-child{
    margin-right: 0;
  }
}
  // .fl{
  //   float: left;
  // }

  .project-data{
    width: 100%;
    margin-top: 33px;
  }
  .bg5{
    color: #8F7BF2;
    background: url('../../assets/images/home/xm_ywc.png') no-repeat;
    background-size: 100% 100%;
  }
  .bg4{
    color: #F56C6C;
    background: url('../../assets/images/home/xm_tzz.png') no-repeat;
    background-size: 100% 100%;
  }
  .bg3{
    color: #F9B133;
    background: url('../../assets/images/home/xm_dqd.png') no-repeat;
    background-size: 100% 100%;
  }
  .bg2{
    color: #81CA60;
    background: url('../../assets/images/home/xm_jxz.png') no-repeat;
    background-size: 100% 100%;
  }
  .bg1{
    color: #5A8BFF;
    background: url('../../assets/images/home/xm_zongshu.png') no-repeat;
    background-size: 100% 100%;
  }
  .project-icon{
    display: inline-block;
    width: 85px;
    height: 85px;
    border-radius: 50%;
    box-sizing: border-box;
    border:5px solid;
    background:url("../../assets/images/home/project_icon.jpg");
    margin-bottom: 7px;
  }
  .pi1{
    border-color: #eef3ff;
  }
  .pi2{
    border-color: #ecf7e7;
    background-position-y:-75px ;
  }
  .pi3{
    border-color: #fef3df;
    background-position-y:-150px ;
  }
  .pi4{
    border-color: #fee9e9;
    background-position-y:-225px ;
  }
  .pi5{
    border-color: #eeebfd;
    background-position-y:-300px ;
  }
  .pro-text{
    color: #404040 !important;
    font-size:16px !important;
  }
  .pro-num{
    font-family: Arial;
    font-size: 28px !important;
  }
</style>
