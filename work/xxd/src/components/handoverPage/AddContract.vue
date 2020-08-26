<template>
  <el-dialog title="补充合同"
            :visible="addBargainVisible"
            @open="open"
            @close="closeFn"
            width="500px">
    <div class="txtC">
      关联合同：
      <el-select v-model="bargainNo_add" placeholder="请选择合同" popper-class="selectW">
        <el-option
          v-for="item in contractList"
          :key="item.bargainNo"
          :label="item.bargainName"
          :value="item.bargainNo">
        </el-option>
      </el-select>
      <div>
        <el-button type="primary"
                @click="submitBargainNo"
                size="">保存</el-button>
        <el-button @click="closeFn"
                size="">取消</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getBragainList } from '@/api/loophole'
export default {
  props: {
    addBargainVisible: {
      type: Boolean,
      default: false
    },
    curRow: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      bargainNo_add: '',
      contractList: []
    }
  },
  methods: {
    async open() {
      console.log('open-Bargain')
      this.bargainNo_add = ''
      // 获取所有合同list
      this.contractList = this.utils.cloneDeep(await getBragainList())
    },
    closeFn() {
      this.$emit('addClose')
    },
    submitBargainNo() {
      if (!this.bargainNo_add) {
        this.$message.error('请选择合同')
        return
      }
      post('/com/esintProjectSubmission/editBargain', { 
        id: this.curRow.id,
        bargainNo: this.bargainNo_add
      }).then((res) => {
        if (res.success) {
          this.$message.success('提交成功')
          // this.addBargainVisible = false;
          // 刷新表格数据
          this.$emit('addSuccess')
        }
      })
    },
  }
}
</script>