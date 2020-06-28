<template>
  <Dialog
    ref="dialog"
    width="670px"
    submitId="payWaySSDDepositModal"
    name="PosDialog.PayWaySSDDepositModal"
    :title="payWayInfo.name + $t('Dict.Btn.WriteOff')"
    :hotkeys="PayWaySSDDepositModal"
    :append-to-body="true"
    :showSubmit="true"
    @submit="onSubmit"
    @close="onClose"
    @open="onOpen"
  >
    <div class="content payway-rmb-modal">
      <div class="form">
        <div class="money-item">
          <p class="item-title">{{ $t('Biz.Settlement.IndexMsg11') }}</p>
          <div class="item-content">
            <el-input
              id="RMBMoneyInput"
              v-model="payCode"
              size="medium"
              :placeholder="$t('Biz.Settlement.IndexMsg10')"
              v-line
              v-judge
              v-keyboard:keyboard="{ autoSelect: true }"
            ></el-input>
          </div>
          <button
            type="button"
            class="btn btn-primary verifiy-btn"
            @click="writeOff"
            v-autotest
          >{{ $t('Dict.Btn.WriteOff') }}(Enter)</button>
        </div>
        <div class="money-listarea">
          <p class="list-title">{{
            $t('Biz.Settlement.SSDTip01') }}
            <span>{{
              couponList.length }}{{ $t('Dict.Strip') }}</span></p>
          <ul class="list-box">
            <li
              class="list-item"
              :key="index"
              v-for="(item, index) in showList"
              >
              <div class="line">
                <span class="upCircle"></span>
                <span class="dnCircle"></span>
              </div>
              <p>
                <span>{{ $t('Biz.Settlement.SSDTip02') }}</span>
                <span class="value">{{ item.payMoney }}</span>
              </p>
              <p>
                <span>{{ $t('Biz.Settlement.SSDTip03') }}</span>
                <span class="value">{{ PayCodeStyle(item.payCode) }}</span>
              </p>
              <em
                class="delete-btn el-icon-remove"
                @click="deleteItem(item)"></em>
            </li>
          </ul>
          <!-- 分页 -->
          <div class="list-pager">
              <span class="page-info">{{
                $t('Dict.PageStyle.Text1', {
                  length: couponList.length,
                  currentPage,
                  totalPage: pageCount(couponList),
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
                @click="downPage(couponList)">
                <i class="el-icon-arrow-down"></i></button>
            </div>
        </div>
      </div>
      <div class="info-keybord">
        <div class="money-info">
          <span class="title">{{ $t('Biz.Settlement.AmountToPaid01') }}</span>
          <span class="line-through">
            <span class="money">{{ shouldPayMoney | keepTwo }}</span>
          </span>
        </div>
        <div class="money-info">
          <span class="title">{{ $t('Biz.Settlement.SSDTip04') }}</span>
          <span class="line-through">
            <span class="money">{{ registeredMoney | keepTwo }}</span>
          </span>
        </div>
        <div class="keybord-content">
          <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import { isNaN, reject } from "lodash";
import { mapState, mapGetters } from 'vuex';
import { add, sub } from '@/common/js/math';
import Pager from '@/components/Pos/Common/Pager';
import PageMixin from '@/common/util/PaginationMixin';
import Dialog from "@/components/Pos/Common/Dialog";
import DialogMixin from "@/components/Pos/Common/DialogMixin";
import KeyBoard from "@/components/Pos/Common/KeyBoard";
import numberformat from "@/common/js/numberformat";

export default {
  components: { Pager, Dialog, KeyBoard },
  mixins: [PageMixin, DialogMixin],
  props: {
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
    pointId: {
      type: String,
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
    teamBsIds: {
      type: String,
      default() {
        return '';
      },
    },
    // 是否勾选团队结算
    isSelectTeamBtn: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      payWayInfo: {
        name: "食尚订订金"
      },
      payCode: null, // 当前付款码
      prePageSize: 2, // 页数量
      shouldPayMoney: 0, // 待付
      couponList: [], // 已核销列表
    };
  },
  filters: {
    keepTwo(val) {
      if (isNaN(Number(val))) return val;
      return numberformat(val);
    }
  },
  computed: {
    ...mapGetters([
      'posInfo',
    ]),
    ...mapGetters('fastFood', [
      'saleTypeId',
    ]),
    ...mapState('fastFood', [
      'orderCode',
    ]),
    // 添加快捷键
    PayWaySSDDepositModal() {
      return {
        Enter: () => {
          this.writeOff();
        }
      };
    },
    // 显示列表
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.couponList);
    },
    // 已核销金额
    registeredMoney() {
      let val = 0;
      if (this.couponList.length) {
        this.couponList.forEach((item) => {
          val = add(val, item.payMoney);
        });
      }
      return val;
    },
  },
  watch: {
    amountToBePaid(val) {
      this.shouldPayMoney = val;
    }
  },
  methods: {
    onOpen() {
      ajax('canyin.pos.settlement.pay.shishangdingdeposit.shishangdingdepositview', {
        params: {
          bsId: this.bsData.id,
        },
      }).then((data) => {
        if (data && data.result === -2) {
          this.$vemit('posAuthCheck', { message: data.msg });
          return false;
        }
        if (data && data.bizTsPwSsddjDTOList.length) {
          this.couponList = data.bizTsPwSsddjDTOList;
        }
      });
      // 只有从结算界面打开才是本位币功能，这里为了区分其他公用此组件的地方
      this.payWayInfo = this.resData.payWayInfo;
      this.shouldPayMoney = this.amountToBePaid;
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    onSubmit() {
      this.close();
    },
    onClose() {
      this.currentPage = 1;
      this.payCode = null;
      this.couponList = [];
      this.shouldPayMoney = 0;
    },
    // 付款码显示处理
    PayCodeStyle(val) {
      return String(val).replace(/(.{4})/g,"$1 ");
    },
    // 执行核销
    writeOff(authCode = {}) {
      if (isNaN(+this.payCode)) {
        this.$message.warning(this.$t("Biz.Settlement.Warning16"));
        return false;
      }
      if (!this.payCode) {
        this.$message.warning(this.$t("Biz.Settlement.SSDTip06"));
        return false;
      }
      this.$vonce('authCode', (code) => {
        this.writeOff(code);
      });
      const params = this.packParams();
      // 计算未付金额
      params.remainPayMoney = this.shouldPayMoney;
      ajax('canyin.pos.settlement.pay.shishangdingdeposit.verifysettle', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data && data.result === -2) {
          this.$vemit('posAuthCheck', { message: data.msg });
          return false;
        }
        if (data && data.bizTsPwSsddjDTOList.length) {
          this.couponList = data.bizTsPwSsddjDTOList;
          this.payCode = null;
          this.submit();
          this.$message.success(this.$t('Biz.Settlement.writtenOffOk'));
        }
      });
    },
    // 取消单条核销,并删除
    deleteItem(item, authCode = {}) {
      this.$vonce('authCode', (code) => {
        this.deleteItem(item, code);
      });
      const params = this.packParams();
      params.payCode = item.payCode;
      params.payMoney = item.payMoney;
      params.takeMoney = params.payMoney;
      ajax('canyin.pos.settlement.pay.shishangdingdeposit.cancelssddj', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data && data.result === -2) {
          this.$vemit('posAuthCheck', { message: data.msg });
          return false;
        }
        this.payCode = null;
        this.submit();
        this.couponList = reject(this.couponList, ['id', item.id]);
        this.$message.success(this.$t('Biz.Settlement.SSDTip05'));
      });
    },
    packParams(callback) {
      const tmp = {
        payCode: this.payCode,
        remainPayMoney: 0,
        paywayId: this.payWayInfo.id,
        pointId: this.pointId,
        bsId: this.bsData.id,
        bsCode: this.bsData.code,
        totalInvoiceMoney: 0,
        invoiceMoney: 0,
        tearingInvoiceMoney: 0,
        invoiceRemark: '',
        tsRemark: '',
        lastTotal: this.bsData.last_total,
        giveChange: 0,
        modifyTime: this.bsData.modify_time,
        orderCode: this.posInfo.controlMode === '3' ? this.orderCode : '',
        saleTypeId: this.posInfo.controlMode === '3' ? this.saleTypeId : 1,
        paramFlag: 0,
        controlMode: this.posInfo.controlMode,
        takeMoney: 0,
        payMoney: 0,
        // 强行判断是否团队
        isSelectTeamBtn: this.bsData.teamBsIds ? this.isSelectTeamBtn : !!this.bsData.teamBsIds,
        teamSettlementFlg: !!this.bsData.teamBsIds,
        teamBsIds: this.bsData.teamBsIds || '',
        teamPointIds: this.bsData.teamPointIds || '',
      };
      // 获取结算页面,组装的已加结算方式数据的组织结构
      this.$emit('componentGetPayWayList', (data) => {
        // 已使用的结算方式数据列表, 去除第三方订金数据
        tmp.payway_list = reject(data, ['payway_type_id', '520']);
      });
      return tmp;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content {
  display: table;
  width: 100%;
  > * {
    display: table-cell;
    vertical-align: top;
  }
}

.form {
  width: 404px;
  padding: 16px 24px;
  position: relative;
  background-color: @white;
  border-right: 1px solid #ddd;
}

.money-item {
  margin-bottom: 20px;
  display: table;
  width: 100%;
  // >*{
  //   display: table-cell;
  // }
}

.item-title {
  width: 100%;
  display: table-caption;
  margin-bottom: 12px;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.item-content {
  width: 252px;
  display: table-cell;
  vertical-align: middle;
}

.verifiy-btn {
  display: table-cell;
  // float: right;
  margin-left: 20px;
}

.danger {
  color: #fe0000;
  font-weight: bold;
}

.info-keybord {
  background-color: #f5f5f5;
}

.money-info {
  position: relative;
  // line-height: 60px;
  border-bottom: 1px dashed #b5b5b5;
  padding: 12px 16px;
  font-weight: bold;
  font-size: 14px;

  &:first-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .title {
    color: #333;
  }

  .line-through {
    float: right;
    color: #ffffff;
    text-decoration: line-through;
  }

  .money {
    color: #0babb9;
  }
}
.money-listarea {
  .list-title {
    margin-bottom: 12px;
    font-size: 16px;
    color: #999;
  }

  .list-box {
    font-size: 15px;
  }

  .list-item {
    width: 100%;
    position: relative;
    padding: 6px 30px 6px 32px;
    border-radius: 3px;
    border: 1px solid #42bbc6;

    &:first-child {
      margin-bottom: 18px;
    }

    > p {

      &:first-child {
        margin-bottom: 8px;
      } 

      .value {
        color: #42bbc6;
      }
    }

    .line {
      width: 1px;
      height: 100%;
      position: absolute;
      top: 0;
      left: 22px;
      border-left: 1px dashed #42bbc6;

      > span {
        display: block;
        width: 10px;
        height: 5px;
        border: 1px solid #42bbc6;
        background-color: #fff;
        position: absolute;
        z-index: 20;
      }
      .upCircle {
        top: -1px;
        left: -5px;
        border-top: none;
        border-radius: 0 0 10px 10px;
      }

      .dnCircle {
        bottom: -1px;
        left: -5px;
        border-bottom: none;
        border-radius: 10px 10px 0 0;
      }
    }
  }
  .delete-btn {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 20px;
    color: #ccc;
  }
}

// 箭头按钮
.list-pager {
  position: absolute;
  right: 24px;
  bottom: 20px;

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
.keybord-content {
  padding: 20px 0;

  .keybord {
    text-align: center;
    margin: 0 auto;
  }
}

</style>
