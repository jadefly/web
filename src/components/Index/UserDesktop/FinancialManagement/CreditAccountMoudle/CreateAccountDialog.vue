<template>
  <Dialog
    name="PosDialog.CreateAccount"
    :title="title"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :showSubmit="true"
    width="650px"
    height="650px"
    top="8vh"
    :hotkeys="hotKeySet"
  >
    <div class="create-account-wrapper">
      <el-form
        ref="accountForm"
        :model="accountForm"
        :rules="accountRules"
        :inline="true"
        label-width="88px"
        class="create-account-form"
      >
        <el-form-item :label="$t('Dict.Number2')" prop="code">
          <el-input v-model="accountForm.code"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.Name')" prop="name">
          <el-input v-model="accountForm.name" @input="linkPinyin"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.MnemonicSymbol')" prop="pinyin">
          <el-input v-model="accountForm.pinyin"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.CorporateName')" prop="companyName">
          <el-input v-model="accountForm.companyName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.AccountBalance')">
          <el-input v-model="accountForm.remainingSum" disabled></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.Credits')" prop="unpaidSum">
          <el-input v-model="accountForm.unpaidSum"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.Contacts')" prop="contactPerson">
          <el-input v-model="accountForm.contactPerson"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Dict.Telephone')" prop="contactTel">
          <el-input v-model="accountForm.contactTel"></el-input>
        </el-form-item>
        <div>
          <el-form-item :label="$t('Dict.ResidentialAddress')" prop="address">
            <el-input v-model="accountForm.address"></el-input>
          </el-form-item>
        </div>
        <div>
          <el-form-item :label="$t('Dict.Remarks')" prop="remark">
            <el-input v-model="accountForm.remark"></el-input>
          </el-form-item>
        </div>
        <el-form-item
          :label="$t('Biz.Settlement.AccountVerificationPhone')"
          class="low-line-height"
          prop="validateMobile"
        >
          <el-input v-model="accountForm.validateMobile"></el-input>
        </el-form-item>
      </el-form>
      <div class="footer">
        <ul>
          <li>{{$t('Dict.LastModifiedBy')}}{{accountData.modifierName }}</li>
          <li class="right">{{
            $t('Dict.LastModified')
          }}{{
            this.formatDate(accountData.modifyTime)
          }}</li>
          <li>{{$t('Dict.FounderLabel')}}{{ accountData.creatorName }}</li>
          <li class="right">{{
            $t('Dict.CreationTimeLabel')
          }}{{
            this.formatDate(accountData.createTime)
          }}</li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
// import pinyin from 'pinyin';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    accountData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      accountForm: {
        id: '',
        code: '',
        name: null,
        pinyin: null,
        companyName: null,
        remainingSum: 0,
        unpaidSum: '',
        contactPerson: null,
        contactTel: null,
        address: null,
        remark: null,
        validateMobile: null,
        modifyTime: null,
        isEnable: 'on',
      },
      accountRules: {
        code: [{
          required: true,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg055'),
          trigger: ['blur', 'change'],
        }, {
          min: 1,
          max: 10,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg056', [1, 10]),
          trigger: ['blur', 'change'],
        }],
        name: [{
          required: true,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg042'),
          trigger: ['blur', 'change'],
        }, {
          min: 1,
          max: 50,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg056', [1, 50]),
          trigger: ['blur', 'change'],
        }],
        pinyin: [{
          min: 0,
          max: 50,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg056', [0, 50]),
          trigger: ['blur', 'change'],
        }],
        companyName: [{
          min: 0,
          max: 90,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg056', [0, 90]),
          trigger: ['blur', 'change'],
        }],
        unpaidSum: [{
          required: true,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg061'),
          trigger: ['blur', 'change'],
        }, {
          pattern: /^\d{1,9}(\.\d{1,2})?$/,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg062'),
          trigger: ['blur', 'change'],
        }],
        contactPerson: [{
          min: 0,
          max: 50,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg056', [0, 50]),
          trigger: ['blur', 'change'],
        }],
        contactTel: [{
          pattern: /^1[34578]\d{9}$/,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg064'),
          trigger: ['blur', 'change'],
        }],
        address: [{
          min: 0,
          max: 100,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg056', [0, 100]),
          trigger: ['blur', 'change'],
        }],
        remark: [{
          min: 0,
          max: 200,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg056', [0, 200]),
          trigger: ['blur', 'change'],
        }],
        validateMobile: [{
          min: 0,
          max: 11,
          message: this.$t('Biz.UserDesktop.UserDesktopMsg056', [0, 11]),
          trigger: ['blur', 'change'],
        }],
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
    operation() {
      return !this.accountData.id ? 'create' : 'modify';
    },
    title() {
      return this.operation === 'create'
        ? this.$t('Biz.UserDesktop.UserDesktopMsg068')
        : this.$t('Biz.UserDesktop.UserDesktopMsg079');
    },
  },
  methods: {
    onOpen() {
      this.$refs.accountForm.resetFields();
      Object.keys(this.accountForm).forEach((key) => {
        this.accountForm[key] = this.accountData[key];
      });
    },
    onClose() {
      this.$refs.accountForm.resetFields();
    },
    linkPinyin() {
      const { name } = this.accountForm;
      const transformPinyin = pinyin(name, {
        style: pinyin.STYLE_FIRST_LETTER,
      });
      const transformFirstLetter = transformPinyin.join('').toUpperCase();
      this.accountForm.pinyin = transformFirstLetter;
    },
    formatDate(time) {
      if (time) {
        return dateFormat('%Y-%M-%D %H:%I:%S', Date.parse(time));
      }
      return null;
    },
    onSubmit() {
      const requestUrl = `canyin.desktop.financialManagement.unpaidperson.${this.operation === 'create' ? 'insert' : 'update'}`;
      this.$refs.accountForm.validate((valid) => {
        if (valid) {
          ajax(requestUrl, {
            contentType: 'URLEncoded',
            data: this.accountForm,
          }).then(() => {
            this.$message.success(this.$t('Dict.SaveSuccess'));
            this.$emit('operateAccountSuccess');
            this.close();
          });
        }
        return false;
      });
    },
  },
};
</script>

<style lang="less" scoped>
.create-account-wrapper {
  width: 100%;
  height: 100%;;
  background-color: white;
  .create-account-form {
    padding: 24px 12px;
  }
  .footer {
    position: relative;
    ul {
      padding-left: 24px;
      color: #888;
      background-color: white;
      overflow: hidden;
      > li {
        display: inline-block;
        width: 30%;
        overflow: hidden;
        &.right {
          width: 60%;
        }
      }
    }
  }
}

</style>

<style lang="less">
  .create-account-wrapper .create-account-form {
    .el-form-item {
      margin-bottom: 14px;
    }
    .low-line-height {
      display: flex;
      align-items: center;
    }
    .low-line-height .el-form-item__label {
      line-height: 1.4;
      width: 88px;
    }
  }
  .lang-enUS{
    .create-account-wrapper .create-account-form {
      .low-line-height .el-form-item__label {
        width: auto !important;
      }
    }
  }
</style>
