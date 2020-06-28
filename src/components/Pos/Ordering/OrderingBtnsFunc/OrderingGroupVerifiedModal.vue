<template>
<!-- 团购验券 -->
  <Dialog
    name="PosDialog.OrderingGroupVerifiedModal"
    :title="$t('Biz.Coupon.CheckCouponTitle')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :submitText="$t('Dict.Btn.WriteOff')"
    :showSubmit="true"
    top="10vh"
    width="764px"
    :hotkeys="hotKeySet"
  >
  <div class="content-warp">
    <div class="group-list">
      <div class="source-warp">
        <!-- 券来源： -->
        <p class="title">{{$t('Biz.Coupon.CouponsSources')}}</p>
        <button
          v-for="(item,index) in sellerList"
          :key="index"
          type="button"
          class="btn btn-default"
          :class="{'btn-primary':currentSeller && (currentSeller.name === item.name)}"
          @click="changeSeller(item)"
        >{{item.name}}</button>
      </div>
      <div class="number-warp">
        <!-- 请输入券号： -->
        <p class="title">{{$t('Biz.Coupon.EnterTicketNumberLabel')}}</p>
        <div class="number-content">
          <div class="input-div">
            <!-- 请输入券号 -->
            <input
              v-judge
              v-if="ishowElInput"
              ref="voucherInput"
              class="voucher-input"
              v-model="voucherTemp"
              :placeholder="$t('Biz.Coupon.EnterTicketNumber')"
              v-keyboard:keyboard="{ autoSelect: true }"
            >
            <span
              class="clearInput"
              :class="{ 'showClearBtn': voucherTemp.length }" @click="clearHandel">
              <i></i>
            </span>
          </div>
          <!-- 验券 -->
          <button
            type="button"
            @click="checkTicket"
            class="btn btn-primary"
          >
            {{ $t('Dict.Btn.CheckCoupon') }}<span class="keybord-tip">(Enter)</span>
          </button>
          <!-- 离线验券 -->
          <button
            type="button"
            @click="offlineCheck"
            class="btn btn-default"
          >{{ $t('Dict.Btn.OfflineCheckVoucher') }}</button>
        </div>
      </div>
      <div class="currentgroup-info">
        <group-detail v-if="ticket"
          :ticket="ticket"
          :ticket-type="ticketType"
          :voucher-no="voucher"
          v-model="pkgInfo"
        ></group-detail>
        <div class="no-item" v-else>
          <img class="document-icon" src="@/common/images/sl-msg/document-icon.png">
          <!-- <p>暂无信息</p>
          <p>请输入券号进行搜索</p> -->
          <p>{{ $t('Dict.NoInfo') }}</p>
          <p>{{ $t('Biz.Coupon.PleaseInputCouponNo') }}</p>
        </div>
      </div>
    </div>
    <div class="group-info">
      <p class="title number-title">
        <!-- 已核销券： -->
        {{ $t('Biz.Coupon.CertifiedTicket') }}
        <!-- 共{{bizTsPwGbList.length}}张 -->
        <span class="total-count">
          {{ $t('Dict.PageStyle.Sim2', [bizTsPwGbList.length]) }}
        </span>
      </p>
      <div class="voucher-warp">
        <div class="voucher-item" v-for="(item, index) in showList" :key="index">
          <div class="money">
            <p class="type">{{item.ticket_type | ticketType}}</p>
            <p class="cost">{{item.ticket_value | keepTwo}}</p>
          </div><div class="name">
            <p class="number">{{item.ticket_code}}</p>
            <p class="title">{{item.name}}</p>
          </div>
        </div>
      </div>
      <div class="pos-pager">
        <div class="pos-takeout-pager">
          <span class="page-info">{{
            $t('Dict.PageStyle.Text1', {
              length: bizTsPwGbList.length,
              currentPage,
              totalPage: pageCount(bizTsPwGbList),
            })
          }}</span>
          <button
            href="javascript:;"
            class="prev"
            @click="upPage"
          ><i class="el-icon-arrow-up"></i></button>
          <button
            href="javasctipt:;"
            class="next"
            @click="downPage(bizTsPwGbList)"
          ><i class="el-icon-arrow-down"></i></button>
        </div>
      </div>
      <div class="keybord-warp">
        <KeyBoard
          ref="keyboard"
          class="keybord"
          @chopstickenter="checkTicket"></KeyBoard>
      </div>
    </div>
  </div>
  <group-off-line-modal ref="groupOffLineModal"
    v-if="currentSeller"
    @on-check-offline="checkOfflineTicket"
    :sellerId="currentSeller.o2oId"
  ></group-off-line-modal>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import GroupDetail from './GroupDetail';
import GroupOffLineModal from './GroupOffLineModal';
import numberformat from '@/common/js/numberformat';

export default {
  components: {
    Dialog, KeyBoard, GroupDetail, GroupOffLineModal,
  },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      // 券号
      voucher: '',
      // 绑定输入框的券号
      voucherTemp: '',
      // 来源列表
      sellerList: [],
      // 当前来源
      currentSeller: null,
      // 当前券信息
      ticket: null,
      // 券类型
      ticketType: 1,
      // 绑定的套餐信息
      pkgInfo: null,
      // 已核销券
      bizTsPwGbList: [],
      // 每页个数
      prePageSize: 4,
      comeType: 1, // 是否在线验券 1代表在线验券, 2 代表离线验券
      ishowElInput: false,
    };
  },
  directives: {
    focus: {
      inserted(el, option) {
        const defClass = 'el-input'; const
          defTag = 'input';
        let value = option.value || true;
        if (typeof value === 'boolean') {
          value = { cls: defClass, tag: defTag, foc: value };
        } else {
          value = { cls: value.cls || defClass, tag: value.tag || defTag, foc: value.foc || false };
        }
        if (el.classList.contains(value.cls) && value.foc) {
          el.getElementsByTagName(value.tag)[0].focus();
        }
      },
    },
  },
  methods: {
    // 清空显示
    clearHandel() {
      this.voucherTemp = '';
    },
    // 离线验券
    offlineCheck() {
      this.voucher = this.voucherTemp;
      if (this.voucher === '') {
        // 请输入券号
        this.$message.warning(this.$t('Biz.Coupon.EnterTicketNumber'));
        return;
      }
      this.$refs.groupOffLineModal.open();
    },
    // 验券
    checkTicket() {
      this.voucher = this.voucherTemp;
      if (this.voucher === '') {
        // 请输入券号
        this.$message.warning(this.$t('Biz.Coupon.EnterTicketNumber'));
        return;
      }
      ajax('canyin.pos.gbticketbill.checkticket', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.$store.getters.posOrderBill.bsData.id,
          sellerId: this.currentSeller.o2oId,
          ticketCode: this.voucher,
        },
      }).then((data) => {
        if (!data.flag) {
          this.ticket = null;
          this.$message.warning(data.msg);
          this.voucherTemp = '';
          return;
        }
        if (data.ticketType != 1) {
          // ${this.voucher}是【${data.ticket.title}】,属于代金券,请在结算时使用【美团点评团购】结算方式进行核销。
          this.$message.warning(this.$t('Biz.Coupon.Message1', [
            this.voucher,
            data.ticket.title,
          ]));
          return;
        }
        // 是否是在线验券
        this.comeType = 1;
        this.ticket = data.ticket;
        this.ticketType = data.ticketType;
      });
    },
    // 离线验券
    checkOfflineTicket(data) {
      ajax('canyin.pos.gbticketbill.checkoffline', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.$store.getters.posOrderBill.bsData.id,
          dealId: data.deal_id,
          marketPrice: data.market_price,
          price: data.price,
          sellerId: this.currentSeller.o2oId,
        },
      }).then((d) => {
        if (!d.flag) {
          this.ticket = null;
          this.$message.warning(d.msg);
          return;
        }
        // 是否是在线验券
        this.comeType = 2;
        this.ticket = d.ticket;
        this.ticketType = d.ticketType;
        this.$vemit('initPkgListIndex');
      });
    },
    // 更改来源
    changeSeller(seller) {
      this.currentSeller = seller;
    },
    onOpen() {
      this.voucher = '';
      this.voucherTemp = '';
      this.currentSeller = null;
      this.ticket = null;
      this.pkgInfo = null;
      this.ishowElInput = true;
      this.ishowElInput = true;
      ajax('canyin.pos.gbticketbill.gbticketbillview', {
        params: {
          pointId: this.$store.getters.posOrderBill.bsData.pointId,
        },
      })
        .then((data) => {
          this.sellerList = data.sellerList;
          this.currentSeller = data.sellerList[0];
          this.bizTsPwGbList = data.bizTsPwGbList;
        });
      setTimeout(() => {
        this.$refs.voucherInput.focus();
      }, 500);
      this.$log.info(`打开团购验券,pointId:${this.$store.getters.posOrderBill.bsData.pointId}`);
    },
    // 点击提交验证会员
    onSubmit() {
      // 团餐券的时候
      if (this.ticketType == 1) {
        if (!this.pkgInfo || this.pkgInfo.pkg.pkgList.length <= 0) {
          // 请先选择套餐明细
          this.$message.warning(this.$t('Biz.Coupon.PlaceSelectPackage'));
          return;
        }
      }
      let params = {
        pointId: this.$store.getters.posOrderBill.bsData.pointId,
        bsId: this.$store.getters.posOrderBill.bsData.id,
        paywayId: this.currentSeller.paywayId,
        ticketValue: this.ticket.marketPrice,
        ticketCode: this.voucher,
        ticketId: this.ticket.dealId,
        ticketSale: this.ticket.price,
        ticketType: this.ticketType,
        sellerId: this.ticket.sellerId,
        comeType: this.comeType,
        mealTotal: 0,
        ticketCodes: [{ ticketCodes: [this.voucher] }], // 核销券的code
        verifyNums: [{ verifyNums: [1] }], // 核销券的数量
      };
      if (this.ticketType == 1) {
        params = Object.assign(params, { ...this.pkgInfo });
      }
      ajax('canyin.pos.gbticketbill.verify', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: params,
      })
        .then((data) => {
          if (!data) {
            this.$message.warning(data.msg);
            return;
          }
          if (!data.success) {
            this.$message.warning(data.msg);
            return;
          }

          if (!data.data.flag) {
            this.$message.warning(data.data.errorMsg);
            return;
          }
          this.$message.warning('验券成功！');
          this.$vemit('loadBill', this.$store.getters.posOrderBill.bsData.pointId);
          this.close();
        });
      this.$log.info(`提交团购验券。ticketId:${params.ticketId}`);
    },
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        Enter: () => {
          this.checkTicket();
        }
      };
    },
    // 已核销的券的显示列表currentPage
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.bizTsPwGbList);
    },
  },
  filters: {
    keepTwo(val) {
      if (!val) val = 0;
      return numberformat(val);
    },
    // 券类型
    ticketType(val) {
      val = `${val}`;
      switch (val) {
        case '1':
          // 团餐券
          return this.$t('Biz.Coupon.MealCoupon');
        case '2':
          // 代金券
          return this.$t('Biz.Coupon.CashCoupon');
        default:
          return '';
      }
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
  table-layout: fixed;
  >*{
    display: table-cell;
    vertical-align: top;
  }
}
p.title{
  color: #333;
  line-height: 2.4;
}
button{
  padding-right: 0;
  padding-left: 0;
  height: 40px;
}

.group-list{
  width: 490px;
  border-right: 1px solid #ddd;
  background-color: @white;
  padding: 16px 12px;
  .source-warp {
    > * {
      display: inline-block;
    }
    button{
      width: 100px;
      margin-right: 6px;
    }
  }
  .number-warp{
    margin-top: 16px;
    .number-content{
      >*{
        display: inline-block;
        vertical-align: middle;
      }
      .input-div {
        height: 38px;
        width: 268px;
        position: relative;
        border: 1px solid #dddddd;
        border-radius: 5px;
        >.clearInput {
          display: inline-block;
          position: absolute;
          background-color: #d0d0d0;
          width: 24px;
          height: 24px;
          top: 6px;
          right: 8px;
          border-radius: 12px;
          display: none;
          &.showClearBtn {
            display: block;
            cursor: pointer;
          }
          i{
            width: 12px;
            height: 12px;
            display: inline-block;
            display: inline-block;
            background-image: url(~@/common/images/pos/main/close1.png);
            background-position: center;
            top: 6px;
            left: 6px;
            position: absolute;
          }
        }
      }
      .voucher-input{
        width: 232px;
        margin-right: 8px;
        height: 36px;
        border: 0px;
        padding-left: 5px;
      }
      button{
        width: 90px;
      }
      .keybord-tip{
        font-size: 12px;
      }
    }
  }
  .currentgroup-info{
    height: 408px;
    padding: 8px;
    margin-top: 12px;
    position: relative;
    .no-item{
      position: absolute;
      top: 156px;
      right: 0;left: 0;
      margin: auto;
      width: 160px;
      display: inline-block;
      font-size: 12px;
      overflow: hidden;
      color: #b5b4b4;
      img.document-icon{
        float: left;
        padding-right: 8px;
      }
      p{
        text-align: left;
        line-height: 1.5;
        word-break:keep-all;
        white-space:nowrap;
      }
    }
  }
}

.group-info{
  background-color:white;
  padding: 0 12px;
  .number-title{
    margin-top: 8px;
  }
  .title{
    .total-count{
      float: right;
    }
  }
  .keybord-warp{
    text-align: center;
    margin-top: 16px;
    .keybord{
      margin: 0 auto;
    }
  }
}
.voucher-warp{
  height: 228px;
  overflow: hidden;
}
.voucher-item{
  & + &{
    margin-top: 4px;
  }
  > *{
    display: inline-block;
    vertical-align: middle;
    border-radius: 5px;
  }
  .money{
    background-color: #62bef9;
    text-align: center;
    width: 28%;
    color: #FFF;
    padding: 6px 0;
    .type{
      line-height: 1.25;
      font-size: 16px;
    }
    .cost{
      line-height: 1;
      font-weight: bold;
      font-size: 20px;
    }
  }
  .name{
    width: 72%;
    background-color: @white;
    border: 1px solid #ddd;
    padding: 6px 0 6px 10px;
    .number{
      font-size: 14px;
      color: #999;
      line-height: 1.28;
    }
    .title{
      line-height: 1.375;
      font-weight: bold;
      font-size: 16px;
      color: #666;
    }
  }
}

.pos-pager{
  overflow: hidden;
}
// 箭头按钮
.pos-takeout-pager {
  float: right;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
    background-color: white;

    > i {
      color : #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}

.lang-enUS{
  .pos-takeout-pager{
    font-size:12px;
  }
  .group-list .number-warp .number-content{
    // .input-div{
    //   display: block;
    //   margin-bottom: 10px;
    // }
    button {
      font-size: 12px;
      width: auto;
    }
  }
}
</style>
