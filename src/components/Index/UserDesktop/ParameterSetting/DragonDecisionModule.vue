<template>
  <div class="dragon-decision-content">
    <SystemContent :title="$t('Dict.DragonDecisionDocking')">
      <div class="dragon-decision-info">
        <div class="pic">
          <img src="@static/img/saga.png" :alt="$t('Dict.DragonDecision')">
        </div>
        <div class="text">
          <h3>{{$t('Dict.DragonDecision')}}</h3>
          <div class="status">
            <i class="icon" :class="statusObj.iconClass"></i>
            <span>{{ statusObj.text }}</span>
          </div>
          <button type="button" class="btn" @click="changeBindInfo">{{ statusObj.btn }}</button>
        </div>
      </div>
      <div class="dragon-decision-setting" ref="settingContent">
        <h4>{{$t('Biz.UserDesktop.UserDesktopMsg174')}}</h4>
        <el-tabs v-model="activeName" @tab-click="tabClick(activeName)">
          <el-tab-pane :label="$t('Dict.AutoUploadConfiguration')" name="auto">
            <el-form
              ref="autoForm"
              :model="autoFormData"
              :rules="autoFormRules"
            >
              <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg175')" prop="frequency">
                <el-input v-model.number="autoFormData.frequency" style="width: 120px;"></el-input>
              </el-form-item>
              <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg176')" prop="hour">
                <el-input v-model.number="autoFormData.hour" style="width: 180px;">
                  <template slot="prepend">{{$t('Dict.Everyday')}}</template>
                  <template slot="append">{{$t('Dict.Time')}}</template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitAutoForm">{{$t('Dict.Preservation')}}</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane :label="$t('Dict.ManualSupplementaryUpload')" name="manual">
            <el-form ref="manualForm" :model="manualFormData" label-width="84px">
              <el-form-item>{{$t('Biz.UserDesktop.UserDesktopMsg177')}}</el-form-item>
              <el-form-item :label="$t('Dict.StartDate')" prop="startDate">
                <el-date-picker
                  type="date"
                  :placeholder="$t('Dict.SelectionDate')"
                  v-model="manualFormData.startDate"
                  value-format="yyyy-MM-dd"
                  :picker-options="startDatePicker"
                ></el-date-picker>
              </el-form-item>
              <el-form-item :label="$t('Dict.EndDate')" prop="endDate">
                <el-date-picker
                  type="date"
                  :placeholder="$t('Dict.SelectionDate')"
                  v-model="manualFormData.endDate"
                  value-format="yyyy-MM-dd"
                  :picker-options="endDatePicker"
                ></el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="businessUpload('business')">{{$t('Biz.UserDesktop.UserDesktopMsg178')}}</el-button>
                <el-button type="primary" @click="businessUpload('summary')">{{$t('Biz.UserDesktop.UserDesktopMsg179')}}</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane :label="$t('Dict.Journal')" name="daily" class="logs-content" style="height: 100%" ref="logsContentDom">
            <el-table
              :data="logsData"
              style="width: 100%">
              <el-table-column
                type="index"
                :label="$t('Dict.SerialNumber')"
                min-width="48"
                >
              </el-table-column>
              <el-table-column
                :label="$t('Dict.TriggerType')"
                min-width="76">
                  <template slot-scope="scope">
                    {{`${scope.row.triggerType}` === '1' ? $t('Dict.Automatic') : $t('Dict.Manual')}}
                  </template>
              </el-table-column>
              <el-table-column
                prop="interfaceName"
                min-width="200"
                :label="$t('Dict.InterfaceName')">
              </el-table-column>
              <el-table-column
                :label="$t('Dict.UploadStatus')"
                min-width="76">
                  <template slot-scope="scope">
                    {{ uploadStatName(scope) }}
                  </template>
              </el-table-column>
              <el-table-column
                prop="uploadCnt"
                :label="$t('Dict.UploadNumber')"
                min-width="76">
              </el-table-column>
              <el-table-column
                :label="$t('Dict.DataStartDate')"
               min-width="112">
                  <template slot-scope="scope">
                    {{ formatTime(scope.row.beginDate) }}
                  </template>
              </el-table-column>
              <el-table-column
                :label="$t('Dict.DataDueDate')"
                min-width="112">
                  <template slot-scope="scope">
                    {{ formatTime(scope.row.endDate) }}
                  </template>
              </el-table-column>
              <el-table-column
                :label="$t('Dict.UploadStartTime')"
                min-width="112"
                >
                  <template
                  slot-scope="scope">
                    {{ formatTime(scope.row.createTime, true) }}
                  </template>
              </el-table-column>
              <el-table-column
                :label="$t('Dict.UploadEndTime')"
                 min-width="112"
                >
                  <template slot-scope="scope">
                    {{ formatTime(scope.row.modifyTime, true) }}
                  </template>
              </el-table-column>
            </el-table>
            <div class="logPageContent">
              <Pagination :total="total"
              :limit="logsContentLimint"
              @handleChangePage="handleChangePage"
              :page="page"></Pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </SystemContent>
    <BindModule ref="bindModule"></BindModule>
  </div>
</template>

<script>
import SystemContent from '../base/SystemContent';
import BindModule from './DragonDecisionBindDialog';
import Pagination from '../base/Pagination';
import { sub } from '@/common/js/math';
import ajax from '@/common/js/ajax';

export default {
  components: {
    SystemContent,
    BindModule,
    Pagination,
  },
  data() {
    const checkNumber = (rule, value, callback) => {
      if (value !== '' && Number.isInteger(value) && value >= rule.min && value <= rule.max) {
        callback();
      } else {
        callback(new Error());
      }
    };
    return {
      bindStatus: false, // 绑定的状态
      // 跳转进来需要的主要（基本信息）
      loadMianMessage: {
        corporationCode: '', // 企业号
        boothCode: '', // 商位号
        storeId: '', // 门店编号
        storeName: '', // 门店名称
        secretKey: '', // 密钥
      },
      activeName: 'auto',
      autoFormData: { // 自动上传配置
        frequency: 5, // 营业数据上传频率
        hour: 0, // 日营业数据汇总数据上传时间
      },
      manualFormData: {
        startDate: '',
        endDate: '',
      },
      startDatePicker: this.beginDate(),
      endDatePicker: this.processDate(),
      uploadType: {
        business: 1, // 上传营业明细的设置
        summary: 2, // 上传营业汇总的设置
      },
      autoFormRules: {
        frequency: [{
          required: true,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg180'),
        }, {
          type: 'number',
          message: this.$t('Biz.UserDesktop.UserDesktopMsg181'),
        }, {
          type: 'number',
          min: 1,
          max: 59,
          validator: checkNumber,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg182'),
        }],
        hour: [{
          required: true,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg183'),
        }, {
          type: 'number',
          message: this.$t('Biz.UserDesktop.UserDesktopMsg184'),
        }, {
          type: 'number',
          min: 0,
          max: 23,
          validator: checkNumber,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg185'),
        }],
      },
      // 日志的数据格式
      logsData: [],
      // logsData: [{
      //   id: '22', // 日志的主键
      //   triggerType: '1', // 传输类型， 1：自动；2：手动
      //   interfaceName: 'mmmgma', // 表名
      //   uploadCnt: 3, // 上传条数
      //   uploadStat: 1, // 上传状态1. 上传中； 2.上传失败 3.上传成功
      //   beginDate: '2019-05-16', // 数据的起始日期 Y-m-d H:i:s
      //   endDate: '2019-05-16', // 数据的截止日期 Y-m-d H:i:s
      //   createTime: '2019-05-16', // 上传开始时间 Y-m-d H:i:s
      //   modifyTime: '2019-05-16', // 上传结束时间 Y-m-d H:i:s
      // }],
      // 日志的显示内容的显示页数
      logsContentHeight: 0,
      logsContentLimint: 5,
      total: 10,
      page: 1,
    };
  },
  mounted() {
    // 40 90 代表区域上的两个div的高度
    this.logsContentHeight = sub(sub(this.$refs.settingContent.offsetHeight, 42), 90);
    this.logsContentLimint = Math.floor(this.logsContentHeight / 50) - 1;
  },
  computed: {
    statusObj() {
      return this.bindStatus
        ? {
          iconClass: 'icon-success',
          text: this.$t('Dict.Bound'),
          btn: this.$t('Dict.ModifyBindingInformation'),
        } : {
          iconClass: 'icon-error',
          text: this.$t('Dict.Unbound'),
          btn: this.$t('Dict.AddBindings'),
        };
    },
  },
  beforeRouteEnter(to, from, next) {
    // 判断如果是当前界面刷新的话
    if (from.path === '/') {
      next();
    } else {
      ajax('canyin.desktop.bizsagadata.load', {
        errorCallBack: next,
      }).then((res) => {
        const loadData = res.data;
        // 跳转进来请求的数据
        next((vm) => {
          // 主要基本信息的赋值
          if (loadData.isBinded) {
            vm.setLoadMianMessage(loadData);
          }
          // 自动上传的配置
          vm.setAutoFormData(loadData);
          // 是否绑定的赋值
          vm.setbindStatus(loadData.isBinded);
        });
      });
    }
  },
  methods: {
    // 添加绑定活着是修改绑定
    changeBindInfo() {
      this.$refs.bindModule.open({
        loadMianMessage: this.loadMianMessage,
        autoFormData: this.autoFormData,
        bindStatus: this.bindStatus,
      }, {
        submit: (data) => {
          // 跟新下基本的最新信息
          this.setLoadMianMessage(data);
          this.setbindStatus(true);
        },
      });
    },
    // 保存营业数据上传频率与汇总数据上传时间
    submitAutoForm() {
      ajax('canyin.desktop.bizsagadata.save', {
        params: {
          frequency: this.autoFormData.frequency,
          hour: this.autoFormData.hour,
        },
      }).then((res) => {
        if (res.data) {
          this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg186'));
        } else {
          this.$message.error(`${res.msg}`);
        }
      });
    },
    // 基本信息
    setLoadMianMessage(res) {
      this.loadMianMessage = {
        corporationCode: res.corporationCode || '', // 企业号
        boothCode: res.boothCode || '', // 商位号
        storeId: res.storeId || '', // 门店编号
        storeName: res.storeName || '', // 门店名称
        secretKey: res.secretKey || '', // 密钥
      };
    },
    // 绑定状态的赋值
    setbindStatus(status) {
      this.bindStatus = status;
    },
    // 自动上传配置赋值
    setAutoFormData(res) {
      const { frequency, hour } = res;
      this.autoFormData = { frequency, hour };
    },
    // 起始时间
    beginDate() {
      const self = this;
      // 满足 不能大于当前时间，并且如果结束时间且不能大于 ， 两个时间差不能超31天
      return {
        disabledDate(time) {
          if (!self.manualFormData.endDate) {
            return time.getTime() > Date.now();
          }
          const endTime = new Date(self.manualFormData.endDate);
          return time.getTime() > endTime.getTime() || self.diffTime(time, endTime) > 31;
        },
      };
    },
    processDate() {
      const self = this;
      return {
        disabledDate(time) {
          if (self.manualFormData.startDate) {
            const startTime = new Date(self.manualFormData.startDate);
            return self.diffTime(startTime, time) < -1
             || time.getTime() > Date.now()
             || self.diffTime(startTime, time) > 31;
          }
          return time.getTime() > Date.now(); // 开始时间不选时，结束时间最大值小于等于当天
        },
      };
    },
    // 两个时间天数差计算
    diffTime(startDate, endDate) {
      const diff = endDate.getTime() - startDate.getTime();
      // 返回出相差的天数
      return Math.floor(diff / (24 * 3600 * 1000));
    },
    // 手工补充上传的事件
    businessUpload(type) {
      // url判断
      const uploadUrl = this.uploadType[type] === 1
        ? 'canyin.desktop.bizsagadata.uploadbusiness'
        : 'canyin.desktop.bizsagadata.uploadsummary';
      const uploadParams = { data: {}, isTrue: true }; // 数据的
      if (!this.manualFormData.startDate) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg188'));
        uploadParams.isTrue = false;
      }
      if (!this.manualFormData.endDate) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg187'));
        uploadParams.isTrue = false;
      }
      if (uploadParams.isTrue) {
        uploadParams.data[`${type}BeginDay`] = this.manualFormData.startDate;
        uploadParams.data[`${type}EndDay`] = this.manualFormData.endDate;
        ajax(uploadUrl, {
          params: uploadParams.data,
        }).then(() => {
          this.$message.success(this.$t('Dict.UploadSuccess'));
        });
      }
    },
    // 切换
    tabClick(name) {
      if (name === 'daily') {
        this.ajaxLogsData();
      }
    },
    // 日志的加载数据
    ajaxLogsData() {
      ajax('canyin.desktop.bizsagadata.logs', {
        params: {
          page: this.page, // 当前页
          limit: this.logsContentLimint, // 一页显示几个
        },
      }).then((res) => {
        this.total = res.data.total;
        this.logsData = res.data.datalist;
      });
    },
    // 上传状态的名称 *uploadStat** 上传状态 1.上传中；2.上传失败；3.上传成功
    uploadStatName(data) {
      const statName = ['', this.$t('Dict.Uploading'), this.$t('Dict.UploadFailure'), this.$t('Dict.UploadSuccess')];
      return statName[data.row.uploadStat];
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

@dragon-logo-width: 190px;
@dragon-logo-height: 105px;
.dragon-decision-content {
  height: 100%;
}
.dragon-decision-info {
  position: relative;
  padding-left: 205px;
  height: @dragon-logo-height;
  > .pic {
    position: absolute;
    left: 0;
    top: 0;
    width: @dragon-logo-width;
    height: @dragon-logo-height;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding-top: 10px;

    > img {
      display: block;
      width: 100%;
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
      height: 40px;
      background-color: #fff;
      border: 1px solid #5584ff;
      color: #5584ff;
    }
  }
}

.dragon-decision-setting {
    border-top: 1px solid #f2f2f2;
    position: absolute;
    top: 178px;
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
    padding-top: 40px;
  }
}
.logPageContent {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100%;
  height: 40px;
}
</style>
<style>
.dragon-decision-content .el-tabs__content{
  position: absolute;
  left: 15px;
  right: 15px;
  bottom: 0;
  top: 82px;
}
.logs-content .el-table th{
  padding: 2px 0;
}
.logs-content .el-table td{
  padding: 2px 0;
}
.logs-content .el-table .cell {
  height: 44px;
  word-break: break-word;
  vertical-align: middle;
  line-height: 23px;
  display: table-cell;
  vertical-align: middle;

}
.logs-content .el-table{
  height: 100%;
}
</style>
