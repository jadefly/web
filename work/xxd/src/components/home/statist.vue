<template>
  <el-card class="box-card project-data-panel no-pt">
    <div slot="header" class="clearfix">
      <span class="title">{{data.title}}</span>
    </div>
    <div class="text item">
        <ul class="statist-ul">
          <li v-for="(item,index) in data.data" :key="'statist'+index" :class="'back-'+item.icon">
            <div class="absolute-center">
              <p>{{item.label}}</p>
              <div>
                {{item.num==''?0:item.num}}
                <router-link :to="{name:item.name,params:item.params}">
                  <img src="../../assets/images/home/more.png" />
                </router-link>
              </div>
            </div>
          </li>
        </ul>
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
      type: Object
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
  .statist-ul{
    display: flex;
    li{
      width: 33%;
      height: 90px;
      padding-left: 90px;
      box-sizing: border-box;
      position: relative;
      background: no-repeat left top;
      &.back-orange{
        background-image: url(../../assets/images/home/icon_ct_lightorange.png) ;;

      }
      &.back-red{
        background-image: url(../../assets/images/home/icon_ct_orange.png);

      }
      &.back-blue{
        background-image: url(../../assets/images/home/icon_ct_blue.png);
      }
      &.back-lightblue{
        background-image: url(../../assets/images/home/icon_ct_lightblue.png);
      }
      .absolute-center{
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        p{
          color:#8c8c8c
        }
        div{
          font-size: 24px;
          color: #505050;
          margin-top: 5px;
        }
      }
    }
  }
</style>
