<template>
  <!-- 高级搜索 -->
  <el-row v-show="searchShow" class="searchHigh">
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="合同编号" size="mini"
                prop="bargainNo">
        <el-input class="txt_count"
                v-model="condition.bargainNo"
                placeholder="请输入合同编号"></el-input>
      </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="合同名称" size="mini"
                prop="bargainName">
        <el-input class="txt_count"
                v-model="condition.bargainName"
                placeholder="请输入合同名称"></el-input>
      </el-form-item>
    </el-col>
        <el-col :sm="colSearch.sm" :md="colSearch.md" :lg="colSearch.lg" :xl="colSearch.xl">
      <el-form-item label="客户名称" size="mini" prop="clientName">
        <el-input class="txt_count"
                placeholder="请输入客户名称"
                v-model="condition.clientName"></el-input>
      </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm"
        :md="colSearch.md"
        :lg="colSearch.lg"
        :xl="colSearch.xl" >
        <el-form-item label="合同金额" size="mini" >
          <el-col :span="11" class="amountCol">
            <el-input class="amount" v-model="condition.lowPrice" placeholder="最小金额"></el-input>
          </el-col>
          <el-col class="line amountCol" style="text-align: center;" :span="2">-</el-col>
          <el-col :span="11" class="amountCol">
            <el-input class="amount" v-model="condition.heightPrice" placeholder="最大金额"></el-input>
          </el-col>
        </el-form-item>
    </el-col>
    <el-col :sm="18"
        :md="18"
        :lg="18"
        :xl="12" class="productline">
        <el-form-item label="产品线" prop="productline" 
            size="mini">
            <el-checkbox-group  v-model="productlineList">
              <!-- 1-dbcp-等保测评，2-aqrj-安全软件，3-aqfw-安全服务，4-qtaq-其他安全服务，5-wgaq-外购安全服务 -->
                <el-checkbox label="1"
                    name="productline">等保测评</el-checkbox>
                <el-checkbox label="2"
                    name="productline">安全软件</el-checkbox>
                <el-checkbox label="3"
                    name="productline">安全服务</el-checkbox>
                <el-checkbox label="4"
                    name="productline">其他安全服务</el-checkbox>
                <el-checkbox label="5"
                    name="productline">外购安全服务</el-checkbox>
            </el-checkbox-group>
        </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm"
        :md="colSearch.md"
        :lg="colSearch.lg"
        :xl="colSearch.xl">
        <el-form-item label="状态" prop="bargainState"
            size="mini">
            <el-select v-model="condition.bargainState"
                placeholder="请选择状态">
                <el-option label="执行中" value="001"></el-option>
                <el-option label="结束" value="002"></el-option>
                <el-option label="意外终止" value="003"></el-option>
                <el-option label="完工" value="004"></el-option>
                <el-option label="无效" value="005"></el-option>
                <el-option label="呆账" value="006"></el-option>
                <el-option label="未签" value="009"></el-option>
            </el-select>
        </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm"
        :md="colSearch.md"
        :lg="colSearch.lg"
        :xl="colSearch.xl">
        <el-form-item label="签订" prop="exaType"
            size="mini">
            <el-select v-model="condition.exaType"
                placeholder="请选择签订状态">
                <el-option label="已签"
                    value="true"></el-option>
                <el-option label="未签"
                    value="false"></el-option>
            </el-select>
        </el-form-item>
    </el-col>
    <el-col :sm="colSearch.sm"
        :md="colSearch.md"
        :lg="colSearch.lg"
        :xl="colSearch.xl">
            <el-form-item label="评估结果" prop="estimate"
                size="mini">
                <!-- 空字符-未评价，0-较差，1-一般，2-优质 -->
                <el-select v-model="condition.estimate"
                    placeholder="请选择评估结果">
                    <el-option label="未评估" value="-1"></el-option>
                    <el-option label="较差" value="0"></el-option>
                    <el-option label="一般" value="1"></el-option>
                    <el-option label="优质" value="2"></el-option>
                </el-select>
            </el-form-item>
    </el-col>
    <el-col :sm="12"
        :md="12"
        :lg="12"
        :xl="12">
        <el-form-item label="创建时间" prop="scBeginDate"
            size="mini">
            <el-date-picker v-model="scDate"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd">
            </el-date-picker>
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
    }
  },
  computed: {
    scDate: {
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
      productlineList: [], // 获取生产线复选框的值
      projectStateOption: projectState, // 项目状态
      projectType: projectType,
      formLabelWidth: '100px',
      colSearch: { sm: 12, md: 8, lg: 6, xl: 6 }
    }
  },
  watch: {
    productlineList: function (newQuestion, oldQuestion) {
      this.condition.productline = newQuestion.toString()
    }
  },
  methods: {
    resetForm(userForms) {
      this.productlineList = []
      this.formInline.scBeginDate = ''
      this.formInline.scEndDate = ''
      this.condition.lowPrice = ''
      this.condition.heightPrice = ''
      this.$emit('resetForm', userForms)
    },
    systemSearch() {
      this.$emit('systemSearch')
    }
  }
}
</script>
<style lang="scss">
.searchHigh{
  .amountCol{
    margin-bottom: 0 !important;
  }
  .productline{
    margin-bottom: 0 !important;
  }
}
</style>
