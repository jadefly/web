export default {
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$refs.framework.filterTabsWithAuth(to);
    });
  },
};
