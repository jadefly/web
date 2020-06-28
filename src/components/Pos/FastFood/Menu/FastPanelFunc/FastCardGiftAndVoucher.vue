<template>
  <Dialog
    name="PosDialog.FastCardGiftAndVoucher"
    :title="$t('Biz.Settlement.OnlineGiftCertificate')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    top="10vh"
    width="750px"
  >
    <div class="content-warp">
      <div class="form-warp">
        <div class="form-area" v-keyboard:keyboard>
          <div class="form-item">
            <p class="form-title">{{$t('Biz.Settlement.EnterOnlineGiftCertificate')}}</p>
            <div class="valid-area">
              <div class="valid">
                <el-input
                  v-model="voucherNo"
                  ref="voucher"
                  :disabled="isCanDisabled"
                  @keyup.enter.native="voucherEnter"
                  :placeholder="$t('Biz.Coupon.EnterTicketNumber')"
                  v-judge
                ></el-input>
              </div>
              <div class="valid-btn">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="isCanDisabled"
                  @click="voucherEnter"
                  @keyup.enter="voucherEnter"
                >
                  {{$t('Dict.Btn.CheckCoupon')}}
                  <span class="btn-tip">(Enter)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="keyboard-area">
          <KeyBoard class="keyboard" ref="keyboard"></KeyBoard>
        </div>
      </div>
      <div class="info-warp">
        <div class="overview-item itemListPbottom">
          <p class="list-title">{{$t('Biz.Settlement.P03')}}</p>
          <div class="card-list">
            <!-- 礼品券 -->
            <div
              class="card-item"
              v-if="showList.length > 0"
              v-for="(item , index) in showList"
              :key="index"
            >
              <div class="charge-wrapper">
                <div class="money-info">
                  <p class="title">{{$t('Biz.Settlement.OnlineGiftCertificate')}}</p>
                  <p class="money">
                    {{item.itemPay}}
                  </p>
                </div>
                <div class="deduction-info">
                  <i class="el-icon-remove" @click="removeVoucher"></i>
                  <p class="code">{{item.goodsCode}}</p>
                  <p class="name">{{item.itemName}}</p>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="pos-pager">
            <div class="pos-takeout-pager">
              <span class="page-info">共{{list.length}}条，{{currentPage}}/{{pageCount(list)}}页</span>
              <button href="javascript:;" class="prev" @click="upPage">
                <i class="el-icon-arrow-up"></i>
              </button>
              <button href="javasctipt:;" class="next" @click="downPage(list)">
                <i class="el-icon-arrow-down"></i>
              </button>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { filter, difference } from 'lodash';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import PageMixin from '@/common/util/PaginationMixin';


export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      prePageSize: 5,
      voucherNo: '',
      bsId: '', // 营业流水Id
      pointId: '', // 客位Id
      paymentGetBillData: {}, // 结帐单所需要的数据
      isCanDisabled: false, // 输入框和验券按钮是否可点
      // isCanWriteinput:true,//输入框id
      voucherData: null, // 品项信息
      showVoucherList: [], // 券列表
    };
  },
  computed: {
    // 添加快捷键
    PayWayCoucouModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.list);
    },
    list() {
      return this.showVoucherList;
    },
  },
  methods: {
    onOpen() {
      // 客位Id
      this.pointId = this.resData.pointId;
      // 营业流水
      this.bsId = this.resData.bsId;
      // 核销所需要的基础数据
      this.params = this.resData.params;
      // 打开页面输入框默认获得焦点
      this.$nextTick(() => {
        this.$refs.voucher.focus();
      });
      // 打开页面请求打开页面接口
      ajax('canyin.pos.settlement.pay.coucoupayway.opencouponpage', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId,
        },
      }).then((res) => {
        if (res.success === true) {
          // 判断时是否有券信息
          if (res.data) { // 有上次已查询的券信息
            const voucher = JSON.parse(res.data);
            // 记录券信息
            this.voucherData = voucher.voucher[0];
            // 打开页面展现上次所选券信息
            this.showVoucherList = voucher.voucher;
            // this.isCanWriteinput = false;
            // 置灰输入框 验卡券
            this.isCanDisabled = true;
          }
        } else if (res.success === false) {
          this.$message.error(res.message);
        }
      });
    },
    voucherEnter() {
      // if (!this.isCanWriteinput) {
      //   return false;
      // }
      const ticketCode = this.inputValueTrim(this.voucherNo);
      const params = {
        bsId: this.bsId,
        ticketCode,
        requestFrom: 2,
        pageFrom: 0, // 礼品券页签
        needToPayAmount: '',
      };
      ajax('canyin.pos.settlement.pay.coucoupayway.selectcoupon', {
        data: params,
        contentType: 'URLEncoded',
      }).then((res) => {
        if (res.success === true) {
          // 记录查询成功后的券信息
          this.voucherData = res.data.voucher[0];
          // 品项券查询成功添加品相券查询信息
          const { voucher } = res.data;
          this.showVoucherList = voucher;
          // this.isCanWriteinput = false;
          // 置灰输入框 验卡券
          this.isCanDisabled = true;
        } else if (res.success === false) {
          this.$message.error(res.message);
        } else {
          this.$confirm(
            this.$t('Biz.Settlement.Tip54'),
            this.$t('Dict.Tips'),
            {
              confirmButtonText: this.$t('Dict.Sure'),
              type: 'warning',
              showClose: false,
              showCancelButton: false,
            },
          ).then(() => false);
        }
      });
    },

    // 删除礼品券
    removeVoucher(e) {
      // 过滤出所要删除的券
      const removeData = filter(
        this.showVoucherList,
        item => item.goodsCode === e.target.nextElementSibling.innerHTML,
      );
      // 剔除所要删除的券
      this.showVoucherList = difference(this.showVoucherList, removeData);
      this.currentPage = this.pageCount(this.list);
      // 恢复输入框 验卡券
      this.isCanDisabled = false;
      // 清除查券成功后记录的券信息
      this.voucherData = null;
      // 清除输入框券号
      this.voucherNo = '';
    },
    onSubmit() {
      const cardAndVouchers = [];
      this.list.forEach((value) => {
        cardAndVouchers.push({
          pwDetailId: value.pwdetailid,
        });
      });
      let items = null;
      if (this.voucherData != null) {
        items = [
          {
            itemId: this.voucherData.itemId,
            itemName: this.voucherData.itemName,
            itemPay: this.voucherData.itemPay,
            ticketCode: this.voucherData.ticketCode,
            goodsCode: this.voucherData.goodsCode,
            cardType: this.voucherData.cardType,
            paywayId: this.voucherData.paywayId,
            qty: 1,
            unitId: this.voucherData.unitId,
            itemType: 1,
          },
        ];
      }
      this.params.paywayId = this.voucherData == null ? '' : this.voucherData.paywayId;
      // 核销券的信息
      this.params.items = items;
      ajax('canyin.pos.settlement.pay.coucoupayway.ensurecoupon', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId,
          requestFrom: 2,
          pointId: this.pointId,
          params: JSON.stringify(this.params),
          charge: null,
          cardAndVouchers: JSON.stringify(cardAndVouchers),
        },
      }).then((res) => {
        if (res.success === true) {
          // 核销成功关闭页面
          this.close();
          if (this.voucherData !== null || this.voucherNo !== '') {
            this.$message.success(this.$t('Dict.SuccessfulSettlement'));
            // 清空刷新账单
            this.$vemit('fastClearEmptyBill');
            // 易盘数据计算进行初始
            // BillBsModule.endpayEasyData();
            const { pointId } = this;
            localStorage.setItem(`${pointId}Remark`, '');
            localStorage.setItem(`${pointId}buttonRemarks`, null);
          }
        } else if (res.success === false) {
          // 预核销失败
          this.$message.error(res.message);
        }
      });
    },

    onClose() {
      // 关闭清除所选券信息
      this.showVoucherList = [];
      // 恢复输入框 验卡券
      this.isCanDisabled = false;
      // 清空输入框信息
      this.voucherNo = '';
    },
    // 去除输入框值空格
    inputValueTrim(val) {
      let str = val;
      str = str.replace(/\s/g, '');
      return str;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

button .btn-tip {
  font-size: 12px;
  color: #eee;
}

.content-warp {
  display: table;
  width: 100%;
  font-size: 14px;
  > * {
    display: table-cell;
    vertical-align: top;
  }
}
.form-warp {
  width: 465px;
  background-color: @white;
  padding: 0 16px;
  border-right: 1px solid #ddd;
}

.form-area {
  height: 90px;
  .form-item {
    font-size: 14px;
    font-weight: bold;
  }
  .form-title {
    line-height: 2.4;
    color: #666;
    position: relative;
  }
}
.valid-area {
  display: table;
  width: 100%;
  > * {
    display: table-cell;
  }
  .valid {
    width: 320px;
  }
  .valid-btn {
    padding-left: 8px;
    vertical-align: middle;
    button {
      width: 100%;
      height: 40px;
    }
  }
}
.input-warning {
  font-size: 12px;
  color: #f00;
  font-weight: bold;
}
.keyboard-area {
  text-align: center;
  padding: 16px;
}
.keyboard {
  margin: 0 auto;
}
.info-warp {
  background-color: #f5f5f5;
  > .overview-item {
    padding: 12px;
  }
  > .itemListPbottom {
    padding-bottom: 0 !important;
  }
  .overview-item + .overview-item {
    border-top: 1px dashed #ddd;
  }
}
.money-item {
  font-size: 14px;
  line-height: 2;
  > span {
    display: inline-block;
  }
  span.title {
    color: #666;
    width: 30%;
  }
  .money {
    width: 70%;
    text-align: right;
    color: #666;
    font-size: 12px;
  }

  .to-be-pay,
  .danger,
  .be-paid {
    font-size: 18px;
    font-weight: bold;
  }
  .danger {
    color: #f00;
    vertical-align: top;
  }
  .be-paid {
    font-size: 20px;
    color: #0babb9;
  }
}
.list-title {
  font-size: 14px;
  color: #999;
}
.card-list {
  height: 300px;
  overflow: hidden;
}
.card-item {
  margin-top: 8px;
  > .charge-wrapper {
    > * {
      display: inline-block;
      vertical-align: middle;
      border-radius: 4px;
    }
    .online-card {
      background-color: #76cb37 !important;
    }
    .money-info {
      width: 28%;
      height: 52px;
      background-color: #ffb400;
      color: #ffffff;
      text-align: center;
      font-size: 12px;
      .title {
        line-height: 2.2;
      }
      .money {
        font-size: 18px;
        line-height: 1;
        .prefix {
          font-size: 12px;
        }
      }
    }
    .deduction-info {
      width: 72%;
      height: 52px;
      background-color: #fff;
      border: 1px solid #ddd;
      padding: 4px 8px;
      .code {
        font-size: 12;
        line-height: 1.3;
        color: #999;
      }
      .name {
        font-size: 14px;
        line-height: 1.5;
        color: #666;
      }
      .el-icon-remove {
        line-height: 36px;
        float: right;
        color: #ccc;
        font-size: 26px;
        cursor: pointer;
      }
    }
  }
}

.pos-pager {
  position: relative;
  height: 52px;
}

// 箭头按钮
.pos-takeout-pager {
  position: absolute;
  right: 0;
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
.warnInfo {
  > .el-input {
    > input {
      border: 1px solid red;
    }
  }
}
</style>
