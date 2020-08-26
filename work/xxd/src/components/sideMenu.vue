<template>
  <div class="side-menu">
    <el-menu router default-active="/home" id="elmenu" class="el-menu-vertical-demo" :collapse="isCollapse">      
      <div class="logo">
        <img src="@/assets/images/common/logo.png">
      </div>
      <div class="icon-unfold" @click="toggle($event)">
        <i class="el-icon-s-unfold" style="font-size:22px!important"></i>
      </div>
      <template v-for="(item, key) in routerMenu">
        <!-- 有 二级菜单时 -->
        <template v-if="!item.hide && item.children && item.children.length">
          <el-submenu v-if="!item.hide"
                      :index="item.path"
                      :key="item.name"
                      :class="{'active': $route.name === item.name}">
            <template slot="title">
              <i :class=" 'iconfont icon' + (item.name=='taskIndex'?'tasks':item.name)" :name="item.name"></i>
              <span slot="title">{{item.label}}</span>
            </template>
            <el-menu-item-group v-if="item.children">
              <template v-for="(sub, idx) in item.children">
                <el-menu-item :key="sub.name"
                              :index="item.path+'/'+sub.path"
                              :class="'sub_emi'">
                  {{ sub.label }}</el-menu-item>
              </template>
            </el-menu-item-group>

          </el-submenu>
        </template>
        <!-- 无 二级菜单 -->
        <template v-else>
          <el-menu-item :index="item.path" v-if="!item.hide" :class="{'active':$route.name == item.name}">
            <i :class="'iconfont icon' + (item.name=='taskIndex'?'tasks':item.name)"></i>
            <span slot="title">{{item.label}}</span>
          </el-menu-item>
        </template>
        
        <!-- <el-menu-item v-if="!item.hide"
                      :key="key"
                      :class="{'active': $route.name === item.name}"
                      @click="click(item.path, item.id)">
          <i :class="'icon-' + item.name"></i>
          <span slot="title">{{item.label}}</span>
        </el-menu-item> -->
        
      </template>
    </el-menu>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'sideMenu',
  props: {},
  data () {
    return {
      isCollapse: this.$store.getters.getisCollapse,
      routerMenu: this.$store.getters.getRouters[0].children,
      active: ''
    }
  },
  mounted () {
    // console.log('菜单', this.isCollapse, this.routerMenu)
  },
  computed: {
    ...mapGetters({
      getisCollapse: 'getisCollapse'
    }),
  },
  watch: {
    getisCollapse (val) {
      this.isCollapse = val
    }
  },
  methods: {
    toggle(el) {
      this.isCollapse = !this.isCollapse;
      if (this.isCollapse) {
        this.$store.dispatch('updateisCollapse', true);
      } else {
        this.$store.dispatch('updateisCollapse', false);
      }
    }
  }
}
</script>
<style lang="scss">
.side-menu {
  height: 100%;
  min-height: 100%;
  width: 64px;
  float: left;
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    height: 100%;
    .el-menu-item {
      border-radius: 30px !important;
      width: 170px !important;
      color: #666;
      span {
        margin-left: 10px;
      }
    }
    .el-menu-item.active {
      background: #4877e8 !important;
      width: 170px !important;
      color: #fff !important;
    }
    .el-submenu__title{
      span{margin-left:10px;color:#666}
    }
    .el-submenu{
      .el-submenu__title{
      width: 170px;
      height: 40px;
      line-height: 40px;
      background: #f0f3fa;
      margin: 15px auto 0 auto;
      border-radius: 20px;
      }
    }
    .el-submenu.is-active{
      .el-submenu__title{
        background: #4877e8;
        i,span{
          color: #fff;
        }
        
      }
    }
    .el-menu-item-group{
      .el-menu-item.sub_emi{
        margin-top: 15px;
        height: auto;
        line-height: initial;
        background: #fff;
        padding-left: 62px !important;
        margin-left: 0;
        
      }
      .el-menu-item.is-active.sub_emi{
        color: #4877e8;
      }
    }
    .el-menu-item.is-active.active{
      &,i,span{
        color:#fff
      }
    }
    .el-menu-item.sub_emi:hover{
      color: #4877e8;
    }
    .el-submenu__title:hover,.el-menu-item:hover{
      background: #4877e8;
      i,span{color:#fff}
    }
  }
  .icon-unfold {
    width: 50px;
    height: 50px;
    font-size: 22px;
    color: #4877e8;
    line-height: 50px !important;
    padding: 10px 18px;
    cursor: pointer;
  }
  .el-menu{
    border-right: none !important;
    background-color: #fff !important;
    height: 100%;
    min-height: 100%;
    z-index: 999;
    box-shadow: 6px 0px 5px -5px rgba(10, 33, 100, 0.17), -6px 0px 5px -5px rgba(10, 33, 100, 0.27);
    .el-menu-item {
      margin-left: 13px;
      margin-top: 15px;
      border-radius: 50%;
      background: #f0f3fa;
      width: 40px;
      height: 40px;
      line-height: 40px;
      padding-left: 2px;
      i {
        margin-left: 2px;
      }
    }
    .el-menu-item.active.is-active {
      border-radius: 50%;
      background: #4877e8;
      width: 40px;
      height: 40px;
      line-height: 40px;
      .el-tooltip{
        background:#4877e8;
        }
      i{
        color: #fff;
        margin-left: 3px;
      }
    }
  }  
  .logo {
    background: #4877e6;
    height: 55px;
    img {
      width: 50px;
      height: 35px;
      margin: 8px;
    }
  }  
  .el-tooltip{
    padding: 0 10px !important;
    background:#f0f3fa;
    border-radius: 50%;
  }

  .el-menu--collapse{
    .el-submenu{
      .el-submenu__title{
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f0f3fa;
        margin:15px auto 0 13px;
        display: inline-block;
        padding:0 !important;
        text-align: center;
        line-height: 40px;
      }
    }
    .el-submenu.is-active{
      .el-submenu__title{
        background: #4877e8;
        i{color: #fff;}
      }
    }
    .el-menu-item.is-active{
      .el-tooltip{
        color:#909399
      }
    } 
    .el-submenu__title:hover,.el-tooltip:hover{
      background: #4877e8;
      i{
        color: #fff !important;
      }
    }
  }
  
}

.el-tooltip__popper.is-dark {
  background: #fff !important;
  color: #4877e8 !important;
  border: 1px solid #dae3f8 !important;
  max-width: 60%;
  // left: 50px !important;
}
.el-tooltip__popper {
  padding: 10px 30px 10px 15px !important;
}
.el-tooltip__popper[x-placement^=right] .popper__arrow{
  border-right-color: #dae3f8 !important;
}
.el-tooltip__popper[x-placement^=right] .popper__arrow:after {
  border-right-color: #fff !important;
}

.el-menu-item-group__title{
  //二级菜单，分组信息不显示
  display: none;
}
</style>
