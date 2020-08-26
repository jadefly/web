<template>
  <el-dialog title="立项单"
             :visible.sync="approDialogVisible"
             width="550px">
    <h5 class="project-title">{{projectName}}</h5>
    <el-form>
      <div class="approv-input">
        <el-row>
          <el-col :md="24"
                  :lg="24"
                  :xl="24">
            <el-form-item label="合同编号"
                          size="small"
                          class="form-line-height">
              <el-input v-model="contractID"
                        class="input1"
                        disabled="disabled"
                        placeholder="请输入合同编号"
                        type="type"></el-input>
            </el-form-item>
            <el-form-item label="合同名称"
                          size="small"
                          class="form-line-height">
              <el-input v-model="contractName"
                        class="input1"
                        disabled="disabled"
                        placeholder="请输入合同名称"
                        type="type"></el-input>
            </el-form-item>
            <el-form-item label="销售人员"
                          size="small"
                          class="form-line-height">
              <el-select v-model="salePerson"
                         value-key="value"
                         placeholder="请选择">
              </el-select>
            </el-form-item>
            <el-form-item label="项目类型"
                          size="small"
                          class="form-line-height">
              <el-checkbox-group v-model="checkList"
                                 disabled="disabled">
                <el-checkbox label="等保测评"></el-checkbox>
                <el-checkbox label="安全服务"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <div>
              <el-form-item label="预计开始"
                            size="small"
                            format="yyyy-MM-dd"
                            value-format="yyyy-MM-dd"
                            class="form-line-height">
                <div class="block">
                  <el-date-picker v-model="expectstartTime"
                                  type="date"
                                  @change="changeDate(expectstartTime)"
                                  placeholder="选择日期">
                  </el-date-picker>
                </div>
              </el-form-item>
            </div>
            <div>
              <el-form-item label="预计结束"
                            size="small"
                            class="form-line-height">
                <el-date-picker v-model="expectendTime"
                                type="date"
                                placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </div>
            <el-form-item label="项目经理"
                          size="small"
                          class="form-line-height">
              <el-select v-model="projectMan"
                         value-key="value"
                         v-bind:disabled="isAppro"
                         placeholder="请选择">
                <el-option-group v-for="item in list"
                                 :key="item.label"
                                 :label="item.label"
                                 :value="item.id">
                  <el-option v-for="it in item.options"
                             :key="it.label"
                             :label="it.label"
                             :value="it.id">
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
            <div class="dis-none">
              <el-form-item label="项目成员"
                            size="small"
                            clearable="true"
                            class="form-line-height">
                <el-select v-model="projectMember"
                           multiple
                           placeholder="请选择">
                  <el-option v-for="item in memberList"
                             :label="item.realname"
                             :key="item.id"
                             :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <div slot="footer"
         class="dialog-footer">
      <el-button type="primary"
                 @click="submitForm"
                 size="mini">确定</el-button>
      <el-button @click="approDialogVisible=false"
                 size="mini">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { queryOrderFormByProjectId, saveProjectApproval } from '@/api/tasks'
export default {
  name: 'approval',
  props: {
    visible: {
      required: true,
      type: Boolean
    },
    projectName: {
      required: true,
      type: String
    },
    projectId: {
      required: true,
      type: String
    },
    state: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      isAppro: false,
      checkList: [],
      approDialogVisible: false,
      customColorMethod: '#409eff',
      contractID: '',
      contractName: '',
      salePerson: '',
      saleType: '',
      expectstartTime: '',
      expectendTime: '',
      projectMan: '',
      projectMember: [],
      managegrListD: [],
      managegrListA: [],
      memberList: [],
      list: []
    }
  },
  watch: {
    visible (val) {
      this.approDialogVisible = val
      // 关闭时清空操作在所有任务最后进行
      if (!val) {
        let _this = this
        setTimeout(() => {
          _this.resetForm()
        }, 0)
      }
    },
    projectId (val) {
      this.getProjectManger()
      if (val) {
        this.projectId = val
      }
    },
    approDialogVisible (val) {
      this.$emit('dialogAppvoVisible', val)
    },
    state (val) {
      if (val == 1) {
        this.isAppro = true
      }
    }
  },
  mounted () {

  },
  methods: {
    changeDate (item) {
      // alert(item)
    },
    // 基础数据
    getProjectManger () {
      let param = {
        projectId: this.projectId,
        rolename: '服务经理',
        dept: '860bf682e9e44f259a1eee066254fdb2'
      }
      this.checkList = []
      queryOrderFormByProjectId(param).then((item) => {
        this.contractID = item.data.result.Project.bargainNos
        this.contractName = item.data.result.Project.bargainNames
        if (item.data.result.Project.ishaveLevelCheckou === '1') {
          this.checkList.push('等保测评')
        } else if (item.data.result.Project.ishaveLevelCheckou === '2') {
          this.checkList.push('安全服务')
        } else {
          this.checkList.push('安全服务')
          this.checkList.push('等保测评')
        }

        this.list.push({ label: '交付组', options: [] }, { label: '安服组', options: [] })
        item.data.result.PROJECT_MAN.forEach((it) => {
          if (it.key == 0) {
            if (it.departName == '交付组') {
              this.list[0].options.push({ label: it.realname, id: it.id })
            } else if (it.departName == '安服组') {
              this.list[1].options.push({ label: it.realname, id: it.id })
            }
          } else {
            this.projectMan = it.realname
          }
        })

        item.data.result.PROJECT_MEMBER.forEach((it) => {
          if (it.key == 0) {
            this.memberList.push({ departName: it.departName, id: it.id, key: it.key, realname: it.realname, username: it.username })
          } else {
            this.projectMember.push(it.realname)
          }
        })
      })
    },
    // 取消
    resetForm () {
      this.approDialogVisible = false
    },
    // 提交
    submitForm () {
      let form = {
        projectId: this.projectId,
        expectstartTime: '2019-10-10',
        expectendTime: '2019-10-21',
        projectMan: this.projectMan,
        projectMember: this.projectMember.join(','),
        receiptID: '',
        projectName: this.projectName
      }
      console.log(form)
      saveProjectApproval(form).then((res) => {
        this.$message({
          message: res.message,
          type: 'success'
        })
        this.approDialogVisible = false
      }).catch((e) => {
        this.$message({
          message: e.message,
          type: 'error'
        })
      })
    }
  }
}
</script>
<style>
.project-title {
  font-size: 18px !important;
  font-weight: 400;
  margin-bottom: 10px;
}
.input1 {
  width: 85% !important;
}
.approv-input .el-dialog .el-input__inner {
  width: 420px !important;
}
.dis-none .el-tag.el-tag--info .el-tag__close {
  display: none !important;
}
</style>
