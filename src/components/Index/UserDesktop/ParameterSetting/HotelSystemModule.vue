<template>
  <div class="hotel-system-content">
    <SystemContent :title="$t('Biz.UserDesktop.UserDesktopMsg189')">
      <div class="hotel-system-info">
        <div class="pic">
          <img src="@static/img/tianxin.png" :alt="$t('Biz.UserDesktop.ParameterSetting.HotelMsg')">
        </div>
        <div class="text">
          <h3>{{$t('Biz.UserDesktop.ParameterSetting.HotelMsg')}}</h3>
          <div class="status">
            <i class="icon" :class="statusObj.iconClass"></i>
            <span>{{ statusObj.text }}</span>
          </div>
          <div class="status">
            <i class="icon" :class="statusPlan.iconClass"></i>
            <span>{{ statusPlan.text }}</span>
          </div>
        </div>
      </div>
      <div class="hotelTest">
        <p>
          {{$t('Biz.UserDesktop.ParameterSetting.WuuConfigP1')}}{{showData.HotelUrl}}<br>
          {{$t('Biz.UserDesktop.ParameterSetting.HotelCode')}}{{showData.HotelCode}}<br>
          {{$t('Biz.UserDesktop.ParameterSetting.HotelKey')}}******
        </p>
        <button type="button" class="btn" @click="testUrl">{{$t('Dict.TestConnection')}}</button>
      </div>
      <div class="hotel-system-setting" ref="settingContent">
        <el-tabs v-model="activeName" @tab-click="tabClick(activeName)">
          <el-tab-pane
            :label="$t('Dict.TransportLog')"
            name="daily"
            class="hotel-logs-content"
            style="height:
            100%"
            ref="logsContentDom"
          >
            <el-form :inline="true" ref="form" :model="searchData">
              <el-button type="primary" @click="upload">{{$t('Dict.Upload')}}</el-button>
              <el-button type="primary" @click="ajaxLogsData">{{$t('Dict.Btn.Refresh')}}</el-button>
              <el-form-item :label="$t('Dict.OperationTime')" class="margin-left-10">
                <div class="date-wrap">
                  <div>
                    <el-date-picker
                      type="date"
                      v-model="searchData.startDate"
                      value-format="yyyy-MM-dd"
                      :placeholder="$t('Dict.SelectionDate')"
                      :picker-options="pickerOptions"
                    ></el-date-picker>
                  </div>
                  <span>{{$t('Dict.To')}}</span>
                  <div>
                    <el-date-picker
                      type="date"
                      v-model="searchData.endDate"
                      value-format="yyyy-MM-dd"
                      :placeholder="$t('Dict.SelectionDate')"
                      :picker-options="pickerOptions"
                    ></el-date-picker>
                  </div>
                </div>
              </el-form-item>
              <el-form-item :label="$t('Dict.UploadStatus')">
                <el-select :placeholder="$t('Dict.ChooseStatus')" v-model="searchData.status">
                  <el-option :label="$t('Dict.All')" value=""></el-option>
                  <el-option :label="$t('Dict.Uploading')" value="0"></el-option>
                  <el-option :label="$t('Dict.UploadSuccess')" value="2"></el-option>
                  <el-option :label="$t('Dict.UploadFailure')" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <el-table
              :data="logsData"
              border
              style="width: 100%"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="50"></el-table-column>
              <el-table-column
                type="index"
                width="50"
                :label="$t('Dict.SerialNumber')"
              ></el-table-column>
              <el-table-column
                :label="$t('Biz.BizComm.SerialNum')"
                prop="code"
              ></el-table-column>
              <el-table-column
                :label="$t('Dict.UploadStatus')"
                prop="state"
              >
                <template slot-scope="scope">
                  <div
                    style="font-weight: bold"
                    :style="{
                      'color': scope.row.state === 2
                        ? '#19861F'
                        : (scope.row.state === 0 || scope.row.state === 3)
                          ? ''
                          : '#D10000'
                    }"
                  >{{
                    scope.row.state === 2
                      ? `${$t('Dict.UploadSuccess')}`
                      : (scope.row.state === 0 || scope.row.state === 3)
                        ? `${$t('Dict.Uploading')}`
                        : `${$t('Dict.UploadFailure')}`
                  }}</div>
                </template>
              </el-table-column>
              <el-table-column
                  prop="uploadCnt"
                  :label="$t('Dict.UploadTime')">
                <template slot-scope="scope">
                  {{scope.row.begintime ? formatTime(scope.row.begintime,true) : ''}}
                </template>
              </el-table-column>
              <el-table-column
                  :label="$t('Dict.EndTime1')">
                <template slot-scope="scope">
                  {{scope.row.endtime ? formatTime(scope.row.endtime,true) : ''}}
                </template>
              </el-table-column>
              <el-table-column
                  :label="$t('Dict.ReasonRemark')"
                  prop="reason">
              </el-table-column>
            </el-table>
            <div class="logPageContent">
              <Pagination :total="total"
                :limit="logsContentLimint"
                @handleChangePage="handleChangePage"
                :page="page"
              ></Pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </SystemContent>
  </div>
</template>

<script>
import { sub } from '@/common/js/math';
import ajax from '@/common/js/ajax';
import SystemContent from '../base/SystemContent';
import Pagination from '../base/Pagination';
import dateFormat from '../../../../common/js/dateformat';

export default {
  components: {
    SystemContent,
    Pagination,
  },
  data() {
    return {
      bsIds: '', // 选中行id
      showData: '', // 展示的数据
      bindStatus: false, // 绑定的状态
      planStatus: false, // 方案配置状态
      activeName: 'daily',
      // 日志的数据格式
      logsData: [],
      // 日志的显示内容的显示页数
      logsContentHeight: 0,
      logsContentLimint: 5,
      total: 10,
      page: 1,
      searchData: {
        startDate: dateFormat('%Y-%M-%D', new Date()), // 开始时间
        endDate: dateFormat('%Y-%M-%D', new Date()), // 结束时间
        status: '', // 状态
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
    };
  },
  mounted() {
    // 40 90 代表区域上的两个div的高度
    this.logsContentHeight = sub(sub(this.$refs.settingContent.offsetHeight, 42), 90);
    this.logsContentLimint = Math.floor(this.logsContentHeight / 50) - 1;
    // 显示数据
    this.getData();
    // 日志数据
    this.ajaxLogsData();
  },
  computed: {
    statusObj() {
      return this.bindStatus
        ? {
          iconClass: 'icon-success',
          text: this.$t('Dict.Bound'),
        } : {
          iconClass: 'icon-error',
          text: this.$t('Dict.Unbound'),
        };
    },
    statusPlan() {
      return this.planStatus
        ? {
          iconClass: 'icon-success',
          text: this.$t('Dict.AllocationScheme'),
        } : {
          iconClass: 'icon-error',
          text: this.$t('Dict.UnAllocationScheme'),
        };
    },
  },
  methods: {
    // 选中行
    handleSelectionChange(val) {
      this.bsIds = val;
      const ids = [];
      val.forEach((item) => {
        ids.push(item.bsid);
      });
      this.bsIds = ids.join(',');
    },
    // 上传
    upload() {
      if (!this.bsIds) {
        this.$message.warning(this.$t('Biz.UserDesktop.ParameterSetting.UploadMsg'));
        return;
      }
      ajax('canyin.desktop.biztrbsetting.reupload', {
        contentType: 'URLEncoded',
        data: {
          bsIds: this.bsIds,
        },
      }).then((data) => {
        if (data.exeState == '1') {
          this.$message.success(data.msg);
        } else {
          this.$message.warning(data.msg);
        }
      });
    },
    // 测试连接
    testUrl() {
      ajax('canyin.desktop.biztrbsetting.testlink', {
        contentType: 'URLEncoded',
        data: {
          url: this.showData.HotelUrl,
          code: this.showData.HotelCode,
          secrity: this.showData.HotelSecrity,
        },
      }).then(() => {
        this.$message.success(this.$t('Dict.SuccessfulConnection'));
      });
    },
    // 切换
    tabClick(name) {
      if (name === 'daily') {
        this.ajaxLogsData();
      }
    },
    // 日志的加载数据
    ajaxLogsData() {
      if (this.searchData.startDate > this.searchData.endDate) {
        this.$message.warning(this.$t('Dict.TimeVerify'));
        return;
      }
      const stratTime = new Date(this.searchData.startDate);
      const endTime = new Date(this.searchData.endDate);
      if ((endTime - stratTime) / (1000 * 60 * 60 * 24) >= 3) {
        this.$message.warning(this.$t('Biz.UserDesktop.ParameterSetting.timeMsg'));
        return;
      }
      ajax('canyin.desktop.biztrbsetting.loadtranslog', {
        contentType: 'URIEncoded',
        data: {
          page: this.page, // 当前页
          limit: this.logsContentLimint, // 一页显示几个
          beginTime: this.searchData.startDate, // 开始时间
          endTime: this.searchData.endDate, // 结束时间
          state: this.searchData.status, // 结束时间
        },
      }).then((res) => {
        this.total = res.total;
        this.logsData = res.datalist;
      });
    },
    // 获取信息
    getData() {
      ajax('canyin.desktop.biztrbsetting.load').then((data) => {
        this.showData = data;
        this.planStatus = data.hasPlan === '1';
        this.bindStatus = data.EnableTransferRoomBill === '1';
      });
    },
    // 分页 的事件
    handleChangePage(page) {
      this.page = page;
      this.ajaxLogsData();
    },
    // 日期的格式转化
    formatTime(time, isTime) {
      const ytime = time.split('T')[0];
      const ntime = time.split('T')[1].substring(0, 8);
      return isTime ? `${ytime} ${ntime}` : ytime;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  @hotel-logo-width: 190px;
  @hotel-logo-height: 105px;
  .hotel-system-content {
    height: 100%;
    .date-wrap {
      display: flex;
      > span {
        margin: 0 10px;
      }
    }
    .margin-left-10{
      margin-left: 10px;
    }
  }
  .hotel-system-info {
    position: relative;
    padding-left: 205px;
    height: @hotel-logo-height;
    > .pic {
      position: absolute;
      left: 0;
      top: 0;
      width: @hotel-logo-width;
      height: @hotel-logo-height;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding-top: 20px;
      padding-left: 20px;
      > img {
        display: block;
        width: 90%;
      }
    }

    > .text {
      > h3 {
        line-height: 28px;
        font-size: 18px;
        color: #000;
      }

      > .status {
        line-height: 34px;

        > .icon-success {
          color: #46bc15;
        }
        > .icon-error {
          color: #FF3000;
        }
        > span {
          font-size: 12px;
        }
      }

      > .btn {
        width: 130px;
        height: 40px;
        background-color: #fff;
        border: 1px solid #5584ff;
        color: #5584ff;
      }
    }
  }

  .hotel-system-setting {
    position: absolute;
    top: 266px;
    bottom: 0px;
    right: 0;
    left: 0px;
    padding: 0px 15px;
    > h4 {
      line-height: 42px;
      font-size: 16px;
      font-weight: bold;
      color: #000;
    }

    .el-form {
      padding: 10px 0;
    }
  }
  .logPageContent {
    position: absolute;
    bottom: 0px;
    right: 0px;
    width: 100%;
    height: 40px;
  }
  .hotelTest{
    p {
      line-height: 28px;
      color: #666;
      margin-top: 5px;
      margin-bottom: 5px;
      margin-right: 20px;
      float: left;
    }
    .btn {
      padding: 10px 30px;
      background-color: #fff;
      border: 1px solid @brand-primary;
      color: @brand-primary;
    }
  }
</style>
<style>
  .hotel-system-setting .el-tabs__content{
    position: absolute;
    left: 15px;
    right: 15px;
    bottom: 0;
    top: 42px;
  }
  .hotel-system-setting .el-form-item{
    margin-bottom: 0;
  }
  .hotel-logs-content .el-table th{
    padding: 2px 0;
  }
  .hotel-logs-content .el-table td{
    padding: 2px 0;
  }
  .hotel-logs-content .el-table .cell {
    height: 44px;
    word-break: break-word;
    vertical-align: middle;
    line-height: 23px;
    display: table-cell;
    vertical-align: middle;

  }
  .hotel-logs-content .el-table{
    height: 100%;
  }
</style>
