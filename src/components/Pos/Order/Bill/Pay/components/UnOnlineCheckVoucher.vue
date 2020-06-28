<template>
<!-- $t-离线验券 -->
  <Dialog
    name="PosDialog.UnOnlineCheckVoucher"
    :title="$t('Dict.OfflineCheckVoucher')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    @submit="onSubmit"
    width="682px"
    :append-to-body="true"
    :hotkeys="hotKeySet"
  >
  <div class="pkg-content">
    <div class="table-head">
      <ul>
        <li>
          <span class="name-col">{{$t('Biz.Settlement.VoucherMame')}}</span>
          <span class="face-col">{{$t('Biz.Coupon.CouponFaceValue')}}</span>
          <span class="price-col">{{$t('Biz.Coupon.CouponPrice')}}</span>
          <span class="start-col">{{$t('Dict.StartDate')}}</span>
          <span class="end-col">{{$t('Dict.EndDate')}}</span>
          <span class="choose-col">{{$t('Dict.Choose')}}</span>
        </li>
      </ul>
    </div>
    <div class="table-body">
      <ul id="gbTicketListId">
        <li
          v-for="(item,index) in gbTicketList"
          :key="item.deal_id+index"
          @click="changeGroup(item)">
          <span class="name-col">
            {{item.title}}
          </span>
          <span class="face-col">
            {{item.market_price | keepTwo}}
          </span>
          <span class="price-col">
            {{item.price | keepTwo}}
          </span>
          <span class="start-col">
            {{item.receipt_begin_date | dateFormat}}
          </span>
          <span class="end-col">
            {{item.receipt_end_date | dateFormat}}
          </span>
          <span class="choose-col">
            <el-radio v-model="currentGroup" :label="item">&nbsp;</el-radio>
          </span>
        </li>
      </ul>
      <div class="no-item" v-if="gbTicketList.length === 0">
        <p>{{$t('Biz.Coupon.NotFoundCouponInfo')}}</p>
      </div>
    </div>
    <div class="list-pager">
       <div class="pager-content">
          <Pager pagerId="gbTicketListId" :showInfo="true" ref="pager"></Pager>
       </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import numberformat from '@/common/js/numberformat';

// 数字不足两位，在前面补0
function addZero(num) {
  const str = `${num}`;
  if (str.length === 1) return `0${str}`;
  return str;
}

// 转为正常时间字符串
function toNormalDateStr(timeStamp) {
  const date = new Date(timeStamp);
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());
  return `${year}-${month}-${day}`;
}

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      // 团购券列表
      gbTicketList: [],
      // 当前代金券券
      currentGroup: null,
      prePageSize: 7,
    };
  },
  props: {
    // 来源id
    sellerId: {
    },
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  filters: {
    keepTwo(val) {
      let value = val;
      if (!val) {
        value = 0;
      }
      return numberformat(value);
    },
    dateFormat(val) {
      return toNormalDateStr(val);
    },
  },
  methods: {
    // 更改团餐券
    changeGroup(group) {
      this.currentGroup = group;
    },
    onOpen() {
      this.getTicketList().then((data) => {
        const { gbTicketList } = data;
        if (!gbTicketList || !gbTicketList.length) return;
        gbTicketList.forEach((list) => {
          // 过滤掉 代金券的列表数据
          if (!list.pkg_name || list.pkg_name === '') {
            this.gbTicketList.push(list);
          }
        });
        [this.currentGroup] = [data.gbTicketList[0]];
        this.$refs.pager.refresh();
      });
    },
    getTicketList() {
      return new Promise((resolve) => {
        ajax('canyin.pos.gbticketbill.showticketlist', {
          params: {
            sellerId: this.sellerId,
            controlMode: this.$store.state.pos.posBaseInfo.controlMode,
          },
        })
          .then((data) => {
            resolve(data);
          });
      });
    },
    onSubmit() {
      this.$emit('on-check-offline', [this.currentGroup, this.resData.ticketCode]);
      this.close();
    },
    onClose() {
      // 清空离线验券数据
      this.gbTicketList = [];
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// 中间table
.pkg-content{
  background-color: @white;
  padding: 8px 12px;
  table{
    width: 100%;
  }
  th,td{
    padding-left: 6px;
    font-weight: normal;
  }
  .table-head{
    padding: 4px 0;
    background-color: #7bcad6;
    color: @white;
    ul {
      font-size: 12px;
      line-height: 1.1;
      li {
        padding: 5px 0px;
        span{
          display: inline-block;
          text-align: center;
        }
        .choose-col {
          text-align: center;
        }
      }
    }
  }
  .table-body{
    margin-top: 6px;
    color: @gray-dark;
    // height: 365px;
    // overflow: hidden;
    ul{
      height: 450px;
      overflow: hidden;
      li{
        border-bottom: 1px solid #7bcad6;
        vertical-align: middle;
        color: #333333;
        span{
          display: inline-block;
          font-size: 12px;
          line-height: 1.5;
          padding: 8px 0 8px 8px;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          height: 34px;
        }
      }
    }
  }
  .name-col{
    width: 23%;
  }
  .face-col{
    width: 15%;
    text-align: center!important;
  }
  .price-col{
    width: 15%;
    text-align: center!important;
  }
  .start-col{
    width: 15%;
    text-align: center!important;
  }
  .end-col{
    width: 15%;
    text-align: center!important;
  }
  .pkg-col{
    width: 15%;
    text-align: center!important;
  }
  .choose-col {
    width: 12%;
    text-align: center!important;
  }
}

.no-item{
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding-top: 20px;
}

.list-pager{
  height: 48px;
  position: relative;
  .pager-content {
    position: absolute;
    width: 180px;
    right:0px;
    padding: 9px;
  }
}
</style>
