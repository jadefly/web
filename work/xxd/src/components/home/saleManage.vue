<template>
  <div class="clear">
     <div class="flex_box">
        <div class="half_box pr10">
            <div class="flex_box ta_center">
                <div class="flex_auto">
                    <div class="half_box fl font7ea5ff">
                        <p class="font16">年度目标总金额</p>
                        <p class="font24">3,456,354</p>
                    </div>
                    <div class="half_box fl font14 ta_left">
                        <p class="font5084ff"><span class="icon_span"></span> 已完成 456,354</p>
                        <p class="fontf9ae26 mt10"><span class="icon_span"></span> 未完成 3,000,000</p>
                    </div>
                </div>
                <div class="flex_1 fontf9ae26">
                    <div>
                        <p class="font16">剩余预计落单</p>
                        <p class="font24 mt10">54</p>
                    </div>
                </div>
            </div>
            <div class="mt20 ta_left">
                <p class="mt20 font18"><span class="font666">预计落单数 <span class="font_bold">700</span> / </span><span class="font5084ff">实际落单数 <span class="font_bold">646</span></span></p>
                <div class="clear mt20">
                    <div class="fl half_box pr10">
                        <el-table :data="quarterData" class="border_table scroll_table" :header-cell-style="{'text-align':'center'}" :cell-style="{'text-align':'center','height':'85px'}">
                            <el-table-column prop="quarter"
                                label="季度"
                                key='1'>
                            </el-table-column>
                            <el-table-column
                            prop="targetOrder"
                            label="预计落单">
                            </el-table-column>
                            <el-table-column
                            prop="realOrder"
                            label="实际落单">
                            </el-table-column>
                        </el-table>
                    </div>
                    <div class="fl half_box pl10">
                        <el-table :data="monthData" class="border_table scroll_table" height="400px" :header-cell-style="{'text-align':'center'}" :cell-style="{'text-align':'center'}">
                            <el-table-column prop="month"
                                label="月份"
                                key='1'>
                                <template slot-scope="scope">
                                    {{scope.row.month &lt; 10 ?'0'+scope.row.month:scope.row.month}}月
                                </template>
                            </el-table-column>
                            <el-table-column
                            prop="targetOrder"
                            label="预计落单">
                            </el-table-column>
                            <el-table-column
                            prop="realOrder"
                            label="实际落单">
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
        <div class="half_box pl10">
            <h1 class="section_title">员工目标</h1>
            <el-table :data="staffTarget" class="border_table scroll_table" height="540px" :header-cell-style="{'text-align':'center'}" :cell-style="{'text-align':'center'}">
                <el-table-column prop="numcode"
                    label="序号"
                    width="50px"
                    key='1'>
                    <template slot-scope="scope">
                        {{scope.$index+1}}
                    </template>
                </el-table-column>
                <el-table-column
                prop="staffName"
                label="姓名">
                </el-table-column>
                <el-table-column
                prop="targetNum"
                label="目标总金额">
                </el-table-column>
                <el-table-column
                prop="completeNum"
                label="已完成金额">
                </el-table-column>
                <el-table-column
                prop="uncompletedNum"
                label="未完成金额">
                </el-table-column>
                <el-table-column
                prop="targetOrder"
                label="预计落单">
                </el-table-column>
                <el-table-column
                prop="completeOrder"
                label="实际落单">
                </el-table-column>
            </el-table>
        </div>
      </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'contentdiv',
  components: {

  },
  data() {
    return {
      staffTarget: [
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 },
        { staffName: '张耀扬', targetNum: '27,123', completeNum: '27,081', uncompletedNum: '19,118', targetOrder: 89, completeOrder: 70 }
      ],
      quarterData: [
        { quarter: '一季度', targetOrder: 100, realOrder: 89 },
        { quarter: '二季度', targetOrder: 210, realOrder: 220 },
        { quarter: '三季度', targetOrder: 100, realOrder: 100 },
        { quarter: '四季度', targetOrder: 100, realOrder: 96 }
      ],
      monthData: [
        { month: 1, targetOrder: 30, realOrder: 33 },
        { month: 2, targetOrder: 30, realOrder: 33 },
        { month: 3, targetOrder: 30, realOrder: 33 },
        { month: 4, targetOrder: 30, realOrder: 33 },
        { month: 5, targetOrder: 30, realOrder: 33 },
        { month: 6, targetOrder: 30, realOrder: 33 },
        { month: 7, targetOrder: 30, realOrder: 33 },
        { month: 9, targetOrder: 30, realOrder: 33 },
        { month: 9, targetOrder: 30, realOrder: 33 },
        { month: 10, targetOrder: 30, realOrder: 33 },
        { month: 11, targetOrder: 30, realOrder: 33 },
        { month: 12, targetOrder: 30, realOrder: 33 }
      ]
    }
  },
  computed: {
    ...mapState({
      userAndRoleInfo: (state) => state.userAndRoleInfo
    }),
    ...mapGetters(['getListParams', 'getRoleCode'])
  },
  methods: {

  },
  mounted () {
  }
}
</script>
<style lang="scss" scoped>
    .project-data-panel{
        .ta_center{text-align: center;}
        .half_box{
            width: 50%;
        }
        .pl10{padding-left: 10px;}
        .pr10{padding-right: 10px;}
        .ta_left{
            text-align: left;
        }
        .border_table{
            border:1px #dcdfe6 solid
        }
        .section_title{
            font-size: 18px;
            font-weight: bold;
            text-align: left;
            margin-bottom: 20px;
        }
        .flex_box{
            display: flex;
            justify-content:space-between
        }
        .flex_auto{
            //flex:1 0 auto;
            border:1px #c5d5f9 solid;
            border-radius:5px;
            background: linear-gradient(to right,#fff,#eef3ff);
            margin-right:10px;
            padding:15px 0;
            div{
                padding:0 15px;
                vertical-align: middle;
            }
            div:last-child{
                border-left: 1px #dcdfe6 dashed;
            }
            .icon_span{
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                vertical-align: middle;
            }
        }
        .flex_1{
            //flex:0 0 auto;
            background: #fef7e9;
            border-radius: 5px;
            background: #fef7e9;
            border:1px #f9e6c1 solid;
            padding:15px;
            position: relative;
        }
        .mt10{margin-top: 10px;}
        .mt20{margin-top: 20px;}
        .font16{font-size: 16px;}
        .font18{font-size:18px}
        .font24{font-size: 24px;}
        .font14{font-size: 14px;}
        .font7ea5ff{color: #7ea5ff;}
        .font5084ff{color:#5084ff}
        .font5084ff .icon_span{background: #5084ff;}
        .fontf9ae26{color: #f9ae26;}
        .fontf9ae26 .icon_span{background: #f9ae26;}
        .font666{color:#666}
        .font_bold{font-weight: bold;}
    }
</style>
