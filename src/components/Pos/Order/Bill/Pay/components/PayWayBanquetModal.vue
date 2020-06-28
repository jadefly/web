<template>
  <Dialog
    name="PosDialog.PayWayBanquetModal"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayBanquetModal"
    :append-to-body="true"
    :showSubmit="true"
    width="618px"
  >
  <div class="content payway-banquet-modal">
    <div
      class="form"
      v-keyboard:keyboard="{ autoSelect: true }">
      <div class="money-item">
        <label class="item-title">{{$t('Biz.Settlement.PaymentAmount')}}</label>
        <div class="item-content">
          <!-- 请输入支付金额 -->
          <el-input
            id="PayWayBanquetInput"
            class="text-right"
            v-model="money"
            size="medium"
            :placeholder="$t('Dict.PleaseEnterPayAmount')"
            v-line
            v-judge
            v-autotest>
          </el-input>
        </div>
      </div>
      <div class="reason-item">
        <label class="item-title">{{$t('Biz.Settlement.FeastReasons01')}}</label>
        <div class="reason-list">
          <div
            class="btn-item"
            v-for="item in showReasons"
            :key="item.id"
          >
            <button
              class="btn btn-default"
              type="button"
              v-autotest
              :class="{'btn-primary':currentReason && currentReason.id === item.id}"
              @click="changeReason(item)"
            >{{item.name}}</button>
          </div>
        </div>
        <div
          class="pos-pager"
          v-show="reasonList.length > prePageSize">
          <div class="pos-takeout-pager">
            <span class="page-info">{{
              $t('Dict.PageStyle.Text1', {
                length: reasonList.length,
                currentPage,
                totalPage: pageCount(reasonList),
              })
            }}</span>
            <button href="javascript:;" class="prev" @click="upPage">
              <i class="el-icon-arrow-up"></i>
            </button>
            <button href="javasctipt:;" class="next" @click="downPage(reasonList)">
              <i class="el-icon-arrow-down"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="remark-item">
        <label class="item-title">{{$t('Dict.Remarkss')}}</label>
        <div>
          <el-input
            v-autotest
            v-model="remark"
            @focus="showAndroidInput('remark')"
            type="textarea"
            :maxlength="80"
            :autosize="{ minRows: 2, maxRows: 4}"
            :placeholder="$t('Biz.Settlement.FeastReasons')">
          </el-input>
        </div>
      </div>
    </div>
    <div class="info-keybord">
      <div class="money-info">
        <span class="title">{{$t('Biz.Settlement.AmountToPaid01')}}</span>
        <span class="line-through">
          <span class="money">{{amountToBePaid | keepTwo}}</span>
        </span>
      </div>
      <div class="keybord-content">
        <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
      </div>
    </div>
  </div>
  <AndroidInput ref="AndroidInput"></AndroidInput>
  </Dialog>
</template>

<script>
import { isNaN } from 'lodash';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';

export default {
  components: { Dialog, KeyBoard, AndroidInput },
  mixins: [DialogMixin, PageMixin, AndroidInputMixin],
  props: {
    bsData: {
      type: Object,
    },
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
  },
  data() {
    return {
      payWayInfo: {
        name: '',
      },
      reasonList: [],
      prePageSize: 6,
      currentReason: { id: null, name: '' },
      money: 0,
      remark: '',
    };
  },
  computed: {
    // 添加快捷键
    PayWayBanquetModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    showReasons() {
      return this.pagination(this.currentPage, this.prePageSize, this.reasonList);
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },
  methods: {
    changeReason(reason) {
      this.currentReason = reason;
    },
    onOpen() {
      this.payWayInfo = this.resData;
      this.currentReason = { id: null, name: '' };
      this.currentPage = 1;
      this.money = this.amountToBePaid;
      this.remark = '';
      // 每次打开, 选中输入框内容
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
      ajax('canyin.pos.settlement.pay.fetetypepayway', {
        params: {
          paywayid: this.payWayInfo.id,
          bsid: this.bsData.id,
        },
      }).then((data) => {
        data.treat.unshift({ id: null, name: this.$t('Dict.Null') });
        this.reasonList = data.treat;
      });
    },
    // 点击提交
    onSubmit(authCode = {}) {
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
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
      ajax('canyin.pos.settlement.judgeempifhaspaywayopset', {
        params: {
          payTypeId: this.resData.payway_type_id,
          payMoney: this.money,
          ...authCode,
        },
      }).then(() => {
        this.$emit('add-pay-way', {
          name: this.payWayInfo.name,
          payway_id: this.payWayInfo.id,
          payway_type_id: this.payWayInfo.payway_type_id,
          take_money: Number(this.money),
          is_confirm_delete: this.payWayInfo.isconfirmdelete,
          use_alone: this.payWayInfo.is_use_alone,
          isolpayway: this.payWayInfo.isolpayway,
          dis_name: this.currentReason.name === '' ? null : this.currentReason.name,
          remark: this.remark,
          reason_id: this.currentReason.id,
        });
        this.close();
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content{
  display: table;
  width: 100%;
  >*{
    display: table-cell;
    vertical-align: top;
  }
}
.form{
  width: 356px;
  background-color: @white;
  padding: 16px;
  border-right: 1px solid #ddd;
}
.money-item{
  margin-bottom: 16px;
  display: table;
  width: 100%;
  >*{
    display: table-cell;
  }
}
.item-title{
  font-size: 14px;
  color: #333;
  font-weight: normal;
}
.reason-item{
  margin-bottom: 16px;
}
.reason-list{
  margin: 0 -6px;
  height: 92px;
  .btn-item{
    padding: 6px;
    display: inline-block;
    width: 33.3%;
  }
  button{
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.info-keybord{
  background-color: #f5f5f5;
}
.money-info{
  line-height: 60px;
  border-bottom: 1px dashed #b5b5b5;
  padding: 0 16px;
  font-weight: bold;
  font-size: 14px;

  .title{
    color: #333;
  }
  .line-through{
    float: right;
    color: #ffffff;
    text-decoration: line-through;
  }
  .money{
    color: #0babb9;
  }
}
.keybord-content{
  padding: 20px 0;
  .keybord{
    text-align: center;
    margin: 0 auto;
  }
}

.pos-pager{
  position: relative;
  height: 50px;
}

// 箭头按钮
.pos-takeout-pager {
  position: absolute;
  right: 0;
  bottom: 12px;
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
}
</style>
<style lang="less">
.payway-banquet-modal{
  .text-right{
    .el-input__inner{
      text-align: right;
    }
  }
}
</style>
