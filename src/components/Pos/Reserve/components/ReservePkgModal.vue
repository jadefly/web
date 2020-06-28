<template>
  <Dialog
    name="PosDialog.ItemQueryModal"
    :title="$t('Biz.Reserve.AbnormalDetails')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="535px"
  >
    <div class="item-table">
      <div class="table-head">
        <table>
          <tr>
            <th class="code-col">{{$t('Dict.Code')}}</th>
            <th class="item-col">{{$t('Dict.Item')}}</th>
            <th class="bill-col">{{$t('Dict.AbnormalReason')}}</th>
          </tr>
        </table>
      </div>
      <div class="table-body" ref="listwarp">
        <table>
          <tr v-for="item in currentReasonList" :key="item.scId">
            <td class="code-col">{{item.itemCode}}</td>
            <td class="item-col">
              {{item.itemName}}
            </td>
            <td class="bill-col">
              {{item.errMessage}}
            </td>
          </tr>
        </table>
        <div class="no-item" v-if="currentReasonList && currentReasonList.length === 0">
          <p>{{$t('Biz.Reserve.NoAbnormalItems')}}</p>
        </div>
      </div>
    </div>
    <div class="page-area">
      <div class="pos-pager pos-takeout-pager">
        <span class="page-info">{{
          $t('Dict.PageStyle.Text1', {
            length: currentReasonList.length,
            currentPage: currentPage,
            totalPage: pageCount
          })
        }}</span>
        <button href="javascript:;" class="prev" @click="upPage">
          <i class="el-icon-arrow-up"></i>
        </button>
        <button href="javasctipt:;" class="next" @click="downPage">
          <i class="el-icon-arrow-down"></i>
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationScrollMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      // 显示品项列表
      currentReasonList: [],
    };
  },
  computed: {
  },
  methods: {
    onOpen() {
      this.$nextTick(() => {
        this.setPageInfo(this.$refs.listwarp);
      });
      this.currentReasonList = [];
      setTimeout(() => {
        this.currentReasonList = this.resData;
      }, 100);
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

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

  // 选择原因区域
  .search-area{
    padding: 20px 14px;
    background-color: @white;
    button.btn{
      width: 100%;
      height: 40px;
    }
  }

  // 中间table
  .item-table{
    background-color: @white;
    padding: 0 16px;
    padding-top: 20px;
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
      th {
        font-size: 12px;
        line-height: 1.1;
      }
      th+th{
        border-left: 1px solid @white;
      }
    }
    .table-body{
      margin-top: 6px;
      color: @gray-dark;
      height: 386px;
      overflow: auto;
      td{
        font-size: 12px;
        line-height: 3;
      }
      tr{
        border-bottom: 1px solid #7bcad6;
      }
    }
    .pay-status{
      border-radius: 12px;
      padding: 3px 6px;
      color: @white;
    }
    .already-pay{
      background-color: #86c721;
    }
    .not-pay{
      background-color: #ff381d;
    }
    .code-col{
      width: 12%;
    }
    .item-col{
      width: 44%;
      > em {
        font-style: normal;
      }
    }
    .count-col{
      width: 8%;
    }
    .addmenu-col{
      width: 16%;
      word-wrap: break-word;
      &.specialLineHeight {
        line-height: 1.5;
      }
    }
    .table-col{
      width: 19%;
      > span {
        display: inline-block;
        overflow: hidden;
        height: 3em;
      }
      &.specialLineHeight {
        line-height: 1.5;
      }
    }
  }

  .no-item{
    text-align: center;
    font-size: 14px;
    color: #999999;
    padding-top: 20px;
  }

  // 原因搜索区域
  .page-area{
    overflow: hidden;
    background-color: @white;
    padding: 8px 14px;
    .search-input{
      width: 208px;
    }
    .page-info{
      font-size: 12px;
    }
  }
</style>
