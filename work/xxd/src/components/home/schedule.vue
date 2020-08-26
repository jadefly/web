<template>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
          <span class="title">我的日程</span>
          <el-button style="float: right; padding: 3px 0" type="text"><i class="icon el-icon-more"></i></el-button>
      </div>
      <div class="text item">
          <el-input
            class="search"
            placeholder="请输入日程名称"
            suffix-icon="el-icon-search"
            @input="scheduleSearch"
            v-model="scheduleName">
          </el-input>
          <div>
            <div style="margin: 25px 0;"></div>
            <el-checkbox-group v-model="checkedSchedule" @change="handleCheckedCitiesChange" class="checkedSchedule">
              <el-checkbox v-for="item in scheduleData" :label="item.id" :key="item.id" style="width:100%">
                <div class="checkedLabel">
                  <span>{{item.scheduleDate}}&nbsp;{{item.startTime}}</span>
                  <span v-if="item.level == '0'" style="color: #f56c6c">高</span>
                  <span v-else-if="item.level == '1'" style="color: #f9ae26">中</span>
                  <span v-else-if="item.level == '2'" style="color: #666666">低</span>
                  <span>{{item.scheduleName}}</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <div class="border"></div>
          <div class="bottom clearfix ">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <div class="fr">
              <el-button type="text" @click="delSchedule" :disabled="checkedSchedule.length == 0" class="del" icon="el-icon-delete-solid"></el-button>
              <el-button type="text" @click="addSchedule" class="add" icon="el-icon-plus"></el-button>
            </div>
          </div>
      </div>
      <el-dialog
        title="添加日程"
        :visible.sync="addScheduleVisible"
        width="520px"
        :before-close="addScheduleClose">
        <el-form ref="addScheduleForm" :rules="addScheduleRules" :model="addScheduleForm" label-width="80px">
          <el-form-item label="日程名称" prop="scheduleName">
            <el-input v-model="addScheduleForm.scheduleName"  placeholder="请输入日程名称"></el-input>
          </el-form-item>
          <el-form-item label="优先级" prop="level">
            <el-select v-model="addScheduleForm.level" placeholder="请选择优先级">
              <el-option label="高" value="0"></el-option>
              <el-option label="中" value="1"></el-option>
              <el-option label="低" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期" prop="scheduleDate">
              <el-date-picker type="date" value-format="yyyy-MM-dd" placeholder="选择日期" v-model="addScheduleForm.scheduleDate" style="width: 100%;"></el-date-picker>
          </el-form-item>
          <el-form-item label="起止时间" prop="addScheduleDateRange">
            <el-time-picker
              is-range
              v-model="addScheduleDateRange"
              style="width: 100%;"
              value-format="HH:mm:ss"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间">
            </el-time-picker>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addScheduleSubmit">添加</el-button>
          <el-button @click="addScheduleClose">取消</el-button>
        </span>
      </el-dialog>
    </el-card>
</template>
<script>
import { getMyScheduleList, addMySchedule, delMySchedule, addProjectImplementQuestion } from '@/api/home'
import { mapState } from 'vuex'
export default {
  name: 'schedulediv',
  components: {

  },
  props: {
  },
  data () {
    return {
      falg: '',
      isIndeterminate: false, // indeterminate 属性用以表示 checkbox 的不确定状态，一般用于实现全选的效果
      checkAll: false, // 是否全选
      scheduleIdList: [], // 全部日程ID
      addScheduleDateRange: [this.moment().format('HH:mm:ss'), this.moment().format('HH:mm:ss')],
      scheduleData: [],
      checkedSchedule: [],
      scheduleName: '',
      addScheduleVisible: false, // 添加日程对话框
      addScheduleForm: {
        scheduleName: '', // 日程名称
        level: '', // 优先级
        scheduleDate: '', // 日程日期
        startTime: this.moment().format('HH:mm:ss'), // 开始时间
        endTime: this.moment().format('HH:mm:ss') // 结束时间
      },
      addScheduleRules: {
        scheduleName: [
          { required: true, message: '请输入日程名称', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ],
        scheduleDate: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    addScheduleDateRange: function(New, Old) {
      this.addScheduleForm.startTime = New[0]
      this.addScheduleForm.endTime = New[1]
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: state => state.userAndRoleInfo,
    })
  },
  mounted() {
    this.queryMyScheduleList()
  },
  methods: {
    async queryMyScheduleList() {
      const data = await getMyScheduleList(`scheduleName=${this.scheduleName}`)
      this.scheduleData = data.result.getEsintScheduleList
      data.result.getEsintScheduleList.forEach((item) => {
        this.scheduleIdList.push(item.id)
      })
      console.log('queryMyScheduleList', data)
    },
    scheduleSearch() {
      const _this = this
      clearTimeout(this.falg)
      this.falg = setTimeout(function() {
        _this.queryMyScheduleList()
      }, 300)
    },
    addSchedule() {
      this.addScheduleVisible = true
    },
    addScheduleSubmit() {
      this.$refs['addScheduleForm'].validate((valid) => {
        if (valid) {
          let params = `scheduleName=${this.addScheduleForm.scheduleName}&level=${this.addScheduleForm.level}&scheduleDate=${this.addScheduleForm.scheduleDate}&startTime=${this.addScheduleForm.startTime}&endTime=${this.addScheduleForm.endTime}`
          addMySchedule(params).then((res) => {
            this.queryMyScheduleList()
            this.$refs['addScheduleForm'].resetFields();
          })
          this.addScheduleVisible = false
        } else {
          return false;
        }
      });
    },
    addScheduleClose() {
      this.$refs['addScheduleForm'].resetFields();
      this.addScheduleVisible = false
    },
    delSchedule() {
      let params = `scheduleIds=${this.checkedSchedule.toString()}`
      delMySchedule(params).then((res) => {
        this.$message({
          message: res.message,
          type: 'success'
        });
        this.queryMyScheduleList()
      })
    },
    handleCheckAllChange(val) {
      console.log('handleCheckAllChange', val)
      this.checkedSchedule = val ? this.scheduleIdList : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.scheduleIdList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.scheduleIdList.length;
    }
  }
}
</script>

<style lang="scss" scoped>
  .box-card{
    position: relative;
     .clearfix{
       .title{
          font-size: 18px;
       }
       .icon{
         font-size: 18px;
         color: #858585;
       }
     }
     .border{
       position: absolute;
       left: 0;
       bottom: 50px;
       width: 100%;
       border-top: 1px dashed #dcdfe6;
     }
     .del{
       color: #f67373;
     }
     .add{
       color: #81ca60;
       font-weight: 900;
     }
     .search{
       .el-input__icon{
         color: #5d8dff;
       }
     }
     .checkedSchedule{
       margin-bottom: 20px;
       .checkedLabel{
         display: flex;
         justify-content: space-between;
         span{
           margin: 0 10px;
           text-align: center;
         }
         span:first-child{
           text-align: left;
         }
         span:last-child{
           text-align: right;
           width: 100%;
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
         }
       }
     }
  }
</style>
<style lang="scss">
.item{
  .el-input__icon.el-icon-search{
    color: #5b8bff;
  }
}
.box-card{
  .el-dialog .el-select{
    width: 100%;
    margin-bottom: 0;
  }
  .el-checkbox__label{
    width: 100%;
  }
}
</style>
