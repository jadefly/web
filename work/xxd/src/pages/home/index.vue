<script src="../../router/map/async.js"></script>
<template>
  <div class="content-pages">
    <div class="content-breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/home">{{userAndRoleInfo.roleName}}-工作台</a></el-breadcrumb-item>
      </el-breadcrumb>
      <div style="clear: both;"></div>
    </div>
    
    <header-div :data="userInfor"></header-div>
    <!-- 安服经理 -->
    <delivery-manager v-if="getRoleCode == 'delivery_manager'"></delivery-manager>
    <!-- 安服组长 -->
    <service-man v-if="getRoleCode == 'service_man'"></service-man>
    <!-- 项目经理 -->
    <project-manager v-if="getRoleCode == 'project_manager'"></project-manager>
      <!-- 项目助理 -->
    <commissioner v-if="getRoleCode == 'commissioner'"></commissioner>
    <!-- 销售经理 -->
    <sales-man v-if="getRoleCode == 'sales_man'"></sales-man>
    <!-- 销售总监 -->
    <sales-director v-if="getRoleCode == 'sales_director'"></sales-director>
    <!-- 技术总监 -->
    <technical-director v-if="getRoleCode == 'technical_director'"></technical-director>
    <!-- 总经理 -->
    <general-manager v-if="getRoleCode == 'general_manager'"></general-manager>
  </div>
</template>
<script>
import { getProjectStateNums } from '@/api/home'
import { mapState, mapGetters } from 'vuex'
import headerdiv from '@/components/home/header.vue'
import deliveryManager from './deliveryManager'
import serviceMan from './serviceMan'
import projectManager from './projectManager'
import commissioner from './commissioner'
import salesMan from './salesMan'
import salesDirector from './salesDirector'
import technicalDirector from './technicalDirector'
import generalManager  from './generalManager'

export default {
  name: 'home',
  components: {
    'header-div':headerdiv,
    'delivery-manager':deliveryManager,
    'service-man':serviceMan,
    'project-manager':projectManager,
     commissioner,
     "sales-man":salesMan,
     "sales-director":salesDirector,
     "technical-director":technicalDirector,
     "general-manager":generalManager
  },
  props: {},
  data () {
    return {
      userInfor: {
        targetnum: 0,
        completednum: 0
      }
    }
  },
  watch: {

  },
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    }),
    ...mapGetters(['getListParams','getRoleCode'])
  },
  mounted () {
    this.selectRoleIndex()
  },
  methods: {
    async getProjectStateNums() {
      let params = {
        year: this.moment().format('YYYY'),
        keyWord: ''
      }
      const data = await getProjectStateNums(params)
      // this.userInfor.targetnum = data.result.esintUserTarget
      if (Object.keys(data.result.esintUserTarget).length > 0) {
        this.userInfor.targetnum = data.result.esintUserTarget.yearTarget
        this.userInfor.completednum = data.result.esintUserTarget.yearTargetComplete
      }
      console.log('getProjectStateNums', data)
    },
    selectRoleIndex(){
      let roles = this.$store.getters.getRole
      if(roles == '总经理') {
        console.log(33)
      }
    }
  }
}
</script>
