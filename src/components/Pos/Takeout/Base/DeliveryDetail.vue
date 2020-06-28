<template>
  <div class="pos-takeout-detail">
    <div v-for="(item,index) in orderItem.o2oTakeoutSendDTOList" :key="item.id">
      <!-- 正常状态展示 -->
      <div v-if="item.sendState < 3 && item.dealState !== 2" class="pos-takeout-div">
        <i v-if="item.modifyBookTimeType" class="yu"></i>
        <div class="pos-takeout-content">
          <div class="pos-takeout-content-circle"></div>
          <el-button
              class="pos-takeout-content-btn-cancel"
              v-if="item.readOnly === 0 && item.canCancel"
              @click="cancel(item)"
          >取消</el-button>
          <div class="pos-takeout-content-name">
            【{{item.sendFromName}}】{{showSendState(item.sendState)}}
            <span v-if="item.sendFrom != 19999">{{item.dePrice + item.sendTip}}</span>
          </div>
          <div class="pos-takeout-content-statediv"
               v-for="stateList in item.sendProc"
               :key="stateList.sendState">
            <span class="pos-takeout-content-state">{{showSendState(stateList.sendState)}}</span>
            <span class="pos-takeout-content-time">{{time(stateList.time)}}</span>
          </div>
          <div class="pos-takeout-content-yuyue" v-if="item.modifyBookTimeType">
            预约发单：{{time(item.bookSendTime)}}
          </div>
          <div class="pos-takeout-content-num" v-if="item.sendNo">订单号：{{item.sendNo}}</div>
          <div class="pos-takeout-content-num" v-if="item.remark">
            备注：{{item.remark}}
          </div>
          <div :class="[item.errorFlg === 1 ? 'pos-takeout-content-error' : 'pos-takeout-content-error-pass']"
              v-if="item.errorState > 0"
          >{{item.errorMsg}}  {{time(item.errorTime)}}
          </div>
          <div v-if="item.canAddTip && item.readOnly === 0">
            <span class="pos-takeout-content-money">小费：{{item.sendTip}}</span>
            <el-button
                class="pos-takeout-content-btn-edit"
                 @click="addTip(item,index)"
                 v-if="item.sendTip"
            >修改</el-button>
            <el-button
                class="pos-takeout-content-btn-addMoney"
                @click="addTip(item,index)"
                v-else
            ><i class="el-icon--left xiaofei"></i><span>加小费</span>
            </el-button>
          </div>
        </div>
      </div>
      <!-- 非正常状态展示 -->
      <div  v-else>
        <div class="pos-takeout-line">
          <div
              class="pos-takeout-line-content"
              v-for="(stateList, index2) in item.sendProc"
              :key="stateList.sendState">
            <i class="finish" v-if="stateList.sendState === 6"></i>
            <div v-else class="pos-takeout-line-content-circle"></div>
            <el-button
                class="pos-takeout-line-content-btn-cancel"
                v-if="item.readOnly === 0 && item.canCancel && index2 === 0"
                @click="cancel(item)"
            >取消</el-button>
            <div class="pos-takeout-line-content-name" v-if="index2 === 0" >
              【{{item.sendFromName}}】{{showSendState(item.sendState)}}
              <span v-if="item.sendFrom != 19999">{{item.dePrice + item.sendTip}}</span>
            </div>
            <div class="pos-takeout-line-content-statediv">
              <span class="pos-takeout-line-content-state">
                {{showSendState(stateList.sendState)}}
              </span>
              <span class="pos-takeout-line-content-time">{{time(stateList.time)}}</span>
            </div>
            <div class="pos-takeout-line-content-num" v-if="stateList.sendState == 2 && item.sendNo">
              订单号：{{item.sendNo}}
            </div>
            <div class="pos-takeout-line-content-num"
                 v-if="stateList.sendState == 2 && item.remark">
              备注：{{item.remark}}
            </div>
            <div class="pos-takeout-line-content-man"
                 v-if="stateList.sendState == 3">骑手：{{item.riderName}}</div>
            <div class="pos-takeout-line-content-phone"
                 v-if="stateList.sendState == 3">电话：{{item.riderPhone}}</div>
            <div class="pos-takeout-line-content-phone"
                 v-if="stateList.sendState == 5">骑手已取餐，正常前往目的地</div>
            <p class="pos-takeout-line-content-place"
               v-if="index2 !== item.sendProc.length - 1 || (index2 === item.sendProc.length - 1 && (item.dealState === 2 || item.errorState > 0))">
            </p>
          </div>
          <!--  取消状态-->
          <div class="pos-takeout-line-content" v-if="item.dealState === 2 && item.errorState <= 0">
            <div class="pos-takeout-line-content-circle circle-gray"></div>
            <div class="pos-takeout-line-content-statediv">
              <span class="pos-takeout-line-content-state line-content-state-cancel">
                {{item.cancelMsg}}
              </span>
              <span class="pos-takeout-line-content-time">{{time(item.cancelTime)}}</span>
            </div>
          </div>
          <!--  异常状态-->
          <div class="pos-takeout-line-content" v-if="item.errorState > 0">
            <div
              class="pos-takeout-line-content-circle"
              :class="[item.errorFlg === 1 ? 'circle-red' : 'circle-gray']"></div>
            <div class="pos-takeout-line-content-statediv">
              <span
                :class="[item.errorFlg === 1 ? 'line-content-state-error' : 'line-content-state-cancel']"
                class=" pos-takeout-line-content-state">
                {{item.errorMsg}}</span>
              <span
                :class="[item.errorFlg === 1 ? 'line-content-state-error' : 'line-content-state-cancel']">
                {{time(item.errorTime)}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AddTip ref="AddTip"></AddTip>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';
// 加小费
const AddTip = (resolve) => {
  import('./AddTip').then((module) => {
    resolve(module);
  });
};

export default {
  name: 'DeliveryDetail',
  components: { AddTip },
  data() {
    return {
      deliveryState: true,
      oldCount: '',
    };
  },
  props: {
    // 外卖单数据
    orderItem: {
      type: Object,
      default: null,
    },
  },
  computed: {},
  methods: {
    //  配送状态
    showSendState(state) {
      switch (state) {
        case 0:
          return '预发单状态';
        case 1:
          return '发单失败';
        case 2:
          return '发单成功';
        case 3:
          return '抢单成功';
        case 4:
          return '骑手到店';
        case 5:
          return '已取餐';
        case 6:
          return '配送完成';
        default:
          return '配送状态';
      }
    },
    // 格式化时间
    time(dateString) {
      if (dateString) {
        return dateFormat('%H:%I:%S', new Date(dateString));
      }
      return '暂无时间信息';
    },
    // 增加小费
    addTip(item, index) {
      const data = {
        count: item.sendTip ? item.sendTip : 0,
      };
      const listItem = JSON.parse(JSON.stringify(data));
      this.oldCount = listItem.count;
      this.$refs.AddTip.open({
        listItem, // 当前套餐中item
      }, {
        submit: (res) => {
          this.changeNum(item, res.count);
        },
      });
    },
    // 增加小费请求
    changeNum(item, tip) {
      if (item.sendTip == tip) {
        this.$refs.AddTip.close();
        return;
      }
      ajax('canyin.takeout.takeoutsend.sendtip', {
        contentType: 'json',
        data: {
          orderId: this.orderItem.id,
          sendTip: tip,
          o2oTakeoutSendDTOList: [{
            id: item.id,
            sendFrom: item.sendFrom,
          }],
        },
      }).then((res) => {
        // 关闭窗口
        this.$refs.AddTip.close();
      });
    },
    //  取消配送单
    cancel(item) {
      this.$confirm(`是否取消【${item.sendFromName}】正在发单的配送订单？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        ajax('canyin.takeout.takeoutsend.cancelsend', {
          contentType: 'json',
          data: {
            orderId: this.orderItem.id,
            o2oTakeoutSendDTOList: [{
              id: item.id,
              sendFrom: item.sendFrom,
            }],
          },
        }).then((res) => {
          if (res.code === '1') {
            this.$emit('updateOrderList');
            this.$message.success('取消成功');
          } else {
            this.$message.success('取消失败');
          }
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
  .pos-takeout-detail {
    height: calc(100%);
    overflow-y: auto;
    padding-bottom: 60px;
    /*配送订单块*/
    .pos-takeout-div {
      position: relative;
      background: #fff;
      padding: 20px 14px;
      margin-bottom: 6px;
      font-size: 13px;
      > i {
        position: absolute;
        top: 0;
        left: 0;
        &.yu {
          background-image: url(~@/common/images/pos/takeout/ic_yu.png);
          width: 30px;
          height: 30px;
        }
      }
      .pos-takeout-content {
        position: relative;
        border-left: #DFE5E6 2px dashed;
        padding-left: 10px;
        .pos-takeout-content-circle {
          position: absolute;
          top: 4px;
          left: -6px;
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          border: 3px solid #0BABB9;
        }
        .circle-red{
          border-color: #FF0000;
        }
        .circle-gray{
          border-color: #A2B5B8;
        }
        .pos-takeout-content-btn-cancel{
          position: absolute;
          top: -5px;
          right: 0;
          height: 36px;
          line-height: 0.8;
          font-weight: bold;
        }
        .pos-takeout-content-name{
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .pos-takeout-content-statediv{
          margin-bottom: 5px;
        }
        .pos-takeout-content-state{
          color: #0babb9;
          font-weight: bold;
          margin-left: 5px;
        }
        .pos-takeout-content-time{
          color: #666666;
          font-weight: unset;
        }
        .pos-takeout-content-yuyue{
          font-weight: bold;
          margin-left: 5px;
          margin-bottom: 5px;
        }
        .pos-takeout-content-num{
          font-weight: bold;
          margin-left: 5px;
          margin-bottom: 5px;
        }
        .pos-takeout-content-error{
          font-weight: bold;
          margin-left: 5px;
          margin-bottom: 5px;
          margin-top: 20px;
          color: #FF0000;
        }
        .pos-takeout-content-error-pass{
          .pos-takeout-content-error;
          color: unset;
          font-weight: unset;
        }
        .pos-takeout-content-money{
          font-weight: bold;
          margin-left: 5px;
          margin-right: 10px;
        }
        .pos-takeout-content-btn-addMoney{
          height: 36px;
          line-height: 1;
          font-weight: bold;
          padding: 12px 15px 25px 15px;
          i{
            vertical-align:top;
            &.xiaofei {
              background-image: url(~@/common/images/pos/takeout/ic_xiaofei.png);
              width: 16px;
              height: 16px;
              margin-right: 0;
            }
          }
        }
        .pos-takeout-content-btn-edit{
          height: 36px;
          line-height: 1;
          font-weight: bold;
        }
      }
    }
    /*配送时间线*/
    .pos-takeout-line{
      position: relative;
      background: #fff;
      padding: 20px 14px;
      margin-bottom: 6px;
      font-size: 13px;
      .pos-takeout-line-content{
        position: relative;
        border-left: #DFE5E6 2px dashed;
        padding-left: 10px;
        i{
          vertical-align:top;
          position: absolute;
          top: 3px;
          left: -6px;
          &.finish {
            background-image: url(~@/common/images/pos/takeout/finish.png);
            width: 14px;
            height: 14px;
          }
        }
        .pos-takeout-line-content-circle {
          position: absolute;
          top: 4px;
          left: -6px;
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          border: 3px solid #0BABB9;
        }
        .circle-red{
          border-color: #FF0000;
        }
        .circle-gray{
          border-color: #A2B5B8;
        }
        .pos-takeout-line-content-btn-cancel{
          position: absolute;
          top: -5px;
          right: 0;
          height: 36px;
          line-height: 0.8;
          font-weight: bold;
        }
        .pos-takeout-line-content-name{
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .pos-takeout-line-content-statediv{
          margin-bottom: 5px;
        }
        .pos-takeout-line-content-state{
          color: #0babb9;
          font-weight: bold;
          margin-left: 5px;
        }
        .line-content-state-cancel{
          color: unset;
        }
        .line-content-state-error{
          color: #ff0000;
        }
        .line-content-state-error-pass{
          font-weight: unset;
        }
        .pos-takeout-line-content-time{
          color: #666666;
          font-weight: unset;
        }
        .pos-takeout-line-content-num{
          font-weight: bold;
          margin-left: 5px;
          margin-bottom: 5px;
        }
        .pos-takeout-line-content-error{
          font-weight: bold;
          margin-left: 5px;
          margin-bottom: 5px;
          color: #ff0000;
        }
        .pos-takeout-line-content-man{
          font-weight: bold;
          margin-left: 5px;
          margin-bottom: 5px;
        }
        .pos-takeout-line-content-phone{
          font-weight: bold;
          margin-left: 5px;
          margin-bottom: 5px;
        }
        .pos-takeout-line-content-place{
          height: 40px;
        }
      }
    }
  }
</style>
