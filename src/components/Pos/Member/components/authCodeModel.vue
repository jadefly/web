<template>
  <Dialog
      name="PosDialog.AuthCodeModel"
      :title="$t('Dict.Empower')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :hotkeys="ration"
      :append-to-body="true"
      :showSubmit="true"
      width="380px"
      height="245px"
      top="20vh"
    >
    <div class="authCodeModel">
      <div>
        <span>{{$t('Biz.Pos.Member.AuthCodeMSpan1')}}[<span class="username">{{userName}}</span>]:{{message}}</span>
      </div>
      <div class="code">
        <span class="title">{{$t('Biz.Pos.Common.InputEmpower')}}</span>
        <el-input type="password" class="input" v-model="code" ></el-input>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { mapGetters } from 'vuex';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {

  },
  data() {
    return {
      message: '', // 提示信息
      code: '', // 授权号
      userName: '', // 用户名
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
    // 添加快捷键
    ration() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.code = '';
      this.message = this.resData.msg;
      this.userName = this.posBaseInfo.user.name;
    },
    onSubmit() {
      if (this.code === '') {
        this.$message.error(this.$t('Biz.Pos.Member.AuthCodeMMsg1'));
        return;
      }
      this.submit(this.code);
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
  .authCodeModel{
    background: #fff;
    height: 100%;
    padding: 20px;
    .username{
      color: #039eac;
    }
    .code{
      margin-top: 30px;
      .title{
        font-weight: bold;
      }
    }
    .input{
      width: 230px;
    }
  }
</style>
