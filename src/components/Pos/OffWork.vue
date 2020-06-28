<template>
  <Dialog
    name="PosDialog.OffWork"
    ref="dialog"
    :title="$t('Biz.Pos.OffWorkTitle1')"
    :showSubmit="true"
    @close="onClose"
    @submit="submit"
    @open="onOpen"
    width="1024px"
    height="690px"
    bottom="0px"
    :top="offWorkTop"
    :hotkeys="hotKeySet"
    id="posDialogOffWork"
    submitId="submitOffWork"
  >
    <template slot="other-button">
      <button
        v-if="data && data.prePrintAuthMsg"
        type="button"
        class="btn btn-default"
        @click="preprintps"
      >
        {{$t('Biz.Pos.OffWorkButton1')}}
      </button>
    </template>
    <OffWorkComponent
      v-if="data"
      ref="offworkcomponent"
      :data="data"
      :posMode="Number(getVuexPosMode)"
      @handleGetCheckData="handleGetCheckData"
    ></OffWorkComponent>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import OffWorkComponent from './Business_commons/OffWorkComponent';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog, OffWorkComponent },
  mixins: [DialogMixin, dateFormatMixin],
  data() {
    return {
      data: null,
      ignoreCrm7Data: '0',
      noIgnoreCrm7Data: '1',
      offWorkTop: '0px',
      printDetail: '',
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submit();
        },
      };
    },
    ...mapGetters([
      'posBaseInfo',
      'getVuexPosMode',
    ]),
  },
  methods: {
    handleGetCheckData(data) {
      this.printDetail = data;
      this.$emit('handleChangeOffWorkSwitch', data);
    },
    onOpen() {
      const boxHeight = document.documentElement.clientHeight;
      const boxH = (boxHeight - 690) / 2;
      this.offWorkTop = boxH >= 1 ? `${boxH}px` : `${0}px`;
      this.data = this.resData;
      setTimeout(() => {
        this.$refs.offworkcomponent.init();
      }, 200);
    },
    // pos/index.vue里重写了submit方法
    submit() {},
    preprintps() {
      // if(this.data.crmVersion == '1' && this.data.queryCrmPosSerialInfo =='0'){
      const { queryCrmPosSerialInfoException } = this.data;
      if (queryCrmPosSerialInfoException != null && queryCrmPosSerialInfoException !== '') {
        this.$confirm(this.$t('Biz.Pos.OffWorkConfirm1'), {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        }).then(() => {
          this.preprintpsFun(this.ignoreCrm7Data);
        }).catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('Biz.Pos.OffWorkMsg1'),
          });
        });
      } else {
        this.preprintpsFun(this.noIgnoreCrm7Data);
      }
    },
    preprintpsFun(isIgnoreCrm7Data) {
      const params = {
        controlMode: this.posBaseInfo.controlMode,
        ignoreCrm7Data: isIgnoreCrm7Data,
        printDetail: this.printDetail,
      };
      ajax('canyin.pos.posserial.preprintps', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data && data.success) {
          const { printD } = data.data;
          if (printD) {
            this.$devices.Printer.print(JSON.parse(printD));
          }
        }
      }).catch((errCode, msg) => {
        this.$message.error(msg);
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
</style>
