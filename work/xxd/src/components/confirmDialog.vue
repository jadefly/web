<template>
  <div class="handel-dialog">
    <el-dialog :title="title"
               :visible.sync="dialogFormVisible"
               width="450px">
      <span style="color: rgb(255, 255, 255, 0.8);">
        <i class="el-icon-warning-outline"
           style="color: #F56C6C;vertical-align: middle;"></i>
         确认进行<span style="color: #F56C6C;padding:0 3px;">{{tips}}</span>操作吗？
      </span>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary"
                   @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'confirmDialog',
  data () {
    return {
      dialogFormVisible: false,
      title: '确认操作',
      tips: '删除'
    }
  },
  computed: {
    ...mapGetters({
      getConfirm: 'getConfirm'
    })
  },
  watch: {
    getConfirm (val) {
      this.dialogFormVisible = val.show
      if (val.title) this.title = val.title
      if (val.tips) this.tips = val.tips
    }
  },
  methods: {
    async submitForm () {
      this.$store.dispatch('updateConfirm', {
        show: false,
        title: null,
        tips: null,
        confirm: true
      })
    },
    cancel () {
      this.$store.dispatch('updateConfirm', {
        show: false,
        title: null,
        tips: null,
        confirm: false
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
