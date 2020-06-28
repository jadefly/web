
<template>
  <Dialog
    name="PosDialog.MinChenVerifyTickets"
    :title="$t('Biz.Settlement.MinChenVerifyTickets')"
    ref="dialog"
    @close="onClose"
    @submit="onSubmit"
    @open="onOpen"
    :hotkeys="MinChenVerifyTickets"
    :showSubmit="true"
    :append-to-body="true"
    width="500px"
    height="450px"
  >
  <div class="content">
    <div class="minChen"
      v-if="showList.length > 0">
      <div
        class="per-ticket-content"
        :class='{"select-active": selectItem === item }'
        @click="selectActive(item,index)"
        v-for="(item,index) in showList"
        :key="index">
        <div
          class="ticket-name"
          :class='[
            {"bgc-green": item.goodsId.charAt(0) === "B"},
            {"bgc-blue": item.goodsId.charAt(0) === "A"}
          ]'>{{ item.typeName }}</div>
        <div
          class="ticket-info"
          :class='[
            {"bgc-green": item.goodsId.charAt(0)=== "B"},
            {"bgc-blue": item.goodsId.charAt(0)=== "A"}
          ]'>
          <div class="ticket-money-remark">
            <span class="ticket-money">{{ item.couponValue }}</span>
          </div>
          <div class="ticket-date">{{ $t('Dict.TermOfValidity') }}:{{ item.validStart }} {{ $t('Dict.To') }} {{ item.validEnd }}</div>
        </div>
      </div>
    </div>
    <div class="minChen" v-else>
      <div class="wordCenter">{{ $t('Biz.Settlement.NoCouponAvailable') }}</div>
    </div>
    <div class="pos-pager">
      <div class="pos-takeout-pager">
        <span class="page-info">{{
          $t('Dict.PageStyle.Text2', {
            length: ticketList.length,
            currentPage,
            totalPage: pageCount(ticketList),
          })
        }}</span>
        <button
          href="javascript:;"
          class="prev"
          @click="upPage">
          <i class="el-icon-arrow-up"></i>
        </button>
        <button
          href="javasctipt:;"
          class="next"
          @click="downPage(ticketList)">
          <i class="el-icon-arrow-down"></i>
        </button>
      </div>
    </div>

  </div>

  </Dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';
// import { isNaN } from "lodash";

export default {
  components: { Dialog },
  mixins: [DialogMixin, PageMixin],
  props: {
    bsId: {
      type: String,
      default: '',
    },
    pointId: {
      type: String,
      default: '',
    },
  },
  computed: {
    // 添加快捷键
    MinChenVerifyTickets() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    showList() {
      // 翻页后去掉选中效果
      return this.pagination(
        this.currentPage,
        this.prePageSize,
        this.ticketList,
      );
    },
    ...mapGetters(['posBaseInfo']),
  },

  data() {
    return {
      prePageSize: 8,
      // activeIndex: null,// 选中index
      selectItem: null, // 选中的券信息
      ticketList: [], // 券列表

    };
  },
  methods: {
    onOpen() {
      this.selectItem = null;
      this.ticketList = this.resData.ticketList;
    },
    selectActive(item) {
      // eslint-disable-next-line eqeqeq
      if (this.selectItem == item) {
        this.selectItem = null;
        // this.activeIndex = null;
      } else {
        this.selectItem = item;
        // this.activeIndex = item;
      }
    },
    onClose() {
      this.ticketList = [];
    },
    onSubmit() {
      if (this.selectItem === null) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning7')}`);
        return;
      }
      const url = 'canyin.pos.settlement.pay.crmPayWay.mingchenconsumeticket';
      const params = {
        bsId: this.bsId, // 流水id
        pointId: this.pointId, // 客位id
        // controlMode:this.posBaseInfo.controlMode,
        couponNo: this.selectItem.couponNo, // 券号
        typeNo: this.selectItem.typeNo, // 类型编号
        typeName: this.selectItem.typeName, // 类型名称
        goodsId: this.selectItem.goodsId, // 商品id
        couponTypeId: this.selectItem.couponTypeId, // 券类型id
        couponPass: this.selectItem.couponPass, // 券pass
        couponCode: this.selectItem.couponCode, // 券code
        cardNo: this.selectItem.cardNo, // 卡号
      };
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        if (res.result === 1) {
          this.$emit('refreshBill');
          this.close();
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
        }

        // if (data.success) {
        //   // 上传优惠类型到VueX
        //   this.setDiscTypeCache(params);
        //   this.submit();
        //   this.$message({
        //     message: '优惠成功',
        //     type: 'success',
        //   });
        //   this.close();
        // } else {
        //   this.$message({
        //     message: data.msg,
        //     type: 'warning',
        //   });
        // }
      });
    },
    // //上传优惠类型到Vuex
    // setDiscTypeCache(data) {
    //   this.setSettleDiscType({ list: data });
    // },
    // ...mapActions(['setSettleDiscType']),
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.content {
  background-color: #fff;
  height: 100%;
}
.minChen {
  width: 100%;
  height: 338px;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  padding-top: 10px;
  // align-items: flex-start;
  // justify-content: center;
  align-content: flex-start;

  > .wordCenter {
    font-size: 16px;
    margin: auto;
    font-weight: bold;
  }
  > .per-ticket-content:nth-child(odd) {
    margin-left: 35px;
    margin-right: 35px;
  }

  > .per-ticket-content.select-active {
    border-color: #047d88;
    position: relative;
  }
  .select-active::after{
    content: "✔";
    display: block;
    position: absolute;
    bottom: -5px;
    right: 0;
    font-size: 20px;
    color:#047d88;
  }

  > .per-ticket-content {
    box-sizing: content-box;
    border: 2px solid transparent;
    margin-bottom: 10px;
    height: 70px;

    > .ticket-name {
      width: 200px;
      height: 30px;
      margin: 0 auto;
      padding-left: 15px;
      border-bottom: 1px dashed #fff;
      border-radius: 0 0 10px 10px;
      color: #fff;
      line-height: 30px;
      font-size: 12px;
    }

    > .ticket-info {
      width: 200px;
      height: 40px;
      margin: 0 auto;
      color: #fff;
      padding-left: 15px;
      border-radius: 10px 10px 0 0;
      > .ticket-money-remark {
        height: 25px;
        line-height: 25px;
        display: flex;
        justify-content: center;

        > .ticket-money {
          font-weight: bold;
          flex: 1;
          text-align: center;
        }
        // > .ticket-remark {
        //   flex: 1;
        //   font-size: 12px;
        //   color: #000;
        // }
      }

      > .ticket-date {
        height: 15px;
        font-size: 12px;
        text-align: center;
      }
    }
    > .bgc-green {
      background-color: #95c058;
    }

    > .bgc-blue {
      background-color: #60b8f0;
    }
  }
}

.page-content {
  width: 100%;
  padding: 5px 20px;
  text-align: right;

}

.pos-pager {
  position: relative;
  height: 52px;
  margin-right: 20px;
}

// 箭头按钮
.pos-takeout-pager {
  position: absolute;
  right: 0;
  bottom: 10px;
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
      color: #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}
</style>
<style lang="less">
// .el-dialog__body {
//   background-color: #fff !important;
// }
</style>
