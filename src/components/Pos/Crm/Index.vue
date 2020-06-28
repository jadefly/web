<template>
  <div id="crm" class="content-warp">
    <div class="content">
      <div class="menu-list">
        <div class="cursor" :style="{top:cursorTop+'px'}">
          <img class="cursor-img" src="@/common/images/sl-msg/member-cursor.png">
        </div>
        <div class="menu-item" v-for="(item,index) in menuList"
        :key="item.name" @click="changeMenu(index)" :class="{'active': menuIndex === index}">
          <img class="img-icon" :src="item.icon">
          <h5>{{item.title}}</h5>
        </div>
      </div>
      <div class="member-form-warp">
        <div class="member-form-content">
          <crm-sell-card
            v-model="cardInfo"
            @charge="goCharge"
            ref="crmsellcard"
            v-if="menuIndex === 0">
          </crm-sell-card>
          <crm-recharge
            v-model="cardInfo"
            ref="crmrecharge"
            v-else-if="menuIndex === 1">
          </crm-recharge>
          <crm-back-card
            v-model="cardInfo"
            ref="crmbackcard"
            v-else-if="menuIndex === 2">
          </crm-back-card>
          <crm-consumer-inquiry
            v-model="cardInfo"
            ref="crmconsumerinquiry"
            v-else-if="menuIndex === 3">
          </crm-consumer-inquiry>
          <crm-refund
            v-model="cardInfo"
            ref="crmrefund"
            v-else-if="menuIndex === 4">
          </crm-refund>
          <CrmOffWorkBill
            v-model="cardInfo"
            ref="crmOffWork"
            v-else-if="menuIndex === 5">
          </CrmOffWorkBill>
        </div>
      </div>
      <div class="member-info-warp" v-show="menuIndex != 5">
        <div class="user-info-warp">
          <img class="head" src="@/common/images/sl-msg/member-male.png">
          <template v-if="cardInfo">
            <p class="name">{{cardInfo.name}}</p>
            <p class="phone">{{cardInfo.phone}}</p>
          </template>
        </div>
        <div class="user-card-warp">
          <template v-if="cardInfo">
            <p class="card-type">
              <!-- $t-卡类型： -->
              <span class="title">{{ $t('Dict.CardType4') }}</span>
              <span class="info">{{cardInfo.cardTypeName}}</span>
            </p>
            <p class="card-number">{{cardInfo.cardNo}}</p>
            <p class="card-money">
              <!-- $t-卡余额： -->
              <span class="title">{{ $t('Biz.Crm.CardBalance02') }}</span>
              <span class="info">{{cardInfo.balanceMoney}}</span>
            </p>
          </template>
          <!-- $t-暂无信息 -->
          <p class="no-item" v-else>{{ $t('Dict.NoInfo') }}</p>
        </div>
        <keyboard-num
          type="large"
          class="keyboard">
        </keyboard-num>
      </div>
    </div>
    <CrmCardList ref="crmCardList"></CrmCardList>
  </div>
</template>

<script>
import * as KeyboardUtil from '@/plugin/keyboard/util';
import ajax from '@/common/js/ajax';

import CrmSellCard from './components/CrmSellCard';
import CrmRecharge from './components/CrmRecharge';
import CrmBackCard from './components/CrmBackCard';
import CrmRefund from './components/CrmRefund';
import CrmOffWorkBill from './components/CrmOffWorkBill';
import CrmConsumerInquiry from './components/CrmConsumerInquiry';

import skIconUrl from '@/common/images/sl-msg/member_sk.png';
import czIconUrl from '@/common/images/sl-msg/member_cz.png';
import tlskIconUrl from '@/common/images/sl-msg/member_tlsk.png';
import xfkcxIconUrl from '@/common/images/sl-msg/member_xfkcx.png';
import czcxIconUrl from '@/common/images/sl-msg/member_czcx.png';
import jbdIconUrl from '@/common/images/sl-msg/member_jbd.png';

const CrmCardList = (resolve) => {
  import('./components/CrmCardList').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    CrmSellCard,
    CrmRecharge,
    CrmRefund,
    CrmConsumerInquiry,
    CrmBackCard,
    CrmCardList,
    CrmOffWorkBill,
  },
  data() {
    return {
      // 卡信息
      cardInfo: null,
      menuList: [
        {
          icon: skIconUrl,
          // title: '售卡',
          title: this.$t('Biz.Crm.SellCard'),
          name: 'sk',
        },
        {
          icon: czIconUrl,
          // title: '充值',
          title: this.$t('Biz.Crm.Recharge'),
          name: 'cz',
        },
        {
          icon: tlskIconUrl,
          // title: '退临时卡',
          title: this.$t('Biz.Crm.BackCard'),
          name: 'tlsk',
        },
        {
          icon: xfkcxIconUrl,
          // title: '卡消费查询',
          title: this.$t('Biz.Crm.QueryInfo'),
          name: 'xfkcx',
        },
        {
          icon: czcxIconUrl,
          // title: '充值撤销',
          title: this.$t('Biz.Crm.Refund'),
          name: 'czcx',
        },
        {
          icon: jbdIconUrl,
          // title: '会员结班单',
          title: this.$t('Biz.Crm.OffWorkBill'),
          name: 'hyjbd',
        },
      ],
      menuIndex: 0,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.focusInput();
      vm.$nextTick(() => {
        vm.setHotkey();
      });
    });
  },
  beforeRouteLeave(to, from, next) {
    next((vm) => {
      vm.$hotKey.removeCurrentModule();
    });
  },
  mounted() {
    // console.log(this.menuList)
  },
  methods: {
    // 聚焦当前页面上的输入框
    focusInput() {
      const allInput = document.querySelectorAll(KeyboardUtil.INPUT_SELECTOR);
      const inputEle = [...allInput].find(item => (item.name !== 'crmOffWorkBillDatePicker' && item.style.display !== 'none'));
      if (inputEle) inputEle.focus();
    },
    // 切换菜单
    changeMenu(menuIndex) {
      this.cardInfo = null;
      this.menuIndex = menuIndex;
      this.$nextTick(() => {
        this.focusInput();
        this.setHotkey();
      });
    },
    // 设置热键
    setHotkey() {
      switch (this.menuIndex) {
        case 0:
          this.$refs.crmsellcard.setCurrentHotkey();
          break;
        case 1:
          this.$refs.crmrecharge.setCurrentHotkey();
          break;
        case 2:
          this.$refs.crmbackcard.setCurrentHotkey();
          break;
        case 3:
          this.$refs.crmconsumerinquiry.setCurrentHotkey();
          break;
        case 4:
          this.$refs.crmrefund.setCurrentHotkey();
          break;
        default:
          break;
      }
    },
    // 去充值页面
    goCharge() {
      this.menuIndex = 1;
      if (!this.cardInfo || !this.cardInfo.cardNo) { return; }
      ajax('canyin.pos.crm.crmsalescounter.readcard', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.cardInfo.cardNo,
        },
      }).then((data) => {
        if (data.success) {
          this.cardInfo = data.data;
        }
      });
    },
  },
  computed: {
    // 游标上边距
    cursorTop() {
      return 78 * this.menuIndex;
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content-warp{
  padding: 12px;
  height: 100%;
}
.content{
  height: 100%;
  width: 100%;
  table-layout: fixed;
  display: table;
  >div{
    display: table-cell;
    vertical-align: top;
  }
}
.menu-list{
  @item-width: 78px;
  @item-height: 78px;
  width: @item-width;
  background-color: rgba(0, 0, 0, .4);
  text-align: center;
  position: relative;
  .menu-item{
    cursor: pointer;
    height: @item-height;
    padding-top: 16px;
    color: @white;
    position: relative;
    &.active{
      h5,.img-icon{
        filter: opacity(1);
        transition: filter .5s;
      }
    }
  }
  h5{
    padding-top: 4px;
    font-size: 12px;
  }
  h5,.img-icon{
    filter: opacity(40%);
  }
  .cursor{
    position: absolute;
    width: @item-width;
    height: @item-height;
    background-color: #0babb9;
    transition: top .5s;
    .cursor-img{
      position: absolute;
      width: 8px;
      height: auto;
      right: -8px;
      top:0; bottom:0;
      margin:auto;
    }
  }
}
.member-form-warp{
  padding-right: 10px;
  .member-form-content{
    padding: 28px 36px;
    text-align: center;
    height: 100%;
    background-color: #f7f7f7;
    >* {
      margin: 0 auto;
    }
  }
}
.member-info-warp{
  width: 288px;
  text-align: center;
  background-color: #f7f7f7;
  .user-info-warp{
    min-height: 274px;
    background-color: #99c4d7;
    padding: 32px 0 110px;
    border-radius: 0 0 25% 25%;
    color: @white;
    .name{
      margin-top: 4px;
      font-size: 18px;
      line-height: 1.5;
    }
    .phone{
      font-size: 16px;
      line-height: 1.375;
    }
  }
  .user-card-warp{
    margin: -70px auto 38px;
    width: 230px;
    height: 130px;
    background-image: url(~@/common/images/sl-msg/member-card.png);
    padding: 12px;
    text-align: left;
    position: relative;
    .title{
      font-size: 12px;
      color: #666;
    }
    .no-item{
      color: #666;
      text-align: center;
      padding-top: 12px;
    }
    .card-type{
      .info{
        font-size: 14px;
        line-height: 2;
        font-weight: bold;
        color: #824e0d;
      }
    }
    .card-number{
      font-size: 18px;
      color: #333;
      font-weight: bold;
      line-height: 2;
    }
    .card-money{
      position: absolute;
      bottom: 12px;
      right: 12px;
      width: 100%;
      text-align: right;
      .info{
        font-size: 16px;
        color: #666;
        font-weight: bold;
      }
    }
  }
  .keybord{
    margin: 0 auto;
  }
}
</style>
