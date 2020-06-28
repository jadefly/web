<template>
  <Dialog
    name="BilledReport.BilledReCalcDialog"
    ref="dialog"
    :title="$t('Biz.UserDesktop.SearchPrint.BilledSpan2')"
    @close="onClose"
    :closeText="$t('Dict.FalseVal')"
    :submitText="$t('Dict.TrueVal')"
    :showSubmit="true"
    width="530px"
    id="reCalcDialog"
    :hotkeys="hotKeySet"
    @submit="saveBilledReClosed"
  >
    <div class="content">
      <div class="msg">{{$t('Biz.UserDesktop.SearchPrint.BilledReCalcMsg1')}}</div>
      <div class="panel">
        <p><span>{{$t('Biz.UserDesktop.SearchPrint.BilledReCalcP1')}}</span><span>{{data.open}}</span></p>
        <p><span>{{$t('Biz.UserDesktop.SearchPrint.BilledReCalcP2')}}</span><span>{{data.pos}}</span></p>
        <p><span>{{$t('Dict.FlowingWater01')}}</span><span>{{data.code}}</span></p>
        <p><span>{{$t('Biz.UserDesktop.SearchPrint.BilledReCalcP4')}}</span><span>{{data.emp}}</span></p>
      </div>
      <div class="attention">
        <i class="el-icon-question"></i>
        <p>{{$t('Biz.UserDesktop.SearchPrint.BilledReCalcP5')}}</p>
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
    data: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.saveBilledReClosed();
        },
      };
    },
  },
  methods: {
    // 结班重算
    saveBilledReClosed() {
      ajax('canyin.desktop.report.recloseps', {
        contentType: 'URLEncoded',
        data: {
          psId: this.data.psId,
        },
      }).then((data) => {
        if (data.code === '1') {
          this.$message.success(data.msg);
          this.close();
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
  .bar-dialog-top-button{
    width: 85px;
  }
  .content{
    width: 100%;
    height: 100%;
    background: #fff;
    color: #5E5E5E;
    padding: 15px 90px;
    font-size: 16px;
    .msg{
      line-height: 35px;
    }
    .panel{
      width: 100%;
      height: 120px;
      background: #F3F3F3;
      line-height: 25px;
      margin: 10px 0;
      font-size: 15px;
      padding: 10px;
      > span{
        margin-right: 5px;
      }
    }
    .attention{
      display: flex;
      justify-content: center;
      color:#999;
      /*width: 130px;*/
      margin: 0 auto;
      padding-top: 5px;
      > i{
        font-size: 40px;
        float: left;
      }
      > p{
        float: left;
        line-height: 40px;
        margin-left: 10px;
      }
    }
    .flex-center {
      display: flex;
      justify-content: center;
    }
  }
  .lang-enUS{
    .content{
      .msg{
        font-size: 12px;
      }
    }
  }
</style>
<style lang="less">
  #reCalcDialog {
    & > div {
      background-color: #ffffff;
    }
  }
</style>
