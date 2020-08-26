<template>
    <div class="contract-div bg-style clear">
        <div class="left-con fl">
            <div class="contract-div bg-style">
                <h5 class="title-style">合同数据</h5>
                <div class="contract-con fl" align="center">
                <img src="../../assets/images/home/icon_ct_blue.png">
                <p class="p-text">合同总金额</p>
                <strong class="p-money">{{data.bargainPrice}}</strong>
                </div>
                <div class="contract-con fl" align="center">
                <img src="../../assets/images/home/icon_ct_lightblue.png">
                <p class="p-text">等保测评金额</p>
                <strong class="p-money">{{data.dbcp}}</strong>
                </div>
                <div class="contract-con fl" align="center">
                <img src="../../assets/images/home/icon_ct_lightgreen.png">
                <p class="p-text">安全服务金额</p>
                <strong class="p-money">{{data.aqfw}}</strong>
                </div>
                <div class="contract-con fl" align="center">
                <img src="../../assets/images/home/icon_ct_green.png">
                <p class="p-text">安全软件金额</p>
                <strong class="p-money">{{data.aqrj}}</strong>
                </div>
                <div class="contract-con fl" align="center">
                <img src="../../assets/images/home/icon_ct_lightorange.png">
                <p class="p-text">外购安全服务金额</p>
                <strong class="p-money">{{data.wgaq}}</strong>
                </div>
                <div class="contract-con fl" align="center">
                <img src="../../assets/images/home/icon_ct_orange.png">
                <p class="p-text">其他安全服务金额</p>
                <strong class="p-money">{{data.qtaq}}</strong>
                </div>
                <div class="contract-con fl" align="center">
                <img src="../../assets/images/home/icon_ct_purple.png" class="">
                <p class="p-text">其他金额</p>
                <strong class="p-money">{{data.qtje}}</strong>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'contentdiv',
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
      userAndRoleInfo: (state) => state.userAndRoleInfo
    })
  },
  methods: {
  }
}
</script>
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
    width: 100%;
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
