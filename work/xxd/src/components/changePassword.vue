<template>
  <div class="handel-dialog">
    <el-dialog title="修改密码"
      :visible.sync="dialogFormVisible"
      width="450px">
      <el-form :model="form"
        ref="form"
        :rules="rules">
        <el-form-item label="用户名"
          prop="userName"
          :label-width="formLabelWidth">
          <el-input v-model="form.username"
            type="text" size="small"
            autocomplete="off" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="原密码"
          prop="oldpassword"
          :label-width="formLabelWidth">
          <el-input v-model="form.oldpassword"
            type="password" size="small"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码"
          prop="password"
          :label-width="formLabelWidth">
          <el-input v-model="form.password"
            type="password" size="small"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码"
          prop="confirmpassword"
          :label-width="formLabelWidth">
          <el-input v-model="form.confirmpassword"
            type="password" size="small"
            autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
        class="dialog-footer">
        <el-button @click="resetForm" size="mini">重 置</el-button>
        <el-button type="primary"
          @click="submitForm" size="mini">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { changePassword } from '@/api/user.js'
import { mapGetters } from 'vuex'
export default {
  name: 'changePassword',
  props: {
    visible: {
      required: true,
      type: Boolean
    }
  },
  data () {
    return {
      dialogFormVisible: false,
      formLabelWidth: '80px',
      form: {
        username: this.$store.getters.getUserName,
        oldpassword: '',
        password: '',
        confirmpassword: ''
      },
      rules: {
        oldpassword: [
          { required: true, trigger: 'blur', message: '请输入原密码' }
        ],
        password: [
          { required: true, validator: this.pass, trigger: 'blur', message: '请输入新密码' }
        ],
        confirmpassword: [
          { required: true, validator: this.checkpass, trigger: 'blur', message: '请确认密码' }
        ]
      }
    }
  },
  mounted() {
    
  },
  watch: {
    visible (val) {
      this.dialogFormVisible = val
    },
    dialogFormVisible (val) {
      this.$emit('dialogVisible', val)
      // 关闭时清空操作在所有任务最后进行
      if (!val) {
        let _this = this
        setTimeout(() => {
          _this.resetForm()
        }, 0)
      }
    }
  },
  methods: {
    // 密码
    pass (rule, value, callback) {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else {
        if (this.form.confirmpassword !== '') {
          this.$refs.form.validateField('confirmpassword')
        }
        callback()
      }
    },
    // 再次确认密码
    checkpass (rule, value, callback) {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    },
    async submitForm () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 剩余操作在axios拦截已处理
          changePassword(this.form).then((res) => {
            this.$message({
              message: res.data.message,
              type: 'success'
            })
            this.dialogFormVisible = false
          })
        }
      })
    },
    resetForm () {
      this.$refs.form.resetFields()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
