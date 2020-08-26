<template>
    <el-tabs type="border-card" class="borderCard">
        <el-tab-pane>
          <el-badge slot="label" :value="data.length || '0'" class="Badge" type="warning">
            <span>指派工单</span>
          </el-badge>
          <el-table
                :data="data.slice(0,5)"
                style="width: 100%">
                  <el-table-column prop="numcode"
                      label="序号"
                      fit="false"
                      align="center"
                      width="50px"
                      header-align="center"
                      key='1'>
                      <template slot-scope="scope">
                          {{scope.$index+1}}
                      </template>
                  </el-table-column>
                <el-table-column
                  prop="number"
                  show-overflow-tooltip
                  label="交接单编号">
                </el-table-column>
                <el-table-column
                  prop="projectName"
                  show-overflow-tooltip
                  label="交接单名称">
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="expectedEndTime"
                  label="期望完成时间">
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="totalPrice"
                  label="总实施额">
                </el-table-column>
                <el-table-column
                  align="center"
                  prop="donePrice"
                  label="已派发实施额">
                </el-table-column>
                <el-table-column
                  align="center"
                  width="80px"
                  label="指派工单">
                  <template slot-scope="scope">
                    <el-button type="text" @click="Assign(scope.row.id)" icon="el-icon-plus" class="assignBtn"></el-button>
                  </template>
                </el-table-column>
          </el-table>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'workOrder',
  components: {

  },
  props: {
    data: {
      required: true,
      default: () => [],
      type: Array
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
      this.$router.push({ name: 'workOrderList', query: { id } })
    }
  }
}
</script>
<style lang="scss" scoped>

</style>

<style lang="scss">
  .borderCard{
    .el-tabs__header{
      border-bottom: 0;
    }
    .is-top {
      height: 50px;
      line-height: 50px;
      .el-badge__content{
        top: 10px;
        line-height: 16px;
      }
    }
    .el-tabs__nav {
      border-bottom: 1px solid #fff;
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
