<template>
  <Dialog
    name="PosDialog.OrderingVerifiedMinChenModal"
    :title="$t('Dict.VerifiedMember')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="false"
    width="740px"
    height="435px"
    :hotkeys="hotKeySet"
  >
  <div class="content-warp">
    <div class="memberform-warp">
      <el-form ref="memberform" label-width="54px" label-position='left'>
        <el-form-item :label="$t('Dict.Member1')" class="memberNo-input-warp">
          <!-- "InputMemberCode": "请输入会员动态码" -->
          <el-input
            class="memberNo-input"
            v-model="memberNo"
            v-judge
            :placeholder="$t('Biz.Order.InputMemberCode')"
            @keydown.native.enter="queryMember"
            v-autotest>
          </el-input>
          <button
            class="btn btn-primary"
            @click="queryMember"
            type="button"
            v-autotest>{{ $t('Dict.Search2') }}<span class="quick-tip">(Enter)</span>
          </button>
        </el-form-item>
      </el-form>
      <div class="minchen-member-info" v-if="querySuccess">
        <h2 class="minchen-phonenumber">
          {{ memberInfo.mobile }}
          <img v-if="memberInfo.gender == 1" src="@/common/images/sl-msg/icon_male.png">
          <img v-else src="@/common/images/sl-msg/icon_female.png">
        </h2>
        <p class="minchen-info">
          <!-- "SolarCalendar": "阳历" -->
          {{ memberInfo.name }}&nbsp;&nbsp;|<i class="icon birthday icon-huabanfuben"></i> &nbsp;
          {{memberInfo.birthDay}}({{$t('Dict.SolarCalendar')}})
        </p>
        <p class="minchen-info">
          <span class="info-left">{{ $t('Dict.CarBalance') }}</span>
          <span class="info-right">{{ memberInfo.cardBala }}</span>
        </p>
        <p class="minchen-info">
          <span class="info-left">{{ $t('Dict.Integral') }}:</span>
          <span class="info-right">{{ memberInfo.points }}</span>
        </p>
        <div class="minchen-radio" v-show="querySuccess &&this.memberInfo.isHaveMemberPriceItem">
          <el-radio v-model="radio" label="1">{{ $t('Dict.MemberPrice') }}</el-radio>
          <!-- "DoNotUseOffers": "不使用优惠" -->
          <el-radio v-model="radio" label="2">{{ $t('Biz.Order.DoNotUseOffers') }}</el-radio>
        </div>
      </div>
      <el-row v-if="querySuccess">
        <!-- "CancelVerification": "取消验证" -->
          <el-button
          @click="cancleVerify"
           class="cancle-verify btn"
          >
          {{ $t('Biz.Order.CancelVerification') }}(PgUp)
          </el-button>
          <!-- "SureVerification": "确认验证" -->
          <el-button
            @click="onSubmit"
            class="confirm-verify btn btn-primary"
          >
          {{ $t('Biz.Order.SureVerification') }}(PgDn)
          </el-button>
        </el-row>
    </div>
    <!-- 右侧 -->
    <div class="memberinfo-warp">
      <div class="bill-area">
      <div class="bill-tab">
        <div
          class="tab-item"
          :class="{active: activeTab === 'check'}"
          @click="changeTab('check')"
        >
        <!-- "CouponDetailed": "券明细", -->
          {{ $t('Biz.Order.CouponDetailed') }}
        </div>
        <div
          class="tab-item"
          :class="{active: activeTab === 'cost'}"
          @click="changeTab('cost')"
        >
        <!-- "LastConspDeills": "上次消费明细" -->
          {{ $t('Biz.Order.LastConspDeills') }}
        </div>
        <div
          class="tab-item"
          :class="{active: activeTab === 'info'}"
          @click="changeTab('info')"
        >
          {{ $t('Dict.Other') }}
        </div>
      </div>
      <div class="content">
        <MinChenTicket
          :ticketList="ticketList"
          v-if="activeTab === 'check'"
        >
        </MinChenTicket>
        <MinChenCost
          :lastPay="lastPay"
          v-if="activeTab === 'cost'"
        >
        </MinChenCost>
        <MinChenInfo
          v-if="activeTab === 'info'"
        >
        </MinChenInfo>
      </div>
    </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import MinChenCost from '@/components/Pos/Order/Bill/BillBtnsFunc/MinChenCost';
import MinChenInfo from '@/components/Pos/Order/Bill/BillBtnsFunc/MinChenInfo';
import MinChenTicket from '@/components/Pos/Order/Bill/BillBtnsFunc/MinChenTicket';

export default {
  components: {
    Dialog,
    MinChenCost,
    MinChenInfo,
    MinChenTicket,
  },
  mixins: [DialogMixin],
  data() {
    return {
      activeTab: 'check',
      radio: "1", // true为会员价,false为不使用优惠
      memberInfo: {
      },
      memberNo: '', // 请输入会员动态码
      ticketList:[], // 券列表
      querySuccess:false,//是否查询成功
      isExecMemberPlanRemark:0,//是否执行会员价方案
      memberDiscountIdRemark:0,//是否使用优惠
      lastPay:[],//上次消费明细
    };
  },
  computed: {
    ...mapGetters(['posFastFood', 'posSettings']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        PgUp: () => {
          this.cancleVerify();
        },
      };
    },
  },
  watch: {
    radio: {
      handler(val) {
        if(val === "1") { //会员价
          this.isExecMemberPlanRemark = 1;//是否执行会员价方案
          this.memberDiscountIdRemark = 2;//是否使用优惠
        } else {
          this.isExecMemberPlanRemark = 0;//是否执行会员价方案
          this.memberDiscountIdRemark = 0;//是否使用优惠
        }
      },
    },
  },
  methods: {
    onOpen() {
      ajax('canyin.pos.settlement.pay.crmPayWay.mingchengetcrmmemberinfo', {
        contentType: 'URLEncoded',
        data: {
          pointId: this.$store.getters.posOrderBill.bsData.pointId,
        },
      }).then((res) => {
        if(res.data.result === 1) {
          if(res.data.data !== null) {
            this.querySuccess = true;
            const { data } = res.data;
            this.memberInfo = data;
            if(data.lastPay) {
              this.lastPay = data.lastPay;
            }
            // 如果显示会员价和不使用优惠单选按钮默认显示会员价
            if(this.memberInfo.isHaveMemberPriceItem) {
              this.isExecMemberPlanRemark = 1;//是否执行会员价方案
              this.memberDiscountIdRemark = 2;//是否使用优惠
            }
            // 券列表
            this.ticketList = data.ticketList;
            this.$message.success(res.data.msg);
          }
        } else {
          this.$message.error(res.msg)
        }

      });
    },
    // 切换tab
    changeTab(tabName) {
      this.activeTab = tabName;
    },
    // 关闭时执行(自动 和 Esc触发)
    onClose() {
      // 清空输入框
      this.memberNo = '',
      // 关闭验证会员初始化默认值
      this.querySuccess = false;
      this.changeTab('check');
      this.lastPay = [];
      // 清空券列表
      this.ticketList = [];
      this.close();
    },
    // 查询会员卡
    queryMember() {
      if (this.memberNo === '') {
        // "PlsInputMemCode": "请输入会员卡号"
        this.$message.error(this.$t('Biz.Order.PlsInputMemCode'));
        return;
      }
      // const reg = /^[0-9]*$/;
      // if(!reg.test(this.memberNo)) {
      //   this.$message.error("请输入纯数字");
      //   return;
      // }
      ajax('canyin.pos.settlement.pay.crmPayWay.mingchenquerymember', {
        contentType: 'URLEncoded',
        data: {
          cardNo:this.memberNo,//卡号
          pointId: this.$store.getters.posOrderBill.bsData.pointId,//客位Id
        },
      }).then((res) => {
        if (res.result === 1) {
          this.querySuccess = true;
          const { data } = res;
          this.memberInfo = data;
          if(data.lastPay) {
            this.lastPay = data.lastPay;
          }
          // 如果显示会员价和不使用优惠单选按钮默认显示会员价
          if(this.memberInfo.isHaveMemberPriceItem) {
            this.isExecMemberPlanRemark = 1;//是否执行会员价方案
            this.memberDiscountIdRemark = 2;//是否使用优惠
          }
          // 券列表
          this.ticketList = data.ticketList;
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg)
        }
      });
    },
    // 点击取消验证会员
    cancleVerify() {
      ajax('canyin.pos.settlement.pay.crmPayWay.mingchencancelmember', {
        contentType: 'URLEncoded',
        data: {
          isExecMemberPlan:this.isExecMemberPlanRemark,//是否执行会员价方案
          pointId: this.$store.getters.posOrderBill.bsData.pointId,//客位Id
        },
      }).then((res) => {
        if(res.result === 1) {
          // 关闭页面
          this.close();
          console.log('OrderingVerifiedMinChenModal1');
          this.$vemit('loadBill', this.$store.getters.posOrderBill.bsData.pointId);
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 点击提交验证会员
    onSubmit() {
      ajax('canyin.pos.settlement.pay.crmPayWay.mingchenregistermember', {
        contentType: 'URLEncoded',
        data: {
          isExecMemberPlan:this.isExecMemberPlanRemark,//是否执行会员价方案
          memberDiscountId: this.memberDiscountIdRemark,//是否使用优惠
          pointId: this.$store.getters.posOrderBill.bsData.pointId,//客位Id
        },
      }).then((res) => {
        if(res.result === 1) {
          // 关闭页面
          this.close();
          console.log('OrderingVerifiedMinChenModal2');
          this.$vemit('loadBill', this.$store.getters.posOrderBill.bsData.pointId);
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
  },

  filters: {
    dateStr(val) {
      return toNormalTimeStr(val);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content-warp{
  display: table;
  width: 100%;
  height: 100%;
  background-color: @white;
  > * {
    vertical-align: top;
    display: table-cell;
    position: relative;
  }
}

.memberNo-input-warp{
  .memberNo-input{
    width: 218px;
    vertical-align: middle;
  }
  button{
    vertical-align: middle;
    height: 38px;
    margin-left: 10px;
    width: 100px;
  }
}


  .bill-area{
    flex-grow: 1;
    background-color: @white;
    .content{
      position: absolute;
      top: 50px;
      right: 16px;left: 16px;bottom: 0;
    }
  }

// Tab区域
.bill-tab{
  border-bottom: 1px solid #b5b5b5;
  background-color: @white;
  padding: 0 16px;
  .tab-item{
    cursor: pointer;
    display: inline-block;
    padding: 10px 12px 8px;
  }
  .tab-item + .tab-item{
    margin-left: 8px;
  }
  .active{
    border-bottom: 4px solid @brand-primary;
  }
}

.memberform-warp {
  background: @white;
  width: 420px;
  border-right: 1px solid #ddd;
  padding: 16px 16px;

  > .minchen-member-info {
    margin: 0 60px;
    > .minchen-phonenumber {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: bolder;
    }

    > .minchen-info:last-of-type {
       margin-bottom: 20px;
    }

    > .minchen-info {
      margin-bottom: 6px;
      display: flex;
      > span {
        flex: 1;
      }

      > .birthday{
        font-size: 20px;
        margin-top: -5px;
        color: sandybrown;
      }

      > .info-right {
         text-align: right;
         font-weight: bolder;
      }
    }
    > .minchen-radio {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 55px;
    }
  }
  .el-row {
       > .cancle-verify {
         margin-left:80px;
         border: 1px solid #ddd;
       }
    }
}
</style>
<style lang="less">
  .minchen-radio {
    > .el-radio {
      margin-left: 0;
      margin-bottom: 15px;
    }
  }
</style>
