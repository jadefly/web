<template>
  <!-- 高级搜索 -->
  <el-row v-show="searchShow" class="searchHigh">
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="合同编号" size="mini"
                prop="bargainNo">
        <el-input class="txt_count"
                v-model="userForms.bargainNo"
                placeholder="请输入合同编号"></el-input>
      </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="合同名称" size="mini"
                prop="bargainName">
        <el-input class="txt_count"
                v-model="userForms.bargainName"
                placeholder="请输入合同名称"></el-input>
      </el-form-item>
    </el-col>
        <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="项目名称" size="mini" prop="projectName">
        <el-input class="txt_count"
                placeholder="请输入项目名称"
                v-model="userForms.projectName"></el-input>
      </el-form-item>
    </el-col>
    </el-col>
        <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="系统名称" size="mini" prop="systemName">
        <el-input class="txt_count"
                placeholder="请输入系统名称"
                v-model="userForms.systemName"></el-input>
      </el-form-item>
    </el-col>
    <el-col :sm="24" :md="24" :lg="12" :xl="12">
      <el-form-item label="入场时间" size="mini"
                prop="einlass">
        <el-date-picker
          v-model="einlass"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          size="mini"
          value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
    </el-col>
    <el-col  :sm="24" :md="24" :lg="12" :xl="12">
      <el-form-item label="是否报备" size="mini"
                prop="sysKeepOnRecordState">
        <el-select class="selWS" v-model="userForms.sysKeepOnRecordState" placeholder="请选择">
          <el-option key="isEs0" label="是" value="1"></el-option>
          <el-option key="isEs1" label="否" value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :sm="24" :md="24" :lg="12" :xl="12">
      <el-form-item label="报备时间" size="mini"
                prop="keepOnRecordTime">
        <el-date-picker
          v-model="keepOnRecordTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          size="mini"
          value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
    </el-col>
    <el-col :sm="24" :md="24" :lg="12" :xl="12">
      <el-form-item label="是否送审报告" size="mini"
                prop="sysReportState">
        <el-select class="selWS" v-model="userForms.sysReportState" placeholder="请选择">
          <el-option key="isEs0" label="是" value="1"></el-option>
          <el-option key="isEs1" label="否" value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :sm="24" :md="24" :lg="12" :xl="12">
      <el-form-item label="报告送审时间" size="mini"
                prop="reportTime">
        <el-date-picker
          v-model="reportTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          size="mini"
          value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
    </el-col>
    <el-col :sm="24" :md="24" :lg="12" :xl="12">
      <el-form-item label="是否合规" size="mini"
                prop="isPrintReport">
        <el-select class="selWS" v-model="userForms.isPrintReport" placeholder="请选择">
          <el-option key="isEs0" label="是" value="1"></el-option>
          <el-option key="isEs1" label="否" value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :sm="24" :md="24" :lg="24" :xl="24">
        <el-form-item size="mini" class="fr clear">
          <el-button type="primary" icon="el-icon-search" round @click="systemSearch">搜索</el-button>
          <el-button type="" icon="el-icon-close" round @click="resetForm('userForms')">清空</el-button>
        </el-form-item>
      </el-col>
    </el-row>
</template>

<script>
import { projectState, projectType } from '@/assets/js/taskData'
export default {
  props: {
    userForms: {
      default: () => {},
      type: Object
    },
    searchShow: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 入场时间
    einlass: {
      get() {
        if (this.userForms.projectEstimateStartTimeBegin && this.userForms.projectEstimateStartTimeEnd) {
          return [this.userForms.projectEstimateStartTimeBegin, this.userForms.projectEstimateStartTimeEnd]
        } else {
          return []
        }
      },
      set(v) {
        this.userForms.projectEstimateStartTimeBegin = v[0]
        this.userForms.projectEstimateStartTimeEnd = v[1]
      }
    },
    // 报备时间
    keepOnRecordTime: {
      get() {
        if (this.userForms.keepOnRecordTimeBegin && this.userForms.keepOnRecordTimeEnd) {
          return [this.userForms.keepOnRecordTimeBegin, this.userForms.keepOnRecordTimeEnd]
        } else {
          return []
        }
      },
      set(v) {
        this.userForms.keepOnRecordTimeBegin = v[0]
        this.userForms.keepOnRecordTimeEnd = v[1]
      }
    },
    // 提交报告时间
    reportTime: {
      get() {
        if (this.userForms.reportTimeBegin && this.userForms.reportTimeEnd) {
          return [this.userForms.reportTimeBegin, this.userForms.reportTimeEnd]
        } else {
          return []
        }
      },
      set(v) {
        this.userForms.reportTimeBegin = v[0]
        this.userForms.reportTimeEnd = v[1]
      }
    }
  },
  data() {
    return {
      projectStateOption: projectState, // 项目状态
      projectType: projectType,
      formLabelWidth: '100px',
      colSearch: { sm: 12, md: 8, lg: 6, xl: 6 }
    }
  },
  methods: {
    resetForm(userForms) {
      this.userForms.projectEstimateStartTimeBegin = ''
      this.userForms.projectEstimateStartTimeEnd = ''
      this.userForms.keepOnRecordTimeBegin = ''
      this.userForms.keepOnRecordTimeEnd = ''
      this.userForms.reportTimeBegin = ''
      this.userForms.reportTimeEnd = ''
      this.$emit('resetForm', userForms)
    },
    systemSearch() {
      this.$emit('systemSearch')
    }
  }
}
</script>
<style lang="scss">
</style>
