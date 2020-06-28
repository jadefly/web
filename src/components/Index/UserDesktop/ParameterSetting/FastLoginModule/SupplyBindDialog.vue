<template>
  <Dialog
    name="ParameterSetting.SupplyBindDialog"
    :title="title"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    width="580px"
    :hotkeys="hotKeySet"
    @submit="onSubmit"
  >
    <div class="supply-bind-content">
      <el-form :model="formData" label-width="160px" :rules="rules" ref="ruleForm" id="supplyForm">
        <el-form-item :label="$t('Dict.DomainName')" prop="groupId">
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
        <p>{{$t('Dict.Explain')}}</p>
        <ol>
          <li>{{$t('Biz.UserDesktop.UserDesktopMsg145')}}</li>
          <li>{{$t('Biz.UserDesktop.UserDesktopMsg146')}}</li>
          <li>{{$t('Biz.UserDesktop.UserDesktopMsg147')}}</li>
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
    supplyBindStatus: {
      type: Boolean,
      default: false,
    },
    supplyInfo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      formData: {
        groupId: '',
        userName: '',
        password: '',
      },
      rules: {
        groupId: [{ required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg148') }],
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
      return this.supplyBindStatus
        ? this.$t('Dict.ModifySentence')
        : '云供应链[新建绑定]';
    },
  },
  methods: {
    onOpen() {
      if (this.supplyBindStatus && this.supplyInfo) {
        Object.keys(this.formData).forEach((key) => {
          this.formData[key] = this.supplyInfo[key];
        });
      } else {
        Object.keys(this.formData).forEach((key) => {
          this.formData[key] = null;
        });
      }
    },
    onSubmit() {
      const statusUrl = this.supplyBindStatus ? 'update' : 'insert';
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          ajax(`canyin.desktop.bindingrelation.${statusUrl}`, {
            contentType: 'URLEncoded',
            data: Object.assign({}, this.formData, {
              productId: '003',
            }),
          }).then((data) => {
            const { loginUrl } = data;
            if (loginUrl) {
              window.location.href = loginUrl;
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
.supply-bind-content {
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
      flex: 1;
      /*position: absolute;*/
      /*top: 0;*/
      /*left: 3em;*/
    }
  }
}
</style>
