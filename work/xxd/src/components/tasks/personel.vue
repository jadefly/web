<!-- 人员安排
  首页有标题
  首页无项目列，不可指派，只可查看
-->
<template>
  <div class="personelBox" :class="{personelBox_home: from==='home'}">
    <div class="title" v-if="from==='home'">人员工作安排</div>
    <div class="timeBox">
      <el-date-picker  class="monthSelW"
              :clearable="false"
              v-model="curYM" type="month" size="small"
              value-format="yyyy-MM" placeholder="选择日期时间" @change="handleYM"></el-date-picker>
      <el-select v-model="curWeek" class="weekSelW ml10" @change="handleWeek" size="small">
        <el-option v-for="(w, idx) in weekMapList"
                  :value="w.weekStart + '~' + w.weekEnd"
                  :label="w.weekStart + '~' + w.weekEnd"
                  :key="'week_'+idx"></el-option>
      </el-select>
    </div>
    <section class="scheduleBox" :class="{scrollCss: from==='home'}">        
      <table width="100%" class="tableSchedule">
        <thead>
          <tr>
            <th width="6%">工作人员</th>
            <th width="12%" v-if="from!=='home'">项目</th>
            <th width="6%">时间段</th>
            <th class="weekCell" v-for="(w, idx) in weekData" :key="'w'+idx">{{ w }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, idx) in staffWork">
            <tr :key="item.sysUserId">
              <td rowspan="2" class="username">
                {{ item.sysUserName }}
              </td>
              <td rowspan="2" class="space" v-if="from!=='home'">
                <div class="proName proNameCanClick"
                    v-for="(pro, index) in item.projectList"
                    @click="editHandle(item, pro, colorArr[index%10])"
                    :style="{background: colorArr[index%10]}"
                    :key="pro.id">
                  {{ pro.projectName }}
                </div>
              </td>
              <td>上午</td>
              <td class="space" v-for="(sraff, idx) in item.sraffWork[0]" :key="'sr1'+idx" :class="{free: sraff.projectName===''}">
                <div v-if="sraff.projectName" class="proName" :style="{background: sraff.key==='0'?'#bbb':sraff.bgColor}">{{ sraff.projectName }}</div>
                <span v-else>空闲</span>
              </td>
            </tr>
            <tr :key="'staff2'+idx">
              <td>下午</td>
              <td class="space" v-for="(sraff, idx) in item.sraffWork[1]" :key="'sr2'+idx" :class="{free: sraff.projectName===''}">
                <div v-if="sraff.projectName" class="proName" :style="{background: sraff.key==='0'?'#bbb':sraff.bgColor}">{{ sraff.projectName }}</div>
                <span v-else>空闲</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </section>

    <DailogPersonel :dialogFormVisible="dialogFormVisible"
      :proData="curProData"
      :sysUserName="curUserName"
      :sysUserId="curSysUserId"
      :projectId="curProjectId"
      :projectName="curProjectName"
      :curWeek="curWeek"
      :bgColor="curBgColor"
      @sucessUpdata="init"
      @closeDialog="closeDialog"></DailogPersonel>
  </div>
</template>

<script>
import DailogPersonel from '@/components/tasks/dailogPersonel'
export default {
  props: {
    projectId: {
      type: String,
      default: ''
    },
    from: {
      type: String,
      default: '' // taskSchedule 父：日程安排  home 首页
    }
  },
  components: {
    DailogPersonel
  },
  data() {
    return {
      month: '',
      curYM: '',
      curWeek: '',
      weekMapList: [],
      staffWork: [],
      colorArr: ['#7298f2', '#9294f6', '#aa9cef', '#beb4ef', '#91aff5', '#b5c8f5', '#86ca86', '#9bca86', '#b3ca86', '#c8d689'],
      week: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      dialogFormVisible: false,
      curProData: {},
      curUserName: '',
      curProjectName: '',
      curProjectId: '',
      curSysUserId: '',
      curBgColor: ''
    }
  },
  computed: {
    year() {
      let data = new Date(this.curYM)
      this.month = data.getMonth() + 1
      return data.getFullYear()
    },
    weekData() { // 表格头部-时间
      let wArr = [];
      let startTime = this.curWeek.split('~')[0]
      console.log('startTime:', startTime)
      if (!startTime) return this.week
      this.week.forEach((el, i) => {
        let d = this.utils.dateAddDays(startTime, i, 'mm-dd')
        if (d) wArr.push(`${d}(${el})`)
      })
      return wArr
    },
    getAjaxUrl() {
      let url = ''
      if (this.from === 'taskSchedule') {
        url = '/esintProjectWorkerScheduling/querydate'
      } else if (this.from === 'home') {
        url = '/esintProjectByCTO/queryWorkDateForTechnique' // 首页获取数据的接口
      }
      return url
    }
  },
  watch: {
    projectId: {
      handler(newV, oldV) {
        console.log('projectId', newV)
        this.init()
      },
      immediate: true
    }
  },
  methods: {
    init() {
      let params = {};
      if (this.from === 'taskSchedule') {
        params = { projectId: this.projectId }
      }
      this.getData(true, this.getAjaxUrl, params)
    },
    closeDialog(val = false) {
      console.log('close', val)
      this.dialogFormVisible = val
    },
    editHandle(item, pro, bgColor) {
      console.log('编辑弹框', item, pro, bgColor)
      if (this.from === 'home') return;
      this.dialogFormVisible = true

      this.curProjectId = pro.id
      this.curProjectName = pro.projectName;
      this.curUserName = item.sysUserName
      this.curSysUserId = item.sysUserId
      this.curBgColor = bgColor
    },
    handleYM() {
      console.log('ym', this.curYM)
      let params = {
        year: this.year,
        month: this.month
      }
      if (this.from === 'taskSchedule') {
        params.projectId = this.projectId
      }
      this.getData(true, this.getAjaxUrl, params)
    },
    handleWeek() {
      console.log('curWeek:', this.curWeek)
      let url = this.getAjaxUrl
      let params = { timeSlot: this.curWeek }
      if (this.from === 'taskSchedule') {
        url = '/esintProjectWorkerScheduling/queryTimeSlot'
        params.projectId = this.projectId
      }
      this.getData(false, url, params)
    },
    async getData(first, url, params = {}) {
      let res = await post(url, params).catch(() => {
        console.log('错误')
      })
      console.log('人员安排数据', res)
      if (res && res.success) {
        let { weekMapList, year, month, staffWork } = res.result
        this.staffWork = this.utils.cloneDeep(staffWork)
        if (first) {
          this.weekMapList = this.utils.cloneDeep(weekMapList).slice(0, 7)
          let fined = this.weekMapList.find((el) => el.type)
          this.curWeek = `${fined.weekStart}~${fined.weekEnd}`
          
          this.curYM = `${year}-${month}`
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.personelBox {
  .monthSelW { width: 150px;}
  .weekSelW { width: 220px;}
  .scheduleBox {
    margin-top: 15px;
    line-height: 40px;
    font-size:14px;
    text-align: center;
    border-radius: 3px;
    .tableSchedule {
      line-height: 40px;
      font-size:14px;
      border-radius: 3px;
      box-sizing: border-box;
      overflow: hidden;
      border-collapse: collapse;
      border-spacing: 0;
      tr {
        td, th {
          border: 1px solid #dcdfe6;
          text-align: center;
        }
      }
      > thead {
        th {
          background: #ebf1ff;
          color: #5a8bff;
          font-weight: bold;
          line-height: 1.3;
          padding: 5px;
          height: 45px;
        }
      }
      > tbody {
        > tr {
          .username {
            background: #f9f9f9;
          }
          .proName {
            background: #b5c8f5;
            line-height: 1.4;
            font-size:12px;
            border-radius: 8px;
            color: #fff;
            padding: 3px 3px;
            &:not(:last-of-type) {
              margin-bottom: 8px;
            }
          }
          .proNameCanClick {
            cursor: pointer;
          }
          .space {
            padding: 10px 15px;
          }
          .free {
            background: #fdebc9;
            color: #f9ae26;
          }
        }
      }
    }
    
    dl {
      border:1px solid #dcdfe6;
      border-radius: 3px;
      dt, dd {
        border-bottom: 1px solid #dcdfe6;
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: stretch; 
      }
      dt {
        background: #ebf1ff;
        color: #5a8bff;
        font-weight: bold;
      }
      dd {
        display: flex;
      }
    }
    
    .cell {
      flex: 1;
      &:not(:last-of-type) {
        border-right: 1px solid #dcdfe6;
      }
    }
    .lineB {
      border-bottom: 1px solid #dcdfe6;
    }
    
  }
}
/**首页-样式 */
.personelBox_home {
  background: #fff;
  margin-top:20px;
  box-shadow: 0 2px 10px 0 rgba(0,0,0,.1);
  border-radius: 4px;
  padding: 20px 20px;
  position: relative;
  .title {
    font-size: 18px;
    line-height: 1.1;
    margin-bottom: 25px;
  }
  .timeBox {
    position: absolute;
    top: 15px;
    left: 220px;
  }
  .scheduleBox {
    max-height: 450px;
    overflow-y: auto;
  }
}

</style>
