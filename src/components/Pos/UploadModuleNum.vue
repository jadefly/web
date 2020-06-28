<template>
  <Dialog
  name="uploadModuleNum"
  :title="$t('Dict.Tips')"
  width="420px"
  ref="dialog"
  @open="onOpen"
  @close="onClose"
  :show-close="false"
  :closeByClickModal="false"
  :showClose="false"
  :showSubmit="false"
  :appendToBody="true"
  top="30vh"
  >
  <div class="upload-body">
      <p>
        <span>{{$t('Biz.Pos.PosMsg001')}}</span>
        <span class="count">{{count}}</span>
      </p>
      <p style="margin-top:10px">
          {{$t('Biz.Pos.PosMsg002')}}
      </p>
  </div>
  <div class="upload-footer">
    <button
      class="pd23 el-button el-button--default el-button--small el-button--primary "
      @click="close">
        {{$t('Dict.Close')}}
    </button>
  </div>
</Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';

export default {
  name: 'uploadModuleNum',
  data() {
    return {
      count: 0,
      timer: null,
    };
  },
  components: { Dialog },
  mixins: [DialogMixin],
  methods: {
    onOpen() {
      this.timer = setInterval(() => {
        this.queryUploadsStatus();
      }, 2000);
    },
    onClose() {
      clearInterval(this.timer);
      this.$emit('handleClose');
    },
    queryUploadsStatus() {
      ajax('canyin.pos.posserial.queryuploadstatus',
        {
          loading: false,
        }).then((res) => {
        const { count } = res;
        this.count = count;
        if (count <= 0) {
          clearInterval(this.timer);
          this.close();
          this.$emit('handleClose');
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pd23{
  padding:9px 23px !important;
}
.upload-body{
  padding: 30px 20px;
  background: #fff;
  .count{
    color:red;
    font-weight:600;
  }
}
.upload-footer{
  text-align: right;
  background: #fff;
  padding: 0px 20px 20px;
}
</style>
