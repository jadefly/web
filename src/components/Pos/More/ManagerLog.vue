<template>
  <Dialog
    name="PosDialog.managerLog"
    :title="$t('Biz.UserDesktop.ManagerDiary')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :closeByClickModel="false"
    :showSubmit="true"
    width="700px"
    height="630px"
    top="10vh"
  >
    <div class="bg">
      <div class="category">
        <div
          class="tab-item"
          :class='tab === 0 ? "active" : ""' @click="changeTab(0)"
        >{{$t('Biz.Pos.More.ManagerLogLabel2')}}</div>
        <div
          class="tab-item"
          :class='tab === 1 ? "active" : ""' @click="changeTab(1)"
        >{{$t('Biz.Pos.More.ManagerLogDiv1')}}</div>
        <div
          class="tab-item"
          :class='tab === 2 ? "active" : ""' @click="changeTab(2)"
        >{{$t('Biz.Pos.More.ManagerLogDiv2')}}</div>
      </div>
      <div class="body">
        <div class="item">
          <el-form
            :label-width="labelWidth"
            label-position="left"
            v-keyboard:keyboard="{ onlybind: 'key' }"
          >
            <el-form-item :label="$t('Dict.BusinessDay')">
              <el-date-picker
                v-model="data.businessDay"
                type="date"
                :editable="false"
                @change="getData"
                value-format="yyyy-MM-dd"
                :placeholder="$t('Dict.SelectionDate')">
              </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('Biz.Pos.More.ManagerLogLabel2')" v-show="tab === 0">
              <el-select
                v-model="data.weather"
                :placeholder="$t('Dict.PleaseChoose')"
                :disabled="disabled"
              >
                <el-option
                  input=false
                  v-for="(item, index) in weathers"
                  :key="index"
                  :label="item"
                  :value="index">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('Biz.Pos.More.ManagerLogLabel3')"
              v-show="tab === 0" prop="maxTemperature"
            >
              <span>{{$t('Biz.Pos.More.ManagerLogSpan1')}}</span>
              <el-input
                v-judge
                ref="maxTemp"
                name="maxTemperature"
                style="width: 10rem;"
                :disabled="disabled"
                v-model="data.maxTemperature"
                type="text"
                data-keyboard="key"
              ></el-input>
              <span>{{$t('Biz.Pos.More.ManagerLogSpan2')}}</span>
              <el-input
                v-judge
                name="minTemperature"
                style="width: 10rem;"
                :disabled="disabled"
                v-model="data.minTemperature"
                type="text"
                data-keyboard="key"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Dict.Remarks')" v-show="tab === 0">
              <el-input
                :disabled="disabled"
                type="textarea"
                :maxlength="80"
                :autosize="{ minRows: 2, maxRows: 2}"
                :placeholder="$t('Dict.EnterSomething')"
                v-model="data.remark"
                resize="none"
                @focus="handwriting(true)"
                @blur="handwriting(false)"
                data-keyboard="key"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Biz.Pos.More.ManagerLogLabel5')" v-show="tab === 1">
              <el-input
                ref="attendance"
                v-judge
                name="attendance"
                v-model="data.attendance"
                :disabled="disabled"
                type="text"
                data-keyboard="key"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Biz.Pos.More.ManagerLogLabel6')" v-show="tab === 1">
              <el-input
                v-judge name="workhours"
                v-model="data.workHours"
                :disabled="disabled"
                type="text"
                data-keyboard="key"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Biz.Pos.More.ManagerLogLabel7')" v-show="tab === 2">
              <el-input
                v-judge
                name="depositMoneyOne"
                v-model="cashData.depositMoneyOne"
                :disabled="disabled"
                type="text"
                ref="depositMoneyOne"
                data-keyboard="key"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Biz.Pos.More.ManagerLogLabel8')" v-show="tab === 2">
              <el-input
                v-judge
                name="depositMoneyTwo"
                v-model="cashData.depositMoneyTwo"
                :disabled="disabled"
                type="text"
                data-keyboard="key"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Biz.Pos.More.ManagerLogLabel9')" v-show="tab === 2">
              <el-input
                v-judge
                name="depositMoneyThree"
                v-model="cashData.depositMoneyThree"
                :disabled="disabled"
                type="text"
                data-keyboard="key"
              ></el-input>
            </el-form-item>
            <div class="introduction" v-show="tab === 2">
              <span>{{$t('Biz.Pos.More.ManagerLogSpan3')}}</span>
            </div>
            <KeyBoard ref="keyboard"></KeyBoard>
            <!-- <KeyboardNum class="keyboard" v-show="!disabled"></KeyboardNum> -->
          </el-form>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Vue from 'vue';
import { each } from 'lodash';
import dateFormat from '@/common/js/dateformat';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  name: 'managerLog',
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    needToken: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      data: {
        businessDay: '',
        weather: 0,
        workHours: '',
        minTemperature: '',
        tmpMin: '',
        maxTemperature: '',
        tmpMax: '',
        remark: '',
        attendance: '',
      },
      cashData: {
        depositMoneyOne: 0,
        depositMoneyTwo: 0,
        depositMoneyThree: 0,
        id: null,
      },
      disabled: true,
      weathers: [
        this.$t('Biz.Pos.More.ManagerLogWeather1'),
        this.$t('Biz.Pos.More.ManagerLogWeather2'),
        this.$t('Biz.Pos.More.ManagerLogWeather3'),
        this.$t('Biz.Pos.More.ManagerLogWeather4'),
        this.$t('Biz.Pos.More.ManagerLogWeather5'),
        this.$t('Biz.Pos.More.ManagerLogWeather6'),
        this.$t('Biz.Pos.More.ManagerLogWeather7'),
      ],
      tab: 0,
      today: '',
    };
  },
  computed: {
    labelWidth() {
      if (Vue.config.lang === 'enUS') {
        return '17rem';
      }
      return '8rem';
    },
  },
  methods: {
    changeTab(tab) {
      this.tab = tab;
      this.$nextTick(() => {
        if (this.tab === 0) {
          this.$refs.maxTemp.focus();
        } else if (this.tab === 1) {
          this.$refs.attendance.focus();
        } else if (this.tab === 2) {
          this.$refs.depositMoneyOne.focus();
        }
      });
    },
    handwriting(isOpen) {
      const { $devices } = this;
      const { Handwriting } = $devices;
      if (isOpen) {
        Handwriting.open();
      } else {
        Handwriting.close();
      }
    },
    async onOpen() {
      this.$nextTick(() => {
        this.$refs.maxTemp.$el.children[0].focus();
      });
      this.tab = 0;
      this.today = dateFormat('%Y-%M-%D');
      this.$set(this.data, 'businessDay', dateFormat('%Y-%M-%D'));
      this.getData();
    },
    isNumber(number) {
      const reg = /^(\-|\+)?\d+(\.\d+)?$/g;
      return reg.test(number);
    },
    isPositiveInteger(number) {
      const reg = /^[1-9]\d*$/g;
      return reg.test(number);
    },
    isPositiveNumber(number) {
      const reg = /^(\+)?\d+(\.\d+)?$/g;
      return reg.test(number);
    },
    onSubmit() {
      const {
        minTemperature, maxTemperature, businessDay, remark, attendance, workHours,
      } = this.data;

      if (businessDay === null || businessDay === undefined || businessDay === '') {
        this.$alert(this.$t('Biz.Pos.More.ManagerLogMsg1'));
        return;
      }
      if (maxTemperature && (maxTemperature.length > 10 || !this.isNumber(maxTemperature))) {
        this.$alert(this.$t('Biz.Pos.More.ManagerLogMsg2'));
        return;
      }
      if (maxTemperature && (minTemperature.length > 10 || !this.isNumber(minTemperature))) {
        this.$alert(this.$t('Biz.Pos.More.ManagerLogMsg3'));
        return;
      }
      if (+minTemperature > +maxTemperature) {
        this.$alert(this.$t('Biz.Pos.More.ManagerLogMsg4'));
        return;
      }
      if (remark && remark.length > 50) {
        this.$alert(this.$t('Biz.Pos.More.ManagerLogMsg5'));
        return;
      }
      if (attendance && (attendance.length > 10 || !this.isPositiveInteger(attendance))) {
        this.$alert(this.$t('Biz.Pos.More.ManagerLogMsg6'));
        return;
      }
      if (workHours && (workHours.length > 10 || !this.isPositiveNumber(workHours))) {
        this.$alert(this.$t('Biz.Pos.More.ManagerLogMsg7'));
        return;
      }
      const postData = {
        businessDay: this.data.businessDay,
        weather: +this.data.weather,
        workHours: +this.data.workHours,
        minTemperature: +this.data.minTemperature,
        maxTemperature: +this.data.maxTemperature,
        remark: this.data.remark,
        attendance: +this.data.attendance,
      };
      ajax('canyin.pos.managerlog.addmanagerlog', {
        contentType: 'paramsEncoded',
        data: postData,
      }).then(async (res) => {
        if (res.code === '1') {
          if (res.data.success) {
            this.$message({
              message: res.data.data.msg,
              type: 'success',
            });
            await this.submitCashDeposit();
            this.close();
          } else {
            this.$message.error(res.data.msg ? res.data.msg : this.$t('Dict.SystemError'));
          }
        }
      });
    },
    getData() {
      this.disabled = this.today !== this.data.businessDay;
      if (!this.data.businessDay) {
        return;
      }
      this.searchCashByDate();
      ajax('canyin.pos.managerlog.getmanagerlog', {
        method: 'get',
        params: {
          businessDay: this.data.businessDay,
        },
      }).then((res) => {
        if (res.data) {
          this.data = {
            businessDay: this.data.businessDay,
            attendance: res.data.attendance,
            maxTemperature: res.data.maxTemperature,
            minTemperature: res.data.minTemperature,
            remark: res.data.remark,
            weather: +res.data.weather,
            workHours: res.data.workHours,
          };
        } else {
          this.data = {
            businessDay: this.data.businessDay,
            attendance: '',
            maxTemperature: '',
            minTemperature: '',
            remark: '',
            weather: 0,
            workHours: '',
          };
        }
      });
    },
    searchCashByDate() {
      ajax('canyin.pos.cashdeposit.changebizdate', {
        contentType: 'URLEncoded',
        data: {
          bizDateStr: this.data.businessDay,
        },
      }).then((data) => {
        this.cashData.depositMoneyOne = data.depositMoneyOne;
        this.cashData.depositMoneyTwo = data.depositMoneyTwo;
        this.cashData.depositMoneyThree = data.depositMoneyThree;
        this.cashData.id = data.id;
      });
    },
    submitCashDeposit() {
      const {
        depositMoneyOne, depositMoneyTwo, depositMoneyThree, id,
      } = this.cashData;
      if (!this.validateCash([depositMoneyOne, depositMoneyTwo, depositMoneyThree])) {
        this.$message.error(this.$t('Biz.Pos.More.ManagerLogMsg8'));
        return Promise.reject();
      }
      const pramas = {
        bizDateStr: this.data.businessDay,
        depositMoneyOne,
        depositMoneyTwo,
        depositMoneyThree,
      };
      if (id != null && id !== 'null') {
        pramas.id = id;
      }
      return ajax('canyin.pos.cashdeposit.cashdeposit', {
        contentType: 'paramsEncoded',
        needToken: this.needToken,
        data: pramas,
      });
    },
    validateCash(cashArray) {
      let result = true;
      cashArray.forEach((cash) => {
        if (cash && (cash.length > 10 || !this.isPositiveNumber(cash))) {
          result = false;
        }
      });
      return result;
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.el-form-item__content {
  display: inline-block;
}
.el-form-item__label {
  width: 8rem;
}
.el-input, .el-textarea {
  display: inline-block;
  width: 25rem;
}
.el-form {
  width: 508px;
}
.category{
  width: 112px;
  height: 575px;
  background-color: @white;
  box-shadow: 6px 0px 8px #777;
  z-index: 1;
  float: left;
  .tab-item{
    color: #666;
    font-size: 14px;
    line-height: 3.7;
    text-align: center;
    cursor: pointer;
    &.active{
      background-color: #ddf1f6;
      color: #0babb9;
    }
  }
}
.body {
  margin-top: 10px;
  margin-left: 40px;
  display: inline-block;
}
.keyboard {
  margin-left: 8rem;
}
</style>
