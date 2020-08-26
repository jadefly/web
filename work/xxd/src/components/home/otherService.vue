<template>
  <el-card class="box-card home-panel">
    <div slot="header" class="clearfix">
      <span class="title">其他服务</span>
    </div>
    <div class="text item has-border">
      <el-table :data="data" style="width: 100%">
          <el-table-column
              label="季度"
              fit="false"
              align="center"
              header-align="center"
              key='1'>
              <template slot-scope="scope">
                  {{scope.row.quarter}}季度
              </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="安全服务项目">
            <template slot-scope="scope">
                  {{scope.row.self}}个
              </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="第三方项目">
            <template slot-scope="scope">
                  {{scope.row.other}}个
              </template>
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
    },
  }, 
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    })
  },
  methods: {
  }
}
</script>
<style lang="scss" >
.box-card.home-panel{
  height: 365px;
  .title{
    font-size: 18px;
    font-weight: bold;
  }
  .el-card__header{
    border-bottom:none;
  }
  .el-card__body{
    .has-border{
        border:1px #dcdfe6 solid;
        border-bottom:none
      }
  }
 
}
</style>