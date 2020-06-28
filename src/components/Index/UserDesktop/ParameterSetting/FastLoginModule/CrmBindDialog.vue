<template>
  <Dialog
    name="ParameterSetting.CrmBindDialog"
    :title="title"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    width="580px"
    :hotkeys="hotKeySet"
    @submit="onSubmit"
  >
    <div class="crm-bind-content">
      <el-form :model="formData" label-width="160px" :rules="rules" ref="ruleForm" id="crmForm">
        <el-form-item :label="$t('Dict.GroupNumber')" prop="groupId" v-if="isShowGroup">
          <div class="input-wrapper">
            <el-input v-model="formData.groupId"></el-input>
          </div>
        </el-form-item>
        <el-form-item :label="$t('Dict.UserName')" prop="userName">
          <div class="input-wrapper">
            <el-input v-model="formData.userName"></el-input>
          </div>
        </el-form-item>
        <el-form-item :label="$t('Dict.Password')" prop="password">
          <div class="input-wrapper">
            <el-input v-model="formData.password" type="password"></el-input>
          </div>
        </el-form-item>
      </el-form>
      <div class="tip">
        <p>{{$t('Dict.ExplainLabel')}}</p>
        <ol>
          <li>{{$t('Biz.UserDesktop.UserDesktopMsg139')}}</li>
          <li>{{$t('Biz.UserDesktop.UserDesktopMsg140')}}</li>
          <li>{{$t('Biz.UserDesktop.UserDesktopMsg141')}}</li>
        </ol>
      </div>
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
  props: {
    crmBindStatus: {
      type: Boolean,
      default: false,
    },
    crmInfo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isShowGroup: false,
      formData: {
        groupId: null,
        userName: null,
        password: null,
      },
      rules: {
        groupId: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg142') }],
        userName: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg143') }],
        password: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg144') }],
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
    title() {
      const process = this.crmBindStatus ? this.$t('Dict.Modify') : this.$t('Dict.NewlyBuild');
      return `CRM[${process}绑定]`;
    },
  },
  methods: {
    onOpen() {
      this.checkCrmVersion();
      this.echoCrmInfo();
    },
    echoCrmInfo() {
      if (this.crmBindStatus && this.crmInfo) {
        Object.keys(this.formData).forEach((key) => {
          this.formData[key] = this.crmInfo[key];
        });
      } else {
        Object.keys(this.formData).forEach((key) => {
          this.formData[key] = null;
        });
      }
    },
    checkCrmVersion() {
      const IS_CRM7 = 1;
      ajax('canyin.desktop.bindingrelation.crmversion').then((data) => {
        if (data === IS_CRM7) {
          this.isShowGroup = false;
        } else {
          this.isShowGroup = true;
        }
      });
    },
    onSubmit() {
      const statusUrl = this.crmBindStatus ? 'update' : 'insert';
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          ajax(`canyin.desktop.bindingrelation.${statusUrl}`, {
            contentType: 'URLEncoded',
            data: Object.assign({}, this.formData, {
              productId: '002',
            }),
          }).then((data) => {
            const { loginUrl } = data;
            if (loginUrl) {
              if (this.resData.isCrm7) {
                this.submit(loginUrl);
              } else {
                window.location.href = loginUrl;
              }
            }
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
.crm-bind-content {
  height: 100%;
  background-color: #ffffff;
  padding: 36px;
  .input-wrapper  {
    width: 230px;
  }
  .tip {
    display: flex;
    position: relative;
    height: 6em;
    overflow: hidden;
    > p {
      margin-right: 10px;
    }
    > ol {
      /*width: 90%;*/
      /*position: absolute;*/
      /*top: 0;*/
      /*left: 3em;*/
    }
  }
}
</style>
