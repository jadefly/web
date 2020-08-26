<template>
    <div class="record">
      <el-timeline :reverse="true">
          <template>
            
          </template>
          <el-timeline-item v-for="(item,index) in approvalRecordData"
              :key="item.id"
              :color="index == approvalRecordData.length - 1?'#409EFF':''">
              <div>
                  <span>{{item.createTime}}</span>
                  <span>{{item.createName || '&nbsp;'}}</span>
                  <span>{{item.content || '&nbsp;'}}</span>
              </div>
          </el-timeline-item>
      </el-timeline>
      <p class="Norecord" v-if="approvalRecordData.length == 0">无审批记录</p>
    </div>
</template>

<script>
import { getQueryEsintProjectSubmissionRecordByMainId } from '@/api/loophole'

export default {
  name: 'approvalRecord',
  components: {

  },
  props: {
      id:{
          type:String,
          default:''
      }
  },
  data () {
    return {
        approvalRecordData:[],
        reverse:true
    }
  },
  mounted () {
    console.log('approvalRecord',this.id)
    this.getApprovalRecord()
  },
  methods: {
      async getApprovalRecord () {
        const data = await getQueryEsintProjectSubmissionRecordByMainId(this.id)
        this.approvalRecordData = data.result
        console.log('审批记录',data.result)
      }
  }
}
</script>

<style lang="scss" scoped>
  .record{
    padding: 30px;
    span{
      margin-right: 10px;
    }
  }
  .Norecord{
    text-align: center;
    font-size: 16px !important;
  }
</style>