<template>
  <SystemContent title="鱼酷数据补全">
    <div class="daily-settlement-wrapper">
      <el-form :model="searchForm">
        <el-form-item
          label="请选择补传开始时间：">
          <el-date-picker
            v-model="startDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          label="请选择补传结束时间：">
          <el-date-picker
            v-model="endDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <span class="tip">注：选择时间最多不能超过一个月，即31天</span>
        </el-form-item>
      </el-form>
      <button type="button" class="btn" @click="upload">数据补传</button>
    </div>
  </SystemContent>
</template>

<script>
import SystemContent from '../base/SystemContent';
import ajax from '@/common/js/ajax';

export default {
  name: 'fishCoolUpdateModule',
  components: {
    SystemContent,
  },
  data() {
    return {
      searchForm: {},
      startDate: new Date(),
      endDate: new Date(),
    };
  },
  methods: {
    checkedBeforeSubmit(time1, time2) {
      if (time2 < time1) {
        this.$message.error('结束时间不能小于开始时间');
        return false;
      }
      if ((time2 - time1) / (1000 * 60 * 60 * 24) > 31) {
        this.$message.error('时间范围选择不能超过一个月');
        return false;
      }
      return true;
    },
    upload() {
      const { startDate, endDate } = this;
      const time1 = new Date(`${startDate}`);
      const time2 = new Date(`${endDate}`);
      if (this.checkedBeforeSubmit(time1.getTime(), time2.getTime())) {
        const startYear = time1.getFullYear();
        const endYear = time2.getFullYear();
        const startMonth = time1.getMonth() + 1;
        const endMonth = time2.getMonth() + 1;
        const startDay = time1.getDate();
        const endDay = time2.getDate();
        ajax('canyin.pos.settlement.pay.yukupayway.uploadbsmessage', {
          contentType: 'URLEncoded',
          data: {
            beginDate: `${startYear}-${startMonth}-${startDay}`,
            endDate: `${endYear}-${endMonth}-${endDay}`,
          },
        }).then((res) => {
          this.$message.success('上传成功');
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.daily-settlement-wrapper {
  padding: 15px;
  .btn {
    margin-top: 50px;
    display: block;
    width: 280px;
    height: 40px;
    background-color: #f0b017;
    font-size: 15px;
    color: #fff;
  }
}
</style>
