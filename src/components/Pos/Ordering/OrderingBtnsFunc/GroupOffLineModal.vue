<template>
<!-- 离线验券 -->
  <Dialog
    name="PosDialog.GroupOffLineModal"
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
          <span class="name-col">{{ $t('Biz.Coupon.GroupCouponName') }}</span>
          <span class="face-col">{{ $t('Biz.Coupon.CouponFaceValue') }}</span>
          <span class="price-col">{{ $t('Biz.Coupon.CouponPrice') }}</span>
          <span class="start-col">{{ $t('Dict.StartDate') }}</span>
          <span class="end-col">{{ $t('Dict.EndDate') }}</span>
          <span class="pkg-col">{{ $t('Biz.Order.ConnectPackage') }}</span>
          <span class="choose-col">{{ $t('Dict.Choose') }}</span>
        </li>
      </ul>
    </div>
    <div class="table-body">
      <ul id="gbTicketListId">
        <li
          v-for="(item,index) in gbTicketList"
          :key="item.deal_id + index"
          @click="changeGroup(item)"
        >
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
          <span class="pkg-col">
            {{item.pkg_name}}
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
// import PageMixin from '@/common/util/PaginationMixin'

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
      // 当前团餐券
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
      if (!val) val = 0;
      return numberformat(val);
    },
    dateFormat(val) {
      return toNormalDateStr(val);
    },
  },
  methods: {
    // 更改团餐券
    changeGroup(group) {
      this.currentGroup = group;
      this.currentGroup = null;
    },
    onOpen() {
      // 初始化缓存数据
      this.gbTicketList = [];
      ajax('canyin.pos.gbticketbill.showticketlist', {
        params: {
          sellerId: this.sellerId,
          controlMode: this.$store.state.pos.posBaseInfo.controlMode,
        },
      })
        .then((data) => {
          data.gbTicketList.forEach((list) => {
          // 过滤掉 代金券的列表数据
            if (list.pkg_name && list.pkg_name != '') {
              this.gbTicketList.push(list);
            }
          });
          this.currentGroup = data.gbTicketList[0];
          setTimeout(() => {
            this.$refs.pager.refresh();
          }, 500);
        });
      this.$log.info('打开离线验券窗口。');
    },
    onSubmit() {
      this.$emit('on-check-offline', this.currentGroup);
      this.close();
      this.$log.info('提交离线验券窗口。');
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
    width: 10%;
  }
  .price-col{
    width: 10%;
  }
  .start-col{
    width: 12.6%;
  }
  .end-col{
    width: 12.6%;
  }
  .pkg-col{
    width: 21%;
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
    width: 160px;
    right:0px;
    padding: 9px;
  }
}
</style>
