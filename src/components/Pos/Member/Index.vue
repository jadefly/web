<template>
  <div class="member" :class="activeFunBar == 3 ? 'paddingRight10' : 'paddingRight215'">
    <div class="member-functionBar">
      <div
        v-for="(item, index) in functionBar"
        :key="index" class="functionBar"
        :class="activeFunBar == index ? 'activeFunBar': ''"
        @click="activeFunBarFun(index)">
        <img :src="item.icon" />
        <div>{{item.name}}</div>
        <div v-if="activeFunBar == index" class="triangle"></div>
      </div>
    </div>
    <form class="member-content">
      <OpenCard
        v-if="activeFunBar == 0"
        ref="openCard"
        :activeIndex="activeFunBar == 0"
        @changeActiveFunBar="changeActiveFunBar"
        @readRGJCardNo="readRGJCardNo"
        :rgjCrmInfo="rgjCrmInfo">
      </OpenCard>
      <Recharge
        v-if="activeFunBar == 1"
        ref="recharge"
        :cardNum="cardNum"
        :rule2="rechargeRule"
        @userCardInfo="userCardInfo"
        @readRGJCardNo="readRGJCardNo">
      </Recharge>
      <RechargeRecord
        v-if="activeFunBar == 2"
        ref="rechargeRecord"
        @userCardInfo="userCardInfo"
        @readRGJCardNo="readRGJCardNo">
      </RechargeRecord>
      <ModifyMemberInfo
        v-show="activeFunBar == 3"
        ref="modifyMemberInfo">
      </ModifyMemberInfo>
      <MoreOperations
        v-if="activeFunBar == 4"
        ref="moreOperations"
        @userCardInfo="userCardInfo"
        @readRGJCardNo="readRGJCardNo"
        :rgjCrmInfo="rgjCrmInfo">
      </MoreOperations>
    </form>
    <div v-if="activeFunBar != 3" class="member-useInfo">
      <div class="member-useInfoBox">
        <div class="member-useInfo-up">
          <div class="header">
            <img src="./images/ic_head.png" />
            <template v-if="isHYUserInfo">
              <div class="name">{{hyUserInfo.memberProfileName}}</div>
              <div>
                {{
                  hyUserInfo.mobile ?
                  hyUserInfo.mobile.substr(0, 3) +
                  '****' +
                  hyUserInfo.mobile.substr(7) : ''
                }}
              </div>
            </template>
          </div>
        </div>
        <!-- 用户信息 -->
        <div class="member-useInfo-down">
          <div class="semicircle">
            <div v-if="!isHYUserInfo" class="tip">{{$t('Dict.NoInfo')}}</div>
            <div v-if="isHYUserInfo" class="cardNum">No.{{hyUserInfo.hardCardNumber}}</div>
          </div>
          <!-- 用户信息 -->
          <div class="userInfo" v-if="isHYUserInfo">
            <div class="flex">
              <span class="userInfoText">{{$t('Dict.CardType3')}}</span>
              <span>{{hyUserInfo.memberCardTypeName}}</span>
            </div>
            <div class="flex">
              <span class="userInfoText">{{$t('Biz.Crm.CardBalance02')}}</span>
              <span>{{hyUserInfo.value? hyUserInfo.value : 0}}</span>
            </div>
            <div class="flex">
              <span class="userInfoText">{{$t('Dict.IntegralLabel')}}</span>
              <span>0</span>
            </div>
            <div class="flex">
              <span class="userInfoText">{{$t('Biz.Settlement.OpenCardShop01')}}</span>
              <span>{{hyUserInfo.storeName}}</span>
            </div>
            <div class="time">
              <div class="textLeft">{{$t('Dict.TermOfValidityLabel')}}</div>
              <div class="textRight">{{hyUserInfo.beginDate}}{{$t('Dict.To')}}{{hyUserInfo.endDate}}</div>
            </div>
             <div class="time">
              <div class="textLeft">{{$t('Biz.Pos.Member.OpenCardSpan9')}}</div>
              <div class="textLeft">{{hyUserInfo.remarks}}</div>
            </div>
          </div>
          <img src="./images/pic_vip.png" class="vipPic"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui';
import ajax from '@/common/js/ajax';
import OpenCard from './components/openCard';
import Recharge from './components/recharge';
import RechargeRecord from './components/rechargeRecord';
import ModifyMemberInfo from './components/modifyMemberInfo';
import MoreOperations from './components/moreOperations';
import icChongzhi from './images/ic_chongzhi.png';
import icKaika from './images/ic_kaika.png';
import icChongzhijilu from './images/ic_chongzhijilu.png';
import icXiugaihuiyuanxinxi from './images/ic_xiugaihuiyaun.png';
import icGengDuo from './images/ic_gengduo.png';

export default {
  components: {
    OpenCard, Recharge, RechargeRecord, ModifyMemberInfo, MoreOperations,
  },
  data() {
    return {
      activeFunBar: 0, // 选中功能栏，默认选中第一个
      functionBar: [ // 功能栏数据
        {
          name: this.$t('Dict.Btn.CardSelling'), // 功能名称
          id: 'openCard', // 功能id
          icon: icKaika, // 功能图标
        }, {
          name: this.$t('Dict.Btn.CardCharge'), // 充值
          id: 'recharge',
          icon: icChongzhi,
        }, {
          name: this.$t('Biz.Pos.Member.IndexName3'),
          id: 'rechargeRecord',
          icon: icChongzhijilu,
        }, {
          name: this.$t('Biz.Pos.Member.IndexName4'),
          id: 'modifyInformation',
          icon: icXiugaihuiyuanxinxi,
        }, {
          name: this.$t('Biz.Settlement.MoreOperation'),
          id: 'moreOperations',
          icon: icGengDuo,
        },
      ],
      cardNum: '', // 通过开卡后点击并充值带过来的数据
      rechargeRule: '', // 通过开卡后点击并充值带过来的数据
      hyUserInfo: {}, // 用户信息
      isHYUserInfo: false,
      rgjCrmInfo: {},
    };
  },
  watch: {
    $route(to) {
      if (to.path === '/pos/member') {
        this.open();
        this.readcard();
      }
    },
  },
  mounted() {
    this.readcard();
  },
  methods: {
    readcard() {
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.readcard', {
        contentType: 'URLEncoded',
      }).then((res) => {
        if (+res.code === 0) {
          if (res.data) {
            const info = JSON.parse(res.data);
            this.rgjCrmInfo = {
              mode: info[0].deviceId,
              comport: info[0].devicePort,
              comrate: info[0].deviceRate,
            };
          } else {
            MessageBox.alert(this.$t('Biz.Pos.Member.IndexMsg2'), this.$t('Dict.Tips'));
          }
        } else {
          this.$message.error(res.message);
        }
      });
    },
    open() {
      this.activeFunBar = 0;
      this.isHYUserInfo = false;
      setTimeout(() => {
        this.$refs.openCard.open();
      }, 200);
    },
    changeActiveFunBar(res) {
      this.activeFunBar = res.activeIndex;
      this.cardNum = res.cardNum;
      this.rechargeRule = res.rechargeRule;
    },
    activeFunBarFun(index) {
      this.activeFunBar = index;
      this.cardNum = '';
      this.rechargeRule = '';
      this.hyUserInfo = {};
      this.isHYUserInfo = false;
    },
    userCardInfo(data) {
      const res = data;
      if (JSON.stringify(res) === '{}') {
        this.isHYUserInfo = false;
        return;
      }
      res.beginDate = res.beginDate ? res.beginDate.substr(0, 10) : '';
      res.endDate = res.endDate ? res.endDate.substr(0, 10) : '';
      this.hyUserInfo = res;
      this.isHYUserInfo = true;
    },
    readRGJCardNo(callback) {
      this.$devices.Cardop.readRGJ((card) => {
        if (+card.returnCode === 0) {
          callback(card);
          // return card.CardNo
        } else {
          this.$message.error(card.ErrorText);
          callback(false);
        }
      }, this.rgjCrmInfo);
    },
    querycardmessage(code, callback) {
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.querycardmessage', {
        contentType: 'URLEncoded',
        data: {
          keyword: code,
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          if (res.data.length !== 0) { // 判断一下，规避因是会员，但是名下无卡，弹出网络异常提示框……
            const bool = Object.prototype.toString.call(res.data) === '[object Array]';
            if (bool) { // 如果返回的data是数组
              if (res.data.length > 1) { // 如果多条卡数据，弹出卡号选择弹窗
                callback({ id: 2, data: res.data });
              } else { // 只返回一张卡时
                callback({ id: 1, data: res.data[0] });
              }
            } else { // 如果不是数组
              callback({ id: 1, data: res.data });
            }
          } else {
            this.$message.error(this.$t('Biz.Pos.Member.IndexMsg3'));
          }
        } else {
          this.$message.error(res.message);
        }
      });
    },
  },
};
</script>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
  .paddingRight10{
    padding-right: 10px !important;
  }
  .paddingRight215{
    padding-right: 215px !important;
  }
  .member{
    padding: 10px;
    position: relative;
    height: 100%;
    padding-left: 100px;
    padding-right: 215px;
    .member-functionBar{
      width: 90px;
      position: absolute;
      background: #5E747A;
      color: #fff;
      text-align: center;
      height: 97%;
      top: 10px;
      left: 10px;
      cursor: pointer;
      .functionBar{
        height: 70px;
        position: relative;
        padding-top: 10px;
      }
      .triangle{
        position: absolute;
        top: 20px;
        left: 100%;
        width: 0;
        height: 0;
        border-width: 10px;
        border-style: solid;
        border-color: transparent transparent transparent #0BABB9;
      }
    }
    .activeFunBar{
      background: #0BABB9;
    }
    .member-content{
      width: 100%;
      height: 100%;
      background: #f7f7f7;
    }
    .member-useInfo{
      background: #f7f7f7;
      width: 200px;
      height: 97%;
      position: absolute;
      top: 10px;
      right: 5px;
      .member-useInfoBox{
        position: relative;
        width: 100%;
        height: 100%;
        padding-top: 280px;
        overflow: hidden;
      }
      .member-useInfo-up{
        background: url('./images/bg.png') no-repeat;
        height: 280px;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        .header{
          text-align: center;
          padding-top: 30px;
          font-size: 16px;
          font-weight: bold;
        }
        .name{
          margin: 18px 0;
        }
      }
      .member-useInfo-down{
        height: 100%;
        position: relative;
        padding: 30px 10px 0 10px;
        .semicircle{
          background: url('./images/pic_vipcard.png') no-repeat;
          width: 162px;
          height: 90px;
          position: absolute;
          top: -60px;
          left: 19px;
          text-align: center;
          padding-top: 35px;
          .cardNum{
            font-weight: bold;
            font-size: 16px;
            // transform: translate(-50%, -50%);
            // position: absolute;
            // top: 50%;
            // left: 50%;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            // word-break: break-all;
            // display: -webkit-box;
            // -webkit-line-clamp: 3;
            // -webkit-box-orient: vertical;
          }
        }
        .userInfo{
          > div.flex{
            margin-top: 10px;
            span{
              display: inline-block;
            }
            span:last-child{
              width: 105px;
              vertical-align: top;
              text-align: right;
            }
          }
          .textLeft{
            text-align: left;
          }
          .textRight{
            text-align: right;
          }
          .time{
            margin-top: 10px;
          }
          .userInfoText{
            width: 70px;
          }
        }
        .vipPic{
          position: absolute;
          bottom: -13px;
          right: -25px;
        }
      }
    }
    .inlineBlock{
      display: inline-Block;
    }
    .textLeft{
      text-align: left;
    }
    .textRight{
      text-align: right;
    }
    .textCenter{
      text-align: center;
    }
    .sart{
      color: #F56C6C;
    }
    .w300{
      width: 300px;
    }
    .w450{
      width: 450px;
    }
    .mb10{
      margin-bottom: 10px;
    }
    .w100{
      width: 100px;
    }
    .verticalAlignTop{
      vertical-align: top;
    }
  }
  .inputStyle{
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: none;
    padding: 0 15px;
    -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  .inputStyle:focus{
    border-color: #0096a4;
  }

</style>
