<template>
  <router-view></router-view>
</template>

<script>
import { mapMutations } from 'vuex';
import ajax from '@/common/js/ajax';

export default {
  created() {
    this.$vclean();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      ajax('canyin.pos.opening.pageBaseInfo').then((data) => {
        vm.setDeskPageBaseInfo(data);
      });
      vm.$devices.init({
        retry: () => {
          vm.$tcsl.resetDeviceMgr();
        },
      });
    });
  },
  beforeRouteLeave(to, from, next) {
    this.$devices.close();
    next();
  },
  methods: {
    ...mapMutations({
      setDeskPageBaseInfo: 'SET_DESK_PAGE_BASE_INFO',
    }),
  },
};
</script>
