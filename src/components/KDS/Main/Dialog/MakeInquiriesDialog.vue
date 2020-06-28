<template>
  <Dialog
    :title="`${$route.query.loginMode === '0' ? '制作' : '传菜'}查询`"
    name="PosDialog.MakeInquiriesModal"
    ref="dialog"
    @open="onOpen"
    width="780px"
    height="635px"
    top="8vh"
    :hotkeys="hotKeySet"
  >
    <div class="make-wrapper">
      <div class="tabs">
        <div class="tab"
             :class="{'tab-active' : activeName === 'all'}"
             @click="clickTabs('all')"
        >全部</div>
        <div class="tab"
             :class="{'tab-active' : activeName === tab.empId}"
             v-for="tab in tabsData"
             :key="tab.empId"
             @click="clickTabs(tab.empId)"
        >{{tab.empName}}</div>
      </div>
      <div class="padding10">
        <table class="ul-title">
          <tr class="row">
            <td class="no">序号</td>
            <td class="table">客位/牌号</td>
            <td class="person">{{$route.query.loginMode === '0' ? '厨师' : '传菜员'}}</td>
            <td class="item">品项名称</td>
            <td class="num">数量</td>
            <td class="time">{{$route.query.loginMode === '0' ? '制作' : '传菜'}}时间</td>
          </tr>
        </table>
      </div>
      <Paging
        slot="list"
        ref="dishes"
        :itemWidth="760"
        :itemHeight="37"
        :usePropSize="true"
        class="ul-list"
        :data="tableData">
        <table class="content" slot-scope="props" :item="props.item">
          <tr>
            <td class="no">{{props.index + 1}}</td>
            <td class="table">{{props.item.pointName}}</td>
            <td class="person">{{$route.query.loginMode === '0' ? props.item.cookEmpName : props.item.serveEmpName}}</td>
            <td class="item">{{props.item.itemName}}</td>
            <td class="num">{{props.item.lastQty}}</td>
            <td class="time">{{dateFormat('%Y-%M-%D %H:%I:%S', new Date(props.item.cookFinishTime)) }}</td>
          </tr>
        </table>
      </Paging>
      <PagingBtn
          class="pager-btn"
          ref="dishesBtn"
      ></PagingBtn>
      <div class="footer">
        <div class="total">汇总：制作数 {{tableData.length}} 制作客位/牌号总数 {{tabsData.length}}</div>
        <Search
            ref="kdsMakeSearch"
            @search="onSearch"
            :resultLength="tableData.length"
        ></Search>
      </div>
    </div>

  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Search from '@/components/Pos/More/LimitQuantity/LimitSearch';
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';
import { includes } from 'lodash';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';

export default {
  components: {
    Dialog, Search, dateFormat, Paging, PagingBtn,
  },
  mixins: [DialogMixin],
  props: {
  },
  data() {
    return {
      dateFormat,
      activeName: 'all',
      tableData: [],
      originalData: [],
      searchText: '',
      checked: [],
      tabsData: [],
    };
  },
  computed: {
    hotKeySet() {
      return {
        Esc: () => {
          this.close();
        },
      };
    },
  },
  watch: {
    searchText(n, o) {
      if (n && n !== o) {
        this.tableData = this.tableData.filter(item => includes(item.pointName, n));
      } else {
        this.clickTabs(this.activeName);
      }
    },
  },
  mounted() {
  },
  methods: {
    onOpen() {
      const { posId, loginMode } = this.$route.query;
      let url = '';
      if (loginMode === '0') {
        url = 'canyin.kitchen.kitchenhis.selectkitchenhiscook';
      }
      if (loginMode === '1') {
        url = 'canyin.kitchen.kitchenhis.selectkitchenhisserve';
      }
      ajax(url, {
        contentType: 'json',
        data: { posId },
      }).then((data) => {
        this.tableData = data.kitchenItemHisInfoList || [];
        this.originalData = data.kitchenItemHisInfoList || [];
        const temp = [];
        this.tableData.forEach((item) => {
          if (loginMode === '0') {
            temp.push({ empId: item.cookEmpId, empName: item.cookEmpName });
          } else {
            temp.push({ empId: item.serveEmpId, empName: item.serveEmpName });
          }
        });
        this.tabsData = _.uniqWith(temp, _.isEqual);
      });
      this.$refs.dishesBtn.bind(this.$refs.dishes);
    },
    clickTabs(label) {
      this.activeName = label;
      if (label === 'all') {
        this.tableData = this.originalData;
      } else {
        this.tableData = this.originalData.filter(item => item.cookEmpId === label);
      }
    },
    onSearch(searchText) {
      // this.$refs.kdsRevokeList.top();
      this.searchText = searchText;
      this.checked = [];
    },
    // 显示客位/牌号
    content(item) {
      let str = '';
      if (item.pointAreaId === '9') {
        str = `${this.getSaleTypeText(item.saleTypeId)}：${item.orderCode}`;
      } else if (item.pointAreaId === '10') {
        str = `${item.deFromName}：${item.sn}`;
      } else if (item.sourcePointName) {
        str = `${item.sourcePointName}→${item.pointName}`;
      } else {
        str = item.pointName;
      }
      return str;
    },
    getSaleTypeText(type) {
      if (type === 3) {
        return '外卖';
      }
      if (type === 2) {
        return '外带';
      }
      return '牌号';
    },
  },
};
</script>

<style lang="less" scoped>
.make-wrapper {
  width: 100%;
  height: calc(100%);
  background-color: white;
  position: relative;
  .tabs{
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    width: 100%;
    height: 48px;
    padding: 12px 12px 0;
    border-bottom: 1px solid rgb(215, 215, 215);
    .tab{
      font-size: 14px;
      width: 40px;
      height: 30px;
      text-align: center;
    }
    .tab-active{
      border-bottom: 2px #0e9ad6 solid;
      color: #0e9ad6;
    }
  }
  .padding10{
    padding: 0 10px;
  }
  .ul-list{
    padding: 0 10px;
    height: 410px;
  }
  .ul-title{
    width: 100%;
    font-weight: bold;
    border-top: 1px solid #cacaca;
    .row{
      height: 37px;
    }
    .no{
      width: 5%;
    }
    .table{
      width: 10%;
    }
    .person{
      width: 10%;
    }
    .item{
      width: 45%;
    }
    .num{
      width: 10%;
    }
    .time{
      width: 20%;
    }
  }
  .content{
    .ul-title;
    font-weight: unset;
    width: 100%;
    height: 37px;
    .row{
      height: 20px;
      padding: 10px;
    }
  }
  .bottomTip{
    position: absolute;
    bottom: 60px;
    left: 12px;
  }
  .footer{
    position: absolute;
    bottom: 0;
    left: 12px;
    height: 80px;
    .total{
      font-weight: bold;
    }
  }
  .pager-btn{
    position: absolute;
    right: 20px;
    bottom: 10px;
  }
}
</style>

<style lang="less">
  .limitsearch > label{
    top: unset !important;
    left: 20px !important;
  }
</style>
