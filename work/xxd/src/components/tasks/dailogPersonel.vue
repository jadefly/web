<template>
  <el-dialog title="周工作安排" :visible="dialogFormVisible" class="dailogPersonel"
      @close="closeFn">
    <ul class="dailogUl">
      <li>
        <div class="name">项目成员：</div>
        <div class="con">{{ sysUserName }}</div>
      </li>
      <li>
        <div class="name">项目名称：</div>
        <div class="con">{{ projectName }}</div>
      </li>
    </ul>

    <table class="tableBox">
      <template v-for="(item, i) in staffWork">
        <tr :key="'staff_'+i">
          <td rowspan="2" width="25%">{{ weekData[i] }}</td>
          <td width="20%"><el-checkbox v-model="item[0].selected" :disabled="item[0].key==='0'">上午</el-checkbox></td>
          <td class="txtL padSpace" align="left">
            <!-- {{ item[0] }} -->
            <!-- :load-options="loadOptions" 动态加载二级菜单-->
            <!-- :default-expand-level="1"  都展开-->
            <!-- :sort-value-by="LEVEL" LEVEL/INDEX 排序-->
            <!-- :flat="true" 一级二级分开选择-->
            <span v-if="item[0].msg" class="gray">{{ item[0].msg }}</span>
            <Treeselect v-else  class="myselect"
                  :multiple="true"
                  :disabled="item[0].key==='0'"
                  :options="selOptions"
                  sort-value-by="LEVEL"
                  v-model="item[0].befor"
                  placeholder="请选择"></Treeselect>
          </td>
        </tr>
        <tr :key="'staff2_'+i">
          <td><el-checkbox v-model="item[1].selected" :disabled="item[1].key==='0'">下午</el-checkbox></td>
          <td class="txtL padSpace">
            <span v-if="item[1].msg" class="gray">{{ item[1].msg  }}</span>
            <Treeselect v-else  class="myselect"
                  :multiple="true"
                  :options="selOptions"
                  :disabled="item[1].key==='0'"
                  sort-value-by="LEVEL"
                  v-model="item[1].after"
                  zIndex="10000"
                  placeholder="请选择"></Treeselect>
          </td>
        </tr>
      </template>
      
    </table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeFn">取 消</el-button>
      <el-button type="primary" @click="submitFn">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
const simulateAsyncOperation = fn => {
  setTimeout(fn, 1000)
}
export default {
  components: {
    Treeselect
  },
  props: {
    dialogFormVisible: {
      default: false,
      type: Boolean
    },
    // curProData: {
    //   default: () => {},
    //   type: Object
    // },
    curWeek: {
      default: '',
      type: String
    },
    projectName: {
      default: '',
      type: String
    },
    projectId: {
      default: '',
      type: String
    },
    sysUserName: {
      default: '',
      type: String
    },
    sysUserId: {
      default: '',
      type: String
    },
    bgColor: {
      default: '',
      type: String
    }
  },
  computed: {
    weekData() {
      let wArr = []
      let startTime = this.curWeek.split('~')[0]
      let n = 0
      while (n < 7) {
        let d = this.utils.dateAddDays(startTime, n, 'yy-mm-dd')
        wArr.push(d)
        n++
      }
      return wArr
    }
  },
  data() {
    return {
      formLabelWidth: '120px',
      staffWorkOld: [],
      staffWork: [],
      selOptions: [],
      bDown: false
    }
  },
  mounted() {
    // console.log('mounted', this.curProData)
  },
  methods: {
    // 动态加载二级菜单
    async loadOptions({ action, parentNode, callback, instanceId }) {
      console.log('222222', this.selOptions, parentNode, callback, instanceId)
      if (action === LOAD_CHILDREN_OPTIONS) {
        let arr = await this.getWeekerCon({ workerCode: parentNode.id })
        parentNode.children = arr
        callback()
      }
    },
    getWeekerCon(params) {
      return new Promise((resolve, reject) => {
        post('/esintProjectWorkerScheduling/queryWeekerContent', params).then((res) => {
          if (res.success) {
            let tmp = []
            if (res.result.length > 0) {
              tmp = this.utils.cloneDeep(res.result)
            }
            resolve(tmp)
          } else {
            this.$message.error(res.message)
          }
        })
      })
    },
    closeFn() {
      this.$emit('closeDialog')
    },
    async getslotData(sysUserId, projectId) {
      let res = await post('/esintProjectWorkerScheduling/queryWeekertimeSlotByUser', {
        timeSlot: this.curWeek,
        userId: sysUserId,
        projectId: this.projectId
      })
      let tmp = await this.getWeekerCon({ projectId: projectId })
      this.selOptions = tmp
      if (res.success) {
        this.staffWork = this.utils.cloneDeep(res.result.staffWork)
        this.staffWork.forEach((item) => {
          item.forEach((el) => {
            if (el.key === '0') { // 非自己的， 置灰
              this.$set(el, 'msg', '已安排工作')
            }
            this.$set(el, 'befor', (el.workForenoon && el.workForenoon.split(',')) || null)
            this.$set(el, 'after', (el.workAfternoon && el.workAfternoon.split(',')) || null)
            this.$set(el, 'selected', el.workerId ? true : false)
          })
        })
        this.staffWorkOld = this.utils.cloneDeep(this.staffWork)
        console.log('staffWork:', this.staffWork)
      } else {
        this.$message.error(res.message)
      }
    },
    // getDel(oldArr, newArr) {
    //   if (this.utils.isString(oldArr)) {
    //     oldArr = oldArr.split(',')
    //   }
    //   let del = oldArr.filter((item) => {
    //     let finded = newArr.find((el) => item === el)
    //     if (!finded) return true
    //     return false
    //   })
    //   console.log('del', del)
    //   return del.join(',')
    // },
    getDel(oldArr, newArr) {
      oldArr = oldArr.flat(Infinity)
      let oldArrSelected = oldArr.filter((item) => (item.selected && item.key === '1'))
      let delArr = oldArrSelected.filter((item) => {
        let finded = newArr.find((el) => (item.workerId === el.workerId))
        if (!finded) return true
        return false
      })
      let del = delArr.reduce((acc, cur) => {
        acc.push(cur.workerId)
        return acc
      }, [])
      return del.join(',')
    },
    submitFn() {
      console.log('提交', this.bDown)
      if (this.bDown) return
      this.bDown = true

      let formData = [];
      this.staffWork.forEach((item) => {
        item.forEach((sub, idx) => {
          if (sub.selected && (sub.befor || sub.after) && sub.key === '1') { // key 1为自己的
            if (idx === 0) { // 上午
              sub.workForenoon = (sub.befor && sub.befor.join(',')) || ''
            } else {
              sub.workAfternoon = (sub.after && sub.after.join(',')) || ''
            }
            let base = {
              id: sub.workerId || '',
              projectId: this.projectId,
              sysUserId: this.sysUserId,
              sysUserName: this.sysUserName,
              bgColor: this.bgColor
            }
            formData.push({ ...base, ...sub })
          } 
        })
      })
      let delWeekerIds = this.getDel(this.staffWorkOld, formData)
      console.log('提交', formData, delWeekerIds)
      // return false
      post('/esintProjectWorkerScheduling/saveWorkDateBytimeSlot', {
        delWeekerIds: delWeekerIds, // 删除项的workerId
        weekerSchedulingList: formData
      }).then((res) => {
        this.bDown = false
        if (res.success) {
          this.$message.success('提交成功')
          this.closeFn();
          this.$emit('sucessUpdata')
        } else {
          this.$message.error(res.message);
        }
      }).catch(() => {
        this.bDown = true
      })
    }
  },
  watch: {
    dialogFormVisible(newV) {
      this.staffWork = [];
      this.selOptions = [];
      this.getslotData(this.sysUserId, this.projectId)
    }
  }
}
</script>
<style scoped lang="scss">
.dailogPersonel {
  .dailogUl {
    > li {
      display: flex;
      line-height: 30px;
      .name {
        // width: 120px;
        text-align: right;
      }
    }
  }
  .tableBox {
    .padSpace {
      padding: 10px;
      max-width: 200px;
    }
    .myselect {
      // max-width: 200px;
      cursor: pointer;
    }
    td.txtL { text-align: left !important; }
    .gray { color: #bdbdbd;}
  }
}

</style>
<style  lang="scss">
.dailogPersonel {
  .el-dialog__body {
    padding-top: 20px;
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>
