<template>
<el-card class="personalIndicators">
  <div slot="header" class="clearfix">
      <span class="title">个人指标</span>
  </div>
  <div>
    <div class="text item content90">
      <el-col :span="12">
          <h1 class="font26 font7ea5ff">年度目标金额<span class="font40">{{Number(totalNum).toLocaleString() || 0}}</span>元</h1>
          <circle-bar class="chart-box" :dataArr="dataArr" :dataTitle="dataTitle"></circle-bar>
      </el-col>
    </div>
    <el-col :span="12">
        <el-table
        :data="tableData"
        style="width: 100%">
        <el-table-column
            prop="quarterly"
            align="center"
            label="季度">
        </el-table-column>
        <el-table-column
            prop="target"
            align="center"
            label="目标">
            <template slot-scope="scope">
              <span>{{scope.row.target || '-'}}</span>
            </template>
        </el-table-column>
        <el-table-column
            prop="complete"
            align="center"
            label="实际完成">
            <template slot-scope="scope">
              <span>{{scope.row.complete || '-'}}</span>
            </template>
        </el-table-column>
        <el-table-column
            v-if=" hasOrder"
            prop="orderNum"
            align="center"
            label="落单数">
            <template slot-scope="scope">
              <span>{{scope.row.orderNum || '-'}}</span>
            </template>
        </el-table-column>
        </el-table>
    </el-col>
  </div>
</el-card>
</template>
<script>
import { mapState } from 'vuex'
import circleBar from '@/components/charts/circleBar.vue'
export default {
  name: 'contentdiv',
  components: {
    'circle-bar': circleBar
  },
  props: {
    dataArr: {
      required: true,
      type: Array
    },
    tableData: {
      required: true,
      type: Array
    },
    totalNum: {
      required: true,
      type: String
    },
    hasOrder: {
      required: false,
      type: Boolean
    }
  },
  data() {
    return {
      legendArr: ['已完成', '未完成'],
      dataTitle: '年度目标总额'
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    })
  },
  mounted() {
  },
  methods: {
  }
}
</script>
<style lang="scss">
.personalIndicators{
  &.home-panel{
    height: 365px;
  }
  .title{
    font-size: 18px;
    font-weight: bold;
  }
  .el-card__header{
    border-bottom:0;
  }
  .font26{
    font-size: 20px;
  }
  .font7ea5ff{color:#7ea5ff}
  .mb10{margin-bottom: 10px;}
  .font40{font-size: 30px;padding-left: 10px;}
  .content90{width:90%;margin:0 auto}
  .chart-box{height:200px !important}
}
</style>
