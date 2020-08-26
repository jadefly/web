<template>
<div class="content-pages personnelPage">
  <myBreadcrumb :breadcrumbData="breadcrumbData"></myBreadcrumb>
  <div class="content-container">
    <div class="content-container-top">
      <el-page-header @back="backFn" content="人员工作安排" title="">
      </el-page-header>
    </div>
    <div class="personelContent">
      <Personel :projectId="$route.query.id" from="taskSchedule"></Personel>
    </div>
  </div>
</div>
</template>

<script>
import Personel from '@/components/tasks/personel'
export default {
  components: {
    Personel
  },
  data() {
    return {
      breadcrumbData: [
        { path: '/', name: 'home', title: '首页' },
        // { path: '/tasks/taskList', name: 'taskList', title: '项目管理' },
        { path: '/tasks/Schedule', name: 'taskList', title: '项目管理' },
        { path: '/tasks/Schedule', name: 'Schedule', title: '日程安排' },
        { title: '人员工作安排' }
      ],
      id: this.$route.query.id
    }
  },
  mounted() {
  },
  methods: {
    backFn() {
      this.$router.push({ path: '/Schedule?type=0' })
    }
  }
}
</script>

<style lang="scss" scoped>
.personelContent {
  padding: 20px 30px 50px;
}
</style>
