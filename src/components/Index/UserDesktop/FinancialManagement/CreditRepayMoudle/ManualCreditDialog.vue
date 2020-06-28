ManualCreditDialog<template>
  <Dialog
    name="PosDialog.ManualCredit"
    :title="$t('Dict.ManualPayment')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :showSubmit="true"
    width="600px"
    height="460px"
    :hotkeys="hotKeySet"
  >
    <div class="manual-redit-wrapper">
      <h1 class="account">{{ manualCreditData.unpaidPersonInfo }}</h1>
      <BillRepayInfo :accountInfo="manualCreditData"></BillRepayInfo>
      <el-form
        ref="manualForm"
        :model="manualForm"
        :rules="manualRules"
        label-width="95px"
        class="manual-redit-form">
        <el-form-item
          :label="$t('Biz.UserDesktop.SearchPrint.RDishInfoQFBZTd3Label')"
          prop="changeMoney">
          <el-input
            v-model="manualForm.changeMoney"
            v-keyboard:keyboard="{ autoSelect: true }"></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('Dict.Remarkss')"
          prop="remark">
          <el-input v-model="manualForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <div class="keybord-content">
        <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import BillRepayInfo from './BillRepayInfo';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, BillRepayInfo, KeyBoard },
  mixins: [DialogMixin],
  props: {
    manualCreditData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      manualForm: {
        id: null,
        tsId: null,
        bsId: null,
        unpaidPersonId: '',
        settleState: null,
        typeId: '',
        isRepay: null,
        code: null,
        modifyTime: null,
        unpaidPersonInfo: '',
        remainMoney: '',
        unpaidSum: '',
        changeMoney: '',
        paywayId: null,
        remark: '',
      },
      manualRules: {
        changeMoney: [
          { required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg125'), trigger: ['blur', 'change'] },
          { pattern: /^\d{1,9}(\.\d{1,2})?$/, message: this.$t('Biz.UserDesktop.UserDesktopMsg126'), trigger: ['blur', 'change'] },
        ],
        remark: [
          {
            min: 0, max: 200, message: this.$t('Biz.UserDesktop.UserDesktopMsg166'), trigger: ['blur', 'change'],
          },
        ],
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
      this.$refs.manualForm.resetFields();
      Object.keys(this.manualForm).forEach((key) => {
        this.manualForm[key] = this.manualCreditData[key];
      });
      setTimeout(() => {
        if (this.$refs.keyboard) {
          this.$refs.keyboard.reSelect();
        }
      }, 200);
    },
    onClose() {
      this.$refs.manualForm.resetFields();
    },
    onSubmit() {
      this.$refs.manualForm.validate((valid) => {
        if (valid) {
          ajax('canyin.desktop.financialManagement.unpaidbill.inserttzrecord', {
            contentType: 'URLEncoded',
            data: this.manualForm,
          }).then(() => {
            this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg127'));
            this.$emit('manualCreditSuccess');
            this.close();
          });
        } else {
          console.log('error submit!!');
          // return false;
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.manual-redit-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
  padding: 14px;
  .account {
    font-size: 16px;
    margin-bottom: 24px;
  }
  .manual-redit-form {
    width: 50%;
    margin-top: 48px;
  }
  .keybord-content {
    position: absolute;
    top: 50%;
    right: 14px;
    transform: translateY(-50%);
  }
}
</style>
