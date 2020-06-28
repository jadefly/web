<template>
  <Dialog
    name="ParameterSetting.DragonDecisionBindDialog"
    :title="title"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    width="580px"
    :hotkeys="hotKeySet"
    @submit="bindFn('ruleForm', 'submit')"
  >
    <div class="main-content">
      <el-form :model="bindMessage" label-width="100px"
       :rules="rules" ref="ruleForm" class="demo-ruleForm message-content">
        <el-form-item :label="$t('Dict.EnterpriseNumber')" prop="corporationCode">
          <el-input placeholder="" v-model="bindMessage.corporationCode"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.secretKey')" prop="secretKey">
          <el-input v-model="bindMessage.secretKey"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.BusinessLocationNumber')" prop="boothCode">
          <el-input v-model="bindMessage.boothCode"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.ShopNumber')" prop="storeId">
          <el-input v-model="bindMessage.storeId"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.NameOfStore')" prop="storeName">
          <el-input type="text" v-model="bindMessage.storeName"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="bindFn('ruleForm', 'test')">{{$t('Dict.TestConnection')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { extend } from 'lodash';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      bindStatus: false,
      bindMessage: {
        corporationCode: '', // 企业号
        boothCode: '', // 商位号
        storeId: '', // 门店编号
        storeName: '', // 门店名称
        secretKey: '', // 密钥
      },
      rules: {
        corporationCode: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg168') }],
        boothCode: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg169') }],
        storeId: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg170') }],
        storeName: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg171') }],
        secretKey: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg172') }],
      },
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.bindFn('ruleForm', 'submit');
        },
      };
    },
    title() {
      return this.bindStatus ? this.$t('Dict.ModifyBindingInformation') : this.$t('Dict.AddBindingInformation');
    },
  },
  watch: {
  },
  methods: {
    onOpen() {
      // 弹框的信息赋值
      this.bindMessage = this.resData.loadMianMessage;
      this.bindStatus = this.resData.bindStatus;
    },
    bindFn(elRefName, type) {
      // 表单的校验
      this.$refs[elRefName].validate((valid) => {
        if (valid) {
          this[`${type}Fn`]();
        }
      });
    },
    // 测试连接事件
    testFn() {
      ajax('canyin.desktop.bizsagadata.validateinterface', {
        contentType: 'paramsEncoded',
        data: extend(this.bindMessage, this.resData.autoFormData),
      }).then((res) => {
        if (!res.data.success) {
          this.$message.error(`${res.data.msg}`);
        } else {
          this.$message.success(`${res.data.msg}`);
        }
      });
    },
    // 保存基本信息
    // contentType: 'paramsEncoded',
    submitFn() {
      ajax('canyin.desktop.bizsagadata.update', {
        contentType: 'paramsEncoded',
        data: extend(this.bindMessage, this.resData.autoFormData),
      }).then((res) => {
        if (res.data) {
          this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg173'));
          this.close();
          this.submit(res.data);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.main-content {
  height: 100%;
  background-color: #ffffff;
  padding-right: 72px;
  padding-top: 20px;
}
</style>
