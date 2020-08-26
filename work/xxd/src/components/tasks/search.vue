<template>
  <!-- 高级搜索 -->
  <el-row v-show="searchShow" class="searchHigh">
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="项目名称" size="mini" prop="projectName">
        <el-input class="txt_count"
                placeholder="请输入项目名称"
                v-model="userForms.projectName"></el-input>
      </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="项目状态" size="mini"
                prop="projectState">
        <el-select
                v-model="userForms.projectState">
          <el-option v-for="(item, idx) in projectStateOption"
                :key="item.label"
                :label="item.label"
                :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="合同编号" size="mini"
                prop="contractNo">
        <el-input class="txt_count"
                v-model="userForms.contractNo"
                placeholder="请输入合同编号"></el-input>
      </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="合同名称" size="mini"
                prop="contractName">
        <el-input class="txt_count"
                v-model="userForms.contractName"
                placeholder="请输入合同名称"></el-input>
      </el-form-item>
    </el-col>
    
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="项目经理" size="mini"
                prop="projectManagerName">
        <el-input class="txt_count"
                v-model="userForms.projectManagerName"
                placeholder="请输入项目经理"></el-input>
      </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="项目类型" size="mini"
                prop="projectType">
        <el-select v-model="userForms.projectType" placeholder="请选择类型">
          <el-option key="cc" label="全部" value=""></el-option>
          <el-option :key="projectType.HG" label="合规" :value="projectType.HG"></el-option>
          <el-option :key="projectType.AF" label="安全服务" :value="projectType.AF"></el-option>
          <el-option :key="projectType.DSF" label="第三方" :value="projectType.DSF"></el-option>
          <el-option :key="projectType.ZZ" label="自有产品" :value="projectType.ZZ"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <!-- 项目经理/组员 不显示开始和结束金额  v-if="getRoleCode!=='project_manager'" -->
    <template>
      <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
        <el-form-item label="起始金额" size="mini"
                  prop="startMoney">
          <el-input class="txt_count"
                  v-model="userForms.startMoney"
                  onkeyup="value=value.replace(/[^\d]/g,'')" placeholder="请输入起始金额"></el-input>
        </el-form-item>
      </el-col>
      <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
        <el-form-item label="结束金额" size="mini"
                  prop="endMoney">
          <el-input class="txt_count"
                  v-model="userForms.endMoney"
                  onkeyup="value=value.replace(/[^\d]/g,'')" placeholder="请输入结束金额"></el-input>
        </el-form-item>
      </el-col>
    </template>

    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="异常状态子项" size="mini"
                prop="explainSubclass">
        <el-select v-model="userForms.explainSubclass" placeholder="请选择">
          <el-option key="sub" label="全部" value=""></el-option>
          <el-option key="sub0" label="正常" value="正常"></el-option>
          <el-option key="sub1" label="重新实施" value="重新实施"></el-option>
          <el-option key="sub2" label="增加实施" value="增加实施"></el-option>
          <el-option key="sub3" label="变更实施" value="变更实施"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
      <!-- v-if="getRoleCode=='project_manager' || getRoleCode=='service_man'" -->
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="是否分配入场时间" size="mini"
                prop="isEstimateTime"
                label-width="140">
        <el-select class="selWS" v-model="userForms.isEstimateTime" placeholder="请选择">
          <el-option key="isEs" label="全部" value=""></el-option>
          <el-option key="isEs0" label="已分配" value="1"></el-option>
          <el-option key="isEs1" label="未分配" value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :sm="24" :md="24" :lg="12" :xl="7">
      <el-form-item label="入场时间" size="mini"
                prop="scDate">
        <el-date-picker
          v-model="scDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          size="mini"
          value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
    </el-col>
    <el-col v-if="getRoleCode==='commissioner'" :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="需要复核" size="mini"
                prop="isApproval"
                label-width="140">
        <el-select class="selWS" v-model="userForms.isApproval" placeholder="请选择">
          <el-option key="isAp" label="全部" value=""></el-option>
          <el-option key="isAp0" label="是" value="1"></el-option>
          <el-option key="isAp1" label="否" value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <!-- <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="结束时间" size="mini"
                :label-width="formLabelWidth">
        <el-date-picker
          v-model="userForms.estimateEndTime"
          type="date"
          format="yyyy-MM-dd"
          placeholder="选择结束时间">
        </el-date-picker>
      </el-form-item>
    </el-col> -->
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="6" :xl="4">
      <el-form-item size="mini">
        <el-button type="primary" icon="el-icon-search" round @click="systemSearch">搜索</el-button>
        <el-button type="" icon="el-icon-close" round @click="resetForm('userForms')">清空</el-button>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
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
    ...mapGetters(['getRoleCode']),
    scDate: {
      get() {
        if (this.userForms.estimateStartTime && this.userForms.estimateEndTime) {
          return [this.userForms.estimateStartTime, this.userForms.estimateEndTime]
        } else {
          return []
        }
      },
      set(v) {
        this.userForms.estimateStartTime = v[0]
        this.userForms.estimateEndTime = v[1]
      }
    }
  },
  data() {
    return {
      projectStateOption: projectState, // 项目状态
      projectType: projectType,
      formLabelWidth: '100px',
      colSearch: { sm: 12, md: 8, lg: 6, xl: 6 },
    }
  },
  methods: {
    resetForm(userForms) {
      this.$emit('resetForm', userForms)
    },
    systemSearch() {
      this.$emit('systemSearch')
    }
  }
}
</script>
