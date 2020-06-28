<template>
  <Dialog
    name="PosDialog.TransferRoomAccount"
    :title="$t('Biz.Settlement.ExtTransAccount')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="ration"
    :showSubmit="true"
    :append-to-body="true"
    :width="pageWidth"
    height="700px"
    top="7vh"
    bottom="0">
    <el-tabs v-model="activeName" @tab-click="toggleTabs" style="background: #ffffff">
      <el-tab-pane :label="$t('Biz.Settlement.ExtTransAccount')" name="home"></el-tab-pane>
      <el-tab-pane :label="$t('Biz.Settlement.TransferAr')" name="ar"></el-tab-pane>
    </el-tabs>
    <!-- 1000 ， 660 -->
    <div class="transferRoomAccount">
      <div class="roomAccount-title">
        <img v-if="activeName === 'home'" src="../images/TransferRoomAccount.png" class="iconImg" />
        <img v-else src="../images/transferAr.png" class="iconImg" />
        <span class="title"> {{currentTabsText}} </span>
      </div>
      <div class="roomAccount-price">{{money}}</div>
      <form action="" v-keyboard:keyboard>
        <input
          v-judge
          type="text"
          ref="roomInput"
          class="roomInput"
          v-model="roomInputCount"
          @focus="showHouseholdInfo=false"
          :placeholder="placeHolder"/>
        <button type="button" class="btn btn-primary" @click="onSearch">{{$t('Dict.Search')}}(Enter)</button>
      </form>
      <div v-show="!showHouseholdInfo" class="ration-keyboard">
        <KeyBoard ref="keyboard"></KeyBoard>
      </div>
      <div
        v-if="showHouseholdInfo && !tempFalse" class="householdInfo">
        <table class="tableInfo" v-if="homeOrder">
          <thead>
          <tr>
            <th
              v-for="(item, index) in homeOrderTableThead"
              :key="index"
              :style="{width: item.width+'px'}"
            >
              {{item.text}}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
             v-for="(item, index) in homeTableData"
             :key="index"
             v-if="index>=startIndex && index<=endIndex" @click="currentRow=index"
             :class="currentRow == index ? 'active':''">
            <td>{{item.revNo}}</td>
            <td>{{item.custName}}</td>
            <td>{{item.hotelName}}</td>
            <td>{{item.checkInDate}}</td>
            <td>{{item.checkOutDate}}</td>
            <td>{{item.revType == 0 ? `${$t('Dict.Individual')}` : `${$t('Dict.Team')}`}}</td>
            <td>{{item.roomNo}}</td>
            <td>{{item.remainAmt ? (Number(item.remainAmt) * -1) : ''}}</td>
            <td>{{item.creditAmt ? item.creditAmt : ''}}</td>
            <td>{{item.mobile? item.mobile : ''}}</td>
          </tr>
          </tbody>
        </table>
        <table class="tableInfo" v-if="AROrder">
          <thead>
          <tr>
            <th
              v-for="(item, index) in AROrderTableThead"
              :key="index" :style="{width: item.width+'px'}"
            >{{item.text}}</th>
          </tr>
          </thead>
          <tbody>
          <tr
           v-for="(item, index) in ARTableData" :key="index" v-if="index>=startIndex && index<=endIndex"
           @click="currentRow=index" :class="currentRow == index ? 'active':''">
            <td>{{item.code}}</td>
            <td>{{item.name}}</td>
            <td>{{item.hotelName}}</td>
            <td>{{item.typeName}}</td>
            <td>{{item.maxAmount}}</td>
            <td>{{item.balance}}</td>
            <td>{{item.excess}}</td>
            <td>{{item.summary}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div v-if="showHouseholdInfo && !tempFalse" class="pos-pager">
        <span>{{
          $t('Dict.PageStyle.Sim1', {
            currentPage: pagerState.current,
            totalPage: pagerState.total,
          })
        }}</span>
        <button type="button" class="pager-btn" @click="prev" :disabled="pagerState.current <= 1">
          <i class="icon icon-pager-up"></i>
        </button>
        <button
          @click="next"
          type="button"
          class="pager-btn"
          :disabled="pagerState.current >= pagerState.total">
          <i class="icon icon-pager-down"></i>
        </button>
      </div>
      <div class="noInfo" v-if="showHouseholdInfo && tempFalse">{{$t('Biz.Settlement.SearchNothing')}}</div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
  },
  data() {
    return {
      showHouseholdInfo: false, // 酒店住户信息
      roomInputCount: '', // 用户输入的搜索信息
      money: 0, // 用户需支付金额
      currentRow: '', // 当前用户选中的信息下标
      pagerState: { // 页数：当前页、总页数
        current: 1,
        total: 1,
      },
      currentPageCount: 1, // 当前是第几页 默认第一页
      onlyPageCount: 8, // 一页显示几条
      startIndex: 0, // 开始下标
      endIndex: 7, // 结束下标
      pageWidth: '700px',
      homeTableData: [], // 查询的数据
      ARTableData: [], // 查询的数据
      homeOrderTableThead: [ // 表头
        {
          text: `${this.$t('Biz.Settlement.AccountNumber')}`,
          width: '105',
        },
        {
          text: `${this.$t('Dict.GuestName2')}/${this.$t('Dict.TeamName')}`,
          width: '100',
        },
        {
          text: `${this.$t('Dict.HotelName')}`,
          width: '150',
        },
        {
          text: `${this.$t('Biz.Settlement.CheckInDate')}`,
          width: '100',
        },
        {
          text: `${this.$t('Biz.Settlement.DepartureDate')}`,
          width: '100',
        },
        {
          text: `${this.$t('Dict.Category')}`,
          width: '60',
        },
        {
          text: `${this.$t('Dict.RoomNumber')}`,
          width: '100',
        },
        {
          text: `${this.$t('Dict.Balance')}`,
          width: '120',
        },
        {
          text: `${this.$t('Dict.Credit')}`,
          width: '120',
        },
        {
          text: `${this.$t('Dict.PhoneNumber')}`,
          width: '120',
        },
      ],
      AROrderTableThead: [ // 表头
        {
          text: `${this.$t('Biz.Settlement.ArAccount')}`,
          width: '105',
        },
        {
          text: `${this.$t('Dict.AccountName')}`,
          width: '150',
        },
        {
          text: `${this.$t('Dict.HotelName')}`,
          width: '150',
        },
        {
          text: `${this.$t('Biz.Settlement.AccountTypeReceivable')}`,
          width: '100',
        },
        {
          text: `${this.$t('Dict.Credit')}`,
          width: '100',
        },
        {
          text: `${this.$t('Dict.AmountOfAccount')}`,
          width: '100',
        },
        {
          text: `${this.$t('Biz.Settlement.RemainingAmount')}`,
          width: '100',
        },
        {
          text: `${this.$t('Dict.Remarks')}`,
          width: '120',
        },
      ],
      tempFalse: false, // 临时代替暂无查询信息
      homeOrder: true, // 转房账页
      AROrder: false, //  转AR账页
      activeName: 'home', // 当前标签页 默认转房账
      currentTabsText: `${this.$t('Biz.Settlement.TransferAccountAmount')}`,
      placeHolder: `${this.$t('Biz.Settlement.EnterRoomOrTeamNumber')}`,
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
    // 添加快捷键
    ration() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        Enter: () => {
          this.$refs.roomInput.blur();
          this.onSearch();
        },
      };
    },
  },
  methods: {
    // 标签页切换
    toggleTabs(tab) {
      const { activeName } = this;
      if (Object.is(activeName, 'home')) {
        this.currentTabsText = `${this.$t('Biz.Settlement.TransferAccountAmount')}`;
        this.placeHolder = `${this.$t('Biz.Settlement.EnterRoomOrTeamNumber')}`;
        this.homeOrder = true;
        this.AROrder = false; //  转AR账页
      } else if (Object.is(activeName, 'ar')) {
        this.currentTabsText = `${this.$t('Biz.Settlement.TransferArAmount')}`;
        this.placeHolder = `${this.$t('Biz.Settlement.EnterAccountName')}`;
        this.homeOrder = false;
        this.AROrder = true;
      }
      if (this.homeTableData.length > 0) {
        this.homeTableData = [];
      }
      if (this.ARTableData.length > 0) {
        this.ARTableData = [];
      }
      this.currentRow = '';
      this.roomInputCount = '';
      this.pagerState = {
        current: 1,
        total: 1,
      };
      this.currentPageCount = 1;
      this.tempFalse = true;
      this.showHouseholdInfo = false;
      this.pageWidth = '700px';
      setTimeout(() => {
        this.$refs.roomInput.focus();
      }, 200);
    },
    onOpen() {
      this.money = this.amountToBePaid;
      setTimeout(() => {
        this.$refs.roomInput.focus();
      }, 200);
    },
    onClose() {
      this.currentTabsText = `${this.$t('Biz.Settlement.TransferAccountAmount')}`;
      this.activeName = 'home';
      this.placeHolder = `${this.$t('Biz.Settlement.EnterRoomOrTeamNumber')}`;
      this.homeOrder = true;
      this.AROrder = false; //  转AR账页
      this.currentRow = '';
      this.roomInputCount = '';
      this.pagerState = {
        current: 1,
        total: 1,
      };
      this.currentPageCount = 1;
      this.tempFalse = true;
      this.showHouseholdInfo = false;
      this.pageWidth = '700px';
      this.money = 0;
    },
    onSubmit() {
      let bool = true;
      if (this.activeName === 'home') {
        bool = true;
      } else if (this.activeName === 'ar') {
        bool = false;
      }
      if (this.currentRow === '') {
        const msg = bool ? `${this.$t('Dict.AccountName')}` : `${this.$t('Biz.Settlement.ChooseTransferArInfo')}`;
        this.$message.warning(`${msg}`);
        return false;
      }
      this.doSubmit();
      return false;
    },
    doSubmit() {
      const index = this.currentRow;
      const payWayInfo = this.resData.payWay;
      const data = {};
      if (this.activeName === 'home') {
        Object.assign(data, {
          revNo: this.homeTableData[index].revNo,
          custId: this.homeTableData[index].custId,
          type: 0,
          hotelCode: this.homeTableData[index].hotelCode,
        });
      } else if (this.activeName === 'ar') {
        Object.assign(data, {
          arNo: this.ARTableData[index].code,
          custId: this.ARTableData[index].custId,
          type: 1,
          hotelCode: this.ARTableData[index].hotelCode,
        });
      }
      this.$emit('add-pay-way', {
        name: payWayInfo.name,
        payway_id: payWayInfo.id,
        payway_type_id: payWayInfo.payway_type_id,
        take_money: Number(this.money),
        is_confirm_delete: payWayInfo.isconfirmdelete,
        use_alone: payWayInfo.is_use_alone,
        isolpayway: payWayInfo.isolpayway,
        ...data,
      });
      this.close();
    },
    onSearch() {
      if (this.roomInputCount === '') {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning34')}`);
        return;
      }
      const data = {
        pageIndex: this.currentPageCount,
        pageSize: this.onlyPageCount,
        operator: this.posBaseInfo ? this.posBaseInfo.user.name : null,
        condition: this.roomInputCount,
      };
      if (Object.is(this.activeName, 'home')) {
        this.doSearch(data, 'bills', 'homeTableData');
      } else if (Object.is(this.activeName, 'ar')) {
        this.doSearch(data, 'arquery', 'ARTableData');
      }
    },
    doSearch(params, url, attr) {
      ajax(`canyin.pos.transRoomBill.${url}`, {
        contentType: 'URIEncoded',
        data: params,
      }).then((res) => {
        this.showHouseholdInfo = true;
        this.pageWidth = '1000px';
        this.pagerState.total = Math.ceil(res.total / this.onlyPageCount);
        if (res.rows && res.rows.length > 0) {
          this.currentRow = 0; // 默认选中第一个
          if (this[attr]) {
            // this[attr] = res.rows;
            this[attr] = res.rows;
          } else {
            console.warn(`${attr} is not defined in vm`);
          }
          this.tempFalse = false;
          if (attr === 'homeTableData') {
            this.homeOrder = true;
            this.AROrder = false; //  转AR账页
          } else {
            this.homeOrder = false;
            this.AROrder = true; //  转AR账页
          }
        } else {
          this.tempFalse = true;
          this.currentPageCount = 1;
        }
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    queryInfo() {
      console.log('queryInfo');
    },
    prev() {
      this.pagerState.current -= 1;
      this.currentPageCount -= 1;
      this.onSearch();
    },
    next() {
      this.pagerState.current += 1;
      this.currentPageCount += 1;
      this.onSearch();
    },
  },
};
</script>

<style>
    .el-tabs__item.is-top:nth-child(2) {
        margin-left: 14px;
    }
    .el-tabs__active-bar {
        margin-left: 14px;
    }
</style>

<style lang="less" scoped>
    @import "~@/common/less/variables.less";
    @import "~@/common/less/mixins.less";
    .transferRoomAccount{
        background: #fff;
        height: 91%;
        text-align: center;
        .roomAccount-title{
            text-align: center;
            font-weight: bold;
            font-size: 17px;
            padding-top: 10px;
            .iconImg{
                width: 40px;
                height: 40px;
            }
            .title{
                font-size: 24px;
            }
        }
        .roomAccount-price{
            text-align: center;
            font-size: 48px;
            font-weight: bold;
            // padding-bottom: 10px;
        }
        .roomInput{
            width: 260px;
            height: 32px;
            border-radius: 5px;
            border: 1px solid #999;
            padding: 5px;
        }
        .ration-keyboard{
            .keyboard {
                margin: auto;
                margin-top: 30px;
            }
        }
        .householdInfo{
            padding: 12px;
            height: 390px;
        }
        .tableInfo{
            border:solid #999;
            border-width:0px 1px 1px 0px;
            max-height: 365px;
            margin: 0 auto;
            th, td{
                border:solid #999;
                border-width:1px 0px 0px 1px;
            }
            thead{
                th{
                    text-align: center;
                    padding: 12px 0;
                }
            }
            tbody{
                tr{
                    height: 40px !important;
                }
                tr.active{
                    background: #039eac;
                    color: #fff;
                }
            }
        }
        .noInfo{
            height: 270px;
            line-height: 270px;
            font-size: 18px;
            font-weight: bold;
        }
    }

    @pager-info-color: #273844;
    @pager-info-font-size: 12px;
    @pager-btn-width: 50px;
    @pager-btn-bg: @pos-dialog-pager-btn-bg;
    @pager-btn-font-size: 20px;
    @pager-btn-color: #273844;

    .pos-pager {
        margin-top: 0;
        margin-bottom: 0;

        > span {
            color: @pager-info-color;
            font-size: @pager-info-font-size;
        }

        > button {
            .size(@pager-btn-width, @pos-pager-height);
            border-radius: @pos-pager-height / 2;
            background-color: @pager-btn-bg;
            border: 1px solid #b5b5b5;
            color: @pager-btn-color;

            > i {
                font-size: @pager-btn-font-size;
            }

            &[disabled] {
                color: @btn-disabled-color;
                cursor: not-allowed;
            }
        }
    }
</style>
