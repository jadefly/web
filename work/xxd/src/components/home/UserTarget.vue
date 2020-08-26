<template>
  <div class="content_div">
    <h1>个人指标</h1>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'contentdiv',
  components: {

  },
  /* props: {
    data: {
      required: true,
      type: Object
    },
  }, */
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    })
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.content_div{
  background: #fff;
  border: 1px solid #DCDFE6;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
  padding:25px;
  box-sizing: border-box;
  h1{
    font-size: 18px;
    font-weight: bold;
  }
}
</style>