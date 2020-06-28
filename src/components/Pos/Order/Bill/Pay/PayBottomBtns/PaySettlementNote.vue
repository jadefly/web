<template>
  <Dialog
    name="PosDialog.PaySettlementNote"
    :title="$t('Dict.SettlementNote')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    :hotkeys="PaySettlementNote"
    :append-to-body="true"
    :showSubmit="true"
    @submit="submit"
    top="25vh"
    width="610px"
  >
  <div class="wrapper-settlementnote">
    <div class="settlementnote-left">
      <el-input
        type="textarea"
        :rows="14"
        :placeholder="$t('Biz.Settlement.EnterRemark')"
        v-model="remarkInfo"
        :maxlength="maxLength"
        ref="remarkInfoTextarea"
        v-keyboard:keyboard="{
          mode: 'simple',
          autoSelect: true,
        }"
      >
      </el-input>
    </div>
    <div class="settlementnote-right">
      <KeyBoard ref="keyboard"></KeyBoard>
    </div>
  </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    settlementRemarkInfo: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      remarkInfo: '',
      maxLength: 80,
    };
  },
  computed: {
    // 添加快捷键
    PaySettlementNote() {
      return {
        PgDn: () => {
          this.submit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.remarkInfo = this.settlementRemarkInfo;
      this.$nextTick(() => {
        this.$refs.remarkInfoTextarea.select();
      });
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    submit() {
      this.$emit('settlementremark', this.remarkInfo);
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.wrapper-settlementnote{
  padding: 16px;
}

.settlementnote-left {
  float: left;
  width: 324px;
  height: 100%;
  padding-bottom: 20px;
}

.settlementnote-right {
  float: right;
  padding: 34px;
}
</style>
