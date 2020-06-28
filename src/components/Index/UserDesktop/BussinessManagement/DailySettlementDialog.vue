<template>
  <Dialog
    name="UserDesktop.DailySettlementDialog"
    ref="dialog"
    @open="onOpen"
    width="600px"
    height="450px"
    top="18vh"
    :hotkeys="DailySettlementHotkey"
  >
    <div slot="title" class="pos-dialog-header">
        <h3 class="pos-dialog-title">{{$t('Dict.DailyKnots')}}</h3>
      <div class="pos-dialog-control">
        <button type="button" class="btn btn-default" @click="close">
            {{$t('Dict.Close')}}<span>(Esc)</span>
        </button>
        <button type="button" class="btn btn-default" @click="doSettleOrBack({ back: true })">  {{$t('Dict.AntiJapaneseKnot')}}
        </button>
        <button type="button" class="btn btn-primary" @click="doSettleOrBack({ back: false })">
            {{$t('Dict.DailyKnots')}}<span>(PgDn)</span>
        </button>
      </div>
    </div>
    <div class="pos-dialog-content">
      <div class="notify">
          <p>{{$t('Biz.UserDesktop.UserDesktopMsg017')}}</p>
      </div>
      <div class="setting">
        <el-form ref="form" :model="formData" :label-width="labelWidth">
            <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg018')">
            <el-input v-model="formData.tsDay" :disabled="true" class="tsday-input"></el-input>
          </el-form-item>
            <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg019')">
            <el-input v-model="formData.beginTime" :disabled="true" class="begin-input"></el-input>
          </el-form-item>
            <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg020')">
            <el-input v-model="formData.endTime" :disabled="true" class="end-input"></el-input>
          </el-form-item>
            <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg021')">
            <el-input type="textarea" v-model="formData.remark"
                      :placeholder="$t('Biz.UserDesktop.UserDesktopMsg022')" :rows="4" class="remark-input"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import Vue from 'vue';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      formData: {
        tsDay: '',
        beginTime: '',
        endTime: '',
        remark: '',
      },
    };
  },
  computed: {
    DailySettlementHotkey() {
      return {
        Esc: () => {
          this.close();
        },
        PgDn: () => {
          this.doSettleOrBack({ back: false });
        },
      };
    },
    labelWidth() {
      if (Vue.config.lang === 'enUS') {
        return '20rem';
      }
      return '13rem';
    },
  },
  methods: {
    onOpen() {
      ajax('canyin.desktop.bizdayaccept.selectbizcurday').then((data) => {
        this.loadDate(data);
        this.clearRemark();
      });
    },
    async doSettleOrBack({ back } = {}) {
      const requestUrl = `canyin.desktop.bizdayaccept.${back ? 'dodailysettleback' : 'dodailysettle'}`;
      const { enabledDayAccept } = await ajax('canyin.desktop.bizdayaccept.checkenableddayaccept');
      if (enabledDayAccept === true) {
        // this.$confirm(`${back ? '反' : ''}日结后营业日会自动跳转到${back ? '上' : '下'}一个营业日，确认是否${back ? '反' : ''}日结？`, '提示', {
        this.$confirm(`${back
          ? '反日结后营业日会自动跳转到上一个营业日，确认是否反日结？'
          : '日结后营业日会自动跳转到下一个营业日，确认是否日结？'}`,
        this.$t('Dict.Tips'), // '提示',
        {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        }).then(() => {
          ajax(requestUrl, { params: this.formData }).then((res) => {
            this.$message.success(res.msg);
            this.close();
          }).catch((errorCode, msg) => {
            this.alertWaringTip(msg);
          });
        });
      } else {
        this.alertWaringTip(this.$t('Biz.UserDesktop.UserDesktopMsg023'));
      }
    },
    alertWaringTip(message) {
      this.$alert(message, this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        type: 'warning',
      });
    },
    loadDate(data) {
      this.formData.tsDay = data.tsDay;
      this.formData.beginTime = data.beginTime;
      this.formData.endTime = data.endTime;
    },
    clearRemark() {
      this.formData.remark = '';
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-content {
  width: 100%;
  height: 100%;
  padding: 12px;
  background-color: white;
  overflow: hidden;
 .notify {
    margin-top: 4px;
    margin-bottom: 20px;
    text-align: center;
    > p {
      color: #E85B66;
      background-color: #fee8ea;
      padding: 8px 32px;
    }

  }
  .setting {
    .tsday-input,
    .begin-input,
    .end-input {
      width: 60%;
    }
    .remark-input {
      width: 90%;
    }
  }
}
</style>

<style lang="less">
.setting  {
  .tsday-input,
  .begin-input,
  .end-input {
    > .el-input__inner {
      color: #888;
    }
  }
}
</style>
