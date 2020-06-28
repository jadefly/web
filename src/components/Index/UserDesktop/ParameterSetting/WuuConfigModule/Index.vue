<template>
  <SystemContent :title="$t('Biz.UserDesktop.ParameterSetting.Setting5')">
    <div class="wuu-config-page">
      <el-tabs v-model="activeName">
        <el-tab-pane :label="$t('Biz.UserDesktop.ParameterSetting.WuuConfigLabel1')" name="o2o">
          <div class="wuu-config-panel">
            <div class="wuu-config-info">
              <div class="pic">
                <img src="@static/img/o2o.png" :alt="$t('Biz.UserDesktop.ParameterSetting.WuuConfigLabel1')">
              </div>
              <div class="text">
                <h3>{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigLabel1')}}</h3>
                <div class="status">
                  <i class="icon" :class="o2oStatusObj.iconClass"></i>
                  <span>{{ o2oStatusObj.text }}</span>
                </div>
              </div>
            </div>
            <div class="wuu-config-content" v-if="o2oStatus">
              <p>{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigP1')}}{{ o2oURL }}
                <button
                  type="button"
                  class="btn"
                  @click="testO2O"
                >{{$t('Dict.TestConnection')}}</button>
              </p>
              <button
                type="button"
                class="btn"
                @click="uploadSellout"
              >{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigButton2')}}</button>
              <p>{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigP2')}}</p>
              <button
                type="button"
                class="btn"
                @click="uploadAchivements"
              >{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigButton3')}}</button>
              <p>{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigP3')}}</p>
            </div>
            <hr>
            <div class="wuu-config-takeout">
              <div class="title">
                启用品项限量到0时，不估清外卖平台
                <span><el-switch
                    v-model="takeoutStatus"
                    active-value="1"
                    inactive-value="0"
                    @change="openOrCloseClearTakeout"
                ></el-switch></span>
              </div>
              <div v-if="takeoutStatus === '1'">
                <div class="platName">外卖平台：</div>
                <div class="platformDiv">
                  <el-checkbox-group v-model="checkList" @change="clickTakeoutPlatform">
                    <el-checkbox
                        v-for="item in takeawayPlatformList"
                        :key="item.takeawayPlatformId"
                        :label="item.takeawayPlatformId"
                        border
                        size="medium"
                    >{{item.takeawayPlatformName}}</el-checkbox>
                  </el-checkbox-group>
                </div>
                <p>说明：品项限量中，外卖平台上下架，优先执行</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('Biz.UserDesktop.ParameterSetting.WuuConfigLabel2')" name="crm">
          <div class="wuu-config-panel">
            <div class="wuu-config-info">
              <div class="pic">
                <img src="@static/img/crm.png" :alt="$t('Biz.UserDesktop.ParameterSetting.WuuConfigLabel2')">
              </div>
              <div class="text">
                <h3>{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigLabel2')}}</h3>
                <div class="status">
                  <i class="icon" :class="crmStatusObj.iconClass"></i>
                  <span>{{ crmStatusObj.text }}</span>
                </div>
              </div>
            </div>
            <div class="wuu-config-content" v-if="crmStatus">
              <p>
                {{$t('Biz.UserDesktop.ParameterSetting.WuuConfigP4')}}{{ crmURL }}
                <button
                  type="button"
                  class="btn"
                  v-if="crmStatus"
                  @click="testCRM"
                >{{$t('Dict.TestConnection')}}</button>
              </p>
              <p v-if="crmVersion !== 1">
                {{$t('Biz.UserDesktop.ParameterSetting.WuuConfigP5')}}{{ crmQueryUrl }}
                <button
                  type="button"
                  class="btn"
                  v-if="crmStatus"
                  @click="testCRMQuery"
                >{{$t('Dict.TestConnection')}}</button>
              </p>
              <h3>{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigH1')}}</h3>
              <h4>{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigH2')}}</h4>
              <div class="wuu-config-line">
                <label for="iWuuConfigDate">{{$t('Dict.SelectionDate01')}}</label>
                <el-date-picker
                  v-model="wuuConfigDate"
                  id="iWuuConfigDate"
                  type="date"
                  :placeholder="$t('Dict.SelectionDate')"
                ></el-date-picker>
                <button type="button" class="btn" @click="uploadCRMConsume">{{$t('Dict.Upload')}}</button>
              </div>
              <h4>{{$t('Biz.UserDesktop.ParameterSetting.WuuConfigH3')}}</h4>
              <button type="button" class="btn" @click="syncTempCard">{{$t('Dict.Upload')}}</button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </SystemContent>
</template>

<script>
import SystemContent from '@/components/Index/UserDesktop/base/SystemContent';
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';

export default {
  components: {
    SystemContent,
  },
  data() {
    return {
      activeName: 'o2o',
      wuuConfigDate: new Date(),
      o2oStatus: false,
      crmStatus: false,
      crmVersion: 1,
      o2oURL: '',
      crmURL: '',
      crmQueryUrl: '',
      takeoutStatus: '0',
      takeawayPlatformList: [],
      checkList: [],
    };
  },
  computed: {
    o2oStatusObj() {
      return this.o2oStatus
        ? {
          iconClass: 'icon-success',
          text: this.$t('Biz.UserDesktop.ParameterSetting.WuuConfigText1'),
        }
        : {
          iconClass: 'icon-error',
          text: this.$t('Biz.UserDesktop.ParameterSetting.WuuConfigText2'),
        };
    },
    crmStatusObj() {
      return this.crmStatus
        ? {
          iconClass: 'icon-success',
          text: this.$t('Biz.UserDesktop.ParameterSetting.WuuConfigText1'),
        }
        : {
          iconClass: 'icon-error',
          text: this.$t('Biz.UserDesktop.ParameterSetting.WuuConfigText2'),
        };
    },
  },
  mounted() {
    this.getOnlineConfig();
  },
  methods: {
    getOnlineConfig() {
      ajax('canyin.wuu.wuuconfiglocal.getonlineconfig').then((data) => {
        console.log('吾享', data)
        this.o2oStatus = !!data.o2oConfig;
        this.crmStatus = !!data.crmConfig;
        if (data.o2oConfig) {
          this.o2oURL = data.o2oConfig.url;
        }
        if (data.crmConfig) {
          this.crmVersion = data.crmConfig.crmVersion;
          this.crmURL = data.crmConfig.url;
          if (data.crmConfig.crmVersion !== 1) {
            this.crmQueryUrl = data.crmConfig.queryUrl;
          }
        }
        this.takeoutStatus = data.isEnableIgnoreSelloutPlatform;
        this.takeawayPlatformList = data.takeawayPlatformList;
        this.checkList = [];
        this.takeawayPlatformList.forEach((item) => {
          if (item.isSelect) {
            this.checkList.push(item.takeawayPlatformId);
          }
        });
      });
    },
    testO2O() {
      ajax('canyin.wuu.wuuconfiglocal.testo2o').then(() => {
        this.$message.success(this.$t('Dict.SuccessfulConnection'));
      }).catch((errCode, msg) => {
        this.$message.error(msg || this.$t('Dict.connectionFailed'));
      });
    },
    testCRM() {
      ajax('canyin.wuu.wuuconfiglocal.testcrmtrade').then(() => {
        this.$message.success(this.$t('Dict.SuccessfulConnection'));
      }).catch((errCode, msg) => {
        this.$message.error(msg || this.$t('Dict.connectionFailed'));
      });
    },
    testCRMQuery() {
      ajax('canyin.wuu.wuuconfiglocal.testcrmquery').then(() => {
        this.$message.success(this.$t('Dict.SuccessfulConnection'));
      }).catch((errCode, msg) => {
        this.$message.error(msg || this.$t('Dict.connectionFailed'));
      });
    },
    uploadSellout() {
      ajax('canyin.pos.itemSellout.itemSellouts').then((res) => {
        this.$message({
          dangerouslyUseHTMLString: true,
          message: res.msg,
          type: 'success',
        });
      }).catch((errCode, msg) => {
        this.$message.error(msg || this.$t('Dict.connectionFailed'));
      });
    },
    uploadAchivements() {
      ajax('canyin.wuu.wuuconfiglocal.achievementsupload').then(() => {
        this.$message.success(this.$t('Biz.UserDesktop.ParameterSetting.WuuConfigMsg5'));
      }).catch((errCode, msg) => {
        this.$message.error(msg || this.$t('Dict.connectionFailed'));
      });
    },
    uploadCRMConsume() {
      if (this.wuuConfigDate) {
        const date = dateFormat('%Y-%M-%D', this.wuuConfigDate);
        ajax('canyin.wuu.wuuconfiglocal.crmconsumeupload', {
          params: { date },
        }).then(() => {
          this.$message.success(this.$t('Biz.UserDesktop.ParameterSetting.WuuConfigMsg6'));
        }).catch((errCode, msg) => {
          this.$message.error(msg || this.$t('Dict.connectionFailed'));
        });
      } else {
        this.$message.error(this.$t('Biz.UserDesktop.ParameterSetting.WuuConfigMsg7'));
      }
    },
    syncTempCard() {
      ajax('canyin.wuu.wuuconfiglocal.synctempcard').then(() => {
        this.$message.success(this.$t('Dict.UploadSuccess'));
      }).catch((errCode, msg) => {
        this.$message.error(msg || this.$t('Dict.UploadFailure'));
      });
    },
    openOrCloseClearTakeout() {
      this.updateIgnoreTakeoutPlatform();
    },
    clickTakeoutPlatform() {
      this.updateIgnoreTakeoutPlatform();
    },
    updateIgnoreTakeoutPlatform() {
      ajax('canyin.sys.syssetting.updateenableignoreselloutplatform', {
        contentType: 'json',
        data: {
          isEnableIgnoreSelloutPlatform: this.takeoutStatus,
          ignorePlatformList: this.checkList.join(','),
        },
      }).then((res) => {
        if (res.success) {
          this.$message.success(res.msg);
        } else {
          this.getOnlineConfig();
        }
      }).catch((msg) => {
        this.$message.error(msg || '保存失败');
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.wuu-config-page {
  height: 100%;
}

.wuu-config-panel {
  height: 100%;
  overflow: auto;
  .wuu-config-takeout{
    .title{
      font-weight: bold;
    }
    .platName{
      margin-top: 10px;
    }
    p{
      color: #666;
    }
    .platformDiv{
      display: flex;
      justify-content: flex-start;
      margin: 10px 0;
      width: 500px;
    }
  }
}

.wuu-config-info {
  position: relative;
  padding-left: 205px;
  height: 120px;

  > .pic {
    position: absolute;
    left: 0;
    top: 0;
    .size(190px, 105px);
    border: 1px solid #ddd;
    border-radius: 5px;

    > img {
      display: block;
      .square(100%);
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
        color: #ff3000;
      }

      > span {
        font-size: 12px;
      }
    }

    > .btn {
      .size(130px, 40px);
      background-color: #fff;
      border: 1px solid @brand-primary;
      color: @brand-primary;
    }
  }
}

.wuu-config-content {
  .btn {
    padding: 10px 30px;
    background-color: #fff;
    border: 1px solid @brand-primary;
    color: @brand-primary;
  }

  p {
    line-height: 28px;
    color: #666;
    margin-top: 5px;
    margin-bottom: 5px;

    > .btn {
      margin-left: 20px;
    }
  }

  h3 {
    font-size: 16px;
    line-height: 28px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  h4 {
    line-height: 24px;
    color: #444;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  label {
    font-weight: normal;
  }
}
</style>

<style lang="less">
.wuu-config-page {
  .el-tabs {
    height: 100%;
    position: relative;
    padding-top: 55px;
  }

  .el-tabs__header {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .el-tabs__content,
  .el-tab-pane {
    height: 100%;
  }
}
</style>
