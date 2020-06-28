<template>
  <Dialog
    name="PosDialog.bookedSearch"
    :title="$t('Biz.Settlement.BookedSearch')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    :submit-text="$t('Biz.Settlement.CreatedAccount')"
    width="610px"
    :hotkeys="hotkeys"
  >
    <div class="warp">
      <div class="searchBox clear">
        <!-- 预订单查询日期 -->
        <div class="table-ordersBox">
          <div class="table-datePicker datePicker-box">
            <el-date-picker
              v-model="searchDateVal"
              popper-class="pickerDatePopperClass"
              :picker-options="pickerDateBefore"
              :editable= "false"
              :clearable= "false"
              :placeholder="$t('Dict.SelectionDate')"
              type="date"
              ref="searchDateVal"
              size="small">
            </el-date-picker>
          </div>
        </div>
        <!-- 市别选择 -->
        <ul class="booking-dropdown-group businessShift-btnBox">
          <li class="dropdown-btnGroup businessShift-btn"
            :class="{'active': shiftActive == index }"
            v-for="(item, index) in shiftList"
            @click="shiftToggle(index)"
            :key="index">
            {{ item.name }}
          </li>
        </ul>
        <!-- 搜索框 -->
        <div class="queryKeyWord">
          <em class="icon icon-fangdajing"></em>
          <input type="text" v-model.trim="orderSearchTxt" :placeholder="$t('Biz.Booking.BookPerson') + '/' + $t('Dict.Telephone')">
          <span></span>
        </div>
        <!-- 查询按钮:条件依据日期和市别 -->
        <p class="queryBtn" @click="getBookedData">{{ $t('Dict.Search') }}</p>
      </div>
      <!-- table title:固定不翻页 -->
      <ul class="orderTable-title orderTable-row">
        <!-- 列表: ul循环行, li固定 -->
        <li class="orderTable-title-item orderTable-row-item textCenter"
          v-for="(item, index) in orderTableTitle"
          :key="index">{{ item }}
        </li>
      </ul>
       <!-- table 列表-->
      <div class="orderTable-listBox">
        <Paging
          :data="orderList"
          :itemWidth="574"
          :itemHeight="38"
          class="orderTable-pageContent"
          ref="accountBookedListRow"
          id="accountBookedList">
          <p
            slot-scope="props"
            class="orderTable-row">
            <span class="orderTable-row-item">{{ props.item.bookPerson }}</span>
            <span class="orderTable-row-item">{{ props.item.contactTel }}</span>
            <span class="orderTable-row-item">{{ props.item.expectArriveTimeStr }}</span>
            <span class="orderTable-row-item">{{ props.item.pointNameStr }}</span>
            <span class="orderTable-row-item listItemIndent">
              <el-radio v-model="checkItem" :label="props.item" v-autotest>&nbsp;</el-radio>
            </span>
          </p>
        </Paging>
        <PagingBtn
          ref="accountBookedListBtn"
          :showInfo="true"
          class="orderTable-pageBtn"></PagingBtn>
        <div class="tip-warp" v-if="orderList.length === 0">
          <div class="tip-content">
            <img class="document-icon" src="@/common/images/sl-msg/document-icon.png">
            <p>{{ $t('Dict.NoInfo') }}</p>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { isEmpty, isNaN } from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';

export default {
  components: { Dialog, Paging, PagingBtn },
  mixins: [DialogMixin],
  props: {
    bsId: {
      type: String,
    },
  },
  data() {
    return {
      searchDateVal: '',
      pickerDateBefore: {
        disabledDate(time) {
          return +time < new Date(new Date().toLocaleDateString()) - 1;
        },
      },
      shiftActive: 0,
      shiftList: [],
      orderSearchTxt: '',
      orderTableTitle: [
        this.$t('Biz.Booking.BookPerson'),
        this.$t('Dict.ContactNumber'),
        this.$t('Biz.Settlement.ArrivedTime'),
        this.$t('Biz.Booking.ChosenSeat'),
        this.$t('Dict.Choose'),
      ],
      checkItem: '',
      orderList: [],
    };
  },
  computed: {
    // 添加快捷键
    hotkeys() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      // 初始化数据
      this.searchDateVal = +new Date();
      this.shiftActive = 0;
      // 加载(市别)数据
      this.getShiftData();
    },
    // 查询 市别数据
    // 获取基本信息(加载执行)
    getShiftData() {
      ajax('canyin.pos.booking.getbasicinfo')
        .then((res) => {
          if (!isEmpty(res)) {
            this.shiftList = res.shiftList;
          } else {
            this.$message.warning(`${this.$t('Dict.AjaxMessage.Message9')}`);
          }
        });
    },
    // 市别切换
    shiftToggle(index) {
      this.shiftActive = index;
      // 清空 选中项
      this.checkItem = '';
    },
    // 时间格式(时间戳)转换为字符串'2000-01-01'(补0)
    dateFormatString(date) {
      // 变量'日期'赋值
      const ddate = new Date(date);
      // 变量'年'赋值
      const dy = ddate.getFullYear();
      // 变量'月'赋值并补'0'
      const dm = ddate.getMonth() + 1 < 10 ? `0${ddate.getMonth() + 1}` : ddate.getMonth() + 1;
      // 变量日赋值并补'0'
      const dd = ddate.getDate() < 10 ? `0${ddate.getDate()}` : ddate.getDate();
      return `${dy}-${dm}-${dd}`;
    },
    // 预订单的查询
    getBookedData() {
      const parmas = {
        bookTimeStr: this.dateFormatString(this.searchDateVal),
        shiftIdStr: this.shiftList[this.shiftActive].id,
        bsId: this.bsId,
      };
      // 判断额外参数,此参数二选一, 且非必填
      if (!isEmpty(this.orderSearchTxt)) {
        if (isNaN(this.orderSearchTxt)) {
          parmas.bookPerson = this.orderSearchTxt;
        } else {
          parmas.contactTel = this.orderSearchTxt;
        }
      }
      ajax('canyin.pos.booking.getorderlistunpaid',
        {
          contentType: 'json',
          data: { params: parmas },
        }).then((res) => {
        if (!isEmpty(res)) {
          this.orderList = res.data;
          // 清空选中项
          this.checkItem = '';
          setTimeout(() => {
            // 分页组件初始化后, 传入数据, 重新刷新分页计算
            this.$refs.accountBookedListRow.refresh();
            // 重新绑定 分页按钮和分页数据
            this.$refs.accountBookedListBtn.bind(this.$refs.accountBookedListRow);
          }, 0);
        } else {
          this.$message.warning(`${this.$t('Dict.AjaxMessage.Message9')}`);
        }
      });
    },
    // 新建账户(确认按钮触发)
    addNewAccount() {
      if (isEmpty(this.checkItem)) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning13')}`);
        return false;
      }
      const promise = new Promise((resolve, reject) => {
        ajax('canyin.pos.settlement.pay.insertbybookid', {
          params: {
            bookOrderId: this.checkItem.id,
            bsId: this.bsId,
          },
        }).then((res) => {
          if (!isEmpty(res)) {
            if (!res.update) {
              this.$message.success(`${this.$t('Biz.Settlement.Success8')}`);
              // 执行回调(传参,供刷新挂账账户接口使用)
              resolve(res.unpaidperson.bookOrderId);
            } else {
              this.$confirm(`${res.msg}`, `${this.$t('Dict.Tips')}`, {
                confirmButtonText: `${this.$t('Dict.Sure')}`,
                cancelButtonText: this.$t('Dict.Cancel'),
                type: 'warning',
              }).then(() => {
              // 执行回调(传参,供刷新挂账账户接口使用)
                resolve(res.unpaidperson.bookOrderId);
              }).catch(() => {
                const error = 1;
                reject(error);
              });
            }
          } else {
            const error = 2;
            reject(error);
          }
        });
      });
      return promise;
    },
    onClose() {
      // 清空数据
      this.orderList = [];
      this.orderSearchTxt = '';
      this.checkItem = '';
    },
    // 点击提交
    onSubmit() {
      this.addNewAccount().then((data) => {
        this.close();
        this.$emit('updateAccountList', data);
      },
      (error) => {
        if (error === 1) {
          this.$message.info(`${this.$t('Dict.Cancelled')}`);
        } else {
          this.$message.info(`${this.$t('Dict.AjaxMessage.Message9')}`);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/components/Pos/Booking/BookingCommon/common.less";

.warp {
  padding: 18px;
  .bgc(#fff);
}

.table-ordersBox {
  float: left;
  margin-right: 10px;
}

.datePicker-box {
  width: 142px;
  height: 36px;
  display: inline-block;
  vertical-align: middle;
}

.booking-dropdown-group {
  height: 36px;
  display: table;
  text-align: center;
  border-radius: 18px;
  .bgc(@toggleBtnBg);

  .dropdown-btnGroup {
    width: 25%;
    float: left;
    position: relative;
    cursor: pointer;
    border-right: 1px solid @rgba255-20;

    &:first-child {
      border-radius: 20px 0 0 20px;
    }

    &:last-child {
      border: none;
      border-radius: 0 20px 20px 0;
      &.lastItem {
        padding-right: 18px;

        .dropdown-btn-txt {
          > em {
            right: calc(4% + 18px);
          }
        }
      }
    }

    &.active {
      .bgc(@toggleBtnActive);

      .dropdown-btn-txt {
        > em:before {
          content: "\e8aa";
        }
      }
    }

    &.chartFilterRange .dropdown-btn-itemBox {
      width: 306%;

      .chartFilterRange-scale {
        width: 14px;
        height: 14px;
        float: left;
        display: block;
        margin-top: 34px;
        position: relative;
        .setFont(12px, #fff);

        .startSign,
        .endSign {
          position: absolute;
          color: @activeColor;
          .normalFont;
          bottom: 16px;
          right: -2px;
        }
        .endSign {
          left: -15px;
        }
      }
      .chartFilterRange-reWrite {
        width: 80%;
        float: left;
      }
    }

    .dropdown-btn-txt {
      width: 76%;
      max-width: 200px;
      height: 36px;
      margin: 0 auto;
      line-height: 36px;
      .setFont(14px, #273844);

      > em {
        position: absolute;
        right: 4%;
        top: 0;
      }
    }

    .dropdown-btn-itemBox {
      width: 440px;
      border-radius: 4px;
      position: absolute;
      top: 37px;
      left: 0;
      padding: 22px;
      .bgc(rgba(46, 74, 89, 0.95));
      cursor: default;
      z-index: 500;

      &.firstDropItem {
        left: 13px;
      }

      .dropdown-btn-item {
        float: left;
        margin: 0 30px 12px 0;
        color: #fff;
        cursor: pointer;

        > span {
          width: 18px;
          height: 18px;
          line-height: 14px;
          display: inline-block;
          margin-right: 6px;
          vertical-align: middle;
          border: 1px solid #9aa7af;
          border-radius: 3px;

          .checkSign {
            .setFont(12px, @activeColor);
          }
        }
      }

      .dropdown-btn-allOrNo {
        width: 100%;
        float: left;
        margin-top: 10px;
        text-align: left;
        color: @activeColor;

        > span {
          margin: 0 6px;
          cursor: pointer;
          &:active {
            border-bottom: 1px solid @activeColor;
          }
        }
      }
    }
  }
}

.businessShift-btnBox {
  // margin-top: 12px;
  float: right;

  .businessShift-btn {
    width: 105px;
    line-height: 36px;
    border-radius: 20px;
    border: none;
    color: #273844;

    &.active {
      border-radius: 20px;
      .bgc(@toggleBtnActive);
      color: #fff;
    }
  }
}

.queryKeyWord {
  width: 36%;
  height: 36px;
  position: relative;
  line-height: 36px;
  margin-top: 12px;
  padding-left: 16px;
  border-radius: 20px;
  float: left;
  color: #344b5b;
  .bgc(@toggleBtnBg);

  > em {
    float: left;
    font-size: 24px;
  }

  > input {
    width: 86%;
    border: none;
    z-index: 3;
    position: relative;
    padding-left: 6px;
    .bgc(transparent);

    &::-webkit-input-placeholder {
      color: #344b5b;
    }

    &:focus + span {
      border-color: @activeColor;
    }
  }

  > span {
    width: 100%;
    height: 100%;
    .positionTop;
    z-index: 1;
    border-radius: 20px;
    border: 1px solid transparent;
  }
}

.queryBtn {
  width: 72px;
  height: 36px;
  float: left;
  margin: 12px 0 0 38px;
  line-height: 36px;
  text-align: center;
  border-radius: 20px;
  .btnPress(@toggleBtnBg);
  cursor: pointer;
  .bgc(#0babb9);
  color: #fff;
}

.orderTable-row {
  width: 100%;
  height: 39px;
  line-height: 39px;
  border: 1px solid #ccc;
  border-top: none;
  font-size: 0;

  .orderTable-row-item {
    height: 38px;
    display: inline-block;
    padding: 0 4px;
    overflow: hidden;
    border-right: 1px solid #ccc;
    word-break: break-word;
    text-align: center;
    .setFont(12px, #273844);

    &:last-child {
      border-right: none;
    }

    &:nth-child(1),
    &:nth-child(3) {
      width: 18%;
    }

    &:nth-child(2),
    &:nth-child(4) {
      width: 27%;
    }

    &:nth-child(5) {
      width: 10%;
    }

  }

}

.listItemIndent{
  text-indent: 5px;
}
.orderTable-title {
  margin-top: 20px;
  .bgc(#65a4a9);
  border: 1px solid #ccc;

  .orderTable-title-item {
    border-right: 1px solid #ccc;
    color: white;
    &:last-child {
      border-right: none;
    }
  }
}

.orderTable-listBox {
  height: 280px;
  color: #273844;
  position: relative;

  .orderTable-row {
    &.active {
      .bgc(#65a4a9);
    }
  }

}

.orderTable-pageContent {
  height: 234px;
}

.orderTable-pageBtn {
  margin-top: 10px;
  text-align: right;
}
.tip-warp {
  position: absolute;
  margin: auto;
  top: 40px;
  left: 0;
  right: 0;
  text-align: center;
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


</style>

<style lang="less">
/* 覆盖element-ui dataPicker样式 */

.datePicker-box {
  > .el-date-editor {
    width: 142px;
    height: 36px;
  }
  .el-input__inner {
    width: 142px;
    height: 36px;
    border-radius: 40px;
  }
}
.pickerDatePopperClass {
  width: 280px;

  .el-date-table {
    width: 85%;
  }
  .el-date-table td {
    padding: 0;
  }
  .el-date-picker__header {
    margin-bottom: 0;
  }
  .el-picker-panel__content {
    margin-top: 0;
  }
}

.table-datePicker .el-input__inner {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: transparent;
  color: #273844;
}

.table-ordersBox .table-datePicker .el-input__inner {
  width: 150px;
  background-color: #c0dae0;
}

.table-dateInCol-box .el-dropdown {
  width: 84px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-color: transparent;
  color: #273844;
}

</style>
