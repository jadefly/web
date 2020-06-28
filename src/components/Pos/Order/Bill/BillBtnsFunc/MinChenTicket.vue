<template>
  <div class="wrapper">
    <div class="container" id="ticketsId">
      <div class="per-ticket-content" v-for="(item, index) in showList" :key="index">
        <div class="ticket-name " :class='[{"bgc-green": item.goodsId.charAt(0)=== "B"},{"bgc-blue": item.goodsId.charAt(0)=== "A"}]'>{{ item.typeName }}</div>
        <div class="ticket-info" :class='[{"bgc-green": item.goodsId.charAt(0)=== "B"},{"bgc-blue": item.goodsId.charAt(0)=== "A"}]'>
          <div class="ticket-money-remark">
            <span class="ticket-money"> {{ item.couponValue }}</span>
            <!-- <span class="ticket-remark">{{ }}</span> -->
          </div>
          <!-- $t-有效期, 至 -->
          <div class="ticket-date">{{$t('Dict.TermOfValidity')}}:{{ item.validStart }} {{$t('Dict.To')}} {{ item.validEnd }}</div>
        </div>
      </div>
    </div>
    <div class="pos-pager">
      <div class="pos-takeout-pager">
        <!-- 共{{ticketList.length}}条,{{currentPage}}/{{pageCount(ticketList)}}页 -->
        <span class="page-info">{{
          $t('Dict.PageStyle.Text1', {length: ticketList.length, currentPage: currentPage, totalPage: pageCount(ticketList)})
          }}</span>
        <button href="javascript:;" class="prev" @click="upPage">
          <i class="el-icon-arrow-up"></i>
        </button>
        <button href="javasctipt:;" class="next" @click="downPage(ticketList)">
          <i class="el-icon-arrow-down"></i>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import PageMixin from "@/common/util/PaginationMixin";
export default {
  mixins: [PageMixin],
  data() {
    return {
      prePageSize: 2
    };
  },
  props: {
    ticketList: {
      type: Array
    }
  },
  computed: {
    showList() {
      return this.pagination(
        this.currentPage,
        this.prePageSize,
        this.ticketList
      );
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.container {
  width: 100%;
  margin: 0 auto;
  > .per-ticket-content {
    height: 120px;
    > .ticket-name {
      width: 200px;
      height: 40px;
      margin: 0 auto;
      padding-left: 15px;
      margin-top: 15px;
      border-bottom: 1px dashed #fff;
      border-radius: 0 0 10px 10px;
      color: #fff;
      line-height: 40px;
      font-size: 12px;
    }

    > .ticket-info {
      width: 200px;
      height: 60px;
      margin: 0 auto;
      color: #fff;
      padding-left: 15px;
      border-radius: 10px 10px 0 0;
      > .ticket-money-remark {
        height: 40px;
        line-height: 40px;
        display: flex;
        justify-content: center;

        > .ticket-money {
          font-weight: bold;
          // flex: 1;
        }
        // > .ticket-remark {
        //   flex: 1;
        //   font-size: 12px;
        //   color: #000;
        // }
      }

      > .ticket-date {
        height: 20px;
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

