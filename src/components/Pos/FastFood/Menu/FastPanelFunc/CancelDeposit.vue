<template>
<!-- title 退押金 -->
  <Dialog
    name="PosDialog.CancelDeposit"
    :title="$t('Biz.Order.ReturnDeposit')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="submit"
    :showSubmit="true"
    :hotkeys="submitHotKey"
    width="400px"
    top="16vh"
  >
    <div class="cancelDeposit-container">
      <div class="cancelDeposit-from">
        <!-- 提示- 退押金金额: -->
        <label>{{ $t('Biz.Order.ReturnDepositMoney') }}</label>
        <el-input v-judge type="text" class="cancelDeposit-input" v-num-keyboard:right v-model="cancelDepositMoney"></el-input>
      </div>
      <div>
        <!-- 提示  说明 -->
        <p>{{ $t('Dict.ExplainLabel') }}</p>
        <!--  提示 账单中退押金品项金额将以负数形式体现-->
        <p>{{ $t('Biz.Order.RnDepositExpnText') }}</p>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      cancelDepositMoney: '',
      pointId: '', // 客位Id
    };
  },
  computed: {
    submitHotKey() {
      return {
        PgDn: () => {
          this.submit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.cancelDepositMoney = '';
      this.pointId = this.resData.pointId;
    },
    submit() {
      if (this.cancelDepositMoney === '') {
        // 提示---必须填写退押金金额
        this.$message.error(this.$t('Biz.Order.RnDepositErrorMsg'));
        return;
      }

      const reg = /^[0-9]{0,6}(\.[0-9]{1,2})?$/g;
      if (!reg.test(Number(this.cancelDepositMoney))) {
        // 提示--请输入有效的非负数字,输入值不能超过999999.99， 并且小数不能超过2位
        this.$message({
          message: this.$t('Biz.Order.RnDepositErrorMsg01'),
          type: 'error',
        });
        return;
      }
      ajax('canyin.pos.cashdeposit.canceldeposit', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: {
          pointId: this.pointId,
          cancelMoney: this.cancelDepositMoney,
        },
      }).then((res) => {
        this.close();
        if (res.success) {
          this.$message.success(res.data.msg);
        } else {
          // 提示-- 退押金失败
          this.$message.error(res.msg ? res.msg : this.$t('Biz.Order.RnDepositErrorMsg02'));
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.cancelDeposit-container {
  padding: 20px;
  > .cancelDeposit-from {
    display: flex;
    width: 100%;
    margin-bottom: 60px;
    > label {
      // flex: 1;
      width: 135px;
      margin-bottom: 0px;
      line-height: 1.2;
      align-items: center;
      display: flex;
    }
    > .cancelDeposit-input {
      flex: 3;
    }
  }
}
</style>
