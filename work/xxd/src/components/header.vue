<template>
  <div class="header" :class="[isCollapse?'width-64':'width-200']">
    <div class="header-left">
        兴先道项目管理系统
    </div>
    <div class="header-right">
      <div class="header-right-icon">
        <i class="icon-top_xiaoxi"></i>
        <i class="icon-top_tuichu" @click="itemChange('logout')"></i>
      </div>
      <el-dropdown trigger="click"
                   @command="itemChange">
        <span class="el-dropdown-link">
          {{userAndRoleInfo.roleName}}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="password">修改密码</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { logout } from '@/api/login'
import { clearToken } from '@/utils/auth'
import { mapState } from 'vuex'
export default {
  name: 'top-header',
  props: {
    userInfo: {
      type: [Object, Boolean],
      default: false
    }
  },
  data () {
    return {
      logo: require('@/assets/images/common/logo.png'),
      roleName: this.$store.getters.getRole
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    }),
    isCollapse(){
      return this.$store.getters.getisCollapse;
    }
  },
  methods: {
    itemChange (val) {
      if (val === 'logout') {
        // todolist 登出的302如何处理？？
        // logout().then(() => {
        //   clearToken()
        // }).catch((e) => { })
        clearToken()
        setTimeout(() => {
          history.go(0)
        }, 0)
        this.$router.push({ path: '/login' })
      } else if (val === 'password') {
        this.$emit('password')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  float: right;
  height: 55px;
  //width: calc(100% - 64px);
  z-index: 99;
  background: #5a8bff;
  box-shadow: 0px 6px 6px 0px rgba(10,33,100,0.17);
  .header-left {
    color: #fff;
    font-size: 16px !important;
    padding-left: 20px;
    line-height: 55px;
    font-weight: 600;
    float: left;
  }
  .header-right {
    float: right;
    padding: 18px 50px 17px 20px;
    .header-right-photo {
      height: 28px;
      float: left;
    }
    .el-dropdown {
      padding-left: 8px;
      color: #fff;
      cursor: pointer;
    }
    .header-right-icon {
      height: 20px;
      float: left;
      color: #fff;
      i {      
          padding: 0 10px;
          font-size: 16px !important;
          cursor: pointer;
      }
      
    }
  }
}

</style>
