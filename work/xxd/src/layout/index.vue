<template>
  <div style="height: 100%; width: 100%"
       v-loading="loading"
       element-loading-text="加载中"
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.5)">
    <top-header :userInfo="true"
                @password="changePassword"
                v-show="!fullScreen">
    </top-header>
    <side-menu v-show="!fullScreen" :style="{'height':contentHeight+'px'}"></side-menu>    
    <div class="content"
         :class="[isCollapse?'width-64':'width-200',{'full-content': fullScreen,'showSubRouter': showSubRouter}]"
         id="content">
      <router-view></router-view>
    </div>
    <change-password :visible="visible"
                     @dialogVisible="updateVisible"></change-password>
    <confirm-dialog></confirm-dialog>
  </div>
</template>

<script>
import topHeader from '@/components/header.vue'
import sideMenu from '@/components/sideMenu.vue'
import changePassword from '@/components/changePassword.vue'
import confirmDialog from '@/components/confirmDialog.vue'
import AppLink from '@/components/Link'
import { mapGetters } from 'vuex'

export default {
  name: 'Layout',
  components: {
    topHeader,
    sideMenu,
    changePassword,
    confirmDialog,
    AppLink
  },
  data () {
    return {
      label: '',
      routerMenu: this.$store.getters.getRouters[0].children,
      visible: false,
      pageTabs: [],
      keepAlive: [],
      loading: false,
      fullScreen: false,
      contentHeight:0,
    }
  },
  computed: {
    ...mapGetters({
      loadingState: 'getLoading'
    }),
    SubRouter() {
      const routes = this.$router.options.routes
      const subRoutes = routes.filter(route=> route.parent)
      //console.log('subRoutes', subRoutes)
      //console.log('this.$route.meta.parent', this.$route.meta.parent)
      return  subRoutes.filter(item =>item.parent === this.$route.name || item.parent === this.$route.meta.parent)
    },
    showSubRouter(){
      return this.SubRouter.length 
    },
    isCollapse(){
      return this.$store.getters.getisCollapse
    }
  },
  watch: {
    '$route.name' (val) {
      document.getElementById('content').scrollTop = 0
      // chrome
      document.body.scrollTop = 0
      // firefox
      document.documentElement.scrollTop = 0
      // safari
      window.pageYOffset = 0
      this.updatePages(val)
      this.fullScreenPage()
      this.changeHeight()
    },
    loadingState (val) {
      this.loading = val
    }
  },
  mounted () {
    const subRouters = this.$router.options.routes.filter(route => route.parent)
    this.routerMenu.push(...subRouters)
    this.routerMenu.forEach((elem) => {
      if (elem.name === this.$route.name) this.label = elem.label || this.$route.query.title
    })
    this.updatePages(this.$route.name)
    this.fullScreenPage()
    this.changeHeight()
  },
  methods: {
    changePassword () {
      this.visible = true
    },
    updateVisible (val) {
      this.visible = val
    },
    updatePages (page) {
      let _page
      this.routerMenu.forEach((elem) => {
        if (elem.name === page) _page = elem
      })
      // 已缓存的tabs中没有当前路由跳转过来的页面时才加入当前路由页面信息，并加入页面缓存
      if (this.pageTabs.indexOf(_page) === -1) {
        this.pageTabs.push(_page)
        this.keepAlive.push(page)
      }
    },
    // 点击tab路由跳转
    liClick (name) {
      // 详情的新页需要再url中拼接id参数，否则跳转后刷新页面store中id被清除，就无法获取当前详情的id参数了
      switch (name) {
        case 'scanDetail':
          this.$router.push({ name: name, query: { id: this.$store.getters.getScanTaskId } })
          break
        case 'pocDetail':
          this.$router.push({ name: name, query: { id: this.$store.getters.getPocTaskId } })
          break
        case 'ipResult':
          this.$router.push({ name: name, query: { ip: this.$store.getters.getIpResult } })
          break
        default:
          this.$router.push({ name: name })
          break
      }
    },
    fullScreenPage () {
      if (this.$route.meta.fullScreen) {
        this.fullScreen = true
      } else {
        this.fullScreen = false
      }
    },
    resolvePath(item) {
      if (item.children && item.children.length) {
        console.log('item.children[0].path :', item.children[0].path);
        return item.children[0].path
      }
      return ''
    },
    isActive(route) {
      return route.name === this.$route.name
    },
    changeHeight() {
      setTimeout(() => {
        this.contentHeight=document.getElementById("content").offsetHeight+55;
      }, 1000);
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  /* height: 100%; */
  float: right;
  background: #f0f3fa;
  .page-tabs {
    margin-left: 25%;
    li {
      display: inline-block;
      padding: 6px 10px;
      background-color: none;
      margin-right: 5px;
      color: #fff;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      i {
        padding-left: 5px;
        cursor: pointer;
      }
    }
    li.active {
      color: #000;
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
}

.showSubRouter {
  padding-left: 120px;
}

.full-content {
  width: 100%;
  height: 100%;
  margin-top: 0;
  float: left;
  padding: 0;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.sub-router {
  position: absolute;
  width:130px;
  min-height: calc(100vh - 50px);
  box-shadow: 5px 0 10px #BFBFBF;
  left:70px;
  background-color: #fff;

  li {
    list-style-type:none;
    height: 27px;
    color: #000;
    cursor: pointer;
    width: 80%;
    margin: 20px auto;
    text-align: center;
    line-height: 27px;
  }

  .active {
    //background-image: url(../assets/images/home/tab-active.png);
    //background-size: cover;
    background: #000;
    color: #fff !important;
  }
}
</style>
