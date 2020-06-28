<template>
  <Dialog
    name="PosDialog.GroupReverseAccount"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="GroupReverseAccount"
    :append-to-body="true"
    :showSubmit="true"
    :submit-text="$t('Biz.Settlement.ConfirmAccount')"
    width="980px"
    id="posDialogGroupReverseAccount"
  >
  <template slot="other-button">
    <!-- 根据后台参数判断,不开启增值业务,不是使用预订挂账业务: posBaseInfo.orderUnpaid: 1-开启, 0未开启 -->
    <!-- <button type="button" class="btn btn-default searchBooked-button"
      v-if="posBaseInfo.reserveUnpaid"
      @click="openBookedSearchDialog"
      >{{$t('Biz.Settlement.SearchBook')}}</button> -->
  </template>
  <div class="payouts-modal">
    <div class="list-area">
      <!-- <div class="item search-item">
        <div class="search" v-keyboard:keyboard @keyup.enter="search">
          <el-input v-model="tempKeyword" :placeholder="$t('Biz.Settlement.EnterAccountSearch')" v-autotest></el-input>
        </div>
        <div class="search-btn">
          <button type="button" @click="search" class="btn btn-primary" v-autotest>{{$t('Dict.Search')}}</button>
        </div>
      </div> -->
      <div class="list">
        <p class="list-title">{{$t('Biz.Settlement.ChooseAccount')}}</p>
        <div class="list-box clear">
          <!-- 左侧集团单位 -->
          <div class="list-list1">
            <em>1</em>
            <span>全部挂账单位</span>
          </div>
          <!-- 右侧集团账户 -->
          <div class="list-list2">
            <div class="table-head">
              <table>
                <tr>
                  <th class="no-col">{{$t('Dict.Number2')}}</th>
                  <th class="name-col">{{$t('Dict.AccountName')}}</th>
                  <th class="quota-col">{{$t('Dict.Credits')}}</th>
                  <th class="balance-col">{{$t('Dict.AccountBalance')}}</th>
                  <th class="status-col">{{$t('Dict.State')}}</th>
                  <th class="choose-col">{{$t('Dict.Choose')}}</th>
                </tr>
              </table>
            </div>
            <div class="table-body">
              <table>
                <tr v-for="item in showList" :key="item.id" @click="changePayout(item)">
                  <td class="no-col">{{item.code}}</td>
                  <td class="name-col">{{item.name}}</td>
                  <td class="quota-col">{{item.unpaidSum}}</td>
                  <td class="balance-col">{{item.remainingSum}}</td>
                  <td class="status-col">{{item.isEnable ? $t('Dict.Enable') : $t('Dict.DiscontinueUse')}}</td>
                  <td class="choose-col">
                    <el-radio
                      class="account-checkbox"
                      v-model="currentPayout"
                      :label="item"
                      v-autotest>&nbsp;
                    </el-radio>
                  </td>
                </tr>
              </table>
              <div class="no-item" v-if="showList.length === 0 && keyword !== ''">
                <p>{{$t('Biz.Settlement.NotFoundAccountInfo')}}</p>
              </div>
              <div class="no-item" v-if="showList.length === 0 && keyword === ''">
                <div class="tip-content">
                  <img class="document-icon" src="@/common/images/sl-msg/document-icon.png">
                  <p>{{$t('Dict.NoInfo')}}</p>
                </div>
              </div>
            </div>
            <div class="list2-search-box">
              <em class="icon icon-fangdajing"></em>
              <input
                type="text"
                v-model.trim="accountKeyword"
                @keydown.enter="searchMenu"
                :placeholder="$t('Biz.Settlement.EnterAccountSearch')">
              <span></span>
            </div>
            <div class="pos-pager account-pager">
              <span class="page-info">{{
                $t('Dict.PageStyle.Text1', {
                  length: filterPayouts.length,
                  currentPage,
                  totalPage: pageCount(filterPayouts),
                })
              }}</span>
              <button
                href="javascript:;"
                class="prev"
                @click="upPage">
                <i class="el-icon-arrow-up"></i></button>
              <button
                href="javasctipt:;"
                class="next"
                @click="downPage(filterPayouts)">
                <i class="el-icon-arrow-down"></i></button>
            </div>
          </div>
        </div>
      </div>
      <div class="account-info">
        <p class="title">qua</p>
        <div class="amount">
          <span>支付金额：</span>
          <span class="input-box"><input type="text"></span>
        </div>
        <div class="remark">
          <span>备注：</span>
          <span class="input-box"><input type="text"></span>
        </div>
        <div class="executeBtnBox">
          <button
          type="button"
          class="btn btn-primary top-button topButton"
          @click="execute"
          v-autotest>{{ $t('Dict.Sure') }}</button>
        </div>
      </div>
    </div>
    <div class="money-area" v-keyboard:keyboard="{ autoSelect: true }">
      <div class="item to-be-pay">
        <span class="title"><b>{{ $t('Biz.Settlement.AmountToPaid01') }}</b></span>
        <div class="content payouts-money">{{ amountToBePaid | keepTwo }}</div>
      </div>
      <div class="item to-be-pay">
        <span class="title"><b>{{ $t('Biz.Settlement.BeenAmountOfAccount') }}</b></span>
        <div class="content">{{ amountToBePaid | keepTwo }}</div>
      </div>
      <div class="addedAccount-area">
        <!-- <div class="item pay-money">
          <span class="title">{{$t('Biz.Settlement.PaymentAmount')}}</span>
          <div class="content">
            <el-input
              id="payoutsInput"
              v-model="money"
              :placeholder="$t('Biz.Settlement.EnterAmount')"
              v-line="{direction: 'leftToRight'}"
              v-judge
              v-autotest>
            </el-input>
          </div>
        </div>
        <p class="remark-title">{{$t('Dict.Remarkss')}}</p> -->
        <!-- <el-input
          @focus="showAndroidInput('remark')"
          v-model="remark"
          type="textarea"
          :maxlength="80"
          :placeholder="$t('Biz.Settlement.EnterRemark')"
          v-autotest>
        </el-input> -->
        <div class="addedAccount-box">
          <p class="title">挂账记录</p>
          <div class="addedAccount-list">
            <div class="case">
              <div class="case-content">
                <p class="case-info">使用table-cell外包容器, 再内部使用显示元素, 进行布局定位</p>
                <p class="case-money">123.00</p>
              </div>
              <div class="case-btn"><span class="line"></span></div>
            </div>
            <div class="case">
              <div class="case-content">
                <p class="case-info">qeqweqweqwe</p>
                <p class="case-money">123.00</p>
              </div>
              <div class="case-btn"><span class="line"></span></div>
            </div>
          </div>
        </div>
        <div class="keybord-content">
          <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </div>
    <!-- 预订单查询组件,绑定时间: 更新挂账账户列表 -->
    <!-- <BookedSearch
      ref="bookedSearch"
      :bsId="bsDataId"
      @updateAccountList="getAccountList"
    >
    </BookedSearch> -->
    <AndroidInput ref="AndroidInput"></AndroidInput>
    <!-- <SmsVerificationModal
      ref="SmsVerificationModal"
      :title="$t('Biz.Settlement.AccountSmsVerification')"
      :data="{currentPayout,resData,remark,money,bsData}" @addPayWay="doAddPayWay"
      @parentClose="close">
    </SmsVerificationModal> -->
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { isNaN } from 'lodash';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
// import SmsVerificationModal from './SmsVerificationModal';

// 异步加载组件
// 常规套餐
// const BookedSearch = (resolve) => {
//     import('./BookedSearch').then((module) => {
//       resolve(module);
//     });
// };

export default {
  components: {
    Dialog, KeyBoard, AndroidInput,
  },
  mixins: [DialogMixin, PageMixin, AndroidInputMixin],
  data() {
    return {
      payWayInfo: {
        name: '',
      },
      resData: null,
      keyword: '',
      tempKeyword: '',
      currentPayout: null,
      prePageSize: 6,
      payouts: [],
      filterPayouts: [],
      remark: '',
      money: 0,
      bsDataId: '',
      // 账号信息搜索内容
      accountKeyword: '',
    };
  },
  props: {
    bsData: {
      type: Object,
    },
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
  },
  computed: {
    ...mapGetters([
      'posInfo',
      'posBaseInfo',
    ]),
    // 添加快捷键
    GroupReverseAccount() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    // 显示列表
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.filterPayouts);
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },
  mounted() {
    console.warn(123123123123123123)
  },
  methods: {
    // 账号查找
    searchMenu() {
    // 查找数据
      console.warn('qqqqqqqqqqq')
    },
    // 执行挂账
    execute() {

    },
    // 重置分页
    reSetPagination() {
      this.currentPage = 1;
    },
    // 更改账户
    changePayout(item) {
      this.currentPayout = item;
    },
    search() {
      this.currentPage = 1;
      this.keyword = this.tempKeyword;
      this.filterPayouts = this.payouts.filter((item) => {
        if (this.keyword === '') return true;
        const name = item.name.indexOf(this.keyword.toUpperCase());
        const pinyin = item.pinyin.indexOf(this.keyword.toUpperCase());
        const code = item.code.indexOf(this.keyword.toUpperCase());
        return name >= 0 || pinyin >= 0 || code >= 0;
      });
    },
    onOpen() {
      this.bsDataId = this.bsData.id;
      this.payWayInfo = this.resData;
      this.currentPayout = null;
      this.currentPage = 1;
      this.keyword = '';
      this.tempKeyword = '';
      this.remark = '';
      this.money = this.amountToBePaid;
      // 每次进入, 默认选中输入内容
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
      // 打开既执行接口加载数据
      this.getAccountList();
    },
    // 预订挂账-预订单组件打开
    // openBookedSearchDialog() {
    //   this.$refs.bookedSearch.open();
    // },
    // 读取 挂账账户接口方法
    getAccountList(autoCheckItemId) {
      ajax('canyin.pos.settlement.pay.onticktypepayway',
        {
          params: {
            bookOrderId: autoCheckItemId,
          },
        }).then((data) => {
        const { accounts: lists } = data;
        this.payouts = lists;
        this.filterPayouts = lists;
        if (autoCheckItemId) {
          // 先重置分页，后刷新数据，执行选中（翻页后不重置分页会无法选中）
          this.reSetPagination();
          // 实现选中置顶项(如果传参时,即为非首次调用的预订挂账新建账户时,
          // 查询的挂装账户列表)
          const [firstShowList] = this.showList;
          this.currentPayout = firstShowList;
        }
      });
    },
    // 点击提交
    onSubmit(authCode = {}) {
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      if (!this.currentPayout) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning28')}`);
        return;
      }
      // 判断账户是否启用,如果停用就给个提示
      if (!this.currentPayout.isEnable) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning29')}`);
        return;
      }
      if (isNaN(Number(this.money))) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning16')}`);
        return;
      }
      if (Number(this.money) > Number(this.amountToBePaid)) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning17')}`);
        return;
      }
      if (Number(this.money) <= 0) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning18')}`);
        return;
      }
      if (Number(this.money) > Number(this.currentPayout.unpaidSum)) { // remainingSum
        this.$message.warning(`${this.$t('Biz.Settlement.Warning30')}`);
        return;
      }
      ajax('canyin.pos.settlement.judgeempifhaspaywayopset', {
        params: {
          payTypeId: this.resData.payway_type_id,
          payMoney: this.money,
          accountId: this.currentPayout.id,
          ...authCode,
        },
      }).then(() => {
        if (this.currentPayout.isEnableCreditSMSValidate) { // 后台是否启用了短信验证功能
          this.$refs.SmsVerificationModal.open();
        } else {
          this.doAddPayWay();
        }
      });
    },
    doAddPayWay() {
      this.$emit('add-pay-way', {
        name: this.payWayInfo.name,
        payway_id: this.payWayInfo.id,
        payway_type_id: this.payWayInfo.payway_type_id,
        take_money: Number(this.money),
        is_confirm_delete: this.payWayInfo.isconfirmdelete,
        use_alone: this.payWayInfo.is_use_alone,
        isolpayway: this.payWayInfo.isolpayway,
        remark: this.remark,
        type_id: this.payWayInfo.payway_type_id,
        account_id: this.currentPayout.id,
        // 选择挂账的账户名称,为空不显示
        accountName: this.currentPayout.name
          ? this.currentPayout.name
          : '',
      });
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "../Booking/BookingCommon/common.less";

.clear:after {
    visibility: hidden;
    clear: both;
    display: block;
    height: 0;
    content: " ";
}
.searchBooked-button {
  float: left;
  margin-right: 4px;
}
.payouts-modal{
  display: table;
  width: 100%;
  >* {
    display: table-cell;
    vertical-align: top;
  }
}
.list-area{
  position: relative;
  padding: 12px 14px;
  width: 708px;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
}
.item{
  display: table;
  width: 100%;
  padding: 0 12px;
  > * {
    display: table-cell;
  }
  // .line-through{
  //   color: #ffffff;
  //   text-decoration: line-through;
  // }
  .payouts-money{
    font-size: 16px;
    color: #0babb9;
    font-weight: bold;
  }
  & + &{
    margin-top: 10px;
    padding-bottom: 12px;
    border-bottom: 1px dashed #b5b5b5;
    > .content {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
.search-item{
  .search{
    width: 310px;
  }
  .search-btn{
    padding-left: 8px;
    vertical-align: middle;
    button{
      width: 100%;
    }
  }
}
.title{
  width: 96px;
  font-size: 14px;
}
.list{
  // margin-bottom: 50px;
  .list-title{
    padding-bottom: 6px;
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
  table{
    width: 100%;
  }
  th,td{
    padding-left: 6px;
    font-weight: normal;
  }
  .list-box {
    border: 1px solid #ddd;
    background-color: @white;
  }
  .list-list1 {
    display: table-cell;
    width: 32%;
    padding: 6px 0;
    border-right: 1px solid #ddd;
  }
  .list-list2 {
    display: table-cell;
    position: relative;
    padding: 6px 10px 0;
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
    height: 300px;
    table{
      table-layout: fixed;
    }
    td{
      font-size: 12px;
      line-height: 1.5;
      padding: 8px 0 8px 8px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    tr{
      border-bottom: 1px solid #7bcad6;
      counter-increment: itemindex;
      vertical-align: middle;
      color: #333333;
    }
  }
  .no-col{
    width: 18%;
  }
  .name-col{
    width: 28%;
  }
  .quota-col{
    width: 16%;
  }
  .balance-col{
    width: 16%;
  }
  .status-col{
    width: 10.1%;
  }
  td.choose-col{
    text-align: center;
  }
  .account-checkbox{
    vertical-align: -6px;
  }
}
.no-item{
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding-top: 20px;
}
.tip-content{
  display: inline-block;
  font-size: 12px;
  img.document-icon{
    float: left;
    padding-right: 8px;
  }
  p{
    text-align: left;
    line-height: 36px;
    word-break:keep-all;
    white-space:nowrap;
  }
}
.account-info {
  width: 100%;
  height: 146px;
  margin-top: 8px;
  padding: 8px 10px;
  position: relative;
  background-color: #fff;
  border: 1px solid #ddd;
  .input-box {
    display: inline-block;
    width: 45%;
    padding: 2px 6px;
    border: 1px solid #999;
    border-radius: 4px;
    input {
      border-color: transparent;
    }
  }
  .title {
    font-weight: bold;
  }
  .amount {
    margin: 18px 0;
  }
  .remark .input-box {
    margin-left: 27px;
  }
  .executeBtnBox {
    position: absolute;
    right: 10px;
    bottom: 16px;
    .btn {
      width: 120px;
      display: block;
    }
  }
}

// 箭头按钮
.account-pager {
  position: absolute;
  right: 12px;
  bottom: 8px;
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
  .page-info {
    font-size: 13px;
  }
}

.money-area{
  padding-top: 12px;
  background-color: @white;
  .to-be-pay{
    // padding: 0 12px;
    .content{
      text-align: right;
    }
  }
  .addedAccount-area{
    padding: 0 12px;
  }
  .pay-money{
    margin-top: 12px;
  }
  .remark-title{
    line-height: 2;
  }
  .keybord-content{
    margin: 8px 0 0;
    text-align: center;
  }
}
.addedAccount-box {
  width: 100%;
  height: 228px;
  .title {
    margin: 6px 0;
  }
  .addedAccount-list {
    .case {
      margin-bottom: 6px;
      padding: 8px;
      border-radius: 4px;
      background-color: #67c23a;
      .case-content {
        width: 73%;
        display: inline-block;
        color: #fff;
        > p {

        }
      }

      .case-btn {
        display: block;
        float: right;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #fff;
        text-align: center;
        line-height: 24px;
        cursor: pointer;
        &:after {
          content: '';
          display: inline-block;
          height: 4px;
          width: 60%;
          background-color: #67c23a;
        }
      }
    }
  }
} 
.list2-search-box {
  width: 46%;
  height: 32px;
  position: relative;
  float: left;
  line-height: 32px;
  margin: 0 0 8px 0;
  padding-left: 12px;
  border-radius: 20px;
  color: #344b5b;
  .bgc(#f5f5f5);

  > em {
    float: left;
    color: #999;
    font-size: 24px;
  }

  > input {
    width: 76%;
    height: 26px;
    border: none;
    z-index: 8;
    position: relative;
    padding-left: 6px;
    .bgc(transparent);
    font-size: 13px;

    &::-webkit-input-placeholder {
      color: #999;
    }

    &:focus + span {
      border-color: @activeColor;
    }
  }

  > span {
    width: 100%;
    height: 100%;
    .positionTop;
    z-index: 5;
    border-radius: 20px;
    border: 1px solid #ddd;
  }
}
</style>
