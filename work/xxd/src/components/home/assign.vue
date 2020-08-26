<template>
    <el-tabs type="border-card" class="borderCard">
        <el-tab-pane>
          <el-badge slot="label" :value="data.notAssignedSubmission.length || '0'" class="Badge" type="warning">
            <span>待指派交接单</span>
          </el-badge>
          <el-table
                :data="data.notAssignedSubmission.slice(0,5)"
                style="width: 100%">
                  <el-table-column prop="numcode"
                      label="序号"
                      fit="false"
                      align="center"
                      width="50px"
                      key='1'>
                      <template slot-scope="scope">
                          {{scope.$index+1}}
                      </template>
                  </el-table-column>
                <el-table-column
                  prop="number"
                  align="center"
                  label="交接单编号">
                </el-table-column>
                <el-table-column
                  prop="projectName"
                  align="center"
                  label="交接单名称">
                </el-table-column>
                <el-table-column
                  prop="headOfSales"
                  align="center"
                  label="销售人员">
                </el-table-column>
                <el-table-column
                  align="center"
                  label="指派">
                  <template slot-scope="scope">
                    <el-button type="text" @click="Assign(scope.row.id)" icon="el-icon-plus" class="assignBtn"></el-button>
                  </template>
                </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane>
            <el-badge slot="label" :value="data.assignedSubmission.length" class="Badge" type="warning">
              <span>已指派交接单</span>
            </el-badge>
            <el-table
                :data="data.assignedSubmission.slice(0,5)"
                style="width: 100%">
                  <el-table-column prop="numcode"
                      label="序号"
                      fit="false"
                      align="center"
                      width="50px"
                      key='1'>
                      <template slot-scope="scope">
                          {{scope.$index+1}}
                      </template>
                  </el-table-column>
                <el-table-column
                  prop="number"
                  align="center"
                  label="交接单编号">
                </el-table-column>
                <el-table-column
                  prop="projectName"
                  align="center"
                  label="交接单名称">
                </el-table-column>
                <el-table-column
                  prop="headOfSales"
                  align="center"
                  label="销售人员">
                </el-table-column>
            </el-table>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'contentdiv',
  components: {

  },
  props: {
    data: {
      required: true,
      type: Object
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    }),
    ...mapGetters(['getListParams', 'getRoleCode'])
  },
  methods: {
    // 指派
    Assign(id) {
      this.$router.push({ path: '/toAssign', query: { id } })
    }
  }
}
</script>
<style lang="scss" scoped>

</style>

<style lang="scss">
  .borderCard{
    .is-top {
      height: 50px;
      line-height: 50px;
      .el-badge__content{
        top: 10px;
        line-height: 16px;
      }
    }
    .el-tabs__item {
      border-top: 3px solid rgba(0, 0, 0, 0);
    }
    .el-tabs__item.is-active {
      border-top: 3px solid #409EFF;
    }
    .assignBtn{
      padding: 0;
      .el-icon-plus{
        color: #81ca60;
        font-size: 20px;
        font-weight: 900;
      }
    }
  }
</style>
