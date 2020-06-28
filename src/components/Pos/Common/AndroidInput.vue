<template>
  <!-- $t-输入内容  -->
  <Dialog
    name="PosDialog.AndroidInput"
    :title="$t('Dict.EnterSomething')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    appendToBody
    @submit="submitChangeValue"
    width="720px"
    submitId="androidInputId">
    <div class="android-box">
      <el-input
        ref="AndroidTextarea"
        type="textarea"
        :rows="2"
        :placeholder="$t('Dict.EnterSomething')"
        v-model="textarea"
      ></el-input>
    </div>
  </Dialog>
</template>
<script>
import Dialog from './Dialog'
import DialogMixin from "@/components/Pos/Common/DialogMixin";
import { delay } from 'lodash'
export default {
  name: 'AndroidInput',
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      textarea: ''
    }
  },
  methods: {
    onOpen() {
      this.textarea = this.resData.remark;
      delay(() => {
        this.$refs.AndroidTextarea.focus()
        this.$refs.AndroidTextarea.select()
      }, 200)
    },
    submitChangeValue() {
      this.close();
      this.submit(this.textarea)
    }
  }
}
</script>
<style lang="less" scoped>
.android-box {
  padding: 10px;
}
</style>
