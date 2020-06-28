<template>
  <Dialog
    name="PosDialog.AbnormalBack"
    ref="dialog"
    @close="onClose"
    :hotkeys="hotKeySet"
  >
    <div slot="title" class="pos-dialog-header">
      <h3 class="pos-dialog-title">{{$t('Dict.Tips')}}</h3>
      <!-- Dialog组件自定义表头样式 -->
      <div class="pos-dialog-control">
        <button type="button" class="btn btn-default btn-close" @click="close">{{$t('Dict.Close')}}<span>(Esc)</span></button>
      </div>
    </div>
    <div class="pos-dialog-content">
      <div class="error-msg">
        <p>{{$t('Biz.Takeout.P1', [operateMsg])}}</p>
        <p>{{$t('Biz.Takeout.P3', [abnormalMsg])}}</p>
      </div>
      <div class="introduce">
        <p><strong>{{$t('Biz.Takeout.P2', [operateMsg])}}</strong></p>
      </div>
      <div class="opreate">
        <button type="button" class="btn btn-adopt" @click="submit">{{$t('Dict.Continue')}}{{ operateMsg }}<span>(PgDn)</span></button>
      </div>
      <div class="warning">
        <p><img src="~@/common/images/sl-msg/error.png"><strong>{{$t('Biz.Pos.Takeout.TakeoutMsg001')}}</strong></p>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import { ERR_OK } from '@/common/api/takeoutConfig';
export default {
  props: {
    operateMsg: {
      type: String,
      default() {
        return this.$t('Dict.Agree');
      },
    },
    abnormalMsg: {
      type: String,
      default() {
        return this.$t('Dict.PlatformErrorReporting');
      },
    },
    reason: {
      type: String,
      default: '',
    },
    orderId: {
      type: String,
      default: '0',
    },
    refundId: {
      type: String,
      default: null,
    },
  },
  components: { Dialog },
  mixins: [DialogMixin],
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submit();
        },
      };
    },
  },
  methods: {
    // 提交逻辑处理
    submit() {
      switch (this.operateMsg) {
        case this.$t('Dict.Agree'):
          this.continueAgreeCustomer();
          break;
        case this.$t('Dict.Refuse'):
          this.continueRefuseCustomer();
          break;
        default:
          break;
      }
      this.close();
    },
    // 异常：继续同意
    continueAgreeCustomer() {
      ajax('canyin.takeout.takeoutdispute.customercancelagree', {
        params: {
          orderId: this.orderId,
          refundId: this.refundId,
          agreeReason: this.reason,
          isIgnoreError: 1,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.$message.success(res.data.msg);
            this.$emit('refreshBackOrder');
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    // 异常：继续拒绝
    continueRefuseCustomer() {
      ajax('canyin.takeout.takeoutdispute.customercancelrefuse', {
        params: {
          orderId: this.orderId,
          agreeReason: this.reason,
          isIgnoreError: 1,
        },
      })
        .then((res) => {
          if (res.data.code === ERR_OK) {
            this.$message.success(res.data.msg);
            this.$emit('refreshBackOrder');
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-header {
  font-size: 16px;
  color: rgb(102, 102, 102);
  font-weight: bold;
  line-height: 1.2;
}

.pos-dialog-control {
  .btn-close {
    height: 36px;
    padding: 8px 16px;
    margin-top: 4px;
  }

  span {
    color: #aaa;
  }
}

.btn-adopt {
  .button-variant(white, #3f77ce, #3f77ce);
}

.pos-dialog-content {
  padding: 12px;
  background-color: white;
  font-size: 14px;
  color: #333;

  .error-msg {
    .size(100%, 100px);
    text-align: center;
    border: 1px solid #999;
    border-radius: 4px;
    padding: 40px 0;
    .text-overflow();
  }

  .introduce {
    margin-top: 12px;
    strong {
      font-weight: normal;
    }
  }

  .opreate {
    width: 100%;

    > button {
      margin: 12px auto;
      display: block;
      .size(300px, 40px);
    }
  }

  .warning {
    font-size: 16px;
    margin-bottom: 12px;

    img {
      .square(28px);
      margin-right: 6px;
    }
  }

}
</style>
