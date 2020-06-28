<template>
<Dialog
  name="PosDialog.About"
  title="更新详情"
  ref="dialog"
  width="550px"
  height="520px"
  @open="onOpen"
>
  <div class="update-table">
    <div class="table-head">
      <table>
        <tr>
          <th class="order-col">序号</th>
          <th class="num-col">数据包编号</th>
          <th class="name-col">模块名称</th>
          <th class="time-col">更新时间</th>
        </tr>
      </table>
    </div>
    <div class="table-body" ref="scrollContent">
      <table>
        <tr
          v-for="(item,index) in dataList"
          :key="item.key">
          <td class="order-col noBorder">{{index+1}}</td>
          <td class="num-col">{{item.planId}}</td>
          <td class="name-col">{{item.archivesName}}</td>
          <td class="time-col">{{item.modifyTime ? dateFormat('%Y-%M-%D %H:%I', new Date(item.modifyTime)) : '暂无更新时间'}}</td>
        </tr>
      </table>
      <div class="no-item" v-if="dataList.length <= 0">
        <p>暂无更新详情</p>
      </div>
    </div>
    <div class="search-area">
      <el-input
        v-judge
        class="search-input"
        placeholder="输入模块名称进行搜索"
        prefix-icon="el-icon-search"
        v-model="keyword">
      </el-input>
    </div>
    <div class="pos-pager pos-takeout-pager">
      <span class="page-info">
        {{$t('Dict.PageStyle.Text1', {length: totalListNum, currentPage: currentPageNum, totalPage: allPageNum,})}}
      </span>
      <button href="javascript:;" class="prev" @click="upPage">
        <i class="el-icon-arrow-up"></i>
      </button>
      <button href="javasctipt:;" class="next" @click="downPage">
        <i class="el-icon-arrow-down"></i>
      </button>
    </div>
    <p class="clearFloat"></p>
  </div>
</Dialog>
  </template>
<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { mapGetters } from 'vuex';
import dateFormat from '@/common/js/dateformat';
import ajax from '@/common/js/ajax';

export default {
  data() {
    return {
      dateFormat,
      scrollTop: 0,
      offset: 370,
      dataList: [],
      totalListNum: 0,
      everyPageListNum: 10,
      currentPageNum: 1,
      allPageNum: 0,
      keyword: '',
      searchList: [],

    };
  },
  watch: {
    keyword(n, o) {
      if (n && n != o) {
        const results = [];
        this.searchList.forEach((item) => {
          if (item.archivesName.indexOf(n) != -1) {
            results.push(item);
          }
        });
        this.dataList = results;
        this.totalListNum = results.length;
        this.computeListPagerData(false);
      } else if (n === '') {
        this.dataList = this.searchList;
        this.totalListNum = this.dataList.length;
        this.computeListPagerData(false);
      }
    },
  },
  computed: {
    ...mapGetters([
      'getVuexPosMode',
    ]),
  },
  components: { Dialog },
  mixins: [DialogMixin],
  methods: {
    onOpen() {
      this.getDataList();
    },
    getDataList() {
      ajax('canyin.desktop.userdesktop.getarchivesupdatetime', {}).then((data) => {
        this.dataList = data;
        this.searchList = data;
        this.totalListNum = data.length;
        this.computeListPagerData(false);
      });
    },
    upPage() {
      if (!(this.currentPageNum <= 1)) {
        // 减页码
        this.currentPageNum -= 1;
        if (this.scrollTop < this.offset) return;
        this.scrollTop -= this.offset;
        this.$refs.scrollContent.scrollTop = this.scrollTop;
      }
    },
    downPage() {
      if (!(this.currentPageNum >= this.allPageNum)) {
        // 加页码
        this.currentPageNum += 1;
        if ((this.scrollTop + this.$refs.scrollContent.clientHeight) > this.$refs.scrollContent.scrollHeight) {
          return;
        }
        this.scrollTop += this.offset;
        this.$refs.scrollContent.scrollTop = this.scrollTop;
      }
    },
    // 分页数据计算
    computeListPagerData(isTurnPage) {
      // 总页数
      this.allPageNum = Math.ceil(this.totalListNum / this.everyPageListNum);
      // 当前页数: 如果不是翻页, 重置页码
      if (!isTurnPage) {
        this.currentPageNum = 1;
        this.$refs.scrollContent.scrollTop = 0;
      }
    },
  },
};
</script>

  <style lang="less" scoped>
    @import "~@/common/less/variables.less";
    @import "~@/common/less/mixins.less";

    .update-table {
      overflow: hidden;
      height: 100%;
      position: relative;
      background: white;
      padding: 10px 16px;
      .clearFloat {
        clear: both
      }
      table {
        width: 100%;
      }
      th,
      td {
        padding-left: 6px;
        font-weight: normal;
      }
      .table-head {
        padding: 4px 0;
        background-color: #7bcad6;
        color: @white;
        th {
          font-size: 12px;
          line-height: 1.1;
        }
        th + th {
          border-left: 1px solid @white;
        }
      }
      .table-body {
        overflow: hidden;
          margin-top: 6px;
          color: @gray-dark;
          /*border-bottom: 1px solid #c2c2c2;*/
          height: 370px;
          td {
            font-size: 12px;
            line-height: 3;
            padding-left: 0;
        }
        tr {
          border-bottom: 1px solid #B5B5B5;
        }
      }
      .num-col {
        width: 7%;
        font-weight: bold;
      }
      .name-col {
        width: 22%;
        overflow: hidden;

      }
      .order-col{
        width: 3%;
        font-weight: bold;
      }
      .time-col {
        width: 10%;
      }
    }
    .no-item {
      text-align: center;
      font-size: 14px;
      color: #999999;
      padding-top: 20px;
      color: #0babb9;
    }

    .search-area{
      position: absolute;
      left: 10px;
      bottom: 10px;
      .search-input{
        width: 200px;
      }
    }
    // 箭头按钮
    .pos-takeout-pager {
      position: absolute;
      right: 16px;
      bottom: 10px;
      .page-info{
        font-size:12px;
        font-weight:400;
        color: #666666;
      }
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
