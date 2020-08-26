<template>
  <el-card class="box-card project-data-panel no-pt">
    <div slot="header" class="clearfix">
      <span class="title">区域分布情况</span>
    </div>
    <div class="text item">
      <div class="relativeBox">
        <img src="../../assets/images/home/city.png" />
        <div class="absoluteBox rightBox top-box">
          <p>天津市区项目数TOP10</p>
          <table>
            <tr v-for="(city,index) in data.slice(0,10)" :key="'city'+index">
              <td>TOP{{index+1}}</td>
              <td>{{city.cityName===''?'-':city.cityName}}</td>
              <td>{{city.num}}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </el-card>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'contentdiv',
  props: {
    data: {
      required: true,
      type: Array
    }
  },
  components: {

  },
  data() {
    return {

    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    }),
    ...mapGetters(['getListParams', 'getRoleCode'])
  },
  methods: {

  },
  mounted () {
  }
}
</script>
<style lang="scss" scoped>
.project-data-panel{height:100%}
.relativeBox{position: relative;}
.absoluteBox{position: absolute;}
.rightBox{right:0;top:0}
.top-box{
  p{
    color:#666;
    font-weight: bold;
  }
  table{
    margin-top: 10px;
    td{
      padding:10px;
      color:#a3a3a3
    }
  }
}
</style>
