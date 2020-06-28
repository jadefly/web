<template>
  <Dialog
    name="PosDialog.PayWayGroupPayoutsModal"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayGroupPayoutsModal"
    :append-to-body="true"
    :showSubmit="true"
    :submit-text="$t('Biz.Settlement.ConfirmAccount')"
    top="7vh"
    width="980px"
    id="posDialogPayWayGroupPayoutsModal"
  >
  <div class="payouts-modal">
    <div class="list-area">
      <div class="list">
        <p class="list-title">{{$t('Biz.Settlement.ChooseAccount')}}</p>
        <div class="list-box">
          <!-- 左侧集团单位 分页 -->
          <div class="list-list1">
            <ul class="list1-content">
              <li
                class="list1-item aLineTxt"
                :class="{active: activeGroupId === 'all'}"
                @click="chooseGroup({id: 'all'})">{{ $t('Biz.Settlement.AllAccountCompany') }}</li>
              <li
                class="list1-item aLineTxt"
                :class="{active: activeGroupId === item.id }"
                v-for="(item, index) in showGroupList"
                :key="index"
                @click="chooseGroup(item, index)">{{ item.name }}</li>
            </ul>
            <!-- 集团单位信息列表 分页 -->
            <div class="pos-pager account-pager">
              <span class="page-info">{{
                $t('Dict.PageStyle.Text1', {
                  length: groupList.length,
                  currentPage: currentPage2,
                  totalPage: pageCount2(groupList),
                })
              }}</span>
              <button
                href="javascript:;"
                class="prev"
                @click="upPage2">
                <i class="el-icon-arrow-up"></i></button>
              <button
                href="javasctipt:;"
                class="next"
                @click="downPage2(groupList)">
                <i class="el-icon-arrow-down"></i></button>
            </div>
          </div>
          <!-- 右侧单位账户列表 分页 -->
          <div class="list-list2">
            <div class="list-list-topBox">
              <div class="list2-search-box">
                <em class="icon icon-fangdajing"></em>
                <input
                  type="text"
                  v-autotest
                  v-keyboard:keyboard
                  v-model.trim="tempKeyword"
                  @keydown.enter="searchMenu"
                  :placeholder="$t('Biz.Settlement.EnterAccountSearch')">
                <span></span>
                <div
                  class="clearSearch el-icon-close"
                  v-show="!!tempKeyword.length"
                  @click="clearSearch"></div>
              </div>
              <div class="search-btn">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="searchMenu"
                  v-autotest>{{$t('Dict.Search')}}</button>
              </div>
            </div>
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
            <!-- list2-分页 -->
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
        <p class="title">{{ checkedGroup.name }}</p>
        <div class="amount">
          <span>{{ $t('Biz.Settlement.NeedAmountPay') }}</span>
          <span class="input-box">
            <input
              v-keyboard:keyboard="{mode: 'simple', autoSelect: true }"
              ref="payMoney"
              type="text"
              v-model="accountPayMoney"
              v-autotest v-judge>
          </span>
        </div>
        <div class="remark">
          <span>{{ $t('Dict.Remarkss') }}</span>
          <span class="input-box">
            <input
              type="text"
              ref="remark"
              v-model="remark"
              v-judge
              v-autotest>
          </span>
        </div>
        <div class="executeBtnBox">
          <button
          type="button"
          class="btn btn-primary top-button topButton"
          @click="execute"
          v-autotest>{{ $t('Biz.BizComm.AddTo') }}</button>
        </div>
      </div>
    </div>
    <div class="money-area">
      <div class="item to-be-pay">
        <span class="title"><b>{{ $t('Biz.Settlement.AmountToPaid01') }}</b></span>
        <div class="content payouts-money">{{ amountToBePaid | keepTwo }}</div>
      </div>
      <div class="item to-be-pay">
        <span class="title"><b>{{ $t('Biz.Settlement.BeenAmountOfAccount') }}</b></span>
        <div class="content">{{ beenAmountOfAccount | keepTwo }}</div>
      </div>
      <div class="addedAccount-area">
        <div class="addedAccount-box">
          <p class="title">{{ $t('Biz.Settlement.AccountRecord') }}</p>
          <div
            :id="addedAccountPageId"
            class="addedAccount-list">
            <div
              class="case"
              :key="index"
              v-for="(item, index) in addedAccountList">
              <div class="case-content">
                <p class="case-info aLineTxt">{{ item.unpaidPersonName }}</p>
                <p class="case-money aLineTxt">{{ item.unpaidMoney }}</p>
              </div>
              <div class="case-btn-box">
                <div class="case-btn" @click="deleteAddedInfo(item.unpaidPersonId)"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="addedAccount-pager">
          <span class="pager-listNum">{{$t('Dict.Altogether')}}{{ addedAccountList.length }}{{$t('Dict.Strip')}}，</span>
          <Pager
            class="pager-com"
            :pagerId="addedAccountPageId"
            arrowDirection="up-down"
            itemTag="div.case"
            :showInfo="true"
            ref="pager"></Pager>
        </div>
        <div class="keybord-content">
          <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </div>
  <AndroidInput ref="AndroidInput"></AndroidInput>
  <SmsVerificationModal
    ref="SmsVerificationModal"
    :title="$t('Biz.Settlement.AccountSmsVerification')"
    :data="{
      currentPayout: currVerifyAccount,
      resData,
      remark,
      money,
      bsData,
      verifySource: 'groupPayouts',
    }"
    @handleBackEndLogic="onSubmit">
    <!-- 此业务引用的短信验证'addPayWay'和'parentClose'方法不需要加载执行 -->
  </SmsVerificationModal>
  </Dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { add, sub } from '@/common/js/math';
import { concat, find, isNaN, isEmpty, sortBy } from 'lodash';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';
import PageMixin2 from '@/common/util/PaginationMixin2';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import SmsVerificationModal from './SmsVerificationModal';

export default {
  components: {
    Dialog, Pager, KeyBoard, AndroidInput, SmsVerificationModal,
  },
  mixins: [DialogMixin, PageMixin, PageMixin2, AndroidInputMixin],
  data() {
    return {
      payWayInfo: {
        name: '集团挂账',
      },
      resData: null,
      beenAmountOfAccount: 0,
      keyword: '',
      tempKeyword: '',
      currentPayout: null,
      prePageSize: 6,
      payouts: [],
      filterPayouts: [],
      remark: '',
      money: 0,
      accountPayMoney: '',
      // 集团单位列表
      groupList: [],
      currentPayout2: null,
      prePageSize2: 9,
      // 选中集团单位
      activeGroupId: '',
      checkedGroup: '',
      // 已添加挂账记录列表
      addedAccountList: [],
      pager: null,
      addedAccountPageId: 'addedAccountPageId',
      // 所有集团下的所有的挂账账户, 总列表
      allAccountList: [],
      // 经过滤, 当前执行短信验证判断的账户(已挂账账户的第一个为全局判断)
      currVerifyAccount: '',
    };
  },
  props: {
    bsData: {
      type: Object,
      default() {
        return {};
      },
    },
    pointId: {
      type: String,
      default() {
        return '';
      },
    },
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
    // 是否勾选团队结算
    isSelectTeamBtn: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters([
      'posInfo',
      'posBaseInfo',
    ]),
    ...mapGetters('fastFood', [
      'saleTypeId',
    ]),
    ...mapState('fastFood', [
      'orderCode',
    ]),
    // 添加快捷键
    PayWayGroupPayoutsModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    // 显示集团单位列表
    showGroupList() {
      return sortBy(
        this.pagination2(this.currentPage2, this.prePageSize2, this.groupList),
        sub => sub.code,
      );
    },
    // 显示账户列表
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.filterPayouts);
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },
  methods: {
    onOpen() {
      this.payWayInfo = this.resData;
      this.money = this.amountToBePaid;
      // 默认首先支付金额 使用待付金额
      this.accountPayMoney = this.amountToBePaid;
      // 每次进入, 默认选中输入内容
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
      // 打开即执行 读取集团单位列表
      this.getGroupList();
      setTimeout(() => {
        this.$refs.pager.refresh();
      }, 0);
    },

    onClose() {
      this.currentPayout = null;
      this.currentPage = 1;
      this.keyword = '';
      this.tempKeyword = '';
      this.remark = '';
      this.groupList = [];
      this.checkedGroup = '';
      this.accountPayMoney = '';
      this.activeGroupId = '';
      this.addedAccountList = [];
      this.currentPayout2 = null;
      this.beenAmountOfAccount = 0;
      this.close();
    },

    chooseGroup(item, index) {
      this.activeGroupId = item.id;
      if (item.id === 'all') {
        this.getAccountList(null, 'all');
        this.checkedGroup = '';
        return false;
      }
      this.getAccountList(item);
      this.checkedGroup = item;
    },

    // 执行添加挂账信息
    execute() {
      // 判断账户是否启用,如果停用就给个提示
      if (!this.currentPayout.isEnable) {
        this.$message.warning(this.$t('Biz.Settlement.Warning29'));
        return false;
      }
      // 非法数值
      if (isNaN(Number(this.accountPayMoney))) {
        this.$message.warning(this.$t('Biz.Settlement.Warning16'));
        return false;
      }
      // // 添加空账
      // if (isEmpty(this.currentPayout)) {
      //   this.$message.warning(this.$t('Biz.Settlement.Tip521'));
      //   return false;
      // }
      // 挂账使用负数和0
      if (this.accountPayMoney <= 0) {
        this.$message.warning(this.$t('Biz.Settlement.Warning18'));
        return false;
      }
      // 账户可用金额小于添加挂账金额
      if (Number(this.accountPayMoney) > Number(this.currentPayout.unpaidSum)) {
        this.$message.warning(this.$t('Biz.Settlement.Warning30'));
        return false;
      }
      // 执行挂账信息添加
      if (!find(this.addedAccountList, {'unpaidPersonId': this.currentPayout.id})) {
        const obj = {
          tsId: '',
          bsId: this.bsData.id,
          unpaidCompanyId: '',
          unpaidCompanyName: '',
          unpaidPersonId: this.currentPayout.id,
          unpaidPersonName: this.currentPayout.name,
          unpaidMoney: Number(this.accountPayMoney),
          remark: this.remark,
        }
        // 选择全部,查找当前账户所属集团单位
        if (isEmpty(this.checkedGroup)) {
          find(this.groupList, (item) => {
            find(item.persons, (sub) => {
              if (sub.id === this.currentPayout.id) {
                obj.unpaidCompanyId = item.id;
                obj.unpaidCompanyName = item.name;
              }
            })
          });
        } else {
          obj.unpaidCompanyId =  this.checkedGroup.id;
          obj.unpaidCompanyName = this.checkedGroup.name;
        }
        this.addedAccountList.push(obj);
        // 已挂金额累加
        this.beenAmountOfAccount = add((this.beenAmountOfAccount), Number(this.accountPayMoney));
        // 添加完成后重置信息
        this.accountPayMoney = '';
        this.remark = '';
      }
      if (this.addedAccountList.length > 3) {
        setTimeout(() => {
          this.$refs.pager.refresh();
        }, 0);
      }
    },

    // 执行删除已添加挂账信息
    deleteAddedInfo(id) {
      this.addedAccountList.forEach((item, index) => {
        if (item.unpaidPersonId === id) {
          this.addedAccountList.splice(index, 1);
          this.beenAmountOfAccount = sub(this.beenAmountOfAccount, item.unpaidMoney);
        }
      });
    },

    // 重置分页
    reSetPagination() {
      this.currentPage = 1;
    },

    // 更改账户
    changePayout(item) {
      this.currentPayout = item;
    },

    searchMenu() {
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

    clearSearch() {
      this.tempKeyword = '';
      this.keyword = '';
      this.searchMenu();
    },
    // 获取集团单位列表
    getGroupList() {
      // 执行默认选中全部集团你单位
      this.chooseGroup({id: 'all'});
      ajax('canyin.pos.settlement.pay.companyonticktypepayway.accountview')
        .then((data) => {
          if (!isEmpty(data.companys)) {
            this.groupList = data.companys;
            // 执行加载各个集团的账户信息组合一个list显示
            this.getAccountList(null, 'all');
          }
        });
    },

    // 读取 单位账户方法
    getAccountList(data, type, autoCheckItemId) {
      if (type === 'all') {
        // 所有单位下所有挂账账户拼接, 并缓存
        if (isEmpty(this.allAccountList)) {
          this.groupList.forEach((item) => {
            if (!isEmpty(item.persons)) {
              this.allAccountList = concat(this.allAccountList, item.persons);
            }
          });
        }
        // 所有挂账账户存在, 只需赋值页面显示和分页容器即可
        this.payouts = this.allAccountList;
        this.filterPayouts = this.allAccountList;
        // 先重置分页，后刷新数据，执行选中（翻页后不重置分页会无法选中）
        this.reSetPagination();
        // 实现选中置顶项(如果传参时,即为非首次调用的预订挂账新建账户时,
        // 查询的挂装账户列表)
        const [firstShowList] = this.showList;
        this.currentPayout = firstShowList;
      }
      if (type !== 'all') {
        if (!isEmpty(data) && !isEmpty(data.persons)) {
          this.payouts = data.persons;
          this.filterPayouts = data.persons;
          // 先重置分页，后刷新数据，执行选中（翻页后不重置分页会无法选中）
          this.reSetPagination();
          // 实现选中置顶项(如果传参时,即为非首次调用的预订挂账新建账户时,
          // 查询的挂装账户列表)
          const [firstShowList] = this.showList;
          this.currentPayout = firstShowList;
        } else {
          this.payouts = [];
          this.filterPayouts = [];
          this.currentPayout = null;
          this.currentPage = 1;
        }
      }
    },

    onSubmit(authCode = {}, smsVerify = false) {
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      // 无挂账
      if (!this.addedAccountList.length) {
        this.$message.warning(this.$t('Biz.Settlement.AccountWarn01'));
        return false;
      }
      // 已挂账大于待付(不能找零)
      if (Number(this.beenAmountOfAccount) > Number(this.amountToBePaid)) {
        this.$message.warning(this.$t('Biz.Settlement.Warning17'));
        return false;
      }
      const params = {
        isNegativeSettle: false, //是否是负结算(写死)
        pointId: this.pointId,
        bsId: this.bsData.id,
        bsCode: this.bsData.code,
        totalInvoiceMoney: 0,
        invoiceMoney: 0,
        tearingInvoiceMoney: 0,
        lastTotal: this.bsData.last_total,
        giveChange: 0,
        modifyTime: this.bsData.modify_time,
        orderCode: this.posInfo.controlMode === '3' ? this.orderCode : '',
        saleTypeId: this.posInfo.controlMode === '3' ? this.saleTypeId : 1,
        paramFlag: 0,
        controlMode: this.posInfo.controlMode,
        invoiceRemark: '',
        tsRemark: '',
        takeMoney: 0, // 后面进行累加
        // isSelectTeamBtn-团队结算勾选状态: 初始打开,不管是不是团队都是true(真特么是个天坑啊),
        // 所以判断是否团队
        isSelectTeamBtn: this.bsData.teamBsIds ? this.isSelectTeamBtn : !!this.bsData.teamBsIds,
        teamSettlementFlg: !!this.bsData.teamBsIds,
        teamBsIds: this.bsData.teamBsIds || '',
        teamPointIds: this.bsData.teamPointIds || '',
        // payway_list: [], // 已使用的结算方式
        bizTsPwCompanyUnpaidDTOList: this.addedAccountList,
        // isCanDoCompanyUnpaid是否经过短信验证: 由短信验证组件回传
        // ## 值: null-未短信验证, false-跳过短信验证并挂账, true-短信验证成功并挂账
        isCanDoCompanyUnpaid: smsVerify,
        ...authCode,
      }

      // 获取父组件-结算页面,组装的已加结算方式数据的组织结构
      this.$emit('componentGetPayWayList', (data) => {
        // 已使用的结算方式数据列表
        params.payway_list = data;
      });
      // 添加当前集团挂账的结算数据到payway_list
      params.payway_list.push({
        payway_id: this.resData.id,
        payway_name: this.resData.name,
        payway_type_id: this.resData.payway_type_id,
        take_money: this.beenAmountOfAccount,
        pay_money: this.beenAmountOfAccount,
        is_deposit: this.bsData.deposit,
        sort_order: add(params.payway_list.length, 1),
        give_change: 0,
      });
      params.takeMoney = add(params.takeMoney, this.beenAmountOfAccount);
      params.payMoney = params.takeMoney;
      ajax('canyin.pos.settlement.pay.companyonticktypepayway.commitcompanyunpaid', {
        contentType: 'paramsEncoded',
        data: params,
        isCanDoCompanyUnpaid: false,
      }).then((data) => {
        if (data && data.result === -2) {
          this.$vemit('posAuthCheck', { message: data.msg });
          return false;
        }
        // 根据后台返回判断是否启用了短信验证功能
        if (data && data.isEnableCreditSMSValidate) { // 后台是否启用了短信验证功能
          // 向短信验证子组件传递账户数据: 只验证第一个账户状态(写死!!!)
          this.currVerifyAccount = find(
            this.allAccountList,
            ['id', this.addedAccountList[0].unpaidPersonId],
          );
          this.$refs.SmsVerificationModal.open();
        } else {
          this.doAddPayWay();
          this.$emit('operate-group-payouts', true);
        }
      });
    },
    // 执行添加结算(对 父组件)
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
@import "~@/components/Pos/Booking/BookingCommon/common.less";

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
  padding: 10px 14px;
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

.title{
  width: 96px;
  font-size: 14px;
}
.list{
  .list-title{
    margin-bottom: 6px;
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
    display: inline-block;
    position: relative;
    width: 32%;
    height: 422px;
    padding: 8px 0 50px;
    vertical-align: top;
    border-right: 1px solid #ddd;
  }
  .list1-title {
    padding: 6px;
    .bgc(#ddf1f6);
    font-weight: bold;
    color: @activeColor;
  }
  .list1-content {
    .list1-item {
      width: 100%;
      padding: 8px 12px;
      cursor: pointer;
      // &:first-child {
      //   padding: 6px 8px;
      //   // .bgc(#ddf1f6);
      //   font-weight: bold;
      //   color: @activeColor;
      // }
      &.active {
        .bgc(#ddf1f6);
        font-weight: bold;
        color: @activeColor;
      }
    }
  }
  .list-list2 {
    display: inline-block;
    width: 67%;
    position: relative;
    padding: 0 10px;
  }
  .list-list-topBox {
    margin: 8px 0 14px;
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
    height: 334px;
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
      width: 98%;
      border-color: transparent;
    }
  }
  .title {
    width: 100%;
    height: 20px;
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
  .keybord-content .keybord{
    margin: auto;
  }
}
.addedAccount-box {
  width: 100%;
  // height: 228px;
  .title {
    margin: 6px 0;
  }
  .addedAccount-list {
    height: 192px !important;
    overflow-y: auto;
    .case {
      margin-bottom: 4px;
      padding: 8px;
      border-radius: 4px;
      background-color: #67c23a;
      .case-content {
        display: table-cell;
        color: #fff;
        > p {
          width: 201px;
        }
        .case-info {
          margin-bottom: 4px;
        }
      }
      .case-btn-box {
        display: table-cell;
        text-align: right;
        vertical-align: middle;
      }
      .case-btn {
        display: inline-block;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background-color: #fff;
        text-align: center;
        line-height: 20px;
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
.addedAccount-pager {
  margin: 6px 0 16px;
  text-align: right;
  .pager-listNum {
    color: #273844;
    font-size: 12px;
  }
  .pager-com {
    display: inline-block;
  }
}
.list2-search-box {
  width: 68%;
  height: 32px;
  display: inline-block;
  position: relative;
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

  .clearSearch {
    position: relative;
    z-index: 999;
    vertical-align: sub;
    cursor: pointer;
    font-size: 26px;
    color: #666;
  }
}
.search-btn{
  float: right;
  padding-left: 8px;
  vertical-align: middle;
  button{
    width: 120px;
  }
}
</style>
