<template>
  <Dialog
    name="ParameterSetting.FashionBookBindDialog"
    :title="title"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    width="580px"
    :hotkeys="hotKeySet"
    @submit="changeBindData"
  >
    <div class="main-content">
      <el-form :model="bindMessage" label-width="125px" :rules="rules" ref="ruleForm" class="demo-ruleForm message-content">
        <el-form-item :label="$t('Dict.LocalServiceIP')" prop="ip">
          <el-input v-model="bindMessage.ip"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.LocalServicePort')" prop="port">
          <el-input v-model="bindMessage.port"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.LocalServiceAccount')" prop="id">
          <el-input v-model="bindMessage.id"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="test">
            {{ testing ? $t('Biz.UserDesktop.UserDesktopMsg129') : $t('Dict.TestConnection') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    const ipReg = /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))/;
    const validatorIP = (rule, value, callback) => {
      if (ipReg.test(value) === false) {
        callback(new Error());
      } else {
        callback();
      }
    };
    return {
      bindStatus: false,
      bindMessage: {
        ip: '', // 服务IP
        port: '', // 服务端口
        id: '', // 服务账号
      },
      rules: {
        ip: [
          { required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg130') },
          { validator: validatorIP, message: this.$t('Biz.UserDesktop.UserDesktopMsg131') }
        ],
        port: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg132') }],
        id: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg133') }],
      },
      testing: false,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.changeBindData();
        },
      };
    },
    title() {
      return this.bindStatus ? this.$t('Dict.ModifyBindingInformation') : this.$t('Dict.AddBindingInformation');
    },
  },
  methods: {
    onOpen() {
      // 弹框的信息赋值
      this.bindMessage = this.resData.bindData;
      this.bindStatus = this.resData.bindStatus;
    },
    validate(callback) {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          callback();
        }
      });
    },
    getData() {
      const {
        id: appID,
        ip: host,
        port,
      } = this.bindMessage;
      return { appID, host, port };
    },
    changeBindData() {
      this.validate(() => {
        ajax('canyin.interfaces.shishangd.shishangdbooking.savebasicconfig', {
          contentType: 'URLEncoded',
          data: this.getData(),
        }).then(() => {
          this.submit();
          this.close();
        });
      });
    },
    test() {
      this.validate(() => {
        this.testing = true;
        ajax('canyin.interfaces.shishangd.shishangdbooking.testconfig', {
          contentType: 'URLEncoded',
          data: this.getData(),
        }).then(() => {
          this.testing = false;
          this.$message.success(this.$t('Dict.SuccessfulConnection'));
        }).catch(() => {
          this.testing = false;
          this.$message.error(this.$t('Dict.connectionFailed'));
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.main-content {
  height: 100%;
  background-color: #ffffff;
  padding-right: 72px;
  padding-top: 20px;
}
</style>
