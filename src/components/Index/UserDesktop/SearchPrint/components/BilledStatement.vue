<template>
  <div class="wraper billed-statement">
    <div class="content" ref="tableContent">
      <el-table
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column
          prop="number"
          :label="$t('Dict.SerialNumber')"
          width="80">
        </el-table-column>
        <el-table-column
          prop="data2"
          :label="$t('Biz.Order.SerialNum')"
          width="200">
          <template slot-scope="scope">
            <span class="orange">{{scope.row.data1}}</span>
            <br>
            <span class="green">{{scope.row.data2}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="data3"
          :label="$t('Biz.UserDesktop.SearchPrint.BilledStatementTL3')"
          width="140">
        </el-table-column>
        <el-table-column
          prop="data4"
          :label="$t('Dict.EatPersonNum')"
          width="100">
        </el-table-column>
        <el-table-column
          v-if="deskPageBaseInfo.isUseSeat"
          prop="tableQty"
          :label="$t('Dict.EatSeat')"
          width="100">
        </el-table-column>
        <el-table-column
          prop="data8"
          :label="$t('Dict.AmountReceivable')"
          width="160">
        </el-table-column>
        <el-table-column
          prop="data12"
          :label="$t('Dict.PreferentialAmount')"
          width="100">
        </el-table-column>
        <el-table-column
          prop="data13"
          :label="$t('Dict.RealPaidAmount')"
          width="150">
        </el-table-column>
        <el-table-column
          prop="data19"
          :label="$t('Biz.UserDesktop.SearchPrint.BilledStatementTL8')"
          width="140">
        </el-table-column>
        <el-table-column
          prop="data20"
          :label="$t('Biz.Booking.Operator01')"
          width="120">
        </el-table-column>
        <el-table-column
          prop="data21"
          :label="$t('Dict.SettlingTime')"
          width="200">
        </el-table-column>
        <el-table-column
          prop="data31"
          :label="$t('Biz.UserDesktop.SearchPrint.BilledStatementTL11')"
          width="140">
        </el-table-column>
        <el-table-column
          prop="data24"
          :label="$t('Biz.UserDesktop.SearchPrint.BilledStatementTL12')"
          width="100">
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('Dict.Operation')"
          :width="optionsLabelWidth">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">{{$t('Dict.See')}}</el-button>
            <el-button type="text" size="small" @click="demo(scope.row)">{{$t('Biz.UserDesktop.SearchPrint.BilledStatementBtn2')}}</el-button>
            <el-button type="text" size="small" @click="updateIncoice()">{{$t('Biz.UserDesktop.SearchPrint.BilledStatementBtn3')}}</el-button>
            <!--<el-button type="text" size="small" @click="confirmPrint(scope.row)">{{$t('Biz.UserDesktop.SearchPrint.BilledStatementBtn4')}}</el-button>-->
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer">
      <Pagination
        :total="total"
        :limit="limit"
        @handleChangePage="handleChangePage"
        :page="page">
      </Pagination>
    </div>
    <Detail @printBill="confirmPrint" showPrint="true" ref="detail"></Detail>
    <BilledCompInvoicModal
      ref="billedCompInvoicModal"
      @refreshTList="getTList"/>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Detail from './BilledStatementComponents/Detail';
import BilledCompInvoicModal from './BilledStatementComponents/BilledCompInvoicModal';
import Pagination from '../../base/Pagination';

export default {
  components: {
    Pagination,
    Detail,
    BilledCompInvoicModal,
  },
  data() {
    return {
      tableData: [
        {
          number: '3', // 序号
          bsId: 'YY00203-190704-0004', // 营业流水号
          tableName: '111', // 客位名称/牌号
          peopleNum: '111', // 就餐人数
          payNum: '111', // 应收金额
          offerNum: '111', // 优惠金额
          actualNum: '111', // 实收金额
          operationPos: '快餐模式', // 操作pos
          operationPeople: '米斯塔', // 操作员
          settleTime: '2019-02-28 12:13:24', // 结算时间
          billSign: '否', // 开票标志
          printNum: '5', // 打印次数
        },
      ],
      total: 0,
      limit: 10,
      page: 1,
      debounceFn: null,
      startDate: null,
      endDate: null,
      isSearching: false,
      operator: '',
      isPrintSettlemtBillUseLoginPos: false, // 是否开启 登录pos补打结账单
    };
  },
  computed: {
    ...mapGetters(['deskPageBaseInfo']),
    optionsLabelWidth() {
      if (Vue.config.lang === 'enUS') {
        return '550';
      }
      return '300';
    },
  },
  mounted() {
    // 自适应窗口
    this.initEventListener();
    this.getsysSetting();
    if (this.$route.params.mountedNum === 1) {
      this.startDate = localStorage.getItem('headerStartDate');
      this.endDate = localStorage.getItem('headerEndDate');
      this.operator = localStorage.getItem('headerOperator');
      this.$nextTick(() => {
        this.getTList(true);
      });
    }
    // 监听Header组件发来的消息 来更新列表
    this.$vonce('searchForBilledStatement', (data) => {
      this.startDate = data.startDate;
      this.endDate = data.endDate;
      this.operator = data.operator;
      this.$nextTick(() => {
        this.getTList(true);
      });
    });
  },
  destroyed() {
    window.removeEventListener('resize', this.debounceFn, false);
    this.$vonce('searchForBilledStatement', () => {});
  },
  methods: {
    // 补开发票
    demo(row) {
      this.$refs.billedCompInvoicModal.open({
        rowData: row,
      });
    },
    // 同步电子发票状态
    updateIncoice() {
      ajax('canyin.pos.fillininvoice.updateinvoice', {
        contentType: 'URLEncoded',
        data: {},
      }).then(() => {
        this.$message.success(this.$t('Biz.UserDesktop.SearchPrint.BilledStatementBtn3'));
      });
    },
    // 获取补打结账单设置
    getsysSetting() {
      ajax('canyin.desktop.a11.getsyssetting', {
        contentType: 'URLEncoded',
        data: {},
      }).then((data) => {
        this.isPrintSettlemtBillUseLoginPos = data.isPrintSettlemtBillUseLoginPos === '1';
      });
    },
    // 补打结账单 弹窗
    confirmPrint(row) {
      if (this.isPrintSettlemtBillUseLoginPos) {
        this.$confirm('是否执行补打结账单操作？', '提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '当前pos打印',
          cancelButtonText: '结算pos打印',
        })
          .then(() => {
            this.print(row, '1');
          })
          .catch((action) => {
            console.info(action);
            if (action === 'cancel') {
              this.print(row, '0');
            }
          });
      } else {
        this.print(row, '0');
      }
    },
    // 补打结账单
    print(row, posType) {
      const data = {
        posId: row.posId,
        bsId: row.data0,
        styleType: 1,
        make: true,
        useloginPos: posType,
      };
      ajax('canyin.pos.printsettle.getsettleprintdatadefault', {
        contentType: 'paramsEncoded', // paramsEncoded URLEncoded
        data,
      }).then((res) => {
        console.log(res);
      });
    },
    initEventListener() {
      this.debounceFn = debounce(() => {
        this.page = 1;
        this.getTList();
      }, 500);
      window.addEventListener('resize', this.debounceFn, false);
    },
    handleClick(row) {
      this.$refs.detail.open({
        rowData: row,
      });
    },
    handleChangePage(page) {
      this.page = page;
      this.getTList();
    },
    getTList(refresh = false) {
      if (refresh) {
        this.page = 1;
      }
      if (this.$refs.tableContent) {
        this.limit = Math.floor(this.$refs.tableContent.clientHeight / 65);
      }
      ajax('canyin.desktop.a11.a11', {
        contentType: 'URLEncoded',
        data: {
          limit: this.limit,
          page: this.page,
          startDate: this.startDate,
          endDate: this.endDate,
          state: 1,
          operator: this.operator,
        },
      }).then((res) => {
        this.isSearching = false;
        this.total = res.total;
        res.list.forEach((item, index) => {
          item.number = (this.page - 1) * this.limit + 1 + index; // 序号
        });
        this.tableData = res.list;
      });
    },
    // 格式化时间
    formatDate() {
      // 数字不足两位，在前面补0
      const addZero = (num) => {
        const str = `${num}`;
        if (str.length === 1) return `0${str}`;
        return str;
      };
      // 转为正常时间字符串
      const date = new Date();
      const year = date.getFullYear();
      const month = addZero(date.getMonth() + 1);
      const day = addZero(date.getDate());
      return `${year}-${month}-${day}`;
    },
  },
};
</script>

<style lang="less" scoped>
  .wraper {
    display: flex;
    flex-direction: column;
    padding-bottom: 100px;
    height: 100%;
    .content {
      height: 100%;;
    }
    .footer {
      position: relative;
      overflow: hidden;
      height: 60px;
      .page-context {
        position: absolute;
        left: 8px;
        top: 25px;
      }
    }
  }
  .green {
    color: #039eac;
  }
  .orange {
    color: orange;
  }
</style>
<style lang="less">
  .billed-statement .el-table .cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
</style>
