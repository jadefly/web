<template>
  <el-card class="box-card project-data-panel center-table no-pt">
    <div slot="header" class="clearfix">
      <span class="title">待报备的系统</span>
    </div>
    <div class="text item">
      <el-table :data="esintProjectSysData.slice(0,5)" style="width: 100%">
        <el-table-column prop="numcode"
            label="序号"
            align="center"
            header-align="center"
            width="50px"
            key='1'>
            <template slot-scope="scope">
                {{scope.$index+1}}
            </template>
        </el-table-column>
        <el-table-column
          prop="systemName"
          label="系统名称">
        </el-table-column>
        <el-table-column
          prop="bargainNo"
          label="合同编号">
          </el-table-column>
        <el-table-column
          label="入场时间" >
          <template slot-scope="scope">
              <span v-if="scope.row.einlass!=''">{{scope.row.einlass}}</span>
              <span v-else>-</span>
          </template>
        </el-table-column>
          <el-table-column
          prop="reportFileName"
          label="报告">
          <template slot-scope="scope">
              <span v-if="scope.row.reportFileName!=''">{{scope.row.reportFileName}}</span>
              <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="projectName"
          label="公安报备">
            <template slot-scope="scope">
                {{scope.row.isKeepOnrecordState == '1'?'是':scope.row.isKeepOnrecordState == '0'?'否':'-'}}
              </template>
        </el-table-column>
        <el-table-column
          label="提交报告">
            <template slot-scope="scope">
            {{scope.row.isReportState == '1'?'是':scope.row.isReportState == '0'?'否':'-'}}
          </template>
        </el-table-column>
        <el-table-column
          label="审批反馈">
            <template slot-scope="scope">
                  {{scope.row.isPrintReport == '1'?'是':scope.row.isPrintReport == '0'?'否':'-'}}
                </template>
        </el-table-column>
        <el-table-column
        min-width="100px"
          label="操作">
          <template slot-scope="scope">
          <div><el-button type="primary"
                @click="reportConfirm(scope.row.systemId)"
                size="mini" round>报备确认</el-button></div>
          <div><el-button type="primary"
                @click="reportSubmit(scope.row.systemId)" size="mini" round>报告提交</el-button></div>
          <div>
            <el-button type="primary"
                  @click="reportPrint(scope.row.systemId)" size="mini" round>打印报告</el-button>
          </div>
                </template>
        </el-table-column>
      </el-table>
      <div class="more_box">
        <button class="more_btn" @click="moreReport()">&dot;&dot;&dot;</button>
      </div>
    </div>
    <el-dialog
        title="报备确认"
        :visible.sync="confirmVisible"
        width="520px"
        :before-close="handleCloseConfirm">
        <el-form ref="confirmDialogForm"
            :model="confirmDialogForm"
            :rules="confirmRules"
            label-width="80px">
            <el-form-item label="是否报备" prop="sysKeepOnRecordState">
                <el-radio-group v-model="confirmDialogForm.sysKeepOnRecordState">
                    <el-radio label="1">是</el-radio>
                    <el-radio label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="报备时间" prop="keepOnRecordTime">
                <el-col :span="11">
                    <el-date-picker type="date"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        placeholder="选择日期"
                        v-model="confirmDialogForm.keepOnRecordTime"
                        style="width: 100%;"
                        popper-class="centerPicker"></el-date-picker>
                </el-col>
            </el-form-item>
            <el-form-item label="报备编号" prop="sysNum">
                <el-input v-model="confirmDialogForm.sysNum"></el-input>
            </el-form-item>
            <el-form-item label="资料上传">
                <el-upload
                  class="confirmUpload"
                  ref="confirmUpload"
                  name="keepFile"
                  :action="url + '/bargain/esintProjectSys/doKeepOnRecord'"
                  :headers="headers"
                  :data="confirmDialogForm"
                  :limit="1"
                  :on-success="confirmOnSuccess"
                  :on-change="confirmOnChange"
                  :file-list="confimFileList"
                  :auto-upload="false">
                  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                </el-upload>
            </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleSubmitConfirm">确定</el-button>
            <el-button @click="handleCloseConfirm">取消</el-button>
        </span>
    </el-dialog>
    <el-dialog
        title="报告提交"
        :visible.sync="submitVisible"
        width="520px"
        :before-close="handleCloseSubmit">
        <el-form ref="submitDialogForm"
            :model="submitDialogForm"
            :rules="submitRules"
            label-width="130px">
            <el-form-item label="是否提交报告" prop="sysReportState">
                <el-radio-group v-model="submitDialogForm.sysReportState">
                    <el-radio label="1">是</el-radio>
                    <el-radio label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="是否可以打印报告" v-show="submitDialogForm.sysReportState == '1'" prop="isPrintReport">
                <el-radio-group v-model="submitDialogForm.isPrintReport">
                    <el-radio label="1">是</el-radio>
                    <el-radio label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="提交报告时间" prop="reportTime">
                <el-col :span="11">
                    <el-date-picker type="date"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        placeholder="选择日期"
                        v-model="submitDialogForm.reportTime"
                        style="width: 100%;"
                        popper-class="centerPicker"></el-date-picker>
                </el-col>
            </el-form-item>
            <el-form-item label="资料上传">
                <el-upload
                  class="submitUpload"
                  ref="submitUpload"
                  name="reportFile"
                  :action="url + '/bargain/esintProjectSys/doEvaluationReport'"
                  :headers="headers"
                  :data="submitDialogForm"
                  :limit="1"
                  :on-success="submitOnSuccess"
                  :on-change="submitOnChange"
                  :file-list="submitFileList"
                  :auto-upload="false">
                  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                </el-upload>
            </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleSubmitSubmit">确定</el-button>
            <el-button @click="handleCloseSubmit">取消</el-button>
        </span>
    </el-dialog>
    <el-dialog
        title="是否可以打印报告"
        :visible.sync="printVisible"
        width="520px"
        :before-close="handleClosePrint">
        <el-form ref="printDialogForm"
            :model="printDialogForm"
            :rules="printRules"
            label-width="150px">
            <el-form-item label="是否可以打印报告" prop="isPrintReport">
                <el-radio-group v-model="printDialogForm.isPrintReport">
                    <el-radio label="1">是</el-radio>
                    <el-radio label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="可以打印报告日期" prop="printReportCreatetime">
                <el-col :span="24">
                    <el-date-picker type="date"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        placeholder="选择日期"
                        v-model="printDialogForm.printReportCreatetime"
                        style="width: 100%;"
                        popper-class="centerPicker"></el-date-picker>
                </el-col>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleSubmitPrint">确定</el-button>
            <el-button @click="handleClosePrint">取消</el-button>
        </span>
    </el-dialog>
  </el-card>
</template>
<script>
import { doKeepOnRecord, selectProjectSystemById, doEvaluationReport, doEvaluationReportPrint } from '@/api/report'
import { querySysFroProjectAssistant } from '@/api/home'
import { mapState } from 'vuex'
export default {
  name: 'contentdiv',
  components: {

  },
  data() {
    return {
      status: {
        '0': '未实施',
        '300101': '启动过程',
        '300102': '规划过程',
        '300103': '执行过程',
        '300104': '监管过程',
        '300105': '收尾过程',
        '1': '完成'
      },
      userForms: {
        'isHome': '1',
        'pageNo': 1,
        'pageSize': 5
      },
      esintProjectSysData: [],
      confirmVisible: false, // 报备确认对话框
      confirmDialogForm: { // 报备确认弹窗表单
        id: '',
        keepOnRecordTime: '',
        sysKeepOnRecordState: '',
        sysNum: ''
      },
      confimFileList: [], // 报备资料文件
      confimChangeFileList: [], // 文件状态改变时的文件列表
      submitVisible: false, // 报告提交对话框
      submitDialogForm: { // 报告提交弹窗表单
        id: '',
        isPrintReport: '',
        reportTime: '',
        sysReportState: ''
      },
      submitFileList: [], // 报备资料文件
      submitChangeFileList: [], // 文件状态改变时的文件列表
      printVisible: false, // 是否可以打印对话框
      printDialogForm: { // 是否可以打印报告表单
        id: '',
        isPrintReport: '',
        printReportCreatetime: ''
      },
      confirmRules: {
        sysKeepOnRecordState: [
          { required: true, message: '请选择是否报备', trigger: 'change' }
        ],
        keepOnRecordTime: [
          { required: true, message: '请选择报备时间', trigger: 'change' }
        ],
        sysNum: [
          { required: true, message: '请输入报备编号', trigger: 'blur' }
        ]
      },
      submitRules: {
        sysReportState: [
          { required: true, message: '请选择是否提交报告', trigger: 'change' }
        ],
        reportTime: [
          { required: true, message: '请选择提交报告时间', trigger: 'change' }
        ]
      },
      printRules: {
        isPrintReport: [
          { required: true, message: '请选择是否可以打印报告', trigger: 'change' }
        ],
        printReportCreatetime: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ]
      },
      url: process.env.VUE_APP_BASE_API, // url前缀
      headers: {} // 上传文件的headers
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    })
  },
  methods: {
    moreReport() {
      this.$router.push({ name: 'report' })
    },
    async getUserTableData () {
      let topList = await querySysFroProjectAssistant(this.userForms)
      this.esintProjectSysData = topList.result.records;
    },
    getToke() {
      this.headers = {
        'X-Access-Token': window.sessionStorage.getItem('token'),
        'Access-Control-Allow-Origin': '*'
      }
    },
    // 报备确认
    async reportConfirm(id) {
      const data = await selectProjectSystemById({ id: id })
      this.confirmDialogForm.keepOnRecordTime = data.data.result.keepOnRecordTime
      this.confirmDialogForm.sysKeepOnRecordState = data.data.result.sysKeepOnRecordState
      this.confirmDialogForm.sysNum = data.data.result.sysNum
      if (data.data.result.keepFileName) {
        this.confimFileList = []
        this.confimFileList.push({
          name: data.data.result.keepFileName,
          url: data.data.result.keepPath
        })
      }
      this.confirmDialogForm.id = id
      this.confirmVisible = true
    },
    // 报告提交
    async reportSubmit(id) {
      const data = await selectProjectSystemById({ id: id })
      this.submitDialogForm.isPrintReport = data.data.result.isPrintReport
      this.submitDialogForm.reportTime = data.data.result.reportTime
      this.submitDialogForm.sysReportState = data.data.result.sysReportState
      if (data.data.result.reportFileName) {
        this.submitFileList = []
        this.submitFileList.push({
          name: data.data.result.reportFileName,
          url: data.data.result.reportPath
        })
      }
      this.submitDialogForm.id = id
      this.submitVisible = true
    },
    handleCloseConfirm() {
      this.$refs['confirmDialogForm'].resetFields();
      this.$refs.confirmUpload.clearFiles()
      this.confirmVisible = false
    },
    handleSubmitConfirm() {
      const _this = this
      this.$refs['confirmDialogForm'].validate((valid) => {
        if (valid) {
          if (this.confimChangeFileList.length > 0) {
            _this.$refs.confirmUpload.submit();
          } else {
            doKeepOnRecord(this.confirmDialogForm)
          }
          this.getUserTableData()
          this.confirmVisible = false
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    confirmOnChange(file, fileList) {
      // console.log(file, fileList)
      this.confimChangeFileList = fileList
    },
    confirmOnSuccess(response, file, fileList) {
      // console.log(response, file, fileList)
    },
    handleCloseSubmit() {
      this.$refs['submitDialogForm'].resetFields();
      this.$refs.submitUpload.clearFiles()
      this.submitVisible = false
    },
    handleSubmitSubmit() {
      const _this = this
      this.$refs['submitDialogForm'].validate((valid) => {
        if (valid) {
          // console.log(this.submitChangeFileList)
          if (this.submitChangeFileList.length > 0) {
          //  console.log(789)
            _this.$refs.submitUpload.submit();
          } else {
            // console.log(123)
          //  console.log(this.submitDialogForm)
            doEvaluationReport(this.submitDialogForm)
          }
          this.getUserTableData()
          this.submitVisible = false
        } else {
          console.log('error submit!!');
          return false;
        }
      })
    },
    submitOnChange(file, fileList) {
      // console.log(file, fileList)
      this.submitChangeFileList = fileList
    },
    submitOnSuccess(response, file, fileList) {
      // console.log(response, file, fileList)
    },
    async reportPrint(id) {
      const data = await selectProjectSystemById({ id: id })
      this.printDialogForm.id = id
      this.printDialogForm.isPrintReport = data.data.result.isPrintReport
      this.printDialogForm.printReportCreatetime = data.data.result.printReportCreatetime
      this.printVisible = true
    },
    handleSubmitPrint() {
      const _this = this
      this.$refs['printDialogForm'].validate((valid) => {
        if (valid) {
          doEvaluationReportPrint(_this.printDialogForm).then((res) => {
            _this.getUserTableData()
          })
          _this.printVisible = false
        } else {
          return false;
        }
      })
    },
    handleClosePrint() {
      this.printVisible = false
    }
  },
  mounted () {
    this.getUserTableData();
    this.getToke()
  }
}
</script>
<style lang="scss" scoped>

</style>

<style lang="scss" scoped>
  .project-data-table{
    border: 1px solid #DCDFE6;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
    box-shadow: 0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
    background: #fff;
    padding:20px;
    h1{
      font-size: 18px;
      font-weight: bold;
    }
    .el-table .cell{
      text-align: center;
    }
    .more_box{
      text-align: right;
      margin-top: 30px;
      font-size: 30px;
      line-height: 0px;
      font-weight: bold;
      .more_btn{
        border:none;
        background: #fff;
        color: #858585;
        cursor: pointer;
      }
    }
  }
</style>
