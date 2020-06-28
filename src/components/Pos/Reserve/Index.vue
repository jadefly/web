<template>
  <div class="reserve-warp">
    <div class="reserve-list-warp">
      <reserve-list
        ref="reserveList"
        v-model="currentReserve"
      ></reserve-list>
    </div>
    <div class="reserve-info-warp">
      <reserve-info
        @update-list="updateReserveList"
        :order="currentReserve"
        ref="reserveInfo"
      ></reserve-info>
    </div>
  </div>
</template>

<script>
import ReserveInfo from './components/ReserveInfo.vue'
import ReserveList from './components/ReserveList.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  data () {
    return {
      currentReserve : 123,
    };
  },
  components:{
    ReserveInfo,
    ReserveList
  },
  created() {
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
  },
  methods: {
    updateReserveList() {
      this.$refs.reserveList.getListData();
    },
    updateReserveInfo() {
      this.$refs.reserveInfo.getInfo();
    },
    ...mapActions([
      'getReserveNotifyCount'
    ]),
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$hotKey.set('Pos.Reserve', {})
      vm.getReserveNotifyCount();
      vm.$refs.reserveList.reloadReserveList();
      /* 不同营业模式的路由进入预点, 设置相应下单相关功能:
       * 路由进入 '预点', 获取Vux中营业模式参数, 直接设置子组件'reserveInfo'
       * 中餐和录单模式(参数-1 2)功能相同, 快餐(参数-3)无修改和打印 */
      if(vm.posBaseInfo && vm.posBaseInfo.controlMode == 3){
        // 左侧列表组件改变 营业模式状态参数
        vm.$refs.reserveList.curMode = false
        // 右侧功能组件改变 营业模式状态参数
        vm.$refs.reserveInfo.curMode = false
        vm.$refs.reserveInfo.funBtnSpan = 12
      } else {
        vm.$refs.reserveList.curMode = true
        vm.$refs.reserveInfo.curMode = true
        vm.$refs.reserveInfo.funBtnSpan = 8
      }
    })
  },
  // currentReserve
  beforeRouteLeave(to, from, next) {
    this.currentReserve = {};
    next();
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.reserve-warp{
  display: flex;
  height: 100%;
  > * {
    display: table-cell;
    vertical-align: top;
  }
}
.reserve-list-warp{
  padding: 12px;
  height: 100%;
  flex-grow: 1;
}
.reserve-info-warp{
  width: 306px;
  height: 100%;
}
</style>
