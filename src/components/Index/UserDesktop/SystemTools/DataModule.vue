<template>
  <SystemContent :title="$t('Biz.UserDesktop.SystemTools.DataModuleTitle1')">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="system-data-box">
      <el-form-item :label="$t('Biz.UserDesktop.SystemTools.DataModuleLabel1')">
        <div class="time-box">
          <el-form-item prop="startDate" class="date">
              <el-date-picker
                v-model="ruleForm.startDate"
                align="right"
                type="date"
                :placeholder="$t('Dict.SelectionDate')"
              >
              </el-date-picker>
          </el-form-item>
          <el-form-item prop="startTime" class="time">
              <el-time-picker
                v-model="ruleForm.startTime"
                :picker-options="{
                  selectableRange: '00:00:00 - 23:59:59'
                }"
                :placeholder="$t('Dict.SelectionTime')">
              </el-time-picker>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item :label="$t('Biz.UserDesktop.SystemTools.DataModuleLabel2')">
        <div class="time-box">
          <el-form-item prop="endDate" class="date">
             <el-date-picker
              v-model="ruleForm.endDate"
              align="right"
              type="date"
              :placeholder="$t('Dict.SelectionDate')"
              >
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="endTime" class="time">
              <el-time-picker
                v-model="ruleForm.endTime"
                :picker-options="{
                  selectableRange: '00:00:00 - 23:59:59'
                }"
                :placeholder="$t('Biz.UserDesktop.SystemTools.DataModulePlaceholder2')">
              </el-time-picker>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item  :label="$t('Biz.UserDesktop.SystemTools.DataModuleLabel3')" label-width="180px" >
        <div class="time-box">
          <el-input-number
              class="ml18"
              v-model="ruleForm.dayNum"
              :numPrecision="0"
              controls-position="right"
            >
          </el-input-number>
          <p class="ml18">{{$t('Biz.UserDesktop.SystemTools.DataModuleP1')}} </p>
        </div>
      </el-form-item>
      <section class="change-data">
        <el-button type="danger" class="btn" @click="handleChangeDate('ruleForm')">{{$t('Biz.UserDesktop.SystemTools.DataModuleButton1')}}</el-button>
      </section>
    </el-form>
  </SystemContent>
</template>
<script>
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';
import SystemContent from '../base/SystemContent';

export default {
  name: 'DataModule',
  components: {
    SystemContent,
  },
  data() {
    return {
      ruleForm: {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        dayNum: 0,
      },
      rules: {
        startDate: [
          {
            type: 'date', required: true, message: this.$t('Dict.Validate.DataModuleMsg1'), trigger: 'change',
          },
        ],
        startTime: [
          {
            type: 'date', required: true, message: this.$t('Dict.Validate.DataModuleMsg2'), trigger: 'change',
          },
        ],
        endDate: [
          {
            type: 'date', required: true, message: this.$t('Dict.Validate.DataModuleMsg3'), trigger: 'change',
          },
        ],
        endTime: [
          {
            type: 'date', required: true, message: this.$t('Dict.Validate.DataModuleMsg4'), trigger: 'change',
          },
        ],
      },
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const res = await ajax('canyin.desktop.bizadjustdata.getnowdatetime');
      const newDate = dateFormat('%Y-%M-%D', Date.parse(new Date()));
      const startDate = `${res.beginDate}T00:00:00.000`;
      this.ruleForm.startDate = new Date(startDate);
      this.ruleForm.startTime = new Date(`${newDate} ${res.beginTime}`);
      this.ruleForm.endDate = new Date(res.endDate);
      this.ruleForm.endTime = new Date(`${newDate} ${res.endTime}`);
    },
    handleChangeDate(formName) {
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
      if (startDateMs + startTimeMs >= endDateMs + endTimeMs) {
        this.$message.error(this.$t('Biz.UserDesktop.SystemTools.DataModuleMsg5'));
        return;
      }
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          await ajax('canyin.desktop.bizadjustdata.adjust', {
            contentType: 'URLEncoded',
            data: {
              beginDate,
              beginTime,
              endDate: dataEndDate,
              endTime: dataEndTime,
              days: this.ruleForm.dayNum,
            },
          });
          this.$message.success(this.$t('Biz.UserDesktop.SystemTools.DataModuleMsg6'));
        } else {
          console.log('error submit!!');
        }
      });
    },
  },
};
</script>
<style lang="less" scope>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
    .system-data-box{
      padding: 22px 5px;
      .time-box{
        display: flex;
        align-items: center;
        .date{
          margin-left: 18px;
        }
        .time{
          margin-left: 10px;
        }
        .time-text{
          width: 180px;
          display: block;
          text-align: right;
        }
      }
      .change-data{
        margin-top: 50px;
        .btn{
          margin-left: 197px;
          color:#fff !important;
        }
      }
    }
    .mt20{
      margin-top: 20px;
    }
    .ml18{
       margin-left: 18px;
    }
</style>
<style lang="less">
.el-scrollbar__wrap{
  margin-right: -6px !important;
}
</style>
