<template>
  <Dialog
    name="PosDialog.CashDeposit"
    :title="$t('Biz.Pos.More.ManagerLogDiv2')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="submit"
    :showSubmit="true"
    :hotkeys="submitHotKey"
    width="400px"
    top="16vh"
  >
    <div class="cash-deposit-wrapper">
      <form action="javascript:;" class="cash-deposit-form">
        <div class="form-group">
          <label>{{$t('Dict.BusinessDay01')}}</label>
          <el-date-picker
            v-judge
            class="bussiness-date"
            v-model="bussinessDate"
            type="date"
            placeholder="$t('Dict.SelectionDate')"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :editable="false"
            :clearable="false"
            @change="searchCashByDate"
          ></el-date-picker>
        </div>
        <div class="form-group">
          <label>{{$t('Biz.Pos.More.ManagerLogLabel7')}}</label>
          <input v-judge type="text" class="form-control" v-model="depositMoneyOne" :disabled="isDisableInput">
        </div>
        <div class="form-group">
          <label>{{$t('Biz.Pos.More.ManagerLogLabel8')}}</label>
          <input v-judge type="text" class="form-control" v-model="depositMoneyTwo" :disabled="isDisableInput">
        </div>
        <div class="form-group">
          <label>{{$t('Biz.Pos.More.ManagerLogLabel9')}}</label>
          <input v-judge type="text" class="form-control" v-model="depositMoneyThree" :disabled="isDisableInput">
        </div>
      </form>
      <div class="introduction">
        <span>{{$t('Biz.Pos.More.ManagerLogSpan3')}}</span>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import dateFormat from '@/common/js/dateformat';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog },
  mixins: [ DialogMixin ],
  data() {
    return {
      bussinessDate: '',
      depositMoneyOne: 0,
      depositMoneyTwo: 0,
      depositMoneyThree: 0,
      id: null,
    }
  },
  computed: {
    submitHotKey() {
      return {
        'PgDn': () => {
          console.log('确认');
        }
      }
    },
    formatedCurrentDate() {
      const now = Date.parse(new Date());
      return dateFormat('%Y-%M-%D', now);
    },
    isDisableInput() {
      return this.formatedCurrentDate !== this.bussinessDate;
    }
  },
  methods: {
    onOpen() {
      this.bussinessDate = this.formatedCurrentDate;
      this.searchCashByDate();
    },
    searchCashByDate() {
      ajax('canyin.pos.cashdeposit.changebizdate', {
        contentType: 'URLEncoded',
        data: {
          "bizDateStr": this.bussinessDate
        }
      }).then(data => {
        this.depositMoneyOne = data.depositMoneyOne;
        this.depositMoneyTwo = data.depositMoneyTwo;
        this.depositMoneyThree = data.depositMoneyThree;
        this.id = data.id;
      });
    },
    submit() {
      if (this.isInvalidNumber(this.depositMoneyOne) || this.isInvalidNumber(this.depositMoneyTwo) || this.isInvalidNumber(this.depositMoneyThree)) {
        this.$message.error(this.$t('Biz.Pos.PosMsg018'));
        return;
      }
      let pramas = {
        bizDateStr: this.bussinessDate,
        depositMoneyOne: this.depositMoneyOne,
        depositMoneyTwo: this.depositMoneyTwo,
        depositMoneyThree: this.depositMoneyThree,
      }
      if (this.id != null && this.id != 'null') {
        pramas.id = this.id;
      }
      ajax('canyin.pos.cashdeposit.cashdeposit', {
        contentType: 'paramsEncoded',
        needToken: true,
        data: pramas
      }).then(data => {
        this.$message.success(data.msg);
        this.close();
      })
    },
    isInvalidNumber(number) {
      return isNaN(number) || (number < 0 || number > 999999);
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.cash-deposit-wrapper {
  position: relative;
  padding: 16px;
  background-color: @white;
}

.cash-deposit-form {

  > .form-group {
    position: relative;
    margin-bottom: 18px;
    padding-left: 120px;
    padding-right: 28px;
      > label {
        position: absolute;
        left: 0;
        top: 0;
        .size(120px, 40px);
        line-height: 40px;
        margin-bottom: 0;
        font-weight: normal;
        .text-overflow();
      }

      > input {
        width: 100%;
        height: 40px;

        &:focus {
          border-color: @brand-primary;
          .box-shadow(inset 0 1px 5px #aff9ff);
        }
      }
  }
}

.introduction {
  padding-top: 6px;
  color: #666;
}
</style>
