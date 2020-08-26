<template>
    <div class="handover-list">
         <div class="un-hand fl bg-style">
           <h5 class="title-style">待审批交接单</h5>
           <img src="../../assets/images/home/2.png" class="img1">
           <strong class="hand-num">32</strong>
           <div class="line"></div>
           <div class="more-text">点击审批<img src="../../assets/images/home/more.png" class="img2"/></div>
         </div>
         <div class="un-hand fr bg-style">
           <h5 class="title-style">交接单总数</h5>
           <img src="../../assets/images/home/2.png" class="img1">
           <strong class="hand-total">529</strong>
           <div class="line"></div>
           <div class="more-text">查看详情<img src="../../assets/images/home/more.png" class="img2"/></div>
         </div>
     </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'loopholediv',
  components: {

  },
  props: {
    data: {
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
<style>
  .schedule .el-input__inner{
    margin: 10px 0 10px 30px;
    width: 50%;
    height: 30px !important;
    border-radius: 20px !important;
  }
</style>
<style scoped>
  .fl{
    float: left;
  }
  .fr{
    float: right;
  }
  .content-div{
    width: 97%;
    margin: auto;
    margin-top: 25px;
  }
  .left-con{
    width: 70%;
  }
  .right-con{
    width: 28%;
  }
  .bg-style{
    background: #ffffff;
    box-shadow: 0 0 5px #ccc;
    border-radius: 4px;
  }
  .contract-div{
    width: 100%;
    height: 200px;
    margin-bottom: 20px;
  }
  .project-div{
    width: 100%;
    height: 310px;
  }
  .un-hand,.hand-num{
    width: 48%;
    height: 200px;
    margin-bottom: 20px;
  }
  .line{
    width: 100%;
    height: 0.5px;
    border:0.5px solid #E5E3E3;
  }
  .hand-total{
    color: #5A8BFF;
    font-size: 32px !important;
  }
  .hand-num{
    color: #F9AE26;
    font-size: 32px !important;
  }
  .img1{
    padding: 5px 5% 15px 15%;
    vertical-align: middle;
  }
  .schedule{
    width: 100%;
    height: 310px;
  }
  .administration-tab{
    margin-top: 20px;
    width: 100%;
    height: 500px;
  }
  .title-style{
    font-size: 20px !important;
    color: #000 !important;
    padding:15px 0 10px 20px;
  }
  .contract-con{
    width: 13%;
    margin-left: 1%;
  }
  .p-text{
    color: #8C8C8C;
  }
  .p-money{
    display: inline-block;
    padding-top:5px;
    font-size:18px !important;
    color: #454545;
    font-family: Arial;
  }
  .more-text{
    color: #000 !important;
    margin:4% 0 0 55%;
  }
  .img2{
    vertical-align: top;
    margin-left: 5px;
  }
  .project-con{
    width: 16%;
    height: 195px;
    margin: 20px 2% 10px 1%;
  }
  .project-data{
    width: 100%;
    /*border:1px solid red;*/
    margin-top: 55%;
  }
  .bg1{
    color: #5A8BFF;
    background: url('../../assets/images/home/xm_ywc.png') no-repeat;
    background-size: 100% 100%;
  }
  .bg2{
    color: #81CA60;
    background: url('../../assets/images/home/xm_tzz.png') no-repeat;
    background-size: 100% 100%;
  }
  .bg3{
    color: #F9B133;
    background: url('../../assets/images/home/xm_dqd.png') no-repeat;
    background-size: 100% 100%;
  }
  .bg4{
    color: #F56C6C;
    background: url('../../assets/images/home/xm_jxz.png') no-repeat;
    background-size: 100% 100%;
  }
  .bg5{
    color: #8F7BF2;
    background: url('../../assets/images/home/xm_zongshu.png') no-repeat;
    background-size: 100% 100%;
  }
  .pro-text{
    color: #404040 !important;
    font-size:16px !important;
  }
  .pro-num{
    font-family: Arial;
    font-size: 28px !important;
  }
  .sale-echart{

  }
.achieve-echart{

}
.project-echart,.achieve-echart,.sale-echart{
  padding: 20px 10px 10px 10px;
  width: 100%;
  height: 500px;
}
.schedule-input{
  width: 50%;
}
@media screen and (min-width:1024px) and (max-width:1401px){
  .img1{
    padding: 5px 1% 15px 1%;
  }
}
</style>
