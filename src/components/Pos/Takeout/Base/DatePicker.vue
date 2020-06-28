<template>
  <div class="block date-picker-wrapper">
    <el-date-picker
      v-judge
      v-model="startValue"
      type="date"
      id="takeoutStartDate"
      :placeholder="$t('Dict.StartDate')">
    </el-date-picker>
    <span>{{$t('Dict.To')}}</span>
    <el-date-picker
      v-judge
      v-model="endnValue"
      type="date"
      id="takeoutEndDate"
      :placeholder="$t('Dict.EndDate')">
    </el-date-picker>
    <button type="button" class="btn" @click="clickSeach"><i class="icon icon-pos-takeout-search"></i>{{$t('Dict.Lookup')}}</button>
  </div>
</template>

<script>
import dateFormat from '@/common/js/dateformat';
import { TODAY, TOMORROW } from '@/common/api/takeoutConfig';

export default {
  data() {
    return {
      startValue: TODAY,
      endnValue: TOMORROW,
    };
  },
  methods: {
    clickSeach() {
      // 超过五天不能查询
      if (this.endnValue - this.startValue > 86400000 * 5) {
        this.$message.error(this.$t('Biz.Pos.Takeout.TakeoutMsg022'));
        return;
      }

      this.$emit('clickSeach');
    },
  },
  watch: {
    startValue(date) {
      const timeStamp = Date.parse(date);
      const time = dateFormat('%Y-%M-%D %H:%I:%S', timeStamp);
      this.$emit('getStartValue', time);
    },
    endnValue(date) {
      const timeStamp = Date.parse(date);
      const time = dateFormat('%Y-%M-%D %H:%I:%S', timeStamp);
      this.$emit('getEndValue', time);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.date-picker-wrapper {
  width: 100%;
  padding: 12px 24px 0 24px;
  color: #273844;
  background-color: rgba(255, 255, 255, 0.6);

  > button {
    height: 40px;
    padding: 0 18px;
    border-radius: 20px;
    background-color: #9dc1ca;
    &:hover,
    &:active
    &:focus {
      color: #273844;
      opacity: .9;
    }
    > i {
      font-size: 24px;
    }
  }
}

</style>

<style lang="less">
  .date-picker-wrapper #takeoutStartDate, #takeoutEndDate {
    border: none;
    border-radius: 20px;
    color: #273844;
    font-weight: bold;
    background-color: #9dc1ca;
  }
</style>
