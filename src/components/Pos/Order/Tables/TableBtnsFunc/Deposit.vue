<template>
  <Dialog
    name="PosDialog.Deposit"
    title="押金"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    @submit="submit"
    width="780px"
    submitId="orderDepositSubmit"
  >
    <div class="pay-deposit-hearder">
      <span class="table-number title-list"><i></i> {{ initData.pointName }}</span>
      <span class="title-list">开单时间：{{ initData.openTime }} </span>
      <span class="title-list">人数：{{ initData.peopleQty}}</span>
      <span class="title-list">押金合计：{{  initData.totalDeposit }}</span>
    </div>
    <div class="content-warp pay-deposit-modal">
      <div class="money-warp">
        <el-form
          ref="form"
          label-width="56px"
          label-position="left"
          v-keyboard:keyboard="{ autoSelect: true }"
          @submit.native.prevent>
          <el-form-item label="金额：" class="form-item text-right">
            <div class="my-input-wrap">
              <button
                id="orderDepositPayway"
                class="btn btn -default deposit-payway-list"
                @click="openPaywayList"
                v-if="selectedPayway && paywayList.length"
                :disabled="paywayDisabled"
                :title="selectedPayway.name">{{ selectedPayway.name }}</button>
              <input
                id="orderDepositInput"
                v-model="money"
                maxlength="15"
                placeholder='操作金额'
                @keyup="InputNumber('money', 2)"
                v-judge/>
            </div>
          </el-form-item>

        </el-form>

        <div class="buttons-warp">
          <div class="button-content">
            <button
              id="orderReturnDeposit"
              type="button"
              @click="changeStatus('returnDepoit')"
              class="btn btn-default"
              :class="{'btn-primary':currentStatus === 'returnDepoit'}">- 退押金</button>
          </div>
          <div class="button-content">
            <button
              id="orderLoginDeposit"
              type="button"
              @click="changeStatus('loginDepoit')"
              class="btn btn-default"
              :class="{'btn-primary':currentStatus === 'loginDepoit'}">+ 登记押金</button>
          </div>
        </div>
        <div class="keybord-content">
          <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
        </div>
      </div>
      <div class="list-warp">
        <div class="table-head">
          <table>
            <tr>
              <th class="type-col">押金类型</th>
              <th class="money-col">金额</th>
              <th class="payway-col">登记方式</th>
              <th class="time-col">登记时间</th>
              <th class="people-col">登记人</th>
            </tr>
          </table>
        </div>
        <div class="table-body">
          <table>
            <tr :class="{'return-deposit':item.type === 2}" v-for="item in showList" :key="item.id">
              <td class="type-col">{{item.typeName}}</td>
              <td class="money-col">{{item.deposit}}</td>
              <td class="payway-col">{{item.paywayname}}</td>
              <td class="time-col">{{item.createTime}}</td>
              <td class="people-col">{{item.emp}}</td>
            </tr>
          </table>
          <div class="no-item" v-if="depositList.length === 0 ">
            <p>未找到账户信息</p>
          </div>
        </div>
        <div class="pos-pager">
          <div class="pos-takeout-pager">
            <span class="page-info">
              {{$t('Dict.PageStyle.Text1', { length: depositList.length, currentPage: currentPage, totalPage: pageCount(depositList)})}}
            </span>
            <button
              href="javascript:;"
              class="prev"
              @click="upPage"><i class="el-icon-arrow-up"></i></button>
            <button
              href="javascript:;"
              class="next"
              @click="downPage(depositList)"><i class="el-icon-arrow-down"></i></button>
          </div>
        </div>
      </div>
    </div>
    <DepositPaywayList
      ref="depositPaywayList"
      name="depositPaywayList"
      type="order"></DepositPaywayList>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import PageMixin from '@/common/util/PaginationMixin';
import TableInfo from './Common/Info';
import { Message, MessageBox } from 'element-ui';
import { find } from 'lodash';
import DepositPaywayList from '@/components/Pos/Order/Bill/Pay/ActiveChildDialog/DepositPaywayList';

export default {
  components: {
    Dialog, KeyBoard, TableInfo, DepositPaywayList,
  },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      money: 0,
      depositList: [],
      prePageSize: 8,
      totalDeposit: 0,
      bsId: '',
      currentStatus: null,
      depositMoney: 0, // 押金金额
      paywayId: null, // 押金类型
      isExistPayWay: 0, // 是否存在结算方式
      pointInfo: {}, // 客位信息
      initData: {}, // 初始化信息
      paywayDisabled: false, // 下拉框禁用标志位
      // 押金类型列表
      paywayList: [
        // {
        //   id: "1",
        //   name: "人民币",
        //   pay_way_type_name: "现金",
        //   pay_way_type_code: "01",
        //   code: "01"
        // },
        // {
        //   id: "2",
        //   name: "银行卡",
        //   pay_way_type_name: "银行卡",
        //   pay_way_type_code: "02",
        //   code: "02"
        // }
      ],
      selectedPayway: {},
    };
  },
  computed: {
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.depositList);
    },
    // showOpenTime () {
    //   if (!this.pointInfo) return '';
    //   let date = new Date(this.pointInfo.openTime);
    //   let hour = this.addZero(date.getHours());
    //   let min = this.addZero(date.getMinutes());
    //   let second = this.addZero(date.getSeconds());
    //   return `${hour}:${min}:${second}`
    // }
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
      this.$refs.depositPaywayList.open(
        { paywayList: this.paywayList, paywayId: this.selectedPayway.id },
        {
          submit: (payway) => {
            this.paywayId = payway.id;
            this.findPaywayById();
          },
        },
      );
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
      if (this.currentStatus === 'returnDepoit') {
        this.returnDepoit();
      } else if (this.currentStatus === 'loginDepoit') {
        this.loginDepoit();
      }
    },
    getDepositList() {
      ajax('canyin.pos.depositdetail.depositdetailview', {
        params: {
          pointId: this.resData.id,
          teamBsIds: '',
        },
      }).then((data) => {
        this.depositList = data.details;
        this.paywayId = data.paywayId;
        this.paywayList = data.paywayList;
        this.totalDeposit = data.totalDeposit;
        this.bsId = data.bsId;
        this.initData = data;
        // 存在登陆押金 禁用押金方式的下拉
        // this.totalDeposit !== 0 ? this.paywayDisabled = true : this.paywayDisabled = false;
        this.paywayDisabled = this.totalDeposit !== 0;
        if (this.paywayList.length > 0) {
          // eslint-disable-next-line no-unused-expressions
          if(this.totalDeposit === 0){
            this.paywayId = this.paywayList[0].id
          }
          this.findPaywayById();
        }
      }).catch((errorCode, msg) => {
        this.close();
        MessageBox.alert(msg, '错误');
      });
    },
    onOpen() {
      this.pointInfo = this.resData;
      this.currentPage = 1;
      this.money = 0;
      this.currentStatus = null;
      this.isExistPayWay = this.resData.isExistPayWay;
      this.depositMoney = this.resData.depositMoney;
      this.getDepositList();
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
    // 通过id找到对应支付方式
    findPaywayById() {
      const selectedPayway = find(this.paywayList, { id: this.paywayId });
      if (selectedPayway) {
        this.selectedPayway = selectedPayway;
      } else {
        // eslint-disable-next-line prefer-destructuring
        this.selectedPayway = this.paywayList[0];
      }
    },
    // 验证押金金额是否正确
    validateMoney() {
      const { isExistPayWay } = this;
      if (isExistPayWay === 1) {
        this.$message.warning('请先删除结算方式,再进行操作.');
        return false;
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(Number(this.money))) {
        this.$message.warning('请输入正确数字格式');
        return false;
      }
      if (Number(this.money) <= 0) {
        this.$message.warning('请输入大于0的数字');
        return false;
      }
      if (Number(this.money) > 999999.99) {
        this.$message.warning('输入值不能超过999999.99，并且小数不能超过2位');
        return false;
      }
      if (this.money.toString().indexOf('.') !== -1 && +this.money !== 0) {
        const i = this.money.toString().indexOf('.');
        // eslint-disable-next-line no-restricted-globals
        if (this.money.substr(i + 1).length > 2 && !isNaN(Number(this.money))) {
          this.$message.warning('小数不能超过2位');
          return false;
        }
      }
      return true;
    },
    // 退押金
    returnDepoit(authData = {}) {
      if (!this.validateMoney()) return;
      if (this.totalDeposit - Number(this.money) < 0) {
        this.$message.warning('所退押金不能超过押金合计金额');
        return;
      }
      const { money } = this;
      const paywayName = this.selectedPayway.name ? this.selectedPayway.name : '人民币';
      this.$confirm(`本次退押金:${paywayName}${money},是否确认保存?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        showClose: false,
      }).then(() => {
        ajax('canyin.pos.depositdetail.depositdetail', {
          contentType: 'paramsEncoded',
          data: {
            pointId: this.resData.id,
            bsId: this.bsId,
            type: 2,
            deposit: this.money,
            paramFlag: 0,
            payWayId: this.selectedPayway.id,
            ...authData,
          },
        }).then((data) => {
          if (`${data.result}` === '1') {
            this.$emit('deposit', data.data.lastDeposit);
            // data.data.lastDeposit
            this.$message({
              type: 'success',
              message: '退押金成功!',
            });
            // 刷新押金列表
            this.getDepositList();
            // 刷新客位显示
            this.$vemit('updatePoint');
            this.close();
          } else if (`${data.result}` === '-1') {
            this.$message({
              type: 'success',
              message: data.msg,
            });
          }
        });
        // this.$message({
        //   type: 'success',
        //   message: '删除成功!'
        // });
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消删除'
        // });
      });
    },
    // 登记押金
    loginDepoit(authData = {}) {
      if (!this.validateMoney()) return;

      const { money } = this;
      const paywayName = this.selectedPayway.name ? this.selectedPayway.name : '人民币';
      this.$confirm(`本次登记押金:${paywayName}${money},是否确认保存?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        showClose: false,
      }).then(() => {
        ajax('canyin.pos.depositdetail.depositdetail', {
          contentType: 'paramsEncoded',
          data: {
            pointId: this.resData.id,
            bsId: this.bsId,
            type: 1,
            deposit: this.money,
            paramFlag: 0,
            payWayId: this.selectedPayway.id,
            ...authData,
          },
        }).then((data) => {
          if (`${data.result}` === '1') {
            this.$message.success('登记押金成功!');
            this.$emit('deposit', data.data.lastDeposit);
            // 记录押金金额
            this.depositMoney = data.data.lastDeposit;
            // 刷新押金列表
            this.getDepositList();
            // 刷新客位显示
            this.$vemit('updatePoint');
            this.close();
          } else if (`${data.result}` === '-1') {
            this.$message({
              type: 'error',
              message: data.msg,
            });
          }
        });
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消删除'
        // });
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

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
.content-warp {
  display: table;
  width: 100%;
  background-color: @white;
  > * {
    vertical-align: top;
    display: table-cell;
  }
}
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
  position: relative;
  height: 52px;
}

.deposit-payway-list {
  position: absolute;
  top: 0;
  left: 10px;
  .size(50%, 38px) !important;
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
}
</style>
