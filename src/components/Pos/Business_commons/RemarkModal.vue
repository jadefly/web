<template>
  <!-- $t-备注 -->
  <Dialog
    name="PosDialog.RemarkModal"
    :title="$t('Dict.Remarks')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    width="682px"
  >
  <div class="table-info">
    <!-- $t-牌号： -->
    <span class="info-item">
      {{getVuexPosMode == '3' ? ($t('Dict.OrderCode01') + bsData.orderCode) : bsData.pointName}}
    </span>
    <span class="info-item">
      <!-- $t-开单时间： -->
      {{ $t('Dict.OpeningTime') }}{{ bsData.openTime | timeFormat }}
    </span>
    <span class="info-item">
      <!-- $t-人数： -->
      {{ $t('Dict.NumberOfPeople01') }}{{ bsData.peopleQty }}
    </span>
  </div>
  <div class="remark-content">
    <!-- $t-选择或输入备注信息 -->
    <h3 class="remark-title">{{ $t('Biz.BizComm.RemarkTip01') }}</h3>
    <div class="remark-area">
      <div class="remark-item" v-for="item in showRemarks" :key="item.id">
        <button type="button" @click="chooseRemark(item)" class="btn btn-default"
          :class="{'btn-primary': isChoosed(item)}"
          >{{item.name}}</button>
      </div>
    </div>
    <div class="pos-pager">
      <div class="pos-pager pos-takeout-pager">
        <span class="page-info">
          <!-- 共{{remarks.length}}条，{{currentPage}}/{{pageCount(remarks)}}页 -->
          {{$t('Dict.PageStyle.Text1', {
            length: remarks.length,
            currentPage: currentPage,
            totalPage: pageCount(remarks),
          })}}
        </span>
        <button href="javascript:;" @click="upPage" class="prev"><i class="el-icon-arrow-up"></i></button>
        <button href="javasctipt:;" @click="downPage(remarks)" class="next"><i class="el-icon-arrow-down"></i></button>
      </div>
    </div>
    <el-row class="input-warp" :gutter="8">
<!--      <el-col :span="20">-->
      <div class="remark">
        <el-input
        v-model="remarkText"
        :placeholder="$t('Biz.BizComm.RemarkTip02')"
        @focus="showAndroidInput('remarkText')">
        </el-input>
      </div>
<!--      <el-col :span="4" v-hideHandwritingBoard>-->
      <div v-hideHandwritingBoard>
        <button type="button" class="btn btn-default"  @click = "handWriting">
          <i class="icon icon-edit"></i>
          <span>{{ $t('Dict.WritingPad') }}</span>
        </button>
      </div>
    </el-row>
  </div>
  <AndroidInput ref="AndroidInput"></AndroidInput>
  </Dialog>
</template>

<script>
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import _ from 'lodash';
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';

// 数字不足两位，在前面补0
function addZero(num) {
  const str = `${num}`;
  if (str.length === 1) return `0${str}`;
  return str;
}

// 转为正常时间字符串
function toNormalTimeStr(timeStamp) {
  let _timeStamp;
  if (timeStamp) {
    _timeStamp = timeStamp.replace('T', ' ');
  }
  const date = new Date(_timeStamp);
  const hour = addZero(date.getHours());
  const min = addZero(date.getMinutes());
  return `${hour}:${min}`;
}

export default {
  components: { Dialog, AndroidInput },
  mixins: [DialogMixin, PageMixin, AndroidInputMixin],
  // 外层绑定的数据
  props: {
    value: {},
  },
  data() {
    return {
      // 当前备注选中
      currentRemark: [],
      // 每页个数
      prePageSize: 10,
      // 自定义备注
      remarkText: '',
      // 备注列表
      remarks: [],
      // 用餐信息
      bsData: {},
      // 手写板
      closeHandWriting: false,
    };
  },
  watch: {
    value(remarkData) {
      if (remarkData && remarkData.remarkList) {
        this.currentRemark = remarkData.remarkList;
      }
      if (remarkData && remarkData.remarkText) {
        this.remarkText = remarkData.remarkText;
      }
    },
  },
  filters: {
    timeFormat(val) {
      return toNormalTimeStr(val);
    },
  },
  computed: {
    ...mapGetters(['posInfo', 'getVuexPosMode']),
    // 分页后的备注列表
    showRemarks() {
      return this.pagination(this.currentPage, this.prePageSize, this.remarks);
    },
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.closeHandWriting = false;
      this.currentPage = 1;
      this.bsData = {};
      this.remarks = this.resData.remarks;
      this.bsData = this.resData.bsData;
      this.currentRemark = this.resData.remarkList ? this.resData.remarkList : [];
      this.remarkText = this.resData.remarkText ? this.resData.remarkText : '';
      if (this.posInfo.isEnableHandwritingBoard) {
        this.closeHandWriting = true;
        this.$devices.Handwriting.open();
      }
      this.$log.info(`打开备注窗口。currentRemark:${this.currentRemark}`);
    },
    // 点击提交更改点菜员
    onSubmit() {
      // this.$emit('input',{
      //   remarkList: this.currentRemark,
      //   remarkText: this.remarkText
      // })
      this.submit({ remarkList: this.currentRemark, remarkText: this.remarkText });
      // this.$message.warning('修改备注成功');
      this.$message.warning(this.$t('Biz.BizComm.RemarkTip03'));
      this.close();
      this.$log.info(`提交备注窗口。currentRemark:${this.currentRemark},remarkText:${this.remarkText}`);
    },
    // 检测remark是否选中
    isChoosed(remark) {
      return this.currentRemark.findIndex(item => item.id === remark.id) >= 0;
    },
    // 选择备注
    chooseRemark(remark) {
      // 找到点击的remark是否在已有列表中
      const choosedRemarkIndex = this.currentRemark.findIndex(item => item.id === remark.id);
      if (choosedRemarkIndex >= 0) {
        // 有则删除
        this.$delete(this.currentRemark, choosedRemarkIndex);
      } else {
        // 无则添加
        this.currentRemark.push(remark);
      }
    },
    onClose() {
      if (this.closeHandWriting) {
        this.$devices.Handwriting.close();
      }
    },
    handWriting() {
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else {
        this.$devices.Handwriting.open();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// 箭头按钮
.pos-takeout-pager {
    > button {
      display: inline-block;
      width: 44px;
      height: 30px;
      border: 1px solid #9a9a9a;
      line-height: 28px;
      border-radius: 14px;
      text-align: center;
      margin-left: 8px;
      background-color: white;

      > i {
        color : #9a9a9a;
      }

      &[disabled] {
        color: @btn-disabled-color;
        cursor: not-allowed;
      }
    }
  }

// 开台信息
.table-info{
  line-height: 60px;
  padding-left: 16px;
  color: @gray-dark;
  .info-item{
    padding-right: 16px;
  }
}

.remark-content{
  background-color: @white;
  box-shadow: 0px -2px 4px #888888;
  padding: 0 12px 36px;
  .remark-title{
    line-height: 62px;
    color: #333;
  }
}

// 备注区域
.remark-area{
  margin: -5px;
  height: 104px;
  .remark-item{
    padding: 5px;
    display: inline-block;
    width: 20%;
    button{
      height: 40px;
      width: 100%;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
  }
}

// 分也区域
.pos-pager{
  background-color: @white;
  overflow: hidden;
  .pos-takeout-pager {
    float: right;
  }
  .page-info{
    font-size: 12px;
  }
}
.input-warp{
  display: flex;
  margin: 24px 0;
  .remark {
    flex: 1;
  }
  button{
    width: 100%;
    color: #333;
    height: 40px;
    i.icon{
      color: #b5b5b5;
    }
  }
}
</style>
