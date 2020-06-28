<template>
  <Dialog
    name="PosDialog.PayDesposit"
    :hotkeys="PayDesposit"
    :append-to-body="true"
    :title="$t('Dict.Btn.Deposit')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="780px">
    <!--头部客位 开单事件 人数 押金合计-->
    <div class="pay-deposit-hearder">
      <span class="table-number title-list"><i></i> {{  bsData.point_name }}</span>
      <span class="title-list">{{$t('Dict.OpeningTime')}}{{ initData.openTime }} </span>
      <span class="title-list">{{$t('Dict.NumberOfPeople01')}}{{ bsData.people_qty }}</span>
      <span class="title-list">{{$t('Biz.Settlement.TotalDeposit')}}{{ totalDeposit }}</span>
      <span class="title-list"
        v-show="isShowTeamDeposit">{{$t('Biz.Settlement.TeamTotalDeposit')}}{{  teamDeposit }}</span>
    </div>
    <div class="content-warp pay-deposit-modal">
      <div class="money-warp">
        <!--金额 支付方式默认人民币-->
        <el-form
          ref="form"
          label-width="56px"
          label-position="left"
          v-keyboard:keyboard="{ autoSelect: true }"
          @submit.native.prevent
        >
          <el-form-item
            :label="$t('Dict.Btn.Amount2')"
            class="form-item text-right">
            <div class="my-input-wrap">
              <input
                :class="{notAllowed:isKeBiDeDeposit && isKeBiDeBooKPoint}"
                :disabled="isKeBiDeDeposit && isKeBiDeBooKPoint"
                id="payDepositInput"
                v-model="money"
                maxlength="15"
                @keyup="InputNumber('money', 2)"
                :placeholder="$t('Biz.Settlement.OperationAmount')"
                v-judge
              />
            </div>
          </el-form-item>
          <button
            id="payDepositPayway"
            :class="{notAllowed:isKeBiDeDeposit && isKeBiDeBooKPoint}"
            class="btn btn -default deposit-payway-list"
            @click="openPaywayList"
            v-if="selectedPayway && paywayList.length"
            :disabled="paywayDisabled||(isKeBiDeDeposit && isKeBiDeBooKPoint)"
            :title="selectedPayway.name">
            {{ selectedPayway.name }}
          </button>
        </el-form>
        <!--押金操作方式 退，登记，使用 -->
        <div class="buttons-warp">
          <div class="button-content">
            <button
              id="payReturnDeposit"
              type="button"
              @click="changeStatus('returnDepoit')"
              class="btn btn-default"
              :class="{'btn-primary':currentStatus === 'returnDepoit'}"
             >
              - {{$t('Biz.Settlement.ReturnDeposit')}}
            </button>
          </div>
          <div
            class="button-content"
            v-if="!isKeBiDeDeposit || !isKeBiDeBooKPoint">
            <button
              id="payLoginDeposit"
              type="button"
              @click="changeStatus('loginDepoit')"
              class="btn btn-default"
              :class="{'btn-primary':currentStatus === 'loginDepoit'}">
              + {{$t('Biz.Settlement.RegisterDeposit')}}
            </button>
          </div>
          <div class="button-content">
            <button
              id="payUseDeposit"
              type="button"
              @click="changeStatus('useDepoit')"
              class="btn btn-default"
              :class="{'btn-primary':currentStatus === 'useDepoit'}"
            >
              + {{$t('Biz.Settlement.UseDeposit')}}
            </button>
          </div>
        </div>
        <!--数字键盘-->
        <div class="keybord-content">
          <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
        </div>
      </div>
      <div class="list-warp">
        <!--右侧列表头部-->
        <div class="table-head">
          <table>
            <tr>
              <th class="type-col">{{$t('Biz.Settlement.DepositType')}}</th>
              <th class="money-col">{{$t('Dict.Btn.Amount2')}}</th>
              <th class="payway-col">{{$t('Biz.Settlement.LoginType')}}</th>
              <th class="time-col">{{$t('Biz.Settlement.RegisterTimer')}}</th>
              <th class="people-col">{{$t('Biz.Settlement.RegisterPerson')}}</th>
            </tr>
          </table>
        </div>
        <!--右侧列表内容-->
        <div class="table-body">
          <table>
            <tr
              :class="{'return-deposit':item.type === 2}"
              v-for="item in showList"
              :key="item.id">
              <td class="type-col">{{item.typeName}}</td>
              <td class="money-col">{{item.deposit}}</td>
              <td class="payway-col">{{item.paywayname}}</td>
              <td class="time-col">{{item.createTime}}</td>
              <td class="people-col">{{item.emp}}</td>
            </tr>
          </table>
          <div class="no-item"
            v-if="depositList.length === 0 ">
            <p>{{$t('Biz.Settlement.NotFoundAccountInfo')}}</p>
          </div>
        </div>
        <!--分页-->
        <div class="pos-pager">
          <div class="pos-takeout-pager">
            <span class="page-info">{{
              $t('Dict.PageStyle.Text1', {
                length: depositList.length,
                currentPage,
                totalPage: pageCount(depositList),
              })
            }}</span>
            <button
              href="javascript:;"
              class="prev"
              @click="upPage">
              <i class="el-icon-arrow-up"></i></button>
            <button
              href="javascript:;"
              class="next"
              @click="downPage(depositList)">
              <i class="el-icon-arrow-down"></i></button>
          </div>
        </div>
      </div>
    </div>
    <!--下拉框押金方式,当有登录押金时,禁止点击-->
    <DepositPaywayList
      ref="depositPaywayList"
      name="payDepositPaywayList"></DepositPaywayList>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import DepositPaywayList from '@/components/Pos/Order/Bill/Pay/ActiveChildDialog/DepositPaywayList';
import PageMixin from '@/common/util/PaginationMixin';
import { mapGetters } from 'vuex';
import { MessageBox } from 'element-ui';
import { find, isNaN } from 'lodash';

export default {
  components: { Dialog, KeyBoard, DepositPaywayList },
  mixins: [DialogMixin, PageMixin],
  props: {
    pointId: {
      default() {
        return '';
      },
    },
    bsData: {
      type: Object,
      default() {
        return {};
      },
    },
    bookOrderSource: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      money: 0,
      depositList: [], // 右侧列表
      prePageSize: 8, // 当前页数
      totalDeposit: 0, // 押金合计
      bsId: '', // 流水id
      currentStatus: null, // 当前押金操作方式
      depositMoney: 0, // 押金金额
      paywayId: null, // 押金类型
      isExistPayWay: 0, // 是否存在结算方式
      initData: {}, // 初始化数据
      isTeamSettlementFlg: 0, // 是否是团队结算
      isShowTeamDeposit: false, // 是否是团队结算押金 默认不是
      teamDeposit: null, //  团队结算押金金额
      paywayDisabled: false, // 下拉框禁用标志位
      paywayList: [
        {
          id: '1',
          name: '人民币',
          pay_way_type_name: '现金',
          pay_way_type_code: '01',
          code: '01',
        },
      ], // 押金类型列表
      selectedPayway: {}, // 当前选择的押金支付方式
      isKeBiDeDeposit: false, // 是否开启了客必得押金
      isKeBiDeBooKPoint: false, // 是否是客必得预定客位
    };
  },
  computed: {
    ...mapGetters(['getVuexPointData', 'posBaseInfo']),
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.depositList);
    },
    // 押金模块增加快捷键
    PayDesposit() {
      return {
        // 登记押金
        F1: () => {
          this.loginDepoit();
        },
        // 退押金
        F2: () => {
          this.returnDepoit();
        },
        // 使用押金
        F3: () => {
          this.useDepoit();
        },
      };
    },
  },
  methods: {
    // 限制输入数字保留2位小数
    InputNumber(key, fixed) {
      const str = this[key];
      this.$nextTick(() => {
        this[key] = this.onlyNumber(str, fixed);
      });
    },
    onlyNumber(val, fixed = 2) {
      let str = '';
      const tmp = new RegExp(`^(\\-)*(\\d+)\\.(\\d{0,${fixed}}).*$`, 'g');
      str += val;
      str = str.replace(/[^\d.]/g, '');
      str = str.replace(/\.{2,}/g, '.');
      str = str.replace('.', '$#$');
      str = str.replace(/\./g, '');
      str = str.replace('$#$', '.');
      str = str.replace(tmp, '$1$2.$3');
      if (str.indexOf('.') === 0 && str !== '') {
        str = '';
      }
      if (str.indexOf('.') < 0 && str !== '') {
        str = parseFloat(str);
      }
      return str;
    },
    // 打开押金类型列表
    openPaywayList() {
      this.$refs.depositPaywayList.open({
        paywayList: this.paywayList,
        paywayId: this.selectedPayway.id,
      }, {
        submit: (payway) => {
          this.paywayId = payway.id;
          this.findPaywayById();
        },
      });
    },
    // 数字不足两位，在前面补0
    addZero(num) {
      const str = `${num}`;
      if (str.length === 1) return `0${str}`;
      return str;
    },
    // 更改当前状态
    changeStatus(status) {
      this.currentStatus = status;
      if (status === 'returnDepoit') {
        this.returnDepoit();
      } else if (status === 'loginDepoit') {
        this.loginDepoit();
      } else if (status === 'useDepoit') {
        this.useDepoit();
      }
    },
    getDepositList(data) {
      let teamBsIds;
      if (data.isTeamSettlementFlg === 1) { // 团队结算
        const { destructuringBsId } = data.teamBsIds;
        teamBsIds = destructuringBsId;
      } else {
        teamBsIds = '';
      }
      ajax('canyin.pos.depositdetail.depositdetailview', {
        params: {
          pointId: this.pointId,
          teamBsIds,
        },
      }).then((res) => {
        this.isShowTeamDeposit = res.isShowTeamDeposit;
        this.teamDeposit = res.teamDeposit;
        this.depositList = res.details;
        this.paywayId = res.paywayId;
        this.paywayList = res.paywayList;
        this.totalDeposit = res.totalDeposit;
        this.bsId = res.bsId;
        this.initData = res;
        // 存在登陆押金 禁用押金方式的下拉
        if (this.totalDeposit !== 0) {
          this.paywayDisabled = true;
        } else {
          this.paywayDisabled = false;
        }

        if (this.paywayList.length > 0) {
          if (this.totalDeposit === 0) {
            this.paywayId = this.paywayList[0].id;
          }
          this.findPaywayById();
        }
      }).catch((code, msg) => {
        this.close();
        MessageBox.alert(msg, `${this.$t('Dict.WrongInfo')}`);
      });
    },
    onOpen() {
      if (this.bookOrderSource.length > 0) {
        this.bookOrderSource.forEach((item) => {
          if (item.bs_id === this.resData.bsId && item.order_source === 6) {
            this.isKeBiDeBooKPoint = true;
          }
        });
      }
      this.isKeBiDeDeposit = this.posBaseInfo.isKeBiDeDeposit && this.posBaseInfo.isKeBiDe;
      this.currentPage = 1;
      this.money = 0;
      this.currentStatus = null;
      this.isExistPayWay = this.resData.isExistPayWay;
      this.depositMoney = this.resData.depositMoney;
      this.isTeamSettlementFlg = this.resData.isTeamSettlementFlg;
      this.getDepositList(this.resData);
      this.$vonce('authCode', (code) => {
        if (this.currentStatus === 'returnDepoit') {
          this.returnDepoit(code);
        } else if (this.currentStatus === 'loginDepoit') {
          this.loginDepoit(code);
        }
      });
      // 输入框 全选中 输入内容
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    onClose() {
      this.isKeBiDeBooKPoint = false;
    },
    // 通过id找到对顶支付方式
    findPaywayById() {
      const selectedPayway = find(this.paywayList, { id: this.paywayId });
      if (selectedPayway) {
        this.selectedPayway = selectedPayway;
      } else {
        [this.selectedPayway] = [this.paywayList[0]];
      }
    },
    // 验证押金金额是否正确
    validateMoney() {
      const { isExistPayWay } = this;
      if (isExistPayWay === 1) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning39')}`);
        return false;
      }
      if (isNaN(Number(this.money))) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning16')}`);
        return false;
      }
      if (Number(this.money) <= 0) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning18')}`);
        return false;
      }
      if (Number(this.money) > 999999.99) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning40')}`);
        return false;
      }
      if (this.money.toString().indexOf('.') !== -1 && this.money !== 0) {
        const i = this.money.toString().indexOf('.');
        if (this.money.substr(i + 1).length > 2 && !isNaN(Number(this.money))) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning41')}`);
          return false;
        }
      }
      return true;
    },
    // 退押金
    returnDepoit(authData = {}) {
      let { money } = this;
      if (this.isKeBiDeDeposit && this.isKeBiDeBooKPoint) { // 开启客必得退押金
        if (Number(this.totalDeposit) <= 0) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning42')}`);
          return false;
        }
        money = this.totalDeposit;
      } else {
        if (!this.validateMoney()) return false;
        if (this.totalDeposit - Number(this.money) < 0) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning43')}`);
          return false;
        }
      }
      const paywayName = this.selectedPayway.name ? this.selectedPayway.name : '人民币';
      this.$confirm(`本次退押金:${paywayName}${money},是否确认保存?`, `${this.$t('Dict.Tips')}`, {
        confirmButtonText: `${this.$t('Dict.ConfirmButtonText')}`,
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'info',
        showClose: false,
      }).then(() => {
        const data = {
          pointId: this.pointId,
          bsId: this.bsId,
          type: 2,
          deposit: money,
          paramFlag: 0,
          payWayId: this.selectedPayway.id,
          ...authData,
        };
        ajax('canyin.pos.depositdetail.depositdetail', {
          contentType: 'paramsEncoded',
          data,
        }).then((res) => {
          if (+res.result === 1) {
            this.$emit('deposit', res.data.lastDeposit);
            this.depositMoney = res.data.lastDeposit;
            this.$message({
              type: 'success',
              message: `${this.$t('Biz.Settlement.Success30')}`,
            });
            // 刷新押金列表
            this.getDepositList(this.resData);
            // 刷新客位显示
            this.$vemit('updatePoint');
            this.close();
          } else if (+data.result === -1) {
            this.$message({
              type: 'success',
              message: res.msg,
            });
          }
        });
      });
      return true;
    },
    // 登记押金
    loginDepoit(authData = {}) {
      if (!this.validateMoney()) return;
      const { money } = this;
      const paywayName = this.selectedPayway.name ? this.selectedPayway.name : '人民币';
      this.$confirm(`本次登记押金${paywayName}${money},是否确认保存?`, `${this.$t('Dict.Tips')}`, {
        confirmButtonText: `${this.$t('Dict.ConfirmButtonText')}`,
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'info',
        showClose: false,
      }).then(() => {
        const data = {
          pointId: this.pointId,
          bsId: this.bsId,
          type: 1,
          deposit: this.money,
          paramFlag: 0,
          payWayId: this.selectedPayway.id,
          ...authData,
        };
        ajax('canyin.pos.depositdetail.depositdetail', {
          contentType: 'paramsEncoded',
          data,
        }).then((res) => {
          if (+res.result === 1) {
            this.$message.success(`${this.$t('Biz.Settlement.Success30')}`);
            this.$emit('deposit', res.data.lastDeposit);
            // 记录押金金额
            this.depositMoney = res.data.lastDeposit;
            // 刷新押金列表
            this.getDepositList(this.resData);
            // 刷新客位显示
            this.$vemit('updatePoint');
            this.close();
          } else if (+res.result === -1) {
            this.$message({
              type: 'error',
              message: res.msg,
            });
          }
        });
      });
    },
    // 使用押金
    useDepoit() {
      // 如果是团队结算状态下不允许使用押金
      if (this.isTeamSettlementFlg === 1) {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error73')}`,
        });
        return;
      }
      const { depositMoney } = this;
      const { selectedPayway } = this;
      if (depositMoney > 0) {
        this.$emit('usedeposit', { depositMoney, selectedPayway });
        this.close();
      } else {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error74')}`,
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pay-deposit-hearder {
  padding: 12px 15px;
  font-size: 14px;
  > .title-list {
    margin-right: 20px;
  }
  > .table-number {
    padding-left: 24px;
    position: relative;
    color: #f06174;
    > i {
      background-image: url("~@/common/images/pos/exitBill/table-number.png");
      position: absolute;
      left: 0px;
      top: 1px;
      display: inline-block;
      width: 20px;
      height: 20px;
    }
  }
}

.content-warp {
  display: table;
  width: 100%;
  background-color: @white;
  > * {
    vertical-align: top;
    display: table-cell;
  }
}

.money-warp {
  position: relative;
  width: 280px;
  border-right: 1px solid #ddd;
  padding: 24px 16px;
  .form-item {
    margin-bottom: 14px;
  }
  .buttons-warp {
    width: 100%;
    overflow: hidden;
  }
  .button-content {
    float: left;
    width: 50%;
    padding: 6px;
  }
  button {
    width: 100%;
    height: 42px;
  }
  .keybord-content {
    margin: 20px 0 0;
    text-align: center;
  }
  .my-input-wrap {
    display: flex;
    align-items: center;
    position: relative;
    height: 40px;
    border: 1px solid #bbbbbb;
    padding: 3px;
    border-radius: 3px;
    input {
      width: 100%;
      padding-left: 105px;
      height: 38px;
      background-color: transparent;
      outline: none;
      border: none;
    }
  }
}

.list-warp {
  padding: 16px;
  position: relative;
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
  margin-top: 6px;
  color: @gray-dark;
  height: 306px;
  table {
    table-layout: fixed;
  }
  td {
    font-size: 12px;
    line-height: 1.5;
    padding: 8px 0 8px 8px;
  }
  tr {
    border-bottom: 1px solid #7bcad6;
    counter-increment: itemindex;
    vertical-align: middle;
    color: #333333;
    counter-increment: listIndex;
  }
  td.type-col::before {
    color: #333;
    font-weight: bold;
    content: counter(listIndex);
    padding-right: 12px;
  }
  tr.return-deposit {
    color: #ffa200;
  }
}

.type-col {
  width: 20%;
}
.money-col {
  width: 14%;
}
.payway-col {
  width: 16%;
  .text-overflow();
}
.time-col {
  width: 30%;
}

.no-item {
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding-top: 20px;
}

.pos-pager {
  position: absolute;
  bottom: 24px;
  right: 12px;
  width: 100%;
}

.deposit-payway-list {
  position: absolute;
  top: 25px;
  left: 73px;
  .size(36%, 38px) !important;
  border-radius: 4px;
  background-color: white;
  .text-overflow();
}

// 箭头按钮
.pos-takeout-pager {
  position: absolute;
  right: 0;
  bottom: 0;
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
<style lang="less">
.pay-deposit-modal {
  .text-right {
    .el-input__inner {
      text-align: right;
    }
  }
  .notAllowed {
    background-color:#e4e7ed;
    > input {
      background-color:#e4e7ed!important;
    }
  }
}
</style>
