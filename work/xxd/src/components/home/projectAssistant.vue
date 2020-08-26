<template>
  <el-card class="box-card project-data-panel center-table no-pt">
    <div slot="header" class="clearfix">
      <span class="title">待评估项目</span>
    </div>
    <div class="text item">
      <el-table :data="data.slice(0,5)" style="width: 100%">
        <el-table-column prop="numcode"
            label="序号"
            fit="false"
            align="center"
            header-align="center"
            key='1'>
            <template slot-scope="scope">
                {{scope.$index+1}}
            </template>
        </el-table-column>
        <el-table-column
          prop="projectName"
          label="项目名称">
        </el-table-column>
        <el-table-column
          prop="projectTypeName"
          label="项目类型">
        </el-table-column>
        <el-table-column
          prop="bargainNo"
          label="合同编号">
        </el-table-column>
        <el-table-column
          prop="projectStartTime"
          label="项目启动时间">
        </el-table-column>
        <el-table-column
          prop="expectedEndTime"
          label="预计完成时间">
        </el-table-column>
        <el-table-column
          prop="customerName"
          label="客户名称">
        </el-table-column>
        <el-table-column
          prop="projectManagerName"
          label="项目经理">
        </el-table-column>
        <el-table-column
          prop="headOfSales"
          label="销售负责人">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
              <el-button @click="ProgressConfirm(scope.row.id)" type="text" class="edit" icon="el-icon-edit"></el-button>
          </template>

        </el-table-column>
      </el-table>
        <div class="more_box">
          <button class="more_btn" @click="moreProgress()">&dot;&dot;&dot;</button>
        </div>
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
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    })
  },
  methods: {
    ProgressConfirm(id) {
      this.$router.push({ path: '/ProgressConfirm', query: { id: id, fromName: 'home' } })
    },
    moreProgress() {
      this.$router.push({ name: 'Review', params: { isApproval: '1' } })
    }
  }
}
</script>
<style lang="scss" scoped>

</style>

<style lang="scss">
  .project-data-panel{
    &.center-table{
    .el-table .cell{
          text-align: center;
        }
    }
    .more_box{
      text-align: right;
      margin-top: 30px;
      font-size: 30px;
      line-height: 0px;
      font-weight: bold;
      .more_btn{
        border:none;
        background: #fff;
        color: #858585;
        cursor: pointer;
      }
    }
  }
</style>
