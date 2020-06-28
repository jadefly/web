<template>
  <Dialog
    name="PosDialog.KVSQueryModal"
    :title="$t('Biz.Pos.MoreModuleSpan5')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="535px"
  >
  <div class="item-table">
    <div class="table-head">
      <table>
        <tr>
          <th class="item-col">{{$t('Dict.Item')}}</th>
          <th class="pottime-col">{{$t('Biz.Pos.More.KVSQModalTh2')}}</th>
          <th class="count-col">{{$t('Dict.Amount')}}</th>
          <th class="pottime-col">{{$t('Biz.Pos.More.KVSQModalTh4')}}</th>
          <th class="count-col">{{$t('Dict.Amount')}}</th>
        </tr>
      </table>
    </div>
    <div class="table-body">
      <table>
        <tr v-for="item in showItemList" :key="item.itemId">
          <td class="item-col">{{item.itemName}}</td>
          <td class="pottime-col">{{item.firstSteamerTime}}</td>
          <td class="count-col">{{item.firstSteamerQty}}</td>
          <td class="pottime-col">{{item.secondSteamerTime}}</td>
          <td class="count-col">{{item.secondSteamerQty}}</td>
        </tr>
      </table>
    </div>
  </div>
  <div class="page-area">
    <div class="pos-pager pos-takeout-pager">
      <span class="page-info">{{
        $t('Dict.PageStyle.Text1', {
          length: allItemList.length,
          currentPage,
          totalPage: pageCount(allItemList),
        })
      }}</span>
      <button href="javascript:;" class="prev" @click="upPage"><i class="el-icon-arrow-up"></i></button>
      <button href="javasctipt:;" class="next" @click="downPage(allItemList)"><i class="el-icon-arrow-down"></i></button>
    </div>
  </div>
  </Dialog>
</template>

<script>
import _ from 'lodash';

import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';
import { MessageBox } from 'element-ui';

export default {
  components: { Dialog },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      // 品项列表
      allItemList: [],
      // 每页个数
      prePageSize: 8,
    };
  },
  computed: {
    // 最终显示的服务员列表
    showItemList() {
      return this.pagination(this.currentPage, this.prePageSize, this.allItemList);
    },
  },
  methods: {
    onOpen() {
      ajax('canyin.pos.querykvsinfo.querykvsinfoview')
        .then((data) => {
          this.allItemList = data.kvsMakingInfoList;
        })
        .catch((code, msg) => {
          this.close();
          MessageBox.alert(msg, this.$t('Dict.WrongInfo'));
        });
    },
    search() {
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

// 中间table
.item-table{
  background-color: @white;
  padding: 10px 16px;
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
    margin-top: 4px;
    color: @gray-dark;
    height: 306px;
    td{
      font-size: 12px;
      line-height: 3;
    }
    tr{
      border-bottom: 1px solid #7bcad6;
    }
  }
  .item-col{
    width: 32%;
    font-weight: bold;
  }
  .count-col{
    width: 14%;
  }
  .pottime-col{
    width: 20%;
  }
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
