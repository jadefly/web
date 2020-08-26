<template>
    <!-- 高级搜索 -->
    <el-row v-show="searchShow"
        class="searchHigh">
        <el-col :sm="colSearch.sm"
            :md="colSearch.md"
            :lg="colSearch.lg"
            :xl="colSearch.xl">
            <el-form-item label="交接单名称"
                size="mini"
                prop="projectName">
                <el-input class="txt_count"
                    v-model="condition.projectName"
                    placeholder="请输入交接单名称"></el-input>
            </el-form-item>
        </el-col>
        <el-col :sm="colSearch.sm"
            :md="colSearch.md"
            :lg="colSearch.lg"
            :xl="colSearch.xl">
            <el-form-item label="合同编号"
                size="mini"
                prop="bargainNo">
                <el-input class="txt_count"
                    v-model="condition.bargainNo"
                    placeholder="请输入合同编号"></el-input>
            </el-form-item>
        </el-col>
        <el-col :sm="colSearch.sm"
            :md="colSearch.md"
            :lg="colSearch.lg"
            :xl="colSearch.xl">
            <el-form-item label="合同名称"
                size="mini"
                prop="bargainName">
                <el-input class="txt_count"
                    v-model="condition.bargainName"
                    placeholder="请输入合同名称"></el-input>
            </el-form-item>
        </el-col>
        <el-col :sm="colSearch.sm"
            :md="colSearch.md"
            :lg="colSearch.lg"
            :xl="colSearch.xl">
            <el-form-item label="合同金额" size="mini" class="amountCol">
              <el-col :span="11">
                <el-input class="amount" v-model="condition.lowPrice" placeholder="最小金额"></el-input>
              </el-col>
              <el-col class="line" style="text-align: center;" :span="2">-</el-col>
              <el-col :span="11">
                <el-input class="amount" v-model="condition.heightPrice" placeholder="最大金额"></el-input>
              </el-col>
            </el-form-item>
        </el-col>
        <el-col :sm="colSearch.sm"
            :md="colSearch.md"
            :lg="colSearch.lg"
            :xl="colSearch.xl">
            <el-form-item label="客户名称"
                size="mini"
                prop="customerName">
                <el-input class="txt_count"
                    v-model="condition.customerName"
                    placeholder="请输入客户名称"></el-input>
            </el-form-item>
        </el-col>
        <el-col :sm="colSearch.sm"
            :md="colSearch.md"
            :lg="colSearch.lg"
            :xl="colSearch.xl">
            <el-form-item label="安服经理"
                      prop="assignDeliveryManagerName"
                      size="mini">
                      <el-select v-model="condition.assignDeliveryManagerName"
                          placeholder="请选择安服组长"
                          size="mini">
                          <el-option
                          v-for="item in assignDeliveryManagerNameList"
                          :key="item.id"
                          :label="item.realname"
                          :value="item.realname"></el-option>
                      </el-select>
            </el-form-item>
        </el-col>
        <el-col :sm="colSearch.sm"
            :md="colSearch.md"
            :lg="colSearch.lg"
            :xl="colSearch.xl">
            <el-form-item label="安服组长"
                      prop="serviceManName"
                      size="mini">
                      <el-select v-model="condition.serviceManName"
                          placeholder="请选择安服组长"
                          size="mini">
                          <el-option
                          v-for="item in serviceManNameList"
                          :key="item.id"
                          :label="item.realname"
                          :value="item.realname"></el-option>
                      </el-select>
            </el-form-item>
        </el-col>
        <!-- 待审批列表不显示 -->
        <el-col v-if="from!=='approval'"
            :sm="colSearch.sm"
            :md="colSearch.md"
            :lg="colSearch.lg"
            :xl="colSearch.xl">
            <el-form-item label="审批状态"
                      prop="approvalState"
                      size="mini">
                      <el-select v-model="condition.approvalState"
                          placeholder="请选择审批状态"
                          size="mini">
                          <el-option label="全部"
                              value=""></el-option>
                          <el-option label="待提交"
                              value="0"></el-option>
                          <el-option label="审批中"
                              value="1"></el-option>
                          <el-option label="已通过"
                              value="2"></el-option>
                          <el-option label="退回"
                              value="-1"></el-option>
                          <el-option label="待审批"
                              value="3"></el-option>
                      </el-select>
            </el-form-item>
        </el-col>
        <el-col :sm="24"
            :md="24"
            :lg="12"
            :xl="12">
            <el-form-item label="创建时间"
                size="mini">
                <el-date-picker v-model="creationTime"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    size="mini"
                    value-format="yyyy-MM-dd">
                </el-date-picker>
            </el-form-item>
        </el-col>
        <el-col :sm="24"
            :md="24"
            :lg="24"
            :xl="24">
            <el-form-item size="mini"
                class="fr clear">
                <el-button type="primary"
                    icon="el-icon-search"
                    round
                    @click="systemSearch">搜索</el-button>
                <el-button type=""
                    icon="el-icon-close"
                    round
                    @click="resetForm('condition')">清空</el-button>
            </el-form-item>
        </el-col>
    </el-row>
</template>

<script>
import { projectState, projectType } from '@/assets/js/taskData'
import { userRoleList } from '@/api/loophole'
export default {
  props: {
    condition: {
      default: () => {},
      type: Object
    },
    formInline: {
      default: () => {},
      type: Object
    },
    searchShow: {
      type: Boolean,
      default: false
    },
    from: {
      type: String,
      default: ''
    }
  },
  computed: {
    // 入场时间
    creationTime: {
      get() {
        if (this.formInline.scBeginDate && this.formInline.scEndDate) {
          return [this.formInline.scBeginDate, this.formInline.scEndDate]
        } else {
          return []
        }
      },
      set(v) {
        this.formInline.scBeginDate = v[0]
        this.formInline.scEndDate = v[1]
      }
    }
  },
  data() {
    return {
      projectStateOption: projectState, // 项目状态
      projectType: projectType,
      formLabelWidth: '100px',
      colSearch: { sm: 12, md: 8, lg: 6, xl: 6 },
      assignDeliveryManagerNameList: [], // 安服经理
      serviceManNameList: [] // 安服组长
    }
  },
  mounted() {
    this.getAssignDeliveryManagerName()
    this.getServiceManName()
  },
  methods: {
    resetForm(userForms) {
      this.formInline.scBeginDate = ''
      this.formInline.scEndDate = ''
      this.condition.lowPrice = ''
      this.condition.heightPrice = ''
      this.$emit('resetForm', userForms)
    },
    systemSearch() {
      this.$emit('systemSearch')
    },
    getAssignDeliveryManagerName() { // 安服经理
      userRoleList({ roleId: '6d04815404b692326bdb0a15c0370735' }).then((res) => {

        this.assignDeliveryManagerNameList = res.result.records
      })
    },
    getServiceManName() { // 安服组长
      userRoleList({ roleId: 'ee8626f80f7c2618817b6236f3a7f02b' }).then((res) => {
        this.serviceManNameList = res.result.records
      })
    }
  }
}
</script>
<style lang="scss">

</style>
