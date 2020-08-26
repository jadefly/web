<template>
    <el-tabs type="border-card" class="borderCard">
      <el-tab-pane class="tabPane" label="项目流程">
          <el-input
            class="search"
            placeholder="请输入关键字"
            suffix-icon="el-icon-search"
            @input="processSearch"
            v-model="processKeyWord">
          </el-input>
          <el-row :gutter="20" class="processNum">
            <el-col class="numCol" :span="8">
              <span class="title ">项目启动</span>
              <span class="comment">{{processData.projectStateNum.qdgc || '0'}}</span>
            </el-col>
            <el-col class="numCol" :span="8">
              <span class="title ">项目规划</span>
              <span class="comment">{{processData.projectStateNum.ghgc || '0'}}</span>
            </el-col>
            <el-col class="numCol" :span="8">
              <span class="title ">项目执行</span>
              <span class="comment">{{processData.projectStateNum.zxgc || '0'}}</span>
            </el-col>
            <el-col class="numCol" :span="8">
              <span class="title ">项目监控</span>
              <span class="comment">{{processData.projectStateNum.jggc || '0'}}</span>
            </el-col>
            <el-col class="numCol" :span="8">
              <span class="title ">项目收尾</span>
              <span class="comment">{{processData.projectStateNum.swgc || '0'}}</span>
            </el-col>
          </el-row>
          <div class="processView" v-for="(item, index) in processViewList" :key="'processViewList_'+item.projectId">
            <div class="processTitle" :title="item.projectName +' '+item.managerName+' '+item.customerName+' '+moment(item.createTime).format('YYYY-MM-DD')">
              <span>{{index + 1}}</span>
              <span>{{item.projectName}}</span>
              <span>{{item.managerName}}</span>
              <span>{{item.customerName}}</span>
              <span>{{moment(item.createTime).format('YYYY-MM-DD')}}</span>
            </div>
            <!-- 项目状态(0：未实施 300101：启动过程 300102：规划过程 300103：执行过程 300104：监管过程 300105：收尾过程）,1 完成 -->
            <el-steps class="steps" :active="item.stateActive" align-center finish-status="success">
              <el-step title="项目启动"></el-step>
              <el-step title="项目规划"></el-step>
              <el-step title="项目执行"></el-step>
              <el-step title="项目监控"></el-step>
              <el-step title="项目收尾"></el-step>
            </el-steps>
            <el-progress :percentage="Number(item.progress)"></el-progress>
          </div>
      </el-tab-pane>
      <el-tab-pane class="tabPane" label="项目实施中的问题">
        <div class="problemSearch">
          <el-select v-model="questionStatus" size="mini" placeholder="问题状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="未解决" value="0"></el-option>
            <el-option label="已解决" value="1"></el-option>
          </el-select>
          <el-input class="input" v-model="questionName" size="mini" placeholder="问题名称"></el-input>
          <el-button type="primary" @click="problemSearch" size="mini" round>查询</el-button>
        </div>
        <div class="problemOperating clear">
          <el-col class="unsolved" :span="8">
            <span class="title ">未解决</span>
            <span class="comment">{{acceptAndUnacceptCountMap.unAcceptNum || '0'}}</span>
          </el-col>
          <el-col class="solved" :span="8">
            <span class="title ">已解决</span>
            <span class="comment">{{acceptAndUnacceptCountMap.acceptNum || '0'}}</span>
          </el-col>
          <div class="fr">
            <!-- <el-button type="text" class="del" icon="el-icon-delete-solid"></el-button> -->
            <el-button type="text" class="add" @click="addProblem" icon="el-icon-plus"></el-button>
          </div>
        </div>
        <div class="border"></div>
        <div class="problemContent" v-for="(item, index) in projectImplementQuestionList" :key="'projectImp_'+item.id + index">
            <div class="processTitle">
              
              <span class="titleTxte" :title="item.projectName+'----'+item.title"><span>{{index + 1}}</span>{{item.projectName}}----{{item.title}}</span>
              <el-button v-if="item.createUserName == getRoleName" type="text" class="del" @click="delProblem(item.id)" icon="el-icon-delete-solid"></el-button>
              <el-tag v-if="item.state == '1'" class="tag" size="mini" :hit="true">已解决</el-tag>
              <el-tag v-if="item.state == '0'" class="tag" type="warning" size="mini" :hit="true">未解决</el-tag>
            </div>
            <div class="description">
              <p>{{item.details}}</p>
              <el-row class="descriptionRow">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="8">
                    <span>项目经理：{{item.accepter}}</span>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="8">
                    <span>提交问题人员：{{item.createUserName}}</span>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="16">
                    <span>提交时间：{{item.createDate}}</span>
                </el-col>
              </el-row>
            </div>
            <div class="solveProblem">
              <el-button  v-if="item.esintReplyHistoryList.length == 0" @click="solveOpen(item.id)" type="primary" round size="mini">我来解决</el-button>
              <template v-else>
                <div v-for="val in item.esintReplyHistoryList" :key="'sub'+val.id">
                  <p>{{val.replyContext}}</p>
                  <div  class="title">
                    <el-row>
                      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
                          <span>解决人员：{{val.replyUserName}}</span>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
                          <span>解决时间：{{val.replyTime}}</span>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </template>
            </div>
        </div>
      </el-tab-pane>
      <el-dialog
        title="添加问题"
        :visible.sync="problemVisible"
        width="30%"
        :before-close="problemClose">
        <el-form ref="problemForm" :rules="problemRules" :model="problemForm" label-width="80px">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="problemForm.projectId"
              filterable
              remote
              placeholder="请输入项目名称"
              @change="projectNameChange"
              :remote-method="projectRemoteMethod">
              <el-option
                v-for="(item, idx) in projectList"
                :key="'projectList_'+item.id + idx"
                :label="item.projectName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="@人员" prop="accepterId">
            <el-select  v-model="problemForm.accepterId" placeholder="请选择该项目相关人员">
              <el-option v-for="item in accepterList" :key="'accepterList_'+item.sysUserId" :label="item.sysUserName" :value="item.sysUserId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="问题标题" prop="title">
            <el-input v-model="problemForm.title"></el-input>
          </el-form-item>
          <el-form-item label="问题描述" prop="details">
            <el-input type="textarea" :rows="4" v-model="problemForm.details"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="problemSumbit">添加</el-button>
          <el-button @click="problemClose">取消</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="解决问题"
        :visible.sync="solveViewList"
        width="30%"
        :before-close="solveClose">
        <el-form ref="solveForm" :rules="solveRules" :model='solveForm'>
          <el-form-item prop="replyContext">
            <el-input type="textarea" :rows="6" v-model="solveForm.replyContext"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="solveSumbit">确定</el-button>
          <el-button @click="solveClose">取消</el-button>
        </span>
      </el-dialog>
    </el-tabs>
</template>
<script>
import { getProjectStateNums, queryProjectIdandName, getProjectAndUser, addProjectImplementQuestion , getProjectImplementQuestionList, delProjectImplementQuestion ,iToSolveQusestion } from '@/api/home'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'processdiv',
  components: {
  },
  props: {
  },
  data () {
    return {
      flag: '',
      processKeyWord: '',
      processData: {
        projectStateNum: {
          qdgc: '',
          ghgc: '',
          zxgc: '',
          jggc: '',
          swgc: ''
        }
      }, // 项目流程数据
      processViewList: [], // 项目流程步骤条数据
      acceptAndUnacceptCountMap: {
        unAcceptNum: 0, // 已解决问题数量
        acceptNum: 0 // 未解决问题数量
      },
      projectImplementQuestionList: [], // 实施中问题列表
      problemVisible: false,
      problemForm: {
        projectId: '', // 项目名称
        accepterId: '', // @人员
        title: '', // 问题标题
        details: '' // 问题描述
      },
      projectList: [], // 项目名称下拉列表
      accepterList: [], // @人员下拉列表
      questionStatus: '', // 问题状态
      questionName: '', // 问题名称
      problemId: '', // 问题ID
      solveForm: {
        replyContext: '' // 我来解决内容\
      },
      solveViewList: false,
      problemRules: {
        projectId: [
          { required: true, message: '请输入项目名称', trigger: 'change' }
        ],
        accepterId: [
          { required: true, message: '请选择@人员', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入问题标题', trigger: 'blur' }
        ],
        details: [
          { required: true, message: '请输入问题描述', trigger: 'blur' }
        ]
      },
      solveRules: {
        replyContext: [
          { required: true, message: '请输入解决内容', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    processData: function (New, Old) {
      // 项目状态(0：未实施 300101：启动过程 300102：规划过程 300103：执行过程 300104：监管过程 300105：收尾过程）,1 完成
      this.processViewList = New.projectInfoList4
      this.processViewList.forEach((item, index) => {
        if (item.state == '1') {
          this.processViewList[index]['stateActive'] = 5
        } else if (item.state == '0') {
          this.processViewList[index]['stateActive'] = -1
        } else if (item.state == '300101') {
          this.processViewList[index]['stateActive'] = 0
        } else if (item.state == '300102') {
          this.processViewList[index]['stateActive'] = 1
        } else if (item.state == '300103') {
          this.processViewList[index]['stateActive'] = 2
        } else if (item.state == '300104') {
          this.processViewList[index]['stateActive'] = 3
        } else if (item.state == '300105') {
          this.processViewList[index]['stateActive'] = 4
        }
      })
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    }),
    ...mapGetters(['getListParams', 'getRoleName'])
  },
  mounted () {
    this.getProjectStateNums()
    this.queryProblemsInProject()
  },
  methods: {
    async getProjectStateNums() {
      let params = {
        year: this.moment().format('YYYY'),
        keyWord: this.processKeyWord
      }
      const data = await getProjectStateNums(params)
      this.processData = data.result
    },
    processSearch() {
      const _this = this
      clearTimeout(this.flag)
      this.flag = setTimeout(function() {
        _this.getProjectStateNums()
      }, 300)
    },
    async queryProblemsInProject() {
      let params = `title=${this.questionName}&state=${this.questionStatus}`
      getProjectImplementQuestionList(params).then((res) => {
        console.log('res', res)
        this.acceptAndUnacceptCountMap = res.result.getProjectImplementQuestionMap.getAcceptAndUnacceptCount
        this.projectImplementQuestionList = res.result.getProjectImplementQuestionMap.getRojectImplementQuestionList
      })
    },
    async addProblem() {
      this.problemVisible = true
    },
    problemSumbit() {
      const { projectId, accepterId, title, details } = this.problemForm
      let params = `projectId=${projectId}&accepterId=${accepterId}&title=${title}&details=${details}`
      this.$refs['problemForm'].validate((valid) => {
        if (valid) {
          addProjectImplementQuestion(params).then((res) => {
            this.queryProblemsInProject()
            this.$refs['problemForm'].resetFields();
            this.problemVisible = false
          })
        } else {
          return false;
        }
      });
    },
    problemClose() {
      this.$refs['problemForm'].resetFields();
      this.problemVisible = false
    },
    projectNameChange(val) {
      let params = `projectId=${val}`
      getProjectAndUser(params).then((res) => {
        console.log(res)
        this.accepterList = res.result.userSelect
      })
    },
    projectRemoteMethod(projectName) {
      queryProjectIdandName(`projectName=${projectName}`).then((res) => {
        console.log(res)
        this.projectList = res.result
      })
    },
    problemSearch() {
      this.queryProblemsInProject()
    },
    delProblem(id) {
      delProjectImplementQuestion(`id=${id}`).then(
        this.queryProblemsInProject()
      )
    },
    solveOpen(id) {
      this.problemId = id
      this.solveViewList = true
    },
    solveSumbit() {
      let params = `id=${this.problemId}&replyContext=${this.solveForm.replyContext}`
      this.$refs['solveForm'].validate((valid) => {
        if (valid) {
          iToSolveQusestion(params).then((res) => {
            this.queryProblemsInProject()
            this.$refs['solveForm'].resetFields();
            this.solveViewList = false
          })
        } else {
          return false;
        }
      });
    },
    solveClose() {
      this.$refs['solveForm'].resetFields();
      this.solveViewList = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .borderCard{
    margin-bottom: 20px;
    .tabPane{
      padding: 10px;
      .el-tabs__item {
        border-top: 3px solid rgba(0, 0, 0, 0);
      }
      .el-tabs__item.is-active {
        border-top: 3px solid #409EFF;
        
      }
      .assignBtn{
        padding: 0;
        .el-icon-plus{
          color: #81ca60;
          font-size: 20px;
          font-weight: 900;
        }
      }
      .processNum{
        text-align: center;
        .numCol{
          margin: 5px 0 5px 0;
          .title{
            // text-align: right;
            font-size: 14px;
            margin: 0 5px 0 5px;
          }
          .comment{
            text-align: center;
            font-size: 22px;
            color: #f9ae26;
            width: 30px;
            display: inline-block;
          }
        }
      }
      .processView{
        .processTitle{
          margin: 10px 0;
          font-size: 12px;
          background-color: #e9f2fb;
          padding: 8px;
          border-radius: 3px;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
          span{
            padding:5px;
          }
        }
        .steps{
          margin:20px 10px;

        }
      }
      .problemSearch{
        display: flex;
        .input{
          margin: 0 8px;
        }
      }
      .problemOperating{
        margin: 10px 0 30px 0;
        .unsolved{
          margin: 5px 0 5px 0;
          .title{
            // text-align: right;
            font-size: 14px;
            margin: 0 5px 0 5px;
          }
          .comment{
            text-align: center;
            font-size: 22px;
            color: #f9ae26;
            width: 30px;
            display: inline-block;
          }
        }
        .solved{
          margin: 5px 0 5px 0;
          .title{
            // text-align: right;
            font-size: 14px;
            margin: 0 5px 0 5px;
          }
          .comment{
            text-align: center;
            font-size: 22px;
            color: #84ca64;
            width: 30px;
            display: inline-block;
          }
        }
        
        .del{
          color: #f67373;
        }
        .add{
          color: #81ca60;
          font-weight: 900;
        }
      }
     .border{
       position: absolute;
       left: 0;
       top: 100px;
       width: 100%;
       border-top: 1px dashed #dcdfe6;
     }
     .problemContent{
        .processTitle{
          margin: 10px 0;
          font-size: 12px;
          background-color: #e9f2fb;
          padding: 8px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          span{
            padding:5px;
          }
          .titleTxte{
            display: inline-block;
            max-width: 60%;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
          }
          .tag{
            border-radius: 30px;
            padding: 0 10px 0 10px;
          }
          .del{
            color: #f67373;
            padding-top: 0;
            padding-bottom: 0;
          }
        }
        .description{
          padding: 0 20px 0 20px ;
          p{
            line-height: 2;
          }
          .descriptionRow{
            // display: flex;
              margin-top: 10px;
          }
        }
        .solveProblem{
          margin-top: 30px;
          padding: 0 20px 0 20px;
          p{
            line-height: 2;
            color:#608fff;
          }
          .title{
            width: 100%;
            margin-top: 10px;
            justify-content: space-between;
            span:last-child{
              text-align: right;
            }
          }
        }
     }
    }
  }
</style>
<style lang="scss">
.steps{
  .el-step__head.is-process{
    color: #5a8bff;
    border-color: #5a8bff;
  }
  .el-step__title.is-process{
    color: #5a8bff;
  }
  .el-step__title{
    font-size: 12px;
  }
}
.search{
  .el-input__icon.el-icon-search{
    color: #5b8bff;
  }
}
.borderCard{
  .el-dialog .el-select{
    width: 100%;
    margin-bottom: 0;
  }
}
</style>
