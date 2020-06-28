<template>
  <Dialog
    name="ParameterSetting.ClientMustBindDialog"
    :title="$t('Biz.UserDesktop.UserDesktopMsg149')"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    width="580px"
    :hotkeys="hotKeySet"
    @submit="onSubmit"
  >
    <div class="client-must-content">
      <el-form :model="formData" label-width="165px" :rules="rules" ref="ruleForm" id="clientMustForm">
        <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg150')" prop="appId">
          <el-input v-model="formData.appId"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Biz.UserDesktop.UserDesktopMsg151')" prop="queueId">
          <el-input v-model="formData.queueId"></el-input>
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
    return {
      formData: {
        appId: '',
        queueId: '',
      },
      rules: {
        appId: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg152') }],
        queueId: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg153') }],
      },
    };
  },
  computed: {
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
      ajax('canyin.desktop.bizsyssetting.getkebideinfo').then((data) => {
        const { appId, queueId } = data;
        this.formData.appId = appId;
        this.formData.queueId = queueId;
      });
    },
    onSubmit() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          ajax('canyin.desktop.bizsyssetting.savekebidesettings', {
            contentType: 'URLEncoded',
            data: this.formData,
          }).then((data) => {
            this.$emit('bindSuccess');
            this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg154'));
            this.close();
          });
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.client-must-content {
  height: 100%;
  background-color: #ffffff;
  padding: 36px 160px 36px 8px;
}
</style>

<style lang="less">
.client-must-content {
  #clientMustForm .el-form-item__content {
    margin-left: 24px !important;
  }
}
</style>
