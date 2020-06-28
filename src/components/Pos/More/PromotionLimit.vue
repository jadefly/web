
<template>
  <Dialog
    name="PosDialog.PromotionLimit"
    title="查看促销限量"
    ref="dialog"
    width="572px"
    height="624px"
    :append-to-body="isNest"
    @open="onOpen"
    @close="onClose"
    class="promotion-limit"
  >
    <div class="main-box">
      <div class="item-content">
        <p class="table-head">
          <span>序号</span>
          <span>品项</span>
          <span>当前可售数量/每日促销总数</span>
        </p>
        <ul id="promotionitemListBox">
          <li v-for="(item,index) in items" :key="index">
            <span>{{index+1}}</span>
            <span>{{ item.itemSizeId !=='-1' ? `(${item.sizeName})` : ''}}{{ item.itemName }}</span>
            <span>{{ item.restQuantity }}</span>
            <span>/</span>
            <span>{{ item.dailyLimitQuantity }}</span>
            <span v-show="item.isVip" class="is-vip">会员专享</span>
          </li>
        </ul>
        <div class="pager-box">
          <span class="items-total">共{{items.length}}条，</span>
          <Pager
            pagerId="promotionitemListBox"
            itemTag="li"
            :showInfo = "true"
            arrowDirection="up-down"
            ref="promotionPage"
          >
          </Pager>
        </div>
      </div>
    </div>

  </Dialog>
</template>
<script>
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Dialog from '@/components/Pos/Common/Dialog';
import Pager from '@/components/Pos/Common/Pager';
/*
注:
choiceSize 是点击确定 submit 回调的公共方法 回调的参数是被选中的进行数据修改完的规格品项数据
* */
export default {
  props: {
    isNest: {
      type: Boolean,
      default: true,
    },
  },
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      items: [],
    };
  },
  methods: {
    onOpen() {
      this.items = this.resData;
      setTimeout(() => {
        this.$refs.promotionPage.refresh();
      }, 0);
    },
    onClose() {
      this.items = [];
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
em, i {
  font-style: normal;
}
.main-box {
  padding: 10px;
}
.item-content {
  background-color: #fff;
  .table-head {
    height: 36px;
    line-height: 36px;
    border-bottom: 1px solid #ccc;
    color: #666666;
    span {
      padding: 0px 0px;
      display: inline-block;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      &:nth-child(1) {
        width: 12%;
      }
      &:nth-child(2) {
        width: 32%;
      }
      &:nth-child(3) {
        width: 38%;
        text-align: center;
      }
    }
  }
  ul{
    height: 470px;
    overflow: hidden;
    li{
      height: 47px;
      line-height: 47px;
      border-bottom: 1px solid #ccc;
      span {
        display: inline-block;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        padding:0px 5px;
        &:nth-child(1) {
          width: 12%;
        }
        &:nth-child(2) {
          width: 38%;
        }
        &:nth-child(3) {
          width: 14%;
          text-align: right;
        }
        &:nth-child(5) {
          width: 14%;
          text-align: left;
        }
      }
      .is-vip {
        margin-bottom: 8px;
        height: 30px;
        line-height: 30px;
        background-color: #ffce00;
        border-radius: 20px;
        color: #603813;
        white-space: nowrap;
        overflow: hidden;
        padding: 0px 10px;
      }
    }
  }
}
.pager-box {
    height: 42px;
    padding: 4px 0px;
    .items-total {
      position: absolute;
      right: 168px;
      bottom: 22px;
      font-size: 12px;
    }
    .pos-pager {
      width: 157px;
      float: right;
    }
}
</style>
