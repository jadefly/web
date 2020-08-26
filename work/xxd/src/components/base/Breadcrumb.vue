<template>
  <div class="content-breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item,idx) in breadcrumbData" :key="'bread'+idx">
          <a v-if="item.path" :href="item.path">{{ item.title }}</a>
          <!-- <router-link v-if="item.path" :to="{name: item.name, query: item.query}">{{ item.title }}</router-link> -->
          <span v-else>{{ item.title }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
</template>

<script>
export default {
  props: {
    breadcrumbData: {
      type: Array,
      default: () => []
    }
  }
}
</script>
