<template>
<el-card class="box-card home-panel no-pt">
  <div slot="header" class="clearfix">
      <span class="title">等保测评情况</span>
  </div>
  <div class="text item content90">
    <h1 class="font26">年度测评系统总数<span class="font40">{{totalNum}}</span></h1>
    <circle-bar class="chart-box"  :dataArr="dataArr" :dataTitle="dataTitle"></circle-bar>
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
    data: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
      legendArr: ['已完成', '实施中'],
      dataArr: [{ value: 0, name: '已完成' }, { name: '实施中', value: 0 }],
      dataTitle: '测评系统总数',
      totalNum: 0
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    })
  },
  mounted() {
    let arr = this.data;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].state === '1') {
        this.dataArr[0].value += arr[i].sysNum
      } else {
        this.dataArr[1].value += arr[i].sysNum
      }
      this.totalNum += arr[i].sysNum
    }
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.box-card{
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
    font-size: 26px;
  }
  h1{color:#7ea5ff;margin-bottom: 10px;}
  .font40{font-size: 40px;padding-left: 10px;}
  .content90{width:90%;margin:0 auto}
  .chart-box{height:200px !important}
}
</style>
