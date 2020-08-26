<template>
  <el-card class="box-card project-data-panel no-pt">
    <div slot="header" class="clearfix">
      <span class="title">已提交的交接单<span class="orange-span">{{data.length}}</span></span>
    </div>
    <div class="text item">
       <el-table :data="data" class="scroll_table" height="420" style="width: 100%">
        <el-table-column prop="numcode"
            label="序号"
            width="50px"
            align="center"
            header-align="center"
            key='1'>
            <template slot-scope="scope">
                {{scope.$index+1}}
            </template>
        </el-table-column>
        <el-table-column
          prop="projectName"
          label="交接单名称">
        </el-table-column>
        <el-table-column
          prop="subTime"
          label="提交时间">
          </el-table-column>
          <el-table-column
          prop="projectName"
          label="审批人">
        </el-table-column>
        <el-table-column
          label="审批状态">
          <template slot-scope="scope">
            <span :class="scope.row.approvalState==='待审核'?'red-span':(scope.row.approvalState==='审核中'?'yellow-span':'')">
              {{scope.row.approvalState}}
            </span>
            </template>
          </el-table-column>
          <el-table-column
          prop="lastTime"
          label="最近处置时间">
          </el-table-column>
       </el-table>
    </div>
  </el-card>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'contentdiv',
  components: {

  },
  props: {
    data: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    })
  },
  methods: {

  },
  mounted () {

  }
}
</script>
<style lang="scss" scoped>
.red-span{color: red;}
.yellow-span{color:yellow}
.mt20{margin-top:20px}
.orange-span{background: orange;color: white;font-size: 12px;width: 16px;height: 16px;line-height:16px;text-align: center;border-radius: 50%;font-weight: normal;display: inline-block;position: relative;top:-12px;left:-3px}
</style>
