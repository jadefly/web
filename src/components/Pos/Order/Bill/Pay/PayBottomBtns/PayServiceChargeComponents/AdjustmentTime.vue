<template>
  <Dialog
    name="PosDialog.adjustment"
    :title="$t('Biz.Settlement.AdjustmentTiming')"
    footer=""
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="adjustment"
    :append-to-body="true"
    :showSubmit="true"
    top="25vh"
    width="660px">
  <div class="adjustment-container">
    <div class="plan">
      <span class="inline-block margin-180">{{$t('Biz.Settlement.BillingPlan')}}</span>
      <el-select v-model="currentPlanId" :placeholder="$t('Dict.PleaseChoose')">
        <el-option
          v-for="item in planDataList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </div>
    <div class="time">
      <span class="inline-block margin-180">{{$t('Biz.Settlement.BillingTime2')}}</span>
      <span>{{ feeTime }}</span>
    </div>
    <el-form class="margin-t-15" :model="ruleForm" :rules="rules" ref="ruleForm">
      <div class="start-time">
        <span class="block margin-b-15">{{$t('Dict.StartTime')}}</span>
        <div class="picker-wrap">
          <el-form-item prop="startDate" class="date">
            <el-date-picker
              class="margin-30"
              v-model="ruleForm.startDate"
              type="date"
              :placeholder="$t('Dict.SelectionDate')">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="startTime" class="time">
            <el-time-picker
              arrow-control
              v-model="ruleForm.startTime"
              :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
              :placeholder="$t('Dict.SelectionTime')">
            </el-time-picker>
          </el-form-item>
        </div>
      </div>
      <div class="end-time">
        <span class="block margin-b-15">{{$t('Dict.EndTime')}}</span>
        <div class="picker-wrap">
          <el-form-item prop="endDate" class="date">
            <el-date-picker
              class="margin-30"
              v-model="ruleForm.endDate"
              type="date"
              :placeholder="$t('Dict.SelectionDate')">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="endTime" class="time">
            <el-time-picker
              arrow-control
              v-model="ruleForm.endTime"
              :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
              :placeholder="$t('Dict.SelectionTime')">
            </el-time-picker>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <div class="other-rules">
      <div class="rule">{{$t('Biz.Settlement.AddRule')}}</div>
      <div class="rule">
        <el-radio-group v-model="ruleForm.rule1">
          <el-radio :label="1">{{$t('Biz.Settlement.RuleOne')}}</el-radio>
          <el-radio :label="1">{{$t('Biz.Settlement.RuleTwo')}}</el-radio>
        </el-radio-group>
      </div>
      <div class="rule" v-if="moreThan30">
        <el-radio-group v-model="ruleForm.rule2">
          <el-radio :label="1">{{$t('Biz.Settlement.RuleThree')}}</el-radio>
          <el-radio :label="1">{{$t('Biz.Settlement.RuleFour')}}</el-radio>
        </el-radio-group>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import dateFormat from '@/common/js/dateformat';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      ruleForm: {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        rule1: '',
        rule2: '',
      },
      rules: {
        startDate: [
          {
            type: 'date', required: true, message: `${this.$t('Dict.Validate.DataModuleMsg1')}`, trigger: 'change',
          },
        ],
        startTime: [
          {
            type: 'date', required: true, message: `${this.$t('Dict.Validate.DataModuleMsg2')}`, trigger: 'change',
          },
        ],
        endDate: [
          {
            type: 'date', required: true, message: `${this.$t('Dict.Validate.DataModuleMsg3')}`, trigger: 'change',
          },
        ],
        endTime: [
          {
            type: 'date', required: true, message: `${this.$t('Dict.Validate.DataModuleMsg4')}`, trigger: 'change',
          },
        ],
      },
      moreThan30: false,
      planDataList: [], // 所有方案列表
      currentPlanData: null, // 当前所选方案
      currentPlanId: '', // 当前所选方案的id
      isOpenChange: false,
      feeTime: '', // 计费时长
    };
  },
  computed: {
    // 添加快捷键
    adjustment() {
      return {
        // 确认
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  watch: {
    currentPlanId(newV, oldV) {
      if (Object.is(newV, oldV)) return;
      if (this.isOpenChange) return;
      this.planDataList.map((item) => {
        if (item.id === newV) {
          this.currentPlanData = item;
          this.currentPlanId = item.id;
          Object.assign(this.ruleForm, {
            rule1: item.addRulesFlg1 + 1,
            rule2: item.addRulesFlg2 + 1,
          });
          this.moreThan30 = item.chargeInterval > 30;
        }
        return item;
      });
    },
  },
  methods: {
    onClose() {
      Object.assign(this.ruleForm, {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        rule1: '',
        rule2: '',
      });
      this.planDataList = [];
      this.currentPlanId = '';
      this.feeTime = '';
      this.moreThan30 = false;
    },
    onOpen() {
      this.isOpenChange = true;
      const { roomData, ajaxData } = this.resData;
      const { chargePlanList, serviceFeeInfo } = ajaxData;
      this.planDataList = chargePlanList;
      this.feeTime = roomData.billTime;
      chargePlanList.map((item) => {
        if (item.id === roomData.chargePlanId) {
          this.currentPlanData = item;
          this.currentPlanId = item.id;
          this.moreThan30 = item.chargeInterval > 30;
        }
        return item;
      });
      const tmpBeginTime = `${serviceFeeInfo.beginTime.split('T')[0]}T00:00:00`;
      const tmpEndTime = `${serviceFeeInfo.endTime.split('T')[0]}T00:00:00`;
      Object.assign(this.ruleForm, {
        startDate: new Date(tmpBeginTime),
        endDate: new Date(tmpEndTime),
        startTime: new Date(serviceFeeInfo.beginTime),
        endTime: new Date(serviceFeeInfo.endTime),
        rule1: serviceFeeInfo.addRulesFlg1 + 1,
        rule2: serviceFeeInfo.addRulesFlg2 + 1,
      });
      this.$nextTick(() => {
        this.isOpenChange = false;
      });
    },
    onSubmit() {
      this.handleChangeDate('ruleForm');
    },
    handleChangeDate(formName, authData = {}) {
      const { rule1, rule2 } = this.ruleForm;
      const {
        startDateMs, startTimeMs, endDateMs, endTimeMs, beginDate,
        dataEndDate, beginTime, dataEndTime,
      } = this.formatDate();
      if (startDateMs > endDateMs) {
        this.$message.error(`${this.$t('Biz.Settlement.Error81')}`);
        return;
      }
      if (startDateMs === endDateMs) {
        if (startTimeMs >= endTimeMs) {
          this.$message.error(`${this.$t('Biz.Settlement.Error81')}`);
          return;
        }
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$vonce('authCode', (code) => {
            this.handleChangeDate(formName, code);
          });
          ajax('canyin.pos.settlement.servicefee.modifyservicefee', {
            contentType: 'paramsEncoded',
            data: {
              pointId: this.resData.baseData[0],
              bsId: this.resData.baseData[1],
              chargePlanId: this.currentPlanId,
              beginTime: `${beginDate} ${beginTime}`,
              endTime: `${dataEndDate} ${dataEndTime}`,
              addRulesFlg1: rule1 - 1,
              addRulesFlg2: rule2 - 1,
              ...authData,
            },
          }).then((res) => {
            if (+res.result === 1) {
              this.$message.success(`${this.$t('Biz.Settlement.Success36')}`);
              this.close();
              this.$emit('refresh');
            } else if (+res.result === -2) {
              this.$vemit('posAuthCheck', { message: res.msg });
            } else {
              this.$message.error(`${res.msg}`);
            }
          });
        } else {
          console.log('error submit!!');
        }
      });
    },
    formatDate() {
      const newDate = dateFormat('%Y-%M-%D', Date.parse(new Date()));
      const {
        startDate,
        startTime,
        endDate,
        endTime,
      } = this.ruleForm;
      const startDateMs = Date.parse(startDate);
      const endDateMs = Date.parse(endDate);
      const beginDate = dateFormat('%Y-%M-%D', startDateMs);
      const beginTime = dateFormat('%H:%I:%S', Date.parse(startTime));
      const dataEndDate = dateFormat('%Y-%M-%D', endDateMs);
      const dataEndTime = dateFormat('%H:%I:%S', Date.parse(endTime));
      const startTimeMs = new Date(`${newDate} ${beginTime}`).valueOf();
      const endTimeMs = new Date(`${newDate} ${dataEndTime}`).valueOf();
      return {
        startDateMs,
        startTimeMs,
        endDateMs,
        endTimeMs,
        beginDate,
        dataEndDate,
        beginTime,
        dataEndTime,
      };
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.adjustment-container {
  padding: 15px;
  background-color: #ffffff;
  & > div {
    margin-top: 15px;
  }
  .other-rules {
    & > div {
      display: flex;
      margin-top: 15px;
      > label {
        flex: 1;
      }
    }
  }
  .picker-wrap{
    display: flex;
  }
}
  .inline-block {
    display: inline-block;
  }
  .block {
    display: block;
  }
  .margin-180 {
    margin-right: 180px;
  }
  .margin-30 {
    margin-right: 30px;
  }
  .margin-t-15 {
    margin-top: 15px;
  }
  .margin-b-15 {
    margin-bottom: 15px;
  }
</style>
